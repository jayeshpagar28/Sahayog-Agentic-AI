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
    'Date': '15-Jul-2026',
    'Instance': 'UAT',
    'Module': 'Login',
    'Title': 'Invalid email format is not validated client-side before calling the auth API',
    'Description': 'Entering a value with no "@"/domain (e.g. "not-an-email") in the User Id field and submitting the form does not trigger a field-level format validation message (BR-003). Instead, the form submits directly to POST /radheUserManagementAPI/oauth2/token, which returns HTTP 400, and the UI shows a generic "The credentials you entered are incorrect" toast. This wastes an authorization API call and surfaces the wrong error type to the user.',
    'Test Data / Required Info': 'URL: http://14.142.238.28:8989/radheAgentWeb/login | User Id: not-an-email | Password: SomePass123! | Browser: Chromium (headed) | Env: UAT',
    'Status': 'New',
    'Screenshot / STR': 'screenshots/login/BUG-001_HTTP_400_InvalidEmailFormatNotValidated.jpeg — STR: 1) Open login page 2) Enter "not-an-email" in User Id 3) Enter any password 4) Click Login 5) Observe generic auth-failure toast instead of a format-validation message',
    'Priority': 'Medium',
    'Severity': 'Minor',
    'Type': 'Validation',
    'Retested Result': 'Not Retested',
    'Developer Assigned': '',
    'Resolved Date': '',
    'Developer Comment': '',
    'QA Comment': 'Found during LP_TS001 automated + exploratory pass; automation test TC-LOGIN-008 documents current behavior so it fails loudly if the API-call-on-invalid-format behavior silently changes without adding real format validation.',
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

  const lastRow = rows.length + 1;
  const colLetter = (name) => {
    const idx = columns.indexOf(name) + 1;
    return sheet.getColumn(idx).letter;
  };

  sheet.autoFilter = { from: 'A1', to: `${colLetter('Changes Applied')}1` };

  const dateFormatCol = colLetter('Date');
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

  const outPath = path.join('test-results', 'LP_TS001-defect-tracker.xlsx');
  await workbook.xlsx.writeFile(outPath);
  console.log('Defect tracker written to', outPath);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
