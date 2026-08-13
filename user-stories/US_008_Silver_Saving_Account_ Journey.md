User Story: Silver Savings Account Application Journey

Module: Savings Account → Silver Savings Account

Priority: High

Role: Registered User

User Story

As a registered customer,

I want to complete the Silver Savings Account application through all mandatory verification steps,

So that my application is successfully submitted for further processing.

Pre-Conditions
User is successfully logged in.
User is on the Home Dashboard.
Savings Account product is available.
Silver Savings Account scheme is active.
Internet connection is available.
DigiLocker services are available.
OTP service is available.
User has valid Aadhaar and Mobile Number.
Test Data
Valid Mobile Number
Invalid Mobile Number
Valid OTP
Invalid OTP
Expired OTP
Aadhaar Number
PAN Card
Driving Licence
Voter ID
Different Account Types
DigiLocker Credentials
Acceptance Criteria
AC1: Silver Savings Account Navigation

GIVEN the user is on the Savings Account selection page

WHEN the user selects Silver Savings Account

THEN

Silver Savings Account application shall open.
Applicant information shall load correctly.
Product Name shall display as Savings Account.
Scheme Name shall display as Silver Savings Account – 1002.
Application Stepper shall be displayed.
Previous and Next navigation buttons shall be visible.
AC2: Application Header Verification

Verify that the application header displays:

Applicant Name
Applicant ID
Product Name
Scheme Name

Verify that all information matches backend records.

AC3: Stepper Verification

Verify the application stepper displays the following stages:

Mobile Number Verification
Account Type
eKYC Verification
Liveliness Verification

[Discovered during execution, not in original story] The live stepper has at least one further stage after Liveliness Verification: "Address Details" (Permanent address, auto-populated from Aadhaar data, and a mandatory Communication Address that must be added separately via "Click Here For Add Address"). The original story's stepper list (AC3) and all downstream ACs (AC16 Submission, AC17 Navigation, etc.) do not account for this stage — full extent of steps beyond Address Details not yet confirmed as of this writing.

Each stage shall:

Display sequentially.
Highlight the active step.
Mark completed steps with a success icon.
Prevent skipping mandatory steps.
AC4: Mobile Number Verification

GIVEN the Mobile Verification screen is displayed

THEN

Mobile Number field shall be displayed.
Country Code shall be displayed.
Mobile Number shall be editable (if applicable).
Previous and Next buttons shall be enabled according to business rules.
Mandatory validations shall work correctly.
Valid Mobile Number shall proceed to OTP Verification.
AC5: OTP Verification

GIVEN an OTP has been sent

WHEN the OTP Verification screen is displayed

THEN

Registered mobile number shall be displayed.
OTP field shall be visible.
Submit/Verify button shall be visible.
Resend OTP option shall be visible.
OTP validity timer shall be displayed.
Resend countdown timer shall be displayed.
Previous and Next buttons shall be available.
OTP Field Validation

Verify:

Blank OTP
Less than required digits
More than required digits
Alphabetic characters
Special characters
Leading/trailing spaces

Appropriate validation messages shall be displayed.

Invalid OTP

Verify:

Incorrect OTP displays Invalid OTP message.
User can retry.
Mobile remains unverified.
Expired OTP

Verify:

Expired OTP cannot be used.
Expiry message is displayed.
User must request a new OTP.
OTP Attempts

Verify:

Remaining attempts decrease.
Maximum attempt validation.
Account follows configured business rules after maximum attempts.
Resend OTP

Verify:

New OTP generation.
Previous OTP becomes invalid.
Timer restarts.
Success message displayed.

Verify resend before timer expires displays appropriate validation.

Mobile Number Change

Verify:

User can change mobile number.
New OTP is generated.
Previous OTP becomes invalid.
Successful Verification

Verify:

Verification completes successfully.
Success message is displayed.
Mobile is marked verified.
User proceeds to Account Type.
Navigation

Verify:

Previous button navigates back.
Next button proceeds only after successful verification.
Refresh Validation

Verify:

Timer continues correctly.
Data is retained.
Session follows business rules.
UI Validation

Verify:

Timer updates correctly.
OTP field alignment.
Messages display correctly.
No UI issues.
AC6: Account Type Selection

Verify the following account types are displayed:

Joint
Individual
Minor

Verify:

Only one account type can be selected.
Selected card is highlighted.
Tick mark appears on selected option.
Success message is displayed after submission.
User proceeds to eKYC Verification.
AC7: eKYC Verification

Verify following verification options are displayed:

Aadhaar Verification through DigiLocker (Mandatory)
PAN Verification
Driving Licence Verification
Voter ID Verification

Verify UI alignment and proper display.

AC8: Aadhaar Verification through DigiLocker (Mandatory)

GIVEN the user reaches the eKYC Verification step

WHEN the user clicks Aadhaar Verification through DigiLocker

THEN

DigiLocker popup shall open successfully.
The popup shall display:
Mobile Number field
Mobile Number pre-filled (where applicable)
Information message about DigiLocker verification
Send Link button
Cancel button
Mobile Number shall be editable according to business rules.
Mandatory validations shall be applied on the Mobile Number field.
Popup shall close successfully when Cancel is clicked.
No verification request shall be initiated on Cancel.
AC8.1: Mobile Number Validation

Verify the Mobile Number field for:

Blank Mobile Number
Less than required digits
More than required digits
Alphabetic characters
Special characters
Leading/trailing spaces
Invalid Mobile Number format

Appropriate validation messages shall be displayed according to configured business rules.

AC8.2: Send DigiLocker Link

WHEN the user clicks Send Link

THEN

DigiLocker verification link shall be generated successfully.
Link shall be sent to the registered mobile number.
Success toaster shall be displayed.
Popup shall close automatically (if applicable).
Aadhaar Verification status shall remain Pending until the customer completes DigiLocker authentication.
Verification section shall display the verification information panel.
AC8.3: Verification Information Panel

After sending the DigiLocker link, verify that the Aadhaar Verification section displays:

Verification link sent message.
Mobile Number to which the link was sent.
Link Validity Timer.
Resend Link Timer.
Current Verification Status (Pending).
Appropriate instructional message for the customer.

Timers shall update correctly every second.

AC8.4: DigiLocker Link Validity

Verify that:

Link validity timer starts immediately after sending the link.
Remaining validity duration is displayed correctly.
Link expires after the configured duration.
Expired links cannot be used.
Appropriate expiry message is displayed.
User must resend a new verification link after expiry.
AC8.5: Resend Link

Verify that:

Resend Link becomes enabled only after the configured cooldown period.
Clicking Resend Link generates a new verification link.
Previous verification link becomes invalid.
Link validity timer restarts.
Resend cooldown timer restarts.
Success message is displayed.
Attempt count is updated according to business rules.

Verify that clicking Resend Link before the cooldown expires displays the configured validation message.

AC8.6: Verification Attempts

Verify that:

Remaining verification attempts are displayed.
Attempt count decreases after each resend or failed verification according to business rules.
Appropriate message is displayed when attempts are exhausted.
Additional verification requests are blocked after maximum attempts (if configured).
AC8.7: Pending Verification Status

After the verification link is sent:

Verify that:

Aadhaar Verification status displays Pending.
User cannot complete eKYC until Aadhaar verification succeeds.
Appropriate information message is displayed while waiting for customer action.
Refreshing the page retains the Pending status.
Timers continue according to business rules.
AC8.8: Successful DigiLocker Verification

