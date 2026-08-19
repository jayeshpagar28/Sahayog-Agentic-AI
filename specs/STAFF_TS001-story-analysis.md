# STAFF_TS001 — Step 1: User Story Analysis

**Source story:** `user-stories/US_010_Staff_Salary_Account_Journey.md` (Story ID **US_010**)
**Suite ID:** `STAFF_TS001`
**Module:** Savings Application → New Application → **Staff Salary Account - 1003**
**Analysed on:** 2026-08-18
**Environment:** `https://sahyogagentweb.drutam.in:9634` (UAT)
**Credentials:** `nayan.aher@netwinindia.in` / `Sahayog@2025`
**Evidence base:** `specs/STAFF_TS001-exploration-log.md`

> **Provenance rule carried forward from Step 0.** Every claim below inherits the story's
> evidence tag. `[OBSERVED]` claims become assertable test cases. `[NOT VERIFIED]` claims
> become **explicitly-blocked** coverage — they are listed, given a test-case ID, and marked
> Blocked with a stated reason; they are never asserted as if true. `[GAP]` items are held
> **out of the AC set** until a stakeholder signs them off (master prompt, Step 1 preamble).

---

## 1. Story Identity

| | |
|---|---|
| **Story ID** | US_010 |
| **Title** | Open a Staff Salary Account (Scheme 1003) through the guided application journey |
| **Module** | Savings Application |
| **Sub-module** | New Application → Scheme Selection → `Staff Salary Account - 1003` |
| **Role under test** | Branch Origination Officer (sourcing agent) acting for a staff applicant |
| **Priority** | High |

**Business objective in plain language.** A branch officer must be able to open a
zero-balance salary account for an employee of the society, capturing and KYC-verifying that
employee's identity (Aadhaar via DigiLocker plus a liveliness check), their address, their
employment marker, a nominee, an introducer and the sourcing staff codes — and then review
the whole thing on one screen before committing it. The scheme's distinguishing feature is
that it is **Individual-only**: unlike Normal (1001) and Silver (1002) it presents no Account
Type step at all, and carries two fields no sibling scheme has — `Is Staff` and `Staff Id`.

---

## 2. Application Context

| | |
|---|---|
| **Login URL** | `https://sahyogagentweb.drutam.in:9634/login` |
| **Username** | `nayan.aher@netwinindia.in` |
| **Password** | `Sahayog@2025` |
| **Entry route** | `/HOME` → `/UNPOSTED` → `/schemelist` → `/applndetails` |
| **Wizard route** | `/applndetails` — **every one of the 13 stages shares this single route**; no stage is individually addressable (FR-35) |
| **Resume paths** | Dashboard row **View** icon, or direct navigation to `/applndetails` (resumes the most recent application) |
| **Auth in the suite** | `tests/auth.setup.ts` → `tests/.auth/user.json` via `storageState`; no per-spec login |
| **Seed application** | `SAH-1003-812` — parked on the **Summary** screen, all 13 steps complete, **unsubmitted**. The intended read-only fixture for Summary-level coverage |
| **Do not touch** | `SAH-1003-772` — a real third-party in-progress draft |

---

## 3. Entities and CRUD Matrix

