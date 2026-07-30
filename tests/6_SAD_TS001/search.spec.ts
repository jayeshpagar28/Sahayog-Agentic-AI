import { test, expect } from '@playwright/test';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { SavingsApplicationDashboardPage } from '../pages/savings-application/SavingsApplicationDashboardPage';

test.describe('SAD_TS001 - Search', () => {
  let dashboardPage: DashboardPage;
  let savingsAppPage: SavingsApplicationDashboardPage;
  let seedMobileNo: string;
  let seedApplicationId: string;

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

    // Seed real, currently-existing values from the live unfiltered list rather than
    // hardcoding a mobile number/application id that could stop existing on this shared UAT data.
    seedApplicationId = (await savingsAppPage.getApplicationIds())[0];
    seedMobileNo = (await savingsAppPage.tableBodyRows.first().locator('td').nth(4).textContent())?.trim() ?? '';
  });

  test('TC-SAD-011: Searching by an exact registered mobile number returns exactly the matching application', async () => {
    await savingsAppPage.search(seedMobileNo);
    const ids = await savingsAppPage.getApplicationIds();
    expect(ids).toEqual([seedApplicationId]);
  });

  test('TC-SAD-012: Searching by a valid Application Id returns the matching application', async () => {
    await savingsAppPage.search(seedApplicationId);
    const ids = await savingsAppPage.getApplicationIds();
    expect(ids).toContain(seedApplicationId);
  });

  test('TC-SAD-013: Partial mobile number search returns applications matching the entered prefix', async () => {
    const prefix = seedMobileNo.slice(0, 5);
    await savingsAppPage.search(prefix);
    const ids = await savingsAppPage.getApplicationIds();
    expect(ids).toContain(seedApplicationId);
  });

  test('TC-SAD-014: Searching with a value that matches nothing shows "No Records Found" without a page error', async ({ page }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));

    await savingsAppPage.search('0000000000');
    await savingsAppPage.verifyNoRecordsFound();
    expect(pageErrors).toHaveLength(0);
  });

  test('TC-SAD-015: Leading/trailing whitespace in the search box is NOT ignored before matching - BUG-SAD-003', async () => {
    // Per AC4, "Leading and trailing spaces are ignored." Confirmed live this does not happen:
    // the raw (untrimmed) value is sent to the backend, so an otherwise-exact match returns
    // "No Records Found" instead of the expected application. This asserts the current
    // (defective) behavior — see BUG-SAD-003_whitespace-search-no-match.png.
    await savingsAppPage.search(`  ${seedMobileNo}  `);
    const ids = await savingsAppPage.getApplicationIds();
    expect(ids).not.toContain(seedApplicationId);
  });

  test('TC-SAD-016: Clearing the search box restores the full unfiltered list', async () => {
    const originalCount = await savingsAppPage.tableBodyRows.count();
    await savingsAppPage.search(seedMobileNo);
    expect(await savingsAppPage.tableBodyRows.count()).toBeLessThanOrEqual(originalCount);

    await savingsAppPage.clearSearch();
    expect(await savingsAppPage.tableBodyRows.count()).toBe(originalCount);
  });

  test('TC-SAD-017: Search results update all 4 tab counts to reflect the search scope', async () => {
    await savingsAppPage.search(seedMobileNo);
    const pendingCount = await savingsAppPage.getTabCount('Pending');
    const submittedCount = await savingsAppPage.getTabCount('Submitted');
    const reassignedCount = await savingsAppPage.getTabCount('Re-Assigned');
    const decisionedCount = await savingsAppPage.getTabCount('Decisioned');

    expect(pendingCount + submittedCount + reassignedCount + decisionedCount).toBeGreaterThanOrEqual(1);
  });

  test('TC-SAD-018: SQL Injection payload in the search box is handled safely', async ({ page }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));

    await savingsAppPage.search("' OR '1'='1");
    await expect(page).toHaveURL(/\/UNPOSTED/);
    expect(pageErrors).toHaveLength(0);
  });

  test('TC-SAD-019: XSS payload in the search box does not execute', async ({ page }) => {
    let dialogFired = false;
    page.on('dialog', async (dialog) => {
      dialogFired = true;
      await dialog.dismiss();
    });

    await savingsAppPage.search('<script>alert(1)</script>');
    await page.waitForTimeout(1000);
    expect(dialogFired).toBe(false);
  });
});
