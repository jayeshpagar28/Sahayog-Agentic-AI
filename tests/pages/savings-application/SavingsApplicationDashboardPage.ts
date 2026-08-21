import { type Page, type Locator, expect } from '@playwright/test';

export type StatusTab = 'Pending' | 'Submitted' | 'Re-Assigned' | 'Decisioned';
export type DatePreset = 'As On Date' | 'Today' | 'Last 7 Days' | 'Last 15 Days' | 'Custom Date';

export class SavingsApplicationDashboardPage {
  readonly page: Page;
  readonly statisticsCards: Locator;
  readonly searchInput: Locator;
  readonly filterButton: Locator;
  readonly filterDropdowns: Locator;
  readonly newApplicationButton: Locator;
  readonly table: Locator;
  readonly tableWrapper: Locator;
  readonly tableBodyRows: Locator;
  readonly noRecordsRow: Locator;
  readonly firstPageButton: Locator;
  readonly previousPageButton: Locator;
  readonly nextPageButton: Locator;
  readonly lastPageButton: Locator;
  readonly pageNumberButtons: Locator;
  readonly pageSizeDropdown: Locator;

  constructor(page: Page) {
    this.page = page;
    this.statisticsCards = page.locator('.am-statistics-card');
    this.searchInput = page.getByRole('textbox', { name: 'Search mobile no / application id' });
    this.filterButton = page.locator('.am-filter-btn');
    this.filterDropdowns = page.locator('.am-filter-dropdown .p-dropdown');
    this.newApplicationButton = page.getByText('New Application', { exact: true });
    this.table = page.locator('.p-datatable-table');
    this.tableWrapper = page.locator('.p-datatable-wrapper');
    this.tableBodyRows = page.locator('.p-datatable-tbody tr');
    this.noRecordsRow = page.locator('.p-datatable-tbody tr', { hasText: 'No records found' });
    this.firstPageButton = page.getByRole('button', { name: 'First Page' });
    this.previousPageButton = page.getByRole('button', { name: 'Previous Page' });
    this.nextPageButton = page.getByRole('button', { name: 'Next Page' });
    this.lastPageButton = page.getByRole('button', { name: 'Last Page' });
    this.pageNumberButtons = page.locator('.p-paginator-pages').getByRole('button');
    this.pageSizeDropdown = page.locator('.p-paginator .p-dropdown');
  }

  /** Navigates directly to the dashboard URL, bypassing the Home card click.
   * Real users always arrive via DashboardPage.clickSavingApplicationCard() — direct
   * navigation returns empty data (see BUG-SAD-001), so this is used only to reproduce it. */
  async gotoDirect(): Promise<void> {
    await this.page.goto('/UNPOSTED');
  }

