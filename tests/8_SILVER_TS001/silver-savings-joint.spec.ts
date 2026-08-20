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
  fillSecondaryApplicant,
  fillNomineeDetails,
  fillNomineeAddress,
  uploadDocuments,
  fillIntroducerDetails,
  fillLeadDetails,
  getSummaryText,
  finalSubmit,
  type PersonData,
  type SecondaryPersonData,
} from '../support/savingsApplicationFlow';

/**
 * Silver Savings Account (1002) — Joint Account Type, complete live journey.
 *
 * Covers: user-stories/US_008_Silver_Saving_Account_ Journey.md (all ACs for the Joint path) /
 * specs/SILVER_TS001-test-plan.md. This is the full end-to-end flow — Mobile Verification
 * through real final Submit — driven against real UAT, not a mock. Unlike Individual, Silver
 * Joint DOES require Introducer Details.
 *
 * TWO applicants each need Mobile OTP, DigiLocker, and Liveliness (main applicant + Joint
 * co-applicant). DigiLocker/Liveliness are resolved automatically by polling each applicant's
 * status - no human confirmation is asked for either. Each applicant's OTP follows the same
 * unattended-capable priority chain as tests/10_STAFF_TS001/staff-account-creation.spec.ts:
 * a literal env var -> a polled endpoint -> a local signal file (a human relays the SMS). The
 * test skips in CI ONLY when either applicant lacks a configured unattended OTP source - never
 * merely for being CI.
 */
test.use({
  permissions: ['camera', 'geolocation'],
  geolocation: { latitude: 19.997, longitude: 73.789 },
  launchOptions: { args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'] },
});

const OTP_SOURCE: OtpSource = {
  literal: process.env.SAHAYOG_SIL_JNT_OTP,
  url: process.env.SAHAYOG_SIL_JNT_OTP_URL,
  signalFile: path.join(process.cwd(), '.sil-jnt-otp-input.txt'),
};
const CO_OTP_SOURCE: OtpSource = {
  literal: process.env.SAHAYOG_SIL_JNT_CO_OTP,
  url: process.env.SAHAYOG_SIL_JNT_CO_OTP_URL,
  signalFile: path.join(process.cwd(), '.sil-jnt-co-otp-input.txt'),
};

test.describe('SILVER_TS001 - Joint Account (Live)', () => {
  test.skip(
    !!process.env.CI && !(hasUnattendedOtp(OTP_SOURCE) && hasUnattendedOtp(CO_OTP_SOURCE)),
    'Needs an OTP source for both applicants to run unattended in CI. Set SAHAYOG_SIL_JNT_OTP/' +
      '_URL and SAHAYOG_SIL_JNT_CO_OTP/_URL; locally OTPs are read from .sil-jnt-otp-input.txt ' +
      'and .sil-jnt-co-otp-input.txt. (DigiLocker consent and Liveliness are resolved by polling ' +
      'application status, so they need no configuration.)',
  );

  test('Silver Savings Account - Joint: full live journey through real final submission', async ({ page }) => {
    const applicantMobile = process.env.SAHAYOG_SIL_JNT_MOBILE;
    const coApplicantMobile = process.env.SAHAYOG_SIL_JNT_CO_MOBILE;
    test.skip(
      !applicantMobile || !coApplicantMobile,
      'Set SAHAYOG_SIL_JNT_MOBILE and SAHAYOG_SIL_JNT_CO_MOBILE to two real, not-recently-used mobile numbers before running this flow.',
    );

    test.setTimeout(50 * 60 * 1000);

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

    const coApplicant: SecondaryPersonData = {
      mobile: coApplicantMobile!,
      relationshipWithMain: 'Others',
      prefix: 'Mr',
      gender: 'Male',
      email: 'coapplicant.silver@example.com',
      maritalStatus: 'Unmarried',
      fatherFirstName: 'Ramesh',
      fatherLastName: 'Kulkarni',
      motherName: 'Sunita',
      religion: 'Hindu',
      casteCategory: 'General',
      education: 'Graduate',
      region: 'Urban Area',
      employmentType: 'Salaried',
      designation: 'Private Company Employee',
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

    await openNewApplication(page, 'silver');

    await sendMobileVerification(page, applicantMobile!);
    await waitForAndSubmitOtp(page, OTP_SOURCE);

    await selectAccountType(page, 'joint');

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

    await fillSecondaryApplicant(page, {
      kind: 'joint',
      data: coApplicant,
      otpSource: CO_OTP_SOURCE,
      appId,
    });

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
