import { test, expect } from '@playwright/test';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { SavingsApplicationDashboardPage } from '../pages/savings-application/SavingsApplicationDashboardPage';
import { ApplicationTrackingModal } from '../pages/savings-application/ApplicationTrackingModal';

test.describe('SAD_TS001 - Application List and Row Actions', () => {
  let dashboardPage: DashboardPage;
  let savingsAppPage: SavingsApplicationDashboardPage;

  test.beforeEach(async ({ page }) => {
    dashboardPage = new DashboardPage(page);
    savingsAppPage = new SavingsApplicationDashboardPage(page);
    await dashboardPage.goto();
    const initialLoad = page.waitForResponse(
      (r) => r.url().includes('app/activity/list') && r.request().method() === 'POST',
    );
    await dashboardPage.clickSavingApplicationCard();
    await page.waitForURL(/\/UNPOSTED/);
    await initialLoad;
  });

  test('TC-SAD-005: Clicking View on a row navigates to the Application Details page without error', async ({ page }) => {
    const applicationId = (await savingsAppPage.getApplicationIds())[0];
    await savingsAppPage.clickViewForRow(applicationId);

    await expect(page).toHaveURL(/\/applndetails/);
    await expect(page.getByText('Applicant Id')).toBeVisible();
    // Other, currently-hidden wizard steps can also contain the application id in their own
    // text (e.g. a past "Mobile number verification for {id}..." message) — restrict to a
    // visible occurrence so the assertion targets the header's own Applicant Id value.
    await expect(page.getByText(applicationId).and(page.locator(':visible')).first()).toBeVisible();
  });

  test('TC-SAD-032: Table displays the expected columns on the Pending tab', async () => {
    const headers = await savingsAppPage.getColumnHeaders();
    expect(headers).toEqual([
      'Application Id',
      'Customer Type',
      'Application Date',
      'Applicant Name',
      'Mobile No',
      'Status',
      'View',
      'Action',
    ]);
  });

  test('TC-SAD-033: Decisioned tab additionally displays an Account No column', async () => {
    await savingsAppPage.clickTab('Decisioned');
    const headers = await savingsAppPage.getColumnHeaders();
    const accountNoIndex = headers.indexOf('Account No');
    const statusIndex = headers.indexOf('Status');
    expect(accountNoIndex).toBeGreaterThan(-1);
    expect(accountNoIndex).toBeLessThan(statusIndex);
  });

  test('TC-SAD-034: Table is horizontally scrollable so View/Action columns remain reachable when the table widens', async () => {
    await savingsAppPage.clickTab('Decisioned');
    const { scrollWidth, clientWidth, overflowX } = await savingsAppPage.tableWrapper.evaluate((el) => ({
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth,
      overflowX: getComputedStyle(el).overflowX,
    }));

    expect(overflowX).toBe('auto');
    if (scrollWidth > clientWidth) {
      await savingsAppPage.tableWrapper.evaluate((el) => {
        el.scrollLeft = el.scrollWidth;
      });
      const firstRow = savingsAppPage.tableBodyRows.first();
      await expect(firstRow.locator('svg.fa-eye')).toBeVisible();
    }
  });

  test('TC-SAD-035: Opening the Action menu on a Pending-status row shows Track Application and Cancel', async ({ page }) => {
    const applicationId = (await savingsAppPage.getApplicationIds())[0];
    await savingsAppPage.openActionMenuForRow(applicationId);

    await expect(page.getByRole('menuitem', { name: 'Track Application' })).toBeVisible();
    await expect(page.getByRole('menuitem', { name: 'Cancel' })).toBeVisible();
  });

  test('TC-SAD-036: Track Application opens a modal showing stage details and can be closed', async () => {
    const applicationId = (await savingsAppPage.getApplicationIds())[0];
    await savingsAppPage.openActionMenuForRow(applicationId);
    await savingsAppPage.clickTrackApplication();

    const modal = new ApplicationTrackingModal(savingsAppPage.page);
    await modal.waitForOpen();
    await modal.verifyStageDetailsVisible();
    await modal.close();
  });

  test('TC-SAD-046: [Observation DEF-SAD-002] Clicking a row outside View/Action has no effect despite the pointer cursor', async ({ page }) => {
    const urlBefore = page.url();
    await savingsAppPage.tableBodyRows.first().locator('td').nth(1).click();
    await page.waitForTimeout(500);
    expect(page.url()).toBe(urlBefore);
  });
});
