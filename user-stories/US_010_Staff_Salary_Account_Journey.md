# User Story: Open a Staff Salary Account (Scheme 1003) through the guided application journey

**Story ID:** US_010
**Suite ID:** STAFF_TS001
**Module:** Savings Application
**Sub-module:** New Application → Staff Salary Account - 1003
**Priority:** High
**Role:** Branch Origination Officer (sourcing agent), acting on behalf of a staff applicant
**Explored on:** 2026-08-17, extended 2026-08-18 (Pass 6 — journey completed to Summary)
**Explored against:** https://sahyogagentweb.drutam.in:9634 (UAT)
**Evidence log:** `specs/STAFF_TS001-exploration-log.md`

> Every behavioural statement below is tagged `[OBSERVED]`, `[REPO]`, `[INFERRED]`,
> `[NOT VERIFIED]`, `[GAP]` or `[DEFECT]` — see `prompts/ba_agent_prompt.md` §4.
> Untagged lines are not permitted.

> **Scope.** This story documents the journey **end to end through all 13 workflow steps and
> the Summary / Review screen**, which was reached and fully documented on 2026-08-18.
> **Final submission was deliberately NOT performed** — the Submit control is described but
> was never operated (§14.3). Everything after the Submit click — any confirmation dialog,
> the success screen, the resulting application status — remains `[NOT VERIFIED]`.
> Scheme 1003 runs its own workflow definition (`aosWorkflowDtlUuid` ending `…stsa`), distinct
> from Silver 1002 (`…sas`) and Normal 1001 (`…nsa`), so behaviour from those schemes is
> **not** transferable — anything sourced from them is tagged `[REPO]` and explicitly marked
> as not re-verified on 1003.

> **Scheme numbering.** Live values are authoritative: **Normal = 1001, Silver = 1002,
> Staff Salary = 1003**. The originating task envelope stated "Silver 1001, Normal 1002",
> which is inverted — see §15.3 D-17.

---

## 1. Module / Sub-module

| | |
|---|---|
| **Module** | Savings Application |
| **Sub-module** | New Application → Scheme Selection → `Staff Salary Account - 1003` |
| **Navigation path** | Login → Home → Savings Application → New Application → Staff Salary Account - 1003 |
| **Route(s)** | `/HOME` → `/UNPOSTED` → `/schemelist` → `/applndetails` |
| **Direct-URL reachable** | `/applndetails` — **Yes**, resumes the most recent application. Individual wizard stages have **no** route of their own; all share `/applndetails` — `[OBSERVED]` |
| **Related modules** | Savings Application Dashboard (US_006), Scheme Selection (US_007), Silver journey (US_008), Normal journey (US_009) |

---

## 2. User Story

**As a** Branch Origination Officer sourcing a staff salary account,

**I want** to capture a staff applicant's identity, verify it against Aadhaar and a liveliness
check, and record their address through a guided, step-by-step application,

**So that** a compliant, KYC-verified Staff Salary Account application can be submitted for
downstream approval.

---

## 3. Business Requirement

The Staff Salary Account is one of three savings schemes the society offers through the agent
portal. Its published purpose `[OBSERVED]` — from the scheme description served by
`scheme/getUserwiseAllscheme` — is to give employees "a zero-balance facility for hassle-free
monthly salary credits", with free debit card usage, loan concessions and priority digital
banking.

`[OBSERVED]` The scheme record carries **no attribute implementing any of those benefits**:
1003's `interestType`, `fromInterestRate`/`toInterestRate` (6.0) and `acType` (10) are
identical to Silver 1002 and Normal 1001, and there is no zero-balance or minimum-balance
field anywhere in the payload. `[NOT VERIFIED]` Whether those benefits are enforced by
downstream product configuration this exploration could not see.

`[OBSERVED]` Structurally, 1003 differs from its sibling schemes in one important way: it has
**no Account Type step**. Customer Type is fixed to **Individual**. `[INFERRED]` The product
is intended for a single employee account-holder — plausible for a staff salary product, but
this needs stakeholder confirmation (§14.2 A-01), because it removes the Joint and Minor
journeys and everything downstream of them.

---

## 4. Pre-conditions

* User is authenticated as a Branch Origination Officer — `[OBSERVED]`
* User has access to the Savings Application module (the "Savings Application" card is
  present on `/HOME`) — `[OBSERVED]`
* Scheme `Staff Salary Account - 1003` is active — inactive schemes are excluded by the
  caller (`inActiveAcRequired: 0`) — `[OBSERVED]`
* **A real Indian mobile handset is available to the applicant**, reachable by SMS, for the
  OTP, the DigiLocker consent link and the Liveliness link — `[OBSERVED]`
* **The applicant has a DigiLocker account with an Aadhaar document** and can grant document
  access — `[OBSERVED]`
* **The applicant is physically available** to perform a liveliness check (write a code on
  paper and photograph themselves, or complete a video check) — `[OBSERVED]`
* DigiLocker, the SMS gateway and the OTP service are operational — `[OBSERVED]`, and see
  §14.1: an upstream DigiLocker issue was encountered during this exploration

---

## 5. User Flow

### 5.1 Primary flow (as it works today — complete, to the Summary screen)

| # | Actor action | System response | Evidence |
|---|---|---|---|
| 1 | Click "Savings Application" on Home | Dashboard `/UNPOSTED` with 4 status tabs and the application list | `[OBSERVED]` |
| 2 | Click "New Application" | Scheme Selection `/schemelist`; 3 schemes listed under product "Savings Account" | `[OBSERVED]` |
| 3 | (Optional) Type in "Search Scheme Type" | Server-side search; list narrows | `[OBSERVED]` |
| 4 | Click `Staff Salary Account - 1003` | `/applndetails`; header shows Product + Scheme; stepper shows **only** "Mobile Number Verification". **No application record is created yet** | `[OBSERVED]` |
| 5 | Enter a 10-digit mobile number | "Send Verification Code" becomes visible (hidden below 10 digits) | `[OBSERVED]` |
| 6 | Click "Send Verification Code" | Applicant record created, **Applicant Id `SAH-1003-nnn`** appears in the header; mobile field becomes disabled; OTP field, timers, "Change Mobile Number?" and Submit appear | `[OBSERVED]` `POST aos/mobile/verify/save` |
| 7 | Enter the OTP received by SMS, Submit | Mobile verified; stepper gains "eKYC Verification" and switches to it | `[OBSERVED]` `POST aos/mobile/verify/submit/otp` |
| 8 | — | **No Account Type step is presented.** Module sequence 2 is eKYC Verification | `[OBSERVED]` |
| 9 | Open "Aadhaar Verification through DigiLocker", click "Send Link" | Card shows `Pending` + link validity/resend timers | `[OBSERVED]` `POST digilocker/send/link` |
| 10 | Applicant grants DigiLocker access on their handset | Card changes `Pending` → `Successful` | `[OBSERVED]` (outcome only — the consent act was performed by a human) |
| 11 | (Optional) Complete PAN / Driving Licence / Voter Id | Supplementary; not required to proceed | `[OBSERVED]` |
| 12 | Click the eKYC step's Submit | "Please wait while we are fetching existing customer data"; a system step runs | `[OBSERVED]` `POST existing/customer/data/submit` |
| 13 | — | Workflow advances to **Liveliness Verification**; header gains **Applicant Name** | `[OBSERVED]` |
| 14 | Open "Security Code Based Liveliness Verification", click "Send Link" | Guidelines popup → card shows `Pending` + timers | `[OBSERVED]` `POST aos/liveliness/save/details` |
| 15 | Applicant photographs themselves holding the written security code | Card changes `Pending` → `Successful` | `[OBSERVED]` (outcome only) |
| 16 | Click the Liveliness step's Submit | Workflow advances to **Address Details** | `[OBSERVED]` |
| 17 | Click "Click Here For Add Address" under Permanent address | Address popup opens with 8 fields | `[OBSERVED]` |
| 18 | Complete the Permanent address, Submit | Address saved and rendered read-only; **no edit affordance thereafter** | `[OBSERVED]` |
| 19 | Open Communication Address, tick "Same as Permanent address" | **All seven fields** copied as structured values; only Address Line 1 locked | `[OBSERVED]` |
| 20 | Submit the Address Details step | Advances to **Branch Selection**; a default branch is pre-selected | `[OBSERVED]` |
| 21 | (Optional) Click "Change Branch?" | Searchable list of 7 further branches, each with name/Id/address | `[OBSERVED]` |
| 22 | Submit the default branch | Saves on the **first** click; advances to **Basic Details** | `[OBSERVED]` `POST branch/selection/submit/details` |
| 23 | View Basic Details | 29 fields, incl. the 1003-only **Is Staff** and **Staff Id**; Name/DOB auto-filled from eKYC | `[OBSERVED]` |
| 24 | Complete all 29 Basic Details fields, Submit | Saved; advances to **Salaried Information** — unconditionally, as 1003 has no Employment Type field | `[OBSERVED]` |
| 25 | Complete Salaried Information (only Designation/Profession is mandatory), Submit | Saved; advances to **Applicant Photo** | `[OBSERVED]` |
| 26 | On Applicant Photo, choose "Verified Photo" | Popup lists **Aadhaar** and **Liveliness** photo sources; Submit correctly disabled until one is chosen | `[OBSERVED]` |
| 27 | Confirm the verified photo | Registers as **`Document Uploaded`** (requires camera + geolocation permissions granted) | `[OBSERVED]` |
| 28 | Click "Capture Using Camera" under Applicant Signature | A **`Capture Image`** dialog opens showing the reverse-geocoded **Address**, **Latitude**, **Longitude** and **Date Time**, a live video preview and a `Capture photo` button | `[OBSERVED]` |
| 29 | Click "Capture photo" | Dialog closes; Signature registers as `Document Uploaded`. **No preview or retake is offered** | `[OBSERVED]` |
| 30 | Submit the Applicant Photo step | Saved with both images **geo- and time-stamped independently**, plus `photoReferenceFrom`; advances to **Nominee Details** | `[OBSERVED]` `POST applicant/photo/save/doc` |
| 31 | Complete Nominee Details (Full Name, Relation, DOB) | Age auto-computes. **A minor DOB reveals 5 mandatory guardian fields**; an adult DOB collapses them | `[OBSERVED]` |
| 32 | Submit; open "Click Here For Add Address" on page 2 | Nominee address popup opens with **`Use Existing Address` pre-checked** and every field pre-filled from the applicant's permanent address | `[OBSERVED]` |
| 33 | Submit the nominee address, then the step | Advances to **Document Upload** | `[OBSERVED]` |
| 34 | Click Submit on Document Upload **with nothing attached** | **Advances silently with zero documents** — the only step configured `skipAllowed: 1` | `[OBSERVED]` |
| 35 | Complete Introducer Details (Name, Account Number, Period of Acquaintance) | The account number is **resolved against the Core Banking System**; on success the step advances to **Lead Details** | `[OBSERVED]` `POST introducer/save/details` |
| 36 | Enter Lead Converter Code, click `Verify` | Code resolves to a staff name, the input locks and `Verify` becomes `Change`. **Any value already typed into Sourcer Code is silently cleared** | `[OBSERVED]` |
| 37 | Enter and verify Sourcer Code, then Submit | Advances to the **Summary** screen | `[OBSERVED]` `POST lead/details/submit` |
| 38 | Review the Summary | **13 sections**, one per workflow step, rendered from a single `app/get/aosRequest/summary` call. Values match what was entered; several are omitted (§6.1 FR-70..73) | `[OBSERVED]` |
| 39 | (Correcting anything) Click a stepper tab | `isEditable: 1` steps reopen as **editable, pre-populated forms**; `isEditable: 0` steps reopen **read-only with no Submit**. Returning to Summary works | `[OBSERVED]` |
| 40 | Click the Summary's **Submit** | **NOT PERFORMED — not authorised.** The control is a bare `<button type="submit">Submit</button>`, enabled from load, with no declaration or consent gating it | `[NOT VERIFIED]` — deliberately |

### 5.2 Alternate / exit paths

* **Cancel (application-level)** — `[NOT VERIFIED]`. The Dashboard's row Action menu exposes
  Cancel `[REPO]` (SAD_TS001 BR5), but it is irreversible and was explicitly out of bounds.
* **Cancel (within a popup)** — closes the popup and initiates nothing. Verified on the
  DigiLocker, Driving Licence, Voter Id, Liveliness and Address popups — `[OBSERVED]`
* **Back / breadcrumb** — no back control exists within the wizard; navigation is via the
  stepper tabs only — `[OBSERVED]`
* **Stepper tab click** — a completed, locked step re-opens read-only showing e.g.
  "Mobile Number Verification submitted successfully."; a step whose `isEditable` is 0 while
  a later step is in flight is a **silent no-op** — `[OBSERVED]`
* **Browser back** — `[NOT VERIFIED]`, not probed.
* **Re-entry mid-flow** — Dashboard → row View icon, or direct `/applndetails`. Both resume
  the application with all completed data intact — `[OBSERVED]`

### 5.3 State transitions

