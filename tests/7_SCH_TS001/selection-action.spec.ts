import { test, expect } from '@playwright/test';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { SavingsApplicationDashboardPage } from '../pages/savings-application/SavingsApplicationDashboardPage';
import { SchemeSelectionPage } from '../pages/savings-application/SchemeSelectionPage';

const KNOWN_SCHEME = 'Silver Savings Account - 1002';

test.describe('SCH_TS001 - Scheme Selection Action', () => {
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

  test('TC-SCH-020: Clicking a scheme card navigates to the Savings Application screen without error', async ({ page }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));
    await schemePage.clickScheme(KNOWN_SCHEME);
    await page.waitForURL(/\/applndetails/);
    await page.waitForTimeout(500);
    expect(pageErrors).toHaveLength(0);
  });

  test('TC-SCH-021: The selected Scheme Name and Product Name are carried forward to the Savings Application screen', async ({ page }) => {
    await schemePage.clickScheme(KNOWN_SCHEME);
    await page.waitForURL(/\/applndetails/);
    // "Product Name" / "Scheme Name" are <strong> labels with the value as a sibling text node
    // in the same <p> — matching the whole paragraph's text is required, not exact label text.
    const productParagraph = page.locator('p', { hasText: 'Product Name' });
    const schemeParagraph = page.locator('p', { hasText: 'Scheme Name' });
    await expect(productParagraph).toContainText('Savings Account');
    await expect(schemeParagraph).toContainText(KNOWN_SCHEME);
  });
});
