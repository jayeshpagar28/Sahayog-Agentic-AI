User Story: Staff Salary Account Journey
Title

Staff Salary Account – End-to-End Account Opening Journey Validation

Description

Validate the complete end-to-end journey for opening a Staff Salary Account – 1003, starting from scheme selection and continuing through all applicable verification, applicant-detail, account-opening, document, nominee, and final submission stages.

The journey should be executed using a real/in-progress application wherever required. Each step should be validated for:

UI availability and navigation.
Mandatory field validation.
Data entry and persistence.
Successful submission behavior.
Dynamic/conditional steps.
Employment Type-dependent behavior (this scheme is staff/employee-only, so Employment Type may be more constrained than Silver/Normal).
Funding Mode-dependent behavior.
Designation/Profession-dependent behavior, where applicable.
Stepper progression and resume behavior.
Data displayed on the final Summary page.
Any discrepancies between configured business rules and actual application behavior.

Important: Do not assume that the Staff Salary Account follows the same flow as the Silver or Normal Savings Accounts. Confirmed live, 2026-08-17 (structural reconnaissance via the configured module list, before any live data entry): this scheme's module list differs from both other schemes in two significant ways —

1. **No "Account Type" (Customer Type) selection step exists at all.** The module sequence goes directly from `MOBILE_VERIFICATION` (seq 1) to `EKYC_VERIFICATION` (seq 2) — Silver and Normal both insert a `CUSTOMER_TYPE` step between these two. This strongly suggests Staff Salary Account is **Individual-only** (no Joint/Minor variants), matching its scheme description ("an exclusive benefit for employees"). To be confirmed once the live journey actually reaches that point.
2. **Two dedicated FATCA steps exist that are not present as separate steps on Silver/Normal**: `FATCA_RESIDENT_INFO` ("FATCA Personal Details", seq 8) and `FATCA_TAX_DETAILS` ("FATCA Tax Details", seq 9), inserted between Basic Details (seq 7) and Salaried Information (seq 10). On Silver/Normal, only a single "Country of Tax Residence is India" field appears inline within Basic Details — no separate FATCA steps were observed there.

Full confirmed module list (scheme code 1003, via `POST /app/get/aosModules`), for reference:

| Seq | Module Code | Description |
|---|---|---|
| 1 | MOBILE_VERIFICATION | Mobile Number Verification |
| 2 | EKYC_VERIFICATION | eKYC Verification |
| 3 | EXISTING_CUSTOMER_DATA | Existing Customer Data |
| 4 | LIVELINESS_VERIFICATION | Liveliness Verification |
| 5 | ADDR_VERIFICATION | Address Details |
| 6 | BRANCH_SELECTION | Branch Selection |
| 7 | INDIV_BASIC_INFORMATION | Basic Details |
| 8 | FATCA_RESIDENT_INFO | FATCA Personal Details |
| 9 | FATCA_TAX_DETAILS | FATCA Tax Details |
| 10 | SALARIED_INFORMATION | Salaried Information |
| 11 | APPLICANT_PHOTO | Applicant Photo |
| 12 | NOMINEE_INFORMATION | Nominee Details |
| 13 | APPL_DOCUMENT | Document Upload |
| 15 | INTRODUCER_DETAILS | Introducer Details |
| 16 | LEAD_DETAILS | Lead Details |
| 17 | SUMMARY | Summary |
| 18 | END_MODULE_01 | Decision |

(Sequence 14 is absent from the configured list — status unconfirmed, may be a conditional/skippable module not returned until reached, consistent with a pattern already observed on Silver/Normal where the module list can include conditional entries.)

Any newly discovered steps, conditional routing, fields, validations, defects, or behavior beyond this initial reconnaissance should be added to this user story as live execution progresses.

Acceptance Criteria
AC1: Staff Salary Account Scheme Selection
Navigate to the Savings Account section from the application/home page.
Verify that Staff Salary Account – 1003 is available for selection alongside Silver and Normal.
Select Staff Salary Account – 1003.
Verify that the application-opening journey is launched successfully.
Verify the displayed Scheme Name is Staff Salary Account – 1003.
Verify the Product Name is displayed as Savings Account.
Verify that the application is assigned a unique Applicant/Application ID.

AC2: Mobile Number Verification
Verify that Mobile Number Verification is the first step of the Staff Salary Account journey.
Verify the Mobile Number field and country code are displayed correctly.
Enter a valid mobile number.
Verify that the OTP/mobile verification process is initiated.
Complete the verification using the valid OTP.
Verify successful mobile number verification.
Verify that the step is marked as completed in the stepper.
Verify that the application proceeds directly to eKYC Verification (no Account Type step expected, per the reconnaissance above — confirm this live).

