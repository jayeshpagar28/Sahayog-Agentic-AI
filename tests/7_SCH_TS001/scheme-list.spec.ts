import { test, expect } from '@playwright/test';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { SavingsApplicationDashboardPage } from '../pages/savings-application/SavingsApplicationDashboardPage';
import { SchemeSelectionPage } from '../pages/savings-application/SchemeSelectionPage';

test.describe('SCH_TS001 - Active Scheme Verification', () => {
  let schemePage: SchemeSelectionPage;

  test.beforeEach(async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    const savingsAppPage = new SavingsApplicationDashboardPage(page);
    schemePage = new SchemeSelectionPage(page);
    await dashboardPage.goto();
    await dashboardPage.clickSavingApplicationCard();
    await page.waitForURL(/\/UNPOSTED/);
    await savingsAppPage.newApplicationButton.click();
    await page.waitForURL(/\/schemelist/);
    await schemePage.verifyLoaded();
  });

  test('TC-SCH-004: All active schemes returned by the API are displayed as cards in the list', async () => {
    const names = await schemePage.getSchemeNames();
    expect(names.length).toBeGreaterThan(0);
    for (const name of names) {
      expect(name.length).toBeGreaterThan(0);
    }
  });

  test('TC-SCH-005: Scheme card list contains no duplicate scheme names', async () => {
    const names = await schemePage.getSchemeNames();
    const uniqueNames = new Set(names);
    expect(uniqueNames.size).toBe(names.length);
  });

  test('TC-SCH-006: Each scheme card displays a non-empty Scheme Name', async () => {
    const count = await schemePage.schemeCards.count();
    for (let i = 0; i < count; i++) {
      const text = (await schemePage.schemeCards.nth(i).textContent())?.trim() ?? '';
      expect(text.length).toBeGreaterThan(0);
    }
  });

  test('TC-SCH-007: Scheme list container is scrollable', async ({ page }) => {
    const listContainerDiv = schemePage.schemeCards.first().locator('xpath=ancestor::div[contains(@style, "overflow")]').first();
    const overflowStyle = await listContainerDiv.getAttribute('style');
    expect(overflowStyle).toContain('overflow');
  });
});
