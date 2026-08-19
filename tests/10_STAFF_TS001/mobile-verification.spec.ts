import { test, expect } from '@playwright/test';
import { StaffSalaryApplicationPage } from '../pages/savings-application/StaffSalaryApplicationPage';

/**
 * Band A — COLD-SAFE. Creates no record, sends no SMS, consumes no verification attempt.
 * Runs unconditionally in CI.
 *
 *
 * ⚠️ No test in this file clicks "Send Verification Code". Doing so creates a live applicant
 * record, sends a real SMS to a real handset, and consumes one of only three attempts per
 * application (BR-01, BR-07). Everything here stops at the point just before that click.
 */
test.describe('STAFF_TS001 - AC4 Mobile Number Verification (validation only, no send)', () => {
  let staffPage: StaffSalaryApplicationPage;

  test.beforeEach(async ({ page }) => {
    staffPage = new StaffSalaryApplicationPage(page);
    await staffPage.startNewApplication();
  });

  test('TC-STAFF-030: Alphabetic input is rejected outright', async () => {
    await staffPage.mobileInput.pressSequentially('abcdefghij');

    // The field rejects the characters entirely rather than accepting-then-flagging them.
    await expect(staffPage.mobileInput).toHaveValue('');
  });

  test('TC-STAFF-031: Special characters are stripped, digits retained', async () => {
    await staffPage.mobileInput.pressSequentially('98!@#76*54');

    await expect(staffPage.mobileInput).toHaveValue('987654');
  });

  test('TC-STAFF-034: Mobile Number is capped at 10 digits', async () => {
    await staffPage.mobileInput.pressSequentially('951199624812345');

    expect((await staffPage.mobileInput.inputValue()).length).toBe(10);
  });

  test('TC-STAFF-032: The Send control is hidden while the field is empty', async () => {
    await expect(staffPage.sendVerificationCodeButton).toBeHidden();
  });

  /**
   * TC-STAFF-032/035 — the story's required behaviour (FR-09/AC4): the control must stay
   * hidden until exactly 10 digits are present, so an OTP can never be requested for an
   * incomplete number.
   *
   * Currently NOT met. Verified live on 2026-08-18: the control is rendered and enabled from
   * the first digit. Filed as BUG-STAFF-002 and marked test.fail() so the suite goes green
   * the moment the product is fixed — at which point this annotation should be removed.
   */
  test('TC-STAFF-035: [BUG-STAFF-002] Send control must stay hidden below 10 digits', async () => {
    test.fail(
      true,
      'BUG-STAFF-002: "Send Verification Code" is visible and enabled from 1 digit, allowing an ' +
        'OTP send against an obviously invalid number and burning 1 of only 3 attempts.',
    );

    await staffPage.mobileInput.pressSequentially('98765');
    await expect(staffPage.sendVerificationCodeButton).toBeHidden();
  });

  test('TC-STAFF-033: The Send control is available once 10 digits are entered', async () => {
    await staffPage.mobileInput.pressSequentially('9999999999');

    await expect(staffPage.sendVerificationCodeButton).toBeVisible();
    await expect(staffPage.sendVerificationCodeButton).toBeEnabled();
    // Deliberately not clicked — see the file header.
  });

  test('TC-STAFF-120: No application record exists before an OTP is sent', async () => {
    await staffPage.mobileInput.pressSequentially('9999999999');

    expect(await staffPage.isApplicantIdPresent()).toBe(false);
    expect(await staffPage.getStepperTabLabels()).toEqual(['Mobile Number Verification']);
  });
});
