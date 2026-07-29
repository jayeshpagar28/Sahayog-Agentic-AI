import { type Page, type Locator, expect } from '@playwright/test';
import { NotificationPanel } from './NotificationPanel';
import { MandatoryScrutinyModal } from './MandatoryScrutinyModal';

export class DashboardPage {
  readonly page: Page;
  readonly body: Locator;

  // Header
  readonly dateBadge: Locator;
  readonly alertsBellIcon: Locator;
  readonly alertsCountBadge: Locator;
  readonly notificationBellIcon: Locator;
  readonly userAvatar: Locator;
  readonly profileDropdown: Locator;
  readonly logoutOption: Locator;
  readonly myProfileMenuItem: Locator;
  readonly changePasswordMenuItem: Locator;
  readonly changeLanguageMenuItem: Locator;

  // Sidebar navigation
  readonly sidebar: Locator;
  readonly navHome: Locator;
  readonly navMyProfile: Locator;
  readonly navNotifications: Locator;
  readonly navAboutUs: Locator;
  readonly logoSlot: Locator;
  readonly netwinLogo: Locator;
  readonly sahayogLogo: Locator;
  readonly governmentLogo: Locator;

  // Dashboard area
  readonly alertsHeading: Locator;
  readonly alertsAllTab: Locator;
  readonly alertsImportantTab: Locator;
  readonly alertsViewAllLink: Locator;
  readonly alertCards: Locator;
  readonly savingsApplicationCard: Locator;
  readonly footer: Locator;
  readonly footerCopyright: Locator;
  readonly mandatoryScrutinyAlertItem: Locator;

  constructor(page: Page) {
    this.page = page;
    this.body = page.locator('body');

    this.dateBadge = page.locator('nav.navbar').getByText(/\d{2}\/\d{2}\/\d{4}/);
    this.alertsBellIcon = page.locator('a.fn-top-notification[title="Alerts"]');
    this.alertsCountBadge = this.alertsBellIcon.locator('span');
    this.notificationBellIcon = page.locator('a.fn-top-notification[title="Notification"]');
    this.userAvatar = page.locator('.fn-userbox');
    this.profileDropdown = page.locator('.profile-notification');
    this.logoutOption = page.locator('.dropdown-item.logout');
    this.myProfileMenuItem = page.locator('.dropdown-item.use-account-list', { hasText: 'My Profile' });
    this.changePasswordMenuItem = page.locator('.dropdown-item.use-account-list', { hasText: 'Change Password' });
    this.changeLanguageMenuItem = page.locator('.dropdown-item.use-account-list', { hasText: 'Change Language' });

    this.sidebar = page.locator('#am-sidebar');
    this.navHome = this.sidebar.locator('.nav-link', { hasText: 'Home' });
    this.navMyProfile = this.sidebar.locator('.nav-link', { hasText: 'My Profile' });
    this.navNotifications = this.sidebar.locator('.nav-link', { hasText: 'Notifications' });
    this.navAboutUs = this.sidebar.locator('.nav-link', { hasText: 'About Us' });
    this.logoSlot = page.locator('a.navbar-brand.am-logo-wrap');
    this.netwinLogo = page.locator('img[alt="Netwin Logo"]');
    this.sahayogLogo = page.locator('img[alt*="SAHAYOG" i]');
    this.governmentLogo = page.locator('img[alt*="Government" i], img[alt*="Govt" i]');

    this.alertsHeading = page.getByRole('heading', { name: 'Alerts & Internal Updates' });
    this.alertsAllTab = page.locator('.alerts-updates-col').getByText('All', { exact: true });
    this.alertsImportantTab = page.locator('.alerts-updates-col').getByText('Important', { exact: true });
    this.alertsViewAllLink = page.getByText('View All');
    this.alertCards = page.locator('.alerts-updates-col .card.mb-2');
    this.savingsApplicationCard = page.getByRole('button', { name: 'Savings Application' });
    this.footer = page.locator('footer.am-footer');
    this.footerCopyright = page.locator('.am-foot-copyright');
    this.mandatoryScrutinyAlertItem = page.getByText('Mandatory Scrutiny Process for All New Applications');
  }

  async goto(): Promise<void> {
    await this.page.goto('/HOME');
  }

