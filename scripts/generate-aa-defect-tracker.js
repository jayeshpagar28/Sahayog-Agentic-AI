const ExcelJS = require('exceljs');
const path = require('path');

const columns = [
  'Defect ID', 'Date', 'Instance', 'Module', 'Title', 'Description',
  'Test Data / Required Info', 'Status', 'Screenshot / STR', 'Priority',
  'Severity', 'Type', 'Retested Result', 'Developer Assigned', 'Resolved Date',
  'Developer Comment', 'QA Comment', 'Changes Applied',
];

const rows = [
  {
    'Defect ID': 'BUG-001',
    'Date': '22-Jul-2026',
    'Instance': 'UAT',
    'Module': 'Activate Account',
    'Title': 'Supplied happy-path test data fails activation on Name of User mismatch',
    'Description': 'Reference ID SAHA072220266054 / User ID SAHAN10001 validates correctly on Date of Birth, Employee ID and Mobile No. (all absent from the fieldErrors array), but the server rejects Name of User "Jayesh Pagar" as "Value does not match with records", blocking activation. This prevents true happy-path (AC-12) verification with the data supplied for this test run.',
    'Test Data / Required Info': 'URL: http://14.142.238.28:8989/radheAgentWeb/activeteUser | Reference ID: SAHA072220266054 | User ID: SAHAN10001 | Name: Jayesh Pagar | DOB: 28-12-2000 | Employee ID: 201 | Mobile: 9511996248 | Browser: Chromium (headed) | Env: UAT',
    'Status': 'New',
    'Screenshot / STR': 'screenshots/activate-account/BUG-001_NameMismatch_HappyPathData.jpeg, screenshots/activate-account/network_requests.txt — STR: 1) Open Activate Account page 2) Fill all six fields with the supplied happy-path data 3) Click Submit 4) Observe inline error "Value does not match with records" under Name of User',
    'Priority': 'Critical',
    'Severity': 'Blocker',
    'Type': 'Functional',
    'Retested Result': 'Not Retested',
    'Developer Assigned': '',
    'Resolved Date': '',
    'Developer Comment': '',
    'QA Comment': 'Found via live happy-path automation run for AA_TS001, confirmed via automated network capture (request payload/response body saved in network_requests.txt). Automation test TC-AA-009 documents current behavior so it fails loudly if it regresses further or should be updated once the correct registered Name is confirmed.',
    'Changes Applied': '',
  },
  {
    'Defect ID': 'BUG-002',
    'Date': '22-Jul-2026',
    'Instance': 'UAT',
    'Module': 'Activate Account',
    'Title': 'Hard reload of the Activate Account page redirects to Login',
    'Description': 'Unlike the Login page (the SPA fallback route, which trivially "survives" a reload), directly (re)navigating the browser to /radheAgentWeb/activeteUser after reaching it via the Login page link drops the client-side route entirely and lands back on /radheAgentWeb/login, losing the user\'s in-progress activation form entry. Same defect class previously found and logged for the Forgot User ID module.',
    'Test Data / Required Info': 'URL: http://14.142.238.28:8989/radheAgentWeb/activeteUser | Browser: Chromium (headed) | Env: UAT',
    'Status': 'New',
    'Screenshot / STR': 'screenshots/activate-account/BUG-002_after-reload-shows-Login.jpeg — STR: 1) Navigate to Activate Account page via the Login page link 2) Hard-reload the browser (F5) / directly navigate to the same URL 3) Observe the URL/page has changed to /radheAgentWeb/login instead of staying on /radheAgentWeb/activeteUser',
    'Priority': 'Medium',
    'Severity': 'Major',
    'Type': 'Functional',
    'Retested Result': 'Not Retested',
    'Developer Assigned': '',
    'Resolved Date': '',
    'Developer Comment': '',
    'QA Comment': 'Likely the same missing client-side routing rule / server rewrite for direct or refreshed loads of SPA routes found earlier in the Forgot User ID module. Automation test TC-AA-014 documents current behavior so it fails loudly if the URL pattern changes in either direction without a deliberate fix.',
    'Changes Applied': '',
  },
  {
    'Defect ID': 'BUG-003',
    'Date': '22-Jul-2026',
    'Instance': 'UAT',
    'Module': 'Activate Account',
    'Title': 'Submit button not disabled during in-flight activation request — allows double-submit',
    'Description': 'Rapidly double-clicking the Submit button on the Activate Account form fires two separate POST requests to common/otp/request (processType: USER_ACTIVATION) instead of one. The button never enters a disabled/loading state while the first request is in flight, so a second click is accepted and dispatched as a duplicate activation attempt. Confirmed via Playwright network-request capture (activationCalls.length === 2). Risks duplicate audit-log entries and duplicate downstream OTP/activation processing for a single user action.',
    'Test Data / Required Info': 'URL: http://14.142.238.28:8989/radheAgentWeb/activeteUser | Full valid-format field data (any 6 fields) | Browser: Chromium (headed) | Env: UAT',
    'Status': 'New',
    'Screenshot / STR': 'screenshots/activate-account/network_requests.txt — STR: 1) Fill all six Activate Account fields with valid-format data 2) Click Submit 3) Immediately click Submit again 4) Inspect network log — two otp/request calls are dispatched instead of one',
    'Priority': 'High',
    'Severity': 'Major',
    'Type': 'Functional',
    'Retested Result': 'Not Retested',
    'Developer Assigned': '',
    'Resolved Date': '',
    'Developer Comment': '',
    'QA Comment': 'Found via automated Async/Race test TC-AA-018 during the AA_TS001 exploratory + automation pass. Recommend disabling Submit for the duration of the otp/request call, consistent with standard state-aware UI patterns.',
    'Changes Applied': '',
  },
  {
    'Defect ID': 'BUG-004',
    'Date': '22-Jul-2026',
    'Instance': 'UAT',
    'Module': 'Activate Account',
    'Title': 'Activation validation-failure responses return HTTP 200 instead of a 4xx status',
    'Description': 'POST http://14.142.238.29:8081/radheUserManagementAPI/common/otp/request returns HTTP 200 OK even when activation validation fails — both for a Name-of-User mismatch ({"resultVO":{"msgCode":"400","isError":true,...},"fieldErrors":[{"fieldCode":"name",...}]}) and for an invalid User ID ({"resultVO":{"msgCode":"404","msgDescr":"Invalid User ID","isError":true,...}}). The real HTTP status code never reflects the outcome; callers must parse the JSON body\'s msgCode/isError fields instead. This breaks standard REST conventions and would cause status-code-based monitoring, caching, or retry logic to misread failures as successes. Same pattern previously found in the Forgot User ID module\'s recovery endpoint (BUG-003 there).',
    'Test Data / Required Info': 'Endpoint: POST http://14.142.238.29:8081/radheUserManagementAPI/common/otp/request | Test cases: Name mismatch (SAHA072220266054/SAHAN10001) and invalid User ID (TESTREF123/TESTUSER01) | Env: UAT',
    'Status': 'New',
    'Screenshot / STR': 'screenshots/activate-account/network_requests.txt (full request/response capture) — STR: 1) Submit the Activate Account form with mismatching or invalid identity data 2) Inspect the network response for the otp/request call 3) Observe HTTP 200 status despite "isError":true in the body',
    'Priority': 'Medium',
    'Severity': 'Major',
    'Type': 'API',
    'Retested Result': 'Not Retested',
    'Developer Assigned': '',
    'Resolved Date': '',
    'Developer Comment': '',
    'QA Comment': 'Found via direct network capture during the AA_TS001 exploratory pass (not caught by naive 4xx/5xx status filtering — had to inspect response bodies). Recommend the backend return proper 400/404 HTTP statuses so client and infrastructure tooling can rely on standard status-code semantics. Note: the Invalid User ID case IS correctly surfaced to the user as an "Invalid User ID" toast — only the status-code convention is defective here.',
    'Changes Applied': '',
  },
  {
    'Defect ID': 'BUG-005',
    'Date': '23-Jul-2026',
    'Instance': 'UAT',
    'Module': 'Activate Account',
    'Title': 'Submit/Cancel buttons clipped and unreachable at common laptop resolutions — no scroll fallback',
    'Description': 'At desktop/laptop viewport widths >= ~1201px (the breakpoint where the two-column split-panel layout activates) combined with a viewport height below ~950-1000px, the form container (section.ad-middle-section.login-page-wraper.bg-01) is styled overflow-y:hidden while its content is taller than the viewport. Neither the container nor the outer document scrolls, and no scrollbar is rendered, so the bottom of the form is permanently clipped. Confirmed broken at 1815x862 (Cancel clipped, as reported by the user) and 1366x768 — the single most common laptop resolution worldwide — where even the Submit button itself is also clipped. Also reproduced at 1440x900. Confirmed NOT broken at 1920x1080 (tall enough) and at widths <= 1199px, where the layout drops the split panel and the document becomes normally scrollable instead. Initial automated responsive coverage only tested a mobile viewport (375x667) and missed this because Playwright toBeVisible() does not detect ancestor overflow:hidden clipping; the suite was extended to check real bounding-box coordinates against the viewport across a Desktop/Laptop/Tablet/Mobile matrix.',
    'Test Data / Required Info': 'URL: http://14.142.238.28:8989/radheAgentWeb/activeteUser | Broken viewports: 1815x862, 1366x768, 1440x900 | OK viewports: 1920x1080, <=1199px width (falls back to page scroll) | Browser: Chromium (headed) | Env: UAT',
    'Status': 'New',
    'Screenshot / STR': 'screenshots/activate-account/BUG-005_1815x862_CancelButtonCutOff.jpeg, screenshots/activate-account/BUG-005_1366x768_SubmitAndCancelCutOff.jpeg — STR: 1) Open Activate Account page 2) Resize browser viewport to 1366x768 (or 1815x862 / 1440x900) 3) Observe Submit and/or Cancel render below the visible viewport with no scrollbar and the page does not scroll',
    'Priority': 'Critical',
    'Severity': 'Critical',
    'Type': 'UI',
    'Retested Result': 'Not Retested',
    'Developer Assigned': '',
    'Resolved Date': '',
    'Developer Comment': '',
    'QA Comment': 'Reported live by the user at 1815x862 during review; reproduced and the affected breakpoint range was bisected against the running app (1200-1250px width boundary; ~950-1000px height threshold). Automated coverage added: tests/AA_TS001/account-activation.spec.ts TC-AA-023 (1366x768), TC-AA-024 (1815x862), TC-AA-025 (1440x900) document the defect; TC-AA-026 (1920x1080) and TC-AA-027 (1024x768) confirm the passing cases. Recommend changing overflow-y:hidden to overflow-y:auto on the form container as the minimal fix, in addition to a broader layout review.',
    'Changes Applied': '',
  },
];

