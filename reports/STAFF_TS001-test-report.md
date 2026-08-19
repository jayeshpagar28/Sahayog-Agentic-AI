# STAFF_TS001 — QA Test Report: Staff Salary Account (Scheme 1003)

**Story:** `user-stories/US_010_Staff_Salary_Account_Journey.md` (US_010)
**Suite ID:** STAFF_TS001
**Module:** Savings Application → New Application → `Staff Salary Account - 1003`
**Environment:** `https://sahyogagentweb.drutam.in:9634` (UAT)
**Executed:** 2026-08-18
**Artefacts:** `specs/STAFF_TS001-story-analysis.md` · `specs/STAFF_TS001-test-plan.md` ·
`specs/STAFF_TS001-exploratory-results.md` · `tests/10_STAFF_TS001/` ·
`screenshots/staff-salary-account/` · `reports/STAFF_TS001-defect-sheet.xlsx`

---

## 1. Executive Summary

**What was tested.** The Staff Salary Account journey — a 13-step guided application ending in
a Summary/Review screen — was analysed into 201 planned test cases, of which the cold-safe band
was executed both manually and as automation, and a 53-test Playwright suite was built and run.

**Overall outcome: partial coverage, with three new defects and one material blocker.**

* **Automation: 18 passed, 35 skipped, 0 unexpected failures** on the first run. No healing was
  required — no test failed for a reason other than the defect it was written to catch.
* **The single most important business rule is now proven at the server, not just the UI.**
  Scheme 1003 genuinely defines **no Account Type step**: `aos/steps/getdetails` returns 12
  steps in which `ACCOUNT_TYPE` is absent and module sequence 2 is `EKYC_VERIFICATION`. This
  settles AC6/BR-03 with configuration evidence rather than tab-counting.
* **Three new defects were found**, none of them in the story's 43-item inherited list —
  including one (`BUG-STAFF-004`) that silently defeats the only failure check this API's
  design permits.
* **The user story is wrong about the control this suite tests most.** "Send Verification Code"
  is enabled from the **first digit**, not from ten. Five story statements need correcting and
  defect D-19 is inverted.

**Key risks identified.**

1. **Regulatory (inherited, now confirmed at config level).** `APPL_DOCUMENT` is the only step
   in the whole workflow with `skipAllowed: 1`, and no declaration gates the irreversible final
   submission (D-35, D-43). A Staff Salary account can be opened with **zero supporting
   documents and no recorded consent**. Both need a compliance decision, not a bug fix.
2. **Security (inherited, confirmed live).** The OTP is returned to the browser as a
   brute-forceable bcrypt hash (D-02). The liveliness security code is reportedly returned in
   plaintext (D-14) — not re-verifiable this run.
3. **API contract unsound in both directions.** Failures are returned as HTTP 200 with
   `success:"FALSE"`, one of them misspelled `"FLASE"`; a terminal *rejection* is returned as
   `success:"TRUE"`. No client keyed on either the status code or that field is safe.
4. **Entitlement is unguarded.** `Staff Id` — the one field establishing the right to a
   staff-only product — remains free text with no mask, no pattern and no lookup (D-27).
5. **Coverage blocker.** The seed application the plan depended on was cancelled mid-session by
   another party on this shared environment, blocking every step from Address Details onward.

---

## 2. Test Statistics

### 2.1 Planned coverage (Step 2)

| # | Test Type | Cases | Automatable | Manual | Blocked by design |
|---|---|---|---|---|---|
| 1 | Happy Path | 22 | 15 | 0 | 7 |
| 2 | Negative & Validation | 34 | 32 | 0 | 2 |
| 3 | State-Aware UI | 16 | 12 | 1 | 3 |
| 4 | Full CRUD | 21 | 19 | 0 | 2 |
| 5 | Business Rule | 32 | 29 | 0 | 3 |
| 6 | Form Field Deep Validation | 31 | 30 | 0 | 1 |
| 7 | UI State Persistence | 8 | 7 | 1 | 0 |
| 8 | Audit & Data Recording | 9 | 9 | 0 | 0 |
| 9 | Third-Party Integration | 15 | 13 | 0 | 2 |
| 10 | Async & Race | 8 | 7 | 0 | 1 |
| — | Console/Network Hygiene | 5 | 5 | 0 | 0 |
| | **Total** | **201** | **178** | **2** | **21** |

### 2.2 Executed this cycle

