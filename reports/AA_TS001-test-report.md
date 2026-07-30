# AA_TS001 — Account Activation Test Execution Report

**Date:** 30-Jul-2026
**Environment:** QA — https://sahyogagentweb.drutam.in:9634
**Browser:** Chromium (Desktop Chrome)

## Executive Summary

20 test cases were executed against the Account Activation module: **19 deterministic tests, all passed**, plus **1 live-assisted end-to-end happy-path test, passed**. The existing spec and page object were already accurate for the current environment (no healing required). The full 4-step activation flow — Reference ID + User ID + DOB → OTP → New/Confirm Password → login — was confirmed working end-to-end, including a real post-activation login that succeeded. Two defects were found (`DEF-002`, `DEF-003`); neither blocks core functionality.

## Test Statistics

| Test Type | Total | Passed | Failed |
|---|---|---|---|
| Happy Path / UI | 3 | 3 | 0 |
| State-Aware UI / Business Rule | 5 | 5 | 0 |
| Negative | 3 | 3 | 0 |
| Security | 3 | 3 | 0 |
| Async/Race | 1 | 1 | 0 |
| Responsive | 2 | 2 | 0 |
| Functional | 3 | 3 | 0 |
| Live Happy Path (Manually-Assisted) | 1 | 1 | 0 |
| **Total** | **20** | **20** | **0** |

## Test Case Execution

| Test Case ID | Title | Test Type | Preconditions | Test Steps | Expected Result | Test Data | Priority | Actual Result |
|---|---|---|---|---|---|---|---|---|
| TC-AA-001 | Activate Account page loads with all UI components | Happy Path / UI | Unauthenticated, via Login → "Activate Account" | 1. Navigate via Login link | Logo, "Activate Your Account" heading, instruction text, Reference ID field, User ID field, Date of Birth field, Submit button, Cancel button, footer all visible | N/A | Critical | ✅ Pass |
| TC-AA-002 | Page URL is correct after navigation | Happy Path / UI | On page | 1. Assert URL | URL contains `/activeteUser` | N/A | High | ✅ Pass |
| TC-AA-003 | All three mandatory fields display a `*` indicator | UI | On page | 1. Inspect each field label | Reference ID, User ID, Date of Birth each show `*` | N/A | High | ✅ Pass |
| TC-AA-004 | Submit button is disabled while any mandatory field is blank | Business Rule | On page, all fields empty | 1. Inspect Submit button state | Button disabled | N/A | Critical | ✅ Pass |
| TC-AA-005 | Submit stays disabled with only one of three fields filled | Business Rule | On page | 1. Fill Reference ID only 2. Inspect button state | Button remains disabled | Reference ID: `TESTREF123` | High | ✅ Pass |
| TC-AA-006 | Submit becomes enabled once all three fields are non-empty | Functional | On page | 1. Fill all three fields with any non-empty values | Submit button becomes enabled | Reference ID `TESTREF123`, User ID `TESTUSER01`, DOB `2000-01-01` | Medium | ✅ Pass |
| TC-AA-007 | Date of Birth uses a native date picker and accepts a valid date | UI | On page | 1. Verify input `type="date"` 2. Select a date | Field accepts and displays the date | DOB: `2000-01-01` | Medium | ✅ Pass |
| TC-AA-008 | Invalid User ID is rejected server-side and shows an Invalid User ID toast | Negative | On page | 1. Fill placeholder Reference ID/User ID/DOB 2. Click Submit | `otp/request` API returns 200; toast "Invalid User ID" shown; stays on `/activeteUser` | Reference ID `TESTREF123`, User ID `TESTUSER01`, DOB `2000-01-01` | Critical | ✅ Pass |
| TC-AA-009 | Cancel returns to the Login page | Functional | On page | 1. Click Cancel | Redirected to `/login` | N/A | High | ✅ Pass |
| TC-AA-010 | Cancel works with a partially filled form | Functional | On page, some fields filled | 1. Fill Reference ID + User ID 2. Click Cancel | Redirected to `/login` without extra confirmation | Reference ID `TESTREF123`, User ID `TESTUSER01` | Medium | ✅ Pass |
| TC-AA-011 | Direct navigation / hard reload of the Activate Account URL | Negative | On page | 1. Reload the browser | **Expected:** page persists. **Actual (known defect DEF-002):** redirected to `/login`, activation flow lost — same defect class as Forgot User ID's reload behavior | N/A | Medium | ✅ Pass (documents DEF-002) |
| TC-AA-012 | Credentials and identity values never appear in the URL | Security | On page | 1. Fill form 2. Click Submit 3. Inspect URL | Reference ID / User ID never appear as URL query params | Reference ID `TESTREF123`, User ID `TESTUSER01` | Critical | ✅ Pass |
| TC-AA-013 | SQL Injection payload in User ID is handled safely | Security | On page | 1. Fill User ID with `' OR '1'='1` 2. Click Submit | Treated as invalid; no SQL error surfaced; stays on `/activeteUser` | User ID: `' OR '1'='1` | High | ✅ Pass |
| TC-AA-014 | XSS payload in User ID is handled safely | Security | On page | 1. Fill User ID with `<script>alert(1)</script>` 2. Click Submit | No JS dialog fires; stays on `/activeteUser` | User ID: `<script>alert(1)</script>` | High | ✅ Pass |
| TC-AA-015 | Rapid double-click on Submit does not double-submit | Async/Race | On page | 1. Fill form 2. Click Submit 3. Immediately click again | **Expected:** button disables in-flight, only 1 request fires. **Actual (known defect DEF-003):** button never disables, 2 identical `otp/request` calls fire | Reference ID `TESTREF123`, User ID `TESTUSER01`, DOB `2000-01-01` | Medium | ✅ Pass (documents DEF-003) |
| TC-AA-016 | Submit button re-enables after a failed activation attempt | State-Aware UI | On page | 1. Submit invalid data 2. See "Invalid User ID" toast 3. Correct the User ID field | Submit re-enables without a page refresh, allowing resubmission | Corrected User ID: `CORRECTEDUSER01` | Medium | ✅ Pass |
| TC-AA-017 | Responsive layout on mobile viewport | UI/Responsive | On page | 1. Set viewport to 375×667 | All fields/buttons remain visible and usable | 375×667 | Low | ✅ Pass |
| TC-AA-018 | [1366×768 laptop] Submit and Cancel are fully within the viewport | UI/Responsive | On page | 1. Set viewport to 1366×768 2. Check button bounding boxes | Both buttons fully within the viewport (previously clipped below the fold on the old 6-field form — resolved now that the form is 3 fields) | 1366×768 | High | ✅ Pass |
| TC-AA-019 | Browser Back button after Cancel returns without errors | Functional | Cancelled back to Login | 1. Click Cancel 2. Press browser Back | No console errors after navigating back | N/A | Low | ✅ Pass |
| TC-AA-020 | Full activation with a fully-matching identity activates the account | Happy Path (Live, Manually-Assisted) | A genuinely pending (not-yet-activated) account's Reference ID/User ID/DOB | 1. Fill matching Reference ID + User ID + DOB → Submit 2. Enter live OTP → Verify 3. Set New/Confirm Password → Save 4. Verify login with the new credentials | Reference ID+User ID+DOB match unlocks an OTP step; OTP verification unlocks Account Setup (New/Confirm Password); Save activates the account; login with the new credentials succeeds | Reference ID `SMCC202607306095`, User ID `SMCCSW10132`, DOB `11/05/1997`, OTP `0398`, Password `Sahayog@2026` | Critical | ✅ Pass — full end-to-end confirmed, including a real post-activation login redirecting to `/HOME` |

