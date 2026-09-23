import { Locator, Page } from '@playwright/test';

export abstract class BasePage {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // Paths resolve against `baseURL` from playwright.config.ts.
  async navigate(path: string) {
    await this.page.goto(path);
  }

  async click(locator: Locator) {
    await locator.click();
  }

  async type(locator: Locator, text: string) {
    await locator.fill(text);
  }

  async check(locator: Locator) {
    await locator.check();
  }

  async waitForUrl(path: string) {
    await this.page.waitForURL(`**${path}`);
  }
}