| From | Trigger | To | Notes |
|---|---|---|---|
| *(no record)* | Send Verification Code succeeds | `MOBILE_VERIFICATION`, status 0 | Applicant Id assigned | 
| `MOBILE_VERIFICATION` 0 | Valid OTP submitted | status 1, `isEditable` 0 | Step locks permanently |
| — | ↳ same event | `EKYC_VERIFICATION` 0 created | **Not** Account Type |
| `EKYC_VERIFICATION` 0 | Step Submit with Aadhaar Successful | status 13 → 1 | 13 is a transient in-progress state |
| — | ↳ same event | `EXISTING_CUSTOMER_DATA` (system, no UI) 13 → 1 | `componentModule: 16` |
| `EXISTING_CUSTOMER_DATA` 1 | automatic | `LIVELINESS_VERIFICATION` 0 | Header gains Applicant Name |
| `LIVELINESS_VERIFICATION` 0 | Step Submit with one method Successful | advances | Either method suffices |
| — | ↳ same event | `ADDR_VERIFICATION` (seq 5) | Address Details |
| `ADDR_VERIFICATION` | Both addresses saved, step Submit | advances | — |
| — | ↳ same event | Branch Selection (seq 6) | Default branch pre-selected |
| Branch Selection | Submit | advances | Single click saves from the default view |
| — | ↳ same event | Basic Details (seq 7) | 29 fields |
| Basic Details | Submit | advances | Routes unconditionally — no Employment Type on 1003 |
| — | ↳ same event | Salaried Information (seq 10) | Only Designation/Profession mandatory |
| Salaried Information | Submit | advances | — |
| — | ↳ same event | Applicant Photo (seq 11) | Photo + Signature both mandatory |
| Applicant Photo | Both images captured, Submit | advances | Images geo-stamped; **discarded if the step is not submitted** |
| — | ↳ same event | Nominee Details (seq 12) | Two pages: details, then nominee address |
| Nominee Details | Both pages submitted | advances | Minor nominee ⇒ guardian block required |
| — | ↳ same event | Document Upload (seq 13) | **`skipAllowed: 1` — the only skippable step** |
| Document Upload | Submit (even with nothing attached) | advances | No warning on an empty submit |
| — | ↳ same event | Introducer Details (seq 15) | — |
| Introducer Details | Valid CBS account verified, Submit | advances | Invalid account ⇒ **silent failure, no advance** |
| — | ↳ same event | Lead Details (seq 16) | — |
| Lead Details | Both codes verified, Submit | advances | — |
| — | ↳ same event | **Summary** | Not a workflow step — no `stepCode` |
| Summary | **Submit** | `[NOT VERIFIED]` | **Not operated — irreversible and unauthorised** |

`[OBSERVED]` Steps carry `sequencialProcessing: 1` and `redirectionalProcessing: 1`. All are
`skipAllowed: 0` **except `APPL_DOCUMENT` (Document Upload), which is `skipAllowed: 1`** —
the single exception in the whole journey. Future stages are not visible in the stepper until
reached.

`[OBSERVED]` **Six of the thirteen steps are re-editable** (`isEditable: 1`): Address Details,
Basic Details, Applicant Photo, Nominee Details, Document Upload and Lead Details. The other
seven are permanently locked once submitted. Nothing in the UI distinguishes the two groups.

`[OBSERVED]` **The stepper's tab position and the server's `aosModuleSequence` disagree** —
Applicant Photo is the 9th tab but sequence 11; sequences 8, 9 and 14 do not exist on 1003.

---

## 6. Functional Requirements

### 6.1 Existing behaviour

| ID | Requirement | Evidence |
|---|---|---|
| FR-01 | Scheme Selection lists `Staff Salary Account - 1003` under product "Savings Account", alongside 1001 and 1002 | `[OBSERVED]` |
| FR-02 | Scheme search is server-side (`searchValue` in the request body), case-insensitive and substring-based; inactive schemes are excluded | `[OBSERVED]` |
| FR-03 | Selecting the scheme opens `/applndetails` **without** creating an application record | `[OBSERVED]` |
| FR-04 | The applicant record and its `SAH-1003-nnn` Applicant Id are created on the first successful "Send Verification Code" | `[OBSERVED]` |
| FR-05 | Scheme 1003 runs its own workflow definition (`…stsa`), separate from 1001 and 1002 | `[OBSERVED]` |
| FR-06 | **The 1003 workflow has no Account Type step.** Module sequence 2 is `EKYC_VERIFICATION` | `[OBSERVED]` |
| FR-07 | Customer Type is auto-assigned **Individual** with no user choice (`custType: "I"` on the scheme record; Dashboard shows "Individual") | `[OBSERVED]` |
| FR-08 | Mobile Number accepts digits only; alphabetic input is rejected outright; the field is capped at 10 digits | `[OBSERVED]` |
| FR-09 | "Send Verification Code" is hidden until a full 10 digits are entered | `[OBSERVED]` |
| FR-10 | After OTP send the Mobile Number field is disabled and a "Change Mobile Number?" link is offered | `[OBSERVED]` |
| FR-11 | OTP send is capped at **3 attempts** per application; the remaining count is returned in the response message | `[OBSERVED]` |
| FR-12 | OTP expiry is enforced **server-side** (`otpExpiryMin: 15`), even when the client already displays "OTP is expired" | `[OBSERVED]` |
| FR-13 | A completed step becomes non-editable (`isEditable: 0`) and re-opens read-only with a "submitted successfully" confirmation | `[OBSERVED]` |
| FR-14 | eKYC presents exactly four options in fixed order: Aadhaar via DigiLocker, PAN, Driving Licence, Voter Id | `[OBSERVED]` |
| FR-15 | Only Aadhaar carries the mandatory `*`; the step submits successfully with Aadhaar alone | `[OBSERVED]` |
| FR-16 | All four eKYC cards are openable from the outset; none is gated behind another | `[OBSERVED]` |
| FR-17 | DigiLocker link send is capped at **3 attempts**; configured link validity is 25 minutes | `[OBSERVED]` |
| FR-18 | The DigiLocker popup's mobile field is disabled and pre-filled with the verified number | `[OBSERVED]` |
| FR-19 | While a verification is Pending the client polls `aos/ekyc/get/status/dtl` roughly every 10 s with no backoff | `[OBSERVED]` |
| FR-20 | PAN Verification requires both a PAN Number and a supporting document (both mandatory) | `[OBSERVED]` |
| FR-21 | Field rules are **data-driven per scheme** and served by `aos/button/field/get/configuration/details` | `[OBSERVED]` |
| FR-22 | The configured PAN rule requires the 4th character to be `P` (`panno.charAt(3) != 'P'`) | `[OBSERVED]` — configured; `[NOT VERIFIED]` in the UI |
| FR-23 | Driving Licence Verification requires a Number and Date of Birth; its document is optional; its action is "Verify" | `[OBSERVED]` |
| FR-24 | Voter Id Verification requires a Number only (no DOB); its document is optional | `[OBSERVED]` |
| FR-25 | A system step, `EXISTING_CUSTOMER_DATA` (module sequence 3, `componentModule: 16`), runs automatically on eKYC submit and has no UI or stepper tab | `[OBSERVED]` |
| FR-26 | The header gains an **Applicant Name** field once eKYC completes | `[OBSERVED]` |
| FR-27 | Liveliness Verification (module sequence 4) offers two **alternative** methods — Security Code Based and video/camera based; exactly one is required | `[OBSERVED]` |
| FR-28 | Liveliness link send is capped at **3 attempts**; configured link validity is 25 minutes | `[OBSERVED]` |
| FR-29 | Address Details (module sequence 5) requires both a Permanent address and a Communication Address, each marked mandatory | `[OBSERVED]` |
| FR-30 | The Address form's Country is disabled and fixed to "India" | `[OBSERVED]` |
| FR-31 | State options are served by `GET /sahyognetwinMasterDB/master/data/get/states` | `[OBSERVED]` |
| FR-32 | Address Details flags **all** unmet mandatory fields simultaneously (unlike PAN and DL) | `[OBSERVED]` |
| FR-33 | Address Proof upload is **optional** on the Address form | `[OBSERVED]` |
| FR-34 | Completed application data persists across reload and re-entry via Dashboard → View or direct `/applndetails` | `[OBSERVED]` |
| FR-35 | All wizard stages share the single route `/applndetails`; no stage is individually addressable | `[OBSERVED]` |
| FR-36 | "Same as Permanent address" on the Communication Address form copies **all seven** address fields as structured values, and persists both the copied values and a `sameAsRegaddrReq: 1` flag | `[OBSERVED]` |
| FR-37 | A saved address is rendered read-only with **no edit or delete affordance** | `[OBSERVED]` |
| FR-38 | Branch Selection (sequence 6) pre-selects a default branch and offers a searchable list of alternatives via "Change Branch?" | `[OBSERVED]` |
| FR-39 | Submitting the default branch saves on the first click (`POST branch/selection/submit/details`) | `[OBSERVED]` |
| FR-40 | Basic Details (sequence 7) presents 29 fields; First/Middle/Last/Full name and Date of Birth are auto-filled from eKYC, with Full name and DOB disabled | `[OBSERVED]` |
| FR-41 | **Basic Details carries two fields unique to scheme 1003: `Is Staff` (mandatory dropdown, single option `YES`) and `Staff Id` (mandatory, maxLength 100)** | `[OBSERVED]` |
| FR-42 | **Basic Details omits `Employment Type`, `Designation/Profession` and `Initial Funding Amount`**, all of which exist on schemes 1001/1002 | `[OBSERVED]` |
| FR-43 | Mode of Operation offers 8 options and is **not** filtered by customer type | `[OBSERVED]` |
| FR-44 | Address Line 1/2 and Area are `<textarea>` elements (not `<input>`), each maxLength 255; Pin code is numeric-only, maxLength 6 | `[OBSERVED]` |
| FR-45 | **`Is Staff` is a mandatory dropdown pre-set to `YES` whose option list contains exactly one entry**; it cannot be cleared or changed | `[OBSERVED]` |
| FR-46 | **`Staff Id` is free text (maxLength 100) with no format mask, no pattern validation and no lookup against any staff master** | `[OBSERVED]` |
| FR-47 | `Spouse / Father's Name` enforces `maxLength` 20 (browser-level); the cap applies to that field alone — other name fields allow 100 | `[OBSERVED]` |
| FR-48 | Basic Details discards all entered values when the step is revisited; it must be completed in one continuous pass | `[OBSERVED]` |
| FR-49 | Basic Details routes to **Salaried Information unconditionally** — 1003 has no Employment Type field to branch on | `[OBSERVED]` |
| FR-50 | Salaried Information presents Category, Organization's Name, **Designation/Profession (the only mandatory field)**, Annual Income (defaulted `0.00`) and Source of Income | `[OBSERVED]` |
| FR-51 | `Designation/Profession` is **present on 1003**, relocated to Salaried Information; `Employment Type` and `Initial Funding Amount` are genuinely absent | `[OBSERVED]` |
| FR-52 | Applicant Photo requires Applicant Photo and Applicant Signature, both mandatory; Applicant Name is disabled and auto-filled | `[OBSERVED]` |
| FR-53 | "Verified Photo" offers **Aadhaar Verification Photo** and **Liveliness Verification Photo** as sources, and its Submit is correctly disabled until one is selected | `[OBSERVED]` |
| FR-54 | Applicant Photo offers **no file-upload control at all** — camera capture only for both Photo and Signature | `[OBSERVED]` |
| FR-55 | The signature `Capture Using Camera` control opens a **`Capture Image`** dialog showing the reverse-geocoded **Address**, **Latitude**, **Longitude** and **Date Time**, a live video preview and a `Capture photo` button | `[OBSERVED]` |
| FR-56 | Photo and signature are each stored with their **own** latitude, longitude and reverse-geocoded address; the photo also records `photoReferenceFrom` (its provenance) | `[OBSERVED]` |
| FR-57 | **Captured documents are held client-side and are discarded unless that step's own Submit succeeds** — a photo registered but not submitted is absent on resume | `[OBSERVED]` |
| FR-58 | No preview, thumbnail, filename or retake is offered after capture — the control displays only `Document Uploaded` | `[OBSERVED]` |
| FR-59 | The **1003 workflow has 13 steps followed by a Summary screen**; the Summary is not itself a workflow step (no `stepCode`, absent from `aosStepList`) | `[OBSERVED]` |
| FR-60 | Nominee Details (sequence 12) has **two pages**: Nominee Details, then Address Details (Nominee) | `[OBSERVED]` |
| FR-61 | Nominee Details requires Full Name, Relation and Date of Birth; **Age is derived and read-only**; there is **no way to decline nomination** | `[OBSERVED]` |
| FR-62 | **A nominee under 18 dynamically reveals five mandatory guardian fields** (Guardian Name, Relation of guardian with nominee, Guardian Address, Guardian DOB, Guardian Age), which collapse cleanly when an adult DOB is restored | `[OBSERVED]` |
| FR-63 | The nominee relation list carries **17 options** served by `GET relation/app/getRelationList` | `[OBSERVED]` |
| FR-64 | The nominee address popup opens with **`Use Existing Address` pre-checked** and every field copied from the applicant's permanent address, plus two fields the applicant form lacks: `Address Source` and `Address Type` | `[OBSERVED]` |
| FR-65 | **Document Upload (sequence 13) is the only step configured `skipAllowed: 1`** and submits successfully with zero documents attached and no warning | `[OBSERVED]` |
| FR-66 | Introducer Details (sequence 15) requires Introducer's Name, Introducer Account Number and Period of Acquaintance, all free text with `maxLength` 255 | `[OBSERVED]` |
| FR-67 | **The Introducer Account Number is resolved against the Core Banking System**; the response carries `bankAccountUserName`, `introducerCustomerId` and `isNameMismatch` | `[OBSERVED]` |
| FR-68 | Lead Details (sequence 16) requires a Lead Converter Code and a Sourcer Code, **each of which must be verified before the step will submit**; verification resolves the code to a staff name, locks the input and changes `Verify` to `Change` | `[OBSERVED]` |
| FR-69 | The Summary renders **13 sections in workflow order** from a single `POST app/get/aosRequest/summary`, whose `summaryDataJson` is a **JSON string** requiring a second parse | `[OBSERVED]` |
| FR-70 | **Every value the Summary displays matches what was entered upstream** — a full field-by-field comparison found no corruption | `[OBSERVED]` |
| FR-71 | The Summary **does not render the applicant photo or signature** — both appear as labels with no image (`valueType: "file"`, zero `<img>` elements on the page) | `[OBSERVED]` |
| FR-72 | The Summary **does not render eKYC or Liveliness pass/fail state**, although `subModVerified` is present in the payload for each sub-module | `[OBSERVED]` |
| FR-73 | The Summary shows **only the nominee's Full name and Status** — relation, date of birth, age and address are absent | `[OBSERVED]` |
| FR-74 | The Summary has **no per-section edit control**; correction is possible only by clicking a stepper tab, and only for `isEditable: 1` steps | `[OBSERVED]` |
| FR-75 | A completed `isEditable: 1` step reopened from the Summary presents an **editable form pre-populated with its saved values, dropdowns included**; an `isEditable: 0` step reopens **read-only with no Submit button** | `[OBSERVED]` |
| FR-76 | **The Summary carries no declaration, consent, terms or acknowledgement, and its Submit control is enabled unconditionally from page load** — 0 checkboxes, 0 radios, 0 inputs of any kind | `[OBSERVED]` |
| FR-77 | Behaviour after clicking the Summary's Submit — confirmation dialog, success screen, resulting status, endpoint | `[NOT VERIFIED]` — deliberately not operated (§14.3) |

