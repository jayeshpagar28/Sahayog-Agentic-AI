import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/auth/LoginPage';
import { DashboardPage } from '../pages/dashboard/DashboardPage';

const VALID_USER_ID = process.env.SAHAYOG_USER_ID || 'nayan.aher@netwinindia.in';
const VALID_PASSWORD = process.env.SAHAYOG_PASSWORD || 'Sahayog@2025';

test.describe('LP_TS001 - Login Functionality', () => {
  // Override project-level storageState so the browser starts unauthenticated
  test.use({ storageState: { cookies: [], origins: [] } });

  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('TC-LOGIN-010: Enter key on password field submits the form', async ({ page }) => {
    await loginPage.submitWithEnterKey(VALID_USER_ID, VALID_PASSWORD);
    await page.waitForURL(/\/HOME/);

    const dashboardPage = new DashboardPage(page);
    await dashboardPage.verifyDashboardLoaded();
  });

  test('TC-LOGIN-011: Successful login with valid credentials', async ({ page }) => {
    const apiResponses: Record<string, number> = {};
    page.on('response', (r) => {
      if (r.url().includes('/user/data') || r.url().includes('/sidemenu/list')) {
        apiResponses[r.url()] = r.status();
      }
    });

    await loginPage.login(VALID_USER_ID, VALID_PASSWORD);
    await page.waitForURL(/\/HOME/);

    const dashboardPage = new DashboardPage(page);
    await dashboardPage.verifyDashboardLoaded();

    for (const status of Object.values(apiResponses)) {
      expect(status).toBe(200);
    }
  });

  test('TC-LOGIN-013: Invalid password shows generic non-sensitive error', async () => {
    await loginPage.login(VALID_USER_ID, 'WrongPass123!');

    await loginPage.verifyToastMessage('The password you entered is incorrect');
    await expect(loginPage.page).toHaveURL(/\/login/);
    expect(await loginPage.getPasswordFieldType()).toBe('password');
  });

  test('TC-LOGIN-014: Login button is non-interactive while auth request is in flight', async () => {
    await loginPage.enterEmail(VALID_USER_ID);
    await loginPage.enterPassword(VALID_PASSWORD);

    const clickPromise = loginPage.clickLogin();
    // The app blocks re-clicks via a full-page loading overlay rather than
    // disabling the button itself — assert the overlay appears during the request.
    await expect(loginPage.loadingOverlay).toBeVisible();
    await clickPromise;
  });

  test('TC-LOGIN-015: Forgot Password link is visible and clickable', async () => {
    await expect(loginPage.forgotPasswordLink).toBeVisible();
    await expect(loginPage.forgotPasswordLink).toBeEnabled();
    await loginPage.clickForgotPassword();
  });

  test('TC-LOGIN-016: Credentials never appear in the URL', async ({ page }) => {
    await loginPage.login(VALID_USER_ID, VALID_PASSWORD);
    await page.waitForURL(/\/HOME/);

    expect(page.url()).not.toContain(VALID_USER_ID);
    expect(page.url()).not.toContain(VALID_PASSWORD);
  });

  test('TC-LOGIN-018: Rapid double-click on Login does not double-submit', async ({ page }) => {
    const tokenRequests: string[] = [];
    page.on('request', (r) => {
      if (r.url().includes('oauth2/token')) tokenRequests.push(r.url());
    });

    await loginPage.enterEmail(VALID_USER_ID);
    await loginPage.enterPassword(VALID_PASSWORD);
    await loginPage.clickLogin();
    // Second click attempt while the loading overlay is up should be blocked
    // by the app itself (overlay intercepts pointer events) rather than fired.
    await loginPage.loginButton.click({ timeout: 1000 }).catch(() => undefined);
    await page.waitForURL(/\/HOME/);

    expect(tokenRequests.length).toBeLessThanOrEqual(1);
  });
});