| # | Entity | Create | Read | Update | Delete |
|---|---|---|---|---|---|
| E1 | **Savings Application (1003 draft)** | ✅ Created server-side on the **first successful "Send Verification Code"** (FR-04), not on scheme selection (FR-03) | ✅ Dashboard list `/UNPOSTED`; Summary screen; per-step re-entry | ⚠️ **Partial** — only 6 of 13 steps are `isEditable: 1` (Address, Basic, Photo, Nominee, Document, Lead); the other 7 lock permanently (BR-30) | ⚠️ Cancel exists on the Dashboard row menu but is **irreversible and out of bounds** (§5.2) |
| E2 | **Mobile verification** | ✅ OTP send | ✅ Verified number shown, disabled | ❌ Immutable once verified (BR-06); "Change Mobile Number?" exists but untested | ❌ |
| E3 | **eKYC sub-verifications** (Aadhaar / PAN / DL / Voter Id) | ✅ Per-method send/verify | ✅ Status badge per card; `subModVerified` in the summary payload | ❌ No re-verify path observed | ❌ |
| E4 | **Liveliness verification** | ✅ Link send (2 alternative methods) | ✅ Status badge | ❌ | ❌ |
| E5 | **Address** (Permanent + Communication) | ✅ Popup form | ✅ Rendered read-only after save | ❌ **No edit affordance at all once saved** (FR-37) | ❌ |
| E6 | **Branch selection** | ✅ Default pre-selected; "Change Branch?" list of 7 more | ✅ Name / Id / address per branch | ✅ Until step submit | ❌ |
| E7 | **Basic Details** (29 fields, incl. `Is Staff`, `Staff Id`) | ✅ | ✅ | ✅ `isEditable: 1` — reopens pre-populated | ❌ |
| E8 | **Salaried Information** | ✅ | ✅ | ❌ locked | ❌ |
| E9 | **Applicant Photo + Signature** | ✅ Camera capture / Verified Photo | ⚠️ **Never displayed anywhere** (D-36) | ✅ Step is `isEditable: 1` | ❌ |
| E10 | **Nominee** (+ conditional guardian, + nominee address) | ✅ Two pages | ⚠️ Summary shows **only Full name + Status** (D-40) | ✅ `isEditable: 1` | ❌ No way to decline nomination (BR-23) |
| E11 | **Applicant documents** | ⚠️ Upload is **broken platform-wide** (D-05); step is `skipAllowed: 1` | ⚠️ Summary section renders as a bare heading | ✅ `isEditable: 1` | ❌ |
| E12 | **Introducer** | ✅ Resolved against **CBS** | ✅ | ❌ locked | ❌ |
| E13 | **Lead / Sourcer codes** | ✅ Each `Verify`-ed against the staff register | ✅ Resolves to a staff name | ✅ `isEditable: 1`; `Verify` becomes `Change` | ❌ |
| E14 | **Scheme catalogue** | ❌ read-only | ✅ `/schemelist`, server-side search | ❌ | ❌ |

---

## 4. State Transitions

**Canonical 1003 sequence — 13 workflow steps then a Summary that is *not* a step (FR-59):**

```
(no record)
  └─ Send Verification Code OK ──► MOBILE_VERIFICATION (seq 1, status 0)   [Applicant Id SAH-1003-nnn assigned]
        └─ valid OTP ───────────► status 1, isEditable 0  (locks permanently)
              └───────────────► EKYC_VERIFICATION (seq 2)      ◄── NOT Account Type (FR-06)
                    └─ step Submit w/ Aadhaar Successful ─► status 13 ─► 1
                          └─────► EXISTING_CUSTOMER_DATA (seq 3, componentModule 16, NO UI)
                                └─ automatic ──────────► LIVELINESS_VERIFICATION (seq 4)   [header gains Applicant Name]
                                      └─ one method Successful + Submit ─► ADDR_VERIFICATION (seq 5)
                                            └─ both addresses + Submit ─► Branch Selection (seq 6)
                                                  └─ Submit ───────────► Basic Details (seq 7)
                                                        └─ Submit ─────► Salaried Information (seq 10)   ◄── unconditional (FR-49)
                                                              └─ Submit ► Applicant Photo (seq 11)
                                                                    └───► Nominee Details (seq 12)
                                                                          └─► Document Upload (seq 13)   ◄── skipAllowed: 1 (FR-65)
                                                                              └─► Introducer Details (seq 15)
                                                                                    └─► Lead Details (seq 16)
                                                                                          └─► SUMMARY (no stepCode)
                                                                                                └─► Submit  ⛔ [NOT VERIFIED]
```

**Transition facts that generate test cases**

