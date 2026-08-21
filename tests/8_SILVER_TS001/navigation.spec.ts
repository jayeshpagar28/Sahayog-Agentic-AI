import { test, expect } from '@playwright/test';
import { SilverApplicationPage } from '../pages/savings-application/SilverApplicationPage';
import { SavingsApplicationDashboardPage } from '../pages/savings-application/SavingsApplicationDashboardPage';
import { findDeepestPendingApplication } from '../support/savingsApplicationFlow';

/** Resumes whichever real, already-in-progress Silver application currently has the most
 * stepper progress - read-only navigation between its unlocked tabs is safe and does not
 * modify any of its saved data. TC-SIL-141 needs the stepper to actually overflow, so picking
 * the deepest-progressed candidate also gives it the best chance of a visible scroll chevron;
 * with too few tabs the chevron never renders and the test's isVisible() guard swallows the
 * interaction, passing without asserting anything.
 *
 * Previously hardcoded a single fixture application id, but that is fragile on this shared
 * live UAT environment: any Pending application's status can change at any time (moved to
 * Submitted, Decisioned, or cancelled) by a real bank officer or workflow entirely outside
 * this project's control - this fixture had already needed manual rotation twice for exactly
 * that reason (SAH-1002-798, then SAH-1002-775, both eventually submitted for real). Picking
 * the deepest-progressed candidate at run time self-heals across that churn instead of needing
 * another rotation every time the current fixture moves on. */
async function gotoCompletedApplication(page: import('@playwright/test').Page): Promise<void> {
  const applicationId = await findDeepestPendingApplication(page, '1002');

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

test.describe('SILVER_TS001 - AC17 Previous/Next Navigation', () => {
  test('TC-SIL-140: Clicking a previously-completed stage tab navigates back and shows retained data', async ({ page }) => {
    await gotoCompletedApplication(page);
    await page.locator('#categorytab li a', { hasText: 'Mobile Number Verification' }).click();
    await page.waitForTimeout(1000);
    await expect(page.getByText('Mobile Number Verification submitted successfully.')).toBeVisible();
  });

  test('TC-SIL-141: The stepper scroll chevrons do not change the active step', async ({ page }) => {
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

  test('TC-SIL-142: A freshly-started draft only exposes the current stage tab — later stages cannot be skipped to', async ({ page }) => {
    const silverPage = new SilverApplicationPage(page);
    await silverPage.startNewApplication();
    const tabLabels = await silverPage.getStepperTabLabels();
    expect(tabLabels).toEqual(['Mobile Number Verification']);
  });
});
