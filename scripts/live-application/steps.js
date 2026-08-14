'use strict';

/**
 * Step library for the live Savings Application runner.
 *
 * Every exported step is `{ isActive(page): Promise<boolean>, run(page, data, ctx): Promise<Result> }`.
 * `isActive` is a cheap, side-effect-free check for whether this step's signature UI is
 * currently on screen (used by run.js to find "what to do next" without needing a single
 * generic stepper-parser, since nested inner sub-steppers make that unreliable).
 *
 * `run` performs the step and returns one of:
 *   { done: true }                                        - step completed, move to the next one
 *   { waiting: 'otp'|'digilocker'|'liveliness', mobile }   - stop, needs a human
 *   { summary: true, text }                                - Summary reached, stop (never auto-submits)
 *   { submitted: true, response }                          - final submit completed
 */

const VALID_UPLOAD_FILE = `${__dirname}/../../.test-upload-files/valid.png`;

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

/** PrimeReact dropdowns can silently fail to populate their option list on a fast
 * scripted click - retry opening until at least one option renders. */
async function retryDropdownSelect(page, placeholderText, optionText, { exact = true } = {}) {
  let dd = page.locator('.p-dropdown', { hasText: placeholderText });
  if ((await dd.count()) === 0) {
    // The placeholder text won't match once a value is already selected (e.g. retrying
    // this same field after a validation failure elsewhere on the form) - fall back to
    // the single dropdown on screen rather than failing to locate it at all.
    const anyDd = page.locator('.p-dropdown');
    if ((await anyDd.count()) === 1) dd = anyDd;
  }
  if (process.env.DEBUG_STEPS) {
    console.error(`  [retryDropdownSelect] placeholder="${placeholderText}" option="${optionText}" ddCount=${await dd.count()}`);
  }
  await dd.click();
  let opts = page.getByRole('option', { name: optionText, exact });
  for (let i = 0; i < 6; i++) {
    if ((await opts.count()) > 0) break;
    await page.waitForTimeout(500);
    if (i === 3) await dd.click().catch(() => undefined); // nudge a stuck dropdown
  }
  await opts.first().click();
  await page.waitForTimeout(400);
}

/** Selects a dropdown by its zero-based position among all `.p-dropdown` elements on the
 * page, for fields with no unique placeholder text left once other dropdowns are filled. */
async function selectDropdownByIndex(page, index, optionText, { exact = true } = {}) {
  const dd = page.locator('.p-dropdown').nth(index);
  await dd.click();
  await page.waitForTimeout(600);
  await page.getByRole('option', { name: optionText, exact }).first().click();
  await page.waitForTimeout(400);
}

/** Fills an address popup: Address Line 1/2/Area are <textarea>, not <input>. Tries
 * "Use Existing Address" (Joint/Guardian/Nominee context) or "Same as Permanent address"
 * (primary applicant's own Communication Address) if present, then fills whatever the
 * auto-fill left blank (per BUG-SILVER-002/BUG-NORMAL-001, usually everything but Line 1). */
async function fillAddressPopup(page, addr, { tryAutoFill = true } = {}) {
  if (tryAutoFill) {
    const useExisting = page.getByText('Use Existing Address', { exact: true });
    const sameAsPermanent = page.getByText('Same as Permanent address', { exact: true });
    if (await useExisting.count() > 0) {
      await useExisting.click();
      await page.waitForTimeout(1500);
    } else if (await sameAsPermanent.count() > 0) {
      await sameAsPermanent.click();
      await page.waitForTimeout(1500);
    }
  }

  const line1 = page.locator('textarea[name="address_line1"]');
  if ((await line1.count()) > 0 && (await line1.inputValue()) === '') {
    await line1.fill(addr.line1 || '');
  }
  const line2 = page.locator('textarea[name="address_line2"]');
  if ((await line2.count()) > 0 && (await line2.inputValue().catch(() => '')) === '') {
    await line2.fill(addr.line2 || addr.line1 || '');
  }

  const stateDropdown = page.locator('.p-dropdown', { hasText: 'Select State' });
  if ((await stateDropdown.count()) > 0) {
    await retryDropdownSelect(page, 'Select State', addr.state);
  }

  const cityDropdown = page.locator('.p-dropdown', { hasText: 'Select City' });
  if ((await cityDropdown.count()) > 0) {
    await retryDropdownSelect(page, 'Select City', addr.city);
  }

  const pinInput = page.locator('input[placeholder="Pin code"], input[placeholder="Pin Code"]').first();
  if ((await pinInput.inputValue().catch(() => '')) === '') {
    await pinInput.fill(addr.pin || '');
  }

  const fileInputs = page.locator('input[type="file"]');
  if ((await fileInputs.count()) > 0) {
    const alreadyAttached = await page.getByText('Address Proof', { exact: false }).count();
    if (alreadyAttached === 0) {
      await fileInputs.first().setInputFiles(VALID_UPLOAD_FILE);
      await page.waitForTimeout(1200);
    }
  }

  const popupSubmit = page.locator('.resendpopupwrap button:visible, [class*="popup" i] button:visible', { hasText: 'Submit' });
  if ((await popupSubmit.count()) > 0) {
    await popupSubmit.first().click();
  } else {
    await page.getByRole('button', { name: 'Submit', exact: true }).last().click();
  }
  await page.waitForTimeout(2500);
}

