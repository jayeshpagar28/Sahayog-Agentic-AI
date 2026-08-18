import { type Page, type Locator } from '@playwright/test';

export type AccountType = 'Joint' | 'Individual' | 'Minor';

export class AccountTypeStep {
  readonly page: Page;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.submitButton = page.locator('button:has-text("Submit"):visible');
  }

  /** "Joint" is pre-selected by default on this step — selecting a card is only needed
   * to switch away from that default. */
  accountTypeCard(type: AccountType): Locator {
    return this.page.locator(`p:has-text("Please Select This to open ${type} Account")`).locator('xpath=..');
  }

  async selectAccountType(type: AccountType): Promise<void> {
    await this.accountTypeCard(type).click();
  }

  async clickSubmit(): Promise<void> {
    await this.submitButton.click();
  }
}
