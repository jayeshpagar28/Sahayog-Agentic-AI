import { test, expect, type Page } from '@playwright/test';
import { StaffSalaryApplicationPage } from '../pages/savings-application/StaffSalaryApplicationPage';
import { StaffJourneySteps } from '../pages/savings-application/application-form/StaffJourneySteps';
import { AddressDetailsStep } from '../pages/savings-application/application-form/AddressDetailsStep';
import { NomineeDetailsStep } from '../pages/savings-application/application-form/NomineeDetailsStep';
import { IntroducerDetailsStep } from '../pages/savings-application/application-form/IntroducerDetailsStep';
import { LeadDetailsStep } from '../pages/savings-application/application-form/LeadDetailsStep';
import { SummaryPage } from '../pages/savings-application/application-form/SummaryPage';
import { WorkflowConfig } from '../pages/savings-application/application-form/WorkflowConfig';
import {
  MUTABLE_SEED_ID,
  MUTATING_REASON,
  skipMutating,
  CBS_ACCOUNT_NUMBER,
  LEAD_STAFF_CODE,
  INTRODUCER_NAME,
  SYNTHETIC,
} from './staff-fixtures';

/**
 * END-TO-END JOURNEY — Address Details through to the Summary, in one pass.
 *
 * ## Why this file exists
 *
 * The per-step specs each need the seed parked immediately before their own step, and a single
 * application can only ever be in one place. Worse, `INTRODUCER_DETAILS` and `LEAD_DETAILS` are
 * `isEditable: 0` — once submitted they lock permanently, so their forms can NEVER be re-opened
 * on that application. Running those assertions therefore requires driving a fresh application
 * through the journey, asserting each form while it is open.
 *
 * That is what this does: every functional assertion executes, on one seed, in one ordered pass.
 * Nothing is skipped for want of the right seed position.
 *
 * ## What still needs a human, and why that is irreducible
 *
 * Only the three gates BEFORE this file's starting point: SMS OTP, DigiLocker consent and the
 * Liveliness check. They require a real handset and a physically present applicant, so they are
 * built once by `npm run staff:seed`. Everything after Liveliness is fully automated here.
 *
 * ## Safety
 *
 * ⚠️ Mutating and NOT idempotent — it advances a real application permanently, so it never runs
 * in CI and demands a seed explicitly nominated as consumable (`STAFF_MUTABLE_SEED_ID`).
 * ⚠️ The Summary's Submit is inspected, never clicked.
 *
 * Run:
 *   STAFF_MUTABLE_SEED_ID=SAH-1003-nnn STAFF_CBS_ACCOUNT=... STAFF_LEAD_CODE=... \
 *   npx playwright test tests/10_STAFF_TS001/staff-salary-journey.spec.ts --project=chromium-camera
 */

/**
 * Where a step currently sits, read from `aos/steps/getdetails` (the server's own record).
 *
 * The journey advances the application permanently, so a re-run legitimately finds earlier
 * steps already submitted — and a submitted step with `isEditable: 0` (Branch Selection,
 * Salaried Information, Introducer, Lead) re-opens with no Submit button at all. Without this
 * check a second run dies on the first completed step instead of continuing from where the
 * application actually is.
 */
type StepState = 'pending' | 'submitted' | 'unreached';

async function resumeAndGetStepState(
  page: Page,
  staffPage: StaffSalaryApplicationPage,
  stepDesc: string,
): Promise<StepState> {
  const config = new WorkflowConfig(page);
  const steps = await config.captureStepList(() => staffPage.resumeApplication(MUTABLE_SEED_ID));
  const step = steps.find((s) => s.stepDesc === stepDesc);
  if (!step) return 'unreached';
  return step.stepStatus === 1 ? 'submitted' : 'pending';
}

