import * as path from 'path';
import { test, expect } from '@playwright/test';
import {
  openNewApplication,
  findApplicationId,
  sendMobileVerification,
  waitForAndSubmitOtp,
  selectAccountType,
  completeEkyc,
  completeLiveliness,
  fillMinorKycDetails,
  fillAddressDetails,
  selectBranch,
  fillBasicDetails,
  fillChequeDetails,
  fillEmploymentInfo,
  fillApplicantPhoto,
  fillSecondaryApplicant,
  fillNomineeDetails,
  fillNomineeAddress,
  uploadDocuments,
  fillIntroducerDetails,
  fillLeadDetails,
  getSummaryText,
  finalSubmit,
} from './savingsApplicationFlow';
import { hasUnattendedOtpSource, banner, type OtpConfig } from './otpSource';
import {
  PRIMARY_APPLICANT,
  coApplicant,
  guardian,
  minorApplicant,
  NOMINEE,
  INTRODUCER,
  LEAD,
} from './savingsFixtures';

export type AccountType = 'individual' | 'joint' | 'minor';

export interface CreationSuiteConfig {
  /** e.g. "SILVER_TS001". */
  suiteId: string;
  scheme: 'silver' | 'normal';
  /** Scheme card label, e.g. "Silver Savings Account - 1002". */
  accountType: AccountType;
  /** Env var holding the primary applicant's mobile number. */
  mobileEnv: string;
  /** Env var holding the co-applicant's mobile (Joint only). */
  coMobileEnv?: string;
  /** Env var holding the Guardian's mobile (Minor only). */
  guardianMobileEnv?: string;
  /** Env var holding the Minor's Aadhaar number (Minor only). */
  minorAadhaarEnv?: string;
  /** Signal-file prefix, e.g. ".sil-ind" → .sil-ind-otp-input.txt. */
  signalPrefix: string;
}

/**
 * Defines a full account-creation suite for one scheme + account type, in the Staff per-step
 * shape: an ordered set of test() blocks (serial) that create a brand-new application and walk
 * every step of it, ending in a real final Submit.
 *
 * The step logic reuses the live-proven functions in savingsApplicationFlow.ts. The account
 * type selects which steps apply:
 *   - individual: the base journey.
 *   - joint:      + a second applicant sub-journey (their own mobile/OTP/eKYC/liveliness/etc.).
 *   - minor:      + Minor KYC up front, and a Guardian sub-journey instead of a co-applicant.
 *
 * Skips in CI unconditionally: the three verification gates (and, for Joint/Minor, a second set
 * of them) require a real person on a handset for DigiLocker consent and the liveliness check,
 * which no OTP source can supply. `hasUnattendedOtpSource` is reported in the skip note so the
 * log states plainly why.
 */
