import { test, expect } from '@playwright/test';
import { SilverApplicationPage } from '../pages/savings-application/SilverApplicationPage';

test.describe('SILVER_TS001 - AC20 Performance Validation', () => {
  test('TC-SIL-170: Application Details (Mobile Verification) screen loads within an acceptable time', async ({ page }) => {
    const silverPage = new SilverApplicationPage(page);
    const start = Date.now();
    await silverPage.startNewApplication();
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(15000);
  });

  test('TC-SIL-171: An invalid mobile number submission completes without a UI freeze or timeout', async ({ page }) => {
    const silverPage = new SilverApplicationPage(page);
    await silverPage.startNewApplication();
    await silverPage.fillMobileNumber('907506343');
    const start = Date.now();
    await silverPage.clickSendVerificationCode();
    await expect(page.getByText('Mobile Number is invalid')).toBeVisible({ timeout: 10000 });
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(10000);
  });
});
