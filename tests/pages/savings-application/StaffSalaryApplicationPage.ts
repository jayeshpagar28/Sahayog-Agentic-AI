import { type Page, type Locator, expect } from '@playwright/test';

/**
 * Staff Salary Account - 1003 application wizard shell.
 *
 * Mirrors SilverApplicationPage / NormalApplicationPage, with two scheme-specific
 * differences that the Step 0 exploration established:
 *   - 1003 runs its own workflow definition (aosWorkflowDtlUuid ending "...stsa"), so
 *     nothing about the stage order may be inherited from 1001/1002.
 *   - 1003 has NO Account Type step. Module sequence 2 is EKYC_VERIFICATION.
 */
export class StaffSalaryApplicationPage {
  static readonly SCHEME_NAME = 'Staff Salary Account - 1003';

  /** The 12 stepper tabs 1003 renders, in order. The 13th workflow step
   * (EXISTING_CUSTOMER_DATA, sequence 3) is a system step with no tab. */
  static readonly STEPPER_TABS = [
    'Mobile Number Verification',
    'eKYC Verification',
    'Liveliness Verification',
    'Address Details',
    'Branch Selection',
    'Basic Details',
    'Salaried Information',
    'Applicant Photo',
    'Nominee Details',
    'Document Upload',
    'Introducer Details',
    'Lead Details',
  ] as const;

  readonly page: Page;

  // Header
  readonly applicantName: Locator;
  readonly applicantId: Locator;
  readonly productName: Locator;
  readonly schemeName: Locator;

  // Stepper
  readonly stepperTabs: Locator;

  // Mobile Number Verification (the only step reachable on a fresh draft)
  readonly mobileInput: Locator;
  readonly sendVerificationCodeButton: Locator;

  // Active step panel
  readonly stepPanel: Locator;

  constructor(page: Page) {
    this.page = page;

    this.applicantName = page.locator('p', { hasText: 'Applicant Name' });
    this.applicantId = page.locator('p', { hasText: 'Applicant Id' });
    this.productName = page.locator('p', { hasText: 'Product Name' });
    this.schemeName = page.locator('p', { hasText: 'Scheme Name' });

    this.stepperTabs = page.locator('#categorytab li a');

    this.mobileInput = page.locator('input[name="applicant_mobile"]');
    this.sendVerificationCodeButton = page.getByRole('button', { name: 'Send Verification Code' });

    this.stepPanel = page.locator('.categorytabcontentwrap');
  }

  /**
   * Home -> Savings Application -> New Application -> Scheme Selection -> /applndetails.
   *
   * Deliberately walks the UI rather than navigating straight to /schemelist: a direct
   * navigation or reload of that route renders a permanently blank page and throws
   * "Cannot read properties of null (reading 'acType')" (BUG-STAFF-001).
   */
  async startNewApplication(): Promise<void> {
    await this.page.goto('/HOME');
    await this.page.getByRole('button', { name: /Savings Application/ }).click();
    await this.page.waitForURL(/\/UNPOSTED/);

    await this.page.getByText('New Application', { exact: true }).click();
    await this.page.waitForURL(/\/schemelist/);

    const schemeCards = this.page.locator('.col-xl-5.buttons-column button.btn');
    // The scheme list is fetched async and renders noticeably later than the static chrome.
    await schemeCards.first().waitFor({ state: 'visible', timeout: 15000 });
    await schemeCards.filter({ hasText: StaffSalaryApplicationPage.SCHEME_NAME }).click();

    await this.page.waitForURL(/\/applndetails/);
    await this.mobileInput.waitFor({ state: 'visible', timeout: 15000 });
  }

  /** Resumes an existing application from the Savings Application Dashboard's Pending list. */
  async resumeApplication(applicantId: string): Promise<void> {
    await this.page.goto('/HOME');
    await this.page.getByRole('button', { name: /Savings Application/ }).click();
    await this.page.waitForURL(/\/UNPOSTED/);

    const row = this.page.locator(`tbody tr:has-text("${applicantId}")`);
    await row.waitFor({ state: 'visible', timeout: 15000 });
    await row.locator('svg[data-icon="eye"]').click();

    await this.page.waitForURL(/\/applndetails/);
    await this.stepperTabs.first().waitFor({ state: 'visible', timeout: 15000 });
  }

  /** True when the named application is present in the Dashboard's Pending list — the only
   * status from which an application can still be driven. Used to gate the seed-resume band. */
  async isApplicationResumable(applicantId: string): Promise<boolean> {
    await this.page.goto('/HOME');
    await this.page.getByRole('button', { name: /Savings Application/ }).click();
    await this.page.waitForURL(/\/UNPOSTED/);
    await this.page.locator('tbody tr').first().waitFor({ state: 'visible', timeout: 15000 });

    const search = this.page.getByRole('textbox', { name: /Search mobile no/ });
    await search.fill(applicantId);
    await search.press('Enter');

    return this.page
      .locator(`tbody tr:has-text("${applicantId}")`)
      .first()
      .isVisible({ timeout: 10000 })
      .catch(() => false);
  }

