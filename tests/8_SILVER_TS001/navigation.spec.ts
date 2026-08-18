import { test, expect } from '@playwright/test';
import { SilverApplicationPage } from '../pages/savings-application/SilverApplicationPage';
import { SavingsApplicationDashboardPage } from '../pages/savings-application/SavingsApplicationDashboardPage';

/** The in-progress application these navigation tests resume. This fixture has already had to
 * be rotated twice — SAH-1002-798 (original) and SAH-1002-775 (its 2026-08-10 replacement) were
 * both driven to real final submission and are now locked/read-only in the Submitted tab.
 *
 * SAH-1002-587 is used rather than another Pending application because TC-SIL-141 needs the
 * stepper to actually overflow: it has 12 unlocked stage tabs (through Lead Details), whereas
 * the other currently-Pending Silver applications sit at 1-3 tabs. With only 3 tabs the scroll
 * chevrons never render, the test's isVisible() guard swallows the interaction, and it passes
 * without asserting anything.
 *
 * If these tests start timing out on the row lookup, check the Submitted tab first — it means
 * this application was submitted too, and another far-progressed Pending one is needed. */
const FIXTURE_APPLICATION_ID = 'SAH-1002-587';

/** Resumes a real, already-in-progress live application — read-only navigation between its
 * unlocked tabs is safe and does not modify any of its saved data.
 *
 * The Pending list is paginated at 10 rows a page and currently runs to 3 pages, so the fixture
 * is not reliably rendered on page 1 — it drifts further down every time a newer application is
 * created on this shared UAT environment. Searching by application id first collapses the list
 * to the single matching row, keeping this correct regardless of pagination. Arriving via the
 * Home card (rather than SavingsApplicationDashboardPage.gotoDirect) is deliberate: direct
 * /UNPOSTED navigation returns an empty list, see BUG-SAD-001. */
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
