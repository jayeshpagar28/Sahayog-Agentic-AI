import { type Page, type Locator, expect } from '@playwright/test';

/**
 * Summary / Review screen — the final screen before submission.
 *
 * ⚠️ SAFETY: this page object deliberately exposes **no method that clicks Submit**, and it
 * must never gain one. Submission is irreversible, Cancel is the only exit and is itself
 * one-way, and the seed applications used by this suite carry synthetic data that must never
 * reach a real account-opening pipeline. AC22 is asserted by inspecting the gate's presence
 * and initial state (`verifyDeclarationGate`), never by operating the control.
 *
 * The Summary is not a workflow step: it has no stepCode and no stepper tab (FR-59).
 */
export class SummaryPage {
  readonly page: Page;

  readonly sectionHeadings: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;

    this.sectionHeadings = page.locator('.categorytabcontentwrap h3, .categorytabcontentwrap h4');
    // Located so its *state* can be asserted. Never clicked.
    this.submitButton = page.locator('button[type="submit"]', { hasText: 'Submit' });
  }

  /**
   * Captures the summary payload. `summaryDataJson` arrives as a JSON **string** inside the
   * JSON response, so it needs a second parse — preferred over DOM scraping for field-level
   * comparison.
   */
  async captureSummaryPayload(trigger: () => Promise<void>): Promise<Record<string, unknown>> {
    const responsePromise = this.page.waitForResponse(
      (r) => r.url().includes('app/get/aosRequest/summary') && r.status() === 200,
      { timeout: 30000 },
    );
    await trigger();
    const body = (await (await responsePromise).json()) as Record<string, unknown>;

    if (typeof body.summaryDataJson === 'string') {
      body.summaryDataJson = JSON.parse(body.summaryDataJson) as unknown;
    }
    return body;
  }

  async getSectionHeadings(): Promise<string[]> {
    return (await this.sectionHeadings.allTextContents()).map((t) => t.trim()).filter(Boolean);
  }

  async getSummaryText(): Promise<string> {
    return (await this.page.locator('.categorytabcontentwrap').innerText()).replace(/\s+/g, ' ').trim();
  }

  /**
   * AC22 / BR-31 — the final irreversible act must be gated by an explicit declaration, with
   * Submit disabled until it is accepted.
   *
   * Currently unmet (D-43): the screen carries 0 checkboxes, 0 radios and 0 inputs, and the
   * Submit control is a bare <button type="submit"> enabled from page load. Written as the
   * required behaviour so the assertion fails until the product provides the gate.
   *
   * Inspects state only — it does not click.
   */
  async verifyDeclarationGate(): Promise<void> {
    const consentControls = await this.page
      .locator('.categorytabcontentwrap input[type="checkbox"], .categorytabcontentwrap input[type="radio"]')
      .count();
    expect(consentControls, 'the Summary must carry a declaration/consent control').toBeGreaterThan(0);
    await expect(this.submitButton, 'Submit must be disabled until the declaration is accepted').toBeDisabled();
  }

  /** Whether any declaration/consent control exists at all — reported, not asserted. */
  async countConsentControls(): Promise<number> {
    return this.page
      .locator('.categorytabcontentwrap input[type="checkbox"], .categorytabcontentwrap input[type="radio"], .categorytabcontentwrap input')
      .count();
  }

  async isSubmitEnabled(): Promise<boolean> {
    return this.submitButton.isEnabled().catch(() => false);
  }

  /** AC21 / D-36 — the captured photo and signature must be visible for review. */
  async countRenderedImages(): Promise<number> {
    return this.page.locator('.categorytabcontentwrap img').count();
  }
}
