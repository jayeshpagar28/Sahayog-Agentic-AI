import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/auth/LoginPage';

test.describe('LP_TS001 - UI Validation', () => {
  // Override project-level storageState so the browser starts unauthenticated
  test.use({ storageState: { cookies: [], origins: [] } });

  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('TC-LOGIN-001: Login page loads with all UI components', async () => {
    await loginPage.verifyLoginPageLoaded();
    await expect(loginPage.forgotUserIdLink).toBeVisible();
    await expect(loginPage.activateAccountLink).toBeVisible();
  });

  test('TC-LOGIN-002: Page title and URL are correct', async ({ page }) => {
    await expect(page).toHaveTitle('Drutam Origination');
    await expect(page).toHaveURL(/\/radheAgentWeb\/login/);
  });

  test('TC-LOGIN-003: Password field is masked by default', async () => {
    expect(await loginPage.getPasswordFieldType()).toBe('password');
  });

  test('TC-LOGIN-004: Password visibility toggle shows/hides password', async () => {
    await loginPage.enterPassword('Sahayog@2025');
    expect(await loginPage.getPasswordFieldType()).toBe('password');

    await loginPage.togglePasswordVisibility();
    expect(await loginPage.getPasswordFieldType()).toBe('text');

    await loginPage.togglePasswordVisibility();
    expect(await loginPage.getPasswordFieldType()).toBe('password');
  });

  test('TC-LOGIN-009: Keyboard tab order moves through fields logically', async ({ page }) => {
    await loginPage.userIdInput.click();
    await expect(loginPage.userIdInput).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(loginPage.passwordInput).toBeFocused();
  });

  test('TC-LOGIN-020: Responsive layout on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await loginPage.verifyLoginPageLoaded();
  });
});
