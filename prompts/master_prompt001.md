# Step 1: Read and Analyze the User Story

## Objective

Read the provided user story and fully derive all testing requirements from it. Do not assume a fixed module scope — let the story content define what must be tested.

---

## Instructions

Read the user story file provided by the user:

```
user-stories/EC-AUTH-LOGIN-001.md
```
---

## Extract and Derive the Following

### 1. Story Identity
- Story ID, Title, Module name
- Business objective in plain language

### 2. Application Context
- Application URL : https://sahyogagentweb.drutam.in:9634/login
- Valid Test credentials:
* username - nayan.aher@netwinindia.in
* Password - Sahayog@2025

### 3. Entities and Operations
Identify every data entity mentioned.
For each entity, identify which CRUD operations apply:
- Create — is there a form or flow to add this entity?
- Read — is there a view, list, or dashboard displaying this entity?
- Update — is there an edit or bulk update flow?
- Delete — is there a remove, retire, or disconnect action?

### 4. State Transitions
Identify all states the feature moves through

### 5. Business Rules
Extract all conditional logic

### 6. Third-Party Integrations
List every external API, marketplace, or service mentioned (e.g., Walmart, Amazon, Stripe, EasyPost). Note what operations interact with each one.

### 7. Acceptance Criteria
List every AC from the story. Tag each with its type:
- Functional
- Non-Functional
- API/Integration
- Business Rule
- UI
- Reponsive for all screen types

---

## Output: User Story Summary

Produce a structured summary containing:
- Feature overview
- Entity + CRUD matrix
- State transition list
- Business rules list
- Integration list
- Full AC list with types tagged

---

# Step 2: Create Test Plan

## Objective

Generate a complete test plan derived entirely from the user story analysis. The test plan must cover what a senior human QA engineer and Principle QA Automation would test — not just what is explicitly written in the ACs.

---

## Instructions

Use the **playwright-test-planner agent** with the user story summary as input.

For each entity, AC, business rule, and integration identified in Step 1 — generate test cases across all of the following test types.

---

## Test Type 1: Happy Path (Most Important)

For every primary user flow:
- Execute the flow end-to-end with valid data
- Verify the correct success state is reached
- Verify data persists after the action (refresh page and confirm)

---

## Test Type 2: Negative and Validation

- Submit forms with missing required fields — verify validation messages
- Submit with invalid data formats — verify field-level errors
- Attempt unauthorized actions — verify appropriate rejection
- Attempt operations with disconnected or missing dependencies (e.g., no marketplace account linked) — verify graceful failure messages

---

## Test Type 3: State-Aware UI Testing

For every button, form action, or interactive element identified:

- **During async operation** — Trigger the operation, then immediately attempt to interact with the same element. Verify it is disabled and non-clickable during processing.
- **After error** — Verify the element re-enables correctly and the UI recovers without requiring a page refresh.
- **After success** — Verify the element reflects the completed state.

Examples of state patterns to always test:
- Action buttons during background refresh or sync processes
- Connect/Disconnect buttons during in-progress connections
- Save buttons during API write operations
- Delete buttons during pending deletions

---

## Test Type 4: Full CRUD Coverage

For every entity identified in Step 1:

**Create**
- Use valid data → verify record appears in the relevant list/view
- Verify all form fields are present, visible, and populated from API (not empty dropdowns, not static defaults)
- Verify auto-filled values are dynamic and appropriate

**Read**
- Verify list/table shows real data, not placeholder or mock content
- Verify all expected columns and fields are visible
- Verify data matches what was created or configured

**Update**
- Edit a record → verify changes persist after page refresh
- Bulk update (if applicable) → verify all selected records are updated
- Verify import flows process requests completely, not just trigger a loader

**Delete**
- Delete each deletable entity → verify:
  - No edge function or system errors are returned
  - The record is removed from all relevant views
  - Third-party systems receive the delete request correctly
  - No orphaned data remains

---

## Test Type 5: Business Rule Enforcement

For every business rule extracted in Step 1:

