import { type Page, test } from '@playwright/test';
import { type OtpSource, resolveOtp } from './signalFile';

/**
 * Shared step library for the Savings Application account-opening journey (Silver 1002 /
 * Normal 1001, all 3 Account Types). Ported from `scripts/live-application/steps.js` — a
 * config-driven CLI tool that drove this exact flow live, repeatedly, against real UAT this
 * session (most recently a full successful submission, SAH-1001-808). Every selector and
 * workaround here is already proven, not re-derived.
 *
 * Unlike the CLI tool (which has to resume an unknown, possibly-mid-flow application across
 * separate process invocations, so it needs an isActive()-detection dispatcher), these
 * functions are called in an explicit, known sequence by a single continuous Playwright test
 * that drove every prior step itself — no "which step are we on" guessing is needed here.
 */

const VALID_UPLOAD_FILE = `${__dirname}/../../.test-upload-files/valid.png`;

export interface AddressData {
  line1: string;
  line2?: string;
  state: string;
  city: string;
  pin: string;
}

export interface EmploymentInfoData {
  category: string;
  organizationName?: string;
  annualIncome?: string;
  annualTurnover?: string;
  sourceOfIncome?: string;
}

export interface ChequeDetailsData {
  chequeNumber: string;
  chequeDate: string;
  draweeBankName: string;
  ifscCode: string;
}

/** Shape shared by the primary applicant, the Joint co-applicant, and the Minor's Guardian. */
export interface PersonData {
  prefix: string;
  gender: string;
  email: string;
  maritalStatus: string;
  spouseOrFatherName?: string;
  fatherFirstName: string;
  fatherLastName: string;
  motherName: string;
  religion?: string;
  casteCategory: string;
  education: string;
  region: string;
  employmentType: string;
  designation: string;
  fundingMode?: string;
  initialFundingAmount?: string;
  expectedValue?: string;
  expectedNumber?: string;
  agricultureIncome?: string;
  otherIncome?: string;
  chequeDetails?: ChequeDetailsData;
  employmentInfo?: EmploymentInfoData;
  communicationAddress: AddressData;
}

export interface SecondaryPersonData extends PersonData {
  mobile: string;
  relationshipWithMain: string;
}

export interface MinorData {
  firstName: string;
  middleName?: string;
  lastName: string;
  dob: string;
  aadhaarNumber: string;
  address: AddressData;
  prefix: string;
  gender: string;
  email?: string;
  maritalStatus: string;
  fatherFirstName: string;
  fatherLastName: string;
  motherName: string;
  religion?: string;
  casteCategory: string;
  education: string;
  region: string;
  employmentType: string;
  designation: string;
  fundingMode: string;
  initialFundingAmount: string;
  expectedValue: string;
  expectedNumber: string;
  agricultureIncome: string;
  otherIncome: string;
}

export interface NomineeData {
  fullName: string;
  relation: string;
  dob: string;
}

export interface DocumentSpec {
  type: string;
}

export interface IntroducerData {
  name: string;
  accountNumber: string;
  periodOfAcquaintance: string;
}

export interface LeadDetailsData {
  leadConverterCode: string;
  sourcerCode: string;
}

// ---------------------------------------------------------------------------
// Shared low-level helpers
// ---------------------------------------------------------------------------

async function bodyText(page: Page, limit = 3000): Promise<string> {
  return (await page.locator('body').innerText()).slice(0, limit);
}

/** PrimeReact dropdowns can silently fail to populate their option list on a fast scripted
 * click - retry opening until at least one option renders. Falls back to the single
 * unambiguous dropdown on screen if the placeholder text no longer matches (e.g. retrying a
 * field that already has a value selected from a prior failed submit attempt). */
async function retryDropdownSelect(page: Page, placeholderText: string, optionText: string, exact = true): Promise<void> {
  let dd = page.locator('.p-dropdown', { hasText: placeholderText });
  if ((await dd.count()) === 0) {
    const anyDd = page.locator('.p-dropdown');
    if ((await anyDd.count()) === 1) dd = anyDd;
  }
  await dd.click();
  let opts = page.getByRole('option', { name: optionText, exact });
  for (let i = 0; i < 6; i++) {
    if ((await opts.count()) > 0) break;
    await page.waitForTimeout(500);
    if (i === 3) await dd.click().catch(() => undefined);
  }
  await opts.first().click();
  await page.waitForTimeout(400);
}

/** Fills an address popup: Address Line 1/2 are <textarea>, not <input>. Tries
 * "Use Existing Address" (Joint/Guardian/Nominee context) or "Same as Permanent address"
 * (primary applicant's own Communication Address) if present, then fills whatever auto-fill
 * left blank (per confirmed defects: auto-fill usually only fills Line 1). */
