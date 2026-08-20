import * as path from 'path';
import { test } from '@playwright/test';
import { hasUnattendedOtp, type OtpSource } from '../support/signalFile';
import {
  openNewApplication,
  findApplicationId,
  sendMobileVerification,
  waitForAndSubmitOtp,
  selectAccountType,
  fillMinorKycDetails,
  fillAddressDetails,
  selectBranch,
  fillBasicDetails,
  fillApplicantPhoto,
  fillSecondaryApplicant,
  fillNomineeDetails,
  fillNomineeAddress,
  uploadDocuments,
  fillIntroducerDetails,
  fillLeadDetails,
  getSummaryText,
  finalSubmit,
  type MinorData,
  type SecondaryPersonData,
} from '../support/savingsApplicationFlow';

/**
 * Normal Savings Account (1001) — Minor Account Type, complete live journey.
 *
 * Covers: user-stories/US_009_Normal_ Account_journey.md (all ACs for the Minor path) /
 * specs/NORMAL_TS001-test-plan.md. This is the full end-to-end flow — Mobile Verification
 * through real final Submit — driven against real UAT, not a mock. Unlike Silver Minor, Normal
 * Minor DOES require Introducer Details.
 *
 * The application-level Mobile OTP and the Guardian's own Mobile OTP (for their sub-journey)
 * both follow the same unattended-capable priority chain as
 * tests/10_STAFF_TS001/staff-account-creation.spec.ts: a literal env var -> a polled endpoint ->
 * a local signal file (a human relays the SMS). DigiLocker/Liveliness (the Guardian's own) are
 * resolved automatically by polling status - no human confirmation is asked for either. (The
 * Minor themselves uses Minor KYC Details - manual Aadhaar entry, no OTP or DigiLocker of their
 * own.) The test skips in CI ONLY when either OTP source is missing - never merely for being CI.
 */
