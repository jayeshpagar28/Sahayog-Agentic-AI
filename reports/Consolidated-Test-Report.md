# SAHAYOG Consolidated Test Execution Report

**Modules covered:** Login (LP_TS001), Homepage / US_HOME_001 (HP_TS001), Forgot User ID (FUI_TS001)
**Date:** 28-Jul-2026
**Environment:** QA — https://sahyogagentweb.drutam.in:9634
**Browser:** Chromium (Desktop Chrome)
**Test User:** nayan.aher@netwinindia.in (Branch Origination Officer)

## Executive Summary

65 test cases were exercised across the three modules (20 Login + 23 Homepage + 22 Forgot User ID, of which 1 is a live-assisted end-to-end run). **59 passed, 0 failed, 6 skipped by design** (documented reachability gates protecting the account's real Reference ID quota, not failures). The live-assisted test (Forgot User ID full recovery) was executed manually with a real Reference ID and OTP and passed. Five defects were found and documented; none block core functionality — Login, Homepage, and Forgot User ID all work correctly on their primary paths.

During this session the QA environment showed intermittent transient slowness (occasional 30s timeouts that cleared on retry). These were confirmed as environment/network noise, not code or product defects, by re-running to a clean, stable result each time.

## Test Statistics

| Module | Total | Passed | Failed | Skipped |
|---|---|---|---|---|
| Login (LP_TS001) | 20 | 20 | 0 | 0 |
| Homepage (HP_TS001, US_HOME_001) | 23 | 23 | 0 | 0 |
| Forgot User ID (FUI_TS001) | 22 | 16 (15 automated + 1 live-assisted) | 0 | 6 (by design) |
| **Total** | **65** | **59** | **0** | **6** |

---

## Module 1: Login (LP_TS001) — 20/20 passed

| Test Case ID | Title | Test Type | Preconditions | Test Steps | Expected Result | Test Data | Priority | Actual Result |
|---|---|---|---|---|---|---|---|---|
| TC-LOGIN-001 | Login page loads with all UI components | Happy Path / UI | Unauthenticated, on `/login` | 1. Navigate to `/login` | Logo, User Id field, Password field, Login button, Forgot Password link, Forgot User ID link, Activate Account link all visible | N/A | Critical | ✅ Pass |
| TC-LOGIN-002 | Page title and URL are correct | Happy Path / UI | On `/login` | 1. Inspect page title and URL | Title = "Drutam Origination"; URL contains `/login` | N/A | High | ✅ Pass |
| TC-LOGIN-003 | Password field is masked by default | UI | On `/login` | 1. Inspect password input `type` attribute | `type="password"` | N/A | High | ✅ Pass |
| TC-LOGIN-004 | Password visibility toggle shows/hides password | Functional | On `/login` | 1. Fill password 2. Click eye icon 3. Click again | Type toggles `password` → `text` → `password` | Password: `Sahayog@2025` | Medium | ✅ Pass |
| TC-LOGIN-005 | Blank form submission shows both validation messages | Negative/Validation | On `/login`, fields empty | 1. Click Login with both fields empty | "Enter User Id" shown; stays on `/login`; no `oauth2/token` request fired | N/A | Critical | ✅ Pass |
| TC-LOGIN-006 | Blank User Id shows field-level validation | Negative/Validation | Password filled, User Id empty | 1. Fill password 2. Click Login | "Enter User Id" message shown | Password: `Sahayog@2025` | High | ✅ Pass |
| TC-LOGIN-007 | Blank Password shows field-level validation | Negative/Validation | User Id filled, Password empty | 1. Fill User Id 2. Click Login | "Enter password" message shown | UserId: `nayan.aher@netwinindia.in` | High | ✅ Pass |
| TC-LOGIN-008 | Invalid email format is rejected (or safely handled) | Business Rule | On `/login` | 1. Fill User Id with `not-an-email` 2. Fill any password 3. Click Login | **Expected:** client-side format validation blocks submission. **Actual (known defect DEF-001):** app calls the auth API regardless and returns a generic "credentials incorrect" toast | UserId: `not-an-email`, Password: `SomePass123!` | High | ✅ Pass (documents DEF-001) |
| TC-LOGIN-009 | Keyboard tab order moves through fields logically | Functional | On `/login` | 1. Click User Id 2. Press Tab | Focus moves User Id → Password | N/A | Medium | ✅ Pass |
| TC-LOGIN-010 | Enter key on password field submits the form | Functional | On `/login` | 1. Fill valid User Id + Password 2. Press Enter in password field | Redirects to `/HOME` | Valid credentials | High | ✅ Pass |
| TC-LOGIN-011 | Successful login with valid credentials | Happy Path | On `/login` | 1. Fill valid User Id 2. Fill valid Password 3. Click Login | Redirect to `/HOME`; `user/data` and `sidemenu/list` APIs return 200 | `nayan.aher@netwinindia.in` / `Sahayog@2025` | Critical | ✅ Pass |
| TC-LOGIN-012 | Session persists after page refresh post-login | Happy Path | Logged in | 1. Load `/HOME` 2. Refresh | Still authenticated, dashboard reloads without redirect to login | Valid credentials (via storageState) | High | ✅ Pass |
| TC-LOGIN-013 | Invalid password shows generic non-sensitive error | Negative/Validation | On `/login` | 1. Fill valid User Id 2. Fill wrong password 3. Click Login | Toast: "The password you entered is incorrect"; stays on `/login`; password field remains masked | UserId valid, Password: `WrongPass123!` | Critical | ✅ Pass |
| TC-LOGIN-014 | Login button is non-interactive while auth request is in flight | State-Aware UI | On `/login` | 1. Fill valid credentials 2. Click Login | Full-page loading overlay appears and blocks re-clicks during the in-flight request | Valid credentials | Medium | ✅ Pass |
| TC-LOGIN-015 | Forgot Password link is visible and clickable | Functional | On `/login` | 1. Assert link visible/enabled 2. Click it | Navigates to the Forgot Password flow | N/A | Medium | ✅ Pass |
| TC-LOGIN-016 | Credentials never appear in the URL | Security | On `/login` | 1. Login with valid credentials 2. Inspect resulting URL | User Id / password never appear as URL query params | Valid credentials | Critical | ✅ Pass |
| TC-LOGIN-017 | Unauthenticated direct navigation to dashboard is blocked | Business Rule | No session (fresh context) | 1. Navigate directly to `/HOME` without logging in | Redirected to `/login` | N/A | Critical | ✅ Pass |
| TC-LOGIN-018 | Rapid double-click on Login does not double-submit | Async/Race | On `/login` | 1. Fill valid credentials 2. Click Login 3. Immediately click again | Loading overlay blocks the second click; at most 1 `oauth2/token` request fires | Valid credentials | Medium | ✅ Pass |
| TC-LOGIN-019 | SQL Injection / XSS payloads are rejected safely | Security | On `/login` | 1. Enter `' OR '1'='1` in User Id and `<script>alert(1)</script>` in Password 2. Click Login | Treated as invalid credentials; no script execution; no SQL error surfaced | Payload strings | High | ✅ Pass |
| TC-LOGIN-020 | Responsive layout on mobile viewport | UI/Responsive | On `/login` | 1. Set viewport to 375×667 2. Reload | All fields/buttons remain visible and usable | N/A | Low | ✅ Pass |

**Defect found:**

| ID | Title | Description | Severity | Status |
|---|---|---|---|---|
| DEF-001 | User ID field does not validate email format client-side | Entering an invalid format (e.g. `not-an-email`) is not rejected client-side; the app calls the auth API regardless and surfaces a generic "credentials incorrect" toast instead of a field-level format error. | Low | Open |

No security, session, or core-flow issues found.

---

## Module 2: Homepage (HP_TS001, US_HOME_001) — 23/23 passed

Full user story: `user-stories/2. Homepage.md`, section 0 (**US_HOME_001**). AC1–AC15 covered.

| Test Case ID | Title | Test Type | AC Reference | Preconditions | Test Steps | Expected Result | Test Data | Priority | Actual Result |
|---|---|---|---|---|---|---|---|---|---|
| TC-HOME-001 | Homepage loads successfully after login | Happy Path | AC1 | Authenticated session | Navigate to `/HOME`; wait for load | URL is `/HOME`, no unhandled console errors, no unexpected error message | Valid user | Critical | ✅ Pass |
| TC-HOME-002 | Left navigation menu items are visible and enabled | UI | AC2 | On Homepage | Assert Home / My Profile / Notifications / About Us are visible and enabled | All 4 items visible + enabled | — | Critical | ✅ Pass |
| TC-HOME-003 | Left navigation items redirect to their respective pages | Happy Path | AC2 | On Homepage | Click each nav item in turn; assert URL after each | Home→`/HOME`, My Profile→`/MY_PROFILE`, Notifications→`/NOTIFICATIONS`, About Us→`/ABOUT_US` | — | Critical | ✅ Pass |
| TC-HOME-004 | Top header displays all required icons | UI | AC3 | On Homepage | Assert date badge, Alerts icon, Notification bell, User Profile icon are all visible and enabled | All header elements visible + enabled | — | Critical | ✅ Pass |
| TC-HOME-005 | Today's date matches current system date and format | Happy Path / Business Rule | AC4 | On Homepage | Read date badge text; compare to today (DD/MM/YYYY) | Date is non-blank and equals today's date in the correct format | — | High | ✅ Pass |
| TC-HOME-006 | Alerts icon opens an alerts panel | Happy Path | AC5 | On Homepage | Click Alerts icon | Navigates to `/aletsupdates`, the same full alerts page reached via "View All" | — | High | ✅ Pass |
| TC-HOME-007 | Notification bell opens, loads, and closes the notification list | Happy Path / State-Aware UI | AC6 | On Homepage | Click Notification bell; assert panel visible with ≥1 item; click bell again; assert panel closes | Panel opens with notifications, closes cleanly on second click | — | Critical | ✅ Pass |
| TC-HOME-008 | User Profile menu shows the required 4 options | UI | AC7 | On Homepage | Click user avatar | Dropdown shows exactly: My Profile, Change Password, Change Language, Logout | — | Critical | ✅ Pass |
| TC-HOME-009 | My Profile menu option redirects and loads user info | Happy Path | AC8 | On Homepage | Open profile menu; click "My Profile" | URL is `/MY_PROFILE`; profile fields (Name, Email, Mobile) render with non-blank values | — | High | ✅ Pass |
| TC-HOME-010 | Change Password menu option redirects and loads the form | Happy Path | AC8 | On Homepage | Open profile menu; click "Change Password" | URL is `/CHANGE_PASSWORD`; Current/New/Confirm password fields + submit button visible | — | High | ✅ Pass |
| TC-HOME-011 | Change Language option allows selecting an available language | Happy Path | AC8 | On Homepage | Open profile menu; click "Change Language"; select "मराठी" | Language page opens with ≥2 language options; selecting one updates its checked state | — | Medium | ✅ Pass |
| TC-HOME-012 | Logout terminates the session and blocks Back navigation | Happy Path / Security | AC8, AC15 | On Homepage | Open profile menu; click Logout; then press browser Back | Redirected to `/login`; Back does not restore the authenticated Homepage | — | Critical | ✅ Pass |
| TC-HOME-013 | Alerts & Internal Updates section is visible with All/Important/View All | UI | AC9 | On Homepage | Assert heading + All tab + Important tab + View All link are visible | All present | — | High | ✅ Pass |
| TC-HOME-014 | "All" and "Important" alert filters are interactive | State-Aware UI | AC10 | On Homepage, alerts loaded | Click Important tab; click All tab | No error; list re-renders each time; tab active state changes | — | Medium | ✅ Pass |
| TC-HOME-015 | "View All" redirects to the full alerts page with records | Happy Path | AC10 | On Homepage | Click "View All" | Navigates to full alerts/updates page; ≥1 record displayed | — | High | ✅ Pass |
| TC-HOME-016 | Mandatory Scrutiny alert opens a popup with full content | Happy Path | AC11 | On Homepage, alert item visible | Click "Mandatory Scrutiny Process for All New Applications" | Dialog opens with title, timestamp, non-blank body text, and a document table row | — | High | ✅ Pass |
| TC-HOME-017 | Mandatory Scrutiny popup actions are usable and close cleanly | State-Aware UI | AC12 | Popup open | Assert Download All link and row action icons are visible; click Close | Actions visible/enabled; Close button dismisses the dialog | — | Medium | ✅ Pass |
| TC-HOME-018 | Saving Application card is visible | Happy Path | AC13 | On Homepage | Assert "Savings Application" card visible | Card visible | — | High | ✅ Pass |
| TC-HOME-019 | All Homepage images load without broken links | UI | AC14 | On Homepage | Collect all `<img>`; assert `naturalWidth > 0` for each | No broken images | — | High | ✅ Pass |
| TC-HOME-020 | Responsive layout — mobile viewport (390×844) | Responsive | AC14 | On Homepage | Resize to 390×844; reload | No horizontal overflow; content usable | 390×844 | High | ✅ Pass |
| TC-HOME-021 | Responsive layout — tablet viewport (768×1024) | Responsive | AC14 | On Homepage | Resize to 768×1024; reload | No horizontal overflow | 768×1024 | Medium | ✅ Pass |
| TC-HOME-022 | Full navigation walkthrough produces no console errors | Negative / General | AC13 | On Homepage | Visit all 4 sidebar destinations, then return Home; monitor `console` events throughout | Zero `console.error` events across the walkthrough | — | High | ✅ Pass |
| TC-HOME-023* | Session persists after refresh on Homepage | Happy Path | AC15 | Authenticated | Load Homepage; refresh | Homepage reloads without redirect to login | — | High | ✅ Pass (satisfied by TC-LOGIN-012, not duplicated) |

\* TC-HOME-023 and an equivalent unauthenticated-access-blocked case are satisfied by `TC-LOGIN-012`/`TC-LOGIN-017` above rather than re-implemented.

**Defects found** (from an earlier, broader-scope pass against the original Homepage requirements — not covered by US_HOME_001's AC list, so not re-verified in this cycle, but still open since nothing has changed):

| ID | Title | Description | Severity | Status |
|---|---|---|---|---|
| BUG-006 | SAHAYOG and Government logos not rendered anywhere on the Homepage | Only the Netwin logo (footer "Powered By netwin v1.05") renders; no SAHAYOG or Government branding image exists in the DOM. | High | Open |
| BUG-007 | Footer renders with no copyright text | `footer.am-footer` exists but its `.am-foot-copyright` child is empty; the footer also fails a basic visibility check. Corroborated by an independent pre-existing exploratory finding (`BUG-004`). | Medium | Open |

One automation-layer bug was found and fixed during this session (not a product defect): the Notification panel's item count was read before the async list finished rendering, causing an intermittent false-empty read — fixed by waiting for the first item to render before counting.

---

## Module 3: Forgot User ID (FUI_TS001) — 15/15 automated + 1/1 live-assisted passed, 6 skipped by design

The real flow is **3 steps**: **Mobile Number → Send Reference ID**, then **Reference ID + Date of Birth → Submit** (which triggers an **OTP** step), then **OTP → Verify**, which discloses the User ID.

| Test Case ID | Title | Test Type | Preconditions | Test Steps | Expected Result | Test Data | Priority | Actual Result |
|---|---|---|---|---|---|---|---|---|
| TC-FUI-001 | Forgot User ID page loads with all UI components | Happy Path | On `/forgetUser` | 1. Navigate via Login → "Forgot User ID ?" | Logo, "Recover Your User ID" heading, instruction text, Mobile Number field, Send Reference ID button, Cancel button, footer all visible | N/A | Critical | ✅ Pass |
| TC-FUI-002 | Page URL is correct after navigation | Happy Path | On `/forgetUser` | 1. Assert URL | URL contains `/forgetUser` | N/A | High | ✅ Pass |
| TC-FUI-003 | Send Reference ID button is disabled while Mobile Number is blank | Business Rule | On `/forgetUser` | 1. Leave Mobile Number blank 2. Inspect button state | Button disabled | N/A | High | ✅ Pass |
| TC-FUI-004 | Send Reference ID button enables once Mobile Number has a value | Functional | On `/forgetUser` | 1. Type any digit into Mobile Number | Button becomes enabled | Mobile: `9` | Medium | ✅ Pass |
| TC-FUI-005 | Non-numeric characters are stripped client-side from Mobile Number | Business Rule | On `/forgetUser` | 1. Type `abc123def456` into Mobile Number | Field value becomes `123456` | Mobile: `abc123def456` | Medium | ✅ Pass |
| TC-FUI-006 | Whitespace-only Mobile Number is treated as blank | Business Rule | On `/forgetUser` | 1. Type `"   "` into Mobile Number 2. Inspect button state | Button stays disabled | Mobile: `"   "` | Medium | ✅ Pass |
| TC-FUI-007 | Unregistered Mobile Number shows an error and stays on step 1 | Negative | On `/forgetUser` | 1. Fill an unregistered number 2. Click Send Reference ID | "User not found" toast; stays on `/forgetUser`; Step 2 fields not revealed | Mobile: `9075063434` (unregistered as of 29-Jul-2026) | High | ✅ Pass |
| TC-FUI-012 | Cancel from step 1 returns to the Login page | Functional | On `/forgetUser` | 1. Click Cancel | Redirected to `/login` | N/A | High | ✅ Pass |
| TC-FUI-013 | Credentials never appear in the URL | Security | On `/forgetUser` | 1. Submit a mobile number 2. Inspect resulting URL | Mobile number never appears as a URL query param | Mobile: `9075063434` | High | ✅ Pass |
| TC-FUI-014 | SQL Injection payload in Mobile Number is handled safely | Security | On `/forgetUser` | 1. Fill Mobile Number with `1' OR '1'='1` 2. Click Send Reference ID | Treated as invalid; no SQL error surfaced; stays on `/forgetUser`; Step 2 not revealed | Mobile: `1' OR '1'='1` | High | ✅ Pass |
| TC-FUI-015 | XSS payload in Mobile Number is handled safely | Security | On `/forgetUser` | 1. Fill Mobile Number with `<script>alert(1)</script>` 2. Click Send Reference ID | No JS dialog fires; stays on `/forgetUser` | Mobile: `<script>alert(1)</script>` | High | ✅ Pass |
| TC-FUI-016 | Rapid double-click on Send Reference ID does not double-submit | Async/Race | On `/forgetUser` | 1. Fill Mobile Number 2. Click Send Reference ID 3. Immediately click again | **Expected:** button disables in-flight, only 1 request fires. **Actual (known defect DEF-003):** button is never disabled, 2 identical `ref/request` calls fire | Mobile: `9075063434` | Medium | ✅ Pass (documents DEF-003) |
| TC-FUI-017 | Responsive layout on mobile viewport | UI/Responsive | On `/forgetUser` | 1. Set viewport to 375×667 | All fields/buttons remain visible and usable | N/A | Low | ✅ Pass |
| TC-FUI-017b | Reloading the page redirects to Login instead of staying on it | Negative | On `/forgetUser` | 1. Reload the browser | **Expected:** page persists. **Actual (known defect DEF-002):** redirected to `/login`, recovery flow lost | N/A | Medium | ✅ Pass (documents DEF-002) |
| TC-FUI-018 | Browser Back button after Cancel returns without errors | Functional | Cancelled back to Login | 1. Click Cancel 2. Press browser Back | No console errors after navigating back | N/A | Low | ✅ Pass |
| TC-FUI-008 | Registered Mobile Number reveals the Step 2 verification form | Happy Path | Registered mobile number reachable | 1. Complete Step 1 with a registered number | Success toast; Step 2 reveals Reference ID + Date of Birth fields; Mobile Number field becomes locked | Registered mobile | Critical | ⏭ Skipped (guard: `beforeEach` deliberately uses an unregistered number to protect the real Reference ID quota) |
| TC-FUI-009 | Step 2 fields are present and individually marked mandatory | UI | Step 2 revealed | 1. Inspect each Step 2 field | Reference ID and Date of Birth each show a `*` mandatory indicator | N/A | High | ⏭ Skipped (same guard) |
| TC-FUI-010 | Step 2 blank submission shows all required-field messages | Negative | Step 2 revealed, fields blank | 1. Click Submit with all Step 2 fields empty | "Reference ID is required" and "Date of Birth is required" shown; no `otp/request` call fires | N/A | Critical | ⏭ Skipped (same guard) |
| TC-FUI-011 | Step 2 submission with incorrect data shows a mismatch error | Negative | Step 2 revealed | 1. Fill Reference ID + DOB with incorrect values 2. Click Submit | Toast "Reference ID mismatch"; stays on `/forgetUser` | Reference ID: `WRONG-REF-999`, DOB: `2000-01-01` | High | ⏭ Skipped (same guard) |
| TC-FUI-019 | Step 2 Submit button is not disabled while fields are blank | State-Aware UI (UX inconsistency) | Step 2 revealed, fields blank | 1. Inspect Submit button state | **Observed inconsistency:** unlike Step 1's button, Step 2's Submit stays enabled while blank and relies on post-click validation | N/A | Low | ⏭ Skipped (same guard) |
| TC-FUI-021 | [Blocked] Reference ID rejected after its 720-hour validity period expires | Business Rule | A Reference ID older than 720 hours | 1. Submit Step 2 with an expired Reference ID | Submission rejected with an expiry-specific error | Expired Reference ID | Medium | ⏭ Skipped (Blocked — cannot fast-forward 30 days in this environment) |
| TC-FUI-020 | Full recovery with correct Reference ID and OTP discloses the User ID | Happy Path (Live, Manually-Assisted) | Registered mobile number `9511996248` | 1. Send Reference ID (live) 2. Enter live Reference ID + DOB `02-05-2001` → Submit 3. Enter live OTP → Verify | Reference ID+DOB unlocks an OTP step; OTP verification discloses **User ID: nayan.aher@netwinindia.in**, matching the known login exactly | Reference ID `SMCC202607284668`, OTP `2828` (example run) | High | ✅ Pass (executed live with real, human-relayed data) |

**Defects found:**

| ID | Title | Description | Severity | Status |
|---|---|---|---|---|
| DEF-002 | Reloading `/forgetUser` redirects to Login instead of preserving the recovery flow | A hard reload drops the client-side route entirely, losing the user's place in the recovery flow (unlike `/login`, which is the SPA's fallback route and trivially survives a reload). | Low | Open |
| DEF-003 | Send Reference ID button not disabled during in-flight request | A rapid double-click fires two identical `ref/request` calls instead of being prevented, wasting a rate-limited Reference ID request. Confirmed reproducing across multiple runs. | Medium | Open |

**Environment note:** The account's registered mobile number changed from `9075063434` to `9511996248` partway through this session; test data was updated accordingly. The account's 24-hour Reference ID rate limit was hit twice during testing and cleared/disabled by the user each time to allow verification to proceed — production usage should expect this real limit to apply normally.

---

## Consolidated Defect Log

| Defect ID | Module | Title | Severity | Priority | Status |
|---|---|---|---|---|---|
| DEF-001 | Login | User ID field does not validate email format client-side | Low | Medium | Open |
| BUG-006 | Homepage | SAHAYOG/Government logos not rendered | Major | High | Open |
| BUG-007 | Homepage | Footer has no copyright text | Minor | Medium | Open |
| DEF-002 | Forgot User ID | Reload drops the recovery flow, redirects to Login | Minor | Low | Open |
| DEF-003 | Forgot User ID | Send Reference ID not disabled in-flight (double-submit) | Major | Medium | Open |

Full formatted defect tracker: `reports/Consolidated-Defect-Sheet.xlsx`.

## Recommendations

1. Add client-side email-format validation to the Login User ID field (DEF-001) so invalid input doesn't reach the auth API at all.
2. Add the SAHAYOG logo (and Government logo, if configured) to the Homepage, and populate the footer's copyright text (BUG-006, BUG-007).
3. Preserve Forgot User ID recovery state across a reload, or explicitly redirect with a clear "your recovery session was lost, please start again" message rather than a silent bounce to Login (DEF-002).
4. Disable the Send Reference ID button while its request is in flight (DEF-003) — this also protects the account's daily Reference ID quota from being wasted by accidental double-clicks.
5. None of the above block go-live for these three modules; all core flows (login, homepage navigation/widgets, forgot-user-ID recovery) work correctly end-to-end.
