Module 12 – Activate Account

1. Module Overview
The Activate Account module enables newly registered users to activate their SAHAYOG portal account before accessing the application. During activation, users are required to validate their identity using a Reference ID, User ID, and Date of Birth.
Upon successful verification, the system activates the user account and allows the user to log in using their registered credentials.
This module ensures that only legitimate users can activate their accounts while preventing unauthorized account activation.

2. Business Objective
The Activate Account module aims to:
Verify the identity of newly registered users. 
Validate account activation details. 
Prevent unauthorized account activation. 
Activate user accounts securely. 
Allow users to access the portal after successful activation. 
Maintain complete audit records for activation activities. 

3. User Stories
User Story 1 – Activate Account
As a newly registered user,
I want to activate my account,
So that I can access the SAHAYOG Web Portal.

User Story 2 – Verify Identity
As a newly registered user,
I want the system to verify my registration details,
So that only my account can be activated.

User Story 3 – Validate Registration Details
As a user,
I want to provide my Reference ID, User ID, and Date of Birth,
So that the system can validate my identity before activation.

User Story 4 – Activate Successfully
As a user,
I want my account to become active after successful verification,
So that I can log in to the portal.

User Story 5 – Cancel Activation
As a user,
I want to cancel the activation process,
So that I can return to the Login page.

4. Actors
Primary Actor
Newly Registered User 
Secondary Actors
Authentication Service 
User Management Service 
Account Activation Service 
Database 
Audit Logging Service 
Notification Service 

5. Preconditions
Before activating an account:
SAHAYOG Portal is accessible. 
Activate Account page is available. 
User has completed registration. 
Valid Reference ID has been issued. 
User account exists but is inactive. 
Backend services are operational. 
Internet connectivity is available. 

6. Post Conditions
Successful Activation
User identity is verified. 
Account status changes from Inactive to Active. 
Activation timestamp is recorded. 
Audit entry is created. 
Success confirmation is displayed. 
User can log in using registered credentials. 

Failed Activation
Account remains inactive. 
No account status change occurs. 
Appropriate validation or error message is displayed. 
User remains on the Activate Account page. 

7. UI Components
Branding
Display:
SAHAYOG Logo 
Activate Account Heading 
Instruction Text 
Powered By Netwin Footer 

Input Controls
Display the following mandatory fields:
Reference ID 
User ID 
Date of Birth 

Buttons
Activate Account 
Cancel 

Validation Controls
Display validation messages for:
Reference ID Required 
Invalid Reference ID 
User ID Required 
Invalid User ID 
Date of Birth Required 
Activation Successful 
Activation Failed 
Server Error 

8. Functional Workflow
Scenario 1 – Open Activate Account
1.User clicks Activate Account from the Login page. 
2.System opens the Activate Account screen. 
Expected Result
Activate Account page loads successfully. 
All mandatory fields are displayed. 
Activate Account and Cancel buttons are visible. 

Scenario 2 – Successful Account Activation
1.User enters: 
oReference ID 
oUser ID 
oDate of Birth 
2.User clicks Activate Account. 
3.System validates all details. 
4.User account is activated. 
Expected Result
Success confirmation is displayed. 
Account status changes to Active. 
User can proceed to Login. 

Scenario 3 – Invalid Activation Details
1.User enters incorrect information. 
2.Clicks Activate Account. 
Expected Result
Validation fails. 
Appropriate error message is displayed. 
Account remains inactive. 

Scenario 4 – Mandatory Field Validation
1.Leave one or more mandatory fields blank. 
2.Click Activate Account. 
Expected Result
Mandatory validation messages appear. 
Activation request is not processed. 

Scenario 5 – Cancel Activation
1.User clicks Cancel. 
Expected Result
User is redirected to the Login page. 

9. Assumptions
Registration has been completed successfully. 
Reference ID is valid and active. 
User details exist in the database. 
Authentication and activation services are available. 

10. Test Case Traceability
Test Case ID	Coverage
AA_TS001_TC_01	Activate Account Page UI Validation
AA_TS001_TC_02	Mandatory Field Validation
AA_TS001_TC_03	Successful Account Activation
AA_TS001_TC_04	Invalid Activation Details
AA_TS001_TC_05	Cancel Navigation

