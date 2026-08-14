# SAD_TS001 — Test Plan: Savings Application Dashboard

**Story:** US_006_Savings_Application_Dashboard.md (Story ID in doc: US_HOME_002)
**Module:** Savings Application Dashboard
**Route under test:** `/UNPOSTED` (reached by clicking the **Savings Application** card on `/HOME`)
**Priority:** High
**Environment:** https://sahyogagentweb.drutam.in:9634 (UAT)
**Credentials:** `nayan.aher@netwinindia.in` / `Sahayog@2025`

---

## 1. User Story Summary

**Feature overview:** A logged-in user lands on the Savings Application Dashboard from the Home page's "Savings Application" card. The dashboard shows four status tabs (Pending / Submitted / Re-Assigned / Decisioned) with live counts, a searchable + filterable application list table, per-row View/Action controls, and pagination.

**Entity + CRUD matrix**

| Entity | Create | Read | Update | Delete |
|---|---|---|---|---|
| Savings Application | Out of scope (New Application button exists but its flow is covered by a future story) | ✅ List (table, search, filter, pagination) + ✅ Detail (View → `/applndetails`, out of scope for deep coverage) | Out of scope (application editing happens inside the out-of-scope wizard) | ✅ "Cancel" action — confirmed live 2026-08-14 against a disposable stale draft (`SAH-1001-591`), not a real in-progress application (see Business Rules) |

**State transitions (application status lifecycle, as observed):**
`Pending` (`Sourcer Pending`, `Detail Data Entry Pending`) → `Submitted` (`Sourcer Submit`, `Branch Submit`, `*Query Resolved`, `RO_FWD Submit`, `CPC Review Query Raised`) → `Re-Assigned` (`CPC Query Raised`) → `Decisioned` (`CPC Approve`, `CPC Review Approve`, `Sourcer Cancel`, `Sourcer System Terminate`)

**Business rules extracted**
- BR1: The 4 status tabs are mutually exclusive views — selecting a tab scopes the table + count to that status only.
- BR2: Search (mobile no. / application id) is a prefix/substring match, is scoped by whatever tab is currently active, and updates all 4 tab counts to reflect the search, not just the active tab's count.
- BR3: Filters (Product, Scheme, Date) are additive/AND-combined with each other, with search, and with the active status tab.
- BR4: The Scheme dropdown is confirmed cascading on Product — empty until a Product is selected, then populates (confirmed: "Silver Savings Account - 1002", "Normal Savings Account - 1001", "Staff Salary Account - 1003" after Product = "Savings Account"). A fresh `getUserwiseAllscheme` API call fires whenever Product changes.
- BR5: Applications in `Pending`/`Re-Assigned` status expose an Action menu with **Track Application** (read-only, opens a stage-progress modal) and **Cancel** (destructive — terminates the application). Confirmed live 2026-08-14: Cancel's Reason dropdown has 9 options (Applicant Request, Incomplete Documentation, Eligibility Not Met, Discrepancy In Information, Change in Applicant's Financial Situation, Approval Delay, Unable to Meet Collateral Requirements, Fraud Suspected, Other); Submit fires `POST /endModule/app/cancel/submit` returning `msgCode:"APPL_REJECT"`, and the application moves to Decisioned status with no undo path. Executed against a disposable stale draft (`SAH-1001-591`), never against a real in-progress application.
- BR6: The `Decisioned` tab's table includes an additional `Account No` column not present on the other 3 tabs (an account only exists once decisioned).
- BR7 (recommendation only, not implemented): AC9 requests a "Clear Filters" button; confirmed absent from the UI — this is a UX recommendation per the story, not a defect.

**Third-party integrations:** None specific to this module beyond the app's own internal APIs (`aos/app/activity/list`, `products/getUserwiseAllproducts`, `scheme/getUserwiseAllscheme`).

**Acceptance criteria (tagged)**