| # | Fact | Tag |
|---|---|---|
| T1 | Selecting the scheme creates **no** record; the record appears only on OTP send | `[OBSERVED]` |
| T2 | Module sequence 2 is `EKYC_VERIFICATION` — **no `ACCOUNT_TYPE` state exists on 1003** | `[OBSERVED]` |
| T3 | `EXISTING_CUSTOMER_DATA` is a **UI-less system step** with no stepper tab | `[OBSERVED]` |
| T4 | Status codes: `0` pending, `1` complete, `3` link sent, `13` in progress — *inferred, not documented* (A-04) | `[INFERRED]` |
| T5 | All steps are `sequencialProcessing: 1`, `redirectionalProcessing: 1`, `skipAllowed: 0` **except** `APPL_DOCUMENT` | `[OBSERVED]` |
| T6 | Future stages are **not rendered** in the stepper until reached — a fresh draft shows exactly one tab | `[OBSERVED]` |
| T7 | **Stepper tab position ≠ `aosModuleSequence`** — Applicant Photo is tab 9 but sequence 11; sequences 8, 9, 14 do not exist on 1003 | `[OBSERVED]` |
| T8 | 6 of 13 steps stay editable; 7 lock. Nothing in the UI distinguishes them (D-42) | `[OBSERVED]` |
| T9 | Everything after the Summary's Submit click | `[NOT VERIFIED]` — deliberate |

---

## 5. Business Rules (31 extracted)

Carried verbatim from story §8. **BR-26, BR-29 and BR-31 record rules the system does *not*
enforce** — their absence is the finding, so their test cases assert the *observed* behaviour
and are cross-linked to defects D-35, D-38, D-43 rather than asserting a rule that is absent.

| ID | Rule | Enforced | Test posture |
|---|---|---|---|
| BR-01 | Record exists only after a successful OTP send | Server | Assert Applicant Id absent pre-send |
| BR-02 | Applicant Id embeds the scheme code — `SAH-1003-nnn` | Server | Regex assert |
| BR-03 | 1003 is **Individual-only**; no Account Type step | Server | Assert stepper never contains "Account Type" |
| BR-04 | Steps strictly sequential, none skippable | Server | Assert future tabs absent |
| BR-05 | A completed step locks against editing | Server | Assert read-only re-entry |
| BR-06 | Mobile immutable once verified | Both | Assert `disabled` |
| BR-07 | OTP sends capped at 3 | Server | ⛔ **Blocked** — exhausting strands the record |
| BR-08 | OTP validity 15 min, server-side | Server | ⛔ Blocked — needs a 15-min real wait |
| BR-09 | Only Aadhaar mandatory within eKYC | Server | Assert single `*` |
| BR-10 | DigiLocker link sends capped at 3 | Server | ⛔ Blocked — consumes human gates |
| BR-11 | DigiLocker link validity 25 min | Server | Assert config value in response |
| BR-12 | Cancelling a popup initiates nothing | Client | ✅ Assert no network request |
| BR-13 | PAN needs number **and** document | Client | ✅ Assert validation (upload itself is D-05-blocked) |
| BR-14 | PAN 4th char must be `P` | Server config | ⚠️ configured only; UI unverified |
| BR-15 | The two Liveliness methods are alternatives | Server | Assert both cards, neither starred |
| BR-16 | Liveliness link sends capped at 3 | Server | ⛔ Blocked |
| BR-17 | Both Permanent and Communication addresses mandatory | Client | ✅ |
| BR-18 | Addresses must be Indian — Country fixed | Client | ✅ Assert `disabled` + value `India` |
| BR-19 | **Three human-only gates**, each capped at 3 | Server | Documented constraint, not a test |
| BR-20 | Photo **and** Signature both mandatory | Client | ✅ (fake-video config) |
| BR-21 | Captured docs persist only if the step's Submit succeeds | Server | ✅ |
| BR-22 | Each image stamped with its own lat/long/address/time | Server | ✅ |
| BR-23 | Nominee unconditionally mandatory — no decline | Server | ✅ Assert no decline control |
| BR-24 | Minor nominee ⇒ 5 mandatory guardian fields | Client | ✅ **High-value** |
| BR-25 | Nominee address defaults to applicant's, pre-checked | Client | ✅ |
| BR-26 | Document Upload **may be skipped entirely** | *(not enforced)* | ✅ Assert observed behaviour → D-35 |
| BR-27 | Introducer account resolved + name-matched against **CBS** | Server | ✅ needs a valid CBS fixture |
| BR-28 | Both Lead codes must be verified before submit | Server | ✅ needs a valid staff-code fixture |
| BR-29 | Lead Converter and Sourcer **may be the same person** | *(not enforced)* | ✅ Assert observed → D-38 |
| BR-30 | 6 of 13 steps re-editable; 7 lock | Server | ✅ |
| BR-31 | **No declaration gates final submission**; Submit never disabled | *(not enforced)* | ✅ Assert observed → D-43 |

