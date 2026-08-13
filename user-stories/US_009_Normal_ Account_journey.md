User Story: Normal Savings Account Journey
Title

Normal Savings Account – End-to-End Account Opening Journey Validation

Description

Validate the complete end-to-end journey for opening a Normal Savings Account – 1001, starting from scheme selection and continuing through all applicable verification, applicant-detail, account-opening, document, nominee, and final submission stages.

The journey should be executed using a real/in-progress application wherever required. Each step should be validated for:

UI availability and navigation.
Mandatory field validation.
Data entry and persistence.
Successful submission behavior.
Dynamic/conditional steps.
Account Type-dependent behavior.
Employment Type-dependent behavior.
Funding Mode-dependent behavior.
Designation/Profession-dependent behavior, where applicable.
Nested applicant/guardian flows, if applicable.
Stepper progression and resume behavior.
Data displayed on the final Summary page.
Any discrepancies between configured business rules and actual application behavior.

Important: Do not assume that the Normal Savings Account follows the same flow as the Silver Savings Account. Any newly discovered steps, conditional routing, fields, validations, defects, or account-type-specific behavior should be added to this user story as execution progresses.

Acceptance Criteria
AC1: Normal Savings Account Scheme Selection
Navigate to the Savings Account section from the application/home page.
Verify that Normal Savings Account – 1001 is available for selection.
Select Normal Savings Account – 1001.
Verify that the application-opening journey is launched successfully.
Verify the displayed Scheme Name is Normal Savings Account – 1001.
Verify the Product Name is displayed as Savings Account.
Verify that the application is assigned a unique Applicant/Application ID.
AC2: Mobile Number Verification
Verify that Mobile Number Verification is the first step of the Normal Savings Account journey.
Verify the Mobile Number field and country code are displayed correctly.
Enter a valid mobile number.
Verify that the OTP/mobile verification process is initiated.
Complete the verification using the valid OTP.
Verify successful mobile number verification.
Verify that the step is marked as completed in the stepper.
Verify that the application proceeds to the next applicable step.

Note: If any external dependency prevents OTP/liveliness verification from being completed, document the limitation and continue with the journey wherever possible without treating the blocked external dependency as an application defect.

AC3: Account Type Selection
Verify the Account Type step.
Identify all Account Type options available for the Normal Savings Account.
Verify the available options and their exact labels.
Execute the journey for the applicable Account Type.
Verify that the selected Account Type is persisted after submission.
Verify whether Account Type affects subsequent steps or fields.
Document any Account Type-specific routing.
AC4: eKYC Verification
Verify the eKYC Verification step, if applicable for the selected Account Type.
Identify all available verification/document options.
Verify Aadhaar/DigiLocker verification where applicable.
Verify PAN, Driving Licence, Voter ID, or other available verification options.
Verify successful document verification.
Verify that verified applicant information is populated wherever applicable.
Verify the status displayed for each verification method.
Verify handling of unsuccessful, pending, rejected, or action-required verification states.
Verify that the application proceeds correctly after successful eKYC completion.
AC5: Liveliness Verification
Verify whether Liveliness Verification is applicable for the selected Account Type.
Identify all available liveliness verification methods.
Verify the available verification flow.
Complete the applicable liveliness verification.
Verify the status after successful completion.
Verify behavior when the verification is unsuccessful or incomplete.
Verify that the next applicable step is displayed correctly.

Execution note: If the real-phone liveliness dependency is unavailable, document the limitation and continue validating the remaining journey.