  /** On a fresh draft only Product/Scheme Name are shown — Applicant Name and Applicant Id
   * appear later, once the record is created on the first successful OTP send (BR-01). */
  async verifyFreshDraftHeader(): Promise<void> {
    await expect(this.productName).toContainText('Savings Account');
    await expect(this.schemeName).toContainText(StaffSalaryApplicationPage.SCHEME_NAME);
  }

  async isApplicantIdPresent(): Promise<boolean> {
    return this.applicantId.isVisible().catch(() => false);
  }

  async getApplicantId(): Promise<string> {
    const text = await this.applicantId.textContent();
    return text?.replace('Applicant Id', '').trim() ?? '';
  }

  /**
   * Waits for a stepper stage to appear, re-reading server state rather than trusting the
   * currently-rendered page.
   *
   * Needed wherever a step is advanced by a human acting out of band — the three verification
   * gates are completed on a handset, and the agent's page does not always repaint when the
   * workflow moves on. Waiting on the local DOM alone times out even though the application
   * has genuinely advanced, which is exactly how the first seed run failed.
   */
  async waitForStepToAppear(label: string, timeoutMs = 180000): Promise<void> {
    const deadline = Date.now() + timeoutMs;

    for (;;) {
      if (await this.stepperTab(label).first().isVisible().catch(() => false)) return;

      if (Date.now() > deadline) {
        throw new Error(
          `Stage "${label}" did not appear within ${Math.round(timeoutMs / 1000)}s. ` +
            `Stepper currently shows: ${(await this.getStepperTabLabels()).join(', ') || '(none)'}`,
        );
      }

      await this.page.reload();
      await this.stepperTabs.first().waitFor({ state: 'visible', timeout: 30000 }).catch(() => undefined);
    }
  }

  /** Visible text of every stepper tab, in render order. */
  async getStepperTabLabels(): Promise<string[]> {
    return (await this.stepperTabs.allTextContents()).map((t) => t.trim());
  }

  stepperTab(label: string): Locator {
    return this.stepperTabs.filter({ hasText: label });
  }

  /**
   * Whether the application has progressed far enough for a stage to exist yet.
   *
   * The wizard renders only stages already reached (AC13), so a seed parked mid-journey
   * genuinely has no tab for later steps. Specs use this to skip with an accurate reason
   * rather than fail on a missing selector — a seed that has not reached a step is a
   * precondition gap, not a defect.
   */
  async hasStep(label: string): Promise<boolean> {
    await this.stepperTabs.first().waitFor({ state: 'visible', timeout: 20000 }).catch(() => undefined);
    return this.stepperTab(label).first().isVisible().catch(() => false);
  }

  /** Human-readable description of where the seed currently sits, for skip messages. */
  async describeProgress(): Promise<string> {
    const tabs = await this.getStepperTabLabels();
    return tabs.length ? `seed has reached: ${tabs.join(' -> ')}` : 'seed exposes no stepper stages';
  }

  /**
   * Whether a step has already been submitted on this application.
   *
   * A completed step re-opens read-only with "<Stage> submitted successfully." (FR-13), so a
   * test that fills its form has nothing to fill. This is the mirror of `hasStep`: that guards
   * against a seed parked too EARLY, this against one parked too LATE.
   *
   * The two together make form-filling specs honest at any seed position — they report a
   * precondition mismatch instead of a misleading failure.
   */
  async isStepCompleted(label: string): Promise<boolean> {
    await this.openStep(label);
    const panelText = await this.getStepPanelText();
    return new RegExp(`${label}\\s+submitted successfully`, 'i').test(panelText);
  }

  async openStep(label: string): Promise<void> {
    await this.stepperTab(label).first().click();
    await this.stepPanel.waitFor({ state: 'visible', timeout: 15000 });
  }

  async getStepPanelText(): Promise<string> {
    return (await this.stepPanel.innerText()).replace(/\s+/g, ' ').trim();
  }

  /** A completed step re-opens read-only with "<Stage> submitted successfully." (FR-13). */
  async verifyStepIsReadOnly(label: string): Promise<void> {
    await this.openStep(label);
    await expect(this.stepPanel).toContainText(`${label} submitted successfully`);
    const enabled = await this.countEnabledInputs();
    expect(enabled, `${label} should expose no editable inputs once completed`).toBe(0);
  }

  /** Inputs the user can actually type into — excludes disabled and readonly fields. */
  async countEnabledInputs(): Promise<number> {
    return this.stepPanel.locator('input:not([disabled]):not([readonly]), select:not([disabled]), textarea:not([disabled]):not([readonly])').count();
  }

  async verifyResponsiveLayout(): Promise<void> {
    const bodyWidth = await this.page.evaluate(() => document.documentElement.scrollWidth);
    const viewportWidth = await this.page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 1);
  }
}
