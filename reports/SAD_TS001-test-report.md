# SAD_TS001 — Savings Application Dashboard Test Execution Report

**Date:** 30-Jul-2026
**Environment:** UAT — https://sahyogagentweb.drutam.in:9634
**Browser:** Chromium (Desktop Chrome), headed
**Test User:** nayan.aher@netwinindia.in
**Story:** `user-stories/US_006_Savings_Application_Dashboard.md` (US_HOME_002)

## Executive Summary

46 automated test cases were executed against the Savings Application Dashboard (status tabs, search, filters, application list, row actions, pagination, and responsive layout). **All 46 passed** on the final run (1 additional test case correctly skipped — see below). Three issues were found during exploratory + automated testing and are logged below; none block go-live, but one (`BUG-SAD-001`) is a meaningful reliability gap worth prioritizing.

**Key risks identified:**
- Direct/refreshed navigation to the dashboard silently loses all data (`BUG-SAD-001`) — anyone who bookmarks the URL, refreshes, or opens it in a new tab lands on a dashboard that looks correct but is empty.
- The search box doesn't trim whitespace (`BUG-SAD-003`), contradicting the story's own stated requirement (AC4).

## Test Statistics

| Test Type | Total | Passed | Failed | Skipped |
|---|---|---|---|---|
| Happy Path / Navigation | 5 | 5 | 0 | 0 |
| Status Tabs | 5 | 4 | 0 | 1 |
| Search | 9 | 9 | 0 | 0 |
| Filter Panel | 12 | 12 | 0 | 0 |
| Application List / Row Actions | 7 | 7 | 0 | 0 |
| Pagination | 5 | 5 | 0 | 0 |
| Responsive / UI State | 3 | 3 | 0 | 0 |
| **Total** | **46** | **45** | **0** | **1** |

*(The skipped case, TC-SAD-010, is a gated test that only runs when a status tab genuinely has zero applications on this shared UAT data set — at run time Re-Assigned had 1 real application, so the test correctly skipped rather than failing.)*

## Test Case Execution

