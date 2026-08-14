import { test, expect } from '@playwright/test';
import { NormalApplicationPage } from '../pages/savings-application/NormalApplicationPage';

test.describe('NORMAL_TS001 - Mobile Number Verification Field Validation', () => {
  let normalPage: NormalApplicationPage;

  test.beforeEach(async ({ page }) => {
    normalPage = new NormalApplicationPage(page);
    await normalPage.startNewApplication();
  });

  test('TC-NOR-001: Mobile Number Verification screen loads with no page errors', async ({ page }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));
    await normalPage.verifyHeaderLoaded();
    await expect(normalPage.mobileInput).toBeVisible();
    await page.waitForTimeout(500);
    expect(pageErrors).toHaveLength(0);
  });

  test('TC-NOR-002: Send Verification Code is not visible until a digit is entered', async () => {
    expect(await normalPage.isSendVerificationCodeVisible()).toBe(false);
    await normalPage.fillMobileNumber('9');
    expect(await normalPage.isSendVerificationCodeVisible()).toBe(true);
  });

  test('TC-NOR-003: A structurally incomplete (9-digit) mobile number is rejected without sending an OTP', async () => {
    await normalPage.fillMobileNumber('907506343');
    await normalPage.clickSendVerificationCode();
    await expect(normalPage.page.getByText('Mobile Number is invalid')).toBeVisible();
    // Still on the mobile entry screen — no OTP field revealed
    await expect(normalPage.otpInput).not.toBeVisible();
  });

  test('TC-NOR-004: A blank mobile number never reveals Send Verification Code', async () => {
    await normalPage.fillMobileNumber('123');
    await normalPage.fillMobileNumber('');
    expect(await normalPage.isSendVerificationCodeVisible()).toBe(false);
  });

  test('TC-NOR-005: Alphabetic characters are not accepted into the numeric Mobile Number field', async () => {
    await normalPage.fillMobileNumber('abcdefghij');
    const value = await normalPage.mobileInput.inputValue();
    expect(value).toBe('');
  });

  test('TC-NOR-006: Submitting an invalid mobile number produces no page error', async ({ page }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));
    await normalPage.fillMobileNumber('000000000');
    await normalPage.clickSendVerificationCode();
    await page.waitForTimeout(1000);
    expect(pageErrors).toHaveLength(0);
  });
});
