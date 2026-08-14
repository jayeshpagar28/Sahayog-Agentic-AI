import { test, expect } from '@playwright/test';
import { NormalApplicationPage } from '../pages/savings-application/NormalApplicationPage';

test.describe('NORMAL_TS001 - AC20 Performance Validation', () => {
  test('TC-NOR-170: Application Details (Mobile Verification) screen loads within an acceptable time', async ({ page }) => {
    const normalPage = new NormalApplicationPage(page);
    const start = Date.now();
    await normalPage.startNewApplication();
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(15000);
  });

  test('TC-NOR-171: An invalid mobile number submission completes without a UI freeze or timeout', async ({ page }) => {
    const normalPage = new NormalApplicationPage(page);
    await normalPage.startNewApplication();
    await normalPage.fillMobileNumber('907506343');
    const start = Date.now();
    await normalPage.clickSendVerificationCode();
    await expect(page.getByText('Mobile Number is invalid')).toBeVisible({ timeout: 10000 });
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(10000);
  });
});
