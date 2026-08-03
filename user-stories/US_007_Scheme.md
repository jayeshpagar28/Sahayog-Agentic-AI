User Story: Verify Scheme Selection Navigation, Search, Scheme Listing & Selection
 
**User Story ID:** US_007_SCHEME 
**Module:** Scheme Selection  
**Priority:** High  
**Role:** Registered User
 
---
 
# User Story
 
**As a** logged-in user,
 
**I want** to access the Scheme Selection screen,
 
**So that** I can search, view, and select the appropriate savings scheme before proceeding with the savings application.
 
---
 
# Pre-Conditions
 
* User is successfully logged in.
* User is on the Home Dashboard.
* User has permission to access Savings Applications.
* User has navigated to the Savings Application Dashboard / Unposted Screen.
* New Application button is available and clickable.
 
---
 
# Test Data
 
* Schemes are created from the admin
* Active schemes required.
* In-Active schemes required.  
 
---
 
# Acceptance Criteria
 
## AC1: Scheme Selection Navigation
 
**Given** the user is on the Home Dashboard
 
**When** the user clicks the **Savings Application** card
 
**And** clicks the **New Application** button from the Application Dashboard / Unposted Screen
 
**Then**
 
* User shall be redirected to the Scheme Selection screen.
* Scheme Selection screen shall load successfully.
* No application errors shall occur.
* Page title and breadcrumb (if available) shall display correctly.
 
---
 
## AC2: Active Scheme Verification
 
Verify that:
 
* All active/added schemes shall be displayed.
* Inactive schemes shall not be displayed.
* Each scheme shall display the configured Scheme Name.
* Duplicate schemes shall not be displayed.
* Scheme list shall load successfully.
* User shall be able to scroll through the available schemes.
 
---
 
## AC3: Search Functionality
 
The Search bar shall allow searching using:
 
* Scheme Name
 
Verify that:
 
* Valid Scheme Name returns the correct scheme.
* Partial Scheme Name search behaves as per business rules.
* Invalid search displays an appropriate **"No Results"** .
* Search is case insensitive where applicable.
* Leading and trailing spaces are ignored.
* Search results update without page errors.
* Clearing the search restores the complete scheme list.
 
---
 
## AC4: Scheme Details Panel Verification
 
Verify that:
 
* Scheme Details panel shall be displayed alongside the scheme listing.
* The panel shall display the configured Scheme Name.
* The panel shall display the configured Scheme Description.
* Scheme details shall match the backend configuration.
* The details panel shall rotate/scroll automatically based on the configured timeout.
* Auto-rotation shall work without UI distortion or application errors.
 
---
 
## AC5: Scheme Selection Action
 
Verify that:
 
* Each scheme shall be clickable.
* Clicking a scheme shall redirect the user to the main Savings Application screen.
* Selected scheme details shall be carried forward correctly.
* Savings Application screen shall load successfully.
* No application errors shall occur during navigation.
 
---
 
## AC6: Side Navigation Verification
 
The following navigation menus shall be displayed:
 
* Home
* My Profile
* Notifications
* About Us
 
Verify that:
 
* All menu options are visible.
* All menu options are enabled.
* All menu options are clickable.
* Clicking each menu redirects the user to the respective screen.
* Navigation works without application errors.
 
---
 
## AC7: UI Validation
 
Verify that:
 
* Scheme cards are properly aligned.
* Scheme Details panel is properly aligned.
* Search bar is aligned correctly.
* Side navigation menu is aligned correctly.
* Icons are displayed correctly.
* Proper scrollbar is displayed and functions correctly.
* Pagination controls are aligned correctly (if applicable).
* No overlapping, truncation, or broken UI elements are present.
* Fonts, spacing, and colors are displayed consistently.
 
---
 
## AC8: Performance Validation
 
Verify that:
 
* Scheme Selection screen loads within the expected response time.
* Search results load within the expected response time.
* Scheme Details panel updates without noticeable delay.
* Scheme selection redirects smoothly to the Savings Application screen.
* Scrolling through the scheme list works smoothly.
* No UI freezes or unexpected errors occur during repeated operations.
 
---
 
# Out of Scope
 
The following functionality will be covered in subsequent user stories:
 
* Savings Application Form
* Applicant Details
* KYC Verification
* Product Configuration
* Document Upload
* Review & Submission
* Approval Workflow
* Decision Process
* Post-Submission Actions