export function defineCreationSuite(config: CreationSuiteConfig): void {
  const {
    suiteId,
    scheme,
    accountType,
    mobileEnv,
    coMobileEnv,
    guardianMobileEnv,
    minorAadhaarEnv,
    signalPrefix,
  } = config;

  const primaryOtp: OtpConfig = {
    literalEnv: `${envKey(signalPrefix)}_OTP`,
    urlEnv: 'STAFF_OTP_URL',
    signalFile: path.join(process.cwd(), `${signalPrefix}-otp-input.txt`),
  };
  const secondaryOtp: OtpConfig = {
    literalEnv: `${envKey(signalPrefix)}_CO_OTP`,
    urlEnv: 'STAFF_OTP_URL',
    signalFile: path.join(process.cwd(), `${signalPrefix}-co-otp-input.txt`),
  };

  // Camera, geolocation and the fake video device are provided by the chromium-camera project
  // (playwright.config.ts) — no test.use() here, which would force a fresh worker per file.
  test.describe(`${suiteId} - ${scheme} ${accountType} account creation (cold, every step)`, () => {
    test.describe.configure({ mode: 'serial' });

    // The whole creation flow is human-assisted (DigiLocker + liveliness need a real handset),
    // so it never runs unattended. Skip in CI, always.
    test.skip(
      !!process.env.CI,
      `Creating a ${scheme} ${accountType} account needs live human input at the DigiLocker and ` +
        'liveliness gates (a real handset), which no OTP source can supply' +
        `${hasUnattendedOtpSource(primaryOtp) ? '' : ' — and no OTP source is configured either'}. ` +
        'Run locally with a real handset; every record-free spec in this suite runs in CI.',
    );

    const mobile = process.env[mobileEnv] ?? '';
    const coMobile = coMobileEnv ? (process.env[coMobileEnv] ?? '') : '';
    const guardianMobile = guardianMobileEnv ? (process.env[guardianMobileEnv] ?? '') : '';
    const minorAadhaar = minorAadhaarEnv ? (process.env[minorAadhaarEnv] ?? '') : '';

    let applicantId = '';

    test.beforeAll(() => {
      if (!mobile) throw new Error(`${mobileEnv} is required — a real handset that will receive the OTP and links.`);
      if (accountType === 'joint' && !coMobile) throw new Error(`${coMobileEnv} is required for a Joint account.`);
      if (accountType === 'minor' && !guardianMobile) throw new Error(`${guardianMobileEnv} is required for a Minor account.`);
    });

    test.beforeEach(async ({ page }) => {
      test.setTimeout(4 * 60 * 1000);
      if (applicantId) await reopen(page, applicantId);
    });

    // ---- STEP 1: mobile + OTP + account type -----------------------------------------------
    test('01: Mobile verification, then select account type', async ({ page }) => {
      test.setTimeout(16 * 60 * 1000);

      await openNewApplication(page, scheme);
      await sendMobileVerification(page, mobile);

      banner(`GATE 1 — SMS OTP (${scheme} ${accountType})`, [`OTP sent to ${mobile}.`, 'Supply it via the configured source.']);
      await waitForAndSubmitOtp(page, primaryOtp);

      await selectAccountType(page, accountType);

      applicantId = (await findApplicationId(page, scheme, mobile)) ?? '';
      expect(applicantId, 'an application id should exist after OTP + account type').toMatch(/^SAH-\d{4}-\d+$/);
    });

    // ---- STEP 2: Minor KYC (minor only) ----------------------------------------------------
    if (accountType === 'minor') {
      test('02: Minor KYC details', async ({ page }) => {
        await fillMinorKycDetails(page, minorApplicant(minorAadhaar));
      });
    }

    // ---- STEP 3: eKYC + liveliness (primary) -----------------------------------------------
    test('03: eKYC (DigiLocker) and Liveliness — polled to Successful', async ({ page }) => {
      test.setTimeout(50 * 60 * 1000);
      banner(`GATES 2 & 3 — DigiLocker + Liveliness (${scheme} ${accountType})`, [
        'Complete both on the handset; the script polls the application status.',
      ]);
      await completeEkyc(page, { appId: applicantId });
      await completeLiveliness(page, { appId: applicantId });
    });

    // ---- STEP 4: address + branch + basic + (cheque/employment) -----------------------------
    test('04: Address, Branch and Basic Details', async ({ page }) => {
      if (accountType === 'minor') {
        const minor = minorApplicant(minorAadhaar);
        await fillAddressDetails(page, minor.address);
        await selectBranch(page, { change: false });
        await fillBasicDetails(page, minor as never, {
          includeRelationship: false,
          includeFundingMode: true,
          modeOfOperation: 'Guardian',
        });
        await fillChequeDetails(page, emptyCheque());
        return;
      }

      await fillAddressDetails(page, PRIMARY_APPLICANT.communicationAddress);
      await selectBranch(page, { change: false });
      await fillBasicDetails(page, PRIMARY_APPLICANT, {
        includeRelationship: false,
        includeFundingMode: true,
        modeOfOperation: 'Self',
      });
      await fillChequeDetails(page, PRIMARY_APPLICANT.chequeDetails ?? emptyCheque());
      if (PRIMARY_APPLICANT.employmentInfo) {
        await fillEmploymentInfo(page, PRIMARY_APPLICANT.employmentInfo);
      }
    });

    // ---- STEP 5: second person (joint co-applicant / minor guardian) -----------------------
    if (accountType === 'joint' || accountType === 'minor') {
      test('05: Second applicant sub-journey (own mobile, eKYC, liveliness)', async ({ page }) => {
        test.setTimeout(50 * 60 * 1000);
        const data = accountType === 'joint' ? coApplicant(coMobile) : guardian(guardianMobile);
        banner(`SECOND APPLICANT GATES (${scheme} ${accountType})`, [
          `A second person (${accountType === 'joint' ? 'co-applicant' : 'guardian'}) needs their own OTP, DigiLocker and liveliness.`,
        ]);
        await fillSecondaryApplicant(page, {
          kind: accountType === 'joint' ? 'joint' : 'guardian',
          data,
          otp: secondaryOtp,
          appId: applicantId,
        });
      });
    }

    // ---- STEP 6: photo + nominee -----------------------------------------------------------
    test('06: Applicant Photo and Nominee Details', async ({ page }) => {
      await fillApplicantPhoto(page);
      await fillNomineeDetails(page, NOMINEE);
      const addr = accountType === 'minor' ? minorApplicant(minorAadhaar).address : PRIMARY_APPLICANT.communicationAddress;
      await fillNomineeAddress(page, NOMINEE, addr);
    });

    // ---- STEP 7: documents + introducer + lead ---------------------------------------------
    test('07: Documents, Introducer and Lead Details', async ({ page }) => {
      await uploadDocuments(page, [{ type: 'Ration Card' }]);
      await fillIntroducerDetails(page, INTRODUCER); // no-ops where the scheme/type omits it
      await fillLeadDetails(page, LEAD);
    });

    // ---- STEP 8: summary + submit ----------------------------------------------------------
    test('08: Summary, then submit the application', async ({ page }) => {
      const summaryText = await getSummaryText(page);
      expect(summaryText.length, 'the Summary should render content').toBeGreaterThan(0);

      const responses = await finalSubmit(page);
      const ok = responses.some((r) => r.status === 200 && /success"?\s*:\s*"?TRUE|ENDMOD_200/i.test(r.body ?? ''));
      expect(ok, `submit should succeed — got ${JSON.stringify(responses)}`).toBe(true);

      banner(`APPLICATION SUBMITTED (${scheme} ${accountType})`, [`Applicant Id: ${applicantId}`, 'Status: Submitted']);
    });
  });
}

/** Env-var key from a signal prefix: ".sil-ind" → "SIL_IND". */
function envKey(prefix: string): string {
  return prefix.replace(/^\./, '').replace(/-/g, '_').toUpperCase();
}

function emptyCheque(): { chequeNumber: string; chequeDate: string; draweeBankName: string; ifscCode: string } {
  return { chequeNumber: '', chequeDate: '', draweeBankName: '', ifscCode: '' };
}

/** Re-enter the application between serial steps (mirrors reopenApplication in the helper). */
async function reopen(page: import('@playwright/test').Page, appId: string): Promise<void> {
  const { reopenApplication } = await import('./savingsApplicationFlow');
  await reopenApplication(page, appId).catch(() => undefined);
}
