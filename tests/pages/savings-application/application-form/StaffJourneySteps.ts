import { type Page, type Locator, expect } from '@playwright/test';

/**
 * The remaining 1003 steps between Address Details and the Summary — Branch Selection,
 * Basic Details, Salaried Information, Applicant Photo and Document Upload.
 *
 * Every selector here was captured live from SAH-1003-815 on 2026-08-18 while walking the
 * journey, not inferred:
 *
 *  - Step panel is `.categorytabcontentwrap`; popups render inside `.popupoverlay`.
 *  - Basic Details' 13 dropdowns are PrimeReact `.p-dropdown` widgets. Their paired
 *    `<select name="...">` elements are STUBS holding only a placeholder option, so options
 *    must be read from `.p-dropdown-panel .p-dropdown-item` once opened. The selects are still
 *    the reliable way to IDENTIFY which dropdown is which (each sits beside its own select).
 *  - The Capture Image dialog is a PrimeReact `.p-dialog` (NOT `.popupoverlay`), carrying the
 *    reverse-geocoded address, latitude, longitude, a live <video> and a `Capture photo` button.
 *  - Applicant Photo exposes ZERO `input[type=file]` — capture is the only path, which is why
 *    a fake video device is mandatory (project `chromium-camera`).
 */
export class StaffJourneySteps {
  readonly page: Page;
  readonly panel: Locator;

  constructor(page: Page) {
    this.page = page;
    this.panel = page.locator('.categorytabcontentwrap');
  }

  // ---------------------------------------------------------------- shared helpers

  /** The step's own Submit (the panel's direct child button), not a popup's. */
  private stepSubmit(): Locator {
    // `:visible` matters: the panel carries hidden Submit buttons from collapsed sub-forms,
    // and `.last()` alone resolves to one of those and then times out as unclickable.
    return this.panel.locator('button:visible', { hasText: /^Submit$/ }).last();
  }

  async submitStep(): Promise<void> {
    await this.stepSubmit().click();
  }

  /** Waits for the wizard to advance to the named stage, tolerating the panel's async reload. */
  async expectAdvancedTo(label: string, timeout = 60000): Promise<void> {
    await expect(
      this.page.locator('#categorytab li a').filter({ hasText: label }),
      `workflow should advance to ${label}`,
    ).toBeVisible({ timeout });
  }

  /**
   * Selects a PrimeReact dropdown value by the name of the `<select>` it sits beside.
   *
   * Opening and choosing happen in one in-page pass: the panel is virtualised, so a
   * locator-based read of its items returns only the realised subset.
   */
  async selectDropdownByField(selectName: string, preferred?: string): Promise<string | null> {
    return this.page.evaluate(
      async ({ selectName: name, preferred: want }) => {
        const wrap = document.querySelector('.categorytabcontentwrap');
        if (!wrap) return null;

        const dropdowns = Array.from(wrap.querySelectorAll('.p-dropdown'));
        const target = dropdowns.find((dropdown) => {
          let node: Element | null = dropdown;
          for (let i = 0; i < 4 && node; i += 1) {
            const select = node.querySelector?.('select');
            if (select) return (select as HTMLSelectElement).name === name;
            node = node.parentElement;
          }
          return false;
        }) as HTMLElement | undefined;
        if (!target) return null;

        target.click();
        await new Promise((resolve) => setTimeout(resolve, 1800));

        const items = Array.from(document.querySelectorAll('.p-dropdown-panel .p-dropdown-item'));
        if (!items.length) return null;

        const chosen =
          (want && items.find((i) => (i as HTMLElement).innerText.trim().toLowerCase() === want.toLowerCase())) ||
          items[0];
        const text = (chosen as HTMLElement).innerText.trim();
        (chosen as HTMLElement).click();
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return text;
      },
      { selectName, preferred },
    );
  }

