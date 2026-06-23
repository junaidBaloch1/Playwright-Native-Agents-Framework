import { defineConfig, devices } from '@playwright/test';
import { Status } from 'allure-js-commons';
import dotenv from 'dotenv';
import * as os from 'node:os';

const envFile = process.env.CI ? '.env.ci' : '.env';
dotenv.config({ path: envFile });

export default defineConfig({
  testDir: './tests/ui',
  outputDir: 'test-results',
  preserveOutput: 'failures-only',

  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,

  reporter: [
    ['line'], // Compact progress row logger
    ['html',  { open: 'never' }], // HTML report for detailed insights
    [
      'allure-playwright',
      {
        outputFolder: 'allure-results',
        detail: true,
        suiteTitle: true,

        // 2. Automated Category Groupings (Defects Tab)
        categories: [
          {
            name: 'AI Self-Healing Failures',
            messageRegex: '.*[Hh]eal.*', 
            traceRegex: '.*',
            matchedStatuses: [Status.FAILED, Status.BROKEN],
          },
          {
            name: 'API Validation Mismatches',
            messageRegex: '.*status.*|.*Property.*',
            traceRegex: '.*',
            matchedStatuses: [Status.FAILED],
          }
        ],

        // 3. Dynamic Host Environment Metrics on Dashboard
        environmentInfo: {
          os_platform: os.platform(),
          os_release: os.release(),
          os_version: os.version(),
          node_version: process.version,
          Execution_Context: process.env.CI ? 'GitHub Actions CI' : 'Local Terminal',
        },
      },
    ],
  ],

  use: {
    baseURL: process.env.BASE_URL || 'https://www.saucedemo.com/',

    headless: true,

    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
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
      use: { storageState: undefined, headless: true },
    },
    {
      name: 'UI RUN',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },
    {
      name: 'API RUN',
      testDir: './tests/api',
      use: {
        baseURL: process.env.API_BASE_URL || 'https://social.kualitech.io',
        storageState: { cookies: [], origins: [] },
        extraHTTPHeaders: {
          Authorization: process.env.API_AUTH_TOKEN ? `Bearer ${process.env.API_AUTH_TOKEN}` : '',
        },
        actionTimeout: parseInt(process.env.API_TIMEOUT || '30000'),
      },
    },
  ],
});