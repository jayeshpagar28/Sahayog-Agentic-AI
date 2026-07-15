import { type Page, type Locator, expect } from '@playwright/test';

export class DashboardPage {
  readonly page: Page;
  readonly body: Locator;

  constructor(page: Page) {
    this.page = page;
    this.body = page.locator('body');
  }

  async goto(): Promise<void> {
    await this.page.goto('/radheAgentWeb/HOME');
  }

  async verifyDashboardLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/radheAgentWeb\/HOME/);
    await expect(this.body).toBeVisible();
  }

  async verifyRedirectedToLogin(): Promise<void> {
    await expect(this.page).toHaveURL(/\/radheAgentWeb\/login/);
  }
}
