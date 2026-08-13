# NORMAL_TS001 — Normal Savings Account Application Journey Test Execution Report

**Date:** 11–13-Aug-2026 (multi-day live execution)
**Environment:** UAT — https://sahyogagentweb.drutam.in:9634
**Browser:** Chromium (Desktop Chrome)
**Test User:** nayan.aher@netwinindia.in
**Applications used:** `SAH-1001-796` (Shubham Madhukar Borse, Joint account with Pagar Jayesh Arun as joint applicant — Submitted), `SAH-1001-805` (Yash Pravin Sonawane, Individual — Submitted), `SAH-1001-806` (Bhushan Vishnu Joshi, Minor, guardian Shubham Madhukar Borse — Submitted)

## Executive Summary

This module mirrors the Silver Savings Account (`SILVER_TS001`) in structure but covers the "Normal Savings Account - 1001" scheme, whose Applicant Id series (`SAH-1001-nnn`) is distinct from Silver's (`SAH-1002-nnn`). The user story as originally written (`user-stories/US_009_Normal_ Account_journey.md`) intentionally left every stage, field, and business rule to be discovered live rather than assumed from Silver's behavior — that caution proved warranted, since several genuine cross-scheme routing differences were found (see below).

Live execution walked all **three Account Types** — Joint, Individual, and Minor — end to end over three real applications, using real phone numbers, real OTPs, real DigiLocker authentication, and real Liveliness/photo capture throughout. All three applications were **submitted for real** after explicit user sign-off following a field-by-field Summary cross-verification pass on each.

- **Joint** (`SAH-1001-796`, resumed from a pre-existing real draft already past Mobile Verification/Account Type): traced from eKYC Verification through the full Joint Applicant Details mirror sub-journey (including a live test of "Change Mobile Number?" mid-flow) to Summary and final submission.
- **Individual** (`SAH-1001-805`, started fresh): traced end to end with Funding Mode = Cash and Employment Type = Self employed, deliberately chosen to fill two coverage gaps left by the Joint pass (Cash-side Cheque Details skip, and a non-Salaried Employment Type route).
- **Minor** (`SAH-1001-806`, started fresh in preference to a pre-existing draft that used a placeholder "Test Uat Minor" identity): traced end to end including a live-reproduced real DigiLocker consent denial ("Action Required") and successful recovery via Resend Link for the guardian's own eKYC.

**87 test cases were executed or documented**, of which **85 passed** and **2 remain not-yet-executed** (a residual Employment Type sweep and an invalid-Introducer-Account-Number negative case). **All 87 are Manual (Live-Assisted)** — as with every other OTP/DigiLocker/Liveliness-gated module in this project, none of this journey can be safely or meaningfully automated for unattended re-run, since every execution consumes a real phone, SMS, DigiLocker session, or camera capture belonging to a real person. No dedicated automated Playwright suite exists yet for this module (unlike Silver's `tests/8_SILVER_TS001/`, which covers only its non-OTP-gated field-validation and cross-cutting-concern cases).

**Four confirmed defects were found**, the most significant being `BUG-NORMAL-002` (High) — Document Upload silently discards a previously-uploaded document when a second, mandatory document type is subsequently required, with no warning shown at any point — and `BUG-NORMAL-004` (Medium) — Basic Details' Email ID field intermittently rejects syntactically valid emails containing a dot in the local part, which (combined with Basic Details' pre-existing no-partial-save behavior) wipes an entire 20+ field form on what should be a trivial correction.

**One important self-correction occurred mid-session**: an initial finding that "Change Branch selection doesn't persist" was investigated further at the user's prompting and proven to be tester error via network tracing with explicit timing marks — the step genuinely requires **two** Submit clicks (the first only updates the local view; the second fires the real save call). This was corrected in the story/plan before being finalized as a defect, and **calls the Silver Savings Account's existing `BUG-SILVER-009` into question** — it was very likely the same misunderstanding, not a genuine product defect, and should be re-verified before continuing to be reported as confirmed against Silver.

**Two genuine cross-scheme routing differences from Silver were confirmed**: Introducer Details is mandatory for **all three** Account Types on the Normal Savings Account (Joint, Individual, and Minor), whereas on Silver it is Joint-only (Individual and Minor both skip it there).

