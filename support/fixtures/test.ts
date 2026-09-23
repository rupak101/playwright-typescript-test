import { test as base, expect } from '@playwright/test';
import { PageFactory } from '../pages/PageFactory';
import { LoginPage } from '../pages/LoginPage';
import { ShopPage } from '../pages/ShopPage';
import { attachDiagnosticsOnFailure, collectConsoleErrors, collectFailedRequests } from '../helpers/diagnostics';

type Pages = {
  pageFactory: PageFactory;
  loginPage: LoginPage;
  shopPage: ShopPage;
};

// Every page object is exposed as a fixture. Specs import { test, expect } from here.
export const test = base.extend<Pages>({
  // Wraps the built-in page: on failure, attaches failed network requests and console errors to the report.
  page: async ({ page, baseURL }, use, testInfo) => {
    const failedRequests = collectFailedRequests(page, baseURL);
    const consoleErrors = collectConsoleErrors(page);

    await use(page);

    await attachDiagnosticsOnFailure(testInfo, failedRequests, consoleErrors);
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

export { expect };
