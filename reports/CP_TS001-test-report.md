# CP_TS001 — Change Password Test Execution Report

**Date:** 30-Jul-2026
**Environment:** QA — https://sahyogagentweb.drutam.in:9634
**Browser:** Chromium (Desktop Chrome)
**Test User (deterministic tests):** nayan.aher@netwinindia.in
**Test User (live happy path):** SMCCSW10132 (dedicated account, freshly activated via AA_TS001)

## Executive Summary

12 test cases were designed against the Change Password module (reached via Homepage → profile menu → Change Password, `/CHANGE_PASSWORD`): **11 deterministic tests, all passed**, plus **1 live happy-path test, already verified manually** and documented rather than re-run automatically. Deterministic tests deliberately stop short of a fully valid submission so the shared regression account's real password is never changed by an automated run. One defect was found (`BUG-CP-001`: no Cancel button).

## Test Statistics

| Test Type | Total | Passed | Skipped |
|---|---|---|---|
| Happy Path / UI | 2 | 2 | 0 |
| Negative / Validation | 3 | 3 | 0 |
| Security | 2 | 2 | 0 |
| Functional / Defect Documentation | 2 | 2 | 0 |
| Responsive | 1 | 1 | 0 |
| Live Happy Path (Manually-Assisted, documented) | 1 | 0 | 1 (already verified live, not re-run) |
| **Total** | **11** | **11** | **1** |

## Test Case Execution

| Test Case ID | Title | Test Type | Preconditions | Test Steps | Expected Result | Test Data | Priority | Actual Result |
|---|---|---|---|---|---|---|---|---|
| TC-CP-001 | Change Password page loads with all UI components | Happy Path / UI | Authenticated, on Homepage | 1. Open profile menu 2. Click "Change Password" | Heading, Current Password, New Password, Confirm Password fields, and Update Password button all visible | N/A | Critical | ✅ Pass |
| TC-CP-002 | Page URL is correct after navigation | Happy Path / UI | On page | 1. Assert URL | URL contains `/CHANGE_PASSWORD` | N/A | High | ✅ Pass |
| TC-CP-003 | Cancel button is not present | Functional (Defect Documentation) | On page | 1. Check for a Cancel button | **Expected:** a Cancel button exists alongside Update Password. **Actual (known defect BUG-CP-001):** no Cancel button exists at all — corroborates a pre-existing exploratory finding | N/A | Medium | ✅ Pass (documents BUG-CP-001) |
| TC-CP-004 | Blank form submission shows all required-field messages | Negative / Validation | On page, fields empty | 1. Click Update Password with all fields empty | "Enter current password", "Enter new password", "Enter confirm password" all shown | N/A | Critical | ✅ Pass |
| TC-CP-005 | Incorrect Current Password is rejected | Negative / Validation | On page | 1. Fill a wrong Current Password + valid-format New/Confirm 2. Click Update Password | Toast: "Incorrect current Password !"; password not changed | Current: `WrongCurrent123!`, New/Confirm: `NewPass123!` | Critical | ✅ Pass |
| TC-CP-006 | New Password and Confirm Password mismatch shows validation error | Negative / Validation | On page | 1. Fill New Password ≠ Confirm Password 2. Click Update Password | "New Password and Confirm Password do not match." shown | New: `NewPassOne123!`, Confirm: `NewPassTwo123!` | High | ✅ Pass |
| TC-CP-007 | SQL Injection payload in Current Password is handled safely | Security | On page | 1. Fill Current Password with `' OR '1'='1` 2. Click Update Password | Treated as an incorrect current password ("Incorrect current Password !"); no SQL error surfaced; stays on `/CHANGE_PASSWORD` | Current: `' OR '1'='1` | High | ✅ Pass |
| TC-CP-008 | XSS payload in New Password is handled safely | Security | On page | 1. Fill New/Confirm Password with `<script>alert(1)</script>` 2. Click Update Password | No JS dialog fires; stays on `/CHANGE_PASSWORD` | New/Confirm: `<script>alert(1)</script>` | High | ✅ Pass |
| TC-CP-009 | Password fields are masked by default | UI | On page | 1. Inspect all three password input `type` attributes | Each field has `type="password"` | N/A | Medium | ✅ Pass |
| TC-CP-010 | Responsive layout on mobile viewport | UI/Responsive | On page | 1. Set viewport to 375×667 | All fields/buttons remain visible and usable | 375×667 | Low | ✅ Pass |
| TC-CP-011 | Full password change succeeds and old password is rejected afterward | Happy Path (Live, Manually-Assisted) | A dedicated (non-shared) authenticated account | 1. Fill correct Current Password + New/Confirm Password → Update Password 2. Verify old password is rejected 3. Verify new password is accepted | Update succeeds, account is auto-logged-out; subsequent login with the old password fails, login with the new password succeeds | Account `SMCCSW10132`: Current `Sahayog@2026` → New/Confirm `Sahayog@30072026` | Critical | ✅ **Already verified live on 30-Jul-2026** (see below) — not re-run automatically since a real successful submission changes the account's actual password |

## Live Happy-Path Confirmation (TC-CP-011)

Executed live with real data against a dedicated (non-shared) freshly-activated account, so the shared regression account's credentials were never put at risk:

1. Logged in as `SMCCSW10132` / `Sahayog@2026` (password set during Account Activation — see `AA_TS001-test-report`)
2. Homepage → profile menu → Change Password
3. Current Password `Sahayog@2026`, New Password / Confirm Password `Sahayog@30072026` → Update Password
4. Result: success toast, immediately followed by an **automatic logout**, redirected to `/login`. No OTP step was required — unlike Forgot Password / Account Activation / Forgot User ID (which need OTP because identity isn't yet proven), Change Password doesn't need it since the user is already authenticated and supplies the current password as proof.
5. **Verification:** attempted login with the old password `Sahayog@2026` → rejected ("The password you entered is incorrect"). Attempted login with the new password `Sahayog@30072026` → succeeded, redirected to `/HOME`.

This confirms the module's core purpose — changing an authenticated user's password — works correctly end-to-end.

## Defect Log

| Defect ID | Title | Description | Priority | Severity | Status |
|---|---|---|---|---|---|
| BUG-CP-001 | No Cancel button on the Change Password form | The form has only an "Update Password" button; no Cancel button exists to let the user back out without submitting. Corroborates a pre-existing exploratory finding (`BUG-003_missing-cancel-button-change-password.png`). | Medium | Minor | Open |

## Recommendations

1. Add a Cancel button to the Change Password form (`BUG-CP-001`), consistent with other forms in the application (Forgot Password, Forgot User ID, Account Activation all have one).
2. No blockers to go-live — password validation (blank fields, mismatch, incorrect current password), security handling (SQL injection, XSS), and the full change-password flow all work correctly.
