# STAFF_TS001 — Staff Salary Account (Scheme 1003)

Suite for `user-stories/US_010_Staff_Salary_Account_Journey.md`.
Plan: `specs/STAFF_TS001-test-plan.md` · Report: `reports/STAFF_TS001-test-report.md`

---

## Why this suite is banded

This runs against a **live, shared UAT that opens real bank accounts**. Three steps are
human-only gates (SMS OTP, DigiLocker consent, Liveliness), each capped at three attempts and
each sending a real SMS to a real person. So "run everything in CI" is the wrong goal — the
right question is *does this test write to a real application?*

| Band | Mutates? | Runs in CI | Requires |
|---|---|---|---|
| **A — cold-safe** | no | ✅ always | nothing |
| **B — read-only** | no | ✅ when a seed is configured | `STAFF_SEED_APPLICANT_ID` |
| **C — form-entry** | **yes** | ❌ never | `STAFF_MUTABLE_SEED_ID` (local only) |
| **D — seed builder** | **yes** | ❌ never | a human + a handset |

### Band A — cold-safe (always CI)
`scheme-selection` · `mobile-verification` · `console-network-hygiene`

Creates no record, sends no SMS, consumes no verification attempt. Stops immediately before
"Send Verification Code". Safe to run on every commit, repeatedly.

### Band B — read-only (CI when seeded)
`staff-scheme-structure` · `summary-review`

Resumes a completed seed and **inspects** it. Idempotent — it writes nothing, so it can run on
every commit without degrading the seed. Structural claims are asserted against
`aos/steps/getdetails` rather than the DOM, which is both stronger evidence and far less brittle.

### Band C — form-entry (never CI)
`address-details` · `nominee-details` · `applicant-photo` · `introducer-lead`

These fill and submit forms on a real application, so they are **not idempotent**: the first
run consumes the seed by advancing it, and every later run finds the step submitted and
read-only. Pointing them at a shared CI seed would either corrupt it or produce failures that
say nothing about the product.

They therefore require `STAFF_MUTABLE_SEED_ID` — a seed **explicitly nominated as consumable**,
deliberately a different variable from the read-only seed so a CI seed can never be spent by
accident.

### Band D — seed builder (never CI)
`seed-application-builder`

Excluded from suite runs in `playwright.config.ts` — it must be invoked by path, because it
creates a real application and sends real SMS.

---

## Environment variables

| Variable | Band | Purpose |
|---|---|---|
| `STAFF_SEED_APPLICANT_ID` | B | A completed application, inspected read-only. Ideally parked on the Summary. |
| `STAFF_MUTABLE_SEED_ID` | C | A seed you are willing to **spend**. Must be parked *before* the steps under test. |
| `STAFF_CBS_ACCOUNT` | C | A Core Banking System account number that resolves. An invalid one fails *silently* (D-31). |
| `STAFF_LEAD_CODE` | C | A staff code the staff register resolves. |
| `STAFF_INTRODUCER_NAME` | C | The real account holder's name. **Never hardcode** — it is real PII. |
| `STAFF_SEED_MOBILE` | D | A handset you control that receives the OTP and links. |

---

## Running

```bash
npm run staff:ci         # Bands A+B. Safe on every commit.
npm run staff:readonly   # Bands A+B explicitly, headless.
npm run staff:local      # Everything available locally, headed.
npm run staff:seed       # Band D — build a new seed (attended, ~30-40 min).
```

CI example:

```yaml
- run: npx playwright install --with-deps chromium
- run: npm run staff:ci
  env:
    CI: true
    SAHAYOG_USER_ID:  ${{ secrets.SAHAYOG_USER_ID }}
    SAHAYOG_PASSWORD: ${{ secrets.SAHAYOG_PASSWORD }}
    STAFF_SEED_APPLICANT_ID: ${{ vars.STAFF_SEED_APPLICANT_ID }}
```

Omit `STAFF_SEED_APPLICANT_ID` and Band B skips with a stated reason rather than failing —
CI stays green and honest.

---

## Building a seed

```bash
STAFF_SEED_MOBILE=<10-digit> npm run staff:seed
```

Pauses at each human gate and prints what it needs; relay by writing the named signal file
(`.staff-otp-input.txt`, `.staff-digilocker-done.txt`, `.staff-liveliness-done.txt`). It stops
at Address Details and prints the new Applicant Id.

**Seeds are not durable.** They live on a shared environment where other people work: the
previous seed `SAH-1003-812` was cancelled ("Sourcer Cancel") by a third party mid-session,
which blocked the entire resume band. Expect to rebuild.

---

## Two safety rules that must not be relaxed

1. **The Summary's Submit is never clicked.** Submission is irreversible and Cancel is the only
   exit and is itself one-way. `SummaryPage.ts` deliberately exposes **no** submit method and
   must never gain one. AC22 is asserted by inspecting the gate's presence and initial state.
2. **Application Cancel is never invoked.**

Also: Driving Licence and Voter Id verification are **real government lookups** — negative
probes only, never a plausible document number.

---

## Expected failures

Cases carrying `test.fail()` assert the story's **required** behaviour against a known defect,
so the suite goes green the moment the product is fixed. A case reported as
*"Expected to fail, but passed"* means either the defect was fixed — retire the annotation and
close the defect — **or the test's own oracle broke**. Check the second before believing the
first: an under-reading oracle produced a false "D-15 is fixed" signal during development,
because the PrimeReact dropdown panel is virtualised and a locator read returned 1 of 33 items.

---

## Known precondition tension

Form-entry cases need a seed parked **before** a step; Summary cases need one parked **after**
it. One seed cannot satisfy both. The suite handles this by checking `stepStatus` from
`aos/steps/getdetails` and skipping with the seed's actual position — so a mismatch reports as
a precondition gap, never as a misleading failure.