AC6: Address Details
Verify the Address Details step.
Verify Permanent Address and Communication Address sections.
Verify whether address details are automatically populated from eKYC.
Verify whether the populated fields are editable or read-only.
Verify the Use Existing Address functionality, if available.
Verify Address Source and Address Type options.
Verify State, City, Pin Code, Address Line 1, Address Line 2, and other available fields.
Verify address proof/document requirements.
Submit the address details.
Verify successful save and step progression.
Verify that saved address data persists when revisiting the step.
AC7: Branch Selection
Verify the Branch Selection step.
Verify the default branch selected by the application.
Verify the available branch list.
Select a different branch, if multiple branches are available.
Submit the branch selection.
Verify that the selected branch is persisted.
Revisit the step/application and verify that the correct branch is retained.
Verify whether changing the branch dynamically affects any subsequent flow.
AC8: Basic Details
Verify the Basic Details step.
Identify and document all fields displayed.
Verify mandatory and optional fields.
Verify which fields are auto-populated from previous verification steps.
Verify whether auto-populated fields are editable or read-only.
Verify field-level validations.
Verify dropdown options and exact labels.
Verify numeric-only fields.
Verify character limits and input restrictions.
Verify date fields and date validation.
Verify all applicable applicant information fields.
Submit Basic Details with valid data.
Verify the success message.
Verify the next step displayed after submission.
AC9: Funding Mode Conditional Flow
Identify the Funding Mode field in Basic Details, if available.
Verify all Funding Mode options.
For each available Funding Mode, submit Basic Details and observe the next step.

At minimum, validate:

Cash
Cheque

For Cheque:

Verify whether a Cheque Details step is dynamically added.
Verify all fields displayed in Cheque Details.
Submit valid Cheque Details.
Verify the step after Cheque Details.

For Cash:

Verify that the Cheque Details step is not displayed.
Verify the next applicable step.

Document the routing difference between Funding Mode selections.

AC10: Employment Type Conditional Flow
Identify all options available in the Employment Type dropdown.
Execute the applicable combinations using valid test data.
Submit Basic Details for each Employment Type.
Record the immediate next step displayed for each selection.
Verify whether the next step changes based on Employment Type.
Verify that the behavior is consistent after Funding Mode-specific processing.

The execution should specifically determine the routing for options such as:

Salaried
Professional
Agriculture/Farmer
Unemployed
Self Employed
Retired
Housewife
Other
Business

Important: Do not assume these are the exact options for Normal Savings Account. Capture the actual options available in the Normal Account UI.

AC11: Designation / Profession Conditional Behavior
Verify the Designation/Profession field, if available.
Capture all available options.
Verify whether Designation/Profession changes the next step after Basic Details.
Test at least two different Designation/Profession values while keeping other relevant fields unchanged.
Compare the resulting navigation.
Document whether the field is:
Routing-dependent,
Validation-dependent, or
Informational only.
AC12: Conditional Employment Information

Based on the selected Employment Type, verify whether any additional employment-related step is displayed.

For example, if Salaried is available:

Verify whether Salaried Information appears.
Verify all fields displayed.
Verify mandatory fields.
Verify Category options.
Verify Organization Name.
Verify Annual Income.
Verify Source of Income.
Submit the information.
Verify the next applicable step.

For Self Employed/Professional/other employment types:

Identify whether a separate information step appears.
Document all fields and routing.
Verify successful submission and progression.
AC13: Account Type-Specific Applicant Flow

Verify whether the selected Account Type introduces additional applicant-related steps.

For example, determine whether the Normal Savings Account supports:

Individual
Joint
Minor

For each applicable Account Type, document:

Early-stage verification differences.
Basic Details differences.
Post-Basic-Details routing.
Additional applicant/guardian requirements.
Applicant Photo requirements.
Nominee requirements.
Introducer requirements.
Lead Details requirements.

Do not assume the Normal Account uses the same Account Type routing as the Silver Savings Account.

AC14: Joint Applicant / Additional Applicant Flow

If Joint Account Type is available:

Verify whether Joint Applicant Details is displayed.
Verify the Add Applicant functionality.
Verify the joint applicant's Mobile Number Verification.
Verify that a previously verified mobile number cannot be reused within the same application.
Verify the joint applicant's eKYC Verification.
Verify Liveliness Verification, if applicable.
Verify Address Details.
Verify Basic Details.
Verify Relationship with Main Applicant.
Verify Employment Information.
Verify Applicant Photo and Signature.
Verify the applicant record changes from Pending to Successful after completion.
Verify the application proceeds only after required joint applicant information is completed.
AC15: Guardian Flow

If Minor Account Type is available:

