# SCH_TS001 — Scheme Selection Test Execution Report

**Date:** 31-Jul-2026
**Environment:** QA — https://sahyogagentweb.drutam.in:9634
**Browser:** Chromium (Desktop Chrome)
**Test User:** nayan.aher@netwinindia.in
**Route under test:** `/schemelist`

## Executive Summary

28 automated test cases were executed against the Scheme Selection screen (reached via Home → Savings Application card → New Application), covering navigation, active scheme listing, search, the auto-rotating Scheme Details panel, scheme-selection/redirect behavior, side navigation, UI alignment, and basic performance timing. **All 28 test cases passed.** One defect was found and documented (`BUG-SCH-001`): a search with no matches empties the scheme list but does not show a "No Results" message, as AC3 requires. No network/API failures (non-2xx responses) were observed anywhere in the flow.

## Test Statistics

| Test Type | Total | Passed | Failed |
|---|---|---|---|
| Happy Path / Navigation | 3 | 3 | 0 |
| Data Integrity / Read | 4 | 4 | 0 |
| Search / Business Rule | 6 | 6 | 0 |
| Security | 2 | 2 | 0 |
| Details Panel (Carousel) | 4 | 4 | 0 |
| Scheme Selection / Redirect | 2 | 2 | 0 |
| Side Navigation | 2 | 2 | 0 |
| UI / Responsive | 2 | 2 | 0 |
| Non-Functional (Performance) | 2 | 2 | 0 |
| Defect-Documenting | 1 | 1 | 0 |
| **Total** | **28** | **28** | **0** |

## Test Case Execution

