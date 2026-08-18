# SSA_TS001 — Test Plan: Staff Salary Account Application Journey

**Story:** `user-stories/US_010_Staff_Salary_Account_Journey.md` (Story ID: US_010)
**Module:** Savings Account → Staff Salary Account → full application journey (Mobile Verification through final Summary/Submission)
**Route under test:** `/applndetails` (reached via Home → Savings Application card → New Application → Scheme Selection → select "Staff Salary Account - 1003")
**Priority:** High
**Environment:** https://sahyogagentweb.drutam.in:9634 (UAT)
**Credentials:** `nayan.aher@netwinindia.in` / `Sahayog@2025`

---

## 1. Reconnaissance Summary (2026-08-17)

Staff Salary Account (scheme code 1003) is the third scheme under the Savings Account product, alongside Silver (1002) and Normal (1001). Its scheme description: *"...an exclusive benefit for employees, offering a zero-balance facility for hassle-free monthly salary credits... Designed to meet staff financial needs."*

Confirmed via the configured module list (`POST /app/get/aosModules`, scheme code 1003) — **do not assume this mirrors Silver/Normal**:

- **No Account Type (Customer Type) selection step.** Module sequence goes directly `MOBILE_VERIFICATION` (1) → `EKYC_VERIFICATION` (2), unlike Silver/Normal which insert `CUSTOMER_TYPE` between these. Working hypothesis: this scheme is **Individual-only** — to be confirmed on first live run.
- **Two dedicated FATCA steps** not present as separate steps on Silver/Normal: `FATCA_RESIDENT_INFO` ("FATCA Personal Details", seq 8) and `FATCA_TAX_DETAILS` ("FATCA Tax Details", seq 9), between Basic Details (7) and Salaried Information (10).
- Everything else in the module list (eKYC, Liveliness, Address, Branch, Basic Details, Salaried Information, Applicant Photo, Nominee, Document Upload, Introducer Details, Lead Details, Summary) matches the module codes already seen on Silver/Normal — field-level and behavioral differences, if any, are not yet known and must be confirmed live.

Full module list: see `user-stories/US_010_Staff_Salary_Account_Journey.md` for the table.

**Live execution complete (2026-08-17):** the full journey has been traced end to end and a real application (`SAH-1003-813`) was submitted successfully (`ENDMOD_200`). A blocking defect (BUG-SSA-001) was found and resolved server-side mid-session — see Defect Log. All ACs below are now confirmed.

---

## 2. Acceptance Criteria (tagged)

| AC | Summary | Status |
|---|---|---|
| AC1 | Scheme Selection — Staff Salary Account - 1003 available and launches correctly | **Confirmed** (SAH-1003-813, SAH-1003-814) |
| AC2 | Mobile Number Verification — first step, proceeds directly to eKYC (no Account Type step) | **Confirmed** — no Account Type step exists; scheme is Individual-only |
| AC3 | eKYC Verification (DigiLocker/PAN/DL/Voter ID options) | **Confirmed** — PAN Verification fully exercised (two-submit, auto-fill from PAN lookup); DigiLocker fully exercised after BUG-SSA-001 resolved; DL/Voter ID structure documented, not functionally exercised |
| AC4 | Liveliness Verification | **Confirmed** — real Security Code Based Liveliness completed |
| AC5 | Address Details (Permanent + Communication) | **Confirmed** — "Use Existing Address" auto-fill worked correctly |
| AC6 | Branch Selection (default) | **Confirmed** — default branch (AMGAON BRANCH) accepted with single Submit |
| AC7 | Basic Details (field set, incl. new Is Staff/Staff Id fields) | **Confirmed** |
| AC8 | FATCA Personal Details — **new step, not on Silver/Normal** | **Confirmed skipped** — not present in the submitted step list for an India-tax-resident applicant |
| AC9 | FATCA Tax Details — **new step, not on Silver/Normal** | **Confirmed skipped** — same as AC8 |
| AC10 | Employment/Salaried Information | **Confirmed** — no separate Employment Type field; scheme-specific Category list (Govt/PSU/Defence-focused) |
| AC11 | Applicant Photo | **Confirmed** — Verified Photo + camera-captured signature |
| AC12 | Nominee Details (+ nested Address) | **Confirmed** |
| AC13 | Document Upload | **Confirmed** — Ration Card |
| AC14 | Introducer Details | **Confirmed required** (not conditionally skipped) |
| AC15 | Lead Details | **Confirmed** |
| AC16 | Summary + real final Submission | **Confirmed** — `SAH-1003-813` submitted, `ENDMOD_200` |

---

## 3. Test Cases

