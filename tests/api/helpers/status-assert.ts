/**
 * status-assert helper
 *
 * Wraps status-code assertions with a clear, classified failure message so anyone reading
 * a failed test in the report can immediately tell what kind of problem occurred — without
 * needing to dig through stack traces.
 *
 * Classification used in failure messages:
 *  - "API BEHAVIOR MISMATCH" — request succeeded, but the API returned a different status code
 *    than expected. This usually means either the test's expectation is wrong, or the API has
 *    a real bug / undocumented behavior. Action: check the live API manually with curl/Postman
 *    to confirm which side is wrong.
 *  - "FRAMEWORK/TEST ERROR" — the request itself failed before a status code could even be
 *    compared (network error, invalid URL, non-JSON response where JSON was expected, etc).
 *    This usually means the generated test has a bug (wrong URL, bad payload) rather than the
 *    API being wrong.
 */

import { APIResponse, expect } from '@playwright/test';

export async function expectStatus(
  response: APIResponse,
  expected: number | number[],
  context?: string
) {
  const actual = response.status();
  const expectedList = Array.isArray(expected) ? expected : [expected];
  const passed = expectedList.includes(actual);

  if (!passed) {
    let bodyPreview = '';
    try {
      const body = await response.json();
      bodyPreview = JSON.stringify(body).slice(0, 500);
    } catch {
      try {
        bodyPreview = (await response.text()).slice(0, 300);
      } catch {
        bodyPreview = '<unreadable body>';
      }
    }

    const message =
      `API BEHAVIOR MISMATCH${context ? ` (${context})` : ''}\n` +
      `  URL:      ${response.url()}\n` +
      `  Expected: ${expectedList.join(' or ')}\n` +
      `  Actual:   ${actual} ${response.statusText()}\n` +
      `  Body:     ${bodyPreview}\n` +
      `  -> This means the API returned a different status than the test plan assumed.\n` +
      `     Verify manually (curl/Postman) whether the API is wrong or the test's\n` +
      `     expectation needs updating, then fix on the correct side.`;

    expect(passed, message).toBe(true);
  }
}

/**
 * Use for cases where the request/response itself is malformed (e.g. expected JSON but got
 * HTML, connection refused, etc) — these are framework/test-level problems, not a simple
 * status mismatch, and should be reported differently.
 */
export function wrapFrameworkError(action: string, err: unknown): never {
  const detail = err instanceof Error ? err.message : String(err);
  throw new Error(
    `FRAMEWORK/TEST ERROR while ${action}\n` +
      `  ${detail}\n` +
      `  -> This is likely a bug in the generated test (wrong URL, bad payload, or an\n` +
      `     unexpected non-JSON response) rather than a real API behavior issue.`
  );
}