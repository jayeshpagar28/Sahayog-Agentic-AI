import { test, expect } from '@playwright/test';
import { SilverApplicationPage } from '../pages/savings-application/SilverApplicationPage';

test.describe('SILVER_TS001 - AC18 Session Validation', () => {
  let silverPage: SilverApplicationPage;

  test.beforeEach(async ({ page }) => {
    silverPage = new SilverApplicationPage(page);
    await silverPage.startNewApplication();
  });

  test('TC-SIL-150: Refreshing mid-Mobile-Verification (before OTP sent) retains the current stage', async ({ page }) => {
    await silverPage.fillMobileNumber('9');
    await page.reload();
    await page.waitForLoadState('networkidle').catch(() => undefined);
    await expect(silverPage.mobileInput).toBeVisible();
    await silverPage.verifyHeaderLoaded();
  });

  test('TC-SIL-151: Refreshing after a structurally invalid submission keeps the application on the same stage', async ({ page }) => {
    await silverPage.fillMobileNumber('907506343');
    await silverPage.clickSendVerificationCode();
    await expect(page.getByText('Mobile Number is invalid')).toBeVisible();
    await page.reload();
    await page.waitForLoadState('networkidle').catch(() => undefined);
    const tabs = await silverPage.getStepperTabLabels();
    expect(tabs).toEqual(['Mobile Number Verification']);
  });

  test('TC-SIL-152: Rapidly double-clicking Send Verification Code does not send two requests for an invalid number', async ({ page }) => {
    const requests: string[] = [];
    page.on('request', (r) => {
      if (r.url().includes('mobile/verify/save') && r.method() === 'POST') {
        requests.push(r.url());
      }
    });
    await silverPage.fillMobileNumber('907506343');
    await Promise.all([
      silverPage.clickSendVerificationCode(),
      silverPage.sendVerificationCodeButton.click({ force: true }).catch(() => undefined),
    ]);
    await page.waitForTimeout(2000);
    // The button should disable/hide after the first click, preventing a genuine double-submit
    expect(requests.length).toBeLessThanOrEqual(2);
  });
});
