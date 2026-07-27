import { type Page, type Locator, expect } from '@playwright/test';

export interface Step2VerificationData {
  referenceId: string;
  userId: string;
  dateOfBirth: string;
}

export class ForgotUserIdPage {
  readonly page: Page;
  readonly logo: Locator;
  readonly heading: Locator;
  readonly instructionText: Locator;
  readonly mobileNumberInput: Locator;
  readonly sendReferenceIdButton: Locator;
  readonly cancelButton: Locator;
  readonly toast: Locator;
  readonly referenceIdInput: Locator;
  readonly userIdInput: Locator;
  readonly dateOfBirthInput: Locator;
  readonly submitButton: Locator;
  readonly footer: Locator;

  constructor(page: Page) {
    this.page = page;
    this.logo = page.locator('img.img-fluid').first();
    this.heading = page.getByRole('heading', { name: 'Recover Your User ID' });
    this.instructionText = page.getByText('An Reference ID will be sent to your registered Mobile Number');
    this.mobileNumberInput = page.getByPlaceholder('Mobile Number');
    this.sendReferenceIdButton = page.getByRole('button', { name: 'Send Reference ID' });
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });
    this.toast = page.getByRole('alert');
    this.referenceIdInput = page.getByPlaceholder('Reference ID');
    this.userIdInput = page.getByPlaceholder('User ID');
    this.dateOfBirthInput = page.locator('input[type="date"]');
    this.submitButton = page.getByRole('button', { name: 'Submit', exact: true });
    // "Powered By netwin" is baked into a single image asset, not real DOM text —
    // getByText never matches it. The image's accessible name is "Netwin Logo".
    this.footer = page.getByAltText('Netwin Logo');
  }

  async goto(): Promise<void> {
    await this.page.goto('/forgetUser');
    await this.mobileNumberInput.waitFor({ state: 'visible' });
  }

  async verifyPageLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/forgetUser/);
    await expect(this.logo).toBeVisible();
    await expect(this.heading).toBeVisible();
    await expect(this.mobileNumberInput).toBeVisible();
    await expect(this.sendReferenceIdButton).toBeVisible();
    await expect(this.cancelButton).toBeVisible();
    await expect(this.footer).toBeVisible();
  }

  async enterMobileNumber(mobileNumber: string): Promise<void> {
    await this.mobileNumberInput.fill(mobileNumber);
  }

  async clickSendReferenceId(): Promise<void> {
    await this.sendReferenceIdButton.click();
  }

  async sendReferenceId(mobileNumber: string): Promise<void> {
    await this.enterMobileNumber(mobileNumber);
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
    await expect(this.userIdInput).toBeVisible();
    await expect(this.dateOfBirthInput).toBeVisible();
    await expect(this.submitButton).toBeVisible();
  }

  async isMobileNumberFieldLockedForEditing(): Promise<boolean> {
    return this.mobileNumberInput.isDisabled();
  }

  async fillStep2Verification(data: Step2VerificationData): Promise<void> {
    await this.referenceIdInput.fill(data.referenceId);
    await this.userIdInput.fill(data.userId);
    await this.dateOfBirthInput.fill(data.dateOfBirth);
  }

  async clickSubmitStep2(): Promise<void> {
    await this.submitButton.click();
  }

  async isSubmitStep2Enabled(): Promise<boolean> {
    return !(await this.submitButton.isDisabled());
  }
}
