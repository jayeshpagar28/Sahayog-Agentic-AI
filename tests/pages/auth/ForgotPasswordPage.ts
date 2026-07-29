import { type Page, type Locator, expect } from '@playwright/test';

export interface Step2VerificationData {
  referenceId: string;
  dateOfBirth: string;
}

export class ForgotPasswordPage {
  readonly page: Page;
  readonly logo: Locator;
  readonly heading: Locator;
  readonly instructionText: Locator;
  readonly userIdInput: Locator;
  readonly sendReferenceIdButton: Locator;
  readonly cancelButton: Locator;
  readonly toast: Locator;
  readonly errorTexts: Locator;
  readonly footer: Locator;

  // Step 2 — revealed after a valid Step 1 submission (same URL, no navigation)
  readonly step2Heading: Locator;
  readonly step2InstructionText: Locator;
  readonly referenceIdInput: Locator;
  readonly dateOfBirthInput: Locator;
  readonly submitButton: Locator;

  // Step 3 — OTP verification (revealed after Step 2's Submit succeeds, navigates to /verifyOtp)
  readonly otpInstructionText: Locator;
  readonly otpInput: Locator;
  readonly resendCodeLink: Locator;
  readonly verifyButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.logo = page.locator('img.img-fluid').first();
    this.heading = page.getByRole('heading', { name: 'Reset Your Password' });
    this.instructionText = page.getByText('An Reference ID will be sent to your registered Mobile Number');
    this.userIdInput = page.locator('input[name="userId"]');
    this.sendReferenceIdButton = page.getByRole('button', { name: 'Send Reference ID' });
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });
    this.toast = page.getByRole('alert');
    this.errorTexts = page.locator('.error-text');
    this.footer = page.getByAltText('Netwin Logo');

    this.step2Heading = page.getByRole('heading', { name: 'Reset Your Password' });
    this.step2InstructionText = page.getByText('Please enter the Reference ID you received and verify your identity');
    this.referenceIdInput = page.locator('input[name="referenceId"]');
    this.dateOfBirthInput = page.locator('input[name="dob"]');
    this.submitButton = page.getByRole('button', { name: 'Submit', exact: true });

    this.otpInstructionText = page.getByText('Enter the 4-digit OTP sent to your Mobile Number');
    this.otpInput = page.getByPlaceholder('Verification Code');
    this.resendCodeLink = page.getByText(/Resend/);
    this.verifyButton = page.getByRole('button', { name: 'Verify' });
  }

  async goto(): Promise<void> {
    await this.page.goto('/forgetPassword');
    await this.userIdInput.waitFor({ state: 'visible' });
  }

  async verifyPageLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/forgetPassword/);
    await expect(this.logo).toBeVisible();
    await expect(this.heading).toBeVisible();
    await expect(this.userIdInput).toBeVisible();
    await expect(this.sendReferenceIdButton).toBeVisible();
    await expect(this.cancelButton).toBeVisible();
    await expect(this.footer).toBeVisible();
  }

  async enterUserId(userId: string): Promise<void> {
    await this.userIdInput.fill(userId);
  }

  async clearUserId(): Promise<void> {
    await this.userIdInput.fill('');
  }

  async clickSendReferenceId(): Promise<void> {
    await this.sendReferenceIdButton.click();
  }

  async sendReferenceId(userId: string): Promise<void> {
    await this.enterUserId(userId);
    await this.clickSendReferenceId();
  }

  async clickCancel(): Promise<void> {
    await this.cancelButton.click();
  }

  async isSendButtonEnabled(): Promise<boolean> {
    return !(await this.sendReferenceIdButton.isDisabled());
  }

  async verifyValidationMessage(expectedText: string): Promise<void> {
    await expect(this.page.getByText(expectedText).first()).toBeVisible();
  }

  async verifyToastMessage(expectedText: string): Promise<void> {
    await expect(this.toast).toContainText(expectedText, { timeout: 10000 });
  }

  async verifyStep2Revealed(): Promise<void> {
    await expect(this.referenceIdInput).toBeVisible({ timeout: 15000 });
    await expect(this.dateOfBirthInput).toBeVisible();
    await expect(this.submitButton).toBeVisible();
  }

  async isUserIdFieldLockedForEditing(): Promise<boolean> {
    return this.userIdInput.isDisabled();
  }

  async fillStep2Verification(data: Step2VerificationData): Promise<void> {
    await this.referenceIdInput.fill(data.referenceId);
    await this.dateOfBirthInput.fill(data.dateOfBirth);
  }

  async clickSubmit(): Promise<void> {
    await this.submitButton.click();
  }

  async isSubmitEnabled(): Promise<boolean> {
    return !(await this.submitButton.isDisabled());
  }

  async verifyOtpStepRevealed(): Promise<void> {
    await expect(this.page).toHaveURL(/\/verifyOtp/);
    await expect(this.otpInput).toBeVisible({ timeout: 15000 });
    await expect(this.verifyButton).toBeVisible();
  }

  async enterOtp(otp: string): Promise<void> {
    await this.otpInput.fill(otp);
  }

  async clickVerify(): Promise<void> {
    await this.verifyButton.click();
  }

  async submitOtp(otp: string): Promise<void> {
    await this.enterOtp(otp);
    await this.clickVerify();
  }
}
