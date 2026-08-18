User Story: Normal Savings Account Application (Joint)

AC1: User Login
GIVEN the user enters valid Branch Origination Officer credentials WHEN login is successful THEN the user should land on the Home dashboard AND the role-configured side menu, dashboard, alerts and notifications indicators should load without errors.
GIVEN invalid, incomplete or expired login details are entered WHEN the user attempts login THEN the system should display the configured validation or authentication error AND should not create or open an application.

AC2: Home Dashboard and Savings Application Navigation
GIVEN the user is on the Home dashboard WHEN the user selects Savings Application or New Application from the role-configured navigation THEN the new-application journey should open successfully AND only products, schemes and activities permitted for the user role should be available.
AND the Home navigation, New Application navigation, Application History and Unposted navigation should remain functional AND the user should be able to return without losing already saved draft data.

AC3: New Application Product, Scheme and Activity Selection
GIVEN the new-application screen is open THEN the system should display the configured product selection, scheme selection, activity/process selection and action buttons.
WHEN the user selects Savings Account THEN only compatible schemes should be available AND Normal Savings Account - 1001 should be selectable when assigned to the user and branch.
WHEN the user uses a product or scheme search/filter or dropdown THEN matching configured values should be displayed AND an incompatible, inactive or unavailable scheme should not be selectable.
WHEN the user selects Normal Savings Account - 1001 and the configured activity THEN the selected values should remain visible in the application context AND mandatory setup validation should occur before the application is created.

AC4: Mobile Number Verification and OTP Send
GIVEN Normal Savings Account - 1001 is selected WHEN the Mobile Number Verification screen is displayed THEN the mobile-number field, verification status, Send Verification Code action and configured navigation controls should be visible.
WHEN the mobile number is blank, invalid, unsupported or fails a duplicate/eligibility validation THEN the system should display the configured error message AND should not send a verification code.
WHEN a valid mobile number is entered and the user clicks Send Verification Code THEN the system should initiate the configured OTP journey AND should display the configured send, resend, expiry or failure message and status.
WHEN the user clicks resend after the configured resend condition is met THEN the OTP should be resent AND the UI should show the current OTP/verification status without exposing the OTP value.

Your current AC covers the basic OTP verification flow well. Below are the **additional acceptance criteria and edge cases** that should be included to make the OTP verification comprehensive.

---

## AC5: OTP Verification

**GIVEN** an OTP has been sent

**WHEN** the OTP Verification screen is displayed

**THEN**

* The registered mobile number shall be displayed.
* OTP input field shall be visible and editable.
* Submit/Verify button shall be visible.
* Resend OTP option shall be visible.
* OTP validity timer shall be displayed.
* Resend countdown timer shall be displayed (where applicable).
* Previous and Next navigation controls shall be visible and functional.

---

### OTP Field Validation

**WHEN** the OTP field is left blank and the user clicks **Submit/Verify**

**THEN** the system shall display the configured mandatory field validation message.

---

**WHEN** the entered OTP contains fewer digits than the configured OTP length

**THEN** the system shall display the configured validation message and shall not allow verification.

---

**WHEN** the entered OTP contains more digits than the configured OTP length

**THEN** the system shall restrict additional input or display the configured validation message.

---

**WHEN** the OTP contains alphabetic or special characters

**THEN** only numeric values shall be accepted (or the configured validation message shall be displayed).

---

**WHEN** the OTP contains leading or trailing spaces

**THEN** the spaces shall be ignored or validation shall follow the configured business rules.

---

### Invalid OTP

**WHEN** an incorrect OTP is entered

**THEN**

* Verification shall fail.
* The configured "Invalid OTP" message shall be displayed.
* Mobile number shall remain unverified.
* User shall be allowed to retry until the configured maximum attempts are reached.

---

### Expired OTP

**WHEN** the OTP validity period expires

**THEN**

* OTP shall become invalid.
* Verification shall fail.
* Appropriate expiry message shall be displayed.
* User shall be required to request a new OTP.

---

### OTP Attempts

**WHEN** the user enters incorrect OTPs repeatedly

**THEN**

* Remaining attempts shall decrease accordingly.
* Remaining attempt count shall be displayed (if configured).
* After the maximum failed attempts are reached:

  * OTP verification shall be blocked.
  * Appropriate error message shall be displayed.
  * User shall be required to request a new OTP or follow the configured business rules.

---

### Resend OTP

**WHEN** the user clicks **Resend OTP** after the countdown timer expires

**THEN**

* A new OTP shall be generated.
* Previous OTP shall become invalid.
* OTP validity timer shall restart.
* Resend countdown timer shall restart.
* Success message shall be displayed.

---

**WHEN** the user clicks **Resend OTP** before the resend timer expires

**THEN**

* Resend request shall not be processed.
* Appropriate validation message shall be displayed.

---

### Mobile Number Change

**WHEN** the user clicks **Change Mobile Number**

**THEN**

* User shall be allowed to update the mobile number.
* OTP verification process shall restart for the new mobile number.
* Previously generated OTP shall become invalid.

---

### Successful Verification

**WHEN** the correct OTP is entered and the user clicks **Submit/Verify**

**THEN**

* Mobile verification shall complete successfully.
* Verification success message shall be displayed.
* Verified mobile number shall be retained for the application.
* Verification status shall be updated.
* User shall be allowed to proceed to the next step of the application.

---

### Navigation Validation

**WHEN** the user clicks **Previous**

**THEN**

* User shall navigate to the previous application step.
* Previously entered information shall be retained.

---

**WHEN** the user clicks **Next** (after successful verification)

**THEN**

* User shall be navigated to the next application step.

---

### Session & Refresh Validation

**WHEN** the page is refreshed before OTP verification is completed

**THEN**

* OTP validity shall follow the configured business rules.
* Countdown timer shall remain accurate.
* User shall not lose application data.

---

### UI Validation

Verify that:

* Mobile number is displayed correctly.
* OTP input field is properly aligned.
* Timer updates correctly every second.
* Resend OTP button changes state appropriately.
* Remaining attempts are displayed correctly (if configured).
* Success, warning, and error messages are displayed correctly.
* No UI overlap, truncation, or layout issues are present.

---

# User Story: Verify Applicant & Customer Information – eKYC Verification Workflow

**User Story ID:** US_HOME_003
**Module:** Savings Application – Applicant & Customer Information (eKYC Verification)
**Priority:** High
**Role:** Registered User

---

# User Story

**As a** registered user,

**I want** to complete the eKYC verification process using the available identity verification options,

**So that** my identity can be successfully verified before proceeding with the Savings Account application.

---

# Pre-Conditions

* User is successfully logged in.
* User has opened an existing Savings Application.
* Mobile Number Verification is completed successfully.
* Account Type selection is completed.
* User is navigated to the **Applicant & Customer Information (eKYC Verification)** step.

---

# Test Data

* Valid Mobile Number
* Valid Aadhaar linked with DigiLocker
* Valid PAN Number
* Valid PAN Image (PNG/JPG/PDF)
* Valid Driving Licence Number
* Valid Driving Licence Document
* Valid Voter ID Number
* Valid Voter ID Document

---

# Acceptance Criteria

---

# AC1: eKYC Verification Screen

**GIVEN** the user reaches the Applicant & Customer Information step

**WHEN** the eKYC Verification page loads

**THEN** the following verification modules shall be displayed:

* Aadhaar Verification through DigiLocker *
* PAN Verification
* Driving Licence Verification
* Voter ID Verification

And

* All verification cards shall be visible.
* All cards shall be clickable.
* Verification status shall be displayed for every verification.
* Previous and Next navigation buttons shall be enabled.
* Submit button shall remain disabled until all mandatory verification requirements are completed successfully.

---

# AC2: Aadhaar Verification through DigiLocker

**WHEN** the user clicks **Aadhaar Verification through DigiLocker**

**THEN**

A DigiLocker popup shall open displaying:

* Registered Mobile Number (pre-filled)
* Information message
* Cancel button
* Send Link button

The following informational message shall be displayed:

> The link will be sent to the customer. They must grant access to their DigiLocker documents to proceed with eKYC.

---

# AC3: Send DigiLocker Link

**WHEN** the user clicks **Send Link**

**THEN**

* Verification link shall be sent to the registered mobile number.
* Success message shall be displayed.
* Verification attempt count shall decrease according to business rules.
* Link validity timer shall start.
* Verification status shall become **Pending**.

---

# AC4: DigiLocker Verification Timer

After sending the verification link,

The screen shall display:

* Link successfully sent message
* Registered Mobile Number
* Link Validity Remaining timer
* Resend Link option

Verify

* Timer starts from **30 minutes**
* Countdown updates correctly
* Timer expires after configured duration
* Expired link becomes invalid

---

# AC5: Resend Link

Verify:

* Resend Link is clickable.
* Clicking Resend generates a new verification link.
* Previous link becomes invalid.
* Timer resets to 30 minutes.
* Appropriate success message is displayed.
* Remaining attempts are updated.

---

# AC6: DigiLocker Verification Attempts

Verify

User is allowed a maximum of **3 verification attempts**.

For each attempt:

* Remaining attempts are displayed.
* Link validity is 30 minutes.
* Attempt count decreases after every verification request.
* Appropriate message is displayed when maximum attempts are exhausted.
* Additional verification requests shall not be allowed after all attempts are consumed.

---

# AC7: Manual Assisted DigiLocker Verification

Since Aadhaar verification is completed manually by the customer,

Verify:

* Application remains in Pending state until DigiLocker verification is completed.
* System periodically checks verification status.
* Refresh button updates verification status.
* Verification status updates automatically once verification is completed.

---

# AC8: DigiLocker Verification Status

The following status values shall be supported:

* Pending
* Successful
* Failed

Verify

### Pending

* Link sent
* Awaiting customer action

### Successful

* Customer completes DigiLocker authentication
* Aadhaar verification completes successfully
* Success indicator is displayed

### Failed

* Customer rejects verification
* Verification expires
* Verification fails due to service failure
* Appropriate error message is displayed

---

# AC9: PAN Verification Entry Screen

**WHEN** the user opens PAN Verification

**THEN** the following fields shall be displayed:

* PAN Number *
* Upload PAN Image *
* Browse File
* Drag & Drop Upload
* Capture Using Camera
* Submit button

---

# AC10: PAN Validation

Verify

PAN Number

* Mandatory
* Valid PAN format
* Invalid PAN displays validation
* Duplicate or invalid PAN displays configured error

PAN Image

* Mandatory
* Supports Browse
* Supports Drag & Drop
* Supports Camera Capture
* Accepts supported file formats
* Rejects unsupported formats
* Rejects oversized files

---

# AC11: Successful PAN Verification

**WHEN**

User enters valid PAN details and uploads a valid PAN image

**THEN**

System shall verify PAN successfully.

User shall be redirected to PAN Details page displaying:

* PAN Number
* Uploaded Image View icon
* Green Verification Tick
* Change PAN Number link
* First Name
* Middle Name
* Last Name
* Date of Birth

All retrieved information shall be pre-filled from the verified PAN record.

---

# AC12: View Uploaded PAN Image

Verify

* Uploaded image icon is displayed.
* Clicking the icon opens the uploaded PAN document.
* User can view the uploaded image.
* Uploaded image matches the submitted document.

---

# AC13: Change PAN Number

**WHEN** user clicks **Change PAN Number**

**THEN**

* User returns to PAN Verification page.
* Existing PAN details can be replaced.
* User can upload a new PAN image.
* Previous PAN verification becomes invalid.
* New verification process starts.

---

# AC14: PAN Verification Status

After successful verification,

PAN Verification module shall display

**Successful**

Clicking the PAN module again shall display:

* PAN Verification submitted successfully
* Verified PAN information
* Uploaded PAN document
* Verification status

---

# AC15: Driving Licence Verification

**WHEN** user selects Driving Licence Verification

**THEN**

Popup shall display:

* Driving Licence Number *
* Date of Birth *
* Upload Driving Licence
* Browse
* Drag & Drop
* Capture Using Camera
* Cancel
* Verify

Verify

* Mandatory validations
* Driving Licence format validation
* Document upload validation
* Camera capture
* Successful verification
* Failed verification
* Verification status updates
* Submitted details are viewable after successful verification

---

# AC16: Driving Licence Verification Status

Supported statuses

* Pending
* Successful
* Failed

Clicking Successful status shall display submitted Driving Licence details.

---

# AC17: Voter ID Verification

**WHEN** user selects Voter ID Verification

**THEN**

Popup shall display

* Voter ID Number *
* Upload Voter ID
* Browse
* Drag & Drop
* Capture Using Camera
* Cancel
* Verify

Verify

* Mandatory validations
* Valid Voter ID format
* Document upload
* Camera capture
* Successful verification
* Failed verification
* Verification status update

---

# AC18: Voter ID Verification Status

Supported statuses

* Pending
* Successful
* Failed

Clicking Successful status shall display submitted Voter ID details.

---

# AC19: Submit Button Validation

Verify

* Submit button remains disabled until all mandatory verification requirements are completed successfully.
* Submit button becomes enabled only after:

  * Aadhaar Verification through DigiLocker is Successful.
  * PAN Verification is Successful.
* Optional verifications (Driving Licence and Voter ID), if not mandatory per business rules, shall not block submission.
* Clicking Submit saves the eKYC verification details successfully and navigates the user to the next application step.

