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
    'Defect ID': 'BUG-NORMAL-001',
    'Date': '12-Aug-2026',
    'Instance': 'UAT',
    'Module': 'Normal Savings Account — Address Details',
    'Title': '"Use Existing Address" only auto-fills Address Line 1, leaving State/City/Pin Code empty',
    'Description': 'On any Address Details screen offering "Use Existing Address" (primary applicant\'s Communication Address, joint applicant\'s own Permanent/Communication Address, Nominee Registered Address), checking the option only populates the Address Line 1 field — with the entire address dumped in as one combined string (e.g. "PLOT.N.14 G.N.94, SAPTASHRUNGI NAGAR, Aurangabad, Aurangabad, Maharashtra, India 431001"). State, City, and Pin Code all remain blank and must be re-entered manually, along with re-splitting the address text sensibly across Address Line 1/2. Reproduces the Silver Savings Account\'s BUG-SILVER-002 exactly, confirming this is a shared platform defect rather than something scheme-specific.',
    'Test Data / Required Info': 'URL: https://sahyogagentweb.drutam.in:9634/applndetails | Application: SAH-1001-796 (Normal Savings Account - 1001, Joint) | Address Source: Applicant - Shubham Madhukar Borse | Env: UAT',
    'Status': 'New',
    'Screenshot / STR': 'screenshots/normal-savings/ac6-comm-address-popup.png, screenshots/normal-savings/ac14-joint-permanent-address-popup.png — STR: 1) Open any Address Details step offering "Use Existing Address" 2) Check the option 3) Observe Address Line 1 fills with the full combined address string, but State/City/Pin Code dropdowns/fields remain at their default empty state',
    'Priority': 'Medium',
    'Severity': 'Major',
    'Type': 'Functional',
    'Retested Result': 'Not Retested',
    'Developer Assigned': '',
    'Resolved Date': '',
    'Developer Comment': '',
    'QA Comment': 'Found during live execution of NORMAL_TS001 (TC-NOR-052, TC-NOR-123), confirmed on 4 separate address-collection screens across the same application. Cross-referenced against the identical, previously-confirmed BUG-SILVER-002 in the Silver Savings Account module — same root cause likely applies to both schemes since they share the same Address Details component.',
    'Changes Applied': '',
  },
  {
    'Defect ID': 'BUG-NORMAL-002',
    'Date': '12-Aug-2026',
    'Instance': 'UAT',
    'Module': 'Normal Savings Account — Document Upload',
    'Title': 'First uploaded document is silently discarded when a second, mandatory document type is subsequently required',
    'Description': 'On the Document Upload step, selecting and uploading a non-mandatory document type (e.g. "Electricity Bill") and clicking Submit is correctly blocked by "Please Upload Ration Card" (Ration Card is marked mandatory with an asterisk in the dropdown). However, after then selecting and uploading Ration Card and clicking Submit again, the step advances successfully — but the earlier Electricity Bill document is silently gone. The Summary page\'s Document Upload section shows only "Ration Card"; Electricity Bill was dropped from the application\'s saved state entirely, with no warning, confirmation, or indication at any point that the first document would be lost. This is a real, confirmed data-loss defect: the user has no way of knowing their first upload didn\'t make it into the final application unless they specifically cross-check the Summary page field by field. Once one document IS successfully saved (i.e., the step has been Submitted at least once), subsequently adding a further document in a later visit correctly retains both together — so the loss is specific to documents added and lost before the step\'s first successful Submit.',
    'Test Data / Required Info': 'URL: https://sahyogagentweb.drutam.in:9634/applndetails | Application: SAH-1001-796 (Normal Savings Account - 1001, Joint) | Documents used: Electricity Bill (valid.png), then Ration Card (valid.png) | Env: UAT',
    'Status': 'New',
    'Screenshot / STR': 'screenshots/normal-savings/ac18-doc-filled.png, screenshots/normal-savings/ac18-rationcard-submitted.png, screenshots/normal-savings/ac18-readd-electricity-submitted.png — STR: 1) On Document Upload, select "Electricity Bill", upload a file 2) Click Submit — blocked with "Please Upload Ration Card" 3) Select "Ration Card", upload a file 4) Click Submit — step advances successfully 5) Navigate to the Summary page 6) Observe Document Upload shows only "Ration Card", Electricity Bill is missing with no warning ever shown',
    'Priority': 'High',
    'Severity': 'Major',
    'Type': 'Functional',
    'Retested Result': 'Not Retested',
    'Developer Assigned': '',
    'Resolved Date': '',
    'Developer Comment': '',
    'QA Comment': 'Found during live execution of NORMAL_TS001 (TC-NOR-131 through TC-NOR-133), specifically caught by the mandatory pre-submission field-by-field Summary cross-verification practice established during the Silver Savings Account work — this is exactly the kind of silent data-loss issue that practice is meant to catch. Confirmed reproducible and confirmed the workaround (re-add the lost document in a fresh visit after the step has a successfully-saved record) before final submission.',
    'Changes Applied': '',
  },
  {
    'Defect ID': 'BUG-NORMAL-003',
    'Date': '12-Aug-2026',
    'Instance': 'UAT',
    'Module': 'Normal Savings Account — Applicant Photo',
    'Title': 'Primary applicant\'s Applicant Photo step has no "Browse Computer" upload option, unlike the joint applicant\'s equivalent step',
    'Description': 'On the primary applicant\'s own Applicant Photo step, both the "Upload Applicant Photo" and "Upload Applicant Signature" sections offer only "Capture Using Camera" (plus "Verified Photo," photo field only) — there is no "Browse Computer" / file-upload option present at all. On the same application, the joint applicant\'s own Applicant Photo step DOES offer "Browse Computer" for both Photo and Signature, alongside Capture Using Camera. This is an inconsistency in available capability between the primary and joint applicant on what is otherwise an identical step, for no apparent functional reason. Not a hard blocker in this instance (Verified Photo and camera capture both worked correctly), but forces camera/geolocation dependency on the primary applicant specifically, which browse-computer upload would otherwise avoid.',
    'Test Data / Required Info': 'URL: https://sahyogagentweb.drutam.in:9634/applndetails | Application: SAH-1001-796 (Normal Savings Account - 1001, Joint) | Primary applicant: Shubham Madhukar Borse | Joint applicant: Pagar Jayesh Arun | Env: UAT',
    'Status': 'New',
    'Screenshot / STR': 'screenshots/normal-savings/ac16-primary-photo-initial.png (no Browse Computer), screenshots/normal-savings/ac14-joint-photo-initial.png (has Browse Computer) — STR: 1) Complete the primary applicant\'s journey to their own Applicant Photo step — observe only Capture Using Camera / Verified Photo options 2) Complete the joint applicant\'s sub-journey to their own Applicant Photo step — observe Browse Computer IS available for both fields',
    'Priority': 'Low',
    'Severity': 'Minor',
    'Type': 'UI',
    'Retested Result': 'Not Retested',
    'Developer Assigned': '',
    'Resolved Date': '',
    'Developer Comment': '',
    'QA Comment': 'Found during live execution of NORMAL_TS001 (TC-NOR-113). Low priority since a working alternative (Verified Photo) exists for the primary applicant\'s photo, and camera capture worked correctly for the signature once camera/geolocation permissions were properly granted in the automated session — but flagged as a genuine UI/capability inconsistency worth a product decision either way.',
    'Changes Applied': '',
  },
  {
    'Defect ID': 'BUG-NORMAL-004',
    'Date': '13-Aug-2026',
    'Instance': 'UAT',
    'Module': 'Normal Savings Account — Basic Details',
    'Title': 'Email ID field intermittently rejects valid email addresses containing a dot in the local part, wiping the entire Basic Details form',
    'Description': 'On the Basic Details step, entering an email address with a dot in the local part before "@" (e.g. "yash.netwin@gmail.com" or "yash.sonawane@netwinindia.biz") and submitting the form is rejected with "Enter Valid Email ID." — despite both being syntactically valid, RFC-compliant email addresses. Immediately retrying with the identical local text but no dot ("yashsonawane@gmail.com") on the same form, with every other field unchanged, is accepted without issue. Because Basic Details does not persist partial progress on a validation failure, the rejected submission also wipes all 20+ other previously-filled fields (Mode of Operation, Prefix, name fields, Gender, Marital Status, parents\' names, Religion, Caste, Education, Region, Employment Type, Designation, Funding Mode, and all numeric income/transaction fields), forcing a complete re-entry to recover from what should be a minor field-level correction.',
    'Test Data / Required Info': 'URL: https://sahyogagentweb.drutam.in:9634/applndetails | Application: SAH-1001-805 (Normal Savings Account - 1001, Individual) | Rejected: yash.netwin@gmail.com, yash.sonawane@netwinindia.biz | Accepted: yashsonawane@gmail.com | Env: UAT',
    'Status': 'New',
    'Screenshot / STR': 'screenshots/normal-savings/individual-basicdetails-submitted.png (rejection), screenshots/normal-savings/individual-basicdetails-filled.png (accepted variant) — STR: 1) On Basic Details, fill all fields including Email ID = "firstname.lastname@domain.com" (any dotted local part) 2) Click Submit — observe "Enter Valid Email ID." and all fields reset to blank 3) Re-fill everything, this time with Email ID = "firstnamelastname@domain.com" (no dot) 4) Click Submit — succeeds with "Details saved successfully!"',
    'Priority': 'Medium',
    'Severity': 'Major',
    'Type': 'Validation',
    'Retested Result': 'Not Retested',
    'Developer Assigned': '',
    'Resolved Date': '',
    'Developer Comment': '',
    'QA Comment': 'Found during live execution of NORMAL_TS001 (TC-NOR-076, TC-NOR-077) while filling real Basic Details data for a new Individual application. Confirmed reproducible twice with two different dotted addresses before isolating the dot as the variable via controlled A/B retries on the same form. Compounded by the pre-existing no-partial-save behavior on this step, making the impact worse than a typical inline validation bug.',
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

  const outPath = path.join('reports', 'NORMAL_TS001-defect-sheet.xlsx');
  await workbook.xlsx.writeFile(outPath);
  console.log('Defect tracker written to', outPath);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