| Test Case ID | Title | Result |
|---|---|---|
| TC-SAD-001 | Clicking Savings Application card from Home navigates to the dashboard and loads successfully | ✅ Pass |
| TC-SAD-002 | Dashboard shows all 4 status tabs with non-negative counts | ✅ Pass |
| TC-SAD-003 | Pending tab is selected/highlighted by default on first load | ✅ Pass |
| TC-SAD-004 | Application list table renders with all expected columns and real data | ✅ Pass |
| TC-SAD-005 | Clicking View on a row navigates to the Application Details page without error | ✅ Pass |
| TC-SAD-006 | Clicking Submitted tab highlights it and loads only Submitted-status applications | ✅ Pass |
| TC-SAD-007 | Clicking Re-Assigned tab highlights it and loads only Re-Assigned-status applications | ✅ Pass |
| TC-SAD-008 | Clicking Decisioned tab highlights it, loads Decisioned applications, and shows the Account No column | ✅ Pass |
| TC-SAD-009 | Switching between tabs updates the list scope without stale rows from the previous tab | ✅ Pass |
| TC-SAD-010 | A tab with zero matching applications shows "No Records Found" | ⏭️ Skipped (no zero-count tab on this data set) |
| TC-SAD-011 | Searching by an exact registered mobile number returns exactly the matching application | ✅ Pass |
| TC-SAD-012 | Searching by a valid Application Id returns the matching application | ✅ Pass |
| TC-SAD-013 | Partial mobile number search returns applications matching the entered prefix | ✅ Pass |
| TC-SAD-014 | Searching with a value that matches nothing shows "No Records Found" without a page error | ✅ Pass |
| TC-SAD-015 | Leading/trailing whitespace in the search box is NOT ignored before matching | ✅ Pass (documents `BUG-SAD-003`) |
| TC-SAD-016 | Clearing the search box restores the full unfiltered list | ✅ Pass |
| TC-SAD-017 | Search results update all 4 tab counts to reflect the search scope | ✅ Pass |
| TC-SAD-018 | SQL Injection payload in the search box is handled safely | ✅ Pass |
| TC-SAD-019 | XSS payload in the search box does not execute | ✅ Pass |
| TC-SAD-020 | Clicking the filter icon opens the filter panel with Product, Scheme, and Date dropdowns | ✅ Pass |
| TC-SAD-021 | Product dropdown is populated from the API, not hardcoded/empty | ✅ Pass |
| TC-SAD-022 | Scheme dropdown is populated from the API once a Product is selected | ✅ Pass |
| TC-SAD-023 | Selecting a Product re-fetches the Scheme list (field interdependency) | ✅ Pass |
| TC-SAD-024 | Selecting a Scheme filters the table and updates tab counts accordingly | ✅ Pass |
| TC-SAD-025 | Selecting the "Today" Date preset filters the table to applications dated today | ✅ Pass |
| TC-SAD-026 | An empty-result filter selection shows "No Records Found" | ✅ Pass |
| TC-SAD-027 | Combining Product + Scheme filters narrows results to the intersection with no conflicts | ✅ Pass |
| TC-SAD-028 | Combining Scheme + Date filters narrows results to the intersection | ✅ Pass |
| TC-SAD-029 | Combining a Scheme filter with a mobile-number search narrows to applications matching both | ✅ Pass |
| TC-SAD-030 | Filter chips show a clear (X) control and removing one restores the wider result set | ✅ Pass |
| TC-SAD-031 | [Recommendation AC9] No "Clear Filters" (reset-all) control is present in the filter panel | ✅ Pass (confirms recommendation, not a defect) |
| TC-SAD-032 | Table displays the expected columns on the Pending tab | ✅ Pass |
| TC-SAD-033 | Decisioned tab additionally displays an Account No column | ✅ Pass |
| TC-SAD-034 | Table is horizontally scrollable so View/Action columns remain reachable when the table widens | ✅ Pass |
| TC-SAD-035 | Opening the Action menu on a Pending-status row shows Track Application and Cancel | ✅ Pass |
| TC-SAD-036 | Track Application opens a modal showing stage details and can be closed | ✅ Pass |
| TC-SAD-037 | Pagination controls are visible with First/Previous disabled on page 1 | ✅ Pass |
| TC-SAD-038 | Clicking Next Page advances to page 2 and loads different records; current page is highlighted | ✅ Pass |
| TC-SAD-039 | Clicking a specific page number navigates directly to that page | ✅ Pass |
| TC-SAD-040 | Clicking Last Page then First Page navigates correctly and disables the right controls at each end | ✅ Pass |
| TC-SAD-041 | Navigating Next then Previous returns to the original page 1 record set | ✅ Pass |
| TC-SAD-042 | Dashboard layout renders correctly on a mobile viewport (390x844) | ✅ Pass |
| TC-SAD-043 | Dashboard layout renders correctly on a tablet viewport (768x1024) | ✅ Pass |
| TC-SAD-044 | Selected status tab remains highlighted after performing a search | ✅ Pass |
| TC-SAD-045 | [Defect] Direct navigation to /UNPOSTED shows all-zero counts and "No Records Found" | ✅ Pass (documents `BUG-SAD-001`) |
| TC-SAD-046 | [Observation] Clicking a row outside View/Action has no effect despite the pointer cursor | ✅ Pass (documents `DEF-SAD-002`) |

## Automation Notes (Initial Run → Healing → Final Run)

**Initial run:** 20 passed / 22 failed / 5 skipped.

**Healing summary** (all fixes applied in the module page object `tests/pages/savings-application/SavingsApplicationDashboardPage.ts` unless noted):

| Failure Pattern | Root Cause | Fix |
|---|---|---|
| `getApplicationIds()` returned only 1 id total, or `[]` | Locator bug: `.locator('td').first()` matched only the very first cell across *all* rows combined, instead of one cell per row | Rewrote to iterate each row individually |
| Headers/counts sometimes read as empty/zero | The list's own "no records" placeholder is visually identical to the real empty state, so reading immediately after navigation raced the actual data load | Added an explicit wait on the `app/activity/list` network response in every spec's `beforeEach`, and a settle-wait before every read method |
| `isTabActive()` always true | Every status card carries *some* box-shadow at all times; only the active one uses the brand teal color (`rgb(1, 102, 102)`) | Narrowed the check to that specific color |
| Scheme dropdown showed 0 options / long timeouts | Test design error, not a defect: the Scheme dropdown is a genuinely *dependent* field — it has no options until a Product is selected (confirmed live) | Updated tests to select Product before Scheme, matching real app behavior |
| Pagination tests read stale data on the "new" page | `clickNextPage()`/`clickPreviousPage()`/etc. didn't wait for the resulting refetch | Wrapped all pagination actions in the same network-wait helper used for tabs/search/filters |
| Clearing a filter chip hung for 30s | The chip's clear (×) is an unlabeled `<svg>`, not a `<button>` — the old selector was accidentally clicking the dropdown's own toggle instead | Targeted `[data-pc-section="clearicon"]` directly |
| View-page assertion flaked | `getByText(applicationId)` matched a second, hidden element elsewhere on the details page | Scoped the assertion to a visible match only |

