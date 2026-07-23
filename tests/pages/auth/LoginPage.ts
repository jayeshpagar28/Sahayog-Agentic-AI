import { type Page, type Locator, expect } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly userIdInput: Locator;
  readonly passwordInput: Locator;
  readonly passwordToggleIcon: Locator;
  readonly loginButton: Locator;
  readonly forgotUserIdLink: Locator;
  readonly forgotPasswordLink: Locator;
  readonly activateAccountLink: Locator;
  readonly logo: Locator;
  readonly errorTexts: Locator;
  readonly toast: Locator;
  readonly loadingOverlay: Locator;

  constructor(page: Page) {
    this.page = page;
    this.userIdInput = page.getByPlaceholder('User Id');
    this.passwordInput = page.getByPlaceholder('Password');
    this.passwordToggleIcon = page.locator('.login-icon');
    this.loginButton = page.getByRole('button', { name: 'Login' });
    this.forgotUserIdLink = page.getByText('Forgot User ID ?');
    this.forgotPasswordLink = page.getByText('Forgot Password ?');
    this.activateAccountLink = page.getByText('Activate Account');
    this.logo = page.locator('img.img-fluid').first();
    this.errorTexts = page.locator('.error-text');
    this.toast = page.getByRole('alert');
    this.loadingOverlay = page.locator('.loading-overlay');
  }

  async goto(): Promise<void> {
    await this.page.goto('/radheAgentWeb/login');
    await this.userIdInput.waitFor({ state: 'visible' });
  }

  async enterEmail(userId: string): Promise<void> {
    await this.userIdInput.fill(userId);
  }

  async enterPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
  }

  async clickLogin(): Promise<void> {
    await this.loginButton.click();
  }

  async login(userId: string, password: string): Promise<void> {
    await this.enterEmail(userId);
    await this.enterPassword(password);
    await this.clickLogin();
  }

  async submitWithEnterKey(userId: string, password: string): Promise<void> {
    await this.enterEmail(userId);
    await this.enterPassword(password);
    await this.passwordInput.press('Enter');
  }

  async togglePasswordVisibility(): Promise<void> {
    await this.passwordToggleIcon.click();
  }

  async clickForgotPassword(): Promise<void> {
    await this.forgotPasswordLink.click();
  }

  async clickForgotUserId(): Promise<void> {
    await this.forgotUserIdLink.click();
  }

  async clickActivateAccount(): Promise<void> {
    await this.activateAccountLink.click();
  }

  async verifyLoginPageLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/radheAgentWeb\/login/);
    await expect(this.logo).toBeVisible();
    await expect(this.userIdInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.loginButton).toBeVisible();
    await expect(this.forgotPasswordLink).toBeVisible();
  }

  async verifyValidationMessage(expectedText: string): Promise<void> {
    await expect(this.errorTexts.filter({ hasText: expectedText })).toBeVisible();
  }

  async verifyToastMessage(expectedText: string): Promise<void> {
    await expect(this.toast).toContainText(expectedText, { timeout: 10000 });
  }

  async getPasswordFieldType(): Promise<string | null> {
    return this.passwordInput.getAttribute('type');
  }

  async isLoginButtonEnabled(): Promise<boolean> {
    return !(await this.loginButton.isDisabled());
  }

  async isProcessing(): Promise<boolean> {
    return this.loadingOverlay.isVisible();
  }
}
