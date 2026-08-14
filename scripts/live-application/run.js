'use strict';

/**
 * Generic, data-driven runner for the live Savings Application journey.
 * Covers both schemes (Silver 1002 / Normal 1001) and all 3 Account Types
 * (Individual / Joint / Minor) from a single config.json.
 *
 * Usage:
 *   node run.js --config config.json [--app-id SAH-XXXX-XXXX]
 *       [--otp 123456] [--check-digilocker] [--check-liveliness] [--confirm-submit]
 *
 * Exits after each run with a single machine-readable line:
 *   STATUS=WAITING_OTP MOBILE=9876543210
 *   STATUS=WAITING_DIGILOCKER MOBILE=9876543210 NOTE="..."
 *   STATUS=WAITING_LIVELINESS MOBILE=9876543210 NOTE="..."
 *   STATUS=READY_FOR_SUMMARY
 *   STATUS=SUBMITTED
 *   STATUS=ERROR MESSAGE="..."
 * plus APP_ID=SAH-XXXX-XXXX once known.
 */

const path = require('path');
const fs = require('fs');
const { chromium } = require(path.join(__dirname, '..', '..', 'node_modules', 'playwright'));
const steps = require('./steps');

const PROJECT = path.join(__dirname, '..', '..');
const BASE_URL = 'https://sahyogagentweb.drutam.in:9634';
const STORAGE_STATE = path.join(PROJECT, 'tests', '.auth', 'user.json');
const MAX_ITERATIONS = 60;

function parseArgs(argv) {
  const args = { checkDigilocker: false, checkLiveliness: false, confirmSubmit: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--config') args.config = argv[++i];
    else if (a === '--app-id') args.appId = argv[++i];
    else if (a === '--otp') args.otp = argv[++i];
    else if (a === '--check-digilocker') args.checkDigilocker = true;
    else if (a === '--check-liveliness') args.checkLiveliness = true;
    else if (a === '--confirm-submit') args.confirmSubmit = true;
  }
  return args;
}

