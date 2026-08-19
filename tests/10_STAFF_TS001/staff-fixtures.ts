import type { Page } from '@playwright/test';
import { StaffSalaryApplicationPage } from '../pages/savings-application/StaffSalaryApplicationPage';
import { WorkflowConfig } from '../pages/savings-application/application-form/WorkflowConfig';

/**
 * Fixtures and execution bands for the STAFF_TS001 suite.
 *
 * ## Why this suite is banded
 *
 * Scheme 1003 runs against a live, shared UAT environment that opens real bank accounts.
 * Three of its steps are human-only gates (SMS OTP, DigiLocker consent, Liveliness), each
 * capped at three attempts and each sending a real SMS to a real person. Two more need real
 * third-party data (a CBS account number, a staff code).
 *
 * That makes "just run everything in CI" the wrong goal. Tests are separated by whether they
 * MUTATE the application:
 *
 * | Band | Mutates? | Runs in CI | Needs |
 * |------|----------|-----------|-------|
 * | A — cold-safe    | no  | ✅ always | nothing |
 * | B — read-only    | no  | ✅ when a seed is configured | `STAFF_SEED_APPLICANT_ID` |
 * | C — form-entry   | YES | ❌ never  | `STAFF_MUTABLE_SEED_ID` (local only) |
 * | D — seed builder | YES | ❌ never  | a human + a handset |
 *
 * Band C is excluded from CI deliberately, not as a limitation. Those cases fill and submit
 * forms on a real application, so they are **not idempotent**: the first run consumes the
 * seed by advancing it, and every later run finds the step submitted and read-only. Pointing
 * them at a shared CI seed would either corrupt it or produce failures that say nothing about
 * the product. They belong to an attended local run against a seed you are willing to spend.
 *
 * Bands A and B are safe to run on every commit: neither creates a record, sends an SMS,
 * consumes a verification attempt, nor writes to any application.
 */

/** True when running under CI (GitHub Actions, GitLab, Jenkins, etc. all set this). */
export const IS_CI = !!process.env.CI;

/**
 * A completed seed used **read-only** — resumed and inspected, never written to.
 * Safe for CI. Ideally one parked on the Summary so the review-screen cases can run.
 */
export const SEED_APPLICANT_ID = process.env.STAFF_SEED_APPLICANT_ID ?? '';

/**
 * A seed the caller is willing to CONSUME: form-entry cases fill and submit its steps,
 * advancing it permanently. Must be parked before the steps under test. Local runs only.
 */
export const MUTABLE_SEED_ID = process.env.STAFF_MUTABLE_SEED_ID ?? '';

export const CBS_ACCOUNT_NUMBER = process.env.STAFF_CBS_ACCOUNT ?? '';
export const LEAD_STAFF_CODE = process.env.STAFF_LEAD_CODE ?? '';

/**
 * The introducer's name must match the real account holder for the CBS name-match
 * (`isNameMismatch`) to mean anything. It is therefore a real person's name and is supplied by
 * environment variable — never hardcoded, because this file is checked in and the project
 * forbids recording real applicant PII.
 */
export const INTRODUCER_NAME = process.env.STAFF_INTRODUCER_NAME ?? '';

export const SEED_REASON =
  'STAFF_SEED_APPLICANT_ID is not set. Scheme 1003 cannot be driven from cold (three human-only ' +
  'gates), so these read-only cases need a completed application to inspect. Build one with ' +
  '`npm run staff:seed`, then set the variable.';

/** Band C is never allowed to run in CI, and needs its own consumable seed locally. */
export const MUTATING_REASON = IS_CI
  ? 'Band C (form-entry) never runs in CI: these cases fill and submit forms on a real ' +
    'application, so they are not idempotent — the first run consumes the seed and every later ' +
    'run finds the step read-only. Run them locally against a seed you are willing to spend.'
  : 'STAFF_MUTABLE_SEED_ID is not set. Form-entry cases advance a real application permanently, ' +
    'so they require a seed explicitly nominated as consumable — deliberately NOT the same ' +
    'variable as the read-only seed. Build one with `npm run staff:seed`.';

export const CBS_REASON =
  'STAFF_CBS_ACCOUNT is not set. Introducer Details resolves the account number against the Core ' +
  'Banking System, and an unresolvable value fails silently (D-31) — which presents as a hung ' +
  'test, not a failed one.';

export const LEAD_REASON =
  'STAFF_LEAD_CODE is not set. Both Lead Details codes must be verified against the staff ' +
  'register before the step will submit (BR-28).';

/** Guard for every Band C (mutating) describe block. */
export const skipMutating = (): boolean => IS_CI || !MUTABLE_SEED_ID;

export interface StepAvailability {
  reached: boolean;
  completed: boolean;
  /** Ready-made skip reason when the step cannot be exercised, else ''. */
  skipReason: string;
}

/**
 * Resumes the consumable seed and reports whether a step can actually be form-filled now.
 *
 * Uses `aos/steps/getdetails` (`stepStatus === 1` means submitted) rather than scraping the
 * panel: not every completed step prints "<Stage> submitted successfully" — Address Details
 * and Branch Selection just render their saved values — so a text check silently misses them
 * and the test then fails on a read-only form instead of skipping.
 *
 * A form-entry case is only valid on a seed parked BEFORE the step: too early and the tab does
 * not exist, too late and the form is read-only. Both are precondition mismatches, not defects.
 */
export async function resumeAndCheckStep(
  page: Page,
  staffPage: StaffSalaryApplicationPage,
  stepDesc: string,
): Promise<StepAvailability> {
  const seedId = MUTABLE_SEED_ID || SEED_APPLICANT_ID;
  const config = new WorkflowConfig(page);
  const steps = await config.captureStepList(() => staffPage.resumeApplication(seedId));
  const step = steps.find((s) => s.stepDesc === stepDesc);

  if (!step) {
    const progress = await staffPage.describeProgress();
    return {
      reached: false,
      completed: false,
      skipReason: `Seed ${seedId} has not reached "${stepDesc}" — ${progress}`,
    };
  }
  if (step.stepStatus === 1) {
    return {
      reached: true,
      completed: true,
      skipReason:
        `Seed ${seedId} has already submitted "${stepDesc}" (stepStatus 1), so it re-opens ` +
        'read-only. Form-entry cases need a seed parked before this step.',
    };
  }
  return { reached: true, completed: false, skipReason: '' };
}

/** Synthetic data. Never use real applicant PII on this live environment. */
export const SYNTHETIC = {
  address: {
    addressLine1: 'QA TEST BLOCK 4, AUTOMATION LANE',
    addressLine2: 'NEAR TEST SQUARE',
    area: 'QA AREA',
    state: 'Maharashtra',
    city: 'Nagpur',
    pinCode: '440001',
  },
  nominee: {
    fullName: 'Testnominee Qatest',
    relation: 'Brother',
    adultDob: '1990-01-15',
    minorDob: '2015-06-10',
  },
  introducerName: 'QA Introducer Test',
  periodOfAcquaintance: '5 years',
  staffId: 'STAFF0001',
} as const;
