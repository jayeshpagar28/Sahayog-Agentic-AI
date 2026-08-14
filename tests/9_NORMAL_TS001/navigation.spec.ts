import { test, expect } from '@playwright/test';
import { NormalApplicationPage } from '../pages/savings-application/NormalApplicationPage';

/** Resumes a real, already-in-progress application untouched by this project's live
 * exploration (SAH-1001-796/-805/-806 were all deliberately driven to real final
 * submission and are now locked/read-only in the Submitted tab). SAH-1001-795 sits at
 * eKYC Verification and was intentionally left alone in favor of starting fresh — read-only
 * navigation between its unlocked tabs is safe and does not modify any of its saved data. */
async function gotoCompletedApplication(page: import('@playwright/test').Page): Promise<void> {
  await page.goto('/HOME');
  await page.waitForLoadState('networkidle').catch(() => undefined);
  await page.getByRole('button', { name: 'Savings Application' }).click();
  await page.waitForURL(/\/UNPOSTED/);
  await page.locator('.p-datatable-tbody tr').first().waitFor({ state: 'visible', timeout: 15000 });
  const row = page.locator('.p-datatable-tbody tr', { hasText: 'SAH-1001-795' });
  await row.locator('svg.fa-eye').click();
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