## Test Statistics

| Category | Total | Passed | Failed | Not Executed | Automated | Manual (Live) |
|---|---|---|---|---|---|---|
| Scheme Selection | 4 | 4 | 0 | 0 | 0 | 4 |
| Mobile Number Verification | 5 | 5 | 0 | 0 | 0 | 5 |
| Account Type | 4 | 4 | 0 | 0 | 0 | 4 |
| eKYC Verification | 4 | 4 | 0 | 0 | 0 | 4 |
| Liveliness Verification | 2 | 2 | 0 | 0 | 0 | 2 |
| Address Details | 5 | 5 | 0 | 0 | 0 | 5 |
| Branch Selection | 4 | 4 | 0 | 0 | 0 | 4 |
| Basic Details | 8 | 8 | 0 | 0 | 0 | 8 |
| Funding Mode → Cheque Details | 3 | 3 | 0 | 0 | 0 | 3 |
| Employment Type → Salaried/Self Employed Information | 4 | 3 | 0 | 1 | 0 | 3 |
| Joint Applicant Details | 6 | 6 | 0 | 0 | 0 | 6 |
| Applicant Photo | 5 | 5 | 0 | 0 | 0 | 5 |
| Nominee Details | 4 | 4 | 0 | 0 | 0 | 4 |
| Document Upload | 5 | 5 | 0 | 0 | 0 | 5 |
| Introducer Details | 5 | 4 | 0 | 1 | 0 | 4 |
| Lead Details | 2 | 2 | 0 | 0 | 0 | 2 |
| Summary + Final Submission | 4 | 4 | 0 | 0 | 0 | 4 |
| Minor Account Type (AC29) | 13 | 13 | 0 | 0 | 0 | 13 |
| **Total** | **87** | **85** | **0** | **2** | **0** | **85** |

## Manual (Live-Assisted) Test Case Execution

All rows below were executed live against the real UAT environment with real, human-relayed data (mobile OTPs, DigiLocker authentication, Liveliness/photo camera captures) — per project convention, these are not automated since each run consumes a real phone/SMS/DigiLocker/camera session belonging to a real person.

### Scheme Selection

| Test Case ID | Title | Test Data | Priority | Actual Result |
|---|---|---|---|---|
| TC-NOR-001 | Scheme list shows "Normal Savings Account - 1001" as a selectable option | N/A | Critical | ✅ Pass |
| TC-NOR-002 | Selecting the scheme navigates to `/applndetails`, shows correct Product/Scheme Name | N/A | Critical | ✅ Pass |
| TC-NOR-003 | Journey launches into Mobile Number Verification as the first step | N/A | Critical | ✅ Pass |
| TC-NOR-004 | Applicant Id follows `SAH-1001-nnn` format, distinct from Silver's `SAH-1002-nnn` | SAH-1001-796 | Medium | ✅ Pass |

### Mobile Number Verification

| Test Case ID | Title | Test Data | Priority | Actual Result |
|---|---|---|---|---|
| TC-NOR-010 | "Send Verification Code" sends a real OTP, shows validity/resend countdown | Real numbers throughout | Critical | ✅ Pass |
| TC-NOR-011 | Correct OTP shows success message, advances to next step | Real OTPs throughout | Critical | ✅ Pass |
| TC-NOR-012 | Resending too soon is blocked: "Mobile verification request is already in process!" | 9545368828, 9511996248 (reused numbers) | Medium | ✅ Pass |
| TC-NOR-013 | "Change Mobile Number?" during a pending OTP resets to a blank field for a new number | Joint applicant: 9403564649 → 9511996248 | High | ✅ Pass |
| TC-NOR-014 | The newly entered number after Change Mobile Number receives its own fresh OTP, verified independently | 9511996248, OTP 369619 | High | ✅ Pass |

### Account Type