---

# AC20: Navigation Validation

Verify

* Previous button navigates to Account Type step.
* Next button navigates to the next workflow step after successful submission.
* Previously entered data is retained when navigating between steps.

---

# AC21: Refresh Validation

Verify

* Refresh button reloads verification status.
* Updated verification results are reflected immediately.
* No duplicate verification requests are created during refresh.

---

# AC22: Error Handling

Verify the system displays appropriate messages for:

* Invalid PAN Number
* Invalid Driving Licence Number
* Invalid Voter ID Number
* Invalid document upload
* Unsupported file format
* File size exceeded
* Network failure
* DigiLocker service unavailable
* Verification timeout
* Maximum attempts exhausted
* Session timeout

---

# AC23: UI Validation

Verify that:

* All verification modules are aligned correctly.
* Status badges (Pending, Successful, Failed) are clearly visible.
* Verification popups are centered and responsive.
* Mandatory fields are marked with an asterisk (*).
* Upload controls, buttons, and icons are displayed correctly.
* Timers and attempt counters update in real time.
* Success, warning, and error messages follow the application design guidelines.
* No UI overlap, truncation, or layout issues occur across supported browsers and screen resolutions.

---



You can add the following acceptance criteria to cover the **Action Required** scenario for DigiLocker verification.

---

## AC9: DigiLocker Action Required Validation

**GIVEN** the customer has opened the DigiLocker verification link

**WHEN** one or more mandatory documents are not shared through DigiLocker

**THEN**

* Aadhaar Verification status shall be updated to **Action Required**.
* The verification card shall display the **Action Required** status badge.
* The user shall not be allowed to complete the Aadhaar verification.
* The application shall remain in the current eKYC step.

---

## AC10: Action Required Popup

**WHEN** the user clicks the **Action Required** status on the Aadhaar Verification card

**THEN** a popup shall be displayed containing:

* Document Name
* Mandatory (Yes/No)
* Uploaded Status
* Refresh button
* Resend Link button
* Done button
* Close (X) button

The popup shall clearly indicate:

* Mandatory documents not uploaded.
* Successfully uploaded documents.
* Missing mandatory documents.

---

## AC11: Mandatory Document Validation

Verify the popup correctly displays the upload status.

Example:

| Document        | Mandatory | Uploaded     |
| --------------- | --------- | ------------ |
| Digital Aadhaar | Yes       | Not Uploaded |
| APAAR ID        | No        | Uploaded ✓   |

Verify:

* Mandatory documents missing shall be clearly indicated.
* Optional documents shall not prevent completion.
* Uploaded documents shall display a success indicator.

---

## AC12: Resend Verification Link

**WHEN** the user clicks **Resend Link**

**THEN**

* A new DigiLocker verification link shall be sent to the registered mobile number.
* Previous verification link shall become invalid.
* Link validity timer shall restart.
* Remaining attempts shall be updated according to business rules.
* Success message shall be displayed.

---

## AC13: Manual Refresh Verification

Since DigiLocker verification is completed externally,

**WHEN** the customer uploads the missing mandatory document(s) through DigiLocker

**AND** the application user clicks the **Refresh** button

**THEN**

* System shall fetch the latest verification status from DigiLocker.
* Uploaded document status shall be updated.
* Mandatory document shall display **Uploaded ✓**.
* Verification status shall update accordingly.

---

## AC14: Successful Completion After Refresh

**WHEN** all mandatory DigiLocker documents are successfully uploaded

**AND** the user clicks the **Refresh** button

**THEN**

* All mandatory documents shall display **Uploaded ✓**.
* Aadhaar Verification status shall change from **Action Required** to **Successful**.
* The **Done** button shall become enabled (if not already enabled).
* Clicking **Done** shall close the popup.
* User shall return to the eKYC Verification page.
* Aadhaar Verification card shall display **Successful** status.

---

## AC15: Incomplete Verification

**WHEN** mandatory documents are still missing after refresh

**THEN**

* Verification status shall remain **Action Required**.
* Popup shall remain open.
* Missing document(s) shall continue to be highlighted.
* User may click **Resend Link** again, subject to the configured attempt limit.

---

These acceptance criteria complete the DigiLocker workflow by covering:

* **Pending** → Link sent
* **Action Required** → Mandatory documents missing
* **Refresh** → Synchronize document status
* **Successful** → All mandatory documents uploaded
* **Failed/Attempts Exhausted** → Maximum retries or verification failure

Based on your requirements and the screenshots, here is a structured **User Story with Acceptance Criteria** for the **Liveliness Verification** module.

---

# User Story: Verify Liveliness Verification Process

**User Story ID:** US_EKYC_005
**Module:** eKYC – Liveliness Verification
**Priority:** High
**Role:** Registered User

---

# User Story

**As a** registered user,

**I want** to complete at least one liveliness verification process,

**So that** my application can proceed to the Address Details stage.

---

# Pre-Conditions

* User is logged into the application.
* Mobile Number Verification is completed.
* Account Type is selected.
* eKYC verification is successfully completed.
* User is redirected to the **Liveliness Verification** page.

---

# Liveliness Verification Screen

The page shall display two verification options:

1. Security Code Based Liveliness Verification
2. Liveliness Verification

A **Submit** button shall be available.

---

# Acceptance Criteria

## AC-01: Display Verification Options

**Given**
User has successfully completed Aadhaar/eKYC verification

**When**
The application redirects to the next step

**Then**

* Liveliness Verification page shall open.
* Two verification options shall be displayed:

  * Security Code Based Liveliness Verification
  * Liveliness Verification
* Submit button shall be displayed.

---

## AC-02: Validation on Submit

**Given**
User has not completed any liveliness verification

**When**
User clicks **Submit**

**Then**

Display validation message:

> Please complete at least one Liveliness Verification process.

User shall remain on the same page.

---

# Security Code Based Liveliness Verification

## AC-03: Open Guidelines Popup

**When**
User clicks **Security Code Based Liveliness Verification**

**Then**
A popup shall open displaying:

### Guidelines For Liveliness Check

1. Prepare a white sheet of paper and a pen.
2. Write the provided Security Code clearly.
3. Hold the paper so the Security Code is clearly visible.
4. Use the verification camera to capture your photograph with the Security Code visible.

Buttons:

* Cancel
* Send Link

---

## AC-04: Send Verification Link

**Given**
User clicks **Send Link**

**Then**

* Verification link shall be sent to the registered mobile number.
* Success message shall be displayed.

Example:

> A verification link for Security Code Based Liveliness Verification has been sent to customer on XXXXXXXXXX.

Popup shall display:

* Link Validity Remaining
* Countdown timer
* Resend Link timer

Example

```
Link Validity Remaining
28 Min 07 Sec

Resend Link After
03 Min 37 Sec
```

---

## AC-05: Manual Assisted Verification

After the verification link is sent:

* Verification shall be completed externally by the customer.
* Application status shall remain **Pending**.
* System shall periodically check verification status.
* Refresh button shall allow manual status update.
* Once verification is completed successfully:

  * Status shall automatically update to **Verified**.
  * Verification section shall be marked as completed.

---

# Liveliness Verification

## AC-06: Open Guidelines Popup

**When**
User clicks **Liveliness Verification**

**Then**

Popup shall display:

### Guidelines For Liveliness Check

1. Keep your mobile device ready.
2. Speak clearly during verification.
3. Dress appropriately.
4. Ensure sufficient lighting.
5. Maintain a stable internet connection.

Buttons:

* Cancel
* Send Link

---

## AC-07: Send Verification Link

**Given**
User clicks **Send Link**

**Then**

System shall:

* Send verification link to the registered mobile number.
* Display confirmation message.

Example

> A verification link for Liveliness Verification has been sent to customer on XXXXXXXXXX.

Popup shall display:

* Link validity countdown
* Resend timer

Example

```
Link Validity Remaining
28 Min 07 Sec

Resend Link After
03 Min 37 Sec
```

---

## AC-08: Pending Verification

Until verification is completed:

* Application status shall remain **Pending**.
* Background polling shall periodically verify the status.
* User may click the **Refresh** button to manually fetch the latest verification status.
* Upon successful verification:

  * Status shall update to **Verified**.
  * Verification step shall be marked complete.

---

# AC-09: Successful Completion

**Given**
User successfully completes either:

* Security Code Based Liveliness Verification

**OR**

* Liveliness Verification

**When**
Verification status becomes **Verified**

**Then**

* The completed verification option shall display a success status.
* User shall be allowed to click **Submit**.
* On clicking **Submit**, the application shall redirect to the **Address Details** page.

---

# Business Rules

* Completing **either one** of the two liveliness verification methods is sufficient.
* Both methods are **not mandatory**.
* Verification links shall be sent only to the registered mobile number.
* Application shall remain in **Pending** state until verification is completed.
* Verification status shall be updated automatically through periodic polling.
* Refresh button shall allow users to manually update the verification status.
* Resend Link shall remain disabled until the countdown timer expires.
* Submit shall remain blocked until at least one verification method is successfully completed.
* Upon successful verification and clicking **Submit**, the user shall be redirected to the **Address Details** page.


# User Story: Verify Address Details

**User Story ID:** US_EKYC_006
**Module:** Address Details
**Priority:** High
**Role:** Registered User

---

# User Story

**As a** registered user,

**I want** to verify my permanent address and provide my communication address,

**So that** I can proceed to the Branch Selection step of the account opening process.

---

# Pre-Conditions

* User is logged into the application.
* Mobile Number Verification is completed.
* Account Type is selected.
* eKYC Verification is completed.
* At least one Liveliness Verification method is successfully completed.
* User clicks **Submit** on the Liveliness Verification page.

---

# Acceptance Criteria

## AC-01: Navigate to Address Details

**Given**
The user successfully completes the Liveliness Verification step

**When**
The user clicks **Submit**

**Then**

* The application shall redirect to the **Address Details** page.
* The Address Details step shall be highlighted as the active step.

---

## AC-02: Display Permanent Address

**Given**
The Address Details page is opened

**Then**

The page shall display:

* **Permanent Address** (Mandatory)

The permanent address shall be automatically populated using the verified address received from the previous verification steps (DigiLocker/eKYC and Liveliness Verification).

Example:

```
BHAKSHI ROAD,
Baglan,
Satana,
Baglan,
Nashik,
Maharashtra,
India - 423301
```

The permanent address:

* Shall be displayed in read-only mode.
* Shall not be editable by the user.

---

## AC-03: Display Communication Address Section

The page shall display:

* **Communication Address** (Mandatory)

Initially, the section shall display:

> Click Here For Add Address

---

## AC-04: Open Communication Address Popup

**Given**
User clicks **Click Here For Add Address**

**Then**

A popup titled **Communication Address** shall open.

The popup shall contain:

* Same as Permanent Address (Checkbox)
* Address Line 1 *
* Address Line 2
* Area / Locality
* Country *
* State *
* City *
* Pin Code *
* Upload Address Proof
* Browse Computer / Drag & Drop
* Supported formats:

  * PNG
  * JPG
  * PDF
  * Camera Capture
* Cancel button
* Submit button

---

## AC-05: Same as Permanent Address

**Given**
The Communication Address popup is opened

**When**
User selects **Same as Permanent Address**

**Then**

The following fields shall be automatically populated using the Permanent Address:

* Address Line 1
* Address Line 2 (if available)
* Area / Locality
* Country
* State
* City
* Pin Code

The populated values shall be editable by the user if business rules allow.

---

## AC-06: Manual Communication Address Entry

**Given**
User does not select **Same as Permanent Address**

**When**
User enters the communication address manually

**Then**

The following mandatory fields shall be validated:

* Address Line 1
* Country
* State
* City
* Pin Code

Optional fields:

* Address Line 2
* Area / Locality

---

## AC-07: Address Proof Upload

The Communication Address popup shall allow the user to upload address proof.

Supported file types:

* PNG
* JPG
* PDF
* Camera Capture

The selected file name shall be displayed after upload.

---

## AC-08: Communication Address Validation

**Given**
User clicks **Submit** without completing mandatory fields

**Then**

The system shall:

* Highlight the mandatory fields.
* Display appropriate validation messages.
* Prevent submission until all required information is provided.

---

## AC-09: Save Communication Address

**Given**
All mandatory details are entered successfully

**When**
User clicks **Submit** on the Communication Address popup

**Then**

* Communication Address shall be saved successfully.
* Popup shall close.
* Saved Communication Address shall be displayed on the Address Details page.

---

## AC-10: Submit Address Details

**Given**
Permanent Address is available and Communication Address has been successfully added

**When**
User clicks **Submit** on the Address Details page

**Then**

* Address Details shall be saved successfully.
* User shall be redirected to the **Branch Selection** page.

---

# Business Rules

* Permanent Address shall be fetched from the verified DigiLocker/eKYC and Liveliness Verification data.
* Permanent Address shall be read-only and cannot be modified by the user.
* Communication Address is mandatory.
* Selecting **Same as Permanent Address** shall auto-populate all applicable address fields.
* If **Same as Permanent Address** is not selected, the user must manually enter all mandatory communication address fields.
* Address proof upload shall support **PNG, JPG, PDF, and Camera Capture**.
* Communication Address must be successfully saved before proceeding.
* Clicking **Submit** on the Address Details page shall redirect the user to the **Branch Selection** page only after successful validation and save.

---

