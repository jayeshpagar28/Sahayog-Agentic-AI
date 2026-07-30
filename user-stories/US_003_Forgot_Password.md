Module 11 – Forgot Password

1. Module Overview
The Forgot Password module enables registered users to securely reset their account password when they are unable to log in.
The user initiates the password recovery process by providing their registered User ID. Upon successful validation, the system generates a Reference ID. The user then submits the Reference ID together with their User ID and Date of Birth in a second identity-verification step before the password reset step is unlocked.
This module ensures that password recovery is performed securely while preventing unauthorized password reset attempts.

2. Business Objective
The Forgot Password module aims to:
Allow registered users to reset forgotten passwords. 
Validate the entered User ID. 
Generate a Reference ID associated with the User ID. 
Verify identity via Reference ID, User ID, and Date of Birth before allowing a password reset. 
Prevent unauthorized password reset requests. 
Maintain secure authentication and audit logging throughout the recovery process. 

3. User Stories
User Story 1 – Recover Password
As a registered user,
I want to initiate the password recovery process,
So that I can regain access to my account.

User Story 2 – Validate User ID
As a registered user,
I want the system to validate my User ID,
So that only valid accounts can request password recovery.

User Story 3 – Receive Reference ID
As a registered user,
I want to receive a Reference ID associated with my User ID,
So that I can continue with identity verification.

User Story 4 – Verify Identity
As a registered user,
I want to submit my Reference ID, User ID, and Date of Birth,
So that the system can verify my identity before allowing a password reset.

User Story 5 – Prevent Unauthorized Reset
As a user,
I want the system to reject invalid recovery requests,
So that unauthorized users cannot reset passwords.

User Story 6 – Cancel Recovery
As a user,
I want to cancel the password recovery process,
So that I can return to the Login page.

4. Actors
Primary Actor
Registered User 
Secondary Actors
Authentication Service 
Password Recovery Service 
User Management Service 
Database 
Audit Logging Service 

5. Preconditions
Before initiating password recovery:
SAHAYOG Portal is accessible. 
Forgot Password page is available. 
User account exists. 
User account is active. 
Authentication service is available. 

6. Post Conditions
Successful Password Recovery Request
User ID is validated. 
Reference ID is generated. 
Identity is verified via Reference ID, User ID, and Date of Birth. 
Password reset step is unlocked. 
Audit entry is created. 

Failed Password Recovery Request
Reference ID is not generated, or identity verification fails. 
User remains on the Forgot Password page. 
Appropriate validation or error message is displayed. 

7. UI Components
Branding
Display:
SAHAYOG Logo 
Illustration Image 
Powered By Netwin Footer 

Labels
Display:
Reset Your Password 
Recovery Instructions 

Step 1 – Input Controls
User ID textbox 

Step 2 – Input Controls (revealed after a valid Step 1 submission)
Reference ID textbox 
User ID textbox 
Date of Birth picker 

Buttons
Send Reference ID (Step 1) 
Submit (Step 2) 
Cancel 

Validation Controls
Display validation messages for:
User ID Required 
Invalid User ID 
User Not Found 
Reference ID Required 
Date of Birth Required 
Reference ID Mismatch 
Success Message 
Server Error 

8. Functional Workflow
Scenario 1 – Open Forgot Password
1.User clicks Forgot Password from the Login page. 
2.System opens the Forgot Password screen. 
Expected Result
Forgot Password page loads successfully. 
User ID field is visible. 
Send Reference ID button is enabled. 
Cancel button is displayed. 

Scenario 2 – Password Recovery Request (Step 1)
1.User enters a valid User ID. 
2.Clicks Send Reference ID. 
3.System validates the User ID. 
4.Reference ID is generated. 
5.Step 2 verification form (Reference ID, User ID, Date of Birth) is revealed. 
Expected Result
Recovery request is successfully initiated. 
Step 2 identity-verification fields become visible. 

Scenario 3 – Identity Verification (Step 2)
1.User enters Reference ID, User ID, and Date of Birth. 
2.Clicks Submit. 
3.System validates all three fields against the record associated with the Reference ID. 
Expected Result
On success, the password reset step is unlocked. 
On mismatch, "Reference ID mismatch" is displayed and the user remains on Step 2. 