| Result | Manual (Step 3) | Automated (Step 5) |
|---|---|---|
| **Passed** | 19 | 15 |
| **Failed — expected (defect confirmed)** | 3 | 3 |
| **Failed — unexpected** | 0 | **0** |
| **Blocked / skipped** | 6 | 35 |
| **Total attempted** | 28 | 53 |

**Coverage achieved: Band A (cold-safe) complete. Band B (seed-resume) 0%** — blocked, not
failed. Band C (human gates, final Submit) remains permanently manual by design.

---

## 3. Manual Test Results (Step 3)

Full detail in `specs/STAFF_TS001-exploratory-results.md`. Highlights per AC:

| AC | Description | Result | Observation |
|---|---|---|---|
| AC1 | Scheme 1003 selectable, opens its own journey | **Pass** | `/applndetails`; header shows Product + Scheme; no record created; 1 stepper tab |
| AC2 | Scheme search server-side, case-insensitive | **Pass** | Request body carried `searchValue:"staff"`, `inActiveAcRequired:0`; list narrowed to 1003 |
| AC4 | Send requires a complete 10-digit number | **Fail** | **Enabled from 1 digit** — `BUG-STAFF-002` |
| AC6 | **No Account Type step** | **Pass** | Confirmed twice: 12 stepper tabs without it, and `aosStepList` without `ACCOUNT_TYPE` |
| AC12 | Progress persists, application resumable | **Pass** | Cancelled seed still resumed read-only with all 12 steps intact |
| AC13 | Steps strictly sequential | **Pass** | All 12 `sequencialProcessing: 1`; fresh draft shows exactly 1 tab |
| AC14 | Failures distinguishable from success | **Fail** | D-03 confirmed, plus `"FLASE"` (`BUG-STAFF-004`) and a rejection marked `success:"TRUE"` |
| AC21/AC22 | Summary completeness and declaration gate | **Blocked** | Summary unreachable — the seed was cancelled |

**Safety compliance:** no record created, no SMS sent, no verification attempt consumed, and
no Submit or Cancel control operated at any point.

---

## 4. Automation Results (Step 5)

### 4.1 Initial run

```
Total: 53 | Passed: 18 | Failed: 0 | Skipped: 35        (1.1m, chromium, 2 workers)
```

The 18 passes include **3 expected failures** (`test.fail()`) that failed for exactly the
defect each was written to catch — verified by inspecting each failure message rather than
trusting the annotation:

| Test | Expected reason | Actual failure |
|---|---|---|
| TC-STAFF-035 | BUG-STAFF-002 | `toBeHidden()` failed — Send control **visible** at 5 digits |
| TC-STAFF-255 | BUG-STAFF-001 | Scheme cards never rendered after a direct navigation (15s timeout) |
| TC-STAFF-252 | D-03 | 2 responses returned HTTP 200 carrying `isError:true` |

### 4.2 Healing log

| Test Case | Failure Type | Layer Fixed | File Modified | Fix Applied |
|---|---|---|---|---|
| — | — | — | — | **No healing required.** Zero unexpected failures on the first run; every failure was an intended expected-fail |

Two design decisions removed the failure classes healing usually addresses:

* **Fixture gating.** All 35 seed-dependent tests `skip` with a stated reason rather than
  failing, so the absent seed reports as a blocker instead of a wall of red.
* **API-based structural assertions.** `aos/steps/getdetails` replaced DOM scraping for AC6,
  BR-04 and BR-26, removing the most common source of selector churn.

### 4.3 Final run

```
Total: 53 | Passed: 18 | Failed: 0 | Skipped: 35
```

### 4.4 Suite inventory

| Spec | Band | Tests | Covers |
|---|---|---|---|
| `scheme-selection.spec.ts` | A | 6 | AC1, AC2 |
| `mobile-verification.spec.ts` | A | 7 | AC4, BR-01 |
| `console-network-hygiene.spec.ts` | A | 4 | AC14, D-03, BUG-STAFF-001 |
| `staff-scheme-structure.spec.ts` | B | 6 | AC6, AC13, BR-03/04/26, FR-05 |
| `address-details.spec.ts` | B | 7 | AC11, AC15, D-15, D-16 |
| `nominee-details.spec.ts` | B | 8 | AC18, AC19, BR-23/24/25, D-30 |
| `introducer-lead.spec.ts` | B | 6 | AC20, BR-27/28, D-31, D-34, D-38 |
| `summary-review.spec.ts` | B | 7 | AC21, AC22, D-35/36/40/43 |
| `applicant-photo.spec.ts` | B (camera) | 6 | AC16, BR-20, D-36 |
| `seed-application-builder.spec.ts` | C | 1 | Seed recovery utility |

