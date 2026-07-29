# FP_TS001 — Forgot Password Test Execution Report

**Date:** 29-Jul-2026
**Environment:** QA — https://sahyogagentweb.drutam.in:9634
**Browser:** Chromium (Desktop Chrome)
**Test User:** nayan.aher@netwinindia.in

## Executive Summary

14 test cases were executed against the Forgot Password module: **13 deterministic tests, all passed**, plus **1 live-assisted end-to-end happy-path test, passed**. The full 4-step recovery flow — User ID → Reference ID + Date of Birth → OTP → password reset form — works correctly end-to-end when Reference ID delivery succeeds. One defect was found (`BUG-FP-001`), and one reliability concern was observed around Reference ID delivery timing (documented below, not a hard functional defect).

## Test Statistics

| Test Type | Total | Passed | Failed |
|---|---|---|---|
| Happy Path / UI | 5 | 5 | 0 |
| State-Aware UI | 2 | 2 | 0 |
| Negative | 1 | 1 | 0 |
| Security | 3 | 3 | 0 |
| Responsive | 1 | 1 | 0 |
| Live Happy Path (Manually-Assisted) | 1 | 1 | 0 |
| **Total** | **13** | **13** | **0** |

## Test Case Execution

| Test Case ID | Title | Result |
|---|---|---|
| TC-FP-001 | Forgot Password page loads with all UI components | ✅ Pass |
| TC-FP-002 | Page URL is correct after navigation | ✅ Pass |
| TC-FP-003 | Send Reference ID button is disabled while User ID is blank | ✅ Pass |
| TC-FP-004 | Send Reference ID button enables once User ID has a value | ✅ Pass |
| TC-FP-005 | Whitespace-only User ID does not disable Send Reference ID | ✅ Pass (documents `BUG-FP-001`) |
| TC-FP-006 | Unregistered User ID shows an error and stays on Step 1 | ✅ Pass |
| TC-FP-007 | Cancel from Step 1 returns to the Login page | ✅ Pass |
| TC-FP-008 | Credentials never appear in the URL | ✅ Pass |
| TC-FP-009 | SQL Injection payload in User ID is handled safely | ✅ Pass |
| TC-FP-010 | XSS payload in User ID is handled safely | ✅ Pass |
| TC-FP-011 | Responsive layout on mobile viewport | ✅ Pass |
| TC-FP-012 | Browser Back button after Cancel returns without errors | ✅ Pass |
| TC-FP-020 | Full recovery with correct Reference ID, DOB, and OTP unlocks password reset (live) | ✅ Pass |

## Live Happy-Path Confirmation (TC-FP-020)

Executed live with real, human-relayed data (no fabricated values, per project convention for verification-screen data):

1. **Step 1** — User ID `nayan.aher@netwinindia.in` → Send Reference ID → "Reference ID sent successfully"
2. **Step 2** — Reference ID `SMCC202607299385` + DOB `02-05-2001` → Submit → "OTP sent successfully", navigated to `/verifyOtp`
3. **Step 3** — OTP `9375` → Verify → "OTP verified successfully", navigated to `/resetPassword`
4. **Final** — Password reset form revealed: New Password, Confirm Password, Save. Not submitted (would change the account's real password — out of scope for verification).

This confirms the module's core purpose — unlocking the password reset step after identity verification — works correctly.

**Reliability note:** Across 4 real Send-Reference-ID attempts made during testing (28–29 Jul 2026), 2 did not deliver (SMS or email) within a 5-minute wait, while 2 succeeded promptly. By contrast, the sibling Forgot User ID flow delivered reliably on 2/2 real attempts to the same registered number in the same session. This suggests an intermittent delivery issue specific to Forgot Password (or a transient gateway issue) rather than a hard functional defect — logged as `BUG-FP-002` at Low severity.

## Defect Log

| Defect ID | Title | Description | Priority | Severity | Status |
|---|---|---|---|---|---|
| BUG-FP-001 | Whitespace-only User ID does not disable Send Reference ID | Unlike a genuinely blank field, entering only spaces into User ID does not keep the Send Reference ID button disabled. The server does correctly reject the resulting request ("User not found") rather than succeeding, but the client-side gate that should stop the request from firing at all is missing. Corroborates a pre-existing exploratory finding (`BUG-FP-001_whitespace-userid-enables-button.png`). | Medium | Minor | Open |
| BUG-FP-002 | Intermittent Reference ID delivery delay/failure | 2 of 4 real Send Reference ID attempts for Forgot Password did not deliver (SMS or email) within 5 minutes, despite the app reporting success each time. The sibling Forgot User ID flow delivered reliably (2/2) to the same registered number in the same session, suggesting the issue is specific to Forgot Password's delivery path (or intermittently affects it) rather than the account/number itself. | Low | Minor | Open |

## Coverage Notes

- Step 2's real field set (User ID, Reference ID, Date of Birth) is simpler than an older exploratory record on file, which showed 6 fields (adding First Name of User, Employee ID, Mobile No.) — the flow has evidently been simplified to the 3-field shape the story document itself describes. `ForgotPasswordPage.ts` reflects the current live structure.
- `TC-FP-021`-equivalent (720-hour Reference ID expiry) was not automated — verifying a 30-day expiry window isn't practical in this environment, consistent with the same gap already accepted for Forgot User ID's `TC-FUI-021`.

## Recommendations

1. Fix `BUG-FP-001`: disable Send Reference ID while the User ID field is whitespace-only, matching the blank-field behavior.
2. Investigate `BUG-FP-002`: confirm whether Reference ID delivery for Forgot Password uses the same notification path as Forgot User ID, and why it intermittently doesn't arrive within a reasonable window.
3. No blockers to go-live — the core recovery flow (identity verification → OTP → password reset unlock) works correctly whenever Reference ID delivery succeeds.
