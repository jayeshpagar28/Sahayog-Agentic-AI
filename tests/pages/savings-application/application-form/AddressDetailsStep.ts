import { type Page, type Locator, expect } from '@playwright/test';

export interface AddressInput {
  addressLine1: string;
  addressLine2?: string;
  area?: string;
  state: string;
  city: string;
  pinCode: string;
}

/**
 * Address Details — module sequence 5, stepCode ADDR_VERIFICATION.
 *
 * Two mandatory sections (Permanent, Communication), each opened through a
 * "Click Here For Add Address" control into a shared 8-field form.
 *
 * Selectors verified live against SAH-1003-815 on 2026-08-18:
 *   - The form is NOT a modal/[role=dialog]. It renders inside `.popupoverlay`
 *     (> .resendpopupwrap > .categorytabcontent); the inner `.categorybox` holds only the
 *     text fields, not the buttons or dropdowns.
 *   - Cancel carries the platform-wide `.closepopupbtn` class (same convention as the eKYC popups).
 *   - Address Line 1/2 and Area are <textarea> elements at maxLength 255.
 *   - State and City render a PrimeReact `.p-dropdown`. Their native <select name="state"|"city">
 *     counterparts are stubs holding a single placeholder option — the real list exists only
 *     in `.p-dropdown-panel` once opened, so options must be read from the open panel.
 *   - Pin code has no name attribute — it is addressed by placeholder.
 */
export class AddressDetailsStep {
  static readonly STEP_LABEL = 'Address Details';

  readonly page: Page;

  // Section-level
  readonly addAddressLinks: Locator;
  readonly stepSubmitButton: Locator;

  // Form
  readonly form: Locator;
  readonly addressLine1Input: Locator;
  readonly addressLine2Input: Locator;
  readonly areaInput: Locator;
  readonly countryInput: Locator;
  readonly stateSelect: Locator;
  readonly citySelect: Locator;
  readonly stateDropdown: Locator;
  readonly cityDropdown: Locator;
  readonly pinCodeInput: Locator;
  readonly sameAsPermanentCheckbox: Locator;
  readonly submitButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    this.page = page;

    this.addAddressLinks = page.getByText('Click Here For Add Address');
    // The step's own Submit is a DESCENDANT of the panel, not a direct child — and `.last()`
    // guards against strict-mode violations when a popup contributes another Submit.
    this.stepSubmitButton = page.locator('.categorytabcontentwrap button:visible', { hasText: /^Submit$/ }).last();

    // Verified live: the form renders inside `.popupoverlay` (> .resendpopupwrap >
    // .categorytabcontent). That overlay is the element that actually contains the Submit
    // button, the `.closepopupbtn` and both PrimeReact dropdowns — the inner `.categorybox`
    // holds only the text fields.
    this.form = page.locator('.popupoverlay');

    this.addressLine1Input = page.locator('textarea[name="address_line1"]');
    this.addressLine2Input = page.locator('textarea[name="address_line2"]');
    this.areaInput = page.locator('textarea[name="area"]');
    this.countryInput = page.locator('input[name="country"]');

    // The native <select name="state"|"city"> elements are PrimeReact stubs carrying a single
    // placeholder option — the real list exists only in the dropdown panel once opened, so
    // these are kept for identification but are NOT a usable source of options.
    this.stateSelect = page.locator('select[name="state"]');
    this.citySelect = page.locator('select[name="city"]');

    // PrimeReact dropdowns — the controls a user actually clicks. Within the form, the
    // first is State and the second is City; their labels change once a value is chosen,
    // so position is stabler than label text.
    this.stateDropdown = this.form.locator('.p-dropdown').nth(0);
    this.cityDropdown = this.form.locator('.p-dropdown').nth(1);