async function fillAddressPopup(page: Page, addr: AddressData, tryAutoFill = true): Promise<void> {
  if (tryAutoFill) {
    const useExisting = page.getByText('Use Existing Address', { exact: true });
    const sameAsPermanent = page.getByText('Same as Permanent address', { exact: true });
    if ((await useExisting.count()) > 0) {
      await useExisting.click();
      await page.waitForTimeout(1500);
    } else if ((await sameAsPermanent.count()) > 0) {
      await sameAsPermanent.click();
      await page.waitForTimeout(1500);
    }
  }

  const line1 = page.locator('textarea[name="address_line1"]');
  if ((await line1.count()) > 0 && (await line1.inputValue()) === '') {
    await line1.fill(addr.line1);
  }
  const line2 = page.locator('textarea[name="address_line2"]');
  if ((await line2.count()) > 0 && (await line2.inputValue().catch(() => '')) === '') {
    await line2.fill(addr.line2 || addr.line1);
  }

  if ((await page.locator('.p-dropdown', { hasText: 'Select State' }).count()) > 0) {
    await retryDropdownSelect(page, 'Select State', addr.state);
  }
  if ((await page.locator('.p-dropdown', { hasText: 'Select City' }).count()) > 0) {
    await retryDropdownSelect(page, 'Select City', addr.city);
  }

  const pinInput = page.locator('input[placeholder="Pin code"], input[placeholder="Pin Code"]').first();
  if ((await pinInput.inputValue().catch(() => '')) === '') {
    await pinInput.fill(addr.pin);
  }

  const fileInputs = page.locator('input[type="file"]');
  if ((await fileInputs.count()) > 0 && (await page.getByText('Address Proof', { exact: false }).count()) === 0) {
    await fileInputs.first().setInputFiles(VALID_UPLOAD_FILE);
    await page.waitForTimeout(1200);
  }

  const popupSubmit = page.locator('.resendpopupwrap button:visible, [class*="popup" i] button:visible', { hasText: 'Submit' });
  if ((await popupSubmit.count()) > 0) {
    await popupSubmit.first().click();
  } else {
    await page.getByRole('button', { name: 'Submit', exact: true }).last().click();
  }
  await page.waitForTimeout(2500);
}

/** Fail-safe backstop: the Summary/Review page's final action button matches the exact same
 * generic "Submit" selector every other step's submit uses. If some earlier step were ever
 * called out of order while the page is already on Summary, this refuses to click rather
 * than risk firing the real, irreversible final submission (the class of bug that caused a
 * real premature submission, SAH-1001-807, in the CLI tool this was ported from). */
async function assertNotOnSummaryPage(page: Page, caller: string): Promise<void> {
  const text = await bodyText(page, 1500);
  const onSummary = text.includes('Lead Details') && text.includes('Mobile Number Verification') && text.includes('Summary');
  if (onSummary) {
    throw new Error(`Refusing to click Submit from "${caller}" - the page shows the Summary/Review signature.`);
  }
}

async function outerSubmit(page: Page, wait = 3500): Promise<void> {
  await assertNotOnSummaryPage(page, 'outerSubmit');
  await page.locator('button[type="submit"]:visible', { hasText: 'Submit' }).first().click();
  await page.waitForTimeout(wait);
}

/** Branch-change and management-table finalization both require Submit clicked twice: the
 * first only updates local view (zero network calls), the second fires the real save. */
async function twoSubmit(page: Page): Promise<void> {
  await assertNotOnSummaryPage(page, 'twoSubmit');
  await page.locator('button[type="submit"]:visible', { hasText: 'Submit' }).first().click();
  await page.waitForTimeout(2500);
  await assertNotOnSummaryPage(page, 'twoSubmit (2nd click)');
  const submitBtn2 = page.locator('button[type="submit"]:visible', { hasText: 'Submit' });
  if ((await submitBtn2.count()) > 0) {
    await submitBtn2.first().click();
    await page.waitForTimeout(3000);
  }
}

// ---------------------------------------------------------------------------
// Application creation
// ---------------------------------------------------------------------------

export async function openNewApplication(page: Page, scheme: 'silver' | 'normal'): Promise<void> {
  await test.step('Open a new application', async () => {
    const schemeLabel = scheme === 'silver' ? 'Silver Savings Account - 1002' : 'Normal Savings Account - 1001';
    await page.goto('/HOME');
    await page.waitForLoadState('networkidle').catch(() => undefined);
    await page.getByRole('button', { name: 'Savings Application' }).click();
    await page.waitForURL(/\/UNPOSTED/);
    await page.getByText('New Application', { exact: true }).click();
    await page.waitForURL(/\/schemelist/);
    await page.locator('.col-xl-5.buttons-column button.btn').first().waitFor({ state: 'visible', timeout: 15000 });
    await page.locator('.col-xl-5.buttons-column button.btn', { hasText: schemeLabel }).click();
    await page.waitForURL(/\/applndetails/);
    await page.waitForTimeout(1500);
  });
}

/** Looks up the current application's SAH-ID by scheme + mobile via the activity list, for
 * logging/reporting purposes (the panel doesn't show it yet on a freshly-created draft). Waits
 * directly on the `/app/activity/list` response each attempt (bounded, typically 1-3s) instead
 * of a flat sleep, and logs progress - the old flat-sleep version could silently take 1-2
 * minutes across its retries with nothing printed, which reads as "stuck" even when it isn't. */
export async function findApplicationId(page: Page, scheme: 'silver' | 'normal', mobile: string): Promise<string | undefined> {
  const schemeCode = scheme === 'silver' ? '1002' : '1001';
  const maxAttempts = 8;

  const extractMatch = (content: { schemeCode: string; applicantMobile?: string; applicationId: string }[]): string | undefined =>
    // The list is newest-first - take the first match so a stale older record sharing the same
    // mobile (e.g. a not-yet-cancelled prior attempt) never wins over the one this run just made.
    content.find((row) => row.schemeCode === schemeCode && String(row.applicantMobile || '').includes(mobile))?.applicationId;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    console.log(`Looking up the application ID for mobile ${mobile} (attempt ${attempt + 1}/${maxAttempts})...`);
    await page.goto('/HOME');
    const responsePromise = page
      .waitForResponse((res) => res.url().includes('/app/activity/list') && res.request().method() === 'POST', { timeout: 10000 })
      .catch(() => null);
    await page.getByRole('button', { name: 'Savings Application' }).click();
    const response = await responsePromise;

    if (response) {
      try {
        const json = await response.json();
        const content = JSON.parse(json.content || '[]');
        const found = extractMatch(content);
        if (found) {
          // Land back on this application's own detail page, not the bare dashboard list - the
          // lookup necessarily passes through /UNPOSTED to read the activity list, but the caller
          // (completeEkyc etc.) expects to already be on the application page, ready to continue
          // the live journey without a separate re-navigation step.
          await page.waitForURL(/\/UNPOSTED/).catch(() => undefined);
          const row = page.locator('.p-datatable-tbody tr', { hasText: found });
          await row.locator('svg.fa-eye').click();
          await page.waitForURL(/\/applndetails/);
          await page.waitForTimeout(1500);
          return found;
        }
      } catch {
        /* ignore unparsable/unrelated responses and retry */
      }
    }
    await page.waitForTimeout(1500);
  }
  return undefined;
}

