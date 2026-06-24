import { test } from '@playwright/test';
import * as allure from 'allure-js-commons';

test.describe('Test group', () => {
  test('seed', async ({ page }) => {
    // generate code here.
    await allure.parentSuite('UI RUN');
    await allure.suite('ui setup');
  });
});