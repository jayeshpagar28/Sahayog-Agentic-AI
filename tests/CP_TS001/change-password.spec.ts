import { test, expect } from '@playwright/test';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { ChangePasswordPage } from '../pages/profile/ChangePasswordPage';

test.describe('CP_TS001 - Change Password', () => {
  // Uses the authenticated storageState from auth.setup.ts (project default).
  // Every test below deliberately stops short of a fully valid current+new+confirm
  // submission, so the shared regression account's real password is never changed.

  let changePasswordPage: ChangePasswordPage;

  test.beforeEach(async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    changePasswordPage = new ChangePasswordPage(page);
    await dashboardPage.goto();
    await dashboardPage.openProfileMenu();
    await dashboardPage.clickChangePasswordMenuItem();
    await changePasswordPage.verifyLoaded();
  });

  test('TC-CP-001: Change Password page loads with all UI components', async () => {
    await changePasswordPage.verifyLoaded();
  });

  test('TC-CP-002: Page URL is correct after navigation', async ({ page }) => {
    await expect(page).toHaveURL(/\/CHANGE_PASSWORD/);
  });

  test('TC-CP-003: Cancel button is not present - BUG-CP-001', async () => {
    // Known defect BUG-CP-001 (corroborates a pre-existing exploratory finding,
    // BUG-003_missing-cancel-button-change-password.png): the story requires a
    // Cancel button alongside Submit, but the live form has none.
    expect(await changePasswordPage.hasCancelButton()).toBe(false);
  });

  test('TC-CP-004: Blank form submission shows all required-field messages', async () => {
    await changePasswordPage.clickUpdate();

    await changePasswordPage.verifyValidationMessage('Enter current password');
    await changePasswordPage.verifyValidationMessage('Enter new password');
    await changePasswordPage.verifyValidationMessage('Enter confirm password');
  });

  test('TC-CP-005: Incorrect Current Password is rejected', async () => {
    await changePasswordPage.fillChangePasswordForm('WrongCurrent123!', 'NewPass123!', 'NewPass123!');
    await changePasswordPage.clickUpdate();

    await changePasswordPage.verifyToastMessage('Incorrect current Password !');
  });

  test('TC-CP-006: New Password and Confirm Password mismatch shows validation error', async () => {
    await changePasswordPage.fillChangePasswordForm('SomeCurrent123!', 'NewPassOne123!', 'NewPassTwo123!');
    await changePasswordPage.clickUpdate();

    await changePasswordPage.verifyValidationMessage('New Password and Confirm Password do not match.');
  });

  test('TC-CP-007: SQL Injection payload in Current Password is handled safely', async ({ page }) => {
    await changePasswordPage.fillChangePasswordForm("' OR '1'='1", 'NewPass123!', 'NewPass123!');
    await changePasswordPage.clickUpdate();
    await page.waitForTimeout(1500);

    // Treated as an incorrect current password, not a SQL error.
    await changePasswordPage.verifyToastMessage('Incorrect current Password !');
    await expect(page).toHaveURL(/\/CHANGE_PASSWORD/);
  });

  test('TC-CP-008: XSS payload in New Password is handled safely', async ({ page }) => {
    let dialogFired = false;
    page.on('dialog', async (dialog) => {
      dialogFired = true;
      await dialog.dismiss();
    });

    await changePasswordPage.fillChangePasswordForm('WrongCurrent123!', '<script>alert(1)</script>', '<script>alert(1)</script>');
    await changePasswordPage.clickUpdate();
    await page.waitForTimeout(1500);

    expect(dialogFired).toBe(false);
    await expect(page).toHaveURL(/\/CHANGE_PASSWORD/);
  });

  test('TC-CP-009: Password fields are masked by default', async () => {
    for (const field of [changePasswordPage.currentPasswordInput, changePasswordPage.newPasswordInput, changePasswordPage.confirmPasswordInput]) {
      await expect(field).toHaveAttribute('type', 'password');
    }
  });

  test('TC-CP-010: Responsive layout on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await changePasswordPage.verifyLoaded();
  });

  test('TC-CP-011: [Verified live, not re-run automatically] Full password change succeeds and old password is rejected afterward', async () => {
    test.skip(
      true,
      'Already verified live on 30-Jul-2026 against a dedicated account (SMCCSW10132): Current+New+Confirm → Update Password → success + automatic logout; old password subsequently rejected, new password accepted (redirects to /HOME). Not re-run automatically because a real successful submission changes the account\'s actual password — see memory sahayog_change_password_confirmed for the confirmed data and behavior.',
    );
  });
});