/** Finds the Pending application (for the given scheme) with the most stepper progress, for
 * tests that need to resume a real, far-progressed application to exercise its navigation -
 * without depending on one specific hardcoded application ID. A hardcoded ID is fragile on this
 * shared live UAT environment: any Pending application's status can change at any time (moved to
 * Submitted, Decisioned, or cancelled) by a real bank officer or workflow entirely outside this
 * project's control, and both Silver's and Normal's navigation specs have already needed manual
 * fixture rotation more than once for exactly this reason. Picking the deepest-progressed
 * candidate at run time self-heals across that churn instead of needing another rotation every
 * time the current fixture moves on. */
export async function findDeepestPendingApplication(page: Page, schemeCode: '1001' | '1002' | '1003'): Promise<string> {
  interface ActivityRow {
    schemeCode: string;
    applicationId: string;
    currentModuleSequence: number;
  }
  let candidates: ActivityRow[] = [];
  const onResponse = async (res: import('@playwright/test').Response) => {
    if (res.url().includes('/app/activity/list') && res.request().method() === 'POST') {
      try {
        const json = await res.json();
        const content: ActivityRow[] = JSON.parse(json.content || '[]');
        candidates = content.filter((row) => row.schemeCode === schemeCode);
      } catch {
        /* ignore unparsable/unrelated responses */
      }
    }
  };

  page.on('response', onResponse);
  await page.goto('/HOME');
  await page.waitForLoadState('networkidle').catch(() => undefined);
  await page.getByRole('button', { name: 'Savings Application' }).click();
  await page.waitForURL(/\/UNPOSTED/);
  await page.waitForTimeout(2500);
  page.off('response', onResponse);

  if (candidates.length === 0) {
    throw new Error(
      `No Pending application found for scheme ${schemeCode} - these navigation tests need at least one real, far-progressed Pending application to resume. Create one (e.g. via the dedicated live-flow specs) and leave it unsubmitted.`,
    );
  }

  const deepest = candidates.reduce((best, row) => (row.currentModuleSequence > best.currentModuleSequence ? row : best));
  return deepest.applicationId;
}

// ---------------------------------------------------------------------------
// Mobile Number Verification
// ---------------------------------------------------------------------------

/** Fills the mobile field and clicks Send, checking the actual `mobile/verify/save` response
 * instead of assuming success — the backend can silently reject the request (e.g. "Mobile
 * verification request is already in process!" when a number was used too recently) while
 * still returning HTTP 200. */
export async function sendMobileVerification(page: Page, mobile: string): Promise<void> {
  await test.step('Mobile Number Verification: send OTP', async () => {
    const responsePromise = page
      .waitForResponse((res) => res.url().includes('/mobile/verify/save') && res.request().method() === 'POST', { timeout: 15000 })
      .catch(() => null);
    await page.getByPlaceholder('Mobile Number').fill(mobile);
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: 'Send Verification Code' }).click();
    const response = await responsePromise;
    await page.waitForTimeout(2500);

    if (response) {
      const json = await response.json().catch(() => null);
      const result = json?.resultVo;
      if (result?.msgCode === 'MOB_VERIF_FAIL') {
        throw new Error(`Mobile verification send failed for ${mobile}: ${result.msgDescr || 'unknown reason'} - supply a different mobile number.`);
      }
    }
  });
}

/** Obtains the real, SMS-delivered OTP from whichever source is configured (literal env var ->
 * polled endpoint -> signal file a human writes to) and submits it. The literal/endpoint
 * sources are what let a flow run unattended in CI - see `hasUnattendedOtp` in `./signalFile`. */
export async function waitForAndSubmitOtp(page: Page, otpSource: OtpSource, timeoutMs = 5 * 60 * 1000): Promise<void> {
  await test.step('Mobile Number Verification: submit OTP', async () => {
    if (!otpSource.literal && !otpSource.url) {
      console.log(`WAITING_FOR_OTP: write the code to ${otpSource.signalFile} to continue.`);
    }
    const otp = await resolveOtp(otpSource, timeoutMs);
    await page.locator('input[name="mobotp"]').fill(otp);
    await page.waitForTimeout(500);
    await outerSubmit(page);
  });
}

// ---------------------------------------------------------------------------
// Account Type
// ---------------------------------------------------------------------------

const ACCOUNT_TYPE_LABEL: Record<'individual' | 'joint' | 'minor', string> = {
  individual: 'Individual',
  joint: 'Joint',
  minor: 'Minor',
};

/** "Joint" is pre-selected by default even before any user action - always click explicitly. */
export async function selectAccountType(page: Page, accountType: 'individual' | 'joint' | 'minor'): Promise<void> {
  await test.step(`Account Type: select ${accountType}`, async () => {
    await page.getByText(ACCOUNT_TYPE_LABEL[accountType], { exact: true }).first().click();
    await page.waitForTimeout(1000);
    await outerSubmit(page);
  });
}

// ---------------------------------------------------------------------------
// eKYC (DigiLocker) / Liveliness - no typed input, human acts on their own phone.
// Poll the status panel rather than wait on a signal file.
// ---------------------------------------------------------------------------