Scenario 4 – Invalid User ID
1.User enters an invalid or non-existing User ID. 
2.Clicks Send Reference ID. 
Expected Result
System rejects the request. 
Appropriate validation message is displayed. 
No Reference ID is generated. 

Scenario 5 – Blank User ID
1.Leave User ID blank. 
2.Click Send Reference ID. 
Expected Result
Mandatory validation message appears. 
No recovery request is processed. 

Scenario 6 – Cancel Password Recovery
1.User clicks Cancel. 
Expected Result
User is redirected to the Login page. 

9. Test Case Traceability
Test Case ID	Covered
FP_TS001_TC_01	Forgot Password Page UI Validation
FP_TS001_TC_02	User ID Validation
FP_TS001_TC_03	Send Reference ID
FP_TS001_TC_04	Step 2 Identity Verification (Reference ID, User ID, Date of Birth)
FP_TS001_TC_05	Mandatory Field Validation
FP_TS001_TC_06	Cancel Navigation

10. Assumptions
User has a registered account. 
User has internet connectivity. 
Backend authentication service is available. 
11. Module Summary
The Forgot Password module provides a secure mechanism for initiating password recovery using the registered User ID. It validates the User ID, generates a Reference ID, verifies identity via Reference ID, User ID, and Date of Birth, and ensures that only authorized users can proceed with password reset. The module also maintains audit logs and follows security best practices to prevent misuse.
12. Functional Requirements (FP_FR)
Forgot Password Page
FP_FR_001
The system shall allow users to access the Forgot Password page from the Login page.

FP_FR_002
The Forgot Password page shall display the SAHAYOG logo, page title, recovery instructions, and branding.

FP_FR_003
The system shall display a mandatory User ID input field in Step 1.

FP_FR_004
The system shall display a Send Reference ID button.

FP_FR_005
The system shall display a Cancel button.

User ID Validation
FP_FR_006
The User ID field shall be mandatory.

FP_FR_007
The system shall validate the entered User ID before processing the request.

FP_FR_008
Only active and registered User IDs shall be accepted.

FP_FR_009
Leading and trailing spaces shall be trimmed before validation.

FP_FR_010
User ID validation shall be case-insensitive if configured.

Step 2 – Identity Verification
FP_FR_028
Upon a valid Step 1 submission, the system shall reveal a Step 2 form requiring Reference ID, User ID, and Date of Birth.

FP_FR_029
The Reference ID, User ID, and Date of Birth fields shall each be mandatory in Step 2.

FP_FR_030
The system shall validate the Step 2 fields against the record associated with the generated Reference ID before unlocking the password reset step.

Password Recovery Process
FP_FR_011
Upon successful Step 1 validation, the system shall generate a password recovery request.

FP_FR_012
The system shall generate a unique Reference ID.

FP_FR_013
A success message shall be displayed after successful Step 2 identity verification.

FP_FR_014
A success message shall be displayed after the recovery request is created.

FP_FR_015
The system shall prevent duplicate recovery requests within the configured security interval.

FP_FR_016
Reference IDs shall remain valid only for the configured expiry duration.

FP_FR_017
Expired Reference IDs shall not be accepted in the Step 2 verification.

FP_FR_026
A new Reference ID shall be generated each time a Forgot Password request is initiated.

FP_FR_027
The generated Reference ID shall remain valid for 720 hours (30 days) from the time of creation.
Example: Reference ID SAHA071620265083, Validity Period: 720 hours.

Navigation
FP_FR_018
Selecting Cancel shall redirect the user to the Login page.

FP_FR_019
Browser Back navigation shall function without displaying application errors.

FP_FR_020
Users shall be able to initiate a new recovery request after cancelling the previous one.

Audit
FP_FR_021
Every successful recovery request shall be logged.

FP_FR_022
Failed recovery attempts shall be recorded.

FP_FR_023
The audit log shall capture:
User ID 
Request Time 
Recovery Status 
IP Address (if applicable) 

FP_FR_024
Recovery request history shall be available for audit purposes.

