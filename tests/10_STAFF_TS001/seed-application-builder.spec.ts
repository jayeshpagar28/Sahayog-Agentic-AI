import * as fs from 'fs';
import * as path from 'path';
import { test, expect } from '@playwright/test';
import { StaffSalaryApplicationPage } from '../pages/savings-application/StaffSalaryApplicationPage';
import { MobileVerificationStep } from '../pages/savings-application/application-form/MobileVerificationStep';
import { EkycVerificationStep } from '../pages/savings-application/application-form/EkycVerificationStep';
import { LivelinessVerificationStep } from '../pages/savings-application/application-form/LivelinessVerificationStep';

/**
 * Builds (or resumes) the STAFF_TS001 seed application through the three human gates.
 *
 * ## What is automated vs. what a person must do
 *
 * Everything in the BROWSER is automated — opening cards, clicking "Send Link", submitting
 * each step, and advancing the wizard. The operator never has to see or touch the browser
 * window, which matters because a headed window driven by Playwright is easy to lose behind
 * other windows.
 *
 * A person is needed for exactly three things, none of which happen on this machine:
 *   1. Read the SMS OTP off the handset and hand it back (via the signal file).
 *   2. Grant Aadhaar document access in DigiLocker, on the handset.
 *   3. Perform the liveliness check — write the security code on paper and photograph it.
 *
 * For 2 and 3 the test does not ask for confirmation at all: it **polls the application's own
 * status** until the card reads "Successful". That removes the class of failure where a human
 * says "done" but the workflow never actually advanced.
 *
 * ## Resuming
 *
 * A mobile number may only have ONE application in process — a second attempt is rejected with
 * "Mobile verification request is already in process !". So a half-built seed cannot simply be
 * rebuilt: set `STAFF_RESUME_ID` to continue the existing one instead of creating a new record.
 *
 * ## Safety
 *
 * Creates a real application and sends real SMS. Each gate is capped at 3 attempts. It stops
 * at Address Details and never approaches the Summary's Submit.
 *
 * Run:
 *   STAFF_SEED_MOBILE=<10-digit> npm run staff:seed
 *   STAFF_RESUME_ID=SAH-1003-nnn npm run staff:seed     # continue a half-built seed
 */
function waitForSignalFile(filePath: string, timeoutMs: number): Promise<string> {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const poll = (): void => {
      if (fs.existsSync(filePath)) {
        const value = fs.readFileSync(filePath, 'utf8').trim();
        fs.unlinkSync(filePath);
        resolve(value);
        return;
      }
      if (Date.now() - start > timeoutMs) {
        reject(new Error(`Timed out after ${Math.round(timeoutMs / 1000)}s waiting for ${filePath}`));
        return;
      }
      setTimeout(poll, 2000);
    };
    poll();
  });
}

const banner = (title: string, lines: string[]): void => {
  const rule = '='.repeat(78);
  console.log(`\n${rule}\n  ${title}\n${rule}`);
  lines.forEach((l) => console.log(`  ${l}`));
  console.log(`${rule}\n`);
};