11. Module Summary
The Activate Account module provides a secure mechanism for activating newly registered user accounts by validating multiple identity attributes. It ensures that only authorized users can activate their accounts, records all activation activities for auditing, and grants portal access only after successful activation.


12. Functional Requirements (AA_FR)
Activate Account Page
AA_FR_001
The system shall allow users to access the Activate Account page from the Login page.

AA_FR_002
The Activate Account page shall display the SAHAYOG logo, page title, activation instructions, and branding.

AA_FR_003
The system shall display the following mandatory input fields:
Reference ID 
User ID 
Date of Birth 

AA_FR_004
The system shall display an Activate Account button.

AA_FR_005
The system shall display a Cancel button.

Reference ID Validation
AA_FR_006
The Reference ID field shall be mandatory.

AA_FR_007
The system shall validate the Reference ID before processing the activation request.

AA_FR_008
Only valid and active Reference IDs shall be accepted.

AA_FR_009
Expired or invalid Reference IDs shall not be accepted.

User Information Validation
AA_FR_010
The User ID field shall be mandatory.

AA_FR_011
The system shall validate the User ID against the registration records.

AA_FR_014
The Date of Birth field shall be mandatory.

AA_FR_015
The Date of Birth shall match the registered information.

Account Activation
AA_FR_021
The system shall validate all entered information before account activation.

AA_FR_022
The system shall activate the account only after successful validation of all mandatory fields.

AA_FR_023
The account status shall change from Inactive to Active after successful activation.

AA_FR_024
The activation date and time shall be recorded.

AA_FR_025
The system shall display a success confirmation after successful activation.

AA_FR_026
The user shall be redirected to the Login page or Login workflow after successful activation.

Navigation
AA_FR_027
Selecting Cancel shall redirect the user to the Login page.

AA_FR_028
The browser Back button shall not cause application errors.

AA_FR_029
Users shall be able to restart the activation process after cancellation.

Audit
AA_FR_030
Successful activation requests shall be recorded in the audit log.

AA_FR_031
Failed activation attempts shall also be recorded.

AA_FR_032
Audit logs shall capture:
Reference ID 
User ID 
Activation Status 
Date & Time 
IP Address (if applicable) 

AA_FR_033
The system shall maintain activation history for auditing purposes.

AA_FR_034
Sensitive activation information shall not be exposed in audit logs visible to end users.

AA_FR_035
All activation activities shall comply with the organization's security and audit policies.

13. Business Rules (AA_BR)
AA_BR_001
Only registered users with inactive accounts shall be allowed to activate their accounts.

AA_BR_002
All mandatory fields must be completed before activation.

AA_BR_003
Reference ID must be valid and unexpired.

AA_BR_004
Reference ID shall be associated with the entered User ID.

AA_BR_005
User ID shall belong to an inactive account.

AA_BR_007
Date of Birth shall match the registered information.

AA_BR_010
Account activation shall occur only after all validation checks are successful.

AA_BR_011
Activated accounts cannot be activated again.

AA_BR_012
All activation attempts shall be audit logged.

AA_BR_013
Unauthorized activation attempts shall be rejected.

AA_BR_014
Sensitive user information shall never be displayed in validation messages.

AA_BR_015
Account activation shall comply with the organization's authentication policy.

14. Validation Rules (AA_VR)
AA_VR_001
Reference ID is mandatory.

AA_VR_002
User ID is mandatory.

AA_VR_004
Date of Birth is mandatory.

AA_VR_007
Invalid Reference ID shall display an appropriate validation message.

AA_VR_008
Expired Reference ID shall display an expiry message.

AA_VR_009
Invalid User ID shall display an appropriate validation message.

AA_VR_011
Entered Date of Birth shall match the registered record.

AA_VR_014
Activation shall not proceed if any validation fails.

AA_VR_015
Successful activation shall display a confirmation message and update the account status.

15. Functional Workflows
Workflow 1 – Open Activate Account
1.User selects Activate Account from the Login page. 
2.System opens the Activate Account screen. 
Expected Result
Activate Account page loads successfully. 
All mandatory fields are displayed. 

Workflow 2 – Successful Account Activation
1.User enters: 
oReference ID 
oUser ID 
oDate of Birth 
2.User clicks Activate Account. 
3.System validates all entered information. 
4.Account status is updated to Active. 
Expected Result
Success message is displayed. 
User is redirected to the Login page or login workflow. 