interface PollOptions {
  /** Real application ID (e.g. "SAH-1002-809") - required so each poll can re-navigate to a
   * genuinely fresh, server-fetched view rather than trust an in-page re-click, which can
   * show stale/cached content on this app's accordion panels. */
  appId: string;
  pollIntervalMs?: number;
  timeoutMs?: number;
  /** Override for how to refresh this step's status between polls. Defaults to
   * `clickInPlaceRefresh` (the page's own refresh control), which is correct for the primary
   * applicant. The secondary applicant (Joint co-applicant / Guardian) needs a different
   * re-entry path instead - resuming via the row always resets to the sub-flow's FIRST inner
   * tab, so it must re-open the management-table row and click the correct inner tab by name;
   * see `reenterSecondaryApplicantTab`. */
  reenter?: (page: Page) => Promise<void>;
}

/** Re-navigates to the application via Home -> Savings Application card -> list -> eye icon
 * (not a plain page.reload(), which does not reliably reflect fresh server status on this
 * app's client-routed panels, and NOT a direct `page.goto('/UNPOSTED')` either - that route
 * has a confirmed defect, BUG-SAD-001 / TC-SAD-045, where direct navigation shows an empty
 * "No Records Found" state instead of real data). This is the exact pattern proven live,
 * repeatedly, in `scripts/live-application/run.js`. Widens the list's page size first since a
 * row can drift off page 1 as other activity happens. */
export async function reopenApplication(page: Page, appId: string): Promise<void> {
  await page.goto('/HOME');
  await page.waitForLoadState('networkidle').catch(() => undefined);
  await page.getByRole('button', { name: 'Savings Application' }).click();
  await page.waitForURL(/\/UNPOSTED/);
  await page.locator('.p-datatable-tbody tr').first().waitFor({ state: 'visible', timeout: 15000 });

  const pageSizeDD = page.locator('.p-paginator .p-dropdown');
  if ((await pageSizeDD.count()) > 0) {
    await pageSizeDD.click();
    await page.waitForTimeout(800);
    const bigOpt = page.getByRole('option', { name: '100' });
    if ((await bigOpt.count()) > 0) {
      await bigOpt.click();
      await page.waitForTimeout(2000);
    } else {
      await page.keyboard.press('Escape');
    }
  }

  const row = page.locator('.p-datatable-tbody tr', { hasText: appId });
  await row.locator('svg.fa-eye').click();
  await page.waitForURL(/\/applndetails/);
  await page.waitForTimeout(2000);
}

/** Clicks the page's own in-panel refresh control (top-right of the stepper header) to re-fetch
 * this step's status in place, instead of leaving the application via the dashboard and
 * re-entering it. Confirmed live: fires the same status-check request (e.g.
 * `/aos/liveliness/status/details`) as the dashboard round-trip did, without navigating away. */
async function clickInPlaceRefresh(page: Page): Promise<void> {
  await page.locator('.refreshsec a.btn').first().click();
  await page.waitForTimeout(1500);
}

/** The eKYC/Liveliness accordion panel is collapsed until its heading is clicked - status
 * text ("Pending"/"Successful"/"Action Required") is invisible until then. Clicks first, then
 * polls the revealed state until Successful, printing a clear prompt so a human watching the
 * test output knows to go act on their phone. */
export async function completeEkyc(page: Page, opts: PollOptions): Promise<void> {
  await test.step('eKYC Verification (DigiLocker)', async () => {
    const heading = page.getByText('Aadhaar Verification through DigiLocker', { exact: false });
    await heading.first().click();
    await page.waitForTimeout(1500);

    let text = await bodyText(page);
    if (!text.includes('Successful') && !text.includes('Pending') && !text.includes('Action Required')) {
      const sendLinkBtn = page.getByRole('button', { name: 'Send Link' });
      if ((await sendLinkBtn.count()) > 0) {
        await sendLinkBtn.click();
        await page.waitForTimeout(3000);
      }
    }

    console.log(`MANUAL ACTION NEEDED: complete Aadhaar DigiLocker authorization on your phone for ${opts.appId}.`);
    const pollInterval = opts.pollIntervalMs ?? 15000;
    const timeout = opts.timeoutMs ?? 8 * 60 * 1000;
    const start = Date.now();
    let resent = false;
    const reenter = opts.reenter ?? clickInPlaceRefresh;

    while (Date.now() - start < timeout) {
      await page.waitForTimeout(pollInterval);
      await reenter(page);
      await heading.first().click();
      await page.waitForTimeout(1200);
      text = await bodyText(page);

      if (text.includes('Successful')) {
        await outerSubmit(page);
        return;
      }
      if (text.includes('Action Required') && !resent) {
        const resend = page.getByText('Resend Link', { exact: true });
        if ((await resend.count()) > 0) {
          await resend.click();
          await page.waitForTimeout(3000);
          resent = true;
          console.log(`MANUAL ACTION NEEDED: DigiLocker link resent for ${opts.appId} (previous attempt showed Action Required).`);
        }
      }
    }
    throw new Error(`Timed out after ${timeout}ms waiting for DigiLocker eKYC to complete for ${opts.appId}.`);
  });
}

export async function completeLiveliness(page: Page, opts: PollOptions): Promise<void> {
  await test.step('Liveliness Verification', async () => {
    const heading = page.getByText('Security Code Based Liveliness Verification', { exact: false });
    await heading.first().click();
    await page.waitForTimeout(1500);

    let text = await bodyText(page);
    if (!text.includes('Successful') && !text.includes('Pending')) {
      const sendLinkBtn = page.getByRole('button', { name: 'Send Link' });
      if ((await sendLinkBtn.count()) > 0) {
        await sendLinkBtn.click();
        await page.waitForTimeout(3000);
      }
    }

    console.log(`MANUAL ACTION NEEDED: complete Security Code Based Liveliness Verification on your phone for ${opts.appId}.`);
    const pollInterval = opts.pollIntervalMs ?? 15000;
    const timeout = opts.timeoutMs ?? 8 * 60 * 1000;
    const start = Date.now();
    const reenter = opts.reenter ?? clickInPlaceRefresh;

    while (Date.now() - start < timeout) {
      await page.waitForTimeout(pollInterval);
      await reenter(page);
      await heading.first().click();
      await page.waitForTimeout(1200);
      text = await bodyText(page);

      if (text.includes('Successful')) {
        await outerSubmit(page);
        return;
      }
    }
    throw new Error(`Timed out after ${timeout}ms waiting for Liveliness Verification to complete for ${opts.appId}.`);
  });
}

