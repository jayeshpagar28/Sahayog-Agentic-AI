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
    this.sendVerificationCodeButton = page.getByRole('button', { name: 'Send Verification Code' });
    // The Mobile Number field is disabled once the OTP screen appears, leaving the OTP box
    // as the only enabled input on this step — simpler and more stable than tying to the
    // "Enter OTP" heading's DOM position.
    this.otpInput = page.locator('input:not([disabled])');
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