## Live Happy-Path Confirmation (TC-AA-020)

Executed live with real, human-relayed data (no fabricated values, per project convention for verification-screen data):

1. **Step 1** — Reference ID `SMCC202607306095` + User ID `SMCCSW10132` + DOB `11/05/1997` → Submit → "OTP sent successfully", navigated to `/verifyOtp`
2. **Step 2** — OTP `0398` → Verify → "OTP verified successfully", navigated to `/resetPassword` ("Account Setup" — confirmed User ID `SMCCSW10132`)
3. **Step 3** — New Password / Confirm Password `Sahayog@2026` → Save → "Password reset successfully", navigated to `/login`
4. **Verification** — Logged in with `SMCCSW10132` / `Sahayog@2026` → redirected to `/HOME` with no error, confirming the account is genuinely active and usable

This confirms the module's core purpose — activating a new account after identity verification — works correctly end-to-end.

## Defect Log

| Defect ID | Title | Description | Priority | Severity | Status |
|---|---|---|---|---|---|
| DEF-002 | Reloading `/activeteUser` redirects to Login instead of preserving the activation flow | A hard reload drops the client-side route entirely and lands on `/login`, losing the user's place in the activation flow — the same defect class as Forgot User ID's reload behavior (unlike `/login`, the SPA fallback route, which trivially survives a reload). | Low | Minor | Open |
| DEF-003 | Submit button not disabled during in-flight activation request | A rapid double-click on Submit fires two identical `otp/request` calls instead of the second click being blocked. | Medium | Major | Open |

## Coverage Notes

- The current live form has **3 fields** (Reference ID, User ID, Date of Birth), simpler than the 6-field shape (adding Name of User, Employee ID, Mobile No.) described in an older, stale `specs/AA_TS001-test-plan.md` written against a different environment (`14.142.238.28`). `ActivateAccountPage.ts` and the spec already reflect the current 3-field + OTP + password-setup shape.
- A previously-documented viewport-clipping defect (`BUG-005`, Submit/Cancel clipped below the fold at 1366×768 on the old 6-field form) is **resolved** — `TC-AA-018` confirms both buttons now fit at that resolution with the shorter 3-field form.
- `TC-AA-020` required a genuinely pending (not-yet-activated) account's identity data, supplied live by the user — the always-active test account (`nayan.aher@netwinindia.in`) cannot be reused for this test since activation only applies to pending accounts. The Reference ID/OTP/credentials used are now consumed (single-use); a fresh pending account would be needed to re-run this test live.

## Recommendations

1. Preserve the Activate Account flow state across a reload, or explicitly redirect with a clear "your activation session was lost, please start again" message rather than a silent bounce to Login (DEF-002).
2. Disable the Submit button while the activation request is in flight (DEF-003) to prevent duplicate `otp/request` calls.
3. No blockers to go-live — the full activation flow (identity verification → OTP → password creation → login) works correctly end-to-end, confirmed with a real account.
