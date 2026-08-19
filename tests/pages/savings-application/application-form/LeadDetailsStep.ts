import { type Page, type Locator, expect } from '@playwright/test';

/**
 * Lead Details — module sequence 16, stepCode LEAD_DETAILS. The last step before the Summary.
 *
 * Both codes must be independently verified against the staff register before the step will
 * submit (BR-28). Two recorded behaviours shape this page object:
 *   - D-34: clicking Verify on one code **silently clears** the other. The fill/verify
 *     sequence below is therefore strictly one-at-a-time and must not be parallelised.
 *   - D-38: the same staff code is accepted for both roles, resolving to the same name twice.
 */
export class LeadDetailsStep {
  static readonly STEP_LABEL = 'Lead Details';

  readonly page: Page;

  readonly leadConverterCodeInput: Locator;
  readonly sourcerCodeInput: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;

    this.leadConverterCodeInput = page.locator('[name="lead_converter_code"]');
    this.sourcerCodeInput = page.locator('[name="lead_generator_code"]');
    this.submitButton = page.locator('.categorytabcontentwrap button:visible', { hasText: /^Submit$/ }).last();
  }

  /** The Verify/Change button belonging to one code field. */
  private verifyButtonFor(input: Locator): Locator {
    return input.locator('xpath=ancestor::*[self::div][1]').getByRole('button', {
      name: /Verify|Change/,
    });
  }

  /**
   * Fills and verifies both codes in strict sequence.
   *
   * Order matters: verifying the Lead Converter Code wipes anything already typed into
   * Sourcer Code (D-34), so the Sourcer Code is only entered *after* the first verification
   * has completed.
   */
  async verifyBothCodes(leadConverterCode: string, sourcerCode: string): Promise<void> {
    await this.leadConverterCodeInput.fill(leadConverterCode);
    await this.verifyLeadConverterCode();

    await this.sourcerCodeInput.fill(sourcerCode);
    await this.verifySourcerCode();
  }

  async verifyLeadConverterCode(): Promise<void> {
    await this.verifyButtonFor(this.leadConverterCodeInput).click();
    await expect(this.leadConverterCodeInput).toBeDisabled({ timeout: 20000 });
  }

  async verifySourcerCode(): Promise<void> {
    await this.verifyButtonFor(this.sourcerCodeInput).click();
    await expect(this.sourcerCodeInput).toBeDisabled({ timeout: 20000 });
  }

  /** The staff name a verified code resolved to, as rendered beside the field. */
  async getResolvedName(field: 'converter' | 'sourcer'): Promise<string> {
    const input = field === 'converter' ? this.leadConverterCodeInput : this.sourcerCodeInput;
    const container = input.locator('xpath=ancestor::*[self::div][1]');
    const text = await container.innerText();
    return text.match(/Name:\s*(.+)/)?.[1]?.trim() ?? '';
  }

  async getSourcerCodeValue(): Promise<string> {
    return this.sourcerCodeInput.inputValue();
  }

  async isVerified(field: 'converter' | 'sourcer'): Promise<boolean> {
    const input = field === 'converter' ? this.leadConverterCodeInput : this.sourcerCodeInput;
    return input.isDisabled().catch(() => false);
  }

  async submitAndExpectSummary(): Promise<void> {
    await this.submitButton.click();
    // The Summary is not a workflow step and has no stepper tab, so its arrival is detected
    // by the summary payload rather than by a tab appearing.
    await this.page.waitForResponse(
      (r) => r.url().includes('app/get/aosRequest/summary') && r.status() === 200,
      { timeout: 30000 },
    );
  }
}
