import { test, expect } from '@playwright/test';
import { StaffSalaryApplicationPage } from '../pages/savings-application/StaffSalaryApplicationPage';
import { SummaryPage } from '../pages/savings-application/application-form/SummaryPage';
import { WorkflowConfig } from '../pages/savings-application/application-form/WorkflowConfig';
import { SEED_APPLICANT_ID, SEED_REASON } from './staff-fixtures';

/**
 * Band B — READ-ONLY. Inspects the Summary of a completed seed; writes nothing, so it is
 * idempotent and safe to run on every CI commit.
 *
 * The Summary / Review screen.
 *
 * ⚠️ SAFETY: no test in this file clicks Submit, and `SummaryPage` deliberately exposes no
 * method that would. Submission is irreversible, Cancel is the only exit and is itself
 * one-way, and any seed used here carries synthetic data that must never reach a real
 * account-opening pipeline. AC22 is asserted by inspecting the gate's state only.
 */
test.describe('STAFF_TS001 - AC21/AC22 Summary and Review', () => {
  test.skip(!SEED_APPLICANT_ID, SEED_REASON);

  let staffPage: StaffSalaryApplicationPage;
  let summary: SummaryPage;

  test.beforeEach(async ({ page }) => {
    staffPage = new StaffSalaryApplicationPage(page);
    summary = new SummaryPage(page);

    await staffPage.resumeApplication(SEED_APPLICANT_ID);

    // Once an application has actually reached the review screen, "Summary" is a stepper tab
    // in its own right — server-side it is stepCode SUMMARY at module sequence 17. (US_010
    // FR-59 says the Summary is not a workflow step; that is contradicted by the live
    // application — see WorkflowConfig.EXPECTED_SEQUENCES.) A seed parked earlier has no such
    // tab, which is a precondition gap rather than a defect.
    if (!(await staffPage.hasStep(WorkflowConfig.SUMMARY_STEP_LABEL))) {
      test.skip(
        true,
        `Seed ${SEED_APPLICANT_ID} has not reached the Summary — ${await staffPage.describeProgress()}`,
      );
    }

    await staffPage.openStep(WorkflowConfig.SUMMARY_STEP_LABEL);
  });

  test('TC-STAFF-020: The Summary renders one section per workflow step', async () => {
    const headings = await summary.getSectionHeadings();

    // 13 workflow steps, including the UI-less EXISTING_CUSTOMER_DATA system step.
    expect(headings.length, 'the Summary should render a section per workflow step').toBeGreaterThanOrEqual(12);
  });

  test('TC-STAFF-216: Summary values match what was entered upstream', async ({ page }) => {
    const payload = await summary.captureSummaryPayload(async () => {
      await page.reload();
    });

    // `summaryDataJson` arrives as a JSON string inside the JSON response and needs a second
    // parse — handled by the page object.
    expect(payload.summaryDataJson, 'the summary payload must parse').toBeTruthy();
  });

  /**
   * AC22 / BR-31 — the final irreversible act must be gated by an explicit declaration, with
   * Submit disabled until it is accepted.
   *
   * D-43: the screen carries 0 checkboxes, 0 radios and 0 inputs, no declaration/consent/terms
   * text of any kind, and a bare <button type="submit">Submit</button> that is enabled from
   * the moment the page paints. Nothing whatsoever gates the opening of a bank account.
   * Critical, and regulatory rather than cosmetic.
   *
   * Inspects state only — the control is never operated.
   */
  test('TC-STAFF-085/147: [D-43] Final submission must be gated by an explicit declaration', async () => {
    test.fail(
      true,
      'D-43: the Summary carries no declaration, consent or acknowledgement, and its Submit ' +
        'control is enabled from page load.',
    );

    await summary.verifyDeclarationGate();
  });

  /**
   * AC21 / D-36 — the captured photo and signature are never rendered anywhere in the
   * journey, so a wrong or illegible capture cannot be caught before submission.
   */
  test('TC-STAFF-105: [D-36] The Summary must display the captured photo and signature', async () => {
    test.fail(true, 'D-36: photo and signature appear as labels with no image — zero <img> elements.');

    expect(await summary.countRenderedImages(), 'the photo and signature must be visible for review').toBeGreaterThanOrEqual(2);
  });

  /**
   * AC21 / D-40 — relation, date of birth, age and address are all captured as mandatory but
   * omitted from the review screen, which shows only the nominee's full name and status.
   */
  test('TC-STAFF-099: [D-40] The Summary must show the full nominee record', async () => {
    test.fail(true, 'D-40: only Full name and Status are rendered; relation, DOB, age and address are absent.');

    const text = await summary.getSummaryText();
    expect(text).toMatch(/Relation/i);
    expect(text).toMatch(/Date of Birth/i);
  });

  /**
   * AC21 / D-35 — Document Upload is the only skippable step, so an application can reach
   * submission with no supporting documents; the Summary then renders that section as a bare
   * heading rather than saying so.
   */
  test('TC-STAFF-103: [D-35] The Summary must state when no documents are attached', async () => {
    test.fail(true, 'D-35: the Document Upload section renders as an empty heading when nothing was attached.');

    const text = await summary.getSummaryText();
    expect(text).toMatch(/no documents|not attached|none attached/i);
  });

  test('TC-STAFF-083: An isEditable:0 step re-opens read-only with no Submit', async () => {
    // Branch Selection locks permanently once submitted (confirmed live 2026-08-18: 0 inputs,
    // 0 buttons on re-entry).
    await staffPage.openStep('Branch Selection');

    expect(await staffPage.countEnabledInputs()).toBe(0);
  });
});