# User Story: Branch Selection

**User Story ID:** US_BRANCH_001
**Module:** Branch Selection
**Priority:** High
**Role:** Applicant

---

# User Story

**As an** applicant,

**I want** to view the default assigned branch and have the ability to change it,

**So that** I can select the preferred bank branch before proceeding with the account opening process.

---

# Pre-Conditions

* User has successfully completed:

  * Mobile Number Verification
  * Account Type Selection
  * eKYC Verification
  * Liveliness Verification
  * Address Details
* User clicks **Submit** on the Address Details page.
* System redirects to the **Branch Selection** page.

---

# Acceptance Criteria

## AC1: Navigate to Branch Selection

**Given** the applicant successfully submits the Address Details

**When** the submission is successful

**Then**

* System shall redirect to the **Branch Selection** page.
* Branch Selection step shall become active in the progress indicator.

---

## AC2: Display Default Branch

**Given** the Branch Selection page is opened

**Then** the system shall display the default assigned branch including:

* Branch Name
* Branch ID
* Branch Address
* Selected status indicator

Example:

* Branch Name: **ASSET2 BRANCH**
* Branch ID: **1081**
* Address:

  > IN FRONT OF SAHAYOG HOSPITAL NEAR AVANTI, Gondiya, Maharashtra

---

## AC3: Change Branch

**Given** a default branch is displayed

**When** the applicant clicks **Change Branch**

**Then**

* System shall display the complete list of available branches.
* Previously selected branch shall remain highlighted until another branch is selected.

---

## AC4: Branch List

The branch list shall display:

* Branch Name
* Branch Address
* Branch ID
* Selected state

Each branch shall be displayed as a selectable card.

---

## AC5: Search Branch

**Given** the branch list is displayed

**When** the applicant enters text in the Search box

**Then**

* Branch list shall filter dynamically.
* Search shall support:

  * Branch Name
  * Branch ID
  * Branch Address

---

## AC6: Scrollable Branch List

If multiple branches are available:

* Vertical scrolling shall be available.
* User shall be able to scroll until the last branch.
* Performance shall remain smooth while scrolling.

---

## AC7: Select Branch

**Given** the branch list is displayed

**When** the applicant selects another branch

**Then**

* Previously selected branch shall be deselected.
* Newly selected branch shall become active.
* Only one branch can be selected at a time.

---

## AC8: Submit Selected Branch

**Given** a branch is selected

**When** the applicant clicks **Submit**

**Then**

* Selected branch shall be saved.
* Application shall proceed to the next step.
* User shall be redirected to the **Basic Details** page.

---

## AC9: Back Button

**Given** the Branch Selection page is displayed

**When** the applicant clicks **Back**

**Then**

* User shall be redirected to the **Address Details** page.
* Previously entered address information shall remain unchanged.

---

# Validation Scenarios

### Default Branch

* Default branch is displayed correctly.
* Branch ID is visible.
* Branch address is displayed correctly.

### Search

* Search by Branch Name.
* Search by Branch ID.
* Search by Address.
* Partial search.
* Case-insensitive search.
* No matching records.

### Branch Selection

* Select another branch.
* Change selection multiple times.
* Only one branch selected.
* Selected branch highlighted.

### Scrolling

* Scroll to middle.
* Scroll to last record.
* Large branch list loads correctly.

### Navigation

* Submit redirects to Basic Details.
* Back returns to Address Details.
* Progress indicator updates correctly.

---

# Expected Flow

```
Address Details
        │
        ▼
Branch Selection
        │
        ├── Default Branch Displayed
        │
        ├── Change Branch
        │       │
        │       ├── Search Branch
        │       ├── Scroll Branch List
        │       └── Select Branch
        │
        ▼
Submit
        │
        ▼
Basic Details Page
```
----------------------

Based on the Basic Details page and field requirements you shared, here is a structured **User Story with Acceptance Criteria**.

---

# Updated User Story: Basic Details (AC18)

## User Story

**As a** Savings Account applicant,

**I want** to enter my personal, demographic, employment, funding, and financial information,

**So that** the application can determine the correct onboarding workflow and route me to the appropriate next module based on the configured business rules.

---

# Acceptance Criteria

## AC18.1: Verify Basic Details Page

**Given**

* The applicant has successfully completed the **Branch Selection** step.

**When**

* The application redirects to the **Basic Details** page.

**Then**

* The Basic Details form shall be displayed.
* Applicant information fetched from previous steps (First Name, Middle Name, Last Name, Full Name, Date of Birth) shall be prefilled where applicable.
* Mandatory fields shall be marked with an asterisk (*).
* Search-enabled dropdowns shall be displayed where configured.

---

## AC18.2: Verify Basic Details Fields

The applicant shall be able to enter or select the following information:

* Mode of Operation
* Prefix
* First Name
* Middle Name
* Last Name
* Full Name
* Date of Birth
* Gender
* Email ID
* Marital Status
* Father First Name
* Father Middle Name
* Father Last Name
* Mother's Name
* Spouse / Father's Name
* Religion
* Caste Category
* Politically Exposed Person
* Person with Disabilities
* Education / Qualification
* Country of Tax Residence
* Region
* Employment Type
* Designation / Profession
* Funding Mode
* Initial Funding Amount
* Expected Value of Transaction (Yearly)
* Expected Number of Transactions (Yearly)
* Agriculture Income
* Other Than Agricultural Income

---

# AC18.3: Verify Dropdown Values

All configured dropdown values shall be displayed with search functionality where applicable.

### Employment Type

* Salaried
* Professional
* Agriculture / Farmer
* Unemployed
* Self Employed
* Retired
* Housewife
* Other
* Business

### Funding Mode

* Cash
* Cheque

(Other dropdown values remain as previously defined.)

---

# AC18.4: Verify Mandatory Field Validation

Mandatory fields shall not allow submission when left blank.

Appropriate validation messages shall be displayed until valid values are entered.

---

# AC18.5: Verify Successful Submission

**Given**

All mandatory Basic Details fields are completed.

**When**

The applicant clicks **Submit**.

**Then**

The application shall determine the next step using the configured routing rules.

---

# AC18.6: Verify Funding Mode / Employment Type Conditional Navigation Matrix

**Given**

The applicant has successfully completed the **Basic Details** form.

**When**

The applicant selects different combinations of:

* Funding Mode
* Employment Type
* Customer Type

and submits the Basic Details form.

**Then**

The application shall determine the next onboarding module according to the configured routing rules.

---

# Module Routing Rules

| Rule    | Condition                                                                                                                        | Next Module               |
| ------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| RULE_22 | Funding Mode = Cheque                                                                                                            | Cheque Details            |
| RULE_23 | Employment Type = Salaried                                                                                                       | Salaried Information      |
| RULE_24 | Employment Type = Self Employed, Professional, Agriculture/Farmer, Retired, Housewife                                            | Self Employed Information |
| RULE_25 | Employment Type NOT IN (Self Employed, Salaried, Unemployed, Retired, Housewife, Farmer, Professional) AND Customer Type = Joint | Joint Applicant Details   |
| RULE_26 | Employment Type NOT IN (Self Employed, Salaried, Retired, Housewife, Farmer, Professional) AND Customer Type = Minor             | Guardian Information      |
| Default | No rule matches                                                                                                                  | Applicant Photo           |

---

# AC18.7: Verify Funding Mode = Cash

**Given**

Funding Mode is selected as **Cash**.

**When**

The applicant submits the Basic Details form.

**Then**

* The application shall directly evaluate the Employment Type routing rules.
* No Cheque Details screen shall be displayed.
* The applicant shall be redirected to the module determined by the routing configuration.

---

# AC18.8: Verify Funding Mode = Cheque

**Given**

Funding Mode is selected as **Cheque**.

**When**

The applicant submits the Basic Details form.

**Then**

The application shall display the **Cheque Details** step.

The applicant shall complete:

* Cheque Number
* Cheque Date
* Drawee Bank Name
* Drawee Branch IFSC Code

After successful submission,

The application shall continue to the Employment Type-specific module according to the configured routing rules.

Cheque Details shall act only as an intermediate step and shall not modify subsequent routing.

---

# AC18.9: Verify Designation / Profession Does Not Affect Routing

**Given**

Funding Mode and Employment Type remain unchanged.

**When**

Only the **Designation / Profession** value is modified.

**Then**

* Application routing shall remain unchanged.
* Designation / Profession shall be treated as an informational field only.
* It shall not influence module navigation.

---

# AC18.10: Verify Expected Navigation Matrix

| Funding Mode | Employment Type      | Expected Navigation                                        |
| ------------ | -------------------- | ---------------------------------------------------------- |
| Cash         | Salaried             | Salaried Information                                       |
| Cash         | Professional         | Self Employed Information                                  |
| Cash         | Self Employed        | Self Employed Information                                  |
| Cash         | Retired              | Self Employed Information                                  |
| Cash         | Housewife            | Self Employed Information                                  |
| Cash         | Agriculture / Farmer | Self Employed Information                                  |
| Cash         | Unemployed           | Applicant Photo                                            |
| Cash         | Other                | Applicant Photo                                            |
| Cash         | Business             | Applicant Photo                                            |
| Cheque       | Any Employment Type  | Cheque Details → Continue using same routing rules as Cash |

---

# AC18.11: Business Rules

* Funding Mode **Cash** shall directly evaluate the routing rules.
* Funding Mode **Cheque** shall always insert the **Cheque Details** step before continuing.
* Designation / Profession shall never affect routing.
* Customer Type shall be evaluated only where specified in the routing rules.
* If no configured routing rule matches, the application shall navigate to **Applicant Photo**.

---

# AC18.12: Validation Scenarios

Verify that:

* Every **Employment Type** option routes correctly.
* Both **Funding Mode** options behave as expected.
* **Designation / Profession** does not affect navigation.
* **Cheque Details** is displayed only when Funding Mode = Cheque.
* Successful submission of Cheque Details redirects to the correct employment-specific module.
* Module routing follows the configured business rules.
* Default routing navigates to **Applicant Photo** when no rule matches.
* The application **stepper** updates correctly after each successful submission.

---

## Expected Result

* The applicant can successfully complete the Basic Details form.
* The application determines the next onboarding module dynamically based on **Funding Mode**, **Employment Type**, and **Customer Type** according to the configured routing rules.
* The **Cheque Details** step is displayed only when Funding Mode is **Cheque**.
* The correct module (Salaried Information, Self Employed Information, Joint Applicant Details, Guardian Information, or Applicant Photo) is displayed after successful submission, and the onboarding stepper accurately reflects the application's progress.


# User Story: Cheque Details

**User Story ID:** US_CHEQUE_001
**Module:** Cheque Details
**Priority:** High
**Role:** Applicant

---

# User Story

**As an** applicant,

**I want** to provide cheque information only when I select **Cheque** as my Funding Mode,

**So that** the bank can validate my initial funding details before proceeding with account opening.

---

# Pre-Conditions

* Applicant has successfully completed the **Basic Details** page.
* Funding Mode has been selected.

---

# Acceptance Criteria

## AC1: Conditional Navigation Based on Funding Mode

**Given** the applicant submits the Basic Details page

**When** the selected Funding Mode is **Cheque**

**Then**

* System shall redirect the applicant to the **Cheque Details** page.

---

## AC2: Cash Funding Mode

**Given** the applicant submits the Basic Details page

**When** the selected Funding Mode is **Cash**

**Then**

* System shall skip the Cheque Details page.
* Applicant shall be redirected directly to the **Salaries Information** page.

---

## AC3: Display Cheque Details Page

The page shall display the following mandatory fields:

| Field                   | Mandatory |
| ----------------------- | --------- |
| Cheque Number           | Yes       |
| Cheque Date             | Yes       |
| Drawee Bank Name        | Yes       |
| Drawee Branch IFSC Code | Yes       |

---

## AC4: Cheque Number

**Given** the applicant enters a cheque number

**Then**

* Field shall accept numeric values only.
* Alphabetic and special characters shall not be accepted.
* Mandatory validation shall be applied.

---

## AC5: Cheque Date

**Given** the applicant clicks the date field

**Then**

* Calendar picker shall open.
* Applicant shall be able to select the cheque date.
* Manual entry shall follow the configured date format (DD-MM-YYYY), if supported.
* Mandatory validation shall be applied.

---

## AC6: Drawee Bank Name

Applicant shall enter the issuing bank name.

Validation:

* Mandatory field.
* Alphabetic characters and permitted special characters (if configured).
* Leading and trailing spaces shall be trimmed.

---

## AC7: Drawee Branch IFSC Code

Applicant shall enter the branch IFSC code.

Validation:

* Mandatory field.
* Accept valid IFSC format.
* Reject invalid IFSC codes.
* Trim leading/trailing spaces.

---

## AC8: Mandatory Validation

The system shall not allow submission until all mandatory fields are completed.

Mandatory fields:

* Cheque Number
* Cheque Date
* Drawee Bank Name
* Drawee Branch IFSC Code

Appropriate validation messages shall be displayed for missing or invalid values.

---

## AC9: Submit Cheque Details

**Given** all mandatory cheque details are entered correctly

**When** the applicant clicks **Submit**

**Then**

* System shall validate all entered details.
* Save the cheque information successfully.
* Redirect the applicant to the **Salaries Information** page.

---

# Validation Scenarios

### Navigation

