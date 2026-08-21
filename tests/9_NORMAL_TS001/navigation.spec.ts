import { test, expect } from '@playwright/test';
import { NormalApplicationPage } from '../pages/savings-application/NormalApplicationPage';
import { SavingsApplicationDashboardPage } from '../pages/savings-application/SavingsApplicationDashboardPage';

/** The in-progress application these navigation tests resume. SAH-1001-795 (the original
 * fixture) moved out of the Pending tab into Decisioned - confirmed live via dashboard search
 * returning "No records found" with Decisioned count incremented by 1. Rotated to
 * SAH-1001-581 (Minor, sits at Guardian Details, module sequence 14 of ~22 - deep enough for
 * TC-NOR-141's stepper-overflow requirement, matching the other currently-Pending Normal
 * application's shallower depth of 12). If these tests start timing out on the row lookup
 * again, check the Submitted/Decisioned tabs first - it means this fixture moved on too and
 * another far-progressed Pending application is needed. */
const FIXTURE_APPLICATION_ID = 'SAH-1001-581';

/** Resumes a real, already-in-progress application untouched by this project's live
 * exploration - read-only navigation between its unlocked tabs is safe and does not modify
 * any of its saved data.
 *
 * Searches by application id rather than relying on it being on page 1 of the Pending list -
 * this drifts further down every time a newer application is created on this shared UAT
 * environment (this spec's own CI runs are one source of that drift), and searching collapses
 * the list to the single matching row regardless of how far down it has moved. */
async function gotoCompletedApplication(page: import('@playwright/test').Page): Promise<void> {
  await page.goto('/HOME');
  await page.waitForLoadState('networkidle').catch(() => undefined);
  await page.getByRole('button', { name: 'Savings Application' }).click();
  await page.waitForURL(/\/UNPOSTED/);

  const dashboardPage = new SavingsApplicationDashboardPage(page);
  await dashboardPage.search(FIXTURE_APPLICATION_ID);
  await dashboardPage.tableBodyRows
    .filter({ hasText: FIXTURE_APPLICATION_ID })
    .first()
    .waitFor({ state: 'visible' });
  await dashboardPage.clickViewForRow(FIXTURE_APPLICATION_ID);

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
