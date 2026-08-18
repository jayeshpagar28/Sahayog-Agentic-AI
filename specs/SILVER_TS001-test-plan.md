# SILVER_TS001 — Test Plan: Silver Savings Account Application Journey

**Story:** `user-stories/US_008_Silver_Saving_Account_ Journey.md` (Story ID: US_008, extended live to AC26+ during execution)
**Module:** Savings Account → Silver Savings Account → full application journey (Mobile Verification through final Summary/Submission)
**Route under test:** `/applndetails` (reached via Home → Savings Application card → New Application → Scheme Selection → select a scheme)
**Priority:** High
**Environment:** https://sahyogagentweb.drutam.in:9634 (UAT)
**Credentials:** `nayan.aher@netwinindia.in` / `Sahayog@2025`

---

## 1. User Story Summary

**Feature overview:** After selecting a scheme, a registered user completes a savings account application through a long, multi-stage stepper. The story as originally written covers only the first four stages (Mobile Verification → Account Type → eKYC → Liveliness) plus Application Submission (AC16) and cross-cutting concerns (AC17–AC20). Live execution against the real UAT environment discovered the actual journey is **far deeper** — 16 total stages ending in a full Summary/Review screen — and for an Account Type of "Joint", the entire journey is duplicated for a second (joint) applicant. All of this was appended live to the story file as AC21 onward and is reflected in the test cases below.

**Real stage order confirmed via live execution (SAH-1002-798, Account Type Joint):**
1. Mobile Number Verification
2. Account Type
3. eKYC Verification (Aadhaar via DigiLocker [mandatory] / PAN / Driving Licence / Voter ID)
4. Liveliness Verification (Security Code Based / camera-based — at least one required)
5. Address Details (Permanent [auto, read-only] + Communication)
6. Branch Selection
7. Basic Details (30+ fields)
8. Salaried Information (Employment-Type-conditional)
9. Joint Applicant Details (full mirror of stages 1–8 for the second applicant, only if Account Type = Joint)
10. Applicant Photo (Photo + Signature, per applicant)
11. Nominee Details
12. Nominee Address Details
13. Document Upload (optional)
14. Introducer Details
15. Lead Details (Lead Converter Code + Sourcer Code, each independently "Verify"-able)
16. Summary (full read-only review of every field entered, ending in the final Submit)

**Entity + CRUD matrix**

| Entity | Create | Read | Update | Delete |
|---|---|---|---|---|
| Savings Application (multi-stage) | ✅ Full journey (this module) | ✅ Summary page; per-stage re-entry via View | Partial — most fields editable only during initial entry; Permanent Address is read-only post-eKYC | Out of scope (no delete action found) |
| Joint Applicant | ✅ Added via "+ Add" in Joint Applicant Details table | ✅ Table (Full Name/Customer ID/Status), row-click resumes sub-flow | N/A observed | ✅ Delete icon present in table (not exercised — destructive) |
| Nominee | ✅ Added via Nominee Details table | ✅ Table (Full Name/Status) | N/A observed | ✅ Delete icon present in table (not exercised — destructive) |

**Business rules extracted (confirmed via live execution)**

- BR1: eKYC — Aadhaar via DigiLocker is mandatory; PAN/DL/Voter ID are supplementary. Each follows a two-sub-step confirm pattern (document/number entry → auto-filled name/DOB confirm) and only shows "Successful" on the overall list once **both** sub-steps are submitted.
- BR2: Liveliness — the two options (Security Code Based, camera-based) are alternatives; only one needs to reach "Successful" (confirmed via "Please complete at least one process" validation).
- BR3: Mode of Operation (Basic Details) must be compatible with the application's Account Type — "Self" is rejected for a Joint account ("Select an appropriate Mode of Operation based on the Account Type"); "Jointly" is accepted.
- BR4: Salaried Information only appears when Employment Type = "Salaried" (Employment-Type-conditional sub-step).
- BR5: Joint Applicant Details only appears when Account Type = "Joint"; it fully mirrors the primary applicant's own stages 1–8, with two differences: a "Relationship with Main Applicant" field (not on the primary applicant's form) and no Mode of Operation/Funding fields.
- BR6: Document Upload (the generic "Select Applicant Document" step) is optional — submitting with nothing selected succeeds.
- BR7: Introducer Account Number and Driving Licence Number are both validated against real backend records (reject non-existent values with a clear message) — unlike the eKYC document uploads, which accept any correctly-typed file regardless of content (BUG-SILVER-001).
- BR8: Lead Converter Code and Sourcer Code are independently verified via their own "Verify" action before the step's Submit is usable; both can resolve to the same real code/person.
- BR9: Every popup-style sub-step (PAN, DL, Voter ID, Communication/Registered Address, Applicant Photo, etc.) visually resets to its initial state when re-entered via its tab, even though data is saved server-side — resubmitting (unchanged or freshly filled) correctly advances to the next sub-step.
- BR10: Funding Mode = "Cheque" dynamically inserts an extra "Cheque Details" step (own stepper tab: Cheque Number, Cheque Date, Drawee Bank Name, Drawee Branch IFSC Code) immediately after Basic Details; Funding Mode = "Cash" skips it entirely. Both modes converge into the identical Employment-Type-conditional step afterward — Funding Mode has no other effect on the flow. Confirmed via live traversal of all 9 Employment Type × 2 Funding Mode combinations (AC27).

**Third-party integrations:** DigiLocker (Aadhaar eKYC), device camera (Liveliness, Signature capture, "Capture Using Camera" document uploads), device geolocation (camera-capture popups display reverse-geocoded address).

**Acceptance criteria (tagged) — original + live-discovered**

