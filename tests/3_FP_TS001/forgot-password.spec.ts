import * as fs from 'fs';
import * as path from 'path';
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/auth/LoginPage';
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage';
import { waitForSignalFile } from '../support/signalFile';

// The account's Reference ID quota is shared across Forgot Password and Forgot
// User ID and is rate-limited to 24h — this constant deliberately uses a User ID
// that will not succeed, so the deterministic suite below never spends a real
// Reference ID request.
const UNREGISTERED_USER_ID = 'no-such-user@netwinindia.in';

test.describe('FP_TS001 - Forgot Password', () => {
  // Override project-level storageState so the browser starts unauthenticated
  test.use({ storageState: { cookies: [], origins: [] } });

  let loginPage: LoginPage;
  let forgotPasswordPage: ForgotPasswordPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    forgotPasswordPage = new ForgotPasswordPage(page);
    await loginPage.goto();
    await loginPage.clickForgotPassword();
    await page.waitForURL(/\/forgetPassword/);
  });

  test('TC-FP-001: Forgot Password page loads with all UI components', async () => {
    await forgotPasswordPage.verifyPageLoaded();
    await expect(forgotPasswordPage.instructionText).toBeVisible();
  });

  test('TC-FP-002: Page URL is correct after navigation', async ({ page }) => {
    await expect(page).toHaveURL(/\/forgetPassword/);
  });

  test('TC-FP-003: Send Reference ID button is disabled while User ID is blank', async () => {
    expect(await forgotPasswordPage.isSendButtonEnabled()).toBe(false);
  });

  test('TC-FP-004: Send Reference ID button enables once User ID has a value', async () => {
    await forgotPasswordPage.enterUserId('a');
    expect(await forgotPasswordPage.isSendButtonEnabled()).toBe(true);
  });

  test('TC-FP-005: Whitespace-only User ID does not disable Send Reference ID - BUG-FP-001', async () => {
    await forgotPasswordPage.enterUserId('   ');

    // Known defect BUG-FP-001 (corroborates a pre-existing exploratory finding,
    // BUG-FP-001_whitespace-userid-enables-button.png): unlike a genuinely blank
    // field, whitespace-only input does not keep the button disabled — the app
    // does trim server-side (the request correctly comes back "User not found"
    // rather than succeeding), but the client-side gate that should stop the
    // request firing at all is missing. This assertion documents the current
    // (defective) client-side behavior.
    expect(await forgotPasswordPage.isSendButtonEnabled()).toBe(true);
  });

  test('TC-FP-006: Unregistered User ID shows an error and stays on Step 1', async ({ page }) => {
    await forgotPasswordPage.sendReferenceId(UNREGISTERED_USER_ID);

    await expect(forgotPasswordPage.toast).toBeVisible();
    await expect(page).toHaveURL(/\/forgetPassword/);
    await expect(forgotPasswordPage.referenceIdInput).not.toBeVisible();
  });

  test('TC-FP-007: Cancel from Step 1 returns to the Login page', async ({ page }) => {
    await forgotPasswordPage.clickCancel();
    await expect(page).toHaveURL(/\/login/);
  });

  test('TC-FP-008: Credentials never appear in the URL', async ({ page }) => {
    await forgotPasswordPage.sendReferenceId(UNREGISTERED_USER_ID);
    await expect(forgotPasswordPage.toast).toBeVisible();

    expect(page.url()).not.toContain(UNREGISTERED_USER_ID);
  });

  test('TC-FP-009: SQL Injection payload in User ID is handled safely', async ({ page }) => {
    await forgotPasswordPage.enterUserId("' OR '1'='1");
    await forgotPasswordPage.clickSendReferenceId();
    await page.waitForTimeout(1500);

    await expect(page).toHaveURL(/\/forgetPassword/);
    await expect(forgotPasswordPage.referenceIdInput).not.toBeVisible();
  });

  test('TC-FP-010: XSS payload in User ID is handled safely', async ({ page }) => {
    let dialogFired = false;
    page.on('dialog', async (dialog) => {
      dialogFired = true;
      await dialog.dismiss();
    });

    await forgotPasswordPage.enterUserId('<script>alert(1)</script>');
    await forgotPasswordPage.clickSendReferenceId();
    await page.waitForTimeout(1500);

    expect(dialogFired).toBe(false);
    await expect(page).toHaveURL(/\/forgetPassword/);
  });

  test('TC-FP-011: Responsive layout on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await forgotPasswordPage.verifyPageLoaded();
  });

  test('TC-FP-012: Browser Back button after Cancel returns without errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('pageerror', (err) => consoleErrors.push(err.message));

    await forgotPasswordPage.clickCancel();
    await expect(page).toHaveURL(/\/login/);

    await page.goBack();
    await page.waitForLoadState('domcontentloaded');

    expect(consoleErrors).toHaveLength(0);
  });
});

