# STAFF_TS001 — Test Plan: Staff Salary Account (Scheme 1003) Application Journey

**Story:** `user-stories/US_010_Staff_Salary_Account_Journey.md` (Story ID **US_010**)
**Analysis:** `specs/STAFF_TS001-story-analysis.md`
**Evidence:** `specs/STAFF_TS001-exploration-log.md`
**Module:** Savings Application → New Application → `Staff Salary Account - 1003`
**Route under test:** `/applndetails` (all 13 stages share it) — reached via `/HOME` → `/UNPOSTED` → `/schemelist`
**Environment:** `https://sahyogagentweb.drutam.in:9634` (UAT) · `nayan.aher@netwinindia.in` / `Sahayog@2025`
**Priority:** High
**Plan date:** 2026-08-18

---

## 0. Scope, Strategy and Safety

### 0.1 Test strategy — seed-and-resume

Scheme 1003 has **three human-only gates** (SMS OTP, DigiLocker consent, Liveliness), each
capped at 3 attempts and each consuming a real SMS to a real person. **A cold end-to-end run
cannot be automated.** The plan therefore splits into three execution bands:

| Band | What it covers | How it runs |
|---|---|---|
| **A — Cold-safe** | Everything reachable **without creating a record**: login, dashboard, scheme selection, scheme search, the Mobile Number Verification form up to (but not including) "Send Verification Code" | Fully automated, unattended, repeatable, zero side effects |
| **B — Seed-resume** | Everything from a **seeded application already past Liveliness** through to the Summary: Address, Branch, Basic Details, Salaried Info, Applicant Photo, Nominee, Documents, Introducer, Lead, Summary | Automated, unattended, **given** the seed + the two external fixtures + the fake-video config |
| **C — Manual / blocked** | The three human gates, OTP expiry, attempt-cap exhaustion, DL/Voter Id success paths, and **the final Submit** | Manual, attended, or permanently blocked — each case carries an explicit Blocked reason |

**Seed application:** `SAH-1003-812` — parked on the Summary with all 13 steps complete and
**unsubmitted**. Read-only fixture for Summary-level coverage.
**Never touch:** `SAH-1003-772` (a real third-party in-progress draft).

### 0.2 Mandatory external fixtures

| Fixture | Env var | Used by | Consequence if missing |
|---|---|---|---|
| Valid CBS account number | `STAFF_CBS_ACCOUNT` | Introducer Details | Step cannot pass; an **invalid** value fails *silently* (D-31) — the test **hangs** rather than fails |
| Valid staff code | `STAFF_LEAD_CODE` | Lead Details (Converter + Sourcer) | Step cannot pass |
| Seed applicant id | `STAFF_SEED_APPLICANT_ID` (default `SAH-1003-812`) | Band B + Summary cases | Band B skips |
| Fake video device | Playwright launch args | Applicant Photo | Signature capture impossible — **no non-camera path exists** |

Every fixture-dependent test **skips with a stated reason** rather than failing when its
fixture is absent, so an unconfigured run reports honestly instead of red.

### 0.3 Safety rules binding every case in this plan

1. ⛔ **The Summary's Submit is never clicked.** AC22 is asserted by inspecting the gate's
   presence and initial state only. Irreversible; Cancel is the only exit and is itself one-way.
2. ⛔ **Application Cancel is never exercised.**
3. ⚠️ **Driving Licence and Voter Id are real government lookups** — negative probes only,
   never a valid document number.
4. ⚠️ **OTP / DigiLocker / Liveliness sends are capped at 3** — no test may exhaust a budget.
5. ⚠️ **No real applicant PII** in any spec, fixture, screenshot or report.
6. ⚠️ Prefer resuming a seeded application over creating a new record.

### 0.4 Test-case ID scheme

`TC-STAFF-NNN`. Automation column: **A** = automated in `tests/10_STAFF_TS001/`,
**M** = manual, **B** = blocked (reason stated), **F** = fixture-gated (auto-skips).

### 0.5 Expected-fail cases

Four ACs are **not currently met** (AC14, AC15, AC19, AC20) and one is **mixed** (AC21).
Per the master prompt, these are written against the story's **required** behaviour, so they
fail until the product is fixed rather than freezing the defect in. Each carries
`test.fail()` in automation and is cross-linked to its defect ID.

---

## 1. Test Type 1 — Happy Path

