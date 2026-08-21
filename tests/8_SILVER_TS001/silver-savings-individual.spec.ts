import * as path from 'path';
import { test } from '@playwright/test';
import { hasUnattendedOtp, type OtpSource } from '../support/signalFile';
import {
  openNewApplication,
  findApplicationId,
  sendMobileVerification,
  waitForAndSubmitOtp,
  selectAccountType,
  completeEkyc,
  completeLiveliness,
  fillAddressDetails,
  selectBranch,
  fillBasicDetails,
  fillChequeDetails,
  fillEmploymentInfo,
  fillApplicantPhoto,
  fillNomineeDetails,
  fillNomineeAddress,
  uploadDocuments,
  fillIntroducerDetails,
  fillLeadDetails,
  getSummaryText,
  finalSubmit,
  type PersonData,
} from '../support/savingsApplicationFlow';

/**
 * Silver Savings Account (1002) — Individual Account Type, complete live journey.
 *
 * Covers: user-stories/US_008_Silver_Saving_Account_ Journey.md (all ACs for the Individual
 * path) / specs/SILVER_TS001-test-plan.md. This is the full end-to-end flow — Mobile
 * Verification through real final Submit — driven against real UAT, not a mock.
 *
 * DigiLocker consent and Liveliness are resolved automatically by polling the application's own
 * status after sending each link - no human confirmation is asked for either. The OTP is the
 * only step requiring an explicit input, and follows the same unattended-capable priority chain
 * as tests/10_STAFF_TS001/staff-account-creation.spec.ts: SAHAYOG_SIL_IND_OTP (literal) ->
 * SAHAYOG_SIL_IND_OTP_URL (polled endpoint) -> .sil-ind-otp-input.txt (local signal file, a
 * human relays the SMS). The test skips in CI ONLY when none of those is configured - never
 * merely for being CI.
 */
// Applicant Photo can fall back to live camera capture - grant permission and use a fake
// device up front so a real camera permission prompt never blocks the page. Must be top-level
// (launchOptions forces a new worker, not allowed inside a describe group).
test.use({
  permissions: ['camera', 'geolocation'],
  geolocation: { latitude: 19.997, longitude: 73.789 },
  launchOptions: { args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'] },
});

const OTP_SOURCE: OtpSource = {
  literal: process.env.SAHAYOG_SIL_IND_OTP,
  url: process.env.SAHAYOG_SIL_IND_OTP_URL,
  signalFile: path.join(process.cwd(), '.sil-ind-otp-input.txt'),
};

test.describe('SILVER_TS001 - Individual Account (Live)', () => {
  test.skip(
    !!process.env.CI && !hasUnattendedOtp(OTP_SOURCE),
    'Needs an OTP source to run unattended in CI. Set SAHAYOG_SIL_IND_OTP or SAHAYOG_SIL_IND_OTP_URL; ' +
      'locally the OTP is read from .sil-ind-otp-input.txt. (DigiLocker consent and Liveliness are ' +
      'resolved by polling the application status, so they need no configuration.)',
  );

  test('Silver Savings Account - Individual: full live journey through real final submission', async ({ page }) => {
    const applicantMobile = process.env.SAHAYOG_SIL_IND_MOBILE;
    test.skip(!applicantMobile, 'Set SAHAYOG_SIL_IND_MOBILE to a real, not-recently-used mobile number before running this flow.');

    test.setTimeout(30 * 60 * 1000);

    const applicant: PersonData = {
      prefix: 'Mr',
      gender: 'Male',
      email: 'shubhamnetwin@gmail.com',
      maritalStatus: 'Married',
      spouseOrFatherName: 'Aishwarya',
      fatherFirstName: 'Madhukar',
      fatherLastName: 'Borse',
      motherName: 'Meena',
      religion: 'Hindu',
      casteCategory: 'General',
      education: 'Graduate',
      region: 'Urban Area',
      employmentType: 'Salaried',
      designation: 'Private Company Employee',
      fundingMode: 'Cash',
      initialFundingAmount: '5000',
      expectedValue: '100000',
      expectedNumber: '12',
      agricultureIncome: '0',
      otherIncome: '0',
      employmentInfo: {
        category: 'Private Sector Employee – Corporate / MNC',
        organizationName: 'Softtech Solutions',
        annualIncome: '1200000',
        annualTurnover: '1200000',
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

    await openNewApplication(page, 'silver');

    await sendMobileVerification(page, applicantMobile!);
    await waitForAndSubmitOtp(page, OTP_SOURCE);

    await selectAccountType(page, 'individual');

    const appId = await findApplicationId(page, 'silver', applicantMobile!);
    if (!appId) {
      throw new Error(`Could not locate the application ID for mobile ${applicantMobile} - cannot proceed to eKYC/Liveliness polling without a real application ID to re-navigate to.`);
    }
    await completeEkyc(page, { appId });
    await completeLiveliness(page, { appId });

    await fillAddressDetails(page, applicant.communicationAddress);
    await selectBranch(page, { change: false });
    await fillBasicDetails(page, applicant, { includeRelationship: false, includeFundingMode: true, modeOfOperation: 'Self' });
    await fillChequeDetails(page, applicant.chequeDetails ?? { chequeNumber: '', chequeDate: '', draweeBankName: '', ifscCode: '' });
    if (applicant.employmentInfo) {
      await fillEmploymentInfo(page, applicant.employmentInfo);
    }
    await fillApplicantPhoto(page);

    const nominee = { fullName: 'Mangesh Deshmukh', relation: 'Business Associate', dob: '1997-07-25' };
    await fillNomineeDetails(page, nominee);
    await fillNomineeAddress(page, nominee, applicant.communicationAddress);

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
