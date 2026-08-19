import { test, expect } from '@playwright/test';
import { StaffSalaryApplicationPage } from '../pages/savings-application/StaffSalaryApplicationPage';
import { DashboardPage } from '../pages/dashboard/DashboardPage';

interface ApiFailure {
  url: string;
  status: number;
  body: string;
}

/**
 * Band A — COLD-SAFE cross-cutting checks. Creates no record and writes nothing.
 * Runs unconditionally in CI.
 */
test.describe('STAFF_TS001 - Console and network hygiene', () => {
  test('TC-STAFF-250/251: The cold journey produces no console errors and no 4xx/5xx responses', async ({ page }) => {
    const consoleErrors: string[] = [];
    const httpFailures: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('response', (response) => {
      if (response.status() >= 400) httpFailures.push(`${response.status()} ${response.url()}`);
    });

    const staffPage = new StaffSalaryApplicationPage(page);
    await staffPage.startNewApplication();
    await staffPage.mobileInput.pressSequentially('9999999999');

    expect(consoleErrors, 'no console errors on the cold journey').toEqual([]);
    expect(httpFailures, 'no 4xx/5xx responses on the cold journey').toEqual([]);
  });

  /**
   * D-03 — eight endpoints report failure as HTTP 200 with `success:"FALSE"` / `isError:true`,
   * including msgCode "500" and "503" inside a 200. A naive status check passes on every one.
   *
   * Confirmed live on 2026-08-18 with a new variant: an application **rejection** is returned
   * as `{"msgCode":"APPL_REJECT","success":"TRUE","isError":false}` — a terminal rejection
   * dressed as a success.
   *
   * Written as the required behaviour (AC14) and expected to fail until the API is corrected.
   */
  test('TC-STAFF-252: [D-03] No endpoint reports failure inside an HTTP 200', async ({ page }) => {
    test.fail(
      true,
      'D-03: multiple endpoints return HTTP 200 carrying success:"FALSE" / isError:true, so ' +
        'failures are indistinguishable from successes by status code alone.',
    );

    const dishonest: ApiFailure[] = [];

    page.on('response', async (response) => {
      if (!response.url().includes('sahyogAosAPI')) return;
      if (response.status() !== 200) return;

      const body = await response.text().catch(() => '');
      if (/"success"\s*:\s*"FALSE"|"isError"\s*:\s*true/i.test(body)) {
        dishonest.push({ url: response.url(), status: response.status(), body: body.slice(0, 200) });
      }
    });

    const staffPage = new StaffSalaryApplicationPage(page);
    await staffPage.startNewApplication();

    expect(dishonest, 'failures must carry a non-2xx HTTP status').toEqual([]);
  });

  /**
   * BUG-STAFF-001 — reloading or deep-linking /schemelist renders a permanently blank page.
   * Written as the required behaviour; fails until fixed.
   */
  test('TC-STAFF-255: [BUG-STAFF-001] /schemelist survives a direct navigation', async ({ page }) => {
    test.fail(
      true,
      'BUG-STAFF-001: direct navigation to /schemelist renders an empty body and throws ' +
        '"Cannot read properties of null (reading \'acType\')".',
    );

    // Establish a session by walking the UI first, so this isolates the reload behaviour
    // rather than an unauthenticated redirect.
    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    await dashboard.clickSavingApplicationCard();
    await page.waitForURL(/\/UNPOSTED/);

    await page.goto('/schemelist');

    await expect(
      page.locator('.col-xl-5.buttons-column button.btn').first(),
      'the scheme list must render after a direct navigation',
    ).toBeVisible({ timeout: 15000 });
  });

  test('TC-STAFF-254: The journey remains usable at a mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    const staffPage = new StaffSalaryApplicationPage(page);
    await staffPage.startNewApplication();

    await expect(staffPage.mobileInput).toBeVisible();
    await expect(staffPage.schemeName).toBeVisible();
  });
});