/** Fail-safe backstop: the Summary/Review page's final action button matches the exact
 * same generic "Submit" selector every other step's outer submit uses. If some other
 * step's isActive() ever false-positive-matches while the page is already on Summary (it
 * happened once for real - SAH-1001-807, 2026-08-13, submitted prematurely with several
 * steps still unfilled), that step's routine submit click would fire the real, irreversible
 * final submission instead of its own. Only the dedicated `summary` step is allowed to
 * click a submit button while this signature is present - everyone else must refuse. */
async function assertNotOnSummaryPage(page, caller) {
  const text = await bodyText(page, 1500);
  const onSummary = text.includes('Lead Details') && text.includes('Mobile Number Verification') && text.includes('Summary');
  if (onSummary) {
    throw new Error(`Refusing to click Submit from "${caller}" - the page shows the Summary/Review signature. This would risk firing the real final submission. Investigate why "${caller}".isActive() matched here instead of the summary step.`);
  }
}

/** Branch-change and management-table finalization both require Submit clicked twice:
 * the first only updates local view (zero network calls), the second fires the real save. */
async function twoSubmit(page) {
  await assertNotOnSummaryPage(page, 'twoSubmit');
  const submitBtn = page.locator('button[type="submit"]:visible', { hasText: 'Submit' });
  await submitBtn.first().click();
  await page.waitForTimeout(2500);
  await assertNotOnSummaryPage(page, 'twoSubmit (2nd click)');
  const submitBtn2 = page.locator('button[type="submit"]:visible', { hasText: 'Submit' });
  if ((await submitBtn2.count()) > 0) {
    await submitBtn2.first().click();
    await page.waitForTimeout(3000);
  }
}

async function outerSubmit(page, wait = 3500) {
  await assertNotOnSummaryPage(page, 'outerSubmit');
  const submitBtn = page.locator('button[type="submit"]:visible', { hasText: 'Submit' });
  await submitBtn.first().click();
  await page.waitForTimeout(wait);
}

async function bodyText(page, limit = 3000) {
  return (await page.locator('body').innerText()).slice(0, limit);
}

/** Fills every dropdown/text field on a Basic-Details-shaped form. Shared by the primary
 * applicant, joint applicant, guardian, and minor - the field set differs slightly (see
 * `opts`), so callers pass which optional fields actually apply. */
async function fillBasicDetailsForm(page, data, opts) {
  const { includeRelationship, includeFundingMode, prefixField } = opts;

  if (includeRelationship) {
    await retryDropdownSelect(page, 'Select Relationship with', data.relationshipWithMain, { exact: false });
  }
  await retryDropdownSelect(page, 'Select Mode of Operation', opts.modeOfOperation).catch(() => undefined);
  await retryDropdownSelect(page, 'Select Prefix', data[prefixField] || data.prefix);
  await retryDropdownSelect(page, 'Select Gender', data.gender);
  await retryDropdownSelect(page, 'Select Marital Status', data.maritalStatus);
  if (data.religion) await retryDropdownSelect(page, 'Select Religion', data.religion);
  await retryDropdownSelect(page, 'Select Caste Category', data.casteCategory);
  await retryDropdownSelect(page, 'Select Education/Qualification', data.education);
  await retryDropdownSelect(page, 'Select Region', data.region);
  await retryDropdownSelect(page, 'Select Employment Type', data.employmentType);
  await retryDropdownSelect(page, 'Select Designation/Profession', data.designation);
  if (includeFundingMode) {
    await retryDropdownSelect(page, 'Select Funding Mode', data.fundingMode);
  }

  const emailInput = page.locator('input[placeholder="Email ID"]');
  if ((await emailInput.count()) > 0 && data.email) {
    await emailInput.fill(data.email);
  }
  await page.locator('input[placeholder="Father First Name"]').fill(data.fatherFirstName || '');
  await page.locator('input[placeholder="Father Last Name"]').fill(data.fatherLastName || '');
  await page.locator("input[placeholder=\"Mother's Name\"]").fill(data.motherName || '');
  const spouseInput = page.locator("input[placeholder=\"Spouse / Father's Name\"]");
  if ((await spouseInput.count()) > 0 && data.spouseOrFatherName) {
    await spouseInput.fill(data.spouseOrFatherName);
  }

  const fundingFields = [
    ['input[placeholder="Initial Funding Amount"]', data.initialFundingAmount],
    ['input[placeholder="Expected Value of Transaction (yearly)"]', data.expectedValue],
    ['input[placeholder="Expected Number of Transaction (yearly)"]', data.expectedNumber],
    ['input[placeholder="Agriculture Income"]', data.agricultureIncome],
    ['input[placeholder="Other Than Agricultural Income"]', data.otherIncome],
  ];
  for (const [selector, value] of fundingFields) {
    const el = page.locator(selector);
    if ((await el.count()) > 0 && value !== undefined) await el.fill(String(value));
  }
}

