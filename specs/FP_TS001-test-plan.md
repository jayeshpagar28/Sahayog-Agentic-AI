# FP_TS001 — Forgot Password Test Plan

**Story:** `user-stories/11. Forgot_Password.md`
**Application URL:** https://sahyogagentweb.drutam.in:9634/forgetPassword
**Test User:** nayan.aher@netwinindia.in

## Pre-execution reconnaissance

Live-verified before writing automation (28-Jul-2026):

- Route is `/forgetPassword`. Step 1 has a single **User ID** field (`input[name="userId"]`, placeholder "User ID"), a "Send Reference ID" submit button (disabled while blank), and a Cancel button.
- Submitting a valid registered User ID (`nayan.aher@netwinindia.in`) succeeds ("Reference ID sent successfully") and reveals Step 2 **on the same URL** (no navigation) with exactly 3 fields: **User ID** (`input[name="userId"]`, pre-filled and disabled), **Reference ID** (`input[name="referenceId"]`), and **Date of Birth** (`input[name="dob"]`, native date picker), plus a Submit button.
- This is simpler than an older exploratory record on file, which showed 6 Step 2 fields (User ID, Reference ID, First Name of User, DOB, Employee ID, Mobile No.) — the flow has evidently been simplified since then to match the 3-field shape the story document itself describes.
- Whether a further step (e.g. an OTP step, as newly discovered in the sibling Forgot User ID flow) follows a successful Step 2 submission was not yet confirmed at plan-writing time — this is covered by the live happy-path test.
- The account's Reference ID quota is shared across Forgot Password and Forgot User ID (confirmed 28-Jul-2026 during Forgot User ID testing) and subject to a 24-hour rate limit — deterministic tests avoid triggering real Send Reference ID calls with a registered User ID wherever possible.

## Test Cases

| Test Case ID | Title | Test Type | Preconditions | Test Steps | Expected Result | Priority |
|---|---|---|---|---|---|---|
| TC-FP-001 | Forgot Password page loads with all UI components | Happy Path | Unauthenticated | Navigate via Login → "Forgot Password ?" | Logo, heading, User ID field, Send Reference ID button, Cancel button, footer all visible | Critical |
| TC-FP-002 | Page URL is correct after navigation | Happy Path | On page | Assert URL | `/forgetPassword` | High |
| TC-FP-003 | Send Reference ID button is disabled while User ID is blank | State-Aware UI | On page | Assert button state | Disabled | High |
| TC-FP-004 | Send Reference ID button enables once User ID has a value | State-Aware UI | On page | Enter any character | Enabled | High |
| TC-FP-005 | Whitespace-only User ID is treated as blank | Negative | On page | Enter "   " | Send Reference ID stays disabled (or is rejected server-side) | Medium |
| TC-FP-006 | Unregistered User ID shows an error and stays on Step 1 | Negative | On page | Submit a non-existent User ID | Error toast; Step 2 does not reveal; still on `/forgetPassword` | High |
| TC-FP-007 | Cancel from Step 1 returns to the Login page | Happy Path | On page | Click Cancel | Redirected to `/login` | Critical |
| TC-FP-008 | Credentials never appear in the URL | Security | On page | Submit a User ID | URL never contains the User ID string | High |
| TC-FP-009 | SQL Injection payload in User ID is handled safely | Security | On page | Submit `' OR '1'='1'` | No error dialog; stays on `/forgetPassword`; Step 2 not revealed | High |
| TC-FP-010 | XSS payload in User ID is handled safely | Security | On page | Submit `<script>alert(1)</script>` | No JS dialog fires; stays on `/forgetPassword` | High |
| TC-FP-011 | Responsive layout on mobile viewport | Responsive | On page | Resize to 375×667 | Page remains usable, all elements visible | Medium |
| TC-FP-012 | Browser Back button after Cancel returns without errors | Negative | Cancel clicked | Press Back | No console errors | Medium |
| TC-FP-020 | Full recovery with correct Reference ID and DOB unlocks password reset | Happy Path (Live, Manually-Assisted) | Registered User ID | Send Reference ID (fresh); enter live Reference ID + confirmed DOB; Submit | Password reset step unlocks (exact next-step UI confirmed live, not assumed) | High |

`TC-FP-020` uses the same file-signal handoff pattern established for `FUI_TS001`'s `TC-FUI-020` (`.fp-refid-input.txt` in the project root), since a human has to relay the real SMS-delivered Reference ID.

## Save Location
This document: `specs/FP_TS001-test-plan.md`
Automation: `tests/FP_TS001/forgot-password.spec.ts`
POM: `tests/pages/auth/ForgotPasswordPage.ts` (new)