**New page objects:** `StaffSalaryApplicationPage`, `WorkflowConfig`, `AddressDetailsStep`,
`NomineeDetailsStep`, `IntroducerDetailsStep`, `LeadDetailsStep`, `SummaryPage`,
`ApplicantPhotoStep` (in `applicant-photo.spec.ts`).
**Updated:** `MobileVerificationStep` (D-19 correction), `ApplicationFormFlow` (1003 + the
`/schemelist` navigation constraint), `playwright.config.ts` (`chromium-camera` project).

> ⚠️ `SummaryPage` deliberately exposes **no method that clicks Submit**, and must never gain
> one. AC22 is asserted by inspecting the gate's state only.

---

## 5. Defect Log

### 5.1 New defects raised this cycle

| Defect ID | Date | Instance | Module | Title | Status | Priority | Severity | Type |
|---|---|---|---|---|---|---|---|---|
| BUG-STAFF-001 | 18-Aug-2026 | UAT | Scheme Selection | `/schemelist` renders a blank page on reload or deep-link | New | High | Major | Functional |
| BUG-STAFF-002 | 18-Aug-2026 | UAT | Mobile Number Verification | "Send Verification Code" is enabled from a single digit | New | High | Major | Validation |
| BUG-STAFF-003 | 18-Aug-2026 | UAT | Application wizard | A cancelled application still exposes editable fields and a Submit control | New | Medium | Major | Functional / Security |
| BUG-STAFF-004 | 18-Aug-2026 | UAT | API — mobile verify | `success` value misspelled `"FLASE"`, defeating client failure checks | New | High | Major | API |

### 5.2 Inherited defects confirmed live

| Defect | Severity | Confirmation |
|---|---|---|
| **D-02** | Critical (Security) | `mobileOtp` returned to the browser as a bcrypt hash |
| **D-03** | Major | Confirmed, plus a new inverse variant: a rejection returned as `success:"TRUE"` |
| **D-35** | Critical (Regulatory) | `APPL_DOCUMENT` is the only `skipAllowed: 1` step, proven in the workflow config |
| **D-38** | Minor | Both Lead codes resolved to the same staff name |

### 5.3 Story corrections required

| # | Story claim | Live behaviour |
|---|---|---|
| C1 | FR-09 / AC4 / NS-03 / EC-02 / PS-04 — Send hidden below 10 digits | **Enabled from 1 digit.** D-19 is inverted — the repo was right, the story drifted |
| C2 | FR-17 / BR-11 / D-01 — DigiLocker `linkExpiryMin: 25` | Live value is **30**; D-01's DigiLocker limb needs re-verification (its OTP limb stands) |
| C3 | §5.3 — Applicant Photo is the 9th tab | It is the **8th** of 12; prefer `aosModuleSequence` to tab position |
| C4 | BR-23 — no way to remove a nominee | The nominee table renders a **Delete** column; needs re-checking on a live draft |

Full detail: `specs/STAFF_TS001-exploratory-results.md` §5 and
`screenshots/staff-salary-account/api-defect-analysis.md`.

---

## 6. Coverage Matrix

| AC | Description | Manual | Automated |
|---|---|---|---|
| AC1 | Scheme 1003 selectable, own journey | ✅ Pass | ✅ TC-002/003/004/005 |
| AC2 | Server-side, case-insensitive search | ✅ Pass | ✅ TC-109/201 |
| AC3 | Record created on OTP send | ⛔ Blocked (real SMS) | ⚠️ Pre-send half only (TC-120) |
| AC4 | Send requires 10 digits | ❌ Fail | ✅ TC-030–035 (035 expected-fail) |
| AC5 | OTP validity server-side | ⛔ Blocked (15-min wait) | ⛔ Not automated |
| AC6 | **No Account Type step** | ✅ Pass | ✅ TC-122 (skipped — needs seed) |
| AC7 | eKYC: 4 options, Aadhaar only mandatory | ⛔ Blocked | ⛔ Needs seed |
| AC8 | DigiLocker consent not initiated on open/cancel | ⛔ Blocked | ⛔ Needs seed |
| AC9 | Aadhaar completion reported back | ⛔ Blocked (human gate) | ⛔ Permanently manual |
| AC10 | Liveliness: two alternatives | ⛔ Blocked | ⛔ Needs seed |
| AC11 | Both addresses mandatory, validated together | ⛔ Blocked | ✅ TC-047/077/135 (skipped) |
| AC12 | Progress persists, resumable | ✅ Pass | ✅ TC-081 (skipped) |
| AC13 | Steps strictly sequential | ✅ Pass | ✅ TC-005/123 |
| AC14 | Failures distinguishable from success | ❌ Fail | ✅ TC-252 (expected-fail) |
| AC15 | Every Indian jurisdiction selectable | ⛔ Blocked | ✅ TC-048/049 (skipped, expected-fail) |
| AC16 | Both images captured and geo-stamped | ⛔ Blocked | ✅ `applicant-photo.spec.ts` (skipped) |
| AC17 | Documents survive only on step submit | ⛔ Blocked | ⛔ Needs seed |
| AC18 | Minor nominee requires guardian details | ⛔ Blocked | ✅ TC-140 (skipped) |
| AC19 | Nominee age plausible | ⛔ Blocked | ✅ TC-055/056 (skipped, expected-fail) |
| AC20 | Introducer failure visible | ⛔ Blocked | ✅ TC-058 (skipped, expected-fail) |
| AC21 | Summary faithful **and complete** | ⛔ Blocked | ✅ TC-099/103/105 (skipped, expected-fail) |
| AC22 | Declaration gates final submission | ⛔ Blocked | ✅ TC-085/147 (skipped, expected-fail) |