| ID | Title | AC | Preconditions | Steps | Expected Result | Test Data | Pri | Auto |
|---|---|---|---|---|---|---|---|---|
| TC-STAFF-001 | Navigate Home → Savings Application → Dashboard | AC1 | Authenticated | 1. `/HOME` 2. Click "Savings Application" | `/UNPOSTED` loads with 4 status tabs and the application list | — | Critical | A |
| TC-STAFF-002 | Dashboard → New Application → Scheme Selection | AC1 | On `/UNPOSTED` | 1. Click "New Application" | `/schemelist` loads; 3 schemes under product "Savings Account" | — | Critical | A |
| TC-STAFF-003 | Scheme Selection lists Staff Salary Account - 1003 | AC1 | On `/schemelist` | 1. Read the scheme cards | `Staff Salary Account - 1003` present alongside 1001 and 1002 | — | Critical | A |
| TC-STAFF-004 | Selecting 1003 opens its journey **without creating a record** | AC1 | On `/schemelist` | 1. Click `Staff Salary Account - 1003` | `/applndetails`; header shows Product "Savings Account" + Scheme "Staff Salary Account - 1003"; **no Applicant Id**; stepper has exactly one tab "Mobile Number Verification" | — | Critical | A |
| TC-STAFF-005 | A fresh draft exposes exactly one stepper stage | AC1, AC13 | On `/applndetails`, fresh | 1. Enumerate stepper tabs | Exactly 1 tab: "Mobile Number Verification". No future stages rendered | — | High | A |
| TC-STAFF-006 | Full cold journey to Summary | AC1–AC22 | Real handset + DigiLocker + physical applicant | Walk all 13 steps | Summary renders 13 sections | Real applicant | Critical | **B** — three human gates; cannot run unattended |
| TC-STAFF-007 | Resume a seeded application to the Summary | AC12, AC21 | Seed past Liveliness | 1. Dashboard → row View 2. Drive Address→Lead | Summary reached unattended | `SAH-1003-812` | Critical | F |
| TC-STAFF-008 | Application record is created on OTP send | AC3 | Fresh draft, spare SMS budget | 1. Enter a valid 10-digit mobile 2. Send Verification Code | Applicant Id `SAH-1003-nnn` appears; mobile disabled; OTP panel + timers + "Change Mobile Number?" + Submit appear | Real handset | Critical | **B** — consumes a real SMS and creates a live record |
| TC-STAFF-009 | Valid OTP advances **directly** to eKYC | AC3, AC6 | OTP received | 1. Enter OTP 2. Submit | Mobile verified and locked; stepper gains "eKYC Verification" — **not** Account Type | Real OTP | Critical | **B** — human gate |
| TC-STAFF-010 | Aadhaar via DigiLocker completes and the step submits | AC9 | Applicant consents on handset | 1. Send Link 2. Applicant grants 3. Submit step | Badge `Pending`→`Successful`; `digilockerVerifyStatus: 1`; advances to Liveliness; header gains Applicant Name | Real DigiLocker | Critical | **B** — human gate |
| TC-STAFF-011 | Liveliness completes with one method and the step submits | AC10 | Applicant completes security-code check | 1. Send Link 2. Applicant photographs code 3. Submit | Badge → `Successful`; advances to Address Details | Real applicant | Critical | **B** — human gate |
| TC-STAFF-012 | Permanent address saved, then Communication copied | AC11 | On Address Details | 1. Add Permanent 2. Tick "Same as Permanent address" 3. Submit | Permanent saved read-only; **all seven** fields copied as structured values; advances to Branch Selection | Synthetic address | Critical | F |
| TC-STAFF-013 | Default branch submits on the first click | — | On Branch Selection | 1. Submit without changing | `POST branch/selection/submit/details`; advances to Basic Details on the **first** click | Pre-selected branch | High | F |
| TC-STAFF-014 | Basic Details (29 fields) submits and routes to Salaried Information | — | On Basic Details | 1. Complete all 29 fields 2. Submit | Saved; advances to **Salaried Information** unconditionally | Synthetic + `Is Staff`=YES, `Staff Id`=`STAFF0001` | Critical | F |
| TC-STAFF-015 | Salaried Information submits with only Designation completed | — | On Salaried Information | 1. Set Designation/Profession 2. Submit | Saved; advances to Applicant Photo | Any designation | High | F |
| TC-STAFF-016 | Applicant Photo: Verified Photo + camera signature submit together | AC16 | Fake video device + camera & geolocation granted | 1. Verified Photo → pick a source 2. Capture Using Camera for Signature 3. Submit | Both show `Document Uploaded`; `POST applicant/photo/save/doc`; advances to Nominee Details | Fake device | Critical | F |
| TC-STAFF-017 | Nominee (adult) + nominee address submit | AC18 | On Nominee Details | 1. Full Name, Relation, adult DOB 2. Submit 3. Accept the pre-checked nominee address 4. Submit | Age computes; no guardian block; advances to Document Upload | Synthetic nominee | Critical | F |
| TC-STAFF-018 | Introducer Details submits with a **valid** CBS account | — | Valid CBS fixture | 1. Name, Account Number, Period 2. Submit | `Details saved successfully!`; advances to Lead Details | `STAFF_CBS_ACCOUNT` | Critical | F |
| TC-STAFF-019 | Lead Details submits with both codes verified | — | Valid staff-code fixture | 1. Lead Converter Code → Verify 2. Sourcer Code → Verify 3. Submit | Each resolves to a staff name, locks, `Verify`→`Change`; advances to **Summary** | `STAFF_LEAD_CODE` | Critical | F |
| TC-STAFF-020 | Summary renders 13 sections in workflow order | AC21 | On Summary | 1. Read the Summary | 13 sections, one per workflow step, from a single `POST app/get/aosRequest/summary` | Seed | Critical | F |
| TC-STAFF-021 | Data persists across a full page reload | AC12 | Any completed step | 1. Reload `/applndetails` | Application resumes with every completed stage intact and locked | Seed | High | F |
| TC-STAFF-022 | Re-entry via Dashboard View reaches the same application | AC12 | Seed exists | 1. `/UNPOSTED` 2. Row View icon | Same application resumes at its current step | Seed | High | F |

---

## 2. Test Type 2 — Negative and Validation

