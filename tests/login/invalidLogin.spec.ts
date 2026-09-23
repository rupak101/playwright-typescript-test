import { test, expect } from '@/support/fixtures/test';
import { getCredentials } from '@/configs';
import { INVALID_LOGIN_CASES } from '@/support/data/testData';
import { allureLabels } from '@/support/helpers/allure';
import { LoginPage } from '@/support/pages/LoginPage';

test.describe('Login validation', { tag: ['@login', '@negative', '@regression'] }, () => {
  for (const { title, credentials, error } of INVALID_LOGIN_CASES) {
    test(`shows "${error}" for ${title}`, async ({ page, loginPage }) => {
      await allureLabels({ feature: 'Login', story: 'Invalid credentials are rejected' });
      const { username, password } = credentials(getCredentials());

      await loginPage.goTo();
      await loginPage.login(username, password);

      await expect(loginPage.errorAlert).toHaveText(error);
      await expect(page).toHaveURL(new RegExp(LoginPage.PATH));
    });
  }
});