FP_FR_025
The system shall not expose sensitive authentication information in audit logs visible to end users.

13. Business Rules (FP_BR)
FP_BR_001
Only registered users may initiate password recovery.

FP_BR_002
User ID is mandatory.

FP_BR_003
Password recovery shall only be initiated for active accounts.

FP_BR_004
A Reference ID shall be generated only for a User ID mapped to a registered account.

FP_BR_005
Reference IDs shall expire after the configured validity period.

FP_BR_006
Only one active Reference ID may exist per recovery request, if configured.

FP_BR_007
Recovery requests shall not reveal confidential account information.

FP_BR_008
Password recovery activities shall be audit logged.

FP_BR_009
Multiple rapid password recovery requests may be rate-limited according to security policies.

FP_BR_010
Users selecting Cancel shall return to the Login page.

FP_BR_011
The system shall maintain the confidentiality of all recovery information.

FP_BR_012
Password recovery shall comply with the organization's authentication policy.

FP_BR_013
A Reference ID is valid for 720 hours (30 days) from the time it is generated; a Reference ID submitted after its validity period has expired shall be rejected.

FP_BR_014
Step 2 identity verification (Reference ID, User ID, Date of Birth) must all match the record associated with the Reference ID before the password reset step is unlocked.

14. Validation Rules (FP_VR)
FP_VR_001
User ID is mandatory.

FP_VR_002
Blank User ID shall display:
"User ID is required."

FP_VR_003
Invalid User ID shall display an appropriate validation message.

FP_VR_004
Inactive User IDs shall not initiate password recovery.

FP_VR_005
User IDs containing only spaces shall be treated as blank.

FP_VR_006
User IDs exceeding configured maximum length shall be rejected.

FP_VR_007
Special characters shall be validated according to configured User ID rules.

FP_VR_008
Password recovery shall not proceed until all Step 1 validations pass.

FP_VR_009
Reference ID, User ID, and Date of Birth shall each be mandatory in Step 2.

FP_VR_010
A mismatch in any Step 2 field shall display "Reference ID mismatch" and keep the password reset step locked.

15. Functional Workflows
Workflow 1 – Open Forgot Password
1.User clicks Forgot Password from the Login page. 
2.System opens the Forgot Password screen. 
Expected Result
Forgot Password page loads successfully. 
User ID textbox is available. 
Recovery instructions are displayed. 

Workflow 2 – Send Reference ID
1.User enters a registered User ID. 
2.Clicks Send Reference ID. 
3.System validates the User ID. 
4.Reference ID is generated. 
5.Step 2 verification form is revealed. 
Expected Result
Password recovery request is created successfully. 
Step 2 identity-verification fields become visible. 

Workflow 3 – Step 2 Identity Verification
1.User enters Reference ID, User ID, and Date of Birth. 
2.Clicks Submit. 
Expected Result
On success, the password reset step is unlocked. 
On mismatch, "Reference ID mismatch" is displayed. 

Workflow 4 – Invalid User ID
1.User enters an invalid User ID. 
2.Clicks Send Reference ID. 
Expected Result
Recovery request is rejected. 
Appropriate validation message is displayed. 

Workflow 5 – Blank User ID
1.Leave the User ID field blank. 
2.Click Send Reference ID. 
Expected Result
Mandatory validation message is displayed. 
Recovery process does not continue. 

Workflow 6 – Cancel Password Recovery
1.User clicks Cancel. 
Expected Result
User is redirected to the Login page. 

16. Field Validation Matrix
Field	Mandatory	Validation
User ID (Step 1)	Yes	Registered active User ID
Reference ID (Step 2)	Yes	Matches the Reference ID generated in Step 1
User ID (Step 2)	Yes	Matches the registered User ID
Date of Birth (Step 2)	Yes	Matches the registered Date of Birth
17. UI Validation Checklist
The Forgot Password page shall be validated to ensure that all UI elements are displayed correctly, are responsive, and function consistently across supported browsers and devices.

