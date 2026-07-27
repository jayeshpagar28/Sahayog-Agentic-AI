Module 10 – Forgot User ID
Document Information
Item	Details
Module	Forgot User ID
Module ID	FUI
Application	SAHAYOG Web Portal
Automation Target	Playwright + TypeScript
Design Pattern	Page Object Model (POM)
Priority	High
Automation Type	Functional + Smoke + Regression

1. Module Overview
The Forgot User ID module enables registered users to recover their User ID using their registered Mobile Number.
Upon successful validation, the system sends a Reference ID to the user's registered contact, which the user then submits together with their User ID and Date of Birth in a second identity-verification step before the User ID is disclosed.
This module ensures that only registered users can recover their account information securely.

2. Business Objective
Provide a secure mechanism for recovering a forgotten User ID by:
Validating the registered Mobile Number. 
Preventing unauthorized recovery attempts. 
Sending a Reference ID associated with the Mobile Number. 
Verifying identity via Reference ID, User ID, and Date of Birth. 
Displaying appropriate success and validation messages. 

3. User Stories
User Story 1 – Recover User ID
As a registered user,
I want to recover my User ID using my registered Mobile Number,
So that I can access my account again.

User Story 2 – Mobile Number Validation
As a registered user,
I want the system to validate my Mobile Number,
So that only valid registered users can request User ID recovery.

User Story 3 – Receive Reference ID
As a registered user,
I want to receive a Reference ID associated with my Mobile Number,
So that I can continue with identity verification.

User Story 4 – Verify Identity
As a registered user,
I want to submit my Reference ID, User ID, and Date of Birth,
So that the system can verify my identity before disclosing my User ID.

User Story 5 – Cancel Recovery
As a user,
I want to cancel the recovery process,
So that I can return to the Login page.

4. Actors
Primary Actor
Registered User 
Secondary Actors
Authentication Service 
SMS/Notification Service 
User Management Service 
Database 
Audit Service 

5. Preconditions
SAHAYOG Portal is accessible. 
Forgot User ID page is loaded. 
User account exists. 
Registered Mobile Number is available. 
Notification service is operational. 
Authentication service is active. 

6. Post Conditions
Successful Recovery
Mobile Number validated. 
Reference ID generated. 
Identity verified via Reference ID, User ID, and Date of Birth. 
User ID disclosed / success message displayed. 
Failed Recovery
Reference ID not generated, or identity verification fails. 
User remains on the Forgot User ID page. 
Validation message displayed. 

7. UI Components
Branding
SAHAYOG Logo 
Powered By Netwin 
Illustration Image 
Labels
Recover Your User ID 
Description text 
Step 1 – Input Controls
Mobile Number textbox 
Step 2 – Input Controls (revealed after a valid Step 1 submission)
Reference ID textbox 
User ID textbox 
Date of Birth picker 
Buttons
Send Reference ID (Step 1) 
Submit (Step 2) 
Cancel 
Validation
Mobile Number Required 
Invalid Mobile Number 
User Not Found 
Reference ID Required 
User ID Required 
Date of Birth Required 
Reference ID Mismatch 
Success Message 

8. Functional Workflow
Scenario 1 – Open Forgot User ID
User clicks Forgot User ID on Login page.
System opens Forgot User ID screen.

Scenario 2 – Recover User ID (Step 1)
User enters registered Mobile Number.
Clicks Send Reference ID.
System validates the Mobile Number.
System sends a Reference ID.
Step 2 verification form (Reference ID, User ID, Date of Birth) is revealed.

Scenario 3 – Invalid Mobile Number
User enters an unregistered Mobile Number.
Clicks Send Reference ID.
System displays:
"User not found"

Scenario 4 – Blank Mobile Number
User clicks Send Reference ID without entering a Mobile Number.
System displays:
"Mobile Number is required."

Scenario 5 – Identity Verification (Step 2)
User enters Reference ID, User ID, and Date of Birth.
Clicks Submit.
System validates all three fields against the record associated with the Reference ID.
On success, the User ID is disclosed / a success message is shown.
On mismatch, system displays:
"Reference ID mismatch"

Scenario 6 – Cancel
User clicks Cancel.
System returns to Login page.

9. Functional Requirements (FUI_FR)
Forgot User ID Page
FUI_FR_001
The system shall allow users to access the Forgot User ID page from the Login page.

FUI_FR_002
The Forgot User ID page shall display the SAHAYOG branding, title, and recovery instructions.

FUI_FR_003
The system shall display a Mobile Number input field in Step 1.

FUI_FR_004
The system shall display a Send Reference ID button.

FUI_FR_005
The system shall display a Cancel button.

Mobile Number Validation
FUI_FR_006
The Mobile Number field shall be mandatory.

FUI_FR_007
The system shall validate the Mobile Number format before processing the request.