  async verifyDashboardLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/UNPOSTED/);
    await expect(this.statisticsCards.first()).toBeVisible();
    await this.waitForListSettled();
  }

  /** The list (rows or the empty-message row) only appears once app/activity/list resolves —
   * reading counts/rows/headers before that yields a stale or empty snapshot. */
  private async waitForListSettled(): Promise<void> {
    await this.tableBodyRows.first().waitFor({ state: 'visible' });
  }

  /** Performs an action that triggers a fresh app/activity/list fetch (tab switch, search,
   * filter change) and waits for that specific response before returning, instead of racing
   * the UI's re-render. */
  private async performAndWaitForListRefresh(action: () => Promise<void>): Promise<void> {
    const response = this.page.waitForResponse(
      (r) => r.url().includes('app/activity/list') && r.request().method() === 'POST',
    );
    await action();
    await response;
  }

  async getTabCount(tab: StatusTab): Promise<number> {
    await this.waitForListSettled();
    const text = await this.page.locator(`.am-statistics-card[data-type="${tab}"] h3`).textContent();
    return Number(text?.trim() ?? '0');
  }

  async clickTab(tab: StatusTab): Promise<void> {
    await this.performAndWaitForListRefresh(async () => {
      await this.page.locator(`.am-statistics-card[data-type="${tab}"]`).click();
    });
  }

  /** The active tab's box-shadow renders in the brand teal (rgb(1, 102, 102)); inactive
   * tabs always carry a much lighter ambient shadow, so presence of *a* shadow isn't enough. */
  async isTabActive(tab: StatusTab): Promise<boolean> {
    await this.waitForListSettled();
    const style = await this.page
      .locator(`.am-statistics-card[data-type="${tab}"]`)
      .getAttribute('style');
    return !!style && style.includes('rgb(1, 102, 102)');
  }

  async search(text: string): Promise<void> {
    await this.performAndWaitForListRefresh(async () => {
      await this.searchInput.fill(text);
      await this.searchInput.press('Enter');
    });
  }

  async clearSearch(): Promise<void> {
    await this.performAndWaitForListRefresh(async () => {
      await this.searchInput.fill('');
      await this.searchInput.press('Enter');
    });
  }

  async openFilterPanel(): Promise<void> {
    await this.filterButton.click();
    await this.filterDropdowns.first().waitFor({ state: 'visible' });
  }

  /** Opens a filter dropdown and waits for its options to actually render — the dropdown's
   * data may come from a client-side cache rather than a fresh network call, so waiting on a
   * specific request/response is unreliable; waiting on the rendered options is not. */
  private async openDropdownWithOptions(dropdown: Locator): Promise<void> {
    await dropdown.click();
    await this.page.getByRole('option').first().waitFor({ state: 'visible' });
  }

  /** Opens a dropdown and clicks the named option, retrying the whole open+click sequence if
   * the option list re-renders mid-click. Scheme in particular cascades off Product: selecting
   * a Product repopulates Scheme's own option list client-side, with no distinguishable network
   * signal to await, so a click landing right as that repopulation happens gets "element was
   * detached from the DOM" - confirmed flaky in CI immediately after selectProduct(). Mirrors
   * the retryDropdownSelect pattern already proven in
   * tests/support/savingsApplicationFlow.ts for this same class of PrimeReact flakiness. */
  private async selectDropdownOption(dropdown: Locator, name: string, exact = false): Promise<void> {
    const maxAttempts = 3;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        await this.openDropdownWithOptions(dropdown);
        await this.page.getByRole('option', { name, exact }).click({ timeout: 8000 });
        return;
      } catch (err) {
        if (attempt === maxAttempts - 1) throw err;
        await this.page.keyboard.press('Escape').catch(() => undefined);
        await this.page.waitForTimeout(500);
      }
    }
  }

  async selectProduct(name: string): Promise<void> {
    await this.performAndWaitForListRefresh(async () => {
      await this.selectDropdownOption(this.filterDropdowns.nth(0), name);
    });
  }

  async selectScheme(name: string): Promise<void> {
    await this.performAndWaitForListRefresh(async () => {
      await this.selectDropdownOption(this.filterDropdowns.nth(1), name);
    });
  }

  async selectDatePreset(preset: DatePreset): Promise<void> {
    await this.performAndWaitForListRefresh(async () => {
      await this.selectDropdownOption(this.filterDropdowns.nth(2), preset, true);
    });
  }

  async clearFilterChip(label: string): Promise<void> {
    // The per-dropdown clear (X) is an unlabeled svg (data-pc-section="clearicon"), not a
    // <button> — getByRole('button') here actually matches the dropdown's own toggle trigger.
    await this.performAndWaitForListRefresh(async () => {
      await this.filterDropdowns
        .filter({ hasText: label })
        .locator('[data-pc-section="clearicon"]')
        .click();
    });
  }

  async hasClearFiltersButton(): Promise<boolean> {
    return (await this.page.getByRole('button', { name: /clear filters/i }).count()) > 0;
  }

  /** Reads every cell of one row in a single round-trip. On this shared, live UAT data set,
   * reading a row's Application Id and Mobile No via two separate calls is racy — a new
   * application can land (sorted newest-first) between the two reads, silently pairing one
   * row's id with a different row's mobile number. Use this whenever a test needs more than
   * one value from the same "seed" row. */
  async getRowCells(rowIndex: number): Promise<string[]> {
    const texts = await this.tableBodyRows.nth(rowIndex).locator('td').allTextContents();
    return texts.map((t) => t.trim());
  }

  async getApplicationIds(): Promise<string[]> {
    await this.waitForListSettled();
    if (await this.noRecordsRow.isVisible().catch(() => false)) return [];

    const rows = this.tableBodyRows;
    const count = await rows.count();
    const ids: string[] = [];
    for (let i = 0; i < count; i++) {
      ids.push((await rows.nth(i).locator('td').first().textContent())?.trim() ?? '');
    }
    return ids;
  }

  async getColumnHeaders(): Promise<string[]> {
    await this.waitForListSettled();
    return this.page.locator('.p-datatable-thead th').allTextContents();
  }

  async verifyNoRecordsFound(): Promise<void> {
    await this.waitForListSettled();
    await expect(this.noRecordsRow).toBeVisible();
  }

  private rowByApplicationId(applicationId: string): Locator {
    return this.tableBodyRows.filter({ hasText: applicationId });
  }

  async clickViewForRow(applicationId: string): Promise<void> {
    await this.rowByApplicationId(applicationId).locator('svg.fa-eye').click();
  }

  async openActionMenuForRow(applicationId: string): Promise<void> {
    await this.rowByApplicationId(applicationId).locator('svg.fa-ellipsis-vertical').click();
  }

  async clickTrackApplication(): Promise<void> {
    await this.page.getByRole('menuitem', { name: 'Track Application' }).click();
  }

  async isActionMenuAvailable(applicationId: string): Promise<boolean> {
    return (await this.rowByApplicationId(applicationId).locator('svg.fa-ellipsis-vertical').count()) > 0;
  }

  async getPaginationSummary(): Promise<string> {
    return (await this.page.locator('.p-paginator-current').textContent())?.trim() ?? '';
  }

  async clickNextPage(): Promise<void> {
    await this.performAndWaitForListRefresh(async () => {
      await this.nextPageButton.click();
    });
  }

  async clickPreviousPage(): Promise<void> {
    await this.performAndWaitForListRefresh(async () => {
      await this.previousPageButton.click();
    });
  }

  async clickFirstPage(): Promise<void> {
    await this.performAndWaitForListRefresh(async () => {
      await this.firstPageButton.click();
    });
  }

  async clickLastPage(): Promise<void> {
    await this.performAndWaitForListRefresh(async () => {
      await this.lastPageButton.click();
    });
  }

  async clickPageNumber(page: number): Promise<void> {
    await this.performAndWaitForListRefresh(async () => {
      await this.pageNumberButtons.filter({ hasText: String(page) }).click();
    });
  }

  async verifyResponsiveLayout(): Promise<void> {
    const bodyWidth = await this.page.evaluate(() => document.documentElement.scrollWidth);
    const viewportWidth = await this.page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 1);
  }
}