WHEN the customer completes DigiLocker authentication successfully

THEN

Aadhaar details shall be fetched successfully.
Aadhaar Verification status shall change from Pending to Successful.
Success indicator shall be displayed.
Success message shall be displayed.
eKYC verification status shall be updated.
User shall be allowed to continue with the remaining verification process.
Automation Requirement

For automation execution:

The Playwright script shall continuously wait/poll until the Aadhaar Verification status changes to Successful.
Script execution shall proceed only after the Success status is displayed.
If the status does not change within the configured timeout, the test shall fail with an appropriate timeout message.
AC8.9: DigiLocker Verification Failure

Verify that:

Failed DigiLocker authentication displays the configured error message.
Verification status remains Pending or Failed according to business rules.
User is allowed to retry if attempts remain.
Appropriate guidance message is displayed.
AC8.10: Refresh & Session Validation

Verify that:

Refreshing the page does not reset the verification process.
Remaining timers continue correctly.
Pending or Successful status is retained.
Application data is not lost.
Session timeout follows configured business rules.
AC8.11: UI Validation

Verify that:

DigiLocker popup is properly aligned.
Mobile Number field is correctly displayed.
Send Link and Cancel buttons are aligned.
Success toaster is displayed correctly.
Pending badge is displayed correctly.
Successful badge is displayed correctly.
Verification information panel is properly aligned.
Link validity timer updates correctly.
Resend timer updates correctly.
No UI overlap, truncation, broken layout, or responsiveness issues are observed.

AC9: PAN Verification

Verify:

PAN verification screen opens.
Valid PAN completes verification.
Invalid PAN displays validation.
Status updates correctly.

[Discovered during execution, not in original story] The PAN Verification screen requires two mandatory fields, not just a PAN Number:
- PAN Number (text field)
- A supporting document, provided via either "Browse Computer or drag and drop" (accepted formats: png, jpeg, pdf) OR "Capture Using Camera"
Both are marked mandatory (*). Submission behavior when only one of the two is provided has not yet been verified.

[Discovered during execution — CONFIRMED DEFECT] The supporting document upload performs no content validation: an arbitrary, unrelated image (a screenshot of the application itself, not any form of ID document — but a validly-typed .png) was uploaded and accepted with "Document Uploaded" / "PAN details saved successfully!" — the system does not verify the uploaded file actually depicts a PAN card. Logged as BUG-SILVER-001. Note: file-EXTENSION validation itself does work correctly (confirmed on the Driving Licence upload — .txt/.exe/.docx/.gif were all rejected client-side with "Only PNG, JPG, PDF, Camera files are allowed", only .png/.jpg/.pdf are accepted); the gap is specifically that any file passing the extension check is accepted regardless of what it actually depicts.

[Discovered during execution, not in original story] After submitting PAN Number + document, the screen reveals a second confirmation sub-step (still under "PAN Verification", before the overall eKYC list shows a final status) with additional fields, auto-populated from the applicant's Aadhaar/DigiLocker data:
- First Name * (auto-filled, editable)
- Middle Name (auto-filled, editable, not marked mandatory)
- Last Name * (auto-filled, editable)
- Date Of Birth * (auto-filled, editable)
A second Submit confirms these. The PAN Number field also shows a green checkmark after entry, indicating real-time format/checksum validation on the number itself — separate from (and stricter than) the complete absence of validation on the uploaded document (see BUG-SILVER-001 above).

[Discovered during execution] The overall eKYC list shows PAN Verification as "Pending" until BOTH sub-steps (document confirm, then name/DOB confirm) are submitted — it only shows "Successful" once the second Submit has actually been clicked. Confirmed: the same PAN number and the same unrelated document (see BUG-SILVER-001) were sufficient to reach "Successful" once both steps were completed, reinforcing that document content is not actually being checked.

AC10: Driving Licence Verification

Verify:

Driving Licence verification opens.
Valid Licence completes verification.
Invalid Licence displays validation.
Status updates correctly.

[Discovered during execution, not in original story] The Driving Licence Verification screen is a popup (not an inline panel like PAN) with:
- Driving Licence Number * (mandatory)
- Date of Birth * (mandatory)
- A supporting document via "Browse Computer or drag and drop" (png, jpg, pdf) OR "Capture Using Camera" — NOT marked mandatory (no asterisk), unlike PAN's document upload which is mandatory
- Cancel and Verify buttons (this screen uses "Verify", not "Submit", as its primary action)

