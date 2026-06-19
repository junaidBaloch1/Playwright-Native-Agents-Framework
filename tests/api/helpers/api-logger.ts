/**
 * api-logger fixture
 *
 * Wraps Playwright's built-in `request` fixture so every HTTP call made during a test is
 * automatically recorded as a structured attachment in the HTML report — method, URL, status,
 * request body, response body, and timing. This lets you open any failed test in the report
 * and immediately see what was actually sent/received, without re-running or adding manual
 * console.log calls per test.
 *
 * Usage in a spec file:
 *   import { test, expect } from './helpers/api-logger';
 *   test('...', async ({ request }) => { ... }); // same `request` API as @playwright/test
 */

import { test as base, expect, APIRequestContext, APIResponse } from '@playwright/test';

type LoggedCall = {
  method: string;
  url: string;
  requestBody: unknown;
  status: number;
  statusText: string;
  responseBody: unknown;
  durationMs: number;
};

function wrapRequest(request: APIRequestContext, calls: LoggedCall[]): APIRequestContext {
  // 'fetch' has a different signature (url-or-Request first arg) and is rarely used directly
  // in generated tests, so it's intentionally excluded from wrapping/logging to keep this
  // proxy simple and predictable. Use get/post/put/patch/delete/head in generated tests.
  const methods = ['get', 'post', 'put', 'patch', 'delete', 'head'] as const;

  const handler: ProxyHandler<APIRequestContext> = {
    get(target, prop, receiver) {
      if (typeof prop === 'string' && (methods as readonly string[]).includes(prop)) {
        return async (url: string, options?: Record<string, unknown>) => {
          const start = Date.now();
          const original = (target as any)[prop].bind(target);
          const response: APIResponse = await original(url, options);
          const durationMs = Date.now() - start;

          let responseBody: unknown;
          try {
            responseBody = await response.json();
          } catch {
            try {
              responseBody = await response.text();
            } catch {
              responseBody = '<unreadable body>';
            }
          }

          calls.push({
            method: (prop as string).toUpperCase(),
            url,
            requestBody: options?.data ?? options?.params ?? null,
            status: response.status(),
            statusText: response.statusText(),
            responseBody,
            durationMs,
          });

          return response;
        };
      }
      return Reflect.get(target, prop, receiver);
    },
  };

  return new Proxy(request, handler);
}

export const test = base.extend<{ request: APIRequestContext }>({
  request: async ({ request }, use, testInfo) => {
    const calls: LoggedCall[] = [];
    const loggedRequest = wrapRequest(request, calls);

    await use(loggedRequest);

    if (calls.length > 0) {
      const summary = calls
        .map(
          (c, i) =>
            `#${i + 1} ${c.method} ${c.url} → ${c.status} ${c.statusText} (${c.durationMs}ms)\n` +
            `   request: ${JSON.stringify(c.requestBody)}\n` +
            `   response: ${JSON.stringify(c.responseBody).slice(0, 2000)}`
        )
        .join('\n\n');

      await testInfo.attach('api-calls.log', {
        body: summary,
        contentType: 'text/plain',
      });

      await testInfo.attach('api-calls.json', {
        body: JSON.stringify(calls, null, 2),
        contentType: 'application/json',
      });
    }
  },
});

export { expect };