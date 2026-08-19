import { type Page, type Locator, expect } from '@playwright/test';

/**
 * Introducer Details — module sequence 15, stepCode INTRODUCER_DETAILS.
 *
 * The account number is resolved against the Core Banking System (BR-27).
 *
 * ⚠️ D-31: when CBS cannot resolve the account, `introducer/save/details` returns
 * HTTP 200 carrying {"msgCode":"503","msgDescr":"CBS connection error","success":"FALSE"}
 * and the UI shows **nothing at all** — no message, no highlight, not even a console error.
 * A failing test therefore looks like a hang, not a failure. Every method here asserts on
 * *advancing* (or on the response body), never on the absence of an error, and carries an
 * explicit timeout so the silent path fails fast and legibly.
 */
export class IntroducerDetailsStep {
  static readonly STEP_LABEL = 'Introducer Details';
  private static readonly ADVANCE_TIMEOUT_MS = 20000;

  readonly page: Page;

  readonly nameInput: Locator;
  readonly accountNumberInput: Locator;
  readonly periodOfAcquaintanceInput: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;

    this.nameInput = page.locator('[name="introducer_name"]');
    this.accountNumberInput = page.locator('[name="introducer_bank_acc"]');
    this.periodOfAcquaintanceInput = page.locator('[name="introducer_period"]');
    this.submitButton = page.locator('.categorytabcontentwrap button:visible', { hasText: /^Submit$/ }).last();
  }

  async fillIntroducer(name: string, accountNumber: string, period: string): Promise<void> {
    await this.nameInput.fill(name);
    await this.accountNumberInput.fill(accountNumber);
    await this.periodOfAcquaintanceInput.fill(period);
  }

  /**
   * Submits and returns the CBS response body, so a test can assert on what the server
   * actually said rather than on what the UI (does not) show.
   */
  async submitAndCaptureResponse(): Promise<Record<string, unknown>> {
    const responsePromise = this.page.waitForResponse(
      (r) => r.url().includes('introducer/save/details'),
      { timeout: IntroducerDetailsStep.ADVANCE_TIMEOUT_MS },
    );
    await this.submitButton.click();
    return (await (await responsePromise).json()) as Record<string, unknown>;
  }

  /**
   * Submits and waits for the workflow to advance to Lead Details.
   * Deliberately asserts on the *next* step appearing — with an invalid account the UI gives
   * no signal whatsoever, so absence-of-error would silently pass (D-31).
   */
  async submitAndExpectAdvance(): Promise<void> {
    await this.submitButton.click();
    await expect(
      this.page.locator('#categorytab li a').filter({ hasText: 'Lead Details' }),
      'workflow should advance to Lead Details after a valid CBS account is resolved',
    ).toBeVisible({ timeout: IntroducerDetailsStep.ADVANCE_TIMEOUT_MS });
  }

  /** True when the step did NOT advance — the only observable symptom of a CBS failure. */
  async hasStalledOnThisStep(): Promise<boolean> {
    await this.page.waitForTimeout(IntroducerDetailsStep.ADVANCE_TIMEOUT_MS / 4);
    return this.submitButton.isVisible().catch(() => false);
  }

  /** Any user-visible error at all. Currently returns false on a CBS failure — that is D-31. */
  async hasVisibleErrorMessage(): Promise<boolean> {
    return this.page
      .getByText(/error|failed|could not|invalid|not found|try again/i)
      .first()
      .isVisible({ timeout: 5000 })
      .catch(() => false);
  }

  async verifyAllMandatoryErrorsShown(): Promise<void> {
    for (const message of [
      "Introducer's Name is required",
      'Introducer Account Number is required',
      'Period of Acquaintance is required',
    ]) {
      await expect(this.page.getByText(message)).toBeVisible();
    }
  }
}
