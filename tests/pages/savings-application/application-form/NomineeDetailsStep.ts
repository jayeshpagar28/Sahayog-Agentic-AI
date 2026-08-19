import { type Page, type Locator, expect } from '@playwright/test';

/**
 * Nominee Details — module sequence 12, stepCode NOMINEE_INFORMATION.
 *
 * Two pages: nominee details, then the nominee's address. A date of birth under 18 reveals
 * five mandatory guardian fields (BR-24) — the best-implemented conditional logic in the
 * journey, and the highest-value thing this step has to test.
 *
 * Field names are those recorded in specs/STAFF_TS001-exploration-log.md.
 */
export class NomineeDetailsStep {
  static readonly STEP_LABEL = 'Nominee Details';

  /** The five fields a minor nominee must reveal, per BR-24. */
  static readonly GUARDIAN_FIELDS = [
    'guardian_name',
    'guardian_dob',
    'guardian_age',
    'guardian_address',
  ] as const;

  readonly page: Page;

  readonly fullNameInput: Locator;
  readonly relationDropdown: Locator;
  readonly dateOfBirthInput: Locator;
  readonly ageInput: Locator;

  readonly guardianNameInput: Locator;
  readonly guardianRelationDropdown: Locator;
  readonly guardianAddressInput: Locator;
  readonly guardianDobInput: Locator;
  readonly guardianAgeInput: Locator;

  readonly submitButton: Locator;
  readonly nomineeTable: Locator;
  readonly addAddressLink: Locator;
  readonly useExistingAddressCheckbox: Locator;

  constructor(page: Page) {
    this.page = page;

    this.fullNameInput = page.locator('[name="nominee_name"]');
    // The first PrimeReact dropdown in the step panel. Filtering by /Relation of nominee/
    // never matches: the widget's own text is its placeholder ("Select"), while the label is a
    // sibling element outside it.
    this.relationDropdown = page.locator('.categorytabcontentwrap .p-dropdown').first();
    this.dateOfBirthInput = page.locator('[name="nominee_dob"]');
    this.ageInput = page.locator('[name="nominee_age"]');

    this.guardianNameInput = page.locator('[name="guardian_name"]');
    // Second dropdown, revealed only when the nominee is a minor.
    this.guardianRelationDropdown = page.locator('.categorytabcontentwrap .p-dropdown').nth(1);
    this.guardianAddressInput = page.locator('[name="guardian_address"]');
    this.guardianDobInput = page.locator('[name="guardian_dob"]');
    this.guardianAgeInput = page.locator('[name="guardian_age"]');

    this.submitButton = page.locator('.categorytabcontentwrap button:visible', { hasText: /^Submit$/ }).last();
    this.nomineeTable = page.locator('.categorytabcontentwrap table');
    this.addAddressLink = page.getByText('Click Here For Add Address');
    this.useExistingAddressCheckbox = page.getByText('Use Existing Address');
  }

  async fillNominee(fullName: string, relation: string, dateOfBirth: string): Promise<void> {
    await this.fullNameInput.fill(fullName);
    await this.selectRelation(relation);
    await this.setDateOfBirth(dateOfBirth);
  }

  async selectRelation(relation: string): Promise<void> {
    await this.relationDropdown.click();
    const panel = this.page.locator('.p-dropdown-panel');
    await panel.waitFor({ state: 'visible', timeout: 15000 });
    await panel.locator('.p-dropdown-item').filter({ hasText: new RegExp(`^${relation}$`) }).first().click();
  }

  /** `yyyy-mm-dd` — the field is a native input[type=date]. */
  async setDateOfBirth(dateOfBirth: string): Promise<void> {
    await this.dateOfBirthInput.fill(dateOfBirth);
    // Age is derived client-side from DOB; give the handler a chance to recompute before
    // any assertion reads it.
    await expect(this.ageInput).not.toHaveValue('', { timeout: 10000 });
  }

  /** The derived, read-only age. Renders fractionally today (e.g. "36.03") — see D-30. */
  async getDerivedAge(): Promise<string> {
    return (await this.ageInput.inputValue()).trim();
  }

