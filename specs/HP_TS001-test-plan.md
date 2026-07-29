# HP_TS001 — Homepage Test Plan (v2 — US_HOME_001)

**Story:** `user-stories/2. Homepage.md`, section 0 — **US_HOME_001**: *Verify Home Page UI, Navigation, Alerts, User Menu & Dashboard Functionality*
**Application URL:** https://sahyogagentweb.drutam.in:9634/HOME
**Test credentials:** nayan.aher@netwinindia.in / Sahayog@2025

This revision supersedes the v1 plan (which was scoped to `HOME_FR_001–010` only from the earlier, more granular story document). US_HOME_001 explicitly requires exercising interactive behavior — panel open/close, popups, profile-menu navigation, language switching — not just static visibility, so the plan below adds those cases.

## Pre-execution reconnaissance (interaction-level)

A fresh authenticated session was used to actually click every interactive control before writing automation:

- **Alerts icon** (`title="Alerts"`) — clicking it navigates to `/aletsupdates`, the same full alerts page reached via "View All" (confirmed by comparing URL before/after; an earlier pass that only checked for an inline dropdown panel missed this and incorrectly suggested nothing happened). This satisfies AC5.
- **Notification bell** (`title="Notification"`) — clicking it opens `.web-notification.dropdown-menu.show`, a panel titled "Notification" with All/Unread tabs, a "See All" link, and a live list of notification items.
- **Profile avatar** (`.fn-userbox`) — opens a dropdown with exactly 4 items: My Profile, Change Password, Change Language, Logout (matches AC7 exactly).
- **My Profile** → navigates to `/MY_PROFILE`, loads real user data (Name, Gender, DOB, Mobile, Email, Address) — no blank/error state.
- **Change Password** → navigates to `/CHANGE_PASSWORD`, loads a 3-field form (Current/New/Confirm Password) + "Update Password" button. No Cancel button exists (corroborates a pre-existing exploratory finding, `BUG-003_missing-cancel-button-change-password.png`).
- **Change Language** → navigates to a "Choose Your Language" page with English (checked by default) and मराठी checkboxes.
- **Mandatory Scrutiny Process** alert item → opens a PrimeReact dialog (`.p-dialog`) with title, timestamp, rich-text body, a document table (row: "Ration Card.pdf" with download/view icons), a "Download All" link, and a working `Close` icon button (`aria-label="Close"`).
- **Sidebar nav** — Home → `/HOME`, My Profile → `/MY_PROFILE`, Notifications → `/NOTIFICATIONS`, About Us → `/ABOUT_US`. All four redirect correctly.
- **"View All"** (Alerts section) → navigates to `/aletsupdates`, a full alerts listing page with pagination ("Showing 10 records", Previous/Next).

## Test Cases

