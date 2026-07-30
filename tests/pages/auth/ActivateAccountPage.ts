import { type Page, type Locator, expect } from '@playwright/test';

export interface ActivationData {
  referenceId: string;
  userId: string;
  dateOfBirth: string;
}

export class ActivateAccountPage {
  readonly page: Page;
  readonly logo: Locator;
  readonly heading: Locator;
  readonly instructionText: Locator;
  readonly referenceIdInput: Locator;
  readonly userIdInput: Locator;
  readonly dateOfBirthInput: Locator;
  readonly submitButton: Locator;
  readonly cancelButton: Locator;
  readonly toast: Locator;
  readonly footer: Locator;

  // OTP verification step — revealed after Submit succeeds, navigates to /verifyOtp
  readonly otpInstructionText: Locator;
  readonly otpInput: Locator;
  readonly verifyButton: Locator;

  // Account Setup — revealed after OTP verification succeeds, navigates to /resetPassword
  readonly newPasswordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly saveButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.logo = page.locator('img.img-fluid').first();
    this.heading = page.getByRole('heading', { name: 'Activate Your Account' });
    this.instructionText = page.getByText('Please enter the below details.');
    this.referenceIdInput = page.getByPlaceholder('Reference ID');
    this.userIdInput = page.getByPlaceholder('User ID');
    this.dateOfBirthInput = page.locator('input[type="date"]');
    this.submitButton = page.getByRole('button', { name: 'Submit' });
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });
    this.toast = page.getByRole('alert');
    // "Powered By netwin" is baked into a single image asset, not real DOM text —
    // getByText never matches it. The image's accessible name is "Netwin Logo".
    this.footer = page.getByAltText('Netwin Logo');

    this.otpInstructionText = page.getByText('Enter the 4-digit OTP sent to your Registered Mobile Number');
    this.otpInput = page.getByPlaceholder('Verification Code');
    this.verifyButton = page.getByRole('button', { name: 'Verify' });

    this.newPasswordInput = page.locator('input[type="password"]').first();
    this.confirmPasswordInput = page.locator('input[type="password"]').nth(1);
    this.saveButton = page.getByRole('button', { name: 'Save' });
  }

  async goto(): Promise<void> {
    await this.page.goto('/activeteUser');
    await this.referenceIdInput.waitFor({ state: 'visible' });
  }

  async verifyPageLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/activeteUser/);
    await expect(this.logo).toBeVisible();
    await expect(this.heading).toBeVisible();
    await expect(this.instructionText).toBeVisible();
    await expect(this.referenceIdInput).toBeVisible();
    await expect(this.userIdInput).toBeVisible();
    await expect(this.dateOfBirthInput).toBeVisible();
    await expect(this.submitButton).toBeVisible();
    await expect(this.cancelButton).toBeVisible();
    await expect(this.footer).toBeVisible();
  }

  async enterReferenceId(referenceId: string): Promise<void> {
    await this.referenceIdInput.fill(referenceId);
  }

  async enterUserId(userId: string): Promise<void> {
    await this.userIdInput.fill(userId);
  }

  async selectDateOfBirth(isoDate: string): Promise<void> {
    await this.dateOfBirthInput.fill(isoDate);
  }

  async fillActivationForm(data: ActivationData): Promise<void> {
    await this.enterReferenceId(data.referenceId);
    await this.enterUserId(data.userId);
    await this.selectDateOfBirth(data.dateOfBirth);
  }

  async clickActivateAccount(): Promise<void> {
    await this.submitButton.click();
  }

  async clickCancel(): Promise<void> {
    await this.cancelButton.click();
  }

  async clearAllFields(): Promise<void> {
    await this.referenceIdInput.fill('');
    await this.userIdInput.fill('');
    await this.dateOfBirthInput.fill('');
  }

  async isSubmitEnabled(): Promise<boolean> {
    return !(await this.submitButton.isDisabled());
  }

  async verifyValidationMessage(expectedText: string): Promise<void> {
    await expect(this.page.getByText(expectedText).first()).toBeVisible();
  }

  async verifyToastMessage(expectedText: string): Promise<void> {
    await expect(this.toast).toContainText(expectedText, { timeout: 10000 });
  }

  async verifySuccessMessage(): Promise<void> {
    await expect(this.toast).toContainText(/activat/i, { timeout: 10000 });
  }

  async verifyPageTitle(): Promise<void> {
    await expect(this.page).toHaveTitle(/Drutam Origination/);
  }

  async verifyLogoDisplayed(): Promise<void> {
    await expect(this.logo).toBeVisible();
  }

  async verifyAllFieldsVisible(): Promise<void> {
    await expect(this.referenceIdInput).toBeVisible();
    await expect(this.userIdInput).toBeVisible();
    await expect(this.dateOfBirthInput).toBeVisible();
  }

  async verifyButtons(): Promise<void> {
    await expect(this.submitButton).toBeVisible();
    await expect(this.cancelButton).toBeVisible();
  }

  async verifyDatePicker(): Promise<void> {
    await expect(this.dateOfBirthInput).toHaveAttribute('type', 'date');
  }

  async navigateBackToLogin(): Promise<void> {
    await this.clickCancel();
    await this.page.waitForURL(/\/login/);
  }

  // Playwright's toBeVisible() only checks that an element itself renders
  // (non-empty box, not display:none/visibility:hidden) — it does NOT check
  // whether an ancestor clips it via overflow:hidden. That gap is exactly
  // what hides BUG-005 (Cancel/Submit clipped below the fold with no
  // scrollbar), so viewport-boundary checks must compare the element's own
  // bounding rect against window.innerHeight instead.
  async isWithinViewport(locator: Locator): Promise<boolean> {
    const box = await locator.boundingBox();
    if (!box) return false;
    const viewportSize = this.page.viewportSize();
    if (!viewportSize) return false;
    return box.y >= 0 && box.y + box.height <= viewportSize.height;
  }

  async isPageVerticallyScrollable(): Promise<boolean> {
    return this.page.evaluate(
      () => document.documentElement.scrollHeight > document.documentElement.clientHeight,
    );
  }

  async verifyOtpStepRevealed(): Promise<void> {
    await expect(this.page).toHaveURL(/\/verifyOtp/);
    await expect(this.otpInput).toBeVisible({ timeout: 15000 });
    await expect(this.verifyButton).toBeVisible();
  }

  async submitOtp(otp: string): Promise<void> {
    await this.otpInput.fill(otp);
    await this.verifyButton.click();
  }

  async verifyAccountSetupRevealed(): Promise<void> {
    await expect(this.page).toHaveURL(/\/resetPassword/);
    await expect(this.newPasswordInput).toBeVisible({ timeout: 15000 });
    await expect(this.confirmPasswordInput).toBeVisible();
    await expect(this.saveButton).toBeVisible();
  }

  async setNewPassword(password: string): Promise<void> {
    await this.newPasswordInput.fill(password);
    await this.confirmPasswordInput.fill(password);
    await this.saveButton.click();
  }
}
