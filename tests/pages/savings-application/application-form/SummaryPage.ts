import { type Page, type Locator, expect } from '@playwright/test';

/**
 * Summary / Review screen — the final screen before submission.
 *
 * ⚠️ SUBMISSION IS IRREVERSIBLE. `submitApplication()` finalises the account-opening request
 * and cannot be undone (Cancel is the only exit and is itself one-way). It exists because the
 * account-creation journey deliberately completes the application end to end, per an explicit
 * product-owner decision; it is called ONLY from staff-account-creation.spec.ts, which creates
 * a fresh application each run. Never call it against a seed or an application you did not
 * create this run.
 *
 * Verified live on SAH-1003-818 (2026-08-19): Submit fires `POST app/summary/submit`, returns
 * `{"msgCode":"ENDMOD_200","success":"TRUE"}`, shows NO confirmation dialog (confirming D-43),
 * redirects to `/UNPOSTED`, and moves the application from Pending to Submitted.
 *
 * The Summary IS a workflow step server-side (stepCode SUMMARY, module sequence 17) — this
 * corrects US_010 FR-59, which states otherwise.
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

  /**
   * ⚠️ IRREVERSIBLE — finalises the application.
   *
   * Clicks Submit and returns the `app/summary/submit` response body. The submission succeeds
   * on `success: "TRUE"` / `msgCode: "ENDMOD_200"`; there is no confirmation dialog to handle.
   * On success the app redirects to `/UNPOSTED` and the application becomes Submitted.
   *
   * Only staff-account-creation.spec.ts may call this, and only on the application it created
   * this run.
   */
  async submitApplication(): Promise<{ success: string; msgCode: string; msgDescr: string }> {
    const responsePromise = this.page.waitForResponse(
      (r) => r.url().includes('app/summary/submit'),
      { timeout: 60000 },
    );

    await this.submitButton.click();

    const response = await responsePromise;
    const body = (await response.json()) as { resultVO?: Record<string, unknown> };
    const result = (body.resultVO ?? {}) as Record<string, unknown>;

    return {
      success: String(result.success ?? ''),
      msgCode: String(result.msgCode ?? ''),
      msgDescr: String(result.msgDescr ?? ''),
    };
  }
}