* Funding Mode = Cash → Redirect directly to Salaries Information.
* Funding Mode = Cheque → Redirect to Cheque Details.

### Cheque Number

* Valid numeric value.
* Blank value.
* Alphabetic characters.
* Special characters.
* Maximum/minimum length (if configured).

### Cheque Date

* Select date using calendar.
* Manual date entry (if supported).
* Blank date.
* Invalid date format.

### Bank Name

* Valid bank name.
* Blank value.
* Numeric-only input.
* Special characters (as per validation rules).

### IFSC Code

* Valid IFSC code.
* Invalid IFSC format.
* Blank value.
* Lowercase vs uppercase handling (if applicable).

### Submit

* Successful submission.
* Validation errors displayed correctly.
* Duplicate Submit click handling.
* Network/server error handling.

---

# Expected Flow

```text
Basic Details
      │
      ▼
Funding Mode Selected
      │
      ├─────────────── Cash ─────────────────► Salaries Information
      │
      └─────────────── Cheque ───────────────► Cheque Details
                                                    │
                                                    ▼
                                             Enter Cheque Details
                                                    │
                                                    ▼
                                                  Submit
                                                    │
                                                    ▼
                                           Salaries Information
```

# User Story: Verify Salaried Information

**User Story ID:** US_SALARY_001
**Module:** Salaried Information
**Priority:** High
**Role:** Registered User

---

# User Story

**As a** registered user,

**I want** to provide my salaried employment details,

**So that** my employment and income information can be verified before proceeding with the savings account application.

---

# Pre-Conditions

* User is successfully logged in.
* User has completed:

  * Mobile Number Verification
  * Account Type Selection
  * eKYC Verification
  * Liveliness Verification
  * Address Details
  * Branch Selection
  * Basic Details
* **Employment Type** selected in Basic Details is **Salaried**.
* **Funding Mode** flow (Cash/Cheque) is completed.
* User is redirected to the **Salaried Information** page.

---

# Test Scenarios

| TC ID   | Test Scenario                                      | Expected Result                                                                                                                                                                                               |
| ------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SAL_001 | Verify Salaried Information page is displayed      | Salaried Information page is displayed after the previous step.                                                                                                                                               |
| SAL_002 | Verify page contains Category dropdown             | Category dropdown is displayed.                                                                                                                                                                               |
| SAL_003 | Verify Category dropdown values                    | Following values are available: Central Government Employee, State Government Employee, Public Sector Undertaking (PSU), Defence Services (Army, Navy, Air Force), Private Sector Employee – Corporate / MNC. |
| SAL_004 | Verify Category field is mandatory                 | System displays validation if left blank.                                                                                                                                                                     |
| SAL_005 | Verify search functionality in Category dropdown   | User can search and select a category successfully.                                                                                                                                                           |
| SAL_006 | Verify Organization's Name field                   | Text field is displayed and accepts valid organization name.                                                                                                                                                  |
| SAL_007 | Verify Organization's Name is mandatory            | Validation message is displayed when empty.                                                                                                                                                                   |
| SAL_008 | Verify Annual Income field                         | User can enter valid numeric annual income only.                                                                                                                                                              |
| SAL_009 | Verify Annual Income is mandatory                  | Validation message is displayed when left blank.                                                                                                                                                              |
| SAL_010 | Verify Source of Income field                      | User can enter valid source of income.                                                                                                                                                                        |
| SAL_011 | Verify Source of Income is mandatory               | Validation message is displayed when left blank.                                                                                                                                                              |
| SAL_012 | Verify alphabetic validation for Organization Name | Field accepts alphabets and supported special characters as per requirement.                                                                                                                                  |
| SAL_013 | Verify numeric validation for Annual Income        | Only valid numeric values are accepted.                                                                                                                                                                       |
| SAL_014 | Verify minimum and maximum input limits            | Fields follow configured character/value limits.                                                                                                                                                              |
| SAL_015 | Verify trimming of leading/trailing spaces         | Unnecessary spaces are trimmed.                                                                                                                                                                               |
| SAL_016 | Verify Submit with all mandatory fields empty      | Appropriate validation messages are displayed.                                                                                                                                                                |
| SAL_017 | Verify Submit after entering valid details         | Details are saved successfully.                                                                                                                                                                               |
| SAL_018 | Verify navigation after successful submission      | User is redirected to the **Joint Applicant Details** page.                                                                                                                                                   |
| SAL_019 | Verify page refresh                                | Entered/saved information behaves as per application design.                                                                                                                                                  |
| SAL_020 | Verify browser Back button behavior                | Navigation follows application workflow without data inconsistency.                                                                                                                                           |

---

# Field Validations

### Category *

* Mandatory
* Searchable dropdown

Available values:

* Central Government Employee
* State Government Employee
* Public Sector Undertaking (PSU)
* Defence Services (Army, Navy, Air Force)
* Private Sector Employee – Corporate / MNC

---

### Organization's Name *

* Mandatory
* Text field
* Accepts valid organization name
* Validation displayed when empty

---

### Annual Income *

* Mandatory
* Numeric field
* Accepts only valid numeric values
* Should not accept alphabets or unsupported special characters

---

### Source of Income *

* Mandatory
* Text field
* Accepts valid source of income
* Validation displayed when empty

---

# Acceptance Criteria

* Salaried Information page is displayed after the previous workflow.
* Category dropdown contains all configured employment categories.
* Category dropdown supports search.
* Organization's Name is mandatory.
* Annual Income is mandatory and accepts valid numeric values only.
* Source of Income is mandatory.
* Mandatory field validations are displayed appropriately.
* User can successfully submit valid information.
* On successful submission, the application redirects to the **Joint Applicant Details** page.

-------------------

# User Story: Verify Joint Applicant Details – Mobile Number & OTP Verification (AC5)

**User Story ID:** US_JOINT_001
**Module:** Joint Applicant Details
**Priority:** High
**Role:** Registered User

---

# User Story

**As a** registered user,

**I want** to verify the Joint Applicant's mobile number using OTP,

**So that** the Joint Applicant's identity can be authenticated before proceeding with the Joint Applicant eKYC process.

---

# Pre-Conditions

* User is successfully logged in.
* User has completed:

  * Mobile Number Verification
  * Account Type
  * eKYC Verification
  * Liveliness Verification
  * Address Details
  * Branch Selection
  * Basic Details
  * Cheque Details (if applicable)
  * Salaried Information
* User is redirected to the **Joint Applicant Details** page.

---

# Test Scenarios

| TC ID   | Test Scenario                                   | Expected Result                                                           |
| ------- | ----------------------------------------------- | ------------------------------------------------------------------------- |
| JAD_001 | Verify Joint Applicant Details page loads       | Joint Applicant Details page is displayed successfully.                   |
| JAD_002 | Verify Mobile Number field                      | Mobile Number input field is displayed with +91 country code.             |
| JAD_003 | Verify Mobile Number field accepts valid number | System accepts only valid 10-digit Indian mobile numbers.                 |
| JAD_004 | Verify Mobile Number mandatory validation       | Validation message displayed if field is left blank.                      |
| JAD_005 | Verify invalid mobile numbers                   | System displays appropriate validation for invalid mobile numbers.        |
| JAD_006 | Verify Send Verification Code button visibility | Button is displayed after entering a valid mobile number.                 |
| JAD_007 | Verify clicking Send Verification Code          | OTP is sent to the entered Joint Applicant mobile number successfully.    |
| JAD_008 | Verify OTP field appears                        | OTP input field is displayed after OTP is sent.                           |
| JAD_009 | Verify OTP sent message                         | System displays "The OTP has been sent to +91-XXXXXXXXXX".                |
| JAD_010 | Verify OTP validity timer                       | Remaining OTP validity timer is displayed.                                |
| JAD_011 | Verify Resend OTP timer                         | Resend OTP countdown is displayed.                                        |
| JAD_012 | Verify Resend OTP before timer expires          | Resend option remains disabled until timer completes.                     |
| JAD_013 | Verify Resend OTP after timer expires           | User can resend OTP successfully.                                         |
| JAD_014 | Verify valid OTP                                | OTP is verified successfully.                                             |
| JAD_015 | Verify invalid OTP                              | Appropriate error message is displayed.                                   |
| JAD_016 | Verify expired OTP                              | System displays OTP expired message and prompts for resend.               |
| JAD_017 | Verify incomplete OTP                           | Validation displayed for incomplete OTP.                                  |
| JAD_018 | Verify Change Mobile Number option              | User can modify the entered mobile number before successful verification. |
| JAD_019 | Verify multiple resend attempts                 | System follows configured resend limits.                                  |
| JAD_020 | Verify successful OTP verification              | OTP verification succeeds and the next workflow is enabled.               |
| JAD_021 | Verify Submit after successful OTP verification | System opens the next tab for **Joint Applicant eKYC Verification**.      |

---

# Field Validations

## Mobile Number

* Mandatory
* Country Code: **+91**
* Accepts only numeric values
* Must contain exactly **10 digits**
* Invalid mobile numbers should not be accepted

---

## OTP

* Mandatory
* Accepts only numeric OTP
* OTP length should follow configured system length
* Expired OTP should not be accepted
* Invalid OTP should display an appropriate error
* Resend OTP should be enabled only after countdown completion

---

# Acceptance Criteria (AC5)

### AC5.1 – Mobile Number Verification

* User enters a valid Joint Applicant mobile number.
* **Send Verification Code** button is displayed.
* Clicking the button sends an OTP to the entered mobile number.

### AC5.2 – OTP Verification

* OTP input field is displayed.
* OTP sent confirmation message is shown.
* OTP validity timer is displayed.
* Resend OTP countdown is displayed.
* User can resend OTP only after the countdown expires.

### AC5.3 – Successful OTP Validation

* System validates the entered OTP successfully.
* Mobile number verification is completed.

### AC5.4 – Navigation

* After successful OTP verification and clicking **Submit**, the **Joint Applicant eKYC Verification** tab becomes available and the user proceeds to the next verification step.

### AC5.5 – Error Handling

* Invalid OTP displays an appropriate error message.
* Expired OTP requires the user to resend a new OTP.
* Invalid or incomplete mobile numbers are not accepted.
* Mandatory validations are displayed whenever required.


----------------
# User Story: Verify Applicant & Customer Information – eKYC Verification Workflow (Joint Applicant)

**User Story ID:** US_HOME_003
**Module:** Savings Application – Applicant & Customer Information (eKYC Verification)
**Priority:** High
**Role:** Registered User

---

# User Story

**As a** registered user,

**I want** to complete the eKYC verification process using the available identity verification options,

**So that** my identity can be successfully verified before proceeding with the Savings Account application.

---

# Pre-Conditions

* User is successfully logged in.
* User has opened an existing Savings Application.
* Mobile Number Verification is completed successfully.
* Account Type selection is completed.
* User is navigated to the **Applicant & Customer Information (eKYC Verification)** step.

---

# Test Data

* Valid Mobile Number
* Valid Aadhaar linked with DigiLocker
* Valid PAN Number
* Valid PAN Image (PNG/JPG/PDF)
* Valid Driving Licence Number
* Valid Driving Licence Document
* Valid Voter ID Number
* Valid Voter ID Document

---

# Acceptance Criteria

---

# AC1: eKYC Verification Screen

**GIVEN** the user reaches the Applicant & Customer Information step

**WHEN** the eKYC Verification page loads

**THEN** the following verification modules shall be displayed:

* Aadhaar Verification through DigiLocker *
* PAN Verification
* Driving Licence Verification
* Voter ID Verification

And

* All verification cards shall be visible.
* All cards shall be clickable.
* Verification status shall be displayed for every verification.
* Previous and Next navigation buttons shall be enabled.
* Submit button shall remain disabled until all mandatory verification requirements are completed successfully.

---

# AC2: Aadhaar Verification through DigiLocker

**WHEN** the user clicks **Aadhaar Verification through DigiLocker**

**THEN**

A DigiLocker popup shall open displaying:

* Registered Mobile Number (pre-filled)
* Information message
* Cancel button
* Send Link button

The following informational message shall be displayed:

> The link will be sent to the customer. They must grant access to their DigiLocker documents to proceed with eKYC.

---

# AC3: Send DigiLocker Link

**WHEN** the user clicks **Send Link**

**THEN**

* Verification link shall be sent to the registered mobile number.
* Success message shall be displayed.
* Verification attempt count shall decrease according to business rules.
* Link validity timer shall start.
* Verification status shall become **Pending**.

---

# AC4: DigiLocker Verification Timer

After sending the verification link,

The screen shall display:

* Link successfully sent message
* Registered Mobile Number
* Link Validity Remaining timer
* Resend Link option

Verify

* Timer starts from **30 minutes**
* Countdown updates correctly
* Timer expires after configured duration
* Expired link becomes invalid

---

# AC5: Resend Link

Verify:

* Resend Link is clickable.
* Clicking Resend generates a new verification link.
* Previous link becomes invalid.
* Timer resets to 30 minutes.
* Appropriate success message is displayed.
* Remaining attempts are updated.

---

# AC6: DigiLocker Verification Attempts

Verify

User is allowed a maximum of **3 verification attempts**.

For each attempt:

* Remaining attempts are displayed.
* Link validity is 30 minutes.
* Attempt count decreases after every verification request.
* Appropriate message is displayed when maximum attempts are exhausted.
* Additional verification requests shall not be allowed after all attempts are consumed.