17.1 Branding Section
Validate:
SAHAYOG Logo is visible. 
Organization name is displayed correctly. 
Illustration image is displayed. 
Powered By Netwin footer is visible. 
Version number is displayed (if applicable). 
Expected Result
Branding elements are correctly aligned. 
Images load without distortion. 
Footer remains visible on different screen resolutions. 

17.2 Page Information
Verify:
Reset Your Password heading. 
Instruction text. 
Mandatory (*) indicator for User ID. 
Validation Points:
Heading is readable. 
Font size follows UI guidelines. 
Instruction text is displayed correctly. 
No spelling or alignment issues. 

17.3 Step 1 – User ID Field
Validate:
User ID textbox is visible. 
Textbox is editable. 
Placeholder text is displayed. 
Cursor appears on click. 
Keyboard input is accepted. 
Copy/Paste is supported. 
Validation Points:
Mandatory indicator is visible. 
Placeholder disappears after typing. 
Leading and trailing spaces are trimmed during validation. 

17.4 Step 2 – Identity Verification Fields
Validate:
Reference ID, User ID, and Date of Birth fields appear after a valid Step 1 submission. 
Each field has a visible label with a mandatory (*) indicator. 
Date of Birth uses a native date picker. 

17.5 Buttons
Send Reference ID
Verify:
Button is visible. 
Proper color and styling. 
Hover effect works. 
Keyboard accessible. 
Button text is readable. 

Cancel
Verify:
Button is visible. 
Clicking redirects to Login page. 
Keyboard accessible. 
Hover effect works. 

17.6 Responsive Validation
Validate on:
Desktop 
Laptop 
Tablet 
Mobile (if supported) 
Browser Zoom:
80% 
100% 
125% 
150% 
200% 

18. Security Requirements
The Forgot Password module shall comply with the following security controls.

Authentication
Verify:
Only registered users can request password recovery. 
Invalid User IDs cannot initiate recovery. 
Session timeout redirects users appropriately. 

Authorization
Validate:
Unauthorized users cannot reset another user's password. 
Direct URL manipulation does not bypass validation. 
Recovery process follows configured authentication policies. 

Data Protection
Verify:
Recovery request is transmitted using HTTPS. 
User ID is not exposed in URL parameters. 
Sensitive information is not written to browser console. 
Recovery data is not stored insecurely in browser storage. 

Session Management
Validate:
Recovery process handles expired sessions gracefully. 
Browser Back button does not expose sensitive recovery information after cancellation. 
Refresh behavior follows business requirements. 

Audit Requirements
Verify the system logs:
Password recovery request. 
Successful Reference ID generation. 
Failed recovery attempts. 
Step 2 verification attempts (success and failure). 
Request timestamp. 
User ID. 
IP Address (if configured). 

19. Negative Test Scenarios
User ID Validation
Validate:
Blank User ID. 
Invalid User ID. 
Inactive User ID. 
User ID with only spaces. 
Special characters. 
Extremely long User ID. 

Step 2 Validation
Validate:
Blank Reference ID, User ID, or Date of Birth. 
Mismatched Reference ID, User ID, or Date of Birth. 

Security Validation
Validate:
SQL Injection attempt. 
Cross-Site Scripting (XSS). 
HTML Injection. 
Script Injection. 
URL manipulation. 
Multiple rapid recovery requests. 

System Validation
Validate:
Authentication service unavailable. 
Database unavailable. 
Slow network. 
Network interruption during submission. 
Reference ID submitted after its 720-hour validity period has expired. 

20. Boundary Test Cases
Validate:
Minimum User ID length. 
Maximum User ID length. 
Maximum supported recovery requests. 
Long server response times. 
Browser zoom up to 200%. 

21. Edge Cases
Validate:
Multiple browser tabs. 
Browser refresh during recovery (including mid-Step-2). 
Browser Back after successful request. 
Session expiration while on Forgot Password page. 
Simultaneous recovery requests. 
Slow internet connection. 
Repeated clicking of Send Reference ID button. 

22. Automation Scope
Smoke Tests
Forgot Password page loads successfully. 
Send Reference ID using valid User ID. 
Cancel button redirects to Login page. 

