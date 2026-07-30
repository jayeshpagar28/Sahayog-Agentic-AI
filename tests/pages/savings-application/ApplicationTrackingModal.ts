import { type Page, type Locator, expect } from '@playwright/test';

export class ApplicationTrackingModal {
  readonly page: Page;
  readonly dialog: Locator;
  readonly closeButton: Locator;
  readonly stageHeading: Locator;
  readonly stageStatus: Locator;

  constructor(page: Page) {
    this.page = page;
    this.dialog = page.getByRole('dialog', { name: 'Application Tracking' });
    this.closeButton = this.dialog.getByRole('button', { name: 'Close' });
    this.stageHeading = this.dialog.getByRole('heading', { level: 4 }).first();
    this.stageStatus = this.dialog.getByText('Initiated').first();
  }

  async waitForOpen(): Promise<void> {
    await this.dialog.waitFor({ state: 'visible' });
  }

  async verifyStageDetailsVisible(): Promise<void> {
    await expect(this.stageHeading).toBeVisible();
  }

  async close(): Promise<void> {
    await this.closeButton.click();
    await this.dialog.waitFor({ state: 'hidden' });
  }
}