| AC | Type | Summary |
|---|---|---|
| AC1 | Functional | Savings Application card navigates to the dashboard, loads without error |
| AC2 | Functional/UI | 4 status tabs visible, enabled, clickable, highlight selection, scope the list |
| AC3 | Functional | Tab counts match returned data; zero-count tab shows "No Records Found" |
| AC4 | Functional | Search by mobile no. / application id, partial search, invalid search, case/whitespace handling |
| AC5 | Functional/UI | Filter panel opens, shows Product/Scheme/Date, supports selection |
| AC6 | Functional | Each filter (Product, Scheme, Date) independently narrows the list correctly |
| AC7 | Functional | Filter combinations narrow correctly, no duplicates, no conflicts |
| AC8 | Functional | Search + filters combine correctly |
| AC9 | UI/Recommendation | "Clear Filters" button — recommendation only, confirmed not implemented |
| AC10 | Functional/UI | Table shows correct columns/data matching backend |
| AC11 | Functional | View and Action (Track Application / Cancel) controls behave correctly per row |
| AC12 | Functional | Pagination (Next/Prev/First/Last/page numbers/page size) |
| AC13 | Functional/UI | Empty-state "No Records Found" message, table stays formatted |
| AC14 | UI | Responsive/alignment — tabs, search, filter panel, table, pagination |
| AC15 | Non-Functional | Load/response-time expectations for dashboard, search, filters, pagination |

---

## 2. Test Cases

### Happy Path

| ID | Title | Type | AC | Priority |
|---|---|---|---|---|
| TC-SAD-001 | Clicking Savings Application card from Home navigates to the dashboard and loads successfully | Happy Path | AC1 | Critical |
| TC-SAD-002 | Dashboard shows all 4 status tabs with non-negative counts | Happy Path | AC2, AC3 | Critical |
| TC-SAD-003 | Pending tab is selected/highlighted by default on first load | Happy Path | AC2 | High |
| TC-SAD-004 | Application list table renders with all expected columns and real (non-placeholder) data | Happy Path | AC10 | Critical |
| TC-SAD-005 | Clicking View on a row navigates to the Application Details page (`/applndetails`) without error | Happy Path | AC11 | Critical |

### Status Tabs (Test Type 1 & 4-Read)

| ID | Title | Type | AC | Priority |
|---|---|---|---|---|
| TC-SAD-006 | Clicking Submitted tab highlights it and loads only Submitted-status applications | Happy Path | AC2 | Critical |
| TC-SAD-007 | Clicking Re-Assigned tab highlights it and loads only Re-Assigned-status applications | Happy Path | AC2 | High |
| TC-SAD-008 | Clicking Decisioned tab highlights it, loads only Decisioned applications, and shows the extra Account No column | Happy Path | AC2, AC10 | High |
| TC-SAD-009 | Switching between tabs updates the Application List heading scope consistently (no stale rows from the previous tab) | State-Aware | AC2 | High |
| TC-SAD-010 | A tab with zero matching applications shows "No Records Found" instead of an empty/broken table | Negative/Empty State | AC3, AC13 | High |

### Search (Test Type 2 & 6)

| ID | Title | Type | AC | Priority |
|---|---|---|---|---|
| TC-SAD-011 | Searching by an exact registered mobile number returns exactly the matching application | Happy Path | AC4 | Critical |
| TC-SAD-012 | Searching by a valid Application Id returns the matching application | Happy Path | AC4 | Critical |
| TC-SAD-013 | Partial mobile number search returns applications whose mobile number matches the entered prefix | Happy Path | AC4 | High |
| TC-SAD-014 | Searching with a value that matches nothing shows "No Records Found" without a page error | Negative | AC4, AC13 | High |
| TC-SAD-015 | Leading/trailing whitespace in the search box is ignored (trimmed) before matching | Negative/Validation | AC4 | Medium |
| TC-SAD-016 | Clearing the search box restores the full unfiltered list for the active tab | Happy Path | AC4 | Medium |
| TC-SAD-017 | Search results update all 4 tab counts to reflect the search scope — **confirmed live 2026-08-14**: searching a single Application Id showed Pending:1/Submitted:0/etc. for just that result, not account-wide totals (matches BR2 as designed; flagged only as a UX consideration since a user could misread it as the total) | Business Rule | AC4, BR2 | Medium |
| TC-SAD-018 | SQL Injection payload in the search box is handled safely (no error, no data leak) | Negative/Security | AC4 | High |
| TC-SAD-019 | XSS payload in the search box does not execute and is handled safely | Negative/Security | AC4 | High |