- Set up the exact precondition described in the rule
- Trigger the event that should activate the rule
- Verify the system enforces the rule immediately — not on next login or page refresh
- Verify the enforced state is consistent across all modules and views

Examples of business rule patterns to always derive and test:
- Access control changes after billing events
- Plan or tier assignment after trial expiry
- Permission boundaries for specific roles or account states
- Cascading effects when a connected resource is removed

---

## Test Type 6: Form Field Deep Validation

For every form and modal:

- Verify every dropdown is populated from the API — not empty, not hardcoded
- Verify every field that should exist based on the business context is visible
- Verify field interdependencies — selecting a value in one field should filter or populate dependent fields correctly
- Verify auto-filled fields use dynamic values, not static defaults
- Verify submitting with an empty required dropdown shows a validation error, not a silent failure

---

## Test Type 7: UI State Persistence

- Expand every collapsible menu, sidebar item, or accordion — verify it stays expanded after clicking elsewhere on the page
- Verify selected/highlighted states persist after subsequent interactions
- Verify active tab persists after data loads or a sub-action completes
- Verify that navigating away and returning preserves the expected UI state

---

## Test Type 8: Audit and Data Recording

For every operation that should generate a record:

- Execute the operation
- Navigate to the relevant audit log, charge history, or activity section
- Verify the record exists with the correct status, amount, timestamp, and metadata
- Verify failed operations (failed payments, failed API calls) are also logged — not just successes
- Verify activity logs show real user actions, not placeholder data

---

## Test Type 9: Third-Party Integration

For every external API or marketplace identified:

- **Authorization** — Verify OAuth/token flows complete successfully
- **Write propagation** — Verify create, update, and delete actions reach the third-party API correctly
- **Error surfacing** — When the third-party returns 4xx/5xx, verify the UI shows a meaningful, user-readable error message — not a raw edge function error or silent failure
- **Bulk operations** — Verify bulk import/update flows process completely through to the third-party, not just update the UI (if supported)

---

## Test Type 10: Async and Race Condition Testing

- Trigger an async operation, then immediately attempt the same action again — verify double-submission is prevented
- Trigger an operation, then navigate away before it completes — verify no broken state results
- Delete a record, then immediately attempt to create one with the same identifier — verify correct handling
- Trigger a state change (e.g., plan upgrade, store connection), then immediately navigate to a section that depends on that state — verify consistency

---

## Test Case Structure

Every test case must include:

| Field | Description |
|---|---|
| Test Case ID | Unique ID (e.g., TC-{MODULE}-001) |
| Title | Clear description of what is being tested |
| Module | Derived from user story |
| Test Type | One of the 10 types above |
| AC Reference | Which acceptance criteria this covers |
| Preconditions | System state required before execution |
| Test Steps | Numbered, specific, executable steps |
| Expected Result | Exact observable outcome |
| Test Data | Specific values, credentials, or entities used |
| Priority | Critical / High / Medium / Low |

---

## Save Test Plan

```
specs/{STORY_ID}-test-plan.md
```

---

# Step 3: Perform Exploratory Testing

## Objective

Execute the test plan using Playwright MCP browser tools, simulating a senior human QA tester — not just a script runner.

---

## Instructions

Read the test plan from:

```
specs/{STORY_ID}-test-plan.md
```

Execute each scenario. After scripted execution, apply the following heuristics on every page visited.

---

## Human-Like Testing Heuristics

Apply these on every page, regardless of whether the test plan explicitly covers them.

### Interaction Heuristics
- Click every action button twice in rapid succession — check for double-submit or duplicate records
- Click buttons while loaders or spinners are active — verify they are disabled during processing
- Expand every collapsible menu or section — verify it stays expanded
- Hover over every chart, graph, and data element — verify tooltips appear and show accurate data

### Data Heuristics
- Scan every dropdown — verify options are loaded from the API, not empty
- Scan every list and table — verify data is real, not placeholder or static
- Scan every form — verify all expected fields are present based on business context
- After every create, update, or delete action — refresh the page and verify the change persisted

### State Heuristics
- After any access state change — navigate to every module and verify correct access control
- After any async operation — verify the triggering element returns to its default enabled state
- After any delete operation — verify the item is absent from all relevant views