---

# AC7: Manual Assisted DigiLocker Verification

Since Aadhaar verification is completed manually by the customer,

Verify:

* Application remains in Pending state until DigiLocker verification is completed.
* System periodically checks verification status.
* Refresh button updates verification status.
* Verification status updates automatically once verification is completed.

---

# AC8: DigiLocker Verification Status

The following status values shall be supported:

* Pending
* Successful
* Failed

Verify

### Pending

* Link sent
* Awaiting customer action

### Successful

* Customer completes DigiLocker authentication
* Aadhaar verification completes successfully
* Success indicator is displayed

### Failed

* Customer rejects verification
* Verification expires
* Verification fails due to service failure
* Appropriate error message is displayed

---

# AC9: PAN Verification Entry Screen

**WHEN** the user opens PAN Verification

**THEN** the following fields shall be displayed:

* PAN Number *
* Upload PAN Image *
* Browse File
* Drag & Drop Upload
* Capture Using Camera
* Submit button

---

# AC10: PAN Validation

Verify

PAN Number

* Mandatory
* Valid PAN format
* Invalid PAN displays validation
* Duplicate or invalid PAN displays configured error

PAN Image

* Mandatory
* Supports Browse
* Supports Drag & Drop
* Supports Camera Capture
* Accepts supported file formats
* Rejects unsupported formats
* Rejects oversized files

---

# AC11: Successful PAN Verification

**WHEN**

User enters valid PAN details and uploads a valid PAN image

**THEN**

System shall verify PAN successfully.

User shall be redirected to PAN Details page displaying:

* PAN Number
* Uploaded Image View icon
* Green Verification Tick
* Change PAN Number link
* First Name
* Middle Name
* Last Name
* Date of Birth

All retrieved information shall be pre-filled from the verified PAN record.

---

# AC12: View Uploaded PAN Image

Verify

* Uploaded image icon is displayed.
* Clicking the icon opens the uploaded PAN document.
* User can view the uploaded image.
* Uploaded image matches the submitted document.

---

# AC13: Change PAN Number

**WHEN** user clicks **Change PAN Number**

**THEN**

* User returns to PAN Verification page.
* Existing PAN details can be replaced.
* User can upload a new PAN image.
* Previous PAN verification becomes invalid.
* New verification process starts.

---

# AC14: PAN Verification Status

After successful verification,

PAN Verification module shall display

**Successful**

Clicking the PAN module again shall display:

* PAN Verification submitted successfully
* Verified PAN information
* Uploaded PAN document
* Verification status

---

# AC15: Driving Licence Verification

**WHEN** user selects Driving Licence Verification

**THEN**

Popup shall display:

* Driving Licence Number *
* Date of Birth *
* Upload Driving Licence
* Browse
* Drag & Drop
* Capture Using Camera
* Cancel
* Verify

Verify

* Mandatory validations
* Driving Licence format validation
* Document upload validation
* Camera capture
* Successful verification
* Failed verification
* Verification status updates
* Submitted details are viewable after successful verification

---

# AC16: Driving Licence Verification Status

Supported statuses

* Pending
* Successful
* Failed

Clicking Successful status shall display submitted Driving Licence details.

---

# AC17: Voter ID Verification

**WHEN** user selects Voter ID Verification

**THEN**

Popup shall display

* Voter ID Number *
* Upload Voter ID
* Browse
* Drag & Drop
* Capture Using Camera
* Cancel
* Verify

Verify

* Mandatory validations
* Valid Voter ID format
* Document upload
* Camera capture
* Successful verification
* Failed verification
* Verification status update

---

# AC18: Voter ID Verification Status

Supported statuses

* Pending
* Successful
* Failed

Clicking Successful status shall display submitted Voter ID details.

---

# AC19: Submit Button Validation

Verify

* Submit button remains disabled until all mandatory verification requirements are completed successfully.
* Submit button becomes enabled only after:

  * Aadhaar Verification through DigiLocker is Successful.
  * PAN Verification is Successful.
* Optional verifications (Driving Licence and Voter ID), if not mandatory per business rules, shall not block submission.
* Clicking Submit saves the eKYC verification details successfully and navigates the user to the next application step.

---

# AC20: Navigation Validation

Verify

* Previous button navigates to Account Type step.
* Next button navigates to the next workflow step after successful submission.
* Previously entered data is retained when navigating between steps.

---

# AC21: Refresh Validation

Verify

* Refresh button reloads verification status.
* Updated verification results are reflected immediately.
* No duplicate verification requests are created during refresh.

---

# AC22: Error Handling

Verify the system displays appropriate messages for:

* Invalid PAN Number
* Invalid Driving Licence Number
* Invalid Voter ID Number
* Invalid document upload
* Unsupported file format
* File size exceeded
* Network failure
* DigiLocker service unavailable
* Verification timeout
* Maximum attempts exhausted
* Session timeout

---

# AC23: UI Validation

Verify that:

* All verification modules are aligned correctly.
* Status badges (Pending, Successful, Failed) are clearly visible.
* Verification popups are centered and responsive.
* Mandatory fields are marked with an asterisk (*).
* Upload controls, buttons, and icons are displayed correctly.
* Timers and attempt counters update in real time.
* Success, warning, and error messages follow the application design guidelines.
* No UI overlap, truncation, or layout issues occur across supported browsers and screen resolutions.

---

# Out of Scope

The following functionality will be covered in subsequent user stories:

* Applicant Personal Information
* Address Details
* Nominee Details
* Additional KYC Documents
* Application Review
* Final Submission
* Approval Workflow
* Account Opening Confirmation

---

You can add the following acceptance criteria to cover the **Action Required** scenario for DigiLocker verification.

---

## AC9: DigiLocker Action Required Validation

**GIVEN** the customer has opened the DigiLocker verification link

**WHEN** one or more mandatory documents are not shared through DigiLocker

**THEN**

* Aadhaar Verification status shall be updated to **Action Required**.
* The verification card shall display the **Action Required** status badge.
* The user shall not be allowed to complete the Aadhaar verification.
* The application shall remain in the current eKYC step.

---

## AC10: Action Required Popup

**WHEN** the user clicks the **Action Required** status on the Aadhaar Verification card

**THEN** a popup shall be displayed containing:

* Document Name
* Mandatory (Yes/No)
* Uploaded Status
* Refresh button
* Resend Link button
* Done button
* Close (X) button

The popup shall clearly indicate:

* Mandatory documents not uploaded.
* Successfully uploaded documents.
* Missing mandatory documents.

---

## AC11: Mandatory Document Validation

Verify the popup correctly displays the upload status.

Example:

| Document        | Mandatory | Uploaded     |
| --------------- | --------- | ------------ |
| Digital Aadhaar | Yes       | Not Uploaded |
| APAAR ID        | No        | Uploaded ✓   |

Verify:

* Mandatory documents missing shall be clearly indicated.
* Optional documents shall not prevent completion.
* Uploaded documents shall display a success indicator.

---

## AC12: Resend Verification Link

**WHEN** the user clicks **Resend Link**

**THEN**

* A new DigiLocker verification link shall be sent to the registered mobile number.
* Previous verification link shall become invalid.
* Link validity timer shall restart.
* Remaining attempts shall be updated according to business rules.
* Success message shall be displayed.

---

## AC13: Manual Refresh Verification

Since DigiLocker verification is completed externally,

**WHEN** the customer uploads the missing mandatory document(s) through DigiLocker

**AND** the application user clicks the **Refresh** button

**THEN**

* System shall fetch the latest verification status from DigiLocker.
* Uploaded document status shall be updated.
* Mandatory document shall display **Uploaded ✓**.
* Verification status shall update accordingly.

---

## AC14: Successful Completion After Refresh

**WHEN** all mandatory DigiLocker documents are successfully uploaded

**AND** the user clicks the **Refresh** button

**THEN**

* All mandatory documents shall display **Uploaded ✓**.
* Aadhaar Verification status shall change from **Action Required** to **Successful**.
* The **Done** button shall become enabled (if not already enabled).
* Clicking **Done** shall close the popup.
* User shall return to the eKYC Verification page.
* Aadhaar Verification card shall display **Successful** status.

---

## AC15: Incomplete Verification

**WHEN** mandatory documents are still missing after refresh

**THEN**

* Verification status shall remain **Action Required**.
* Popup shall remain open.
* Missing document(s) shall continue to be highlighted.
* User may click **Resend Link** again, subject to the configured attempt limit.

---

These acceptance criteria complete the DigiLocker workflow by covering:

* **Pending** → Link sent
* **Action Required** → Mandatory documents missing
* **Refresh** → Synchronize document status
* **Successful** → All mandatory documents uploaded
* **Failed/Attempts Exhausted** → Maximum retries or verification failure



Based on your requirements and the screenshots, here is a structured **User Story with Acceptance Criteria** for the **Liveliness Verification** module.

---

# User Story: Verify Liveliness Verification Process (Joint Applicant) 

**User Story ID:** US_EKYC_005
**Module:** eKYC – Liveliness Verification
**Priority:** High
**Role:** Registered User

---

# User Story

**As a** registered user,

**I want** to complete at least one liveliness verification process,

**So that** my application can proceed to the Address Details stage.

---

# Pre-Conditions

* User is logged into the application.
* Mobile Number Verification is completed.
* Account Type is selected.
* eKYC verification is successfully completed.
* User is redirected to the **Liveliness Verification** page.

---

# Liveliness Verification Screen

The page shall display two verification options:

1. Security Code Based Liveliness Verification
2. Liveliness Verification

A **Submit** button shall be available.

---

# Acceptance Criteria

## AC-01: Display Verification Options

**Given**
User has successfully completed Aadhaar/eKYC verification

**When**
The application redirects to the next step

**Then**

* Liveliness Verification page shall open.
* Two verification options shall be displayed:

  * Security Code Based Liveliness Verification
  * Liveliness Verification
* Submit button shall be displayed.

---

## AC-02: Validation on Submit

**Given**
User has not completed any liveliness verification

**When**
User clicks **Submit**

**Then**

Display validation message:

> Please complete at least one Liveliness Verification process.

User shall remain on the same page.

---

# Security Code Based Liveliness Verification

## AC-03: Open Guidelines Popup

**When**
User clicks **Security Code Based Liveliness Verification**

**Then**
A popup shall open displaying:

### Guidelines For Liveliness Check

1. Prepare a white sheet of paper and a pen.
2. Write the provided Security Code clearly.
3. Hold the paper so the Security Code is clearly visible.
4. Use the verification camera to capture your photograph with the Security Code visible.

Buttons:

* Cancel
* Send Link

---

## AC-04: Send Verification Link

**Given**
User clicks **Send Link**

**Then**

* Verification link shall be sent to the registered mobile number.
* Success message shall be displayed.

Example:

> A verification link for Security Code Based Liveliness Verification has been sent to customer on XXXXXXXXXX.

Popup shall display:

* Link Validity Remaining
* Countdown timer
* Resend Link timer

Example

```
Link Validity Remaining
28 Min 07 Sec

Resend Link After
03 Min 37 Sec
```

---

## AC-05: Manual Assisted Verification

After the verification link is sent:

* Verification shall be completed externally by the customer.
* Application status shall remain **Pending**.
* System shall periodically check verification status.
* Refresh button shall allow manual status update.
* Once verification is completed successfully:

  * Status shall automatically update to **Verified**.
  * Verification section shall be marked as completed.

---

# Liveliness Verification

## AC-06: Open Guidelines Popup

**When**
User clicks **Liveliness Verification**

**Then**

Popup shall display:

### Guidelines For Liveliness Check

1. Keep your mobile device ready.
2. Speak clearly during verification.
3. Dress appropriately.
4. Ensure sufficient lighting.
5. Maintain a stable internet connection.

Buttons:

* Cancel
* Send Link

---

## AC-07: Send Verification Link

**Given**
User clicks **Send Link**

**Then**

System shall:

* Send verification link to the registered mobile number.
* Display confirmation message.

Example

> A verification link for Liveliness Verification has been sent to customer on XXXXXXXXXX.

Popup shall display:

* Link validity countdown
* Resend timer

Example

```
Link Validity Remaining
28 Min 07 Sec

Resend Link After
03 Min 37 Sec
```

---

## AC-08: Pending Verification

Until verification is completed:

* Application status shall remain **Pending**.
* Background polling shall periodically verify the status.
* User may click the **Refresh** button to manually fetch the latest verification status.
* Upon successful verification:

  * Status shall update to **Verified**.
  * Verification step shall be marked complete.

---

# AC-09: Successful Completion

**Given**
User successfully completes either:

* Security Code Based Liveliness Verification

**OR**

* Liveliness Verification

**When**
Verification status becomes **Verified**

**Then**

* The completed verification option shall display a success status.
* User shall be allowed to click **Submit**.
* On clicking **Submit**, the application shall redirect to the **Address Details** page.

---

# Business Rules

* Completing **either one** of the two liveliness verification methods is sufficient.
* Both methods are **not mandatory**.
* Verification links shall be sent only to the registered mobile number.
* Application shall remain in **Pending** state until verification is completed.
* Verification status shall be updated automatically through periodic polling.
* Refresh button shall allow users to manually update the verification status.
* Resend Link shall remain disabled until the countdown timer expires.
* Submit shall remain blocked until at least one verification method is successfully completed.
* Upon successful verification and clicking **Submit**, the user shall be redirected to the **Address Details** page.

