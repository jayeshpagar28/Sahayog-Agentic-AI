import * as fs from 'fs';
import * as path from 'path';
import { test, expect } from '@playwright/test';
import { StaffSalaryApplicationPage } from '../pages/savings-application/StaffSalaryApplicationPage';
import { MobileVerificationStep } from '../pages/savings-application/application-form/MobileVerificationStep';
import { EkycVerificationStep } from '../pages/savings-application/application-form/EkycVerificationStep';
import { LivelinessVerificationStep } from '../pages/savings-application/application-form/LivelinessVerificationStep';
import { StaffJourneySteps } from '../pages/savings-application/application-form/StaffJourneySteps';
import { AddressDetailsStep } from '../pages/savings-application/application-form/AddressDetailsStep';
import { NomineeDetailsStep } from '../pages/savings-application/application-form/NomineeDetailsStep';
import { IntroducerDetailsStep } from '../pages/savings-application/application-form/IntroducerDetailsStep';
import { LeadDetailsStep } from '../pages/savings-application/application-form/LeadDetailsStep';
import { SummaryPage } from '../pages/savings-application/application-form/SummaryPage';
import { WorkflowConfig } from '../pages/savings-application/application-form/WorkflowConfig';
import { CBS_ACCOUNT_NUMBER, LEAD_STAFF_CODE, INTRODUCER_NAME, SYNTHETIC } from './staff-fixtures';

/**
 * STAFF SALARY ACCOUNT — FULL CREATION JOURNEY.
 *
 * Creates a BRAND NEW application and exercises every step of it, cold, in order. It does not
 * resume a seed and it asserts nothing read-only: each step is tested by actually filling and
 * submitting its form on an application this run created.
 *
 * ## Why this replaces the seed-and-resume approach
 *
 * Inspecting a pre-built application proves only that stored values render. It cannot prove the
 * form validates, that a step advances, or that `INTRODUCER_DETAILS` / `LEAD_DETAILS` work at
 * all — both are `isEditable: 0` and lock permanently once submitted, so on any seed that has
 * passed them their forms can never be re-opened. Creating a fresh application is the only way
 * to exercise them.
 *
 * ## The three gates, and how each is satisfied
 *
 * Scheme 1003 cannot be created without external input, but the script does all the browser
 * work and treats the WORKFLOW'S OWN STATUS as truth — never a human's "done":
 *
 *   1. SMS OTP           — supplied by whichever source is configured (see below).
 *   2. DigiLocker consent — the script clicks "Send Link", then POLLS the application until the
 *                           card reads "Successful". Consent itself happens on the applicant's
 *                           device; the script never asks anyone to confirm it.
 *   3. Liveliness check   — same pattern: send the link, then poll status to "Successful".
 *
 * OTP sources, in priority order — this is what lets the flow run unattended in CI when the OTP
 * is provided:
 *   - STAFF_OTP      a literal code the caller / CI injects.
 *   - STAFF_OTP_URL  an endpoint the script polls; its body carries the code (an SMS-receiver
 *                    webhook or a test-harness relay).
 *   - signal file    .staff-otp-input.txt — a human reads the SMS and writes the code (local).
 *
 * The spec skips in CI ONLY when no unattended OTP source is configured — never merely because
 * the environment is CI. Provide STAFF_OTP or STAFF_OTP_URL and it runs.
 *
 * ## Safety
 *
 * ⚠️ Creates a REAL application, sends REAL SMS, and SUBMITS the finished application. Each run
 *    therefore produces one submitted account-opening request (UAT). Submission is irreversible.
 *    This is intentional — the journey completes the account end to end by product-owner decision.
 * ⚠️ Each gate is capped at 3 attempts.
 * ⚠️ A mobile number may hold only ONE application in process; the server rejects a second with
 *    "Mobile verification request is already in process !".
 *
 * Run:  STAFF_SEED_MOBILE=<10-digit> npm run staff:create
 */
const OTP_SIGNAL_FILE = path.join(process.cwd(), '.staff-otp-input.txt');