  async verifyDashboardLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/HOME/);
    await expect(this.body).toBeVisible();
  }

  async verifyRedirectedToLogin(): Promise<void> {
    await expect(this.page).toHaveURL(/\/login/);
  }

  async verifyHomepageURL(): Promise<void> {
    await expect(this.page).toHaveURL(/\/HOME/);
  }

  async verifyHomepageTitle(): Promise<void> {
    await expect(this.page).toHaveTitle(/.+/);
  }

  async verifyLayoutSections(): Promise<void> {
    await expect(this.page.locator('nav.navbar')).toBeVisible();
    await expect(this.sidebar).toBeVisible();
    await expect(this.alertsHeading).toBeVisible();
    await expect(this.savingsApplicationCard).toBeVisible();
    await expect(this.footer).toBeVisible();
  }

  async getDisplayedDateText(): Promise<string> {
    return (await this.dateBadge.first().textContent())?.trim() ?? '';
  }

  async verifyAlertsSection(): Promise<void> {
    await expect(this.alertsHeading).toBeVisible();
    await expect(this.alertCards.first()).toBeVisible();
  }

  async getAlertCount(): Promise<number> {
    return this.alertCards.count();
  }

  async clickAlertsImportantTab(): Promise<void> {
    await this.alertsImportantTab.click();
  }

  async clickAlertsAllTab(): Promise<void> {
    await this.alertsAllTab.click();
  }

  async verifySavingApplicationCard(): Promise<void> {
    await expect(this.savingsApplicationCard).toBeVisible();
    await expect(this.savingsApplicationCard).toBeEnabled();
  }

  async clickSavingApplicationCard(): Promise<void> {
    await this.savingsApplicationCard.click();
  }

  async getNotificationCountText(): Promise<string> {
    return (await this.alertsCountBadge.textContent())?.trim() ?? '';
  }

  async verifyBranding(): Promise<{ netwin: boolean; sahayog: boolean; government: boolean }> {
    return {
      netwin: await this.netwinLogo.first().isVisible().catch(() => false),
      sahayog: (await this.sahayogLogo.count()) > 0,
      government: (await this.governmentLogo.count()) > 0,
    };
  }

  async verifyFooter(): Promise<{ visible: boolean; hasCopyrightText: boolean }> {
    const visible = await this.footer.isVisible().catch(() => false);
    const text = (await this.footerCopyright.textContent().catch(() => ''))?.trim() ?? '';
    return { visible, hasCopyrightText: text.length > 0 };
  }

  async getAllImageLocators(): Promise<Locator[]> {
    const count = await this.page.locator('img').count();
    return Array.from({ length: count }, (_, i) => this.page.locator('img').nth(i));
  }

  async verifyNavigationMenu(): Promise<void> {
    await expect(this.navHome).toBeVisible();
    await expect(this.navMyProfile).toBeVisible();
    await expect(this.navNotifications).toBeVisible();
    await expect(this.navAboutUs).toBeVisible();
  }

  async verifyResponsiveLayout(): Promise<void> {
    const bodyWidth = await this.page.evaluate(() => document.documentElement.scrollWidth);
    const viewportWidth = await this.page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 1);
  }

  async openProfileMenu(): Promise<void> {
    await this.userAvatar.click();
    await this.profileDropdown.waitFor({ state: 'visible' });
  }

  async verifyHeaderIcons(): Promise<void> {
    await expect(this.dateBadge.first()).toBeVisible();
    await expect(this.alertsBellIcon).toBeVisible();
    await expect(this.alertsBellIcon).toBeEnabled();
    await expect(this.notificationBellIcon).toBeVisible();
    await expect(this.notificationBellIcon).toBeEnabled();
    await expect(this.userAvatar).toBeVisible();
  }

  /** Captures a snapshot of open panels/dialogs and the URL, for before/after comparison around the Alerts icon click. */
  private async capturePanelState(): Promise<{ url: string; openPanels: number }> {
    const openPanels = await this.page
      .locator('.dropdown-menu.show, .p-dialog, [role="dialog"]')
      .count();
    return { url: this.page.url(), openPanels };
  }

  async clickAlertsIcon(): Promise<void> {
    await this.alertsBellIcon.click();
  }

  /** Per AC5, clicking Alerts should open a panel or navigate. Returns whether anything observably changed. */
  async didAlertsIconOpenSomething(): Promise<boolean> {
    const before = await this.capturePanelState();
    await this.clickAlertsIcon();
    await this.page.waitForTimeout(500);
    const after = await this.capturePanelState();
    return after.url !== before.url || after.openPanels > before.openPanels;
  }

  async openNotificationPanel(): Promise<NotificationPanel> {
    await this.notificationBellIcon.click();
    const panel = new NotificationPanel(this.page, this.notificationBellIcon);
    await panel.waitForOpen();
    return panel;
  }

  async openMandatoryScrutinyAlert(): Promise<MandatoryScrutinyModal> {
    await this.mandatoryScrutinyAlertItem.click();
    const modal = new MandatoryScrutinyModal(this.page);
    await modal.waitForOpen();
    return modal;
  }

  async clickViewAll(): Promise<void> {
    await this.alertsViewAllLink.click();
  }

  async clickMyProfileMenuItem(): Promise<void> {
    await this.myProfileMenuItem.click();
  }

  async clickChangePasswordMenuItem(): Promise<void> {
    await this.changePasswordMenuItem.click();
  }

  async clickChangeLanguageMenuItem(): Promise<void> {
    await this.changeLanguageMenuItem.click();
  }

  async clickLogout(): Promise<void> {
    await this.logoutOption.click();
  }
}