Workflow 3 – Invalid Activation Details
1.User enters one or more incorrect values. 
2.Clicks Activate Account. 
Expected Result
Activation request is rejected. 
Appropriate validation message is displayed. 
Account remains inactive. 

Workflow 4 – Mandatory Field Validation
1.Leave one or more mandatory fields blank. 
2.Click Activate Account. 
Expected Result
Mandatory validation messages are displayed. 
Activation does not proceed. 

Workflow 5 – Cancel Activation
1.User clicks Cancel. 
Expected Result
User is redirected to the Login page. 

16. Field Validation Matrix
Field	Mandatory	Validation
Reference ID	Yes	Valid and active Reference ID
User ID	Yes	Registered inactive User ID
Date of Birth	Yes	Matches registered record


17. UI Validation Checklist
The Activate Account page shall be validated to ensure that all UI elements, input controls, validations, and navigation behave consistently across supported browsers and devices.

17.1 Branding Section
Validate:
SAHAYOG Logo is displayed. 
Activate Account page title is visible. 
Instruction text is displayed correctly. 
Powered By Netwin footer is visible. 
Illustration image loads correctly (if applicable). 
Expected Result
Branding is properly aligned. 
No UI overlap or clipping. 
Images are rendered correctly on all supported resolutions. 

17.2 Input Controls
Validate the visibility and behavior of:
Reference ID textbox 
User ID textbox 
Date of Birth picker 
Validation Points:
Field labels are displayed. 
Mandatory (*) indicators are visible. 
Placeholders are correct. 
Cursor appears on click. 
Keyboard input is accepted. 
Copy/Paste functions correctly where applicable. 

17.3 Date Picker
Verify:
Calendar opens correctly. 
User can select a valid date. 
Invalid future dates are restricted (if applicable). 
Selected date is displayed in the correct format. 

17.4 Buttons
Activate Account
Verify:
Button is visible. 
Enabled state is correct. 
Hover effect works. 
Accessible through keyboard navigation. 
Button text is displayed correctly. 

Cancel
Verify:
Button is visible. 
Hover effect is displayed. 
Clicking redirects the user to the Login page. 
Keyboard accessible. 

17.5 Responsive Validation
Validate on:
Desktop 
Laptop 
Tablet 
Mobile (if supported) 
Browser Zoom Levels:
80% 
100% 
125% 
150% 
200% 

18. Security Requirements
The Activate Account module shall comply with the following security requirements.

Authentication
Verify:
Only inactive registered users can activate accounts. 
Invalid users cannot activate accounts. 
Expired sessions redirect users to Login. 

Authorization
Validate:
Users cannot activate another user's account. 
URL manipulation does not bypass validation. 
Direct access without valid activation data is blocked. 

Data Protection
Verify:
Activation requests are transmitted using HTTPS. 
Sensitive user information is not exposed in URL parameters. 
Reference ID is never exposed in browser logs. 
Personal information is not stored insecurely in browser storage. 

Session Management
Validate:
Session timeout during activation. 
Browser Back after successful activation behaves according to business rules. 
Refresh does not create duplicate activation requests. 

Audit Requirements
Verify that the following events are logged:
Activation request initiated. 
Successful activation. 
Failed activation. 
Validation failures. 
Date & Time. 
User ID. 
Reference ID. 
IP Address (if applicable). 

19. Negative Test Scenarios
Mandatory Validation
Validate:
Blank Reference ID. 
Blank User ID. 
Blank Date of Birth. 

Invalid Data
Validate:
Invalid Reference ID. 
Expired Reference ID. 
Invalid User ID. 
Incorrect Date of Birth. 

Security Validation
Validate:
SQL Injection. 
Cross-Site Scripting (XSS). 
HTML Injection. 
JavaScript Injection. 
URL manipulation. 
Browser developer tools manipulation. 
Multiple rapid activation requests. 

System Validation
Validate:
Database unavailable. 
Authentication service unavailable. 
Activation service unavailable. 
Network interruption during activation. 
Slow server response. 

20. Boundary Test Cases
Validate:
Maximum Reference ID length. 
Maximum User ID length. 
Minimum and maximum Date of Birth values. 
Maximum request processing time. 