test.describe('STAFF_TS001 - End-to-end journey (Address -> Summary)', () => {
  test.describe.configure({ mode: 'serial' });
  test.skip(skipMutating(), MUTATING_REASON);

  // One browser page shared across the ordered steps — the journey is inherently stateful.
  let staffPage: StaffSalaryApplicationPage;
  let journey: StaffJourneySteps;

  test.beforeEach(async ({ page }) => {
    staffPage = new StaffSalaryApplicationPage(page);
    journey = new StaffJourneySteps(page);
  });

  test('JOURNEY-01: Resume the seed and confirm scheme 1003 structure', async ({ page }) => {
    const config = new WorkflowConfig(page);
    const steps = await config.captureStepList(() => staffPage.resumeApplication(MUTABLE_SEED_ID));

    // AC6 / BR-03 — the defining property of this scheme.
    WorkflowConfig.verifyNoAccountTypeStep(steps);
    // BR-04 / BR-26 — sequential, and only Document Upload skippable.
    WorkflowConfig.verifySkipConfiguration(steps);
    WorkflowConfig.verifySequencesAreValid(steps);
  });

  test('JOURNEY-02: Address Details — validation, master data, then save both addresses', async ({ page }) => {
    const address = new AddressDetailsStep(page);
    if ((await resumeAndGetStepState(page, staffPage, 'Address Details')) === 'submitted') {
      console.log('[JOURNEY-02] Address Details already submitted - resuming from the current position');
      return;
    }
    await staffPage.openStep(AddressDetailsStep.STEP_LABEL);

    // A saved address has no edit affordance (FR-37), so its "Click Here For Add Address" link
    // disappears. Counting the remaining links makes this step resumable after a mid-run
    // failure instead of trying to re-add an address that already exists.
    const pending = await address.countPendingAddressForms();
    console.log(`[JOURNEY-02] address forms still to complete: ${pending}`);

    if (pending === 2) {
      await address.openPermanentAddressForm();

      // TC-STAFF-047 — all four mandatory errors surface together (unlike the eKYC popups, D-08).
      await address.submitForm();
      await address.verifyAllMandatoryErrorsShown();

      // TC-STAFF-135 / BR-18 — Country fixed to India.
      await address.verifyCountryIsFixedToIndia();

      // TC-STAFF-162 / TC-STAFF-048 — the State list, and D-15's missing jurisdictions.
      const states = await address.getStateOptions();
      expect(states.length, 'State options must be populated').toBeGreaterThan(20);
      const missing = ['Bihar', 'Sikkim', 'Telangana', 'Ladakh'].filter((s) => !states.includes(s));
      // Recorded, not asserted: D-15 is tracked as its own expected-fail case.
      console.log(
        `[D-15] states=${states.length}, missing=${JSON.stringify(missing)}, ` +
          `misspelled Rajsthan present=${states.includes('Rajsthan')}`,
      );

      await address.fillAddress(SYNTHETIC.address);

      // TC-STAFF-049 / D-16 — City is not filtered by the chosen State.
      const cities = await address.getCityOptions();
      console.log(`[D-16] city options after selecting ${SYNTHETIC.address.state}: ${cities.length}`);

      await address.submitForm();
      await expect(page.locator('textarea[name="address_line1"]')).toBeHidden({ timeout: 25000 });
    }

    // Communication address via "Same as Permanent" — FR-36 copies all seven fields.
    if ((await address.countPendingAddressForms()) > 0) {
      await address.openCommunicationAddressForm();
      await address.tickSameAsPermanent();

      // D-21 — only Address Line 1 locks; Line 2, Area and Pin code stay editable, so the
      // copy can be silently diverged.
      await expect(page.locator('textarea[name="address_line1"]')).toBeDisabled();
      await expect(page.getByPlaceholder('Pin code')).toBeEnabled();

      await address.submitForm();
      await expect(page.locator('textarea[name="address_line1"]')).toBeHidden({ timeout: 25000 });
    }

    await address.submitStep();
    await journey.expectAdvancedTo('Branch Selection');
  });

  test('JOURNEY-03: Branch Selection saves the default branch on the first click', async ({ page }) => {
    if ((await resumeAndGetStepState(page, staffPage, 'Branch Selection')) === 'submitted') {
      console.log('[JOURNEY-03] Branch Selection already submitted - resuming from the current position');
      return;
    }
    await staffPage.openStep('Branch Selection');

    const branchText = await journey.getDefaultBranchText();
    expect(branchText, 'a default branch must be pre-selected').toMatch(/Branch Id/i);

    await journey.submitDefaultBranch();
    await journey.expectAdvancedTo('Basic Details');
  });

  test('JOURNEY-04: Basic Details — 1003-only fields, then submit', async ({ page }) => {
    if ((await resumeAndGetStepState(page, staffPage, 'Basic Details')) === 'submitted') {
      console.log('[JOURNEY-04] Basic Details already submitted - resuming from the current position');
      return;
    }
    await staffPage.openStep('Basic Details');

    // FR-40 / FR-41 / FR-42 / FR-45 — the scheme's data-model identity.
    await journey.verifyIdentityPrefilled();
    await journey.verifyStaffFieldsPresent();
    await journey.verifyAbsentFields();
    expect(await journey.getIsStaffOptionCount(), 'Is Staff offers exactly one option (FR-45)').toBe(1);

    // D-24 — the cap that applies to this field alone.
    console.log(`[D-24] spouse_name maxLength=${await journey.getSpouseNameMaxLength()}`);

    await journey.fillBasicDetails(SYNTHETIC.staffId);
    await journey.submitStep();

    // FR-49 — routes to Salaried Information unconditionally; 1003 has no Employment Type.
    await journey.expectAdvancedTo('Salaried Information');
  });

  test('JOURNEY-05: Salaried Information submits with its single mandatory field', async ({ page }) => {
    if ((await resumeAndGetStepState(page, staffPage, 'Salaried Information')) === 'submitted') {
      console.log('[JOURNEY-05] Salaried Information already submitted - resuming from the current position');
      return;
    }
    await staffPage.openStep('Salaried Information');

    await journey.fillSalariedByPosition();
    await journey.submitStep();
    await journey.expectAdvancedTo('Applicant Photo');
  });

  test('JOURNEY-06: Applicant Photo — verified photo + camera signature', async ({ page }) => {
    if ((await resumeAndGetStepState(page, staffPage, 'Applicant Photo')) === 'submitted') {
      console.log('[JOURNEY-06] Applicant Photo already submitted - resuming from the current position');
      return;
    }
    await staffPage.openStep('Applicant Photo');

    // FR-54 — camera only; no upload shortcut exists.
    expect(await journey.countFileInputs(), 'the step exposes no file input (FR-54)').toBe(0);

    await journey.openVerifiedPhoto();
    // FR-53 — correctly gated until a source is chosen.
    expect(await journey.isVerifiedPhotoSubmitDisabled(), 'Submit disabled until a source is picked').toBe(true);

    const sources = await journey.getVerifiedPhotoSources();
    expect(sources.join('|')).toMatch(/Aadhaar/i);
    expect(sources.join('|')).toMatch(/Liveliness/i);

    await journey.chooseVerifiedPhotoSource(/Aadhaar/);
    await journey.submitVerifiedPhoto();

    await journey.captureSignature();
    await journey.waitForBothImagesRegistered();

    await journey.submitStep();
    await journey.expectAdvancedTo('Nominee Details');
  });

  test('JOURNEY-07: Nominee Details — guardian logic, age derivation, then submit', async ({ page }) => {
    const nominee = new NomineeDetailsStep(page);
    if ((await resumeAndGetStepState(page, staffPage, 'Nominee Details')) === 'submitted') {
      console.log('[JOURNEY-07] Nominee Details already submitted - resuming from the current position');
      return;
    }
    await staffPage.openStep(NomineeDetailsStep.STEP_LABEL);

    // Nominee Details has TWO pages (details, then the nominee's address) and `stepStatus`
    // only flips once BOTH are submitted. So a re-run can legitimately find page 1 already
    // saved while the step still reads pending — in which case there is no blank form to
    // validate and no nominee to enter.
    const nomineeFormOpen = await nominee.fullNameInput.isVisible().catch(() => false);

    if (nomineeFormOpen) {
      // TC-STAFF-054 — all three mandatory errors together.
      await nominee.submit();
      for (const message of ['Full Name is required', 'Date of Birth is required']) {
        await expect(page.getByText(message)).toBeVisible();
      }

      await nominee.fillNominee(
        SYNTHETIC.nominee.fullName,
        SYNTHETIC.nominee.relation,
        SYNTHETIC.nominee.adultDob,
      );

      // TC-STAFF-182 / FR-63 — API-populated relation list.
      expect((await nominee.getRelationOptions()).length, 'relation list is API-populated').toBeGreaterThan(0);

      // TC-STAFF-140 / BR-24 — the best-implemented logic in the journey.
      await nominee.setDateOfBirth(SYNTHETIC.nominee.minorDob);
      await nominee.verifyGuardianBlockVisible();
      await nominee.setDateOfBirth(SYNTHETIC.nominee.adultDob);
      await nominee.verifyGuardianBlockHidden();

      // TC-STAFF-183 — derived and read-only. D-30's fractional value is recorded, not asserted.
      await expect(nominee.ageInput).toBeDisabled();
      console.log(`[D-30] derived age for ${SYNTHETIC.nominee.adultDob}: ${await nominee.getDerivedAge()}`);

      // TC-STAFF-139 / BR-23 — nomination cannot be declined.
      expect(await nominee.hasDeclineNominationControl()).toBe(false);

      await nominee.submit();
    } else {
      // Resuming lands on page 1 (the saved-nominee table), not page 2. The address page only
      // appears after page 1 is submitted, so advance explicitly rather than assuming the
      // nominee address form is already on screen.
      console.log('[JOURNEY-07] nominee already saved - re-opening it to reach the address page');
      const reopened = await nominee.openSavedNominee(SYNTHETIC.nominee.fullName);
      expect(reopened, 'the saved nominee should re-open from the table').toBe(true);
      await nominee.submit();
      await expect(page.getByText('Click Here For Add Address')).toBeVisible({ timeout: 30000 });
    }

    // TC-STAFF-141 / BR-25 — nominee address opens pre-checked and pre-filled.
    await nominee.openNomineeAddressForm();
    expect(await nominee.isUseExistingAddressChecked(), 'Use Existing Address is pre-checked').toBe(true);

    await page.locator('.popupoverlay button', { hasText: /^Submit$/ }).first().click();
    await expect(page.locator('.popupoverlay')).toBeHidden({ timeout: 25000 });

    await journey.submitStep();
    await journey.expectAdvancedTo('Document Upload');
  });

  test('JOURNEY-08: Document Upload submits empty — D-35', async ({ page }) => {
    if ((await resumeAndGetStepState(page, staffPage, 'Document Upload')) === 'submitted') {
      console.log('[JOURNEY-08] Document Upload already submitted - resuming from the current position');
      return;
    }
    await staffPage.openStep('Document Upload');

    await journey.submitDocumentUploadEmpty();

    // The regulatory finding: it advances with nothing attached and no warning.
    const warned = await journey.hasEmptySubmitWarning();
    console.log(`[D-35] warning shown on empty Document Upload submit: ${warned}`);

    await journey.expectAdvancedTo('Introducer Details');
  });

  test('JOURNEY-09: Introducer Details resolves against the Core Banking System', async ({ page }) => {
    test.skip(!CBS_ACCOUNT_NUMBER, 'STAFF_CBS_ACCOUNT is required — a CBS failure is silent (D-31).');

    const introducer = new IntroducerDetailsStep(page);
    if ((await resumeAndGetStepState(page, staffPage, 'Introducer Details')) === 'submitted') {
      console.log('[JOURNEY-09] Introducer Details already submitted - resuming from the current position');
      return;
    }
    await staffPage.openStep(IntroducerDetailsStep.STEP_LABEL);

    // TC-STAFF-057 — all three mandatory errors together.
    await introducer.submitButton.click();
    await introducer.verifyAllMandatoryErrorsShown();

    await introducer.fillIntroducer(
      INTRODUCER_NAME || SYNTHETIC.introducerName,
      CBS_ACCOUNT_NUMBER,
      SYNTHETIC.periodOfAcquaintance,
    );

    // BR-27 — assert on ADVANCING, never on the absence of an error (D-31).
    await introducer.submitAndExpectAdvance();
  });

  test('JOURNEY-10: Lead Details — both codes verified, then reach the Summary', async ({ page }) => {
    test.skip(!LEAD_STAFF_CODE, 'STAFF_LEAD_CODE is required — both codes must verify (BR-28).');

    const lead = new LeadDetailsStep(page);
    if ((await resumeAndGetStepState(page, staffPage, 'Lead Details')) === 'submitted') {
      console.log('[JOURNEY-10] Lead Details already submitted - resuming from the current position');
      return;
    }
    await staffPage.openStep(LeadDetailsStep.STEP_LABEL);

    // D-34 probe: populate BOTH, verify only the first, and see whether the second survives.
    await lead.sourcerCodeInput.fill(LEAD_STAFF_CODE);
    await lead.leadConverterCodeInput.fill(LEAD_STAFF_CODE);
    await lead.verifyLeadConverterCode();
    console.log(`[D-34] Sourcer Code after verifying the Converter: "${await lead.getSourcerCodeValue()}"`);

    // Re-enter and verify in strict sequence — the supported order given D-34.
    await lead.sourcerCodeInput.fill(LEAD_STAFF_CODE);
    await lead.verifySourcerCode();

    // D-38 — no separation of duties: one code fills both roles.
    console.log(
      `[D-38] converter="${await lead.getResolvedName('converter')}" ` +
        `sourcer="${await lead.getResolvedName('sourcer')}"`,
    );

    await journey.submitStep();
    await journey.expectAdvancedTo(WorkflowConfig.SUMMARY_STEP_LABEL, 90000);
  });

  test('JOURNEY-11: Summary renders every section and its gate is inspected, never clicked', async ({ page }) => {
    const summary = new SummaryPage(page);
    await staffPage.resumeApplication(MUTABLE_SEED_ID);
    await staffPage.openStep(WorkflowConfig.SUMMARY_STEP_LABEL);

    const headings = await summary.getSectionHeadings();
    expect(headings.length, 'the Summary renders a section per workflow step').toBeGreaterThanOrEqual(12);

    // AC21 fidelity — the values that were entered upstream are present.
    const text = await summary.getSummaryText();
    expect(text).toContain(SYNTHETIC.staffId);
    expect(text).toContain(SYNTHETIC.address.pinCode);

    // The four documented omissions, recorded rather than asserted here — each has its own
    // expected-fail case in summary-review.spec.ts.
    console.log(
      `[Summary omissions] images=${await summary.countRenderedImages()} ` +
        `consentControls=${await summary.countConsentControls()} ` +
        `submitEnabled=${await summary.isSubmitEnabled()}`,
    );

    // ⚠️ AC22 is asserted by inspecting state only. Submit is NEVER clicked.
    expect(await summary.isSubmitEnabled(), 'D-43: Submit is enabled from load, ungated').toBe(true);
  });
});