**15 of 22 ACs have automation written.** 7 are permanently manual or blocked by the human
gates. Of the 15, **4 currently execute** — the remaining 11 unblock the moment a seed exists.

---

## 7. Recommendations

Specific to what this cycle found, in priority order.

### Product

1. **Fix `"FLASE"` (`BUG-STAFF-004`).** A one-character fix that currently defeats the only
   failure check this API's design permits. Add a contract test pinning `success` to exactly
   `"TRUE"` / `"FALSE"`.
2. **Gate "Send Verification Code" on 10 digits (`BUG-STAFF-002`).** Today an OTP can be
   requested for a 1-digit number, burning one of only three attempts and creating a live
   applicant record against junk input.
3. **Answer the two compliance questions before writing further tests against current
   behaviour** — D-35 (submission with zero documents) and D-43 (no declaration gates the
   irreversible submission). Both are policy decisions, not bugs, and every downstream test
   assumes an answer.
4. **Stop returning the OTP to the browser (D-02),** hashed or otherwise.
5. **Validate `Staff Id` against the employee register (D-27).** It is the sole control
   establishing entitlement to a staff-only product and is currently unguarded free text.
6. **Make a cancelled application genuinely read-only (`BUG-STAFF-003`).** The client is not
   honouring the server's own `isEditable: 0` flags.
7. **Repair the State/City master data (D-15, D-16).** Residents of Bihar, Sikkim, Telangana
   and Ladakh cannot open an account at all, and impossible State/City pairs are *persisted*.
8. **Fix `/schemelist` on reload (`BUG-STAFF-001`).**

### Process and environment

9. **Give QA a protected seed application.** The entire seed-resume strategy — and 11 of 15
   automatable ACs — collapsed because a third party cancelled `SAH-1003-812` mid-session.
   Either ring-fence a QA-owned record or provision an isolated environment.
10. **Correct US_010** per §5.3 and mark D-19 inverted. The story currently contradicts both
    the repo and the live application on its most-tested control.
11. **Adopt `aos/steps/getdetails` as the workflow-contract oracle** across all three schemes.
    It settled three ACs in this cycle with no DOM coupling and is the least brittle assertion
    surface found in the module.

---

## 8. Exit Status

| Criterion | Status |
|---|---|
| Every Band A case executed and recorded | ✅ |
| Every Band B case recorded as Blocked **with a stated reason** | ✅ (35 skips, each with a reason) |
| Expected-fail cases confirmed failing against their defect IDs | ✅ 3 of 3, reasons verified |
| No unexpected automation failures | ✅ 0 |
| Report and defect sheet produced | ✅ |
| **Suite ready to run at full coverage** | ⚠️ **Blocked on a new seed** — run `seed-application-builder.spec.ts`, then set `STAFF_SEED_APPLICANT_ID` |

**Sign-off recommendation: not ready for release sign-off.** Two regulatory findings (D-35,
D-43) and two security findings (D-02, D-14) are open, and 7 of 22 acceptance criteria have
never been verified end to end on this scheme. The journey's core structure is sound and its
conditional logic — particularly the minor-nominee guardian block — is well built; the failures
are concentrated in error signalling, master data and the absence of pre-submission controls.
