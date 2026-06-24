// Seed file for API tests — runs before API RUN project as a setup dependency.
// Uses Playwright's built-in APIRequestContext via the `request` fixture, wrapped with
// automatic request/response logging (helpers/api-logger.ts) and classified status
// assertions (helpers/status-assert.ts) so failures clearly show whether the problem is
// a real API behavior mismatch or a framework/test bug.
// baseURL is taken from playwright.config.ts (`use.baseURL` or the `api` project's override).

import { test, expect } from './helpers/api-logger';
import { expectStatus, wrapFrameworkError } from './helpers/status-assert';
import * as allure from 'allure-js-commons';

const AUTH_TOKEN = process.env.API_AUTH_TOKEN || '';

function authHeaders(token: string = AUTH_TOKEN): Record<string, string> {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

test.describe('Seed', () => {
  test('seed', async ({ request }) => {
    // generate code here.
     await allure.parentSuite('API RUN');
    //  await allure.suite('api-setup');
    
  });
});