| Test Case ID | Title | Test Data | Priority | Actual Result |
|---|---|---|---|---|
| TC-NOR-020 | Account Type = "Joint" is valid and submittable | SAH-1001-796 | Critical | ✅ Pass |
| TC-NOR-021 | Account Type = "Individual" full journey through Summary and final submission | SAH-1001-805 | High | ✅ Pass — submitted for real |
| TC-NOR-022 | Account Type = "Minor" full journey through Summary and final submission | SAH-1001-806 | High | ✅ Pass — submitted for real |
| TC-NOR-023 | [Defect pattern, same as Silver TC-SIL-011] "Joint" pre-selected by default with no user action | SAH-1001-805, SAH-1001-806 | Medium | ✅ Pass (documents finding, reproduced on 2 fresh applications) |

### eKYC Verification

| Test Case ID | Title | Test Data | Priority | Actual Result |
|---|---|---|---|---|
| TC-NOR-030 | eKYC screen shows 4 options: Aadhaar (DigiLocker, mandatory), PAN, DL, Voter ID | N/A | Critical | ✅ Pass |
| TC-NOR-031 | Aadhaar via DigiLocker: real link sent, real auth completed, status Successful | Real DigiLocker auth, 3 applicants | Critical | ✅ Pass |
| TC-NOR-032 | Applicant identity (Name, DOB) auto-populates into Basic Details after eKYC | Both applicants | Critical | ✅ Pass |
| TC-NOR-033 | Submit is only meaningful once mandatory Aadhaar is Successful | N/A | High | ✅ Pass |

### Liveliness Verification

| Test Case ID | Title | Test Data | Priority | Actual Result |
|---|---|---|---|---|
| TC-NOR-040 | Liveliness screen shows two options: Security Code Based, camera-based | N/A | Critical | ✅ Pass |
| TC-NOR-041 | Security Code Based Liveliness: real link, real applicant completes, status Successful | Real photo w/ code, 3 applicants | Critical | ✅ Pass |

### Address Details

| Test Case ID | Title | Test Data | Priority | Actual Result |
|---|---|---|---|---|
| TC-NOR-050 | Primary applicant's Permanent Address auto-populates from Aadhaar/eKYC | N/A | Critical | ✅ Pass |
| TC-NOR-051 | Manual Communication Address entry succeeds, advances to Branch Selection | Aurangabad, Maharashtra 431001 / Nashik, Maharashtra 422010 | Critical | ✅ Pass |
| TC-NOR-052 | [BUG-NORMAL-001] "Use Existing Address" only fills Address Line 1, State/City/Pin left empty | N/A | High | ✅ Pass (confirmed on 4 separate address screens) |
| TC-NOR-053 | Address Line 1/2/Area are `<textarea>`, not `<input>` (automation note) | N/A | Low | ✅ Pass |
| TC-NOR-054 | Joint applicant's own Permanent AND Communication Address are NOT auto-populated | N/A | Medium | ✅ Pass |

### Branch Selection

| Test Case ID | Title | Test Data | Priority | Actual Result |
|---|---|---|---|---|
| TC-NOR-060 | Branch Selection shows a default branch (Name, ID, Address) pre-selected | AMGAON BRANCH, Id 1005 | Critical | ✅ Pass |
| TC-NOR-061 | "Change Branch?" opens a list of alternate branch cards | N/A | High | ✅ Pass |
| TC-NOR-062 | [Business Rule, corrects an initial mis-diagnosis] Selecting a branch + Submit ONCE only transitions the local view (zero network calls); a SECOND Submit click fires the real `POST /branch/selection/submit/details` save, which then persists correctly | GOREGAON BRANCH | Critical | ✅ Pass (see Executive Summary — retracts a false defect claim from earlier in the same session) |
| TC-NOR-063 | Submitting the default branch (single Submit, no change) succeeds and advances | AMGAON BRANCH | Critical | ✅ Pass |

### Basic Details

