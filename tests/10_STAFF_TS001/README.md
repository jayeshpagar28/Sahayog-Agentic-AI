# STAFF_TS001 — Staff Salary Account (Scheme 1003)

Suite for `user-stories/US_010_Staff_Salary_Account_Journey.md`.
Plan: `specs/STAFF_TS001-test-plan.md` · Report: `reports/STAFF_TS001-test-report.md`

---

## How this suite tests account creation

Account creation is tested by **creating a brand-new application and walking every step of it**,
in order, filling and submitting each form — never by inspecting a pre-built application
read-only. Inspecting a stored application proves only that saved values render; it cannot prove
a form validates, that a step advances, or that Introducer/Lead Details work at all (both are
`isEditable: 0` and lock permanently once submitted, so on any completed application their forms
can never be re-opened).

| Spec | Runs in CI | What it covers |
|---|---|---|
| `scheme-selection` | ✅ always | Scheme list, server-side search — creates no record |
| `mobile-verification` | ✅ always | Mobile-number validation up to (not including) Send — creates no record |
| `console-network-hygiene` | ✅ always | No console errors / no 4xx-5xx on the reachable journey |
| `staff-account-creation` | ⚠️ on demand | The full journey — creates a REAL application, every step |

`staff-account-creation.spec.ts` is the heart of the suite: 15 ordered steps that create an
application and drive it from Mobile Verification through to the Summary, asserting each form as
it is filled.

---

## The three gates, and how each is satisfied

Scheme 1003 cannot be created without external input, but the script does all the browser work
and treats the **workflow's own status** as truth — never a human's "done":

| Gate | How it is satisfied |
|---|---|
| **1. SMS OTP** | Supplied by whichever source is configured (below). |
| **2. DigiLocker consent** | The script clicks "Send Link", then **polls the application** until the card reads `Successful`. Consent happens on the applicant's device; the script never asks anyone to confirm. |
| **3. Liveliness check** | Same pattern — send the link, then poll status to `Successful`. |

**OTP sources**, in priority order — this is what lets the flow run unattended in CI:

1. `STAFF_OTP` — a literal code the caller / CI injects.
2. `STAFF_OTP_URL` — an endpoint the script polls; its body carries the code (an SMS-receiver
   webhook or a test-harness relay). A 4–8 digit code is extracted from the response.
3. `.staff-otp-input.txt` — a human reads the SMS and writes the code (the local default).

The creation spec skips **only** when no OTP source is configured — never merely because the
environment is CI.

---

## Environment variables

| Variable | Kind | Purpose |
|---|---|---|
| `SAHAYOG_USER_ID` / `SAHAYOG_PASSWORD` | Secret | `auth.setup.ts` login. Required — the storage-state file is not committed. |
| `STAFF_SEED_MOBILE` | Variable | A handset that receives the OTP and the two links. |
| `STAFF_OTP` **or** `STAFF_OTP_URL` | Secret | Supplies the OTP unattended. Omit both and the flow skips. |
| `STAFF_CBS_ACCOUNT` | Secret | An account number the Core Banking System resolves (Introducer). Invalid → silent failure (D-31). |
| `STAFF_LEAD_CODE` | Secret | A staff code the staff register resolves (Lead Details). |
| `STAFF_INTRODUCER_NAME` | Secret | The real account holder's name. **Never hardcode** — it is real PII. |

Locally these come from a gitignored `.env.local` (loaded by `playwright.config.ts`); in CI they
are GitHub Secrets/Variables. An explicit `KEY=... npx playwright test` still overrides both.

---

## Running

```bash
npm run staff:ci        # CI band — scheme selection, mobile validation, hygiene. No record, no SMS.
npm run staff:cold      # the same band, headed, for local debugging.
npm run staff:create    # the full account-creation journey (headed). Sends real SMS.
```

`npm run staff:create` prints what it needs at each gate. Locally, relay the OTP by writing it to
`.staff-otp-input.txt`; DigiLocker and liveliness are done on the handset and detected by polling.

In CI the account-creation journey runs only via **manual dispatch** of the workflow (it creates a
real application and sends real SMS on every run), with the OTP supplied through `STAFF_OTP_URL`.

---

## Two safety rules that must not be relaxed

1. **The Summary's Submit is never clicked.** Submission is irreversible and Cancel is the only
   exit and is itself one-way. `SummaryPage.ts` exposes **no** submit method and must never gain
   one. AC22 is asserted by inspecting the gate's presence and initial state only.
2. **Application Cancel is never invoked.**

Also: Driving Licence and Voter Id verification are **real government lookups** — negative probes
only, never a plausible document number.

A mobile number may hold only **one** application in process; the server rejects a second with
"Mobile verification request is already in process !". Finish or cancel the current one before
creating another on the same number.

---

## Defects surfaced by the creation walk

The journey logs `[D-xx]` observations as it passes each step — the state master data (D-15,
D-16), the `spouse_name` cap (D-24), the fractional nominee age (D-30), the Lead-code field loss
(D-34), the silent empty Document Upload (D-35), and the Summary omissions (D-36/39/40) and
missing declaration gate (D-43). These are recorded from a freshly-created application, not
inferred from a seed. The full defect log is in `reports/STAFF_TS001-test-report.md`.
