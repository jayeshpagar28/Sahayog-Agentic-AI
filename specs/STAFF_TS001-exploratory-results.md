# STAFF_TS001 — Step 3: Exploratory Test Execution Results

**Test plan:** `specs/STAFF_TS001-test-plan.md`
**Story:** `user-stories/US_010_Staff_Salary_Account_Journey.md`
**Executed:** 2026-08-18, ~06:51–07:40 UTC
**Environment:** `https://sahyogagentweb.drutam.in:9634` (UAT) · logged in as `nayan.aher@netwinindia.in`
**Tooling:** Playwright MCP (standard config — no camera project needed for this band)
**Screenshots:** `screenshots/staff-salary-account/`

---

## 1. Execution Summary

| | |
|---|---|
| **Cases attempted** | 28 |
| **Passed** | 19 |
| **Failed (defect)** | 3 |
| **Blocked** | 6 |
| **Band A (cold-safe) coverage** | Complete |
| **Band B (seed-resume) coverage** | ⛔ **Blocked — the seed application was cancelled** (see §4) |
| **New defects raised** | 3 (`BUG-STAFF-001`, `-002`, `-003`) |
| **Story corrections required** | 2 (FR-09/AC4 inverted; `linkExpiryMin` changed) |
| **Inherited defects confirmed live** | 4 (D-02, D-03, D-35, D-38) |
| **Console errors on the happy path** | 0 |
| **4xx/5xx responses observed** | 0 |

> **No record was created, no OTP was sent, no verification attempt was consumed, and no
> Submit or Cancel control was operated at any point.** All safety rules in test plan §0.3 held.

---

## 2. Headline Findings

1. **The user story is wrong about the single most-tested control.** "Send Verification Code"
   appears and is **enabled from the first digit**, not at 10. Story FR-09, AC4, NS-03, EC-02
   and PS-04 all state the opposite, and **D-19 is inverted** — the repo
   (`MobileVerificationStep.ts`) and Silver's TC-SIL-002 were right; the story drifted.
   Raised as **BUG-STAFF-002**.
2. **The seed application `SAH-1003-812` has been cancelled** by another party on this shared
   UAT environment. It is now under *Decisioned* with `msgCode: "APPL_REJECT"`. **The entire
   seed-resume automation band is blocked until a new seed is built.**
3. **Reloading or deep-linking `/schemelist` renders a permanently blank page** with an
   uncaught `TypeError: Cannot read properties of null (reading 'acType')`. Raised as
   **BUG-STAFF-001**.
4. **A cancelled application still presents editable form fields and a live `Submit` button**
   on Document Upload, while the server reports `isEditable: 0` for every step. Raised as
   **BUG-STAFF-003** (control presence observed; not clicked, so writability is unproven).
5. **The workflow structure is now confirmed server-side, not just from the UI** — see §3.1.
   This is the strongest available evidence for AC6/BR-03.

---

## 3. Confirmed Behaviour

### 3.1 Workflow structure — server-side proof (`aos/steps/getdetails`)

Retrieved for `SAH-1003-812`. **12 steps**, module sequences `1, 2, 4, 5, 6, 7, 10, 11, 12, 13, 15, 16`:

| Seq | `stepCode` | `stepDesc` | `skipAllowed` | `sequencialProcessing` | `stepStatus` |
|---|---|---|---|---|---|
| 1 | `MOBILE_VERIFICATION` | Mobile Number Verification | 0 | 1 | 1 |
| 2 | `EKYC_VERIFICATION` | eKYC Verification | 0 | 1 | 1 |
| 4 | `LIVELINESS_VERIFICATION` | Liveliness Verification | 0 | 1 | 1 |
| 5 | `ADDR_VERIFICATION` | Address Details | 0 | 1 | 1 |
| 6 | `BRANCH_SELECTION` | Branch Selection | 0 | 1 | 1 |
| 7 | `INDIV_BASIC_INFORMATION` | Basic Details | 0 | 1 | 1 |
| 10 | `SALARIED_INFORMATION` | Salaried Information | 0 | 1 | 1 |
| 11 | `APPLICANT_PHOTO` | Applicant Photo | 0 | 1 | 1 |
| 12 | `NOMINEE_INFORMATION` | Nominee Details | 0 | 1 | 1 |
| 13 | `APPL_DOCUMENT` | Document Upload | **1** | 1 | 1 |
| 15 | `INTRODUCER_DETAILS` | Introducer Details | 0 | 1 | 1 |
| 16 | `LEAD_DETAILS` | Lead Details | 0 | 1 | 1 |

**This confirms, from the server rather than the UI:**

* ✅ **AC6 / BR-03 — there is no `ACCOUNT_TYPE` step.** Module sequence 2 is `EKYC_VERIFICATION`.
  No Individual/Joint/Minor selection exists anywhere in the workflow definition.