---

## 6. Third-Party / External Integrations

| # | Integration | Operations that touch it | Automation posture |
|---|---|---|---|
| I1 | **SMS gateway** | OTP send, DigiLocker link send, Liveliness link send | ⛔ **Human gate** — real SMS to a real handset |
| I2 | **DigiLocker** (Aadhaar eKYC) | `POST digilocker/send/link`, `aos/ekyc/get/status/dtl` polling | ⛔ **Human gate** — applicant must consent on their own device |
| I3 | **Liveliness service** | `POST aos/liveliness/save/details`, status polling | ⛔ **Human gate** — applicant must photograph themselves |
| I4 | **PAN services** (`PAN_COMP`, `PAN_OCR`) | PAN verify | ⚠️ Hard-blocked by D-05 (upload never registers) |
| I5 | **Driving Licence lookup** | DL verify | ⚠️ **Real government lookup — negative probes only** (CLAUDE.md safety) |
| I6 | **Voter Id lookup** | Voter Id verify | ⚠️ **Real government lookup — negative probes only** |
| I7 | **Core Banking System (CBS)** | `POST introducer/save/details` — resolves account → `bankAccountUserName`, `introducerCustomerId`, `isNameMismatch` | ✅ Automatable **given a valid account-number fixture**; invalid input fails **silently** (D-31) |
| I8 | **Staff register** | Lead Converter / Sourcer code `Verify` | ✅ Automatable **given a valid staff-code fixture** |
| I9 | **`sahyognetwinMasterDB`** master data | States, cities, relations, designations, branches | ✅ Fully automatable — and **currently defective** (D-15, D-16, D-28, D-37) |
| I10 | **Device camera** | Signature capture, Verified Photo | ✅ **No longer a gate** — fake video device + `camera` permission |
| I11 | **Device geolocation** | Reverse-geocoded address stamped on each capture | ✅ Automatable — `geolocation` permission + fixed coordinates |
| I12 | **Scheme workflow config** (`…stsa`) + per-scheme field-config API | Defines the whole stage sequence and every field rule | ✅ Assertable via response inspection |

---

## 7. Acceptance Criteria — Full List, Typed

22 ACs from story §13. **Type** uses the master-prompt taxonomy. **Status** records whether
the story found the AC currently met, and therefore whether a test asserts the *observed*
behaviour or the *required* behaviour.