// ---------------------------------------------------------------------------
// Step: Mobile Number Verification (application-level, always first)
// ---------------------------------------------------------------------------

/** Fills the mobile field and clicks Send, checking the actual `mobile/verify/save`
 * response instead of assuming success. The backend can silently reject the request (e.g.
 * "Mobile verification request is already in process!" when a number was used too
 * recently) while still returning HTTP 200 and leaving the page looking like an OTP was
 * sent - without checking the response body, the caller has no way to tell a real send
 * from a rejected one, and no application even gets created in the rejected case. */
async function sendMobileVerification(page, mobile) {
  const responsePromise = page
    .waitForResponse((res) => res.url().includes('/mobile/verify/save') && res.request().method() === 'POST', { timeout: 15000 })
    .catch(() => null);
  await page.getByPlaceholder('Mobile Number').fill(mobile);
  await page.waitForTimeout(500);
  await page.getByRole('button', { name: 'Send Verification Code' }).click();
  const response = await responsePromise;
  await page.waitForTimeout(2500);

  if (response) {
    const json = await response.json().catch(() => null);
    const result = json && json.resultVo;
    if (result && result.msgCode === 'MOB_VERIF_FAIL') {
      return { ok: false, note: result.msgDescr || 'Mobile verification request failed' };
    }
  }
  return { ok: true };
}

const mobileVerification = {
  async isActive(page) {
    const mobileInput = page.getByPlaceholder('Mobile Number');
    if ((await mobileInput.count()) === 0) return false;
    // The mobile field renders persistently (disabled, value pre-filled) once verified,
    // even while viewing a later tab's panel - a disabled field means this step is done.
    if (await mobileInput.first().isDisabled().catch(() => false)) return false;
    // OTP already sent (mobile input becomes disabled/read-only and the OTP field appears)
    // is a distinct step (mobileOtpEntry) - don't re-match here once that's the real state.
    return (await page.locator('input[name="mobotp"]').count()) === 0;
  },
  async run(page, data) {
    const result = await sendMobileVerification(page, data.applicationMobile);
    if (!result.ok) {
      return { waiting: 'otp', mobile: data.applicationMobile, note: `SEND FAILED: ${result.note} - this mobile number cannot be used right now, supply a different one` };
    }
    return { waiting: 'otp', mobile: data.applicationMobile };
  },
};

const mobileOtpEntry = {
  async isActive(page) {
    return (await page.locator('input[name="mobotp"]').count()) > 0;
  },
  async run(page, data, ctx) {
    if (!ctx.otp) return { waiting: 'otp', mobile: data.applicationMobile };
    await page.locator('input[name="mobotp"]').fill(ctx.otp);
    await page.waitForTimeout(500);
    await outerSubmit(page);
    return { done: true };
  },
};

// ---------------------------------------------------------------------------
// Step: Account Type
// ---------------------------------------------------------------------------

const ACCOUNT_TYPE_LABEL = { individual: 'Individual', joint: 'Joint', minor: 'Minor' };

const accountType = {
  async isActive(page) {
    return (await page.getByText('Please Select This to open', { exact: false }).count()) > 0;
  },
  async run(page, data) {
    const label = ACCOUNT_TYPE_LABEL[data.accountType];
    await page.getByText(label, { exact: true }).first().click();
    await page.waitForTimeout(1000);
    await outerSubmit(page);
    return { done: true };
  },
};

// ---------------------------------------------------------------------------
// Step: eKYC Verification (Aadhaar DigiLocker) - adult applicants only
// ---------------------------------------------------------------------------

