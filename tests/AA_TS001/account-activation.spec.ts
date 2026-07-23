import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/auth/LoginPage';
import { ActivateAccountPage, type ActivationData } from '../pages/auth/ActivateAccountPage';

const HAPPY_PATH_DATA: ActivationData = {
  referenceId: 'SAHA072220266054',
  userId: 'SAHAN10001',
  nameOfUser: 'Jayesh Pagar',
  dateOfBirth: '2000-12-28',
  employeeId: '201',
  mobileNo: '9511996248',
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
    await page.waitForURL(/\/radheAgentWeb\/activeteUser/);
  });

  test('TC-AA-001: Activate Account page loads with all UI components', async () => {
    await activateAccountPage.verifyPageLoaded();
  });

  test('TC-AA-002: Page URL is correct after navigation', async ({ page }) => {
    await expect(page).toHaveURL(/\/radheAgentWeb\/activeteUser/);
  });

  test('TC-AA-003: All six mandatory fields display a * indicator', async ({ page }) => {
    for (const label of ['Reference ID', 'User ID', 'Name of User', 'Date of Birth', 'Employee ID', 'Mobile No.']) {
      await expect(page.getByText(`${label} *`)).toBeVisible();
    }
  });

  test('TC-AA-004: Submit button is disabled while any mandatory field is blank', async () => {
    expect(await activateAccountPage.isSubmitEnabled()).toBe(false);
  });

  test('TC-AA-005: Submit stays disabled with only one of six fields filled', async () => {
    await activateAccountPage.enterReferenceId('TESTREF123');
    expect(await activateAccountPage.isSubmitEnabled()).toBe(false);
  });

  test('TC-AA-006: Submit becomes enabled once all six fields are non-empty', async () => {
    await activateAccountPage.fillActivationForm(HAPPY_PATH_DATA);
    expect(await activateAccountPage.isSubmitEnabled()).toBe(true);
  });

  test('TC-AA-007: Mobile No. field strips non-numeric characters client-side', async () => {
    await activateAccountPage.enterMobileNumber('abc123');
    expect(await activateAccountPage.getMobileNumberValue()).toBe('123');
  });

  test('TC-AA-008: Date of Birth uses a native date picker and accepts a valid date', async () => {
    await activateAccountPage.verifyDatePicker();
    await activateAccountPage.selectDateOfBirth('2000-12-28');
    await expect(activateAccountPage.dateOfBirthInput).toHaveValue('2000-12-28');
  });

  test('TC-AA-009: Happy-path activation with supplied positive test data - DEF-001', async ({ page }) => {
    const activationCalls: string[] = [];
    page.on('request', (r) => {
      if (r.url().includes('otp/request') && r.method() === 'POST') activationCalls.push(r.url());
    });

    await activateAccountPage.fillActivationForm(HAPPY_PATH_DATA);
    await activateAccountPage.clickActivateAccount();

    // Known defect BUG-001: the supplied happy-path Reference ID / User ID /
    // Name combination does not activate in one go — the server reports the
    // Name of User as not matching its records, even though DOB, Employee ID
    // and Mobile No. all pass. This assertion documents the current
    // (defective) behavior so the suite fails loudly the moment the mismatch
    // is fixed upstream, rather than silently staying green on a false
    // happy-path.
    await activateAccountPage.verifyValidationMessage('Value does not match with records');
    await expect(page).toHaveURL(/\/radheAgentWeb\/activeteUser/);
    expect(activationCalls.length).toBeGreaterThan(0);
  });

  test('TC-AA-010: Name-of-User mismatch is rejected with an inline, non-disclosive error', async () => {
    await activateAccountPage.fillActivationForm({
      ...HAPPY_PATH_DATA,
      nameOfUser: 'Definitely Not The Registered Name',
    });
    await activateAccountPage.clickActivateAccount();

    // AA_BR_014: the mismatch message must be generic and must not echo the
    // actual registered value back to the caller.
    const errorLocator = activateAccountPage.page.getByText('Value does not match with records');
    await expect(errorLocator).toBeVisible();
    await expect(errorLocator).toHaveText('Value does not match with records');
  });

  test('TC-AA-011: Invalid User ID is rejected server-side and shows an Invalid User ID toast', async ({ page }) => {
    const activationResponse = page.waitForResponse((r) => r.url().includes('otp/request'));

    await activateAccountPage.fillActivationForm({
      referenceId: 'TESTREF123',
      userId: 'TESTUSER01',
      nameOfUser: 'Test User',
      dateOfBirth: '2000-01-01',
      employeeId: '999',
      mobileNo: '9511996248',
    });
    await activateAccountPage.clickActivateAccount();

    const response = await activationResponse;
    expect(response.status()).toBe(200);
    await activateAccountPage.verifyToastMessage('Invalid User ID');
    await expect(page).toHaveURL(/\/radheAgentWeb\/activeteUser/);
  });

  test('TC-AA-012: Cancel returns to the Login page', async ({ page }) => {
    await activateAccountPage.clickCancel();
    await expect(page).toHaveURL(/\/radheAgentWeb\/login/);
  });

  test('TC-AA-013: Cancel works with a partially filled form', async ({ page }) => {
    await activateAccountPage.enterReferenceId('TESTREF123');
    await activateAccountPage.enterUserId('TESTUSER01');
    await activateAccountPage.clickCancel();
    await expect(page).toHaveURL(/\/radheAgentWeb\/login/);
  });

  test('TC-AA-014: Direct navigation / hard reload of the Activate Account URL - DEF-002', async ({ page }) => {
    // Known defect BUG-002: a hard reload of /radheAgentWeb/activeteUser
    // drops the client-side route entirely and lands back on /login, losing
    // the in-progress activation flow — the same defect class previously
    // found in the Forgot User ID module.
    await page.reload();
    await expect(page).toHaveURL(/\/radheAgentWeb\/login/);
  });

  test('TC-AA-015: Credentials and identity values never appear in the URL', async ({ page }) => {
    await activateAccountPage.fillActivationForm(HAPPY_PATH_DATA);
    await activateAccountPage.clickActivateAccount();
    await page.waitForTimeout(1000);

    const url = page.url();
    expect(url).not.toContain(HAPPY_PATH_DATA.referenceId);
    expect(url).not.toContain(HAPPY_PATH_DATA.nameOfUser);
    expect(url).not.toContain(HAPPY_PATH_DATA.mobileNo);
  });

  test('TC-AA-016: SQL Injection payload in Name of User is handled safely', async ({ page }) => {
    await activateAccountPage.fillActivationForm({ ...HAPPY_PATH_DATA, nameOfUser: "' OR '1'='1" });
    await activateAccountPage.clickActivateAccount();
    await page.waitForTimeout(1500);

    await expect(page).toHaveURL(/\/radheAgentWeb\/activeteUser/);
  });

  test('TC-AA-017: XSS payload in Name of User is handled safely', async ({ page }) => {
    let dialogFired = false;
    page.on('dialog', async (dialog) => {
      dialogFired = true;
      await dialog.dismiss();
    });

    await activateAccountPage.fillActivationForm({ ...HAPPY_PATH_DATA, nameOfUser: '<script>alert(1)</script>' });
    await activateAccountPage.clickActivateAccount();
    await page.waitForTimeout(1500);

    expect(dialogFired).toBe(false);
    await expect(page).toHaveURL(/\/radheAgentWeb\/activeteUser/);
  });

  test('TC-AA-018: Rapid double-click on Submit does not double-submit - DEF-004', async ({ page }) => {
    const activationCalls: string[] = [];
    page.on('request', (r) => {
      if (r.url().includes('otp/request') && r.method() === 'POST') activationCalls.push(r.url());
    });

    await activateAccountPage.fillActivationForm(HAPPY_PATH_DATA);
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

  test('TC-AA-019: Submit button re-enables after a failed activation attempt', async () => {
    await activateAccountPage.fillActivationForm(HAPPY_PATH_DATA);
    await activateAccountPage.clickActivateAccount();
    await activateAccountPage.verifyValidationMessage('Value does not match with records');

    // The form must recover without a page refresh so the user can correct and resubmit.
    await activateAccountPage.enterFullName('Corrected Name');
    expect(await activateAccountPage.isSubmitEnabled()).toBe(true);
  });

  test('TC-AA-020: Responsive layout on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await activateAccountPage.verifyAllFieldsVisible();
    await activateAccountPage.verifyButtons();
  });

  test('TC-AA-021: Browser Back button after Cancel returns without errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('pageerror', (err) => consoleErrors.push(err.message));

    await activateAccountPage.clickCancel();
    await expect(page).toHaveURL(/\/radheAgentWeb\/login/);

    await page.goBack();
    await page.waitForLoadState('domcontentloaded');

    expect(consoleErrors).toHaveLength(0);
  });

  test('TC-AA-022: [Blocked] Full activation with a fully-matching identity activates the account', async () => {
    test.skip(
      true,
      'Blocked: no Reference ID/User ID/Name/DOB/Employee ID/Mobile combination available in this environment that fully matches a server record — the supplied happy-path data mismatches on Name (BUG-001). Un-skip once a fully-matching data set is available.',
    );
  });

  // TC-AA-023 through TC-AA-027: full responsive breakpoint matrix (story
  // §17.5 requires Desktop/Laptop/Tablet/Mobile coverage). TC-AA-020 above
  // only exercised a mobile viewport, which is why the desktop/laptop
  // clipping defect (BUG-005) was missed on the first pass — Playwright's
  // toBeVisible() does not detect an ancestor's overflow:hidden clipping an
  // element below the fold, so these tests compare real bounding-box
  // coordinates against the viewport instead.
  test('TC-AA-023: [1366x768 laptop - DEF-005] Submit and Cancel are clipped with no scroll fallback', async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 });

    // Known defect BUG-005: the split-panel desktop/laptop layout wraps the
    // form in a container with overflow-y:hidden. At the single most common
    // laptop resolution, both Submit and Cancel render below the visible
    // viewport, the outer document does not scroll, and there is no
    // scrollbar anywhere to reach them — a full form-submission blocker.
    expect(await activateAccountPage.isWithinViewport(activateAccountPage.submitButton)).toBe(false);
    expect(await activateAccountPage.isWithinViewport(activateAccountPage.cancelButton)).toBe(false);
    expect(await activateAccountPage.isPageVerticallyScrollable()).toBe(false);
  });

  test('TC-AA-024: [1815x862 laptop - DEF-005] Cancel button is clipped with no scroll fallback', async ({ page }) => {
    await page.setViewportSize({ width: 1815, height: 862 });

    // Reproduces the exact resolution reported for BUG-005.
    expect(await activateAccountPage.isWithinViewport(activateAccountPage.cancelButton)).toBe(false);
    expect(await activateAccountPage.isPageVerticallyScrollable()).toBe(false);
  });

  test('TC-AA-025: [1440x900 laptop - DEF-005] Cancel button is clipped with no scroll fallback', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });

    expect(await activateAccountPage.isWithinViewport(activateAccountPage.cancelButton)).toBe(false);
    expect(await activateAccountPage.isPageVerticallyScrollable()).toBe(false);
  });

  test('TC-AA-026: [1920x1080 desktop] All fields and both buttons are fully within the viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });

    await activateAccountPage.verifyAllFieldsVisible();
    expect(await activateAccountPage.isWithinViewport(activateAccountPage.submitButton)).toBe(true);
    expect(await activateAccountPage.isWithinViewport(activateAccountPage.cancelButton)).toBe(true);
  });

  test('TC-AA-027: [1024x768 tablet landscape] Layout falls back to normal page scroll and Cancel remains reachable', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });

    // Below the ~1200px breakpoint the layout drops the overflow:hidden
    // split panel and the document itself becomes scrollable, so — unlike
    // TC-AA-023/024/025 — the button is merely below the fold, not trapped.
    expect(await activateAccountPage.isPageVerticallyScrollable()).toBe(true);
    await activateAccountPage.cancelButton.scrollIntoViewIfNeeded();
    await expect(activateAccountPage.cancelButton).toBeVisible();
  });
});
