# User Story Analysis — AA_TS001 (SAHAYOG Web Portal — Activate Account Module)

## 1. Story Identity
- **Story ID:** AA_TS001
- **Title:** Activate Account — Identity Verification & Account Activation
- **Module:** Activate Account (`user-stories/12. Activate_Account.md`)
- **Business Objective:** Let a newly registered but inactive user prove ownership of their account (via Reference ID + User ID + Name + DOB + Employee ID + Mobile No.), then flip their account from Inactive to Active so they can log in — while rejecting anyone who cannot prove a matching identity, and auditing every attempt.

## 2. Application Context
- **URL:** `http://14.142.238.28:8989/radheAgentWeb/activeteUser` (reached via "Activate Account" link on the login page, `http://14.142.238.28:8989/radheAgentWeb/login`). Note the route itself contains a typo — `activeteUser`, not `activateUser`.
- **Confirmed via recon:** app title "Drutam Origination"; page heading "Activate Your Account"; sub-heading "Please enter the below details."
- **Test data supplied for this run (positive/happy path):** User ID `SAHAN10001`, Reference ID `SAHA072220266054`, Name `Jayesh Pagar`, DOB `28-12-2000`, Employee ID `201`, Mobile `9511996248`.

## 3. Entities and Operations
| Entity | Create | Read | Update | Delete |
|---|---|---|---|---|
| Activation Request | Created on "Submit" click | — | — | — |
| Reference ID | Issued during registration (external to this module) | Re-entered by user to prove identity | — | — |
| User Account | — | Looked up by User ID/Reference ID server-side | Status flips Inactive → Active on success | — |
| User Identity (Name, DOB, Employee ID, Mobile No.) | — | Read from user input, matched server-side against registration record | — | — |

