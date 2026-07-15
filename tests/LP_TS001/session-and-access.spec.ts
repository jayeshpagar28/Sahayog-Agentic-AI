import { test, expect } from '@playwright/test';
import { DashboardPage } from '../pages/dashboard/DashboardPage';

test.describe('LP_TS001 - Session Persistence', () => {
  // Uses the authenticated storageState from auth.setup.ts (project default)

  test('TC-LOGIN-012: Session persists after page refresh post-login', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.goto();
    await dashboardPage.verifyDashboardLoaded();

    await page.reload();

    await dashboardPage.verifyDashboardLoaded();
  });
});

test.describe('LP_TS001 - Unauthorized Access', () => {
  // Override project-level storageState so the browser starts unauthenticated
  test.use({ storageState: { cookies: [], origins: [] } });

  test('TC-LOGIN-017: Unauthenticated direct navigation to dashboard is blocked', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.goto();

    await dashboardPage.verifyRedirectedToLogin();
  });
});
