# SCH_TS001 — Test Plan: Scheme Selection

**Story:** user-stories/US_007_Scheme.md (Story ID: US_007_SCHEME)
**Module:** Scheme Selection
**Route under test:** `/schemelist` (reached via Home → Savings Application card → `/UNPOSTED` → New Application button)
**Priority:** High
**Environment:** https://sahyogagentweb.drutam.in:9634 (UAT)
**Credentials:** `nayan.aher@netwinindia.in` / `Sahayog@2025`

---

## 1. User Story Summary

**Feature overview:** After starting a New Application from the Savings Application Dashboard, the user lands on the Scheme Selection screen. It shows a left-side auto-rotating **Scheme Details panel** (PrimeReact carousel — name + description per scheme, previous/next arrows) alongside a right-side **scheme list** under a "Search Scheme Type" search box. Clicking a scheme card navigates to the Savings Application form (`/applndetails`) carrying the selected Product/Scheme forward.

**Entity + CRUD matrix**

| Entity | Create | Read | Update | Delete |
|---|---|---|---|---|
| Scheme | Out of scope (admin-managed) | ✅ List (cards) + ✅ Detail (carousel panel) + ✅ Search | N/A | N/A |

**Business rules extracted (confirmed via live recon against the UAT environment)**
- BR1: Search performs a **case-insensitive substring match anywhere in the Scheme Name** (not prefix-only) — confirmed against "ving", "Account", "ccount", "1002", "savings account" all correctly matching mid-string.
- BR2: Search **only activates at a minimum of 4 trimmed characters**. Queries of 1–3 characters are a no-op: the full, unfiltered scheme list is shown instead of being filtered or matching everything as expected substrings — this holds even when the 3-char string is genuinely a substring of a scheme name (e.g. "Sav", "Sta" leave the list unfiltered).
- BR3: Leading/trailing whitespace is trimmed before matching (`"  Silver  "` behaves identically to `"Silver"`).
- BR4: The Scheme Details panel (carousel) and the scheme card list are two independent components — the carousel auto-rotates/holds its own state and is not driven by the search box; only the right-side card list responds to search.
- BR5: Clicking a scheme card navigates to `/applndetails` and carries forward both Product Name ("Savings Account") and the selected Scheme Name, displayed at the top of the next screen.
- BR6 (defect candidate, see Section 4): A search with zero matches (e.g. a 4+ char nonsense string) correctly empties the card list but displays **no "No Results" message or empty-state UI** — the panel just goes blank under the "Savings Account" heading, contradicting AC3's explicit requirement.

**Third-party integrations:** Internal APIs only — `products/getUserwiseAllproducts`, `scheme/getUserwiseAllscheme`.

**Acceptance criteria (tagged)**

| AC | Type | Summary |
|---|---|---|
| AC1 | Functional | Savings Application card → New Application → redirected to Scheme Selection, loads without error |
| AC2 | Functional | All active schemes shown, no duplicates, no inactive schemes, scrollable list |
| AC3 | Functional | Search by Scheme Name — valid, partial (per BR1/BR2), invalid ("No Results"), case-insensitive, whitespace-trimmed, clears cleanly |
| AC4 | Functional/UI | Scheme Details panel shows Name + Description matching backend, auto-rotates on a timeout without distortion/errors |
| AC5 | Functional | Each scheme is clickable, redirects to Savings Application screen, selected scheme carried forward |
| AC6 | Functional/UI | Side nav (Home/My Profile/Notifications/About Us) visible, enabled, clickable, redirects correctly |
| AC7 | UI | Alignment of cards/panel/search bar/side nav, icons, scrollbar, no overlap/truncation |
| AC8 | Non-Functional | Load/search/panel-update/redirect/scroll performance, no freezes on repeated operations |

---

## 2. Test Cases

### Happy Path / Navigation (AC1)

| ID | Title | Type | AC | Priority |
|---|---|---|---|---|
| TC-SCH-001 | Clicking Savings Application card then New Application navigates to Scheme Selection (`/schemelist`) and loads successfully | Happy Path | AC1 | Critical |
| TC-SCH-002 | Scheme Selection screen loads with no page errors | Happy Path | AC1 | Critical |
| TC-SCH-003 | Page has a valid title | Happy Path | AC1 | Low |

### Active Scheme Verification (AC2)