/** The eKYC accordion panel is collapsed until its heading is clicked - status text
 * ("Pending"/"Successful"/"Action Required") is invisible until then. So this is a single
 * step (not a separate isActive-detector + run-executor) that clicks first, then branches
 * on whatever state that reveals, rather than trying to pre-detect a collapsed panel's
 * hidden contents. */
function ekycSteps(getMobile) {
  return {
    async isActive(page) {
      return (await page.getByText('Aadhaar Verification through DigiLocker', { exact: false }).count()) > 0;
    },
    async run(page, data, ctx) {
      await page.getByText('Aadhaar Verification through DigiLocker', { exact: false }).first().click();
      await page.waitForTimeout(1500);
      const text = await bodyText(page);

      if (text.includes('Successful')) {
        await outerSubmit(page);
        return { done: true };
      }
      if (text.includes('Action Required')) {
        if (!ctx.digilockerRetried) {
          const resend = page.getByText('Resend Link', { exact: true });
          if ((await resend.count()) > 0) {
            await resend.click();
            await page.waitForTimeout(3000);
            ctx.digilockerRetried = true;
            return { waiting: 'digilocker', mobile: getMobile(data), note: 'Action Required - resent link' };
          }
        }
        return { waiting: 'digilocker', mobile: getMobile(data), note: 'Action Required again after retry - needs manual attention' };
      }
      if (text.includes('Pending')) {
        return { waiting: 'digilocker', mobile: getMobile(data), note: 'still Pending' };
      }

      // Fresh, unopened state - no link sent yet.
      const sendLinkBtn = page.getByRole('button', { name: 'Send Link' });
      if ((await sendLinkBtn.count()) > 0) {
        await sendLinkBtn.click();
        await page.waitForTimeout(3000);
        return { waiting: 'digilocker', mobile: getMobile(data) };
      }
      return { waiting: 'digilocker', mobile: getMobile(data), note: 'unrecognized eKYC panel state - inspect manually' };
    },
  };
}

// ---------------------------------------------------------------------------
// Step: Liveliness Verification (Security Code Based) - adult applicants only
// ---------------------------------------------------------------------------

/** Same collapsed-accordion shape as ekycSteps - a single click-then-branch step. */
function livelinessSteps(getMobile) {
  return {
    async isActive(page) {
      return (await page.getByText('Security Code Based Liveliness Verification', { exact: false }).count()) > 0;
    },
    async run(page, data) {
      await page.getByText('Security Code Based Liveliness Verification', { exact: false }).first().click();
      await page.waitForTimeout(1500);
      const text = await bodyText(page);

      if (text.includes('Successful')) {
        await outerSubmit(page);
        return { done: true };
      }
      if (text.includes('Pending')) {
        return { waiting: 'liveliness', mobile: getMobile(data), note: 'still Pending' };
      }

      const sendLinkBtn = page.getByRole('button', { name: 'Send Link' });
      if ((await sendLinkBtn.count()) > 0) {
        await sendLinkBtn.click();
        await page.waitForTimeout(3000);
        return { waiting: 'liveliness', mobile: getMobile(data) };
      }
      return { waiting: 'liveliness', mobile: getMobile(data), note: 'unrecognized liveliness panel state - inspect manually' };
    },
  };
}

// ---------------------------------------------------------------------------
// Step: Minor KYC Details (replaces eKYC + Liveliness for the minor themselves)
// ---------------------------------------------------------------------------

const minorKycDetails = {
  async isActive(page) {
    return (await page.locator('input[name="first_name"]').count()) > 0
      && (await page.getByText('Minor KYC Details', { exact: false }).count()) > 0;
  },
  async run(page, data) {
    const minor = data.minor;
    await page.locator('input[name="first_name"]').fill(minor.firstName);
    await page.locator('input[name="middle_name"]').fill(minor.middleName);
    await page.locator('input[name="last_name"]').fill(minor.lastName);
    await page.locator('input[name="dob"]').fill(minor.dob);
    await retryDropdownSelect(page, 'Select Identification Document', 'AADHAAR CARD', { exact: false });
    await page.locator('input[name="doc_identification_number"]').fill(minor.aadhaarNumber);
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(VALID_UPLOAD_FILE);
    await page.waitForTimeout(1500);
    await outerSubmit(page, 4000);
    return { done: true };
  },
};

// ---------------------------------------------------------------------------
// Step: Address Details (Permanent + Communication)
// ---------------------------------------------------------------------------