| ID | Title | Type | AC | Priority | Result |
|---|---|---|---|---|---|
| TC-SSA-001 | Staff Salary Account - 1003 appears as a selectable scheme card alongside Silver/Normal | Happy Path | AC1 | Critical | Confirmed live |
| TC-SSA-002 | Selecting the scheme launches a new application with Scheme Name "Staff Salary Account - 1003" and Product Name "Savings Account" | Happy Path | AC1 | Critical | Confirmed live (SAH-1003-813, SAH-1003-814) |
| TC-SSA-003 | Mobile Number Verification is the first step; a valid real OTP completes it successfully | Happy Path | AC2 | Critical | Confirmed live (both applications) |
| TC-SSA-004 | No Account Type step exists — stepper proceeds directly from Mobile Verification to eKYC Verification | Business Rule | AC2 | Critical | Confirmed live — scheme is Individual-only |
| TC-SSA-005 | Application List's Customer Type column shows "Individual" with no explicit selection ever made | Business Rule | AC2 | High | Confirmed live |
| TC-SSA-006 | eKYC Verification presents 4 methods (Aadhaar/DigiLocker, PAN, Driving Licence, Voter Id) as an accordion; selecting one replaces the view, a fresh reload restores all 4 | UI | AC3 | High | Confirmed live |
| TC-SSA-007 | PAN Verification: entering a real PAN + uploading a document, then Submit, auto-fetches First/Middle/Last Name and Date of Birth from the PAN database | Happy Path (Live) | AC3 | Critical | Confirmed live — PAN `CYKPP8237N` → "NAVODAY DILIP PATIL", DOB 1997-08-23 |
| TC-SSA-008 | PAN Verification requires a second Submit (on the auto-filled confirmation form) to reach "Successful" status — a two-submit pattern matching Branch Selection | Business Rule | AC3 | High | Confirmed live |
| TC-SSA-009 | Aadhaar Verification through DigiLocker is the only mandatory eKYC method (only one marked `*`) — PAN/DL/Voter Id "Successful" alone does not allow advancing past eKYC | Business Rule | AC3 | Critical | Confirmed live — blocked with "Please complete Aadhaar Verification through DigiLocker process" |
| TC-SSA-010 | Completing Aadhaar Verification through DigiLocker successfully and clicking Submit advances to Liveliness Verification | Happy Path (Live) | AC3 | Critical | **Confirmed live after BUG-SSA-001 fix** (SAH-1003-813, SAH-1003-814) |
| TC-SSA-011 | Driving Licence Verification field structure: `Driving Licence Number` + `Date of Birth` + document upload, with Cancel/Verify buttons | UI | AC3 | Medium | Confirmed live (read-only exploration; real DL `MH19 20160009050` provided but not submitted) |
| TC-SSA-012 | Voter Id Verification field structure: `Voter Id Number` + document upload, with Cancel/Verify buttons | UI | AC3 | Medium | Confirmed live (read-only exploration; real Voter Id `ZUL4351433` provided but not submitted) |
| TC-SSA-013 | A previously BUG-SSA-001-stuck application (SAH-1003-813) recovers via the existing "Retry" button once the fix is in place — no fresh application required | Business Rule / Regression | AC3 | High | Confirmed live |
| TC-SSA-014 | Real Security Code Based Liveliness Verification completes successfully and advances to Address Details | Happy Path (Live) | AC4 | Critical | Confirmed live |
| TC-SSA-015 | "Use Existing Address" correctly auto-fills the Communication Address from the Permanent Address | Happy Path | AC5 | High | Confirmed live |
| TC-SSA-016 | Default branch (no Change Branch) is accepted with a single Submit | Happy Path | AC6 | Critical | Confirmed live — AMGAON BRANCH |
| TC-SSA-017 | Basic Details includes "Is Staff" (pre-set YES) and "Staff Id" (required text field) — fields not present on Silver/Normal | Business Rule | AC7 | Critical | Confirmed live — Staff Id `EMP-10762` |
| TC-SSA-018 | Basic Details has no "Initial Funding Amount" field, unlike Silver/Normal — consistent with the scheme's zero-balance description | Business Rule | AC7 | Medium | Confirmed live |
| TC-SSA-019 | Submitting Basic Details with "Country of Tax Residence is India" = Yes skips both FATCA steps entirely — they never appear as tabs and are absent from the submitted step list | Business Rule | AC8, AC9 | Critical | Confirmed live — not yet re-tested with a "No" answer (would need a genuinely foreign-tax-resident identity) |
| TC-SSA-020 | Basic Details has no separate Employment Type dropdown — goes straight to a dedicated Salaried Information step | Business Rule | AC10 | High | Confirmed live |
| TC-SSA-021 | Salaried Information's Category dropdown is scheme-specific: only 5 options (Central/State Government Employee, PSU, Defence Services, Private Sector Employee – Corporate/MNC) vs. Silver/Normal's broader list | UI / Business Rule | AC10 | Medium | Confirmed live |
| TC-SSA-022 | Applicant Photo: Verified Photo succeeds for the photo; signature falls back to camera capture (no verified signature available) | Happy Path | AC11 | High | Confirmed live |
| TC-SSA-023 | Nominee Details + nested Nominee Address complete successfully via "Use Existing Address" | Happy Path | AC12 | High | Confirmed live |
| TC-SSA-024 | Document Upload's type list matches Silver/Normal's pattern (Ration Card, Electricity Bill, Telephone Bill, etc. + entity-specific options) | UI | AC13 | Medium | Confirmed live |
| TC-SSA-025 | Introducer Details is required (not conditionally skipped for Individual, unlike Silver Individual) | Business Rule | AC14 | Critical | Confirmed live |
| TC-SSA-026 | Lead Details' Verify buttons and field pair (Lead Converter Code, Sourcer Code) match the pattern already confirmed on Silver/Normal | Happy Path | AC15 | High | Confirmed live |
| TC-SSA-027 | Summary page accurately recaps every stage in order, including the scheme-specific Is Staff/Staff Id fields | Happy Path | AC16 | Critical | Confirmed live |
| TC-SSA-028 | Final Submit fires `POST /app/summary/submit`, returns `{"msgCode":"ENDMOD_200","success":"TRUE"}`, and the application moves from Pending to Submitted on the dashboard | Happy Path (Live) | AC16 | Critical | Confirmed live — `SAH-1003-813`, all 14 steps `stepStatus:1` |