[Discovered during execution] Like PAN, Driving Licence Verification is a two-step flow: after "Verify" succeeds, the popup reveals a "Driving Licence Name" field (auto-populated from Aadhaar data) with its own "Submit" button, which must be clicked to actually move the status from "Pending" to "Successful" on the overall eKYC list. Also note: the popup contains TWO "Submit" buttons on screen simultaneously once this second sub-step is reached — the popup's own confirm button, and the overall eKYC list's bottom "Submit" (visible behind/below the popup) — automation must scope to the popup-local one specifically (it is the first "Submit" in DOM order), not the last.
[Discovered during execution] An incorrect Driving Licence Number (real format, but not matching the applicant's actual DOB/record) produces an explicit "Driving Licence verification failed" message and does not silently pass — this appears to be a genuine backend/database check, unlike PAN's document-upload step which accepts any correctly-typed file regardless of content (BUG-SILVER-001).

AC11: Voter ID Verification

Verify:

Voter ID verification opens.
Valid Voter ID completes verification.
Invalid Voter ID displays validation.
Status updates correctly.

[Discovered during execution, not in original story] The Voter ID Verification screen is a popup (not an inline panel) with:
- Voter Id Number * (mandatory; no Date of Birth field, unlike Driving Licence)
- A supporting document via "Browse Computer or drag and drop" (png, jpg, pdf) OR "Capture Using Camera" — NOT marked mandatory (no asterisk), same as Driving Licence
- Cancel and Verify buttons

[Discovered during execution] Voter ID followed the same two-step pattern as Driving Licence (Verify → reveals "Voter Id Name" auto-populated field → second Submit to reach "Successful"), but unlike Driving Licence, verification succeeded on the first attempt with the real Voter ID number provided — no failed attempt was needed to reach a valid result.

AC12: eKYC Completion

Verify:

eKYC success message is displayed.
Stepper marks eKYC completed.
User can proceed to Liveliness Verification.
AC13: Liveliness Verification

Verify the following sections are available:

Security Code Based Liveliness Verification
Liveliness Verification

Verify Pending and Successful statuses are displayed appropriately.

[Discovered during execution, not in original story] The two Liveliness options are alternatives, not both mandatory: attempting the overall "Submit" while both are still Pending shows "Please complete at least one process" — only one of the two needs to reach "Successful" to proceed.
[Discovered during execution] Security Code Based Liveliness link delivery was unreliable in practice: an initial link (day 1) and a resend (day 2) both expired without arriving on the registered phone within their validity window (~28 min) and a further ~35 min of waiting. Resend attempts are limited ("You have 1 attempt remaining" shown after the first resend) — worth flagging as a reliability concern (comparable to BUG-FP-002 seen in the Forgot Password module) rather than a hard functional defect, since the mechanism itself (Pending → poll → Successful) worked correctly for Aadhaar via DigiLocker earlier in the same session.

AC14: Security Code Based Liveliness

Verify:

Security code is generated.
User follows instructions correctly.
Verification status updates.
Validation messages display for failures.

[Discovered during execution — CONFIRMED DEFECT, HIGH SEVERITY — BUG-SILVER-004] Security Code Based Liveliness Verification returned "Successful" when tested with a person other than the actual applicant holding the security code in front of the camera (real test, performed twice — once for the primary applicant SAH-1002-800/9403564649, once for the joint applicant on SAH-1002-798). The check evidently only verifies that a photo containing the correct security code text was submitted — it does not verify that the photographed person's face matches the applicant's identity (e.g., against the Aadhaar photo). This defeats the stated purpose of a "liveliness"/identity check in a banking KYC flow and should be treated as a security/compliance-relevant finding, not merely a UI defect.

AC15: Liveliness Verification

Verify:

Camera permission handling.
Face capture.
Successful verification.
Retry flow.
Failure scenarios.
Status updates.
AC16: Application Submission

Verify:

Submit button is enabled only after all mandatory verifications are complete.
Clicking Submit submits the application successfully.
Success confirmation is displayed.
Application status is updated.
User is redirected according to business rules.

[CONFIRMED via live execution, 2026-08-05] Before final submission, the Summary page's data was cross-verified field-by-field against everything entered across all 15 prior stages (screenshot-confirmed, all sections showed green checkmarks). One issue was caught and corrected pre-submission: the Spouse/Father's Name field's 20-character hard cap (see BUG-SILVER-003 correction above) had produced "Aishwarya Shubham Bo" — this was edited via the Basic Details tab (still editable from the Summary stage) to "Aishwarya Borse" before submitting, and the Summary correctly reflected the update. Clicking the final Submit on `SAH-1002-798` (POST `app/summary/submit`) returned success; the application immediately moved off the Pending list (Pending count 29→28) and appeared in the Submitted tab (count 11→12) with status "Sourcer Submit" — confirming AC16 end to end. No "success confirmation" toast/modal text was captured distinctly from the redirect itself (the user was redirected straight back to the Application Dashboard); this may be worth a dedicated recon if a more distinct confirmation UI is expected.

AC17: Previous & Next Navigation

Verify:

Previous navigates to the previous completed step.
Previously entered data is retained.
Next cannot bypass mandatory validations.
Users cannot skip required verification stages.
AC18: Session Validation

Verify:

Browser refresh retains application progress according to business rules.
Session timeout behaves correctly.
Duplicate submissions are prevented.
AC19: UI Validation

Verify:

Header alignment.
Stepper alignment.
Verification cards.
Status badges (Pending/Successful).
Success messages.
Previous/Next buttons.
Submit button.
Responsive layout.
No overlapping or broken UI elements.
AC20: Performance Validation

Verify:

Application loads within the expected response time.
DigiLocker integration responds within acceptable limits.
OTP verification completes within expected time.
Liveliness verification loads smoothly.
Submit operation completes without timeout or UI freezes.

AC21: Address Details
AC21.1: Navigate to Address Details

Given
The user successfully completes the Liveliness Verification step

When
The user clicks Submit

Then

The application shall redirect to the Address Detaiyesls page.
The Address Details step shall be highlighted as the active step.
Previously completed steps shall remain marked as completed.
AC21.2: Display Permanent Address

Given
The Address Details page is opened

Then

Permanent Address shall be displayed.
The address shall be automatically populated from the verified DigiLocker/eKYC details.
The address shall be displayed in read-only mode.
The address shall not be editable by the user.
AC21.3: Display Communication Address Section

Verify that:

Communication Address section is displayed.
It is marked as mandatory.
"Click Here For Add Address" link/button is displayed.
AC21.4: Open Communication Address Popup

Verify the popup displays:

Same as Permanent Address checkbox
Address Line 1 *
Address Line 2
Area / Locality
Country *
State *
City *
Pin Code *
Upload Address Proof
Browse Computer / Drag & Drop
Camera Capture
Cancel button
Submit button

Supported formats:

PNG
JPG
PDF
AC21.5: Same as Permanent Address

Verify:

Permanent Address values are auto-populated.
Address Line 1
Address Line 2
Area / Locality
Country
State
City
Pin Code
Fields remain editable if permitted by business rules.

[Discovered during execution — CONFIRMED DEFECT] Checking "Same as Permanent address" only populates Address Line 1 (with the entire permanent address dumped in as one unstructured string) — Country stays "India" (already defaulted) but State, City, and Pin Code all remain empty. Clicking Submit with only the checkbox checked (no further manual input) fails with "State is required", "City is required", "Pin code is required" — the checkbox does not actually satisfy AC21.5 as written; the user must still manually select State/City and type the Pin Code even after checking it. Logged as BUG-SILVER-002.

[Discovered during execution — BUG-SILVER-002 confirmed as a broader pattern] The joint applicant's Permanent Address popup offers a similar "Use Existing Address" toggle with an "Address Source" dropdown (e.g., "Applicant - Shubham Madhukar Borse") and an "Address Type" dropdown, not documented anywhere in this story. Enabling it and selecting the primary applicant as the source shows a green "Address fetched successfully!" toast and populates Address Line 1 only — State, City, and Pin Code are left empty exactly as with the "Same as Permanent address" checkbox, confirming this is a systemic gap in the address auto-fill feature rather than an isolated bug on one screen.

AC21.6: Manual Communication Address Entry

Verify:

Mandatory fields:

Address Line 1
Country
State
City
Pin Code

Optional fields:

Address Line 2
Area / Locality
AC21.7: Address Proof Upload

Verify:

Browse upload
Drag & Drop upload
Camera Capture upload
PNG supported
JPG supported
PDF supported
Uploaded filename displayed
Unsupported file formats rejected
AC21.8: Communication Address Validation

Verify:

Mandatory field validation
Highlighting of required fields
Submission prevented until valid
AC21.9: Save Communication Address

Verify:

Communication Address saved successfully.
Popup closes.
Saved address is displayed on the page.
AC21.10: Submit Address Details

Verify:

Address Details saved successfully.
User is redirected to the Branch Selection page.
AC21.11: Address Details Business Rules

Verify:

Permanent Address is fetched from verified eKYC.
Permanent Address remains read-only.
Communication Address is mandatory.
Same as Permanent Address populates applicable fields.
Manual entry validates mandatory fields.
Address Proof supports PNG, JPG, PDF, and Camera Capture.
Communication Address must be saved before proceeding.
Successful validation redirects to Branch Selection.

AC22: Branch Selection
AC22.1: Navigate to Branch Selection

Verify:

User is redirected after Address Details submission.
Branch Selection step becomes active.
AC22.2: Display Default Branch

Verify:

Branch Name displayed.
Branch ID displayed.
Branch Address displayed.
Default branch is selected.
AC22.3: Change Branch

Verify:

Change Branch option is available.
Branch list opens.
Previously selected branch remains highlighted until another is selected.
AC22.4: Branch List Verification

Verify each branch card displays:

Branch Name
Branch ID
Branch Address
Selected indicator
AC22.5: Search Branch

Verify search using:

Branch Name
Branch ID
Branch Address
Partial search
Case-insensitive search
No matching records
AC22.6: Scrollable Branch List

Verify:

Vertical scrolling
Scroll to last record
Smooth scrolling performance
AC22.7: Branch Selection

Verify:

New branch selection
Previous branch deselected
Only one branch selected
Selected branch highlighted
AC22.8: Submit Selected Branch

Verify:

Selected branch saved successfully.
Application proceeds to the next step.
User is redirected to the Basic Details page.
AC22.9: Back Navigation

Verify:

Back returns to Address Details.
Previously entered data remains intact.
AC22.10: Branch Selection Validation

Verify:

Default Branch
Branch Name
Branch ID
Branch Address
Search
Branch Name search
Branch ID search
Branch Address search
Partial search
Case-insensitive search
No matching records
Branch Selection
Select different branches
Multiple selection changes
Single branch selection
Selected branch highlight
Scrolling
Scroll to middle
Scroll to last record
Large branch list handling
Navigation
Submit redirects to Basic Details
Back redirects to Address Details
Progress indicator updates correctly

AC23: Basic Details (Discovered during execution — not in original story or AC21/AC22)

Submitting the default branch on Branch Selection redirects to a large "Basic Details" step with 30+ fields not documented anywhere in this story: Mode of Operation, Prefix, First/Middle/Last/Full Name, Date of Birth, Gender, Email ID, Marital Status, Father's First/Middle/Last Name, Mother's Name, Spouse/Father's Name, Religion, Caste Category, Politically Exposed Person status, Person with Disabilities status, Education/Qualification, Country of Tax Residence, Region, Employment Type, Designation/Profession, Funding Mode, Initial Funding Amount, Expected Value/Number of Transactions (yearly), Agriculture Income, Other Than Agricultural Income.

First/Middle/Last/Full Name and Date of Birth are auto-populated (read-only) from Aadhaar/eKYC; every other field is blank and must be entered. Amount/count fields (Initial Funding Amount, Expected Value/Number of Transaction (yearly), Agriculture Income, Other Than Agricultural Income) are numeric-only text inputs.

Business rule: Mode of Operation must match the application's Account Type — this application is Account Type "Joint", and selecting "Self" for Mode of Operation is rejected with an inline validation message ("Select an appropriate Mode of Operation based on the Account Type"); "Jointly" was accepted instead.

[CONFIRMED DEFECT — BUG-SILVER-003] The "Spouse / Father's Name" field silently truncates input at 20 characters with no warning or validation message. Entering "Aishwarya Shubham Borse" (24 characters) resulted in a stored value of "Aishwarya Shubham Bo" (verified via the field's actual DOM value, not just visual clipping). [Correction, confirmed during Summary cross-verification] The field has a hard `maxlength="20"` HTML attribute — so the browser itself refuses to accept the 21st+ character as it's typed, rather than the platform silently truncating a longer value after submission. The defect is more precisely: no visible character-limit indicator (no counter, no inline hint) tells the user their input is being capped while they're typing, and the field's own label offers no hint that a name this long won't fit — a 20-character cap is unrealistically short for a "Spouse / Father's Name" field in general.

[Minor copy defects] Two dropdown option labels contain typos: Region's "Metropolitian City" (should be "Metropolitan") and Mode of Operation's "Any Two Jointhly" (should be "Jointly").

Submitting Basic Details successfully ("Details saved successfully!") reveals a further, Employment-Type-conditional sub-step — for Employment Type "Salaried", a "Salaried Information" section appears with: Category (dropdown: Central Government Employee / State Government Employee / Public Sector Undertaking (PSU) / Defence Services (Army, Navy, Air Force) / Private Sector Employee – Corporate / MNC), Organization's Name, Annual Income, Source of Income — none of which are documented in the original story.

Submitting Salaried Information ("Details saved successfully!") reveals yet another step — "Joint Applicant Details" (Mobile Number field shown first) — expected, since this application's Account Type is "Joint" and a second applicant's own details/verification are evidently required. This implies the entire verification chain (mobile OTP, eKYC, Liveliness, etc.) may need to be repeated for the joint applicant with their own real data — confirmed: Mobile Number Verification for the joint applicant is the same screen/flow as the primary applicant's, and entering the same mobile number already used by the primary applicant on this application is correctly rejected with "Same Mobile number has been already verified for same request !" (MOB_VERIF_ALREADY_EXIST). Completing Mobile Number Verification with a different real number reveals the same eKYC Verification sub-step (Aadhaar/PAN/DL/Voter ID) nested under "Joint Applicant Details" in the stepper.

[Discovered during execution] Re-entering the application after joint applicant Mobile Number Verification does not resume directly on that applicant's eKYC screen — instead it lands on a "Joint Applicant Details" management table (columns: Full Name, Customer ID, Status, Delete, Action; a "+ Add" button for adding further joint applicants). The row itself is clickable (not just the "Action" column's "Submit" button) and resumes that applicant's own sub-stepper (Mobile Number Verification → eKYC Verification); clicking the row's "Submit" button before eKYC is complete instead shows a validation message ("Please complete eKYC Verification step!") and does not navigate anywhere.

[Discovered during execution — AC8.9 confirmed] When the joint applicant denied DigiLocker document-access permission on their phone (real test, not simulated), the DigiLocker verification correctly failed. The Aadhaar Verification status on the eKYC list displays "Action Required" (not "Pending", "Failed", or a generic error) — a third distinct status value beyond the two ("Pending"/"Successful") documented elsewhere in this story.

[Discovered during execution] The joint applicant's own sub-stepper mirrors the primary applicant's full journey end to end: Mobile Number Verification → eKYC Verification → Liveliness Verification → Address Details → Basic Details → Salaried Information → Applicant Photo. Notable differences from the primary applicant's equivalents:
- Address Details: the joint applicant's Permanent Address is NOT auto-populated read-only from their own Aadhaar (unlike the primary applicant) — both Permanent and Communication Address require "Click Here For Add Address", each offering a "Use Existing Address" toggle (Address Source / Address Type dropdowns) that suffers the same State/City/Pin Code auto-fill gap as BUG-SILVER-002.
- Basic Details: includes a "Relationship with Main Applicant" dropdown (options: Wife, Grand Father, Daughter, Grand Mother, Others, Natural Guardian, Son, Father, Mother, Brother, Sister, No Relation, Husband, Business Associate, Spouse, Parent, Sibling) not present on the primary applicant's form, and omits Mode of Operation / Initial Funding Amount / Funding Mode (those are primary-applicant-only, sensibly).
- After Salaried Information, a further "Applicant Photo" step appears (also not documented anywhere in this story): an Applicant Name display field, "Upload Applicant Photo" with a "Verified Photo" alternative, and "Upload Applicant Signature" (no verified alternative for signature). The "Verified Photo" option opens its own popup with a "Select Verified Photo" dropdown offering "Aadhaar Verification Photo" and "Liveliness Verification Photo" as sources — when only one is available it auto-selects with the message "Only one image available — auto-selected."
- Re-entering any joint-applicant sub-step via the outer tab always resets the visible form to its first/initial state (even when already saved) — the data itself persists server-side, and resubmitting the same (or a freshly re-selected) already-saved step correctly advances to the next one, but this makes automation of "resume mid-flow" meaningfully more complex than the primary applicant's flow.
- Once every sub-step is complete, the Joint Applicant Details table's row Status changes from "Pending" to "Successful" and its Action cell changes from a "Submit" button to "-", confirming that applicant is fully done.

[Automation note] The "Select Verified Photo" popup (and possibly other camera-related prompts, e.g. for "Capture Using Camera" options) can trigger a native browser geolocation permission prompt that blocks automated interaction unless the browser context pre-grants `geolocation` (and `camera`) permissions — without this, the popup's own Submit button appears to silently fail to register clicks.

[Discovered during execution, not in original story] After the Joint Applicant Details step, the primary applicant (and, separately, the joint applicant) must complete their own "Applicant Photo" step: Applicant Name (read-only), "Upload Applicant Photo" (with a "Verified Photo" alternative sourced from Aadhaar/Liveliness, as described above), and "Upload Applicant Signature". With `camera` browser permission granted, the Signature field's upload option changes to camera-capture only — the "Browse Computer or drag and drop" file option seen elsewhere in this journey is not offered at all for Signature in this state, and no `<input type="file">` element exists on the page as a fallback. "Capture Using Camera" opens a live camera popup ("Capture Image") showing the reverse-geocoded address, latitude/longitude, and timestamp derived from the browser's geolocation, with a "Capture photo" action.

[UI DEFECT] The "Upload Applicant Photo" section's file-upload area displays "Capture Using Camera" **twice** ("Capture Using Camera / OR / Capture Using Camera") instead of the expected "Browse Computer or drag and drop ... OR ... Capture Using Camera" pattern used consistently everywhere else in this journey (PAN, Driving Licence, Voter ID, Address Proof). The Browse/drag-and-drop option appears to be missing/duplicated-over on this screen.

[CONFIRMED DEFECT — extends BUG-SILVER-001] The Signature camera-capture step performs no content validation either: capturing a photo via Chromium's fake test video device (a generic test pattern, not any form of handwritten signature) was accepted as "Document Uploaded" with no rejection or warning. Combined with BUG-SILVER-001 (PAN/DL/Voter ID document uploads), this confirms the platform does not validate that ANY uploaded/captured document or biometric image actually depicts what it claims to be — a pattern that spans the entire application (PAN card, DL, Voter ID, Address Proof, and now Applicant Signature).

AC24: Nominee Details (Discovered during execution — not in original story)

Submitting the Applicant Photo step ("Details saved successfully!") reveals a "Nominee Details" step, not documented anywhere in this story: Full Name, Relation of nominee with applicant (dropdown, same 17-option list as the Joint Applicant's "Relationship with Main Applicant"), Date of Birth, and an "Age (In Years)" field (likely auto-calculated from Date of Birth) — with its own Submit. Like Joint Applicant Details, Nominee Details is itself a management table (+ Add, Full Name/Status/Delete/Action columns) with the same "row resets to first sub-step, resubmitting advances" behavior. Submitting it reveals a further "Address Details (Nominee)" sub-step requiring its own "Registered Address" via the same "Click Here For Add Address" / "Use Existing Address" pattern used throughout this journey (note: this popup's Pin Code field placeholder is capitalized "Pin Code", inconsistent with the "Pin code" placeholder used on the primary/joint applicant's own Address Details popups).

AC25: Document Upload (Discovered during execution — not in original story)

Submitting Nominee Address Details reveals a "Document Upload" step: a "Select Applicant Document" dropdown (options: Electricity Bill, Ration Card, Telephone Bill, Copies of the Memorandum and Articles of Association and Certificate of Incorporation, Copy of the Board Resolution for A/C Open and Investment, Property or Municipal Tax Receipt, Birth Certificate, Relationship Proof With Guardian (For Minor Account), Deposit Slip, Cheque Image), a Browse/Camera upload area, and a "+ Add Custom Document" link. Unlike every other document-upload step in this journey, this one is optional — clicking Submit with nothing selected/uploaded succeeds ("Documents saved successfully!") and advances to the next step.

AC26: Introducer Details (Discovered during execution — not in original story)

Submitting Document Upload reveals an "Introducer Details" step: Introducer's Name *, Introducer Account Number *, Period of Acquaintance * — none of which are documented anywhere in this story.

[Discovered during execution] A 12-digit Introducer Account Number not matching a real account correctly triggers a backend call and a clear error message: "The account does not exist."

[CORRECTION — not a confirmed defect] An earlier note here claimed a 15-digit account number produced a blank/empty error toast with no backend call. On closer inspection this was an artifact of automation timing, not real product behavior: the backend request was simply slower than the script's wait window, and the submission had actually succeeded by the time the page was re-checked. A valid, existing Introducer Account Number (`100144590015067`, name Bhuwan Dnyaneshwar Patle) did correctly save and advance the step once given enough time.

[Discovered during execution] Successfully submitting Introducer Details reveals a further, undocumented step called "Lead Details" (per the stepper label): "Lead Converter Code" and "Sourcer Code", each a mandatory text field with its own "Verify" action, followed by an overall Submit. Confirmed mandatory: submitting with both blank shows "Lead Converter Code is required" and "Sourcer Code is required" inline validation messages.

AC27: Funding Mode / Employment Type Conditional Navigation Matrix (Discovered during execution, live-explored 2026-08-07 on real in-progress application SAH-1002-775 — not in original story or AC23)

Following the report that the flow after Basic Details differs by Funding Mode, a full live traversal was performed for all 9 Employment Type options × both Funding Mode options (18 combinations), resubmitting the Basic Details form on the same live application and observing the resulting next-step panel each time. This was then reconciled against the project's authoritative backend routing configuration, `aoscust_module_rules_setting.xlsx`, which defines the following rule engine for the step immediately after Basic Details:

| Rule | Condition | Next Module |
|---|---|---|
| RULE_22 | Funding Mode = Cheque | Initial Funding Details (Cheque Details) |
| RULE_23 | Employment Type = Salaried | Salaried Information |
| RULE_24 | Employment Type = Self employed, Retired, Housewife, Farmer, Professional | Self Employed Information |
| RULE_25 | Employment Type NOT IN (Self employed, Salaried, Unemployed, Retired, Housewife, Farmer, Professional) AND Customer Type = Joint | Joint Information |
| RULE_26 | Employment Type NOT IN (Self employed, Salaried, Retired, Housewife, Farmer, Professional) AND Customer Type = Minor | Guardian Information |
| Default | None of the above match | Applicant Photo |

**Employment Type dropdown — all 9 options (confirmed via live DOM):** Salaried, Professional, Agriculture/Farmer, Unemployed, Self employed, Retired, Housewife, Other, Business.

**Funding Mode dropdown — both options (confirmed via live DOM):** Cash, Cheque.

**Confirmed: Designation/Profession does not affect routing.** Two live submissions with Employment Type=Salaried/Funding Mode=Cash held constant, varying only Designation/Profession ("Private Company Employee" vs. "Government Employee"), produced an identical next screen in both cases — matching the rule config's omission of Designation/Profession from any rule. Treated as informational-only, confirmed.

**Confirmed: Customer Type for SAH-1002-775 is Individual** (re-verified via the Account Type tab showing a checkmark ✓ against "Individual").

**Confirmed mechanism (RULE_22):** Funding Mode = Cheque dynamically inserts an additional "Cheque Details" tab into the top-level application stepper (confirmed via stepper tab list: `Mobile Number Verification, Account Type, eKYC Verification, Liveliness Verification, Address Details, Branch Selection, Basic Details, Cheque Details`) — this tab is not present for Funding Mode = Cash. Cheque Details requires: Cheque Number *, Cheque Date *, Drawee Bank Name *, Drawee Branch IFSC Code *. Submitting it ("Details saved successfully!") converges into the exact same employment-specific step that Cash goes to directly — Cheque Details is a single extra step inserted before RULE_23/24/25/26 evaluation, not a parallel/divergent path.

**Flow matrix (Customer Type = Individual, as tested):**

| Funding Mode | Employment Type | Rule expected | Actual next step observed | Matches config? |
|---|---|---|---|---|
| Cash | Salaried | RULE_23 → Salaried Information | Salaried Information screen (Category dropdown: Central Government Employee / State Government Employee / PSU / Defence Services / Private Sector Employee – Corporate/MNC; Organization's Name *; **Annual Income** *; Source of Income *) | Yes |
| Cash | Professional | RULE_24 → Self Employed Information | Same-shaped screen with **Annual Turnover** * (not Annual Income) | Yes |
| Cash | Self employed | RULE_24 → Self Employed Information | Same as Professional | Yes |
| Cash | Retired | RULE_24 → Self Employed Information | Same as Professional | Yes |
| Cash | Housewife | RULE_24 → Self Employed Information | Same as Professional | Yes |
| Cash | Agriculture/Farmer | RULE_24 → Self Employed Information (doc says "Farmer") | **BLOCKED**: "Employment type is invalid for Minor." | **No — defect, see BUG-SILVER-005** |
| Cash | Unemployed | Individual matches none of RULE_23–26 → Default → Applicant Photo | Blocked with "invalid for Minor" in 3 of 4 real attempts; the 1 success reached the Self Employed Information screen, not Applicant Photo | **No — defect in every attempt, see BUG-SILVER-005** |
| Cash | Other | Default → Applicant Photo | **BLOCKED**: "Employment type is invalid for Minor." | **No — defect, see BUG-SILVER-005** |
| Cash | Business | Default → Applicant Photo | **BLOCKED**: "Employment type is invalid for Minor." | **No — defect, see BUG-SILVER-005** |
| Cheque | (all 9 Employment Types) | RULE_22 → Cheque Details, then same RULE_23–26/Default evaluation as the Cash column above | Cheque Details submits successfully in every case tested ("Details saved successfully!"), then reproduces the exact same per-Employment-Type result as the Cash column (Salaried/Professional/Self employed/Retired/Housewife succeed; Agriculture/Farmer/Other/Business blocked; Unemployed mostly blocked) | Same match/mismatch pattern as Cash |

[Discovered during execution — CONFIRMED DEFECT — BUG-SILVER-005, High] Customer Type on SAH-1002-775 is confirmed **Individual** (checkmark verified on the Account Type tab), and the applicant's own DOB is a real, disabled, adult value (`1995-09-21`, ~31 years old — see AC23). There is no legitimate condition under which this applicant should ever be evaluated as a minor. Yet for Employment Type = **Agriculture/Farmer**, **Other**, and **Business**, Basic Details submission is consistently rejected with **"Employment type is invalid for Minor."**, regardless of Funding Mode — this is a confirmed application defect, not a business rule working as intended. Per the routing configuration (`aoscust_module_rules_setting.xlsx`), RULE_24 should route Farmer to Self Employed Information, and Other/Business (matching no Employment-Type-specific rule, and not Joint/Minor) should hit the Default rule and reach Applicant Photo — neither happens. Employment Type = **Unemployed** reproduced the same incorrect block in 3 of 4 real attempts, and even its 1 success did not reach the documented Default destination (it landed on Self Employed Information instead of Applicant Photo) — so Unemployed never once produced rule-config-correct behavior across 4 real attempts either.

**Root cause analysis (informed by the rule config), for developer investigation:**
1. **Agriculture/Farmer** is almost certainly a naming/string-match bug: RULE_24's configured condition value is `"Farmer"`, but the live UI's actual dropdown option text is `"Agriculture/Farmer"`. If the backend does an exact string match against the configured value, `"Agriculture/Farmer"` never matches `"Farmer"`, so RULE_24 silently fails to fire for this option even though it is clearly intended to be covered by it, and the request falls through to whatever mishandles the fallback case (see point 2).
2. **Unemployed, Other, Business on an Individual account** should all fall through every rule (RULE_23–26 each require either a specific Employment Type these three aren't, or a Customer Type of Joint/Minor which this account isn't) and land on the config's own **Default → Applicant Photo**. Instead of reaching that default, the backend throws a Minor-specific validation error — the fallback code path is incorrectly invoking RULE_26's Minor-only validation logic instead of correctly defaulting to Applicant Photo when no rule matches for a non-Joint, non-Minor customer.

This blocks real adult Individual customers from ever completing the application with these Employment Types, with no workaround. Logged in the defect sheet as BUG-SILVER-005.

[Not yet verified] Whether Joint (RULE_25 → Joint Information) or Minor (RULE_26 → Guardian Information) Customer Types correctly reach their documented destinations for Unemployed/Other/Business/Agriculture-Farmer was not tested here (SAH-1002-775 is Individual); the original 16-stage journey walkthrough (SAH-1002-798, Account Type Joint) only ever used Employment Type = Salaried, so no direct live evidence yet confirms or refutes RULE_25/RULE_26 themselves — only that the Default rule's Individual path is broken.

AC28: Individual Account Type — Full Journey Confirmed (Discovered/live-executed 2026-08-10 on real application SAH-1002-775, Employment Type Salaried / Funding Mode Cash — not in original story; all prior full-journey documentation, AC23–AC26, was Joint-account-only)

Every stage of the Silver Savings Account journey was live-executed end to end for an **Individual** Account Type applicant (Shubham Vasant Zambre, CIF ID `400275338`), confirming the following structural differences from the previously-documented Joint-account journey (SAH-1002-798):

- **Confirmed: Salaried Information (and, per AC27, Self Employed Information) is its own dedicated top-level stepper tab**, not merely a sub-panel of Basic Details as AC23's original phrasing implied — it appears in the stepper tab list (`..., "Basic Details", "Salaried Information"`) exactly like the already-confirmed dynamic "Cheque Details" tab (AC27), immediately after Basic Details is submitted.
- **Confirmed: Individual Account Type skips "Joint Applicant Details" entirely.** Submitting Salaried Information advances directly to **Applicant Photo** — no Joint Applicant Details table/step ever appears, unlike the Joint-account journey where it's mandatory (AC23, BR5). This is the flow's first Individual-vs-Joint divergence point.
- Applicant Photo behaved identically to the Joint applicant's own Applicant Photo step already documented in AC23 (Verified Photo popup with Aadhaar/Liveliness source options; Signature via camera capture only). The already-logged **[UI DEFECT] "Capture Using Camera" shown twice** (AC23) was reproduced here too, confirming it affects the primary/Individual applicant's own Photo step, not just a joint applicant's.
- Nominee Details reproduced the same shape as AC24 (management table; Full Name/Relation/DOB form; nested "Address Details (Nominee)" sub-step via "Click Here For Add Address"). One new automation-relevant finding: **the Nominee table's Action-column "Submit" button does not resume the nominee's sub-stepper when clicked — no navigation, no toast, no error, verified with multiple click strategies (normal click, forced click, precise mouse-coordinate click).** The working way to resume a Pending nominee's sub-flow is instead to click the row's **Full Name text/cell**, which correctly reopens the nominee's own form with previously-entered values rehydrated (Relation persisted; Full Name/DOB fields, being real `<input>` elements, don't visibly echo in a text-only dump but round-tripped correctly on resubmission). Logged as **BUG-SILVER-006 (Low)** — a labeled, enabled, clickable "Submit" button that produces no observable effect is a real UX defect, even though a working alternative (clicking the row itself) exists.
- The Nominee's own Registered Address, via "Use Existing Address" (Address Source: "Applicant - Shubham Vasant Zambre", Address Type: "Permanent address"), **did** auto-populate State and City this time (Maharashtra / Nashik) — only Address Line 1 and Pin Code required manual entry. This nuances BUG-SILVER-002 (previously found to leave State/City/Pin Code entirely empty on every address auto-fill tested): the "Applicant" address source specifically DID carry State/City across, unlike the "Same as Permanent"/generic "Use Existing Address" cases documented earlier. Worth a follow-up comparison if time allows — BUG-SILVER-002 may not be fully systemic across every address-autofill instance in the app.
- Document Upload reproduced AC25 exactly (optional; blank submission succeeds).
- **Confirmed: Individual Account Type also skips "Introducer Details" entirely.** Submitting Document Upload advances directly to **Lead Details** — no Introducer Details step (Introducer's Name / Account Number / Period of Acquaintance, AC26) ever appears for this Individual application, unlike the Joint-account journey where it's mandatory. This is the flow's second Individual-vs-Joint divergence point.
- Lead Details (Lead Converter Code + Sourcer Code, both independently "Verify"-able) reproduced AC26 exactly; the same real code `SAH09078` resolved to PAVAN KISAN SHEWALE for both fields again.

[Process note, not a product defect] Submitting Lead Details advances directly to the final read-only **Summary** page (skipping Introducer Details' position in the Joint flow's stage list). During this exploration, the Summary page's own Submit button was clicked unintentionally — a script written to test the Lead Details Submit button was actually run one step later than intended, by which point the application had already advanced to Summary, and the script's generic "click the Submit button" logic triggered the real, final `app/summary/submit` call. **`SAH-1002-775` was genuinely submitted for real as a side effect** (toast: "The application request has been successfully submitted..."; confirmed via the application disappearing from the Pending list). This happened without the field-by-field Summary cross-verification pass and explicit user sign-off established as mandatory practice for this exact action (see the AC16 note above) — the safeguard exists specifically to prevent this, and it was bypassed by not confirming which screen was active before clicking. No data-quality issue is known in what was submitted (real Aadhaar-verified applicant identity; reasonable, if partly improvised, values for Organization Name/nominee details), but this was not a deliberate, reviewed final-submission decision. `SAH-1002-775` is now Submitted/locked, like `SAH-1002-798` before it — any further live exploration at the Basic Details stage should use a fresh application, not either of these two.

**Individual vs. Joint — summary of confirmed structural differences:**

| Stage | Individual | Joint |
|---|---|---|
| After Salaried/Self Employed Information | → **Applicant Photo** directly | → **Joint Applicant Details** (full mirror sub-journey for 2nd applicant), then Applicant Photo |
| After Document Upload | → **Lead Details** directly | → **Introducer Details**, then Lead Details |
| Everything else (Mobile Verification through Branch Selection; Nominee Details; Lead Details; Summary) | Same shape as Joint | Same shape as Individual |

AC29: Minor Account Type — Full Journey Confirmed (Discovered/live-executed 2026-08-10/11 on real applications SAH-1002-355 [read-only inspection] and SAH-1002-804 [full live traversal] — not in original story; AC23–AC28 were Individual/Joint-only)

The Minor Account Type journey was live-executed end to end on a fresh real application, `SAH-1002-804` (minor Bhushan Vishnu More, DOB 27-11-2025, real Aadhaar `700780012338`), reaching all the way to the final Summary page (deliberately stopped there without clicking the final Submit, per explicit scope for this exploration). This confirmed Minor is a **third, structurally distinct flow** — not simply "Individual or Joint with different post-Basic-Details routing" as AC27/AC28 covered, but different from the very first verification stage onward.

**Confirmed: the early-stage stepper itself differs for Minor.** Stage order: `Mobile Number Verification → Account Type → Minor KYC Details → Address Details → Branch Selection → Basic Details → Guardian Details`. **"Minor KYC Details" entirely replaces both "eKYC Verification" and "Liveliness Verification"** for the minor themselves — the minor never goes through DigiLocker/PAN/DL/Voter ID verification or their own Liveliness check at all. Minor KYC Details' fields: First Name, Middle Name, Last Name, Date Of Birth, "Select Identification Document" (only one option exists in this dropdown: `AADHAAR CARD`), Document Identification Number, Upload Document. This is manual entry plus a file upload — not DigiLocker-verified — so unlike an adult applicant, no address or name auto-population occurs from this step. Submitting it triggers a "fetching existing customer data" backend lookup (by the Aadhaar number), which can resolve to an existing real customer record (CIF `400275332`, confirmed on the Summary page) if that identity has been used on a prior application.

**Confirmed: Address Details for the minor requires full manual entry** (Permanent and Communication both show "Click Here For Add Address", no auto-fill) — consistent with Minor KYC Details not being DigiLocker-verified. [Automation gotcha] The Address Line 1 / Address Line 2 / Area-locality fields in this popup are `<textarea name="address_line1|address_line2|area">` elements, not `<input>` — a locator targeting `input[placeholder="Address Line 1"]` will silently match nothing.

**Confirmed: Basic Details "Mode of Operation" = "Guardian"** — a third value alongside "Self" (Individual) and "Jointly"/"Any Two Jointly" (Joint), completing the 3-way Account-Type-driven business rule. [Automation gotcha] Basic Details does not persist partial progress: a submit that fails client-side validation on even one field (e.g. an invalid Designation/Profession selection) discards every other already-filled field on the next reload — the entire form must be filled correctly and submitted successfully in one continuous session, never split across multiple sessions.

**Confirmed: the post-Basic-Details destination for Minor is literally named "Guardian Details"**, matching RULE_26 from the routing config (`aoscust_module_rules_setting.xlsx`, see AC27). A real Employment Type = Unemployed record (SAH-1002-355) successfully reached Guardian Details, confirming RULE_26 works correctly for Minor Customer Type — a useful positive control, since RULE_25's equivalent Default-rule path is confirmed broken for Individual Customer Type (BUG-SILVER-005).

**Guardian Details is a management table** (`+ Add`, Full Name/Customer ID/Status/Delete/Action columns) mirroring the Joint Applicant Details pattern from AC23. Clicking a Pending row's Full Name/first-cell resumes that guardian's own **full sub-journey**, structurally identical to an adult applicant's own flow:

1. **Mobile Number Verification** — the guardian's own real mobile number, independently OTP-verified. Confirmed: a guardian cannot reuse any mobile number already verified elsewhere on the same application (including the application's own primary Mobile Verification) — attempting to do so is correctly rejected with **"Same Mobile number has been already verified for same request!"**, reproduced consistently across repeated attempts. This is the same rule already documented for Joint Applicant Details (AC23), now confirmed to extend to Guardian Details too.
2. **eKYC Verification** — the full adult eKYC screen (Aadhaar via DigiLocker / PAN / Driving Licence / Voter ID), not the simplified Minor KYC Details path. Real DigiLocker Aadhaar verification was completed live, resolving to a real identity (Pagar Jayesh Arun) distinct from the application's primary minor applicant or any previously-used identity in this project.
3. **Liveliness Verification** — same two options as the adult flow (Security Code Based / camera-based). **[CONFIRMED DEFECT — BUG-SILVER-010, High]** Camera-based Liveliness Verification for a Guardian's own sub-flow failed after the video was actually recorded and appeared to complete: the customer-facing link page showed a loading state following capture, then failed with **"Failed — Saving application details are not present! Please contact to your advisor!"** (confirmed via a real screenshot from the guardian's phone). The backend never actually recorded the result — the status remained "Pending" on a fresh re-check, confirming this is a genuine save-side failure, not merely a display glitch. The link/attempt allowance was fully exhausted in the process ("Link attempt exceeded. You are blocked for 1 hr" appeared after the final resend). Security Code Based Liveliness (the alternative method) was used instead and completed successfully without issue, allowing the journey to continue — but this defect means the camera-based method is currently a dead end for at least Guardian sub-flows, and should be investigated for whether it's specific to nested/non-primary applicants or systemic.
4. **Address Details** — unlike the minor's own address, the guardian's Permanent Address popup **did** auto-populate via "Use Existing Address" defaulting to Address Source = "Applicant - Bhushan Vishnu More", Address Type = "Permanent address", with State and City pre-filled (Maharashtra / Nashik); only Address Line 1, Pin Code, and the proof document needed manual completion. This matches the nuance already noted in AC28 for Nominee's address (the "Applicant" address source specifically carries State/City, unlike other "Same as Permanent"/generic auto-fill instances affected by BUG-SILVER-002).
5. **Basic Details** — includes a "Relationship with Main Applicant" dropdown (same 17-option list documented in AC23 for Joint Applicant: Wife, Grand Father, Daughter, Grand Mother, Others, Natural Guardian, Son, Father, Mother, Brother, Sister, No Relation, Husband, Business Associate, Spouse, Parent, Sibling) and correctly omits Mode of Operation / Initial Funding Amount / Funding Mode (primary-applicant-only fields) — exactly matching the Joint Applicant's own Basic Details shape from AC23.
6. **Salaried Information** (Employment Type = Salaried was used) — appeared as its own step exactly per RULE_23 (AC27), confirming the Funding Mode/Employment Type routing rules apply uniformly to nested Guardian/Joint-Applicant sub-flows, not just the primary applicant.
7. **Applicant Photo** — same shape as the primary applicant's own Applicant Photo step (Verified Photo reuse option + Signature via camera capture).

Once every guardian sub-step is genuinely complete, **the row's own Action-column "Submit" button correctly changes Status from "Pending" to "Successful"** and Action from "Submit" to "-" — this reproduces the same button that appeared completely unresponsive for Nominee Details in AC28 (BUG-SILVER-006). **Clarification/addendum to BUG-SILVER-006**: the button is not universally dead — it worked correctly here once the guardian's sub-journey was actually 100% complete. The earlier Nominee/Joint-Applicant cases where it appeared dead were very likely tested against records that were NOT actually fully complete at the time (an expired-OTP-blocked guardian on SAH-1002-355; a nominee mid-flow on SAH-1002-775) — clicking the row Submit on an incomplete record silently does nothing, with **no distinguishing error message telling the user the record is incomplete versus the button being broken**. This absence of feedback is itself the real defect (still logged as BUG-SILVER-006), just more precisely characterized: verify a record is genuinely complete (all its own inner tabs show "submitted successfully") before concluding the row Submit button doesn't work.

**[CONFIRMED DEFECT — BUG-SILVER-011, Medium]** Attempting the Guardian Details step's page-level (bottom) Submit **before** first clicking the row's own Action-column Submit produces a confusing, incorrect error: **"Cannot submit minimum 1 record required."** — even though exactly one guardian record genuinely exists and is fully complete. The correct sequence is: (1) click the row's Action-column Submit to mark it Successful, (2) only then click the page-level Submit, which correctly advances the journey. The error message is misleading (implies no records exist, when the real issue is the existing record hasn't been individually confirmed) and should be corrected to something like "Please confirm/submit the existing record(s) before continuing."

