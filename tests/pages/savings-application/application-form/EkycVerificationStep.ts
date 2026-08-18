import { type Page, type Locator, expect } from '@playwright/test';

/**
 * Only Aadhaar Verification through DigiLocker is mandatory here — confirmed live via the
 * `aos/ekyc/get/status/dtl` API, whose `finalStatus` stays 0 until Aadhaar succeeds even if
 * PAN has already succeeded. PAN/Driving Licence/Voter Id are supplementary, not alternatives.
 * All four cards lock (become read-only) once the step is submitted, so PAN/DL/Voter Id can
 * only be exercised on an application that hasn't submitted eKYC yet.
 */
export class EkycVerificationStep {
  readonly page: Page;
  readonly aadhaarCard: Locator;
  readonly panCard: Locator;
  readonly drivingLicenceCard: Locator;
  readonly voterIdCard: Locator;
  readonly stepSubmitButton: Locator;

  // Aadhaar / DigiLocker
  readonly digilockerSendLinkButton: Locator;
  readonly digilockerCancelButton: Locator;
  readonly digilockerStatusSuccessful: Locator;

  // PAN
  readonly panNumberInput: Locator;
  readonly panFileInput: Locator;
  readonly panFirstNameField: Locator;

  // Driving Licence
  readonly drivingLicenceNumberInput: Locator;
  readonly drivingLicenceDobInput: Locator;
  readonly drivingLicenceVerifyButton: Locator;
  readonly drivingLicenceCancelButton: Locator;

  // Voter Id
  readonly voterIdNumberInput: Locator;
  readonly voterIdVerifyButton: Locator;
  readonly voterIdCancelButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.aadhaarCard = page.locator('h3', { hasText: 'Aadhaar Verification through DigiLocker' });
    this.panCard = page.locator('h3', { hasText: 'PAN Verification' });
    this.drivingLicenceCard = page.locator('h3', { hasText: 'Driving Licence Verification' });
    this.voterIdCard = page.locator('h3', { hasText: 'Voter Id Verification' });
    this.stepSubmitButton = page.locator('button:has-text("Submit"):visible');

    this.digilockerSendLinkButton = page.locator('button:has-text("Send Link"):visible');
    this.digilockerCancelButton = page.locator('.closepopupbtn:visible');
    this.digilockerStatusSuccessful = page.locator('button:has-text("Successful"):visible');

    this.panNumberInput = page.getByPlaceholder('PAN Number');
    this.panFileInput = page.locator('input[type="file"]');
    this.panFirstNameField = page.getByText('First Name', { exact: false });

    this.drivingLicenceNumberInput = page.getByPlaceholder('Enter Driving Licence Number');
    this.drivingLicenceDobInput = page.locator('input[name="dateofbirth"]');
    this.drivingLicenceVerifyButton = page.locator('button:has-text("Verify"):visible');
    this.drivingLicenceCancelButton = page.locator('button:has-text("Cancel"):visible');

    this.voterIdNumberInput = page.getByPlaceholder('Enter Voter Id Number');
    this.voterIdVerifyButton = page.locator('button:has-text("Verify"):visible');
    this.voterIdCancelButton = page.locator('button:has-text("Cancel"):visible');
  }

  async openAadhaarCard(): Promise<void> {
    await this.aadhaarCard.click();
  }

  /** Sends a real DigiLocker consent link via SMS — a human must open it and grant Aadhaar
   * document access on their end for the status to progress from Pending to Successful. */
  async sendDigilockerLink(): Promise<void> {
    await this.digilockerSendLinkButton.click();
  }

  async waitForDigilockerSuccess(timeoutMs: number): Promise<void> {
    await expect(this.digilockerStatusSuccessful).toBeVisible({ timeout: timeoutMs });
  }

  async openPanCard(): Promise<void> {
    await this.panCard.click();
  }

  async fillPanNumber(panNumber: string): Promise<void> {
    await this.panNumberInput.fill(panNumber);
  }

  async uploadPanDocument(filePath: string): Promise<void> {
    await this.panFileInput.setInputFiles(filePath);
  }

  /** PAN verification is a two-step submit: the first click runs the live NSDL-style lookup
   * and reveals a read-only confirmation screen (First Name/Middle Name/Last Name/DOB); the
   * second click (confirmPanDetails) accepts it and returns to the eKYC card list. */
  async submitPanForVerification(): Promise<void> {
    await this.stepSubmitButton.click();
    await expect(this.panFirstNameField).toBeVisible();
  }

  async confirmPanDetails(): Promise<void> {
    await this.stepSubmitButton.click();
  }

  async openDrivingLicenceCard(): Promise<void> {
    await this.drivingLicenceCard.click();
  }

  async fillDrivingLicenceDetails(licenceNumber: string, dob: string): Promise<void> {
    await this.drivingLicenceNumberInput.fill(licenceNumber);
    await this.drivingLicenceDobInput.fill(dob); // ISO yyyy-mm-dd
  }

  async clickDrivingLicenceVerify(): Promise<void> {
    await this.drivingLicenceVerifyButton.click();
  }

  async openVoterIdCard(): Promise<void> {
    await this.voterIdCard.click();
  }

  async fillVoterIdNumber(voterIdNumber: string): Promise<void> {
    await this.voterIdNumberInput.fill(voterIdNumber);
  }

  async clickVoterIdVerify(): Promise<void> {
    await this.voterIdVerifyButton.click();
  }

  /** Finalizes the whole eKYC step (requires Aadhaar to be Successful) and advances the
   * wizard to Liveliness Verification. */
  async clickStepSubmit(): Promise<void> {
    await this.stepSubmitButton.click();
  }
}