function addressDetails(getAddress) {
  return {
    async isActive(page) {
      return (await page.getByText('Click Here For Add Address', { exact: false }).count()) > 0;
    },
    async run(page, data) {
      const addr = getAddress(data);
      const clickAddButtons = page.getByText('Click Here For Add Address', { exact: false });
      const count = await clickAddButtons.count();
      for (let i = 0; i < count; i++) {
        const btn = page.getByText('Click Here For Add Address', { exact: false }).first();
        if ((await btn.count()) === 0) break;
        await btn.click();
        await page.waitForTimeout(2000);
        await fillAddressPopup(page, addr);
      }
      await outerSubmit(page);
      return { done: true };
    },
  };
}

// ---------------------------------------------------------------------------
// Step: Branch Selection
// ---------------------------------------------------------------------------

const branchSelection = {
  async isActive(page) {
    return (await page.getByText('Change Branch?', { exact: true }).count()) > 0;
  },
  async run(page, data) {
    if (data.branch && data.branch.change && data.branch.branchName) {
      await page.getByText('Change Branch?', { exact: true }).click();
      await page.waitForTimeout(1500);
      await page.getByText(data.branch.branchName, { exact: true }).click();
      await page.waitForTimeout(1000);
      await twoSubmit(page);
    } else {
      await outerSubmit(page);
    }
    return { done: true };
  },
};

// ---------------------------------------------------------------------------
// Step: Basic Details
// ---------------------------------------------------------------------------

function basicDetails(getData, opts) {
  return {
    async isActive(page) {
      return (await page.locator('.p-dropdown', { hasText: 'Select Employment Type' }).count()) > 0;
    },
    async run(page, data, ctx) {
      const person = getData(data);
      try {
        await fillBasicDetailsForm(page, person, opts);
        await outerSubmit(page);
        const text = await bodyText(page, 500);
        if (text.includes('Enter Valid Email ID')) {
          throw new Error('EMAIL_REJECTED');
        }
        return { done: true };
      } catch (e) {
        // Re-check for the confirmed dotted-local-part email defect (BUG-NORMAL-004):
        // retry once with the dot stripped, since Basic Details wipes the whole form on failure.
        const text = await bodyText(page, 500);
        if (text.includes('Enter Valid Email ID') && person.email && person.email.includes('.')) {
          const fixedEmail = person.email.replace(/\.(?=[^@]*@)/, '');
          ctx.warnings.push(`Email "${person.email}" was rejected (BUG-NORMAL-004 dotted-local-part pattern) - retrying with "${fixedEmail}"`);
          await fillBasicDetailsForm(page, { ...person, email: fixedEmail }, opts);
          await outerSubmit(page);
          return { done: true };
        }
        throw e;
      }
    },
  };
}

// ---------------------------------------------------------------------------
// Step: Cheque Details (dynamic - Funding Mode = Cheque only)
// ---------------------------------------------------------------------------

function chequeDetails(getData) {
  return {
    async isActive(page) {
      return (await page.locator('input[name="cheque_date"]').count()) > 0;
    },
    async run(page, data) {
      const cheque = getData(data);
      await page.locator('input[placeholder="Cheque Number"]').fill(cheque.chequeNumber);
      await page.locator('input[name="cheque_date"]').fill(cheque.chequeDate);
      await page.locator('input[name="drawee_bank_name"]').fill(cheque.draweeBankName);
      await page.locator('input[name="drawee_bank_ifsc"]').fill(cheque.ifscCode);
      await page.waitForTimeout(500);
      await outerSubmit(page);
      return { done: true };
    },
  };
}

// ---------------------------------------------------------------------------
// Step: Employment Information (Salaried vs Self Employed - dispatches on field set)
// ---------------------------------------------------------------------------

function employmentInfo(getData) {
  return {
    async isActive(page) {
      return (await page.locator('input[placeholder="Annual Income"]').count()) > 0
        || (await page.locator('input[placeholder="Annual Turnover"]').count()) > 0;
    },
    async run(page, data) {
      const info = getData(data);
      const catDropdown = page.locator('.p-dropdown', { hasText: 'Select Category' });
      await catDropdown.click();
      await page.waitForTimeout(800);
      await page.getByRole('option', { name: info.category, exact: false }).first().click();
      await page.waitForTimeout(500);

      await page.locator('input[name="organization_name"]').fill(info.organizationName || '');

      const annualIncomeInput = page.locator('input[placeholder="Annual Income"]');
      if ((await annualIncomeInput.count()) > 0) {
        await annualIncomeInput.fill(String(info.annualIncome || ''));
      }
      const annualTurnoverInput = page.locator('input[placeholder="Annual Turnover"]');
      if ((await annualTurnoverInput.count()) > 0) {
        await annualTurnoverInput.fill(String(info.annualTurnover || info.annualIncome || ''));
      }
      await page.locator('input[name="income_source"]').fill(info.sourceOfIncome || '');
      await page.waitForTimeout(500);
      await outerSubmit(page);
      return { done: true };
    },
  };
}