| ID | Title | AC | Preconditions | Steps | Expected Result | Test Data | Pri | Auto |
|---|---|---|---|---|---|---|---|---|
| TC-STAFF-030 | Alphabetic input into Mobile Number is rejected outright | AC4 | Fresh draft | 1. Type `abcdefghij` | Field remains **empty**; no error text; no network request | `abcdefghij` | Critical | A |
| TC-STAFF-031 | Special characters are stripped from Mobile Number | AC4 | Fresh draft | 1. Type `98!@#76*54` | Only digits retained | `98!@#76*54` | High | A |
| TC-STAFF-032 | Fewer than 10 digits keeps the Send control hidden | AC4 | Fresh draft | 1. Type `98765` | "Send Verification Code" is **not visible**; no request issued | `98765` | Critical | A |
| TC-STAFF-033 | Exactly 10 digits reveals the Send control | AC4 | Fresh draft | 1. Type 10 digits | Control becomes visible. **Do not click.** | `9999999999` | Critical | A |
| TC-STAFF-034 | Mobile Number is capped at 10 digits | AC4 | Fresh draft | 1. Type 15 digits | Value is exactly 10 chars | 15 digits | High | A |
| TC-STAFF-035 | Boundary — 9 digits then a 10th then back to 9 | AC4 | Fresh draft | 1. 9 digits 2. add 1 3. remove 1 | Control hidden → visible → hidden again | — | Medium | A |
| TC-STAFF-036 | Expired OTP is rejected | AC5 | OTP older than 15 min | 1. Submit it | `Entered mobile number OTP is expired! ` — **and the HTTP status must reflect failure** | Expired OTP | High | **B** — needs a 15-min wait and a consumed send (D-03 expected-fail) |
| TC-STAFF-037 | PAN form submitted blank flags **all** missing mandatory fields | AC7 | eKYC step reachable | 1. Open PAN 2. Submit empty | Both `PAN Number is required` **and** the mandatory document error appear together | — | Medium | **Expected-fail** (D-08) — F |
| TC-STAFF-038 | 16-character PAN is rejected or flagged, not silently truncated | — | PAN panel open | 1. Type 16 chars | Rejection or a visible truncation notice | 16-char string | Low | **Expected-fail** (D-11) — F |
| TC-STAFF-039 | PAN without a document is rejected | — | PAN panel open | 1. Enter a PAN 2. Submit | `Upload PAN is required` | `DORPA8477P` | Medium | F |
| TC-STAFF-040 | A valid `.png` attached to PAN registers and uploads | — | PAN panel open | 1. Attach `tests/fixtures/dummy-pan-card.png` 2. Submit | Filename shown, an upload request fires, submit proceeds | Fixture png | High | **Expected-fail** (D-05) — F |
| TC-STAFF-041 | DL form submitted blank flags **both** mandatory fields | — | DL popup open | 1. Verify empty | `Enter driving licence number` **and** the DOB error appear together | — | Medium | **Expected-fail** (D-08) — F |
| TC-STAFF-042 | A 21-character nonsense DL number is rejected **client-side** | — | DL popup open | 1. Type 21 junk chars 2. Verify | Rejected before any external call is made | 21-char junk | High | **Expected-fail** (D-12) — F. ⚠️ Real gov't lookup — negative only |
| TC-STAFF-043 | Invalid DL verification returns a non-2xx status | AC14 | DL popup open | 1. Verify an invalid number 2. Inspect the response | HTTP status reflects failure, not `200` + `success:"FALSE"` | Invalid DL | High | **Expected-fail** (D-03) — F |
| TC-STAFF-044 | Voter Id form submitted blank is rejected | — | Voter popup open | 1. Verify empty | `Enter voter id number` | — | Medium | F |
| TC-STAFF-045 | Invalid Voter Id verification returns a non-2xx status | AC14 | Voter popup open | 1. Verify an invalid number | HTTP status reflects failure | Invalid Voter Id | High | **Expected-fail** (D-03) — F |
| TC-STAFF-046 | Aadhaar popup must not claim a link was sent before one is | — | eKYC step | 1. Open the Aadhaar card **without** sending | The popup must **not** read "The link has been sent on +91-…" | — | High | **Expected-fail** (D-04) — F |
| TC-STAFF-047 | Address form submitted blank flags all four mandatory fields | AC11 | Address popup open | 1. Submit empty | `Address Line 1 is required`, `State is required`, `City is required`, `Pin code is required` — **all simultaneously**; no network request | — | Critical | F |
| TC-STAFF-048 | Every Indian state and UT is selectable | AC15 | Address popup open | 1. Enumerate the State options | Bihar, Sikkim, Telangana and Ladakh present; `Rajasthan` correctly spelled; list correctly sorted | — | Critical | **Expected-fail** (D-15) — F |
| TC-STAFF-049 | City is filtered by the selected State | AC15 | Address popup open | 1. Select a State 2. Open City | Only that State's cities are offered (not 4,498 unfiltered) | `Maharashtra` | Critical | **Expected-fail** (D-16) — F |
| TC-STAFF-050 | An impossible State/City pair is rejected | AC15 | Address popup open | 1. `Maharashtra` + `Abohar` (Punjab) 2. Submit | Rejected by the client or the server; **not persisted** | Maharashtra/Abohar | Critical | **Expected-fail** (D-16) — F |
| TC-STAFF-051 | A populated Pin code survives later interaction in the same form | — | Address popup open | 1. Fill Pin code 2. Interact with other fields 3. Submit | Pin code retained; no `Pin code is required` | `431001` | High | **Expected-fail** (D-20) — F |
| TC-STAFF-052 | Unticking "Same as Permanent" restores previously-typed values | — | Comm. address partly typed | 1. Type values 2. Tick 3. Untick | Prior input restored, or a warning shown | Synthetic | Medium | **Expected-fail** (D-22) — F |
| TC-STAFF-053 | Applicant Photo without a Signature is rejected | AC16 | Photo registered only | 1. Submit | `Upload Applicant Signature is required` | — | High | F |
| TC-STAFF-054 | Nominee form submitted blank flags all three mandatory fields | AC18 | Nominee step | 1. Submit empty | Full Name, Relation and DOB errors appear together | — | High | F |
| TC-STAFF-055 | A **future** nominee DOB is rejected | AC19 | Nominee step | 1. Enter tomorrow's date | Rejected with a message; **no negative age** | Tomorrow | High | **Expected-fail** (D-30) — F |
| TC-STAFF-056 | Derived nominee Age is a non-negative **integer** | AC19 | Nominee step | 1. Enter a valid adult DOB 2. Read Age | Whole number of years — not `36.03` | `1990-01-15` | High | **Expected-fail** (D-30) — F |
| TC-STAFF-057 | Introducer form submitted blank flags all three mandatory fields | — | Introducer step | 1. Submit empty | All three errors together | — | High | F |
| TC-STAFF-058 | An unresolvable Introducer account surfaces an error | AC20 | Introducer step | 1. Enter a nonsense account 2. Submit | **An actionable error message is shown**, distinguishable from a click that did nothing | `0000000000` | Critical | **Expected-fail** (D-31) — F. ⚠️ Assert on a *visible error*, with a hard timeout — silent failure presents as a hang |
| TC-STAFF-059 | Verifying one Lead code preserves the other | — | Lead step | 1. Type Sourcer Code 2. Type + Verify Lead Converter Code | Sourcer Code value **retained** | Staff code | High | **Expected-fail** (D-34) — F |
| TC-STAFF-060 | The same staff code for both Lead roles is rejected or warned | — | Lead step | 1. Use one code for both 2. Verify both | Rejected, or a separation-of-duties warning | `STAFF_LEAD_CODE` | Low | **Expected-fail** (D-38) — F |
| TC-STAFF-061 | Document Upload with nothing attached is blocked or warned | — | Document step | 1. Submit empty | Blocked, or an explicit warning that no documents are attached | — | Critical | **Expected-fail** (D-35) — F |
| TC-STAFF-062 | Clicking a locked stepper tab explains itself | — | A locked step exists | 1. Click a locked tab | An explanation is shown, or the affordance is removed — not a silent no-op | — | Low | **Expected-fail** (D-18) — F |
| TC-STAFF-063 | An empty photo record is not reported as a `500` error | AC14 | Photo step, nothing submitted | 1. Load the step 2. Inspect `applicant/photo/get/doc` | An empty state is reported as empty, **not** as `500 "No record found!"` | — | Medium | **Expected-fail** (D-03) — F |

---

## 3. Test Type 3 — State-Aware UI Testing

