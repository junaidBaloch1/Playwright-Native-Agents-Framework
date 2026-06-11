// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

// import { defineConfig, devices } from '@playwright/test';

// export default defineConfig({
//   testDir: './tests',
//   fullyParallel: false,
//   forbidOnly: !!process.env.CI,
//   retries: process.env.CI ? 2 : 0,
//   workers: 1,
//   reporter: 'html',

//   use: {
//     baseURL: process.env.BASE_URL || 'https://code-demo.myshopify.com/',
//     trace: 'on-first-retry',
//     screenshot: 'only-on-failure',
//     storageState: 'playwright/.auth/user.json',
//     headless: false,
//     viewport: { width: 1280, height: 800 },
//     userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
//   },

//   projects: [
//     {
//       name: 'setup',
//       testMatch: /seed\.spec\.ts/,
//       use: { storageState: undefined },
//     },
//     {
//       name: 'chromium',
//       use: {
//         ...devices['Desktop Chrome'],
//         channel: 'chrome',
//         launchOptions: {
//           args: ['--disable-blink-features=AutomationControlled'],
//         },
//       },
//       dependencies: ['setup'],
//     },
//   ],
// });



import dotenv from 'dotenv';
import path from 'path';

// Load .env.ci on CI, .env locally
const envFile = process.env.CI ? '.env.ci' : '.env';
dotenv.config({ path: path.resolve(__dirname, envFile) });

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,

  // ← Updated: dual reporter — HTML for artifacts, list for CI logs
  reporter: process.env.CI
    ? [['list'], ['html', { open: 'never' }]]
    : 'html',

  use: {
    baseURL: process.env.BASE_URL || 'https://your-store.myshopify.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    storageState: 'playwright/.auth/user.json',

    // ← Updated: higher timeouts on CI
    actionTimeout: Number(process.env.ACTION_TIMEOUT) || 15000,
    navigationTimeout: Number(process.env.DEFAULT_TIMEOUT) || 30000,
  },

  expect: {
    timeout: Number(process.env.EXPECT_TIMEOUT) || 10000,
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