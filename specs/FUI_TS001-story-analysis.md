# User Story Analysis — FUI_TS001 (SAHAYOG Web Portal — Forgot User ID Module)

## 1. Story Identity
- **Story ID:** FUI_TS001
- **Title:** Forgot User ID — Account Recovery Entry Point
- **Module:** Forgot User ID (`user-stories/10. Forgot_UserID.md`)
- **Business Objective:** Let a registered user recover their User ID via their registered Email ID, without disclosing sensitive account data on-screen, and log all recovery attempts.

## 2. Application Context
- **URL:** `http://14.142.238.28:8989/radheAgentWeb/forgetUser` (reached via "Forgot User ID ?" link on the login page, `http://14.142.238.28:8989/radheAgentWeb/login`)
- **Known registered credential (from Login module):** `nayan.aher@netwinindia.in`
- **Confirmed via recon:** app title "Drutam Origination"; branding "SAHAYOG Multistate Credit Co-operative Society".

## 3. Entities and Operations
| Entity | Create | Read | Update | Delete |
|---|---|---|---|---|
| Recovery Request | Created on "Send Reference ID" submit | — | — | — |
| Reference ID | Generated server-side, emailed to user | Re-entered by user in step 2 to verify identity | — | — |
| User Identity (Name, DOB, Employee ID, Mobile No.) | — | Read from user input in step 2, matched server-side | — | — |

## 4. State Transitions (as observed live — differs from story, see §Gaps)
1. **Step 1 — Email entry** → `Send Reference ID` button disabled until the Email Id field is non-empty
2. **Validating format** → inline error `Enter a valid email id` if format invalid; no API call fires (confirmed via network capture)
3. **Submitting (registered email)** → `Send Reference ID` API call in flight (~5s observed) → success toast `Reference ID sent successfully`
4. **Step 2 — Identity verification** → page **transforms in place** (same URL, no navigation) to reveal five additional fields: Reference ID, Name of User, Date of Birth, Employee ID, Mobile No., plus a `Submit` button. Email Id field becomes disabled/read-only, pre-filled.
5. **Step 2 validation** → clicking `Submit` blank shows inline "X is required" per field (client-side, no API call)
6. **Step 2 submit (wrong data)** → API call fires → error toast `Reference ID mismatch`
7. **Step 2 submit (correct data)** → *not verified — requires the real Reference ID delivered to the live inbox, which this run has no access to. See Coverage Matrix "Blocked" items.*
8. **Unregistered email (Step 1)** → error toast `User not found`; stays on step 1
9. **Cancel** → returns to `/radheAgentWeb/login`

## 5. Business Rules (from story §10, verified against live app)
| Rule | Description | Recon Verification |
|---|---|---|
| FUI_BR_001 | Only registered users can recover their User ID | ✅ Unregistered email → "User not found" |
| FUI_BR_002 | Email ID is mandatory | ✅ Send button stays disabled while blank |
| FUI_BR_003 | Email format must comply with standard syntax | ✅ Invalid format → inline "Enter a valid email id", blocked client-side before any API call |
| FUI_BR_004 | Recovery email sent only to the registered Email ID | ✅ Implied by success flow; not independently verifiable without inbox access |
| FUI_BR_005 | System shall not disclose whether other user information exists | ⚠️ **Partially violated** — "User not found" explicitly confirms the email is *not* registered, which is itself a disclosure. See Defect DEF-002. |
| FUI_BR_006 | Recovery requests shall be logged | Not independently verifiable via UI/API observation in this pass |
| FUI_BR_007 | Sensitive information never displayed on-screen | ✅ No Reference ID or token value observed rendered in the DOM/URL |
| FUI_BR_008 | Multiple rapid requests may be restricted | ✅ Confirmed live — after repeated Reference ID requests during this test run, the app returned "Maximum reference ID requests exceeded. Please try again after 24 hours." (per-email request-frequency limit) |
| FUI_BR_009 | Redirect to Login after cancellation | ✅ Confirmed — Cancel returns to `/radheAgentWeb/login` |
| FUI_BR_010 | Recovery requests follow configured auth policy | N/A to observe directly |
| FUI_BR_011 | A generated Reference ID is valid for 720 hours (30 days) from creation; expired Reference IDs are rejected (added to the story per stakeholder clarification during this run — format example: `SAHA071620265083`) | Not independently verifiable end-to-end without waiting 720 hours or obtaining an already-expired Reference ID; documented for future regression coverage — see TC-FUI-021 |