21. Edge Cases
Validate:
Multiple browser tabs. 
Refresh during activation. 
Browser Back after activation. 
Double-clicking Activate Account. 
Session timeout during activation. 
Concurrent activation requests. 
Slow internet connection. 
Activation after Reference ID expiry. 

22. Automation Scope
Smoke Tests
Activate Account page loads successfully. 
Successful account activation. 
Cancel navigation. 

Functional Tests
UI validation. 
Mandatory field validation. 
Reference ID validation. 
User ID validation. 
Date of Birth validation. 
Successful activation. 
Cancel functionality. 

Regression Tests
End-to-end account activation workflow. 
UI consistency. 
Validation messages. 
Navigation. 
Activation confirmation. 
Audit logging verification (if applicable). 

Negative Tests
Blank mandatory fields. 
Invalid Reference ID. 
Invalid User ID. 
Incorrect personal information. 
SQL Injection. 
XSS. 
Multiple submissions. 
Network interruption. 

Security Tests
HTTPS validation. 
Session timeout. 
URL security. 
Browser Back validation. 
Browser storage validation. 
Console security. 

23. Expected Playwright Assertions
The automation suite shall verify:
Correct page URL. 
Correct page title. 
SAHAYOG logo is displayed. 
Activate Account heading is visible. 
All mandatory input fields are displayed. 
Date picker functions correctly. 
Activate Account button is enabled. 
Cancel button is visible. 
Mandatory validation messages are displayed. 
Invalid input validation messages are displayed. 
Success confirmation is displayed after activation. 
User is redirected to the Login page after successful activation (if applicable). 

24. Reusable Page Object Methods
Create reusable methods for the ActivateAccountPage class.
openActivateAccountPage()
verifyPageLoaded()
enterReferenceId(referenceId)
enterUserId(userId)
selectDateOfBirth(date)
clickActivateAccount()
clickCancel()
clearAllFields()
verifyValidationMessage(message)
verifySuccessMessage()
verifyPageTitle()
verifyLogoDisplayed()
verifyAllFieldsVisible()
verifyButtons()
verifyDatePicker()
navigateBackToLogin()
verifySessionExpired()
These reusable methods should be implemented using the Page Object Model (POM) and reused across smoke, regression, and end-to-end Playwright automation suites.

25. GitHub Copilot / Cursor AI Prompt
Objective
Generate enterprise-grade Playwright automation scripts for the Activate Account module using TypeScript and the Page Object Model (POM).
Functional Coverage
Generate automation covering:
Activate Account page UI validation. 
Mandatory field validation. 
Reference ID validation. 
User ID validation. 
Date of Birth validation. 
Successful account activation. 
Cancel navigation. 
Security and negative scenarios. 
Coding Standards
Use Playwright auto-waiting. 
Avoid hard-coded waits. 
Use reusable Page Objects. 
Separate locators, actions, assertions, and test data. 
Use robust locators (getByRole, getByLabel, data-testid). 
Follow Playwright best practices. 
Support CI/CD execution. 

26. Requirement Traceability Matrix
Requirement ID	Covered By
AA_FR_001 – AA_FR_035	Activate Account Functionality
AA_BR_001 – AA_BR_015	Business Rules
AA_VR_001 – AA_VR_015	Validation Rules

27. Automation Coverage Summary
Test Suite	Coverage
Smoke	Page Load, Successful Activation, Cancel
Functional	All Field Validations, Successful Activation
Regression	Complete Account Activation Workflow
Negative	Invalid Data, Mandatory Fields, SQL Injection, XSS
Security	HTTPS, Session Timeout, URL Protection, Browser Security

28. Test Data Requirements
Test Data	Description
Valid Reference ID	Active reference generated by the system
Expired Reference ID	Reference ID beyond validity period
Invalid Reference ID	Non-existing reference
Valid User ID	Registered inactive user
Invalid User ID	Non-existing user
Valid Date of Birth	Registered DOB
Invalid Date of Birth	Incorrect DOB

29. Dependencies
The Activate Account module depends on:
Login Module 
User Registration Module 
Authentication Service 
Account Activation Service 
User Management Service 
Database 
Notification Service 
Session Management Service 
Audit Logging Service 
