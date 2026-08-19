import { test, expect } from '@playwright/test';
import { StaffSalaryApplicationPage } from '../pages/savings-application/StaffSalaryApplicationPage';
import { IntroducerDetailsStep } from '../pages/savings-application/application-form/IntroducerDetailsStep';
import { LeadDetailsStep } from '../pages/savings-application/application-form/LeadDetailsStep';
import {
  CBS_ACCOUNT_NUMBER,
  CBS_REASON,
  LEAD_STAFF_CODE,
  LEAD_REASON,
  INTRODUCER_NAME,
  SYNTHETIC,
  resumeAndCheckStep,
  skipMutating,
  MUTATING_REASON,
} from './staff-fixtures';

/**
 * Band C — MUTATING. Submits Introducer and Lead Details on a real application (the introducer
 * step performs a live Core Banking System lookup), so it is not idempotent and never runs in
 * CI. Needs a consumable seed via STAFF_MUTABLE_SEED_ID.
 */
test.describe('STAFF_TS001 - AC20 Introducer Details (CBS)', () => {
  test.skip(skipMutating(), MUTATING_REASON);

  let staffPage: StaffSalaryApplicationPage;
  let introducer: IntroducerDetailsStep;

  test.beforeEach(async ({ page }) => {
    staffPage = new StaffSalaryApplicationPage(page);
    introducer = new IntroducerDetailsStep(page);

    const availability = await resumeAndCheckStep(page, staffPage, IntroducerDetailsStep.STEP_LABEL);
    if (availability.skipReason) test.skip(true, availability.skipReason);

    await staffPage.openStep(IntroducerDetailsStep.STEP_LABEL);
  });

  test('TC-STAFF-057: Submitting the introducer form blank flags all three mandatory fields', async () => {
    await introducer.submitButton.click();

    await introducer.verifyAllMandatoryErrorsShown();
  });

  test('TC-STAFF-018/143: A valid CBS account resolves and the step advances', async () => {
    test.skip(!CBS_ACCOUNT_NUMBER, CBS_REASON);

    // The real account holder's name, supplied by env var — a mismatched name would make
    // the CBS isNameMismatch result meaningless.
    await introducer.fillIntroducer(
      INTRODUCER_NAME || SYNTHETIC.introducerName,
      CBS_ACCOUNT_NUMBER,
      SYNTHETIC.periodOfAcquaintance,
    );

    // Asserts on *advancing*, never on the absence of an error — see D-31.
    await introducer.submitAndExpectAdvance();
  });

  /**
   * AC20 — an introducer account the Core Banking System cannot resolve must produce an
   * actionable error, distinguishable from a click that did nothing.
   *
   * D-31: `introducer/save/details` returns HTTP 200 carrying
   * {"msgCode":"503","msgDescr":"CBS connection error","success":"FALSE"} and the UI shows
   * absolutely nothing — no message, no highlight, not even a console error. The most
   * user-hostile failure found anywhere in this journey.
   *
   * The response body is captured so the test proves the server *did* report a failure that
   * the UI then swallowed, rather than merely observing that nothing happened.
   */
  test('TC-STAFF-058: [D-31] An unresolvable introducer account must surface an error', async () => {
    test.fail(
      true,
      'D-31: a CBS failure returns 503-inside-200 and the UI displays nothing at all — the ' +
        'user sees a click that did nothing.',
    );

    await introducer.fillIntroducer(SYNTHETIC.introducerName, '0000000000', SYNTHETIC.periodOfAcquaintance);
    const response = await introducer.submitAndCaptureResponse();

    // The server reported a failure...
    expect(String(response.success ?? '')).toBe('FALSE');
    // ...so the user must be told about it.
    expect(await introducer.hasVisibleErrorMessage(), 'a CBS failure must be visible to the user').toBe(true);
  });
});

test.describe('STAFF_TS001 - BR-28 Lead Details', () => {
  test.skip(skipMutating(), MUTATING_REASON);
  test.skip(!LEAD_STAFF_CODE, LEAD_REASON);

  let staffPage: StaffSalaryApplicationPage;
  let lead: LeadDetailsStep;

  test.beforeEach(async ({ page }) => {
    staffPage = new StaffSalaryApplicationPage(page);
    lead = new LeadDetailsStep(page);

    const availability = await resumeAndCheckStep(page, staffPage, LeadDetailsStep.STEP_LABEL);
    if (availability.skipReason) test.skip(true, availability.skipReason);

    await staffPage.openStep(LeadDetailsStep.STEP_LABEL);
  });

  test('TC-STAFF-073/228: A verified code resolves to a staff name and locks its input', async () => {
    await lead.leadConverterCodeInput.fill(LEAD_STAFF_CODE);
    await lead.verifyLeadConverterCode();

    expect(await lead.isVerified('converter')).toBe(true);
    expect(await lead.getResolvedName('converter'), 'the code must resolve to a staff name').not.toBe('');
  });

  /**
   * D-34 — clicking Verify on the Lead Converter Code silently clears anything already typed
   * into Sourcer Code. Same class of fault as D-20 (the address form's vanishing pin code).
   */
  test('TC-STAFF-059: [D-34] Verifying one lead code must not clear the other', async () => {
    test.fail(true, 'D-34: verifying the Lead Converter Code silently wipes the Sourcer Code field.');

    await lead.sourcerCodeInput.fill(LEAD_STAFF_CODE);
    await lead.leadConverterCodeInput.fill(LEAD_STAFF_CODE);
    await lead.verifyLeadConverterCode();

    expect(await lead.getSourcerCodeValue(), 'Sourcer Code must survive the other field\'s verification').toBe(
      LEAD_STAFF_CODE,
    );
  });

  /**
   * D-38 — the same staff code is accepted for both roles, resolving to the same person
   * twice. Confirmed live on 2026-08-18: both fields read "Name: PAVAN KISAN SHEWALE".
   */
  test('TC-STAFF-060/145: [D-38] Lead Converter and Sourcer must be distinct parties', async () => {
    test.fail(true, 'D-38: no separation of duties is enforced — one staff code fills both roles.');

    await lead.verifyBothCodes(LEAD_STAFF_CODE, LEAD_STAFF_CODE);

    expect(
      await lead.getResolvedName('sourcer'),
      'the Sourcer must not resolve to the same person as the Lead Converter',
    ).not.toBe(await lead.getResolvedName('converter'));
  });
});