| ID | Title | Type | AC | Priority |
|---|---|---|---|---|
| TC-SCH-004 | All active schemes returned by the API are displayed as cards in the list | Happy Path | AC2 | Critical |
| TC-SCH-005 | Scheme card list contains no duplicate scheme names | Data Integrity | AC2 | Medium |
| TC-SCH-006 | Each scheme card displays a non-empty Scheme Name | Happy Path | AC2 | High |
| TC-SCH-007 | Scheme list container is scrollable (`overflow: auto`) | UI | AC2 | Low |

### Search Functionality (AC3)

| ID | Title | Type | AC | Priority |
|---|---|---|---|---|
| TC-SCH-008 | Searching a full valid Scheme Name returns exactly the matching scheme | Happy Path | AC3, BR1 | Critical |
| TC-SCH-009 | Searching a 4+ character substring occurring mid-name (not a prefix) correctly filters the list (BR1) | Happy Path | AC3, BR1 | High |
| TC-SCH-010 | Searching fewer than 4 characters does not filter the list — full list remains displayed (BR2) | Business Rule | AC3, BR2 | Medium |
| TC-SCH-011 | Search is case-insensitive ("SILVER", "silver", "Silver" all return the same result) | Happy Path | AC3, BR1 | Medium |
| TC-SCH-012 | Leading/trailing whitespace in the search box is trimmed before matching | Negative/Validation | AC3, BR3 | Medium |
| TC-SCH-013 | [Defect BUG-SCH-001] A 4+ char search matching no scheme empties the list but shows no "No Results" message | Negative/Empty State | AC3, BR6 | High |
| TC-SCH-014 | Clearing the search box restores the complete, unfiltered scheme list | Happy Path | AC3 | Medium |
| TC-SCH-015 | Search does not throw a page error for an XSS-style payload and does not execute injected script | Negative/Security | AC3 | High |

### Scheme Details Panel (AC4)

| ID | Title | Type | AC | Priority |
|---|---|---|---|---|
| TC-SCH-016 | Scheme Details panel is visible alongside the scheme list | Happy Path | AC4 | Critical |
| TC-SCH-017 | The active panel slide displays a non-empty Scheme Name and Description | Happy Path | AC4 | High |
| TC-SCH-018 | The panel's Next/Previous carousel controls change the active slide without a page error | Happy Path | AC4 | Medium |
| TC-SCH-019 | The panel auto-rotates to a different slide after waiting (no manual interaction) | Happy Path | AC4 | Medium |

### Scheme Selection Action (AC5)

| ID | Title | Type | AC | Priority |
|---|---|---|---|---|
| TC-SCH-020 | Clicking a scheme card navigates to the Savings Application screen (`/applndetails`) without error | Happy Path | AC5 | Critical |
| TC-SCH-021 | The selected Scheme Name and Product Name are carried forward and displayed on the Savings Application screen | Happy Path | AC5, BR5 | Critical |

### Side Navigation (AC6)

| ID | Title | Type | AC | Priority |
|---|---|---|---|---|
| TC-SCH-022 | Home, My Profile, Notifications, About Us are all visible and enabled on the Scheme Selection screen | Happy Path | AC6 | High |
| TC-SCH-023 | Clicking Home from the Scheme Selection screen redirects to the Home Dashboard | Happy Path | AC6 | High |

### UI Validation (AC7)

| ID | Title | Type | AC | Priority |
|---|---|---|---|---|
| TC-SCH-024 | Page layout stays within viewport width (no horizontal overflow) at desktop resolution | UI/Responsive | AC7 | Medium |
| TC-SCH-025 | Search bar, product heading, and scheme cards render without visibly overlapping or truncated text | UI | AC7 | Low |

### Performance Validation (AC8)

| ID | Title | Type | AC | Priority |
|---|---|---|---|---|
| TC-SCH-026 | Scheme Selection screen loads within an acceptable response time after clicking New Application | Non-Functional | AC8 | Medium |
| TC-SCH-027 | Search results update within an acceptable response time after typing | Non-Functional | AC8 | Medium |

---

## 3. Out of Scope

Per the story: Savings Application Form, Applicant Details, KYC Verification, Product Configuration, Document Upload, Review & Submission, Approval Workflow, Decision Process, Post-Submission Actions. Also out of scope for automation: verifying an *inactive* scheme is excluded (no inactive scheme exists in the current UAT data set to prove the negative case against) and pagination (not present — the list is a single scrollable container).

---

## 4. Defect Log (from reconnaissance)

| ID | Severity | Summary |
|---|---|---|
| BUG-SCH-001 | Medium | AC3 requires "invalid search displays an appropriate 'No Results'" — confirmed via live recon that a 4+ character search matching zero schemes correctly empties the card list, but no "No Results" (or equivalent) message is shown; the area is simply blank under the "Savings Account" heading. |