### Error Heuristics
- Trigger delete on every deletable entity — verify no raw edge function errors are exposed
- Submit every form incomplete — verify field-level validation messages appear
- Trigger operations that call third-party APIs — verify errors are shown in plain language, not raw API responses

---

## For Each Test Case Record

| Field | Capture |
|---|---|
| Test Case ID | From test plan |
| Test Name | From test plan |
| Status | Pass / Fail / Blocked |
| Actual Result | What the system did |
| Deviation | How it differed from expected (if any) |
| Screenshot | Filename |

---

## Screenshot Storage

```
screenshots/{module-slug}/
```

Capture screenshots for failed tests.

---

## Screenshot Naming Convention

```
{STORY_ID}_{AC_REF}_{ShortDescription}.jpeg
```

For defects:
```
BUG-{NNN}_{HTTP_CODE_if_API}_{ShortDescription}.png
```

---

# Step 4: Generate Automation Scripts

## Objective

Convert all manual test cases into Playwright automation scripts following the **module-based Page Object Model (POM) architecture** used across this project.

---

## Instructions

Use **playwright-test-generator agent**.

Input:
```
specs/{STORY_ID}-test-plan.md
```

---

## POM Architecture Requirements

All scripts must follow strict POM separation written in **TypeScript**. The model must derive the page structure from the user story — do not hardcode pages.

---

### Project Folder Structure

```
tests/
├── auth.setup.ts                          ← Runs once before all tests; saves session to .auth/user.json
├── .auth/
│   └── user.json                          ← Gitignored; written by auth.setup.ts at runtime
├── pages/                                 ← Shared page objects — organized by application module
│   ├── auth/
│   │   └── LoginPage.ts
│   ├── dashboard/
│   │   └── DashboardPage.ts
│   ├── warehouse/
│   │   ├── WarehousePage.ts
│   │   └── purchase-orders/
│   │       ├── PurchaseOrderListPage.ts
│   │       ├── PurchaseOrderDetailPage.ts
│   │       ├── CreatePOModal.ts
│   │       ├── EditPOModal.ts
│   │       └── TrackingModal.ts
│   ├── settings/
│   │   ├── SettingsPage.ts
│   │   ├── AccountTab.ts
│   │   ├── ChannelsTab.ts
│   │   ├── NotificationsTab.ts
│   │   ├── SecurityTab.ts
│   │   └── BillingTab.ts
│   └── shared/
│       └── SidebarNavigation.ts           ← Sidebar, header nav, footer — used across all modules
└── {STORY_ID}/                            ← Spec files for this story, grouped by feature area
    ├── {feature-area-1}.spec.ts
    └── {feature-area-2}.spec.ts
```

**Placement rules:**
- Page objects that are specific to one module go inside the matching module subfolder under `tests/pages/`
- Page objects used across multiple modules (sidebar, header) go in `tests/pages/shared/`
- Spec files go directly in `tests/{STORY_ID}/` — there is no nested `specs/` subfolder
- There is no `helpers/` folder — credentials use environment variables; auth is handled by `auth.setup.ts`

---

### Authentication Architecture

Authentication is handled **once per test run** — not per test.

**`tests/auth.setup.ts`** logs in and writes the browser session to disk:
```typescript
import { test as setup } from '@playwright/test';
import { LoginPage } from './pages/auth/LoginPage';

const authFile = 'tests/.auth/user.json';

setup('authenticate', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(
    process.env.ECOM_EMAIL ?? 'user@example.com',
    process.env.ECOM_PASSWORD ?? 'Password@123',
  );
  await page.context().storageState({ path: authFile });
});
```

**`playwright.config.ts`** loads that session for every test project automatically:
```typescript
projects: [
  { name: 'setup', testMatch: /auth\.setup\.ts/ },
  {
    name: 'chromium',
    use: { ...devices['Desktop Chrome'], storageState: 'tests/.auth/user.json' },
    dependencies: ['setup'],
  },
],
```

**Result:** every spec file starts already authenticated — no login code needed in `beforeEach`.

