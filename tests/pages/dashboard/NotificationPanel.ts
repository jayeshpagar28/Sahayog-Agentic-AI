import { type Page, type Locator, expect } from '@playwright/test';

export class NotificationPanel {
  readonly page: Page;
  readonly trigger: Locator;
  readonly panel: Locator;
  readonly header: Locator;
  readonly allTab: Locator;
  readonly unreadTab: Locator;
  readonly seeAllLink: Locator;
  readonly items: Locator;

  constructor(page: Page, trigger: Locator) {
    this.page = page;
    this.trigger = trigger;
    this.panel = page.locator('.web-notification.dropdown-menu');
    this.header = this.panel.getByText('Notification', { exact: true });
    this.allTab = this.panel.getByText('All', { exact: true });
    this.unreadTab = this.panel.getByText('Unread', { exact: true });
    this.seeAllLink = this.panel.getByText('See All');
    this.items = this.panel.locator('button.btn.container');
  }

  async waitForOpen(): Promise<void> {
    await expect(this.panel).toBeVisible();
    // The list renders asynchronously after the panel itself becomes visible —
    // wait for the first item so callers don't race an empty DOM.
    await this.items.first().waitFor({ state: 'visible', timeout: 10000 }).catch(() => undefined);
  }

  async getItemCount(): Promise<number> {
    return this.items.count();
  }

  /** The panel only closes on an outside click — re-clicking the trigger just re-opens it. */
  async close(): Promise<void> {
    await this.page.mouse.click(10, 10);
    await expect(this.panel).toBeHidden();
  }
}
