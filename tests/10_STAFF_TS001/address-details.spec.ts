import { test, expect } from '@playwright/test';
import { StaffSalaryApplicationPage } from '../pages/savings-application/StaffSalaryApplicationPage';
import { AddressDetailsStep } from '../pages/savings-application/application-form/AddressDetailsStep';
import {SYNTHETIC, resumeAndCheckStep, skipMutating, MUTATING_REASON } from './staff-fixtures';

/**
 * Band C — MUTATING. Fills and submits forms on a real application, so it is not idempotent
 * and never runs in CI (see staff-fixtures.ts for the band model). Needs a consumable seed
 * nominated via STAFF_MUTABLE_SEED_ID.
 */
test.describe('STAFF_TS001 - AC11/AC15 Address Details', () => {
  test.skip(skipMutating(), MUTATING_REASON);

  let staffPage: StaffSalaryApplicationPage;
  let address: AddressDetailsStep;

  test.beforeEach(async ({ page }) => {
    staffPage = new StaffSalaryApplicationPage(page);
    address = new AddressDetailsStep(page);

    const availability = await resumeAndCheckStep(page, staffPage, AddressDetailsStep.STEP_LABEL);
    if (availability.skipReason) test.skip(true, availability.skipReason);

    await staffPage.openStep(AddressDetailsStep.STEP_LABEL);
  });

  test('TC-STAFF-047: Submitting the address form blank flags all four mandatory fields at once', async ({ page }) => {
    const requests: string[] = [];
    page.on('request', (r) => requests.push(r.url()));

    await address.openPermanentAddressForm();
    await address.submitForm();

    // Unlike the eKYC PAN/DL popups, which reveal missing fields one at a time (D-08).
    await address.verifyAllMandatoryErrorsShown();

    // Client-side: the absence of any address request is what proves the rule is enforced
    // before the server is involved.
    expect(requests.filter((u) => /address\/(save|submit)/.test(u))).toEqual([]);
  });

  test('TC-STAFF-135: Country is disabled and fixed to India', async () => {
    await address.openPermanentAddressForm();

    // BR-18 — non-Indian addresses cannot be entered at this step.
    await address.verifyCountryIsFixedToIndia();
  });

  test('TC-STAFF-077: Cancelling the address popup initiates nothing', async ({ page }) => {
    const requests: string[] = [];
    page.on('request', (r) => requests.push(r.url()));

    await address.openPermanentAddressForm();
    await address.cancelForm();

    expect(requests.filter((u) => /address\/(save|submit)/.test(u))).toEqual([]);
  });

  test('TC-STAFF-162: The State list is populated from master data', async () => {
    // Re-opens the step so the states request can be captured; the dropdown itself is
    // virtualised and cannot be read reliably.
    await address.openPermanentAddressForm();
    const states = await address.getStateOptions();

    expect(states.length, 'State options must be populated, not empty or hardcoded').toBeGreaterThan(20);
  });

  /**
   * AC15 — every current Indian state and union territory must be selectable.
   *
   * D-15: the list has 33 entries and is missing Bihar, Sikkim, Telangana and Ladakh, with
   * "Rajasthan" misspelled "Rajsthan". Address Details is mandatory, so residents of those
   * four jurisdictions cannot open an account at all. Critical, and regulatory in effect.
   */
  test('TC-STAFF-048: [D-15] Every Indian state and UT must be selectable', async () => {
    test.fail(
      true,
      'D-15: State master data is missing Bihar, Sikkim, Telangana and Ladakh, and misspells ' +
        'Rajasthan as "Rajsthan". Affected residents cannot complete a mandatory step.',
    );

    await address.openPermanentAddressForm();
    const states = await address.getStateOptions();

    for (const required of ['Bihar', 'Sikkim', 'Telangana', 'Ladakh', 'Rajasthan']) {
      expect(states, `${required} must be selectable`).toContain(required);
    }
    expect(states, 'Rajasthan must not be misspelled').not.toContain('Rajsthan');
  });

  /**
   * AC15 — City must be filtered by the selected State.
   *
   * D-16: no cascade exists. Selecting a State fires no request and the City list stays at
   * 4,498 entries spanning every state — and an impossible pair is not merely selectable but
   * is *persisted* (Maharashtra + Abohar saved with mutually inconsistent master-data codes).
   */
  test('TC-STAFF-049: [D-16] City must be filtered by the selected State', async () => {
    test.fail(
      true,
      'D-16: selecting a State fires no request and never re-filters City; all 4,498 cities ' +
        'remain selectable, and impossible State/City pairs are persisted.',
    );

    await address.openPermanentAddressForm();
    await address.selectState(SYNTHETIC.address.state);

    const cities = await address.getCityOptions();
    expect(
      cities.length,
      'City must be scoped to the selected State, not list every city in India',
    ).toBeLessThan(1000);
    expect(cities, 'a Punjab city must not be offered under Maharashtra').not.toContain('Abohar');
  });

  test('TC-STAFF-166: Address Proof upload is optional', async () => {
    await address.openPermanentAddressForm();

    // The upload control carries no mandatory marker here, unlike PAN's (which is mandatory
    // and hard-blocked by D-05).
    await expect(address.page.getByText('Upload Address Proof')).not.toContainText('*');
  });
});
