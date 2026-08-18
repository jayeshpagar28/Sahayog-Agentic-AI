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

  /** Home -> Savings Application -> New Application -> Scheme Selection -> /applndetails. */
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