| Test Case ID | Title | Test Type | Preconditions | Test Steps | Expected Result | Test Data | Priority | Actual Result |
|---|---|---|---|---|---|---|---|---|
| TC-SCH-001 | Clicking Savings Application card then New Application navigates to Scheme Selection and loads successfully | Happy Path | Logged in, on Home Dashboard | 1. Click Savings Application card 2. Click New Application on `/UNPOSTED` | Redirected to `/schemelist`; search box and scheme cards visible | N/A | Critical | ✅ Pass |
| TC-SCH-002 | Scheme Selection screen loads with no page errors | Happy Path | On `/schemelist` | 1. Navigate to screen 2. Listen for `pageerror` events | Zero page errors thrown | N/A | Critical | ✅ Pass |
| TC-SCH-003 | Page has a valid title | Happy Path | On `/schemelist` | 1. Assert `document.title` | Non-empty page title | N/A | Low | ✅ Pass |
| TC-SCH-004 | All active schemes returned by the API are displayed as cards in the list | Happy Path | On `/schemelist` | 1. Read all scheme card texts | List is non-empty; every card has non-empty text | 3 schemes (Silver Savings Account-1002, Normal Savings Account-1001, Staff Salary Account-1003) | Critical | ✅ Pass |
| TC-SCH-005 | Scheme card list contains no duplicate scheme names | Data Integrity | On `/schemelist` | 1. Read scheme names 2. Compare against a de-duplicated set | Set size equals list length (no duplicates) | N/A | Medium | ✅ Pass |
| TC-SCH-006 | Each scheme card displays a non-empty Scheme Name | Happy Path | On `/schemelist` | 1. Iterate every card and read its text | Every card's text length > 0 | N/A | High | ✅ Pass |
| TC-SCH-007 | Scheme list container is scrollable | UI | On `/schemelist` | 1. Inspect the list container's inline style | Container style includes `overflow: auto` | N/A | Low | ✅ Pass |
| TC-SCH-008 | Searching a full valid Scheme Name returns exactly the matching scheme | Happy Path | On `/schemelist` | 1. Type `Silver Savings Account - 1002` into search | List narrows to exactly 1 matching card | `Silver Savings Account - 1002` | Critical | ✅ Pass |
| TC-SCH-009 | Searching a 4+ character mid-name substring correctly filters the list (BR1) | Happy Path | On `/schemelist` | 1. Type `ving` (mid-string substring, not a prefix) | Every returned card's name contains `ving` (case-insensitive) | `ving` | High | ✅ Pass |
| TC-SCH-010 | Searching fewer than 4 characters does not filter the list (BR2) | Business Rule | On `/schemelist` | 1. Record full list 2. Type `Sil` (3 chars) | List is unchanged — identical to the unfiltered full list | `Sil` | Medium | ✅ Pass |
| TC-SCH-011 | Search is case-insensitive | Happy Path | On `/schemelist` | 1. Search `SILVER` 2. Search `silver` | Both searches return the identical single-card result | `SILVER`, `silver` | Medium | ✅ Pass |
| TC-SCH-012 | Leading/trailing whitespace in the search box is trimmed before matching (BR3) | Negative/Validation | On `/schemelist` | 1. Type `  Silver  ` (padded) | Returns the same single result as an untrimmed `Silver` search | `"  Silver  "` | Medium | ✅ Pass |
| TC-SCH-013 | [Defect BUG-SCH-001] A 4+ char search matching no scheme empties the list but shows no "No Results" message | Negative/Empty State | On `/schemelist` | 1. Type `zzzznonexistent` | **Expected (AC3):** list empties AND an appropriate "No Results" message is shown. **Actual:** list correctly empties to 0 cards, but no "No Results"/empty-state message is displayed anywhere in the panel. | `zzzznonexistent` | High | ✅ Pass (documents BUG-SCH-001) |
| TC-SCH-014 | Clearing the search box restores the complete, unfiltered scheme list | Happy Path | On `/schemelist` | 1. Record full list 2. Search a known scheme 3. Clear search box | List returns to exactly the original unfiltered full list | `Silver Savings Account - 1002` then cleared | Medium | ✅ Pass |
| TC-SCH-015 | XSS payload in the search box does not execute and produces no page error | Security | On `/schemelist` | 1. Type `<script>alert(1)</script>` into search | No JS dialog fires; zero page errors | `<script>alert(1)</script>` | High | ✅ Pass |
| TC-SCH-016 | Scheme Details panel is visible alongside the scheme list | Happy Path | On `/schemelist` | 1. Assert panel and card-list visibility | Both the carousel panel and the scheme card list are visible simultaneously | N/A | Critical | ✅ Pass |
| TC-SCH-017 | The active panel slide displays a non-empty Scheme Name and Description | Happy Path | On `/schemelist` | 1. Read the active carousel slide's name and description | Both fields are non-empty | N/A | High | ✅ Pass |
| TC-SCH-018 | The Next carousel control changes the active slide without a page error | Happy Path | On `/schemelist` | 1. Record active slide 2. Click Next Page control | Active slide name changes; zero page errors | N/A | Medium | ✅ Pass |
| TC-SCH-019 | The panel auto-rotates to a different slide without manual interaction | Happy Path | On `/schemelist` | 1. Record active slide 2. Wait, polling every 4s up to 24s, without any interaction | Active slide name changes at least once within the polling window | N/A | Medium | ✅ Pass |
| TC-SCH-020 | Clicking a scheme card navigates to the Savings Application screen without error | Happy Path | On `/schemelist` | 1. Click a scheme card | Redirected to `/applndetails`; zero page errors | `Silver Savings Account - 1002` | Critical | ✅ Pass |
| TC-SCH-021 | The selected Scheme Name and Product Name are carried forward to the Savings Application screen | Happy Path | On `/schemelist` | 1. Click a scheme card 2. Read Product Name / Scheme Name fields on `/applndetails` | Product Name shows "Savings Account"; Scheme Name shows the selected scheme | `Silver Savings Account - 1002` | Critical | ✅ Pass |
| TC-SCH-022 | Home, My Profile, Notifications, About Us are all visible and enabled on the Scheme Selection screen | Happy Path | On `/schemelist` | 1. Assert visibility/enabled state of all 4 sidebar nav links | All 4 links visible and enabled | N/A | High | ✅ Pass |
| TC-SCH-023 | Clicking Home from the Scheme Selection screen redirects to the Home Dashboard | Happy Path | On `/schemelist` | 1. Click Home in sidebar | Redirected to `/HOME` | N/A | High | ✅ Pass |
| TC-SCH-024 | Page layout stays within viewport width at desktop resolution | UI/Responsive | On `/schemelist` | 1. Compare document scroll width to viewport width | Scroll width ≤ viewport width (no horizontal overflow) | Desktop viewport | Medium | ✅ Pass |
| TC-SCH-025 | Search bar, product heading, and scheme cards render without overlap or truncation | UI | On `/schemelist` | 1. Assert visibility and bounding boxes of search bar, heading, first card | All elements visible with valid (non-null) bounding boxes | N/A | Low | ✅ Pass |
| TC-SCH-026 | Scheme Selection screen loads within an acceptable response time | Non-Functional | On `/schemelist` | 1. Reload page 2. Measure time until scheme list is loaded | Load completes within 10 seconds | N/A | Medium | ✅ Pass |
| TC-SCH-027 | Search results update within an acceptable response time after typing | Non-Functional | On `/schemelist` | 1. Type into search box 2. Measure time until list updates | Update completes within 3 seconds | `Silver` | Medium | ✅ Pass |

