import { type Page, type Locator, expect } from '@playwright/test';

export class ChangePasswordPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly currentPasswordInput: Locator;
  readonly newPasswordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly updateButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Change Password' });
    this.currentPasswordInput = page.locator('input[name="current_password"]');
    this.newPasswordInput = page.locator('input[name="new_password"]');
    this.confirmPasswordInput = page.locator('input[name="new_confirm password"]');
    this.updateButton = page.getByRole('button', { name: 'Update Password' });
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });
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
}
