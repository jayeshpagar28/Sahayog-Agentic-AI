import { test, expect } from '@playwright/test';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { SavingsApplicationDashboardPage } from '../pages/savings-application/SavingsApplicationDashboardPage';
import { SchemeSelectionPage } from '../pages/savings-application/SchemeSelectionPage';

const KNOWN_SCHEME = 'Silver Savings Account - 1002';

test.describe('SCH_TS001 - Search Functionality', () => {
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

  test('TC-SCH-008: Searching a full valid Scheme Name returns exactly the matching scheme', async () => {
    await schemePage.search(KNOWN_SCHEME);
    const names = await schemePage.getSchemeNames();
    expect(names).toEqual([KNOWN_SCHEME]);
  });

  test('TC-SCH-009: Searching a 4+ character mid-name substring correctly filters the list (BR1)', async () => {
    await schemePage.search('ving');
    const names = await schemePage.getSchemeNames();
    expect(names.length).toBeGreaterThan(0);
    for (const name of names) {
      expect(name.toLowerCase()).toContain('ving');
    }
  });

  test('TC-SCH-010: Searching fewer than 4 characters does not filter the list (BR2)', async () => {
    const fullList = await schemePage.getSchemeNames();
    await schemePage.search('Sil');
    const afterShortSearch = await schemePage.getSchemeNames();
    expect(afterShortSearch).toEqual(fullList);
  });

  test('TC-SCH-011: Search is case-insensitive', async () => {
    await schemePage.search('SILVER');
    const upper = await schemePage.getSchemeNames();
    await schemePage.search('silver');
    const lower = await schemePage.getSchemeNames();
    expect(upper).toEqual(lower);
    expect(upper).toEqual([KNOWN_SCHEME]);
  });

  test('TC-SCH-012: Leading/trailing whitespace in the search box is trimmed before matching (BR3)', async () => {
    await schemePage.search('  Silver  ');
    const names = await schemePage.getSchemeNames();
    expect(names).toEqual([KNOWN_SCHEME]);
  });

  test('TC-SCH-013: [Defect BUG-SCH-001] A 4+ char search matching no scheme empties the list but shows no "No Results" message', async () => {
    await schemePage.search('zzzznonexistent');
    const names = await schemePage.getSchemeNames();
    expect(names).toHaveLength(0);
    await expect(schemePage.noResultsMessage).not.toBeVisible();
  });

  test('TC-SCH-014: Clearing the search box restores the complete, unfiltered scheme list', async () => {
    const fullList = await schemePage.getSchemeNames();
    await schemePage.search(KNOWN_SCHEME);
    expect(await schemePage.getSchemeNames()).toEqual([KNOWN_SCHEME]);
    await schemePage.clearSearch();
    expect(await schemePage.getSchemeNames()).toEqual(fullList);
  });

  test('TC-SCH-015: XSS payload in the search box does not execute and produces no page error', async ({ page }) => {
    const pageErrors: string[] = [];
    let dialogAppeared = false;
    page.on('pageerror', (err) => pageErrors.push(err.message));
    page.on('dialog', async (dialog) => {
      dialogAppeared = true;
      await dialog.dismiss();
    });
    await schemePage.search('<script>alert(1)</script>');
    await page.waitForTimeout(500);
    expect(dialogAppeared).toBe(false);
    expect(pageErrors).toHaveLength(0);
  });
});