| AC | Type | Summary |
|---|---|---|
| AC1–AC2 | Functional | Navigation into the journey; header shows Applicant Name/ID/Product/Scheme |
| AC3 | Functional/UI | Stepper displays all stages sequentially, highlights active, marks completed, prevents skipping |
| AC4–AC5 | Functional | Mobile Number Verification + OTP Verification, full field/negative/business-rule coverage |
| AC6 | Functional/UI | Account Type selection (Joint/Individual/Minor), single-select, highlighted, ticked |
| AC7–AC12 | Functional | eKYC Verification (Aadhaar DigiLocker mandatory, PAN, DL, Voter ID), completion |
| AC13–AC15 | Functional | Liveliness Verification (Security Code + camera), at-least-one business rule |
| AC16 | Functional | Application Submission (final Summary → Submit) |
| AC17 | Functional | Previous/Next navigation, data retention, cannot bypass validations/skip stages |
| AC18 | Functional/Security | Session validation — refresh retains progress, timeout, duplicate-submission prevention |
| AC19 | UI | Header/stepper/card/badge/button alignment, responsive layout, no overlap |
| AC20 | Non-Functional | Load/response-time expectations across the journey |
| AC21 | Functional | Address Details (Permanent read-only + Communication, "Use Existing"/"Same as" auto-fill) |
| AC22 | Functional | Branch Selection (default branch, search, change, scroll) |
| AC23 | Functional | Basic Details (30+ fields incl. Mode of Operation business rule) + Salaried Information |
| AC24 | Functional | Nominee Details + Nominee Address |
| AC25 | Functional | Document Upload (optional) |
| AC26 | Functional | Introducer Details + Lead Details (Lead Converter/Sourcer Code verification) |
| AC27 | Functional/Business Rule | Funding Mode / Employment Type conditional navigation after Basic Details, reconciled against the `aoscust_module_rules_setting.xlsx` rule engine |
| AC28 | Functional/Business Rule | Individual Account Type's full journey confirmed live end to end — skips Joint Applicant Details and Introducer Details entirely, both mandatory for Joint |
| AC29 | Functional/Business Rule | Minor Account Type's full journey confirmed live end to end through Summary — distinct early-stage KYC (Minor KYC Details), Guardian Details full sub-journey, converges to the common path afterward |

---

## 2. Test Cases

### Mobile Number Verification (AC4–AC5) — fully automatable, no live OTP consumed for negative cases

| ID | Title | Type | AC | Priority | Automation |
|---|---|---|---|---|---|
| TC-SIL-001 | Mobile Number Verification screen loads with Mobile Number field, country code +91, and no page errors | Happy Path | AC4 | Critical | Automated |
| TC-SIL-002 | "Send Verification Code" button is not shown/enabled until at least one digit is entered | State-Aware UI | AC4 | High | Automated |
| TC-SIL-003 | Submitting a structurally incomplete (9-digit) mobile number is rejected with "Mobile Number is invalid" and no OTP is sent | Negative | AC4 | Critical | Automated |
| TC-SIL-004 | Submitting a blank mobile number does not reveal the Send Verification Code button | Negative/Validation | AC4 | Medium | Automated |
| TC-SIL-005 | Submitting alphabetic characters into the Mobile Number field is rejected or ignored (numeric-only input) | Negative/Validation | AC4 | Medium | Automated |
| TC-SIL-006 | A structurally invalid mobile number submission produces no page error (console/pageerror) | Negative | AC4 | High | Automated |
| TC-SIL-020 | [Live/Manually-Assisted] Valid real mobile number → Send Verification Code → real OTP entered → "Mobile OTP Verification done successfully!" | Happy Path (Live) | AC4, AC5 | Critical | Manual (executed 2026-08-03/04, real data) |
| TC-SIL-021 | [Live/Manually-Assisted] Submitting the same mobile number already verified on this application for a second (joint) applicant is rejected: "Same Mobile number has been already verified for same request !" (MOB_VERIF_ALREADY_EXIST) | Negative/Business Rule | AC4 | High | Manual (executed 2026-08-04, real data) — safe to also automate against a completed application's known-used number |

### Account Type Selection (AC6) — fully automatable

| ID | Title | Type | AC | Priority | Automation |
|---|---|---|---|---|---|
| TC-SIL-010 | Account Type screen displays Joint, Individual, and Minor cards after Mobile Verification | Happy Path | AC6 | Critical | Manual (requires completed Mobile Verification — see coverage notes) |
| TC-SIL-011 | [Defect] Joint is pre-selected/highlighted by default without any user action | UI/Negative | AC6 | Medium | Manual (documents finding from 2026-08-03 execution) |
| TC-SIL-012 | Selecting Individual highlights it, deselects Joint, shows a tick mark | Happy Path | AC6 | High | Manual |
| TC-SIL-013 | Submitting Account Type shows "Details saved successfully!" and proceeds to eKYC Verification | Happy Path | AC6 | Critical | Manual (executed live 2026-08-03) |

### eKYC Verification (AC7–AC12) — requires a live-verified mobile number to reach; documented from live execution

