import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/auth/LoginPage';
import { ForgotUserIdPage } from '../pages/auth/ForgotUserIdPage';

// The account's registered mobile number was changed on 28-Jul-2026 from
// 9075063434 to 9511996248 — this constant intentionally uses the number that
// is NOT currently registered, so it now points at the old number instead.
// Tests that need a genuinely registered number use 9511996248 directly (see
// step2-identity-verification.spec.ts's "Full Recovery" describe block).
const UNVERIFIED_MOBILE_NUMBER = '9075063434';

test.describe('FUI_TS001 - Step 1: Mobile Number Recovery', () => {
  // Override project-level storageState so the browser starts unauthenticated
  test.use({ storageState: { cookies: [], origins: [] } });

  let loginPage: LoginPage;
  let forgotUserIdPage: ForgotUserIdPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    forgotUserIdPage = new ForgotUserIdPage(page);
    await loginPage.goto();
    await loginPage.clickForgotUserId();
    await page.waitForURL(/\/forgetUser/);
  });

  test('TC-FUI-001: Forgot User ID page loads with all UI components', async () => {
    await forgotUserIdPage.verifyPageLoaded();
    await expect(forgotUserIdPage.instructionText).toBeVisible();
  });

  test('TC-FUI-002: Page URL is correct after navigation', async ({ page }) => {
    await expect(page).toHaveURL(/\/forgetUser/);
  });

  test('TC-FUI-003: Send Reference ID button is disabled while Mobile Number is blank', async () => {
    expect(await forgotUserIdPage.isSendButtonEnabled()).toBe(false);
  });

  test('TC-FUI-004: Send Reference ID button enables once Mobile Number has a value', async () => {
    await forgotUserIdPage.enterMobileNumber('9');
    expect(await forgotUserIdPage.isSendButtonEnabled()).toBe(true);
  });

  test('TC-FUI-005: Non-numeric characters are stripped client-side from Mobile Number', async () => {
    await forgotUserIdPage.enterMobileNumber('abc123def456');
    await expect(forgotUserIdPage.mobileNumberInput).toHaveValue('123456');
  });

  test('TC-FUI-006: Whitespace-only Mobile Number is treated as blank', async () => {
    await forgotUserIdPage.enterMobileNumber('   ');

    // Unlike the old Email ID field (DEF-001 on the previous instance), the
    // Mobile Number field correctly keeps Send Reference ID disabled for
    // whitespace-only input — that defect does not reproduce here.
    expect(await forgotUserIdPage.isSendButtonEnabled()).toBe(false);
  });

  test('TC-FUI-007: Unregistered Mobile Number shows an error and stays on step 1', async ({ page }) => {
    await forgotUserIdPage.sendReferenceId('9999999999');

    await forgotUserIdPage.verifyToastMessage('User not found');
    await expect(page).toHaveURL(/\/forgetUser/);
    await expect(forgotUserIdPage.referenceIdInput).not.toBeVisible();
  });

  test('TC-FUI-012: Cancel from step 1 returns to the Login page', async ({ page }) => {
    await forgotUserIdPage.clickCancel();
    await expect(page).toHaveURL(/\/login/);
  });

  test('TC-FUI-013: Credentials never appear in the URL', async ({ page }) => {
    await forgotUserIdPage.sendReferenceId(UNVERIFIED_MOBILE_NUMBER);
    await expect(forgotUserIdPage.toast).toBeVisible();

    expect(page.url()).not.toContain(UNVERIFIED_MOBILE_NUMBER);
  });

  test('TC-FUI-014: SQL Injection payload in Mobile Number is handled safely', async ({ page }) => {
    await forgotUserIdPage.enterMobileNumber("1' OR '1'='1");
    await forgotUserIdPage.clickSendReferenceId();
    await page.waitForTimeout(1500);

    await expect(page).toHaveURL(/\/forgetUser/);
    await expect(forgotUserIdPage.referenceIdInput).not.toBeVisible();
  });

  test('TC-FUI-015: XSS payload in Mobile Number is handled safely', async ({ page }) => {
    let dialogFired = false;
    page.on('dialog', async (dialog) => {
      dialogFired = true;
      await dialog.dismiss();
    });

    await forgotUserIdPage.enterMobileNumber('1');
    await forgotUserIdPage.mobileNumberInput.fill('<script>alert(1)</script>');
    await forgotUserIdPage.clickSendReferenceId();
    await page.waitForTimeout(1500);

    expect(dialogFired).toBe(false);
    await expect(page).toHaveURL(/\/forgetUser/);
  });

  test('TC-FUI-016: Rapid double-click on Send Reference ID does not double-submit - DEF-003', async ({ page }) => {
    const requestUrls: string[] = [];
    page.on('request', (r) => {
      if (r.method() === 'POST' && r.url().includes('ref/request')) requestUrls.push(r.url());
    });

    await forgotUserIdPage.enterMobileNumber(UNVERIFIED_MOBILE_NUMBER);
    await forgotUserIdPage.clickSendReferenceId();
    // Second rapid click attempt, mirroring a real impatient double-click.
    await forgotUserIdPage.sendReferenceIdButton.click({ timeout: 1000 }).catch(() => undefined);
    await expect(forgotUserIdPage.toast.first()).toBeVisible();

    // Known defect DEF-003: Send Reference ID is never disabled while the
    // request is in flight, so a rapid double-click fires two ref/request
    // calls instead of one — the same double-submit pattern found in the
    // Activate Account module (BUG-003). This assertion documents the current
    // (defective) behavior so the suite fails loudly once the button gains a
    // proper in-flight-disabled state.
    expect(requestUrls.length).toBe(2);
  });

  test('TC-FUI-017: Responsive layout on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await forgotUserIdPage.verifyPageLoaded();
  });

  test('TC-FUI-017b: Reloading the page redirects to Login instead of staying on it - DEF-002', async ({ page }) => {
    // Known defect DEF-002: unlike the Login page (which is the SPA's fallback
    // route and trivially "survives" a reload), a hard reload of
    // /forgetUser drops the client-side route entirely and lands
    // back on /login, losing the user's place in the recovery flow. Still
    // reproduces on the new instance.
    await page.reload();
    await expect(page).toHaveURL(/\/login/);
  });

  test('TC-FUI-018: Browser Back button after Cancel returns without errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('pageerror', (err) => consoleErrors.push(err.message));

    await forgotUserIdPage.clickCancel();
    await expect(page).toHaveURL(/\/login/);

    await page.goBack();
    await page.waitForLoadState('domcontentloaded');

    expect(consoleErrors).toHaveLength(0);
  });
});
