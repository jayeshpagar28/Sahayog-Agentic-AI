# NORMAL_TS001 — Test Plan: Normal Savings Account Application Journey

**Story:** `user-stories/US_009_Normal_ Account_journey.md` (Story ID: US_009, extended live to AC29 during execution)
**Module:** Savings Account → Normal Savings Account – 1001 → full application journey (Mobile Verification through final Summary/Submission)
**Route under test:** `/applndetails` (reached via Home → Savings Application card → New Application → Scheme Selection → select "Normal Savings Account - 1001")
**Priority:** High
**Environment:** https://sahyogagentweb.drutam.in:9634 (UAT)
**Credentials:** `nayan.aher@netwinindia.in` / `Sahayog@2025`

---

## 1. User Story Summary

**Feature overview:** Same multi-stage stepper application journey as the Silver Savings Account (US_008), but for the "Normal Savings Account - 1001" scheme. Applicant Id format is `SAH-1001-nnn` (vs. Silver's `SAH-1002-nnn`). Live execution against all three Account Types — Joint (`SAH-1001-796`), Individual (`SAH-1001-805`), and Minor (`SAH-1001-806`), all submitted for real — confirmed the journey structure is effectively identical to Silver's confirmed 16-stage flow, with a few genuine cross-scheme routing differences (see BR11 and the Minor-specific business rules below).

**Real stage order confirmed via live execution (SAH-1001-796, Account Type Joint):**
1. Mobile Number Verification
2. Account Type
3. eKYC Verification (Aadhaar via DigiLocker)
4. Liveliness Verification (Security Code Based)
5. Address Details (Permanent auto-populated from Aadhaar for the primary applicant + Communication manual)
6. Branch Selection
7. Basic Details (30+ fields)
8. Cheque Details (dynamic — Funding Mode = Cheque only)
9. Salaried Information (dynamic — Employment Type = Salaried only)
10. Joint Applicant Details (full mirror of stages 1–9 for the joint applicant, only if Account Type = Joint)
11. Applicant Photo (primary applicant)
12. Nominee Details
13. Nominee Address Details
14. Document Upload
15. Introducer Details (mandatory for Joint)
16. Lead Details (Lead Converter Code + Sourcer Code, each independently "Verify"-able)
17. Summary (full read-only review, ending in the final Submit)

**Entity + CRUD matrix**

| Entity | Create | Read | Update | Delete |
|---|---|---|---|---|
| Savings Application (multi-stage) | ✅ Full journey (this module) | ✅ Summary page; per-stage re-entry via View | Partial — most fields editable only during initial entry; Permanent Address is read-only post-eKYC for the primary applicant | Out of scope (no delete action found) |
| Joint Applicant | ✅ Added via "+ Add" in Joint Applicant Details table | ✅ Table (Full Name/Customer ID/Status), row-click resumes sub-flow (always resets to the sub-flow's first inner tab) | N/A observed | Delete icon present in table (not exercised — destructive) |
| Guardian (Minor only) | ✅ Added via "+ Add" in Guardian Details table | ✅ Table (Full Name/Customer ID/Status), same row-click-resets-to-first-tab gotcha as Joint Applicant | N/A observed | Not exercised this pass |
| Nominee | ✅ Added via Nominee Details table | ✅ Table (Full Name/Status) | N/A observed | Delete icon present in table (not exercised — destructive) |

**Business rules extracted (confirmed via live execution)**

- BR1: Applicant Id for this scheme is `SAH-1001-nnn`.
- BR2: Funding Mode = "Cheque" dynamically inserts a "Cheque Details" step immediately after Basic Details; "Cash" skips it (not directly re-tested this pass, inherited from Silver's confirmed RULE_22 behavior on the same platform).
- BR3: Employment Type = "Salaried" dynamically inserts a "Salaried Information" step (Category / Organization's Name / Annual Income / Source of Income).
- BR4: Account Type = "Joint" requires both Joint Applicant Details and Introducer Details.
- BR5: The Joint Applicant's own sub-journey fully mirrors the primary applicant's stages 1–9, with a "Relationship with Main Applicant" field added to Basic Details (not present on the primary applicant's own form) and no Funding Mode field.
- BR6: **Branch Selection requires two Submit clicks to actually persist a changed branch** — the first click only transitions the local view from the branch-card list to a read-only summary (fires zero network requests); the second click on the Submit button that then appears fires the real `POST /branch/selection/submit/details` save call and advances the step. Confirmed via network tracing with explicit before/after timing marks, and via a fresh-reload persistence check.
- BR7: Change Mobile Number (within any sub-flow's own Mobile Number Verification step) correctly discards the pending OTP state for the old number and issues a fresh OTP for the newly entered number.
- BR8: Document Upload's mandatory-document validation (e.g. "Please Upload Ration Card") can silently discard a previously-selected-and-uploaded document if it hadn't yet been successfully submitted — see BUG-NORMAL-002.
- BR9: A management-table sub-record (Joint Applicant, Nominee) requires the two-submit pattern: row-level Action-column Submit first (marks the record Successful), then the page-level Submit (advances the outer step) — same as Silver's Nominee/Guardian tables.
- BR10: Applicant Photo does not persist partial progress within a session — Photo and Signature must both be completed and the step Submitted together, or a reload before Submit discards everything already uploaded (even though each individual image-save call itself succeeds server-side).
- BR11: Account Type = "Individual" and Account Type = "Minor" also both require Introducer Details on the Normal Savings Account — unlike the Silver Savings Account, where only Joint requires it and Individual/Minor both skip it. All three Account Types require Introducer Details here.
- BR12: For Account Type = "Minor," the minor's own KYC (Minor KYC Details) and Address Details are always fully manual (no DigiLocker, no auto-fill/"Use Existing Address" option) since no Aadhaar-verified source exists for the minor at that point in the flow; Mode of Operation = "Guardian"; Employment Type = "Unemployed" routes straight to Guardian Details (no Salaried/Self Employed Information step inserted); the Guardian's own sub-journey is the full adult flow including Salaried/Self Employed Information and Applicant Photo (with Browse Computer available, unlike the top-level primary applicant).

**Third-party integrations:** DigiLocker (Aadhaar eKYC), device camera (Liveliness, Signature capture, "Capture Using Camera" document/photo uploads), device geolocation (camera-capture popups display reverse-geocoded address).

**Acceptance criteria (tagged) — original + live-discovered**

| AC | Type | Summary |
|---|---|---|
| AC1 | Functional | Scheme Selection — Normal Savings Account - 1001 available, launches journey with correct Product/Scheme Name and unique Applicant Id |
| AC2 | Functional | Mobile Number Verification, first step of the journey |
| AC3 | Functional/UI | Account Type selection — Joint, Individual, and Minor all confirmed live; "Joint" pre-selected by default on a fresh application |
| AC4 | Functional | eKYC Verification (Aadhaar via DigiLocker confirmed for adults; PAN/DL/Voter ID present but not exercised this pass) |
| AC5 | Functional | Liveliness Verification (Security Code Based confirmed) |
| AC6 | Functional | Address Details (Permanent auto-populated for adult applicants + Communication manual, "Use Existing Address" defect; fully manual for Minor with no auto-fill at all) |
| AC7 | Functional | Branch Selection (default branch, Change Branch, two-submit persistence business rule) |
| AC8 | Functional | Basic Details (30+ fields; Mode of Operation = Self/Jointly/Guardian depending on Account Type; dotted-email validation defect) |
| AC9 | Functional/Business Rule | Funding Mode conditional routing (Cheque → Cheque Details step confirmed for Joint; Cash-skip confirmed for Individual/Minor) |
| AC10, AC12 | Functional/Business Rule | Employment Type conditional routing — Salaried → Salaried Information, Self employed → Self Employed Information, Unemployed (Minor) → straight to Guardian Details |
| AC13, AC14 | Functional/Business Rule | Account Type-specific sub-journeys: Joint Applicant Details (Joint) and Guardian Details (Minor), both full mirrors of the adult flow, incl. Change Mobile Number |
| AC16 | Functional | Applicant Photo (Photo + Signature, per applicant; primary-applicant-only Browse-Computer inconsistency; Verified Photo unavailable for non-DigiLocker-verified Minor) |
| AC17 | Functional | Nominee Details + nested Nominee Address Details |
| AC18 | Functional | Document Upload (mandatory-document validation, document-loss defect) |
| AC19 | Functional | Introducer Details — mandatory for ALL THREE Account Types on Normal Savings Account (differs from Silver, where only Joint requires it) |
| AC20 | Functional | Lead Details (Lead Converter/Sourcer Code verification) |
| AC21 | Functional | Summary — full field-by-field cross-verification against everything entered |
| AC22 | Functional | Final Application Submission |
| AC29 | Functional/Business Rule | Minor Account Type's full journey confirmed live end to end through Summary — distinct Minor KYC Details/Guardian Details structure, real DigiLocker denial-and-recovery reproduced |

---

## 2. Test Cases

### Scheme Selection (AC1)

| ID | Title | Type | AC | Priority | Automation |
|---|---|---|---|---|---|
| TC-NOR-001 | Scheme list shows "Normal Savings Account - 1001" as a selectable option under Savings Account | Happy Path | AC1 | Critical | Automated |
| TC-NOR-002 | Selecting Normal Savings Account - 1001 navigates to `/applndetails` and displays Product Name "Savings Account" and Scheme Name "Normal Savings Account - 1001" | Happy Path | AC1 | Critical | Automated (confirmed live) |
| TC-NOR-003 | Journey launches directly into Mobile Number Verification as the first step, with Mobile Number field and +91 country code | Happy Path | AC1, AC2 | Critical | Automated (confirmed live) |
| TC-NOR-004 | Applicant Id assigned follows the `SAH-1001-nnn` format, distinct from Silver's `SAH-1002-nnn` series | Happy Path | AC1 | Medium | Manual (confirmed live via SAH-1001-796) |

### Mobile Number Verification (AC2)

| ID | Title | Type | AC | Priority | Automation |
|---|---|---|---|---|---|
| TC-NOR-010 | "Send Verification Code" sends a real OTP to the entered mobile number, shows validity/resend countdown | Happy Path (Live) | AC2 | Critical | Manual (confirmed live) |
| TC-NOR-011 | Entering the correct OTP shows "Mobile OTP Verification done successfully!" and advances to the next step | Happy Path (Live) | AC2 | Critical | Manual (confirmed live, joint applicant's own sub-flow) |
| TC-NOR-012 | Resending / re-requesting an OTP too soon after a prior attempt is blocked with "Mobile verification request is already in process!" | Negative | AC2 | Medium | Manual (confirmed live) |
| TC-NOR-013 | [Sub-flow] "Change Mobile Number?" during a pending OTP correctly resets to a blank Mobile Number field and allows entering a different number | Happy Path (Live) | AC2, AC13 | High | Manual (confirmed live — joint applicant switched from 9403564649 to 9511996248) |
| TC-NOR-014 | [Sub-flow] The newly entered number after Change Mobile Number receives its own fresh OTP, verified independently of the original number | Happy Path (Live) | AC2, AC13 | High | Manual (confirmed live) |

### Account Type (AC3)

| ID | Title | Type | AC | Priority | Automation |
|---|---|---|---|---|---|
| TC-NOR-020 | Account Type = "Joint" is a valid, submittable option for the Normal Savings Account scheme | Happy Path | AC3 | Critical | Manual (confirmed live) |
| TC-NOR-021 | Account Type = "Individual" full journey for Normal Savings Account, end to end through Summary and final submission | Happy Path | AC3, AC13 | High | Manual (confirmed live — SAH-1001-805, Yash Pravin Sonawane, submitted for real) |
| TC-NOR-022 | Account Type = "Minor" full journey for Normal Savings Account, end to end through Summary and final submission | Happy Path | AC3, AC13 | High | Manual (confirmed live — SAH-1001-806, Bhushan Vishnu Joshi, guardian Shubham Madhukar Borse, submitted for real) |
| TC-NOR-023 | [CONFIRMED DEFECT — same as Silver's TC-SIL-011] "Joint" is pre-selected/highlighted by default on the Account Type screen even on a completely fresh application, without any user action | UI/Negative | AC3 | Medium | Manual (confirmed live on SAH-1001-805; Individual had to be actively clicked to override the default) |

### eKYC Verification (AC4)

| ID | Title | Type | AC | Priority | Automation |
|---|---|---|---|---|---|
| TC-NOR-030 | eKYC Verification screen shows 4 options: Aadhaar (DigiLocker, mandatory), PAN, Driving Licence, Voter ID | Happy Path | AC4 | Critical | Manual (confirmed live) |
| TC-NOR-031 | [Live] Aadhaar via DigiLocker: Send Link → real customer completes DigiLocker auth → status Successful | Happy Path (Live) | AC4 | Critical | Manual (confirmed live, both primary and joint applicant) |
| TC-NOR-032 | Applicant identity (Name, DOB) auto-populates from Aadhaar into Basic Details after eKYC completes | Happy Path (Live) | AC4, AC8 | Critical | Manual (confirmed live, both applicants) |
| TC-NOR-033 | Submit is only meaningful once Aadhaar (mandatory) is Successful | Business Rule | AC4 | High | Manual (confirmed live) |

### Liveliness Verification (AC5)

| ID | Title | Type | AC | Priority | Automation |
|---|---|---|---|---|---|
| TC-NOR-040 | Liveliness Verification screen shows two options: Security Code Based, and camera-based | Happy Path | AC5 | Critical | Manual (confirmed live) |
| TC-NOR-041 | [Live] Security Code Based Liveliness: Send Link → real applicant follows instructions → status Successful | Happy Path (Live) | AC5 | Critical | Manual (confirmed live, both applicants) |

### Address Details (AC6)

| ID | Title | Type | AC | Priority | Automation |
|---|---|---|---|---|---|
| TC-NOR-050 | Primary applicant's Permanent Address is auto-populated from Aadhaar/eKYC data | Happy Path | AC6 | Critical | Manual (confirmed live) |
| TC-NOR-051 | Manual Communication Address entry (Address Line 1/2, State, City, Pin Code, proof document) succeeds and advances the step | Happy Path | AC6 | Critical | Manual (confirmed live) |
| TC-NOR-052 | [CONFIRMED DEFECT BUG-NORMAL-001] "Use Existing Address" only auto-fills Address Line 1 (whole address as one combined string) — State, City, Pin Code remain empty and must be entered manually | Negative (Live) | AC6 | High | Manual — confirmed on 4 separate address screens (primary Communication, joint Permanent, joint Communication, Nominee Registered Address); reproduces Silver's BUG-SILVER-002 exactly |
| TC-NOR-053 | Address Line 1/2 and Area/locality are `<textarea>` elements, not `<input>` (automation gotcha, not a defect) | Technical Note | AC6 | Low | Confirmed live |
| TC-NOR-054 | Joint applicant's own Permanent AND Communication Address are NOT auto-populated — both require manual "Click Here For Add Address" entry, unlike the primary applicant's read-only Permanent Address | Negative/UI (Live) | AC6 | Medium | Manual (confirmed live) |

### Branch Selection (AC7)

| ID | Title | Type | AC | Priority | Automation |
|---|---|---|---|---|---|
| TC-NOR-060 | Branch Selection shows a default branch (Name, ID, Address) pre-selected | Happy Path | AC7 | Critical | Manual (confirmed live, default AMGAON BRANCH) |
| TC-NOR-061 | "Change Branch?" opens a list of alternate branch cards | Happy Path | AC7 | High | Manual (confirmed live) |
| TC-NOR-062 | [BUSINESS RULE, initially misdiagnosed as a defect] Selecting a different branch card and clicking Submit ONCE only transitions the local view — fires zero save requests. A SECOND click on the Submit button that then appears fires the real save call (`POST /branch/selection/submit/details`) and the change persists correctly across a fresh reload | Business Rule (Live) | AC7 | Critical | Manual — confirmed via network tracing with explicit timing marks; **retracts an initial false "branch doesn't persist" finding from this same session, and calls Silver Savings Account's BUG-SILVER-009 into question** |
| TC-NOR-063 | Submitting the default branch (single Submit, no change) succeeds and advances to Basic Details | Happy Path | AC7 | Critical | Manual (confirmed live) |

### Basic Details (AC8)

| ID | Title | Type | AC | Priority | Automation |
|---|---|---|---|---|---|
| TC-NOR-070 | Basic Details auto-populates First/Middle/Last/Full Name and Date of Birth from Aadhaar eKYC data | Happy Path | AC8 | Critical | Manual (confirmed live) |
| TC-NOR-071 | Mode of Operation dropdown offers "Jointly" (and others: Self, Either or Survivor, Former or Survivor, Guardian, Any Two Jointly, Jointly With Others, Any One) | Happy Path | AC8 | Critical | Manual (confirmed live) |
| TC-NOR-072 | All 30+ required fields (Prefix, Gender, Email, Marital Status, Father's/Mother's Name, Religion, Caste Category, PEP, Disabilities, Education, Tax Residence, Region, Employment Type, Designation/Profession, Funding Mode, and 4 numeric income/transaction fields) accept valid input and submit successfully | Happy Path | AC8 | Critical | Manual (confirmed live, full real-data submission) |
| TC-NOR-073 | Dropdown option sets confirmed: Prefix (10 options), Gender (2), Marital Status (8), Religion (6), Caste Category (4), Education/Qualification (6), Region (4), Employment Type (9), Designation/Profession (~90), Funding Mode (2) | Reference | AC8 | Medium | Manual (confirmed live) |
| TC-NOR-074 | "Relationship with Main Applicant" field is added to the Joint applicant's own Basic Details form (not present on the primary applicant's) | Happy Path | AC8, AC13 | High | Manual (confirmed live) |
| TC-NOR-075 | Relationship options do not include "Friend" — closest available: Wife, Grand Father, Daughter, Grand Mother, Others, Natural Guardian, Son, Father, Mother, Brother, Sister, No Relation, Husband, Business Associate, Spouse, Parent, Sibling | Gap/UI Note | AC8, AC13 | Low | Manual (confirmed live — used "Others" as the closest fit) |
| TC-NOR-076 | [CONFIRMED DEFECT BUG-NORMAL-004] Email ID field intermittently rejects syntactically valid email addresses containing a dot in the local part before `@` (e.g. "yash.netwin@gmail.com") with "Enter Valid Email ID.", while the identical local text without a dot ("yashsonawane@gmail.com") is accepted | Negative (Live) | AC8 | Medium | Manual (confirmed live, reproduced twice with two different dotted addresses on SAH-1001-805) |
| TC-NOR-077 | A Basic Details validation failure (e.g. the email defect above) wipes the entire form, not just the offending field — all 20+ previously-filled values are lost and must be re-entered from scratch | Negative (Live) | AC8 | Medium | Manual (confirmed live; same no-partial-save behavior as documented generally for this step) |

### Funding Mode → Cheque Details (AC9)

| ID | Title | Type | AC | Priority | Automation |
|---|---|---|---|---|---|
| TC-NOR-080 | Funding Mode = "Cheque" dynamically adds a "Cheque Details" stepper tab immediately after Basic Details | Happy Path (Live) | AC9 | Critical | Manual (confirmed live) |
| TC-NOR-081 | Cheque Details fields (Cheque Number, Cheque Date [date picker], Drawee Bank Name, Drawee Branch IFSC Code) accept valid input and submit, advancing to the Employment-Type-conditional step | Happy Path | AC9 | Critical | Manual (confirmed live) |
| TC-NOR-082 | Funding Mode = "Cash" correctly skips the Cheque Details step entirely — Basic Details advances directly to the Employment-Type-conditional step | Happy Path | AC9 | High | Manual (confirmed live on SAH-1001-805, Individual, Cash) |

### Employment Type → Salaried / Self Employed Information (AC10, AC12)

| ID | Title | Type | AC | Priority | Automation |
|---|---|---|---|---|---|
| TC-NOR-090 | Employment Type = "Salaried" dynamically adds a "Salaried Information" stepper tab | Happy Path (Live) | AC10, AC12 | Critical | Manual (confirmed live, both primary and joint applicant) |
| TC-NOR-091 | Salaried Information fields (Category dropdown [5 options], Organization's Name, Annual Income, Source of Income) accept valid input and submit | Happy Path | AC12 | Critical | Manual (confirmed live) |
| TC-NOR-092 | Employment Type = "Self employed" dynamically adds a "Self Employed Information" stepper tab — a distinct step from Salaried Information, with fields Category (8 options: Industrialist, Trader/Merchant, Service Provider, Contractor, Migrant Labourer, Import/Export Business, Self-employed Labourer, Others Self-Employed), Organization's Name, **Annual Turnover** (not "Annual Income"), Source of Income | Happy Path (Live) | AC10, AC12 | High | Manual (confirmed live on SAH-1001-805) |
| TC-NOR-093 | [Not yet covered] Remaining Employment Type values (Professional, Agriculture/Farmer, Retired, Housewife, Other, Business) and their resulting routing | Happy Path/Business Rule | AC10 | High | Not yet executed — Salaried, Self employed, and Unemployed (TC-NOR-204) confirmed so far |

### Joint Applicant Details (AC13, AC14)

| ID | Title | Type | AC | Priority | Automation |
|---|---|---|---|---|---|
| TC-NOR-100 | Account Type = Joint adds a "Joint Applicant Details" management-table step after the primary applicant's Employment-Type-conditional step | Happy Path (Live) | AC13 | Critical | Manual (confirmed live) |
| TC-NOR-101 | "+ Add" starts the joint applicant's own sub-journey, beginning at Mobile Number Verification | Happy Path | AC13, AC14 | Critical | Manual (confirmed live) |
| TC-NOR-102 | The joint applicant's sub-journey fully mirrors the primary applicant's own stages: Mobile Verification → eKYC → Liveliness → Address → Basic Details → Salaried Information → Applicant Photo | Happy Path (Live) | AC13, AC14 | Critical | Manual (confirmed live end to end) |
| TC-NOR-103 | Resuming an in-progress joint applicant record via the management table's row always resets the visible panel to the sub-flow's first inner tab (Mobile Number Verification), regardless of actual progress — must click the correct inner tab by name to jump to the real current step | Negative/UI (Live) | AC14 | Medium | Manual (confirmed live, automation gotcha) |
| TC-NOR-104 | Row-level Action-column Submit (on the management table) marks the joint applicant's record Successful once their sub-journey is complete | Happy Path | AC14 | Critical | Manual (confirmed live) |
| TC-NOR-105 | Page-level Submit (after row-level Submit) advances the outer step to a top-level "Applicant Photo" stage for the primary applicant | Happy Path | AC14, AC16 | Critical | Manual (confirmed live) |

### Applicant Photo (AC16)

| ID | Title | Type | AC | Priority | Automation |
|---|---|---|---|---|---|
| TC-NOR-110 | Applicant Photo screen shows Applicant Name (auto-filled), Upload Applicant Photo, and Upload Applicant Signature sections | Happy Path | AC16 | Critical | Manual (confirmed live, both applicants) |
| TC-NOR-111 | "Verified Photo" (Aadhaar Verification Photo / Liveliness Verification Photo options) successfully sources the applicant photo without a manual upload | Happy Path (Live) | AC16 | Critical | Manual (confirmed live, primary applicant) |
| TC-NOR-112 | "Capture Using Camera" for Signature: opens a live capture popup with reverse-geocoded address/lat-long/timestamp overlay; "Capture photo" saves successfully (`POST /sahyogDocumentDbModule/doc/n/image1` → 200) | Happy Path (Live) | AC16 | Critical | Manual (confirmed live, requires `--use-fake-device-for-media-stream` + pre-granted camera/geolocation permissions in automated runs) |
| TC-NOR-113 | [CONFIRMED DEFECT BUG-NORMAL-003] Primary applicant's Applicant Photo step offers no "Browse Computer" option for either field — only Capture Using Camera (+ Verified Photo for the photo); the joint applicant's own Applicant Photo step DOES offer Browse Computer for both fields | UI Inconsistency (Live) | AC16 | Low | Manual (confirmed live) |
| TC-NOR-114 | Applicant Photo does not persist partial progress — completing only Photo (not Signature) and then reloading before Submit discards the already-uploaded Photo too, even though its individual save call returned HTTP 200 | Negative (Live) | AC16 | Medium | Manual (confirmed live; both fields must be completed and Submitted in one continuous session) |

### Nominee Details (AC17)

| ID | Title | Type | AC | Priority | Automation |
|---|---|---|---|---|---|
| TC-NOR-120 | Nominee Details fields (Full Name, Relation dropdown, Date of Birth) accept valid input; Age auto-calculates from DOB | Happy Path | AC17 | Critical | Manual (confirmed live — Age auto-calculated as 28.05 from a 1998-03-15 DOB) |
| TC-NOR-121 | Submitting Nominee Details advances to a nested "Address Details (Nominee)" sub-step | Happy Path | AC17 | Critical | Manual (confirmed live) |
| TC-NOR-122 | Resuming a saved Nominee record via the management table resets to the sub-flow's first tab (Nominee Details) — must click the "Address Details (Nominee)" inner tab directly to reach the address step | Negative/UI (Live) | AC17 | Medium | Manual (confirmed live, same gotcha as Joint Applicant) |
| TC-NOR-123 | Nominee Registered Address "Use Existing Address" reproduces BUG-NORMAL-001 (Address Line 1 only, State/City/Pin empty) | Negative (Live) | AC17 | High | Manual (confirmed live) |

### Document Upload (AC18)

| ID | Title | Type | AC | Priority | Automation |
|---|---|---|---|---|---|
| TC-NOR-130 | Document type dropdown offers 10 options (Electricity Bill, Ration Card [marked mandatory with `*`], Telephone Bill, corporate incorporation docs, Property/Municipal Tax Receipt, Birth Certificate, Relationship Proof With Guardian, Deposit Slip, Cheque Image) | Reference | AC18 | Medium | Manual (confirmed live) |
| TC-NOR-131 | Attempting to Submit without the mandatory Ration Card shows "Please Upload Ration Card" and blocks progression | Negative/Business Rule | AC18 | High | Manual (confirmed live) |
| TC-NOR-132 | [CONFIRMED DEFECT BUG-NORMAL-002] Selecting and uploading a non-mandatory document (e.g. Electricity Bill) first, then being blocked by the mandatory Ration Card requirement, silently discards the first document from the form state — only Ration Card is retained after Submit, with no warning shown at any point | Negative (Live) | AC18 | High | Manual — confirmed via Summary page review; the lost document was only noticed by explicit field-by-field cross-verification |
| TC-NOR-133 | Once a document is successfully saved (step Submitted at least once), subsequently adding a further document in a later visit correctly retains both together | Happy Path (Live) | AC18 | Medium | Manual (confirmed live — re-added Electricity Bill after Ration Card was already saved; Summary then showed both) |
| TC-NOR-134 | Selecting the mandatory Ration Card directly (first, with no prior document selection) uploads and submits cleanly with no document loss | Happy Path (Live) | AC18 | Medium | Manual (confirmed live on SAH-1001-805, Individual — BUG-NORMAL-002 only reproduces when a document is added and lost before the step's first successful Submit) |

### Introducer Details (AC19)

| ID | Title | Type | AC | Priority | Automation |
|---|---|---|---|---|---|
| TC-NOR-140 | Introducer Details (Introducer's Name, Introducer Account Number, Period of Acquaintance) is a mandatory step for Account Type = Joint | Happy Path (Live) | AC19 | Critical | Manual (confirmed live) |
| TC-NOR-141 | A valid, real Introducer Account Number is validated against the backend and resolves to the correct account holder name | Happy Path (Live) | AC19 | Critical | Manual (confirmed live — A/C 100144590015067 → BHUWAN DNYANESHWAR PATLE) |
| TC-NOR-142 | [Not yet covered] An invalid/non-existent Introducer Account Number is rejected | Negative | AC19 | High | Not yet executed this pass |
| TC-NOR-143 | [CROSS-SCHEME DIFFERENCE] Introducer Details is ALSO mandatory for Account Type = Individual on the Normal Savings Account — unlike the Silver Savings Account, where Individual skips Introducer Details (and Joint Applicant Details) entirely | Business Rule (Live) | AC19 | High | Manual (confirmed live on SAH-1001-805 — do not assume Silver's Individual-routing rules carry over to Normal Savings Account) |
| TC-NOR-144 | [CROSS-SCHEME DIFFERENCE] Introducer Details is ALSO mandatory for Account Type = Minor on the Normal Savings Account — unlike the Silver Savings Account, where Minor also skips it (same as Individual there). On Normal Savings Account, all three Account Types (Joint, Individual, Minor) require Introducer Details | Business Rule (Live) | AC19 | High | Manual (confirmed live on SAH-1001-806) |

### Minor Account Type (AC3, AC13, AC29)

| ID | Title | Type | AC | Priority | Automation |
|---|---|---|---|---|---|
| TC-NOR-200 | Minor stepper structure differs from Individual/Joint: Mobile Number Verification → Account Type → **Minor KYC Details** (replaces both eKYC and Liveliness) → Address Details → Branch Selection → Basic Details → **Guardian Details** → Applicant Photo → ... | Happy Path (Live) | AC13, AC29 | Critical | Manual (confirmed live on SAH-1001-806) |
| TC-NOR-201 | Minor KYC Details fields: First/Middle/Last Name, Date of Birth, Select Identification Document (only one option: "AADHAAR CARD"), Document Identification Number, Upload Document — fully manual entry, no DigiLocker | Happy Path (Live) | AC29 | Critical | Manual (confirmed live) |
| TC-NOR-202 | Minor's own Address Details (Permanent and Communication) has no auto-fill or "Use Existing Address" option at all — fully manual entry for both | Negative/UI (Live) | AC29 | Medium | Manual (confirmed live; differs from the adult flow's Aadhaar-populated Permanent Address) |
| TC-NOR-203 | Basic Details "Mode of Operation" offers "Guardian" as a valid option for Minor, alongside Self (Individual)/Jointly (Joint) | Happy Path (Live) | AC8, AC29 | Critical | Manual (confirmed live) |
| TC-NOR-204 | Employment Type = "Unemployed" on the minor's own Basic Details routes directly to Guardian Details, with no Salaried/Self Employed Information step inserted | Happy Path/Business Rule (Live) | AC10, AC29 | High | Manual (confirmed live — consistent with Silver's RULE_26) |
| TC-NOR-205 | Guardian Details is a management-table step ("+Add", row-Submit-then-page-Submit) whose "+Add" starts the guardian's own sub-journey, mirroring the full adult applicant flow (Mobile Verification → eKYC → Liveliness → Address → Basic Details → Employment Information → Applicant Photo) | Happy Path (Live) | AC29 | Critical | Manual (confirmed live end to end) |
| TC-NOR-206 | Guardian's own Basic Details adds a "Relationship with Main Applicant" field; "Natural Guardian" intermittently failed to resolve as selectable in one attempt, "Father" worked reliably | Happy Path/Gap (Live) | AC8, AC29 | Medium | Manual (confirmed live) |
| TC-NOR-207 | Guardian's own Applicant Photo step DOES offer "Browse Computer" for both Photo and Signature — confirming BUG-NORMAL-003 (no Browse Computer) is specific to the top-level primary applicant, not nested sub-applicants generally | UI Note (Live) | AC16, AC29 | Low | Manual (confirmed live) |
| TC-NOR-208 | [Live, real device] A guardian's Aadhaar DigiLocker denial (customer clicks "Deny" on their device) correctly surfaces status "Action Required" with message "Customer denied document access permission. DigiLocker verification could not be completed." | Negative (Live) | AC29 | High | Manual (confirmed live — real accidental denial, reproduces Silver's TC-SIL-032) |
| TC-NOR-209 | [Live, real device] "Resend Link" after an Action-Required DigiLocker denial correctly issues a fresh link; completing authorization properly resolves the status to Successful | Happy Path (Live) | AC29 | High | Manual (confirmed live — real recovery from the denial in TC-NOR-208) |
| TC-NOR-210 | Once Guardian Details is finalized (Successful), the outer step converges into a new top-level "Applicant Photo" stage for the minor themselves | Happy Path (Live) | AC16, AC29 | Critical | Manual (confirmed live) |
| TC-NOR-211 | [CONFIRMED, non-defect] "Verified Photo" for the minor's own Applicant Photo shows a clear "No Verified Photos Available" toast rather than silently failing (no Aadhaar/Liveliness source exists for a non-DigiLocker-verified minor); camera capture works as the fallback for both Photo and Signature | Negative/UI (Live) | AC16, AC29 | Medium | Manual (confirmed live — cleaner failure mode than Silver's equivalent "silently non-functional" finding) |
| TC-NOR-212 | Minor UI note: the Summary page abbreviates "Select Identification Document" to "AC" instead of the full "AADHAAR CARD" value entered — display-only, not a functional defect | UI Note (Live) | AC21, AC29 | Low | Manual (confirmed live) |

### Lead Details (AC20)

| ID | Title | Type | AC | Priority | Automation |
|---|---|---|---|---|---|
| TC-NOR-150 | Lead Converter Code and Sourcer Code each have an independent "Verify" action that must succeed before the step's Submit is usable | Happy Path (Live) | AC20 | Critical | Manual (confirmed live) |
| TC-NOR-151 | A valid, real code resolves to the correct sourcer/converter name and shows a "Change" option in place of "Verify" once confirmed | Happy Path (Live) | AC20 | Critical | Manual (confirmed live — SAH09078 → PAVAN KISAN SHEWALE, both fields) |

### Summary + Final Submission (AC21, AC22)

| ID | Title | Type | AC | Priority | Automation |
|---|---|---|---|---|---|
| TC-NOR-160 | Summary page displays a full read-only recap of every stage's entered data, in stage order | Happy Path | AC21 | Critical | Manual (confirmed live) |
| TC-NOR-161 | Field-by-field cross-verification of the Summary against everything entered across all prior stages catches data-integrity issues before submission (this pass caught BUG-NORMAL-002's document loss) | Process/QA Practice | AC21 | Critical | Manual (confirmed live — this is the safeguard that surfaced BUG-NORMAL-002) |
| TC-NOR-162 | Final Submit on the Summary page fires `POST /app/summary/submit`, returns `{"msgCode":"ENDMOD_200","success":"TRUE"}`, and shows the success toast/message | Happy Path (Live) | AC22 | Critical | Manual (confirmed live) |
| TC-NOR-163 | After final submission, the application no longer appears in the Pending tab and appears in the Submitted tab with status "Sourcer Submit" | Happy Path (Live) | AC22 | Critical | Manual (confirmed live — SAH-1001-796: Pending 0 results, Submitted 1 result) |

---

## 3. Coverage Summary

- **Total test cases documented:** 87 (TC-NOR-001 through TC-NOR-212, numbered by section)
- **Confirmed live / executed:** 85
- **Not yet executed (flagged as future follow-up):** 2 — remaining non-Salaried/non-Self-employed/non-Unemployed Employment Type routing sweep (TC-NOR-093: Professional, Agriculture/Farmer, Retired, Housewife, Other, Business), invalid Introducer Account Number (TC-NOR-142). Additionally, a full Funding Mode × Employment Type branching matrix (as Silver's AC27 did) has not been swept — only Cheque+Salaried (Joint), Cash+Self-employed (Individual), and Cash+Unemployed (Minor) combinations have been tested so far.
- **New confirmed defects:** 5 (BUG-NORMAL-001 through BUG-NORMAL-005) — see `reports/NORMAL_TS001-defect-sheet.xlsx`
- **BUG-NORMAL-005 (Low, spelling/data-quality, found 2026-08-17 via desk review of Salaried Information's Designation/Profession dropdown, captured live on `SAH-1001-813`-era exploration):** the Designation/Profession dropdown contains duplicate entries — "Shop Owner", "Hotel Owner", "Dairy Farmer", and "Labourer" each appear **twice** in the same option list — and "Ngo Worker" should be capitalized as "NGO Worker" (acronym). Confirmed identically on the Staff Salary Account's Designation dropdown (same shared list, SAH-1003-813) — tracked under Staff Salary Account's own suite (`specs/STAFF_TS001-test-plan.md`), not repeated here.
- **Cross-project finding:** the Joint-Account-Type pass's Branch Selection investigation (TC-NOR-062) retracted a false defect claim made earlier in that session and cast doubt on the Silver Savings Account's previously-reported BUG-SILVER-009 — recommend re-verifying that defect before it is relied upon in the Silver report.
- **Cross-scheme finding:** both the Individual-Account-Type pass (TC-NOR-143) and the Minor-Account-Type pass (TC-NOR-144) found that Normal Savings Account's routing differs from Silver's — Introducer Details is mandatory for Individual AND Minor here, but skipped entirely for both on Silver (only Joint requires it there). All three Account Types require Introducer Details on the Normal Savings Account. Confirms the user story's original caution not to assume the two schemes share routing rules.
- **All three Account Types now fully traced end to end** for the Normal Savings Account (Joint, Individual, Minor), matching the depth of coverage already achieved for the Silver Savings Account.
- **Applications submitted for real this project:** `SAH-1001-796` (Joint, Shubham Madhukar Borse), `SAH-1001-805` (Individual, Yash Pravin Sonawane), `SAH-1001-806` (Minor, Bhushan Vishnu Joshi, guardian Shubham Madhukar Borse), and `SAH-1001-808` (Individual, Yash Pravin Sonawane — the first fully-scripted end-to-end run, `msgCode:"ENDMOD_200"`) — all confirmed moved from Pending to Submitted ("Sourcer Submit").

---

## 4. Automation — Dedicated Per-Flow Scripts

Each Account Type has its own complete, independently-executable spec covering Mobile Verification through real final Submit:

| Account Type | Spec file |
|---|---|
| Individual | `tests/9_NORMAL_TS001/normal-savings-individual.spec.ts` (live-verified end-to-end 2026-08-14, application SAH-1001-808) |
| Joint | `tests/9_NORMAL_TS001/normal-savings-joint.spec.ts` |
| Minor | `tests/9_NORMAL_TS001/normal-savings-minor.spec.ts` |

Shared step library: `tests/support/savingsApplicationFlow.ts` (also used by the Silver scheme's dedicated scripts). Mobile OTP is relayed via a signal file (see `tests/support/signalFile.ts`); DigiLocker/Liveliness are handled by polling the live status (no typed input needed — the applicant acts on their own phone). All three are tagged `test.skip(!!process.env.CI, ...)` — manually-assisted, not silently omitted from the suite, just skipped-with-reason when no human is available to relay input. Each requires real, not-recently-used mobile numbers supplied via env vars (`SAHAYOG_NOR_IND_MOBILE`, `SAHAYOG_NOR_JNT_MOBILE`/`SAHAYOG_NOR_JNT_CO_MOBILE`, `SAHAYOG_NOR_MIN_MOBILE`/`SAHAYOG_NOR_MIN_GUARDIAN_MOBILE`). Unlike Silver, all 3 Account Types on Normal require Introducer Details.
