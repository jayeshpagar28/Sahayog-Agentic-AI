/**
 * Fixtures for the STAFF_TS001 suite.
 *
 * ## How this suite tests account creation
 *
 * Account creation is tested by CREATING A NEW APPLICATION and walking every step of it, in
 * order, filling and submitting each form — never by inspecting a pre-built application
 * read-only. That work lives in `staff-account-creation.spec.ts`.
 *
 * The only genuinely external inputs are the three verification gates. The script does all the
 * browser work and treats the workflow's own status as truth:
 *   - SMS OTP:     supplied via STAFF_OTP (literal), STAFF_OTP_URL (polled endpoint), or the
 *                  .staff-otp-input.txt signal file (a human writes it).
 *   - DigiLocker:  the script sends the link and polls the application until it reads Successful.
 *   - Liveliness:  same — send the link, poll status.
 *
 * So the creation flow runs unattended in CI whenever an OTP source is configured, and is the
 * ONLY spec that skips otherwise. The remaining specs (scheme selection, mobile-number
 * validation, console/network hygiene) create no record and run in CI unconditionally.
 *
 * Third-party fixtures needed to complete the journey:
 *   - STAFF_CBS_ACCOUNT      an account number the Core Banking System resolves (Introducer).
 *                            An unresolvable value fails SILENTLY (D-31) — a hung test, not a
 *                            failed one — so the step asserts on advancing, never on error absence.
 *   - STAFF_LEAD_CODE        a staff code the staff register resolves (Lead Details).
 *   - STAFF_INTRODUCER_NAME  the real account holder's name. Supplied by env var, never
 *                            hardcoded — it is a real person's name and the project forbids
 *                            committing applicant PII.
 */

export const CBS_ACCOUNT_NUMBER = process.env.STAFF_CBS_ACCOUNT ?? '';
export const LEAD_STAFF_CODE = process.env.STAFF_LEAD_CODE ?? '';
export const INTRODUCER_NAME = process.env.STAFF_INTRODUCER_NAME ?? '';

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