| ID | Title | AC | Preconditions | Steps | Expected Result | Pri | Auto |
|---|---|---|---|---|---|---|---|
| TC-STAFF-070 | "Send Verification Code" disables during its own request | AC3 | 10 digits entered | 1. Click 2. Immediately click again | Disabled during processing; exactly **one** `aos/mobile/verify/save` fires | Critical | **B** — double-send would consume 2 of 3 SMS attempts |
| TC-STAFF-071 | Mobile Number becomes disabled after a successful send | AC3 | Send succeeded | 1. Attempt to edit | Field is `disabled`; "Change Mobile Number?" offered instead | High | **B** |
| TC-STAFF-072 | Verified Photo popup's Submit is disabled until a source is chosen | AC16 | Photo step | 1. Open Verified Photo 2. Inspect Submit before choosing | Submit `disabled`; enables only after a source is selected | High | F |
| TC-STAFF-073 | Lead `Verify` becomes `Change` and locks its input on success | — | Lead step | 1. Verify a code | Input becomes read-only; button label is `Change`; staff name displayed | High | F |
| TC-STAFF-074 | eKYC step Submit shows a loading state, not a frozen panel | — | eKYC step | 1. Submit | "Please wait while we are fetching existing customer data" replaces the panel | Medium | **B** — human gate upstream |
| TC-STAFF-075 | An upstream timeout surfaces an error and a retry control | — | Upstream failure induced | 1. Trigger 2. Observe | An error and a retry are offered — not an indefinite spinner | Low | **Expected-fail** (D-07) — M, not reliably inducible |
| TC-STAFF-076 | Branch Selection Submit does not double-save on rapid re-click | — | Branch step | 1. Click Submit twice rapidly | One `branch/selection/submit/details`; no duplicate state | Medium | F |
| TC-STAFF-077 | Address popup Cancel closes and initiates nothing | AC8 | Address popup open | 1. Cancel | Popup closes; **zero** network requests issued | High | F |
| TC-STAFF-078 | DigiLocker popup Cancel closes and sends no link | AC8 | eKYC step | 1. Open Aadhaar 2. Cancel | Popup closes; **no** `digilocker/send/link`; status stays 0 | Critical | F |
| TC-STAFF-079 | DL / Voter Id popup Cancel initiates nothing | AC8 | eKYC step | 1. Open each 2. Cancel | No verification request fires | High | F |
| TC-STAFF-080 | Liveliness popup Cancel initiates nothing | AC10 | Liveliness step | 1. Open 2. Cancel | No `aos/liveliness/save/details` | High | F |
| TC-STAFF-081 | A completed step re-opens read-only with a confirmation | AC13 | Any completed step | 1. Click its tab | "<Stage> submitted successfully." with a Done icon; no editable inputs | High | F |
| TC-STAFF-082 | An `isEditable: 1` step re-opens **editable and pre-populated** | AC21 | Summary reached | 1. Click Basic Details | Editable form, values pre-filled, dropdowns retaining their selections | High | F |
| TC-STAFF-083 | An `isEditable: 0` step re-opens read-only **with no Submit** | AC21 | Summary reached | 1. Click Branch Selection | Read-only; **no Submit button** | High | F |
| TC-STAFF-084 | Editable and locked stepper tabs are visually distinguishable | — | Summary reached | 1. Inspect all 13 tabs | Locked steps are visually distinct from editable ones | Low | **Expected-fail** (D-42) — F |
| TC-STAFF-085 | The Summary's Submit is **disabled** until a declaration is accepted | AC22 | Summary reached | 1. Inspect Submit on load | Submit is `disabled`; a declaration/consent is present. ⛔ **Never click it** | Critical | **Expected-fail** (D-43) — F |

---

## 4. Test Type 4 — Full CRUD Coverage

| ID | Entity | Op | Title | AC | Expected Result | Pri | Auto |
|---|---|---|---|---|---|---|---|
| TC-STAFF-090 | Application | C | Record is created **only** on OTP send | AC3 | No Applicant Id after scheme selection; `SAH-1003-nnn` after send | Critical | Partial A (pre-send half) / B |
| TC-STAFF-091 | Application | R | The 1003 draft appears on the Dashboard with Customer Type **Individual** | AC6 | Row lists the applicant with Customer Type "Individual" | High | F |
| TC-STAFF-092 | Application | R | Applicant Id format embeds the scheme code | — | Matches `/^SAH-1003-\d+$/` | High | F |
| TC-STAFF-093 | Application | U | Exactly 6 of 13 steps are re-editable | — | Address, Basic, Photo, Nominee, Document, Lead reopen editable; the other 7 do not | High | F |
| TC-STAFF-094 | Application | D | Cancel is present on the Dashboard row menu | — | Menu item exists. ⛔ **Never invoked** — irreversible | Medium | **B** |
| TC-STAFF-095 | Address | C | Permanent address saves and renders read-only | AC11 | Saved values rendered; **no edit/delete affordance** | High | F |
| TC-STAFF-096 | Address | U | A saved address can be corrected | — | An edit affordance exists | Medium | **Expected-fail** (D-37/FR-37) — F |
| TC-STAFF-097 | Address | C | "Same as Permanent" copies all **seven** fields as structured values | AC11 | All seven populated; `sameAsRegaddrReq: 1` persisted | High | F |
| TC-STAFF-098 | Nominee | C | A nominee is created with name, relation and DOB | AC18 | Saved; advances to the nominee address page | High | F |
| TC-STAFF-099 | Nominee | R | The Summary shows the **full** nominee record | AC21 | Relation, DOB, age and address all displayed | High | **Expected-fail** (D-40) — F |
| TC-STAFF-100 | Nominee | U | Nominee Details reopens editable and pre-populated | AC21 | `isEditable: 1` — values retained | Medium | F |
| TC-STAFF-101 | Nominee | D | Nomination can be declined | — | A decline path exists | Medium | **Expected-fail** (BR-23 / D-G18) — F |
| TC-STAFF-102 | Documents | C | An attached document registers and uploads | — | Filename displayed; upload request fires | Critical | **Expected-fail** (D-05) — F |
| TC-STAFF-103 | Documents | R | The Summary states when **no** documents are attached | AC21 | Explicit "no documents" statement, not a bare heading | Critical | **Expected-fail** (D-35) — F |
| TC-STAFF-104 | Photo/Signature | C | Both images register and are geo-stamped independently | AC16 | Each stored with its own lat/long/address; photo records `photoReferenceFrom` | Critical | F |
| TC-STAFF-105 | Photo/Signature | R | The captured images are visible for review | AC21 | Photo and signature rendered as images at capture and on the Summary | High | **Expected-fail** (D-36) — F |
| TC-STAFF-106 | Photo/Signature | R | Documents registered but **not** submitted do not persist | AC17 | On resume, `photoScanDocId: null` and the capture UI is shown again — **correct as-is** | High | F |
| TC-STAFF-107 | Branch | R | "Change Branch?" lists 7 further branches with name/Id/address | — | Searchable list rendered | Medium | F |
| TC-STAFF-108 | Branch | R | Branch master data contains no duplicate records | — | `Sadak Arjuni Branch` appears once, not under two Ids | Low | **Expected-fail** (D-23) — F |
| TC-STAFF-109 | Scheme | R | Scheme search returns only matching active schemes | AC2 | Only 1003 for `staff`; inactive schemes excluded | High | A |
| TC-STAFF-110 | Lead codes | U | A verified code can be changed via `Change` | — | `Change` re-opens the input for re-verification | Medium | F |

