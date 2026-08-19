import { test, expect } from '@playwright/test';
import { StaffSalaryApplicationPage } from '../pages/savings-application/StaffSalaryApplicationPage';
import { WorkflowConfig } from '../pages/savings-application/application-form/WorkflowConfig';
import { SEED_APPLICANT_ID, SEED_REASON } from './staff-fixtures';

/**
 * Band B — READ-ONLY. Resumes a completed seed and inspects it; writes nothing, so it is
 * idempotent and safe to run on every CI commit.
 *
 * The structural identity of scheme 1003 — the single largest divergence from Silver (1002)
 * and Normal (1001).
 *
 * These claims are properties of the workflow *configuration*, so they are asserted against
 * `aos/steps/getdetails` rather than by counting stepper tabs. That is both stronger evidence
 * and far less brittle. Confirmed live on 2026-08-18.
 */
test.describe('STAFF_TS001 - AC6/BR-03 Scheme 1003 workflow structure', () => {
  test.skip(!SEED_APPLICANT_ID, SEED_REASON);

  test('TC-STAFF-122: Scheme 1003 defines no Account Type step', async ({ page }) => {
    const staffPage = new StaffSalaryApplicationPage(page);
    const config = new WorkflowConfig(page);

    const steps = await config.captureStepList(() => staffPage.resumeApplication(SEED_APPLICANT_ID));

    // The decisive assertion: module sequence 2 is eKYC, and ACCOUNT_TYPE is absent entirely.
    // No Joint/Individual/Minor choice is presented at any point in this journey.
    WorkflowConfig.verifyNoAccountTypeStep(steps);

    // The stepper agrees — and never renders an Account Type tab.
    expect(await staffPage.getStepperTabLabels()).not.toContain('Account Type');
  });

  test('TC-STAFF-123/142: Document Upload is the only skippable step', async ({ page }) => {
    const staffPage = new StaffSalaryApplicationPage(page);
    const config = new WorkflowConfig(page);

    const steps = await config.captureStepList(() => staffPage.resumeApplication(SEED_APPLICANT_ID));

    // BR-04 + BR-26. That APPL_DOCUMENT alone is skipAllowed:1 is the config-level root of
    // D-35 — an application can reach submission carrying no supporting documents at all.
    WorkflowConfig.verifySkipConfiguration(steps);
  });

  test('TC-STAFF-233: Scheme 1003 runs its own workflow definition', async ({ page }) => {
    const staffPage = new StaffSalaryApplicationPage(page);
    const config = new WorkflowConfig(page);

    const steps = await config.captureStepList(() => staffPage.resumeApplication(SEED_APPLICANT_ID));

    // "...stsa", distinct from Silver's "...sas" and Normal's "...nsa" — which is why no
    // behaviour from those schemes may be assumed to hold here.
    WorkflowConfig.verifyOwnWorkflowDefinition(steps);
  });

  test('TC-STAFF-005b: The 1003 workflow defines only valid module sequences', async ({ page }) => {
    const staffPage = new StaffSalaryApplicationPage(page);
    const config = new WorkflowConfig(page);

    const steps = await config.captureStepList(() => staffPage.resumeApplication(SEED_APPLICANT_ID));

    // Only the steps an application has REACHED are returned, so this asserts membership and
    // ordering rather than the full 12 — a part-completed seed returns fewer, legitimately.
    // Sequence 3 (EXISTING_CUSTOMER_DATA) is a UI-less system step absent from this list;
    // 8, 9 and 14 do not exist on 1003 at all.
    WorkflowConfig.verifySequencesAreValid(steps);
    expect(WorkflowConfig.getSequences(steps).length).toBeGreaterThan(0);
  });

  test('TC-STAFF-081: A completed step re-opens read-only', async ({ page }) => {
    const staffPage = new StaffSalaryApplicationPage(page);
    await staffPage.resumeApplication(SEED_APPLICANT_ID);

    // Mobile Number Verification locks permanently once its OTP is accepted (BR-05, FR-13).
    await staffPage.verifyStepIsReadOnly('Mobile Number Verification');
  });

  test('TC-STAFF-253: Layout stays within the viewport at desktop width', async ({ page }) => {
    const staffPage = new StaffSalaryApplicationPage(page);
    await staffPage.resumeApplication(SEED_APPLICANT_ID);

    await staffPage.verifyResponsiveLayout();
  });
});