  /**
   * The relation list (FR-63: 17 options from `relation/app/getRelationList`).
   *
   * Opened and read in one in-page pass — the PrimeReact panel is virtualised, so a locator
   * read returns only the realised subset and understates the count.
   */
  async getRelationOptions(): Promise<string[]> {
    const options = await this.page.evaluate(async () => {
      const dropdown = document.querySelector('.categorytabcontentwrap .p-dropdown') as HTMLElement | null;
      if (!dropdown) return [];
      dropdown.click();
      await new Promise((resolve) => setTimeout(resolve, 2200));
      return Array.from(document.querySelectorAll('.p-dropdown-panel .p-dropdown-item')).map((i) =>
        (i as HTMLElement).innerText.trim(),
      );
    });
    await this.page.keyboard.press('Escape');
    return options.map((o) => o.trim()).filter((o) => o && !/^select$/i.test(o));
  }

  /** BR-24 — a nominee under 18 must reveal all five guardian fields. */
  async verifyGuardianBlockVisible(): Promise<void> {
    await expect(this.guardianNameInput).toBeVisible();
    await expect(this.guardianAddressInput).toBeVisible();
    await expect(this.guardianDobInput).toBeVisible();
    await expect(this.guardianAgeInput).toBeVisible();
    await expect(this.guardianRelationDropdown).toBeVisible();
  }

  /** Restoring an adult DOB must collapse the block cleanly, leaving no residue. */
  async verifyGuardianBlockHidden(): Promise<void> {
    await expect(this.guardianNameInput).toBeHidden();
    await expect(this.guardianAddressInput).toBeHidden();
    await expect(this.guardianDobInput).toBeHidden();
    await expect(this.guardianAgeInput).toBeHidden();
  }

  async isGuardianBlockVisible(): Promise<boolean> {
    return this.guardianNameInput.isVisible().catch(() => false);
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }

  /** BR-23 — nomination is unconditionally mandatory; no decline path should exist. */
  async hasDeclineNominationControl(): Promise<boolean> {
    return this.page
      .getByText(/decline|skip nomination|no nominee/i)
      .first()
      .isVisible()
      .catch(() => false);
  }

  /**
   * Re-opens a saved nominee's detail form from the nominee table.
   *
   * On resume the step renders a TABLE (Full Name / Status / Delete / Action), not the form.
   * Verified live: clicking the nominee's NAME cell re-opens its detail page pre-populated —
   * the row itself, and the row's own Action "Submit", both do nothing, and the step-level
   * Submit does not advance from the table view either. Submitting the re-opened form is what
   * reveals page 2 (the nominee's Registered Address).
   */
  async openSavedNominee(fullName: string): Promise<boolean> {
    const row = this.page.locator('.categorytabcontentwrap tbody tr').filter({ hasText: fullName }).first();
    if (!(await row.isVisible().catch(() => false))) return false;

    await row.locator('td').first().click();
    await this.fullNameInput.waitFor({ state: 'visible', timeout: 20000 });
    return true;
  }

  async openNomineeAddressForm(): Promise<void> {
    await this.addAddressLink.click();
  }

  /**
   * BR-25 / FR-64 — the nominee address opens with "Use Existing Address" already ticked.
   *
   * Scoped to `.popupoverlay` and read via the DOM: PrimeReact keeps the real
   * `<input type="checkbox">` hidden inside `.p-hidden-accessible`, and an unscoped
   * `.first()` picks up an unrelated checkbox elsewhere on the page.
   */
  async isUseExistingAddressChecked(): Promise<boolean> {
    await this.page.locator('.popupoverlay').waitFor({ state: 'visible', timeout: 20000 });

    // Poll rather than read once. The overlay becomes visible BEFORE the form initialises and
    // applies the pre-check plus the copied address, so an immediate read reports false on a
    // product that is behaving correctly — verified live: checked=true with Address Line 1
    // already populated.
    const readChecked = () =>
      this.page.evaluate(() => {
        const box = document.querySelector('.popupoverlay input[type="checkbox"]') as HTMLInputElement | null;
        return !!box?.checked;
      });

    const deadline = Date.now() + 20000;
    for (;;) {
      if (await readChecked()) return true;
      if (Date.now() > deadline) return false;
      await this.page.waitForTimeout(1000);
    }
  }
}