| ID | Title | Type | AC | Priority | Automation |
|---|---|---|---|---|---|
| TC-SIL-030 | eKYC Verification screen shows 4 options: Aadhaar (DigiLocker, marked mandatory *), PAN, Driving Licence, Voter ID | Happy Path | AC7 | Critical | Manual |
| TC-SIL-031 | [Live] Aadhaar via DigiLocker: Send Link → real customer completes DigiLocker auth → status Pending → Successful | Happy Path (Live) | AC8 | Critical | Manual (executed 2026-08-03/04, real data, ~3 min turnaround) |
| TC-SIL-032 | [Live, AC8.9] Customer denies DigiLocker document-access permission → status shows "Action Required" (a third distinct status beyond Pending/Successful), Resend Link available, retry succeeds | Negative (Live) | AC8.9 | High | Manual (executed 2026-08-04, real denial then real retry) |
| TC-SIL-033 | PAN Verification requires PAN Number AND a supporting document (both mandatory) — a two-sub-step flow (document confirm → name/DOB confirm) | Happy Path | AC9 | Critical | Manual |
| TC-SIL-034 | [Defect BUG-SILVER-001] PAN document upload accepts any correctly-typed (.png/.jpg/.pdf) file regardless of content — an unrelated screenshot was accepted as a valid PAN document | Negative/Security (Live) | AC9 | High | Manual (documents confirmed defect) |
| TC-SIL-035 | Driving Licence Verification: an incorrect (real-format) DL number + DOB combination is rejected with "Driving Licence verification failed" — genuine backend check | Negative | AC10 | High | Manual (executed live, confirmed real validation) |
| TC-SIL-036 | Driving Licence Verification: a correct DL number + DOB succeeds and reaches "Successful" after both sub-steps submitted | Happy Path | AC10 | Critical | Manual |
| TC-SIL-037 | Voter ID Verification succeeds on first attempt with a valid real Voter ID number | Happy Path | AC11 | Critical | Manual |
| TC-SIL-038 | eKYC overall Submit is only meaningful once Aadhaar (mandatory) is Successful; other methods (PAN/DL/Voter ID) are supplementary | Business Rule | AC7, AC12 | High | Manual |

### Liveliness Verification (AC13–AC15)

| ID | Title | Type | AC | Priority | Automation |
|---|---|---|---|---|---|
| TC-SIL-050 | Liveliness Verification screen shows two options: Security Code Based, and camera-based Liveliness Verification | Happy Path | AC13 | Critical | Manual |
| TC-SIL-051 | Attempting overall Submit while both Liveliness options are Pending shows "Please complete at least one process" | Negative/Business Rule | AC13 | High | Manual (confirmed live) |
| TC-SIL-052 | [Live] Security Code Based Liveliness: Send Link → real applicant follows instructions (write code on paper, photograph self holding it) → status Successful | Happy Path (Live) | AC14 | Critical | Manual (executed live, both applications) |
| TC-SIL-053 | [CONFIRMED DEFECT, HIGH SEVERITY, BUG-SILVER-004] Security Code Based Liveliness returns "Successful" even when a DIFFERENT person (not the applicant) holds the security code in front of the camera — no identity/face match against Aadhaar is performed | Negative/Security (Live) | AC14 | Critical | Manual — confirmed twice, on two different real applications |
| TC-SIL-054 | [Live] Camera-based Liveliness Verification: Send Link → real applicant completes → status Successful | Happy Path (Live) | AC15 | Critical | Manual (executed live) |
| TC-SIL-055 | Security Code Liveliness link delivery is unreliable — observed link expiry without arrival across multiple real attempts spanning both sessions/applications, with limited resend attempts | Reliability (Live) | AC14 | Medium | Manual (documented finding, not a hard functional defect) |

### Address Details (AC21)

| ID | Title | Type | AC | Priority | Automation |
|---|---|---|---|---|---|
| TC-SIL-060 | Primary applicant's Permanent Address is auto-populated read-only from Aadhaar/eKYC data | Happy Path | AC21.2 | Critical | Manual |
| TC-SIL-061 | [CONFIRMED DEFECT BUG-SILVER-002] "Same as Permanent address" / "Use Existing Address" only populates Address Line 1 (whole address as one string) — State, City, Pin Code remain empty, blocking submission with required-field errors | Negative (Live) | AC21.5 | High | Manual — confirmed on 3 separate address-collection screens (primary Communication, joint Permanent, joint Communication) |
| TC-SIL-062 | Manual Communication Address entry (Address Line 1, State, City, Pin Code, document) succeeds and advances to Branch Selection | Happy Path | AC21.6–AC21.10 | Critical | Manual |
| TC-SIL-063 | Joint applicant's own Permanent Address is NOT auto-populated read-only (unlike the primary applicant) — must be added manually via the same "Click Here For Add Address" pattern | Negative/UI (Live) | AC21 | Medium | Manual (documents a real inconsistency, not necessarily a defect) |

### Branch Selection (AC22)

| ID | Title | Type | AC | Priority | Automation |
|---|---|---|---|---|---|
| TC-SIL-070 | Branch Selection shows a default branch (Name, ID, Address) pre-selected | Happy Path | AC22.2 | Critical | Manual |
| TC-SIL-071 | "Change Branch?" opens a searchable, scrollable branch list with a different card highlighted as default within the list | Happy Path | AC22.3–AC22.6 | High | Manual |
| TC-SIL-072 | Submitting the default branch (without using Change Branch) succeeds and advances to Basic Details | Happy Path | AC22.8 | Critical | Manual |

### Basic Details + Salaried Information (AC23)

| ID | Title | Type | AC | Priority | Automation |
|---|---|---|---|---|---|
| TC-SIL-080 | Basic Details form has 30+ fields; Name and Date of Birth are auto-populated read-only from Aadhaar/eKYC, all others blank | Happy Path | AC23 | Critical | Manual |
| TC-SIL-081 | Mode of Operation "Self" is rejected for a Joint-Account-Type application with an inline validation message; "Jointly" is accepted | Negative/Business Rule (Live) | AC23, BR3 | High | Manual (confirmed live) |
| TC-SIL-082 | [CONFIRMED DEFECT BUG-SILVER-003] "Spouse / Father's Name" field silently truncates input at 20 characters with no warning, confirmed via the field's actual stored value and reflected in the final Summary | Negative (Live) | AC23 | High | Manual — confirmed via DOM value and Summary review |
| TC-SIL-083 | [Minor defect] Region dropdown option "Metropolitian City" and Mode of Operation option "Any Two Jointhly" both contain typos | UI | AC23 | Low | Manual |
| TC-SIL-084 | Submitting Basic Details with Employment Type "Salaried" reveals a Salaried Information sub-step (Category, Organization's Name, Annual Income, Source of Income) | Happy Path/Business Rule | AC23, BR4 | High | Manual |
| TC-SIL-085 | Joint applicant's Basic Details includes "Relationship with Main Applicant" (not on primary applicant's form) and omits Mode of Operation/Funding fields | UI (Live) | AC23, BR5 | Medium | Manual |