**Exception — specs that test the login form itself** must override auth at the describe block level:
```typescript
test.describe('AC0 - Login Page Tests', () => {
  // Override project-level storageState so the browser starts unauthenticated
  test.use({ storageState: { cookies: [], origins: [] } });

  // Tests here operate on the login page directly
});
```

---

### Page Object Rules

**Each Page Object must:**

- Represent one page, modal, or significant UI section
- Be written in **TypeScript** with all locators declared as `readonly` class properties
- Contain only locators and action/assertion methods — no raw test logic
- Expose public methods that represent user actions (`clickConnectStore()`, `selectMarketplace()`)
- Never expose raw locators to spec files — all interaction goes through methods

**Locator definitions:**
```typescript
// ✅ Correct — readonly TypeScript properties, semantic role-based selectors
export class DashboardPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly dateFilterButton: Locator;
  readonly connectStoreLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Dashboard', level: 1 });
    this.dateFilterButton = page.getByRole('button', { name: 'Last 30 days' });
    this.connectStoreLink = page.getByRole('link', { name: 'Connect Store' });
  }
}

// ❌ Incorrect — brittle CSS selectors, mutable properties, locators inside methods
this.heading = page.locator('.dash-title > h1');
await page.click('[data-id="connect-btn"]');
```

**Action methods:**
```typescript
// ✅ Correct — intent-named, single responsibility, TypeScript typed
async clickDateFilter(): Promise<void> {
  await this.dateFilterButton.click();
}

async verifyWelcomeMessage(userName: string): Promise<void> {
  await expect(
    this.page.getByRole('heading', { level: 2, name: `Welcome back, ${userName}` }),
  ).toBeVisible();
}

// ❌ Incorrect — raw Playwright calls inside spec files
await page.click('[data-id="date-filter"]');
```

---

### Deriving Page Objects from User Story

The model must read the user story and automatically determine:

| User Story Element | POM Output |
|---|---|
| Every distinct URL or route mentioned | One `{Name}Page.ts` in the matching module subfolder |
| Every modal or dialog flow | One `{Name}Modal.ts` in the same module subfolder as the parent page |
| Sidebar, header, footer shared across all pages | `tests/pages/shared/SidebarNavigation.ts` |
| Login / sign-in page | `tests/pages/auth/LoginPage.ts` (already exists — reuse it) |
| Settings tabs | `tests/pages/settings/{TabName}Tab.ts` (already exist — reuse them) |

**Do not create a new page object if one already exists for that page.** Check `tests/pages/` first and reuse existing classes. Only create a new file when genuinely new UI territory is introduced by the story.

**Import paths** must resolve relative to the spec file location:
```typescript
// From tests/{STORY_ID}/{feature}.spec.ts
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { SidebarNavigation } from '../pages/shared/SidebarNavigation';
import { SettingsPage } from '../pages/settings/SettingsPage';
```

---

### Spec File Rules

Spec files must:
- Import and instantiate Page Objects — never interact with `page` directly
- Contain only `test()` blocks with arrange / act / assert structure
- Keep each test independent — no shared mutable state between tests
- Use `beforeEach` only for page navigation (not for login — auth is handled by storageState)
- Credentials must reference environment variables, not hardcoded strings

```typescript
// ✅ Correct spec structure
import { test, expect } from '@playwright/test';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { SidebarNavigation } from '../pages/shared/SidebarNavigation';

test.describe('AC1 - Dashboard Landing', () => {
  let dashboardPage: DashboardPage;
  let sidebar: SidebarNavigation;

  test.beforeEach(async ({ page }) => {
    // No login needed — storageState provides authenticated session
    dashboardPage = new DashboardPage(page);
    sidebar = new SidebarNavigation(page);
    await dashboardPage.goto();
  });

  test('TC-DASH-011: Dashboard page loads after login', async ({ page }) => {
    // Assert
    await expect(dashboardPage.heading).toBeVisible();
    await expect(page.locator('nav')).toBeVisible();
  });
});
```

---

### State-Aware Assertions in POM

Page objects must expose state-check methods for elements that have disabled/loading states:

