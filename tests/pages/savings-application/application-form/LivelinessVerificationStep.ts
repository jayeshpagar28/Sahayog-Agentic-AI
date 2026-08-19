import { type Page, type Locator, expect } from '@playwright/test';

/**
 * Liveliness Verification — module sequence 4, stepCode LIVELINESS_VERIFICATION.
 *
 * Two alternative methods; exactly one must reach "Successful" (BR-15). Neither carries a
 * mandatory marker and nothing indicates only one is needed (FR-G06).
 *
 * The link send is automated here; only the applicant's physical act — writing the security
 * code on paper and photographing themselves holding it — needs a human. Sends are capped at
 * 3 per application (BR-16).
 */
export class LivelinessVerificationStep {
  static readonly STEP_LABEL = 'Liveliness Verification';

  readonly page: Page;

  readonly securityCodeCard: Locator;
  readonly videoCard: Locator;
  readonly sendLinkButton: Locator;
  readonly successfulBadge: Locator;
  readonly pendingBadge: Locator;
  readonly stepSubmitButton: Locator;

  constructor(page: Page) {
    this.page = page;

    this.securityCodeCard = page.locator('h3', { hasText: 'Security Code Based Liveliness Verification' });
    this.videoCard = page.locator('h3', { hasText: /^Liveliness Verification$/ });
    this.sendLinkButton = page.locator('button:has-text("Send Link"):visible');
    this.successfulBadge = page.locator('button:has-text("Successful"):visible');
    this.pendingBadge = page.locator('button:has-text("Pending"):visible');
    this.stepSubmitButton = page.locator('.categorytabcontentwrap button:visible', { hasText: /^Submit$/ }).last();
  }

  /** BR-15 — both methods are offered; neither is marked mandatory. */
  async verifyBothMethodsOffered(): Promise<void> {
    await expect(this.securityCodeCard).toBeVisible();
    await expect(this.videoCard).toBeVisible();
  }

  /**
   * Opens the security-code method and sends the link. Dismisses the guidelines popup if one
   * appears — its presence varies by method.
   */
  async openSecurityCodeMethodAndSendLink(): Promise<void> {
    await this.securityCodeCard.click();
    await this.sendLinkButton.waitFor({ state: 'visible', timeout: 20000 });
    await this.sendLinkButton.click();
  }

  /** True once the applicant has completed the check on their own device. */
  async isSuccessful(): Promise<boolean> {
    return this.successfulBadge.isVisible().catch(() => false);
  }

  /**
   * Polls the live status until the applicant completes the check.
   *
   * Reloads between polls: the badge is driven by a client-side poll that does not always
   * repaint when the act happens on another device, so trusting the current DOM can wait
   * forever on an application that has already succeeded.
   */
  async waitForSuccess(timeoutMs: number, onPoll?: (elapsedSec: number) => void): Promise<void> {
    const start = Date.now();
    for (;;) {
      if (await this.isSuccessful()) return;

      if (Date.now() - start > timeoutMs) {
        throw new Error(
          `Liveliness did not reach "Successful" within ${Math.round(timeoutMs / 1000)}s. ` +
            'The applicant must complete the check on their handset.',
        );
      }

      onPoll?.(Math.round((Date.now() - start) / 1000));
      await this.page.waitForTimeout(15000);
      await this.page.reload();
      await this.page
        .locator('.categorytabcontentwrap')
        .waitFor({ state: 'visible', timeout: 30000 })
        .catch(() => undefined);
      await this.openStepIfNeeded();
    }
  }

  /** Re-opens this step after a reload, which lands on the wizard's current stage. */
  private async openStepIfNeeded(): Promise<void> {
    const tab = this.page
      .locator('#categorytab li a')
      .filter({ hasText: LivelinessVerificationStep.STEP_LABEL })
      .first();
    if (await tab.isVisible().catch(() => false)) {
      await tab.click().catch(() => undefined);
      await this.page.waitForTimeout(2000);
    }
  }

  async submitStep(): Promise<void> {
    await this.stepSubmitButton.click();
  }
}