### Filter Panel (Test Type 5 & 6)

| ID | Title | Type | AC | Priority |
|---|---|---|---|---|
| TC-SAD-020 | Clicking the filter icon opens the filter panel showing Product, Scheme, and Date dropdowns | Happy Path | AC5 | Critical |
| TC-SAD-021 | Product dropdown is populated from the API (`products/getUserwiseAllproducts`), not hardcoded/empty — **confirmed live 2026-08-14**: one option, "Savings Account" | Form Field Deep Validation | AC5, AC6 | High |
| TC-SAD-022 | Scheme dropdown is populated from the API (`scheme/getUserwiseAllscheme`), not hardcoded/empty — **confirmed live 2026-08-14**: empty until Product chosen, then "Silver Savings Account - 1002" / "Normal Savings Account - 1001" / "Staff Salary Account - 1003" | Form Field Deep Validation | AC5, AC6 | High |
| TC-SAD-023 | Selecting a Product re-fetches the Scheme list (field interdependency), confirmed via network request — **confirmed live 2026-08-14** | Form Field Deep Validation | AC6, BR4 | Medium |
| TC-SAD-024 | Selecting a Scheme filters the table to only applications on that scheme and updates tab counts accordingly — **confirmed live 2026-08-14**: Scheme="Normal Savings Account - 1001" narrowed all rows to 1001-prefixed ids | Happy Path | AC6 | Critical |
| TC-SAD-025 | Selecting a Date preset filters the table to matching applications — **confirmed live 2026-08-14**: 5 presets exist (As On Date, Today, Last 7 Days, Last 15 Days, Custom Date); "Last 7 Days" correctly computed `fromDate:"2026-08-07", toDate:"2026-08-14"` and narrowed results. Custom Date's date-picker pair not yet exercised. | Happy Path | AC6 | High |
| TC-SAD-026 | An empty-result filter selection shows "No Records Found" | Negative/Empty State | AC6, AC13 | Medium |
| TC-SAD-027 | Combining Product + Scheme filters narrows results to the intersection with no conflicts | CRUD/Combination | AC7 | High |
| TC-SAD-028 | Combining Scheme + Date filters narrows results to the intersection | Combination | AC7 | Medium |
| TC-SAD-029 | Combining a Scheme filter with a mobile-number search narrows to applications matching both | Combination | AC8 | High |
| TC-SAD-030 | Filter chips display a clear (X) control per selected filter and removing one restores the wider result set | State-Aware | AC5, AC7 | Medium |
| TC-SAD-031 | No "Clear Filters" (reset-all) control is present in the filter panel — confirms AC9 remains an unimplemented recommendation, not a defect | UI/Recommendation | AC9 | Low |

### Application List / Table (Test Type 4 & 7)

