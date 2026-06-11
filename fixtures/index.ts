// fixtures/index.ts
import { test as base, expect, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// Extend with any app-specific fixtures here
export type AppFixtures = {
  authenticatedPage: Page;
};

export const test = base.extend<AppFixtures>({
  authenticatedPage: async ({ page }, use) => {
    // Re-use storage state from seed; just navigate to the protected area
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/dashboard/);
    await use(page);
  },
});

export { expect };