// ---------------------------------------------------------------------------
// Minor KYC Details (replaces eKYC + Liveliness for the minor themselves)
// ---------------------------------------------------------------------------

export async function fillMinorKycDetails(page: Page, minor: MinorData): Promise<void> {
  await test.step('Minor KYC Details', async () => {
    await page.locator('input[name="first_name"]').fill(minor.firstName);
    await page.locator('input[name="middle_name"]').fill(minor.middleName || '');
    await page.locator('input[name="last_name"]').fill(minor.lastName);
    await page.locator('input[name="dob"]').fill(minor.dob);
    await retryDropdownSelect(page, 'Select Identification Document', 'AADHAAR CARD', false);
    await page.locator('input[name="doc_identification_number"]').fill(minor.aadhaarNumber);
    await page.locator('input[type="file"]').first().setInputFiles(VALID_UPLOAD_FILE);
    await page.waitForTimeout(1500);
    await outerSubmit(page, 4000);
  });
}

// ---------------------------------------------------------------------------
// Address Details
// ---------------------------------------------------------------------------

export async function fillAddressDetails(page: Page, address: AddressData): Promise<void> {
  await test.step('Address Details', async () => {
    const addBtnLocator = page.getByText('Click Here For Add Address', { exact: false });
    const count = await addBtnLocator.count();
    for (let i = 0; i < count; i++) {
      const btn = page.getByText('Click Here For Add Address', { exact: false }).first();
      if ((await btn.count()) === 0) break;
      await btn.click();
      await page.waitForTimeout(2000);
      await fillAddressPopup(page, address);
    }
    await outerSubmit(page);
  });
}

// ---------------------------------------------------------------------------
// Branch Selection
// ---------------------------------------------------------------------------

export async function selectBranch(page: Page, opts: { change: boolean; branchName?: string }): Promise<void> {
  await test.step('Branch Selection', async () => {
    if (opts.change && opts.branchName) {
      await page.getByText('Change Branch?', { exact: true }).click();
      await page.waitForTimeout(1500);
      await page.getByText(opts.branchName, { exact: true }).click();
      await page.waitForTimeout(1000);
      await twoSubmit(page);
    } else {
      await outerSubmit(page);
    }
  });
}

// ---------------------------------------------------------------------------
// Basic Details
// ---------------------------------------------------------------------------

interface BasicDetailsOptions {
  includeRelationship: boolean;
  includeFundingMode: boolean;
  modeOfOperation?: string;
}

async function fillBasicDetailsForm(page: Page, data: PersonData & { relationshipWithMain?: string }, opts: BasicDetailsOptions): Promise<void> {
  if (opts.includeRelationship && data.relationshipWithMain) {
    await retryDropdownSelect(page, 'Select Relationship with', data.relationshipWithMain, false);
  }
  if (opts.modeOfOperation) {
    await retryDropdownSelect(page, 'Select Mode of Operation', opts.modeOfOperation).catch(() => undefined);
  }
  await retryDropdownSelect(page, 'Select Prefix', data.prefix);
  await retryDropdownSelect(page, 'Select Gender', data.gender);
  await retryDropdownSelect(page, 'Select Marital Status', data.maritalStatus);
  if (data.religion) await retryDropdownSelect(page, 'Select Religion', data.religion);
  await retryDropdownSelect(page, 'Select Caste Category', data.casteCategory);
  await retryDropdownSelect(page, 'Select Education/Qualification', data.education);
  await retryDropdownSelect(page, 'Select Region', data.region);
  await retryDropdownSelect(page, 'Select Employment Type', data.employmentType);
  await retryDropdownSelect(page, 'Select Designation/Profession', data.designation);
  if (opts.includeFundingMode && data.fundingMode) {
    await retryDropdownSelect(page, 'Select Funding Mode', data.fundingMode);
  }

  const emailInput = page.locator('input[placeholder="Email ID"]');
  if ((await emailInput.count()) > 0 && data.email) {
    await emailInput.fill(data.email);
  }
  await page.locator('input[placeholder="Father First Name"]').fill(data.fatherFirstName);
  await page.locator('input[placeholder="Father Last Name"]').fill(data.fatherLastName);
  await page.locator("input[placeholder=\"Mother's Name\"]").fill(data.motherName);
  const spouseInput = page.locator("input[placeholder=\"Spouse / Father's Name\"]");
  if ((await spouseInput.count()) > 0 && data.spouseOrFatherName) {
    await spouseInput.fill(data.spouseOrFatherName);
  }

  const fundingFields: [string, string | undefined][] = [
    ['input[placeholder="Initial Funding Amount"]', data.initialFundingAmount],
    ['input[placeholder="Expected Value of Transaction (yearly)"]', data.expectedValue],
    ['input[placeholder="Expected Number of Transaction (yearly)"]', data.expectedNumber],
    ['input[placeholder="Agriculture Income"]', data.agricultureIncome],
    ['input[placeholder="Other Than Agricultural Income"]', data.otherIncome],
  ];
  for (const [selector, value] of fundingFields) {
    const el = page.locator(selector);
    if ((await el.count()) > 0 && value !== undefined) await el.fill(value);
  }
}

/** Basic Details has no partial save - any validation failure wipes the whole form. Retries
 * once with the dot stripped from the email local-part if rejected (confirmed defect: the
 * app rejects e.g. "first.last@x.com" while accepting "firstlast@x.com"). */
