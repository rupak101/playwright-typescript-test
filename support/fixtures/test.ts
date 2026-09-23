import { test as baseTest } from '@playwright/test';
import { PageFactory } from '../pages/PageFactory';
import { LoginPage } from '../pages/LoginPage';
import { ShopPage } from '../pages/ShopPage';

type Pages = {
  pageFactory: PageFactory;
  loginPage: LoginPage;
  shopPage: ShopPage;
};

type FailedRequest = { method: string; url: string; status?: number; error?: string };
type ConsoleError = { source: 'console' | 'pageerror'; text: string; url?: string };

// Every page object is exposed as a fixture, created through PageFactory. Specs import { test, expect } from here.
const testPages = baseTest.extend<Pages>({
  // Wraps the built-in page: on failure, attaches failed network requests and console errors to the report.
  page: async ({ page, baseURL }, use, testInfo) => {
    const failedRequests: FailedRequest[] = [];
    const consoleErrors: ConsoleError[] = [];

    // Only requests to the site under test count; third-party calls (analytics, ads) are ignored.
    const siteHost = baseURL ? new URL(baseURL).hostname : undefined;
    const isSiteRequest = (url: string) => !siteHost || new URL(url).hostname.endsWith(siteHost);

    page.on('requestfailed', (request) => {
      if (isSiteRequest(request.url())) {
        failedRequests.push({ method: request.method(), url: request.url(), error: request.failure()?.errorText });
      }
    });
    page.on('response', (response) => {
      if (response.status() >= 400 && isSiteRequest(response.url())) {
        failedRequests.push({ method: response.request().method(), url: response.url(), status: response.status() });
      }
    });
    page.on('console', (message) => {
      if (message.type() === 'error') {
        consoleErrors.push({ source: 'console', text: message.text(), url: message.location().url });
      }
    });
    page.on('pageerror', (error) => {
      consoleErrors.push({ source: 'pageerror', text: error.message });
    });

    await use(page);

    const testFailed = testInfo.status !== testInfo.expectedStatus;
    if (testFailed && failedRequests.length > 0) {
      testInfo.attachments.push({
        name: 'Failed network requests',
        contentType: 'application/json',
        body: Buffer.from(JSON.stringify(failedRequests, null, 2)),
      });
    }
    if (testFailed && consoleErrors.length > 0) {
      testInfo.attachments.push({
        name: 'Console errors',
        contentType: 'application/json',
        body: Buffer.from(JSON.stringify(consoleErrors, null, 2)),
      });
    }
  },
  pageFactory: async ({ page }, use) => {
    await use(new PageFactory(page));
  },
  loginPage: async ({ pageFactory }, use) => {
    await use(pageFactory.getPage(LoginPage));
  },
  shopPage: async ({ pageFactory }, use) => {
    await use(pageFactory.getPage(ShopPage));
  },
});

export const test = testPages;
export const expect = testPages.expect;