// ---------------------------------------------------------------------------
// Step: Applicant Photo (Verified Photo first, camera capture fallback)
// ---------------------------------------------------------------------------

const applicantPhoto = {
  async isActive(page) {
    return (await page.locator('input[placeholder="Applicant Name"], p:has-text("Applicant Name")').count()) > 0
      && (await page.getByText('Upload Applicant Photo', { exact: false }).count()) > 0;
  },
  async run(page) {
    // Photo
    const verifiedPhotoBtn = page.getByText('Verified Photo', { exact: true });
    let photoDone = false;
    if ((await verifiedPhotoBtn.count()) > 0) {
      await verifiedPhotoBtn.click();
      await page.waitForTimeout(2000);
      const toastText = await bodyText(page, 500);
      if (!toastText.includes('No Verified Photos Available')) {
        const dd = page.locator('.p-dropdown', { hasText: 'Select Verified Photo' });
        if ((await dd.count()) > 0) {
          await dd.click();
          await page.waitForTimeout(1000);
          await page.getByRole('option').first().click();
          await page.waitForTimeout(1000);
          const popupSubmit = page.locator('.resendpopupwrap button:visible, [class*="popup" i] button:visible', { hasText: 'Submit' });
          await popupSubmit.first().click();
          await page.waitForTimeout(2000);
          photoDone = true;
        }
      }
    }
    if (!photoDone) {
      // Browse Computer, if available (nested actors have it; primary applicant usually doesn't)
      const fileInputs = page.locator('input[type="file"]');
      if ((await fileInputs.count()) > 0) {
        await fileInputs.first().setInputFiles(VALID_UPLOAD_FILE);
        await page.waitForTimeout(1500);
        photoDone = true;
      }
    }
    if (!photoDone) {
      await captureViaCamera(page);
    }

    // Signature
    const sigDone = await bodyText(page, 2000);
    const stillNeedsSignature = !sigDone.includes('Document Uploaded') || (sigDone.match(/Document Uploaded/g) || []).length < 2;
    if (stillNeedsSignature) {
      const fileInputs = page.locator('input[type="file"]');
      const fileInputCount = await fileInputs.count();
      if (fileInputCount > 0) {
        await fileInputs.first().setInputFiles(VALID_UPLOAD_FILE);
        await page.waitForTimeout(1500);
      } else {
        await captureViaCamera(page);
      }
    }

    await outerSubmit(page);
    return { done: true };
  },
};

async function captureViaCamera(page) {
  await page.getByText('Capture Using Camera', { exact: true }).first().click();
  await page.waitForFunction(() => {
    const v = document.querySelector('video');
    return v && v.readyState >= 2 && v.videoWidth > 0;
  }, { timeout: 15000 });
  await page.waitForTimeout(1000);
  await page.getByText('Capture photo', { exact: true }).click();
  await page.waitForTimeout(2500);
}

// ---------------------------------------------------------------------------
// Step: Secondary Applicant management table (Joint Applicant Details / Guardian Details)
// ---------------------------------------------------------------------------

/** Builds the ordered inner-step list for a secondary actor's (joint applicant / guardian)
 * own sub-journey, reusing the same step objects as the primary flow. */
function buildSecondaryInnerSteps(getSecondary) {
  const mobile = (data) => getSecondary(data).mobile;
  const ekyc = ekycSteps(mobile);
  const liveliness = livelinessSteps(mobile);
  return [
    { name: 'Mobile Number Verification', ...mobileVerificationFor(getSecondary) },
    { name: 'OTP Entry', ...mobileOtpEntryFor(getSecondary) },
    { name: 'eKYC', ...ekyc },
    { name: 'Liveliness', ...liveliness },
    { name: 'Address', ...addressDetails((data) => getSecondary(data).communicationAddress) },
    { name: 'Basic Details', ...basicDetails(getSecondary, { includeRelationship: true, includeFundingMode: false, prefixField: 'prefix', modeOfOperation: undefined }) },
    { name: 'Employment Info', ...employmentInfo((data) => getSecondary(data).employmentInfo) },
    { name: 'Applicant Photo', ...applicantPhoto },
  ];
}

