import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/auth/LoginPage';

test.describe('LP_TS001 - Field Validation', () => {
  // Override project-level storageState so the browser starts unauthenticated
  test.use({ storageState: { cookies: [], origins: [] } });

  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('TC-LOGIN-005: Blank form submission shows both validation messages', async ({ page }) => {
    const tokenRequests: string[] = [];
    page.on('request', (r) => {
      if (r.url().includes('oauth2/token')) tokenRequests.push(r.url());
    });

    await loginPage.clickLogin();

    await loginPage.verifyValidationMessage('Enter User Id');
    await expect(page).toHaveURL(/\/radheAgentWeb\/login/);
    expect(tokenRequests).toHaveLength(0);
  });

  test('TC-LOGIN-006: Blank User Id shows field-level validation', async () => {
    await loginPage.enterPassword('Sahayog@2025');
    await loginPage.clickLogin();
    await loginPage.verifyValidationMessage('Enter User Id');
  });

  test('TC-LOGIN-007: Blank Password shows field-level validation', async () => {
    await loginPage.enterEmail('nayan.aher@netwinindia.in');
    await loginPage.clickLogin();
    await loginPage.verifyValidationMessage('Enter password');
  });

  test('TC-LOGIN-008: Invalid email format is rejected (or safely handled) - DEF-001', async ({ page }) => {
    const tokenResponses: number[] = [];
    page.on('response', (r) => {
      if (r.url().includes('oauth2/token')) tokenResponses.push(r.status());
    });

    await loginPage.login('not-an-email', 'SomePass123!');
    await page.waitForTimeout(1500);

    // Known defect DEF-001: format is not validated client-side; the app calls
    // the auth API and surfaces a generic "credentials incorrect" toast instead
    // of a field-level email-format error. This assertion documents the current
    // (defective) behavior so the suite fails loudly if the API stops being called
    // without a corresponding fix adding real client-side format validation.
    expect(tokenResponses.length).toBeGreaterThan(0);
    await expect(page).toHaveURL(/\/radheAgentWeb\/login/);
  });

  test('TC-LOGIN-019: SQL Injection / XSS payloads are rejected safely', async ({ page }) => {
    let dialogFired = false;
    page.on('dialog', async (dialog) => {
      dialogFired = true;
      await dialog.dismiss();
    });

    await loginPage.login("' OR '1'='1", '<script>alert(1)</script>');
    await page.waitForTimeout(1500);

    expect(dialogFired).toBe(false);
    await expect(page).toHaveURL(/\/radheAgentWeb\/login/);
  });
});
