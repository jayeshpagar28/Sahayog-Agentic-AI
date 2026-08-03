# SAHAYOG QA Automation Framework — End-to-End Guide

**Audience:** any QA engineer joining this project. This document assumes no prior context and explains the framework from first principles through to the CI pipeline that runs it on every push.

**Project:** SAHAYOG Web Portal test automation
**Stack:** Playwright Test (TypeScript), Page Object Model, GitHub Actions on a self-hosted Windows runner
**Target environment:** https://sahyogagentweb.drutam.in:9634 (UAT)
**Repo:** `jayeshpagar28/Sahayog-Agentic-AI`

---

## Table of Contents

1. [Why This Framework Exists](#1-why-this-framework-exists)
2. [Technology Stack](#2-technology-stack)
3. [Repository Structure](#3-repository-structure)
4. [Architecture: Page Object Model](#4-architecture-page-object-model)
5. [Authentication Strategy](#5-authentication-strategy)
6. [Playwright Configuration](#6-playwright-configuration)
7. [Test Organization & Naming Conventions](#7-test-organization--naming-conventions)
8. [The Agentic QA Workflow](#8-the-agentic-qa-workflow)
9. [Special Test Categories](#9-special-test-categories)
10. [Running Tests Locally](#10-running-tests-locally)
11. [CI/CD Pipeline](#11-cicd-pipeline)
12. [Reporting](#12-reporting)
13. [Defect Management Conventions](#13-defect-management-conventions)
14. [Current Project Status](#14-current-project-status)
15. [Known Gaps & Technical Debt](#15-known-gaps--technical-debt)
16. [Future Roadmap](#16-future-roadmap)
17. [Onboarding Checklist](#17-onboarding-checklist)

---

## 1. Why This Framework Exists

SAHAYOG is a loan-origination web portal (login, identity recovery, account activation, a savings-application dashboard, and more modules to come). This repository automates functional, security, and UI regression testing for it end to end: from reading a user story, to a test plan, to Playwright automation, to a CI pipeline that runs the whole suite on every push and produces a QA report a human can act on.

The framework was built module-by-module (Login → Forgot User ID → Forgot Password → Activate Account → Homepage → Savings Application Dashboard → Change Password), each following the same repeatable process (see [§8](#8-the-agentic-qa-workflow)). That repeatability — not any one module — is the actual asset here: a new module should be addable by following the same pattern without inventing a new one.

---

## 2. Technology Stack

| Concern | Choice | Notes |
|---|---|---|
| Test runner | `@playwright/test` v1.61 | TypeScript, no `ts-node` needed — Playwright compiles specs itself |
| Language | TypeScript | strict typing on Page Objects; no `any` |
| Design pattern | Page Object Model (POM) | one class per page/modal/significant section |
| Session handling | Playwright `storageState` | login happens once per run, not per test |
| Reporting | Playwright HTML reporter + hand-written Markdown reports + Excel (ExcelJS) defect trackers | see [§12](#12-reporting) |
| CI | GitHub Actions | self-hosted Windows runner (see [§11](#11-cicd-pipeline)) |
| Browsers | Chromium (CI), Chromium/Firefox/WebKit (local, config supports all three) | Firefox/WebKit excluded in CI — see [§11](#11-cicd-pipeline) |
| MCP tooling (dev-time only) | `@playwright/mcp` (`.mcp.json`) | used during exploratory recon while building each module, not part of the executed suite |

No test framework beyond `@playwright/test` is used — no Cucumber/BDD layer, no custom runner. `exceljs` is the only other production dependency, used solely by the defect-tracker generator scripts.

---

## 3. Repository Structure

```
Sahayog-Automation/
├── .github/workflows/
│   ├── playwright.yml            ← the actual CI pipeline (see §11)
│   └── copilot-setup-steps.yml   ← unrelated: GitHub Copilot coding-agent bootstrap, not part of QA CI
├── .mcp.json                     ← Playwright MCP server config (dev-time browser recon tool, not used by CI)
├── playwright.config.ts          ← the single source of truth for how tests run (see §6)
├── package.json                  ← @playwright/test, @types/node, exceljs — that's the whole dependency list
│
├── prompts/
│   └── loginprompt.md            ← the 7-step "agentic QA workflow" every module follows (see §8)
│
├── user-stories/                 ← one .md per module, the acceptance-criteria source of truth
│   └── US_00N_{Module}.md
│
├── specs/                        ← generated test plans, one per module (Step 2 of the workflow)
│   ├── {SUITE_ID}-story-analysis.md   (Step 1 output, some modules)
│   ├── {SUITE_ID}-test-plan.md        (Step 2 output, every module)
│   └── README.md
│
├── tests/
│   ├── auth.setup.ts              ← logs in once, saves session (see §5)
│   ├── .auth/user.json            ← gitignored — the saved session, regenerated every run
│   ├── pages/                     ← ALL Page Objects live here, organized by application area
│   │   ├── auth/                  (LoginPage, ForgotUserIdPage, ForgotPasswordPage, ActivateAccountPage)
│   │   ├── dashboard/              (DashboardPage, NotificationPanel, MandatoryScrutinyModal)
│   │   ├── profile/                (MyProfilePage, ChangePasswordPage, LanguageSelectionPage)
│   │   └── savings-application/    (SavingsApplicationDashboardPage, ApplicationTrackingModal)
│   ├── 1_LP_TS001/                ← Login specs
│   ├── 2_FUI_TS001/                ← Forgot User ID specs
│   ├── 3_FP_TS001/                 ← Forgot Password specs
│   ├── 4_AA_TS001/                 ← Activate Account specs
│   ├── 5_HP_TS001/                 ← Homepage specs
│   ├── 6_SAD_TS001/                ← Savings Application Dashboard specs
│   ├── CP_TS001/                   ← Change Password specs (not yet renumbered — see §15)
│   ├── example.spec.js             ← Playwright's own scaffold test, harmless, never removed
│   └── seed.spec.ts                ← a placeholder smoke test
│
├── scripts/
│   └── generate-{module}-defect-tracker.js   ← ExcelJS defect-sheet generators (see §12)
│
├── reports/                       ← human-readable output: one `{SUITE_ID}-test-report.md` +
│                                     `{SUITE_ID}-defect-sheet.xlsx` per module, plus a (partially
│                                     stale — see §15) Consolidated-Test-Report.md
│
├── screenshots/{module-slug}/      ← gitignored evidence captured during exploratory testing and defect repro
│
├── test-results/                   ← gitignored Playwright run artifacts (traces, older defect trackers)
└── playwright-report/              ← gitignored Playwright HTML report output
```

**Rule of thumb for "where does this file go":** if it's a Playwright locator/action, it's a Page Object under `tests/pages/`. If it's a `test()` block, it's a spec under `tests/{SUITE_ID}/`. If it's prose about what to test, it's under `specs/` (the plan) or `reports/` (the results). Nothing else should contain test logic.

---

## 4. Architecture: Page Object Model

**The one-line principle every spec and page object follows:**

> Page Objects own the UI. Spec files own the intent. `storageState` owns the session. Nothing crosses boundaries.

### 4.1 Page Object rules

- One class per page, modal, or significant UI section.
- All locators are `readonly` properties, declared in the constructor — never inline inside a method.
- Locators are semantic/role-based wherever the DOM allows it (`getByRole`, `getByPlaceholder`, `getByText`), falling back to a stable CSS class or `data-pc-section` attribute (common in the PrimeReact components this app uses) only when no accessible name exists. Brittle positional CSS (`nth-child`, deep descendant chains) is a last resort and is called out in a comment when used.
- Public methods represent **user actions or assertions**, never raw Playwright calls. A spec file should never see a `Locator` it didn't get from a Page Object property, and should never call `page.click(...)` directly.
- Methods that trigger an async state (a network refetch, a modal opening) wait for the *result* of that action inside the method — not `page.waitForTimeout()`, and not left to the caller to guess. See `SavingsApplicationDashboardPage.performAndWaitForListRefresh()` for the canonical example: it wraps a click in a `page.waitForResponse()` for the specific API call that action triggers, so the method doesn't return until the UI has genuinely caught up.

**Reference example** — `tests/pages/auth/LoginPage.ts`:

```ts
export class LoginPage {
  readonly page: Page;
  readonly userIdInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  // ...all locators declared up front, readonly

  constructor(page: Page) {
    this.page = page;
    this.userIdInput = page.getByPlaceholder('User Id');
    this.passwordInput = page.getByPlaceholder('Password');
    this.loginButton = page.getByRole('button', { name: 'Login' });
    // ...
  }

  async goto(): Promise<void> {
    await this.page.goto('/login');
    await this.userIdInput.waitFor({ state: 'visible' });
  }

  async login(userId: string, password: string): Promise<void> {
    await this.enterEmail(userId);
    await this.enterPassword(password);
    await this.clickLogin();
  }

  async isProcessing(): Promise<boolean> {
    return this.loadingOverlay.isVisible();
  }
}
```

### 4.2 Placement rules

| What it is | Where it goes |
|---|---|
| Page object specific to one module | `tests/pages/{module}/{Name}Page.ts` |
| Modal/dialog belonging to a specific page | Same folder as its parent page (e.g. `MandatoryScrutinyModal.ts` sits next to `DashboardPage.ts`) |
| Component reused across multiple modules (sidebar, header) | `tests/pages/shared/` (not yet needed in this project, but reserved) |
| **Check `tests/pages/` before creating anything new.** | Reuse an existing class if the page already has one — never duplicate a locator across two page objects |

### 4.3 Spec file rules

- Import and instantiate Page Objects; never touch `page` directly except for framework-level things (`page.setViewportSize`, `page.on('dialog', ...)`, `page.waitForResponse` when arranging a precondition).
- `test()` blocks follow arrange → act → assert. `beforeEach` is for navigation/preconditions only — never for login (that's what `storageState` is for).
- Tests are independent — no shared mutable state between tests in the same file (each test that needs "the first row's ID" reads it fresh, rather than trusting a previous test left the app in a known state).
- Credentials and environment-specific values come from `process.env.*` with a fallback default, never hardcoded as the only option.

---

## 5. Authentication Strategy

Authentication happens **once per test run**, not once per test:

**`tests/auth.setup.ts`** — a special Playwright "setup" test that logs in and saves the browser's storage state to disk:

```ts
import { test as setup } from '@playwright/test';
import { LoginPage } from './pages/auth/LoginPage';

const authFile = 'tests/.auth/user.json';

setup('authenticate', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(
    process.env.SAHAYOG_USER_ID ?? 'nayan.aher@netwinindia.in',
    process.env.SAHAYOG_PASSWORD ?? 'Sahayog@2025',
  );
  await page.waitForURL(/\/HOME/);
  await page.context().storageState({ path: authFile });
});
```

**`playwright.config.ts`** wires this in as a dependency every browser project needs before it runs:

```ts
projects: [
  { name: 'setup', testMatch: /auth\.setup\.ts/ },
  {
    name: 'chromium',
    use: { ...devices['Desktop Chrome'], storageState: 'tests/.auth/user.json' },
    dependencies: ['setup'],
  },
  // firefox, webkit: same pattern
],
```

**Result:** every spec file starts already authenticated. No login code in any `beforeEach`.

**Exception — specs that test the login form itself, or any other flow that must start unauthenticated** (Forgot Password, Forgot User ID, Activate Account, Change Password's own page) override the project-level storage state at the describe-block level:

```ts
test.describe('AC0 - Login Page Tests', () => {
  test.use({ storageState: { cookies: [], origins: [] } });
  // tests here get a genuinely blank, logged-out browser
});
```

`.aa-otp-input.txt`-style signal files and `tests/.auth/user.json` are both gitignored — the former is transient inter-process communication (see [§9.1](#91-manually-assisted-live-data-tests)), the latter is a live session token that must never be committed.

---

## 6. Playwright Configuration

`playwright.config.ts`, annotated:

```ts
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,                       // parallel locally; see workers below for CI
  forbidOnly: !!process.env.CI,              // a stray .only() fails the CI build instead of silently under-running
  retries: process.env.CI ? 2 : 0,           // CI retries flaky/transient failures twice; local runs don't
  workers: process.env.CI ? 1 : undefined,   // CI runs single-worker — see §11 for why
  reporter: 'html',
  use: {
    baseURL: 'https://sahyogagentweb.drutam.in:9634',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'setup', testMatch: /auth\.setup\.ts/ },
    { name: 'chromium', use: { ...devices['Desktop Chrome'], storageState: '...' }, dependencies: ['setup'] },
    { name: 'firefox',  use: { ...devices['Desktop Firefox'], storageState: '...' }, dependencies: ['setup'] },
    { name: 'webkit',   use: { ...devices['Desktop Safari'], storageState: '...' }, dependencies: ['setup'] },
  ],
});
```

Key decisions and why:

- **`baseURL`** means every Page Object's `goto()` uses a relative path (`/login`, `/HOME`, `/UNPOSTED`) — changing environments is a one-line edit here, not a find-and-replace across dozens of files. (This is exactly what made the mid-project instance migration from the old UAT host to `sahyogagentweb.drutam.in` tractable.)
- **`workers: 1` on CI** — the target is a real, shared UAT server with rate-limited endpoints (Reference ID requests are capped at one per 24h per account). Parallel workers would multiply real API traffic against a shared account and risk tripping that limit mid-suite; single-worker CI trades speed for determinism against a live external system.
- **`retries: 2` on CI only** — absorbs the environment's own occasional transient slowness (observed 30s timeouts that clear on a second attempt) without masking a real, consistently-reproducing defect (which will still fail all 3 attempts).
- **Three browser projects exist in config**, but CI currently only runs `chromium` (see [§11](#11-cicd-pipeline)) — Firefox and WebKit remain fully usable for local runs.

---

## 7. Test Organization & Naming Conventions

### 7.1 Suite IDs

Every module has a short **Test Suite ID** used consistently across specs, page objects' file names (loosely), the test-plan filename, the report filename, and every test case ID's prefix:

| Module | Suite ID | Test case prefix |
|---|---|---|
| Login | LP_TS001 | `TC-LOGIN-###` |
| Forgot User ID | FUI_TS001 | `TC-FUI-###` |
| Forgot Password | FP_TS001 | `TC-FP-###` |
| Activate Account | AA_TS001 | `TC-AA-###` |
| Homepage | HP_TS001 | `TC-HOME-###` |
| Savings Application Dashboard | SAD_TS001 | `TC-SAD-###` |
| Change Password | CP_TS001 | `TC-CP-###` |

### 7.2 Folder numbering (execution order)

`tests/1_LP_TS001`, `2_FUI_TS001`, `3_FP_TS001`, `4_AA_TS001`, `5_HP_TS001`, `6_SAD_TS001` — the numeric prefixes exist **specifically to control CI execution order**. Playwright always runs spec files in alphabetical path order regardless of the order file paths are passed on the CLI, so this was the only reliable way to make the suite execute in the business-meaningful sequence: Login → Forgot User ID → Forgot Password → Activate Account → Home Redirection. `CP_TS001` was added later and has not yet been folded into this numbering (see [§15](#15-known-gaps--technical-debt)).

### 7.3 Spec files within a module

Each module's tests are split across a handful of feature-area spec files rather than one giant file, e.g. `tests/6_SAD_TS001/` has `navigation-and-tabs.spec.ts`, `search.spec.ts`, `filters.spec.ts`, `application-list-and-actions.spec.ts`, `pagination.spec.ts`, `responsive-ui.spec.ts`. Split by feature area, not by test type — a reviewer looking for "everything about search" should find one file.

### 7.4 Test case IDs and titles

Every `test()` title is `TC-{PREFIX}-{NNN}: {plain-English description}`, matching the ID used in that module's `specs/{SUITE_ID}-test-plan.md` and `reports/{SUITE_ID}-test-report.md`. When a test exists specifically to document a known defect rather than confirm correct behavior, its title says so explicitly, e.g. `TC-FUI-016: Rapid double-click on Send Reference ID does not double-submit - DEF-003` — so a failing assertion here in the future means the defect's behavior changed (possibly a regression, possibly a fix), not that the test is broken.

---

## 8. The Agentic QA Workflow

`prompts/loginprompt.md` defines the **7-step process** every module in this repo was built with. This is the actual methodology, not just a historical artifact — follow it for the next module too.

| Step | Output | Where it lands |
|---|---|---|
| **1. Read & analyze the user story** | Feature overview, entity/CRUD matrix, state transitions, business rules, tagged AC list | `specs/{SUITE_ID}-story-analysis.md` (for some modules) |
| **2. Create test plan** | Test cases covering 10 test types (happy path, negative/validation, state-aware UI, full CRUD, business-rule enforcement, form-field deep validation, UI state persistence, audit/data recording, third-party integration, async/race) | `specs/{SUITE_ID}-test-plan.md` |
| **3. Exploratory testing** | Manual-style pass against the live app applying "human QA tester" heuristics (double-click every button, scan every dropdown for real vs. placeholder data, trigger every delete, etc.) — this is where real defects get *found*, before any code is written | Screenshots in `screenshots/{module-slug}/`, findings feed step 4 |
| **4. Generate automation scripts** | POM + spec files following [§4](#4-architecture-page-object-model)/[§7](#7-test-organization--naming-conventions) exactly | `tests/pages/{module}/`, `tests/{SUITE_ID}/` |
| **5. Execute and heal** | Run headed, diagnose every failure by *layer* (selector vs. missing wait vs. wrong assertion vs. auth vs. import path — see table below), fix in the correct file, re-run until green | Updated Page Objects/specs |
| **6. Network/API defect analysis** | Capture network traffic during the run, flag any 4xx/5xx, and specifically check for *silent* failures (HTTP 200 with an error body) that a naive status-code check would miss | `screenshots/{module-slug}/network_requests.txt` |
| **7. Generate QA test report** | Executive summary, statistics, full test-case table, defect log, coverage matrix, recommendations | `reports/{SUITE_ID}-test-report.md` + `reports/{SUITE_ID}-defect-sheet.xlsx` |

### 8.1 Healing is layer-aware, not just "make it pass"

Step 5 is not "change assertions until green." Every failure is triaged to the layer it actually belongs to, and fixed only there:

| Failure looks like | Fix goes in | Never fix in |
|---|---|---|
| Selector doesn't match anymore | The module Page Object | The spec file |
| Action works but is missing a wait for an async result | The Page Object method (add the wait inside it) | The spec's `beforeEach` |
| A shared component's selector changed | `tests/pages/shared/...` (or the shared page it lives on) | Every spec that happens to touch it |
| Auth/session broken | `auth.setup.ts` | A spec's `beforeEach` |
| A login-page test is getting a pre-authenticated session | The spec (`test.use({ storageState: { cookies: [], origins: [] } })`) | The page object |
| Assertion is too strict, or was just wrong | The spec's `test()` block | The page object |
| Import path is stale after a file move | Whichever file has the broken import | Anywhere else |

Real example from this project (Savings Application Dashboard): `getApplicationIds()` was reading only the first row's ID across *all* rows instead of one ID per row — a Page Object bug, fixed there. Separately, several tests read the dashboard's data before the app had actually finished loading it (the "no records" placeholder is visually identical to the real empty state) — that was a missing-wait bug, fixed by waiting on the specific `app/activity/list` network response rather than a fixed timeout.

---

## 9. Special Test Categories

### 9.1 Manually-assisted, live-data tests

Some flows (Forgot Password's full OTP recovery, Forgot User ID's full recovery, Account Activation's full activation, Change Password's full password change) can only be *end-to-end* verified with a **real** SMS/email-delivered OTP or Reference ID — there is no API to read that delivery programmatically in this environment.

The pattern:

```ts
function waitForSignalFile(filePath: string, timeoutMs: number): Promise<string> {
  // polls for a file to appear, reads it, deletes it, resolves with its contents
}

test.describe('{SUITE} - Full Recovery (Live, Manually-Assisted)', () => {
  test.skip(!!process.env.CI, 'Manually-assisted OTP relay — not runnable unattended in CI');
  // ...
  test('TC-XXX-0NN: Full recovery with correct Reference ID and OTP ...', async ({ page }) => {
    // ... trigger the real request ...
    console.log(`WAITING_FOR_OTP: write the code to ${OTP_SIGNAL_FILE} to continue.`);
    const otp = await waitForSignalFile(OTP_SIGNAL_FILE, 5 * 60 * 1000);
    // ... submit it, assert the outcome ...
  });
});
```

**A human runs these locally**, watches the console for the `WAITING_FOR_...` line, and writes the real value into the named file (e.g. `.fui-otp-input.txt`) within the file's directory. The test picks it up within 2 seconds and continues.

**`test.skip(!!process.env.CI, ...)` is mandatory on every one of these.** No human is present in CI to supply the value, so without this guard the test burns its full timeout (up to ~11 minutes) on every CI run and — worse — its own retries can exhaust the account's real, rate-limited Reference ID quota. This exact gap caused a real incident: a newly-added Activate Account test (`TC-AA-020`) was committed without the guard and failed every CI run because its hardcoded Reference ID was single-use and had already been consumed by the one human-assisted run that created it. The fix was adding the same skip guard already used by the other three modules.

### 9.2 Rate-limit / quota-protected tests

Several `beforeEach` blocks deliberately use an **unregistered** value (mobile number, User ID) to reach a verification step's UI without spending a real, rate-limited request:

```ts
const recoveryRequests: string[] = [];
page.on('request', (r) => { if (r.url().includes('otp/request')) recoveryRequests.push(r.url()); });
// ... if the toast doesn't say "sent successfully", skip cleanly rather than fail misleadingly:
test.skip(!toastText.includes('...'), `Blocked: ... (toast said: "${toastText}")`);
```

This is why some modules show tests "skipped by design" in their statistics — that's a deliberate reachability gate protecting a shared account's real quota, not a test that's broken.

### 9.3 Security payload tests

Every form with a text input gets an SQL-injection test (`' OR '1'='1`) and an XSS test (`<script>alert(1)</script>`), asserting: no JS `dialog` fires, no raw SQL/stack-trace error surfaces, and the app stays on the same page/shows its normal validation/error path.

### 9.4 Responsive/viewport tests

`page.setViewportSize({ width, height })` at defined breakpoints (mobile 375×667 or 390×844, tablet 768×1024, and specific "does it clip" checks like 1366×768). Where clipping is checked, it's done via bounding-box math against `viewportSize()` rather than `toBeVisible()` — Playwright's visibility check does not detect an ancestor clipping an element via `overflow:hidden`, which is exactly the shape a real, previously-found viewport-clipping defect took.

---

## 10. Running Tests Locally

```bash
# Install once
npm ci
npx playwright install

# Run everything, headed, one module at a time (recommended — see workers note in §6)
npx playwright test tests/1_LP_TS001 --project=chromium --headed --reporter=list --workers=1

# Run a whole module's suite
npx playwright test tests/6_SAD_TS001 --project=chromium --headed --reporter=list

# Run a single spec file
npx playwright test tests/6_SAD_TS001/search.spec.ts --project=chromium --headed

# Run everything (mirrors CI, minus the browser restriction)
npx playwright test --project=chromium

# View the HTML report after a run
npx playwright show-report
```

Override credentials/environment via env vars rather than editing code:

```bash
SAHAYOG_USER_ID=someone@netwinindia.in SAHAYOG_PASSWORD='...' npx playwright test ...
```

For a manually-assisted live test, run it, watch the terminal for `WAITING_FOR_...`, and write the real value into the named signal file in the repo root before the timeout elapses.

---

## 11. CI/CD Pipeline

### 11.1 The workflow — `.github/workflows/playwright.yml`

```yaml
name: Playwright Tests
on:
  push:
    branches: [ main, master ]
jobs:
  test:
    timeout-minutes: 60
    runs-on: [self-hosted, Windows]
    steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with: { node-version: lts/* }
    - name: Install dependencies
      run: npm ci
    - name: Install Playwright Browsers
      run: npx playwright install
    - name: Run Playwright tests
      run: npx playwright test --project=chromium
    - uses: actions/upload-artifact@v4
      if: ${{ !cancelled() }}
      with:
        name: playwright-report
        path: playwright-report/
        retention-days: 30
```

### 11.2 Why a self-hosted runner

The target app (`sahyogagentweb.drutam.in:9634`) lives on a **private UAT network** — GitHub's own hosted runners have no route to it. The fix is a self-hosted runner: a Windows machine with real network access to the UAT server, running the GitHub Actions runner agent and registered to this repo.

### 11.3 Security: why the trigger is `push`-only

A self-hosted runner on a **public** repository combined with a `pull_request` trigger is a well-known arbitrary-code-execution risk: anyone can open a PR whose CI run executes on your runner with its network access. This workflow deliberately has **no `pull_request` trigger** — only `push` to `main`/`master`, which requires push access to the repo. If PR-triggered CI is ever wanted, it must go through `pull_request_target` with strict path/approval gating, or a separate, network-isolated runner — not a blanket `pull_request` trigger on this runner.

### 11.4 Runner setup (for maintaining/replacing it)

The runner (`sahyogagentweb.drutam.in`-reachable Windows host) is registered as:

- **Name:** `sahayog-uat-runner`
- **Labels:** `self-hosted, Windows`
- **Work folder:** `_work`
- **Location:** `D:\actions-runner\`

To register a fresh one (or move to a new host):

```powershell
# On the target Windows machine, in an elevated PowerShell:
cd D:\actions-runner
.\config.cmd --url https://github.com/jayeshpagar28/Sahayog-Agentic-AI --token <registration-token-from-repo-settings>
# If a runner with the same name already exists and --replace doesn't resolve it,
# remove the local registration first: .\config.cmd remove --token <token>, then re-register.
```

Currently the runner process is kept alive via `run.cmd` in a long-running background shell rather than installed as a proper Windows service — installing it as a service requires Administrator elevation that hasn't yet succeeded in this environment (see [§15](#15-known-gaps--technical-debt)). Whoever maintains this next should prioritize finishing that, since the current setup does not survive a host reboot automatically.

### 11.5 Known CI limitations and why

| Limitation | Root cause | Status |
|---|---|---|
| Firefox excluded from CI | Missing VC++ Redistributable (`msvcp140_1.dll`) on the runner host — Firefox fails to launch at all without it | Deferred; install the redistributable to re-enable |
| WebKit excluded from CI | Simplicity/speed — CI runs Chromium only | Deliberate choice, not a blocker; re-enabling is a one-line workflow edit once desired |
| `workers: 1` on CI | Deliberate — see [§6](#6-playwright-configuration) | By design, not a limitation to "fix" |
| Manually-assisted live tests skip in CI | See [§9.1](#91-manually-assisted-live-data-tests) | By design |

### 11.6 Verifying a CI run

```bash
# Using the GitHub REST API (no gh CLI installed in this environment; use curl + a token from git's own credential store)
token=$(git credential fill <<'EOF'
protocol=https
host=github.com
EOF
)
GH_TOKEN=$(echo "$token" | grep '^password=' | cut -d= -f2)
curl -s -H "Authorization: Bearer $GH_TOKEN" -H "Accept: application/vnd.github+json" \
  "https://api.github.com/repos/jayeshpagar28/Sahayog-Agentic-AI/actions/runs?branch=main&per_page=1"
```

Download a run's job log via `.../actions/jobs/{job_id}/logs` to get the final `X passed / Y failed / Z skipped` line and any stack traces.

---

## 12. Reporting

Three layers, in increasing order of "for whom":

1. **Playwright's own HTML reporter** (`reporter: 'html'` in config) — the raw, drillable trace-and-screenshot view for whoever is actively debugging a failure. Generated to `playwright-report/`, gitignored, uploaded as a CI artifact (30-day retention) on every run regardless of pass/fail (`if: ${{ !cancelled() }}`).

2. **Per-module Markdown test report** (`reports/{SUITE_ID}-test-report.md`) — human-readable, for anyone who wants "what was tested and what happened" without opening Playwright at all. Structure: Executive Summary → Test Statistics → full Test Case Execution table → Defect Log → Coverage Matrix (AC-by-AC) → Recommendations. See `reports/SAD_TS001-test-report.md` for the fullest current example.

3. **Excel defect tracker** (`reports/{SUITE_ID}-defect-sheet.xlsx`) — for handoff to developers/PMs who live in Excel, not Markdown. Generated by `scripts/generate-{module}-defect-tracker.js` (ExcelJS): frozen header row, autofilter, conditional formatting on Status/Priority/Severity, and dropdown data-validation on Status/Priority/Severity/Type/Retested Result. Columns exactly match `prompts/loginprompt.md`'s Step 7 spec: `Defect ID, Date, Instance, Module, Title, Description, Test Data / Required Info, Status, Screenshot / STR, Priority, Severity, Type, Retested Result, Developer Assigned, Resolved Date, Developer Comment, QA Comment, Changes Applied`.

   To regenerate one: `node scripts/generate-{module}-defect-tracker.js` (writes to `reports/`). **If the target `.xlsx` is open in Excel, the write will fail with `EBUSY`** — close it first.

There is also `reports/QA-Automation-Status-Summary.md`, a project-wide rollup (modules complete, total automated test cases, full defect list by severity) kept separately from the per-module reports and from `Consolidated-Test-Report.md` — see [§15](#15-known-gaps--technical-debt) for the distinction and its current staleness.

**Screenshot evidence** goes in `screenshots/{module-slug}/`, gitignored. Naming convention: `{STORY_ID}_{AC_REF}_{ShortDescription}.jpeg` for general evidence, `BUG-{NNN}_{HTTP_CODE_if_API}_{ShortDescription}.png` for defect repro shots (e.g. `BUG-SAD-001_direct-navigation-empty-dashboard.png`).

---

## 13. Defect Management Conventions

### 13.1 ID scheme

- `BUG-{module-abbrev}-{NNN}` or `DEF-{module-abbrev}-{NNN}` for module-scoped defects (e.g. `BUG-FP-001`, `BUG-SAD-003`).
- Bare `DEF-00N`/`BUG-00N` (no module abbreviation) for the earliest, cross-cutting defects logged before the per-module convention solidified (`DEF-001`, `BUG-006`, `BUG-007`) — still valid, just from an earlier numbering era.
- IDs are never reused or renumbered once assigned, even across reports.

### 13.2 Severity vs. Priority

Both are tracked, deliberately kept distinct:

- **Severity** — technical impact: `Blocker > Critical > Major > Minor > Trivial`.
- **Priority** — business urgency to fix: `Critical > High > Medium > Low`.

A defect can be low-severity-but-high-priority (a trivial-looking issue that's highly visible to executives) or the reverse — don't conflate them.

### 13.3 Where a defect first gets documented

A defect is never *only* written down in a report — it is also encoded as a still-passing automation test that asserts the *current* (defective) behavior, with the defect ID in the test title (e.g. `TC-FUI-016: ... - DEF-003`). This means:

- The defect is regression-proof: if the behavior changes (fixed *or* newly broken further), the test fails loudly instead of silently going stale.
- Re-reporting after a real fix lands is a matter of updating that one test's expected behavior back to "correct" and updating the defect's Status — not rediscovering the defect from scratch.

---

## 14. Current Project Status

See **`reports/QA-Automation-Status-Summary.md`** for the live, verified snapshot (module completion, exact automated test-case counts from `--list`, full defect log by severity). As of that document's last update:

- **7 of 7 in-scope modules complete**: Login, Forgot User ID, Forgot Password, Activate Account, Homepage, Savings Application Dashboard, Change Password.
- **154 automated test cases** total.
- **13 open defects** (4 Major, 7 Minor, 1 Low, 1 Trivial — no Critical/Blocker found in any module).
- Latest full CI run: 147 passed, 11 skipped by design, 0 failed.

Do not treat these numbers as permanently current — regenerate them (`npx playwright test --project=chromium --list`, plus a scan of each module's Defect Log) whenever this document or the status summary is next revisited, since both drift as modules are added.

---

## 15. Known Gaps & Technical Debt

- **Runner is not a Windows service.** It runs via a background `run.cmd` session, not `config.cmd ... --runasservice`. It will not restart automatically after a host reboot. Needs an elevated PowerShell session to fix — blocked so far on obtaining that elevation in this environment.
- **Firefox is disabled in CI** pending installation of the VC++ Redistributable on the runner host.
- **`CP_TS001` (Change Password) hasn't been folded into the numbered execution-order convention** (`1_LP_TS001` … `6_SAD_TS001`) — it should become `7_CP_TS001` (or be placed wherever it belongs in the real business flow) for consistency and to guarantee its CI execution position.
- **`reports/Consolidated-Test-Report.md` is stale** — it only covers Login, Homepage, and Forgot User ID (dated 28-Jul-2026) and was never updated when Forgot Password, Activate Account, Change Password, and Savings Application Dashboard were completed. Either keep it current going forward or retire it in favor of `QA-Automation-Status-Summary.md` plus the per-module reports — don't let a reader mistake it for current.
- **Root `README.md` is effectively empty** (just a title). It should at minimum point to this document.
- **Two defect *classes* recur independently across modules** rather than being fixed once: (a) a hard page reload drops the SPA route and bounces to `/login` (seen in Forgot User ID and Activate Account), and (b) a primary submit button isn't disabled while its request is in flight, allowing a double-submit (also seen in both). Worth raising as a single shared-component fix to the dev team rather than two separate tickets.
- **No environment/README section yet documents required local secrets** beyond the two env vars mentioned in [§10](#10-running-tests-locally) — if more accounts/credentials get added (e.g. a dedicated non-shared account for destructive live tests), document them here.

---

## 16. Future Roadmap

Directly out of scope for every module completed so far, and the natural next candidates for the same 7-step workflow:

1. **New Savings Application creation wizard** (the multi-step flow reached via "New Application" on the dashboard) — Applicant Details, Mobile Verification, Aadhaar Verification, Product & Scheme Selection, Document Upload, Application Preview & Final Submission. User-story docs for several of these steps already exist in `user-stories/` (`4. Scheme_list.md` through `9. Application_Preview & Final_Submission.md`) but have no test plan or automation yet — this is the largest remaining body of work.
2. **Approval / Decision workflow** (the reviewer/approver side of an application, as opposed to the applicant-facing side automated so far).
3. **Finish the CI hardening**: install the runner as a proper Windows service; install the VC++ Redistributable and re-enable Firefox; consider adding WebKit back for CI cross-browser confidence once runtime budget allows.
4. **Retire or refresh `Consolidated-Test-Report.md`** so there is exactly one current, trustworthy project-wide rollup.
5. **Address the two recurring defect classes** (reload-drops-flow, no in-flight button disable) as shared fixes rather than per-module tickets, and re-verify all four affected modules once fixed.
6. **Consider a dedicated, non-shared test account** for any future live/manually-assisted destructive test, following the pattern already used for Change Password's `TC-CP-011` (a dedicated account rather than the shared regression account), to avoid consuming the primary account's rate-limited quotas or altering its real state.

---

## 17. Onboarding Checklist

For a new QA engineer's first day on this framework:

1. `git clone` the repo, `npm ci`, `npx playwright install`.
2. Read `user-stories/US_00N_{SomeModule}.md` for a module you don't know yet, then its `specs/{SUITE_ID}-test-plan.md`, then `reports/{SUITE_ID}-test-report.md` — in that order, to see the whole life cycle of one module end to end.
3. Read `tests/pages/auth/LoginPage.ts` and `tests/1_LP_TS001/*.spec.ts` side by side — the smallest, cleanest example of the POM pattern in this repo.
4. Run `npx playwright test tests/1_LP_TS001 --project=chromium --headed --reporter=list` locally and watch it execute — confirms your environment/credentials work before you touch anything.
5. Before adding a new module, re-read [§8](#8-the-agentic-qa-workflow) and [§4](#4-architecture-page-object-model) — the whole point of this framework is that the *process* is reusable, not just the code.
6. Before touching CI, read [§11](#11-cicd-pipeline) in full, especially §11.3 — this runner's security posture is deliberate, not incidental.
7. When you find a real defect, write the test that documents it (see [§13.3](#133-where-a-defect-first-gets-documented)) in the same commit as the rest of that module's automation — don't defer it to a separate pass.