### Joint Applicant Details (BR5)

| ID | Title | Type | AC | Priority | Automation |
|---|---|---|---|---|---|
| TC-SIL-090 | Joint Applicant Details is a management table (+Add, Full Name/Customer ID/Status/Delete/Action) — appears only for Account Type Joint | Happy Path | AC23 | Critical | Manual |
| TC-SIL-091 | Row-level "Submit" (Action column) before the joint applicant's own eKYC is complete shows "Please complete eKYC Verification step!" and does not navigate | Negative | AC23 | High | Manual (confirmed live) |
| TC-SIL-092 | Clicking the table row resumes the joint applicant's own sub-stepper (Mobile → eKYC → Liveliness → Address → Basic Details → Salaried Info → Applicant Photo), mirroring the primary applicant's full journey | Happy Path (Live) | AC23 | Critical | Manual — full mirror journey executed live end-to-end |
| TC-SIL-093 | Once every joint-applicant sub-step is complete, the table row Status changes Pending → Successful and Action changes from "Submit" to "-" | Happy Path | AC23 | High | Manual (confirmed live) |

### Applicant Photo (per applicant)

| ID | Title | Type | AC | Priority | Automation |
|---|---|---|---|---|---|
| TC-SIL-100 | Applicant Photo requires Photo (Browse/Camera or "Verified Photo" reuse from Aadhaar/Liveliness) and Signature (upload/capture) | Happy Path | — | Critical | Manual |
| TC-SIL-101 | "Verified Photo" opens a "Select Verified Photo" popup listing available sources (Aadhaar Verification Photo, Liveliness Verification Photo); auto-selects when only one is available | Happy Path | — | High | Manual |
| TC-SIL-102 | [UI DEFECT] When camera permission is granted, the Photo upload area shows "Capture Using Camera" twice instead of "Browse Computer... OR Capture Using Camera" | UI | AC19 | Medium | Manual |
| TC-SIL-103 | [CONFIRMED DEFECT, extends BUG-SILVER-001] Signature capture accepts a fake test-pattern camera image with no content validation | Negative/Security (Live) | — | High | Manual |

### Nominee Details + Nominee Address + Document Upload (AC24–AC25)

| ID | Title | Type | AC | Priority | Automation |
|---|---|---|---|---|---|
| TC-SIL-110 | Nominee Details is its own management table (+Add, Full Name/Status/Delete/Action), same resume pattern as Joint Applicant Details | Happy Path | AC24 | Critical | Manual |
| TC-SIL-111 | Nominee Details requires Full Name, Relation (dropdown), Date of Birth (Age auto-shown) | Happy Path | AC24 | Critical | Manual |
| TC-SIL-112 | Nominee's own Registered Address requires the same "Click Here For Add Address" / "Use Existing Address" flow (subject to BUG-SILVER-002) | Happy Path | AC24 | High | Manual |
| TC-SIL-113 | Document Upload ("Select Applicant Document") is optional — submitting with nothing selected succeeds | Business Rule | AC25, BR6 | Medium | Manual (confirmed live) |

### Introducer Details + Lead Details (AC26)

| ID | Title | Type | AC | Priority | Automation |
|---|---|---|---|---|---|
| TC-SIL-120 | Introducer Details requires Name, Account Number, Period of Acquaintance | Happy Path | AC26 | Critical | Manual |
| TC-SIL-121 | A non-existent Introducer Account Number is rejected with a genuine backend message: "The account does not exist." | Negative | AC26, BR7 | High | Manual (confirmed with 3 different invalid numbers) |
| TC-SIL-122 | A valid, existing Introducer Account Number succeeds and advances to Lead Details | Happy Path | AC26 | Critical | Manual (confirmed with real account) |
| TC-SIL-123 | Lead Details (Lead Converter Code, Sourcer Code) requires both fields; submitting blank shows "Lead Converter Code is required" / "Sourcer Code is required" | Negative | AC26 | High | Manual (confirmed live) |
| TC-SIL-124 | Each code has its own "Verify" action returning a real matched name before the step's Submit is used | Happy Path | AC26, BR8 | Critical | Manual (confirmed live, real code) |

### Funding Mode / Employment Type Conditional Navigation (AC27) — live-explored 2026-08-07 against SAH-1002-775 (Individual)

Reconciled against the authoritative rule engine (`aoscust_module_rules_setting.xlsx`): RULE_22 (Cheque → Cheque Details), RULE_23 (Salaried → Salaried Information), RULE_24 (Self employed/Retired/Housewife/Farmer/Professional → Self Employed Information), RULE_25 (else + Joint → Joint Information), RULE_26 (else + Minor → Guardian Information), Default (else → Applicant Photo).

