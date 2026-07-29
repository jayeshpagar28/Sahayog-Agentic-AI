import { type Page, type Locator, expect } from '@playwright/test';

export class MandatoryScrutinyModal {
  readonly page: Page;
  readonly dialog: Locator;
  readonly closeButton: Locator;
  readonly titleText: Locator;
  readonly dateText: Locator;
  readonly bodyText: Locator;
  readonly downloadAllLink: Locator;
  readonly documentRows: Locator;

  constructor(page: Page) {
    this.page = page;
    this.dialog = page.locator('.p-dialog');
    this.closeButton = this.dialog.locator('button[aria-label="Close"]');
    this.titleText = this.dialog.locator('#alert_content h4').first();
    this.dateText = this.dialog.locator('#alert_content h6').first();
    this.bodyText = this.dialog.locator('.ql-editor p').first();
    this.downloadAllLink = this.dialog.getByText('Download All');
    this.documentRows = this.dialog.locator('.p-datatable-tbody tr');
  }

  async waitForOpen(): Promise<void> {
    await expect(this.dialog).toBeVisible();
  }

  async verifyContentLoaded(): Promise<void> {
    await expect(this.titleText).not.toHaveText('');
    await expect(this.dateText).not.toHaveText('');
    await expect(this.bodyText).not.toHaveText('');
    expect(await this.documentRows.count()).toBeGreaterThan(0);
  }

  async close(): Promise<void> {
    await this.closeButton.click();
    await expect(this.dialog).toBeHidden();
  }
}