export async function fillBasicDetails(page: Page, data: PersonData & { relationshipWithMain?: string }, opts: BasicDetailsOptions): Promise<void> {
  await test.step('Basic Details', async () => {
    await fillBasicDetailsForm(page, data, opts);
    await outerSubmit(page);

    const text = await bodyText(page, 500);
    if (text.includes('Enter Valid Email ID') && data.email.includes('.')) {
      const fixedEmail = data.email.replace(/\.(?=[^@]*@)/, '');
      await fillBasicDetailsForm(page, { ...data, email: fixedEmail }, opts);
      await outerSubmit(page);
    }
  });
}

// ---------------------------------------------------------------------------
// Cheque Details (dynamic - Funding Mode = Cheque only)
// ---------------------------------------------------------------------------

export async function fillChequeDetails(page: Page, cheque: ChequeDetailsData): Promise<void> {
  if ((await page.locator('input[name="cheque_date"]').count()) === 0) return;
  await test.step('Cheque Details', async () => {
    await page.locator('input[placeholder="Cheque Number"]').fill(cheque.chequeNumber);
    await page.locator('input[name="cheque_date"]').fill(cheque.chequeDate);
    await page.locator('input[name="drawee_bank_name"]').fill(cheque.draweeBankName);
    await page.locator('input[name="drawee_bank_ifsc"]').fill(cheque.ifscCode);
    await page.waitForTimeout(500);
    await outerSubmit(page);
  });
}

// ---------------------------------------------------------------------------
// Employment Information (Salaried vs Self Employed - dispatches on field set)
// ---------------------------------------------------------------------------

export async function fillEmploymentInfo(page: Page, info: EmploymentInfoData): Promise<void> {
  const hasAnnualIncome = (await page.locator('input[placeholder="Annual Income"]').count()) > 0;
  const hasAnnualTurnover = (await page.locator('input[placeholder="Annual Turnover"]').count()) > 0;
  if (!hasAnnualIncome && !hasAnnualTurnover) return; // e.g. Unemployed skips this step entirely

  await test.step('Employment Information', async () => {
    await page.locator('.p-dropdown', { hasText: 'Select Category' }).click();
    await page.waitForTimeout(800);
    await page.getByRole('option', { name: info.category, exact: false }).first().click();
    await page.waitForTimeout(500);

    await page.locator('input[name="organization_name"]').fill(info.organizationName || '');

    const annualIncomeInput = page.locator('input[placeholder="Annual Income"]');
    if ((await annualIncomeInput.count()) > 0) {
      await annualIncomeInput.fill(String(info.annualIncome ?? ''));
    }
    const annualTurnoverInput = page.locator('input[placeholder="Annual Turnover"]');
    if ((await annualTurnoverInput.count()) > 0) {
      await annualTurnoverInput.fill(String(info.annualTurnover ?? info.annualIncome ?? ''));
    }
    await page.locator('input[name="income_source"]').fill(info.sourceOfIncome || '');
    await page.waitForTimeout(500);
    await outerSubmit(page);
  });
}

// ---------------------------------------------------------------------------
// Applicant Photo (Verified Photo first, camera capture fallback)
// ---------------------------------------------------------------------------

async function captureViaCamera(page: Page): Promise<void> {
  await page.getByText('Capture Using Camera', { exact: true }).first().click();
  await page.waitForFunction(
    () => {
      const v = document.querySelector('video');
      return !!v && v.readyState >= 2 && v.videoWidth > 0;
    },
    null,
    { timeout: 15000 },
  );
  await page.waitForTimeout(1000);
  await page.getByText('Capture photo', { exact: true }).click();
  await page.waitForTimeout(2500);
}

/** Not every flow has a distinct top-level Applicant Photo step for every actor (e.g. it's
 * unconfirmed whether the Minor themselves gets one, separate from the Guardian's own, which
 * definitely has one within their sub-journey) - no-ops if this panel isn't actually showing. */
export async function fillApplicantPhoto(page: Page): Promise<void> {
  const onPhotoPanel = (await page.getByText('Upload Applicant Photo', { exact: false }).count()) > 0
    || (await page.getByText('Verified Photo', { exact: true }).count()) > 0;
  if (!onPhotoPanel) return;

  await test.step('Applicant Photo', async () => {
    const verifiedPhotoBtn = page.getByText('Verified Photo', { exact: true });
    let photoDone = false;
    if ((await verifiedPhotoBtn.count()) > 0) {
      await verifiedPhotoBtn.click();
      await page.waitForTimeout(2000);
      const toastText = await bodyText(page, 500);
      if (!toastText.includes('No Verified Photos Available')) {
        const dd = page.locator('.p-dropdown', { hasText: 'Select Verified Photo' });
        const popupSubmit = page.locator('.resendpopupwrap button:visible, .resendpopupsection ~ button:visible, [class*="popup" i] button:visible', { hasText: 'Submit' });
        if ((await dd.count()) > 0) {
          await dd.click();
          await page.waitForTimeout(1000);
          await page.getByRole('option').first().click();
          await page.waitForTimeout(1000);
          await popupSubmit.first().click();
          await page.waitForTimeout(2000);
        } else if ((await popupSubmit.count()) > 0) {
          // No dropdown - this scheme variant shows the verified (DigiLocker) photo directly
          // as an image preview popup instead; just confirm/submit it as-is.
          await popupSubmit.first().click();
          await page.waitForTimeout(2000);
        }
        // Confirmed defect: this Submit can silently no-op (observed with an oversized
        // DigiLocker source image, ~5MB, no error shown) - only trust it succeeded if the
        // popup actually closed. Otherwise fall through to file upload/camera below rather
        // than leave the popup open to intercept later clicks.
        photoDone = (await page.locator('.resendpopupsection').count()) === 0;
      }
    }
    if (!photoDone) {
      // Defensive: close any leftover popup/preview overlay before trying file upload/camera,
      // since an open overlay can intercept pointer events on the elements underneath it.
      const leftoverPopupClose = page.locator(
        '.resendpopupwrap [aria-label="Close"], .resendpopupwrap .close, .resendpopupwrap svg.fa-times, .resendpopupwrap button:visible',
        { hasText: /close|cancel/i },
      );
      if ((await leftoverPopupClose.count()) > 0) {
        await leftoverPopupClose.first().click().catch(() => undefined);
        await page.waitForTimeout(1000);
      }
    }
    if (!photoDone) {
      const fileInputs = page.locator('input[type="file"]');
      if ((await fileInputs.count()) > 0) {
        await fileInputs.first().setInputFiles(VALID_UPLOAD_FILE);
        await page.waitForTimeout(1500);
        photoDone = true;
      }
    }
    if (!photoDone) {
      await captureViaCamera(page);
    }

    const afterPhotoText = await bodyText(page, 2000);
    const stillNeedsSignature = !afterPhotoText.includes('Document Uploaded') || (afterPhotoText.match(/Document Uploaded/g) || []).length < 2;
    if (stillNeedsSignature) {
      const fileInputs = page.locator('input[type="file"]');
      if ((await fileInputs.count()) > 0) {
        await fileInputs.first().setInputFiles(VALID_UPLOAD_FILE);
        await page.waitForTimeout(1500);
      } else {
        await captureViaCamera(page);
      }
    }

    await outerSubmit(page);
  });
}

