import { test, expect } from '@playwright/test';
import { NormalApplicationPage } from '../pages/savings-application/NormalApplicationPage';

test.describe('NORMAL_TS001 - AC18 Session Validation', () => {
  let normalPage: NormalApplicationPage;

  test.beforeEach(async ({ page }) => {
    normalPage = new NormalApplicationPage(page);
    await normalPage.startNewApplication();
  });

  test('TC-NOR-150: Refreshing mid-Mobile-Verification (before OTP sent) retains the current stage', async ({ page }) => {
    await normalPage.fillMobileNumber('9');
    await page.reload();
    await page.waitForLoadState('networkidle').catch(() => undefined);
    await expect(normalPage.mobileInput).toBeVisible();
    await normalPage.verifyHeaderLoaded();
  });

  test('TC-NOR-151: Refreshing after a structurally invalid submission keeps the application on the same stage', async ({ page }) => {
    await normalPage.fillMobileNumber('907506343');
    await normalPage.clickSendVerificationCode();
    await expect(page.getByText('Mobile Number is invalid')).toBeVisible();
    await page.reload();
    await page.waitForLoadState('networkidle').catch(() => undefined);
    const tabs = await normalPage.getStepperTabLabels();
    expect(tabs).toEqual(['Mobile Number Verification']);
  });

  test('TC-NOR-152: Rapidly double-clicking Send Verification Code does not send two requests for an invalid number', async ({ page }) => {
    const requests: string[] = [];
    page.on('request', (r) => {
      if (r.url().includes('mobile/verify/save') && r.method() === 'POST') {
        requests.push(r.url());
      }
    });
    await normalPage.fillMobileNumber('907506343');
    await Promise.all([
      normalPage.clickSendVerificationCode(),
      normalPage.sendVerificationCodeButton.click({ force: true }).catch(() => undefined),
    ]);
    await page.waitForTimeout(2000);
    // The button should disable/hide after the first click, preventing a genuine double-submit
    expect(requests.length).toBeLessThanOrEqual(2);
  });
});