Verify whether Guardian Details is displayed.
Verify Add Guardian functionality.
Verify guardian Mobile Number Verification.
Verify guardian eKYC Verification.
Verify guardian Liveliness Verification.
Verify guardian Address Details.
Verify guardian Basic Details.
Verify relationship with the main applicant.
Verify guardian Employment Information.
Verify guardian Applicant Photo/Signature.
Verify Guardian record completion and status.
Verify progression after Guardian Details submission.
AC16: Applicant Photo and Signature
Verify whether Applicant Photo is required.
Verify Applicant Name.
Verify Upload Applicant Photo functionality.
Verify Browse/drag-and-drop functionality, if available.
Verify Capture Using Camera functionality.
Verify Verified Photo functionality, if available.
Verify available verified-photo sources.
Verify Applicant Signature functionality.
Verify whether signature can be uploaded or must be captured using camera.
Verify required browser/device permissions for camera/geolocation functionality.
Submit the Applicant Photo step.
Verify successful save and navigation.
AC17: Nominee Details
Verify whether Nominee Details is displayed.
Verify Add Nominee functionality.
Verify:
Full Name
Relationship
Date of Birth
Age
Verify whether Age is automatically calculated.
Submit Nominee Details.
Verify Nominee Address Details, if displayed.
Verify Registered Address.
Verify address source and address type.
Submit the nominee information.
Verify nominee status and progression.
AC18: Document Upload
Verify whether Document Upload is displayed.
Identify all available document types.
Verify mandatory/optional behavior.
Verify Browse/drag-and-drop functionality.
Verify camera upload functionality, if available.
Verify Custom Document functionality, if available.
Submit with no document where the step is optional.
Verify successful progression.
Upload a valid document and verify successful save.
Verify uploaded document persistence.
AC19: Introducer Details
Verify whether Introducer Details is applicable to the Normal Savings Account.
If displayed, verify:
Introducer Name
Introducer Account Number
Period of Acquaintance
Verify account-number validation.
Verify behavior for an invalid Introducer Account Number.
Verify behavior for a valid Introducer Account Number.
Submit the details.
Verify the next applicable step.
AC20: Lead Details
Verify whether Lead Details is displayed.
Verify:
Lead Converter Code
Sourcer Code
Verify mandatory validation.
Verify individual Verify functionality for each code.
Verify behavior for invalid codes.
Verify behavior for valid codes.
Submit Lead Details.
Verify progression to the next step.
AC21: Summary
Verify that the final Summary page is displayed before final submission.
Cross-check all important information against data entered in previous steps, including:
Applicant details
Account Type
Address
Branch
Employment details
Funding details
Nominee details
Additional applicant/guardian details, if applicable
Uploaded documents
Lead Details
Verify that the Summary accurately reflects the saved application data.
Do not perform final submission until all displayed information has been cross-verified.
AC22: Final Application Submission
After successful field-by-field Summary verification, submit the application.
Verify the final success message.
Verify that the application status changes appropriately.
Verify that the application moves from the Pending/In-progress list to the appropriate Submitted/completed state.
Verify that the application can no longer be edited after final submission, where applicable.
AC23: Journey Resume and Data Persistence
Exit/reload the application at different stages.
Verify that the application resumes at the correct step.
Verify previously saved data is retained.
Verify whether revisiting a completed step resets the visible form or preserves the entered values.
Verify behavior for nested applicant/guardian/nominee journeys.
Document any difference between:
Row click
Action/Submit click
Page-level Submit
Stepper navigation
AC24: Conditional Routing Matrix

Create a final routing matrix based on actual execution.

Account Type	Funding Mode	Employment Type	Designation/Profession	Expected/Configured Next Step	Actual Next Step	Result
Individual	Cash	Salaried	—	To be determined	To be determined	—
Individual	Cheque	Salaried	—	To be determined	To be determined	—
Joint	Cash	Salaried	—	To be determined	To be determined	—
Joint	Cheque	Salaried	—	To be determined	To be determined	—
Minor	Cash	Applicable option	—	To be determined	To be determined	—

Expand this matrix based on the actual options available in the Normal Savings Account.

