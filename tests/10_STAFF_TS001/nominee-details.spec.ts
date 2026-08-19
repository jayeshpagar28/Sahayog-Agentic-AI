import { test, expect } from '@playwright/test';
import { StaffSalaryApplicationPage } from '../pages/savings-application/StaffSalaryApplicationPage';
import { NomineeDetailsStep } from '../pages/savings-application/application-form/NomineeDetailsStep';
import {SYNTHETIC, resumeAndCheckStep, skipMutating, MUTATING_REASON } from './staff-fixtures';

/**
 * Band C — MUTATING. Fills and submits forms on a real application, so it is not idempotent
 * and never runs in CI (see staff-fixtures.ts for the band model). Needs a consumable seed
 * nominated via STAFF_MUTABLE_SEED_ID.
 */
test.describe('STAFF_TS001 - AC18/AC19 Nominee Details', () => {
  test.skip(skipMutating(), MUTATING_REASON);

  let staffPage: StaffSalaryApplicationPage;
  let nominee: NomineeDetailsStep;

  test.beforeEach(async ({ page }) => {
    staffPage = new StaffSalaryApplicationPage(page);
    nominee = new NomineeDetailsStep(page);

    const availability = await resumeAndCheckStep(page, staffPage, NomineeDetailsStep.STEP_LABEL);
    if (availability.skipReason) test.skip(true, availability.skipReason);

    await staffPage.openStep(NomineeDetailsStep.STEP_LABEL);
  });

  test('TC-STAFF-054: Submitting the nominee form blank flags all three mandatory fields', async () => {
    await nominee.submit();

    for (const message of [
      'Full Name is required',
      'Relation of nominee with applicant is required',
      'Date of Birth is required',
    ]) {
      await expect(nominee.page.getByText(message)).toBeVisible();
    }
  });

  /**
   * BR-24 / AC18 — the best-implemented conditional logic in the whole journey, and the
   * highest-value behaviour this step has to protect.
   */
  test('TC-STAFF-140: A minor nominee reveals five mandatory guardian fields', async () => {
    await nominee.fillNominee(
      SYNTHETIC.nominee.fullName,
      SYNTHETIC.nominee.relation,
      SYNTHETIC.nominee.adultDob,
    );
    expect(await nominee.isGuardianBlockVisible(), 'an adult nominee needs no guardian').toBe(false);

    await nominee.setDateOfBirth(SYNTHETIC.nominee.minorDob);
    await nominee.verifyGuardianBlockVisible();

    // And collapses cleanly on correction, leaving no residue.
    await nominee.setDateOfBirth(SYNTHETIC.nominee.adultDob);
    await nominee.verifyGuardianBlockHidden();
  });

  test('TC-STAFF-183: Nominee Age is derived from DOB and read-only', async () => {
    await nominee.setDateOfBirth(SYNTHETIC.nominee.adultDob);

    await expect(nominee.ageInput).toBeDisabled();
    expect(await nominee.getDerivedAge()).not.toBe('');
  });

  /**
   * AC19 — the derived age must be a non-negative integer number of years.
   *
   * D-30: it renders fractionally (e.g. "36.03").
   */
  test('TC-STAFF-056: [D-30] Derived nominee age must be a whole number of years', async () => {
    test.fail(true, 'D-30: Age is computed fractionally and rendered to 2 decimal places (e.g. 36.03).');

    await nominee.setDateOfBirth(SYNTHETIC.nominee.adultDob);

    expect(await nominee.getDerivedAge()).toMatch(/^\d+$/);
  });

  /**
   * AC19 — a future date of birth must be rejected with a message.
   *
   * D-30: the field declares max=today, but the application's own handler accepts a future
   * date anyway, producing a negative age (observed: -4.07).
   */
  test('TC-STAFF-055: [D-30] A future nominee date of birth must be rejected', async () => {
    test.fail(
      true,
      'D-30: a future DOB is accepted by the handler despite the input\'s max attribute, ' +
        'yielding a negative age with no error.',
    );

    const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
    await nominee.setDateOfBirth(tomorrow);

    const age = Number.parseFloat(await nominee.getDerivedAge());
    expect(age, 'a nominee age must never be negative').toBeGreaterThanOrEqual(0);
  });

  test('TC-STAFF-182: The nominee relation list is populated from the API', async ({ page }) => {
    const responsePromise = page
      .waitForResponse((r) => r.url().includes('relation/app/getRelationList'), { timeout: 20000 })
      .catch(() => null);

    const relations = await nominee.getRelationOptions();
    await responsePromise;

    expect(relations.length, 'relation options must be API-populated').toBeGreaterThan(0);
  });

  test('TC-STAFF-139: Nomination is unconditionally mandatory — no decline path exists', async () => {
    // BR-23. Recorded as observed behaviour; FR-G18 proposes offering a decline, which is a
    // product gap awaiting stakeholder sign-off rather than a defect.
    expect(await nominee.hasDeclineNominationControl()).toBe(false);
  });

  test('TC-STAFF-141: The nominee address defaults to the applicant\'s permanent address', async () => {
    await nominee.fillNominee(
      SYNTHETIC.nominee.fullName,
      SYNTHETIC.nominee.relation,
      SYNTHETIC.nominee.adultDob,
    );
    await nominee.submit();
    await nominee.openNomineeAddressForm();

    // BR-25 — "Use Existing Address" opens pre-checked with every field copied across.
    expect(await nominee.isUseExistingAddressChecked()).toBe(true);
  });
});