# User Story: Verify Address Details (Joint Applicant)

**User Story ID:** US_EKYC_006
**Module:** Address Details
**Priority:** High
**Role:** Registered User

---

# User Story

**As a** registered user,

**I want** to verify my permanent address and provide my communication address,

**So that** I can proceed to the Branch Selection step of the account opening process.

---

# Pre-Conditions

* User is logged into the application.
* Mobile Number Verification is completed.
* Account Type is selected.
* eKYC Verification is completed.
* At least one Liveliness Verification method is successfully completed.
* User clicks **Submit** on the Liveliness Verification page.

---

# Acceptance Criteria

## AC-01: Navigate to Address Details

**Given**
The user successfully completes the Liveliness Verification step

**When**
The user clicks **Submit**

**Then**

* The application shall redirect to the **Address Details** page.
* The Address Details step shall be highlighted as the active step.

---

## AC-02: Display Permanent Address

**Given**
The Address Details page is opened

**Then**

The page shall display:

* **Permanent Address** (Mandatory)

The permanent address shall be automatically populated using the verified address received from the previous verification steps (DigiLocker/eKYC and Liveliness Verification).

Example:

```
BHAKSHI ROAD,
Baglan,
Satana,
Baglan,
Nashik,
Maharashtra,
India - 423301
```

The permanent address:

* Shall be displayed in read-only mode.
* Shall not be editable by the user.

---

## AC-03: Display Communication Address Section

The page shall display:

* **Communication Address** (Mandatory)

Initially, the section shall display:

> Click Here For Add Address

---

## AC-04: Open Communication Address Popup

**Given**
User clicks **Click Here For Add Address**

**Then**

A popup titled **Communication Address** shall open.

The popup shall contain:

* Same as Permanent Address (Checkbox)
* Address Line 1 *
* Address Line 2
* Area / Locality
* Country *
* State *
* City *
* Pin Code *
* Upload Address Proof
* Browse Computer / Drag & Drop
* Supported formats:

  * PNG
  * JPG
  * PDF
  * Camera Capture
* Cancel button
* Submit button

---

## AC-05: Same as Permanent Address

**Given**
The Communication Address popup is opened

**When**
User selects **Same as Permanent Address**

**Then**

The following fields shall be automatically populated using the Permanent Address:

* Address Line 1
* Address Line 2 (if available)
* Area / Locality
* Country
* State
* City
* Pin Code

The populated values shall be editable by the user if business rules allow.

---

## AC-06: Manual Communication Address Entry

**Given**
User does not select **Same as Permanent Address**

**When**
User enters the communication address manually

**Then**

The following mandatory fields shall be validated:

* Address Line 1
* Country
* State
* City
* Pin Code

Optional fields:

* Address Line 2
* Area / Locality

---

## AC-07: Address Proof Upload

The Communication Address popup shall allow the user to upload address proof.

Supported file types:

* PNG
* JPG
* PDF
* Camera Capture

The selected file name shall be displayed after upload.

---

## AC-08: Communication Address Validation

**Given**
User clicks **Submit** without completing mandatory fields

**Then**

The system shall:

* Highlight the mandatory fields.
* Display appropriate validation messages.
* Prevent submission until all required information is provided.

---

## AC-09: Save Communication Address

**Given**
All mandatory details are entered successfully

**When**
User clicks **Submit** on the Communication Address popup

**Then**

* Communication Address shall be saved successfully.
* Popup shall close.
* Saved Communication Address shall be displayed on the Address Details page.

---

## AC-10: Submit Address Details

**Given**
Permanent Address is available and Communication Address has been successfully added

**When**
User clicks **Submit** on the Address Details page

**Then**

* Address Details shall be saved successfully.
* User shall be redirected to the **Branch Selection** page.

---

# Business Rules

* Permanent Address shall be fetched from the verified DigiLocker/eKYC and Liveliness Verification data.
* Permanent Address shall be read-only and cannot be modified by the user.
* Communication Address is mandatory.
* Selecting **Same as Permanent Address** shall auto-populate all applicable address fields.
* If **Same as Permanent Address** is not selected, the user must manually enter all mandatory communication address fields.
* Address proof upload shall support **PNG, JPG, PDF, and Camera Capture**.
* Communication Address must be successfully saved before proceeding.
* Clicking **Submit** on the Address Details page shall redirect the user to the **Branch Selection** page only after successful validation and save.


Based on the Basic Details page and field requirements you shared, here is a structured **User Story with Acceptance Criteria**.

---

# User Story: Basic Details (Joint Applicant)

**User Story ID:** US_BASIC_001
**Module:** Basic Details
**Priority:** High
**Role:** Applicant

---

# User Story

**As an** applicant,

**I want** to provide my personal, demographic, employment, and financial information,

**So that** the bank can complete my account opening process and proceed to the next stage.

---

# Pre-Conditions

* User has successfully completed:

  * Mobile Number Verification
  * Account Type Selection
  * eKYC Verification
  * Liveliness Verification
  * Address Details
  * Branch Selection
* User clicks **Submit** on the Branch Selection page.
* System redirects to the **Basic Details** page.

---

# Acceptance Criteria

## AC1: Navigate to Basic Details

**Given** the applicant successfully submits the selected branch

**When** Branch Selection is completed

**Then**

* System shall redirect to the **Basic Details** page.
* The Basic Details step shall become active in the progress indicator.

---

## AC2: Prefilled Information

The following fields shall be prefilled from previous steps and displayed as read-only:

| Field         | Source           | Editable |
| ------------- | ---------------- | -------- |
| First Name    | eKYC/DigiLocker  | No       |
| Middle Name   | eKYC/DigiLocker  | No       |
| Last Name     | eKYC/DigiLocker  | No       |
| Full Name     | System Generated | No       |
| Date of Birth | eKYC/DigiLocker  | No       |

---

## AC3: Personal Information

The applicant shall be able to enter/select:

* Mode of Operation *
* Prefix *
* Gender *
* Email ID *
* Marital Status *
* Father's First Name *
* Father's Middle Name
* Father's Last Name *
* Mother's Name *
* Spouse/Father's Name
* Religion
* Caste Category *
* Politically Exposed Person *
* Person with Disabilities

---

## AC4: Residential & Education Details

Applicant shall be able to select:

* Education / Qualification *
* Country of Tax Residence is India *
* Region *

---

## AC5: Employment Details

Applicant shall select:

* Employment Type *
* Designation / Profession *

---

## AC6: Financial Details

Applicant shall provide:

* Funding Mode *
* Initial Funding Amount *
* Expected Value of Transaction (Yearly) *
* Expected Number of Transactions (Yearly) *
* Agriculture Income *
* Other Than Agricultural Income *

---

## AC7: Dropdown Values

### Mode of Operation

* Self
* Either or Survivor
* Former or Survivor
* Jointly
* Guardian
* Any Two Jointly
* Jointly With Others
* Any One

---

### Prefix

* Mr
* Ms
* Mrs
* Dr
* Shrimati
* Kumari
* Baby
* Master
* Miss
* Shri

---

### Gender

* Male
* Female

---

### Marital Status

* Unmarried
* Married
* Divorced
* Widowed
* Living Together
* Legally Separated
* Widower
* Other

---

### Religion

* Hindu
* Buddhist
* Sikh
* Muslim
* Christian
* Others

---

### Caste Category

* General
* OBC
* SC
* ST

---

### Politically Exposed Person

* None
* Applicant is a Politically Exposed Person
* Applicant is related to a Politically Exposed Person

---

### Person with Disabilities

* Yes
* No

---

### Education

* Post Graduation
* Under Graduation
* Graduate
* Matriculate
* Uneducated
* MS Computers

---

### Country of Tax Residence

* Yes
* No

---

### Region

* Metropolitan City
* Urban Area
* Semi-Urban Area
* Rural Area

---

### Employment Type

* Salaried
* Professional
* Agriculture/Farmer
* Self Employed
* Business
* Retired
* Housewife
* Unemployed
* Other

---

### Funding Mode

* Cash
* Cheque

---

## AC8: Searchable Dropdowns

Dropdowns supporting search shall allow users to filter options while typing, including:

* Mode of Operation
* Prefix
* Marital Status
* Religion
* Caste Category
* Politically Exposed Person
* Education
* Region
* Employment Type
* Designation/Profession
* Funding Mode

---

## AC9: Mandatory Field Validation

The system shall display validation messages when mandatory fields are empty during submission.

Mandatory fields:

* Mode of Operation
* Prefix
* Gender
* Email ID
* Marital Status
* Father's First Name
* Father's Last Name
* Mother's Name
* Caste Category
* Politically Exposed Person
* Education
* Country of Tax Residence
* Region
* Employment Type
* Designation / Profession
* Funding Mode
* Initial Funding Amount
* Expected Value of Transaction (Yearly)
* Expected Number of Transaction (Yearly)
* Agriculture Income
* Other Than Agricultural Income

---

## AC10: Email Validation

The Email ID field shall:

* Accept valid email format.
* Reject invalid email formats.
* Trim leading/trailing spaces.
* Display an error message for invalid entries.

---

## AC11: Numeric Field Validation

The following fields shall accept numeric values only:

* Initial Funding Amount
* Expected Value of Transaction (Yearly)
* Expected Number of Transaction (Yearly)
* Agriculture Income
* Other Than Agricultural Income

The system shall reject alphabetic and special characters where not allowed.

---

## AC12: Submit

**Given** all mandatory information is entered correctly

**When** the applicant clicks **Submit**

**Then**

* System shall validate all entered information.
* Save the applicant's Basic Details successfully.
* Redirect the applicant to the **next onboarding step** (as per configured workflow).
* Display a success message if applicable.

---

# Validation Scenarios

### Prefilled Data

* Verify First Name is prefilled.
* Verify Middle Name is prefilled.
* Verify Last Name is prefilled.
* Verify Full Name is generated correctly.
* Verify Date of Birth is prefilled.
* Verify prefilled fields are non-editable.

### Dropdown Validation

* Verify every dropdown opens correctly.
* Verify search functionality works.
* Verify selection is saved.
* Verify clear/reset behavior (if supported).

### Mandatory Validation

* Submit with all mandatory fields blank.
* Submit with one mandatory field missing.
* Verify validation messages are displayed.

### Email Validation

* Valid email.
* Invalid email.
* Email without '@'.
* Email with spaces.
* Blank email.

### Numeric Fields

* Positive numbers.
* Decimal values (if allowed).
* Zero value.
* Negative values (if not allowed).
* Alphabetic input.
* Special characters.

### Submit

* Successful submission.
* Duplicate click on Submit.
* Server/network failure handling.
* Data persists after refresh (if saved).

---


---

# User Story: Cheque Details (Joint Applicant)

**User Story ID:** US_CHEQUE_001
**Module:** Cheque Details
**Priority:** High
**Role:** Applicant

---

# User Story

**As an** applicant,

**I want** to provide cheque information only when I select **Cheque** as my Funding Mode,

**So that** the bank can validate my initial funding details before proceeding with account opening.

---

# Pre-Conditions

* Applicant has successfully completed the **Basic Details** page.
* Funding Mode has been selected.

---

# Acceptance Criteria

## AC1: Conditional Navigation Based on Funding Mode

**Given** the applicant submits the Basic Details page

**When** the selected Funding Mode is **Cheque**

**Then**

* System shall redirect the applicant to the **Cheque Details** page.

---

## AC2: Cash Funding Mode

**Given** the applicant submits the Basic Details page

**When** the selected Funding Mode is **Cash**

**Then**

* System shall skip the Cheque Details page.
* Applicant shall be redirected directly to the **Salaries Information** page.

---

## AC3: Display Cheque Details Page

The page shall display the following mandatory fields:

| Field                   | Mandatory |
| ----------------------- | --------- |
| Cheque Number           | Yes       |
| Cheque Date             | Yes       |
| Drawee Bank Name        | Yes       |
| Drawee Branch IFSC Code | Yes       |

---

## AC4: Cheque Number

**Given** the applicant enters a cheque number

**Then**

* Field shall accept numeric values only.
* Alphabetic and special characters shall not be accepted.
* Mandatory validation shall be applied.

---

## AC5: Cheque Date

**Given** the applicant clicks the date field

**Then**

* Calendar picker shall open.
* Applicant shall be able to select the cheque date.
* Manual entry shall follow the configured date format (DD-MM-YYYY), if supported.
* Mandatory validation shall be applied.

---

## AC6: Drawee Bank Name

Applicant shall enter the issuing bank name.

Validation:

* Mandatory field.
* Alphabetic characters and permitted special characters (if configured).
* Leading and trailing spaces shall be trimmed.

---

## AC7: Drawee Branch IFSC Code

Applicant shall enter the branch IFSC code.

Validation:

* Mandatory field.
* Accept valid IFSC format.
* Reject invalid IFSC codes.
* Trim leading/trailing spaces.

---

## AC8: Mandatory Validation

The system shall not allow submission until all mandatory fields are completed.

Mandatory fields:

* Cheque Number
* Cheque Date
* Drawee Bank Name
* Drawee Branch IFSC Code

Appropriate validation messages shall be displayed for missing or invalid values.

---

## AC9: Submit Cheque Details

**Given** all mandatory cheque details are entered correctly

**When** the applicant clicks **Submit**

