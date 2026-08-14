# User Story: Verify Savings Application Dashboard Navigation, Search, Filters & Application Listing

**User Story ID:** US_HOME_002
**Module:** Savings Application Dashboard
**Priority:** High
**Role:** Registered User

---

# User Story

**As a** logged-in user,

**I want** to access the Savings Application dashboard,

**So that** I can search, filter, view, and manage my savings applications efficiently.

---

# Pre-Conditions

* User is successfully logged in.
* User is on the Home Dashboard.
* User has permission to access Savings Applications.
* Savings Application module is available.

---

# Test Data

* Existing applications in different statuses:

  * Pending
  * Submitted
  * Re-Assigned
  * Decisioned
* Mobile Number
* Application ID
* Multiple Products
* Multiple Schemes
* Different Application Dates
* Various Application Statuses

---

# Acceptance Criteria

## AC1: Savings Application Navigation

**Given** the user is on the Home Dashboard

**When** the user clicks the **Savings Application** card

**Then**

* User shall be redirected to the Savings Application Dashboard.
* Dashboard shall load successfully.
* No application errors shall occur.
* Page title and breadcrumb (if available) shall display correctly.

---

## AC2: Status Tabs Verification

The following tabs shall be displayed:

* Pending
* Submitted
* Re-Assigned
* Decisioned

Each tab shall:

* Be visible.
* Display the respective application count.
* Be enabled.
* Be clickable.
* Highlight the selected tab.
* Load only applications belonging to the selected status.
* Update the application list accordingly.

---

## AC3: Status Count Validation

Verify that:

* Count displayed on each tab matches the number of applications returned.
* Counts are updated after status changes.
* Zero count is displayed correctly when no applications exist.
* Clicking a tab with zero records shall display an appropriate "No Records Found" message.

---

## AC4: Search Functionality

The Search bar shall allow searching using:

* Mobile Number
* Application ID

Verify that:

* Valid Mobile Number returns the correct application.
* Partial Mobile Number search behaves as per business rules.
* Valid Application ID returns the correct application.
* Invalid search displays an appropriate "No Records Found" message.
* Search is case insensitive where applicable.
* Leading and trailing spaces are ignored.
* Search results update without page errors.

---

## AC5: Filter Panel Verification

Clicking the **Filter** button shall display filter options including:

* Product
* Scheme
* Date
* Status

The filter panel shall:

* Open successfully.
* Display all configured filter options.
* Allow selecting values.
* Allow multiple selections where supported.
* Apply selected filters correctly.

---

## AC6: Individual Filter Validation

Verify each filter independently.

**Confirmed live, 2026-08-14:** all three filters apply immediately on selection — own `POST /app/activity/list` call fires per change, no separate Apply/Search button exists.

### Product Filter

* Selecting a Product shall return only applications for that Product.
* Confirmed: only one option currently exists ("Savings Account").

### Scheme Filter

* Selecting a Scheme shall return only matching applications.
* Confirmed: cascading on Product — empty/unpopulated until a Product is selected. After Product = "Savings Account", shows "Silver Savings Account - 1002", "Normal Savings Account - 1001", "Staff Salary Account - 1003". Selecting Scheme = "Normal Savings Account - 1001" correctly narrowed the list to only 1001-prefixed applications.

### Date Filter

* Selected date/date range shall return matching applications.
* Invalid or empty results shall display "No Records Found."
* Confirmed: this is a preset dropdown (not a free calendar picker) with 5 options — As On Date, Today, Last 7 Days, Last 15 Days, Custom Date. "Last 7 Days" confirmed to compute `fromDate`/`toDate` correctly (e.g. `fromDate:"2026-08-07", toDate:"2026-08-14"` on 2026-08-14) and narrow results accordingly. "Custom Date" (presumably reveals a from/to date-picker pair) was not exercised.

### Status Filter

* Selected status shall display only matching applications.

---

## AC7: Filter Combination Validation

Verify combinations of filters including (but not limited to):

* Product + Scheme
* Product + Status
* Scheme + Status
* Date + Status
* Product + Date
* Product + Scheme + Status
* Product + Scheme + Date
* Product + Scheme + Date + Status

