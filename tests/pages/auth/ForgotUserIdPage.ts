import { type Page, type Locator, expect } from '@playwright/test';

export interface Step2VerificationData {
  referenceId: string;
  nameOfUser: string;
  dateOfBirth: string;
  employeeId: string;
  mobileNo: string;
}

export class ForgotUserIdPage {
  readonly page: Page;
  readonly logo: Locator;
  readonly heading: Locator;
  readonly instructionText: Locator;
  readonly emailInput: Locator;
  readonly sendReferenceIdButton: Locator;
  readonly cancelButton: Locator;
  readonly toast: Locator;
  readonly referenceIdInput: Locator;
  readonly nameOfUserInput: Locator;
  readonly dateOfBirthInput: Locator;
  readonly employeeIdInput: Locator;
  readonly mobileNoInput: Locator;
  readonly submitButton: Locator;
  readonly footer: Locator;

  constructor(page: Page) {
    this.page = page;
    this.logo = page.locator('img.img-fluid').first();
    this.heading = page.getByRole('heading', { name: 'Recover Your User ID' });
    this.instructionText = page.getByText('An Reference ID will be sent to your registered Email ID');
    this.emailInput = page.getByPlaceholder('Email Id');
    this.sendReferenceIdButton = page.getByRole('button', { name: 'Send Reference ID' });
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });
    this.toast = page.getByRole('alert');
    this.referenceIdInput = page.getByPlaceholder('Reference ID');
    this.nameOfUserInput = page.getByPlaceholder('Name of User');
    this.dateOfBirthInput = page.locator('input[type="date"]');
    this.employeeIdInput = page.getByPlaceholder('Employee ID');
    this.mobileNoInput = page.getByPlaceholder('Mobile No.');
    this.submitButton = page.getByRole('button', { name: 'Submit', exact: true });
    // "Powered By netwin" is baked into a single image asset, not real DOM text —
    // getByText never matches it. The image's accessible name is "Netwin Logo".
    this.footer = page.getByAltText('Netwin Logo');
  }

  async goto(): Promise<void> {
    await this.page.goto('/radheAgentWeb/forgetUser');
    await this.emailInput.waitFor({ state: 'visible' });
  }

  async verifyPageLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/radheAgentWeb\/forgetUser/);
    await expect(this.logo).toBeVisible();
    await expect(this.heading).toBeVisible();
    await expect(this.emailInput).toBeVisible();
    await expect(this.sendReferenceIdButton).toBeVisible();
    await expect(this.cancelButton).toBeVisible();
    await expect(this.footer).toBeVisible();
  }

  async enterEmail(email: string): Promise<void> {
    await this.emailInput.fill(email);
  }

  async clickSendReferenceId(): Promise<void> {
    await this.sendReferenceIdButton.click();
  }

  async sendReferenceId(email: string): Promise<void> {
    await this.enterEmail(email);
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
    await expect(this.nameOfUserInput).toBeVisible();
    await expect(this.dateOfBirthInput).toBeVisible();
    await expect(this.employeeIdInput).toBeVisible();
    await expect(this.mobileNoInput).toBeVisible();
    await expect(this.submitButton).toBeVisible();
  }

  async isEmailFieldLockedForEditing(): Promise<boolean> {
    return this.emailInput.isDisabled();
  }

  async fillStep2Verification(data: Step2VerificationData): Promise<void> {
    await this.referenceIdInput.fill(data.referenceId);
    await this.nameOfUserInput.fill(data.nameOfUser);
    await this.dateOfBirthInput.fill(data.dateOfBirth);
    await this.employeeIdInput.fill(data.employeeId);
    await this.mobileNoInput.fill(data.mobileNo);
  }

  async clickSubmitStep2(): Promise<void> {
    await this.submitButton.click();
  }

  async isSubmitStep2Enabled(): Promise<boolean> {
    return !(await this.submitButton.isDisabled());
  }
}
