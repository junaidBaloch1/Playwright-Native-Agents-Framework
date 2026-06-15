// Seed file for API tests — demonstrates conventions for the api-test-generator agent.
// Uses Playwright's built-in APIRequestContext via the `request` fixture.
// baseURL is taken from playwright.config.ts (`use.baseURL` or the `api` project's override).

import { test, expect } from '@playwright/test';

const AUTH_TOKEN = process.env.API_AUTH_TOKEN || '';

function authHeaders(token: string = AUTH_TOKEN): Record<string, string> {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

test.describe('Seed', () => {
  test('seed', async ({ request }) => {
    await test.step('Build request', async () => {
      // example: GET /pet/{petId}
    });

    await test.step('Send request', async () => {
      const response = await request.get('/pet/1', {
        headers: authHeaders(),
      });

      await test.step('Assert response', async () => {
        expect(response.status()).toBe(200);
      });
    });
  });
});