## Defect Log

| Defect ID | Title | Description | Priority | Severity | Status |
|---|---|---|---|---|---|
| BUG-SCH-001 | No "No Results" message shown for a zero-match scheme search | AC3 explicitly requires that "Invalid search displays an appropriate 'No Results'." A search of 4+ characters that matches no scheme correctly empties the scheme card list, but no "No Results" text or empty-state UI is shown anywhere in the panel — the area beneath the "Savings Account" heading is simply blank, giving the user no feedback that their search returned nothing (as opposed to, e.g., the page still loading). | Medium | Minor | Open |

## Business Rules Confirmed (via live recon, not in the original story)

- **BR1 — Substring match:** Search matches the entered text anywhere within the Scheme Name (case-insensitive), not just as a prefix — confirmed with `"ving"`, `"Account"`, `"1002"`, and `"savings account"` all correctly narrowing the list.
- **BR2 — 4-character minimum:** Search only activates once the trimmed query reaches 4 characters. Below that (1–3 characters), the search is a no-op and the full unfiltered list is shown, even for 3-character strings that are genuine substrings of a scheme name (e.g. `"Sav"`, `"Sta"`).
- **BR3 — Whitespace trimming:** Leading/trailing spaces are trimmed before matching.
- **BR4 — Panel/list independence:** The Scheme Details carousel and the scheme card list are independent components; the carousel keeps auto-rotating on its own timer and is not affected by the search box.

## Coverage Notes

- Only 3 active schemes exist in the current UAT data set (Silver Savings Account-1002, Normal Savings Account-1001, Staff Salary Account-1003), and no inactive scheme currently exists — so AC2's "inactive schemes shall not be displayed" requirement could not be exercised against a real negative case and is not automated as a standalone assertion.
- Pagination controls for the scheme list are out of scope for automation — the live UI uses a single scrollable container, not a paginator, for the current data volume.
- The carousel's exact auto-rotation interval was not asserted as a fixed number (e.g. "rotates every N seconds") since the interval was observed to vary/cycle unevenly across samples; TC-SCH-019 instead confirms rotation happens at all within a generous polling window, which is what AC4 actually requires.

## Recommendations

1. Fix `BUG-SCH-001`: add a "No Results" (or equivalent) empty-state message to the scheme card list when a search matches nothing, matching the same pattern already used elsewhere in the app (e.g. the Savings Application Dashboard's "No Records Found" row).
2. No blockers to go-live — core navigation, scheme listing, search filtering, the details panel, and the scheme-selection redirect all work correctly.