// ---------------------------------------------------------------------------
// Secondary Applicant (Joint Applicant Details / Guardian Details)
// ---------------------------------------------------------------------------

export interface SecondaryApplicantOptions {
  kind: 'joint' | 'guardian';
  data: SecondaryPersonData;
  otpSource: OtpSource;
  /** Real application ID (e.g. "SAH-1002-809") - needed to re-navigate back into this row
   * during eKYC/Liveliness polling. */
  appId: string;
  otpTimeoutMs?: number;
  pollIntervalMs?: number;
  pollTimeoutMs?: number;
}

/** Re-enters the secondary applicant's row after a full application reopen, then clicks the
 * named inner tab - resuming a row always resets its sub-stepper to the FIRST inner tab
 * regardless of actual progress, so the correct inner tab must be navigated to explicitly.
 * `.last()` targets the inner tab specifically, since an outer tab of the same name also
 * exists in the DOM. */
function reenterSecondaryApplicantTab(page: Page, appId: string, innerTabName: string): (p: Page) => Promise<void> {
  return async () => {
    await reopenApplication(page, appId);
    await page.getByText('NA', { exact: true }).first().click();
    await page.waitForTimeout(2000);
    const innerTab = page.getByText(innerTabName, { exact: true }).last();
    if ((await innerTab.count()) > 0) {
      await innerTab.click();
      await page.waitForTimeout(1500);
    }
  };
}

/** Drives the entire secondary applicant's (Joint co-applicant / Minor's Guardian) own
 * sub-journey inside the management-table row - their own mobile+OTP, eKYC, Liveliness,
 * Address, Basic Details, Employment, Photo - then finalizes the row (two-submit), all in one
 * continuous pass since this is a live, forward-driving run (never a cold resume). */
export async function fillSecondaryApplicant(page: Page, opts: SecondaryApplicantOptions): Promise<void> {
  const tableHeading = opts.kind === 'joint' ? 'Joint Applicant Details' : 'Guardian Details';

  await test.step(`${tableHeading}: open row`, async () => {
    // On a fresh forward-driving run this panel shows either "+ Add" (no row yet) or "NA" (a row
    // exists, click to open it). But re-entering a resumed application can land directly on the
    // already-open sub-form (e.g. its Mobile Number field) with neither of those present -
    // checking for that first avoids hanging on a click target that will never appear.
    const alreadyOnForm = (await page.locator('input[name="applicant_mobile"]').count()) > 0;
    if (alreadyOnForm) return;

    const addBtn = page.getByText('+ Add', { exact: true });
    if ((await addBtn.count()) > 0) {
      await addBtn.click();
    } else {
      await page.getByText('NA', { exact: true }).first().click();
    }
    await page.waitForTimeout(2000);
  });

  await sendMobileVerification(page, opts.data.mobile);
  await waitForAndSubmitOtp(page, opts.otpSource, opts.otpTimeoutMs);
  await completeEkyc(page, {
    appId: opts.appId,
    pollIntervalMs: opts.pollIntervalMs,
    timeoutMs: opts.pollTimeoutMs,
    reenter: clickInPlaceRefresh,
  });
  await completeLiveliness(page, {
    appId: opts.appId,
    pollIntervalMs: opts.pollIntervalMs,
    timeoutMs: opts.pollTimeoutMs,
    reenter: clickInPlaceRefresh,
  });
  await fillAddressDetails(page, opts.data.communicationAddress);
  await fillBasicDetails(page, opts.data, { includeRelationship: true, includeFundingMode: false });
  if (opts.data.employmentInfo) {
    await fillEmploymentInfo(page, opts.data.employmentInfo);
  }
  await fillApplicantPhoto(page);

  await test.step(`${tableHeading}: finalize row`, async () => {
    const rowSubmit = page.locator('table tbody tr button:visible', { hasText: 'Submit' }).first();
    if ((await rowSubmit.count()) > 0) {
      await rowSubmit.click();
      await page.waitForTimeout(2500);
    }
    await outerSubmit(page);
  });
}

// ---------------------------------------------------------------------------
// Nominee Details + nested Address
// ---------------------------------------------------------------------------

