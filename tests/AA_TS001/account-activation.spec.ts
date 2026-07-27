import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/auth/LoginPage';
import { ActivateAccountPage, type ActivationData } from '../pages/auth/ActivateAccountPage';

const TEST_DATA: ActivationData = {
  referenceId: 'TESTREF123',
  userId: 'TESTUSER01',
  dateOfBirth: '2000-01-01',
};

test.describe('AA_TS001 - Activate Account', () => {
  // Override project-level storageState so the browser starts unauthenticated,
  // matching how a newly registered (not-yet-active) user reaches this page.
  test.use({ storageState: { cookies: [], origins: [] } });

  let loginPage: LoginPage;
  let activateAccountPage: ActivateAccountPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    activateAccountPage = new ActivateAccountPage(page);
    await loginPage.goto();
    await loginPage.clickActivateAccount();
    await page.waitForURL(/\/activeteUser/);
  });

  test('TC-AA-001: Activate Account page loads with all UI components', async () => {
    await activateAccountPage.verifyPageLoaded();
  });

  test('TC-AA-002: Page URL is correct after navigation', async ({ page }) => {
    await expect(page).toHaveURL(/\/activeteUser/);
  });

  test('TC-AA-003: All three mandatory fields display a * indicator', async ({ page }) => {
    for (const label of ['Reference ID', 'User ID', 'Date of Birth']) {
      await expect(page.getByText(`${label} *`)).toBeVisible();
    }
  });

  test('TC-AA-004: Submit button is disabled while any mandatory field is blank', async () => {
    expect(await activateAccountPage.isSubmitEnabled()).toBe(false);
  });

  test('TC-AA-005: Submit stays disabled with only one of three fields filled', async () => {
    await activateAccountPage.enterReferenceId('TESTREF123');
    expect(await activateAccountPage.isSubmitEnabled()).toBe(false);
  });

  test('TC-AA-006: Submit becomes enabled once all three fields are non-empty', async () => {
    await activateAccountPage.fillActivationForm(TEST_DATA);
    expect(await activateAccountPage.isSubmitEnabled()).toBe(true);
  });

  test('TC-AA-007: Date of Birth uses a native date picker and accepts a valid date', async () => {
    await activateAccountPage.verifyDatePicker();
    await activateAccountPage.selectDateOfBirth('2000-01-01');
    await expect(activateAccountPage.dateOfBirthInput).toHaveValue('2000-01-01');
  });

  test('TC-AA-008: Invalid User ID is rejected server-side and shows an Invalid User ID toast', async ({ page }) => {
    const activationResponse = page.waitForResponse((r) => r.url().includes('otp/request'));

    await activateAccountPage.fillActivationForm(TEST_DATA);
    await activateAccountPage.clickActivateAccount();

    const response = await activationResponse;
    expect(response.status()).toBe(200);
    await activateAccountPage.verifyToastMessage('Invalid User ID');
    await expect(page).toHaveURL(/\/activeteUser/);
  });

  test('TC-AA-009: Cancel returns to the Login page', async ({ page }) => {
    await activateAccountPage.clickCancel();
    await expect(page).toHaveURL(/\/login/);
  });

  test('TC-AA-010: Cancel works with a partially filled form', async ({ page }) => {
    await activateAccountPage.enterReferenceId('TESTREF123');
    await activateAccountPage.enterUserId('TESTUSER01');
    await activateAccountPage.clickCancel();
    await expect(page).toHaveURL(/\/login/);
  });

  test('TC-AA-011: Direct navigation / hard reload of the Activate Account URL - DEF-002', async ({ page }) => {
    // Known defect BUG-002: a hard reload of /activeteUser drops the
    // client-side route entirely and lands back on /login, losing the
    // in-progress activation flow — the same defect class found in the
    // Forgot User ID module. Still reproduces after the field-set change.
    await page.reload();
    await expect(page).toHaveURL(/\/login/);
  });

  test('TC-AA-012: Credentials and identity values never appear in the URL', async ({ page }) => {
    await activateAccountPage.fillActivationForm(TEST_DATA);
    await activateAccountPage.clickActivateAccount();
    await page.waitForTimeout(1000);

    const url = page.url();
    expect(url).not.toContain(TEST_DATA.referenceId);
    expect(url).not.toContain(TEST_DATA.userId);
  });

  test('TC-AA-013: SQL Injection payload in User ID is handled safely', async ({ page }) => {
    await activateAccountPage.fillActivationForm({ ...TEST_DATA, userId: "' OR '1'='1" });
    await activateAccountPage.clickActivateAccount();
    await page.waitForTimeout(1500);

    await expect(page).toHaveURL(/\/activeteUser/);
  });

  test('TC-AA-014: XSS payload in User ID is handled safely', async ({ page }) => {
    let dialogFired = false;
    page.on('dialog', async (dialog) => {
      dialogFired = true;
      await dialog.dismiss();
    });

    await activateAccountPage.fillActivationForm({ ...TEST_DATA, userId: '<script>alert(1)</script>' });
    await activateAccountPage.clickActivateAccount();
    await page.waitForTimeout(1500);

    expect(dialogFired).toBe(false);
    await expect(page).toHaveURL(/\/activeteUser/);
  });

  test('TC-AA-015: Rapid double-click on Submit does not double-submit - DEF-003', async ({ page }) => {
    const activationCalls: string[] = [];
    page.on('request', (r) => {
      if (r.url().includes('otp/request') && r.method() === 'POST') activationCalls.push(r.url());
    });

    await activateAccountPage.fillActivationForm(TEST_DATA);
    await activateAccountPage.clickActivateAccount();
    // Second rapid click attempt, mirroring a real impatient double-click.
    await activateAccountPage.submitButton.click({ timeout: 1000 }).catch(() => undefined);
    await page.waitForTimeout(1500);

    // Known defect BUG-003: the Submit button is never disabled while the
    // activation request is in flight, so a rapid double-click fires two
    // otp/request calls instead of one. This assertion documents the current
    // (defective) behavior so the suite fails loudly once the button gains a
    // proper in-flight-disabled state.
    expect(activationCalls.length).toBe(2);
  });

  test('TC-AA-016: Submit button re-enables after a failed activation attempt', async () => {
    await activateAccountPage.fillActivationForm(TEST_DATA);
    await activateAccountPage.clickActivateAccount();
    await activateAccountPage.verifyToastMessage('Invalid User ID');

    // The form must recover without a page refresh so the user can correct and resubmit.
    await activateAccountPage.enterUserId('CORRECTEDUSER01');
    expect(await activateAccountPage.isSubmitEnabled()).toBe(true);
  });

  test('TC-AA-017: Responsive layout on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await activateAccountPage.verifyAllFieldsVisible();
    await activateAccountPage.verifyButtons();
  });

  test('TC-AA-018: [1366x768 laptop] Submit and Cancel are fully within the viewport - BUG-005 resolved by 3-field form', async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 });

    // Previously (6-field form) this resolution clipped Submit/Cancel below
    // the fold with no scroll fallback (BUG-005). With the field set reduced
    // to Reference ID / User ID / DOB the form is short enough that both
    // buttons now fit — re-verify here so a future form-length regression is
    // caught immediately rather than assumed fixed forever.
    expect(await activateAccountPage.isWithinViewport(activateAccountPage.submitButton)).toBe(true);
    expect(await activateAccountPage.isWithinViewport(activateAccountPage.cancelButton)).toBe(true);
  });

  test('TC-AA-019: Browser Back button after Cancel returns without errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('pageerror', (err) => consoleErrors.push(err.message));

    await activateAccountPage.clickCancel();
    await expect(page).toHaveURL(/\/login/);

    await page.goBack();
    await page.waitForLoadState('domcontentloaded');

    expect(consoleErrors).toHaveLength(0);
  });

  test('TC-AA-020: [Blocked] Full activation with a fully-matching identity activates the account', async () => {
    test.skip(
      true,
      'Blocked: no Reference ID/User ID/DOB combination available in this environment that fully matches a server record on the new instance (sahyogagentweb.drutam.in:9634). Un-skip once a fully-matching data set is available.',
    );
  });
});