FUI_FR_008
Only registered Mobile Numbers shall be accepted.

FUI_FR_009
Leading and trailing spaces shall be removed before validation.

Step 2 – Identity Verification
FUI_FR_010
Upon a valid Step 1 submission, the system shall reveal a Step 2 form requiring Reference ID, User ID, and Date of Birth.

FUI_FR_011
The Reference ID, User ID, and Date of Birth fields shall each be mandatory in Step 2.

FUI_FR_012
The system shall validate the Step 2 fields against the record associated with the generated Reference ID.

Recovery Process
FUI_FR_013
Upon successful Step 1 validation, the system shall generate a recovery request.

FUI_FR_014
The system shall send a Reference ID associated with the registered Mobile Number.

FUI_FR_015
A success message shall be displayed after successful Step 2 verification.

FUI_FR_016
The system shall prevent duplicate recovery requests within the configured time interval (if applicable).

Reference ID Lifecycle
FUI_FR_021
A new Reference ID shall be generated each time a Forgot User ID request is initiated.

FUI_FR_022
The generated Reference ID shall remain valid for 720 hours (30 days) from the time of creation.
Example: Reference ID SAHA071620265083, Validity Period: 720 hours.

FUI_FR_023
Reference ID requests submitted after the 720-hour validity window has elapsed shall be rejected.

Navigation
FUI_FR_017
Selecting Cancel shall return the user to the Login page.

FUI_FR_018
The browser Back button shall return to the Login page without errors.

Audit
FUI_FR_019
The system shall record all successful recovery requests.

FUI_FR_020
The system shall log failed recovery attempts.

FUI_FR_024
Audit logs shall include:
Mobile Number 
Request Time 
Request Status 
IP Address (if applicable) 

10. Business Rules (FUI_BR)
FUI_BR_001
Only registered users can recover their User ID.

FUI_BR_002
Mobile Number is mandatory.

FUI_BR_003
Mobile Number format must comply with the configured mobile number format.

FUI_BR_004
A Reference ID shall be generated only for a Mobile Number mapped to a registered account.

FUI_BR_005
System shall not disclose whether other user information exists.

FUI_BR_006
Recovery requests shall be logged.

FUI_BR_007
Sensitive information shall never be displayed on-screen.

FUI_BR_008
Multiple rapid recovery requests may be restricted according to configured security policies.

FUI_BR_009
Users shall be redirected to Login after cancellation.

FUI_BR_010
All recovery requests shall follow the configured authentication policy.

FUI_BR_011
A Reference ID is valid for 720 hours (30 days) from the time it is generated; a Reference ID submitted after its validity period has expired shall be rejected.

FUI_BR_012
Step 2 identity verification (Reference ID, User ID, Date of Birth) must all match the record associated with the Reference ID before the User ID is disclosed.

11. Validation Rules (FUI_VR)
FUI_VR_001
Mobile Number is mandatory.

FUI_VR_002
Mobile Number shall follow the configured mobile number format.

FUI_VR_003
Unregistered Mobile Numbers shall display:
"User not found"

FUI_VR_004
Blank Mobile Number shall display:
"Mobile Number is required."

FUI_VR_005
Mobile Numbers containing only spaces shall be treated as blank.

FUI_VR_006
Non-numeric characters shall be rejected in the Mobile Number field.

FUI_VR_007
Reference ID, User ID, and Date of Birth shall each be mandatory in Step 2.

FUI_VR_008
Recovery request shall not proceed if validation fails at either step.

12. Functional Workflow
Scenario 1 – Recover User ID
1.User opens Forgot User ID. 
2.User enters registered Mobile Number. 
3.User clicks Send Reference ID. 
4.System validates the Mobile Number. 
5.System sends a Reference ID and reveals the Step 2 form. 
6.User submits Reference ID, User ID, and Date of Birth. 
7.Success message is displayed. 

Scenario 2 – Invalid Mobile Number
1.User enters an unregistered Mobile Number. 
2.Clicks Send Reference ID. 
Expected Result
Recovery request is rejected. 
Appropriate validation message is displayed. 

Scenario 3 – Blank Mobile Number
1.Leave Mobile Number blank. 
2.Click Send Reference ID. 
Expected Result
Mandatory validation message appears. 
No recovery request is sent. 

Scenario 4 – Step 2 Mismatch
1.Complete Step 1 successfully. 
2.Enter a Reference ID, User ID, or Date of Birth that does not match the record. 
3.Click Submit. 
Expected Result
Reference ID mismatch error is displayed. 
User remains on Step 2. 

Scenario 5 – Cancel
1.User clicks Cancel. 
Expected Result
User is redirected to the Login page. 