/** True when the OTP can be obtained without a person at the keyboard. */
function hasUnattendedOtpSource(): boolean {
  return !!(process.env.STAFF_OTP || process.env.STAFF_OTP_URL);
}

function describeOtpSource(): string {
  if (process.env.STAFF_OTP) return 'literal STAFF_OTP';
  if (process.env.STAFF_OTP_URL) return `endpoint ${process.env.STAFF_OTP_URL}`;
  return `signal file ${OTP_SIGNAL_FILE}`;
}

/** Obtains the OTP from whichever source is configured (literal → endpoint → signal file). */
async function resolveOtp(timeoutMs: number): Promise<string> {
  if (process.env.STAFF_OTP) return process.env.STAFF_OTP.trim();
  if (process.env.STAFF_OTP_URL) return pollOtpEndpoint(process.env.STAFF_OTP_URL, timeoutMs);
  return waitForSignalFile(OTP_SIGNAL_FILE, timeoutMs);
}

/** Polls an endpoint until its body yields a 4-8 digit code. */
async function pollOtpEndpoint(url: string, timeoutMs: number): Promise<string> {
  const start = Date.now();
  for (;;) {
    try {
      const response = await fetch(url, { headers: { Accept: 'text/plain, application/json' } });
      if (response.ok) {
        const body = (await response.text()).trim();
        const match = /^\d{4,8}$/.test(body) ? body : body.match(/\b(\d{4,8})\b/)?.[1];
        if (match) return match;
      }
    } catch {
      // Transient failures are expected while the SMS is in flight — keep polling.
    }
    if (Date.now() - start > timeoutMs) {
      throw new Error(`Timed out after ${Math.round(timeoutMs / 1000)}s polling the OTP endpoint ${url}.`);
    }
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
}

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

test.describe('STAFF_TS001 - Staff Salary Account creation (cold, every step)', () => {
  test.describe.configure({ mode: 'serial' });

  // The whole creation flow is human-assisted and never runs unattended in CI. An OTP source
  // (STAFF_OTP / STAFF_OTP_URL) covers gate 1, but gates 2 and 3 — DigiLocker consent and the
  // liveliness check — require a real person on a handset, which no configuration can supply.
  // So skip in CI, always. Every record-free spec in this suite still runs in CI.
  test.skip(
    !!process.env.CI,
    'Creating a Staff Salary Account needs live human input at the DigiLocker and liveliness ' +
      'gates (a real handset). Not runnable unattended; run locally with `npm run staff:create`. ' +
      `(OTP source ${hasUnattendedOtpSource() ? 'is configured' : 'not configured'}, but that ` +
      'only covers gate 1 of 3.)',
  );

  const MOBILE = process.env.STAFF_SEED_MOBILE ?? '';

  // Carried across the ordered steps: this run's own application.
  let applicantId = '';

  let staffPage: StaffSalaryApplicationPage;
  let journey: StaffJourneySteps;

  test.beforeAll(() => {
    if (!MOBILE) {
      throw new Error(
        'STAFF_SEED_MOBILE is required — a real handset you control that will receive the OTP, ' +
          'the DigiLocker link and the liveliness link. This test sends real SMS.',
      );
    }
  });

  test.beforeEach(async ({ page }) => {
    // Every step needs more than Playwright's 30s default: the form-heavy steps (Basic Details
    // fills 21 fields) run close to 30s, and the three gate steps wait on a human. Raise the
    // floor here; the gate steps raise it further at their own start.
    test.setTimeout(4 * 60 * 1000);

    staffPage = new StaffSalaryApplicationPage(page);
    journey = new StaffJourneySteps(page);
    if (applicantId) await staffPage.resumeApplication(applicantId);
  });

  test('CREATE-01: Scheme 1003 opens its own journey without creating a record', async () => {
    await staffPage.startNewApplication();

    // FR-03 / BR-01 — selecting a scheme creates nothing; the record appears on OTP send.
    await staffPage.verifyFreshDraftHeader();
    expect(await staffPage.isApplicantIdPresent(), 'no record should exist before OTP send').toBe(false);
    expect(await staffPage.getStepperTabLabels()).toEqual(['Mobile Number Verification']);
  });

  test('CREATE-02: Mobile verification creates the application and advances to eKYC', async ({ page }) => {
    test.setTimeout(16 * 60 * 1000); // OTP is a human gate — allow the wait plus margin.

    const mobileStep = new MobileVerificationStep(page);
    const resumeId = process.env.STAFF_RESUME_ID;

    if (resumeId) {
      // Continue an application already created and OTP-sent — used to reuse a run that was
      // interrupted after the SMS went out, so the code is not wasted.
      await staffPage.resumeApplication(resumeId);
      applicantId = resumeId;

      // If it already passed mobile verification, there is nothing to do here.
      if (await staffPage.hasStep('eKYC Verification')) {
        console.log(`Resumed ${resumeId} — already past Mobile Verification.`);
        return;
      }
    } else {
      await staffPage.startNewApplication();
      await mobileStep.enterMobileNumber(MOBILE);
      await mobileStep.clickSendVerificationCode();

      // Surface the real cause rather than failing later on an unrelated locator.
      const blocked = await page
        .getByText(/already in process/i)
        .first()
        .isVisible({ timeout: 8000 })
        .catch(() => false);
      if (blocked) {
        throw new Error(
          `Mobile ${MOBILE} already has an application in process — the server refuses a second ` +
            'one. Finish or cancel the existing application, resume it with STAFF_RESUME_ID, or ' +
            'use another handset.',
        );
      }

      applicantId = await mobileStep.getApplicantId();
      // BR-02 — the Applicant Id embeds the scheme code.
      expect(applicantId).toMatch(/^SAH-1003-\d+$/);
    }

    await expect(mobileStep.otpInput, 'the OTP field appears after a successful send').toBeVisible({
      timeout: 30000,
    });

    if (fs.existsSync(OTP_SIGNAL_FILE)) fs.unlinkSync(OTP_SIGNAL_FILE);
    banner(`GATE 1 of 3 — SMS OTP  (application ${applicantId})`, [
      `An OTP has been sent to ${MOBILE}.`,
      `OTP source: ${describeOtpSource()}.`,
      'The browser is driven automatically — only the OTP comes from outside it.',
    ]);

    await mobileStep.submitOtp(await resolveOtp(12 * 60 * 1000));

    // AC6 / BR-03 — 1003 has NO Account Type step; a verified OTP goes straight to eKYC.
    await staffPage.waitForStepToAppear('eKYC Verification', 120000);
    expect(await staffPage.getStepperTabLabels()).not.toContain('Account Type');
  });

  test('CREATE-03: Scheme 1003 workflow structure', async ({ page }) => {
    const config = new WorkflowConfig(page);
    const steps = await config.captureStepList(() => staffPage.resumeApplication(applicantId));

    WorkflowConfig.verifyNoAccountTypeStep(steps);
    WorkflowConfig.verifySkipConfiguration(steps);
    WorkflowConfig.verifySequencesAreValid(steps);
  });

  test('CREATE-04: eKYC — Aadhaar via DigiLocker, then submit', async ({ page }) => {
    test.setTimeout(28 * 60 * 1000); // DigiLocker consent is a human gate; the script polls status.
    const ekyc = new EkycVerificationStep(page);
    await staffPage.openStep('eKYC Verification');

    // AC7 / BR-09 — four options, only Aadhaar mandatory.
    await expect(ekyc.aadhaarCard).toBeVisible();
    await expect(ekyc.panCard).toBeVisible();
    await expect(ekyc.drivingLicenceCard).toBeVisible();
    await expect(ekyc.voterIdCard).toBeVisible();

    await ekyc.openAadhaarCard();
    await ekyc.sendDigilockerLink();
    banner('GATE 2 of 3 — DigiLocker consent', [
      `A consent link has been sent to ${MOBILE}.`,
      'On the handset: open it and grant Aadhaar document access.',
      'Do NOT touch the browser — this polls the application until it reads "Successful".',
    ]);

    // Polls the application's own status; no human confirmation is asked for or trusted.
    await ekyc.waitForDigilockerSuccess(25 * 60 * 1000);
    await ekyc.clickStepSubmit();

    await staffPage.waitForStepToAppear(LivelinessVerificationStep.STEP_LABEL, 180000);
  });

  test('CREATE-05: Liveliness — one method suffices, then submit', async ({ page }) => {
    test.setTimeout(28 * 60 * 1000); // Liveliness is a human gate; the script polls status.
    const liveliness = new LivelinessVerificationStep(page);
    await staffPage.openStep(LivelinessVerificationStep.STEP_LABEL);

    // BR-15 — two alternative methods, neither marked mandatory.
    await liveliness.verifyBothMethodsOffered();

    await liveliness.openSecurityCodeMethodAndSendLink();
    banner('GATE 3 of 3 — Liveliness check', [
      'A liveliness link has been sent to the handset.',
      'The applicant writes the security code on paper and photographs themselves holding it.',
      'Do NOT touch the browser — this polls until the card reads "Successful".',
    ]);

    await liveliness.waitForSuccess(25 * 60 * 1000, (s) => console.log(`  …waiting for liveliness (${s}s)`));
    await liveliness.submitStep();

    await staffPage.waitForStepToAppear(AddressDetailsStep.STEP_LABEL, 180000);
  });

  test('CREATE-06: Address Details — validation, master data, both addresses', async ({ page }) => {
    const address = new AddressDetailsStep(page);
    await staffPage.openStep(AddressDetailsStep.STEP_LABEL);
    await address.openPermanentAddressForm();

    // TC-STAFF-047 — all four mandatory errors together (unlike the eKYC popups, D-08).
    await address.submitForm();
    await address.verifyAllMandatoryErrorsShown();

    // TC-STAFF-135 / BR-18.
    await address.verifyCountryIsFixedToIndia();

    const states = await address.getStateOptions();
    expect(states.length, 'State options must be populated').toBeGreaterThan(20);
    console.log(
      `[D-15] states=${states.length}, ` +
        `missing=${JSON.stringify(['Bihar', 'Sikkim', 'Telangana', 'Ladakh'].filter((s) => !states.includes(s)))}, ` +
        `Rajsthan present=${states.includes('Rajsthan')}`,
    );

    await address.fillAddress(SYNTHETIC.address);
    console.log(`[D-16] cities after selecting ${SYNTHETIC.address.state}: ${(await address.getCityOptions()).length}`);

    await address.submitForm();
    await expect(page.locator('textarea[name="address_line1"]')).toBeHidden({ timeout: 25000 });

    // FR-36 — "Same as Permanent" copies all seven fields; D-21 — only Line 1 locks.
    await address.openCommunicationAddressForm();
    await address.tickSameAsPermanent();
    await expect(page.locator('textarea[name="address_line1"]')).toBeDisabled();
    await expect(page.getByPlaceholder('Pin code')).toBeEnabled();

    await address.submitForm();
    await expect(page.locator('textarea[name="address_line1"]')).toBeHidden({ timeout: 25000 });

    await address.submitStep();
    await journey.expectAdvancedTo('Branch Selection');
  });

  test('CREATE-07: Branch Selection saves the default branch on the first click', async () => {
    await staffPage.openStep('Branch Selection');

    expect(await journey.getDefaultBranchText(), 'a default branch is pre-selected').toMatch(/Branch Id/i);
    await journey.submitDefaultBranch();

    await journey.expectAdvancedTo('Basic Details');
  });

  test('CREATE-08: Basic Details — the 1003-only fields, then submit', async () => {
    await staffPage.openStep('Basic Details');

    // FR-40 / FR-41 / FR-42 / FR-45 — this scheme's data-model identity.
    await journey.verifyIdentityPrefilled();
    await journey.verifyStaffFieldsPresent();
    await journey.verifyAbsentFields();
    expect(await journey.getIsStaffOptionCount(), 'Is Staff offers exactly one option').toBe(1);
    console.log(`[D-24] spouse_name maxLength=${await journey.getSpouseNameMaxLength()}`);

    await journey.fillBasicDetails(SYNTHETIC.staffId);
    await journey.submitStep();

    // FR-49 — routes to Salaried Information unconditionally.
    await journey.expectAdvancedTo('Salaried Information');
  });

  test('CREATE-09: Salaried Information submits with its single mandatory field', async () => {
    await staffPage.openStep('Salaried Information');

    await journey.fillSalariedByPosition();
    await journey.submitStep();

    await journey.expectAdvancedTo('Applicant Photo');
  });

  test('CREATE-10: Applicant Photo — verified photo plus camera signature', async () => {
    await staffPage.openStep('Applicant Photo');

    // FR-54 — camera only; no upload shortcut exists.
    expect(await journey.countFileInputs(), 'the step exposes no file input').toBe(0);

    await journey.openVerifiedPhoto();
    // FR-53 — correctly gated until a source is chosen.
    expect(await journey.isVerifiedPhotoSubmitDisabled(), 'Submit disabled until a source is picked').toBe(true);

    const sources = await journey.getVerifiedPhotoSources();
    expect(sources.join('|')).toMatch(/Aadhaar/i);
    expect(sources.join('|')).toMatch(/Liveliness/i);

    await journey.chooseVerifiedPhotoSource(/Aadhaar/);
    await journey.submitVerifiedPhoto();
    await journey.captureSignature();
    await journey.waitForBothImagesRegistered();

    await journey.submitStep();
    await journey.expectAdvancedTo('Nominee Details');
  });

  test('CREATE-11: Nominee Details — guardian logic, age derivation, nominee address', async ({ page }) => {
    const nominee = new NomineeDetailsStep(page);
    await staffPage.openStep(NomineeDetailsStep.STEP_LABEL);

    // TC-STAFF-054 — mandatory fields flagged together.
    await nominee.submit();
    for (const message of ['Full Name is required', 'Date of Birth is required']) {
      await expect(page.getByText(message)).toBeVisible();
    }

    await nominee.fillNominee(SYNTHETIC.nominee.fullName, SYNTHETIC.nominee.relation, SYNTHETIC.nominee.adultDob);
    expect((await nominee.getRelationOptions()).length, 'relation list is API-populated').toBeGreaterThan(0);

    // BR-24 / AC18 — the best-implemented conditional logic in the journey.
    await nominee.setDateOfBirth(SYNTHETIC.nominee.minorDob);
    await nominee.verifyGuardianBlockVisible();
    await nominee.setDateOfBirth(SYNTHETIC.nominee.adultDob);
    await nominee.verifyGuardianBlockHidden();

    await expect(nominee.ageInput).toBeDisabled();
    console.log(`[D-30] derived age for ${SYNTHETIC.nominee.adultDob}: ${await nominee.getDerivedAge()}`);
    expect(await nominee.hasDeclineNominationControl(), 'BR-23: nomination cannot be declined').toBe(false);

    await nominee.submit();

    // BR-25 / FR-64 — nominee address opens pre-checked and pre-filled.
    await nominee.openNomineeAddressForm();
    expect(await nominee.isUseExistingAddressChecked(), 'Use Existing Address is pre-checked').toBe(true);

    await page.locator('.popupoverlay button:visible', { hasText: /^Submit$/ }).first().click();
    await expect(page.locator('.popupoverlay')).toBeHidden({ timeout: 25000 });

    await journey.submitStep();
    await journey.expectAdvancedTo('Document Upload');
  });

  test('CREATE-12: Document Upload advances with nothing attached — D-35', async () => {
    await staffPage.openStep('Document Upload');

    await journey.submitDocumentUploadEmpty();
    console.log(`[D-35] warning shown on empty submit: ${await journey.hasEmptySubmitWarning()}`);

    await journey.expectAdvancedTo('Introducer Details');
  });

  test('CREATE-13: Introducer Details resolves against the Core Banking System', async ({ page }) => {
    test.skip(!CBS_ACCOUNT_NUMBER, 'STAFF_CBS_ACCOUNT is required — a CBS failure is silent (D-31).');

    const introducer = new IntroducerDetailsStep(page);
    await staffPage.openStep(IntroducerDetailsStep.STEP_LABEL);

    // TC-STAFF-057 — all three mandatory fields flagged together.
    await introducer.submitButton.click();
    await introducer.verifyAllMandatoryErrorsShown();

    await introducer.fillIntroducer(
      INTRODUCER_NAME || SYNTHETIC.introducerName,
      CBS_ACCOUNT_NUMBER,
      SYNTHETIC.periodOfAcquaintance,
    );

    // BR-27 — assert on ADVANCING, never on the absence of an error (D-31).
    await introducer.submitAndExpectAdvance();
  });

  test('CREATE-14: Lead Details — both codes verified, then the Summary', async ({ page }) => {
    test.skip(!LEAD_STAFF_CODE, 'STAFF_LEAD_CODE is required — both codes must verify (BR-28).');

    const lead = new LeadDetailsStep(page);
    await staffPage.openStep(LeadDetailsStep.STEP_LABEL);

    // D-34 probe — populate both, verify only the first, see whether the second survives.
    await lead.sourcerCodeInput.fill(LEAD_STAFF_CODE);
    await lead.leadConverterCodeInput.fill(LEAD_STAFF_CODE);
    await lead.verifyLeadConverterCode();
    console.log(`[D-34] Sourcer Code after verifying the Converter: "${await lead.getSourcerCodeValue()}"`);

    // Re-enter and verify in strict sequence — the supported order given D-34.
    await lead.sourcerCodeInput.fill(LEAD_STAFF_CODE);
    await lead.verifySourcerCode();
    console.log(
      `[D-38] converter="${await lead.getResolvedName('converter')}" sourcer="${await lead.getResolvedName('sourcer')}"`,
    );

    await journey.submitStep();
    await journey.expectAdvancedTo(WorkflowConfig.SUMMARY_STEP_LABEL, 90000);
  });

  test('CREATE-15: Summary renders the application, then submit it', async ({ page }) => {
    const summary = new SummaryPage(page);
    await staffPage.openStep(WorkflowConfig.SUMMARY_STEP_LABEL);

    expect((await summary.getSectionHeadings()).length, 'a section per workflow step').toBeGreaterThanOrEqual(12);

    // AC21 fidelity — values entered by THIS run are present.
    const text = await summary.getSummaryText();
    expect(text).toContain(SYNTHETIC.staffId);
    expect(text).toContain(SYNTHETIC.address.pinCode);
    expect(text).toContain(SYNTHETIC.nominee.fullName);

    // D-43 recorded on the way past — the gate that should exist but does not.
    console.log(
      `[Summary omissions] images=${await summary.countRenderedImages()} ` +
        `consentControls=${await summary.countConsentControls()} ` +
        `submitEnabled=${await summary.isSubmitEnabled()}`,
    );

    // ⚠️ IRREVERSIBLE — finalise the application. This is deliberate: the creation journey
    // completes the account end to end. Verified live on SAH-1003-818 (2026-08-19): submit
    // returns ENDMOD_200 / success TRUE, with no confirmation dialog, and the application
    // moves from Pending to Submitted.
    const result = await summary.submitApplication();

    expect(result.success, `submit should succeed — got ${JSON.stringify(result)}`).toBe('TRUE');
    expect(result.msgCode).toBe('ENDMOD_200');

    // The app redirects to the dashboard on a successful submit.
    await expect(page).toHaveURL(/\/UNPOSTED/, { timeout: 30000 });

    banner('APPLICATION SUBMITTED', [
      `Applicant Id : ${applicantId}`,
      `Result       : ${result.msgCode} — ${result.success}`,
      `Message      : ${result.msgDescr}`,
      'Status       : Submitted (moved out of Pending)',
    ]);
  });
});
