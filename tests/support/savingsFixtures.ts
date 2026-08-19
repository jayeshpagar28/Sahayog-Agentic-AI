import type {
  PersonData,
  SecondaryPersonData,
  MinorData,
  NomineeData,
  IntroducerData,
  LeadDetailsData,
} from './savingsApplicationFlow';

/**
 * Shared, PII-free fixtures for the savings-account creation journeys (Silver 1002, Normal 1001).
 *
 * Two rules, matching the Staff work:
 *   - Applicant data is SYNTHETIC — clearly-fake QA values, never a real person's details.
 *   - Third-party values that must resolve against real systems (the introducer's real name,
 *     the CBS account, the staff code) come from ENV VARS and are never committed. They are the
 *     same variables the Staff flow uses, so one set of secrets serves every scheme.
 *
 * The previous per-flow specs hardcoded a real introducer name, a real CBS account number, a
 * staff code and real email addresses; all of that is removed here.
 */

export const INTRODUCER: IntroducerData = {
  name: process.env.STAFF_INTRODUCER_NAME ?? '',
  accountNumber: process.env.STAFF_CBS_ACCOUNT ?? '',
  periodOfAcquaintance: '5 Years',
};

export const LEAD: LeadDetailsData = {
  leadConverterCode: process.env.STAFF_LEAD_CODE ?? '',
  sourcerCode: process.env.STAFF_LEAD_CODE ?? '',
};

export const NOMINEE: NomineeData = {
  fullName: 'Testnominee Qatest',
  relation: 'Business Associate',
  dob: '1997-07-25',
};

const SYNTHETIC_ADDRESS = {
  line1: 'QA TEST BLOCK 4, AUTOMATION LANE',
  line2: 'NEAR TEST SQUARE',
  state: 'Maharashtra',
  city: 'Nashik',
  pin: '422001',
};

/** A primary applicant. Salaried + Cash so the Employment Info step is exercised and Cheque skipped. */
export const PRIMARY_APPLICANT: PersonData = {
  prefix: 'Mr',
  gender: 'Male',
  email: 'qa.primary.test@example.com',
  maritalStatus: 'Married',
  spouseOrFatherName: 'QA Spouse',
  fatherFirstName: 'Qatest',
  fatherLastName: 'Applicant',
  motherName: 'QA Mother',
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
    organizationName: 'QA Test Solutions',
    annualIncome: '1200000',
    annualTurnover: '1200000',
    sourceOfIncome: 'Salary',
  },
  communicationAddress: { ...SYNTHETIC_ADDRESS },
};

/** The Joint co-applicant. `mobile` is filled in per-run from the co-applicant's env var. */
export function coApplicant(mobile: string): SecondaryPersonData {
  return {
    mobile,
    relationshipWithMain: 'Others',
    prefix: 'Mr',
    gender: 'Male',
    email: 'qa.coapplicant.test@example.com',
    maritalStatus: 'Unmarried',
    fatherFirstName: 'Qatest',
    fatherLastName: 'Coapplicant',
    motherName: 'QA Mother',
    religion: 'Hindu',
    casteCategory: 'General',
    education: 'Graduate',
    region: 'Urban Area',
    employmentType: 'Salaried',
    designation: 'Private Company Employee',
    employmentInfo: {
      category: 'Private Sector Employee – Corporate / MNC',
      organizationName: 'QA Test Solutions',
      annualIncome: '900000',
      sourceOfIncome: 'Salary',
    },
    communicationAddress: { ...SYNTHETIC_ADDRESS },
  };
}

/** The Guardian in a Minor journey. `mobile` is filled in per-run. */
export function guardian(mobile: string): SecondaryPersonData {
  return {
    mobile,
    relationshipWithMain: 'Father',
    prefix: 'Mr',
    gender: 'Male',
    email: 'qa.guardian.test@example.com',
    maritalStatus: 'Married',
    spouseOrFatherName: 'QA Spouse',
    fatherFirstName: 'Qatest',
    fatherLastName: 'Guardian',
    motherName: 'QA Mother',
    religion: 'Hindu',
    casteCategory: 'General',
    education: 'Graduate',
    region: 'Urban Area',
    employmentType: 'Salaried',
    designation: 'Private Company Employee',
    employmentInfo: {
      category: 'Private Sector Employee – Corporate / MNC',
      organizationName: 'QA Test Solutions',
      annualIncome: '900000',
      sourceOfIncome: 'Salary',
    },
    communicationAddress: { ...SYNTHETIC_ADDRESS },
  };
}

/** The Minor applicant. `aadhaarNumber` is supplied per-run from an env var (not committed). */
export function minorApplicant(aadhaarNumber: string): MinorData {
  return {
    firstName: 'Qatest',
    middleName: 'Minor',
    lastName: 'Applicant',
    dob: '2015-06-10',
    aadhaarNumber,
    address: { ...SYNTHETIC_ADDRESS },
    prefix: 'Mr',
    gender: 'Male',
    email: 'qa.minor.test@example.com',
    maritalStatus: 'Unmarried',
    fatherFirstName: 'Qatest',
    fatherLastName: 'Guardian',
    motherName: 'QA Mother',
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
  };
}

/** True once the third-party fixtures needed to finish a journey are present. */
export function hasThirdPartyFixtures(): boolean {
  return !!(INTRODUCER.name && INTRODUCER.accountNumber && LEAD.leadConverterCode);
}

export const THIRD_PARTY_REASON =
  'Introducer/Lead fixtures are not set. Provide STAFF_INTRODUCER_NAME, STAFF_CBS_ACCOUNT and ' +
  'STAFF_LEAD_CODE — the same values the Staff flow uses.';
