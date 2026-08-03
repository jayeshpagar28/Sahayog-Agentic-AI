import { test, expect } from '@playwright/test';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { SavingsApplicationDashboardPage } from '../pages/savings-application/SavingsApplicationDashboardPage';
import { SchemeSelectionPage } from '../pages/savings-application/SchemeSelectionPage';

test.describe('SCH_TS001 - Scheme Details Panel', () => {
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

  test('TC-SCH-016: Scheme Details panel is visible alongside the scheme list', async () => {
    await expect(schemePage.detailsPanel).toBeVisible();
    await expect(schemePage.schemeCards.first()).toBeVisible();
  });

  test('TC-SCH-017: The active panel slide displays a non-empty Scheme Name and Description', async () => {
    const name = await schemePage.getActiveSlideName();
    const description = await schemePage.getActiveSlideDescription();
    expect(name.length).toBeGreaterThan(0);
    expect(description.length).toBeGreaterThan(0);
  });

  test('TC-SCH-018: The Next carousel control changes the active slide without a page error', async ({ page }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));
    const before = await schemePage.getActiveSlideName();
    await schemePage.carouselNextButton.click();
    await page.waitForTimeout(800);
    const after = await schemePage.getActiveSlideName();
    expect(after).not.toBe(before);
    expect(pageErrors).toHaveLength(0);
  });

  test('TC-SCH-019: The panel auto-rotates to a different slide without manual interaction', async ({ page }) => {
    // Rotation interval is short and cyclical, so a single before/after snapshot can land back
    // on the same slide by chance — poll several samples and confirm at least one change.
    const before = await schemePage.getActiveSlideName();
    let changed = false;
    for (let i = 0; i < 6; i++) {
      await page.waitForTimeout(4000);
      if ((await schemePage.getActiveSlideName()) !== before) {
        changed = true;
        break;
      }
    }
    expect(changed).toBe(true);
  });
});
