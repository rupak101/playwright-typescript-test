import { defineConfig, devices } from '@playwright/test';
import config from './configs';

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './tests',
  outputDir: 'reports/test-results',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  workers: isCI ? 2 : undefined,
  timeout: 40 * 1000,
  expect: { timeout: 10 * 1000 },
  reporter: [
    ['list'],
    ['html', { outputFolder: 'reports/playwright-report', open: 'never' }],
    ['allure-playwright', { resultsDir: 'reports/allure-results', detail: true, suiteTitle: true }],
    ['./support/reporters/FailureReporter.ts'],
  ],
  use: {
    baseURL: config.baseUrl,
    headless: true,
    actionTimeout: 15 * 1000,
    navigationTimeout: 30 * 1000,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
  },
  // `npm test` runs chromium only; see support/scripts/run.ts for the other browsers.
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
