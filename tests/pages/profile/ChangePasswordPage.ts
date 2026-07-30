import { type Page, type Locator, expect } from '@playwright/test';

export class ChangePasswordPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly currentPasswordInput: Locator;
  readonly newPasswordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly updateButton: Locator;
  readonly cancelButton: Locator;
  readonly toast: Locator;
  readonly errorTexts: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Change Password' });
    this.currentPasswordInput = page.locator('input[name="current_password"]');
    this.newPasswordInput = page.locator('input[name="new_password"]');
    this.confirmPasswordInput = page.locator('input[name="new_confirm password"]');
    this.updateButton = page.getByRole('button', { name: 'Update Password' });
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });
    this.toast = page.getByRole('alert');
    this.errorTexts = page.locator('.error-text');
  }

  async verifyLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/CHANGE_PASSWORD/);
    await expect(this.heading).toBeVisible();
    await expect(this.currentPasswordInput).toBeVisible();
    await expect(this.newPasswordInput).toBeVisible();
    await expect(this.confirmPasswordInput).toBeVisible();
    await expect(this.updateButton).toBeVisible();
  }

  async hasCancelButton(): Promise<boolean> {
    return (await this.cancelButton.count()) > 0;
  }

  async fillChangePasswordForm(currentPassword: string, newPassword: string, confirmPassword: string): Promise<void> {
    await this.currentPasswordInput.fill(currentPassword);
    await this.newPasswordInput.fill(newPassword);
    await this.confirmPasswordInput.fill(confirmPassword);
  }

  async clickUpdate(): Promise<void> {
    await this.updateButton.click();
  }

  async verifyValidationMessage(expectedText: string): Promise<void> {
    await expect(this.errorTexts.filter({ hasText: expectedText }).first()).toBeVisible();
  }

  async verifyToastMessage(expectedText: string): Promise<void> {
    await expect(this.toast).toContainText(expectedText, { timeout: 10000 });
  }
}