* ✅ **BR-26 / FR-65 / D-35 — `APPL_DOCUMENT` is the *only* step with `skipAllowed: 1`.**
  Every other step is `skipAllowed: 0`. The regulatory defect is confirmed at config level.
* ✅ **BR-04 — every step is `sequencialProcessing: 1`.**
* ✅ **Sequences 3, 8, 9 and 14 are absent** from the step list. Sequence 3
  (`EXISTING_CUSTOMER_DATA`) is the UI-less system step, which is why the stepper renders
  **12** tabs while the story counts **13** workflow steps. Both are correct; they count
  different things.
* ✅ **FR-05 / TC-STAFF-233 — `aosWorkflowDtlUuid` ends `…stsa`**, distinct from Silver
  (`…sas`) and Normal (`…nsa`). Scheme 1003 runs its own workflow definition.

### 3.2 Per-case results

| TC | Title | Status | Actual |
|---|---|---|---|
| TC-STAFF-001 | Home → Savings Application → Dashboard | **Pass** | `/UNPOSTED` with 4 status tiles: Pending 22, Submitted 16, Re-Assigned 1, Decisioned 56 |
| TC-STAFF-002 | Dashboard → New Application | **Pass** | `/schemelist`; 3 schemes under "Savings Account" |
| TC-STAFF-003 | 1003 is listed | **Pass** | `Silver…1002`, `Normal…1001`, `Staff Salary Account - 1003` |
| TC-STAFF-004 | Selecting 1003 creates no record | **Pass** | `/applndetails`; header shows Product + Scheme only; **no Applicant Id**; no record created |
| TC-STAFF-005 | Fresh draft exposes one stage | **Pass** | Exactly 1 stepper tab: "Mobile Number Verification" |
| TC-STAFF-109 | Scheme search is server-side | **Pass** | `staff` (lowercase) → only 1003. Request body carried `searchValue:"staff"`, `inActiveAcRequired:0`, `pageLimit:1000` |
| TC-STAFF-201 | Clearing search restores the list | **Pass** | All 3 schemes returned |
| TC-STAFF-030 | Alphabetic input rejected | **Pass** | Typed `abcdefghij` → field remained **empty** |
| TC-STAFF-031 | Special characters stripped | **Pass** | `98!@#76*54` → `987654` |
| TC-STAFF-032 | <10 digits keeps Send hidden | **FAIL** | **Send is visible from 1 digit** — see BUG-STAFF-002 |
| TC-STAFF-033 | 10 digits reveals Send | **Pass** (vacuously) | Visible — but visible at every length ≥1 |
| TC-STAFF-034 | Capped at 10 digits | **Pass** | 15 digits typed → value length exactly 10 |
| TC-STAFF-035 | Boundary 9→10→9 | **FAIL** | Control never hides above 0 chars — see BUG-STAFF-002 |
| TC-STAFF-091 | Dashboard shows Customer Type Individual | **Pass** | All three 1003 rows read "Individual" — no user choice exists |
| TC-STAFF-092 | Applicant Id format | **Pass** | `SAH-1003-812`, `SAH-1003-814`, `SAH-1003-772` all match `/^SAH-1003-\d+$/` |
| TC-STAFF-122 | **1003 offers no Account Type step** | **Pass** | Confirmed twice — 12 stepper tabs with no "Account Type", and server-side `aosStepList` (§3.1) |
| TC-STAFF-233 | 1003 runs its own workflow definition | **Pass** | `aosWorkflowDtlUuid` = `…dc4bd3d7e201stsa` |
| TC-STAFF-081 | Completed step reopens read-only | **Pass** | Mobile Number Verification: "Mobile Number Verification submitted successfully.", 1 input, **0 enabled**, no buttons |
| TC-STAFF-083 | Locked step has no Submit | **Pass** | Branch Selection: read-only branch card (AMGAON BRANCH, Id 1005), 0 inputs, 0 buttons |
| TC-STAFF-082 | Editable step reopens pre-populated | **Pass** | Basic Details: 42 inputs / 13 enabled, "Next" button, dropdowns retaining `Mode of Operation = Self`, `Prefix = Mr` |
| TC-STAFF-060 | Same staff code for both Lead roles | **FAIL (expected)** | **D-38 confirmed live** — Lead Converter and Sourcer both read `Name: PAVAN KISAN SHEWALE` |
| TC-STAFF-225 | OTP not returned to the browser | **FAIL (expected)** | **D-02 confirmed live** — `aos/mobile/verify/get/details` returns `mobileOtp: "$2a$10$m4TBMG…"` |
| TC-STAFF-252 | No failure reported as HTTP 200 | **FAIL (expected)** | **D-03 confirmed live, new variant** — a *rejection* returned as `success:"TRUE"`, `isError:false` (§3.3) |
| TC-STAFF-142 | Document Upload must not be skippable | **FAIL (expected)** | **D-35 confirmed at config level** — `APPL_DOCUMENT` is the sole `skipAllowed: 1` step |
| TC-STAFF-250 | No console errors on the happy path | **Pass** | 0 errors across login → dashboard → scheme list → wizard. Only a browser-level notification-permission warning (not app-originated) |
| TC-STAFF-251 | No 4xx/5xx during a Band A pass | **Pass** | 17 XHRs captured, **all 200** |
| TC-STAFF-253 | No horizontal overflow | **Pass** | `scrollWidth 960` = `innerWidth 960` |
| TC-STAFF-093 | 6 of 13 steps re-editable | **Blocked** | Cannot assess on a cancelled record — server reports `isEditable: 0` for **all** steps (see BUG-STAFF-003) |