### 6.2 Required changes / gaps

| ID | Proposed requirement | Why | Tag |
|---|---|---|---|
| FR-G01 | The State list must include every current Indian state and UT | Bihar, Sikkim, Telangana and Ladakh are absent, so residents cannot complete a mandatory step | `[GAP]` |
| FR-G02 | City must be filtered by the selected State | 4,498 unfiltered entries; impossible State/City pairs are selectable | `[GAP]` |
| FR-G03 | Upstream/API failures must surface an error and a retry control | An indefinite spinner leaves the user unable to tell whether to wait, retry or abandon | `[GAP]` |
| FR-G04 | Upload widgets should display the attached filename | The user cannot confirm which file is attached | `[GAP]` |
| FR-G05 | Mandatory-field validation should behave consistently across all forms | Address flags all; PAN and DL reveal errors one at a time | `[GAP]` |
| FR-G06 | The two Liveliness methods should explain their difference and that they are alternatives | Neither is marked, and nothing indicates only one is needed | `[GAP]` |
| FR-G07 | PAN Number should show a character-limit hint | It silently truncates at 10 | `[GAP]` |
| FR-G08 | The stepper should indicate the full journey ahead | A user cannot see how many stages remain or what will be required | `[GAP]` |
| FR-G09 | Provide pin-code-driven State/City auto-fill, or a searchable City picker | Would remove the need for the broken cascade | `[GAP]` |
| FR-G10 | Support non-Indian addresses, or state the India-only restriction | Country is disabled with no explanation | `[GAP]` |
| FR-G11 | **The Summary must carry an explicit declaration/consent, and Submit must be gated on accepting it** | The final irreversible act has no confirmation, no terms and no acknowledgement of review | `[GAP]` |
| FR-G12 | **The Summary must display the captured photo and signature** | They are never visible at any point in the journey, so a wrong or illegible capture cannot be caught | `[GAP]` |
| FR-G13 | **The Summary must show which eKYC and Liveliness checks passed** | `subModVerified` is in the payload but unrendered; a reviewer cannot see which identity checks succeeded | `[GAP]` |
| FR-G14 | **The Summary must show the full nominee record** | Relation, DOB, age and address are all captured as mandatory but omitted from review | `[GAP]` |
| FR-G15 | **Required documents must be enforced, or their absence stated explicitly at review** | The step is skippable and the Summary section renders blank, so an application can reach submission with no documents | `[GAP]` |
| FR-G16 | Nominee age must be a non-negative integer and a future DOB must be rejected | Age renders as `36.03`, and a future DOB yields `-4.07` | `[GAP]` |
| FR-G17 | An introducer CBS failure must surface a message and a retry | It currently fails completely silently — no message, no console error, no advance | `[GAP]` |
| FR-G18 | Offer a way to decline nomination | A nominee is unconditionally mandatory; nomination is normally a waivable right | `[GAP]` |
| FR-G19 | Editable and locked steps must be visually distinguishable in the stepper | All 13 tabs render identically, so the user must click each to discover which can be corrected | `[GAP]` |
| FR-G20 | `Period of Acquaintance` should be structured (numeric + unit) | It is unconstrained free text a reviewer is expected to assess | `[GAP]` |
| FR-G21 | Enforce or justify separation between Lead Converter and Sourcer | The same staff code is accepted for both roles | `[GAP]` |

---

## 7. UI Requirements

### 7.1 Screen elements

| Element | Type | Label | Default state | Notes | Evidence |
|---|---|---|---|---|---|
| Search Scheme Type | Input | placeholder `Search Scheme Type` | Empty | Server-side search | `[OBSERVED]` |
| Scheme card | Button | `Staff Salary Account - 1003` | Enabled | Third of three | `[OBSERVED]` |
| Header | Text block | Applicant Name / Applicant Id / Product Name / Scheme Name | Product+Scheme only at first | Applicant Id added on OTP send; Applicant Name after eKYC | `[OBSERVED]` |
| Stepper | Tab list | Stage names | One tab on a fresh draft | Grows as stages are reached | `[OBSERVED]` |
| Mobile Number | Input | `Mobile Number *` | Empty, enabled | Becomes disabled after send | `[OBSERVED]` |
| Country code | Static text | `+91` + India flag | Fixed | Not selectable | `[OBSERVED]` |
| Send Verification Code | Button | — | **Hidden** | Appears at 10 digits | `[OBSERVED]` |
| Enter OTP | Input | `Enter OTP` | Hidden until send | **No `*` marker** despite being required | `[OBSERVED]` |
| Change Mobile Number? | Link | — | Hidden until send | Not exercised | `[OBSERVED]` |
| Resend OTP | Link | `Resend OTP` | Hidden | Appears when the countdown expires | `[OBSERVED]` |
| eKYC cards | Cards (h3) | Aadhaar…`*` / PAN / Driving Licence / Voter Id | No badge | Badge becomes `Pending` then `Successful` | `[OBSERVED]` |
| DigiLocker popup | Modal | `Digilocker` | — | Disabled pre-filled mobile; Cancel + Send Link | `[OBSERVED]` |
| PAN panel | Inline panel | `PAN Number *`, `Upload PAN` | — | Not a popup | `[OBSERVED]` |
| DL / Voter popups | Modal | `Driving Licence` / `Voter Id` | — | Action is `Verify`, not Submit | `[OBSERVED]` |
| Liveliness cards | Cards (h3) | `Security Code Based Liveliness Verification` / `Liveliness Verification` | No badge | Neither marked mandatory | `[OBSERVED]` |
| Liveliness popup | Modal | `Guidelines For Liveliness Check` | — | Different guideline sets per method | `[OBSERVED]` |
| Address sections | Sections | `Permanent address *` / `Communication Address *` | Empty | `Click Here For Add Address` | `[OBSERVED]` |
| Address popup | Modal | `Permanent address` | — | 8 fields; Cancel + Submit | `[OBSERVED]` |
| Photo / Signature upload panels | Panels | `Upload Applicant Photo *` / `Upload Applicant Signature *` | Capture options | Become the text `Document Uploaded` — **no thumbnail, filename or retake** | `[OBSERVED]` |
| Capture Image dialog | Modal | `Capture Image` | Live preview | Shows Address, Latitude, Longitude, Date Time; `Capture photo` + `Close` | `[OBSERVED]` |
| Verified Photo popup | Modal | `Verified Photo` | Submit **disabled** | Source dropdown; thumbnail + pre-checked box; `Only one image available — auto-selected.` | `[OBSERVED]` |
| Nominee guardian block | Conditional fields | 5 fields, all `*` | Hidden | Appears only when the nominee is a minor | `[OBSERVED]` |
| Nominee address popup | Modal | `Registered Address` | `Use Existing Address` **pre-checked** | Adds `Address Source *` and `Address Type *`; upload shows `Browse Computer` **twice** | `[OBSERVED]` |
| Document Upload panel | Panel | `Select Applicant Document` | Two empty `Select` dropdowns | `+ Add Custom Document`; submits fine with nothing attached | `[OBSERVED]` |
| Lead code fields | Input + button | `Lead Converter Code *` / `Sourcer Code *` | `Verify` | On success: input locks, `Verify` → `Change`, `Name: <staff name>` shown | `[OBSERVED]` |
| Summary sections | Read-only blocks | One heading per workflow step | Fully rendered | **No edit control of any kind**; 13 sections | `[OBSERVED]` |
| Summary Submit | Button | `Submit` | **Enabled immediately** | Bare `<button type="submit">Submit</button>` — unstyled, outside any `<form>`, never disabled | `[OBSERVED]` |

### 7.2 Layout, messaging and states

* **Headings / branding** — society branding in the header; a left navigation with Home, My
  Profile, Notifications, About Us on every screen — `[OBSERVED]`
