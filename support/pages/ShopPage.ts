import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class ShopPage extends BasePage {
  static readonly PATH = '/angularpractice/shop';

  readonly products: Locator;
  readonly productTitles: Locator;

  constructor(page: Page) {
    super(page);
    this.products = page.locator('app-card');
    this.productTitles = page.locator('app-card .card-title a');
  }

  async waitForShopPage() {
    await this.waitForUrl(ShopPage.PATH);
    await this.products.first().waitFor();
  }

  getProduct(productName: string): Locator {
    return this.products.filter({ has: this.page.locator('.card-title a', { hasText: productName }) });
  }
}