| Test Case ID | Title | Test Type | AC Reference | Preconditions | Test Steps | Expected Result | Test Data | Priority |
|---|---|---|---|---|---|---|---|---|
| TC-HOME-001 | Homepage loads successfully after login | Happy Path | AC1 | Authenticated session | Navigate to `/HOME`; wait for load | URL is `/HOME`, no unhandled console errors, no unexpected error message | Valid user | Critical |
| TC-HOME-002 | Left navigation menu items are visible and enabled | UI | AC2 | On Homepage | Assert Home / My Profile / Notifications / About Us are visible and enabled | All 4 items visible + enabled | — | Critical |
| TC-HOME-003 | Left navigation items redirect to their respective pages | Happy Path | AC2 | On Homepage | Click each nav item in turn; assert URL after each | Home→`/HOME`, My Profile→`/MY_PROFILE`, Notifications→`/NOTIFICATIONS`, About Us→`/ABOUT_US` | — | Critical |
| TC-HOME-004 | Top header displays all required icons | UI | AC3 | On Homepage | Assert date badge, Alerts icon, Notification bell, User Profile icon are all visible and enabled | All header elements visible + enabled | — | Critical |
| TC-HOME-005 | Today's date matches current system date and format | Happy Path / Business Rule | AC4 | On Homepage | Read date badge text; compare to today (DD/MM/YYYY) | Date is non-blank and equals today's date in the correct format | — | High |
| TC-HOME-006 | Alerts icon opens an alerts panel | Happy Path | AC5 | On Homepage | Click Alerts icon | A panel/page shows alert content, distinct from the pre-click state (navigates to `/aletsupdates`) | — | High |
| TC-HOME-007 | Notification bell opens, loads, and closes the notification list | Happy Path / State-Aware UI | AC6 | On Homepage | Click Notification bell; assert panel visible with ≥1 item; click bell again; assert panel closes | Panel opens with notifications, closes cleanly on second click | — | Critical |
| TC-HOME-008 | User Profile menu shows the required 4 options | UI | AC7 | On Homepage | Click user avatar | Dropdown shows exactly: My Profile, Change Password, Change Language, Logout | — | Critical |
| TC-HOME-009 | My Profile menu option redirects and loads user info | Happy Path | AC8 | On Homepage | Open profile menu; click "My Profile" | URL is `/MY_PROFILE`; profile fields (Name, Email, Mobile) render with non-blank values | — | High |
| TC-HOME-010 | Change Password menu option redirects and loads the form | Happy Path | AC8 | On Homepage | Open profile menu; click "Change Password" | URL is `/CHANGE_PASSWORD`; Current/New/Confirm password fields + submit button visible | — | High |
| TC-HOME-011 | Change Language option allows selecting an available language | Happy Path | AC8 | On Homepage | Open profile menu; click "Change Language"; select "मराठी" | Language page opens with ≥2 language options; selecting one updates its checked state | — | Medium |
| TC-HOME-012 | Logout terminates the session and blocks Back navigation | Happy Path / Security | AC8, AC15 | On Homepage | Open profile menu; click Logout; then press browser Back | Redirected to `/login`; Back does not restore the authenticated Homepage | — | Critical |
| TC-HOME-013 | Alerts & Internal Updates section is visible with All/Important/View All | UI | AC9 | On Homepage | Assert heading + All tab + Important tab + View All link are visible | All present | — | High |
| TC-HOME-014 | "All" and "Important" alert filters are interactive | State-Aware UI | AC10 | On Homepage, alerts loaded | Click Important tab; click All tab | No error; list re-renders each time; tab active state changes | — | Medium |
| TC-HOME-015 | "View All" redirects to the full alerts page with records | Happy Path | AC10 | On Homepage | Click "View All" | Navigates to full alerts/updates page; ≥1 record displayed | — | High |
| TC-HOME-016 | Mandatory Scrutiny alert opens a popup with full content | Happy Path | AC11 | On Homepage, alert item visible | Click "Mandatory Scrutiny Process for All New Applications" | Dialog opens with title, timestamp, non-blank body text, and a document table row | — | High |
| TC-HOME-017 | Mandatory Scrutiny popup actions are usable and close cleanly | State-Aware UI | AC12 | Popup open | Assert Download All link and row action icons are visible; click Close | Actions visible/enabled; Close button dismisses the dialog | — | Medium |
| TC-HOME-018 | Saving Application card is visible | Happy Path | AC13 | On Homepage | Assert "Savings Application" card visible | Card visible | — | High |
| TC-HOME-019 | All Homepage images load without broken links | UI | AC14 | On Homepage | Collect all `<img>`; assert `naturalWidth > 0` for each | No broken images | — | High |
| TC-HOME-020 | Responsive layout — mobile viewport (390×844) | Responsive | AC14 | On Homepage | Resize to 390×844; reload | No horizontal overflow; content usable | 390×844 | High |
| TC-HOME-021 | Responsive layout — tablet viewport (768×1024) | Responsive | AC14 | On Homepage | Resize to 768×1024; reload | No horizontal overflow | 768×1024 | Medium |
| TC-HOME-022 | Full navigation walkthrough produces no console errors | Negative / General | AC13 | On Homepage | Visit all 4 sidebar destinations, then return Home; monitor `console` events throughout | Zero `console.error` events across the walkthrough | — | High |
| TC-HOME-023 | Session persists after refresh on Homepage | Happy Path | AC15 | Authenticated, on Homepage | Load Homepage; refresh | Homepage reloads without redirect to login | — | High *(already covered by `TC-LOGIN-012` — not duplicated)* |
| TC-HOME-024 | Unauthenticated direct navigation to Homepage is blocked | Negative / Security | AC15 | No session | Clear storage state; navigate to `/HOME` | Redirected to `/login` | — | Critical *(already covered by `TC-LOGIN-017` — not duplicated)* |

## Save Location
This document: `specs/HP_TS001-test-plan.md`
Automation: `tests/HP_TS001/homepage.spec.ts`
POM: `tests/pages/dashboard/DashboardPage.ts` (extended), `tests/pages/dashboard/NotificationPanel.ts`, `tests/pages/dashboard/MandatoryScrutinyModal.ts` (new), `tests/pages/profile/MyProfilePage.ts`, `tests/pages/profile/ChangePasswordPage.ts`, `tests/pages/profile/LanguageSelectionPage.ts` (new)
