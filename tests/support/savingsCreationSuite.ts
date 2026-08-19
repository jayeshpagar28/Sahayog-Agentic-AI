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

  // Camera, geolocation and the fake video device are provided by the chromium-camera project.
  test.describe(`${suiteId} - ${scheme} ${accountType} account creation (cold, every step)`, () => {
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

    /**
     * ONE continuous test.
     *
     * The journey is driven straight through in a single browser context — it is NOT split into
     * separate test() blocks. Splitting forced a reopen of the application between steps, which
     * loses the in-progress form and lands on the wrong tab (it left Basic Details unsubmitted
     * and the Joint Applicant Details tab never appeared). The step-by-step reporting comes from
     * the helper functions, each of which wraps its work in test.step() internally, so the
     * granularity is preserved without the fragility.
     */
    test(`${scheme} ${accountType}: full cold journey through final submission`, async ({ page }) => {
      // Two human-gate sets for Joint/Minor (primary + second person), so this is long.
      test.setTimeout(60 * 60 * 1000);

      if (!mobile) throw new Error(`${mobileEnv} is required — a real handset that will receive the OTP and links.`);
      if (accountType === 'joint' && !coMobile) throw new Error(`${coMobileEnv} is required for a Joint account.`);
      if (accountType === 'minor' && !guardianMobile) throw new Error(`${guardianMobileEnv} is required for a Minor account.`);

      // ---- Mobile + OTP + account type -----------------------------------------------------
      await openNewApplication(page, scheme);
      await sendMobileVerification(page, mobile);
      banner(`GATE 1 — SMS OTP (${scheme} ${accountType})`, [`OTP sent to ${mobile}.`, 'Supply it via the configured source.']);
      await waitForAndSubmitOtp(page, primaryOtp);
      await selectAccountType(page, accountType);

      const applicantId = (await findApplicationId(page, scheme, mobile)) ?? '';
      expect(applicantId, 'an application id should exist after OTP + account type').toMatch(/^SAH-\d{4}-\d+$/);

      // ---- Minor KYC (minor only) ----------------------------------------------------------
      if (accountType === 'minor') {
        await fillMinorKycDetails(page, minorApplicant(minorAadhaar));
      }

      // ---- eKYC + liveliness (primary) — polled to Successful ------------------------------
      banner(`GATES 2 & 3 — DigiLocker + Liveliness (${scheme} ${accountType})`, [
        'Complete both on the handset; the script polls the application status.',
      ]);
      await completeEkyc(page, { appId: applicantId });
      await completeLiveliness(page, { appId: applicantId });

      // ---- Address + Branch + Basic (+ cheque/employment) ----------------------------------
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
      } else {
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
      }

      // ---- Second person (Joint co-applicant / Minor guardian) — their own gate set --------
      if (accountType === 'joint' || accountType === 'minor') {
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
      }

      // ---- Photo + nominee -----------------------------------------------------------------
      await fillApplicantPhoto(page);
      await fillNomineeDetails(page, NOMINEE);
      const nomineeAddr = accountType === 'minor' ? minorApplicant(minorAadhaar).address : PRIMARY_APPLICANT.communicationAddress;
      await fillNomineeAddress(page, NOMINEE, nomineeAddr);

      // ---- Documents + introducer + lead ---------------------------------------------------
      await uploadDocuments(page, [{ type: 'Ration Card' }]);
      await fillIntroducerDetails(page, INTRODUCER); // no-ops where the scheme/type omits it
      await fillLeadDetails(page, LEAD);

      // ---- Summary + submit ----------------------------------------------------------------
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
