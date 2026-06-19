// Seed file for API tests — demonstrates conventions for the api-test-generator agent.
// Uses Playwright's built-in APIRequestContext via the `request` fixture, wrapped with
// automatic request/response logging (helpers/api-logger.ts) and classified status
// assertions (helpers/status-assert.ts) so failures clearly show whether the problem is
// a real API behavior mismatch or a framework/test bug.
// baseURL is taken from playwright.config.ts (`use.baseURL` or the `api` project's override).
// ⚠️  This file is a TEMPLATE/EXAMPLE for the agent — it is not a real test and is intentionally skipped.

import { test, expect } from './helpers/api-logger';
import { expectStatus, wrapFrameworkError } from './helpers/status-assert';

const AUTH_TOKEN = process.env.API_AUTH_TOKEN || '';

function authHeaders(token: string = AUTH_TOKEN): Record<string, string> {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

test.describe('Seed', () => {
  test.skip(true, 'Seed file is a convention example for the api-test-generator agent — not a real test');

  test('seed', async ({ request }) => {
    await test.step('Build request', async () => {
      // example: GET /pet/{petId}
    });

    await test.step('Send request', async () => {
      const response = await request.get('/pet/1', {
        headers: authHeaders(),
      });

      await test.step('Assert response', async () => {
        await expectStatus(response, 200, 'GET /pet/{petId} positive case');
      });
    });

    await test.step('Assert response schema', async () => {
      try {
        const response = await request.get('/pet/1', { headers: authHeaders() });
        const body = await response.json();
        expect(body).toHaveProperty('id');
      } catch (err) {
        wrapFrameworkError('parsing response body as JSON for GET /pet/{petId}', err);
      }
    });
  });
});