import * as path from 'path';
import { test } from '@playwright/test';
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
 * Silver Savings Account (1002) — Minor Account Type, complete live journey.
 *
 * Covers: user-stories/US_008_Silver_Saving_Account_ Journey.md (all ACs for the Minor path) /
 * specs/SILVER_TS001-test-plan.md. This is the full end-to-end flow — Mobile Verification
 * through real final Submit — driven against real UAT, not a mock. Silver Minor does NOT
 * require Introducer Details (skipped gracefully by fillIntroducerDetails if the tab isn't
 * present).
 *
 * Manually-assisted: the Guardian needs Mobile OTP, DigiLocker, and Liveliness for their own
 * sub-journey (the Minor themselves uses Minor KYC Details - manual Aadhaar entry, no OTP or
 * DigiLocker of their own). See tests/support/savingsApplicationFlow.ts for how each is
 * handled. Skipped entirely in CI rather than silently omitted.
 */
test.use({
  permissions: ['camera', 'geolocation'],
  geolocation: { latitude: 19.997, longitude: 73.789 },
  launchOptions: { args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'] },
});

test.describe('SILVER_TS001 - Minor Account (Live, Manually-Assisted)', () => {
  test.skip(!!process.env.CI, 'Manually-assisted OTP/DigiLocker/Liveliness relay - not runnable unattended in CI');

  test('Silver Savings Account - Minor: full live journey through real final submission', async ({ page }) => {
    const applicationMobile = process.env.SAHAYOG_SIL_MIN_MOBILE;
    const guardianMobile = process.env.SAHAYOG_SIL_MIN_GUARDIAN_MOBILE;
    test.skip(
      !applicationMobile || !guardianMobile,
      'Set SAHAYOG_SIL_MIN_MOBILE and SAHAYOG_SIL_MIN_GUARDIAN_MOBILE to two real, not-recently-used mobile numbers before running this flow.',
    );

    test.setTimeout(50 * 60 * 1000);
    const GUARDIAN_OTP_SIGNAL_FILE = path.join(process.cwd(), '.sil-min-guardian-otp-input.txt');

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
      email: 'guardian.silver@example.com',
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

    await sendMobileVerification(page, applicationMobile!);
    await waitForAndSubmitOtp(page, path.join(process.cwd(), '.sil-min-otp-input.txt'));

    await selectAccountType(page, 'minor');

    await fillMinorKycDetails(page, minor);
    await fillAddressDetails(page, minor.address);
    await selectBranch(page, { change: false });
    await fillBasicDetails(page, minor as unknown as import('../support/savingsApplicationFlow').PersonData, {
      includeRelationship: false,
      includeFundingMode: true,
      modeOfOperation: 'Guardian',
    });

    const appId = await findApplicationId(page, 'silver', applicationMobile!);
    if (!appId) {
      throw new Error(`Could not locate the application ID for mobile ${applicationMobile} - cannot proceed to the Guardian's eKYC/Liveliness polling without a real application ID to re-navigate to.`);
    }

    await fillSecondaryApplicant(page, {
      kind: 'guardian',
      data: guardian,
      otpSignalFile: GUARDIAN_OTP_SIGNAL_FILE,
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
    }); // no-ops on Silver Minor, which does not require an Introducer
    await fillLeadDetails(page, { leadConverterCode: 'SAH09078', sourcerCode: 'SAH09078' });

    const summaryText = await getSummaryText(page);
    console.log('----- SUMMARY -----');
    console.log(summaryText);
    console.log('--------------------');

    const submitResponses = await finalSubmit(page);
    console.log('Final submit responses:', JSON.stringify(submitResponses, null, 1));
  });
});