| ID | Title | Type | AC | Priority | Automation |
|---|---|---|---|---|---|
| TC-SIL-200 | Funding Mode = Cheque dynamically inserts a "Cheque Details" stepper tab (Cheque Number, Cheque Date, Drawee Bank Name, Drawee Branch IFSC Code) immediately after Basic Details; Funding Mode = Cash skips it entirely | Happy Path/Business Rule | AC27, BR10 | High | Manual (confirmed live, all 9 Employment Types × Cheque) |
| TC-SIL-201 | Submitting Cheque Details ("Details saved successfully!") converges into the identical Employment-Type-conditional step that Cash reaches directly — no further divergence between Funding Modes | Happy Path/Business Rule | AC27, BR10 | High | Manual (confirmed live) |
| TC-SIL-202 | Employment Type = Salaried → Salaried Information screen (Category dropdown w/ 5 options, Organization's Name, **Annual Income**, Source of Income) — matches RULE_23 | Happy Path | AC27 | Critical | Manual (confirmed live, both Funding Modes) |
| TC-SIL-203 | Employment Type = Professional, Self employed, Retired, or Housewife → Self Employed Information screen (Organization's Name, **Annual Turnover**, Source of Income) — matches RULE_24 | Happy Path | AC27 | Critical | Manual (confirmed live, both Funding Modes) |
| TC-SIL-204 | Designation/Profession has no effect on post-Basic-Details routing (verified with two different values, Employment Type/Funding Mode held constant) — matches the rule config's omission of this field | Happy Path/Business Rule | AC27 | Medium | Manual (confirmed live) |
| TC-SIL-205 | [CONFIRMED DEFECT BUG-SILVER-005, High] Employment Type = Agriculture/Farmer is rejected with "Employment type is invalid for Minor." on a confirmed-Individual, confirmed-adult (DOB 1995-09-21) application — contradicts RULE_24, which should route it to Self Employed Information. Suspected root cause: dropdown value "Agriculture/Farmer" does not exact-string-match the rule config's condition value "Farmer" | Negative/Security (Live) | AC27 | Critical | Manual (confirmed live, both Funding Modes, reproducible) |
| TC-SIL-206 | [CONFIRMED DEFECT BUG-SILVER-005, High] Employment Type = Other or Business is rejected with "Employment type is invalid for Minor." on a confirmed-Individual application — contradicts the rule config's Default rule, which should route to Applicant Photo (no rule requires Joint/Minor to be satisfied for these two, yet no rule fires) | Negative/Security (Live) | AC27 | Critical | Manual (confirmed live, both Funding Modes, reproducible) |
| TC-SIL-207 | [CONFIRMED DEFECT BUG-SILVER-005, High] Employment Type = Unemployed on a confirmed-Individual application never reaches the rule config's Default destination (Applicant Photo) across 4 real attempts — blocked with "invalid for Minor" in 3/4 attempts, and misrouted to Self Employed Information (not Applicant Photo) in the 1 attempt that didn't error | Negative (Live) | AC27 | High | Manual (confirmed live, 4 real attempts) |
| TC-SIL-208 | [Not yet verified] Whether Customer Type = Joint (RULE_25 → Joint Information) or Minor (RULE_26 → Guardian Information) correctly route Unemployed/Other/Business/Agriculture-Farmer as configured | Happy Path/Business Rule | AC27 | High | Manual — not yet executed, requires a live Joint or Minor application at Basic Details with these Employment Types |

### Individual Account Type — Full Journey (AC28) — live-executed 2026-08-10 against SAH-1002-775

| ID | Title | Type | AC | Priority | Automation |
|---|---|---|---|---|---|
| TC-SIL-210 | Salaried/Self Employed Information is confirmed to be its own dedicated stepper tab (not a Basic Details sub-panel) | Happy Path/Correction | AC28 | Medium | Manual (confirmed live) |
| TC-SIL-211 | Individual Account Type skips Joint Applicant Details entirely — Salaried Information advances directly to Applicant Photo | Happy Path/Business Rule | AC28 | Critical | Manual (confirmed live end to end) |
| TC-SIL-212 | Applicant Photo for an Individual applicant reproduces the same shape/defect (duplicated "Capture Using Camera") as the joint applicant's own Photo step | Happy Path/UI | AC28 | Medium | Manual (confirmed live) |
| TC-SIL-213 | Nominee Details and nested Registered Address reproduce the same shape as AC24 for an Individual applicant | Happy Path | AC28 | High | Manual (confirmed live) |
| TC-SIL-214 | [BUG-SILVER-006] Nominee table's Action-column "Submit" button produces no observable effect when clicked (no navigation/toast/error); resuming a Pending nominee's sub-flow instead requires clicking the row's Full Name cell | Negative/UI (Live) | AC28 | Low | Manual — confirmed via 3 different click strategies (normal, forced, precise coordinates) |
| TC-SIL-215 | Nominee's "Use Existing Address → Applicant" source auto-populates State/City (nuances BUG-SILVER-002, which found State/City always empty on other address-autofill instances) | Happy Path/Negative (Live) | AC28 | Medium | Manual (confirmed live) |
| TC-SIL-216 | Individual Account Type skips Introducer Details entirely — Document Upload advances directly to Lead Details | Happy Path/Business Rule | AC28 | Critical | Manual (confirmed live end to end) |
| TC-SIL-217 | [Process note] Individual application SAH-1002-775 was submitted for real via the Summary page's Submit during this exploration, without the mandatory pre-submission cross-verification pass — documented as a process deviation, not a product defect | Process (Live) | AC28, AC16 | N/A | N/A — incident record only |

### Minor Account Type — Full Journey (AC29) — live-executed 2026-08-10/11 on SAH-1002-355 (read-only) and SAH-1002-804 (full traversal)

| ID | Title | Type | AC | Priority | Automation |
|---|---|---|---|---|---|
| TC-SIL-220 | Minor's early-stage stepper differs structurally: "Minor KYC Details" replaces both eKYC Verification and Liveliness Verification | Happy Path/Business Rule | AC29 | Critical | Manual (confirmed live, both applications) |
| TC-SIL-221 | Minor KYC Details requires manual First/Middle/Last Name, DOB, Identification Document (only AADHAAR CARD option), Document Number, and Upload Document — not DigiLocker-verified | Happy Path | AC29 | Critical | Manual (confirmed live, real Aadhaar 700780012338) |
| TC-SIL-222 | Address Details for the minor requires full manual entry (no Aadhaar auto-fill), unlike an adult applicant's Permanent Address | Happy Path/Negative | AC29 | Medium | Manual (confirmed live) |
| TC-SIL-223 | Basic Details "Mode of Operation" = "Guardian" for Minor Account Type (third value alongside Self/Jointly) | Happy Path/Business Rule | AC29 | Critical | Manual (confirmed live) |
| TC-SIL-224 | Post-Basic-Details destination for Minor is "Guardian Details", matching RULE_26; confirmed reachable for Employment Type = Unemployed | Happy Path/Business Rule | AC27, AC29 | Critical | Manual (confirmed live, SAH-1002-355) |
| TC-SIL-225 | Guardian Details is a management table mirroring Joint Applicant Details; resuming a Pending guardian's row opens their own full sub-journey (Mobile OTP → eKYC → Liveliness → Address → Basic Details → Salaried Information → Applicant Photo) | Happy Path (Live) | AC29 | Critical | Manual — full guardian sub-journey executed live end to end |
| TC-SIL-226 | Guardian's own Mobile Number Verification rejects reuse of any number already verified elsewhere on the same application: "Same Mobile number has been already verified for same request!" | Negative (Live) | AC23, AC29 | High | Manual (confirmed live, reproducible) |
| TC-SIL-227 | [CONFIRMED DEFECT BUG-SILVER-010, High] Camera-based Liveliness Verification for a guardian's sub-flow fails after video capture with "Failed — Saving application details are not present!" — backend never records success; Security Code Based Liveliness works as the alternative | Negative (Live) | AC29 | Critical | Manual (confirmed live, real device screenshot evidence) |
| TC-SIL-228 | Guardian's own Address Details auto-populates via "Use Existing Address" default (State/City pre-filled), unlike the minor's own Address Details | Happy Path (Live) | AC29 | Medium | Manual (confirmed live) |
| TC-SIL-229 | Guardian's Basic Details includes "Relationship with Main Applicant" and omits Mode of Operation/Funding fields — matches Joint Applicant's own Basic Details shape | Happy Path (Live) | AC23, AC29 | Medium | Manual (confirmed live) |
| TC-SIL-230 | Employment Type/Funding Mode routing rules (AC27) apply uniformly inside nested Guardian sub-flows — Salaried correctly routes to Salaried Information | Happy Path/Business Rule | AC27, AC29 | High | Manual (confirmed live) |
| TC-SIL-231 | [CONFIRMED DEFECT — addendum to BUG-SILVER-006] Row-level Action-column "Submit" correctly marks a genuinely-complete guardian/nominee record Successful, but gives no distinguishing feedback when clicked on an incomplete record (appears identically "dead" either way) | Negative/UI (Live) | AC28, AC29 | Low | Manual (confirmed live, both outcomes reproduced) |
| TC-SIL-232 | [CONFIRMED DEFECT BUG-SILVER-011, Medium] Guardian Details' page-level Submit shows misleading "Cannot submit minimum 1 record required." if clicked before the row-level Submit, even with exactly 1 complete record existing | Negative (Live) | AC29 | Medium | Manual (confirmed live, reproducible) |
| TC-SIL-233 | Guardian Details fully converges into the common path — completing it opens "Applicant Photo" for the minor applicant themselves as a new top-level stage | Happy Path (Live) | AC29 | Critical | Manual (confirmed live) |
| TC-SIL-234 | [Minor UI gap] Minor's own "Verified Photo" option is shown but silently non-functional (no Aadhaar/Liveliness photo source exists) — camera capture works as the alternative | UI (Live) | AC29 | Low | Manual (confirmed live) |
| TC-SIL-235 | Document Upload accepts a real document type ("Birth Certificate") + file upload successfully, in addition to the already-documented optional blank-submit path | Happy Path (Live) | AC25, AC29 | Medium | Manual (confirmed live) |
| TC-SIL-236 | Minor Account Type also skips "Introducer Details" entirely — Document Upload advances directly to Lead Details, matching Individual not Joint | Happy Path/Business Rule | AC26, AC28, AC29 | Critical | Manual (confirmed live) |
| TC-SIL-237 | Lead Details + Summary reproduce the same shape as Individual/Joint; full Summary cross-verified field-by-field against all entered data with no discrepancies found; final Submit executed for real after user go-ahead | Happy Path (Live) | AC16, AC29 | Critical | Manual (confirmed live — `app/summary/submit` returned success, SAH-1002-804 moved Pending→Submitted) |
| TC-SIL-238 | [CONFIRMED DEFECT BUG-SILVER-009, Medium] "Change Branch" selection does not persist — Summary shows the original default branch (AMGAON), not the branch deliberately changed to (GOREGAON) earlier in the same application's journey | Negative (Live) | AC22, AC29 | Medium | Manual (confirmed live via Summary cross-check) |

### Summary / Application Submission (AC16)

| ID | Title | Type | AC | Priority | Automation |
|---|---|---|---|---|---|
| TC-SIL-130 | Summary page displays a complete, read-only review of every field entered across all 15 prior stages, for both the primary and joint applicant | Happy Path | AC16 | Critical | Manual (confirmed live — full review captured) |
| TC-SIL-131 | The truncated Spouse/Father's Name value (BUG-SILVER-003) is correctly reflected (i.e., persisted, not just a display artifact) in the final Summary | Negative (Live) | AC16 | Medium | Manual (confirmed) |
| TC-SIL-132 | [Not yet executed] Clicking the final Submit on the Summary page completes Application Submission with a success confirmation | Happy Path (Live) | AC16 | Critical | **Pending user decision — not yet executed, application intentionally left at Summary** |

### AC17 — Previous & Next Navigation (not yet systematically tested — new automated coverage)

| ID | Title | Type | AC | Priority | Automation |
|---|---|---|---|---|---|
| TC-SIL-140 | Clicking a previously-completed stage's tab (e.g., "Mobile Number Verification" from a later stage) navigates back and shows previously entered/verified data | Happy Path | AC17 | High | Automated |
| TC-SIL-141 | The "«"/"»" controls beside the stepper scroll the tab strip horizontally rather than acting as Previous/Next navigation (distinguishing genuine step navigation from tab-scrolling) | UI/Negative | AC17 | Medium | Automated |
| TC-SIL-142 | A not-yet-reached stage's tab is visually disabled (greyed) and does not navigate when clicked | Negative | AC17 | High | Automated |

### AC18 — Session Validation (not yet systematically tested — new automated coverage)

| ID | Title | Type | AC | Priority | Automation |
|---|---|---|---|---|---|
| TC-SIL-150 | Refreshing the browser mid-Mobile-Verification (before OTP sent) retains the current stage and any already-verified prior data | Happy Path | AC18 | High | Automated |
| TC-SIL-151 | Refreshing the browser after Mobile Verification is complete keeps the application on the correct next stage rather than resetting | Happy Path | AC18 | High | Automated |
| TC-SIL-152 | Rapidly double-clicking a step's Submit does not create duplicate save requests | State-Aware/Negative | AC18 | Medium | Automated |

### AC19 — UI Validation (new automated coverage, early stages only)

| ID | Title | Type | AC | Priority | Automation |
|---|---|---|---|---|---|
| TC-SIL-160 | Application header (Applicant Name, Applicant Id, Product Name, Scheme Name) is visible and correctly aligned on Mobile Verification and Account Type screens | UI | AC19 | Medium | Automated |
| TC-SIL-161 | Page layout stays within viewport width (no horizontal overflow) at desktop resolution | UI/Responsive | AC19 | Medium | Automated |
| TC-SIL-162 | Page remains usable at a mobile viewport (375×667) on Mobile Verification and Account Type screens | UI/Responsive | AC19 | Medium | Automated |

### AC20 — Performance Validation (new automated coverage, early stages only)

| ID | Title | Type | AC | Priority | Automation |
|---|---|---|---|---|---|
| TC-SIL-170 | Application Details (Mobile Verification) screen loads within an acceptable response time after selecting a scheme | Non-Functional | AC20 | Medium | Automated |
| TC-SIL-171 | Account Type submission completes without a UI freeze or timeout | Non-Functional | AC20 | Medium | Automated |

---

## 3. Out of Scope

- Deleting a Joint Applicant or Nominee via the table's Delete icon — destructive against a real, fully-completed live application.
- Two-way cross-browser/device automation of the DigiLocker/Liveliness phone-side steps themselves — these genuinely happen on the applicant's own phone, outside this browser session.

**No longer out of scope (2026-08-14):** dedicated, independently-runnable, manually-assisted Playwright specs now exist for the complete live journey — including real final Submit — for all 3 Account Types. See section 5 below.

---

## 4. Defect Log (from live execution across both sessions)

| ID | Severity | Summary |
|---|---|---|
| BUG-SILVER-001 | Medium | Every document upload in the journey (PAN, DL, Voter ID, Address Proof, Applicant Signature) accepts any correctly-typed file (png/jpg/pdf) with zero content validation — an unrelated screenshot and a fake test-camera signature were both accepted as valid. File-extension filtering itself works correctly. |
| BUG-SILVER-002 | Medium | "Same as Permanent address" / "Use Existing Address" auto-fill only populates Address Line 1 (entire address as one string) — State, City, and Pin Code are always left empty, confirmed across 3 separate address-collection screens in the journey. |
| BUG-SILVER-003 | Medium | The "Spouse / Father's Name" field on Basic Details silently truncates input at 20 characters with no warning, confirmed both in the field's live DOM value and in the final Summary review. |
| BUG-SILVER-004 | **High (Security)** | Security Code Based Liveliness Verification returns "Successful" even when a different person (not the actual applicant) holds the security code in front of the camera — no identity/face match is performed against the applicant's Aadhaar photo. Confirmed twice, on two separate real applications. This is a genuine KYC/compliance gap in a banking onboarding flow, not merely a UI defect. |
| BUG-SILVER-005 | **High** | On a confirmed Individual, confirmed adult (DOB 1995-09-21) application, Basic Details submission is rejected with "Employment type is invalid for Minor." for Employment Type = Agriculture/Farmer, Other, and Business (regardless of Funding Mode), and inconsistently for Unemployed (blocked 3 of 4 real attempts; the 1 success still misrouted to the wrong screen). Contradicts the documented rule engine (`aoscust_module_rules_setting.xlsx`): RULE_24 should route Farmer to Self Employed Information; Other/Business/Unemployed should hit the Default rule and reach Applicant Photo. Suspected causes: an exact-string-match failure between the dropdown value "Agriculture/Farmer" and the rule config's "Farmer", and a broken Default-rule fallback that incorrectly invokes Minor-only validation for non-Joint, non-Minor customers. Blocks real adult Individual customers from completing the application with no workaround. |
| BUG-SILVER-006 | Low | On a management table (Nominee Details/Guardian Details, AC24/AC28/AC29), the Action column's "Submit" button gives no distinguishing feedback between "record incomplete, nothing to confirm yet" and "already successful" — it silently produces no observable effect (no navigation, toast, or validation message) on an incomplete record, confirmed with 3 different click strategies. **Addendum (2026-08-11):** the button is not universally dead — on Guardian Details it correctly changed Status to "Successful" once the underlying guardian's sub-journey was genuinely 100% complete. The real defect is the total absence of feedback distinguishing these two states, which makes an incomplete record indistinguishable from a broken button. Workaround for incomplete Nominee records specifically: click the row's Full Name text instead, which resumes the sub-stepper. |
| BUG-SILVER-007 | Medium | Attempting to Delete an existing Guardian Details record (via the Delete icon + "Are you sure?" confirmation dialog) fails with a generic **"Oops something went wrong"** error — the guardian is not actually removed (confirmed via fresh reload showing the same record still present). Deletion is broken for Guardian Details, blocking any workflow that needs to remove/replace a guardian record (e.g. entering a different mobile number after the field becomes locked). |
| BUG-SILVER-008 | Low | The Guardian Details table's "+ Add" button remains enabled even when the maximum of 1 guardian record is already reached — clicking it shows **"Only 1 record allowed"** instead of the button being disabled/hidden once a record exists. The button should not invite an action the backend will reject. |
| BUG-SILVER-009 | Medium | "Change Branch" (Branch Selection, AC22) selection does not persist unless the entire step (select branch → step's own Submit) completes in one uninterrupted session. Selecting a different branch and confirming it within a "Change Branch" popup updates the visible summary, but reopening the application afterward (before that outer step's Submit is clicked) silently reverts to the original default branch with no warning — confirmed via a real application's final Summary showing the default branch (AMGAON), not the deliberately-selected one (GOREGAON). |
| BUG-SILVER-010 | **High** | Camera-based Liveliness Verification for a nested applicant's sub-flow (confirmed on a Guardian, AC29) fails after the video is actually recorded and appears to complete: the customer-facing link page shows a loading state post-capture, then fails with **"Failed — Saving application details are not present! Please contact to your advisor!"** (confirmed via a real screenshot from the device). The backend never records the result — status remained "Pending" on a fresh check. Security Code Based Liveliness (the alternative method) works correctly, but this leaves camera-based Liveliness as a dead end for at least nested/non-primary applicants; needs investigation into whether it's specific to guardians/joint applicants or systemic. |
| BUG-SILVER-011 | Medium | On Guardian Details (AC29), clicking the step's page-level (bottom) Submit **before** first clicking the row's own Action-column Submit produces a misleading error — **"Cannot submit minimum 1 record required."** — even though exactly 1 fully-complete guardian record exists. The correct sequence (row Submit, then page-level Submit) works, but the error message incorrectly implies no records exist rather than indicating the existing record needs individual confirmation first. |
| BUG-SILVER-012 | Low | Two dropdown option label typos: Region's "Metropolitian City" (should be "Metropolitan"), Mode of Operation's "Any Two Jointhly" (should be "Any Two Jointly"). |
| BUG-SILVER-013 | Low | Nominee Relation dropdown options "Grand Father" and "Grand Mother" should be single words, "Grandfather"/"Grandmother", per standard English spelling. Same option list observed identically on Staff Salary Account's Nominee Details step (used "Business Associate" from this list on `SAH-1003-813`) — appears to be a shared platform-wide dropdown config, not scheme-specific. |
| Minor (unnumbered) | Low | Applicant Photo's document-upload area shows "Capture Using Camera" twice instead of "Browse Computer... OR Capture Using Camera" once camera permission is granted. |
| Reliability note (not a hard defect) | Low | Security Code Liveliness link delivery was unreliable across multiple real attempts (expired without arriving), on both applications tested. |
| Cross-scheme spelling/data-quality findings (2026-08-17 desk review) | — | See BUG-NORMAL-005 (Designation dropdown duplicates + "Ngo Worker") and BUG-SSA-002/BUG-SSA-003 (same Designation issue; "Property or Municipal Tax Recipt" in Document Upload types) — these dropdowns are shared config, confirmed live on Normal and Staff Salary Account, not yet independently re-confirmed on Silver's own Designation/Document Upload screens. |

---

## 5. Automation — Dedicated Per-Flow Scripts

Each Account Type has its own complete, independently-executable spec covering Mobile Verification through real final Submit:

| Account Type | Spec file |
|---|---|
| Individual | `tests/8_SILVER_TS001/silver-savings-individual.spec.ts` (live-verified end-to-end 2026-08-14, application SAH-1002-810) |
| Joint | `tests/8_SILVER_TS001/silver-savings-joint.spec.ts` |
| Minor | `tests/8_SILVER_TS001/silver-savings-minor.spec.ts` |

Shared step library: `tests/support/savingsApplicationFlow.ts`. Mobile OTP is relayed via a signal file (see `tests/support/signalFile.ts`); DigiLocker/Liveliness are handled by polling the live status (no typed input needed — the applicant acts on their own phone). All three are tagged `test.skip(!!process.env.CI, ...)` — manually-assisted, not silently omitted from the suite, just skipped-with-reason when no human is available to relay input. Each requires real, not-recently-used mobile numbers supplied via env vars (`SAHAYOG_SIL_IND_MOBILE`, `SAHAYOG_SIL_JNT_MOBILE`/`SAHAYOG_SIL_JNT_CO_MOBILE`, `SAHAYOG_SIL_MIN_MOBILE`/`SAHAYOG_SIL_MIN_GUARDIAN_MOBILE`).