test.describe('FP_TS001 - Full Recovery (Live, Manually-Assisted)', () => {
  // This suite waits on a human to relay a real, live-delivered SMS OTP/Reference ID via a
  // signal file — nobody is present to do that in CI, so it would just burn ~15 minutes per
  // browser project on a guaranteed timeout (and waste a real Reference ID request against
  // the account's shared 24h quota on every retry). Skip entirely when unattended.
  test.skip(!!process.env.CI, 'Manually-assisted OTP relay — not runnable unattended in CI');

  // Override project-level storageState so the browser starts unauthenticated
  test.use({ storageState: { cookies: [], origins: [] } });

  // Real Reference ID is delivered live by SMS and changes on every run — this test waits
  // (up to 5 minutes) for a human to relay it via a signal file rather than using any
  // fabricated value, per project convention for verification-screen data.
  test.setTimeout(6 * 60 * 1000);

  const REGISTERED_USER_ID = process.env.SAHAYOG_USER_ID || 'nayan.aher@netwinindia.in';
  // Confirmed field value for this account — see memory sahayog_fp_step2_test_data.
  const DATE_OF_BIRTH = '2001-05-02';

  const REFID_SIGNAL_FILE = path.join(process.cwd(), '.fp-refid-input.txt');
  const OTP_SIGNAL_FILE = path.join(process.cwd(), '.fp-otp-input.txt');

  test('TC-FP-020: Full recovery with correct Reference ID, DOB, and OTP unlocks password reset', async ({ page }) => {
    [REFID_SIGNAL_FILE, OTP_SIGNAL_FILE].forEach((f) => {
      if (fs.existsSync(f)) fs.unlinkSync(f);
    });

    const loginPage = new LoginPage(page);
    const forgotPasswordPage = new ForgotPasswordPage(page);

    await loginPage.goto();
    await loginPage.clickForgotPassword();
    await page.waitForURL(/\/forgetPassword/);

    await forgotPasswordPage.sendReferenceId(REGISTERED_USER_ID);
    await forgotPasswordPage.verifyToastMessage('Reference ID sent successfully');
    await forgotPasswordPage.verifyStep2Revealed();

    console.log(`WAITING_FOR_REFERENCE_ID: write the code to ${REFID_SIGNAL_FILE} to continue.`);
    const referenceId = await waitForSignalFile(REFID_SIGNAL_FILE, 5 * 60 * 1000);

    await forgotPasswordPage.fillStep2Verification({ referenceId, dateOfBirth: DATE_OF_BIRTH });
    await forgotPasswordPage.clickSubmit();
    await forgotPasswordPage.verifyOtpStepRevealed();

    console.log(`WAITING_FOR_OTP: write the code to ${OTP_SIGNAL_FILE} to continue.`);
    const otp = await waitForSignalFile(OTP_SIGNAL_FILE, 5 * 60 * 1000);

    await forgotPasswordPage.submitOtp(otp);
    await page.waitForTimeout(2000);

    // What the unlocked reset step looks like (a New Password form, a further
    // redirect, etc.) was not known ahead of time — log the outcome for the
    // report rather than asserting a specific shape prematurely.
    console.log('URL after Verify:', page.url());
    console.log('Toast after Verify:', await forgotPasswordPage.toast.innerText().catch(() => '(none)'));
    console.log('Body text after Verify:', (await page.locator('body').innerText().catch(() => '')).slice(0, 500));
  });
});
