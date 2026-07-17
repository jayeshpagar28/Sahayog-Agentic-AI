import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/auth/LoginPage';
import { ForgotUserIdPage } from '../pages/auth/ForgotUserIdPage';

const REGISTERED_EMAIL = process.env.SAHAYOG_USER_ID ?? 'nayan.aher@netwinindia.in';

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
    await page.waitForURL(/\/radheAgentWeb\/forgetUser/);
    await forgotUserIdPage.sendReferenceId(REGISTERED_EMAIL);

    // FUI_BR_008 (rate limiting) is enforced server-side per email: repeated
    // Reference ID requests within a rolling window return "Maximum reference
    // ID requests exceeded" instead of succeeding. That's correct app behavior,
    // not a defect — but it means every step-2 test in this file shares the one
    // request budget for REGISTERED_EMAIL. Skip cleanly instead of failing with
    // a misleading toast-text mismatch when the environment is locked out.
    const toastText = await forgotUserIdPage.toast.innerText();
    test.skip(
      toastText.includes('Maximum reference ID requests exceeded'),
      'Blocked: FUI_BR_008 rate limit reached for the registered test email — rerun after the cool-down window or with a different registered email.',
    );
    await expect(forgotUserIdPage.toast).toContainText('Reference ID sent successfully');
  });

  test('TC-FUI-008: Registered Email ID reveals the step-2 verification form', async () => {
    await forgotUserIdPage.verifyStep2Revealed();
    expect(await forgotUserIdPage.isEmailFieldLockedForEditing()).toBe(true);
  });

  test('TC-FUI-009: Step 2 fields are present and individually marked mandatory', async ({ page }) => {
    await forgotUserIdPage.verifyStep2Revealed();

    for (const label of ['Reference ID', 'Name of User', 'Date of Birth', 'Employee ID', 'Mobile No.']) {
      await expect(page.getByText(label, { exact: false }).first()).toBeVisible();
    }
  });

  test('TC-FUI-010: Step 2 blank submission shows all required-field messages', async ({ page }) => {
    await forgotUserIdPage.verifyStep2Revealed();

    const recoveryRequests: string[] = [];
    page.on('request', (r) => {
      if (r.method() === 'POST' && (r.url().includes('forget') || r.url().toLowerCase().includes('reference'))) {
        recoveryRequests.push(r.url());
      }
    });

    await forgotUserIdPage.clickSubmitStep2();

    await forgotUserIdPage.verifyValidationMessage('Reference ID is required');
    await forgotUserIdPage.verifyValidationMessage('Name of User is required');
    await forgotUserIdPage.verifyValidationMessage('Date of Birth is required');
    await forgotUserIdPage.verifyValidationMessage('Employee ID is required');
    await forgotUserIdPage.verifyValidationMessage('Mobile No. is required');
    expect(recoveryRequests).toHaveLength(0);
  });

  test('TC-FUI-011: Step 2 submission with incorrect data shows a mismatch error', async ({ page }) => {
    await forgotUserIdPage.verifyStep2Revealed();

    await forgotUserIdPage.fillStep2Verification({
      referenceId: 'WRONG-REF-999',
      nameOfUser: 'Test QA',
      dateOfBirth: '2000-01-01',
      employeeId: 'EMP999',
      mobileNo: '9999999999',
    });
    await forgotUserIdPage.clickSubmitStep2();

    await forgotUserIdPage.verifyToastMessage('Reference ID mismatch');
    await expect(page).toHaveURL(/\/radheAgentWeb\/forgetUser/);
  });

  test('TC-FUI-019: Step 2 Submit button is not disabled while fields are blank (UX inconsistency)', async () => {
    await forgotUserIdPage.verifyStep2Revealed();

    // Observed inconsistency: step 1's Send Reference ID button is disabled
    // until non-empty input, but step 2's Submit stays enabled while blank and
    // instead relies on post-click field-level validation (see TC-FUI-010).
    // This assertion documents the current behavior for QA visibility.
    expect(await forgotUserIdPage.isSubmitStep2Enabled()).toBe(true);
  });

  test('TC-FUI-020: [Blocked] Full recovery with correct Reference ID discloses the User ID', async () => {
    test.skip(
      true,
      'Blocked: requires the real Reference ID delivered to the registered email inbox, which this automation environment cannot access. See specs/FUI_TS001-story-analysis.md Gaps section.',
    );
  });

  test('TC-FUI-021: [Blocked] Reference ID rejected after its 720-hour validity period expires (FUI_BR_011)', async () => {
    test.skip(
      true,
      'Blocked: verifying the 720-hour (30-day) Reference ID expiry per FUI_BR_011 requires either waiting out the real window or a pre-expired Reference ID, neither of which is available in this automation environment. See specs/FUI_TS001-story-analysis.md FUI_BR_011.',
    );
  });
});
