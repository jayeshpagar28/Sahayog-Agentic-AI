import * as path from 'path';
import { test } from '@playwright/test';
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
 * Normal Savings Account (1001) — Individual Account Type, complete live journey.
 *
 * Covers: user-stories/US_009_Normal_ Account_journey.md (all ACs for the Individual path) /
 * specs/NORMAL_TS001-test-plan.md. This is the full end-to-end flow — Mobile Verification
 * through real final Submit — driven against real UAT, not a mock. Unlike Silver Individual,
 * Normal Individual DOES require Introducer Details.
 *
 * Already proven live end-to-end via this exact sequence of steps (application SAH-1001-808,
 * 2026-08-14, submitted for real with msgCode ENDMOD_200) before this dedicated script existed
 * — this file formalizes that same sequence as a standalone, independently-runnable test.
 *
 * Manually-assisted: Mobile OTP, Aadhaar DigiLocker authorization, and phone-based Liveliness
 * Verification all genuinely require a human. See tests/support/savingsApplicationFlow.ts for
 * how each is handled. Skipped entirely in CI rather than silently omitted.
 */
test.use({
  permissions: ['camera', 'geolocation'],
  geolocation: { latitude: 19.997, longitude: 73.789 },
  launchOptions: { args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'] },
});

test.describe('NORMAL_TS001 - Individual Account (Live, Manually-Assisted)', () => {
  test.skip(!!process.env.CI, 'Manually-assisted OTP/DigiLocker/Liveliness relay - not runnable unattended in CI');

  test('Normal Savings Account - Individual: full live journey through real final submission', async ({ page }) => {
    const applicantMobile = process.env.SAHAYOG_NOR_IND_MOBILE;
    test.skip(!applicantMobile, 'Set SAHAYOG_NOR_IND_MOBILE to a real, not-recently-used mobile number before running this flow.');

    test.setTimeout(30 * 60 * 1000);
    const OTP_SIGNAL_FILE = path.join(process.cwd(), '.nor-ind-otp-input.txt');

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

    await openNewApplication(page, 'normal');

    await sendMobileVerification(page, applicantMobile!);
    await waitForAndSubmitOtp(page, OTP_SIGNAL_FILE);

    await selectAccountType(page, 'individual');

    const appId = await findApplicationId(page, 'normal', applicantMobile!);
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