```typescript
// In DashboardPage.ts
async isDateFilterEnabled(): Promise<boolean> {
  return !(await this.dateFilterButton.isDisabled());
}

// In spec
await dashboardPage.triggerDataRefresh();
expect(await dashboardPage.isDateFilterEnabled()).toBe(false);
```

---

## General Script Requirements

In addition to POM architecture, all scripts must:

- Use explicit waits tied to element state — never `page.waitForTimeout()`
- Assert both the UI outcome and data persistence (verify after page refresh where applicable)
- Include inline comments on intent, not mechanics
- Cover element disabled states during async operations, not just final outcomes
- Use TypeScript strict types — no `any`, no untyped parameters

---

## Save Structure

```
tests/{STORY_ID}/
  {feature-area-1}.spec.ts
  {feature-area-2}.spec.ts

tests/pages/{module}/
  {NewPageObject}.ts            ← Only if genuinely new; otherwise reuse existing
```

All spec files named after feature areas derived from the user story — not generic names like `test1.spec.ts`.

---

The one-line principle to paste at the top of your mental model for this step:

> **Page Objects own the UI. Spec files own the intent. storageState owns the session. Nothing crosses boundaries.**

---

# Step 5: Execute and Heal Automation Tests

## Objective

Run automation scripts and automatically heal failures — while strictly preserving module-based POM architecture boundaries during every fix.

---

## Instructions

Run scripts from:
```
tests/{STORY_ID}/
```

Use **playwright-test-healer agent** to analyze and fix failures.

---

## POM-Aware Healing Rules

Before applying any fix, the healer must identify **which layer the failure belongs to** and apply the fix in the correct file:

| Failure Type | Fix Location | Never Fix In |
|---|---|---|
| Selector broken or changed | `tests/pages/{module}/{Name}Page.ts` or `{Name}Modal.ts` | spec files |
| Action method incomplete or wrong | `tests/pages/{module}/{Name}Page.ts` — update the method | spec files |
| Missing wait for async element | `tests/pages/{module}/{Name}Page.ts` — add wait inside action method | spec file `beforeEach` |
| Shared component selector changed | `tests/pages/shared/SidebarNavigation.ts` | individual page objects |
| Auth/session failure | `tests/auth.setup.ts` — fix login flow or storageState path | spec `beforeEach` |
| Login-page test fails due to pre-auth | spec file — add `test.use({ storageState: { cookies: [], origins: [] } })` to the describe block | page objects |
| TypeScript import path broken | spec file or page object — fix relative path to match module folder | other files |
| Assertion too strict or wrong | spec file `test()` block only | page objects |
| Test precondition incomplete | spec file `beforeEach` or `test()` arrange block | page objects |

---

## Healing Process Per Failure

For each failing test the healer must:

1. **Identify the failure layer** — is it a selector, action method, wait, auth, TypeScript type, or assertion issue?
2. **Trace to the correct file** — follow the import chain from spec → module page object → shared component
3. **Apply the fix in the right layer** — never patch a selector inside a spec file
4. **Check for cross-spec impact** — if the page object is used by other spec files, verify those still pass after the fix
5. **Re-run the affected spec** to confirm the fix resolves the failure without introducing new ones

---

## Common Healing Patterns

**Broken selector — fix in the module page object:**
```typescript
// ❌ Before (selector changed in UI)
this.deleteButton = page.locator('.delete-btn-v1');

// ✅ After (healed in tests/pages/warehouse/purchase-orders/PurchaseOrderListPage.ts)
this.deleteButton = page.getByRole('button', { name: 'Delete' });
```

**Missing wait — fix inside action method:**
```typescript
// ❌ Before (no wait, causes flakiness)
async clickConnectStore(): Promise<void> {
  await this.connectStoreButton.click();
}

// ✅ After (wait added inside page object method)
async clickConnectStore(): Promise<void> {
  await this.connectStoreButton.waitFor({ state: 'visible' });
  await this.connectStoreButton.click();
}
```

