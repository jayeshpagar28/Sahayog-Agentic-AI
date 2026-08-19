import { test, expect } from '@playwright/test';
import { StaffSalaryApplicationPage } from '../pages/savings-application/StaffSalaryApplicationPage';
import {resumeAndCheckStep, skipMutating, MUTATING_REASON } from './staff-fixtures';

/**
 * Applicant Photo — module sequence 11, stepCode APPLICANT_PHOTO.
 *
 * Runs only under the `chromium-camera` project, which supplies a fake video device plus
 * pre-granted camera and geolocation permissions. Both are required: permissions alone are
 * not enough, and the step offers **no <input type="file"> at all**, so there is no
 * upload-based shortcut for either the photo or the signature.
 *
 * Run with:  npx playwright test tests/10_STAFF_TS001/applicant-photo.spec.ts --project=chromium-camera
 */
/**
 * Band C — MUTATING. Fills and submits forms on a real application, so it is not idempotent
 * and never runs in CI (see staff-fixtures.ts for the band model). Needs a consumable seed
 * nominated via STAFF_MUTABLE_SEED_ID.
 */
test.describe('STAFF_TS001 - AC16 Applicant Photo', () => {
  test.skip(skipMutating(), MUTATING_REASON);

  let staffPage: StaffSalaryApplicationPage;

  test.beforeEach(async ({ page }) => {
    staffPage = new StaffSalaryApplicationPage(page);
    const availability = await resumeAndCheckStep(page, staffPage, 'Applicant Photo');
    if (availability.skipReason) test.skip(true, availability.skipReason);

    await staffPage.openStep('Applicant Photo');
  });

  test('TC-STAFF-054b: Both Photo and Signature are mandatory', async () => {
    // BR-20 — the photo alone will not submit.
    await expect(staffPage.stepPanel.getByText(/Upload Applicant Photo/)).toContainText('*');
    await expect(staffPage.stepPanel.getByText(/Upload Applicant Signature/)).toContainText('*');
  });

  test('TC-STAFF-177: Applicant Name is disabled and auto-filled from eKYC', async () => {
    const nameInput = staffPage.stepPanel.locator('input').first();

    await expect(nameInput).toBeDisabled();
    expect(await nameInput.inputValue()).not.toBe('');
  });

  test('TC-STAFF-054c: The step offers no file-upload control — camera capture only', async () => {
    // FR-54, recorded during exploration and the reason the fake video device is mandatory.
    expect(
      await staffPage.stepPanel.locator('input[type="file"]').count(),
      'the Applicant Photo step exposes no file input at all',
    ).toBe(0);
  });

  test('TC-STAFF-072: Verified Photo Submit stays disabled until a source is chosen', async ({ page }) => {
    await staffPage.stepPanel.getByText('Verified Photo').first().click();

    const dialog = page.locator('.modal, [role="dialog"]').filter({ hasText: /Verified Photo/ }).first();
    await dialog.waitFor({ state: 'visible', timeout: 15000 });

    // Correct behaviour, and worth protecting — this control is one of the few in the journey
    // that gates its own Submit properly.
    await expect(dialog.getByRole('button', { name: 'Submit' })).toBeDisabled();
  });

  test('TC-STAFF-178: Verified Photo offers Aadhaar and Liveliness as sources', async ({ page }) => {
    await staffPage.stepPanel.getByText('Verified Photo').first().click();

    const dialog = page.locator('.modal, [role="dialog"]').filter({ hasText: /Verified Photo/ }).first();
    await dialog.waitFor({ state: 'visible', timeout: 15000 });

    const text = await dialog.innerText();
    expect(text).toMatch(/Aadhaar/i);
    expect(text).toMatch(/Liveliness/i);
  });

  /**
   * D-36 — no preview, thumbnail, filename or retake is offered after a capture; the control
   * shows only the text "Document Uploaded". Combined with the Summary not rendering the
   * images either, there is no point in the entire journey where anyone can see what was
   * captured.
   */
  test('TC-STAFF-180: [D-36] A capture must offer a preview and a retake', async () => {
    test.fail(true, 'D-36: capture yields only the text "Document Uploaded" — no thumbnail, no retake.');

    await staffPage.stepPanel.getByText('Capture Using Camera').first().click();
    await staffPage.page.getByRole('button', { name: 'Capture photo' }).click();

    await expect(
      staffPage.stepPanel.locator('img'),
      'a captured image must be previewable before submission',
    ).toBeVisible({ timeout: 15000 });
  });
});