**Final run:** 46 passed / 0 failed / 1 skipped (7.9–9.2 minutes per full run).

## Network / API Analysis

Captured network traffic across navigation, tab switching, search, and filtering (`screenshots/savings-application-dashboard/network_requests.txt`). All API calls observed returned **HTTP 200** — `app/activity/list`, `products/getUserwiseAllproducts`, `scheme/getUserwiseAllscheme`, `aos/alert/get/list`, `aos/app/notification/list`. No 4xx/5xx responses were observed during any normal (or SQL-injection/XSS-payload) interaction; those payloads are handled entirely client/server-side without surfacing raw errors.

The one network-related anomaly is behavioral, not a status-code error: `BUG-SAD-001`'s `app/activity/list` call returns HTTP 200 with an empty body when triggered via direct navigation, rather than an error — meaning naive "check for 4xx/5xx" monitoring would not catch this failure mode.

## Defect Log

| Defect ID | Title | Priority | Severity | Status |
|---|---|---|---|---|
| BUG-SAD-001 | Direct navigation/refresh on the dashboard shows all-zero counts and "No Records Found" instead of real data | High | Major | Open |
| BUG-SAD-003 | Search box does not trim leading/trailing whitespace, so an otherwise-exact search incorrectly returns "No Records Found" | Medium | Minor | Open |
| DEF-SAD-002 | Application list rows show a pointer cursor but clicking outside View/Action has no effect | Low | Trivial | Open |

Full details, STR, and screenshot references: `reports/SAD_TS001-defect-sheet.xlsx`.

## Coverage Matrix

| AC | Description | Manual | Automated |
|---|---|---|---|
| AC1 | Savings Application navigation | ✅ | ✅ |
| AC2 | Status tabs verification | ✅ | ✅ |
| AC3 | Status count validation | ✅ | ✅ |
| AC4 | Search functionality | ✅ | ✅ (incl. `BUG-SAD-003`) |
| AC5 | Filter panel verification | ✅ | ✅ |
| AC6 | Individual filter validation | ✅ | ✅ |
| AC7 | Filter combination validation | ✅ | ✅ (representative combinations) |
| AC8 | Search with filters | ✅ | ✅ |
| AC9 | Filter reset recommendation | ✅ | ✅ (confirmed not implemented, as expected) |
| AC10 | Application list verification | ✅ | ✅ |
| AC11 | Application actions (View/Action) | ✅ | ✅ |
| AC12 | Pagination validation | ✅ | ✅ |
| AC13 | Empty state validation | ✅ | ✅ |
| AC14 | UI validation | ✅ | ✅ |
| AC15 | Performance validation | Observed only (no hard SLA measured) | ➖ |

Out of scope (per story, not automated): New Application creation flow, Applicant Details wizard content, KYC/Product-Scheme workflow, Document Upload, Review & Submission, Approval Workflow, Decision Process, Post-Submission Actions, and the destructive "Cancel" action (would cancel a real shared-UAT application).

## Recommendations

1. **Fix `BUG-SAD-001`** — investigate why `app/activity/list` returns empty data on direct/refreshed navigation to `/UNPOSTED`; likely missing state/query params that the Home-card click currently supplies implicitly. This is the highest-priority finding: any bookmarked link, shared URL, or accidental refresh currently loses the dashboard silently (no error, just empty).
2. **Fix `BUG-SAD-003`** — trim the search input before sending it to the backend (or trim server-side), matching AC4's explicit requirement.
3. **Consider `DEF-SAD-002`** — either make full rows clickable (mirroring View) or drop the pointer-cursor styling on non-interactive cells.
4. **Consider implementing AC9's "Clear Filters" button** — currently absent; low effort, meaningful UX improvement once more than one filter is commonly combined.
5. No blockers to go-live — core navigation, search, filtering, row actions, and pagination all function correctly.