## 6. Third-Party / External Integrations
- **Email Service** — sends the Reference ID email; not independently verifiable without inbox access (flagged as a scope limitation, consistent with the Login module's Forgot Password note)
- **User Management Service** — validates the Email ID and, in step 2, the identity fields (Reference ID, Name, DOB, Employee ID, Mobile No.)

## 7. Acceptance Criteria (derived from Functional Workflow §8 + Field Validation §13 + live recon)
| AC Ref | Criterion | Type |
|---|---|---|
| AC-01 | Forgot User ID page is reachable from Login via "Forgot User ID ?" | Functional |
| AC-02 | Page displays SAHAYOG branding, "Recover Your User ID" heading, instruction text, illustration, Powered By Netwin footer | UI |
| AC-03 | Email Id field is visible with a mandatory (`*`) indicator | UI |
| AC-04 | `Send Reference ID` button is disabled while the Email Id field is empty | Business Rule |
| AC-05 | Invalid email format is rejected client-side with an inline message before any API call | Business Rule |
| AC-06 | Unregistered Email ID submission shows an error and does not proceed to step 2 | Negative |
| AC-07 | Registered Email ID submission shows a success toast and reveals the step-2 identity-verification form | Happy Path |
| AC-08 | Step 2 exposes Reference ID, Name of User, Date of Birth, Employee ID, Mobile No. fields, each individually required | UI / Business Rule |
| AC-09 | Step 2 blank submission shows per-field "required" messages without an API call | Negative |
| AC-10 | Step 2 submission with an incorrect Reference ID/identity combination shows a "Reference ID mismatch" error | Negative |
| AC-11 | `Cancel` returns the user to the Login page from step 1 | Functional |
| AC-12 | Whitespace-only Email Id is treated as blank (button stays disabled) | Business Rule |
| AC-13 | No credentials/Reference ID values appear in the URL at any step | Security |
| AC-14 | Layout is responsive across viewport sizes | Responsive |

## 8. Gaps Between Story Document and Live Application
1. **Undocumented second step.** `user-stories/10. Forgot_UserID.md` describes a single-field, single-submit flow ending in a success message. The live app requires a **second identity-verification step** (Reference ID + Name + DOB + Employee ID + Mobile No.) before the actual User ID is presumably disclosed. None of this step's fields, validations, or success behavior are documented in the story. This is the most material scope gap found in this pass.
2. **Message text variance.** Story specifies exact strings `"Email ID is not registered."` and `"Enter valid Email ID."` / `"Email ID is required."`. Live app instead shows `"User not found"` (toast) and `"Enter a valid email id"` (inline); no message at all is shown for the blank case (button is disabled instead of allowing a blank submit).
3. **Final happy-path outcome unverified.** Because completing step 2 requires the real Reference ID delivered by email (no inbox access in this environment), the true end state of a successful recovery (does it display the User ID on-screen? Redirect to Login with a message? Something else?) could not be exercised. Flagged as **Blocked** in the coverage matrix, not Pass or Fail.

---
*Note: the story reference in `prompts/loginprompt.md` points to a placeholder path (`user-stories/EC-AUTH-LOGIN-001.md`) unrelated to this module; the actual story used is `user-stories/10. Forgot_UserID.md`, and `FUI_TS001` (module ID `FUI` from the story's own header) is used as the Story ID throughout this run, following the same convention as `LP_TS001` for the Login module.*