    this.pinCodeInput = page.getByPlaceholder('Pin code');
    this.sameAsPermanentCheckbox = page.getByText('Same as Permanent address');
    this.submitButton = this.form.locator('button', { hasText: 'Submit' });
    this.cancelButton = this.form.locator('.closepopupbtn');
  }

  async openPermanentAddressForm(): Promise<void> {
    await this.addAddressLinks.first().click();
    await this.addressLine1Input.waitFor({ state: 'visible', timeout: 15000 });
  }

  /**
   * Opens the Communication address form.
   *
   * Targets the LAST remaining "Click Here For Add Address" link rather than a fixed index:
   * once the Permanent address is saved its link disappears (FR-37 — a saved address has no
   * edit affordance), so `nth(1)` exists only while both are still outstanding.
   */
  async openCommunicationAddressForm(): Promise<void> {
    await this.addAddressLinks.last().click();
    await this.addressLine1Input.waitFor({ state: 'visible', timeout: 15000 });
  }

  async fillAddress(input: AddressInput): Promise<void> {
    await this.addressLine1Input.fill(input.addressLine1);
    if (input.addressLine2) await this.addressLine2Input.fill(input.addressLine2);
    if (input.area) await this.areaInput.fill(input.area);
    await this.selectState(input.state);
    await this.selectCity(input.city);
    // Filled last: a populated Pin code has been observed being silently cleared by later
    // interaction elsewhere in this form (D-20).
    await this.pinCodeInput.fill(input.pinCode);
  }

  async selectState(state: string): Promise<void> {
    await this.stateDropdown.click();
    await this.page.locator('.p-dropdown-panel .p-dropdown-item')
      .filter({ hasText: new RegExp(`^${state}$`) }).first().click();
  }

  async selectCity(city: string): Promise<void> {
    await this.cityDropdown.click();
    await this.page.locator('.p-dropdown-panel .p-dropdown-item')
      .filter({ hasText: new RegExp(`^${city}$`) }).first().click();
  }

  /**
   * Opens a dropdown and reads its full option list in a single in-page pass.
   *
   * Both the open and the read happen in the page. PrimeReact virtualises this panel, and a
   * Playwright locator read returns only the realised subset (observed: 1 of 33) — against
   * defects defined by what is MISSING (D-15) or by an over-long list (D-16), an under-read
   * silently produces a false pass. Clicking and reading in-page returns the complete list.
   *
   * @param index 0 = State, 1 = City (their order within the form).
   */
  private async readDropdownOptions(index: number): Promise<string[]> {
    const options = await this.page.evaluate(async (idx: number) => {
      const overlay = document.querySelector('.popupoverlay');
      const dropdowns = overlay ? Array.from(overlay.querySelectorAll('.p-dropdown')) : [];
      const dropdown = dropdowns[idx] as HTMLElement | undefined;
      if (!dropdown) return [];

      dropdown.click();
      await new Promise((resolve) => setTimeout(resolve, 2500));

      return Array.from(document.querySelectorAll('.p-dropdown-panel .p-dropdown-item')).map((el) =>
        (el as HTMLElement).innerText.trim(),
      );
    }, index);

    await this.page.keyboard.press('Escape');
    return options.map((o) => o.trim()).filter((o) => o && !/^select/i.test(o));
  }

  /** The State option list — the oracle for D-15's incomplete master data. */
  async getStateOptions(): Promise<string[]> {
    return this.readDropdownOptions(0);
  }

  /** The City option list — the oracle for D-16's missing State→City cascade. */
  async getCityOptions(): Promise<string[]> {
    return this.readDropdownOptions(1);
  }

  async submitForm(): Promise<void> {
    await this.submitButton.click();
  }

  async cancelForm(): Promise<void> {
    await this.cancelButton.click();
    await this.addressLine1Input.waitFor({ state: 'hidden', timeout: 15000 });
  }

  async submitStep(): Promise<void> {
    await this.stepSubmitButton.click();
  }

  /**
   * Ticks "Same as Permanent address".
   *
   * PrimeReact renders the real `<input type="checkbox">` inside `.p-hidden-accessible`
   * (`data-pc-section="hiddeninput"`) and paints a `.p-checkbox-box` on top. Clicking the
   * input itself fails with "element is not visible" — the box is the control a user hits.
   */
  async tickSameAsPermanent(): Promise<void> {
    const box = this.page.locator('.popupoverlay .p-checkbox-box').first();
    await box.waitFor({ state: 'visible', timeout: 15000 });
    await box.click();

    // The copy is applied asynchronously; wait for it rather than racing the next action.
    await expect(this.addressLine1Input).not.toHaveValue('', { timeout: 20000 });
  }

  /** How many address sections still need filling — 2 = neither saved, 0 = both saved. */
  async countPendingAddressForms(): Promise<number> {
    return this.addAddressLinks.count();
  }

  /** All four mandatory-field errors are raised together on this form, unlike the eKYC
   * popups which reveal them one at a time (D-08). */
  async verifyAllMandatoryErrorsShown(): Promise<void> {
    for (const message of [
      'Address Line 1 is required',
      'State is required',
      'City is required',
      'Pin code is required',
    ]) {
      await expect(this.page.getByText(message)).toBeVisible();
    }
  }

  /** BR-18 — non-Indian addresses cannot be entered; Country is fixed and disabled. */
  async verifyCountryIsFixedToIndia(): Promise<void> {
    await expect(this.countryInput).toBeDisabled();
    await expect(this.countryInput).toHaveValue(/India/i);
  }
}