Functional Tests
UI validation. 
User ID validation. 
Registered User ID recovery. 
Step 2 identity verification (Reference ID, User ID, Date of Birth). 
Invalid User ID. 
Mandatory validation. 
Success message validation. 
Cancel navigation. 

Regression Tests
Complete Forgot Password workflow. 
UI consistency. 
Validation messages. 
Navigation. 
Error handling. 
Recovery request generation. 

Negative Tests
Blank User ID. 
Invalid User ID. 
Step 2 mismatch. 
SQL Injection. 
XSS. 
HTML Injection. 
Multiple submissions. 
Network interruption. 

Security Tests
HTTPS validation. 
Session timeout. 
URL security. 
Browser Back validation. 
Console security. 
Browser storage validation. 

23. Expected Playwright Assertions
The automation suite shall verify:
Correct page URL. 
Correct page title. 
SAHAYOG logo is displayed. 
Reset Your Password heading is visible. 
User ID textbox is displayed. 
Placeholder text is correct. 
Send Reference ID button is enabled. 
Step 2 fields are displayed after a valid Step 1 submission. 
Cancel button is visible. 
Mandatory validation messages are displayed. 
Invalid User ID validation is displayed. 
Step 2 mismatch validation is displayed. 
Success confirmation is displayed. 
User is redirected correctly after Cancel. 

24. Reusable Page Object Methods
Create reusable methods for the ForgotPasswordPage class.
openForgotPasswordPage()

verifyPageLoaded()

enterUserId(userId)

clearUserId()

clickSendReferenceId()

enterReferenceId(referenceId)

selectDateOfBirth(date)

clickSubmit()

clickCancel()

verifyUserIdField()

verifyStep2FieldsVisible()

verifyButtons()

verifyValidationMessage(message)

verifySuccessMessage()

verifyPageTitle()

verifyLogoDisplayed()

navigateBackToLogin()

verifySessionExpired()

verifyMandatoryValidation()
These reusable methods should be implemented using the Page Object Model (POM) and reused across smoke, regression, and end-to-end Playwright automation suites.

25. GitHub Copilot / Cursor AI Prompt
Objective
Generate enterprise-grade Playwright automation scripts for the Forgot Password module using TypeScript and the Page Object Model (POM).
Functional Coverage
Generate automation for:
Forgot Password page validation. 
User ID validation. 
Registered User ID recovery. 
Step 2 identity verification (Reference ID, User ID, Date of Birth). 
Invalid User ID validation. 
Mandatory field validation. 
Send Reference ID functionality. 
Cancel navigation. 
Success confirmation. 
Error handling. 
Security validation. 
Coding Standards
Use Playwright auto-waiting. 
Avoid hard-coded waits. 
Use reusable Page Objects. 
Separate locators, actions, assertions, and test data. 
Use robust locators (getByRole, getByLabel, data-testid). 
Follow Playwright best practices. 
Design scripts for CI/CD execution. 

26. Requirement Traceability Matrix
Requirement ID	Covered By
FP_FR_001 – FP_FR_030	Forgot Password Functionality
FP_BR_001 – FP_BR_014	Business Rules
FP_VR_001 – FP_VR_010	Validation Rules

27. Automation Coverage Summary
Test Suite	Coverage
Smoke	Page Load, Valid Recovery, Cancel
Functional	User ID Validation, Send Reference ID, Step 2 Identity Verification, UI Validation
Regression	Complete Forgot Password Workflow
Negative	Blank User ID, Invalid User ID, Step 2 Mismatch, SQL Injection, XSS
Security	HTTPS, Session Timeout, URL Protection, Browser Security

28. Test Data Requirements
Test Data	Description
Valid User ID	Active registered user
Invalid User ID	Non-existing user
Inactive User ID	Disabled account
Blank User ID	Mandatory validation
Long User ID	Maximum supported length
Special Character User ID	Invalid format
Valid Reference ID + User ID + DOB	Fully matching Step 2 identity data
Mismatched Reference ID / User ID / DOB	Step 2 data that does not match the record

29. Dependencies
The Forgot Password module depends on:
Login Module 
Authentication Service 
User Management Service 
Password Recovery Service 
Database 
Audit Logging Service 
Session Management Service