  /** Fills a text field by its `name`, driving React's value setter so the handler runs. */
  async fillByName(name: string, value: string): Promise<boolean> {
    return this.page.evaluate(
      ({ name: fieldName, value: fieldValue }) => {
        const el = document.querySelector(`[name="${fieldName}"]`) as HTMLInputElement | null;
        if (!el || el.disabled) return false;
        const proto =
          el.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
        Object.getOwnPropertyDescriptor(proto, 'value')!.set!.call(el, fieldValue);
        el.dispatchEvent(new Event('input', { bubbles: true }));
        return true;
      },
      { name, value },
    );
  }

  /** Fills a text field addressed by placeholder — several Basic Details fields have no name. */
  async fillByPlaceholder(placeholder: string, value: string): Promise<boolean> {
    return this.page.evaluate(
      ({ placeholder: ph, value: fieldValue }) => {
        const el = Array.from(
          document.querySelectorAll('.categorytabcontentwrap input'),
        ).find((i) => (i as HTMLInputElement).placeholder === ph) as HTMLInputElement | undefined;
        if (!el || el.disabled) return false;
        Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!.set!.call(el, fieldValue);
        el.dispatchEvent(new Event('input', { bubbles: true }));
        return true;
      },
      { placeholder, value },
    );
  }

  // ---------------------------------------------------------------- Branch Selection

  async getDefaultBranchText(): Promise<string> {
    return (await this.panel.innerText()).replace(/\s+/g, ' ').trim();
  }

  /** BR / FR-39 — the pre-selected branch saves on the FIRST click. */
  async submitDefaultBranch(): Promise<void> {
    await this.submitStep();
  }

  // ---------------------------------------------------------------- Basic Details

  /** Field inventory captured live: 13 dropdowns + named text inputs + 4 placeholder-only inputs. */
  static readonly BASIC_DROPDOWNS = [
    { field: 'mode_of_operation', prefer: 'Self' },
    { field: 'salutation', prefer: 'Mr' },
    { field: 'gender', prefer: 'Male' },
    { field: 'marital_status', prefer: 'Unmarried' },
    { field: 'religion', prefer: 'Hindu' },
    { field: 'caste_category', prefer: 'General' },
    { field: 'education', prefer: 'Graduate' },
    { field: 'region', prefer: undefined },
    { field: 'funding_mode', prefer: 'Cash' },
  ] as const;

  async fillBasicDetails(staffId: string): Promise<Record<string, string | null>> {
    const chosen: Record<string, string | null> = {};
    for (const { field, prefer } of StaffJourneySteps.BASIC_DROPDOWNS) {
      chosen[field] = await this.selectDropdownByField(field, prefer);
    }

    await this.fillByName('email_id', 'qa.staff.test@example.com');
    await this.fillByName('father_first_name', 'Arun');
    await this.fillByName('father_middle_name', 'Kumar');
    await this.fillByName('father_last_name', 'Pagar');
    await this.fillByName('mother_name', 'Test Mother');
    await this.fillByName('spouse_name', 'Arun Pagar');
    await this.fillByName('staff_id', staffId);

    await this.fillByPlaceholder('Expected Value of Transaction (yearly)', '100000');
    await this.fillByPlaceholder('Expected Number of Transaction (yearly)', '120');
    await this.fillByPlaceholder('Agriculture Income', '0');
    await this.fillByPlaceholder('Other Than Agricultural Income', '500000');

    return chosen;
  }

  /** FR-41 — `Is Staff` and `Staff Id` exist only on scheme 1003. */
  async verifyStaffFieldsPresent(): Promise<void> {
    await expect(this.page.locator('select[name="is_staff"]')).toHaveCount(1);
    await expect(this.page.locator('input[name="staff_id"]')).toHaveCount(1);
  }

  /** FR-42 — Employment Type and Initial Funding Amount are absent on 1003. */
  async verifyAbsentFields(): Promise<void> {
    await expect(this.page.locator('select[name="employment_type"]')).toHaveCount(0);
    await expect(this.page.getByPlaceholder('Initial Funding Amount')).toHaveCount(0);
  }

  /** FR-45 — `Is Staff` offers exactly one option. */
  async getIsStaffOptionCount(): Promise<number> {
    return this.page.evaluate(() => {
      const sel = document.querySelector('select[name="is_staff"]') as HTMLSelectElement | null;
      return sel ? sel.options.length : -1;
    });
  }