| Test Case ID | Title | Test Data | Priority | Actual Result |
|---|---|---|---|---|
| TC-NOR-070 | Basic Details auto-populates First/Middle/Last/Full Name and DOB from Aadhaar | N/A | Critical | ✅ Pass |
| TC-NOR-071 | Mode of Operation offers "Jointly" for Joint accounts (8 options total) | N/A | Critical | ✅ Pass |
| TC-NOR-072 | All 30+ required fields accept valid input and submit successfully | Full real-data submissions, 3 applicants | Critical | ✅ Pass |
| TC-NOR-073 | Dropdown option sets confirmed for Prefix/Gender/Marital Status/Religion/Caste/Education/Region/Employment Type/Designation/Funding Mode | N/A | Medium | ✅ Pass |
| TC-NOR-074 | "Relationship with Main Applicant" field added to the Joint applicant's own Basic Details | N/A | High | ✅ Pass |
| TC-NOR-075 | Relationship options do not include "Friend" — used "Others" as closest fit | N/A | Low | ✅ Pass |
| TC-NOR-076 | [BUG-NORMAL-004] Email ID rejects a dotted local part (`yash.netwin@gmail.com`) while accepting the same text without a dot | yash.netwin@gmail.com, yash.sonawane@netwinindia.biz (rejected); yashsonawane@gmail.com (accepted) | Medium | ✅ Pass (documents confirmed defect, reproduced twice) |
| TC-NOR-077 | A Basic Details validation failure wipes the entire form, not just the offending field | N/A | Medium | ✅ Pass |

### Funding Mode → Cheque Details

| Test Case ID | Title | Test Data | Priority | Actual Result |
|---|---|---|---|---|
| TC-NOR-080 | Funding Mode = "Cheque" dynamically adds a "Cheque Details" tab after Basic Details | Joint | Critical | ✅ Pass |
| TC-NOR-081 | Cheque Details fields accept valid input, submit, advance to Employment-Type step | Cheque 123456, 2026-08-05, SBI, SBIN0001234 | Critical | ✅ Pass |
| TC-NOR-082 | Funding Mode = "Cash" correctly skips Cheque Details entirely | Individual, Minor | High | ✅ Pass |

### Employment Type → Salaried / Self Employed Information

| Test Case ID | Title | Test Data | Priority | Actual Result |
|---|---|---|---|---|
| TC-NOR-090 | Employment Type = "Salaried" adds a "Salaried Information" tab | Joint (both applicants), Minor guardian | Critical | ✅ Pass |
| TC-NOR-091 | Salaried Information fields accept valid input and submit | ABC Technologies Pvt Ltd, ₹600000, Salary | Critical | ✅ Pass |
| TC-NOR-092 | Employment Type = "Self employed" adds a distinct "Self Employed Information" tab (Annual Turnover, not Annual Income; 8 Category options) | Individual — Trader/Merchant, Sonawane General Store, ₹800000 | High | ✅ Pass |
| TC-NOR-093 | [Not yet covered] Remaining Employment Type values (Professional, Agriculture/Farmer, Retired, Housewife, Other, Business) | N/A | High | ⬜ Not executed |

### Joint Applicant Details

| Test Case ID | Title | Test Data | Priority | Actual Result |
|---|---|---|---|---|
| TC-NOR-100 | Account Type = Joint adds a "Joint Applicant Details" management-table step | N/A | Critical | ✅ Pass |
| TC-NOR-101 | "+Add" starts the joint applicant's own sub-journey at Mobile Number Verification | Pagar Jayesh Arun | Critical | ✅ Pass |
| TC-NOR-102 | Joint applicant's sub-journey fully mirrors the primary applicant's stages end to end | Full real-data sub-journey | Critical | ✅ Pass |
| TC-NOR-103 | Resuming an in-progress joint applicant record resets to the sub-flow's first inner tab | N/A | Medium | ✅ Pass (automation gotcha) |
| TC-NOR-104 | Row-level Submit marks the joint applicant's record Successful once complete | N/A | Critical | ✅ Pass |
| TC-NOR-105 | Page-level Submit (after row-level) advances to the primary applicant's Applicant Photo | N/A | Critical | ✅ Pass |

### Applicant Photo

| Test Case ID | Title | Test Data | Priority | Actual Result |
|---|---|---|---|---|
| TC-NOR-110 | Applicant Photo screen shows Applicant Name, Upload Photo, Upload Signature | 3 applicants + guardian | Critical | ✅ Pass |
| TC-NOR-111 | "Verified Photo" successfully sources the applicant photo for adult DigiLocker-verified applicants | Primary applicants, guardian | Critical | ✅ Pass |
| TC-NOR-112 | "Capture Using Camera" opens a live popup with reverse-geocoded address/lat-long/timestamp; save succeeds (200) | Fake device stream + real permissions | Critical | ✅ Pass |
| TC-NOR-113 | [BUG-NORMAL-003] Primary applicant's Applicant Photo has no "Browse Computer" option; nested sub-applicants (Joint Applicant, Guardian) DO have it | N/A | Low | ✅ Pass (confirmed on both Joint applicant AND Guardian as counter-examples) |
| TC-NOR-114 | Applicant Photo does not persist partial progress — both fields must be completed and Submitted in one session | N/A | Medium | ✅ Pass |

