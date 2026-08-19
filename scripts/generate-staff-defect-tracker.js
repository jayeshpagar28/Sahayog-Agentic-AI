const ExcelJS = require('exceljs');
const path = require('path');

const columns = [
  'Defect ID', 'Date', 'Instance', 'Module', 'Title', 'Description',
  'Test Data / Required Info', 'Status', 'Screenshot / STR', 'Priority',
  'Severity', 'Type', 'Retested Result', 'Developer Assigned', 'Resolved Date',
  'Developer Comment', 'QA Comment', 'Changes Applied',
];

const DATE = '18-Aug-2026';
const ENV = 'URL: https://sahyogagentweb.drutam.in:9634 | Scheme: Staff Salary Account - 1003 | User: nayan.aher@netwinindia.in | Role: Branch Origination Officer | Browser: Chromium (Playwright) | Env: UAT';

const rows = [
  // ---------------------------------------------------------------- new this cycle
  {
    'Defect ID': 'BUG-STAFF-001',
    Module: 'Savings Application — Scheme Selection',
    Title: '/schemelist renders a permanently blank page on reload or direct navigation',
    Description:
      'Navigating directly to https://sahyogagentweb.drutam.in:9634/schemelist — or reloading the page while already on it — renders a completely empty document (document.body.innerText is ""). Two uncaught console errors are thrown: "TypeError: Cannot read properties of null (reading \'acType\') at wN (main.ee8746f2.js:2:4307543)". No error message is shown, no redirect occurs, and there is no recovery path: the user must manually navigate back to /HOME and walk the flow again. The route is only usable when reached through Home -> Savings Application -> New Application. This also contradicts US_010 §7.2\'s "zero console errors" observation, which never exercised a reload of this route.',
    'Screenshot / STR':
      'screenshots/staff-salary-account/BUG-STAFF-001_schemelist-deeplink-blank.png — STR: 1) Log in 2) Navigate directly to /schemelist (or reload while on it) 3) Observe a blank page and two "Cannot read properties of null (reading \'acType\')" console errors',
    Priority: 'High',
    Severity: 'Major',
    Type: 'Functional',
    'QA Comment':
      'Found during STAFF_TS001 Step 3 exploratory testing and reproduced in automation as TC-STAFF-255 (marked test.fail() until fixed). Constrains the automation suite: all specs must reach /schemelist via /HOME, never by direct navigation — encoded in StaffSalaryApplicationPage.startNewApplication() and ApplicationFormFlow.startNewApplication().',
  },
  {
    'Defect ID': 'BUG-STAFF-002',
    Module: 'Savings Application — Mobile Number Verification',
    Title: '"Send Verification Code" is visible and enabled from a single digit, not from 10',
    Description:
      'On a fresh Staff Salary Account (1003) draft, the "Send Verification Code" control appears and is fully enabled as soon as ONE digit is entered into Mobile Number, and stays enabled at every length from 1 to 10. It is correctly hidden only while the field is completely empty. Verified two ways: real keystroke entry of a single digit (control rendered at 241x34px, disabled=false), and incremental programmatic entry recording visibility at each length 0-10. Impact: an OTP send can be attempted against an obviously invalid number, which consumes one of only THREE send attempts per application (BR-07) and creates a live applicant record keyed to junk input (BR-01). NOTE: this directly contradicts US_010 FR-09/AC4/NS-03/EC-02/PS-04, which all state the control stays hidden until exactly 10 digits. It also INVERTS defect D-19: the story recorded the repo (MobileVerificationStep.ts) and Silver TC-SIL-002 as being wrong on this point, but the live application agrees with the repo — the story is the drifted artefact.',
    'Test Data / Required Info': ENV + ' | Input: single digit "9", then 5 digits "98765", then 15 digits',
    'Screenshot / STR':
      'screenshots/staff-salary-account/BUG-STAFF-002_send-code-enabled-at-1-digit.png — STR: 1) Home -> Savings Application -> New Application -> Staff Salary Account - 1003 2) Type one digit into Mobile Number 3) Observe "Send Verification Code" is visible and enabled',
    Priority: 'High',
    Severity: 'Major',
    Type: 'Validation',
    'QA Comment':
      'Automated as TC-STAFF-035 with test.fail() so the suite turns green the moment this is fixed. The server-side behaviour was deliberately NOT probed: clicking Send would consume a real SMS attempt and create a junk applicant record on a live environment. US_010 requires five corrections as a result — see specs/STAFF_TS001-exploratory-results.md §3.3.',
  },
  {
    'Defect ID': 'BUG-STAFF-003',
    Module: 'Savings Application — Application wizard (all steps)',
    Title: 'A cancelled application still exposes editable fields and a live Submit control',
    Description:
      'Opening a "Sourcer Cancel"-led application (Dashboard -> Decisioned -> View icon) shows the full 12-tab wizard. Most steps correctly render read-only (Mobile Number Verification: 1 input, 0 enabled, no buttons; Branch Selection: 0 inputs, 0 buttons; Lead Details: 2 inputs, 0 enabled). However Document Upload renders THREE enabled inputs plus working "Cancel" and "Submit" buttons, and Basic Details renders 13 enabled inputs plus a "Next" button — while aos/steps/getdetails reports isEditable: 0 for ALL twelve steps and the application itself returns msgCode "APPL_REJECT" / "Your application request is rejected !". The client is therefore not honouring the server\'s own edit flags on a terminated record.',
    'Test Data / Required Info': ENV + ' | Application: SAH-1003-812 (cancelled, "Sourcer Cancel", found under the Decisioned tab)',
    'Screenshot / STR':
      'screenshots/staff-salary-account/STAFF_TS001_seed-812-decisioned.png, screenshots/staff-salary-account/steps-getdetails-812.json — STR: 1) Dashboard -> Decisioned tab 2) Open a cancelled 1003 application via the View (eye) icon 3) Click the Document Upload stepper tab 4) Observe enabled inputs and an active Submit button despite isEditable:0 server-side',
    Priority: 'Medium',
    Severity: 'Major',
    Type: 'Functional',
    'QA Comment':
      'IMPORTANT CAVEAT: the Submit button was deliberately NOT clicked, so whether it would actually persist a write to a cancelled application is UNPROVEN. The defect as filed is the presence of an editable, submittable control on a terminated record. A developer should confirm the server-side write path before deciding severity. Filed as Major on the assumption that presenting a working Submit on a cancelled application is at minimum a serious UX and audit concern.',
  },
  {
    'Defect ID': 'BUG-STAFF-004',
    Module: 'Savings Application — API (aos/mobile/verify/get/details)',
    Title: 'Failure response carries "success":"FLASE" (misspelled), defeating client failure checks',
    Description:
      'POST /sahyogAosAPI/aos/mobile/verify/get/details returns HTTP 200 with body {"resultVo":{"msgCode":"500","msgDescr":"Saving application details are not present !","isError":true,"success":"FLASE","error":true},...}. The value of "success" is misspelled "FLASE" instead of "FALSE"; every other observed response on the platform uses "FALSE". This matters more than a typo normally would: because this platform signals failure in the response BODY rather than the HTTP status (defect D-03), a correctly-written client MUST test the body, and the only sane check — if (success === "FALSE") — silently treats this failure as a SUCCESS. The defect is invisible to a status-code check AND to the body check the API\'s own design forces on you. It was caught only because the test interceptor also matched isError:true. Secondary issue in the same response: msgCode "500" is returned inside an HTTP 200 for what is a legitimate empty state (a freshly opened draft genuinely has no saved application details yet).',
    'Test Data / Required Info': ENV + ' | Triggered on a fresh 1003 draft before any OTP send',
    'Screenshot / STR':
      'screenshots/staff-salary-account/api-defect-analysis.md §2.2 — STR: 1) Open a fresh Staff Salary Account 1003 draft 2) Capture the POST to aos/mobile/verify/get/details 3) Observe HTTP 200 with "success":"FLASE" and msgCode "500"',
    Priority: 'High',
    Severity: 'Major',
    Type: 'API',
    'QA Comment':
      'Caught by automated test TC-STAFF-252, which intercepts every sahyogAosAPI 200 response and flags those carrying success:"FALSE" or isError:true. One-character fix; recommend adding a contract test pinning the permitted values of "success" to exactly "TRUE"/"FALSE". Related: the inverse polarity was also observed — a terminal application rejection returned with "success":"TRUE" and "isError":false — so this field is unreliable in BOTH directions.',
  },

  // ---------------------------------------------------- inherited, confirmed live
  {
    'Defect ID': 'BUG-STAFF-005',
    Module: 'Savings Application — API (aos/mobile/verify/get/details)',
    Title: '[D-02] OTP is returned to the browser as a brute-forceable bcrypt hash',
    Description:
      'POST /sahyogAosAPI/aos/mobile/verify/get/details returns the field "mobileOtp" to the browser, populated with a bcrypt hash of the one-time password (observed value: "$2a$10$m4TBMGWFOt.aTfJQDqpQi.dmpFS6IdCI42j0TMJYLtps4i2ZoZTui"). The OTP itself is a short numeric code, so the search space is trivially small and the hash is offline-brute-forceable in negligible time by anyone with access to the agent\'s browser session or a captured response. The OTP should never reach the client in any form — hashed, encrypted or otherwise. Inherited from the US_010 exploration as D-02 and re-confirmed live on 2026-08-18.',
    'Test Data / Required Info': ENV + ' | Application: SAH-1003-812',
    'Screenshot / STR':
      'screenshots/staff-salary-account/api-defect-analysis.md §3 — STR: 1) Open any 1003 application with a completed mobile verification 2) Capture the POST to aos/mobile/verify/get/details 3) Observe the "mobileOtp" field in the response body',
    Priority: 'Critical',
    Severity: 'Critical',
    Type: 'Security',
    'QA Comment':
      'Inherited defect D-02, confirmed live during STAFF_TS001. Related and still UNVERIFIED this cycle: D-14, in which aos/liveliness/get/details reportedly returns photoSecuritycode in PLAINTEXT to the initiating browser — that endpoint was unreachable because the seed application was cancelled. D-14 should be re-verified as a priority; combined with the reported absence of liveliness identity-matching it would allow the control to be defeated by the person operating it.',
  },
  {
    'Defect ID': 'BUG-STAFF-006',
    Module: 'Savings Application — Document Upload / Summary',
    Title: '[D-35] An application can reach final submission with zero supporting documents',
    Description:
      'The workflow configuration returned by aos/steps/getdetails confirms that APPL_DOCUMENT (Document Upload, module sequence 13) is the ONLY step in the entire 1003 workflow configured skipAllowed: 1 — all eleven other steps are skipAllowed: 0. The step submits successfully with nothing attached and shows no warning, and the Summary then renders its section as a bare heading rather than stating that no documents were provided. This compounds with D-05 (document upload is broken platform-wide — a selected file binds to the DOM input but never registers or uploads), so a Staff Salary Account application can reach the point of final, irreversible submission carrying no supporting documentation at all.',
    'Test Data / Required Info': ENV + ' | Evidence: screenshots/staff-salary-account/steps-getdetails-812.json',
    'Screenshot / STR':
      'screenshots/staff-salary-account/steps-getdetails-812.json — STR: 1) Open a 1003 application 2) Capture aos/steps/getdetails 3) Observe skipAllowed:1 on APPL_DOCUMENT and skipAllowed:0 on all other steps 4) On Document Upload, click Submit with nothing attached — the step advances silently',
    Priority: 'Critical',
    Severity: 'Blocker',
    Type: 'Functional',
    'QA Comment':
      'REGULATORY, not merely functional. Inherited as D-35 and confirmed at configuration level this cycle. Requires a COMPLIANCE DECISION before any test is written that assumes current behaviour is correct: is skipAllowed:1 a deliberate product decision for a KYC product (US_010 assumption A-09)? Automated as TC-STAFF-142 and TC-STAFF-103, both marked test.fail() against the required behaviour.',
  },
  {
    'Defect ID': 'BUG-STAFF-007',
    Module: 'Savings Application — Summary / Review',
    Title: '[D-43] No declaration or consent gates the irreversible final submission',
    Description:
      'The Summary/Review screen — the last screen before an account is opened — carries ZERO checkboxes, ZERO radio buttons and ZERO inputs of any kind, no declaration, consent, terms or acknowledgement-of-review text, and a bare <button type="submit">Submit</button> that is unstyled, sits outside any <form>, and is ENABLED from the moment the page paints. Nothing whatsoever gates the final, irreversible act of opening a bank account. The user is never asked to confirm they have reviewed the application, and there is no record that they did.',
    'Test Data / Required Info': ENV + ' | Inherited from the US_010 exploration (application SAH-1003-812, since cancelled)',
    'Screenshot / STR':
      'STAFF_TS001-summary-screen.png (repository root) — STR: 1) Drive a 1003 application to the Summary screen 2) Inspect the DOM for input/checkbox/radio elements within the summary panel 3) Observe none exist and that Submit is enabled on load',
    Priority: 'Critical',
    Severity: 'Blocker',
    Type: 'Functional',
    'QA Comment':
      'REGULATORY, not a UI nicety. Inherited as D-43. NOT re-verified this cycle — the Summary was unreachable because the seed application was cancelled. Automated as TC-STAFF-085/147 (test.fail() against the required behaviour), asserting the GATE\'S PRESENCE AND INITIAL STATE ONLY. The Summary\'s Submit must NEVER be clicked by automation: submission is irreversible and Cancel is the only exit and is itself one-way. SummaryPage.ts deliberately exposes no submit method and must never gain one.',
  },
  {
    'Defect ID': 'BUG-STAFF-008',
    Module: 'Savings Application — Basic Details',
    Title: '[D-27] Staff Id — the sole entitlement control for a staff-only product — is unvalidated',
    Description:
      'Basic Details on scheme 1003 carries two fields that exist on no sibling scheme: "Is Staff" (a mandatory dropdown whose option list contains exactly one entry, YES, pre-set and unchangeable — it presents a decision that does not exist) and "Staff Id" (mandatory). Staff Id is the single field establishing that the applicant is entitled to a staff-only product, and it is accepted as free text up to 100 characters with NO format mask, NO pattern validation, and NO lookup against any staff master or employee register. The value "STAFF0001" was accepted without a single verification request being issued.',
    'Test Data / Required Info': ENV + ' | Staff Id value used: STAFF0001',
    'Screenshot / STR':
      'specs/STAFF_TS001-exploration-log.md §4.14.1 — STR: 1) Drive a 1003 application to Basic Details 2) Enter any arbitrary string in Staff Id 3) Observe no validation and no verification network request',
    Priority: 'High',
    Severity: 'Major',
    Type: 'Validation',
    'QA Comment':
      'Inherited as D-27. NOT re-verified this cycle (Basic Details unreachable — seed cancelled). Automated as TC-STAFF-150 (test.fail()) and TC-STAFF-148/169/170 for the structural facts. For a scheme whose entire premise is that the applicant is an employee, this is an unguarded entitlement control and should be validated against the employee register.',
  },
  {
    'Defect ID': 'BUG-STAFF-009',
    Module: 'Savings Application — Address Details (master data)',
    Title: '[D-15/D-16] States missing from master data, and impossible State/City pairs are persisted',
    Description:
      'TWO related master-data defects on a mandatory step. (1) D-15: the list served by master/data/get/states has 33 entries and is MISSING Bihar, Sikkim, Telangana and Ladakh; "Rajasthan" is misspelled "Rajsthan"; and the list is mis-sorted (Uttarakhand precedes Uttar Pradesh). Address Details is a mandatory step, so an applicant resident in any of those four jurisdictions CANNOT OPEN AN ACCOUNT AT ALL. (2) D-16: the State -> City cascade is not implemented — selecting a State fires no request and the City dropdown continues to offer all 4,498 cities from every state. This is not merely cosmetic: a deliberately impossible pair (Maharashtra + Abohar, a Punjab city) was SAVED with mutually inconsistent master-data codes (stCode:27 / cityCode:10), rejected by neither the client nor the server, with the PIN code not cross-validated either.',
    'Test Data / Required Info': ENV + ' | Probe data: State=Maharashtra, City=Abohar (Punjab), Pin=431001',
    'Screenshot / STR':
      'specs/STAFF_TS001-exploration-log.md §4.12 — STR: 1) Open the Permanent address popup 2) Open the State dropdown and search for Bihar/Sikkim/Telangana/Ladakh — absent 3) Select Maharashtra 4) Open City — observe 4,498 unfiltered entries 5) Select Abohar and submit — the impossible pair saves',
    Priority: 'Critical',
    Severity: 'Critical',
    Type: 'Functional',
    'QA Comment':
      'Inherited as D-15 and D-16, filed together as one master-data workstream. NOT re-verified this cycle (Address Details unreachable — seed cancelled). Automated as TC-STAFF-048 and TC-STAFF-049, both test.fail() against the required behaviour. D-15 has direct customer impact: entire states of residents are excluded from the product.',
  },
  {
    'Defect ID': 'BUG-STAFF-010',
    Module: 'Savings Application — Introducer Details',
    Title: '[D-31] A Core Banking System failure is completely silent in the UI',
    Description:
      'When the Introducer Account Number cannot be resolved, POST introducer/save/details returns HTTP 200 carrying {"msgCode":"503","msgDescr":"CBS connection error","success":"FALSE"} — and the interface displays ABSOLUTELY NOTHING: no message, no field highlight, no toast, and not even a console entry. The only observable symptom is that the step does not advance. The user experiences a click that did nothing, with no indication of whether to wait, retry, correct the value or abandon.',
    'Test Data / Required Info': ENV + ' | Probe account number: an unresolvable value such as 0000000000',
    'Screenshot / STR':
      'specs/STAFF_TS001-exploration-log.md (Introducer section) — STR: 1) Drive a 1003 application to Introducer Details 2) Enter a valid name and period with an unresolvable account number 3) Submit 4) Observe no feedback of any kind and no advance',
    Priority: 'High',
    Severity: 'Major',
    Type: 'Integration',
    'QA Comment':
      'Inherited as D-31 — described in US_010 as the most user-hostile failure found anywhere in this journey. NOT re-verified this cycle (step unreachable — seed cancelled). Has a direct automation consequence: a failing introducer test presents as a HUNG test rather than a failed one, so IntroducerDetailsStep.ts asserts on ADVANCING to the next step (with a hard 20s timeout) and never on the absence of an error. TC-STAFF-058 additionally captures the response body to prove the server did report a failure that the UI then swallowed.',
  },
];