* **Loading state** — a text message replaces the whole panel (e.g. "Please wait while we are
  fetching existing customer data"); no spinner component or progress indicator — `[OBSERVED]`
* **Empty state** — eKYC and Liveliness cards render with no status badge until acted on —
  `[OBSERVED]`
* **Success feedback** — a disabled `Successful` badge on the card; a "Done" icon plus
  "<Stage> submitted successfully." when revisiting a completed stage — `[OBSERVED]`
* **Error feedback** — inline text beneath the field (e.g. `PAN Number is required`); server
  failures surface transiently and are not persisted in the panel — `[OBSERVED]`
* **Pending feedback** — a disabled `Pending` badge plus an information panel with
  link-validity and resend countdowns — `[OBSERVED]`
* **Silent failure** — the Introducer step's CBS failure produces **no visual feedback at
  all**: no message, no highlight, no toast, and no console entry. The only observable symptom
  is that the step does not advance — `[OBSERVED]` `[DEFECT]` D-31
* **Review-screen feedback** — the Summary renders values as plain read-only text with no
  verified/unverified indicators, no images, and no edit affordances — `[OBSERVED]`
* **Responsiveness** — `[NOT VERIFIED]`, not probed.
* **Console cleanliness** — zero console errors across scheme selection, mobile verification,
  the whole eKYC step, Liveliness and Address Details, apart from the single upstream 504.
  The extended pass through Applicant Photo, Nominee Details, Document Upload, Introducer
  Details, Lead Details and the Summary produced **0 errors and 0 warnings across 138 console
  messages** — including the silent failures above, which leave no trace — `[OBSERVED]`

---

## 8. Business Rules

| ID | Rule | Enforced where | Evidence |
|---|---|---|---|
| BR-01 | An application record exists only after a successful OTP send | Server | `[OBSERVED]` |
| BR-02 | Applicant Id embeds the scheme code: `SAH-1003-nnn` | Server | `[OBSERVED]` |
| BR-03 | Scheme 1003 is Individual-only; no Account Type is offered | Server (workflow config) | `[OBSERVED]` |
| BR-04 | Steps are strictly sequential and none may be skipped | Server (`skipAllowed: 0`) | `[OBSERVED]` |
| BR-05 | A completed step is locked against editing | Server (`isEditable: 0`) | `[OBSERVED]` |
| BR-06 | The mobile number is immutable once verified | Both | `[OBSERVED]` |
| BR-07 | OTP sends are capped at 3 per application | Server | `[OBSERVED]` |
| BR-08 | OTP validity is 15 minutes, enforced server-side | Server | `[OBSERVED]` |
| BR-09 | Within eKYC only Aadhaar is mandatory; PAN/DL/Voter Id are supplementary | Server | `[OBSERVED]` |
| BR-10 | DigiLocker link sends are capped at 3 per application | Server | `[OBSERVED]` |
| BR-11 | DigiLocker link validity is 25 minutes | Server | `[OBSERVED]` |
| BR-12 | Cancelling a verification popup initiates nothing | Client | `[OBSERVED]` |
| BR-13 | PAN requires both a number and a supporting document | Client | `[OBSERVED]` |
| BR-14 | A PAN's 4th character must be `P` (individual taxpayer) | Server config | `[OBSERVED]` (configured); `[NOT VERIFIED]` (UI) |
| BR-15 | The two Liveliness methods are alternatives; exactly one is required | Server | `[OBSERVED]` |
| BR-16 | Liveliness link sends are capped at 3 per application | Server | `[OBSERVED]` |
| BR-17 | Both a Permanent and a Communication address are mandatory | Client | `[OBSERVED]` |
| BR-18 | Addresses must be Indian — Country is fixed to "India" | Client | `[OBSERVED]` |
| BR-19 | Completing the journey requires **three separate human-only gates** (SMS OTP, DigiLocker consent, Liveliness), each capped at 3 attempts | Server | `[OBSERVED]` |
| BR-20 | Both an Applicant Photo and an Applicant Signature are mandatory; the photo alone will not submit | Client | `[OBSERVED]` |
| BR-21 | Captured documents persist **only** if the owning step's Submit succeeds | Server | `[OBSERVED]` |
| BR-22 | Each captured image is stamped with its own latitude, longitude, reverse-geocoded address and timestamp | Server | `[OBSERVED]` |
| BR-23 | A nominee is **unconditionally mandatory** — there is no way to decline nomination | Server (`skipAllowed: 0`) | `[OBSERVED]` |
| BR-24 | **A nominee under 18 requires full guardian details** (name, relation, address, DOB, age) | Client | `[OBSERVED]` |
| BR-25 | The nominee's address defaults to the applicant's, via a pre-checked `Use Existing Address` | Client | `[OBSERVED]` |
| BR-26 | **Document Upload may be skipped entirely** — the only step in the workflow with `skipAllowed: 1` | Server | `[OBSERVED]` |
| BR-27 | The Introducer Account Number is resolved and name-matched against the **Core Banking System** | Server | `[OBSERVED]` |
| BR-28 | Both Lead Details codes must be **verified** against the staff register before the step will submit | Server | `[OBSERVED]` |
| BR-29 | Lead Converter and Sourcer **may be the same person** — no separation of duties is enforced | *(not enforced)* | `[OBSERVED]` `[DEFECT]` D-38 |
| BR-30 | Six of thirteen steps remain re-editable after completion (`isEditable: 1`); the other seven lock permanently | Server | `[OBSERVED]` |
| BR-31 | **No declaration or consent gates the final submission**, and the Submit control is never disabled | *(not enforced)* | `[OBSERVED]` `[DEFECT]` D-43 |

> "Enforced where" is determined by whether a network call fires before the rule triggers.

> **BR-26, BR-29 and BR-31 record rules the system does *not* enforce.** They are listed here
> because their absence is itself the finding — see D-35, D-38 and D-43.

---

## 9. Validation Rules

| Field | Mandatory | Type / format | Length / range | Allowed chars | Default | Source of options | Dependency | Error message (verbatim) | Fires | Evidence |
|---|---|---|---|---|---|---|---|---|---|---|
| Mobile Number | Yes | numeric | exactly 10 | digits only | empty | N/A | — | *(none — input silently rejected)* | Client | `[OBSERVED]` |
| Enter OTP | Yes *(unmarked)* | numeric | `[NOT VERIFIED]` | `[NOT VERIFIED]` | empty | N/A | Appears after send | `Entered mobile number OTP is expired! ` | Server | `[OBSERVED]` |
| PAN Number | Yes | alphanumeric | max 10 in DOM; `field_size` 100 in config | not restricted at entry | empty | N/A | — | `PAN Number is required` | Client | `[OBSERVED]` |
| Upload PAN | Yes | file | 10 MB (config) | label `png,jpeg,pdf,camera`; DOM accept `.png,.pdf,.camera` | none | N/A | — | `Upload PAN is required` | Client | `[OBSERVED]` |
| Driving Licence Number | Yes | text | `maxLength` 50; no format check | unrestricted | empty | N/A | — | `Enter driving licence number` | Client | `[OBSERVED]` |
| Date of Birth (DL) | Yes | `input[type=date]` | — | — | empty | Native picker | — | *(none — never flagged)* | — | `[OBSERVED]` |
| DL supporting document | No | file | — | `png, jpg, pdf, camera` | none | N/A | — | — | — | `[OBSERVED]` |
| Voter Id Number | Yes | text | `[NOT VERIFIED]` | unrestricted | empty | N/A | — | `Enter voter id number` | Client | `[OBSERVED]` |
| Voter supporting document | No | file | — | `png, jpg, pdf, camera` | none | N/A | — | — | — | `[OBSERVED]` |
| Address Line 1 | Yes | text | `[NOT VERIFIED]` | `[NOT VERIFIED]` | empty | N/A | — | `Address Line 1 is required` | Client | `[OBSERVED]` |
| Address Line 2 | No | text | `[NOT VERIFIED]` | — | empty | N/A | — | — | — | `[OBSERVED]` |
| Area / locality | No | text | `[NOT VERIFIED]` | — | empty | N/A | — | — | — | `[OBSERVED]` |
| Country | Yes | text, **disabled** | — | — | `India` | Fixed | — | *(cannot be invalid)* | — | `[OBSERVED]` |
| State | Yes | dropdown | 33 options | — | empty | **API** `master/data/get/states` | — | `State is required` | Client | `[OBSERVED]` |
| City | Yes | dropdown | **4,498 options, unfiltered** | — | empty | **API** (master data) | **Should** depend on State; does not | `City is required` | Client | `[OBSERVED]` |
| Pin code | Yes | text | `[NOT VERIFIED]` | `[NOT VERIFIED]` | empty | N/A | — | `Pin code is required` | Client | `[OBSERVED]` |
| Upload Address Proof | No | file | — | `png, jpg, pdf,camera` | none | N/A | — | — | — | `[OBSERVED]` |
| Applicant Name (Photo step) | Yes | text, **disabled** | — | — | from eKYC | eKYC | — | *(cannot be invalid)* | — | `[OBSERVED]` |
| Upload Applicant Photo | Yes | camera **or** Verified Photo | — | — | none | `photo/get/verify/module/list` | — | `Upload Applicant Photo is required` | Client | `[OBSERVED]` |
| Upload Applicant Signature | Yes | **camera only** — no file input exists | — | — | none | N/A | — | `Upload Applicant Signature is required` | Client | `[OBSERVED]` |
| Nominee Full Name | Yes | text | `maxLength` 255 | unrestricted | empty | N/A | — | `Full Name is required` | Client | `[OBSERVED]` |
| Relation of nominee with applicant | Yes | dropdown | 17 options | — | `Select` | **API** `relation/app/getRelationList` | — | `Relation of nominee with applicant is required` | Client | `[OBSERVED]` |
| Nominee Date of Birth | Yes | `input[type=date]` | `min` 1900-01-01, `max` today | — | empty | Native picker | Drives Age + guardian block | `Date of Birth is required` | Client | `[OBSERVED]` — **`max` not enforced by the handler (D-30)** |
| Nominee Age ( In Years ) | No | text, **disabled** | — | — | `0` | Derived from DOB | Depends on DOB | — | — | `[OBSERVED]` — **fractional and can go negative (D-30)** |
| Guardian Name / Relation / Address / DOB / Age | Yes *(conditional)* | mixed | `[NOT VERIFIED]` | — | empty | mixed | **Only when the nominee is a minor** | `[NOT VERIFIED]` | Client | `[OBSERVED]` (appearance only) |
| Nominee Pin Code | Yes | text | `maxLength` 6 | numeric | copied | N/A | — | `[NOT VERIFIED]` | Client | `[OBSERVED]` — `name` attribute holds the *value* (D-33) |
| Introducer's Name | Yes | text | `maxLength` 255 | unrestricted | empty | N/A | — | `Introducer's Name is required` | Client | `[OBSERVED]` |
| Introducer Account Number | Yes | text | `maxLength` 255 | **unrestricted client-side** | empty | N/A | Validated against CBS | `Introducer Account Number is required` | Client, then **Server (CBS)** | `[OBSERVED]` — **CBS failure is silent (D-31)** |
| Period of Acquaintance | Yes | **free text** | `maxLength` 255 | unrestricted | empty | N/A | — | `Period of Acquaintance is required` | Client | `[OBSERVED]` |
| Lead Converter Code | Yes | text + `Verify` | `maxLength` 255 | unrestricted | empty | Staff register | Must be verified before submit | `[NOT VERIFIED]` | Server | `[OBSERVED]` |
| Sourcer Code | Yes | text + `Verify` | `maxLength` 255 | unrestricted | empty | Staff register | Must be verified; **cleared when the other code is verified (D-34)** | `[NOT VERIFIED]` | Server | `[OBSERVED]` |

---

## 10. Positive Scenarios

| # | Scenario | Expected outcome | Verified |
|---|---|---|---|
| PS-01 | Navigate Home → Savings Application → New Application | Scheme Selection lists all three schemes | `[OBSERVED]` |
| PS-02 | Search "staff" (lowercase) | Only `Staff Salary Account - 1003` is listed | `[OBSERVED]` |
| PS-03 | Select scheme 1003 | `/applndetails` opens; header shows the scheme; no record created yet | `[OBSERVED]` |
| PS-04 | Enter a valid 10-digit mobile and send | Applicant Id `SAH-1003-nnn` assigned; OTP panel revealed | `[OBSERVED]` |
| PS-05 | Submit a valid OTP | Mobile verified; advances **directly to eKYC** — no Account Type | `[OBSERVED]` |
| PS-06 | Open the eKYC step | Four cards, Aadhaar marked mandatory | `[OBSERVED]` |
| PS-07 | Send a DigiLocker link | `Pending` badge, validity and resend timers shown | `[OBSERVED]` |
| PS-08 | Applicant grants DigiLocker access | Badge → `Successful`; `digilockerVerifyStatus: 1` | `[OBSERVED]` |
| PS-09 | Submit eKYC with Aadhaar alone | Advances; PAN/DL/Voter Id genuinely optional | `[OBSERVED]` |
| PS-10 | Reach Liveliness Verification | Two alternative methods offered; header gains Applicant Name | `[OBSERVED]` |
| PS-11 | Send a Security Code liveliness link | `Pending` badge and guidelines shown | `[OBSERVED]` |
| PS-12 | Applicant completes the security-code check | Badge → `Successful` | `[OBSERVED]` |
| PS-13 | Submit Liveliness with one method complete | Advances to Address Details | `[OBSERVED]` |
| PS-14 | Open the Permanent address form | 8 fields rendered; Country fixed to India | `[OBSERVED]` |
| PS-15 | Reload or re-enter via Dashboard → View | Application resumes with completed stages intact | `[OBSERVED]` |
| PS-16 | Complete Address Details and submit | Advances to Branch Selection | `[OBSERVED]` |
| PS-17 | Capture the Applicant Signature with a camera available | `Capture Image` dialog opens with geolocation and timestamp; capture registers as `Document Uploaded` | `[OBSERVED]` |
| PS-18 | Select a Verified Photo from the Aadhaar source | Thumbnail shown, auto-selected, Submit enables and the photo registers | `[OBSERVED]` |
| PS-19 | Submit Applicant Photo with both images present | Advances to Nominee Details; both images geo-stamped server-side | `[OBSERVED]` |
| PS-20 | Enter an adult nominee with a valid relation and DOB | Age computes; no guardian block; step submits | `[OBSERVED]` |
| PS-21 | Enter a **minor** nominee | Five mandatory guardian fields appear; revert to an adult DOB and they collapse cleanly | `[OBSERVED]` |
| PS-22 | Accept the pre-checked `Use Existing Address` for the nominee | All address fields pre-filled from the applicant's permanent address; saves and renders read-only | `[OBSERVED]` |
| PS-23 | Submit Introducer Details with a **valid** CBS account number | `Details saved successfully!`; advances to Lead Details | `[OBSERVED]` |
| PS-24 | Verify a valid Lead Converter Code | Resolves to a staff name, locks the input, `Verify` becomes `Change` | `[OBSERVED]` |
| PS-25 | Submit Lead Details with both codes verified | Advances to the **Summary** screen | `[OBSERVED]` |
| PS-26 | Review the Summary | 13 sections rendered; **every displayed value matches what was entered upstream** | `[OBSERVED]` |
| PS-27 | Click an `isEditable: 1` step from the Summary | Reopens as an editable, pre-populated form (dropdowns retain their values); returning to Summary works | `[OBSERVED]` |
| PS-28 | Click an `isEditable: 0` step from the Summary | Reopens read-only with no Submit control | `[OBSERVED]` |
| PS-29 | Submit the completed application | `[NOT VERIFIED]` — **deliberately not performed**; irreversible and not authorised | `[NOT VERIFIED]` |

---

## 11. Negative Scenarios

| # | Scenario | Expected outcome | Actual outcome | Verified |
|---|---|---|---|---|
| NS-01 | Type letters into Mobile Number | Rejected | Field stays empty | `[OBSERVED]` |
| NS-02 | Type special characters into Mobile Number | Rejected/stripped | Non-digits stripped | `[OBSERVED]` |
| NS-03 | Enter fewer than 10 digits | No send possible | "Send Verification Code" stays hidden | `[OBSERVED]` |
| NS-04 | Submit an expired OTP | Clear rejection | `Entered mobile number OTP is expired! ` — but returned as **HTTP 200 / `success:"FALSE"`** | `[OBSERVED]` `[DEFECT]` D-03 |
| NS-05 | Submit the PAN form blank | All missing mandatory fields flagged | Only `PAN Number is required`; the mandatory document is not flagged | `[OBSERVED]` `[DEFECT]` D-08 |
| NS-06 | Enter a 16-character PAN | Rejected or flagged | Silently truncated to 10 | `[OBSERVED]` `[DEFECT]` D-11 |
| NS-07 | Submit PAN without a document | Rejection | `Upload PAN is required` | `[OBSERVED]` |
| NS-08 | Attach a valid `.png` to PAN and submit | Accepted and uploaded | **Never registers** — no filename, no upload request, submit still blocked | `[OBSERVED]` `[DEFECT]` D-05 |
| NS-09 | Verify the DL form blank | All missing mandatory fields flagged | Only `Enter driving licence number`; the mandatory DOB is never flagged | `[OBSERVED]` `[DEFECT]` D-08 |
| NS-10 | Enter a 21-character nonsense DL number | Rejected client-side | Accepted and sent to a real government lookup | `[OBSERVED]` `[DEFECT]` D-12 |
| NS-11 | Verify an invalid DL number + DOB | Clear failure | `Driving Licence verification failed` — **HTTP 200 / `success:"FALSE"`** | `[OBSERVED]` `[DEFECT]` D-03 |
| NS-12 | Verify the Voter Id form blank | Rejection | `Enter voter id number` | `[OBSERVED]` |
| NS-13 | Verify an invalid Voter Id | Clear failure | `Voter ID verification failed` — **HTTP 200 / `success:"FALSE"`** | `[OBSERVED]` `[DEFECT]` D-03 |
| NS-14 | Open the Aadhaar card before sending a link | No claim that a link was sent | Popup states "The link has been sent on +91-…" although none was | `[OBSERVED]` `[DEFECT]` D-04 |
| NS-15 | Submit the Address form blank | All missing mandatory fields flagged | Correct — all four flagged together | `[OBSERVED]` |
| NS-16 | Look for a Telangana / Bihar / Sikkim / Ladakh address | Selectable | **Absent from the State list** — application cannot be completed | `[OBSERVED]` `[DEFECT]` D-15 |
| NS-17 | Select a State then open City | City filtered to that State | 4,498 unfiltered entries from every state | `[OBSERVED]` `[DEFECT]` D-16 |
| NS-18 | Upstream service times out mid-step | Error and retry offered | Indefinite spinner, no error, no retry | `[OBSERVED]` `[DEFECT]` D-07 |
| NS-19 | Click a locked step's stepper tab | Explanation or no affordance | Silent no-op | `[OBSERVED]` `[DEFECT]` D-18 |
| NS-20 | Submit Applicant Photo with the photo but no signature | Rejection | `Upload Applicant Signature is required` — correct | `[OBSERVED]` |
| NS-21 | Resume a step whose documents were registered but not submitted | Documents retained, or the state made clear | Silently discarded; server reports `"No record found!"` as a `500` inside a 200 | `[OBSERVED]` `[DEFECT]` D-03 |
| NS-22 | Submit the Nominee form blank | All three flagged | Correct — all three flagged together | `[OBSERVED]` |
| NS-23 | Enter a **future** nominee date of birth | Rejected — the field declares `max` = today | **Accepted**; Age became **`-4.07`** | `[OBSERVED]` `[DEFECT]` D-30 |
| NS-24 | Read the nominee's derived Age | Whole number of years | `36.03` — fractional to 2 dp | `[OBSERVED]` `[DEFECT]` D-30 |
| NS-25 | Submit Document Upload with nothing attached | Blocked or warned | **Advanced silently with zero documents** | `[OBSERVED]` `[DEFECT]` D-35 |
| NS-26 | Submit the Introducer form blank | All three flagged | Correct — all three flagged together | `[OBSERVED]` |
| NS-27 | Submit an **unresolvable** Introducer Account Number | Clear error and a retry | **Nothing at all** — no message, no highlight, no console error; the step just does not advance | `[OBSERVED]` `[DEFECT]` D-31 |
| NS-28 | Verify one Lead code with the other already typed | Both preserved | The second is **silently cleared** | `[OBSERVED]` `[DEFECT]` D-34 |
| NS-29 | Use the same staff code for both Lead roles | Rejected or warned | **Accepted**, resolving to the same name twice | `[OBSERVED]` `[DEFECT]` D-38 |
| NS-30 | Look for the captured photo/signature on the Summary | Images displayed for review | Labels only — **zero `<img>` elements** | `[OBSERVED]` `[DEFECT]` D-36 |
| NS-31 | Look for eKYC pass/fail state on the Summary | Verified checks distinguishable | All four render identically despite `subModVerified` being in the payload | `[OBSERVED]` `[DEFECT]` D-39 |
| NS-32 | Look for the nominee's relation, DOB, age and address on the Summary | All shown | **Absent** — only Full name and Status | `[OBSERVED]` `[DEFECT]` D-40 |
| NS-33 | Look for a declaration or consent before submitting | Present, with Submit gated on it | **None exists**; Submit is enabled from page load | `[OBSERVED]` `[DEFECT]` D-43 |

> Where **Actual** differs from **Expected**, the row is tagged `[DEFECT]` and mirrored in §15.3.

---

## 12. Edge Cases

| # | Edge case | Behaviour | Verified |
|---|---|---|---|
| EC-01 | Boundary — PAN max length + 6 | Silently truncated to 10, no message | `[OBSERVED]` |
| EC-02 | Boundary — mobile below 10 digits | Send control never appears | `[OBSERVED]` |
| EC-03 | Boundary — DL number at 21 chars (max 50) | Accepted without validation | `[OBSERVED]` |
| EC-04 | OTP expiry crossed between send and submit | Rejected server-side even though the client already showed "expired" | `[OBSERVED]` |
| EC-05 | OTP resend after expiry | Timer restarts; attempt counter decrements | `[OBSERVED]` |
| EC-06 | Upstream 504 mid-step | Transient — the workflow self-healed and advanced with no intervention | `[OBSERVED]` |
| EC-07 | Data persistence after refresh | Completed stages retained | `[OBSERVED]` |
| EC-08 | Re-entry via direct URL vs Dashboard → View | Both resume the same application | `[OBSERVED]` |
| EC-09 | Aadhaar consent succeeds but the document fetch does not | `digilockerVerifyStatus: 1` while `digiaadharVerifyStatus: 0`; downstream address auto-fill does not occur | `[OBSERVED]` |
| EC-10 | Double-submit / rapid re-click | Not probed — attempt budgets too small to risk | `[NOT VERIFIED]` |
| EC-11 | Session expiry mid-flow | Session expired twice between passes; re-login resumed the application intact | `[OBSERVED]` |
| EC-12 | Leading/trailing whitespace | Not probed | `[NOT VERIFIED]` |
| EC-13 | Applicant resident in a missing jurisdiction | Cannot complete Address Details at all | `[OBSERVED]` |
| EC-14 | Boundary — nominee DOB at the `max` bound (today) | Accepted; Age computes to `0.0x` | `[OBSERVED]` |
| EC-15 | Boundary — nominee DOB one day past `max` (future) | **Accepted by the handler**, producing a negative age | `[OBSERVED]` `[DEFECT]` D-30 |
| EC-16 | Boundary — nominee turning 18 | Guardian block appears below 18 and collapses at/above it | `[OBSERVED]` |
| EC-17 | Documents registered but the owning step abandoned | Discarded entirely; nothing persists server-side | `[OBSERVED]` |
| EC-18 | Capture geolocation inconsistent with every address on the application | Accepted silently — capture in Mumbai, applicant address Abohar, branch Gondiya | `[OBSERVED]` `[GAP]` |
| EC-19 | Application reaching the Summary with **zero** documents attached | Permitted; the Summary section renders blank rather than flagging it | `[OBSERVED]` `[DEFECT]` D-35 |
| EC-20 | An optional field left blank, as shown on the Summary | Renders `NA`, while blank system fields render `-` — two conventions | `[OBSERVED]` `[DEFECT]` D-41 |
| EC-21 | A transaction **count** rendered on the Summary | Shown as `120.00`, formatted as a decimal amount | `[OBSERVED]` `[DEFECT]` D-41 |
| EC-22 | Editing a completed step from the Summary and returning | Round trip works; the step retains its saved values, dropdowns included | `[OBSERVED]` |
| EC-23 | A signature captured from a synthetic video source | Accepted with no quality, content or liveness check — a test pattern is stored as a signature | `[OBSERVED]` `[GAP]` |

---

## 13. Acceptance Criteria

### AC1: Scheme 1003 is selectable and opens its own journey — *Type: Functional*

**Given** an authenticated Branch Origination Officer on the Savings Application Dashboard

**When** they click "New Application" and select `Staff Salary Account - 1003`

**Then**

* the Scheme Selection screen lists all three active schemes under product "Savings Account"
* `/applndetails` opens with Product Name "Savings Account" and Scheme Name "Staff Salary Account - 1003"
* the stepper shows exactly one stage, "Mobile Number Verification"
* **no** application record is created at this point

*Basis:* `[OBSERVED]` — walked live; `scheme/getUserwiseAllscheme` returns scheme code 1003.

---

### AC2: Scheme search is server-side and case-insensitive — *Type: Functional*

**Given** the Scheme Selection screen

**When** the officer types `staff` in "Search Scheme Type"

**Then**

* only `Staff Salary Account - 1003` remains listed
* a request is issued carrying `searchValue: "staff"` (matching is server-side, not client filtering)
* inactive schemes are excluded (`inActiveAcRequired: 0`)

*Basis:* `[OBSERVED]` — request body inspected.

---

### AC3: The application record is created on OTP send — *Type: Functional*

**Given** the Mobile Number Verification stage

**When** the officer enters a valid 10-digit mobile number and clicks "Send Verification Code"

**Then**

* an Applicant Id of the form `SAH-1003-nnn` appears in the header
* the Mobile Number field becomes disabled
* the OTP field, validity/resend timers, "Change Mobile Number?" and Submit appear
* the response reports the remaining send attempts

*Basis:* `[OBSERVED]` — `POST aos/mobile/verify/save`, `msgCode "MOB_VERIF_OTP"`.

---

### AC4: "Send Verification Code" requires a complete 10-digit number — *Type: Validation*

**Given** the Mobile Number Verification stage

**When** the officer enters fewer than 10 digits, or non-numeric characters

**Then**

* alphabetic input is rejected outright and the field remains empty
* non-digit characters are stripped
* "Send Verification Code" remains hidden until exactly 10 digits are present
* no network request is issued

*Basis:* `[OBSERVED]` — probes V-01 to V-04. **Note:** this contradicts
`tests/pages/savings-application/application-form/MobileVerificationStep.ts` and Silver's
TC-SIL-002, which describe the control appearing from 1+ digits (§15.3 D-19).

---

### AC5: OTP validity is enforced server-side — *Type: Negative*

**Given** an OTP whose validity window has elapsed

**When** the officer submits it

**Then**

* the submission is rejected with `Entered mobile number OTP is expired! `
* the rejection is made by the server, not pre-empted by the client's own countdown
* a "Resend OTP" control is offered, and using it restarts the timers and decrements the
  remaining attempts

*Basis:* `[OBSERVED]` — `POST aos/mobile/verify/submit/otp`, `msgCode "001-004"`.

---

### AC6: Scheme 1003 presents no Account Type step — *Type: Business Rule*

**Given** a Staff Salary Account application that has passed mobile verification

**When** the OTP is accepted

**Then**

* the wizard advances **directly** to "eKYC Verification"
* module sequence 2 is `EKYC_VERIFICATION` (not `ACCOUNT_TYPE`)
* no Joint / Individual / Minor selection is presented at any point
* the application is recorded with Customer Type "Individual" without any user choice

*Basis:* `[OBSERVED]` — `aosStepList` from `aos/mobile/verify/submit/otp`; Dashboard row.
This is the single largest divergence from schemes 1001 and 1002.

---

### AC7: eKYC offers four options of which only Aadhaar is mandatory — *Type: Business Rule*

**Given** the eKYC Verification stage

**When** the officer views the step

**Then**

* exactly four cards appear in order: Aadhaar via DigiLocker, PAN, Driving Licence, Voter Id
* only "Aadhaar Verification through DigiLocker" carries a `*`
* all four are openable regardless of one another
* submitting the step with only Aadhaar `Successful` advances the workflow

*Basis:* `[OBSERVED]` — step submitted with PAN/DL/Voter Id untouched.

---

### AC8: DigiLocker consent is requested without initiating on open or cancel — *Type: Integration*

**Given** the Aadhaar card

**When** the officer opens it and then clicks Cancel

**Then**

* the popup shows the verified mobile number, disabled, with the consent explanation
  "The link will be sent to the customer. They must grant access to their DigiLocker
  documents to proceed with eKYC."
* Cancel closes the popup and issues no send request
* the verification status remains 0

**And when** "Send Link" is clicked instead

**Then**

* a `Pending` badge and link-validity/resend countdowns appear
* the response reports the remaining link attempts (3 in total)

*Basis:* `[OBSERVED]` — `POST digilocker/send/link`,
`msgCode "DIGILOCKER_VERIF_LINK_SEND"`.

---

### AC9: Aadhaar completion is reported back to the agent — *Type: Integration*

**Given** a DigiLocker link that the applicant has actioned on their handset

**When** the applicant grants document access

**Then**

* the card's badge changes from `Pending` to `Successful`
* `digilockerVerifyStatus` becomes 1
* the eKYC step can then be submitted

*Basis:* `[OBSERVED]` — outcome observed via the status API. The consent act itself was
performed by a human and is not claimed as agent-observed.

---

### AC10: Liveliness offers two alternative methods, one of which suffices — *Type: Business Rule*

**Given** the Liveliness Verification stage

**When** the officer views the step

**Then**

* two options are shown: "Security Code Based Liveliness Verification" and
  "Liveliness Verification"
* each opens its own "Guidelines For Liveliness Check" popup with method-appropriate instructions
* each sends a link to the verified mobile number, capped at 3 attempts
* completing **either one** allows the step to be submitted

*Basis:* `[OBSERVED]` — step submitted with the security-code method `Successful` and the
video method never started.

---

### AC11: Address Details requires both addresses and validates them together — *Type: Validation*

**Given** the Address Details stage

**When** the officer opens the Permanent address form and submits it empty

**Then**

* `Address Line 1 is required`, `State is required`, `City is required` and
  `Pin code is required` are all displayed simultaneously
* Country is disabled and fixed to "India"
* Address Proof is not required
* no network request is issued

*Basis:* `[OBSERVED]` — client-side validation confirmed by absence of a request.

---

### AC12: Progress persists and the application is resumable — *Type: Functional*

**Given** an application partway through the journey

**When** the officer reloads, navigates away, or re-enters via Dashboard → View

**Then**

* the application resumes with all completed stages intact
* completed stages re-open read-only showing "<Stage> submitted successfully."
* completed stages are locked against editing

*Basis:* `[OBSERVED]` — verified across two sessions separated by ~2.5 hours, including two
session expiries.

---

### AC13: Steps are strictly sequential — *Type: Functional*

**Given** any point in the journey

**When** the officer inspects the stepper

**Then**

* only stages already reached are listed; future stages are not shown
* no stage can be skipped (`skipAllowed: 0`, `sequencialProcessing: 1`)
* a fresh draft exposes exactly one stage

*Basis:* `[OBSERVED]` — `aos/steps/getdetails`.

---

### AC14: Failures must be distinguishable from success — *Type: Negative*

**Given** any verification or lookup that fails

**When** the failure is returned

**Then**

* the HTTP status must reflect the failure rather than returning 200 with
  `success:"FALSE"`
* the message must name the correct module

*Basis:* `[DEFECT]` — **not currently met.** Six endpoints return 200 with an error body, and
the Liveliness status endpoint returns text about "bank statement verification". Written as
the required behaviour, not the observed one (§15.3 D-03, D-13).

---

### AC15: Every Indian jurisdiction must be selectable — *Type: Validation*

**Given** the Address form's State dropdown

**When** the officer looks for the applicant's state

**Then**

* every current Indian state and union territory must be present and correctly spelled
* the City list must be filtered to the selected State
* an impossible State/City combination must not be selectable

*Basis:* `[DEFECT]` — **not currently met.** Bihar, Sikkim, Telangana and Ladakh are absent,
`Rajasthan` is misspelled `Rajsthan`, and City is unfiltered at 4,498 entries (§15.3 D-15,
D-16). Written as the required behaviour.

---

### AC16: Both applicant images can be captured and are geo-stamped — *Type: Functional*

**Given** an application on the Applicant Photo step with a working camera available

**When** the officer captures the Applicant Signature and selects a Verified Photo

**Then**

* the signature control opens a `Capture Image` dialog showing Address, Latitude, Longitude
  and Date Time, with a live preview and a `Capture photo` button
* the `Verified Photo` popup offers `Aadhaar Verification Photo` and
  `Liveliness Verification Photo`, and its Submit stays disabled until one is chosen
* both controls report `Document Uploaded` once captured
* on step submit, each image is stored with **its own** latitude, longitude and
  reverse-geocoded address, and the photo records its provenance in `photoReferenceFrom`

*Basis:* `[OBSERVED]` — met (§6.1 FR-52..FR-56).

---

### AC17: Documents survive only if their step is submitted — *Type: Functional*

**Given** an officer who has registered a photo but not yet submitted the Applicant Photo step

**When** they leave and later resume the application

**Then** the previously registered image must **not** be presented as saved

*Basis:* `[OBSERVED]` — met, and the current behaviour is correct. `applicant/photo/get/doc`
returns `photoScanDocId: null` and the capture UI is shown again (§6.1 FR-57). Noted because
it is easy to mistake the client-side `Document Uploaded` label for persistence.

---

### AC18: A minor nominee requires guardian details — *Type: Business Rule*

**Given** the Nominee Details step

**When** the officer enters a date of birth that makes the nominee under 18

**Then**

* five mandatory guardian fields must appear — Guardian Name, Relation of guardian with
  nominee, Guardian Address, Guardian Date of Birth, Guardian Age
* restoring an adult date of birth must collapse them again, leaving no residue

*Basis:* `[OBSERVED]` — **met, and correctly implemented** (§6.1 FR-62).

---

### AC19: Nominee age must be a plausible value — *Type: Validation*

**Given** the Nominee Details step

**When** the officer enters any date of birth

**Then**

* the derived Age must be a **non-negative integer** number of years
* a **future** date of birth must be rejected with a message, not silently accepted

*Basis:* `[DEFECT]` — **not currently met.** Age renders fractionally (`36.03`), and a future
DOB is accepted by the application's own handler despite the field's `max`, producing
**`-4.07`** (§15.3 D-30). Written as the required behaviour.

---

### AC20: An introducer account failure must be visible — *Type: Negative*

**Given** the Introducer Details step

**When** the officer submits an account number the Core Banking System cannot resolve

**Then**

* an actionable error message must be displayed
* the failure must be distinguishable from a click that did nothing

*Basis:* `[DEFECT]` — **not currently met.** `introducer/save/details` returns HTTP 200 with
`{"msgCode":"503","msgDescr":"CBS connection error","success":"FALSE"}` and the UI shows
**nothing at all** — no message, no highlight, not even a console error (§15.3 D-31). Written
as the required behaviour.

---

### AC21: The Summary must faithfully and completely represent the application — *Type: Functional*

**Given** a completed application on the Summary screen

**When** the officer reviews it before submitting

**Then**

* every value shown must match what was entered upstream — **currently met** `[OBSERVED]`
* the captured photo and signature must be **visible** — *not met* (D-36)
* the pass/fail state of each eKYC and Liveliness check must be **shown** — *not met* (D-39)
* the nominee's relation, date of birth, age and address must be **shown** — *not met* (D-40)
* if no documents were attached, the Summary must **say so** — *not met* (D-35)

*Basis:* mixed. Data fidelity is `[OBSERVED]` and correct; the four omissions are `[DEFECT]`
(§15.3). Written as the required behaviour.

---

### AC22: Final submission must be gated by an explicit declaration — *Type: Business Rule*

**Given** a completed application on the Summary screen

**When** the officer is about to submit it irreversibly

**Then**

* a declaration/consent must be presented and explicitly accepted
* the Submit control must remain **disabled** until it is accepted
* the officer must be able to tell which steps can still be corrected before committing

*Basis:* `[DEFECT]` — **not currently met.** The Summary carries **0 checkboxes, 0 radios and
0 inputs**, no declaration/consent/terms text of any kind, and a bare
`<button type="submit">Submit</button>` that is **enabled from page load** (§15.3 D-43). The
stepper additionally gives no indication which steps are editable (D-42). Written as the
required behaviour.

> **Note for Step 2:** AC22 cannot be verified by executing a submission on a live
> environment. Assert on the **presence and initial state of the gate**, never by clicking
> Submit — see §15.1.

---

## 14. Dependencies / Assumptions

### 14.1 Dependencies

| Dependency | Type | Impact if unavailable |
|---|---|---|
| SMS gateway | Third-party | No OTP, no DigiLocker link, no Liveliness link — journey cannot start |
| DigiLocker | Third-party | Aadhaar eKYC cannot complete; the mandatory step blocks. **An upstream DigiLocker issue was encountered during this exploration** and manifested as a 504 on `existing/customer/data/submit` plus an incomplete Aadhaar document fetch |
| Liveliness service | Third-party | Module sequence 4 cannot complete |
| PAN verification service (`PAN_COMP`, `PAN_OCR`) | Third-party | PAN (optional) unavailable |
| Driving Licence / Voter Id lookups | Government | Optional verifications unavailable |
| `sahyognetwinMasterDB` master data | Data | State/City lists unavailable — Address Details cannot complete. **Currently incomplete** (§15.3 D-15) |
| Scheme workflow configuration (`…stsa`) | Data | Defines the entire 1003 stage sequence |
| Per-scheme field configuration API | Data | Defines mandatory flags, sizes and validation rules per field |
| Savings Application Dashboard (US_006) | Module | Entry and resume path |
| Scheme Selection (US_007) | Module | Entry path |
| A real applicant with a handset, DigiLocker account and physical availability | Data/Human | **Three human-only gates** — see §15.1 |

### 14.2 Assumptions

| # | Assumption | Why it is an assumption and not a fact | Needs confirmation from |
|---|---|---|---|
| A-01 | Staff Salary Account is intentionally Individual-only | The absence of an Account Type step is observed, but whether it is by design or a missing workflow configuration is not | Stakeholder |
| ~~A-02~~ | ~~The journey continues past Address Details to further stages~~ | **RESOLVED** — the full 13-step sequence plus Summary is now observed and tabulated (§5.3) | — |
| A-08 | The Summary's Submit performs the final, irreversible submission | Strongly implied by its position, its `type="submit"`, and the one-way Cancel documented elsewhere — but **the click was never made**, so the behaviour is inferred, not seen | Stakeholder / further exploration |
| A-09 | `Document Upload`'s `skipAllowed: 1` is a deliberate product decision | It is explicit server-side configuration rather than a UI slip, but whether a KYC product is *meant* to accept zero documents is a compliance question | Stakeholder / Compliance |
| A-10 | The applicant's declaration/consent is captured outside this journey | The Summary carries none at all; either it exists on paper or downstream, or it is genuinely missing | Compliance |
| A-11 | `isNameMismatch` is genuinely computed rather than defaulted | It returned `0` while `bankAccountUserName` was `null`, which cannot be a real comparison | Dev |
| A-03 | The Permanent address would auto-populate from Aadhaar on a clean run | It did not here, but the Aadhaar document fetch never completed, so cause is indeterminate | Further exploration |
| A-04 | `stepStatus` values are 0 = pending, 1 = complete, 3 = link sent, 13 = in progress | Inferred from observed transitions, not from documentation | Dev |
| A-05 | The scheme's advertised benefits are enforced by downstream product config | The scheme record contains no attribute for them | Stakeholder |
| A-06 | PAN document upload works under real mouse-driven interaction | All three programmatic paths failed with no network call | Manual confirmation |
| A-07 | `[REPO]` findings from Silver/Normal (e.g. liveliness identity-matching, document content validation) also apply to 1003 | Shared platform components make it plausible, but 1003 was not tested for them | Further exploration |

### 14.3 Not verified during exploration

| Area | Reason not verified |
|---|---|
| ~~**Summary / Review screen**~~ | **RESOLVED 2026-08-18.** Reached and fully documented — fields and values, the field-by-field upstream comparison, edit affordances, the absence of any declaration/consent, and the Submit control's label and state. See §6.1 FR-59..FR-76 and exploration log §4.20 |
| ~~Nominee Details, Document Upload, Introducer Details, Lead Details~~ | **RESOLVED 2026-08-18.** All reached and documented — §6.1 FR-60..FR-68 |
| **What happens after the Summary's Submit is clicked** — any confirmation dialog, the success screen, the resulting application status and the endpoint called | **Deliberately not performed — not authorised.** Submission is irreversible (Cancel is the only exit and is itself one-way), and `SAH-1003-812` carries a real verified identity with a fabricated address, a synthetic camera-frame signature and zero supporting documents. The control was inspected only |
| Whether the server rejects a **future nominee date of birth** | Client-side acceptance (yielding `Age = -4.07`) is `[OBSERVED]`; submitting it would have persisted a corrupt nominee onto the application being used to reach the Summary |
| Introducer **name-mismatch** handling (`isNameMismatch: 1`) | Requires a second real third-party CBS account paired with a deliberately wrong name |
| Document Upload's document-type dropdowns and `+ Add Custom Document` | Not opened — uploads are blocked by D-05 regardless, and the objective was the Summary screen |
| Whether an inappropriate Mode of Operation (`Jointly`/`Guardian`) is accepted on save | `Self` was used so the journey could proceed; testing an invalid mode would require a second full 29-field pass, since the form discards partial progress. **Still open** |
| Per-field character-set validation on Basic Details | Deprioritised against the Summary objective; the step was already complete and re-probing risked the record. **Still open** |
| Whether `Staff Id` is validated later in the approval workflow | Post-submission workflow is out of scope |
| Whether the Communication copy goes stale when the Permanent address is edited | **Untestable from the UI** — a saved address has no edit affordance (FR-37) |
| Whether Mode of Operation = Jointly/Guardian is rejected on submit for 1003 | Basic Details was not submitted |
| Whether 1003 auto-populates Permanent address from Aadhaar | Indeterminate — Aadhaar document fetch never completed |
| PAN successful verification and its name/DOB confirmation sub-step | Blocked by D-05 |
| PAN document content validation | Blocked by D-05 — no document could be submitted |
| Driving Licence / Voter Id successful verification | Safety constraint — real government lookups, invalid data only |
| Liveliness video/camera method behaviour | Deliberately not initiated — only one method is required; would consume an attempt and a human gate |
| Liveliness identity-matching integrity | Would require impersonating an applicant on a live KYC step |
| DigiLocker denial / expiry / resend cooldown | Would consume limited attempts and require further human cycles |
| OTP max-attempt lockout, "Change Mobile Number?" | Would strand the application or consume the last send |
| Double-submit, whitespace handling, responsive layout | Time and attempt-budget constraints |
| Application Cancel / Track Application | Cancel is irreversible and explicitly out of bounds |
| `SAH-1003-772` (pre-existing draft) | Real third-party in-progress application; left untouched |

---

## 15. Impacted Areas

### 15.1 Application areas touched by this story

| Area | Nature of impact | Regression risk |
|---|---|---|
| Scheme Selection (`/schemelist`) | Direct — shared across all three schemes | Medium |
| Application wizard shell (`/applndetails`) | Shared component — header, stepper, step locking | **High** |
| Mobile Number Verification | Shared across schemes | **High** |
| eKYC Verification (all four methods) | Shared across schemes | **High** |
| Liveliness Verification | Shared across schemes | **High** |
| Address Details + State/City master data | Shared across schemes **and modules** | **High** |
| Per-scheme workflow configuration (`…stsa`) | Direct — 1003-specific | Medium |
| Per-scheme field configuration API | Shared config mechanism | Medium |
| Savings Application Dashboard | Indirect — lists and resumes 1003 applications | Low |
| Applicant Photo capture (camera + geolocation) | Shared across schemes | **High** |
| Nominee Details (incl. guardian sub-form) | Shared across schemes | **High** |
| Document Upload | Shared across schemes | **High** |
| Introducer Details + **CBS integration** | Shared; touches the Core Banking System | **High** |
| Lead Details + staff-code verification | Shared across schemes | Medium |
| Summary / Review screen | Shared across schemes | **High** |

> **Testability constraint (for Step 2):** scheme 1003 has **three human-only gates** — SMS
> OTP, DigiLocker consent, and Liveliness — each capped at 3 attempts and each consuming a
> real SMS to a real person. **A cold end-to-end run cannot be automated.**
>
> **However, the picture has improved materially.** The Applicant Photo camera step is
> **no longer a gate**: launching the MCP browser with a **fake video device** plus pre-granted
> `camera` and `geolocation` permissions makes both the signature capture and the Verified
> Photo path fully automatable —
> `npx @playwright/mcp@latest --config playwright-mcp-camera.config.json`.
> Two prerequisites, both learned the hard way: the matching browser build must be installed
> (`npx @playwright/mcp@latest install-browser chromium`), and **permissions alone are not
> enough — the device and the permissions are both required**.
>
> **Consequently a suite that resumes a seeded application already past Liveliness can drive
> the journey automatically all the way to the Summary screen** — the same seed strategy
> already adopted for the NSA module `[REPO]`. Two external fixtures are needed: a **valid CBS
> account number** for Introducer Details, and a **valid staff code** for Lead Details;
> without them those steps cannot pass, and an invalid introducer account fails *silently*
> (D-31), which will look like a hung test rather than a failed one.
>
> **Final Submit must remain manual-only** — it is irreversible, and Cancel is the only exit
> and is itself one-way. AC22 should be asserted by inspecting the gate's presence and initial
> state, **never** by clicking Submit.

### 15.2 Automation assets affected

| Asset | Action needed |
|---|---|
| `tests/pages/savings-application/SchemeSelectionPage.ts` | Reuse as-is |
| `tests/pages/savings-application/application-form/ApplicationFormFlow.ts` | **Update** — `startNewApplication()` must accept scheme 1003, and the flow must not assume an Account Type step |
| `tests/pages/savings-application/application-form/MobileVerificationStep.ts` | **Update** — its comment about the Send control's visibility is contradicted on 1003 (D-19) |
| `tests/pages/savings-application/application-form/AccountTypeStep.ts` | **Not applicable to 1003** — no such step exists |
| `tests/pages/savings-application/application-form/EkycVerificationStep.ts` | Reuse, with the caveat that the PAN upload path is currently non-functional (D-05) |
| `tests/pages/savings-application/StaffSalaryApplicationPage.ts` | **New** — mirroring `SilverApplicationPage.ts` / `NormalApplicationPage.ts`, asserting scheme name "Staff Salary Account - 1003" |
| Liveliness / Address Details page objects | **New** — no page object exists for either |
| Applicant Photo page object | **New** — must drive the `Capture Image` dialog and the `Verified Photo` popup. **Note there is no `<input type="file">` on the step**, so no upload-based shortcut exists |
| Nominee Details page object | **New** — two pages, plus the conditional guardian sub-form. Beware `<input name="422001">` (D-33): the pin-code selector is not stable, so select by placeholder or position, not `name` |
| Document Upload page object | **New** — note the step submits empty (`skipAllowed: 1`) |
| Introducer Details page object | **New** — requires a **valid CBS account fixture**; an invalid one fails silently (D-31), so assert on advancing to the next step, not on the absence of an error |
| Lead Details page object | **New** — requires a **valid staff code fixture**; each code must be verified before Submit, and verifying the first **clears the second** (D-34), so fill and verify strictly in sequence |
| Summary page object | **New** — parse `summaryDataJson` (a **JSON string**, requiring a second parse) rather than scraping the DOM where possible |
| Playwright config for camera-dependent specs | **New** — `playwright-mcp-camera.config.json` exists for MCP; the equivalent for the test runner needs `--use-fake-device-for-media-stream` plus `permissions: ['camera','geolocation']` and a fixed `geolocation` |
| `tests/10_STAFF_TS001/*.spec.ts` | **New** suite |

### 15.3 Defect candidates found during exploration

| # | Area | Observed | Expected | Proposed severity | Tag |
|---|---|---|---|---|---|
| D-01 | OTP / DigiLocker / Liveliness timers | UI counts down from ~18 m 19 s vs `otpExpiryMin: 15`; 27 m 14 s vs `linkExpiryMin: 25`; 28 m 23 s vs `linkExpiryMin: 25`. Near-identical values across independent sends indicate hard-coded client constants. **Three independent instances.** | Countdown derived from server config | Major | `[DEFECT]` |
| D-02 | OTP secret exposure | `aos/mobile/verify/get/details` returns `mobileOtp` as a bcrypt hash to the browser; a short numeric OTP is offline-brute-forceable | OTP never sent to the client | Major (Security) | `[DEFECT]` |
| D-03 | Error signalling | **Eight** endpoints return HTTP 200 with `success:"FALSE"` / `isError:true`, including `msgCode:"500"` and `msgCode:"503"` inside a 200. Notably `applicant/photo/get/doc` reports a **legitimately empty state** as a `500` "No record found!" error, and `introducer/save/details` returns a `503` the UI swallows entirely (D-31). A naive status check passes on every one | Non-2xx for failures; empty ≠ error | Major | `[DEFECT]` |
| D-04 | DigiLocker popup copy | Renders "The link has been sent on +91-…" **before** any link is sent, while the backing call reports "Details are not present !" | No send claim until a link is sent | Major | `[DEFECT]` |
| D-05 | **Document upload — platform-wide** | File binds to the DOM input but never registers. Confirmed on **two controls in two modules**: PAN (no upload request on 3 paths; submit blocked) and Address Proof (no request; `uploadFileType: null` persisted). PAN is hard-blocked as its upload is mandatory | Selected file accepted and uploaded | Critical *(upgraded from PAN-specific; pending manual confirmation — A-06)* | `[DEFECT]` |
| D-06 | Upload accept filter — **PAN only** | PAN's `accept=".png,.pdf,.camera"` omits jpeg, contradicting its label and backend config. Address Proof's accept correctly includes `.jpg`, so this is not application-wide | jpeg accepted as advertised | Major *(narrowed)* | `[DEFECT]` |
| D-07 | Upstream-failure handling | An upstream timeout produced an indefinite spinner with no error, no retry, no indication of failure. *(The 504 itself was environmental and self-healed — not a product defect.)* | Failure surfaced with a retry option | Minor | `[DEFECT]` |
| D-08 | Validation consistency — **eKYC popups only** | Address Details, **Nominee Details and Introducer Details all flag every missing mandatory field together**; PAN and DL reveal them one at a time and never flag DL's mandatory DOB. **Scope narrowed:** this is specific to the eKYC PAN/DL popups, not platform-wide form behaviour | Consistent behaviour across forms | Minor *(narrowed)* | `[DEFECT]` |
| D-09 | Field marking | "Enter OTP" carries no `*` despite being unconditionally required | Consistent mandatory marking | Minor | `[DEFECT]` |
| D-10 | Copy consistency | `Digilocker` vs `DigiLocker`; three different accepted-format strings (`png,jpeg,pdf,camera` / `png, jpg, pdf, camera` / `png, jpg, pdf,camera`), jpeg vs jpg; declarative vs imperative error styles; `You have 1 attempts left`; `process , ask applicant`; a missing sentence break in liveliness guideline 4 | Consistent terminology and grammar | Minor | `[DEFECT]` |
| D-11 | PAN Number length | Backend `field_size: "100"` vs DOM `maxlength="10"`; 16 chars silently truncated | Config and UI agree; truncation surfaced | Minor | `[DEFECT]` |
| D-12 | DL Number validation | `maxLength: 50`, no format validation; 21-char nonsense passed to a real government lookup | Validated before an external call | Major | `[DEFECT]` |
| D-13 | Liveliness status message | Returns `"Request is not found for bank statement verification  !"` on a liveliness endpoint | Message describes the correct module | Minor | `[DEFECT]` |
| D-14 | Liveliness security code exposure | `aos/liveliness/get/details` returns `photoSecuritycode` **in plaintext** to the initiating browser — the code the applicant must prove possession of. With `[REPO]` BUG-SILVER-004 (no identity matching), the control is defeatable end-to-end | Code never exposed to the initiating client | **Critical (Security)** | `[DEFECT]` |
| D-15 | State master data | 33 entries **missing Bihar, Sikkim, Telangana, Ladakh**; `Rajasthan` misspelled `Rajsthan`; `Uttarakhand` sorted before `Uttar Pradesh`. Address Details is mandatory, so affected residents **cannot open an account** | Complete, correct, correctly-sorted list | **Critical** | `[DEFECT]` |
| D-16 | State → City cascade | No filtering (4,498 entries). **Confirmed the impossible pair is PERSISTED, not merely selectable**: `Maharashtra` + `Abohar` (Punjab) saved with `stCode:27`/`cityCode:10`, rejected by neither client nor server; PIN not cross-validated | City filtered to State; impossible pairs rejected | **Critical** *(upgraded — the system stores it)* | `[DEFECT]` |
| D-17 | Documentation drift | The originating task envelope states "Silver 1001, Normal 1002" — inverted. Live and `US_006` / `SAD_TS001` agree on Normal 1001 / Silver 1002 | Documentation matches the system | Minor | `[DEFECT]` |
| D-18 | Locked-step affordance | Clicking a locked step's stepper tab is a silent no-op with no explanation | Explain, or remove the affordance | Minor | `[DEFECT]` |
| D-19 | Documentation drift | `MobileVerificationStep.ts` and Silver TC-SIL-002 describe "Send Verification Code" appearing from 1+ digits; on 1003 it appears only at 10 | Repo matches observed behaviour | Minor | `[DEFECT]` |
| D-20 | Address form field loss | A populated mandatory `Pin code` was **silently cleared** by later interaction in the same form; submit then failed with `Pin code is required` | Entered values persist within the form | Major | `[DEFECT]` |
| D-21 | "Same as Permanent" partial lock | Ticking disables only Address Line 1; Line 2, Area and Pin code stay editable, so the copy can be silently diverged | Lock all copied fields, or none | Minor | `[DEFECT]` |
| D-22 | "Same as Permanent" data loss | Unticking blanks every field and does not restore previously-typed values (verified destructively). No warning, no undo | Restore prior input, or warn | Major | `[DEFECT]` |
| D-23 | Branch master data | `Sadak Arjuni Branch` (Id 10556) and `SADAK ARJUNI BRANCH` (Id 1017) appear to duplicate one branch under two Ids | One record per branch | Minor | `[DEFECT]` |
| D-24 | Spouse / Father's Name length | `maxLength: 20` on 1003, with no counter or hint. Reproduces `[REPO]` BUG-SILVER-003 (here a hard cap, and the field is optional) | Realistic limit, or a visible hint | Minor | `[DEFECT]` |
| D-25 | Mode of Operation not filtered | Offers `Jointly`, `Guardian`, `Jointly With Others`, `Any Two Jointhly` on an Individual-only scheme with no Account Type step | Options filtered to valid modes | Minor *(submit-time rejection `[NOT VERIFIED]`)* | `[DEFECT]` |
| D-26 | No address/identity cross-validation | A wholly fabricated address, internally inconsistent (city in the wrong state), was accepted against a real DigiLocker-verified identity with no conflict raised | Consistency checked, or divergence flagged | Major | `[DEFECT]` |
| D-27 | **`Staff Id` unvalidated** | The field establishing entitlement to a staff-only product is free text (maxLength 100) with **no format mask, no pattern check and no lookup against any staff master** — `STAFF0001` accepted with no verification request | Validated against an employee register, or at minimum format-checked | **Major** | `[DEFECT]` |
| D-28 | Master-data quality in dropdowns | `Designation/Profession` (83 options) contains duplicates — `Shop Owner`, `Hotel Owner`, `Dairy Farmer`, `Labourer` each twice. `Education/Qualification` contains **`MS computers`** (stray test data in a live list). `Region` has typo `Metropolitian City`; `Mode of Operation` has typo `Any Two Jointhly` | De-duplicated, correctly-spelled production master data | Minor | `[DEFECT]` |
| D-29 | Duplicated upload-option label — **shared component fault** | `Capture Using Camera` rendered **twice** on both Photo and Signature, and **no `<input type="file">` exists on that step**, so **Signature has no non-camera path at all**. **Scope widened:** the nominee's Address Proof control renders **`Browse Computer` twice** (no camera option), while the main Document Upload control renders the pattern **correctly** — so the correct component exists and these two instances are misconfigured. **Scope corrected:** the Verified Photo popup's Submit is *not* part of this defect — it proved permission-gated | Browse + Camera offered consistently | **Major** | `[DEFECT]` |
| D-30 | **Nominee age computation** | Age is derived from DOB and shown **fractionally** (`36.03`, `6.07`). A **future DOB is accepted by the app's own handler** despite the input's `max`, producing **`Age = -4.07`** — a negative age — with no error | Integer age; future DOB rejected | **Major** | `[DEFECT]` |
| D-31 | **Introducer CBS failure is completely silent** | An unresolvable account number returns HTTP 200 `{"msgCode":"503","msgDescr":"CBS connection error","success":"FALSE"}`; the UI shows **no message, no highlight and no console error**, and simply does not advance. The user sees a click that did nothing | Actionable error and a retry | **Major** | `[DEFECT]` |
| D-32 | Introducer name-match may be vacuous | On success `bankAccountUserName` is **`null`** while `isNameMismatch: 0` claims the names match — a null name cannot match anything | Name resolved and genuinely compared | **Major** *(`[INFERRED]`)* | `[DEFECT]` |
| D-33 | Nominee Pin Code `name` attribute | Renders as **`<input name="422001">`** — the `name` holds the field's *value*, not a field name, unlike every sibling field | A stable field name | Minor | `[DEFECT]` |
| D-34 | Lead Details field loss | Clicking `Verify` on Lead Converter Code **silently clears the already-populated Sourcer Code**. Same class as D-20 | Other fields untouched by a verify action | **Major** | `[DEFECT]` |
| D-35 | **Document Upload skippable and invisibly empty** | The step submits with **zero documents** and no warning (`skipAllowed: 1`), and the Summary renders its section as a **bare heading**. Compounds with D-05 (uploads never register), so a 1003 application can reach final submission with **no supporting documents at all** | Documents enforced, or their absence stated at review | **Critical** *(regulatory)* | `[DEFECT]` |
| D-36 | Captured images never visible | No preview, thumbnail, filename or retake at capture; the Summary shows photo and signature as **labels with no image**. There is no point in the journey where anyone can see what was captured | Thumbnail at capture and at review | **Major** | `[DEFECT]` |
| D-37 | Nominee relation master data | 17 options, **unsorted**, with three overlapping sets — `Wife`/`Husband` vs `Spouse`, `Father`/`Mother` vs `Parent`, `Brother`/`Sister` vs `Sibling` — plus `No Relation` and `Business Associate` offered as nominee relations | De-duplicated, sorted, distinct list | Minor | `[DEFECT]` |
| D-38 | No separation of duties on Lead Details | The **same staff code** was accepted as both Lead Converter and Sourcer, resolving to the same name twice | Distinct parties enforced, or justified | Minor | `[DEFECT]` |
| D-39 | Summary hides eKYC/Liveliness outcomes | `subModVerified` is `true` for Aadhaar and `false` for PAN/DL/Voter Id, but **all render identically**. A reviewer cannot tell which identity checks passed | Verified state rendered per sub-module | **Major** | `[DEFECT]` |
| D-40 | Summary omits most nominee data | Only `Full name` and `Status` appear; **relation, date of birth, age and address are absent** | All captured nominee data shown | **Major** | `[DEFECT]` |
| D-41 | Summary rendering / schema inconsistencies | Blank optional fields render `NA` (Religion), blank system fields render `-` (CIF ID) — two null conventions on one screen. A transaction **count** renders as `120.00`. Branch fields carry the misspelled `"valueType": "charcter varying"` | One null convention; counts as integers; correct schema | Minor | `[DEFECT]` |
| D-42 | Editable vs locked steps indistinguishable | All 13 stepper tabs share the class `scroll_tab_first`; six are editable and seven are locked, but the user must click each to discover which | Locked steps visually distinct | Minor | `[DEFECT]` |
| D-43 | **No declaration or gate before final submission** | The Summary carries **0 checkboxes, 0 radios, 0 inputs**, no declaration/consent/terms text, and a bare `<button type="submit">Submit</button>` **enabled from page load**. Nothing gates the final irreversible act | An explicit declaration, with Submit disabled until accepted | **Critical** *(regulatory)* | `[DEFECT]` |

> Handed to the Orchestrator. Not filed into `reports/STAFF_TS001-defect-sheet.xlsx` by the
> BA Agent — defect logging is Step 7.

> **Two `[DEFECT]` entries above are regulatory rather than merely functional — D-35 (an
> application can be submitted with zero supporting documents) and D-43 (no declaration or
> consent gates the irreversible submission). Both warrant a compliance decision before Step 2
> writes tests that assume the current behaviour is correct.**

---

## Current System Behaviour Summary

The Staff Salary Account (scheme 1003) is reachable today from the Savings Application
Dashboard via New Application → Scheme Selection, and it runs a **genuinely different journey
from the Silver and Normal schemes** — it has its own workflow definition, and cross-scheme
assumptions do not hold. **The journey is now mapped end to end**: Mobile Number Verification
→ eKYC Verification → Existing Customer Data (an invisible system step) → Liveliness
Verification → Address Details → Branch Selection → Basic Details → Salaried Information →
Applicant Photo → Nominee Details → Document Upload → Introducer Details → Lead Details →
**Summary**. That is thirteen workflow steps followed by a review screen which is not itself a
step. The single largest structural difference is that **1003 has no Account Type step at
all**: there is no Joint / Individual / Minor choice, and every 1003 application is silently
recorded as Individual. Whether that is intended is still the most important open question
about the product's shape.

**The Summary screen was reached and documented; the final Submit was deliberately not
clicked.** Submission is irreversible and was not authorised, so everything downstream of that
button remains unverified.

What works well: the wizard is genuinely robust about state. Steps lock once complete,
nothing can be skipped, and progress survived page reloads, navigation away, two session
expiries and a two-and-a-half-hour gap between sessions. Mobile number entry is properly
defensive, OTP expiry is enforced server-side, and attempt budgets are applied consistently at
three attempts for the OTP, the DigiLocker link and the Liveliness link. Aadhaar via
DigiLocker and the security-code Liveliness check both completed successfully end to end.
Field rules turn out to be data-driven per scheme and are exposed by a configuration API,
which is a strong foundation.

Two fields turn out to carry the product's real identity. Basic Details on 1003 includes
**`Is Staff`** — a mandatory dropdown whose only selectable value is `YES`, pre-set and
unchangeable, so it presents a decision that does not exist — and a mandatory **`Staff Id`**.
Neither exists on the sibling schemes. Conversely 1003 **drops** `Employment Type` and
`Initial Funding Amount` (`Designation/Profession` is not dropped but relocated to the
Salaried Information step, where it is the only mandatory field). That is a substantive
data-model difference, and it means the Employment-Type routing matrix that dominates the
Silver and Normal journeys has no input here and cannot apply — Basic Details simply routes
to Salaried Information unconditionally.

The `Staff Id` finding deserves emphasis. It is the single field that establishes entitlement
to a staff-only product, and it is accepted as free text up to 100 characters with no format
mask, no pattern validation, and **no lookup against any staff master or employee register** —
`STAFF0001` was accepted without a single verification request. For a scheme whose entire
premise is that the applicant is an employee, that is an unguarded control.

What does not work is more serious. **Applicants in Bihar, Sikkim, Telangana or Ladakh cannot
open an account at all** — those jurisdictions are simply absent from the State master data,
and Address Details is mandatory; "Rajasthan" is also misspelled. The State→City cascade is
not implemented, and this run confirmed the consequence is not cosmetic: a deliberately
impossible pair, Maharashtra with the Punjab city Abohar, was **saved** with mutually
inconsistent master-data codes and rejected by neither the client nor the server, with the
PIN uncross-checked too. More broadly, nothing validates the address against the identity —
a real DigiLocker-verified applicant now carries an entirely invented address and no conflict
was raised. The liveliness security code is returned to the agent's own browser in plaintext,
which — combined with the previously-reported finding that the check does not verify identity
— means the control can be defeated by the person operating it. Document upload is broken
across the platform rather than in one place: neither the PAN control nor the Address Proof
control registers a selected file, and because PAN's upload is mandatory, PAN verification
cannot be completed at all. And six endpoints report failure as HTTP 200 with
`success:"FALSE"`, so a naive status check reads outright failures as successes.

The address step also revealed a cluster of smaller data-integrity problems worth fixing
together: a populated mandatory Pin code was silently wiped by a later interaction in the same
form; ticking and then unticking "Same as Permanent address" destroys previously-typed values
with no warning or undo; and a saved address has no edit affordance at all, so a typo cannot
be corrected. One piece of good news against expectations: **"Same as Permanent address"
works correctly on 1003**, copying all seven fields as structured values — which directly
contradicts the previously-reported BUG-SILVER-002 / BUG-NORMAL-001 and is recorded as
documentation drift rather than a defect.

One earlier conclusion has been corrected: a 504 encountered mid-journey was initially
recorded as a hard blocker that stranded the application. On re-test it had **self-healed**,
and the stakeholder confirmed the underlying cause was a DigiLocker-side problem. It is now
recorded as an environmental/third-party limitation, not a product defect; only the UI's
handling of it — an indefinite spinner with no error or retry — remains an application-side
finding, at Minor severity.

The Applicant Photo blocker is now cleared. Supplying the browser with a **fake video device**
alongside pre-granted camera and geolocation permissions let both images be captured, and the
step submitted. Two lessons carry forward: the images are **discarded entirely unless the
step's own Submit succeeds** (an earlier pass believed the photo had persisted — it had not,
and the server reported `photoScanDocId: null`), and the camera step is therefore **not** a
human gate after all. Because Signature still offers no non-camera path, though, any agent
working without a functioning camera remains unable to complete an application.

The four newly-walked stages each surfaced something. **Nominee Details** contains the best
piece of engineering in the journey — entering a minor's date of birth cleanly reveals five
mandatory guardian fields and collapses them again on correction — but it also computes age
fractionally (`36.03`) and accepts a **future** date of birth, yielding a nominee aged
**minus four**. **Document Upload** is the only step in the entire workflow flagged
`skipAllowed: 1` server-side, and it submits with zero documents attached and no warning;
combined with document upload being broken platform-wide, a Staff Salary application can reach
the point of submission carrying **no supporting documents at all**. **Introducer Details**
turns out to perform a real Core Banking System lookup on the account number — genuinely good —
but when that lookup fails it returns `CBS connection error` inside an HTTP 200 and the
interface displays **absolutely nothing**: no message, no highlight, not even a console error.
That is the most user-hostile failure found anywhere in this journey. **Lead Details** requires
both staff codes to be verified before submitting, which is sound, yet verifying the first
silently erases the second, and the same code is accepted for both roles.

The Summary screen itself is a study in fidelity without completeness. **Every value it
displays matches what was entered upstream** — a field-by-field comparison against the recorded
synthetic data found no corruption anywhere, which is genuinely reassuring. What it *omits* is
the problem. The applicant's photo and signature are not shown at all, so there is no point in
the entire journey where anyone can see what was captured. The pass/fail state of each eKYC and
liveliness check is present in the API payload but rendered nowhere, so a reviewer cannot tell
that only Aadhaar succeeded. The nominee appears as a bare name — relation, date of birth, age
and address, all captured as mandatory, are simply absent. And the Document Upload section
renders as an empty heading rather than stating that nothing was attached.

Most significantly, **the Summary carries no declaration, no consent, no terms and no
acknowledgement of review of any kind** — zero checkboxes, zero inputs, no matching text — and
its Submit control is a bare, unstyled `<button type="submit">Submit</button>` that is enabled
from the moment the page paints. Nothing whatsoever gates the final, irreversible act of
opening a bank account. Together with the zero-document finding, that is a compliance question
rather than a UI nicety, and it should be answered before Step 2 writes tests that assume the
present behaviour is correct.

Editing from the Summary works, but opaquely: six of the thirteen steps reopen as editable,
pre-populated forms (correcting an earlier note — completed steps *do* retain their dropdown
values), the other seven reopen read-only with no Submit, and **nothing in the stepper tells
you which is which**.

For planning: the three human-only gates — OTP, DigiLocker consent and Liveliness — remain the
only true automation blockers. Everything from Applicant Photo through the Summary is now
automatable given a fake video device, a valid CBS account number and a valid staff code, so a
suite that resumes a seeded application past Liveliness can reach the Summary unattended.
Final Submit should stay manual: it is irreversible, and Cancel is the only exit and is itself
one-way. `SAH-1003-812` is left parked on the Summary with all thirteen steps complete and
**unsubmitted** — an ideal seed for Step 2, but not a record that should ever be submitted,
carrying as it does a fabricated address, a synthetic camera frame in place of a signature, and
no documents.

---

## Out of Scope

The following are deliberately excluded from this story:

* Post-submission approval, decision and query workflows — not reached, and excluded by the
  task scope
* Silver Savings Account - 1002 (`US_008`) and Normal Savings Account - 1001 (`US_009`),
  except where contrasted to show that 1003 differs
* Savings Application Dashboard behaviour — covered by `US_006` / `SAD_TS001`
* Scheme Selection screen behaviour in its own right — covered by `US_007` / `SCH_TS001`
* Application Cancel and Track Application — `US_006`; Cancel is irreversible and was
  explicitly out of bounds
* Joint and Minor account journeys — **not applicable**: scheme 1003 offers no Account Type
  selection
* **The act of final submission and everything downstream of it** — the Summary's Submit
  control is documented but was deliberately never operated (irreversible; not authorised)
* Test case authoring — Step 2's responsibility
* Defect logging into `reports/` — Step 7's responsibility
