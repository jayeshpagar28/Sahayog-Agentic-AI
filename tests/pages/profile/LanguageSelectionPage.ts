import { type Page, type Locator, expect } from '@playwright/test';

export class LanguageSelectionPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly englishOption: Locator;
  readonly marathiOption: Locator;
  readonly englishCheckbox: Locator;
  readonly marathiCheckbox: Locator;
  readonly languageChangedToast: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByText('Choose Your Language');
    this.englishOption = page.locator('.p-checkbox', { has: page.locator('#EN') });
    this.marathiOption = page.locator('.p-checkbox', { has: page.locator('#MR') });
    this.englishCheckbox = page.locator('#EN');
    this.marathiCheckbox = page.locator('#MR');
    this.languageChangedToast = page.getByText('Language Changed Successfully');
  }

  async verifyLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/LANGUAGE/);
    await expect(this.heading).toBeVisible();
    await expect(this.englishOption).toBeVisible();
    await expect(this.marathiOption).toBeVisible();
  }

  async isEnglishChecked(): Promise<boolean> {
    return this.englishCheckbox.isChecked();
  }

  /** Selecting a language applies it immediately and redirects to the Homepage. */
  async selectMarathiAndConfirm(): Promise<void> {
    await this.marathiOption.click();
    await this.page.waitForURL(/\/HOME/);
    await expect(this.languageChangedToast).toBeVisible();
  }

  /** Re-opens the profile menu (in whatever language it is currently rendered in) and switches back to English. */
  async selectEnglishAndConfirm(): Promise<void> {
    await this.page.locator('.fn-userbox').click();
    await this.page.locator('.dropdown-item', { hasText: /Change Language|भाषा/ }).click();
    await this.englishOption.click();
    await this.page.waitForURL(/\/HOME/);
  }
}