// Shared defaults — every row is a fresh finding from the STAFF_TS001 cycle.
const withDefaults = rows.map((r) => ({
  Date: DATE,
  Instance: 'UAT',
  Status: 'New',
  'Test Data / Required Info': ENV,
  'Retested Result': 'Not Retested',
  'Developer Assigned': '',
  'Resolved Date': '',
  'Developer Comment': '',
  'Changes Applied': '',
  ...r,
}));

async function main() {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'SAHAYOG QA Automation — STAFF_TS001';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet('STAFF_TS001 Defects', {
    views: [{ state: 'frozen', ySplit: 1 }],
  });

  sheet.columns = columns.map((header) => ({ header, key: header }));
  withDefaults.forEach((row) => sheet.addRow(row));

  // Header row
  const header = sheet.getRow(1);
  header.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  header.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E79' } };
  header.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
  header.height = 30;

  // Column widths + wrapping
  const widths = {
    'Defect ID': 16, Date: 13, Instance: 10, Module: 34, Title: 52, Description: 90,
    'Test Data / Required Info': 46, Status: 12, 'Screenshot / STR': 60, Priority: 11,
    Severity: 11, Type: 14, 'Retested Result': 15, 'Developer Assigned': 18,
    'Resolved Date': 14, 'Developer Comment': 30, 'QA Comment': 70, 'Changes Applied': 28,
  };
  sheet.columns.forEach((col) => {
    col.width = widths[col.key] ?? 20;
    col.alignment = { vertical: 'top', wrapText: true };
  });

  // Colour-code Status / Priority / Severity
  const fill = (argb) => ({ type: 'pattern', pattern: 'solid', fgColor: { argb } });
  const statusFills = {
    Fixed: 'FFC6EFCE', Closed: 'FFC6EFCE',
    Open: 'FFFFC7CE', Reopened: 'FFFFC7CE', New: 'FFFFC7CE',
    'In Progress': 'FFFFEB9C',
  };
  const priorityFills = { Critical: 'FF8B0000', High: 'FFED7D31', Medium: 'FFFFD966', Low: 'FFA9D08E' };
  const severityFills = {
    Blocker: 'FF8B0000', Critical: 'FFFF0000', Major: 'FFED7D31',
    Minor: 'FFFFD966', Trivial: 'FFA9D08E',
  };

  sheet.eachRow((row, i) => {
    if (i === 1) return;
    const apply = (colKey, map, whiteText = []) => {
      const cell = row.getCell(colKey);
      const argb = map[cell.value];
      if (!argb) return;
      cell.fill = fill(argb);
      if (whiteText.includes(cell.value)) cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    };
    apply('Status', statusFills);
    apply('Priority', priorityFills, ['Critical']);
    apply('Severity', severityFills, ['Blocker', 'Critical']);
  });

  // Data-validation dropdowns
  const lists = {
    Status: 'New,Assigned,Open,In Progress,Fixed,Ready for QA,Retest,Closed,Reopened,Deferred',
    Priority: 'Critical,High,Medium,Low',
    Severity: 'Blocker,Critical,Major,Minor,Trivial',
    Type: 'Functional,UI,API,Performance,Security,Regression,Validation,Enhancement,Integration,Compatibility',
    'Retested Result': 'Pass,Fail,Partially Fixed,Reopened,Not Retested',
  };
  const lastRow = withDefaults.length + 1;
  Object.entries(lists).forEach(([key, formula]) => {
    const colIndex = columns.indexOf(key) + 1;
    const letter = sheet.getColumn(colIndex).letter;
    for (let r = 2; r <= lastRow + 50; r += 1) {
      sheet.getCell(`${letter}${r}`).dataValidation = {
        type: 'list', allowBlank: true, formulae: [`"${formula}"`],
      };
    }
  });

  sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: columns.length } };

  const outPath = path.join(__dirname, '..', 'reports', 'STAFF_TS001-defect-sheet.xlsx');
  await workbook.xlsx.writeFile(outPath);
  console.log(`Wrote ${withDefaults.length} defects to ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
