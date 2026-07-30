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
    'Defect ID': 'BUG-SAD-001',
    'Date': '30-Jul-2026',
    'Instance': 'UAT',
    'Module': 'Savings Application Dashboard',
    'Title': 'Direct navigation or hard refresh on the Savings Application Dashboard (/UNPOSTED) shows all-zero counts and "No Records Found" instead of real data',
    'Description': 'The dashboard loads correctly (real counts and application list) only when reached by clicking the "Savings Application" card from the Home page. Navigating directly to /UNPOSTED via URL, or hard-refreshing the page while already on it, still calls POST app/activity/list successfully (HTTP 200), but the response body comes back completely empty ({"resultVO":null,"content":null,"agentAppCountVO":null,"totalPages":0}) even though the exact same authenticated session returns full data when the request is triggered via the normal in-app click flow. All 4 status tabs show 0 and the table shows "No Records Found". Reproduced consistently across multiple attempts.',
    'Test Data / Required Info': 'URL: https://sahyogagentweb.drutam.in:9634/UNPOSTED | User: nayan.aher@netwinindia.in | Browser: Chromium (headed) | Env: UAT',
    'Status': 'New',
    'Screenshot / STR': 'screenshots/savings-application-dashboard/BUG-SAD-001_direct-navigation-empty-dashboard.png — STR: 1) Log in 2) Navigate directly to https://sahyogagentweb.drutam.in:9634/UNPOSTED (or hard-refresh while on the page) 3) Observe all 4 tabs show 0 and the table shows "No Records Found", despite real data existing and loading fine via Home -> Savings Application card',
    'Priority': 'High',
    'Severity': 'Major',
    'Type': 'Functional',
    'Retested Result': 'Not Retested',
    'Developer Assigned': '',
    'Resolved Date': '',
    'Developer Comment': '',
    'QA Comment': 'Found during SAD_TS001 exploratory pass and confirmed reproducible via direct network capture (request succeeds, response body is empty). Likely the app/activity/list request depends on some client-side navigation state (e.g. React Router location.state passed only by the Home-card click handler) that a fresh/direct page load never populates. Automation TC-SAD-045 documents current behavior and asserts it fails loudly if it changes.',
    'Changes Applied': '',
  },
  {
    'Defect ID': 'BUG-SAD-003',
    'Date': '30-Jul-2026',
    'Instance': 'UAT',
    'Module': 'Savings Application Dashboard',
    'Title': 'Search box does not trim leading/trailing whitespace, so an otherwise-exact mobile number/application id search incorrectly returns "No Records Found"',
    'Description': 'AC4 explicitly states "Leading and trailing spaces are ignored." Confirmed live this is not the case: searching for a real, currently-existing mobile number with added leading/trailing spaces (e.g. "  9545368828  ") returns "No Records Found", while the exact same value without the surrounding spaces correctly returns the matching application. The raw untrimmed value is evidently sent to the backend as-is rather than being trimmed client-side (or server-side) before matching.',
    'Test Data / Required Info': 'URL: https://sahyogagentweb.drutam.in:9634/UNPOSTED | Search value: "  9545368828  " (leading/trailing double-space) vs "9545368828" | Browser: Chromium (headed) | Env: UAT',
    'Status': 'New',
    'Screenshot / STR': 'screenshots/savings-application-dashboard/BUG-SAD-003_whitespace-search-no-match.png — STR: 1) Note a mobile number visible in the current Application List 2) Type that same number into the search box with a couple of leading/trailing spaces 3) Press Enter 4) Observe "No Records Found" despite the exact number matching a real, currently-listed application',
    'Priority': 'Medium',
    'Severity': 'Minor',
    'Type': 'Validation',
    'Retested Result': 'Not Retested',
    'Developer Assigned': '',
    'Resolved Date': '',
    'Developer Comment': '',
    'QA Comment': 'Found during SAD_TS001 exploratory + automated pass. Automation test TC-SAD-015 documents the current (defective) behavior so it fails loudly if the app starts trimming (a fix) or the raw-match behavior otherwise changes.',
    'Changes Applied': '',
  },
  {
    'Defect ID': 'DEF-SAD-002',
    'Date': '30-Jul-2026',
    'Instance': 'UAT',
    'Module': 'Savings Application Dashboard',
    'Title': 'Application List rows show a pointer cursor but clicking anywhere outside the View/Action controls has no effect',
    'Description': 'Every row in the Application List table is styled with cursor:pointer, visually suggesting the whole row is clickable (a common pattern for "click row to view details"). In practice, clicking anywhere on a row other than the View (eye) icon or the Action (three-dot) menu does nothing — no navigation, no expansion, no visible feedback. This is a minor UX inconsistency rather than a functional defect, since View/Action already provide the equivalent actions.',
    'Test Data / Required Info': 'URL: https://sahyogagentweb.drutam.in:9634/UNPOSTED | Browser: Chromium (headed) | Env: UAT',
    'Status': 'New',
    'Screenshot / STR': 'STR: 1) Open the Savings Application Dashboard 2) Click anywhere on a row\'s Customer Type/Application Date/Applicant Name/Mobile No/Status cell (not the View or Action column) 3) Observe the pointer cursor implied clickability but nothing happens',
    'Priority': 'Low',
    'Severity': 'Trivial',
    'Type': 'UI',
    'Retested Result': 'Not Retested',
    'Developer Assigned': '',
    'Resolved Date': '',
    'Developer Comment': '',
    'QA Comment': 'Low-priority polish item — either make the whole row clickable (mirroring View), or remove the pointer cursor styling from non-interactive cells so it stops implying an action that does not exist. Automation TC-SAD-046 documents current behavior.',
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

  const outPath = path.join('reports', 'SAD_TS001-defect-sheet.xlsx');
  await workbook.xlsx.writeFile(outPath);
  console.log('Defect tracker written to', outPath);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