**Then**

* System shall validate all entered details.
* Save the cheque information successfully.
* Redirect the applicant to the **Salaries Information** page.

---

# Validation Scenarios

### Navigation

* Funding Mode = Cash → Redirect directly to Salaries Information.
* Funding Mode = Cheque → Redirect to Cheque Details.

### Cheque Number

* Valid numeric value.
* Blank value.
* Alphabetic characters.
* Special characters.
* Maximum/minimum length (if configured).

### Cheque Date

* Select date using calendar.
* Manual date entry (if supported).
* Blank date.
* Invalid date format.

### Bank Name

* Valid bank name.
* Blank value.
* Numeric-only input.
* Special characters (as per validation rules).

### IFSC Code

* Valid IFSC code.
* Invalid IFSC format.
* Blank value.
* Lowercase vs uppercase handling (if applicable).

### Submit

* Successful submission.
* Validation errors displayed correctly.
* Duplicate Submit click handling.
* Network/server error handling.

---

# User Story: Verify Salaried Information (Joint Applicant)

**User Story ID:** US_SALARY_001
**Module:** Salaried Information
**Priority:** High
**Role:** Registered User

---

# User Story

**As a** registered user,

**I want** to provide my salaried employment details,

**So that** my employment and income information can be verified before proceeding with the savings account application.

---

# Pre-Conditions

* User is successfully logged in.
* User has completed:

  * Mobile Number Verification
  * Account Type Selection
  * eKYC Verification
  * Liveliness Verification
  * Address Details
  * Branch Selection
  * Basic Details
* **Employment Type** selected in Basic Details is **Salaried**.
* **Funding Mode** flow (Cash/Cheque) is completed.
* User is redirected to the **Salaried Information** page.

---

# Test Scenarios

| TC ID   | Test Scenario                                      | Expected Result                                                                                                                                                                                               |
| ------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SAL_001 | Verify Salaried Information page is displayed      | Salaried Information page is displayed after the previous step.                                                                                                                                               |
| SAL_002 | Verify page contains Category dropdown             | Category dropdown is displayed.                                                                                                                                                                               |
| SAL_003 | Verify Category dropdown values                    | Following values are available: Central Government Employee, State Government Employee, Public Sector Undertaking (PSU), Defence Services (Army, Navy, Air Force), Private Sector Employee – Corporate / MNC. |
| SAL_004 | Verify Category field is mandatory                 | System displays validation if left blank.                                                                                                                                                                     |
| SAL_005 | Verify search functionality in Category dropdown   | User can search and select a category successfully.                                                                                                                                                           |
| SAL_006 | Verify Organization's Name field                   | Text field is displayed and accepts valid organization name.                                                                                                                                                  |
| SAL_007 | Verify Organization's Name is mandatory            | Validation message is displayed when empty.                                                                                                                                                                   |
| SAL_008 | Verify Annual Income field                         | User can enter valid numeric annual income only.                                                                                                                                                              |
| SAL_009 | Verify Annual Income is mandatory                  | Validation message is displayed when left blank.                                                                                                                                                              |
| SAL_010 | Verify Source of Income field                      | User can enter valid source of income.                                                                                                                                                                        |
| SAL_011 | Verify Source of Income is mandatory               | Validation message is displayed when left blank.                                                                                                                                                              |
| SAL_012 | Verify alphabetic validation for Organization Name | Field accepts alphabets and supported special characters as per requirement.                                                                                                                                  |
| SAL_013 | Verify numeric validation for Annual Income        | Only valid numeric values are accepted.                                                                                                                                                                       |
| SAL_014 | Verify minimum and maximum input limits            | Fields follow configured character/value limits.                                                                                                                                                              |
| SAL_015 | Verify trimming of leading/trailing spaces         | Unnecessary spaces are trimmed.                                                                                                                                                                               |
| SAL_016 | Verify Submit with all mandatory fields empty      | Appropriate validation messages are displayed.                                                                                                                                                                |
| SAL_017 | Verify Submit after entering valid details         | Details are saved successfully.                                                                                                                                                                               |
| SAL_018 | Verify navigation after successful submission      | User is redirected to the **Joint Applicant Details** page.                                                                                                                                                   |
| SAL_019 | Verify page refresh                                | Entered/saved information behaves as per application design.                                                                                                                                                  |
| SAL_020 | Verify browser Back button behavior                | Navigation follows application workflow without data inconsistency.                                                                                                                                           |

---

# Field Validations

### Category *

* Mandatory
* Searchable dropdown

Available values:

* Central Government Employee
* State Government Employee
* Public Sector Undertaking (PSU)
* Defence Services (Army, Navy, Air Force)
* Private Sector Employee – Corporate / MNC

---

### Organization's Name *

* Mandatory
* Text field
* Accepts valid organization name
* Validation displayed when empty

---

### Annual Income *

* Mandatory
* Numeric field
* Accepts only valid numeric values
* Should not accept alphabets or unsupported special characters

---

### Source of Income *

* Mandatory
* Text field
* Accepts valid source of income
* Validation displayed when empty

---

# Acceptance Criteria

* Salaried Information page is displayed after the previous workflow.
* Category dropdown contains all configured employment categories.
* Category dropdown supports search.
* Organization's Name is mandatory.
* Annual Income is mandatory and accepts valid numeric values only.
* Source of Income is mandatory.
* Mandatory field validations are displayed appropriately.
* User can successfully submit valid information.

# AC21: Verify Applicant Photo & Signature Capture

**Given**
The applicant has successfully completed all previous onboarding steps (including Joint Applicant verification, where applicable).

**When**
The application navigates to the **Applicant Photo** step.

**Then**

For each applicant (**Primary Applicant** and, if applicable, **Joint Applicant**), the following should be displayed:

* Applicant Name (read-only)
* Upload Applicant Photo
* Upload Applicant Signature
* Submit button

---

## AC21.1: Verify Applicant Name

**Given**
The Applicant Photo page is opened.

**Then**

* Applicant Name is displayed as read-only.
* The displayed name matches the verified applicant details.
* Name cannot be edited.

---

## AC21.2: Verify Upload Applicant Photo

**Given**
User is on the Applicant Photo step.

**Then**

The system should provide two options to upload the applicant photo:

### Option 1: Direct Upload / Camera Capture

User should be able to:

* Upload an image from the local device (if supported).
* Capture a new photo using the device camera.

The uploaded image should be displayed as a preview after successful upload.

---

### Option 2: Verified Photo

A **Verified Photo** option should be available.

**When**
User selects **Verified Photo**.

**Then**

A popup should open containing:

**Title**

> Select Verified Photo

**Dropdown Options**

* Aadhaar Verification Photo
* Liveliness Verification Photo

---

### Auto Selection

If only one verified image source is available,

**Then**

* That image should be automatically selected.
* Message displayed:

> Only one image available — auto-selected.

User should still be able to confirm the selected image.

---

## AC21.3: Verify Upload Applicant Signature

**Given**
User is on the Applicant Photo step.

**Then**

The **Upload Applicant Signature** section should be displayed.

Only one option should be available:

* Capture Using Camera

The application should **not** provide:

* Browse Computer
* Upload File
* Drag & Drop

---

## AC21.4: Verify Capture Using Camera

**When**
User clicks **Capture Using Camera**.

**Then**

A live camera popup should open.

Popup title:

> Capture Image

The popup should display:

* Live camera preview
* Reverse-geocoded address
* Latitude
* Longitude
* Current timestamp
* Capture Photo button

---

## AC21.5: Verify Signature Capture

**When**

User captures the signature.

**Then**

* Captured signature preview is displayed.
* Signature is successfully saved.
* Camera popup closes.
* Signature section shows captured image.

---

## AC21.6: Verify Browser Permissions

**Given**

Camera capture is required.

**Then**

The browser context must have:

* Camera permission granted
* Geolocation permission granted

Otherwise:

* Capture popup may open.
* Submit action will silently fail to register.
* QA should ensure required permissions are granted before execution.

---

## AC21.7: Verify Submit

**Given**

Applicant Photo and Applicant Signature have been successfully captured or selected.

**When**

User clicks **Submit**.

**Then**

* Applicant photo is saved successfully.
* Applicant signature is saved successfully.
* Success message displayed:

> Details saved successfully!

* Application redirects to the next onboarding step.

---

## AC21.8: Verify Multiple Applicants

**Given**

The account contains a Joint Applicant.

**Then**

The Applicant Photo flow should be presented separately for:

* Primary Applicant
* Joint Applicant

Each applicant should independently:

* Display Applicant Name
* Upload/Select Applicant Photo
* Capture Signature
* Submit details

---

## Validation Rules

### Applicant Name

* Read-only.
* Auto-populated from applicant details.
* Cannot be modified.

### Applicant Photo

* Direct upload or camera capture supported (where applicable).
* Verified Photo option available.
* Verified Photo popup displays available image sources.
* Auto-select the only available source when applicable.

### Applicant Signature

* Mandatory.
* Camera capture only.
* File upload is not permitted.
* Preview displayed after successful capture.

### Camera Popup

Should display:

* Live camera preview
* Address
* Latitude
* Longitude
* Timestamp
* Capture Photo action

---

# AC22: Verify Nominee Details

**Given**
The applicant has successfully completed the **Applicant Photo** step for the **Primary Applicant** and, where applicable, the **Joint Applicant**.

**When**
The user clicks **Submit** on the final Applicant Photo step.

**Then**

* The application redirects to the **Nominee Details** page.
* A management table is displayed, following the same layout and behavior as the **Joint Applicant Details** page.
* The page should contain:

  * **+ Add** button
  * **Full Name** column
  * **Status** column
  * **Action** column (View/Edit)
  * **Delete** column
* User can add, view, edit, or delete nominee records.

---

## AC22.1: Verify Nominee Details Page

**Given**
User navigates to the Nominee Details page.

**Then**

The page should display:

* * Add button
* Nominee Details table
* Full Name column
* Status column
* Action column
* Delete option

If no nominee has been added, the table should be empty and ready for adding a nominee.

---

## AC22.2: Verify Add Nominee

**Given**
User is on the Nominee Details page.

**When**
User clicks **+ Add**.

**Then**

A Nominee Details form should be displayed containing the following fields:

* **Full Name** *
* **Relation of Nominee with Applicant** *
* **Date of Birth** *
* **Age (In Years)** *(Auto-calculated)*

---

## AC22.3: Verify Full Name

**Given**
The Add Nominee form is displayed.

**Then**

* Full Name is mandatory.
* Accepts alphabetic characters.
* Supports spaces between names.
* Numeric and special characters should be validated as per business rules.
* Appropriate validation message displayed when left blank.

---

## AC22.4: Verify Relation of Nominee with Applicant

**Given**
User is adding a nominee.

**When**
User clicks the **Relation of Nominee with Applicant** dropdown.

**Then**

A searchable dropdown should be displayed containing the same **17 relationship options** used in **Relationship with Main Applicant (AC20.5)**.

* Dropdown should support search/filter.
* Only one value can be selected.
* Selected value should be displayed after selection.
* Field is mandatory.

---

## AC22.5: Verify Date of Birth

**Given**
User is filling nominee details.

**Then**

* Date of Birth is mandatory.
* Date picker should be available.
* Future dates should not be allowed.
* Invalid dates should display validation.
* Selected date should populate correctly.

---

## AC22.6: Verify Age Auto Calculation

**Given**
A valid Date of Birth is selected.

**When**
The Date of Birth is entered.

**Then**

* **Age (In Years)** is automatically calculated.
* Age field is read-only.
* User cannot manually edit the age.
* Calculated age should accurately reflect the entered Date of Birth.

---

## AC22.7: Verify Save Nominee

**Given**
All mandatory nominee details are entered correctly.

**When**
User clicks **Submit/Save**.

**Then**

* Nominee details are saved successfully.
* Success message is displayed (if applicable).
* Newly added nominee appears in the Nominee Details table.
* Status is updated appropriately.
* Full Name is displayed in the table.
* Action and Delete options are available for the nominee.

---

## AC22.8: Verify Edit Nominee

**Given**
A nominee record exists.

**When**
User clicks the **Edit/View** action.

**Then**

* Existing nominee details are populated.
* User can update editable fields.
* Changes are saved successfully after submission.
* Updated information is reflected in the table.

---

## AC22.9: Verify Delete Nominee

**Given**
A nominee record exists.

**When**
User clicks the **Delete** option.

**Then**

* Confirmation prompt is displayed (if applicable).
* Upon confirmation, the nominee record is deleted.
* Deleted nominee is removed from the table.
* Remaining nominee records continue to display correctly.

---

## Validation Rules

### Full Name

* Mandatory.
* Should accept valid alphabetic input.
* Appropriate validation displayed for blank or invalid values.

### Relation of Nominee with Applicant

* Mandatory.
* Searchable dropdown.
* Displays the same 17 relationship options as **Relationship with Main Applicant (AC20.5)**.
* Only one option can be selected.

### Date of Birth

* Mandatory.
* Future dates are not allowed.
* Valid date format required.

### Age (In Years)

* Auto-calculated from Date of Birth.
* Read-only.
* Automatically updates when Date of Birth changes.

---

## Expected Result

* User can successfully add, edit, and delete nominee details.
* Age is automatically calculated based on the selected Date of Birth.
* Nominee records are displayed correctly in the management table.
* User can proceed to the next onboarding step after successfully saving nominee details.

