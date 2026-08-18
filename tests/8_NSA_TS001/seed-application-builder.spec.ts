import * as fs from 'fs';
import * as path from 'path';
import { test } from '@playwright/test';
import { ApplicationFormFlow } from '../pages/savings-application/application-form/ApplicationFormFlow';

/**
 * Waits for a file to appear at `filePath`, returns its trimmed contents, then deletes it.
 * Used to hand a live human-supplied value (OTP, "DigiLocker done" confirmation) into a
 * running test — see AA_TS001/account-activation.spec.ts for the original convention.
 */
function waitForSignalFile(filePath: string, timeoutMs: number): Promise<string> {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const poll = () => {
      if (fs.existsSync(filePath)) {
        const value = fs.readFileSync(filePath, 'utf8').trim();
        fs.unlinkSync(filePath);
        resolve(value);
        return;
      }
      if (Date.now() - start > timeoutMs) {
        reject(new Error(`Timed out after ${timeoutMs}ms waiting for signal file: ${filePath}`));
        return;
      }
      setTimeout(poll, 2000);
    };
    poll();
  });
}

test.describe('NSA_TS001 - Seed Application Builder (manual utility)', () => {
  // Not a regression test — a checked-in, re-runnable utility for (re)creating the shared
  // CI seed application (see project memory: NSA CI seed strategy) whenever the current one
  // is deleted/exhausted. Requires a human to relay a real OTP and complete DigiLocker
  // consent live, so it can never run unattended.
  test.skip(!!process.env.CI, 'Manually-assisted seed-application builder — not runnable unattended in CI');

  test('Build a fresh CI seed application through Mobile Verification, Account Type, and eKYC', async ({ page }) => {
    test.setTimeout(25 * 60 * 1000);

    const MOBILE_NUMBER = '9545368828';
    const PAN_NUMBER = 'DORPA8477P';
    const PAN_DOCUMENT = path.join(process.cwd(), 'tests/fixtures/dummy-pan-card.png');

    const flow = new ApplicationFormFlow(page);
    await flow.startNewApplication('Normal Savings Account - 1001');

    // Step 1: Mobile Number Verification
    await flow.mobileVerification.enterMobileNumber(MOBILE_NUMBER);
    await flow.mobileVerification.clickSendVerificationCode();
    await flow.mobileVerification.verifyOtpScreenRevealed();

    const applicantId = await flow.mobileVerification.getApplicantId();
    console.log(`Applicant Id created: ${applicantId}`);

    const OTP_SIGNAL_FILE = path.join(process.cwd(), '.nsa-otp-input.txt');
    if (fs.existsSync(OTP_SIGNAL_FILE)) fs.unlinkSync(OTP_SIGNAL_FILE);
    console.log(`WAITING_FOR_OTP: write the code to ${OTP_SIGNAL_FILE} to continue.`);
    const otp = await waitForSignalFile(OTP_SIGNAL_FILE, 5 * 60 * 1000);
    await flow.mobileVerification.submitOtp(otp);

    // Step 2: Account Type - "Joint" is pre-selected by default, matching this seed application's intent.
    await flow.accountType.clickSubmit();

    // Step 3: eKYC Verification - Aadhaar via DigiLocker (the only mandatory method).
    await flow.ekyc.openAadhaarCard();
    await flow.ekyc.sendDigilockerLink();
    console.log(
      'WAITING_FOR_DIGILOCKER: open the link sent via SMS and complete DigiLocker consent. ' +
        'This step polls the page automatically once you finish - no signal file needed.',
    );
    await flow.ekyc.waitForDigilockerSuccess(15 * 60 * 1000);

    // Step 3b: eKYC Verification - PAN (supplementary, fully automatable with real test data).
    await flow.ekyc.openPanCard();
    await flow.ekyc.fillPanNumber(PAN_NUMBER);
    await flow.ekyc.uploadPanDocument(PAN_DOCUMENT);
    await flow.ekyc.submitPanForVerification();
    await flow.ekyc.confirmPanDetails();

    // Finalize eKYC (Aadhaar + PAN both Successful) and advance to Liveliness Verification.
    await flow.ekyc.clickStepSubmit();

    console.log(`Seed application ${applicantId} advanced through eKYC. Current URL: ${page.url()}`);
    await page.screenshot({
      path: 'screenshots/normal-application/seed-application-post-ekyc.png',
      fullPage: true,
    });
  });
});