### 3.3 Corrections to the user story

| # | Story claim | Live behaviour | Action |
|---|---|---|---|
| C1 | FR-09 / AC4 / NS-03 / EC-02 / PS-04 — "Send Verification Code" is hidden below 10 digits | **Visible and enabled from 1 digit** | Story must be corrected; **D-19 is inverted** — the repo was right |
| C2 | FR-17 / BR-11 / D-01 — DigiLocker `linkExpiryMin: 25` | Live response returns **`linkExpiryMin: 30`** | Re-verify D-01; a 27 m 14 s countdown is *consistent* with 30, so D-01's DigiLocker limb may be invalid. `otpExpiryMin: 15` is unchanged and D-01's OTP limb stands |
| C3 | §5.3 — "Applicant Photo is the 9th tab" | Applicant Photo is the **8th** rendered tab (of 12) | Minor; tab-position claims should be dropped in favour of `aosModuleSequence` |
| C4 | BR-23 / FR-G18 — "no way to decline nomination" | The Nominee table renders a **Delete** column | Not contradicted (Delete was inert on a completed record) but the story's claim that no removal affordance exists needs re-checking on a live draft |

---

## 4. Band B Blocker — the seed application is gone

**`SAH-1003-812`**, which US_010 §15.1 designated as the seed for Step 2 ("an ideal seed for
Step 2, but not a record that should ever be submitted"), **is no longer resumable.**

| Evidence | Value |
|---|---|
| Present in *Pending* (22 records, all 3 pages) | ❌ No |
| Found under *Decisioned* | ✅ Yes, 1 record |
| Status cell | `NA` |
| Decision cell | **`Sourcer Cancel`** |
| `aos/mobile/verify/get/details` → `resultVo` | `{"msgCode":"APPL_REJECT","msgDescr":"Your application request is rejected !","success":"TRUE"}` |
| All 12 steps | `stepStatus: 1` (complete), `isEditable: 0` |

It was listed as *Sourcer Pending* at **06:53** during this very session and had left the
Pending list by **07:18**. **This was not caused by any action in this session** — no Submit,
Cancel or Action-menu control was operated at any point. The environment is shared and shows
concurrent third-party activity (`SAH-1003-814` was created by another applicant on
17-08-2026, and the notification panel carries live DigiLocker/Liveliness completions for
that applicant).

**Consequence:** every Band B case in the test plan is **Blocked** rather than Failed. The
suite generated in Step 4 gates these behind `STAFF_SEED_APPLICANT_ID` and **skips with a
stated reason** when the seed is absent, so an unconfigured run reports honestly.

**Recovery:** run `tests/10_STAFF_TS001/seed-application-builder.spec.ts` (manually assisted —
requires a real handset for OTP, DigiLocker consent and a liveliness check), then set
`STAFF_SEED_APPLICANT_ID` to the new id. This is exactly the risk anticipated as **R7** in
test plan §15.

---

## 5. New Defects

### BUG-STAFF-001 — `/schemelist` renders a blank page on reload or deep-link

* **Severity:** Major · **Priority:** High · **Type:** Functional / UI
* **Steps:** Navigate directly to `https://sahyogagentweb.drutam.in:9634/schemelist` (or
  reload the page while on it).
* **Actual:** The page renders **completely empty** (`document.body.innerText` is `""`), with
  two uncaught console errors:
  `TypeError: Cannot read properties of null (reading 'acType') at wN (main.ee8746f2.js:2:4307543)`.
  No error message, no redirect, no recovery — the user must navigate to `/HOME` and start again.
* **Expected:** Either the scheme list renders, or the user is redirected with an explanation.
* **Evidence:** `screenshots/staff-salary-account/BUG-STAFF-001_schemelist-deeplink-blank.png`
* **Note:** This contradicts story §7.2's "zero console errors" observation, which never
  reloaded `/schemelist`. It also constrains automation — specs must reach `/schemelist`
  through `/HOME`, never by direct navigation.

### BUG-STAFF-002 — "Send Verification Code" is enabled from a single digit

* **Severity:** Major · **Priority:** High · **Type:** Validation
* **Steps:** Start a fresh 1003 draft → type one digit into Mobile Number.
* **Actual:** "Send Verification Code" is **visible (241×34 px) and enabled** at 1 digit, and
  at every length from 1 to 10. Confirmed by real keystrokes and by incremental programmatic
  entry; the control is correctly hidden only when the field is empty.
* **Expected (per story FR-09/AC4):** Hidden until exactly 10 digits are entered.
* **Impact:** An OTP send can be attempted against an obviously invalid number, consuming one
  of only **three** attempts per application (BR-07) and creating a live applicant record
  (BR-01) keyed to a junk mobile number.
* **Evidence:** `screenshots/staff-salary-account/BUG-STAFF-002_send-code-enabled-at-1-digit.png`
* **Not verified:** whether the *server* rejects a short number — proving that would consume a
  real SMS attempt and create a junk record, so it was deliberately not attempted.

### BUG-STAFF-003 — A cancelled application still exposes editable fields and a Submit control

* **Severity:** Major · **Priority:** Medium · **Type:** Functional / Security
* **Steps:** Dashboard → Decisioned → open a `Sourcer Cancel`-led application via the View
  (eye) icon → open the **Document Upload** step.
* **Actual:** The step renders **3 enabled inputs** plus **`Cancel` and `Submit` buttons**, and
  **Basic Details** renders 13 enabled inputs with a `Next` button — while
  `aos/steps/getdetails` reports **`isEditable: 0` for all 12 steps** and the application is
  `APPL_REJECT`. The client is not honouring the server's own edit flags.
* **Expected:** A cancelled/decisioned application is fully read-only, as Mobile Number
  Verification, Branch Selection and Lead Details correctly are.
* **Caveat:** ⚠️ **The Submit button was deliberately not clicked**, so whether it would
  actually persist a write to a cancelled application is **unproven**. The defect as filed is
  the *presence of an editable, submittable control on a terminated record*. A developer
  should confirm the write path server-side.

---

## 6. Inherited Defects Confirmed Live

| Defect | Confirmation |
|---|---|
| **D-02** (Critical, Security) | `aos/mobile/verify/get/details` returns `mobileOtp: "$2a$10$m4TBMGWFOt.aTfJQDqpQi.dmpFS6IdCI42j0TMJYLtps4i2ZoZTui"` — a bcrypt hash of a short numeric OTP, offline-brute-forceable, sent to the browser |
| **D-03** (Major) | Confirmed with a **new variant**: an application **rejection** is returned as `{"msgCode":"APPL_REJECT","msgDescr":"Your application request is rejected !","isError":false,"success":"TRUE"}` inside HTTP 200. Not only are failures dressed as 200s — here a terminal rejection is dressed as **success** |
| **D-35** (Critical, Regulatory) | `APPL_DOCUMENT` is the **only** step in the workflow with `skipAllowed: 1`, confirmed in the step configuration |
| **D-38** (Minor) | Lead Converter Code and Sourcer Code both resolved to `PAVAN KISAN SHEWALE` on the completed application |

---

## 7. Not Executed

| Area | Reason |
|---|---|
| Everything from Address Details through the Summary | ⛔ Seed cancelled (§4); a cold run needs three human gates |
| OTP send, OTP expiry, attempt caps | ⛔ Consumes real SMS and creates live records |
| DigiLocker consent, Liveliness completion | ⛔ Human-only gates requiring a real applicant |
| Driving Licence / Voter Id verification | ⛔ Real government lookups — negative probes only, and the eKYC step was unreachable |
| Applicant Photo capture | ⛔ Requires the seed plus the fake-video config |
| Summary screen (AC21, AC22, D-36/39/40/41/43) | ⛔ Not reachable — a cancelled application exposes no Summary tab |
| Final Submit | ⛔ **Permanently out of bounds** — irreversible |

---

## 8. Handover to Step 4

1. Specs must reach `/schemelist` **via `/HOME`**, never by direct navigation (BUG-STAFF-001).
2. Band A assertions on the Send control must encode **observed** behaviour, with the
   story-required behaviour written as a separate `test.fail()` case for BUG-STAFF-002.
3. All Band B specs must be **fixture-gated on `STAFF_SEED_APPLICANT_ID`** and skip with a
   stated reason — the seed is currently absent, so an ungated suite would report a wall of
   misleading failures.
4. The Summary page object must expose **no** submit method (test plan risk R1).
5. `aos/steps/getdetails` is the most reliable oracle for structural assertions (AC6, BR-04,
   BR-26) — prefer it to DOM scraping.