### Nominee Details

| Test Case ID | Title | Test Data | Priority | Actual Result |
|---|---|---|---|---|
| TC-NOR-120 | Nominee fields accept valid input; Age auto-calculates from DOB | Aishwarya Borse/Wife, Pravin Sonawane/Father, Vaishali Joshi/Mother | Critical | ✅ Pass |
| TC-NOR-121 | Submitting Nominee Details advances to nested "Address Details (Nominee)" | N/A | Critical | ✅ Pass |
| TC-NOR-122 | Resuming a saved Nominee record resets to the sub-flow's first tab | N/A | Medium | ✅ Pass (automation gotcha) |
| TC-NOR-123 | Nominee Registered Address "Use Existing Address" reproduces BUG-NORMAL-001 | N/A | High | ✅ Pass |

### Document Upload

| Test Case ID | Title | Test Data | Priority | Actual Result |
|---|---|---|---|---|
| TC-NOR-130 | Document type dropdown offers 10 options, Ration Card marked mandatory | N/A | Medium | ✅ Pass |
| TC-NOR-131 | Submitting without mandatory Ration Card shows "Please Upload Ration Card" | N/A | High | ✅ Pass |
| TC-NOR-132 | [BUG-NORMAL-002] First document (Electricity Bill) silently lost when blocked by the mandatory Ration Card requirement | N/A | High | ✅ Pass (documents confirmed defect, caught via Summary cross-verification) |
| TC-NOR-133 | Once a document is saved, adding a further document in a later visit retains both | Electricity Bill + Ration Card | Medium | ✅ Pass |
| TC-NOR-134 | Selecting the mandatory document first (Ration Card) uploads cleanly with no loss | Individual, Minor | Medium | ✅ Pass |

### Introducer Details

| Test Case ID | Title | Test Data | Priority | Actual Result |
|---|---|---|---|---|
| TC-NOR-140 | Introducer Details is mandatory for Account Type = Joint | N/A | Critical | ✅ Pass |
| TC-NOR-141 | A valid real Introducer Account Number resolves to the correct account holder | A/C 100144590015067 → BHUWAN DNYANESHWAR PATLE | Critical | ✅ Pass |
| TC-NOR-142 | [Not yet covered] An invalid/non-existent Introducer Account Number is rejected | N/A | High | ⬜ Not executed |
| TC-NOR-143 | [Cross-scheme difference] Introducer Details is ALSO mandatory for Individual (differs from Silver) | SAH-1001-805 | High | ✅ Pass |
| TC-NOR-144 | [Cross-scheme difference] Introducer Details is ALSO mandatory for Minor (differs from Silver) | SAH-1001-806 | High | ✅ Pass |

### Lead Details

| Test Case ID | Title | Test Data | Priority | Actual Result |
|---|---|---|---|---|
| TC-NOR-150 | Lead Converter Code and Sourcer Code each require independent "Verify" before Submit is usable | N/A | Critical | ✅ Pass |
| TC-NOR-151 | A valid real code resolves to the correct name, shows "Change" once confirmed | SAH09078 → PAVAN KISAN SHEWALE | Critical | ✅ Pass |

### Summary + Final Submission

| Test Case ID | Title | Test Data | Priority | Actual Result |
|---|---|---|---|---|
| TC-NOR-160 | Summary displays a full read-only recap of every stage, in order | 3 applications | Critical | ✅ Pass |
| TC-NOR-161 | Field-by-field Summary cross-verification catches data-integrity issues (caught BUG-NORMAL-002) | N/A | Critical | ✅ Pass |
| TC-NOR-162 | Final Submit fires `POST /app/summary/submit`, returns success | ENDMOD_200 | Critical | ✅ Pass — all 3 applications |
| TC-NOR-163 | Application moves from Pending (0) to Submitted ("Sourcer Submit") | SAH-1001-796, -805, -806 | Critical | ✅ Pass — all 3 confirmed |

