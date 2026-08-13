import { type Page, type Locator, expect } from '@playwright/test';

export class SilverApplicationPage {
  readonly page: Page;

  // Header
  readonly applicantName: Locator;
  readonly applicantId: Locator;
  readonly productName: Locator;
  readonly schemeName: Locator;

  // Stepper (outer, top-level stages)
  readonly stepperTabs: Locator;
  readonly stepperScrollLeft: Locator;
  readonly stepperScrollRight: Locator;

  // Mobile Number Verification
  readonly mobileInput: Locator;
  readonly sendVerificationCodeButton: Locator;
  readonly otpInput: Locator;
  readonly otpSubmitButton: Locator;

  constructor(page: Page) {
    this.page = page;

    this.applicantName = page.locator('p', { hasText: 'Applicant Name' });
    this.applicantId = page.locator('p', { hasText: 'Applicant Id' });
    this.productName = page.locator('p', { hasText: 'Product Name' });
    this.schemeName = page.locator('p', { hasText: 'Scheme Name' });

    this.stepperTabs = page.locator('#categorytab li a');
    this.stepperScrollLeft = page.locator('.scroll_tab_left_button').first();
    this.stepperScrollRight = page.locator('.scroll_tab_right_button').first();

    this.mobileInput = page.locator('input[name="applicant_mobile"]');
    this.sendVerificationCodeButton = page.locator('button[type="submit"]:visible', { hasText: 'Send Verification Code' });
    this.otpInput = page.locator('input[name="mobotp"]');
    this.otpSubmitButton = page.locator('.categoryboxwrapgap button[type="submit"]', { hasText: 'Submit' });
  }

  /** Starts a brand-new application draft from the Home Dashboard, landing on Mobile Number Verification. */
  async startNewApplication(): Promise<void> {
    await this.page.goto('/HOME');
    await this.page.waitForLoadState('networkidle').catch(() => undefined);
    await this.page.getByRole('button', { name: 'Savings Application' }).click();
    await this.page.waitForURL(/\/UNPOSTED/);
    await this.page.getByText('New Application', { exact: true }).click();
    await this.page.waitForURL(/\/schemelist/);
    await this.page.locator('.col-xl-5.buttons-column button.btn').first().waitFor({ state: 'visible', timeout: 15000 });
    await this.page.locator('.col-xl-5.buttons-column button.btn', { hasText: 'Silver Savings Account - 1002' }).click();
    await this.page.waitForURL(/\/applndetails/);
    await this.mobileInput.waitFor({ state: 'visible', timeout: 15000 });
  }

  /** On a freshly-started draft, only Product/Scheme Name are shown — Applicant Name/Id
   * appear later, once the application acquires a real applicationId. */
  async verifyHeaderLoaded(): Promise<void> {
    await expect(this.productName).toBeVisible();
    await expect(this.schemeName).toContainText('Silver Savings Account - 1002');
  }

  async fillMobileNumber(value: string): Promise<void> {
    await this.mobileInput.fill(value);
  }

  async isSendVerificationCodeVisible(): Promise<boolean> {
    return this.sendVerificationCodeButton.isVisible().catch(() => false);
  }

  async clickSendVerificationCode(): Promise<void> {
    await this.sendVerificationCodeButton.click();
  }

  async getPanelText(): Promise<string> {
    return (await this.page.locator('.categorytabcontentwrap').innerText()).trim();
  }

  /** Returns the visible text of every stepper tab, in order. */
  async getStepperTabLabels(): Promise<string[]> {
    return this.stepperTabs.allTextContents();
  }

  stepperTab(label: string): Locator {
    return this.stepperTabs.filter({ hasText: label });
  }

  async isStepperTabDisabled(label: string): Promise<boolean> {
    const style = await this.stepperTab(label).first().getAttribute('style');
    return !!style && /color:\s*rgb\(189,\s*189,\s*189\)/.test(style);
  }

  async clickStepperTab(label: string): Promise<void> {
    await this.stepperTab(label).first().click();
  }

  async verifyResponsiveLayout(): Promise<void> {
    const bodyWidth = await this.page.evaluate(() => document.documentElement.scrollWidth);
    const viewportWidth = await this.page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 1);
  }
}