export async function fillNomineeDetails(page: Page, nominee: NomineeData): Promise<void> {
  await test.step('Nominee Details', async () => {
    await page.getByPlaceholder('Full Name').fill(nominee.fullName);
    await retryDropdownSelect(page, 'Select', nominee.relation);
    await page.locator('input[type="date"]').first().fill(nominee.dob);
    await page.waitForTimeout(500);
    await outerSubmit(page);
  });
}

export async function fillNomineeAddress(page: Page, nominee: NomineeData, address: AddressData): Promise<void> {
  const addrTabExists = (await page.getByText('Address Details (Nominee)', { exact: false }).count()) > 0;
  const addBtnExists = (await page.getByText('Click Here For Add Address', { exact: false }).count()) > 0;
  if (!addrTabExists && !addBtnExists) return; // no separate nominee-address step in this scheme/flow

  await test.step('Address Details (Nominee)', async () => {
    if (!addBtnExists) {
      const nameCell = page.getByText(nominee.fullName, { exact: true }).first();
      if ((await nameCell.count()) > 0) {
        await nameCell.click();
        await page.waitForTimeout(2000);
        const addrTab = page.getByText('Address Details (Nominee)', { exact: true });
        if ((await addrTab.count()) > 0) {
          await addrTab.click();
          await page.waitForTimeout(1500);
        }
      }
    }
    const addBtn = page.getByText('Click Here For Add Address', { exact: false }).first();
    if ((await addBtn.count()) > 0) {
      await addBtn.click();
      await page.waitForTimeout(2000);
      const useExisting = page.getByText('Use Existing Address', { exact: true });
      if ((await useExisting.count()) > 0) await useExisting.click();
      await page.waitForTimeout(1500);
      await fillAddressPopup(page, address, false);
    }
    await outerSubmit(page);
  });
}

// ---------------------------------------------------------------------------
// Document Upload
// ---------------------------------------------------------------------------

/** Uploads the mandatory-marked document type first/alone - uploading an optional document
 * before a still-outstanding mandatory one causes it to be silently dropped on submit
 * (confirmed defect). Callers should list the mandatory document first in `documents`. */
export async function uploadDocuments(page: Page, documents: DocumentSpec[]): Promise<void> {
  await test.step('Document Upload', async () => {
    for (const doc of documents) {
      const dd = page.locator('.p-dropdown', { hasText: 'Select' }).first();
      await dd.click();
      await page.waitForTimeout(1000);
      await page.getByRole('option', { name: doc.type, exact: false }).click();
      await page.waitForTimeout(1000);
      await page.locator('input[type="file"]').first().setInputFiles(VALID_UPLOAD_FILE);
      await page.waitForTimeout(1500);
      await outerSubmit(page);
      const text = await bodyText(page, 500);
      if (!/Please Upload/.test(text)) break; // advanced past Document Upload
    }
  });
}

// ---------------------------------------------------------------------------
// Introducer Details (skipped gracefully if the tab never appears for this
// scheme/Account-Type combination, e.g. Silver Individual/Minor)
// ---------------------------------------------------------------------------

export async function fillIntroducerDetails(page: Page, introducer: IntroducerData): Promise<void> {
  if ((await page.locator('input[name="introducer_name"]').count()) === 0) return;
  await test.step('Introducer Details', async () => {
    await page.locator('input[name="introducer_name"]').fill(introducer.name);
    await page.locator('input[name="introducer_bank_acc"]').fill(introducer.accountNumber);
    await page.locator('input[name="introducer_period"]').fill(introducer.periodOfAcquaintance);
    await page.waitForTimeout(500);
    await outerSubmit(page, 4000);
  });
}

// ---------------------------------------------------------------------------
// Lead Details
// ---------------------------------------------------------------------------

export async function fillLeadDetails(page: Page, lead: LeadDetailsData): Promise<void> {
  await test.step('Lead Details', async () => {
    await page.locator('input[name="lead_converter_code"]').fill(lead.leadConverterCode);
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: 'Verify' }).first().click();
    await page.waitForTimeout(2500);

    await page.locator('input[name="lead_generator_code"]').fill(lead.sourcerCode);
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: 'Verify' }).first().click();
    await page.waitForTimeout(2500);

    await outerSubmit(page, 4000);
  });
}

// ---------------------------------------------------------------------------
// Summary + Final Submit
// ---------------------------------------------------------------------------

export async function getSummaryText(page: Page): Promise<string> {
  return bodyText(page, 8000);
}

/** The one and only place the real, irreversible final submission is fired from. Confirmed live:
 * an earlier step left mandatory-field validation errors unresolved (Lead Details) and the flow
 * never actually advanced to Summary, yet this function still clicked *a* local "Submit" button
 * that matched the generic selector - silently "succeeding" from the caller's perspective while
 * firing no real submission at all. Verifying the Summary/Review signature first turns that into
 * a loud, immediate failure instead. */
export async function finalSubmit(page: Page): Promise<{ status: number; body: string | null }[]> {
  return test.step('Summary: final Submit', async () => {
    const text = await bodyText(page, 1500);
    const onSummary = text.includes('Lead Details') && text.includes('Mobile Number Verification') && text.includes('Summary');
    if (!onSummary) {
      throw new Error('finalSubmit called but the page does not show the Summary/Review signature - an earlier step likely failed to actually advance. Refusing to click Submit.');
    }

    const submitCalls: { status: number; body: string | null }[] = [];
    page.on('response', async (res) => {
      if (res.url().includes('summary/submit') && res.request().method() === 'POST') {
        let body: string | null = null;
        try {
          body = await res.text();
        } catch {
          /* ignore */
        }
        submitCalls.push({ status: res.status(), body });
      }
    });
    await page.locator('button[type="submit"]:visible', { hasText: 'Submit' }).first().click();
    await page.waitForTimeout(4500);
    return submitCalls;
  });
}
