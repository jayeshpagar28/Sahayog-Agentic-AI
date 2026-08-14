import { test, expect } from '@playwright/test';
import { NormalApplicationPage } from '../pages/savings-application/NormalApplicationPage';

test.describe('NORMAL_TS001 - AC19 UI Validation', () => {
  let normalPage: NormalApplicationPage;

  test.beforeEach(async ({ page }) => {
    normalPage = new NormalApplicationPage(page);
    await normalPage.startNewApplication();
  });

  test('TC-NOR-160: Header (Product Name, Scheme Name) and stepper are visible and correctly rendered', async () => {
    await normalPage.verifyHeaderLoaded();
    await expect(normalPage.stepperTab('Mobile Number Verification')).toBeVisible();
  });

  test('TC-NOR-161: Page layout stays within viewport width at desktop resolution', async () => {
    await normalPage.verifyResponsiveLayout();
  });

  test('TC-NOR-162: Page remains usable at a mobile viewport (375x667)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(normalPage.mobileInput).toBeVisible();
    await expect(normalPage.productName).toBeVisible();
  });
});