AC25: Defect and Discovery Documentation

During execution, document any newly discovered:

Missing steps.
Unexpected steps.
Incorrect routing.
Incorrect validations.
Data persistence issues.
UI issues.
Incorrect dropdown labels/options.
Field length restrictions.
Conditional behavior.
Account Type-specific differences.
Employment Type-specific differences.
Funding Mode-specific differences.
Camera/geolocation/OTP dependencies.
Backend/API errors.
Incorrect success/error messages.

Each confirmed defect should be recorded separately with:

Defect ID → Title → Preconditions → Steps → Expected Result → Actual Result → Severity/Priority → Evidence.

AC26: Final Normal Savings Account Journey Documentation

At the completion of exploration, document the actual end-to-end Normal Savings Account journey in sequence.

The final journey should clearly show:

Scheme Selection → Mobile Verification → Account Type → KYC/Verification → Address → Branch → Basic Details → Conditional Steps → Applicant/Guardian/Joint Flow → Photo → Nominee → Documents → Introducer/Lead Details → Summary → Final Submission

Only include stages that are actually applicable to the Normal Savings Account, and clearly identify conditional/dynamic stages.

Important Execution Instruction for Agentic AI

Do not copy the Silver Savings Account journey blindly.
Normal Savings Account – 1001 is a separate scheme and must be explored independently. Start from AC1 and discover the actual journey. Whenever a step appears dynamically based on Account Type, Funding Mode, Employment Type, Designation/Profession, or any other selection, pause and document the condition and resulting navigation before proceeding.

If a new step or business rule is discovered that is not covered by the existing acceptance criteria, add it sequentially as AC27, AC28, AC29... rather than modifying or renumbering earlier criteria.

AC27: Live Execution Findings — Joint Account Type (2026-08-11 to 2026-08-12)

Real application `SAH-1001-796` (a pre-existing draft, discovered mid-flow already past Mobile Verification and Account Type, sitting at eKYC Verification) was live-traced from eKYC Verification through Summary and final submission. Primary applicant: Shubham Madhukar Borse (mobile `9545368828`). Joint applicant: Pagar Jayesh Arun (mobile `9511996248`).