function emitStatus(fields) {
  const parts = Object.entries(fields)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => (typeof v === 'string' && /[\s"]/.test(v) ? `${k}="${v.replace(/"/g, '\\"')}"` : `${k}=${v}`));
  console.log(parts.join(' '));
}

/** Canonical step list. Order here is only a preference among simultaneously-active
 * candidates - each step's isActive() is specific enough that the driver effectively
 * dispatches on "what's actually on screen right now", not a rigid pointer. */
function buildStepList(data) {
  const isMinor = data.accountType === 'minor';
  const primaryMobile = () => data.applicationMobile;
  const ekyc = steps.ekycSteps(primaryMobile);
  const liveliness = steps.livelinessSteps(primaryMobile);

  // Summary/Review is checked with absolute first priority, ahead of every other step.
  // The Summary page apparently reuses some of the same field names/structure as earlier
  // steps (e.g. introducer/lead-code inputs recur in its recap), so if it were checked in
  // normal list order, an earlier step's isActive() could false-positive-match while the
  // page is already on Summary - and that step's routine "Submit" click would then fire
  // the real, irreversible final-submission button instead of its own intended one. This
  // is exactly what happened once already (SAH-1001-807, 2026-08-13) before this guard
  // existed. Checking Summary first means its specific multi-condition signature always
  // wins priority the moment it's genuinely on screen, so no other step ever gets a chance
  // to click anything on that page.
  const list = [
    steps.summary,
    steps.mobileVerification,
    steps.mobileOtpEntry,
    steps.accountType,
  ];

  if (isMinor) {
    list.push(steps.minorKycDetails);
    list.push(steps.addressDetails((d) => d.minor.address));
  } else {
    list.push(ekyc, liveliness);
    list.push(steps.addressDetails((d) => d.applicant.communicationAddress));
  }

  list.push(steps.branchSelection);

  if (isMinor) {
    list.push(steps.basicDetails((d) => d.minor, {
      includeRelationship: false, includeFundingMode: true, prefixField: 'prefix', modeOfOperation: 'Guardian',
    }));
  } else {
    list.push(steps.basicDetails((d) => d.applicant, {
      includeRelationship: false, includeFundingMode: true, prefixField: 'prefix', modeOfOperation: 'Self',
    }));
    list.push(steps.chequeDetails((d) => d.applicant.chequeDetails));
    list.push(steps.employmentInfo((d) => d.applicant.employmentInfo));
  }

  if (data.accountType === 'joint') {
    list.push(steps.secondaryApplicant('joint', (d) => d.jointApplicant));
  } else if (isMinor) {
    list.push(steps.secondaryApplicant('guardian', (d) => d.guardian));
  }

  list.push(steps.applicantPhoto);
  list.push(steps.nomineeDetails);
  list.push(steps.nomineeAddress);
  list.push(steps.documentUpload);
  list.push(steps.introducerDetails);
  list.push(steps.leadDetails);

  return list;
}

async function openApplication(page, data, appId) {
  if (appId) {
    await page.goto(`${BASE_URL}/HOME`);
    await page.waitForLoadState('networkidle').catch(() => undefined);
    await page.getByRole('button', { name: 'Savings Application' }).click();
    await page.waitForURL(/\/UNPOSTED/);
    await page.locator('.p-datatable-tbody tr').first().waitFor({ state: 'visible', timeout: 15000 });
    // The list is sorted by recent activity and paginated at a small default page size -
    // an application can drift off page 1 as other unrelated drafts get touched. Widen the
    // page size before searching so a single-page lookup doesn't go stale over a long run.
    const pageSizeDD = page.locator('.p-paginator .p-dropdown');
    if ((await pageSizeDD.count()) > 0) {
      await pageSizeDD.click();
      await page.waitForTimeout(800);
      const bigOpt = page.getByRole('option', { name: '100' });
      if ((await bigOpt.count()) > 0) {
        await bigOpt.click();
        await page.waitForTimeout(2000);
      } else {
        await page.keyboard.press('Escape');
      }
    }
    const row = page.locator('.p-datatable-tbody tr', { hasText: appId });
    await row.locator('svg.fa-eye').click();
    await page.waitForURL(/\/applndetails/);
    await page.waitForTimeout(2000);
    return appId;
  }

  const schemeLabel = data.scheme === 'silver' ? 'Silver Savings Account - 1002' : 'Normal Savings Account - 1001';
  await page.goto(`${BASE_URL}/HOME`);
  await page.waitForLoadState('networkidle').catch(() => undefined);
  await page.getByRole('button', { name: 'Savings Application' }).click();
  await page.waitForURL(/\/UNPOSTED/);
  await page.getByText('New Application', { exact: true }).click();
  await page.waitForURL(/\/schemelist/);
  await page.locator('.col-xl-5.buttons-column button.btn').first().waitFor({ state: 'visible', timeout: 15000 });
  await page.locator('.col-xl-5.buttons-column button.btn', { hasText: schemeLabel }).click();
  await page.waitForURL(/\/applndetails/);
  await page.waitForTimeout(1500);

  const idText = await steps.bodyText(page, 500);
  const match = idText.match(/SAH-\d{4}-\d+/);
  return match ? match[0] : undefined;
}

/** Fallback for when the applndetails panel doesn't show the SAH-ID yet (observed on a
 * freshly-created draft still sitting at Mobile Number Verification): looks up the newest
 * matching row from the UNPOSTED activity list by scheme + mobile number instead. Opens
 * a throwaway page so it doesn't disturb the caller's current `page` navigation state. */
async function findAppIdByMobile(context, schemeCode, mobile) {
  const lookupPage = await context.newPage();
  const found = [];
  lookupPage.on('response', async (res) => {
    if (res.url().includes('/app/activity/list') && res.request().method() === 'POST') {
      try {
        const json = await res.json();
        const content = JSON.parse(json.content || '[]');
        content.forEach((row) => {
          if (row.schemeCode === schemeCode && String(row.mobileNo || '').includes(mobile)) {
            found.push(row.applicationId);
          }
        });
      } catch (e) { /* ignore parse errors from unrelated responses */ }
    }
  });
  await lookupPage.goto(`${BASE_URL}/HOME`);
  await lookupPage.waitForLoadState('networkidle').catch(() => undefined);
  await lookupPage.getByRole('button', { name: 'Savings Application' }).click();
  await lookupPage.waitForURL(/\/UNPOSTED/);
  await lookupPage.waitForTimeout(2500);
  await lookupPage.close();
  return found[0];
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.config) {
    emitStatus({ STATUS: 'ERROR', MESSAGE: 'Missing --config <path.json>' });
    process.exit(1);
  }
  const data = JSON.parse(fs.readFileSync(path.resolve(args.config), 'utf8'));

  const browser = await chromium.launch({
    headless: true,
    args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'],
  });
  const context = await browser.newContext({
    storageState: STORAGE_STATE,
    permissions: ['geolocation', 'camera'],
    geolocation: { latitude: 19.997, longitude: 73.789 },
  });
  const page = await context.newPage();

  const ctx = { otp: args.otp, warnings: [], confirmSubmit: args.confirmSubmit, digilockerRetried: false };
  const stepList = buildStepList(data);

  try {
    let appId = await openApplication(page, data, args.appId);

    let finalResult = null;
    for (let i = 0; i < MAX_ITERATIONS; i++) {
      let matched = null;
      for (let attempt = 0; attempt < 6 && !matched; attempt++) {
        if (attempt > 0) await page.waitForTimeout(2500);
        for (const [idx, step] of stepList.entries()) {
          const active = await step.isActive(page);
          if (process.env.DEBUG_STEPS) console.error(`  [iter ${i} attempt ${attempt}] step[${idx}] => ${active}`);
          if (active) {
            matched = step;
            break;
          }
        }
      }
      if (!matched) {
        finalResult = { error: 'No active step matched - manual inspection needed' };
        break;
      }
      const result = await matched.run(page, data, ctx);
      if (result.waiting || result.summary || result.submitted) {
        finalResult = result;
        break;
      }
    }

    if (!finalResult) {
      finalResult = { error: `Exceeded ${MAX_ITERATIONS} iterations without reaching a stopping point` };
    }

    if (!appId) {
      const schemeCode = data.scheme === 'silver' ? '1002' : '1001';
      appId = await findAppIdByMobile(context, schemeCode, data.applicationMobile);
    }

    if (ctx.warnings.length > 0) {
      for (const w of ctx.warnings) console.log(`WARNING: ${w}`);
    }

    if (finalResult.waiting === 'otp') {
      emitStatus({ STATUS: 'WAITING_OTP', APP_ID: appId, MOBILE: finalResult.mobile, NOTE: finalResult.note });
    } else if (finalResult.waiting === 'digilocker') {
      emitStatus({ STATUS: 'WAITING_DIGILOCKER', APP_ID: appId, MOBILE: finalResult.mobile, NOTE: finalResult.note });
    } else if (finalResult.waiting === 'liveliness') {
      emitStatus({ STATUS: 'WAITING_LIVELINESS', APP_ID: appId, MOBILE: finalResult.mobile, NOTE: finalResult.note });
    } else if (finalResult.summary) {
      console.log('----- SUMMARY -----');
      console.log(finalResult.text);
      console.log('--------------------');
      emitStatus({ STATUS: 'READY_FOR_SUMMARY', APP_ID: appId });
    } else if (finalResult.submitted) {
      console.log(JSON.stringify(finalResult.response, null, 1));
      emitStatus({ STATUS: 'SUBMITTED', APP_ID: appId });
    } else if (finalResult.error) {
      emitStatus({ STATUS: 'ERROR', APP_ID: appId, MESSAGE: finalResult.error });
    }
  } catch (e) {
    emitStatus({ STATUS: 'ERROR', MESSAGE: e.message });
  } finally {
    await browser.close();
  }
}

main();