| AC | Title | Type(s) | Currently met? | Test posture |
|---|---|---|---|---|
| **AC1** | Scheme 1003 is selectable and opens its own journey | Functional | ✅ Met | Assert directly |
| **AC2** | Scheme search is server-side and case-insensitive | Functional / API | ✅ Met | Assert list + request body |
| **AC3** | The application record is created on OTP send | Functional | ✅ Met | ⛔ **Blocked** — creating a record consumes a real SMS |
| **AC4** | "Send Verification Code" requires a complete 10-digit number | Validation | ✅ Met | ✅ **Fully automatable, no record created** — highest-value safe coverage |
| **AC5** | OTP validity is enforced server-side | Negative | ✅ Met | ⛔ Blocked — 15-min real wait + a consumed send |
| **AC6** | Scheme 1003 presents **no Account Type step** | Business Rule | ✅ Met | ✅ Assert on a seeded/observed stepper |
| **AC7** | eKYC offers four options, only Aadhaar mandatory | Business Rule | ✅ Met | ✅ Assert on a seeded application |
| **AC8** | DigiLocker consent requested without initiating on open/cancel | Integration | ✅ Met | ✅ **Safe** — open + Cancel issues no request |
| **AC9** | Aadhaar completion reported back to the agent | Integration | ✅ Met | ⛔ Blocked — human consent |
| **AC10** | Liveliness offers two alternatives, one suffices | Business Rule | ✅ Met | ✅ Assert card presence; ⛔ completion blocked |
| **AC11** | Address Details requires both addresses, validates together | Validation | ✅ Met | ✅ |
| **AC12** | Progress persists; the application is resumable | Functional | ✅ Met | ✅ **High value** — reload + re-entry on the seed |
| **AC13** | Steps are strictly sequential | Functional | ✅ Met | ✅ |
| **AC14** | Failures must be distinguishable from success | Negative / API | ❌ **Not met** (D-03, D-13) | Assert **required** behaviour → expected-fail, logged as a defect |
| **AC15** | Every Indian jurisdiction must be selectable | Validation | ❌ **Not met** (D-15, D-16) | Assert **required** behaviour → expected-fail |
| **AC16** | Both applicant images captured and geo-stamped | Functional | ✅ Met | ✅ Given the fake-video config |
| **AC17** | Documents survive only if their step is submitted | Functional | ✅ Met (correct as-is) | ✅ |
| **AC18** | A minor nominee requires guardian details | Business Rule | ✅ Met (**well implemented**) | ✅ **High value** |
| **AC19** | Nominee age must be a plausible value | Validation | ❌ **Not met** (D-30) | Assert **required** → expected-fail |
| **AC20** | An introducer account failure must be visible | Negative | ❌ **Not met** (D-31) | Assert **required** → expected-fail; needs an invalid-account probe |
| **AC21** | The Summary must faithfully **and completely** represent the application | Functional | ⚠️ **Mixed** — fidelity met, 4 omissions | Split: assert fidelity ✅; assert the 4 omissions as expected-fail (D-35/36/39/40) |
| **AC22** | Final submission must be gated by an explicit declaration | Business Rule | ❌ **Not met** (D-43) | Assert **the gate's presence and initial state only** — ⛔ **never click Submit** |

### 7.1 AC type roll-up

| Type | ACs |
|---|---|
| Functional | AC1, AC3, AC12, AC13, AC16, AC17, AC21 |
| Validation | AC4, AC11, AC15, AC19 |
| Business Rule | AC6, AC7, AC10, AC18, AC22 |
| Negative | AC5, AC14, AC20 |
| API / Integration | AC2, AC8, AC9 |
| UI | *(no dedicated AC — derived from story §7 into Test Type 3/6/7 cases)* |
| Non-Functional / Responsive | *(no dedicated AC — story §7.2 marks responsiveness `[NOT VERIFIED]`; derived cases added in Step 2)* |

---

## 8. Testability Constraints — binding on Step 2

These are not caveats; they define which test cases may exist.

1. **Three human-only gates** — SMS OTP, DigiLocker consent, Liveliness — each capped at
   **3 attempts** and each consuming a real SMS to a real person. **A cold end-to-end run
   cannot be automated.**
2. **The camera is no longer a gate.** A fake video device plus pre-granted `camera` and
   `geolocation` permissions makes signature capture and the Verified Photo path fully
   automatable. Both the device *and* the permissions are required — permissions alone are
   not enough — and the matching browser build must be installed.
3. **Therefore the automation strategy is seed-and-resume:** a suite that resumes an
   application already past Liveliness can drive the journey unattended all the way to the
   Summary. This mirrors the NSA module's existing seed strategy.
4. **Two external fixtures are mandatory:** a **valid CBS account number** (Introducer) and a
   **valid staff code** (Lead Details). Without them those steps cannot pass — and an invalid
   introducer account fails *silently* (D-31), so it will present as a **hung** test rather
   than a failed one. Assert on *advancing to the next step*, never on the absence of an error.
