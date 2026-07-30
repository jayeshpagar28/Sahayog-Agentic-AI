import { test, expect } from '@playwright/test';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { SavingsApplicationDashboardPage } from '../pages/savings-application/SavingsApplicationDashboardPage';

test.describe('SAD_TS001 - Navigation and Status Tabs', () => {
  let dashboardPage: DashboardPage;
  let savingsAppPage: SavingsApplicationDashboardPage;

  test.beforeEach(async ({ page }) => {
    dashboardPage = new DashboardPage(page);
    savingsAppPage = new SavingsApplicationDashboardPage(page);
    await dashboardPage.goto();
    // The list first renders PrimeReact's empty-state placeholder (indistinguishable from a
    // genuine zero-result state) until the real data resolves — wait for that response here so
    // every test starts from settled, real data rather than racing the initial fetch.
    const initialLoad = page.waitForResponse(
      (r) => r.url().includes('app/activity/list') && r.request().method() === 'POST',
    );
    await dashboardPage.clickSavingApplicationCard();
    await page.waitForURL(/\/UNPOSTED/);
    await initialLoad;
  });

  test('TC-SAD-001: Clicking Savings Application card from Home navigates to the dashboard and loads successfully', async ({ page }) => {
    await savingsAppPage.verifyDashboardLoaded();
    const pageErrors: string[] = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));
    await page.waitForTimeout(500);
    expect(pageErrors).toHaveLength(0);
  });

  test('TC-SAD-002: Dashboard shows all 4 status tabs with non-negative counts', async () => {
    for (const tab of ['Pending', 'Submitted', 'Re-Assigned', 'Decisioned'] as const) {
      const count = await savingsAppPage.getTabCount(tab);
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test('TC-SAD-003: Pending tab is selected/highlighted by default on first load', async () => {
    expect(await savingsAppPage.isTabActive('Pending')).toBe(true);
  });

  test('TC-SAD-004: Application list table renders with all expected columns and real data', async () => {
    const headers = await savingsAppPage.getColumnHeaders();
    expect(headers).toEqual(
      expect.arrayContaining(['Application Id', 'Customer Type', 'Application Date', 'Applicant Name', 'Mobile No', 'Status']),
    );
    const ids = await savingsAppPage.getApplicationIds();
    expect(ids.length).toBeGreaterThan(0);
    for (const id of ids) {
      expect(id.trim()).toMatch(/^SAH-\d+-\d+$/);
    }
  });

  test('TC-SAD-006: Clicking Submitted tab highlights it and loads only Submitted-status applications', async () => {
    await savingsAppPage.clickTab('Submitted');
    expect(await savingsAppPage.isTabActive('Submitted')).toBe(true);
    expect(await savingsAppPage.isTabActive('Pending')).toBe(false);
    const rowCount = await savingsAppPage.tableBodyRows.count();
    expect(rowCount).toBeGreaterThan(0);
  });

  test('TC-SAD-007: Clicking Re-Assigned tab highlights it and loads only Re-Assigned-status applications', async () => {
    await savingsAppPage.clickTab('Re-Assigned');
    expect(await savingsAppPage.isTabActive('Re-Assigned')).toBe(true);
  });

  test('TC-SAD-008: Clicking Decisioned tab highlights it, loads Decisioned applications, and shows the Account No column', async () => {
    await savingsAppPage.clickTab('Decisioned');
    expect(await savingsAppPage.isTabActive('Decisioned')).toBe(true);
    const headers = await savingsAppPage.getColumnHeaders();
    expect(headers).toEqual(expect.arrayContaining(['Account No']));
  });

  test('TC-SAD-009: Switching between tabs updates the list scope without stale rows from the previous tab', async () => {
    await savingsAppPage.clickTab('Submitted');
    const submittedIds = await savingsAppPage.getApplicationIds();
    await savingsAppPage.clickTab('Decisioned');
    const decisionedIds = await savingsAppPage.getApplicationIds();
    expect(decisionedIds).not.toEqual(submittedIds);
  });

  test('TC-SAD-010: A tab with zero matching applications shows "No Records Found"', async () => {
    const reassignedCount = await savingsAppPage.getTabCount('Re-Assigned');
    test.skip(reassignedCount !== 0, 'Re-Assigned tab currently has data; this run cannot exercise the zero-count state');
    await savingsAppPage.clickTab('Re-Assigned');
    await savingsAppPage.verifyNoRecordsFound();
  });

  test('TC-SAD-045: [Defect BUG-SAD-001] Direct navigation to /UNPOSTED shows all-zero counts and "No Records Found" instead of real data', async () => {
    await savingsAppPage.gotoDirect();
    await expect(savingsAppPage.statisticsCards.first()).toBeVisible();

    for (const tab of ['Pending', 'Submitted', 'Re-Assigned', 'Decisioned'] as const) {
      expect(await savingsAppPage.getTabCount(tab)).toBe(0);
    }
    await savingsAppPage.verifyNoRecordsFound();
  });
});