test.use({
  permissions: ['camera', 'geolocation'],
  geolocation: { latitude: 19.997, longitude: 73.789 },
  launchOptions: { args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'] },
});

const OTP_SOURCE: OtpSource = {
  literal: process.env.SAHAYOG_NOR_MIN_OTP,
  url: process.env.SAHAYOG_NOR_MIN_OTP_URL,
  signalFile: path.join(process.cwd(), '.nor-min-otp-input.txt'),
};
const GUARDIAN_OTP_SOURCE: OtpSource = {
  literal: process.env.SAHAYOG_NOR_MIN_GUARDIAN_OTP,
  url: process.env.SAHAYOG_NOR_MIN_GUARDIAN_OTP_URL,
  signalFile: path.join(process.cwd(), '.nor-min-guardian-otp-input.txt'),
};

test.describe('NORMAL_TS001 - Minor Account (Live)', () => {
  test.skip(
    !!process.env.CI && !(hasUnattendedOtp(OTP_SOURCE) && hasUnattendedOtp(GUARDIAN_OTP_SOURCE)),
    'Needs an OTP source for both the application and the Guardian to run unattended in CI. Set ' +
      'SAHAYOG_NOR_MIN_OTP/_URL and SAHAYOG_NOR_MIN_GUARDIAN_OTP/_URL; locally OTPs are read from ' +
      '.nor-min-otp-input.txt and .nor-min-guardian-otp-input.txt. (DigiLocker consent and ' +
      'Liveliness are resolved by polling application status, so they need no configuration.)',
  );

  test('Normal Savings Account - Minor: full live journey through real final submission', async ({ page }) => {
    const applicationMobile = process.env.SAHAYOG_NOR_MIN_MOBILE;
    const guardianMobile = process.env.SAHAYOG_NOR_MIN_GUARDIAN_MOBILE;
    test.skip(
      !applicationMobile || !guardianMobile,
      'Set SAHAYOG_NOR_MIN_MOBILE and SAHAYOG_NOR_MIN_GUARDIAN_MOBILE to two real, not-recently-used mobile numbers before running this flow.',
    );

    test.setTimeout(50 * 60 * 1000);

    const minor: MinorData = {
      firstName: 'Bhushan',
      middleName: 'Vishnu',
      lastName: 'Joshi',
      dob: '2025-11-27',
      aadhaarNumber: '700780012335',
      address: {
        line1: 'Nashik55',
        line2: 'Nashik55',
        state: 'Maharashtra',
        city: 'Nashik',
        pin: '413055',
      },
      prefix: 'Master',
      gender: 'Male',
      maritalStatus: 'Unmarried',
      fatherFirstName: 'Vishnu',
      fatherLastName: 'Joshi',
      motherName: 'Vaishali',
      religion: 'Hindu',
      casteCategory: 'General',
      education: 'Uneducated',
      region: 'Urban Area',
      employmentType: 'Unemployed',
      designation: 'School Student',
      fundingMode: 'Cash',
      initialFundingAmount: '1000',
      expectedValue: '10000',
      expectedNumber: '5',
      agricultureIncome: '0',
      otherIncome: '0',
    };

    const guardian: SecondaryPersonData = {
      mobile: guardianMobile!,
      relationshipWithMain: 'Father',
      prefix: 'Mr',
      gender: 'Male',
      email: 'guardian.normal@example.com',
      maritalStatus: 'Married',
      spouseOrFatherName: 'Vaishali',
      fatherFirstName: 'Ramesh',
      fatherLastName: 'Joshi',
      motherName: 'Sunita',
      religion: 'Hindu',
      casteCategory: 'General',
      education: 'Graduate',
      region: 'Urban Area',
      employmentType: 'Salaried',
      designation: 'Private Company Employee',
      expectedValue: '10000',
      expectedNumber: '5',
      agricultureIncome: '0',
      otherIncome: '0',
      employmentInfo: {
        category: 'Private Sector Employee – Corporate / MNC',
        organizationName: 'Softtech Solutions',
        annualIncome: '900000',
        sourceOfIncome: 'Salary',
      },
      communicationAddress: {
        line1: 'Nashik55',
        line2: 'Nashik55',
        state: 'Maharashtra',
        city: 'Nashik',
        pin: '413055',
      },
    };

    await openNewApplication(page, 'normal');

    await sendMobileVerification(page, applicationMobile!);
    await waitForAndSubmitOtp(page, OTP_SOURCE);

    await selectAccountType(page, 'minor');

    await fillMinorKycDetails(page, minor);
    await fillAddressDetails(page, minor.address);
    await selectBranch(page, { change: false });
    await fillBasicDetails(page, minor as unknown as import('../support/savingsApplicationFlow').PersonData, {
      includeRelationship: false,
      includeFundingMode: true,
      modeOfOperation: 'Guardian',
    });

    const appId = await findApplicationId(page, 'normal', applicationMobile!);
    if (!appId) {
      throw new Error(`Could not locate the application ID for mobile ${applicationMobile} - cannot proceed to the Guardian's eKYC/Liveliness polling without a real application ID to re-navigate to.`);
    }

    await fillSecondaryApplicant(page, {
      kind: 'guardian',
      data: guardian,
      otpSource: GUARDIAN_OTP_SOURCE,
      appId,
    });

    await fillApplicantPhoto(page); // no-ops if the Minor themselves has no separate photo step

    const nominee = { fullName: 'Mangesh Deshmukh', relation: 'Business Associate', dob: '1997-07-25' };
    await fillNomineeDetails(page, nominee);
    await fillNomineeAddress(page, nominee, minor.address);

    await uploadDocuments(page, [{ type: 'Ration Card' }]);
    await fillIntroducerDetails(page, {
      name: 'Bhuwan Dnyaneshwar Patle',
      accountNumber: '100144590015067',
      periodOfAcquaintance: '5 Years',
    });
    await fillLeadDetails(page, { leadConverterCode: 'SAH09078', sourcerCode: 'SAH09078' });

    const summaryText = await getSummaryText(page);
    console.log('----- SUMMARY -----');
    console.log(summaryText);
    console.log('--------------------');

    const submitResponses = await finalSubmit(page);
    console.log('Final submit responses:', JSON.stringify(submitResponses, null, 1));
  });
});