---

## 5. Test Type 5 — Business Rule Enforcement

One case per business rule. Rules the system does **not** enforce (BR-26, BR-29, BR-31) are
tested against the story's *required* behaviour and marked expected-fail.

| ID | BR | Title | Expected Result | Pri | Auto |
|---|---|---|---|---|---|
| TC-STAFF-120 | BR-01 | No record exists before a successful OTP send | Dashboard count unchanged after scheme selection alone | Critical | A |
| TC-STAFF-121 | BR-02 | Applicant Id embeds scheme code 1003 | `/^SAH-1003-\d+$/` | High | F |
| TC-STAFF-122 | BR-03 | **1003 offers no Account Type step at any point** | Stepper never contains "Account Type"; no Individual/Joint/Minor choice appears; Customer Type recorded "Individual" | **Critical** | F |
| TC-STAFF-123 | BR-04 | No step can be skipped | Only reached stages appear; `skipAllowed: 0` on all but `APPL_DOCUMENT` | Critical | F |
| TC-STAFF-124 | BR-05 | A completed step is locked | Re-entry is read-only | High | F |
| TC-STAFF-125 | BR-06 | The verified mobile is immutable | Field `disabled` | High | F |
| TC-STAFF-126 | BR-07 | OTP sends capped at 3 | 4th send rejected | High | **B** — exhausting strands the record |
| TC-STAFF-127 | BR-08 | OTP validity 15 min, server-enforced | Server rejects even when the client already shows expired | High | **B** |
| TC-STAFF-128 | BR-09 | Only Aadhaar is mandatory in eKYC | Exactly one `*` among four cards; step submits with Aadhaar alone | Critical | F |
| TC-STAFF-129 | BR-10/11 | DigiLocker capped at 3 sends, 25-min validity | Response reports the remaining attempts and `linkExpiryMin: 25` | Medium | F (assert config only) |
| TC-STAFF-130 | BR-12 | Cancelling any verification popup initiates nothing | Zero requests across DigiLocker, DL, Voter Id, Liveliness, Address | High | F |
| TC-STAFF-131 | BR-13 | PAN requires number **and** document | Neither alone submits | Medium | F |
| TC-STAFF-132 | BR-14 | PAN's 4th character must be `P` | A non-`P` 4th char is rejected | Medium | **B** — blocked by D-05; config-only evidence |
| TC-STAFF-133 | BR-15 | The two Liveliness methods are alternatives | Both cards present; neither starred; one suffices | High | F |
| TC-STAFF-134 | BR-17 | Both addresses are mandatory | Neither section can be left empty | Critical | F |
| TC-STAFF-135 | BR-18 | Country is fixed to India | `disabled`, value `India` | High | F |
| TC-STAFF-136 | BR-20 | Photo **and** Signature both mandatory | Photo alone will not submit | Critical | F |
| TC-STAFF-137 | BR-21 | Captured docs persist only on a successful step Submit | Abandoned captures absent on resume | High | F |
| TC-STAFF-138 | BR-22 | Each image carries its own geo/time stamp | Two distinct stamp sets in the save payload | High | F |
| TC-STAFF-139 | BR-23 | A nominee is unconditionally mandatory | No decline control exists anywhere on the step | High | F |
| TC-STAFF-140 | BR-24 | **A minor nominee reveals 5 mandatory guardian fields** | Guardian Name, Relation, Address, DOB, Age all appear and are mandatory; an adult DOB collapses them cleanly with no residue | **Critical** | F |
| TC-STAFF-141 | BR-25 | The nominee address defaults to the applicant's | `Use Existing Address` pre-checked, every field pre-filled | High | F |
| TC-STAFF-142 | BR-26 | Document Upload must **not** be silently skippable | Submitting empty is blocked or warned | Critical | **Expected-fail** (D-35) — F |
| TC-STAFF-143 | BR-27 | The introducer account is resolved against CBS | Response carries `bankAccountUserName`, `introducerCustomerId`, `isNameMismatch` | High | F |
| TC-STAFF-144 | BR-28 | Both Lead codes must be verified before submit | Submit is refused with an unverified code | High | F |
| TC-STAFF-145 | BR-29 | Lead Converter and Sourcer must be distinct | The same code for both is rejected or warned | Low | **Expected-fail** (D-38) — F |
| TC-STAFF-146 | BR-30 | Exactly 6 of 13 steps remain re-editable | Enumerated and matched | High | F |
| TC-STAFF-147 | BR-31 | **A declaration gates the final submission** | Declaration present; Submit disabled until accepted. ⛔ Never clicked | **Critical** | **Expected-fail** (D-43) — F |
| TC-STAFF-148 | FR-41 | `Is Staff` and `Staff Id` exist and are mandatory on 1003 | Both present; `Is Staff` is a dropdown; `Staff Id` mandatory, maxLength 100 | **Critical** | F |
| TC-STAFF-149 | FR-42 | `Employment Type` and `Initial Funding Amount` are **absent** on 1003 | Neither field exists on Basic Details | High | F |
| TC-STAFF-150 | D-27 | `Staff Id` is validated against a staff master | A nonsense Staff Id is rejected or verified against an employee register | **High** | **Expected-fail** (D-27) — F |
| TC-STAFF-151 | FR-49 | Basic Details routes to Salaried Information **unconditionally** | No Employment Type branch exists on 1003 | High | F |

---

## 6. Test Type 6 — Form Field Deep Validation

