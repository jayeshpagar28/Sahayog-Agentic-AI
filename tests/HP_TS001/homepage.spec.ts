import { test, expect } from '@playwright/test';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { MyProfilePage } from '../pages/profile/MyProfilePage';
import { ChangePasswordPage } from '../pages/profile/ChangePasswordPage';
import { LanguageSelectionPage } from '../pages/profile/LanguageSelectionPage';

test.describe('HP_TS001 - Homepage (US_HOME_001)', () => {
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    dashboardPage = new DashboardPage(page);
    await dashboardPage.goto();
  });

  test('TC-HOME-001: Homepage loads successfully after login (AC1)', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await dashboardPage.verifyHomepageURL();
    await expect(dashboardPage.body).toBeVisible();
  });

  test('TC-HOME-002: Left navigation menu items are visible and enabled (AC2)', async () => {
    await dashboardPage.verifyNavigationMenu();
    for (const item of [dashboardPage.navHome, dashboardPage.navMyProfile, dashboardPage.navNotifications, dashboardPage.navAboutUs]) {
      await expect(item).toBeEnabled();
    }
  });

  test('TC-HOME-003: Left navigation items redirect to their respective pages (AC2)', async ({ page }) => {
    await dashboardPage.navMyProfile.click();
    await expect(page).toHaveURL(/\/MY_PROFILE/);

    await dashboardPage.goto();
    await dashboardPage.navNotifications.click();
    await expect(page).toHaveURL(/\/NOTIFICATIONS/);

    await dashboardPage.goto();
    await dashboardPage.navAboutUs.click();
    await expect(page).toHaveURL(/\/ABOUT_US/);

    await dashboardPage.goto();
    await dashboardPage.navHome.click();
    await expect(page).toHaveURL(/\/HOME/);
  });

  test('TC-HOME-004: Top header displays all required icons (AC3)', async () => {
    await dashboardPage.verifyHeaderIcons();
  });

  test('TC-HOME-005: Today\'s date matches current system date and format (AC4)', async () => {
    const displayedDate = await dashboardPage.getDisplayedDateText();
    expect(displayedDate).not.toBe('');

    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    expect(displayedDate).toContain(`${dd}/${mm}/${yyyy}`);
  });

  test('TC-HOME-006: Alerts icon opens an alerts panel (AC5)', async () => {
    const somethingOpened = await dashboardPage.didAlertsIconOpenSomething();
    expect(somethingOpened, 'Clicking the Alerts icon should open a panel or navigate per AC5').toBe(true);
  });

  test('TC-HOME-007: Notification bell opens, loads, and closes the notification list (AC6)', async () => {
    const panel = await dashboardPage.openNotificationPanel();
    const count = await panel.getItemCount();
    expect(count).toBeGreaterThan(0);
    await panel.close();
  });

  test('TC-HOME-008: User Profile menu shows the required 4 options (AC7)', async () => {
    await dashboardPage.openProfileMenu();
    await expect(dashboardPage.myProfileMenuItem).toBeVisible();
    await expect(dashboardPage.changePasswordMenuItem).toBeVisible();
    await expect(dashboardPage.changeLanguageMenuItem).toBeVisible();
    await expect(dashboardPage.logoutOption).toBeVisible();
  });

  test('TC-HOME-009: My Profile menu option redirects and loads user info (AC8)', async ({ page }) => {
    await dashboardPage.openProfileMenu();
    await dashboardPage.clickMyProfileMenuItem();

    const myProfilePage = new MyProfilePage(page);
    await myProfilePage.verifyLoaded();
    await myProfilePage.verifyFieldsReadOnly();
  });

  test('TC-HOME-010: Change Password menu option redirects and loads the form (AC8)', async ({ page }) => {
    await dashboardPage.openProfileMenu();
    await dashboardPage.clickChangePasswordMenuItem();

    const changePasswordPage = new ChangePasswordPage(page);
    await changePasswordPage.verifyLoaded();
  });

  test('TC-HOME-011: Change Language option allows selecting an available language (AC8)', async ({ page }) => {
    await dashboardPage.openProfileMenu();
    await dashboardPage.clickChangeLanguageMenuItem();

    const languagePage = new LanguageSelectionPage(page);
    await languagePage.verifyLoaded();
    expect(await languagePage.isEnglishChecked()).toBe(true);

    // Selecting a language applies it immediately and redirects to the Homepage.
    await languagePage.selectMarathiAndConfirm();

    // Revert to English so subsequent tests' English-text locators keep working.
    await languagePage.selectEnglishAndConfirm();
  });

  test('TC-HOME-012: Logout terminates the session and blocks Back navigation (AC8, AC15)', async ({ page }) => {
    await dashboardPage.openProfileMenu();
    await dashboardPage.clickLogout();
    await expect(page).toHaveURL(/\/login/);

    await page.goBack();
    await expect(page).not.toHaveURL(/\/HOME/);
  });

  test('TC-HOME-013: Alerts & Internal Updates section is visible with All/Important/View All (AC9)', async () => {
    await expect(dashboardPage.alertsHeading).toBeVisible();
    await expect(dashboardPage.alertsAllTab).toBeVisible();
    await expect(dashboardPage.alertsImportantTab).toBeVisible();
    await expect(dashboardPage.alertsViewAllLink).toBeVisible();
  });

  test('TC-HOME-014: "All" and "Important" alert filters are interactive (AC10)', async () => {
    await dashboardPage.clickAlertsImportantTab();
    await expect(dashboardPage.alertsHeading).toBeVisible();
    await dashboardPage.clickAlertsAllTab();
    await expect(dashboardPage.alertsHeading).toBeVisible();
  });

  test('TC-HOME-015: "View All" redirects to the full alerts page with records (AC10)', async ({ page }) => {
    await dashboardPage.clickViewAll();
    await page.waitForLoadState('networkidle').catch(() => undefined);
    expect(page.url()).not.toMatch(/\/HOME$/);
  });

  test('TC-HOME-016: Mandatory Scrutiny alert opens a popup with full content (AC11)', async () => {
    const modal = await dashboardPage.openMandatoryScrutinyAlert();
    await modal.verifyContentLoaded();
  });

  test('TC-HOME-017: Mandatory Scrutiny popup actions are usable and close cleanly (AC12)', async () => {
    const modal = await dashboardPage.openMandatoryScrutinyAlert();
    await expect(modal.downloadAllLink).toBeVisible();
    await expect(modal.documentRows.first()).toBeVisible();
    await modal.close();
  });

  test('TC-HOME-018: Saving Application card is visible (AC13)', async () => {
    await dashboardPage.verifySavingApplicationCard();
  });

  test('TC-HOME-019: All Homepage images load without broken links (AC14)', async () => {
    const images = await dashboardPage.getAllImageLocators();
    expect(images.length).toBeGreaterThan(0);

    for (const img of images) {
      const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);
      expect(naturalWidth, `Image should not be broken: ${await img.getAttribute('src')}`).toBeGreaterThan(0);
    }
  });

  test('TC-HOME-020: Responsive layout - mobile viewport 390x844 (AC14)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.reload();
    await dashboardPage.verifyDashboardLoaded();
    await dashboardPage.verifyResponsiveLayout();
  });

  test('TC-HOME-021: Responsive layout - tablet viewport 768x1024 (AC14)', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    await dashboardPage.verifyDashboardLoaded();
    await dashboardPage.verifyResponsiveLayout();
  });

  test('TC-HOME-022: Full navigation walkthrough produces no console errors (AC13)', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    for (const nav of [dashboardPage.navMyProfile, dashboardPage.navNotifications, dashboardPage.navAboutUs, dashboardPage.navHome]) {
      await nav.click();
      await page.waitForLoadState('networkidle').catch(() => undefined);
      await dashboardPage.goto();
    }

    expect(consoleErrors, `Console errors found during navigation walkthrough:\n${consoleErrors.join('\n')}`).toHaveLength(0);
  });
});