function mobileVerificationFor(getSecondary) {
  return {
    async isActive(page) {
      return mobileVerification.isActive(page);
    },
    async run(page, data) {
      const secondary = getSecondary(data);
      const result = await sendMobileVerification(page, secondary.mobile);
      if (!result.ok) {
        return { waiting: 'otp', mobile: secondary.mobile, note: `SEND FAILED: ${result.note} - this mobile number cannot be used right now, supply a different one` };
      }
      return { waiting: 'otp', mobile: secondary.mobile };
    },
  };
}

function mobileOtpEntryFor(getSecondary) {
  return {
    async isActive(page) {
      return mobileOtpEntry.isActive(page);
    },
    async run(page, data, ctx) {
      const secondary = getSecondary(data);
      if (!ctx.otp) return { waiting: 'otp', mobile: secondary.mobile };
      await page.locator('input[name="mobotp"]').fill(ctx.otp);
      await page.waitForTimeout(500);
      await outerSubmit(page);
      return { done: true };
    },
  };
}

function secondaryApplicant(kind, getSecondary) {
  const tableHeading = kind === 'joint' ? 'Joint Applicant Details' : 'Guardian Details';
  const innerSteps = buildSecondaryInnerSteps(getSecondary);

  return {
    async isActive(page) {
      return (await page.getByText(tableHeading, { exact: true }).count()) > 0
        && ((await page.getByText('+ Add', { exact: true }).count()) > 0
          || (await page.locator('table tbody tr').count()) > 0);
    },
    async run(page, data, ctx) {
      // Resume an existing row, or start a fresh one via +Add.
      const naCell = page.getByText('NA', { exact: true }).first();
      if ((await naCell.count()) > 0) {
        await naCell.click();
      } else {
        await page.getByText('+ Add', { exact: true }).click();
      }
      await page.waitForTimeout(2000);

      // If we're mid-way through the inner sub-journey (not fresh), jump to the first
      // still-incomplete inner step by trying each inner tab name directly - resuming via
      // the row always resets the VISIBLE panel to the first inner tab regardless of
      // actual progress, so we must navigate explicitly rather than assume sequential order.
      for (const step of innerSteps) {
        if (await step.isActive(page)) {
          const result = await step.run(page, data, ctx);
          if (result.waiting || result.summary || result.submitted) return result;
          // After completing one inner step, loop back to isActive-detect the next one.
          return { done: false, continueSecondary: true };
        }
      }

      // No inner step matched active - row must be complete. Finalize via two-submit
      // (row-level Submit in the Action column, then page-level Submit).
      const rowSubmit = page.locator('table tbody tr button:visible', { hasText: 'Submit' }).first();
      if ((await rowSubmit.count()) > 0) {
        await rowSubmit.click();
        await page.waitForTimeout(2500);
      }
      await outerSubmit(page);
      return { done: true };
    },
  };
}

// ---------------------------------------------------------------------------
// Step: Nominee Details + nested Address
// ---------------------------------------------------------------------------

const nomineeDetails = {
  async isActive(page) {
    return (await page.getByPlaceholder('Full Name').count()) > 0
      && (await page.getByText('Relation of nominee with applicant', { exact: false }).count()) > 0;
  },
  async run(page, data) {
    const nominee = data.nominee;
    await page.getByPlaceholder('Full Name').fill(nominee.fullName);
    await retryDropdownSelect(page, 'Select', nominee.relation);
    await page.locator('input[type="date"]').first().fill(nominee.dob);
    await page.waitForTimeout(500);
    await outerSubmit(page);
    return { done: true };
  },
};

const nomineeAddress = {
  async isActive(page) {
    return (await page.getByText('Address Details (Nominee)', { exact: false }).count()) > 0
      || ((await page.getByText('Click Here For Add Address', { exact: false }).count()) > 0
        && (await page.getByText('Nominee Details', { exact: true }).count()) > 0);
  },
  async run(page, data) {
    // Resume pattern: management table -> click nominee name -> click inner Address tab.
    const nameCell = page.getByText(data.nominee.fullName, { exact: true }).first();
    if ((await nameCell.count()) > 0 && (await page.getByText('Click Here For Add Address', { exact: false }).count()) === 0) {
      await nameCell.click();
      await page.waitForTimeout(2000);
      const addrTab = page.getByText('Address Details (Nominee)', { exact: true });
      if ((await addrTab.count()) > 0) {
        await addrTab.click();
        await page.waitForTimeout(1500);
      }
    }
    const addBtn = page.getByText('Click Here For Add Address', { exact: false }).first();
    if ((await addBtn.count()) > 0) {
      await addBtn.click();
      await page.waitForTimeout(2000);
      const useExisting = page.getByText('Use Existing Address', { exact: true });
      if ((await useExisting.count()) > 0) await useExisting.click();
      await page.waitForTimeout(1500);
      const addr = data.accountType === 'minor' ? data.minor.address : data.applicant.communicationAddress;
      await fillAddressPopup(page, addr, { tryAutoFill: false });
    }
    await outerSubmit(page);
    return { done: true };
  },
};

