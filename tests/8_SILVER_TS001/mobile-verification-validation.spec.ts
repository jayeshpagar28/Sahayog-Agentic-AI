import { test, expect } from '@playwright/test';
import { SilverApplicationPage } from '../pages/savings-application/SilverApplicationPage';

test.describe('SILVER_TS001 - Mobile Number Verification Field Validation', () => {
  let silverPage: SilverApplicationPage;

  test.beforeEach(async ({ page }) => {
    silverPage = new SilverApplicationPage(page);
    await silverPage.startNewApplication();
  });

  test('TC-SIL-001: Mobile Number Verification screen loads with no page errors', async ({ page }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));
    await silverPage.verifyHeaderLoaded();
    await expect(silverPage.mobileInput).toBeVisible();
    await page.waitForTimeout(500);
    expect(pageErrors).toHaveLength(0);
  });

  test('TC-SIL-002: Send Verification Code is not visible until a digit is entered', async () => {
    expect(await silverPage.isSendVerificationCodeVisible()).toBe(false);
    await silverPage.fillMobileNumber('9');
    expect(await silverPage.isSendVerificationCodeVisible()).toBe(true);
  });

  test('TC-SIL-003: A structurally incomplete (9-digit) mobile number is rejected without sending an OTP', async () => {
    await silverPage.fillMobileNumber('907506343');
    await silverPage.clickSendVerificationCode();
    await expect(silverPage.page.getByText('Mobile Number is invalid')).toBeVisible();
    // Still on the mobile entry screen — no OTP field revealed
    await expect(silverPage.otpInput).not.toBeVisible();
  });

  test('TC-SIL-004: A blank mobile number never reveals Send Verification Code', async () => {
    await silverPage.fillMobileNumber('123');
    await silverPage.fillMobileNumber('');
    expect(await silverPage.isSendVerificationCodeVisible()).toBe(false);
  });

  test('TC-SIL-005: Alphabetic characters are not accepted into the numeric Mobile Number field', async () => {
    await silverPage.fillMobileNumber('abcdefghij');
    const value = await silverPage.mobileInput.inputValue();
    expect(value).toBe('');
  });

  test('TC-SIL-006: Submitting an invalid mobile number produces no page error', async ({ page }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));
    await silverPage.fillMobileNumber('000000000');
    await silverPage.clickSendVerificationCode();
    await page.waitForTimeout(1000);
    expect(pageErrors).toHaveLength(0);
  });
});