**Login-page test getting pre-authenticated session — fix in spec:**
```typescript
// ❌ Before (test gets storageState session, login form never loads)
test.describe('AC0 - Login Tests', () => {
  test('TC-001: Login form is visible', async ({ page }) => { ... });
});

// ✅ After (unauthenticated override scoped to the describe block)
test.describe('AC0 - Login Tests', () => {
  test.use({ storageState: { cookies: [], origins: [] } });
  test('TC-001: Login form is visible', async ({ page }) => { ... });
});
```

**Shared component selector changed — fix in shared page object only:**
```typescript
// ❌ Before (same selector patched separately in dashboard.spec.ts and navigation.spec.ts)
// ✅ After (fix once in tests/pages/shared/SidebarNavigation.ts — all specs inherit the fix)
this.settingsLink = page.getByRole('link', { name: 'Settings' });
```

**Broken TypeScript import path — fix the import:**
```typescript
// ❌ Before (wrong module path)
import { PurchaseOrderListPage } from '../pages/PurchaseOrderListPage';

// ✅ After (correct module-based path)
import { PurchaseOrderListPage } from '../pages/warehouse/purchase-orders/PurchaseOrderListPage';
```

---

## What the Healer Must Never Do

- ❌ Add raw `page.click()` or `page.locator()` calls inside a spec file
- ❌ Hardcode selectors, credentials, or session tokens inline during a fix
- ❌ Duplicate a locator across multiple page objects instead of fixing it once in the shared module
- ❌ Use `waitForTimeout()` as a fix for timing issues — always use state-based waits (`waitFor({ state: 'visible' })`)
- ❌ Modify a page object method in a way that fixes one spec but silently breaks another
- ❌ Move a page object to a different module folder as a workaround for an import error — fix the import path instead

---

## Output

**Initial Results**
```
Total: | Passed: | Failed:
```

**Healing Log**

| Test Case | Failure Type | Layer Fixed | File Modified | Fix Applied |
|---|---|---|---|---|
| TC-DASH-003 | Selector changed | Page Object | `pages/dashboard/DashboardPage.ts` | Updated locator to `getByRole` |
| TC-BILLING-002 | Missing async wait | Page Object | `pages/settings/BillingTab.ts` | Added `waitFor` inside action method |
| TC-LOGIN-001 | Pre-auth session conflict | Spec | `ec-login-001/login.spec.ts` | Added `test.use({ storageState: { cookies: [], origins: [] } })` |
| TC-NAV-005 | Shared selector changed | Shared PO | `pages/shared/SidebarNavigation.ts` | Updated `settingsLink` locator |
| TC-DASH-001 | Assertion too strict | Spec | `EC-Dashboard-003/dashboard.spec.ts` | Relaxed `toHaveText` to `toContainText` |
| TC-WH-026 | Broken import path | Spec | `ec-wh-po-04/purchase-order-edit.spec.ts` | Corrected module path in import statement |

**Final Results**
```
Total: | Passed: | Failed:
```

---

The healer is **architecture-aware**, not just failure-aware. It knows a broken selector belongs in a module page object, a shared component fix belongs in `pages/shared/`, an auth issue belongs in `auth.setup.ts`, and an assertion belongs in a spec — so every heal strengthens the codebase instead of quietly eroding the structure built in Step 4.



---

# Step 6: Network and API Defect Analysis

## Objective

Capture all API calls made during test execution and flag any errors.

---

## Instructions

After each major test flow call:
```
mcp__playwright-test__browser_network_requests
```

Save to:
```
screenshots/{module-slug}/network_requests.txt
```

---

## Flag These Status Codes

| Code | Category |
|---|---|
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 406 | Not Acceptable |
| 4xx | Client Error |
| 5xx | Server Error |

For each flagged call record:
- Endpoint URL
- HTTP Method
- Status Code
- Page/action context that triggered it
- Screenshot filename: `BUG-{NNN}_HTTP_{CODE}_{endpoint}.png`

---

# Step 7: Generate QA Test Report

## Objective

Produce a complete QA execution report.

---

## Save Report

```
test-results/{STORY_ID}-test-report.md
```

---

## Report Structure