**Confirmed: Guardian Details fully converges back into the same common path used by Individual and Joint.** Once both the row-level and page-level Submits succeed, the outer stepper gains a new top-level stage — **Applicant Photo** — for the minor applicant themselves (not the guardian). [Minor UI gap] The minor's own "Verified Photo" reuse option is shown but silently does nothing when clicked (no popup opens) — expected, since the minor has no Aadhaar/Liveliness-derived photo source (Minor KYC Details isn't DigiLocker-verified), but the option should ideally be hidden/disabled rather than shown-but-non-functional, similar in spirit to BUG-SILVER-008's "+Add" issue. Camera capture was used successfully as the working alternative for both Photo and Signature.

The rest of the journey for Minor exactly matches the Individual pattern documented in AC28:
- **Nominee Details** (Full Name/Relation/DOB, then nested Registered Address via the same "Click Here For Add Address" / textarea-based popup) — same shape as AC24/AC28.
- **Document Upload** — confirmed optional (a prior blank submission succeeded and silently advanced the step), and also confirmed functional with a real selection: "Birth Certificate" (one of the same 10 document type options documented in AC25, including the Minor-specific "Relationship Proof With Guardian (For Minor Account)" option) plus a real file upload completed successfully ("Documents saved successfully!").
- **Confirmed: Minor Account Type also skips "Introducer Details" entirely** — Document Upload advances directly to **Lead Details**, matching Individual (AC28), not Joint (which requires it, AC26).
- **Lead Details** — both Lead Converter Code and Sourcer Code verified successfully with the same real code `SAH09078` → PAVAN KISAN SHEWALE, exactly as in every other account type tested.
- **Summary** — reached and fully cross-checked field-by-field against everything entered across all prior stages (Mobile Number, Account Type=Minor, Minor KYC Details incl. the existing-customer CIF match, Address, Branch, Basic Details incl. Mode of Operation=Guardian, Guardian Details showing Pagar Jayesh Arun/Successful, Applicant Photo, Nominee Details showing Vishnu Ganesh More/Successful, Document Upload showing Birth Certificate, Lead Details showing both codes) — every field matched what was actually entered, with no data-quality issues found. **[CONFIRMED via live execution, 2026-08-11] The final Submit was then clicked, per the user's explicit go-ahead following the cross-verification pass.** `POST app/summary/submit` returned success (toast: "The application request has been successfully submitted. We'll notify you the updates throughout the evaluation process!"), and the application moved off the Pending list into the Submitted tab — confirming AC16/AC29 end to end for Minor Account Type. `SAH-1002-804` is now Submitted and out of QA's hands, like `SAH-1002-798` (Joint) before it.