13. Field Validation Matrix
Field	Mandatory	Validation
Mobile Number (Step 1)	Yes	Registered mobile number, numeric only
Reference ID (Step 2)	Yes	Matches the Reference ID generated in Step 1
User ID (Step 2)	Yes	Matches the registered User ID
Date of Birth (Step 2)	Yes	Matches the registered Date of Birth


14. UI Validation Checklist
Validate:
SAHAYOG Logo is displayed. 
Recover Your User ID heading is visible. 
Instruction text is displayed. 
Mobile Number textbox is visible. 
Placeholder text is correct. 
Mandatory (*) indicator is displayed. 
Send Reference ID button is visible. 
Step 2 fields (Reference ID, User ID, Date of Birth) appear after a valid Step 1 submission. 
Cancel button is visible. 
Powered By Netwin footer is displayed. 
Page is responsive on different screen sizes. 

15. Security Requirements
Verify:
Only registered Mobile Numbers can initiate recovery. 
Recovery request is transmitted over HTTPS. 
Sensitive information is not exposed in URLs. 
Mobile Numbers are not logged in browser console. 
Recovery requests are audit logged. 
Browser Back button does not expose sensitive recovery data after navigation. 
Rate limiting is enforced for repeated requests (if applicable). 

16. Negative Test Scenarios
Blank Mobile Number. 
Invalid Mobile Number format. 
Unregistered Mobile Number. 
Mobile Number with leading/trailing spaces. 
SQL Injection attempt. 
XSS payload in Mobile Number / Step 2 fields. 
Extremely long Mobile Number. 
Multiple rapid clicks on Send Reference ID. 
Step 2 blank submission. 
Step 2 Reference ID / User ID / Date of Birth mismatch. 
Network interruption during request. 
Notification service unavailable. 
Reference ID submitted after its 720-hour validity period has expired. 

17. Edge Cases
Maximum Mobile Number length. 
Browser refresh during submission (including mid-Step-2). 
Session timeout while on recovery page. 
Slow server response. 
Multiple browser tabs submitting requests simultaneously. 

18. Automation Scope
Smoke Tests
Forgot User ID page loads. 
Send Reference ID using valid Mobile Number. 
Cancel navigation. 
Functional Tests
Mobile Number validation. 
Registered Mobile Number recovery. 
Unregistered Mobile Number validation. 
Step 2 identity verification (Reference ID, User ID, Date of Birth). 
Success message. 
Cancel functionality. 
Negative Tests
Blank Mobile Number. 
Invalid Mobile Number. 
Step 2 mismatch. 
SQL Injection. 
XSS. 
Rapid multiple submissions. 

19. Expected Playwright Assertions
The automation suite shall verify:
Correct page URL. 
Correct page title. 
Logo displayed. 
Mobile Number field visible. 
Send Reference ID button enabled. 
Step 2 fields visible after valid Step 1 submission. 
Cancel button visible. 
Mandatory validation messages. 
Invalid Mobile Number validation. 
Success confirmation displayed. 
Navigation back to Login. 

20. Reusable Page Object Methods
openForgotUserIdPage()

verifyPageLoaded()

enterMobileNumber(mobileNumber)

clickSendReferenceId()

enterReferenceId(referenceId)

enterUserId(userId)

selectDateOfBirth(date)

clickSubmit()

clickCancel()

verifyValidationMessage(message)

verifySuccessMessage()

verifyMobileNumberField()

verifyStep2FieldsVisible()

verifyButtons()

navigateBackToLogin()

21. GitHub Copilot / Cursor AI Prompt
Objective
Generate enterprise-grade Playwright automation scripts for the Forgot User ID module using TypeScript and the Page Object Model (POM).
Cover the following scenarios:
Forgot User ID page UI validation. 
Registered Mobile Number recovery. 
Invalid Mobile Number validation. 
Blank Mobile Number validation. 
Step 2 identity verification (Reference ID, User ID, Date of Birth). 
Cancel navigation. 
Success message validation. 
Security and negative scenarios. 
Coding Standards
Use reusable Page Objects. 
Use Playwright best practices. 
Use robust locators. 
Avoid hard-coded waits. 
Externalize test data. 
Support CI/CD execution. 

22. Requirement Traceability Matrix
Requirement ID	Covered By
FUI_FR_001 – FUI_FR_024	Forgot User ID Functionality
FUI_BR_001 – FUI_BR_012	Business Rules
FUI_VR_001 – FUI_VR_008	Validation Rules

23. Test Data Requirements
Test Data	Description
Registered Mobile Number	Existing user mobile number
Unregistered Mobile Number	Mobile number not mapped to any account
Invalid Mobile Number	Non-numeric / incorrect format
Valid Reference ID + User ID + DOB	Fully matching Step 2 identity data
Mismatched Reference ID / User ID / DOB	Step 2 data that does not match the record

24. Dependencies
Login Module 
User Management Service 
Authentication Service 
SMS/Notification Service 
Database 
Audit Logging Service