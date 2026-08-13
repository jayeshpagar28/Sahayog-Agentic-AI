import { test, expect } from '@playwright/test';
import { SilverApplicationPage } from '../pages/savings-application/SilverApplicationPage';

test.describe('SILVER_TS001 - AC19 UI Validation', () => {
  let silverPage: SilverApplicationPage;

  test.beforeEach(async ({ page }) => {
    silverPage = new SilverApplicationPage(page);
    await silverPage.startNewApplication();
  });

  test('TC-SIL-160: Header (Product Name, Scheme Name) and stepper are visible and correctly rendered', async () => {
    await silverPage.verifyHeaderLoaded();
    await expect(silverPage.stepperTab('Mobile Number Verification')).toBeVisible();
  });

  test('TC-SIL-161: Page layout stays within viewport width at desktop resolution', async () => {
    await silverPage.verifyResponsiveLayout();
  });

  test('TC-SIL-162: Page remains usable at a mobile viewport (375x667)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(silverPage.mobileInput).toBeVisible();
    await expect(silverPage.productName).toBeVisible();
  });
});
