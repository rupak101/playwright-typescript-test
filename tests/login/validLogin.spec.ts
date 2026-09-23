import { test, expect } from '@/support/fixtures/test';
import config, { getCredentials } from '@/configs';
import { allure, allureLabels, attachScreenshot } from '@/support/helpers/allure';
import { ShopPage } from '@/support/pages/ShopPage';

test.describe('Login to shop', { tag: '@login' }, () => {
  test(
    'valid user lands on shop page and sees iphone X',
    { tag: ['@smoke', '@positive'] },
    async ({ page, loginPage, shopPage }) => {
      await allureLabels({
        feature: 'Login',
        story: 'Successful login lands on shop page',
        severity: allure.Severity.CRITICAL,
      });
      const { username, password } = getCredentials();

      await test.step('Navigate to login page', async () => {
        await loginPage.goTo();
      });

      await test.step(`Login as "${username}" with terms accepted`, async () => {
        await loginPage.login(username, password);
      });

      await test.step('Wait for shop page', async () => {
        await shopPage.waitForShopPage();
        await expect(page).toHaveURL(`${config.baseUrl}${ShopPage.PATH}`);
      });

      await test.step('Verify "iphone X" product is present', async () => {
        await expect(shopPage.getProduct('iphone X')).toBeVisible();
        await attachScreenshot('Shop page', await page.screenshot({ fullPage: true }));
      });
    },
  );
});