// ---------------------------------------------------------------------------
// Step: Document Upload
// ---------------------------------------------------------------------------

const documentUpload = {
  async isActive(page) {
    return (await page.getByText('Select Applicant Document', { exact: false }).count()) > 0;
  },
  async run(page, data, ctx) {
    for (const doc of data.documents) {
      const dd = page.locator('.p-dropdown', { hasText: 'Select' }).first();
      await dd.click();
      await page.waitForTimeout(1000);
      await page.getByRole('option', { name: doc.type, exact: false }).click();
      await page.waitForTimeout(1000);
      const fileInput = page.locator('input[type="file"]').first();
      await fileInput.setInputFiles(VALID_UPLOAD_FILE);
      await page.waitForTimeout(1500);
      await outerSubmit(page);
      const text = await bodyText(page, 500);
      const stillNeedsMandatory = /Please Upload/.test(text);
      if (stillNeedsMandatory) {
        ctx.warnings.push(`Document Upload still requires another mandatory document after uploading "${doc.type}" - check config.documents ordering`);
      } else {
        break; // step advanced past Document Upload
      }
    }
    return { done: true };
  },
};

// ---------------------------------------------------------------------------
// Step: Introducer Details (skipped gracefully if the tab never appears)
// ---------------------------------------------------------------------------

const introducerDetails = {
  async isActive(page) {
    return (await page.locator('input[name="introducer_name"]').count()) > 0;
  },
  async run(page, data) {
    const introducer = data.introducer;
    await page.locator('input[name="introducer_name"]').fill(introducer.name);
    await page.locator('input[name="introducer_bank_acc"]').fill(introducer.accountNumber);
    await page.locator('input[name="introducer_period"]').fill(introducer.periodOfAcquaintance);
    await page.waitForTimeout(500);
    await outerSubmit(page, 4000);
    return { done: true };
  },
};

// ---------------------------------------------------------------------------
// Step: Lead Details
// ---------------------------------------------------------------------------

const leadDetails = {
  async isActive(page) {
    return (await page.locator('input[name="lead_converter_code"]').count()) > 0;
  },
  async run(page, data) {
    const lead = data.leadDetails;
    await page.locator('input[name="lead_converter_code"]').fill(lead.leadConverterCode);
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: 'Verify' }).first().click();
    await page.waitForTimeout(2500);

    await page.locator('input[name="lead_generator_code"]').fill(lead.sourcerCode);
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: 'Verify' }).first().click();
    await page.waitForTimeout(2500);

    await outerSubmit(page, 4000);
    return { done: true };
  },
};

// ---------------------------------------------------------------------------
// Step: Summary + Final Submit
// ---------------------------------------------------------------------------

const summary = {
  async isActive(page) {
    const text = await bodyText(page, 1500);
    return text.includes('Lead Details') && text.includes('Mobile Number Verification') && text.includes('Summary');
  },
  async run(page, data, ctx) {
    if (ctx.confirmSubmit) {
      const submitCalls = [];
      page.on('response', async (res) => {
        if (res.url().includes('summary/submit') && res.request().method() === 'POST') {
          let body = null;
          try { body = await res.text(); } catch (e) { /* ignore */ }
          submitCalls.push({ status: res.status(), body });
        }
      });
      const submitBtn = page.locator('button[type="submit"]:visible', { hasText: 'Submit' });
      await submitBtn.first().click();
      await page.waitForTimeout(4500);
      return { submitted: true, response: submitCalls };
    }
    const text = await bodyText(page, 8000);
    return { summary: true, text };
  },
};

module.exports = {
  VALID_UPLOAD_FILE,
  retryDropdownSelect,
  selectDropdownByIndex,
  fillAddressPopup,
  twoSubmit,
  outerSubmit,
  bodyText,
  ekycSteps,
  livelinessSteps,
  mobileVerification,
  mobileOtpEntry,
  accountType,
  minorKycDetails,
  addressDetails,
  branchSelection,
  basicDetails,
  chequeDetails,
  employmentInfo,
  applicantPhoto,
  secondaryApplicant,
  nomineeDetails,
  nomineeAddress,
  documentUpload,
  introducerDetails,
  leadDetails,
  summary,
};