| ID | Title | Form | Expected Result | Pri | Auto |
|---|---|---|---|---|---|
| TC-STAFF-160 | Every eKYC card renders in fixed order | eKYC | Aadhaar, PAN, Driving Licence, Voter Id — in that order | High | F |
| TC-STAFF-161 | The DigiLocker popup's mobile field is disabled and pre-filled | DigiLocker | `disabled`, showing the verified number | High | F |
| TC-STAFF-162 | The State dropdown is API-populated, not hardcoded | Address | Options come from `master/data/get/states`; non-empty | High | F |
| TC-STAFF-163 | The City dropdown is API-populated | Address | Non-empty, API-sourced | High | F |
| TC-STAFF-164 | Address Line 1/2 and Area are `<textarea>` at maxLength 255 | Address | Element type and maxLength confirmed | Medium | F |
| TC-STAFF-165 | Pin code is numeric-only at maxLength 6 | Address | Non-digits rejected; capped at 6 | Medium | F |
| TC-STAFF-166 | Address Proof upload is optional | Address | Submits without it | Medium | F |
| TC-STAFF-167 | Basic Details presents exactly 29 fields | Basic | Count matches | High | F |
| TC-STAFF-168 | Name and DOB are auto-filled from eKYC and disabled | Basic | Full name and DOB `disabled` and populated | High | F |
| TC-STAFF-169 | `Is Staff` is a mandatory dropdown containing exactly one option | Basic | Single option `YES`, pre-set, uncleaerable | High | F |
| TC-STAFF-170 | `Staff Id` accepts free text up to 100 chars with no mask | Basic | maxLength 100; no pattern validation; no lookup request | High | F |
| TC-STAFF-171 | Mode of Operation is filtered to modes valid for an Individual-only scheme | Basic | `Jointly` / `Guardian` / `Jointly With Others` not offered | Low | **Expected-fail** (D-25) — F |
| TC-STAFF-172 | `Spouse / Father's Name` has a realistic length limit or a visible hint | Basic | maxLength 20 is signposted, or raised | Low | **Expected-fail** (D-24) — F |
| TC-STAFF-173 | Basic Details retains entered values when revisited mid-entry | Basic | Values retained rather than discarded | High | **Expected-fail** (FR-48) — F |
| TC-STAFF-174 | Master dropdowns contain no duplicates or stray test data | Basic | `Designation/Profession` de-duplicated; no `MS computers` in Education; no `Metropolitian City`; no `Any Two Jointhly` | Low | **Expected-fail** (D-28) — F |
| TC-STAFF-175 | Salaried Information marks only Designation/Profession mandatory | Salaried | Exactly one `*` | Medium | F |
| TC-STAFF-176 | Annual Income defaults to `0.00` | Salaried | Default confirmed | Low | F |
| TC-STAFF-177 | Applicant Name on the Photo step is disabled and auto-filled | Photo | `disabled`, populated from eKYC | Medium | F |
| TC-STAFF-178 | Verified Photo offers Aadhaar and Liveliness as sources | Photo | Both listed | High | F |
| TC-STAFF-179 | The Capture Image dialog shows Address, Latitude, Longitude and Date Time | Photo | All four rendered plus a live preview and `Capture photo` | High | F |
| TC-STAFF-180 | A capture offers a preview and a retake | Photo | Thumbnail and retake available after capture | High | **Expected-fail** (D-36) — F |
| TC-STAFF-181 | Photo/Signature offer Browse **and** Camera consistently | Photo | Both options rendered once each; no duplicated label | High | **Expected-fail** (D-29) — F |
| TC-STAFF-182 | The nominee relation list is API-populated, de-duplicated and sorted | Nominee | 17 options from `relation/app/getRelationList`; no overlapping Wife/Husband vs Spouse sets | Medium | **Expected-fail** (D-37) — F |
| TC-STAFF-183 | Nominee Age is derived and read-only | Nominee | `disabled`, computed from DOB | Medium | F |
| TC-STAFF-184 | Nominee DOB declares `min` 1900-01-01 and `max` today | Nominee | Attributes present **and enforced** | High | **Expected-fail** (D-30) — F |
| TC-STAFF-185 | The Nominee Pin Code input carries a stable `name` attribute | Nominee | `name` is a field name, not the field's value | Low | **Expected-fail** (D-33) — F |
| TC-STAFF-186 | The nominee address popup adds Address Source and Address Type | Nominee | Both present and mandatory | Medium | F |
| TC-STAFF-187 | Introducer fields are free text at maxLength 255 | Introducer | All three confirmed | Medium | F |
| TC-STAFF-188 | `Period of Acquaintance` is structured (numeric + unit) | Introducer | Not unconstrained free text | Low | **Expected-fail** (FR-G20) — F |
| TC-STAFF-189 | Document Upload renders two document-type dropdowns and `+ Add Custom Document` | Document | Present and API-populated | Medium | F |
| TC-STAFF-190 | "Enter OTP" carries a mandatory marker | Mobile | `*` present | Low | **Expected-fail** (D-09) — B (needs a sent OTP) |

---

## 7. Test Type 7 — UI State Persistence

| ID | Title | Expected Result | Pri | Auto |
|---|---|---|---|---|
| TC-STAFF-200 | Scheme search results survive interacting with the details carousel | Filtered list retained | Medium | A |
| TC-STAFF-201 | Clearing the scheme search restores the full list | All 3 schemes return | Medium | A |
| TC-STAFF-202 | The active stepper tab survives a data load | Active tab unchanged after the step's payload resolves | High | F |
| TC-STAFF-203 | Navigating to the Summary and back to a step preserves that step's values | Round trip retains saved values, dropdowns included | High | F |
| TC-STAFF-204 | A page reload preserves the active step | Same step reopens | High | F |
| TC-STAFF-205 | Navigating away to `/HOME` and back resumes the application | State intact | High | F |
| TC-STAFF-206 | The left navigation (Home / My Profile / Notifications / About Us) renders on every wizard screen | Present throughout | Low | F |
| TC-STAFF-207 | Session expiry mid-flow, then re-login, resumes the application intact | All completed stages retained | High | M — expiry is not reliably inducible |

---

## 8. Test Type 8 — Audit and Data Recording

| ID | Title | Expected Result | Pri | Auto |
|---|---|---|---|---|
| TC-STAFF-210 | The application appears on the Dashboard immediately after creation | Row present with the correct Applicant Id, scheme and Customer Type | High | F |
| TC-STAFF-211 | Each completed step records a server-side status transition | `aos/steps/getdetails` reflects status 1 for completed steps | High | F |
| TC-STAFF-212 | The Summary payload records `subModVerified` per eKYC sub-module | `true` for Aadhaar, `false` for PAN/DL/Voter Id | High | F |
| TC-STAFF-213 | The Summary **renders** each eKYC/Liveliness pass-fail state | Verified state visible per sub-module, not just present in the payload | High | **Expected-fail** (D-39) — F |
| TC-STAFF-214 | Each captured image records its own geo/time stamp server-side | Two independent stamp sets persisted | High | F |
| TC-STAFF-215 | A failed introducer lookup is recorded, not just swallowed | The `503` CBS failure is surfaced to the user and traceable | High | **Expected-fail** (D-31) — F |
| TC-STAFF-216 | Every Summary value matches what was entered upstream | Field-by-field comparison finds no corruption — **currently correct** | Critical | F |
| TC-STAFF-217 | Null conventions on the Summary are consistent | One convention, not `NA` for optional and `-` for system fields | Low | **Expected-fail** (D-41) — F |
| TC-STAFF-218 | A transaction **count** renders as an integer | Not `120.00` | Low | **Expected-fail** (D-41) — F |