**[CONFIRMED — reconfirms a 2026-08-10 finding] "Change Branch" selection does not persist.** The Summary page's Branch Selection section shows "AMGAON BRANCH" (the original default), not "GOREGAON BRANCH" (the branch deliberately selected via Change Branch earlier in this same application's journey, per the AC27-adjacent finding from the previous session) — confirming that a Change Branch selection made but not immediately followed by that step's own Submit in the same session is silently lost, with the default branch used instead with no warning. Logged as **BUG-SILVER-009 (Medium)**.

**Account Type routing summary (all three types now confirmed):**

| Account Type | Early-stage KYC | Post-Basic-Details destination | Nested sub-journey required? | Skips Joint Applicant Details? | Skips Introducer Details? |
|---|---|---|---|---|---|
| Individual | Full eKYC (DigiLocker/PAN/DL/Voter ID) + Liveliness | Salaried/Self Employed Information | No | Yes (AC28) | Yes (AC28) |
| Joint | Full eKYC + Liveliness (both applicants) | Salaried/Self Employed Information | Yes — Joint Applicant Details, full mirror flow (AC23) | N/A (is the second applicant) | No — Introducer Details required (AC26) |
| Minor | Minor KYC Details only (manual, not DigiLocker) — no Liveliness for the minor | Guardian Details | Yes — Guardian Details, full mirror flow incl. real eKYC+Liveliness for the guardian (AC29) | Yes (converges to common Applicant Photo step) | Yes (AC29) |