## 4. State Transitions (as observed live)
1. **Login page** → click "Activate Account" → client-side route change to `/radheAgentWeb/activeteUser` (no full page load)
2. **Activate Account page loads** → all 6 fields empty, `Submit` disabled, `Cancel` enabled
3. **Partial fill** → `Submit` stays disabled until *all six* mandatory fields are non-empty (no per-field inline "required" message is shown — see §8 Gaps)
4. **All fields filled** → `Submit` becomes enabled
5. **Submit (fires `POST .../common/otp/request` with `processType: USER_ACTIVATION`)**:
   - **Field-level mismatch** (e.g. Name doesn't match record) → inline error under that field, e.g. "Value does not match with records"; account remains inactive; user stays on page
   - **Invalid User ID / Reference ID** → server returns `msgCode 404 "Invalid User ID"`; the UI surfaces this as a toast, `Error: Invalid User ID` (confirmed via automated network+DOM assertion in TC-AA-011 — an earlier manual observation of "no toast" during recon was a timing artifact: the toast auto-dismisses quickly and had already cleared before the manual screenshot was taken)
   - **All fields match** → *not verified end-to-end in this run — see §8 Gaps and Coverage Matrix*
6. **Cancel** → returns to `/radheAgentWeb/login`
7. **Direct navigation / hard reload of `/radheAgentWeb/activeteUser`** → redirected to `/radheAgentWeb/login` instead of staying on the Activate Account page (see Defect BUG-002)

## 5. Business Rules (from story §13, verified against live app)
| Rule | Description | Recon Verification |
|---|---|---|
| AA_BR_002 | All mandatory fields must be completed before activation | ✅ `Submit` stays disabled until all 6 fields are non-empty |
| AA_BR_004 | Reference ID shall be associated with the entered User ID | Not independently falsifiable without a second valid Reference ID/User ID pair |
| AA_BR_006 | Full Name shall match the registered user information | ✅ Confirmed live — supplied happy-path name `Jayesh Pagar` returned `"Value does not match with records"` for Reference ID `SAHA072220266054` / User ID `SAHAN10001` (see Defect BUG-001) |
| AA_BR_007 / AA_BR_008 / AA_BR_009 | DOB / Employee ID / Mobile must match registered record | ✅ Confirmed live — these three fields did **not** appear in the `fieldErrors` array for the same submission that flagged the name, i.e. DOB `28-12-2000`, Employee ID `201`, Mobile `9511996248` were accepted as matching |
| AA_BR_010 | Activation shall occur only after all validation checks succeed | ✅ Consistent with observed behavior — activation is blocked while any field mismatches |
| AA_BR_011 | Activated accounts cannot be activated again | Not independently verifiable without an already-active test account |
| AA_BR_013 | Unauthorized activation attempts shall be rejected | ✅ Invalid User ID was rejected server-side (though the rejection is not surfaced to the user — see BUG-003) |
| AA_BR_014 | Sensitive user information shall never be displayed in validation messages | ✅ The mismatch message ("Value does not match with records") does not echo the actual registered value |

## 6. Third-Party / External Integrations
- **User Management Service** (`http://14.142.238.29:8081/radheUserManagementAPI/...`) — validates all six fields and, on success, is expected to trigger the account status change. The activation submit itself is routed through `common/otp/request` with `processType: USER_ACTIVATION`, suggesting activation is OTP-gated after field validation passes (an undocumented step — see §8 Gaps).
- **Additional-verification-fields / communication-mode endpoints** — loaded on page mount to drive field metadata (labels, required flags, date format, case-sensitivity per field). Confirmed via network capture; no PII returned by these endpoints.

## 7. Acceptance Criteria (derived from Functional Workflow §8 + Field Validation §16 + live recon)
| AC Ref | Criterion | Type |
|---|---|---|
| AC-01 | Activate Account page is reachable from Login via "Activate Account" link | Functional |
| AC-02 | Page displays Bank/SAHAYOG logo, "Activate Your Account" heading, instruction sub-heading, Powered By Netwin footer | UI |
| AC-03 | All six fields (Reference ID, User ID, Name of User, Date of Birth, Employee ID, Mobile No.) are visible with mandatory (`*`) indicators | UI |
| AC-04 | `Submit` button is disabled while any mandatory field is empty | Business Rule |
| AC-05 | `Submit` button becomes enabled once all six fields are non-empty | Functional |
| AC-06 | Mobile No. field accepts numeric input only, non-digits are stripped client-side | Business Rule |
| AC-07 | Date of Birth uses a native date picker and stores/submits the selected date | UI |
| AC-08 | Submitting with a Name that does not match the registered record shows an inline field-level error and does not activate the account | Negative |
| AC-09 | Submitting with an invalid/non-existent User ID is rejected server-side | Negative |
| AC-10 | `Cancel` returns the user to the Login page | Functional |
| AC-11 | No credentials/Reference ID/DOB values appear in the URL at any step | Security |
| AC-12 | Successful activation (all fields matching) activates the account and surfaces a success confirmation | Happy Path |

## 8. Gaps Between Story Document and Live Application
1. **Mandatory-field messages are implicit, not explicit.** The story (§7 Validation Controls, §14 AA_VR_001–006) specifies dedicated "X Required" messages per field. The live app instead only disables the `Submit` button while any field is blank — no inline "Reference ID Required" / "User ID Required" etc. text was observed for any field, even after filling then clearing a field and blurring it.
2. **"Invalid User ID" is correctly surfaced as a toast.** Confirmed via automated test (TC-AA-011): submitting a non-existent User ID shows `Error: Invalid User ID` as a dismissible toast, matching the story's Validation Controls requirement. (An earlier manual-recon note claiming this was silent has been retracted — it was a timing artifact of the toast auto-dismissing between the click and the follow-up screenshot; the automated assertion, which checks immediately, confirms the toast is present.)
3. **Activation appears to be routed through an OTP endpoint** (`common/otp/request`, `processType: USER_ACTIVATION`), which is not mentioned anywhere in the story. Whether a follow-up OTP-entry step exists after all six fields validate successfully could not be confirmed in this run because the supplied happy-path data failed on the Name field before reaching that point.
4. **True happy-path end state unverified.** Because the supplied test data mismatches on Name of User (Defect BUG-001), the actual "Activation Successful" confirmation UI, the account-status change, and any post-activation redirect to Login could not be exercised or screenshotted this run. Flagged as **Blocked** in the Coverage Matrix, not Pass or Fail.
5. **Initial responsive coverage was insufficient.** The first automation pass only exercised a single mobile viewport (375×667) and passed, because Playwright's `toBeVisible()` does not detect an element clipped by an ancestor's `overflow:hidden` below the fold — it only checks that the element itself renders. A user-reported repro at 1815×862 (see BUG-005) exposed the gap; the suite now checks real bounding-box coordinates against the viewport across a Desktop/Laptop/Tablet/Mobile matrix per story §17.5, not just Playwright's generic visibility check.
6. **API status-code convention.** Both the Name-mismatch and Invalid-User-ID responses came back as HTTP 200 with `resultVO.isError: true` in the body, rather than a 4xx status — the same non-RESTful pattern previously found in the Forgot User ID module (BUG-003 there).

## 9. Defects Found During Analysis (see full detail in the Test Report / Defect Tracker)
- **BUG-001 (Critical/Blocker):** Supplied happy-path test data (Reference ID `SAHA072220266054`, User ID `SAHAN10001`, Name `Jayesh Pagar`) fails activation — server reports `"Value does not match with records"` for Name of User, meaning the account does **not** activate in one go as expected. This blocks true happy-path (AC-12) verification.
- **BUG-002 (Major):** Hard reload / direct navigation to `/radheAgentWeb/activeteUser` redirects to `/radheAgentWeb/login` instead of staying on the Activate Account page — loses in-progress form entry, same defect class found in the Forgot User ID module.
- **BUG-003 (Major):** The `Submit` button is never disabled while an activation request is in flight — rapidly double-clicking it fires two separate `otp/request` (`processType: USER_ACTIVATION`) calls instead of one, confirmed via automated network capture (TC-AA-018). Risks duplicate audit entries and duplicate downstream processing for a single user action.
- **BUG-004 (Minor, API convention):** Activation validation responses (both the Name-mismatch and Invalid-User-ID cases) use HTTP 200 with `isError:true` in the body instead of a proper 4xx status code.
- **BUG-005 (Critical):** At desktop/laptop viewport widths ≥ ~1201px (the two-column split-panel layout breakpoint) combined with a viewport height below ~950–1000px, the form's containing panel is `overflow-y: hidden` with no scrollbar and the outer document does not scroll either — so the bottom of the form is permanently clipped and unreachable. Confirmed broken (Cancel unreachable, page not scrollable) at **1815×862** (as reported), **1366×768** (the single most common laptop resolution worldwide — where even the **Submit** button itself is also clipped), and **1440×900**. Confirmed fine at 1920×1080 (tall enough) and at ≤1199px width (layout drops the split panel and the document becomes normally scrollable instead). This is a hard usability blocker on very common hardware, not an edge case — a meaningful share of real users on standard laptop screens may be unable to submit or cancel the Activate Account form at all. Root cause: `section.ad-middle-section.login-page-wraper.bg-01` has `overflow-y: hidden` while its content height exceeds the viewport at this breakpoint.

**Retracted finding:** an earlier manual-recon pass believed "Invalid User ID" produced no visible error at all. Automated verification (TC-AA-011) disproved this — a toast (`Error: Invalid User ID`) does appear; the manual pass simply screenshotted after it had already auto-dismissed. Not logged as a defect.

---
*Note: `prompts/loginprompt.md` references a placeholder path (`user-stories/EC-AUTH-LOGIN-001.md`); per this run's instructions the actual story used is `user-stories/12. Activate_Account.md`, and `AA_TS001` (the module's own test-case-traceability prefix, §10 of the story) is used as the Story ID throughout, following the `LP_TS001` / `FUI_TS001` convention from prior modules.*