**Confirmed live, 2026-08-17 (SAH-1003-813, SAH-1003-814):** the stepper goes directly from "Mobile Number Verification" to "eKYC Verification" with no Account Type tab in between, on two separate real applications. The Application List's Customer Type column shows "Individual" for both, even though no explicit Account Type selection ever occurred — confirming Staff Salary Account is Individual-only by design.

Note: If any external dependency prevents OTP/liveliness verification from being completed, document the limitation and continue with the journey wherever possible without treating the blocked external dependency as an application defect.

AC3: eKYC Verification
Verify the eKYC Verification step.
Identify all available verification/document options (Aadhaar/DigiLocker, PAN, Driving Licence, Voter ID).
Verify Aadhaar/DigiLocker verification.
Verify successful document verification.
Verify that verified applicant information is populated wherever applicable.
Verify the status displayed for each verification method.
Verify handling of unsuccessful, pending, rejected, or action-required verification states.
Verify that the application proceeds correctly after successful eKYC completion.

**Confirmed live, 2026-08-17 (structural, application SAH-1003-813):** all 4 options are presented together as an accordion-style list (matching Silver/Normal), but selecting one **replaces the view** rather than expanding alongside the others — the other three headings are no longer present once one is opened; a fresh reload restores all 4. Field structure per method:
- **Aadhaar Verification through DigiLocker** — same SMS-link flow as Silver/Normal, requires real human action on the applicant's phone.
- **PAN Verification** — `PAN Number` (text field) + a document upload ("Browse Computer or drag and drop" — png/jpeg/pdf — OR Capture Using Camera). Goes straight to a single **Submit** button, no separate Verify step.
- **Driving Licence Verification** — `Driving Licence Number` + `Date of Birth`, plus the same upload/camera option. Has **Cancel** and **Verify** buttons in addition to the outer Submit (unlike PAN, which has no Verify button) — a UI inconsistency worth flagging.
- **Voter Id Verification** — `Voter Id Number` + the same upload/camera option, also with Cancel/Verify buttons like Driving Licence.

PAN/Driving Licence/Voter Id are all fully automatable (no phone/SMS dependency, just a number + a document image) — unlike DigiLocker, which is why prior schemes' full-journey runs always used DigiLocker as the reliable proven path.

