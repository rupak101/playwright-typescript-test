import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  static readonly PATH = '/loginpagePractise/';

  readonly username: Locator;
  readonly password: Locator;
  readonly termsCheckbox: Locator;
  readonly signInButton: Locator;
  readonly errorAlert: Locator;

  constructor(page: Page) {
    super(page);
    this.username = page.locator('#username');
    this.password = page.locator('#password');
    this.termsCheckbox = page.locator('#terms');
    this.signInButton = page.locator('#signInBtn');
    this.errorAlert = page.locator('.alert-danger');
  }

  async goTo() {
    await this.navigate(LoginPage.PATH);
  }

  async login(username: string, password: string) {
    await this.type(this.username, username);
    await this.type(this.password, password);
    await this.check(this.termsCheckbox);
    await this.click(this.signInButton);
  }
}
