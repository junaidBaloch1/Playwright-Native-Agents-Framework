import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

const envFile = process.env.CI ? '.env.ci' : '.env';
dotenv.config({ path: envFile });

export default defineConfig({
  testDir: './tests',

  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,

  reporter: process.env.CI
    ? [['list'], ['html', { open: 'never' }]]
    : 'html',

  use: {
    baseURL: process.env.BASE_URL || 'https://www.saucedemo.com/',

    headless: true,   

    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    storageState: 'playwright/.auth/user.json',

    actionTimeout: 15000,
    navigationTimeout: 30000,
  },

  expect: {
    timeout: 10000,
  },

  projects: [
    {
      name: 'setup',
      testMatch: /seed\.spec\.ts/,
      use: { storageState: undefined },
    },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },
  ],
});