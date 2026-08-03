import { test, expect } from '@playwright/test';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { SavingsApplicationDashboardPage } from '../pages/savings-application/SavingsApplicationDashboardPage';
import { SchemeSelectionPage } from '../pages/savings-application/SchemeSelectionPage';

test.describe('SCH_TS001 - Navigation to Scheme Selection', () => {
  let dashboardPage: DashboardPage;
  let savingsAppPage: SavingsApplicationDashboardPage;
  let schemePage: SchemeSelectionPage;

  test.beforeEach(async ({ page }) => {
    dashboardPage = new DashboardPage(page);
    savingsAppPage = new SavingsApplicationDashboardPage(page);
    schemePage = new SchemeSelectionPage(page);
    await dashboardPage.goto();
    await dashboardPage.clickSavingApplicationCard();
    await page.waitForURL(/\/UNPOSTED/);
  });

  test('TC-SCH-001: Clicking Savings Application card then New Application navigates to Scheme Selection and loads successfully', async ({ page }) => {
    await savingsAppPage.newApplicationButton.click();
    await page.waitForURL(/\/schemelist/);
    await schemePage.verifyLoaded();
  });

  test('TC-SCH-002: Scheme Selection screen loads with no page errors', async ({ page }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));
    await savingsAppPage.newApplicationButton.click();
    await page.waitForURL(/\/schemelist/);
    await schemePage.verifyLoaded();
    await page.waitForTimeout(500);
    expect(pageErrors).toHaveLength(0);
  });

  test('TC-SCH-003: Page has a valid title', async ({ page }) => {
    await savingsAppPage.newApplicationButton.click();
    await page.waitForURL(/\/schemelist/);
    await expect(page).toHaveTitle(/.+/);
  });
});
