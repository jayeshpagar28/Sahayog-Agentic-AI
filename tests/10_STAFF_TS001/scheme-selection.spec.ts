import { test, expect } from '@playwright/test';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { SchemeSelectionPage } from '../pages/savings-application/SchemeSelectionPage';
import { StaffSalaryApplicationPage } from '../pages/savings-application/StaffSalaryApplicationPage';

/**
 * Band A — COLD-SAFE. Creates no record, sends no SMS, consumes no verification attempt.
 * Runs unconditionally in CI.
 * Nothing here creates an application record, sends an SMS, or consumes
 * any of the three-attempt verification budgets. Safe to run unattended and repeatedly.
 */
test.describe('STAFF_TS001 - AC1/AC2 Scheme Selection', () => {
  let schemeSelection: SchemeSelectionPage;

  test.beforeEach(async ({ page }) => {
    // /schemelist must be reached through the UI — direct navigation renders a blank page
    // and throws "Cannot read properties of null (reading 'acType')" (BUG-STAFF-001).
    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    await dashboard.clickSavingApplicationCard();
    await page.waitForURL(/\/UNPOSTED/);
    await page.getByText('New Application', { exact: true }).click();
    await page.waitForURL(/\/schemelist/);

    schemeSelection = new SchemeSelectionPage(page);
    await schemeSelection.verifyLoaded();
  });

  test('TC-STAFF-002: New Application opens Scheme Selection listing the Savings Account product', async () => {
    await expect(schemeSelection.productHeading).toBeVisible();
    expect(await schemeSelection.getSchemeNames()).toHaveLength(3);
  });

  test('TC-STAFF-003: Staff Salary Account - 1003 is listed alongside 1001 and 1002', async () => {
    const schemes = await schemeSelection.getSchemeNames();
    expect(schemes).toEqual(
      expect.arrayContaining([
        'Normal Savings Account - 1001',
        'Silver Savings Account - 1002',
        StaffSalaryApplicationPage.SCHEME_NAME,
      ]),
    );
  });

  test('TC-STAFF-109: Scheme search is server-side and case-insensitive', async ({ page }) => {
    // Assert on the request body, not just the filtered list — the point of this AC is that
    // matching happens on the server, not by client-side filtering.
    const requestPromise = page.waitForRequest(
      (r) => r.url().includes('scheme/getUserwiseAllscheme') && r.method() === 'POST',
    );

    await schemeSelection.search('staff');
    const body = JSON.parse((await requestPromise).postData() ?? '{}') as Record<string, unknown>;

    expect(body.searchValue).toBe('staff');
    expect(body.inActiveAcRequired, 'inactive schemes must be excluded').toBe(0);
    expect(await schemeSelection.getSchemeNames()).toEqual([StaffSalaryApplicationPage.SCHEME_NAME]);
  });

  test('TC-STAFF-201: Clearing the search restores the full scheme list', async () => {
    await schemeSelection.search('staff');
    expect(await schemeSelection.getSchemeNames()).toHaveLength(1);

    await schemeSelection.clearSearch();
    expect(await schemeSelection.getSchemeNames()).toHaveLength(3);
  });

  test('TC-STAFF-004: Selecting scheme 1003 opens its journey without creating a record', async ({ page }) => {
    await schemeSelection.clickScheme(StaffSalaryApplicationPage.SCHEME_NAME);
    await page.waitForURL(/\/applndetails/);

    const staffPage = new StaffSalaryApplicationPage(page);
    await staffPage.verifyFreshDraftHeader();

    // BR-01: the applicant record — and its Applicant Id — is created on the first successful
    // OTP send, not on scheme selection.
    expect(
      await staffPage.isApplicantIdPresent(),
      'no Applicant Id should exist before an OTP has been sent',
    ).toBe(false);
  });

  test('TC-STAFF-005: A fresh 1003 draft exposes exactly one stepper stage', async ({ page }) => {
    await schemeSelection.clickScheme(StaffSalaryApplicationPage.SCHEME_NAME);
    await page.waitForURL(/\/applndetails/);

    const staffPage = new StaffSalaryApplicationPage(page);
    await staffPage.mobileInput.waitFor({ state: 'visible', timeout: 15000 });

    // AC13: future stages are not rendered until reached.
    expect(await staffPage.getStepperTabLabels()).toEqual(['Mobile Number Verification']);
  });
});
