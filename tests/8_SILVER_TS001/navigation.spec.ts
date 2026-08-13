import { test, expect } from '@playwright/test';
import { SilverApplicationPage } from '../pages/savings-application/SilverApplicationPage';

/** Resumes a real, already-far-progressed live application used throughout this
 * story's exploration — read-only navigation between its unlocked tabs is safe and
 * does not modify any of its saved data. SAH-1002-798 (the original fixture) was
 * submitted for real on 2026-08-05 and is now locked/read-only in the Submitted tab,
 * so this points at SAH-1002-775 instead, used for the AC27 branching-matrix
 * exploration and still open/editable in the Pending list. */
async function gotoCompletedApplication(page: import('@playwright/test').Page): Promise<void> {
  await page.goto('/HOME');
  await page.waitForLoadState('networkidle').catch(() => undefined);
  await page.getByRole('button', { name: 'Savings Application' }).click();
  await page.waitForURL(/\/UNPOSTED/);
  await page.locator('.p-datatable-tbody tr').first().waitFor({ state: 'visible', timeout: 15000 });
  const row = page.locator('.p-datatable-tbody tr', { hasText: 'SAH-1002-775' });
  await row.locator('svg.fa-eye').click();
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