  /** FR-40 — name and DOB arrive from eKYC, with Full name and DOB disabled. */
  async verifyIdentityPrefilled(): Promise<void> {
    await expect(this.page.locator('input[name="full_name"]')).toBeDisabled();
    await expect(this.page.locator('input[name="dob"]')).toBeDisabled();
    expect(await this.page.locator('input[name="full_name"]').inputValue()).not.toBe('');
  }

  /** D-24 — Spouse/Father's Name is capped at 20 while sibling name fields allow 100. */
  async getSpouseNameMaxLength(): Promise<number> {
    return this.page.locator('input[name="spouse_name"]').evaluate((el) => (el as HTMLInputElement).maxLength);
  }

  // ---------------------------------------------------------------- Salaried Information

  async fillSalariedInformation(): Promise<Record<string, string | null>> {
    return {
      category: await this.selectDropdownByField('category'),
      designation: await this.selectDropdownByField('designation'),
    };
  }

  /** Falls back to positional selection when the field names differ from expectation. */
  async fillSalariedByPosition(): Promise<string[]> {
    return this.page.evaluate(async () => {
      const wrap = document.querySelector('.categorytabcontentwrap');
      const dropdowns = Array.from(wrap?.querySelectorAll('.p-dropdown') ?? []) as HTMLElement[];
      const chosen: string[] = [];
      for (const dropdown of dropdowns) {
        dropdown.click();
        await new Promise((resolve) => setTimeout(resolve, 1800));
        const items = Array.from(document.querySelectorAll('.p-dropdown-panel .p-dropdown-item'));
        if (!items.length) continue;
        chosen.push((items[0] as HTMLElement).innerText.trim());
        (items[0] as HTMLElement).click();
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      return chosen;
    });
  }

  // ---------------------------------------------------------------- Applicant Photo

  /** FR-54 — the step exposes no file input at all; capture is the only path. */
  async countFileInputs(): Promise<number> {
    return this.panel.locator('input[type="file"]').count();
  }

  async openVerifiedPhoto(): Promise<void> {
    await this.panel.getByText('Verified Photo', { exact: true }).first().click();
    await this.page.locator('.popupoverlay').waitFor({ state: 'visible', timeout: 20000 });
  }

  /** FR-53 — Submit stays disabled until a source is chosen. */
  async isVerifiedPhotoSubmitDisabled(): Promise<boolean> {
    return this.page.evaluate(() => {
      const overlay = document.querySelector('.popupoverlay');
      const submit = Array.from(overlay?.querySelectorAll('button') ?? []).find((b) =>
        /^Submit$/i.test((b as HTMLElement).innerText.trim()),
      ) as HTMLButtonElement | undefined;
      return submit ? submit.disabled : true;
    });
  }

  async getVerifiedPhotoSources(): Promise<string[]> {
    return this.page.evaluate(async () => {
      const dropdown = document.querySelector('.popupoverlay .p-dropdown') as HTMLElement | null;
      if (!dropdown) return [];
      dropdown.click();
      await new Promise((resolve) => setTimeout(resolve, 2200));
      return Array.from(document.querySelectorAll('.p-dropdown-panel .p-dropdown-item')).map((i) =>
        (i as HTMLElement).innerText.trim(),
      );
    });
  }

  async chooseVerifiedPhotoSource(match: RegExp): Promise<void> {
    await this.page.evaluate(async (pattern: string) => {
      const re = new RegExp(pattern, 'i');
      const item = Array.from(document.querySelectorAll('.p-dropdown-panel .p-dropdown-item')).find((i) =>
        re.test((i as HTMLElement).innerText),
      ) as HTMLElement | undefined;
      item?.click();
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }, match.source);
  }

  async submitVerifiedPhoto(): Promise<void> {
    await this.page.evaluate(() => {
      const overlay = document.querySelector('.popupoverlay');
      const submit = Array.from(overlay?.querySelectorAll('button') ?? []).find((b) =>
        /^Submit$/i.test((b as HTMLElement).innerText.trim()),
      ) as HTMLElement | undefined;
      submit?.click();
    });

    // Wait for the outcome rather than sleeping: the photo has registered only once the
    // control is replaced by "Document Uploaded".
    await expect(this.panel).toContainText('Document Uploaded', { timeout: 30000 });
  }

  /**
   * Captures the signature.
   *
   * Targets the "Capture Using Camera" control belonging to the SIGNATURE field, located by
   * document order relative to the "Upload Applicant Signature" label — never by index.
   *
   * Index is unusable here for two compounding reasons: the label is rendered TWICE per field
   * (D-29), and once the photo registers its controls are replaced by "Document Uploaded",
   * shifting every remaining index. Picking index 0 therefore hits the Photo control on a
   * fresh step and the Signature control on a half-completed one — which is exactly why this
   * appeared to work during manual exploration and failed in a clean run.
   *
   * The dialog is a PrimeReact `.p-dialog` carrying the live video, so this needs the fake
   * video device supplied by the `chromium-camera` project.
   */
  async captureSignature(): Promise<void> {
    const result = await this.page.evaluate(() => {
      const wrap = document.querySelector('.categorytabcontentwrap');
      if (!wrap) return { ok: false, reason: 'step panel not found', controls: 0 };

      // Locate the Signature heading by TEXT NODE, not by element.
      //
      // The heading carries a child element for its mandatory "*" marker, so a
      // `children.length === 0` element search never matches it — which is what made the
      // previous attempt report "control not found" while the control was plainly present.
      const walker = document.createTreeWalker(wrap, NodeFilter.SHOW_TEXT);
      let signatureNode: Node | null = null;
      while (walker.nextNode()) {
        if (/Upload Applicant Signature/i.test(walker.currentNode.nodeValue ?? '')) {
          signatureNode = walker.currentNode;
          break;
        }
      }
      if (!signatureNode) return { ok: false, reason: 'Signature heading not found', controls: 0 };

      const captureControls = Array.from(wrap.querySelectorAll('*')).filter(
        (e) => e.children.length === 0 && /Capture Using Camera/i.test((e as HTMLElement).innerText || ''),
      ) as HTMLElement[];

      const afterSignature = captureControls.filter(
        (e) => !!(signatureNode!.compareDocumentPosition(e) & Node.DOCUMENT_POSITION_FOLLOWING),
      );
      if (!afterSignature.length) {
        return { ok: false, reason: 'no capture control after the Signature heading', controls: captureControls.length };
      }

      afterSignature[0].click();
      return { ok: true, reason: '', controls: captureControls.length };
    });

    if (!result.ok) {
      throw new Error(
        `Could not open the Signature capture dialog: ${result.reason} ` +
          `(${result.controls} "Capture Using Camera" control(s) present on the step).`,
      );
    }

    await this.page.locator('.p-dialog video').waitFor({ state: 'visible', timeout: 30000 });
    await this.page.getByRole('button', { name: 'Capture photo' }).click();
    await this.page.locator('.p-dialog').waitFor({ state: 'hidden', timeout: 30000 });
  }

  async countRegisteredImages(): Promise<number> {
    const text = await this.panel.innerText();
    return (text.match(/Document Uploaded/g) ?? []).length;
  }

  /**
   * Waits until both the photo and the signature show "Document Uploaded".
   *
   * Polls rather than reading once: the label is swapped in after the capture dialog closes,
   * so an immediate read races the re-render and reports a single registration.
   */
  async waitForBothImagesRegistered(timeoutMs = 30000): Promise<void> {
    await expect
      .poll(() => this.countRegisteredImages(), {
        message: 'photo and signature should both register as "Document Uploaded"',
        timeout: timeoutMs,
      })
      .toBeGreaterThanOrEqual(2);
  }

  // ---------------------------------------------------------------- Document Upload

  /** BR-26 / D-35 — the only step configured skipAllowed: 1; submits with nothing attached. */
  async submitDocumentUploadEmpty(): Promise<void> {
    await this.submitStep();
  }

  async hasEmptySubmitWarning(): Promise<boolean> {
    return this.page
      .getByText(/no documents|attach at least|document is required/i)
      .first()
      .isVisible({ timeout: 4000 })
      .catch(() => false);
  }
}
