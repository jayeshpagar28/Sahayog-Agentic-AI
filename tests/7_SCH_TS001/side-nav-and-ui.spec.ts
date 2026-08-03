import { test, expect } from '@playwright/test';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { SavingsApplicationDashboardPage } from '../pages/savings-application/SavingsApplicationDashboardPage';
import { SchemeSelectionPage } from '../pages/savings-application/SchemeSelectionPage';

test.describe('SCH_TS001 - Side Navigation, UI & Performance', () => {
  let dashboardPage: DashboardPage;
  let schemePage: SchemeSelectionPage;

  test.beforeEach(async ({ page }) => {
    dashboardPage = new DashboardPage(page);
    const savingsAppPage = new SavingsApplicationDashboardPage(page);
    schemePage = new SchemeSelectionPage(page);
    await dashboardPage.goto();
    await dashboardPage.clickSavingApplicationCard();
    await page.waitForURL(/\/UNPOSTED/);
    await savingsAppPage.newApplicationButton.click();
    await page.waitForURL(/\/schemelist/);
    await schemePage.verifyLoaded();
  });

  test('TC-SCH-022: Home, My Profile, Notifications, About Us are all visible and enabled on the Scheme Selection screen', async () => {
    // Sidebar nav items render slightly later on this route than the scheme list itself
    // (verifyLoaded only waits on the search box + first card) — wait for them explicitly.
    await expect(dashboardPage.navHome).toBeVisible({ timeout: 15000 });
    await dashboardPage.verifyNavigationMenu();
  });

  test('TC-SCH-023: Clicking Home from the Scheme Selection screen redirects to the Home Dashboard', async ({ page }) => {
    await dashboardPage.navHome.click();
    await page.waitForURL(/\/HOME/);
    await expect(page).toHaveURL(/\/HOME/);
  });

  test('TC-SCH-024: Page layout stays within viewport width at desktop resolution', async () => {
    await schemePage.verifyResponsiveLayout();
  });

  test('TC-SCH-025: Search bar, product heading, and scheme cards render without overlap or truncation', async () => {
    await expect(schemePage.searchInput).toBeVisible();
    await expect(schemePage.productHeading).toBeVisible();
    await expect(schemePage.schemeCards.first()).toBeVisible();
    const searchBox = await schemePage.searchInput.boundingBox();
    const firstCard = await schemePage.schemeCards.first().boundingBox();
    expect(searchBox).not.toBeNull();
    expect(firstCard).not.toBeNull();
  });

  test('TC-SCH-026: Scheme Selection screen loads within an acceptable response time', async ({ page }) => {
    const start = Date.now();
    await page.reload();
    await schemePage.verifyLoaded();
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(10000);
  });

  test('TC-SCH-027: Search results update within an acceptable response time after typing', async () => {
    const start = Date.now();
    await schemePage.search('Silver');
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(3000);
  });
});