| ID | Title | Type | AC | Priority |
|---|---|---|---|---|
| TC-SAD-032 | Table displays Application Id, Customer Type, Application Date, Applicant Name, Mobile No, Status, View, Action columns on Pending/Submitted/Re-Assigned tabs | Read/CRUD | AC10 | Critical |
| TC-SAD-033 | Decisioned tab's table additionally displays an Account No column | Read/CRUD | AC10 | Medium |
| TC-SAD-034 | Table is horizontally scrollable so the View/Action columns remain reachable when extra columns (e.g. Account No, active filter chips) widen the table beyond the viewport | UI/Responsive | AC10, AC14 | Medium |
| TC-SAD-035 | Opening the Action menu on a Pending-status row shows "Track Application" and "Cancel" options | Happy Path | AC11 | Critical |
| TC-SAD-036 | "Track Application" opens a modal showing the current stage, actor name/role, and timestamp, and can be closed | Happy Path | AC11 | High |
| TC-SAD-047 | Cancel dialog shows a Reason dropdown with the full configured reason list — **confirmed live 2026-08-14**: 9 options (Applicant Request, Incomplete Documentation, Eligibility Not Met, Discrepancy In Information, Change in Applicant's Financial Situation, Approval Delay, Unable to Meet Collateral Requirements, Fraud Suspected, Other) | Happy Path | AC11, BR5 | High |
| TC-SAD-048 | Submitting Cancel with a selected reason performs a real, irreversible cancellation — **confirmed live 2026-08-14** against disposable stale draft `SAH-1001-591`: `POST /endModule/app/cancel/submit` returns `msgCode:"APPL_REJECT"`; application moves to Decisioned status and drops out of default/active list search; no undo path observed | Happy Path / Destructive | AC11, BR5 | Critical |

### Pagination (Test Type 4)

| ID | Title | Type | AC | Priority |
|---|---|---|---|---|
| TC-SAD-037 | Pagination controls are visible when applications exceed the page size, with First/Previous disabled on page 1 | Happy Path | AC12 | High |
| TC-SAD-038 | Clicking Next Page advances to page 2 and loads different records; current page is highlighted | Happy Path | AC12 | Critical |
| TC-SAD-039 | Clicking a specific page number navigates directly to that page | Happy Path | AC12 | Medium |
| TC-SAD-040 | Clicking Last Page then First Page navigates correctly to both ends, disabling the appropriate controls at each end | Happy Path | AC12 | Medium |
| TC-SAD-041 | Navigating Next then Previous returns to the original page 1 record set (no duplicate/missing records) | Happy Path | AC12 | High |

### UI / Responsive (Test Type 3 & 7)

| ID | Title | Type | AC | Priority |
|---|---|---|---|---|
| TC-SAD-042 | Dashboard layout (tabs, search, filter icon, table, pagination) renders correctly on a mobile viewport (390×844) | UI/Responsive | AC14 | High |
| TC-SAD-043 | Dashboard layout renders correctly on a tablet viewport (768×1024) | UI/Responsive | AC14 | Medium |
| TC-SAD-044 | Selected status tab remains highlighted after performing a search or applying a filter | UI State Persistence | AC2, AC14 | Medium |

### Defect-Documenting / Regression Cases

| ID | Title | Type | AC | Priority |
|---|---|---|---|---|
| TC-SAD-045 | [Defect] Direct navigation (or hard refresh) on `/UNPOSTED` shows all tab counts as 0 and "No Records Found" instead of real data — BUG-SAD-001 | Async/Race, Negative | AC1, AC3 | Critical |
| TC-SAD-046 | [Observation] Clicking an application row outside the View/Action controls has no effect despite the row showing a pointer cursor — DEF-SAD-002 (minor UX inconsistency) | UI | AC10, AC11 | Low |

---

## 3. Out of Scope (per story, not automated here)

- Create New Savings Application (the "New Application" button's flow)
- Applicant Details / the multi-step wizard reached via "View" (`/applndetails`) — only entry/navigation is verified
- KYC Verification, Product & Scheme Selection Workflow, Document Upload, Review & Submission, Approval Workflow, Decision Process, Post-Submission Actions
- AC9's "Clear Filters" button — not implemented; only its absence is confirmed (TC-SAD-031)
- Custom Date filter preset's from/to date-picker pair — not yet exercised (TC-SAD-025)
