import { test, expect } from '@playwright/test';
import { NormalApplicationPage } from '../pages/savings-application/NormalApplicationPage';
import { SavingsApplicationDashboardPage } from '../pages/savings-application/SavingsApplicationDashboardPage';
import { findDeepestPendingApplication } from '../support/savingsApplicationFlow';

/** Resumes whichever real, already-in-progress Normal application currently has the most
 * stepper progress - read-only navigation between its unlocked tabs is safe and does not
 * modify any of its saved data.
 *
 * Previously hardcoded a single fixture application id, but that is fragile on this shared
 * live UAT environment: any Pending application's status can change at any time (moved to
 * Submitted, Decisioned, or cancelled) by a real bank officer or workflow entirely outside
 * this project's control - this spec had already needed a manual rotation once for exactly
 * that reason (SAH-1001-795 moved to Decisioned). Picking the deepest-progressed candidate at
 * run time self-heals across that churn instead of needing another rotation every time the
 * current fixture moves on. */
async function gotoCompletedApplication(page: import('@playwright/test').Page): Promise<void> {
  const applicationId = await findDeepestPendingApplication(page, '1001');

  const dashboardPage = new SavingsApplicationDashboardPage(page);
  await dashboardPage.search(applicationId);
  await dashboardPage.tableBodyRows
    .filter({ hasText: applicationId })
    .first()
    .waitFor({ state: 'visible' });
  await dashboardPage.clickViewForRow(applicationId);

  await page.waitForURL(/\/applndetails/);
  await page.waitForTimeout(2000);
}

test.describe('NORMAL_TS001 - AC17 Previous/Next Navigation', () => {
  test('TC-NOR-140: Clicking a previously-completed stage tab navigates back and shows retained data', async ({ page }) => {
    await gotoCompletedApplication(page);
    await page.locator('#categorytab li a', { hasText: 'Mobile Number Verification' }).click();
    await page.waitForTimeout(1000);
    await expect(page.getByText('Mobile Number Verification submitted successfully.')).toBeVisible();
  });

  test('TC-NOR-141: The stepper scroll chevrons do not change the active step', async ({ page }) => {
    await gotoCompletedApplication(page);
    const activeTabBefore = await page.locator('#categorytab li.tab_selected a').textContent();
    const scrollRight = page.locator('.scroll_tab_right_button').first();
    if (await scrollRight.isVisible().catch(() => false)) {
      await scrollRight.click();
      await page.waitForTimeout(500);
    }
    const activeTabAfter = await page.locator('#categorytab li.tab_selected a').textContent();
    expect(activeTabAfter).toBe(activeTabBefore);
  });

  test('TC-NOR-142: A freshly-started draft only exposes the current stage tab — later stages cannot be skipped to', async ({ page }) => {
    const normalPage = new NormalApplicationPage(page);
    await normalPage.startNewApplication();
    const tabLabels = await normalPage.getStepperTabLabels();
    expect(tabLabels).toEqual(['Mobile Number Verification']);
  });
});
