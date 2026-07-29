import { type Page, type Locator, expect } from '@playwright/test';

export class MyProfilePage {
  readonly page: Page;
  readonly heading: Locator;
  readonly nameField: Locator;
  readonly genderField: Locator;
  readonly dobField: Locator;
  readonly mobileField: Locator;
  readonly emailField: Locator;
  readonly addressField: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Profile' });
    this.nameField = page.locator('input[name="name"]');
    this.genderField = page.locator('input[name="gender"]');
    this.dobField = page.locator('input[name="date_of_birth"]');
    this.mobileField = page.locator('input[name="mobile_number"]');
    this.emailField = page.locator('input[name="email"]');
    this.addressField = page.locator('textarea[name="address"]');
  }

  async verifyLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/MY_PROFILE/);
    await expect(this.heading).toBeVisible();
    await expect(this.nameField).not.toHaveValue('');
    await expect(this.emailField).not.toHaveValue('');
    await expect(this.mobileField).not.toHaveValue('');
  }

  async verifyFieldsReadOnly(): Promise<void> {
    await expect(this.nameField).toBeDisabled();
    await expect(this.emailField).toBeDisabled();
    await expect(this.mobileField).toBeDisabled();
  }
}
