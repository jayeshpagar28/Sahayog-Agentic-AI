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
    'Date': '17-Jul-2026',
    'Instance': 'UAT',
    'Module': 'Forgot User ID',
    'Title': 'Whitespace-only Email Id incorrectly enables the Send Reference ID button',
    'Description': 'The Send Reference ID button correctly stays disabled while the Email Id field is empty (FUI_BR_002), but filling it with spaces only ("   ") is treated as non-empty and enables the button, violating FUI_VR_005 ("Email IDs containing only spaces shall be treated as blank"). The client-side check tests string length, not a trimmed value.',
    'Test Data / Required Info': 'URL: http://14.142.238.28:8989/radheAgentWeb/forgetUser | Email Id: "   " (3 spaces) | Browser: Chromium (headed) | Env: UAT',
    'Status': 'New',
    'Screenshot / STR': 'STR: 1) Open Forgot User ID page 2) Type three spaces into Email Id 3) Observe Send Reference ID button is enabled (should remain disabled per FUI_VR_005)',
    'Priority': 'Medium',
    'Severity': 'Minor',
    'Type': 'Validation',
    'Retested Result': 'Not Retested',
    'Developer Assigned': '',
    'Resolved Date': '',
    'Developer Comment': '',
    'QA Comment': 'Found during FUI_TS001 automated + exploratory pass; automation test TC-FUI-006 documents current behavior so it fails loudly if it regresses further.',
    'Changes Applied': '',
  },
  {
    'Defect ID': 'BUG-002',
    'Date': '17-Jul-2026',
    'Instance': 'UAT',
    'Module': 'Forgot User ID',
    'Title': 'Reloading the Forgot User ID page redirects to Login instead of staying on it',
    'Description': 'Unlike the Login page (the SPA fallback route, which trivially "survives" a reload), performing a hard browser reload on /radheAgentWeb/forgetUser drops the client-side route entirely and lands back on /radheAgentWeb/login, losing the user\'s place in the recovery flow. Confirmed both via direct Playwright automation (TC-FUI-017b) and a dedicated before/after reload screenshot capture.',
    'Test Data / Required Info': 'URL: http://14.142.238.28:8989/radheAgentWeb/forgetUser | Browser: Chromium (headed) | Env: UAT',
    'Status': 'New',
    'Screenshot / STR': 'screenshots/forgot-user-id/BUG-002_before-reload.png, screenshots/forgot-user-id/BUG-002_after-reload-shows-Login.png — STR: 1) Navigate to Forgot User ID page via the Login page link 2) Hard-reload the browser (F5) 3) Observe the URL/page has changed to /radheAgentWeb/login instead of staying on /radheAgentWeb/forgetUser',
    'Priority': 'Medium',
    'Severity': 'Major',
    'Type': 'Functional',
    'Retested Result': 'Not Retested',
    'Developer Assigned': '',
    'Resolved Date': '',
    'Developer Comment': '',
    'QA Comment': 'Likely a missing client-side routing rule/server rewrite for direct/refreshed loads of this SPA route. Automation test TC-FUI-017b documents current behavior so it fails loudly if the URL pattern changes in either direction without a deliberate fix.',
    'Changes Applied': '',
  },
  {
    'Defect ID': 'BUG-003',
    'Date': '17-Jul-2026',
    'Instance': 'UAT',
    'Module': 'Forgot User ID',
    'Title': 'Recovery API returns HTTP 200 for error conditions instead of a 4xx status',
    'Description': 'POST http://14.142.238.29:8081/radheUserManagementAPI/common/ref/request/by-primary-contact returns HTTP 200 OK even when the request fails — both for an unregistered email ({"resultVO":{"msgCode":"404","msgDescr":"User not found","isError":true,"success":"FALSE"}}) and for a rate-limited request ({"msgCode":"429","msgDescr":"Maximum reference ID requests exceeded. Please try again after 24 hours."}). The real HTTP status code never reflects the outcome; callers must parse the JSON body\'s msgCode/isError fields instead. This breaks standard REST conventions and would cause status-code-based monitoring, caching, or retry logic to misread failures as successes.',
    'Test Data / Required Info': 'Endpoint: POST http://14.142.238.29:8081/radheUserManagementAPI/common/ref/request/by-primary-contact | Test emails: unregistered address and rate-limited registered address nayan.aher@netwinindia.in | Env: UAT',
    'Status': 'New',
    'Screenshot / STR': 'screenshots/forgot-user-id/network_requests.txt (full request/response capture) — STR: 1) Submit an unregistered email or a rate-limited registered email on the Forgot User ID form 2) Inspect the network response for the by-primary-contact call 3) Observe HTTP 200 status despite "isError":true in the body',
    'Priority': 'High',
    'Severity': 'Major',
    'Type': 'API',
    'Retested Result': 'Not Retested',
    'Developer Assigned': '',
    'Resolved Date': '',
    'Developer Comment': '',
    'QA Comment': 'Found via direct network capture during FUI_TS001 exploratory pass (not caught by naive 4xx/5xx status filtering — had to inspect response bodies). Recommend the backend return proper 404/429 HTTP statuses so client and infrastructure tooling can rely on standard status-code semantics.',
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

  const outPath = path.join('test-results', 'FUI_TS001-defect-tracker.xlsx');
  await workbook.xlsx.writeFile(outPath);
  console.log('Defect tracker written to', outPath);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