5. **Final Submit is manual-only, forever.** It is irreversible; Cancel is the only exit and
   is itself one-way. AC22 is asserted by inspecting the gate's presence and initial state.
6. **Driving Licence and Voter Id are real government lookups** — negative probes only.
7. **Application Cancel is irreversible** and out of bounds.
8. **`SAH-1003-772` must not be touched.** `SAH-1003-812` is the seed and **must never be
   submitted** — it carries a fabricated address, a synthetic camera frame as a signature and
   zero documents.
9. **Never record real applicant PII** in specs, fixtures or reports.

---

## 9. Known Defects Inherited from Step 0

43 defect candidates (D-01…D-43) arrive from story §15.3 already characterised. They are
**not** re-discovered by Step 3; they are **regression-guarded** by Step 2/4 and **filed** by
Step 7. Severity distribution:

| Severity | Count | IDs |
|---|---|---|
| **Critical** | 6 | D-05, D-14, D-15, D-16, D-35, D-43 |
| **Major** | 17 | D-01, D-02, D-03, D-04, D-06, D-12, D-20, D-22, D-26, D-27, D-29, D-30, D-31, D-32, D-34, D-36, D-39, D-40 |
| **Minor** | 20 | D-07, D-08, D-09, D-10, D-11, D-13, D-17, D-18, D-19, D-21, D-23, D-24, D-25, D-28, D-33, D-37, D-38, D-41, D-42 |

Two are **regulatory rather than functional** and warrant a compliance decision *before* any
test assumes current behaviour is correct:

* **D-35** — an application can reach submission with **zero supporting documents**.
* **D-43** — **no declaration or consent** gates the irreversible submission.

Step 2 handles both by writing the test against the story's **required** behaviour (AC21,
AC22) so the suite fails until the product changes, rather than freezing the defect in.

---

## 10. Open Questions for Stakeholders — surfaced, not answered

Per CLAUDE.md, the BA Agent's open questions are surfaced to the user rather than answered on
its behalf. These block nothing in Step 2 but shape the eventual expected results:

| # | Question | Owner |
|---|---|---|
| A-01 | Is Staff Salary Account **intentionally** Individual-only, or is the missing Account Type step a workflow-configuration omission? | Stakeholder |
| A-08 | Does the Summary's Submit perform the final irreversible submission? (Strongly implied; never clicked.) | Stakeholder |
| A-09 | Is `Document Upload`'s `skipAllowed: 1` a deliberate product decision for a KYC product? | Stakeholder / Compliance |
| A-10 | Is the applicant's declaration/consent captured **outside** this journey, or genuinely missing? | Compliance |
| A-11 | Is `isNameMismatch` genuinely computed? It returned `0` while `bankAccountUserName` was `null`. | Dev |
| A-05 | Are the scheme's advertised benefits (zero balance, free debit card, loan concessions) enforced by downstream product config? The scheme record carries no attribute for any of them. | Stakeholder |
| — | Should `Staff Id` be validated against an employee register? Today it is free text with no format mask and no lookup (D-27). | Stakeholder / Compliance |

---

## 11. Deliverable Summary for Step 2

| Input to Step 2 | Value |
|---|---|
| Entities requiring CRUD coverage | 14 (E1–E14) |
| Distinct workflow states | 13 steps + Summary + 1 UI-less system step |
| Business rules to enforce-test | 31 (BR-01…BR-31), 3 of which assert *non*-enforcement |
| Integrations | 12 (I1–I12), 3 of them hard human gates |
| Acceptance criteria | 22 — 15 met, 4 not met, 1 mixed, 2 blocked-by-design |
| Inherited defects to regression-guard | 43 |
| Mandatory external fixtures | valid CBS account number; valid staff code; fake video device config |
| Suite output paths | `specs/STAFF_TS001-test-plan.md` · `tests/10_STAFF_TS001/` · `tests/pages/savings-application/**` · `reports/STAFF_TS001-*` |