---

## 9. Test Type 9 — Third-Party Integration

| ID | Integration | Title | Expected Result | Pri | Auto |
|---|---|---|---|---|---|
| TC-STAFF-220 | DigiLocker | Send Link issues exactly one `POST digilocker/send/link` | One request; `Pending` badge; validity/resend timers | Critical | **B** — consumes a human-gate attempt |
| TC-STAFF-221 | DigiLocker | Opening the card issues **no** request | Zero requests on open; zero on Cancel | Critical | F |
| TC-STAFF-222 | DigiLocker | Status polling is backed off | `aos/ekyc/get/status/dtl` does not poll at a flat ~10 s with no backoff | Medium | **Expected-fail** (FR-19) — F |
| TC-STAFF-223 | Liveliness | The status endpoint's message names the correct module | Not "bank statement verification" | Low | **Expected-fail** (D-13) — F |
| TC-STAFF-224 | Liveliness | The security code is **not** returned to the initiating browser | `aos/liveliness/get/details` must not carry `photoSecuritycode` in plaintext | **Critical** | **Expected-fail** (D-14, Security) — F |
| TC-STAFF-225 | Mobile OTP | The OTP is **not** returned to the browser | `aos/mobile/verify/get/details` must not carry `mobileOtp` in any form | **Critical** | **Expected-fail** (D-02, Security) — F |
| TC-STAFF-226 | CBS | A valid introducer account resolves with a real name | `bankAccountUserName` non-null; `isNameMismatch` genuinely computed | High | **Expected-fail** (D-32) — F |
| TC-STAFF-227 | CBS | A CBS failure surfaces a user-readable message | Plain-language error, not a swallowed `503` inside a `200` | Critical | **Expected-fail** (D-31) — F |
| TC-STAFF-228 | Staff register | A Lead code resolves to a staff name | Name displayed; input locks | High | F |
| TC-STAFF-229 | Master data | The states endpoint returns a complete, correctly-spelled list | All states and UTs; `Rajasthan` spelled correctly | Critical | **Expected-fail** (D-15) — F |
| TC-STAFF-230 | Master data | The cities endpoint supports State-scoped querying | Cities filterable by State | Critical | **Expected-fail** (D-16) — F |
| TC-STAFF-231 | Gov't lookups | An invalid DL/Voter Id returns a non-2xx status | Failure reflected in the HTTP status | High | **Expected-fail** (D-03) — F. ⚠️ Negative probes only |
| TC-STAFF-232 | Scheme config | The per-scheme field-configuration API drives field rules | `aos/button/field/get/configuration/details` returns 1003's rules | Medium | F |
| TC-STAFF-233 | Workflow config | 1003 runs its own workflow definition | `aosWorkflowDtlUuid` ends `…stsa`, distinct from `…sas` and `…nsa` | High | F |
| TC-STAFF-234 | Camera/Geo | Capture works with a fake video device and granted permissions | Both required — permissions alone are insufficient | Critical | F |

---

## 10. Test Type 10 — Async and Race Conditions

| ID | Title | Expected Result | Pri | Auto |
|---|---|---|---|---|
| TC-STAFF-240 | Double-click "Send Verification Code" | Exactly one send; no duplicate applicant record | Critical | **B** — would consume 2 of 3 SMS attempts |
| TC-STAFF-241 | Double-click a step's Submit | One save request; no duplicate state; no double advance | High | F |
| TC-STAFF-242 | Navigate away mid-save, then return | No broken state; the step is either saved or cleanly not saved | High | F |
| TC-STAFF-243 | Click a stepper tab while a step's save is in flight | No corruption; the in-flight step completes or is cleanly abandoned | Medium | F |
| TC-STAFF-244 | Verify both Lead codes in rapid succession | Both retained and verified — the second is not cleared | High | **Expected-fail** (D-34) — F |
| TC-STAFF-245 | Reload immediately after a step Submit | The advanced state is reflected, not the previous step | High | F |
| TC-STAFF-246 | Capture a photo, then submit before the geo lookup resolves | Either blocked until resolved, or saved with a complete stamp — never a partial stamp | Medium | F |
| TC-STAFF-247 | Open the Verified Photo popup twice in succession | No duplicate registration; one `photoReferenceFrom` | Medium | F |

---

## 11. Cross-Cutting: Console and Network Hygiene

| ID | Title | Expected Result | Pri | Auto |
|---|---|---|---|---|
| TC-STAFF-250 | No console errors across scheme selection and the mobile step | Zero errors, zero warnings | High | A |
| TC-STAFF-251 | No 4xx/5xx responses during a Band A pass | All requests 2xx | High | A |
| TC-STAFF-252 | No endpoint reports failure as HTTP 200 with `success:"FALSE"` | Failures carry non-2xx statuses | Critical | **Expected-fail** (D-03, 8 endpoints) — A |
| TC-STAFF-253 | Page layout stays within the viewport at desktop width | No horizontal overflow | Medium | A |
| TC-STAFF-254 | The journey remains usable at a mobile viewport (375×667) | Key controls visible and reachable | Medium | A |

---

## 12. Coverage Roll-Up

### 12.1 By test type

| # | Test Type | Cases | Automated (A/F) | Manual (M) | Blocked (B) |
|---|---|---|---|---|---|
| 1 | Happy Path | 22 | 15 | 0 | 7 |
| 2 | Negative & Validation | 34 | 32 | 0 | 2 |
| 3 | State-Aware UI | 16 | 12 | 1 | 3 |
| 4 | Full CRUD | 21 | 19 | 0 | 2 |
| 5 | Business Rule | 32 | 29 | 0 | 3 |
| 6 | Form Field Deep Validation | 31 | 30 | 0 | 1 |
| 7 | UI State Persistence | 8 | 7 | 1 | 0 |
| 8 | Audit & Data Recording | 9 | 9 | 0 | 0 |
| 9 | Third-Party Integration | 15 | 13 | 0 | 2 |
| 10 | Async & Race | 8 | 7 | 0 | 1 |
| — | Console/Network Hygiene | 5 | 5 | 0 | 0 |
| | **Total** | **201** | **178** | **2** | **21** |

### 12.2 By AC