**Confirmed real stage order for Account Type = Joint** (matches the Silver Savings Account's confirmed structure almost exactly):
1. Mobile Number Verification
2. Account Type
3. eKYC Verification (Aadhaar via DigiLocker)
4. Liveliness Verification (Security Code Based)
5. Address Details (Permanent auto-populated from Aadhaar for the primary applicant; Communication manual, with "Use Existing Address" available)
6. Branch Selection
7. Basic Details
8. Cheque Details (dynamic — only when Funding Mode = Cheque)
9. Salaried Information (dynamic — only when Employment Type = Salaried)
10. Joint Applicant Details (full mirror of the primary applicant's own stages 1–9 for the joint applicant, management-table pattern)
11. Applicant Photo (primary applicant, after Joint Applicant Details converges back)
12. Nominee Details + nested Nominee Address Details
13. Document Upload
14. Introducer Details (mandatory for Joint)
15. Lead Details (Lead Converter Code + Sourcer Code, independently "Verify"-able)
16. Summary → final Submit

**Business rules confirmed:**
- Applicant Id format for Normal Savings Account is `SAH-1001-nnn` (the `1001` scheme-code series), distinct from Silver's `SAH-1002-nnn`.
- Funding Mode = Cheque adds the Cheque Details step (Cheque Number/Date/Drawee Bank Name/IFSC) — same as Silver's RULE_22.
- Employment Type = Salaried adds the Salaried Information step (Category/Organization's Name/Annual Income/Source of Income) — same as Silver's RULE_23.
- Account Type = Joint requires both Joint Applicant Details and Introducer Details — same business rule as Silver (both are skipped for Individual/Minor there; Individual/Minor not yet traced for Normal Savings Account).
- The Joint Applicant's own sub-journey fully mirrors the primary applicant's stages (Mobile Verification → eKYC → Liveliness → Address → Basic Details → Salaried Information → Applicant Photo) — same pattern as Silver's Guardian sub-journey.
- Change Mobile Number, tested live for the first time in this project: within a sub-flow's Mobile Number Verification step, clicking "Change Mobile Number?" correctly discards the pending OTP state for the old number and allows entering a new number, which then receives its own fresh OTP. Confirmed working correctly (switched the joint applicant from `9403564649` to `9511996248` mid-flow, verified the new number's OTP successfully).
- The management-table two-submit pattern (row-level Submit, then page-level Submit) applies here too, same as Silver's Nominee/Guardian tables.

**Important correction — Branch Selection persistence is NOT broken:** an initial pass in this session suspected Change Branch didn't persist (selecting GOREGAON BRANCH, clicking the visible "Submit," then a fresh reload showed the default AMGAON BRANCH again). Network-trace investigation (with explicit before/after timing marks) proved this was tester error, not a defect: clicking Submit once only transitions the local UI from the branch-card list back to a summary view (fires **zero** network requests). A **second** click on the Submit button that then appears is the one that fires the real `POST /branch/selection/submit/details` save call. Once that second Submit was clicked, the branch change (GOREGAON BRANCH) persisted correctly across a fresh reload and the step advanced to Basic Details. **This calls the Silver Savings Account's BUG-SILVER-009 ("Change Branch selection is lost") into question — it was very likely the identical tester mistake, not a genuine product defect, and should be re-verified against Silver before continuing to report it as confirmed.**

**New confirmed defects (Normal Savings Account, Joint):**
- **BUG-NORMAL-001 (Medium):** "Use Existing Address" on any Address Details screen (Communication Address, Joint Applicant's Permanent/Communication Address, Nominee Registered Address) only auto-fills Address Line 1 as one combined string — State, City, and Pin Code are always left empty and must be entered manually. Reproduces Silver Savings Account's BUG-SILVER-002 exactly, confirming it is a shared platform defect, not Silver-specific.
- **BUG-NORMAL-002 (High):** Document Upload silently discards the first document added when a second, mandatory document type is subsequently required. Reproduced live: selected and uploaded "Electricity Bill," clicked Submit, was blocked by "Please Upload Ration Card" (a mandatory document type), added and uploaded Ration Card, clicked Submit again — the application advanced, but the Summary page's Document Upload section showed only "Ration Card"; Electricity Bill had been silently lost from the form state, with no warning shown at any point. Confirmed the loss is specific to a document added and lost before ever completing the step: re-adding Electricity Bill in a fresh visit (after Ration Card was already successfully saved) correctly retained both documents together in the Summary.
- **BUG-NORMAL-003 (Low, UI inconsistency):** the primary applicant's Applicant Photo step offers no "Browse Computer" file-upload option for either Photo or Signature — only "Capture Using Camera" (plus "Verified Photo," photo only). The joint applicant's own Applicant Photo step, on the same application, DOES offer "Browse Computer" for both fields. No functional blocker (Verified Photo + camera capture both worked), but the capability is inconsistent between primary and joint applicant on an otherwise identical step.

**Reconfirmed (non-defect) automation/behavioral notes:**
- Applicant Photo does not persist partial progress (same as Basic Details) — Photo and Signature must both be completed and the step Submitted in one continuous session; a reload/revisit before Submit discards any already-uploaded image, even though each individual image-save call itself returns HTTP 200 from the server.
- An un-granted native browser permission prompt (camera/geolocation) blocks page JS execution silently — this can make unrelated actions on the same page (e.g. file uploads attempted while the prompt is pending) appear to fail for no visible reason. Always pre-grant `permissions: ['geolocation','camera']` on the browser context and launch with `--use-fake-device-for-media-stream --use-fake-ui-for-media-stream` for this module.
- Resuming a nested sub-flow (Joint Applicant Details) via the management table's row always resets the visible panel to the sub-flow's first inner tab (Mobile Number Verification), even when later sub-steps are actually complete — click the correct inner tab by name to jump directly to the real current step.

**Final outcome:** `SAH-1001-796` (Joint, Shubham Madhukar Borse + Pagar Jayesh Arun) was live-traced end to end through Summary, cross-verified field by field against everything entered, and — after explicit user go-ahead — submitted for real. Confirmed via `app/summary/submit` returning `{"msgCode":"ENDMOD_200","success":"TRUE"}` and the application moving from Pending (0 results for the application ID) to Submitted (status "Sourcer Submit") in the dashboard.

**Not yet covered (future follow-up):** Individual and Minor Account Types for the Normal Savings Account (AC13 explicitly asks this to be determined — only Joint has been traced so far). The Employment Type × Designation/Profession routing matrix (AC10/AC11) was not swept beyond Salaried — only Salaried was exercised, for both applicants. Applicant Photo for a Minor applicant is not applicable to this Joint-only pass. Introducer Account Number validation against a deliberately invalid number was not tested (only the known-valid Bhuwan Dnyaneshwar Patle record was used).

AC28: Live Execution Findings — Individual Account Type (2026-08-13)

Real application `SAH-1001-805` (started fresh via New Application, since the earlier draft `SAH-1001-795` at eKYC was set aside in favor of a clean trace) was live-traced from Mobile Verification through Summary and final submission. Applicant: Yash Pravin Sonawane (mobile `7030161602`).

**Confirmed real stage order for Account Type = Individual:**
1. Mobile Number Verification
2. Account Type
3. eKYC Verification (Aadhaar via DigiLocker)
4. Liveliness Verification (Security Code Based)
5. Address Details (Permanent auto-populated from Aadhaar + Communication, "Same as Permanent address" checkbox)
6. Branch Selection
7. Basic Details
8. Self Employed Information (dynamic — Employment Type = Self employed)
9. Applicant Photo
10. Nominee Details + nested Nominee Address Details
11. Document Upload
12. Introducer Details
13. Lead Details
14. Summary → final Submit

**Key confirmed differences from Joint, and from Silver's own Individual flow:**
- **Individual skips Joint Applicant Details** (as expected — Basic Details/Self Employed Information advanced straight to Applicant Photo, with no Joint Applicant Details step at all), consistent with Silver's finding for Individual.
- **Individual does NOT skip Introducer Details on the Normal Savings Account** — unlike the Silver Savings Account, where Individual skips both Joint Applicant Details and Introducer Details entirely (per Silver's AC28). Here, Introducer Details appeared and was mandatory for Individual too. This is a genuine, confirmed routing difference between the two schemes for the same Account Type — do not assume Silver's Individual-routing rules carry over to Normal Savings Account.
- **Cash correctly skips Cheque Details** — Basic Details (Funding Mode = Cash) advanced directly to the Employment-Type-conditional step, with no Cheque Details tab ever appearing. Confirms AC9's Cash-side requirement, previously untested this project.
- **Employment Type = Self employed routes to a dedicated "Self Employed Information" step** (Category / Organization's Name / Annual Turnover / Source of Income) — a different field set from Salaried Information's (Category / Organization's Name / Annual Income / Source of Income); notably "Annual Turnover" vs "Annual Income" as the field label. Category dropdown offers 8 options: Industrialist, Trader / Merchant, Service Provider (e.g. salon owner, mechanic, tutor), Contractor (e.g. civil contractor, project-based), Migrant Labourer (seasonal, inter-state workers), Import / Export Business, Self-employed Labourer (e.g. daily wage mason, plumber), Others Self-Employed.
- **The "Joint" Account Type card is pre-selected/highlighted by default** even on a completely fresh application with no prior selection — reproduces Silver's TC-SIL-011 finding on Normal Savings Account too. Individual had to be actively clicked to override it.
- Communication Address's "auto-fill from Permanent" checkbox is labeled **"Same as Permanent address"** for the primary applicant's own Address Details (Individual), vs. **"Use Existing Address"** with an Address Source dropdown seen on Joint Applicant/Nominee address screens — the same underlying auto-fill-only-Line-1 limitation (BUG-NORMAL-001) was not independently re-confirmed against this specific "Same as Permanent address" checkbox variant this pass (fields were filled manually regardless), so treat that variant as not yet directly verified for the same defect.
- Document Upload succeeded cleanly with a single document (Ration Card only) — no repeat of BUG-NORMAL-002's document-loss defect, consistent with that defect being specific to adding a second document after being blocked by a first, unmet mandatory-document validation (a scenario not hit this time since Ration Card was selected directly, first).

**New confirmed defect:**
- **BUG-NORMAL-004 (Medium):** Basic Details' Email ID field intermittently rejects syntactically valid email addresses containing a dot in the local part (before the `@`) with "Enter Valid Email ID.", even though the same shape without a dot passes. Confirmed reproducible: `yash.netwin@gmail.com` and `yash.sonawane@netwinindia.biz` were both rejected; `yashsonawane@gmail.com` (identical local text, no dot) was accepted immediately after, with no other field changed. Combined with Basic Details' existing no-partial-save behavior, a rejected email wipes the entire form, not just the offending field — forcing a full re-entry of 20+ fields to recover from what should be a small typo-equivalent correction.

**Final outcome:** `SAH-1001-805` (Individual, Yash Pravin Sonawane) was live-traced end to end through Summary, cross-verified field by field (no discrepancies found this pass), and — after explicit user go-ahead — submitted for real. Confirmed via the application moving from Pending (0 results) to Submitted (status "Sourcer Submit") in the dashboard.

**Not yet covered (future follow-up):** Minor Account Type for the Normal Savings Account remains untraced. Whether the Individual-does-not-skip-Introducer-Details finding also holds for Minor is unknown. The Employment Type × Designation/Profession matrix still has 7 of 9 Employment Type values untested (Professional, Agriculture/Farmer, Unemployed, Retired, Housewife, Other, Business). The "Same as Permanent address" checkbox's exact auto-fill behavior (does it reproduce BUG-NORMAL-001 the same way "Use Existing Address" does?) was not directly isolated this pass.

AC29: Live Execution Findings — Minor Account Type (2026-08-13)

Real application `SAH-1001-806` (started fresh via New Application; a pre-existing draft `SAH-1001-581` was set aside because it used a placeholder minor identity, "Test Uat Minor," inconsistent with this project's real-data approach) was live-traced from Mobile Verification through Summary and final submission. Minor: Bhushan Vishnu Joshi (DOB 2025-11-27, real Aadhaar `700780012335`). Guardian: Shubham Madhukar Borse (mobile `9545368828`) — the same real identity already used as the primary applicant on the Joint application (`SAH-1001-796`) earlier in this project, reused here as the guardian.

**Confirmed real stage order for Account Type = Minor** (matches the Silver Savings Account's confirmed Minor structure exactly):
1. Mobile Number Verification
2. Account Type
3. Minor KYC Details (replaces both eKYC Verification and Liveliness Verification for the minor themselves — manual entry, no DigiLocker)
4. Address Details (fully manual for the minor — no Aadhaar auto-fill, unlike the adult flow)
5. Branch Selection
6. Basic Details (Mode of Operation = "Guardian")
7. Guardian Details (full mirror of the adult applicant flow: Mobile Verification → eKYC → Liveliness → Address → Basic Details → Salaried Information → Applicant Photo)
8. Applicant Photo (minor's own, after Guardian Details converges back)
9. Nominee Details + nested Nominee Address Details
10. Document Upload
11. Introducer Details
12. Lead Details
13. Summary → final Submit

**Key confirmed findings:**
- **Minor KYC Details** fields: First/Middle/Last Name, Date of Birth, Select Identification Document (only one option: "AADHAAR CARD"), Document Identification Number, Upload Document. Manual entry + file upload only — no DigiLocker verification path exists for the minor themselves, matching Silver's finding exactly.
- **Minor's own Address Details has no auto-fill or "Use Existing Address" option at all** — both Permanent and Communication require fully manual entry (Address Line 1/2, Area, State, City, Pin, proof), since there's no Aadhaar-verified source to pull from yet at that point in the flow.
- **Mode of Operation = "Guardian"** confirmed as a valid Basic Details option for Minor, alongside Self (Individual)/Jointly (Joint) seen in the other two flows.
- **Employment Type = Unemployed correctly routes the minor's own Basic Details to Guardian Details** (i.e., no Salaried/Self Employed Information step is inserted for the minor — Guardian Details is the direct next step), consistent with Silver's RULE_26 finding.
- **Guardian Details is a management-table step**, same "+Add" / row-Submit-then-page-Submit pattern as Joint Applicant Details and Nominee Details. Resuming an in-progress guardian record via the table row resets to the sub-flow's first inner tab (Mobile Number Verification), same known gotcha.
- **Guardian's own sub-journey is the full adult flow** — Mobile Verification, eKYC (Aadhaar DigiLocker), Liveliness (Security Code Based), Address Details, Basic Details (with a "Relationship with Main Applicant" field — used "Father" here, since "Natural Guardian" intermittently failed to resolve as a selectable option in one attempt), Salaried Information, and Applicant Photo (which — unlike the primary applicant's own Applicant Photo step — DOES offer "Browse Computer" for both fields, confirming BUG-NORMAL-003 is specific to the top-level primary applicant, not "nested" sub-applicants generally).
- **Live-reproduced a real DigiLocker denial and recovery**: the guardian's first Aadhaar DigiLocker attempt was denied by mistake (user clicked "Deny" on the real device), correctly surfacing status **"Action Required"** with the message "Customer denied document access permission. DigiLocker verification could not be completed." — matching Silver's TC-SIL-032 finding. Clicking **Resend Link** and completing the authorization properly on the second attempt correctly resolved the status to **Successful**.
- **Once Guardian Details is finalized (row Submit, then page Submit, status Successful), the outer step converges into a new top-level "Applicant Photo" stage for the minor themselves** — same convergence pattern as Silver.
- **"Verified Photo" is confirmed non-functional for the minor's own Applicant Photo** — clicking it produces a clear "No Verified Photos Available" toast (no Aadhaar/Liveliness source exists for a non-DigiLocker-verified minor). This is a cleaner, more honest failure mode than Silver's equivalent finding (Silver described it as "silently non-functional" with no dropdown appearing at all) — here the platform at least tells the user why, which may indicate this exact message was added after Silver's testing, or that the two schemes' Verified Photo components differ slightly in error handling. Camera capture worked correctly as the fallback for both Photo and Signature.
- **Minor Account Type does NOT skip Introducer Details on the Normal Savings Account** — same finding as Individual (AC28). Combined with AC28's finding, this means **neither Individual nor Minor skip Introducer Details on Normal Savings Account**, a consistent difference from Silver (where both skip it). Only Joint requires it there; here, all three Account Types require it.
- Minor UI note: the Summary page abbreviates "Select Identification Document" down to just "AC" instead of the full "AADHAAR CARD" value entered — a display-only quirk, not a functional defect (the underlying document type and number were both correctly retained and shown accurately elsewhere on Summary).

**No new confirmed defects this pass** — BUG-NORMAL-001 (Address auto-fill) and BUG-NORMAL-002 (Document Upload loss) were not re-triggered (Document Upload was completed cleanly with Ration Card selected first, avoiding the trigger condition), and no new defect class was found in the Minor-specific steps (Minor KYC Details, Guardian Details).

**Final outcome:** `SAH-1001-806` (Minor, Bhushan Vishnu Joshi, guardian Shubham Madhukar Borse) was live-traced end to end through Summary, cross-verified field by field (no discrepancies found), and — after explicit user go-ahead — submitted for real. Confirmed via the application moving from Pending (0 results) to Submitted (status "Sourcer Submit") in the dashboard. **This completes live execution of all three Account Types (Joint, Individual, Minor) for the Normal Savings Account**, matching the depth of coverage already achieved for the Silver Savings Account.

**Not yet covered (future follow-up):** The Employment Type × Designation/Profession matrix still has untested values across all three Account Types (only Salaried, Self employed, and Unemployed have been exercised). Introducer Account Number validation against a deliberately invalid number remains untested. Funding Mode = Cheque was only tested for Joint; Minor and Individual were only tested with Cash. A full Funding Mode × Employment Type branching sweep (as Silver's AC27 did) has not been performed for the Normal Savings Account.