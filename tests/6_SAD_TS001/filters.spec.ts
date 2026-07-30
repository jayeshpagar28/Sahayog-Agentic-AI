import { test, expect } from '@playwright/test';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { SavingsApplicationDashboardPage } from '../pages/savings-application/SavingsApplicationDashboardPage';

test.describe('SAD_TS001 - Filter Panel', () => {
  let dashboardPage: DashboardPage;
  let savingsAppPage: SavingsApplicationDashboardPage;

  test.beforeEach(async ({ page }) => {
    dashboardPage = new DashboardPage(page);
    savingsAppPage = new SavingsApplicationDashboardPage(page);
    await dashboardPage.goto();
    const initialLoad = page.waitForResponse(
      (r) => r.url().includes('app/activity/list') && r.request().method() === 'POST',
    );
    await dashboardPage.clickSavingApplicationCard();
    await page.waitForURL(/\/UNPOSTED/);
    await initialLoad;
  });

  test('TC-SAD-020: Clicking the filter icon opens the filter panel with Product, Scheme, and Date dropdowns', async () => {
    await savingsAppPage.openFilterPanel();
    await expect(savingsAppPage.filterDropdowns).toHaveCount(3);
  });

  test('TC-SAD-021: Product dropdown is populated from the API, not hardcoded/empty', async ({ page }) => {
    await savingsAppPage.openFilterPanel();
    await savingsAppPage.filterDropdowns.nth(0).click();
    const options = page.getByRole('option');
    await expect(options.first()).toBeVisible();
    expect(await options.count()).toBeGreaterThan(0);
  });

  test('TC-SAD-022: Scheme dropdown is populated from the API once a Product is selected', async ({ page }) => {
    await savingsAppPage.openFilterPanel();
    // Scheme is a dependent dropdown (AC6) — it has no options until a Product is chosen
    // (confirmed live: opening it beforehand shows "No results found", by design).
    await savingsAppPage.selectProduct('Savings Account');
    await savingsAppPage.filterDropdowns.nth(1).click();
    const options = page.getByRole('option');
    await expect(options.first()).toBeVisible();
    expect(await options.count()).toBeGreaterThan(0);
  });

  test('TC-SAD-023: Selecting a Product re-fetches the Scheme list (field interdependency)', async ({ page }) => {
    await savingsAppPage.openFilterPanel();
    const schemeReloadRequest = page.waitForRequest((r) => r.url().includes('getUserwiseAllscheme'));
    await savingsAppPage.filterDropdowns.nth(0).click();
    await page.getByRole('option').first().click();
    await expect(schemeReloadRequest).resolves.toBeTruthy();
  });

  test('TC-SAD-024: Selecting a Scheme filters the table and updates tab counts accordingly', async () => {
    await savingsAppPage.openFilterPanel();
    await savingsAppPage.selectProduct('Savings Account');
    const pendingBefore = await savingsAppPage.getTabCount('Pending');

    await savingsAppPage.selectScheme('Silver Savings Account - 1002');
    const pendingAfter = await savingsAppPage.getTabCount('Pending');

    expect(pendingAfter).toBeLessThanOrEqual(pendingBefore);
    const ids = await savingsAppPage.getApplicationIds();
    for (const id of ids) {
      expect(id.trim()).toMatch(/^SAH-1002-/);
    }
  });

  test('TC-SAD-025: Selecting the "Today" Date preset filters the table to applications dated today', async () => {
    await savingsAppPage.openFilterPanel();
    await savingsAppPage.selectDatePreset('Today');

    const rows = savingsAppPage.tableBodyRows;
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);

    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    const expectedDate = `${dd}-${mm}-${yyyy}`;

    for (let i = 0; i < count; i++) {
      await expect(rows.nth(i).locator('td').nth(2)).toHaveText(expectedDate);
    }
  });

  test('TC-SAD-026: An empty-result filter selection shows "No Records Found"', async () => {
    await savingsAppPage.openFilterPanel();
    await savingsAppPage.selectProduct('Savings Account');
    await savingsAppPage.selectScheme('Staff Salary Account - 1003');
    await savingsAppPage.clickTab('Re-Assigned');

    const reassignedCount = await savingsAppPage.getTabCount('Re-Assigned');
    test.skip(reassignedCount !== 0, 'Staff Salary Account has Re-Assigned records in this run; cannot exercise the zero-result state');
    await savingsAppPage.verifyNoRecordsFound();
  });

  test('TC-SAD-027: Combining Product + Scheme filters narrows results to the intersection with no conflicts', async () => {
    await savingsAppPage.openFilterPanel();
    await savingsAppPage.selectProduct('Savings Account');
    await savingsAppPage.selectScheme('Normal Savings Account - 1001');

    const ids = await savingsAppPage.getApplicationIds();
    expect(ids.length).toBeGreaterThan(0);
    for (const id of ids) {
      expect(id.trim()).toMatch(/^SAH-1001-/);
    }
    expect(new Set(ids).size).toBe(ids.length);
  });

  test('TC-SAD-028: Combining Scheme + Date filters narrows results to the intersection', async () => {
    await savingsAppPage.openFilterPanel();
    await savingsAppPage.selectProduct('Savings Account');
    await savingsAppPage.selectScheme('Silver Savings Account - 1002');
    await savingsAppPage.selectDatePreset('Last 15 Days');

    const ids = await savingsAppPage.getApplicationIds();
    for (const id of ids) {
      expect(id.trim()).toMatch(/^SAH-1002-/);
    }
  });

  test('TC-SAD-029: Combining a Scheme filter with a mobile-number search narrows to applications matching both', async () => {
    const seedRow = savingsAppPage.tableBodyRows.first();
    const seedId = (await seedRow.locator('td').first().textContent())?.trim() ?? '';
    const schemeCode = seedId.split('-')[1];
    const schemeNameByCode: Record<string, string> = {
      '1001': 'Normal Savings Account - 1001',
      '1002': 'Silver Savings Account - 1002',
      '1003': 'Staff Salary Account - 1003',
    };
    const seedMobile = (await seedRow.locator('td').nth(4).textContent())?.trim() ?? '';

    await savingsAppPage.openFilterPanel();
    await savingsAppPage.selectProduct('Savings Account');
    await savingsAppPage.selectScheme(schemeNameByCode[schemeCode]);
    await savingsAppPage.search(seedMobile);

    const ids = await savingsAppPage.getApplicationIds();
    expect(ids).toContain(seedId);
  });

  test('TC-SAD-030: Filter chips show a clear (X) control and removing one restores the wider result set', async () => {
    await savingsAppPage.openFilterPanel();
    await savingsAppPage.selectProduct('Savings Account');
    const beforeCount = await savingsAppPage.getTabCount('Pending');

    await savingsAppPage.selectScheme('Silver Savings Account - 1002');
    const filteredCount = await savingsAppPage.getTabCount('Pending');
    expect(filteredCount).toBeLessThanOrEqual(beforeCount);

    await savingsAppPage.clearFilterChip('Silver Savings Account - 1002');
    const restoredCount = await savingsAppPage.getTabCount('Pending');
    expect(restoredCount).toBe(beforeCount);
  });

  test('TC-SAD-031: [Recommendation AC9] No "Clear Filters" (reset-all) control is present in the filter panel', async () => {
    await savingsAppPage.openFilterPanel();
    await savingsAppPage.selectProduct('Savings Account');
    await savingsAppPage.selectScheme('Silver Savings Account - 1002');
    expect(await savingsAppPage.hasClearFiltersButton()).toBe(false);
  });
});
