import { type Page, type Locator, expect } from '@playwright/test';

export class MobileVerificationStep {
  readonly page: Page;
  readonly mobileNumberInput: Locator;
  readonly sendVerificationCodeButton: Locator;
  readonly otpInput: Locator;
  readonly otpSubmitButton: Locator;
  readonly changeMobileNumberLink: Locator;
  readonly otpTimerText: Locator;
  readonly applicantIdText: Locator;
  readonly invalidMobileMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.mobileNumberInput = page.locator('input[name="applicant_mobile"]');
    // Verified live on scheme 1003 (2026-08-18): this control is rendered and enabled from
    // the FIRST digit, not from 10, and is hidden only while the field is empty. US_010's
    // FR-09/AC4 claim the opposite; the live app agrees with this file. Tracked as
    // BUG-STAFF-002 — an OTP send can be attempted against a 1-digit number, consuming one
    // of only three attempts and creating a live applicant record.
    this.sendVerificationCodeButton = page.getByRole('button', { name: 'Send Verification Code' });
    // Addressed by its own name attribute (verified live: `input[name="mobotp"]`).
    //
    // This was previously `input:not([disabled])`, on the reasoning that the Mobile Number
    // field is disabled once the OTP screen appears, leaving the OTP box as the only enabled
    // input. True on the happy path — but it matches ANY enabled input otherwise, so when a
    // send fails and the page stays on the mobile form, "the OTP field is visible" passes
    // against the mobile field itself and the run fails later against an unrelated locator,
    // hiding the real cause.
    this.otpInput = page.locator('input[name="mobotp"]');
    this.otpSubmitButton = page.locator('button:has-text("Submit"):visible');
    this.changeMobileNumberLink = page.getByText('Change Mobile Number?');
    this.otpTimerText = page.getByText(/OTP has been sent on/);
    this.applicantIdText = page.locator('p', { hasText: 'Applicant Id' });
    this.invalidMobileMessage = page.getByText('Mobile Number is invalid');
  }

  async enterMobileNumber(mobileNumber: string): Promise<void> {
    await this.mobileNumberInput.fill(mobileNumber);
  }

  async clickSendVerificationCode(): Promise<void> {
    await this.sendVerificationCodeButton.click();
  }

  async verifyOtpScreenRevealed(): Promise<void> {
    await expect(this.otpInput).toBeVisible();
    await expect(this.otpTimerText).toBeVisible();
  }

  async submitOtp(otp: string): Promise<void> {
    await this.otpInput.fill(otp);
    await this.otpSubmitButton.click();
  }

  /** Only populated once Send Verification Code succeeds — the applicant record is created at that point. */
  async getApplicantId(): Promise<string> {
    const text = await this.applicantIdText.textContent();
    return text?.replace('Applicant Id', '').trim() ?? '';
  }
}