# AC24: Verify Introducer Details

**Given**
The applicant has successfully completed the **Document Upload** step.

**When**
The user clicks **Submit** on the Document Upload page.

**Then**

* The application redirects to the **Introducer Details** page.
* The following mandatory fields should be displayed:

  * **Introducer's Name** *
  * **Introducer Account Number** *
  * **Period of Acquaintance** *
* A **Submit** button should be available.

---

## AC24.1: Verify Introducer Details Page

**Given**
User navigates to the Introducer Details page.

**Then**

The page should display the following mandatory fields:

* Introducer's Name *
* Introducer Account Number *
* Period of Acquaintance *
* Submit button

---

## AC24.2: Verify Introducer's Name

**Given**
User is on the Introducer Details page.

**Then**

* Introducer's Name is mandatory.
* The system should only accept the valid introducer name:

> **BHUWAN DNYANESHWAR PATLE**

* Any other value should be rejected as per business validation.

---

## AC24.3: Verify Introducer Account Number

**Given**
User enters an Introducer Account Number.

**When**
The entered account number matches an existing introducer account.

**Then**

The system should accept only the following valid account number:

| Introducer Name              | Account Number      |
| ---------------------------- | ------------------- |
| **BHUWAN DNYANESHWAR PATLE** | **100144590015067** |

* The account number should be validated against the existing account.
* Valid account number should allow the user to proceed.

---

## AC24.4: Verify Invalid Introducer Account Number

**Given**
User enters an account number that does not exist.

**When**
User clicks **Submit**.

**Then**

The system should display the validation message:

> **The account does not exist.**

* Details should not be saved.
* User should remain on the Introducer Details page until a valid account number is entered.

---

## AC24.5: Verify Period of Acquaintance

**Given**
User is filling introducer details.

**Then**

* Period of Acquaintance is mandatory.
* The accepted value for this scenario is:

> **25**

* Appropriate validation should be displayed if left blank.

---

## AC24.6: Verify Successful Submission

**Given**

The following valid details are entered:

| Field                     | Value                        |
| ------------------------- | ---------------------------- |
| Introducer's Name         | **BHUWAN DNYANESHWAR PATLE** |
| Introducer Account Number | **100144590015067**          |
| Period of Acquaintance    | **25**                       |

**When**
User clicks **Submit**.

**Then**

* Introducer details should be validated successfully.
* Details should be saved successfully.
* Application should redirect to the next onboarding step.

---

## Validation Rules

### Introducer's Name

* Mandatory.
* Only the following value is accepted:

> **BHUWAN DNYANESHWAR PATLE**

---

### Introducer Account Number

* Mandatory.
* Must match an existing account.
* Only the following account is accepted:

> **100144590015067**

* If the account does not exist, display:

> **The account does not exist.**

---

### Period of Acquaintance

* Mandatory.
* Accepted value for this scenario:

> **25**

* Blank values should display mandatory field validation.

---

## Test Data

| Introducer Name              | Account Number      | Period of Acquaintance |
| ---------------------------- | ------------------- | ---------------------- |
| **BHUWAN DNYANESHWAR PATLE** | **100144590015067** | **25**                 |

---

## Expected Result

* The system validates the Introducer's Name and Account Number against the existing introducer records.
* Only the valid introducer details are accepted.
* Invalid account numbers display **"The account does not exist."**
* Upon successful validation, the details are saved, and the application proceeds to the next onboarding step.

# AC25: Verify Lead Details

**Given**
The applicant has successfully completed the **Introducer Details** step.

**When**
The user clicks **Submit** on the Introducer Details page.

**Then**

* The application shall redirect to the **Lead Details** page.
* The page shall display the following mandatory fields:

  * **Lead Converter Code** *
  * **Verify** button (for Lead Converter Code)
  * **Sourcer Code** *
  * **Verify** button (for Sourcer Code)
  * **Submit** button

---

## AC25.1: Verify Lead Details Page

**Given**
The user navigates to the Lead Details page.

**Then**

The following components shall be displayed:

* Lead Converter Code *
* Verify button (Lead Converter Code)
* Sourcer Code *
* Verify button (Sourcer Code)
* Submit button

---

## AC25.2: Verify Lead Converter Code

**Given**
The user enters a Lead Converter Code.

**When**
The entered code is:

> **SAH09078**

**And** the user clicks **Verify**

**Then**

* The system shall validate the code successfully.
* The code shall be marked as **Verified**.
* A success indication/message shall be displayed (as per application behavior).

---

## AC25.3: Verify Invalid Lead Converter Code

**Given**
The user enters any Lead Converter Code other than:

> **SAH09078**

**When**
The user clicks **Verify**

**Then**

* The system shall reject the code.
* An appropriate validation/error message shall be displayed.
* The Lead Converter Code shall remain unverified.
* The user shall not be allowed to proceed until a valid code is verified.

---

## AC25.4: Verify Sourcer Code

**Given**
The user enters a Sourcer Code.

**When**
The entered code is:

> **SAH09078**

**And** the user clicks **Verify**

**Then**

* The system shall validate the code successfully.
* The Sourcer Code shall be marked as **Verified**.
* A success indication/message shall be displayed (as per application behavior).

---

## AC25.5: Verify Invalid Sourcer Code

**Given**
The user enters any Sourcer Code other than:

> **SAH09078**

**When**
The user clicks **Verify**

**Then**

* The system shall reject the code.
* An appropriate validation/error message shall be displayed.
* The Sourcer Code shall remain unverified.
* The user shall not be allowed to proceed until a valid code is verified.

---

## AC25.6: Mandatory Field Validation

**Given**
The user attempts to submit the Lead Details page.

**When**

One or more mandatory fields are blank or not verified.

**Then**

The system shall display appropriate validation messages.

Mandatory fields are:

* Lead Converter Code
* Sourcer Code

Both codes must be successfully **verified** before submission is allowed.

---

## AC25.7: Successful Submission

**Given**

The following valid details are entered and verified:

| Field               | Value        |
| ------------------- | ------------ |
| Lead Converter Code | **SAH09078** |
| Sourcer Code        | **SAH09078** |

**When**
The user clicks **Submit**.

**Then**

* Both codes shall be validated as verified.
* Lead Details shall be saved successfully.
* A success message shall be displayed (if configured).
* The application shall redirect to the next onboarding step.

---

# Validation Rules

### Lead Converter Code

* Mandatory.
* Must be verified before submission.
* Only the following value is accepted for this test scenario:

> **SAH09078**

---

### Sourcer Code

* Mandatory.
* Must be verified before submission.
* Only the following value is accepted for this test scenario:

> **SAH09078**

---

### Verify Action

* Each code has its own independent **Verify** button.
* Verification must succeed before the **Submit** action is allowed.
* Invalid or unverified codes shall prevent progression.

---

## Test Data

| Field               | Valid Value  |
| ------------------- | ------------ |
| Lead Converter Code | **SAH09078** |
| Sourcer Code        | **SAH09078** |

---

## Expected Result

* The system validates the **Lead Converter Code** and **Sourcer Code** independently using their respective **Verify** actions.
* Only the code **SAH09078** is accepted for both fields in this test scenario.
* Invalid codes are rejected with an appropriate validation message.
* After both codes are successfully verified, the user can submit the form, the details are saved successfully, and the application proceeds to the next onboarding step.

# AC26: Verify Application Submission

**Given**
The applicant has successfully completed all mandatory stages of the Savings Account Opening journey.

**When**
The user reaches the **Summary** page.

**Then**

* The Summary page shall display all information entered throughout the application journey for review.
* Each completed section shall display a **success (green) indicator**.
* Any editable section shall allow the user to modify the information before final submission.
* The **Submit** button shall remain disabled until all mandatory steps are completed successfully.
* Upon clicking **Submit**, the application shall be submitted successfully.
* The submitted application shall be removed from the **Pending** applications list.
* The application shall appear in the **Submitted** applications list with the status **"Sourcer Submit"**.
* The user shall be redirected to the **Application Dashboard**.

---

## AC26.1: Verify Summary Page

**Given**
The applicant has completed all previous onboarding steps.

**When**
The application navigates to the Summary page.

**Then**

The Summary page shall display all completed sections, including but not limited to:

* Mobile Verification
* Account Type
* eKYC Verification
* Liveliness Verification
* Address Details
* Branch Selection
* Basic Details
* Cheque Details (if applicable)
* Employment/Salaried Information
* Joint Applicant Details (if applicable)
* Applicant Photo(s)
* Nominee Details
* Document Upload
* Introducer Details
* Lead Details

Each completed section shall display a **green success indicator**.

---

## AC26.2: Verify Review of Entered Information

**Given**
The Summary page is displayed.

**Then**

* All information entered during the application journey shall be displayed accurately.
* Data shall match the information saved in each corresponding module.
* Read-only information shall be displayed correctly.
* Previously uploaded documents and captured images shall be referenced as per application design.

---

## AC26.3: Verify Edit from Summary

**Given**
The Summary page is displayed.

**When**
The user clicks **Edit** for an editable section (e.g., **Basic Details**).

**Then**

* The application shall navigate to the selected section.
* Previously entered values shall be prefilled.
* The user shall be able to update editable information.
* After saving the changes, the user shall be returned to the Summary page.
* The Summary page shall display the updated information.

---

## AC26.4: Verify Mandatory Completion Before Submission

**Given**
The Summary page is displayed.

**When**
One or more mandatory onboarding steps are incomplete.

**Then**

* The **Submit** button shall remain disabled or submission shall be prevented.
* The incomplete section(s) shall be highlighted.
* The user shall be prompted to complete the pending mandatory information before submission.

---

## AC26.5: Verify Successful Application Submission

**Given**

* All mandatory onboarding steps are completed successfully.
* All mandatory validations have passed.

**When**
The user clicks **Submit**.

**Then**

* The system shall invoke the **POST `app/summary/submit`** API.
* The application shall be submitted successfully.
* A success confirmation message shall be displayed (if configured).

---

## AC26.6: Verify Application Status

**Given**
The application has been submitted successfully.

**Then**

* The application shall no longer appear in the **Pending** application list.
* The application shall appear in the **Submitted** application list.
* The application status shall be displayed as:

> **Sourcer Submit**

---

## AC26.7: Verify Redirection

**Given**
The application submission is successful.

**When**
Submission is completed.

**Then**

* The user shall be redirected to the **Application Dashboard**.
* The newly submitted application shall be available under the **Submitted** tab with the status **"Sourcer Submit"**.

---

# Validation Rules

### Summary Page

* Displays all completed onboarding sections.
* Shows accurate applicant information.
* Displays a green success indicator for every completed section.

### Edit Functionality

* Editable sections can be modified from the Summary page.
* Updated information shall be reflected immediately after saving.

### Submission

* Submit is permitted only after all mandatory onboarding steps are completed.
* Submission invokes the **POST `app/summary/submit`** API.
* Duplicate submissions shall be prevented while the request is in progress.

### Application Status

After successful submission:

* Removed from **Pending** applications.
* Added to **Submitted** applications.
* Status updated to **Sourcer Submit**.

---

## Expected Result

* The Summary page provides a complete review of the application with a success indicator for every completed section.
* Users can edit eligible sections before final submission.
* Final submission is allowed only after all mandatory requirements are satisfied.
* On successful submission, the application is removed from the **Pending** list, appears under the **Submitted** list with the status **"Sourcer Submit"**, and the user is redirected to the **Application Dashboard**.

You can add the following acceptance criteria to **AC26: Application Submission**.

---

## AC26.8: Verify Redirection to Application Dashboard

**Given**
The application has been submitted successfully.

**When**
The user clicks **Submit** on the Summary page.

**Then**

* The user shall be redirected to the **Application Dashboard**.
* The Application Dashboard shall load successfully without any errors.
* The dashboard shall display the application summary cards (Pending, Submitted, Re-Assigned, and Decisioned).
* The submitted application shall be available under the appropriate application list.

---

## AC26.9: Verify Submitted Application Status

**Given**
The application has been submitted successfully.

**When**
The user navigates to the **Submitted** applications list.

**Then**

* The submitted application shall be displayed in the **Submitted** tab.
* The application shall no longer be displayed under the **Pending** applications list.
* The application details shall be displayed correctly, including:

  * Application ID
  * Customer Type
  * Application Date
  * Applicant Name
  * Mobile Number
  * Status
* The application status shall be displayed as:

> **Sourcer Submit**

---

## AC26.10: Verify Submitted Application Details

**Given**
The application is displayed in the **Submitted** applications list.

**When**
The user searches using the **Application ID** or **Mobile Number**.

**Then**

* The correct application shall be returned in the search results.
* The displayed Application ID shall match the submitted application.
* The Applicant Name shall match the submitted applicant.
* The Customer Type shall match the selected account type (Self/Joint, as applicable).
* The Application Date shall match the submission date.
* The Mobile Number shall match the registered applicant's mobile number.
* The Status shall be displayed as **"Sourcer Submit"**.

---

### Expected Result

* After successful submission, the user is redirected to the **Application Dashboard**.
* The application is removed from the **Pending** list.
* The application is visible in the **Submitted** list.
* The application details (Application ID, Applicant Name, Customer Type, Application Date, Mobile Number, and Status) are displayed correctly.
* The application status is displayed as **"Sourcer Submit"**.