**Confirmed live, 2026-08-17 (application SAH-1003-814, real PAN CYKPP8237N):** PAN Verification was fully exercised end-to-end and confirmed a real, valuable finding:
1. **PAN Verification is a two-submit pattern**, matching the Branch Selection pattern already documented on Silver/Normal: (a) enter PAN Number + upload a document, Submit — this fetches and auto-fills First Name/Middle Name/Last Name/Date of Birth from the PAN database (confirmed real: PAN `CYKPP8237N` resolved to "NAVODAY DILIP PATIL", DOB 1997-08-23); (b) a second Submit on the auto-filled confirmation form actually completes it, producing "PAN verification done successfully!" and a "Successful" status.
2. **Aadhaar Verification through DigiLocker is the only mandatory method** (it's the only one of the 4 marked with a `*` asterisk) — PAN, Driving Licence, and Voter Id are supplementary/optional, not substitutes. Confirmed by attempting to advance past eKYC with only PAN "Successful": the app blocked with **"Please complete Aadhaar Verification through DigiLocker process"**. This means the alternate methods cannot be used as a workaround for the DigiLocker-specific blocking defect noted above (AC3/BUG-SSA-001) — Aadhaar/DigiLocker must be completed regardless.

Driving Licence and Voter Id were not functionally exercised end-to-end (only their field structure was confirmed via read-only exploration) — given finding 2 above, doing so would not unblock the journey, so this was deprioritized. Real supporting numbers were provided (Driving Licence `MH19 20160009050`, Voter Id `ZUL4351433`) for a future pass if their two-submit/auto-fill behavior specifically needs confirming.

AC4: Liveliness Verification
Verify the Liveliness Verification step and its available method(s).
Complete the applicable liveliness verification.
Verify the status after successful completion.
Verify behavior when the verification is unsuccessful or incomplete.
Verify that the next applicable step is displayed correctly.

Execution note: If the real-phone liveliness dependency is unavailable, document the limitation and continue validating the remaining journey.

AC5: Address Details
Verify the Address Details step (Permanent Address and Communication Address).
Verify auto-fill behavior ("Same as Permanent address" / "Use Existing Address") and whether the confirmed Silver/Normal defect (auto-fill only populates Address Line 1) reproduces here too.
Verify mandatory field validation and successful submission.

AC6: Branch Selection
Verify the Branch Selection step, default branch behavior, and Change Branch flow (confirm whether the two-submit persistence pattern found on Silver/Normal applies here too).

AC7: Basic Details
Verify all fields on the Basic Details step, dropdown option lists, and mandatory validation.
Verify whether the confirmed email-validation defect (BUG-NORMAL-004, dotted local-part rejection) reproduces here.
Verify no-partial-save behavior on validation failure.

**Confirmed live, 2026-08-17 (SAH-1003-813):** Basic Details has the same field set already seen on Silver/Normal (Mode of Operation, Prefix, Name/DOB, Gender, Email, Marital Status, Father/Mother Name, Religion, Caste Category, PEP/Disability flags, Education, Country of Tax Residence, Region), **plus two genuinely new fields specific to this scheme**: **"Is Staff *"** (shown pre-set to "YES") and **"Staff Id *"** (a required text field for the employee's staff/employee ID). These weren't visible in the original module-list reconnaissance since they're fields within Basic Details, not a separate step. A real Staff ID is required to complete this step.

AC8: FATCA Personal Details (new step, not present on Silver/Normal)
Identify and document all fields on this step.
Verify mandatory field validation and successful submission.
Determine what data this step captures that isn't already covered by Basic Details' "Country of Tax Residence is India" field on the other two schemes.

AC9: FATCA Tax Details (new step, not present on Silver/Normal)
Identify and document all fields on this step.
Verify mandatory field validation and successful submission.
Determine whether this requires a Tax Identification Number / country-specific tax details, and how it interacts with FATCA Personal Details (AC8).

**Confirmed live, 2026-08-17 (SAH-1003-813):** both FATCA steps were **skipped entirely** in the actual live flow — after submitting Basic Details (with "Country of Tax Residence is India" left at its default "Yes"), the stepper advanced directly to Salaried Information, with neither "FATCA Personal Details" nor "FATCA Tax Details" ever appearing as tabs. Working hypothesis: these two steps are conditional on Country of Tax Residence — likely only triggered when the applicant declares tax residency outside India (consistent with FATCA's actual purpose, identifying US-person/foreign tax residents). Not yet confirmed with a real "No" answer on that field, since doing so would require a genuinely foreign-tax-resident identity to be realistic — flagged as a follow-up if such a scenario needs coverage.

AC10: Employment/Salaried Information
Verify the Employment Type field set on Basic Details and whether it's constrained to Salaried-only options, given this scheme is staff/employee-specific.
Verify the Salaried Information step's fields (Category, Organization Name, Annual Income, Source of Income) match the pattern already confirmed on Silver/Normal, or document differences.

**Confirmed live, 2026-08-17 (SAH-1003-813, real Staff Id EMP-10762):** unlike Silver/Normal, this scheme has **no separate Employment Type dropdown at all** on Basic Details — it goes straight from Basic Details (with the Is Staff/Staff Id fields) to a dedicated "Salaried Information" step, implying employment is always assumed Salaried for this scheme. The Salaried Information Category dropdown is also scheme-specific and narrower than Silver/Normal's list — only 5 options: Central Government Employee, State Government Employee, Public Sector Undertaking (PSU), Defence Services (Army, Navy, Air Force), Private Sector Employee – Corporate / MNC. Successfully completed with Category "Central Government Employee", Designation "Government Employee", Annual Income 600000, Source of Income "Salary".

Also confirmed: **Basic Details has no "Initial Funding Amount" field** on this scheme, unlike Silver/Normal — consistent with the scheme's own description as a "zero-balance facility."

AC11: Applicant Photo
Verify the Applicant Photo step (Verified Photo vs. camera capture vs. file upload options) matches the pattern already confirmed on Silver/Normal.

AC12: Nominee Details
Verify Nominee Details fields and the nested Nominee Address step, if present.

AC13: Document Upload
Verify Document Upload behavior, including whether the confirmed silent-document-loss defect (BUG-NORMAL-002, uploading an optional document before a still-outstanding mandatory one) reproduces here.

AC14: Introducer Details
Verify whether Introducer Details is required for this scheme (present in the configured module list at seq 15 — confirm it's not conditionally skipped, unlike Silver Individual/Minor which skip it).

AC15: Lead Details
Verify Lead Details fields (Lead Converter Code, Sourcer Code) and the Verify-button behavior already confirmed on Silver/Normal.

AC16: Summary and Final Submission
Verify the Summary page displays a full, accurate read-only recap of every stage's entered data, in stage order.
Verify final Submit fires the real submission endpoint and returns a success response.
Verify the application moves from Pending to Submitted status after real submission.

**Confirmed live, 2026-08-17 (SAH-1003-813):** the Summary page correctly recaps every stage in order (Mobile Verification through Lead Details), with all entered data accurate, including the scheme-specific Is Staff/Staff Id fields. Full journey completed end to end: Mobile Verification → eKYC (Aadhaar/DigiLocker, real) → Liveliness (real) → Address Details → Branch Selection (default, AMGAON BRANCH) → Basic Details (incl. Staff Id EMP-10762) → Salaried Information → Applicant Photo (Verified Photo + camera-captured signature) → Nominee Details + Address → Document Upload (Ration Card) → Introducer Details → Lead Details → Summary.

**Final submission confirmed live, 2026-08-17:** `POST /app/summary/submit` returned `{"msgCode":"ENDMOD_200","msgDescr":"The application request has been successfully submitted."}`. The submitted `aosStepList` contains exactly **14 steps** (Mobile Verification, eKYC, Existing Customer Data, Liveliness, Address, Branch, Basic Details, Salaried Information, Applicant Photo, Nominee, Document Upload, Introducer, Lead Details, Summary) — confirming FATCA Personal Details and FATCA Tax Details are genuinely **absent from the workflow entirely** for an India-tax-resident applicant, not merely hidden in the UI. The application moved from Pending (24→ back to 24, net neutral since a new draft was created too) to Submitted (15→16) on the dashboard. This is the first fully-completed, real, end-to-end Staff Salary Account submission.

---

Defect Log

BUG-SSA-001 (Blocking, High — RESOLVED 2026-08-17) — eKYC Verification becomes permanently stuck after successful Aadhaar/DigiLocker verification.
**Resolution confirmed live, 2026-08-17, applications SAH-1003-814 and SAH-1003-813:**
- On a fresh application (SAH-1003-814), Aadhaar/DigiLocker verification was completed a second time and correctly showed "Successful" and advanced past eKYC to Liveliness Verification without the error page recurring.
- The fix also proved **retroactive**: on the originally-stuck application (SAH-1003-813), simply clicking the existing "Retry" button (which had failed identically before the fix) now succeeded — "Details saved successfully!" — and advanced it to Liveliness Verification too. Previously-stuck applications are recoverable via Retry once the underlying fix is in place; a fresh application is not required.
- The fix was made server-side between the original discovery and this retest; no client-side workaround was needed or used.
Confirmed live, 2026-08-17, application SAH-1003-813 (real mobile 9545368828, real Aadhaar via DigiLocker).
Sequence: Aadhaar Verification through DigiLocker completed successfully on the applicant's phone (confirmed: eKYC panel showed "Successful", Applicant Name populated correctly as "Shubham Madhukar Borse"). Clicking the outer Submit to advance past eKYC then produced a generic error page: "There's a problem with server or network. Please try again later or get in touch with the administrator for assistance." with Back/Retry buttons.
Root cause (confirmed via network inspection): `POST /aos/steps/getdetails` returns `stepStatus: 14` for the EKYC_VERIFICATION step — every other step observed across this entire project (Silver, Normal, and the rest of this Staff Salary Account journey) uses `stepStatus: 1` for a completed step. The underlying eKYC verification itself genuinely succeeded (`POST /aos/ekyc/get/status/dtl` confirmed `digilockerVerifyStatus: 1`, `finalStatus: 1`), so this is a step-status/rendering bug, not a failed verification.
Impact: **fully blocking** — confirmed no recovery path exists. Neither "Retry" nor "Back" (which just returns to the Application List) restore access to the eKYC panel or any of its sub-options (PAN/DL/Voter ID were confirmed absent from the DOM while stuck). The application (SAH-1003-813) is permanently unusable once this occurs.
Workaround: none found for an application already in this state. Attempting PAN Verification as an alternative on a *different, fresh* application (SAH-1003-814) succeeded independently, but is not a workaround for a stuck application, and separately, Aadhaar/DigiLocker is confirmed mandatory regardless (see AC3) — so PAN/DL/Voter ID cannot substitute for a working DigiLocker flow even on a fresh application.
Reproducibility: confirmed once (SAH-1003-813). Not yet re-confirmed on a second DigiLocker attempt — SAH-1003-814 was used to explore the alternate eKYC methods (PAN) instead, per user direction, rather than to re-attempt DigiLocker. A repeat DigiLocker attempt on a third fresh application would confirm whether this is systemic (100% reproducible) or intermittent.
