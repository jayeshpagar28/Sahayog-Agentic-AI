SAHAYOG Web Portal
Module 1 – Login
Document Information
Item	Details
Module	Login
Application	SAHAYOG Web Portal
Automation Target	Playwright + TypeScript
Design Pattern	Page Object Model
Priority	High
Automation Type	Smoke + Regression
1. Module Overview
The Login module is the entry point of the SAHAYOG Web Portal. It authenticates registered users and grants access to the dashboard after successful credential validation.

The module also provides Forgot Password functionality and ensures only authenticated users can access protected pages.

This module should be treated as a reusable component because every end-to-end automation scenario depends on successful authentication.
2. Business Objective
• Allows registered users to access the portal.
• Prevents unauthorized access.
• Validates user credentials.
• Displays meaningful validation messages.
• Redirects authenticated users to the Dashboard.
• Supports password recovery.
3. Actors
Primary Actor: Registered User
Secondary Actors: Authentication Service, Database, Email Service (Forgot Password), Session Manager
4. Preconditions
• SAHAYOG Portal is accessible.
• Login page is loaded.
• User account exists.
• User account is active.
• Authentication service is available.
• Database connection is healthy.
• Browser session is active.
• Internet connection is available.
5. Post Conditions
Successful Login:
• User session is created.
• Authentication token is generated.
• Dashboard opens.
• User profile becomes available.
• Navigation menu loads.
• Session timeout starts.

Failed Login:
• Session should not be created.
• User remains on Login page.
• Appropriate validation message is displayed.
• Password field remains masked.
6. UI Components
Branding: Logo, Application Name, Copyright, Footer
Input Controls: Email ID, Password
Buttons: Login
Links: Forgot Password
Icons: Password Visibility Toggle
Validation Controls: Email, Password and Authentication messages
7. Functional Workflow
Scenario 1: Launch Login Page.
Scenario 2: UI Validation.
Scenario 3: Field Validation.
Scenario 4: Keyboard Navigation.
Scenario 5: Enter Key Submission.
Scenario 6: Successful Login.
Scenario 7: Invalid Email.
Scenario 8: Invalid Password.
Scenario 9: Blank Form.
Scenario 10: Blank Password.
Scenario 11: Blank Email.
Scenario 12: Invalid Email Format.
Scenario 13: Password Masking.
Scenario 14: Password Visibility Toggle.
Scenario 15: Forgot Password Flow.
8. Business Rules
BR-001 Email mandatory.
BR-002 Password mandatory.
BR-003 Valid email format.
BR-004 Password masked by default.
BR-005 Authentication after validations.
BR-006 Session only after successful login.
BR-007 Unauthorized users cannot access dashboard.
BR-008 No sensitive authentication errors.
BR-009 Password never logged.
BR-010 Enter key performs login.
9. Field Validation Matrix
Email: Mandatory, valid email format.
Password: Mandatory, cannot be blank.
10. UI Validation Checklist
Logo, alignment, placeholders, labels, cursor, hover effects, button state, footer, responsive layout, browser compatibility.
11. Security Requirements
Password masking, HTTPS, secure authentication, no password in URL, session token after login, logout invalidates session, browser back restriction, no sensitive console/local storage data, CSRF where applicable.
12. Negative Scenarios
Invalid email/password, blank fields, invalid email format, SQL Injection, XSS, long inputs, spaces, rapid clicks, network interruption, refresh during authentication.
13. Edge Cases
Max lengths, Unicode, copy/paste, autofill, zoom, mobile, slow network, expired session, multiple tabs/logins.
14. Automation Scope
Smoke, Functional, Negative and Security-oriented UI tests.
15. Expected Assertions
Verify title, URL, logo, fields, login button, forgot password link, password masking, validation messages, dashboard redirection, authenticated session and logout.
16. Reusable Components
openLoginPage(), enterEmail(), enterPassword(), clickLogin(), login(), verifyLoginPageLoaded(), verifyValidationMessage(), togglePasswordVisibility(), clickForgotPassword(), logout().
17. Traceability
LP_TS001_TC_01 - UI Validation
LP_TS001_TC_02 - Login Functionality & Validations
LP_TS001_TC_03 - Forgot Password
LP_TS001_TC_04 - Password Visibility
LP_TS001_TC_05 - Logout