For each combination:

* Only matching applications shall be displayed.
* Applied filters shall work together without conflict.
* No duplicate records shall appear.

---

## AC8: Search with Filters

Verify that search works correctly when filters are applied.

Examples include:

* Search by Mobile Number + Product Filter
* Search by Application ID + Status Filter
* Search + Product + Scheme
* Search + All Filters

Search results shall match all selected criteria.

---

## AC9: Filter Reset Recommendation

**Recommendation (UX Improvement):**

A **Clear Filters** button should be provided within the filter panel to:

* Remove all applied filters with a single click.
* Restore the default application list.
* Reduce manual effort for users when multiple filters are applied.

---

## AC10: Application List Verification

Verify the application table displays the appropriate columns as per business requirements.

For each application verify:

* Correct Application ID
* Applicant Name (if applicable)
* Mobile Number
* Product
* Scheme
* Status
* Date
* Other configured columns

The data displayed shall match the backend records.

---

## AC11: Application Actions

Each application row shall display the available action buttons.

Verify:

### View

* View button is visible.
* View button is enabled.
* Clicking View opens the application details page.
* Application details load correctly.

### Action

* Action button/menu is visible.
* Available actions are displayed based on application status and user permissions.
* Clicking an action performs the intended functionality.
* Appropriate success or validation messages are displayed.

**Confirmed live, 2026-08-14:** the Action menu (⋮ icon) exposes exactly two options: Track Application and Cancel.
* **Track Application** — read-only. Opens an "Application Tracking" dialog showing stage name (e.g. "Sourcer"), stage status (e.g. "Initiated"), the assigned officer's name and role (e.g. "Nayan Aher, Branch Origination Officer"), and a timestamp.
* **Cancel** — destructive. Opens an "Application Cancellation" dialog with a "Reason" dropdown and Submit button. Full flow executed end-to-end against a genuinely stale/abandoned draft (`SAH-1001-591` — never progressed past Mobile Number Verification, no applicant name ever attached), chosen deliberately over a real in-progress application:
  * Reason options: Applicant Request, Incomplete Documentation, Eligibility Not Met, Discrepancy In Information, Change in Applicant's Financial Situation, Approval Delay, Unable to Meet Collateral Requirements, Fraud Suspected, Other.
  * Submit fires `POST /endModule/app/cancel/submit`; confirmed response `{"msgCode":"APPL_REJECT","msgDescr":"Your application is rejected !","success":"TRUE"}`.
  * Post-cancel: the application immediately drops out of the default/active Application List search results and its status becomes "Decisioned". No undo/reactivate path was observed.

---

## AC12: Pagination Validation

When applications exceed the configured page size:

Verify:

* Pagination controls are displayed.
* Next Page works correctly.
* Previous Page works correctly.
* First Page navigation works correctly (if available).
* Last Page navigation works correctly (if available).
* Page numbers are clickable.
* Current page is highlighted.
* Records per page are displayed correctly.
* No duplicate or missing records occur while navigating pages.

---

## AC13: Empty State Validation

When no applications match the selected search or filter criteria:

* "No Records Found" message shall be displayed.
* Application table shall remain properly formatted.
* User shall be able to modify or clear filters.

---

## AC14: UI Validation

Verify that:

* All tabs are properly aligned.
* Counts are clearly visible.
* Search bar is aligned correctly.
* Filter panel displays correctly.
* Table headers are aligned.
* Action buttons are properly displayed.
* Pagination controls are aligned.
* No overlapping, truncation, or broken UI elements are present.

---

## AC15: Performance Validation

Verify that:

* Savings Application Dashboard loads within the expected response time.
* Search results load within the expected response time.
* Filters apply without noticeable delay.
* Pagination loads smoothly.
* No UI freezes or unexpected errors occur during repeated operations.

---

# Out of Scope

The following functionality will be covered in subsequent user stories:

* Create New Savings Application
* Applicant Details
* KYC Verification
* Product & Scheme Selection Workflow
* Document Upload
* Review & Submission
* Approval Workflow
* Decision Process
* Post-Submission Actions
