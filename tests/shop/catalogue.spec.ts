import { test, expect } from '@/support/fixtures/test';
import { getCredentials } from '@/configs';
import { PRODUCTS } from '@/support/data/testData';
import { allureLabels } from '@/support/helpers/allure';

test.describe('Shop catalogue', { tag: ['@shop', '@regression'] }, () => {
  test.beforeEach(async ({ loginPage, shopPage }) => {
    const { username, password } = getCredentials();
    await loginPage.goTo();
    await loginPage.login(username, password);
    await shopPage.waitForShopPage();
  });

  for (const product of PRODUCTS) {
    test(`lists "${product}"`, async ({ shopPage }) => {
      await allureLabels({ feature: 'Shop', story: 'Catalogue lists every product' });
      await expect(shopPage.getProduct(product)).toBeVisible();
    });
  }

  test('shows exactly the expected products', async ({ shopPage }) => {
    await allureLabels({ feature: 'Shop', story: 'Catalogue lists every product' });
    await expect(shopPage.productTitles).toHaveText([...PRODUCTS]);
  });
});
