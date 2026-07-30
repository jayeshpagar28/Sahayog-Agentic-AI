import { test, expect } from '@playwright/test';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { SavingsApplicationDashboardPage } from '../pages/savings-application/SavingsApplicationDashboardPage';

test.describe('SAD_TS001 - Pagination', () => {
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

    // Pending has more than one page of records on this data set (verified during recon:
    // 23-25 Pending applications at page size 10). Skip gracefully if that's no longer true.
    const summary = await savingsAppPage.getPaginationSummary();
    test.skip(summary === '(1 of 1)' || summary === '(1 of 0)', 'Pending tab no longer has multiple pages on this data set');
  });

  test('TC-SAD-037: Pagination controls are visible with First/Previous disabled on page 1', async () => {
    await expect(savingsAppPage.firstPageButton).toBeDisabled();
    await expect(savingsAppPage.previousPageButton).toBeDisabled();
    await expect(savingsAppPage.nextPageButton).toBeEnabled();
  });

  test('TC-SAD-038: Clicking Next Page advances to page 2 and loads different records; current page is highlighted', async () => {
    const page1Ids = await savingsAppPage.getApplicationIds();
    await savingsAppPage.clickNextPage();

    expect(await savingsAppPage.getPaginationSummary()).toContain('2 of');
    const page2Ids = await savingsAppPage.getApplicationIds();
    expect(page2Ids).not.toEqual(page1Ids);
    await expect(savingsAppPage.pageNumberButtons.filter({ hasText: '2' })).toHaveClass(/p-highlight/);
  });

  test('TC-SAD-039: Clicking a specific page number navigates directly to that page', async () => {
    await savingsAppPage.clickPageNumber(2);
    expect(await savingsAppPage.getPaginationSummary()).toContain('2 of');
  });

  test('TC-SAD-040: Clicking Last Page then First Page navigates correctly and disables the right controls at each end', async () => {
    await savingsAppPage.clickLastPage();
    await expect(savingsAppPage.nextPageButton).toBeDisabled();
    await expect(savingsAppPage.lastPageButton).toBeDisabled();

    await savingsAppPage.clickFirstPage();
    await expect(savingsAppPage.previousPageButton).toBeDisabled();
    await expect(savingsAppPage.firstPageButton).toBeDisabled();
  });

  test('TC-SAD-041: Navigating Next then Previous returns to the original page 1 record set', async () => {
    const originalIds = await savingsAppPage.getApplicationIds();
    await savingsAppPage.clickNextPage();
    await savingsAppPage.clickPreviousPage();

    const restoredIds = await savingsAppPage.getApplicationIds();
    expect(restoredIds).toEqual(originalIds);
  });
});
