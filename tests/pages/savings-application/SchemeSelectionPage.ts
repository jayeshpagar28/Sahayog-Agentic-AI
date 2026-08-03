import { type Page, type Locator, expect } from '@playwright/test';

export class SchemeSelectionPage {
  readonly page: Page;
  readonly schemePanel: Locator;
  readonly searchInput: Locator;
  readonly productHeading: Locator;
  readonly schemeCards: Locator;
  readonly noResultsMessage: Locator;
  readonly detailsPanel: Locator;
  readonly activeSlide: Locator;
  readonly carouselNextButton: Locator;
  readonly carouselPrevButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.schemePanel = page.locator('.col-xl-5.buttons-column');
    this.searchInput = page.getByPlaceholder('Search Scheme Type');
    this.productHeading = this.schemePanel.locator('h5', { hasText: 'Savings Account' });
    this.schemeCards = this.schemePanel.locator('button.btn');
    this.noResultsMessage = this.schemePanel.getByText(/no result/i);
    this.detailsPanel = page.locator('.p-carousel');
    this.activeSlide = page.locator('.p-carousel-item-active .am-slider-item');
    this.carouselNextButton = page.getByRole('button', { name: 'Next Page' });
    this.carouselPrevButton = page.getByRole('button', { name: 'Previous Page' });
  }

  async verifyLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/schemelist/);
    await expect(this.searchInput).toBeVisible();
    // The scheme list is fetched async and can render noticeably later than the search box
    // and other static chrome — the default 5s expect timeout is occasionally too tight.
    await expect(this.schemeCards.first()).toBeVisible({ timeout: 15000 });
  }

  async getSchemeNames(): Promise<string[]> {
    return (await this.schemeCards.allTextContents()).map((t) => t.trim());
  }

  async search(term: string): Promise<void> {
    await this.searchInput.fill('');
    await this.page.waitForTimeout(500);
    await this.searchInput.fill(term);
    await this.page.waitForTimeout(2000);
  }

  async clearSearch(): Promise<void> {
    await this.searchInput.fill('');
    await this.page.waitForTimeout(2000);
  }

  schemeCard(name: string): Locator {
    return this.schemeCards.filter({ hasText: name });
  }

  async clickScheme(name: string): Promise<void> {
    await this.schemeCard(name).click();
  }

  async getActiveSlideName(): Promise<string> {
    return (await this.activeSlide.locator('h3').textContent())?.trim() ?? '';
  }

  async getActiveSlideDescription(): Promise<string> {
    return (await this.activeSlide.locator('p').textContent())?.trim() ?? '';
  }

  async verifyResponsiveLayout(): Promise<void> {
    const bodyWidth = await this.page.evaluate(() => document.documentElement.scrollWidth);
    const viewportWidth = await this.page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 1);
  }
}
