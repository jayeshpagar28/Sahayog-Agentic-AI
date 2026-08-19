import { type Page } from '@playwright/test';
import { DashboardPage } from '../../dashboard/DashboardPage';
import { SchemeSelectionPage } from '../SchemeSelectionPage';
import { MobileVerificationStep } from './MobileVerificationStep';
import { AccountTypeStep } from './AccountTypeStep';
import { EkycVerificationStep } from './EkycVerificationStep';

export class ApplicationFormFlow {
  readonly page: Page;
  readonly mobileVerification: MobileVerificationStep;
  readonly accountType: AccountTypeStep;
  readonly ekyc: EkycVerificationStep;

  constructor(page: Page) {
    this.page = page;
    this.mobileVerification = new MobileVerificationStep(page);
    this.accountType = new AccountTypeStep(page);
    this.ekyc = new EkycVerificationStep(page);
  }

  /**
   * Home -> Savings Application -> New Application -> Scheme Selection -> /applndetails.
   *
   * Always walks the UI. `/schemelist` must never be reached by direct navigation or reload:
   * doing so renders a permanently blank page and throws
   * "Cannot read properties of null (reading 'acType')" (BUG-STAFF-002's sibling,
   * BUG-STAFF-001).
   *
   * Note for scheme 1003 (Staff Salary Account): the 1003 workflow has **no Account Type
   * step** — a verified OTP advances straight to eKYC Verification — so `this.accountType`
   * must not be driven for that scheme.
   */
  async startNewApplication(schemeName = 'Normal Savings Account - 1001'): Promise<void> {
    const dashboardPage = new DashboardPage(this.page);
    await dashboardPage.goto();
    await dashboardPage.clickSavingApplicationCard();
    await this.page.waitForURL(/\/UNPOSTED/);

    await this.page.getByText('New Application', { exact: true }).click();
    await this.page.waitForURL(/\/schemelist/);

    const schemeSelectionPage = new SchemeSelectionPage(this.page);
    await schemeSelectionPage.verifyLoaded();
    await schemeSelectionPage.clickScheme(schemeName);
    await this.page.waitForURL(/\/applndetails/);
  }

  /** Resumes an in-progress ("Sourcer Pending") application from the Savings Application
   * Dashboard instead of walking the wizard from scratch — used to pick up a seed
   * application at whatever step it was left on. */
  async resumeApplication(applicantId: string): Promise<void> {
    const dashboardPage = new DashboardPage(this.page);
    await dashboardPage.goto();
    await dashboardPage.clickSavingApplicationCard();
    await this.page.waitForURL(/\/UNPOSTED/);

    await this.page.locator(`tr:has-text("${applicantId}") svg.fa-eye`).click();
    await this.page.waitForURL(/\/applndetails/);
  }
}