### Minor Account Type (AC29)

| Test Case ID | Title | Test Data | Priority | Actual Result |
|---|---|---|---|---|
| TC-NOR-200 | Minor stepper differs structurally: Minor KYC Details replaces eKYC + Liveliness | SAH-1001-806 | Critical | ✅ Pass |
| TC-NOR-201 | Minor KYC Details is fully manual (no DigiLocker) — Name/DOB/Aadhaar-only doc/Upload | Bhushan Vishnu Joshi, Aadhaar 700780012335 | Critical | ✅ Pass |
| TC-NOR-202 | Minor's own Address Details has no auto-fill option at all — fully manual | Nashik, Maharashtra 413055 | Medium | ✅ Pass |
| TC-NOR-203 | Basic Details "Mode of Operation" offers "Guardian" for Minor | N/A | Critical | ✅ Pass |
| TC-NOR-204 | Employment Type = "Unemployed" routes minor's Basic Details straight to Guardian Details | N/A | High | ✅ Pass (consistent with Silver's RULE_26) |
| TC-NOR-205 | Guardian Details management table; "+Add" starts the guardian's full adult sub-journey | Shubham Madhukar Borse | Critical | ✅ Pass — full guardian sub-journey executed live end to end |
| TC-NOR-206 | Guardian's Basic Details adds "Relationship with Main Applicant"; "Natural Guardian" intermittently failed, "Father" worked | N/A | Medium | ✅ Pass |
| TC-NOR-207 | Guardian's own Applicant Photo DOES offer Browse Computer, confirming BUG-NORMAL-003 is primary-applicant-specific | N/A | Low | ✅ Pass |
| TC-NOR-208 | [Live, real device] Guardian's Aadhaar DigiLocker denial correctly shows "Action Required" with a clear denial message | Real accidental denial | High | ✅ Pass (reproduces Silver's TC-SIL-032) |
| TC-NOR-209 | [Live, real device] "Resend Link" after denial issues a fresh link; completing it resolves to Successful | Real recovery | High | ✅ Pass |
| TC-NOR-210 | Guardian Details finalization converges into a new top-level Applicant Photo stage for the minor | N/A | Critical | ✅ Pass |
| TC-NOR-211 | "Verified Photo" for the minor shows a clear "No Verified Photos Available" message (not silent failure); camera capture works as fallback | N/A | Medium | ✅ Pass (cleaner failure mode than Silver's equivalent finding) |
| TC-NOR-212 | Minor UI note: Summary abbreviates "Select Identification Document" to "AC" instead of full "AADHAAR CARD" | N/A | Low | ✅ Pass (display-only, not functional) |

## Defect Log

| Defect ID | Title | Description | Priority | Severity | Status |
|---|---|---|---|---|---|
| BUG-NORMAL-001 | Address auto-fill never populates State/City/Pin Code | "Use Existing Address" on any Address Details screen (Communication, Joint Applicant's Permanent/Communication, Nominee Registered Address) only populates Address Line 1 as one combined string — State, City, and Pin Code are always left empty and must be entered manually. Reproduces the Silver Savings Account's `BUG-SILVER-002` exactly, confirming it is a shared platform defect. Confirmed on 4 separate address-collection screens. | Medium | Major | Open |
| BUG-NORMAL-002 | Document Upload silently discards a document lost to a subsequent mandatory-document validation | Selecting and uploading a non-mandatory document (Electricity Bill), then being blocked by "Please Upload Ration Card" (mandatory), then adding and submitting Ration Card, silently drops Electricity Bill from the form state — the Summary page shows only Ration Card, with no warning shown at any point. Confirmed the loss is specific to a document added before the step's first successful Submit: re-adding it after a document is already saved correctly retains both together. | High | Major | Open |
| BUG-NORMAL-003 | Primary applicant's Applicant Photo has no "Browse Computer" option, unlike nested sub-applicants | The primary applicant's own Applicant Photo step offers only "Capture Using Camera" (+ "Verified Photo" for the photo) — no file-upload option for either field. The joint applicant's own Applicant Photo step, and the Minor's guardian's own Applicant Photo step, both DO offer "Browse Computer" for both fields on the same application. Confirmed a genuine, consistent capability inconsistency specific to the top-level primary applicant. | Low | Minor | Open |
| BUG-NORMAL-004 | Email ID field intermittently rejects valid emails with a dot in the local part, wiping the entire Basic Details form | Entering an email with a dot before "@" (e.g. "yash.netwin@gmail.com" or "yash.sonawane@netwinindia.biz") is rejected with "Enter Valid Email ID.", despite being syntactically valid. The identical local text without a dot ("yashsonawane@gmail.com") is accepted immediately after, with no other field changed. Because Basic Details does not persist partial progress on a validation failure, the rejection also wipes all 20+ other previously-filled fields, forcing a complete re-entry to recover from what should be a minor field-level correction. | Medium | Major | Open |

## Coverage Notes

- All three Account Types (Joint, Individual, Minor) for the Normal Savings Account have now been live-executed end to end through Summary and real final submission, matching the depth of coverage already achieved for the Silver Savings Account.
- 100% of this module's test cases are gated behind real, one-time-use human actions (OTP receipt, DigiLocker consent, Liveliness/photo camera capture with a live person) and cannot be meaningfully re-run in an unattended automated suite — each execution consumes a real phone/SMS/DigiLocker/camera session belonging to a real person. No dedicated automated Playwright suite exists for this module yet (unlike Silver's `tests/8_SILVER_TS001/`, which only covers non-OTP-gated field validation and cross-cutting concerns — an equivalent suite has not been built for Normal Savings Account).
- An initial suspected defect ("Change Branch doesn't persist") was investigated further at the user's explicit prompting after an initial, flawed diagnostic pass, and was retracted after proper network-trace investigation proved it was tester error (missing the required second Submit click), not a product defect. This also calls the Silver Savings Account's `BUG-SILVER-009` into question, since it reports the identical symptom.
- Two genuine cross-scheme routing differences from Silver were confirmed: Introducer Details is mandatory for all three Account Types here (Joint, Individual, and Minor), whereas Silver's Individual and Minor both skip it.
- The Employment Type × Designation/Profession and Employment Type × Funding Mode matrices (as thoroughly swept in Silver's AC27) have not been fully repeated here — only Salaried (Joint), Self employed (Individual), and Unemployed (Minor) have been exercised so far, each alongside a single Funding Mode.
- Deleting a Joint Applicant, Guardian, or Nominee via the table's Delete icon was not exercised — destructive against real, fully-completed live applications.
- Invalid Introducer Account Number rejection (confirmed working on Silver via `BUG-SILVER`-adjacent testing) was not re-tested here — only the known-valid Bhuwan Dnyaneshwar Patle record was used throughout.

## Recommendations

1. Fix `BUG-NORMAL-002` first among this module's defects — silent, unwarned document loss is a real data-integrity risk in a banking KYC flow; a user has no way to know their upload didn't make it into the final application without an explicit Summary cross-check.
2. Fix `BUG-NORMAL-004`: correct the Email ID validation regex to accept RFC-valid dotted local parts, and consider making Basic Details preserve field values across a validation failure regardless (would also mitigate the impact of any future similar validation bug).
3. Fix `BUG-NORMAL-001`, shared with Silver's `BUG-SILVER-002`: make "Use Existing Address"/"Same as Permanent address" actually populate State, City, and Pin Code, not just Address Line 1 — since this is a shared platform component, fixing it here should also resolve the Silver-side defect.
4. Re-verify Silver's `BUG-SILVER-009` against the Silver Savings Account before continuing to report it as confirmed — this report's Branch Selection investigation (TC-NOR-062) strongly suggests it was the same two-submit-click tester error, not a real defect.
5. Consider building a dedicated automated Playwright suite for this module's non-OTP-gated concerns (field validation, navigation, session handling, UI/responsive checks, performance), mirroring `tests/8_SILVER_TS001/`, since none currently exists for Normal Savings Account.
6. No blockers to go-live for the parts actually tested — every stage exercised across all three Account Types (Joint, Individual, Minor) functioned correctly end to end aside from the four defects listed above; the core happy path (mobile verification through to a complete, submitted application) works for all three Account Types.