---

## 4. Defect Log

| ID | Severity | Summary |
|---|---|---|
| BUG-SSA-001 | **Blocking, High — RESOLVED 2026-08-17** | eKYC Verification became permanently stuck after a successful Aadhaar/DigiLocker verification. `POST /aos/steps/getdetails` returned `stepStatus: 14` for `EKYC_VERIFICATION` (every other step across this entire project uses `stepStatus: 1` for complete) — the underlying verification genuinely succeeded (`digilockerVerifyStatus: 1`, `finalStatus: 1`), but the frontend rendered a generic "There's a problem with server or network" error instead of advancing. Fixed server-side mid-session; confirmed resolved two ways: (1) a fresh application (`SAH-1003-814`) completed DigiLocker cleanly; (2) the originally-stuck application (`SAH-1003-813`) recovered via its own existing "Retry" button — no fresh application was required, confirming the fix was retroactive. See `user-stories/US_010_Staff_Salary_Account_Journey.md` for full details. |
| BUG-SSA-002 | Low | Salaried Information's Designation/Profession dropdown contains duplicate entries — "Shop Owner", "Hotel Owner", "Dairy Farmer", and "Labourer" each appear **twice** in the same option list — and "Ngo Worker" should be capitalized as "NGO Worker" (acronym). Confirmed identically on Normal Savings Account's Designation dropdown (same shared list) — see BUG-NORMAL-005. |
| BUG-SSA-003 | Low | Document Upload's document-type list contains a spelling error: **"Property or Municipal Tax Recipt"** should read "Receipt". Confirmed live via the Document Upload step on `SAH-1003-813`. |

---

## 5. Out of Scope

- Joint/Minor Account Type coverage — confirmed out of scope by design (this scheme has no Account Type step at all; it is Individual-only).
- Driving Licence Verification and Voter Id Verification end-to-end submission — real supporting numbers were provided (`MH19 20160009050`, `ZUL4351433`) but not exercised, since AC3 (TC-SSA-009) confirmed Aadhaar/DigiLocker is mandatory regardless, so these could not unblock the main journey. May be revisited to confirm their own two-submit/auto-fill behavior independently.
- FATCA Personal Details / FATCA Tax Details with a non-India tax residency answer — would require a genuinely foreign-tax-resident real identity to test realistically; not pursued.

---

## 6. Automation

Not yet built. The full live journey is now traced and confirmed end to end (`SAH-1003-813`, `ENDMOD_200`) — a dedicated spec (`tests/support/savingsApplicationFlow.ts` extended for scheme `'staff'`, plus a new `tests/<module>/staff-salary-individual.spec.ts`) can now reuse the same shared library and manually-assisted pattern already proven for Silver/Normal. Scheme-specific additions needed: no Account Type step, the Is Staff/Staff Id fields on Basic Details, and the narrower Salaried Information Category list.