test.describe('STAFF_TS001 - Seed Application Builder (manual utility)', () => {
  // CI is the only skip: the gates need live human input on a real handset.
  test.skip(!!process.env.CI, 'Manually-assisted seed builder — three human gates, not runnable unattended in CI');

  test('Build a fresh 1003 seed through Mobile Verification, eKYC and Liveliness', async ({ page }) => {
    test.setTimeout(50 * 60 * 1000);

    const mobileNumber = process.env.STAFF_SEED_MOBILE;
    const resumeId = process.env.STAFF_RESUME_ID;

    if (!mobileNumber && !resumeId) {
      throw new Error(
        'Set STAFF_SEED_MOBILE to a handset you control (this sends real SMS), or STAFF_RESUME_ID ' +
          'to continue an application that already exists.',
      );
    }

    const staffPage = new StaffSalaryApplicationPage(page);
    const mobileStep = new MobileVerificationStep(page);
    const ekyc = new EkycVerificationStep(page);
    const liveliness = new LivelinessVerificationStep(page);

    let applicantId = resumeId ?? '';

    // ---- Gate 1: SMS OTP -----------------------------------------------------------------
    if (resumeId) {
      await staffPage.resumeApplication(resumeId);
      console.log(`Resumed ${resumeId} — ${await staffPage.describeProgress()}`);
    } else {
      await staffPage.startNewApplication();
      await mobileStep.enterMobileNumber(mobileNumber as string);
      await mobileStep.clickSendVerificationCode();

      // Surface the real cause rather than failing later on an unrelated locator: a number that
      // already owns an in-process application is rejected outright here.
      const blocked = await page
        .getByText(/already in process/i)
        .first()
        .isVisible({ timeout: 8000 })
        .catch(() => false);
      if (blocked) {
        throw new Error(
          `Mobile ${mobileNumber} already has an application in process — the server refuses a ` +
            'second one. Resume it with STAFF_RESUME_ID=<its applicant id>, or use another handset.',
        );
      }

      await expect(mobileStep.otpInput, 'the OTP field should appear after a successful send').toBeVisible({
        timeout: 30000,
      });

      applicantId = await mobileStep.getApplicantId();
      banner(`SEED CREATED: ${applicantId}`, [`Set STAFF_MUTABLE_SEED_ID=${applicantId} when this finishes.`]);

      const otpSignal = path.join(process.cwd(), '.staff-otp-input.txt');
      if (fs.existsSync(otpSignal)) fs.unlinkSync(otpSignal);
      banner('GATE 1 of 3 — SMS OTP', [
        `An OTP has been sent to ${mobileNumber}.`,
        `Write the code to: ${otpSignal}`,
        'Nothing else is needed — the browser is driven automatically.',
      ]);

      const otp = await waitForSignalFile(otpSignal, 12 * 60 * 1000);
      await mobileStep.submitOtp(otp);
    }

    // 1003 has no Account Type step — a verified OTP advances straight to eKYC (AC6/BR-03).
    await staffPage.waitForStepToAppear('eKYC Verification', 120000);
    console.log('✔ Gate 1 cleared. Advanced directly to eKYC Verification (no Account Type step).');

    // ---- Gate 2: DigiLocker consent ------------------------------------------------------
    await staffPage.openStep('eKYC Verification');

    if (await ekyc.digilockerStatusSuccessful.isVisible().catch(() => false)) {
      console.log('✔ Aadhaar already Successful on this application — skipping the link send.');
    } else {
      await ekyc.openAadhaarCard();
      await ekyc.sendDigilockerLink();
      banner('GATE 2 of 3 — DigiLocker consent', [
        `A consent link has been sent to ${mobileNumber ?? 'the applicant'}.`,
        'On the handset: open the link and grant Aadhaar document access.',
        'Do NOT touch the browser — this polls the application until it reads "Successful".',
      ]);

      // Poll the application's own status; no human confirmation is asked for or trusted.
      await ekyc.waitForDigilockerSuccess(25 * 60 * 1000);
    }
    console.log('✔ Aadhaar verification Successful.');

    await ekyc.clickStepSubmit();
    await staffPage.waitForStepToAppear(LivelinessVerificationStep.STEP_LABEL, 180000);
    console.log('✔ Gate 2 cleared. eKYC submitted; advanced to Liveliness Verification.');

    // ---- Gate 3: Liveliness --------------------------------------------------------------
    await staffPage.openStep(LivelinessVerificationStep.STEP_LABEL);
    await liveliness.verifyBothMethodsOffered();

    if (await liveliness.isSuccessful()) {
      console.log('✔ Liveliness already Successful on this application — skipping the link send.');
    } else {
      await liveliness.openSecurityCodeMethodAndSendLink();
      banner('GATE 3 of 3 — Liveliness check', [
        'A liveliness link has been sent to the handset.',
        'The applicant must write the security code on paper and photograph themselves holding it.',
        'Do NOT touch the browser — this polls until the card reads "Successful".',
      ]);

      await liveliness.waitForSuccess(25 * 60 * 1000, (elapsed) =>
        console.log(`  …still waiting for the liveliness check (${elapsed}s elapsed)`),
      );
    }
    console.log('✔ Liveliness Successful.');

    await liveliness.submitStep();
    await staffPage.waitForStepToAppear('Address Details', 180000);

    if (!applicantId) applicantId = await staffPage.getApplicantId();

    banner('SEED READY', [
      `Applicant Id : ${applicantId}`,
      'Parked on    : Address Details — all three human gates cleared',
      '',
      'Next:',
      `  STAFF_MUTABLE_SEED_ID=${applicantId} npm run staff:journey`,
      '',
      '⚠️  Never submit or cancel this application.',
    ]);
  });
});
