import { test, expect } from '@playwright/test';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { SavingsApplicationDashboardPage } from '../pages/savings-application/SavingsApplicationDashboardPage';

test.describe('SAD_TS001 - Responsive Layout and UI State', () => {
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

  test('TC-SAD-042: Dashboard layout renders correctly on a mobile viewport (390x844)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await savingsAppPage.verifyDashboardLoaded();
    await expect(savingsAppPage.searchInput).toBeVisible();
    await expect(savingsAppPage.filterButton).toBeVisible();
  });

  test('TC-SAD-043: Dashboard layout renders correctly on a tablet viewport (768x1024)', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await savingsAppPage.verifyDashboardLoaded();
    await expect(savingsAppPage.searchInput).toBeVisible();
    await expect(savingsAppPage.table).toBeVisible();
  });

  test('TC-SAD-044: Selected status tab remains highlighted after performing a search', async () => {
    await savingsAppPage.clickTab('Submitted');
    expect(await savingsAppPage.isTabActive('Submitted')).toBe(true);

    const seedMobile = (await savingsAppPage.tableBodyRows.first().locator('td').nth(4).textContent())?.trim() ?? '';
    await savingsAppPage.search(seedMobile);

    expect(await savingsAppPage.isTabActive('Submitted')).toBe(true);
  });
});
