import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

type PageClass<T extends BasePage> = new (page: Page) => T;

// Creates page objects on first request and reuses them for the rest of the test.
export class PageFactory {
  private readonly page: Page;
  private readonly cache = new Map<PageClass<BasePage>, BasePage>();

  constructor(page: Page) {
    this.page = page;
  }

  getPage<T extends BasePage>(pageClass: PageClass<T>): T {
    if (!this.cache.has(pageClass)) {
      this.cache.set(pageClass, new pageClass(this.page));
    }
    return this.cache.get(pageClass) as T;
  }
}
