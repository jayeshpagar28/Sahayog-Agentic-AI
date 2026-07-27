import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/auth/LoginPage';
import { ForgotUserIdPage } from '../pages/auth/ForgotUserIdPage';

// No known registered mobile number is available in this environment — the
// previously-known test mobile number from the old instance ("9511996248")
// returns "User not found" here. Step 2 tests below depend on actually
// reaching the revealed verification form, so the beforeEach skips cleanly
// (rather than failing with a misleading error) whenever step 1 doesn't
// succeed, exactly like the pre-existing FUI_BR_008 rate-limit skip pattern.
const UNVERIFIED_MOBILE_NUMBER = '9511996248';

test.describe('FUI_TS001 - Step 2: Identity Verification', () => {
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
    await forgotUserIdPage.sendReferenceId(UNVERIFIED_MOBILE_NUMBER);
    await expect(forgotUserIdPage.toast).toBeVisible();

    const toastText = await forgotUserIdPage.toast.innerText();
    test.skip(
      !toastText.includes('Reference ID sent successfully'),
      `Blocked: no registered mobile number available in this environment to reach Step 2 (toast said: "${toastText}"). Rerun with a mobile number confirmed registered on https://sahyogagentweb.drutam.in:9634.`,
    );
  });

  test('TC-FUI-008: Registered Mobile Number reveals the step-2 verification form', async () => {
    await forgotUserIdPage.verifyStep2Revealed();
    expect(await forgotUserIdPage.isMobileNumberFieldLockedForEditing()).toBe(true);
  });

  test('TC-FUI-009: Step 2 fields are present and individually marked mandatory', async ({ page }) => {
    await forgotUserIdPage.verifyStep2Revealed();

    for (const label of ['Reference ID', 'User ID', 'Date of Birth']) {
      await expect(page.getByText(label, { exact: false }).first()).toBeVisible();
    }
  });

  test('TC-FUI-010: Step 2 blank submission shows all required-field messages', async ({ page }) => {
    await forgotUserIdPage.verifyStep2Revealed();

    const recoveryRequests: string[] = [];
    page.on('request', (r) => {
      if (r.method() === 'POST' && r.url().includes('otp/request')) recoveryRequests.push(r.url());
    });

    await forgotUserIdPage.clickSubmitStep2();

    await forgotUserIdPage.verifyValidationMessage('Reference ID is required');
    await forgotUserIdPage.verifyValidationMessage('User ID is required');
    await forgotUserIdPage.verifyValidationMessage('Date of Birth is required');
    expect(recoveryRequests).toHaveLength(0);
  });

  test('TC-FUI-011: Step 2 submission with incorrect data shows a mismatch error', async ({ page }) => {
    await forgotUserIdPage.verifyStep2Revealed();

    await forgotUserIdPage.fillStep2Verification({
      referenceId: 'WRONG-REF-999',
      userId: 'WRONGUSER01',
      dateOfBirth: '2000-01-01',
    });
    await forgotUserIdPage.clickSubmitStep2();

    await forgotUserIdPage.verifyToastMessage('Reference ID mismatch');
    await expect(page).toHaveURL(/\/forgetUser/);
  });

  test('TC-FUI-019: Step 2 Submit button is not disabled while fields are blank (UX inconsistency)', async () => {
    await forgotUserIdPage.verifyStep2Revealed();

    // Observed inconsistency: step 1's Send Reference ID button is disabled
    // until non-empty input, but step 2's Submit stays enabled while blank and
    // instead relies on post-click field-level validation (see TC-FUI-010).
    expect(await forgotUserIdPage.isSubmitStep2Enabled()).toBe(true);
  });

  test('TC-FUI-020: [Blocked] Full recovery with correct Reference ID discloses the User ID', async () => {
    test.skip(
      true,
      'Blocked: requires a Reference ID / User ID / Date of Birth combination confirmed to fully match a registered record, which is not available in this environment. See specs/FUI_TS001-story-analysis.md Gaps section.',
    );
  });

  test('TC-FUI-021: [Blocked] Reference ID rejected after its 720-hour validity period expires (FUI_BR_011)', async () => {
    test.skip(
      true,
      'Blocked: verifying the 720-hour (30-day) Reference ID expiry per FUI_BR_011 requires either waiting out the real window or a pre-expired Reference ID, neither of which is available in this automation environment. See specs/FUI_TS001-story-analysis.md FUI_BR_011.',
    );
  });
});
