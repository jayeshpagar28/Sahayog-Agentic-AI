# SAHAYOG QA Automation — Project Status Summary

**As of:** 31-Jul-2026
**Environment:** UAT — https://sahyogagentweb.drutam.in:9634
**Framework:** Playwright (TypeScript), Page Object Model, Chromium (self-hosted CI runner)

---

## 1. Modules Completed

| # | Module | Test Suite ID | Spec Location | Status |
|---|---|---|---|---|
| 1 | Login | LP_TS001 | `tests/1_LP_TS001/` | ✅ Complete |
| 2 | Forgot User ID | FUI_TS001 | `tests/2_FUI_TS001/` | ✅ Complete |
| 3 | Forgot Password | FP_TS001 | `tests/3_FP_TS001/` | ✅ Complete |
| 4 | Activate Account | AA_TS001 | `tests/4_AA_TS001/` | ✅ Complete |
| 5 | Homepage | HP_TS001 | `tests/5_HP_TS001/` | ✅ Complete |
| 6 | Savings Application Dashboard | SAD_TS001 | `tests/6_SAD_TS001/` | ✅ Complete |
| 7 | Change Password | CP_TS001 | `tests/CP_TS001/` | ✅ Complete |

**7 of 7 in-scope modules complete.** All run in CI in the above sequence, followed by Home Redirection, on every push to `main`/`master`.

Not yet started (explicitly out of scope for all modules above): New Savings Application creation wizard, KYC/Product-Scheme selection, Document Upload, Review & Submission, Approval/Decision workflow — these belong to future user stories.

---

## 2. Test Cases Automated

| Module | Test Cases |
|---|---|
| Login (LP_TS001) | 20 |
| Forgot User ID (FUI_TS001) | 22 |
| Forgot Password (FP_TS001) | 13 |
| Activate Account (AA_TS001) | 20 |
| Homepage (HP_TS001) | 22 |
| Savings Application Dashboard (SAD_TS001) | 46 |
| Change Password (CP_TS001) | 11 |
| **Total automated test cases** | **154** |

*(Count verified directly from `npx playwright test --project=chromium --list`, not estimated.)*

Latest full CI run: **147 passed, 11 skipped (by design — manually-assisted/live-data or rate-limit-gated tests), 0 failed.**

---

## 3. Bugs Found (by Severity)

| Severity | Count |
|---|---|
| Major | 4 |
| Minor | 7 |
| Low | 1 |
| Trivial | 1 |
| **Total** | **13** |

### Full Defect Log

| Defect ID | Module | Title | Severity | Priority | Status |
|---|---|---|---|---|---|
| BUG-SAD-001 | Savings Application Dashboard | Direct navigation/refresh on the dashboard shows all-zero counts and "No Records Found" instead of real data | Major | High | Open |
| BUG-006 | Homepage | SAHAYOG and Government logos not rendered anywhere on the Homepage | Major | High | Open |
| DEF-003 (FUI) | Forgot User ID | Send Reference ID button not disabled during in-flight request (double-submit) | Major | Medium | Open |
| DEF-003 (AA) | Activate Account | Submit button not disabled during in-flight activation request (double-submit) | Major | Medium | Open |
| BUG-SAD-003 | Savings Application Dashboard | Search box does not trim leading/trailing whitespace, so an exact match incorrectly returns "No Records Found" | Minor | Medium | Open |
| BUG-007 | Homepage | Footer renders with no copyright text | Minor | Medium | Open |
| BUG-FP-001 | Forgot Password | Whitespace-only User ID does not disable Send Reference ID | Minor | Medium | Open |
| BUG-CP-001 | Change Password | No Cancel button on the Change Password form | Minor | Medium | Open |
| DEF-002 (FUI) | Forgot User ID | Reloading the page redirects to Login instead of preserving the recovery flow | Minor | Low | Open |
| DEF-002 (AA) | Activate Account | Reloading the page redirects to Login instead of preserving the activation flow | Minor | Low | Open |
| BUG-FP-002 | Forgot Password | Intermittent Reference ID delivery delay/failure | Minor | Low | Open |
| DEF-001 | Login | User ID field does not validate email format client-side | Low | Medium | Open |
| DEF-SAD-002 | Savings Application Dashboard | List rows show a pointer cursor but clicking outside View/Action has no effect | Trivial | Low | Open |

No Critical or Blocker-severity defects found in any module — no defect blocks go-live for the functionality tested so far.

**Recurring pattern across modules:** the same two defect *classes* reappear independently in Forgot User ID and Activate Account — (a) a hard page reload drops the SPA route and bounces to Login, and (b) the primary submit button isn't disabled while its request is in flight, allowing a double-submit. Worth a shared fix rather than two separate ones.

---

## 4. Reports and Artifacts

| Module | Test Report | Defect Sheet (.xlsx) |
|---|---|---|
| Login | *(covered in Consolidated report)* | `reports/Consolidated-Defect-Sheet.xlsx` |
| Homepage | *(covered in Consolidated report)* | `reports/Consolidated-Defect-Sheet.xlsx` |
| Forgot User ID | *(covered in Consolidated report)* | `reports/Consolidated-Defect-Sheet.xlsx` |
| Forgot Password | `reports/FP_TS001-test-report.md` | `reports/FP_TS001-defect-sheet.xlsx` |
| Activate Account | `reports/AA_TS001-test-report.md` | `reports/AA_TS001-defect-sheet.xlsx` |
| Change Password | `reports/CP_TS001-test-report.md` | `reports/CP_TS001-defect-sheet.xlsx` |
| Savings Application Dashboard | `reports/SAD_TS001-test-report.md` | `reports/SAD_TS001-defect-sheet.xlsx` |

`reports/Consolidated-Test-Report.md` currently covers only the first 3 modules (dated 28-Jul-2026) and is stale relative to the other 4 modules completed since — flagged here rather than silently treated as current.