| AC | Cases | AC | Cases |
|---|---|---|---|
| AC1 | 001–005 | AC12 | 021, 022, 204, 205 |
| AC2 | 109, 200, 201 | AC13 | 005, 081, 123 |
| AC3 | 008, 070, 071, 090 | AC14 | 043, 045, 063, 252 |
| AC4 | 030–035 | AC15 | 048–050, 229, 230 |
| AC5 | 036 | AC16 | 016, 053, 072, 104, 234 |
| AC6 | 004, 009, 091, 122 | AC17 | 106, 137 |
| AC7 | 037, 128, 160 | AC18 | 017, 054, 098, 140 |
| AC8 | 077–080, 221 | AC19 | 055, 056, 184 |
| AC9 | 010, 220 | AC20 | 058, 215, 227 |
| AC10 | 011, 080, 133 | AC21 | 020, 082, 083, 099, 103, 105, 213, 216 |
| AC11 | 012, 047, 095, 097, 134 | AC22 | 085, 147 |

### 12.3 Defect regression guard

All 43 inherited defects (D-01…D-43) have at least one owning case. The 6 Critical ones:

| Defect | Owning case(s) |
|---|---|
| D-05 — document upload broken platform-wide | TC-STAFF-040, 102 |
| D-14 — liveliness security code exposed in plaintext | TC-STAFF-224 |
| D-15 — states missing from master data | TC-STAFF-048, 229 |
| D-16 — impossible State/City pair persisted | TC-STAFF-049, 050, 230 |
| D-35 — submission possible with zero documents | TC-STAFF-061, 103, 142 |
| D-43 — no declaration gates final submission | TC-STAFF-085, 147 |

---

## 13. Automation Build Order for Step 4

| # | Asset | Action | Rationale |
|---|---|---|---|
| 1 | `pages/savings-application/SchemeSelectionPage.ts` | **Reuse as-is** | Already correct for 1003 |
| 2 | `pages/savings-application/StaffSalaryApplicationPage.ts` | **New** | Mirrors Silver/Normal; asserts "Staff Salary Account - 1003" |
| 3 | `application-form/ApplicationFormFlow.ts` | **Update** | Must accept 1003 and must not assume an Account Type step |
| 4 | `application-form/MobileVerificationStep.ts` | **Update** | Its comment about the Send control's visibility is contradicted on 1003 (D-19) |
| 5 | `application-form/AddressDetailsStep.ts` | **New** | Both address sections + the popup |
| 6 | `application-form/BranchSelectionStep.ts` | **New** | Default + "Change Branch?" |
| 7 | `application-form/BasicDetailsStep.ts` | **New** | 29 fields incl. `Is Staff` / `Staff Id` |
| 8 | `application-form/SalariedInformationStep.ts` | **New** | — |
| 9 | `application-form/ApplicantPhotoStep.ts` | **New** | Capture Image dialog + Verified Photo popup; **no file input exists** |
| 10 | `application-form/NomineeDetailsStep.ts` | **New** | Two pages + the conditional guardian block. ⚠️ Pin code's `name` holds its *value* (D-33) — select by placeholder/position |
| 11 | `application-form/DocumentUploadStep.ts` | **New** | Submits empty (`skipAllowed: 1`) |
| 12 | `application-form/IntroducerDetailsStep.ts` | **New** | ⚠️ Assert on **advancing**, never on the absence of an error (D-31) |
| 13 | `application-form/LeadDetailsStep.ts` | **New** | ⚠️ Verify strictly in sequence — verifying the first clears the second (D-34) |
| 14 | `application-form/SummaryPage.ts` | **New** | Prefer parsing `summaryDataJson` (a JSON **string** — needs a second parse) over DOM scraping |
| 15 | `playwright.config.ts` | **Update** | Add a `chromium-camera` project: `--use-fake-device-for-media-stream`, `permissions: ['camera','geolocation']`, fixed `geolocation` |
| 16 | `tests/10_STAFF_TS001/*.spec.ts` | **New** | Suite, split by feature area |

### 13.1 Spec file layout

```
tests/10_STAFF_TS001/
  scheme-selection.spec.ts          Band A — TC-001..005, 109, 200, 201
  mobile-verification.spec.ts       Band A — TC-030..035, 120
  staff-scheme-structure.spec.ts    Band A/F — TC-004, 122, 233, 253, 254
  console-network-hygiene.spec.ts   Band A — TC-250..252
  ekyc-verification.spec.ts         Band F — TC-037..046, 078, 079, 128, 160, 161, 221
  address-details.spec.ts           Band F — TC-047..052, 077, 095..097, 134, 135, 162..166
  basic-details.spec.ts             Band F — TC-014, 148..151, 167..174
  applicant-photo.spec.ts           Band F (camera project) — TC-016, 053, 072, 104..106, 177..181
  nominee-details.spec.ts           Band F — TC-017, 054..056, 098..101, 140, 182..186
  introducer-lead.spec.ts           Band F — TC-018, 019, 057..060, 073, 143..145, 187, 188
  summary-review.spec.ts            Band F — TC-020, 082..085, 099, 103, 105, 147, 213, 216..218
  seed-application-builder.spec.ts  Band C — manually-assisted seed builder (mirrors 8_NSA_TS001)
```

---

## 14. Entry / Exit Criteria

**Entry**
* `US_010` is current and evidence-tagged (✅ 2026-08-18).
* UAT is reachable and the credentials are valid.
* `tests/.auth/user.json` is produced by `auth.setup.ts`.
* For Band B: the seed application exists past Liveliness, and both external fixtures are set.

**Exit**
* Every Band A and Band B case has run and its result is recorded.
* Every Band C case is recorded as Blocked **with its reason stated** — never silently dropped.
* Expected-fail cases are confirmed failing against their defect IDs (a *passing* expected-fail
  case means the product was fixed — retire the `test.fail()` and re-file the defect as Closed).
* `reports/STAFF_TS001-test-report.md` and `reports/STAFF_TS001-defect-sheet.xlsx` are produced.

---

## 15. Risks

| # | Risk | Impact | Mitigation |
|---|---|---|---|
| R1 | The seed application is submitted or cancelled by accident | **Total loss of Band B coverage**; irreversible | No spec ever clicks the Summary's Submit or the row's Cancel; the Summary page object exposes **no** submit method |
| R2 | External fixtures are unset | Introducer and Lead steps hang or fail misleadingly | Fixture-gated skips with explicit reasons |
| R3 | D-31's silent failure presents as a hang | Suite appears stuck | Hard per-step timeouts; assert on *advancing*, not on error absence |
| R4 | The fake video device or the matching browser build is missing | Photo step unrunnable | Dedicated `chromium-camera` project; specs skip with a stated reason |
| R5 | Human-gate attempt budgets are consumed by a rerun | An application is stranded | Band A never sends; Band B never re-verifies a completed gate |
| R6 | Real government DL/Voter Id lookups are hit with plausible data | External compliance exposure | Negative probes only, with obviously-invalid values |
| R7 | The seed drifts as the environment is reset | Band B silently skips | Seed builder spec is checked in and re-runnable |