async function main() {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Agentic QA Automation';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet('Defect Tracker', {
    views: [{ state: 'frozen', ySplit: 1 }],
  });

  sheet.columns = columns.map((name) => ({
    header: name,
    key: name,
    width: Math.min(Math.max(name.length + 4, 18), 45),
  }));

  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E78' } };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

  rows.forEach((row) => {
    const added = sheet.addRow(row);
    added.alignment = { vertical: 'top', wrapText: true };
  });

  const colLetter = (name) => {
    const idx = columns.indexOf(name) + 1;
    return sheet.getColumn(idx).letter;
  };

  sheet.autoFilter = { from: 'A1', to: `${colLetter('Changes Applied')}1` };

  sheet.getColumn(colLetter('Date')).numFmt = 'dd-mmm-yyyy';
  sheet.getColumn(colLetter('Resolved Date')).numFmt = 'dd-mmm-yyyy';

  const dvRange = (colName) => `${colLetter(colName)}2:${colLetter(colName)}1000`;

  sheet.dataValidations.add(dvRange('Status'), {
    type: 'list', allowBlank: true,
    formulae: ['"New,Assigned,Open,In Progress,Fixed,Ready for QA,Retest,Closed,Reopened,Deferred"'],
  });
  sheet.dataValidations.add(dvRange('Priority'), {
    type: 'list', allowBlank: true,
    formulae: ['"Critical,High,Medium,Low"'],
  });
  sheet.dataValidations.add(dvRange('Severity'), {
    type: 'list', allowBlank: true,
    formulae: ['"Blocker,Critical,Major,Minor,Trivial"'],
  });
  sheet.dataValidations.add(dvRange('Type'), {
    type: 'list', allowBlank: true,
    formulae: ['"Functional,UI,API,Performance,Security,Regression,Validation,Enhancement,Integration,Compatibility"'],
  });
  sheet.dataValidations.add(dvRange('Retested Result'), {
    type: 'list', allowBlank: true,
    formulae: ['"Pass,Fail,Partially Fixed,Reopened,Not Retested"'],
  });

  const statusColLetter = colLetter('Status');
  const priorityColLetter = colLetter('Priority');
  const severityColLetter = colLetter('Severity');
  const fullRange = (letter) => `${letter}2:${letter}1000`;

  const addCF = (letter, text, argb) => {
    sheet.addConditionalFormatting({
      ref: fullRange(letter),
      rules: [{
        type: 'containsText', operator: 'containsText', text,
        style: { fill: { type: 'pattern', pattern: 'solid', bgColor: { argb } } },
        priority: 1,
      }],
    });
  };

  addCF(statusColLetter, 'Fixed', 'FFC6EFCE');
  addCF(statusColLetter, 'Open', 'FFFFC7CE');
  addCF(statusColLetter, 'Reopened', 'FFFFC7CE');
  addCF(statusColLetter, 'In Progress', 'FFFFEB9C');

  addCF(priorityColLetter, 'Critical', 'FF8B0000');
  addCF(priorityColLetter, 'High', 'FFFFA500');
  addCF(priorityColLetter, 'Medium', 'FFFFFF00');
  addCF(priorityColLetter, 'Low', 'FF92D050');

  addCF(severityColLetter, 'Blocker', 'FF8B0000');
  addCF(severityColLetter, 'Critical', 'FFFF0000');
  addCF(severityColLetter, 'Major', 'FFFFA500');
  addCF(severityColLetter, 'Minor', 'FFFFFF00');
  addCF(severityColLetter, 'Trivial', 'FF92D050');

  const outPath = path.join('test-results', 'AA_TS001-defect-tracker.xlsx');
  await workbook.xlsx.writeFile(outPath);
  console.log('Defect tracker written to', outPath);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