### Executive Summary
What was tested, overall outcome, key risks identified.

### Test Statistics
- Total test cases (manual + automated)
- Pass / Fail / Blocked counts per test type

### Manual Test Results
- Per-AC results with observations and screenshots

### Automation Results
- Initial run, healing activities, final run

### Defect Log 

Defect ID	Date	Instance	Module	Title	Description	Test Data / Required Info	Status	Screenshot / STR	Priority	Severity	Type	Developer Assigned	Resolved Date / Retested Result(Regreesion)							

### Coverage Matrix

| AC | Description | Manual | Automated |
|---|---|---|---|

### Recommendations
Derived from test results — list specific improvements to the product, not generic advice.

> Create a **Consolidated Defect Sheet** in **Microsoft Excel (.xlsx)** format for each Regression or Retesting cycle performed.
>
> ### Instructions:
>
> * Generate the output as an **.xlsx** file.
> * Each row should represent a single defect.
> * Maintain a professional QA defect tracking format.
> * Use the following columns in the exact order:
>
> | Defect ID | Date | Instance | Module | Title | Description | Test Data / Required Info | Status | Screenshot / STR | Priority | Severity | Type | Retested Result | Developer Assigned | Resolved Date | Developer Comment | QA Comment | Changes Applied |
>
> ### Column Guidelines
>
> **Defect ID**
>
> * Unique defect identifier (e.g., DEF-001, BUG-102).
>
> **Date**
>
> * Date when the defect was logged.
>
> **Instance**
>
> * Environment where the issue was found (Dev, QA, Staging, UAT, Production, Live).
>
> **Module**
>
> * Functional module or feature.
>
> **Title**
>
> * Short and meaningful defect title.
>
> **Description**
>
> * Detailed description of the issue.
>
> **Test Data / Required Info**
>
> * Login credentials (if applicable)
> * User role
> * Device/Browser
> * Version
> * Preconditions
> * Any required test data
>
> **Status**
>
> * New
> * Assigned
> * Open
> * In Progress
> * Fixed
> * Ready for QA
> * Retest
> * Closed
> * Reopened
> * Deferred
>
> **Screenshot / STR**
>
> * Link to screenshots, screen recording, or concise Steps to Reproduce.
>
> **Priority**
>
> * Critical
> * High
> * Medium
> * Low
>
> **Severity**
>
> * Blocker
> * Critical
> * Major
> * Minor
> * Trivial
>
> **Type**
> Examples:
>
> * Functional
> * UI
> * API
> * Performance
> * Security
> * Regression
> * Validation
> * Enhancement
> * Integration
> * Compatibility
>
> **Retested Result**
>
> * Pass
> * Fail
> * Partially Fixed
> * Reopened
> * Not Retested
>
> **Developer Assigned**
>
> * Name of assigned developer.
>
> **Resolved Date**
>
> * Date when the defect was fixed.
>
> **Developer Comment**
>
> * Developer's implementation notes.
>
> **QA Comment**
>
> * QA verification remarks after regression/retesting.
>
> **Changes Applied**
>
> * Brief summary of the fix or code changes applied.
>
> ### Formatting Requirements
>
> * Convert the data into an **Excel Table** with filters enabled.
> * Freeze the first row.
> * Apply bold formatting to the header row.
> * Auto-adjust column widths.
> * Enable text wrapping for long descriptions.
> * Use date format **DD-MMM-YYYY**.
> * Apply conditional formatting:
>
>   * **Status:** Fixed (Green), Open/Reopened (Red), In Progress (Yellow).
>   * **Priority:** Critical (Dark Red), High (Orange), Medium (Yellow), Low (Green).
>   * **Severity:** Blocker (Dark Red), Critical (Red), Major (Orange), Minor (Yellow), Trivial (Green).
> * Include data validation dropdowns for **Status**, **Priority**, **Severity**, **Type**, and **Retested Result**.
> * Ensure the workbook is clean, professional, and suitable for QA reporting and defect tracking.
>
> The generated Excel sheet should serve as a master defect tracker for each regression or retesting cycle and be ready for use by QA, developers, and project managers.
