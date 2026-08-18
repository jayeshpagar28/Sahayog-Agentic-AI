# Exploration Log — STAFF_TS001 (Staff Salary Account - 1003)

**Explored by:** BA Agent
**Date:** 2026-08-17
**Environment:** https://sahyogagentweb.drutam.in:9634
**Account:** nayan.aher@netwinindia.in
**Depth:** deep
**Related story:** `user-stories/US_010_Staff_Salary_Account_Journey.md`

> This is the raw evidence trail. Every claim in the user story must be checkable against a
> line in this file. Chronological and specific beats tidy and vague.

**Application used:** `SAH-1003-812` — created fresh during this session. All PII is
deliberately omitted; the applicant is referred to by application ID only.

**Session note:** exploration ran in two passes. Pass 1 (07:48–09:52) reached a 504 at the
Existing Customer Data step. Pass 2 (12:18–12:29) re-opened the same application via
Dashboard → View and found it had **recovered on its own**; the journey then advanced through
Liveliness Verification to Address Details. §4.10 and defect D-07 have been corrected
accordingly — see §4.10.1.

**Pass 6 — 2026-08-18, 05:25–05:42 UTC. THE JOURNEY IS NOW COMPLETE TO THE SUMMARY SCREEN.**
The Applicant Photo blocker (§4.14.3) was cleared by launching the MCP browser through the
dedicated `playwright-camera` server (`playwright-mcp-camera.config.json`), which supplies
`--use-fake-device-for-media-stream` plus pre-granted `camera` + `geolocation` permissions.
This session then walked **five previously-unreached stages** — Nominee Details, Document
Upload, Introducer Details, Lead Details and **Summary** — documented in §4.16–§4.20.
**Final Submit was NOT operated** (§4.20.6). See §4.15 (rewritten) for the corrected status.

> **Prerequisite discovered this pass:** the camera MCP server failed to start until
> `chromium-1237` was installed (`npx @playwright/mcp@latest install-browser chromium`).
> Only builds up to `chromium-1228` were present. Any future session using this server must
> install the matching browser first or it will error before reaching the app.

**Correction to the Pass 5 hand-over.** Pass 5 left a note that the applicant photo was
"already saved and persists". **That was wrong.** On resuming this pass, the Applicant Photo
step rendered its *capture* UI again, and `POST applicant/photo/get/doc` returned
`photoScanDocId: null`, `signatureScanId: null`, `msgDescr: "No record found!"`. The Pass 5
`Document Uploaded` label was **client-side state only** — nothing was committed because the
step's own Submit had never succeeded. Both photo *and* signature had to be re-captured this
pass. See §4.16.1.

---

## 1. Task & Scope

**Task as assigned:** Explore the Staff Salary Account (Scheme 1003) end-to-end account
creation journey against the live app, document its actual current behaviour, and generate a
detailed user story from the verified findings.

**Restated:** Walk scheme 1003's new-application wizard live, recording every field,
validation, business rule, navigation path and network call actually observed, without
importing behaviour from the Silver (1002) or Normal (1001) journeys.

**In scope:** Savings Application Dashboard → New Application → scheme selection →
mobile/OTP verification → eKYC → applicant & employment details → nominee → document upload
→ review → final submission.

**Out of scope:** Post-submission approval/decision workflow; schemes 1001 and 1002 except
as contrast.

### 1.1 Scheme numbering correction

The task envelope stated "Silver 1001, Normal 1002". This is **inverted**. The live scheme
API and the app UI both report:

| Scheme code | Scheme name (verbatim) |
|---|---|
| 1001 | Normal Savings Account - 1001 |
| 1002 | Silver Savings Account - 1002 |
| 1003 | Staff Salary Account - 1003 |

`[OBSERVED]` — `POST scheme/getUserwiseAllscheme` response, §8 N-04.
`user-stories/US_006_Savings_Application_Dashboard.md:147` and
`specs/SAD_TS001-test-plan.md:29` agree with the live values. The envelope is the outlier.
Live values are used throughout both artefacts.

---

## 2. Known Before Exploration (static recon)

Read before touching the browser.

| Source | Claim | Re-verified live on 1003? |
|---|---|---|
| `user-stories/US_007_Scheme.md` | Scheme Selection screen lists active schemes, searchable, clicking one opens the application | **Yes** — confirmed |
| `user-stories/US_008_Silver_Saving_Account_ Journey.md` | Silver's stage 2 is **Account Type** (Joint/Individual/Minor); stage 3 eKYC; stage 4 Liveliness; 16 stages total | **Contradicted** — 1003 has no Account Type step (§4.4, §8 N-11) |
| same | eKYC has 4 cards, Aadhaar mandatory via DigiLocker, PAN/DL/Voter ID supplementary | **Yes** — confirmed on 1003 (§4.5) |
| same | PAN requires Number + mandatory document, two-step confirm | Partially — mandatory pair confirmed; second sub-step **not reached** (§4.6) |
| same | DL popup has Number + DOB + optional document, uses "Verify" not "Submit" | **Yes** — confirmed (§4.7) |
| same | Voter ID popup has Number only, no DOB, optional document | **Yes** — confirmed (§4.8) |
| same, AC29 | Minor replaces eKYC+Liveliness with "Minor KYC Details" | N/A — no Account Type on 1003, so Minor is unreachable |
| `user-stories/US_009_Normal_ Account_journey.md` AC27–29 | Normal's stage order = Mobile → Account Type → eKYC → Liveliness → Address → Branch → Basic Details → … ; Applicant Id series `SAH-1001-nnn` | **Contradicted for 1003** — no Account Type; Applicant Id series is `SAH-1003-nnn` (§4.3) |
| same | "Same Mobile number has been already verified for same request !" on reuse | `[NOT VERIFIED]` — no second applicant exists on 1003 |
| `tests/pages/savings-application/application-form/MobileVerificationStep.ts` | Comment: OTP box is "the only enabled input"; Send Verification Code implied available early | Partially contradicted — see §5 V-04 |
| `tests/pages/savings-application/application-form/EkycVerificationStep.ts` | Only Aadhaar is mandatory; `finalStatus` stays 0 until Aadhaar succeeds | **Confirmed** on 1003 (§8 N-14, N-22) |
| same | All four cards lock once the step is submitted | **Confirmed** — after step submit, `isEditable: 0` and the tab no longer opens (§4.10) |
| `tests/pages/savings-application/SilverApplicationPage.ts` / `NormalApplicationPage.ts` | Scheme labels `Silver Savings Account - 1002` / `Normal Savings Account - 1001` | **Yes** — confirms the envelope's inversion |
| `specs/SAD_TS001-test-plan.md` BR4 | Scheme dropdown lists all three schemes incl. "Staff Salary Account - 1003" | **Yes** |
| `reports/SILVER_TS001-test-report.md` | 11 known defects (BUG-SILVER-001..011) | Not re-reported here; only 1003-specific findings recorded |
| `reports/NORMAL_TS001-test-report.md` (via US_009 AC27) | BUG-NORMAL-001/002/003/004 | Not re-reported here |

**Contradictions found (each is a finding in its own right):**

1. **No Account Type step on 1003.** Silver and Normal both place Account Type at module
   sequence 2. Scheme 1003 goes Mobile Verification → eKYC Verification directly. Proven
   server-side, not just visually (§8 N-11).
2. **Scheme numbering in the task envelope is inverted** (§1.1).
3. **"Send Verification Code" visibility** — `MobileVerificationStep.ts` and Silver's
   TC-SIL-002 describe the button appearing from 1+ digits. On 1003 it stayed hidden at 4
   digits and appeared only at 10 (§5 V-04).
4. **Each scheme has its own workflow definition.** `aosWorkflowDtlUuid` ends `…sas`
   (Silver), `…nsa` (Normal), `…stsa` (Staff Salary). Cross-scheme inference is therefore
   structurally unsafe, not merely cautious (§8 N-04).

---

## 3. Navigation Map

```
Login  /login
 └── Home  /HOME
      └── Savings Application Dashboard  /UNPOSTED
           ├── New Application → Scheme Selection  /schemelist
           │    └── "Staff Salary Account - 1003"  → /applndetails
           └── row View icon → /applndetails  (resume)
```

| Screen / step | Route | Reached by | Direct URL works? |
|---|---|---|---|
| Login | `/login` | Session expiry redirect | Yes |
| Home | `/HOME` | Post-login | Yes |
| Savings Application Dashboard | `/UNPOSTED` | "Savings Application" card | Yes (see note) |
| Scheme Selection | `/schemelist` | "New Application" | Not tested cold |
| Application wizard | `/applndetails` | Scheme card, or Dashboard View | **Yes** — resumes the most recent application (§4.10) |

**Note:** every wizard stage shares the single route `/applndetails`. There is no
per-stage URL, so a stage cannot be deep-linked, bookmarked, or shared. `[OBSERVED]`

---

## 4. Screen-by-Screen Observations

### 4.1 — Savings Application Dashboard (`/UNPOSTED`)

**Snapshot taken:** yes

Entry context only; this module is covered by US_006 / SAD_TS001.

| # | Action | Result observed | Network | Evidence |
|---|---|---|---|---|
| 1 | Open dashboard | Tabs Pending 22 / Submitted 15 / Re-Assigned 1 / Decisioned 54; table of applications | `POST app/activity/list` → 200 | `[OBSERVED]` |
| 2 | Scan for existing 1003 applications | Exactly one pre-existing Pending 1003 draft, `SAH-1003-772`, Customer Type **Individual** | — | `[OBSERVED]` |

`[OBSERVED]` The only pre-existing 1003 application on the Pending tab is Customer Type
"Individual" — consistent with the finding that 1003 has no Account Type choice (§4.4).

`[NOT VERIFIED]` `SAH-1003-772` was **not** resumed or modified. It is a real third-party
in-progress draft; the playbook's preference for reusing seeded data was outweighed by the
instruction not to disturb real in-progress applications. A fresh application was created
instead.

---

### 4.2 — Scheme Selection (`/schemelist`)

**Reached by:** Dashboard → "New Application"
**Snapshot taken:** yes

#### Elements observed

| Element | Type | Label / text | Initial state | Enabled by |
|---|---|---|---|---|
| Search box | Input | placeholder `Search Scheme Type` | Empty, enabled | — |
| Product heading | Heading (h5) | `Savings Account` | Visible | — |
| Scheme card 1 | Button | `Silver Savings Account - 1002` | Enabled | — |
| Scheme card 2 | Button | `Normal Savings Account - 1001` | Enabled | — |
| Scheme card 3 | Button | `Staff Salary Account - 1003` | Enabled | — |
| Details carousel | Carousel | Scheme name + description, auto-rotating | Visible | — |
| Prev / Next Page | Buttons | Carousel controls | Enabled | — |

#### Actions taken and results

| # | Action | Result observed | Network | Evidence |
|---|---|---|---|---|
| 1 | Load screen | 3 schemes listed under product "Savings Account" | `POST scheme/getUserwiseAllscheme` → 200 | `[OBSERVED]` |
| 2 | Type `staff` in search | List narrowed to only `Staff Salary Account - 1003` | `POST scheme/getUserwiseAllscheme` → 200, body `searchValue:"staff"` | `[OBSERVED]` |
| 3 | Click `Staff Salary Account - 1003` | Navigated to `/applndetails`, header shows Product/Scheme, stepper shows one stage | — | `[OBSERVED]` |

`[OBSERVED]` Search is **server-side**, not client-side filtering: the request body carries
`searchValue`. Lowercase `staff` matched `Staff Salary Account - 1003`, so matching is
case-insensitive and substring-based.

`[OBSERVED]` The request body also carries `inActiveAcRequired: 0` and `pageLimit: 1000` —
inactive schemes are excluded by the caller, and pagination is effectively disabled.

`[OBSERVED]` Scheme 1003's description (verbatim, from the carousel and the API):
> "The Staff Salary Account at Sahayog Multi State Credit Co-op Society Ltd is an exclusive
> benefit for employees, offering a zero-balance facility for hassle-free monthly salary
> credits. Account holders enjoy free debit card usage, special loan concessions, and
> priority access to digital banking. Designed to meet staff financial needs, it combines
> convenience, savings, and privileges in one seamless account."

`[OBSERVED]` **The scheme record contains no attribute backing any of those claims.** 1003
carries `interestType:"F"`, `fromInterestRate:6.0`, `toInterestRate:6.0`, `acType:10` —
byte-for-byte the same as Silver 1002 and Normal 1001. There is no zero-balance flag, no
minimum-balance field, no debit-card or concession attribute anywhere in the payload
(§8 N-04). Whether those benefits are enforced downstream is `[NOT VERIFIED]`.

`[OBSERVED]` Selecting a scheme does **not** create an application record. `/applndetails`
loaded with no Applicant Id in the header; the record was created later, on first
"Send Verification Code" (§4.3).

---

### 4.3 — Mobile Number Verification (`/applndetails`, module sequence 1)

**Reached by:** clicking the 1003 scheme card
**Snapshot taken:** yes

#### Header

| Field | Value before OTP send | Value after OTP send |
|---|---|---|
| Applicant Id | *absent* | `SAH-1003-812` |
| Product Name | `Savings Account` | `Savings Account` |
| Scheme Name | `Staff Salary Account - 1003` | `Staff Salary Account - 1003` |

`[OBSERVED]` The header gains "Applicant Id" only once the applicant record is created.
Applicant Name is absent throughout this stage.

`[OBSERVED]` Applicant Id series for scheme 1003 is **`SAH-1003-nnn`** — the scheme code is
embedded in the identifier, matching the `SAH-1001-nnn` / `SAH-1002-nnn` pattern documented
for the other schemes.

#### Stepper

`[OBSERVED]` On a freshly-started 1003 draft the stepper exposes exactly one tab:
`["Mobile Number Verification"]`. No later stage is visible or reachable — the journey
cannot be previewed or skipped ahead.

#### Fields

| Field | Mandatory marker | Type | Default | Placeholder | Max length | Options source | Depends on |
|---|---|---|---|---|---|---|---|
| Mobile Number | `*` | tel/numeric text, `name="applicant_mobile"` | empty | `Mobile Number` | 10 (`[OBSERVED]`, §5 V-03) | N/A | — |
| Country code | none | Static display `+91` with India flag | `+91` | — | — | Static, not selectable | — |
| Enter OTP | none shown | text, `name="mobotp"` | empty | — | `[NOT VERIFIED]` | N/A | Appears only after OTP send |

`[OBSERVED]` The country code is **fixed display-only text**, not a dropdown. Only Indian
numbers can be entered.

`[DEFECT]` The "Enter OTP" field carries **no `*` mandatory marker** even though it is
unconditionally required to pass the stage. Every other required field in this journey is
marked. See D-09.

#### Controls

| Control | Initial state | Enabled/revealed by | Behaviour |
|---|---|---|---|
| Send Verification Code | **Hidden** | 10 digits entered (§5 V-04) | Creates applicant record, sends OTP |
| Change Mobile Number? | Hidden | Appears after OTP send | `[NOT VERIFIED]` — not exercised |
| Submit (OTP) | Visible after OTP send | — | Verifies OTP |
| Resend OTP | Hidden | Appears when the validity countdown reaches zero | Sends a fresh OTP |

#### Actions taken and results

| # | Action | Result observed | Network | Evidence |
|---|---|---|---|---|
| 1 | Type `abcdefghij` | Field remained **empty** — alphabetic input rejected outright | none | `[OBSERVED]` |
| 2 | Type `98!@#76$%^5432` | Field held `9876` — non-digits stripped, remainder after the second separator dropped | none | `[OBSERVED]` |
| 3 | Type valid 10-digit number | "Send Verification Code" appeared | none | `[OBSERVED]` |
| 4 | Click Send Verification Code | Applicant Id `SAH-1003-812` appeared; Mobile field became `disabled`; "Change Mobile Number?" + "Enter OTP" + timers + Submit appeared | `POST aos/mobile/verify/save` → 200 | `[OBSERVED]` |
| 5 | Wait ~95 min, then Submit stale OTP | Panel already read "OTP is expired"; Submit still fired a server call, which rejected it | `POST aos/mobile/verify/submit/otp` → **200 / success:"FALSE"** | `[OBSERVED]` |
| 6 | Click Resend OTP | Timers restarted at 18:18 / 4:03 | `POST aos/mobile/verify/send/otp` → 200 | `[OBSERVED]` |
| 7 | Submit fresh OTP | Verified; stepper gained "eKYC Verification" and the panel switched to it | `POST aos/mobile/verify/submit/otp` → 200 | `[OBSERVED]` |

#### Messages captured (verbatim)

| Trigger | Message text | Style | Client or server |
|---|---|---|---|
| Successful OTP send | `The OTP has been sent on +91-XXXXXXXXXX. OTP Validity Remaining 18 Min 19 Sec. Resend OTP After 4 Min 4 Sec.` | Inline panel | Client-rendered |
| Validity elapsed | `OTP is expired` + `Resend OTP` link | Inline panel | Client |
| Stale OTP submitted | `Entered mobile number OTP is expired! ` *(trailing space in source)* | API `msgDescr` | **Server** |
| First OTP send | `Mobile OTP sent successfully! You have 2 attempts left.` | API `msgDescr` | Server |
| Resend | `OTP sent to the mobile number. You have 1 attempts left.` | API `msgDescr` | Server |
| Successful verification | `Mobile OTP Verification done successfully !` *(space before `!`)* | API `msgDescr` | Server |
| Revisiting completed stage | `Mobile Number Verification submitted successfully.` | Inline, with "Done" icon | Client |

---

### 4.4 — Account Type — **ABSENT ON SCHEME 1003**

`[OBSERVED]` **There is no Account Type step in the 1003 workflow.** Verifying the mobile
OTP advanced the wizard directly from module sequence 1 to module sequence 2 =
`EKYC_VERIFICATION`. The Joint / Individual / Minor selection screen that Silver and Normal
both present at sequence 2 never appeared.

This is proven server-side, not merely by the absence of a UI tab — the `aosStepList`
returned by `aos/mobile/verify/submit/otp` reads:

```
seq=1  stepCode=MOBILE_VERIFICATION   stepDesc="Mobile Number Verification"  stepStatus=1  isEditable=0
seq=2  stepCode=EKYC_VERIFICATION     stepDesc="eKYC Verification"           stepStatus=0  isEditable=1
```

`[OBSERVED]` The account is nonetheless assigned a customer type: the Dashboard lists
`SAH-1003-812` with Customer Type **"Individual"**, set without any user choice. This
matches `custType:"I"` on the 1003 scheme record (§8 N-04).

`[INFERRED]` Staff Salary Account is an Individual-only product. The Joint and Minor
journeys — and everything downstream that depends on them (Joint Applicant Details,
Guardian Details, Introducer Details as a Joint-only step, Mode of Operation
"Jointly"/"Guardian") — are therefore not reachable on 1003. Not directly demonstrated,
because there is no control to attempt the alternative.

**Open question for stakeholders:** is Individual-only intended for a staff salary product,
or is the Account Type step missing from the 1003 workflow configuration by mistake?

---

### 4.5 — eKYC Verification (module sequence 2)

**Reached by:** successful mobile OTP verification
**Snapshot taken:** yes

#### Elements observed

| Element | Type | Label / text | Initial state | Enabled by |
|---|---|---|---|---|
| Card 1 | Card + heading (h3) | `Aadhaar Verification through DigiLocker *` | No status badge | — |
| Card 2 | Card + heading (h3) | `PAN Verification` | No status badge | — |
| Card 3 | Card + heading (h3) | `Driving Licence Verification` | No status badge | — |
| Card 4 | Card + heading (h3) | `Voter Id Verification` | No status badge | — |
| Step Submit | Button | `Submit` | Enabled | — |

`[OBSERVED]` Card order is fixed: Aadhaar, PAN, Driving Licence, Voter Id.

`[OBSERVED]` **Only Aadhaar carries the `*` mandatory marker.** The other three render no
asterisk, confirming they are supplementary on 1003 as well.

`[OBSERVED]` All four cards are clickable from the outset — none is gated behind another.
An applicant may open PAN/DL/Voter ID before Aadhaar succeeds.

`[OBSERVED]` On step load, `POST aos/ekyc/get/status/dtl` returns a six-field status object:
```json
{"digilockerVerifyStatus":0,"digiaadharVerifyStatus":0,"voteridVerifyStatus":0,
 "drlicenceVerifyStatus":0,"finalStatus":0,"panVerifyStatus":0}
```

`[OBSERVED]` Status code vocabulary observed on 1003: **0** = not started, **3** = link sent
/ awaiting customer, **1** = successful. (A fourth value, 13, appears at step level — §4.10.)

`[OBSERVED]` While a verification is Pending the client **polls `aos/ekyc/get/status/dtl`
continuously** — 23 calls were recorded across roughly 4 minutes (~1 per 10s), and polling
continued for the whole pending window. There is no observed backoff.

---

### 4.6 — eKYC → Aadhaar Verification through DigiLocker

#### Popup contents (before sending)

| Element | Type | Label / text | State |
|---|---|---|---|
| Title | Heading (h2) | `Digilocker` | — |
| Mobile field label | Heading (h4) | `MOBILE NUMBER` | — |
| Mobile field | Input, placeholder `XX-XXXXXXXXXX` | pre-filled with the verified number | **disabled** |
| Status line | Paragraph | `The link has been sent on +91-XXXXXXXXXX` | Shown **before** any link is sent |
| Consent copy | Paragraph | `The link will be sent to the customer. They must grant access to their DigiLocker documents to proceed with eKYC.` | — |
| Cancel | Button | `Cancel` | Enabled |
| Send Link | Button | `Send Link` | Enabled |

`[DEFECT]` **The popup asserts a link has already been sent before one has.** On first open,
with `digilockerVerifyStatus: 0`, `consentUrl: null` and `linkExpiryDate: null`, and with
the backing call `POST digilocker/get/details` returning
`{"msgCode":"500","msgDescr":"Details are not present !","success":"FALSE"}`, the UI still
rendered "The link has been sent on +91-XXXXXXXXXX". No link had been sent. See D-04.

`[OBSERVED]` The Mobile Number field is **disabled** and pre-filled from the verified
number. Silver's AC8/AC8.1 assume this field is editable and require validation probing on
it; on 1003 that is impossible. Recorded as a scheme-observable difference, not a defect.

`[OBSERVED]` **Cancel initiated nothing.** Closing the popup with Cancel fired no
`send/link` request; status remained 0.

#### After Send Link

| # | Action | Result observed | Network | Evidence |
|---|---|---|---|---|
| 1 | Click Send Link | Card gained a disabled `Pending` badge and an information panel | `POST digilocker/send/link` → 200 | `[OBSERVED]` |
| 2 | Customer granted consent on a real handset | Badge changed `Pending` → `Successful`; info panel collapsed | `POST aos/ekyc/get/status/dtl` → `digilockerVerifyStatus:1` | `[OBSERVED]` |

Verbatim panel text while Pending:
> `A verification link for the digilocker has been sent to the customer on +91-XXXXXXXXXX.`
> `Link Validity Remaining 27 Min 14 Sec.`
> `Resend Link After 2 Min 44 Sec.`

Verbatim API message on send:
> `Link sent to the mobile number. You have 2 attempts remaining.`

`[OBSERVED]` Link send budget is **3 per application** (2 remaining after the first).

`[OBSERVED]` Server config returned alongside: `linkExpiryMin: 25`, `resendLinkAllowedDur: 30`,
and a hard `linkExpiryDate` of `2026-08-17T10:01:09Z`.

`[DEFECT]` **The displayed link validity (27 min 14 s) exceeds the configured 25 min.** See
D-01 — the same overstatement pattern as the OTP timer.

`[OBSERVED]` After success, `digilockerVerifyStatus` became **1** but `digiaadharVerifyStatus`
remained **0** and `finalStatus` remained **0**. Two distinct Aadhaar-related statuses exist;
only the DigiLocker consent one flipped.

`[NOT VERIFIED]` DigiLocker denial ("Action Required" status), link expiry, and resend
cooldown enforcement — all require additional real consent cycles on a real handset and
would consume the limited attempt budget.

---

### 4.7 — eKYC → PAN Verification

**Presentation:** inline panel (not a popup), replacing the card list.

#### Fields

| Field | Mandatory marker | Type | Default | Placeholder | Max length | Options source | Depends on |
|---|---|---|---|---|---|---|---|
| PAN Number | `*` | text | empty | `PAN Number` | **10** (DOM `maxlength`) | N/A | — |
| Upload PAN | `*` (on the "or drag and drop" line) | file, `input#files2` | none | — | 10 MB (config) | N/A | — |

Upload widget copy (verbatim): **`Browse Computer`** ` or drag and drop *` / `png,jpeg,pdf,camera`,
with a `Choose File` button, an `OR` separator, and a `Capture Using Camera` option.

#### Backend field configuration

`[OBSERVED]` `POST aos/button/field/get/configuration/details` returns the authoritative
per-scheme field config. For `scheme_code "1003"`, module `PAN_VERIFICATION`:

| field_name | field_label | data type | field_size | mandatory | api_name_list | field_validation | upload_file_type |
|---|---|---|---|---|---|---|---|
| `panno` | PAN Number | character varying | **100** | 1 | `PAN_COMP` | `PAN_VERIFICATION.panno.charAt(3) != 'P'` | — |
| `upload_file` | Upload PAN | file | **10 MB** | 1 | `PAN_OCR` | — | `png,jpeg,pdf,camera` |

This is a high-value discovery: the journey's field rules are **data-driven per scheme**, and
this endpoint exposes them directly.

`[OBSERVED]` The configured validation `panno.charAt(3) != 'P'` enforces that the 4th
character of the PAN is `P` (the individual-taxpayer holder-type code) — consistent with
1003 being an Individual-only product (§4.4).

`[DEFECT]` **`field_size` is 100 but the rendered input enforces `maxlength="10"`.** See D-11.

`[DEFECT]` **The rendered file input's `accept` attribute is `".png,.pdf,.camera"` — jpeg is
missing**, contradicting both the visible label (`png,jpeg,pdf,camera`) and the backend
config (`upload_file_type: "png,jpeg,pdf,camera"`). A user selecting a `.jpeg` would find it
filtered out of the file browser despite being told it is supported. See D-06. (`.camera` is
also not a file extension and is meaningless in an `accept` attribute.)

#### Actions taken and results

| # | Action | Result observed | Network | Evidence |
|---|---|---|---|---|
| 1 | Submit with everything blank | Inline `PAN Number is required` under the field. **No error for the mandatory document.** | none — client-side | `[OBSERVED]` |
| 2 | Type `12345` | Accepted; no live format check; prior error cleared | none | `[OBSERVED]` |
| 3 | Type `ABCDE1234FGHIJKL` (16 chars) | Field held `ABCDE1234F` — silently truncated to 10, no message | none | `[OBSERVED]` |
| 4 | Enter a valid-format PAN, Submit without document | Inline `Upload PAN is required` | none — client-side | `[OBSERVED]` |
| 5 | Select a valid `.png` via Choose File → Submit | Error cleared on selection, then **`Upload PAN is required` returned on Submit**; no upload request ever fired | **none** | `[OBSERVED]` |
| 6 | Re-select file, inspect DOM | `input#files2.files.length === 1`, file correctly bound at DOM level | none | `[OBSERVED]` |
| 7 | Dispatch synthetic `input`+`change`, then Submit | No change — same error, still no request | none | `[OBSERVED]` |
| 8 | Simulate drag-and-drop via `DataTransfer` on `#dropzone`, then Submit | No change — same error, still no request | none | `[OBSERVED]` |

`[DEFECT]` **PAN document upload never registers.** The file binds to the DOM input
(`files.length === 1`) but the application does not accept it: no filename is displayed, no
upload request is issued through either the Browse or drag-and-drop path, and Submit remains
blocked client-side by "Upload PAN is required". Because the document is mandatory, **PAN
verification cannot be completed on 1003 by these paths.** See D-05.

**Caveat, stated honestly:** all three attempts were programmatic. A real mouse-driven
selection may behave differently, and the Silver/Normal reports record successful uploads
elsewhere in the platform. This is recorded as a defect **candidate requiring one manual
confirmation**, and as a confirmed automation blocker either way. Flagged as an open
question in §10.4.

`[NOT VERIFIED]` PAN's documented second sub-step (read-only First/Middle/Last Name + DOB
confirmation) — unreachable, blocked by D-05.

`[NOT VERIFIED]` Whether PAN accepts an unrelated image with no content validation
(Silver's BUG-SILVER-001) — could not be tested, since no document could be submitted at
all. Note the config names a `PAN_OCR` API, so an OCR path is at least configured.

---

### 4.8 — eKYC → Driving Licence Verification

**Presentation:** popup. Primary action is **`Verify`**, not Submit.

#### Fields

| Field | Mandatory marker | Type | Placeholder | Max length | Notes |
|---|---|---|---|---|---|
| Driving Licence Number | `*` | text, `name="driving licence"` | `Enter Driving Licence Number` | **50** | Field name contains a space |
| Date of Birth | `*` | `input[type=date]`, `name="dateofbirth"` | `Select Date of Birth` | — | Native date control |
| Supporting document | **none** — optional | file | — | — | `png, jpg, pdf, camera` |

Buttons: `Cancel`, `Verify`.

#### Actions taken and results — invalid data only

| # | Action | Result observed | Network | Evidence |
|---|---|---|---|---|
| 1 | Verify with both fields blank | Inline `Enter driving licence number`. **No error for the mandatory Date of Birth.** | none — client-side | `[OBSERVED]` |
| 2 | Enter `MH0000000000000000000` (21 chars) | Accepted in full; `maxLength` is 50; no format validation | none | `[OBSERVED]` |
| 3 | Add DOB `1990-01-01`, click Verify | Verification failed | `POST aos/ekyc/verify/drLicence` → **200 / success:"FALSE"** | `[OBSERVED]` |
| 4 | Cancel | Popup closed, no status change | none | `[OBSERVED]` |

Verbatim server message:
> `Driving Licence verification failed`  (`msgCode: "DRLIC_VERI_FAILED"`)

`[OBSERVED]` Response also carried `drlicenceVerifyStatus: 0`, `isVerify: 1`, `autoApiReq: 1`,
`isNameMissMatch: 0`.

`[DEFECT]` `maxLength: 50` with **no format validation at all** on a field whose real-world
values are 15–16 characters. Garbage is passed straight to a real government lookup. See D-12.

`[NOT VERIFIED]` Successful DL verification and its second sub-step ("Driving Licence Name"
confirmation) — deliberately not attempted: real government lookup, invalid data only per
the binding safety constraint.

---

### 4.9 — eKYC → Voter Id Verification

**Presentation:** popup. Primary action is **`Verify`**.

#### Fields

| Field | Mandatory marker | Type | Placeholder | Notes |
|---|---|---|---|---|
| Voter Id Number | `*` | text | `Enter Voter Id Number` | **No Date of Birth field** — differs from DL |
| Supporting document | none — optional | file | — | `png, jpg, pdf, camera` |

Buttons: `Cancel`, `Verify`.

#### Actions taken and results — invalid data only

| # | Action | Result observed | Network | Evidence |
|---|---|---|---|---|
| 1 | Verify with field blank | Inline `Enter voter id number` | none — client-side | `[OBSERVED]` |
| 2 | Enter `ZZZ0000000`, Verify | Verification failed | `POST aos/ekyc/verify/voterId` → **200 / success:"FALSE"** | `[OBSERVED]` |
| 3 | Cancel | Popup closed, no status change | none | `[OBSERVED]` |

Verbatim server message:
> `Voter ID verification failed`  (`msgCode: "VOTER_VERI_FAILED"`)

`[NOT VERIFIED]` Successful Voter ID verification — real government lookup, invalid data only.

---

### 4.10 — eKYC step Submit → Existing Customer Data (module sequence 3)

| # | Action | Result observed | Network | Evidence |
|---|---|---|---|---|
| 1 | Click step-level Submit with Aadhaar Successful, others untouched | Panel replaced by `Please wait while we are fetching existing customer data` | `POST existing/customer/data/submit` | `[OBSERVED]` |
| 2 | Wait 15 s | Still spinning | in flight | `[OBSERVED]` |
| 3 | Wait a further 45 s | Still spinning; console error appeared | **`POST existing/customer/data/submit` → 504 Gateway Time-out** | `[OBSERVED]` |
| 4 | Reload `/applndetails` | Application resumed on Mobile Number Verification; **no retry issued** | `POST aos/steps/getdetails` → 200 | `[OBSERVED]` |
| 5 | Click "eKYC Verification" tab | **Nothing happened** — panel stayed on Mobile Number Verification | none | `[OBSERVED]` |
| 6 | Reload again | Same stuck state | none | `[OBSERVED]` |

`[OBSERVED]` The eKYC step Submit **succeeded** in advancing the workflow — Aadhaar alone was
sufficient, confirming PAN/DL/Voter ID are genuinely optional on 1003.

`[OBSERVED]` The 1003 workflow's **module sequence 3 is `EXISTING_CUSTOMER_DATA`
("Existing Customer Data")**, `componentModule: 16`. It has no stepper tab and no visible UI
of its own — it is a system step that runs automatically on eKYC submit.

`[OBSERVED]` Post-504 workflow state, from `aos/steps/getdetails`:
```
seq=1  MOBILE_VERIFICATION     "Mobile Number Verification"  stepStatus=1   isEditable=0
seq=2  EKYC_VERIFICATION       "eKYC Verification"           stepStatus=13  isEditable=0
  └─ seq=3  EXISTING_CUSTOMER_DATA  "Existing Customer Data"  stepStatus=13  isEditable=1
```

`[DEFECT]` **A 504 on `existing/customer/data/submit` leaves the application permanently
stuck.** The UI shows an indefinite "Please wait…" spinner with no error message, no retry
control and no recovery path. Reloading does not re-trigger the call. The eKYC step is now
`isEditable: 0`, so its tab no longer responds, and the current step
(`EXISTING_CUSTOMER_DATA`) has no UI to act on. `SAH-1003-812` cannot progress. See D-07 —
the most severe finding in this exploration.

`[OBSERVED]` Both eKYC and Existing Customer Data sit at `stepStatus: 13`, a value not seen
in the normal 0 / 1 progression — `[INFERRED]` it denotes an in-progress-or-faulted state.

`[OBSERVED]` Workflow steps carry `sequencialProcessing: 1`, `redirectionalProcessing: 1`
and `skipAllowed: 0` — steps are strictly sequential and none may be skipped.

`[OBSERVED]` **Re-entry works** — navigating directly to `/applndetails` resumes the most
recent application and renders `Mobile Number Verification submitted successfully.` with the
mobile field disabled. Completed data survives reload.

`[OBSERVED]` Dashboard row for `SAH-1003-812` after these events: Customer Type
**Individual**, date `17-08-2026`, Applicant Name populated (from the Aadhaar/DigiLocker
data), Status **Sourcer Pending**.

---

### 4.10.1 — Pass 2 re-test: the 504 was TRANSIENT, not a blocker

**This section supersedes the "permanently stuck" conclusion recorded in §4.10.**

Stakeholder input (authoritative): the failure encountered around the Aadhaar/DigiLocker
stage **was an issue on DigiLocker's side** — an upstream/third-party problem, not a fault in
the SAHAYOG application.

Re-opening `SAH-1003-812` via Dashboard → View roughly 2.5 hours later showed the workflow
had advanced on its own. `aos/steps/getdetails`:

```
seq=1 MOBILE_VERIFICATION      "Mobile Number Verification"  status=1  editable=0  compMod=1
seq=2 EKYC_VERIFICATION        "eKYC Verification"           status=1  editable=0  compMod=1
  └─ seq=3 EXISTING_CUSTOMER_DATA "Existing Customer Data"    status=1  editable=0  compMod=16
seq=4 LIVELINESS_VERIFICATION  "Liveliness Verification"     status=0  editable=1  compMod=1
```

`[OBSERVED]` `EXISTING_CUSTOMER_DATA` reached `stepStatus: 1` (complete). The 504 did **not**
permanently strand the application; no manual intervention or retry was performed.

`[OBSERVED]` `stepStatus: 13` is therefore a **transient in-progress state**, not a fault
state — it resolved to 1 without action. This answers open question 6.

**Corrected attribution — D-07 re-classified:**

| Aspect | Original (pass 1) | Corrected |
|---|---|---|
| Cause of the 504 | Application defect | **Third-party/upstream (DigiLocker-side) integration failure** — environmental, not a product defect |
| Effect on the application | Permanently stuck / unrecoverable | **Transient** — self-healed; the workflow advanced without intervention |
| Proposed severity | Blocker | **Minor**, and re-scoped to error *handling* only (see below) |

`[OBSERVED]` What remains a genuine application-side finding is only the **error handling**,
not the failure itself: during and after the upstream timeout the UI showed an indefinite
"Please wait while we are fetching existing customer data" spinner with no error message, no
retry control, and no indication that anything had gone wrong. A user could not tell whether
to wait, retry or abandon. That handling gap is retained as **D-07 (Minor)**; the outage that
triggered it is recorded as an environmental limitation, not a defect.

`[OBSERVED]` Corroborating evidence for the upstream attribution, gathered independently in
pass 1: after DigiLocker reported success, `digilockerVerifyStatus` became **1** while
`digiaadharVerifyStatus` stayed **0** and `finalStatus` stayed **0** (§8 N-22). The Aadhaar
*document fetch* never completed even though the *consent* did — consistent with a
DigiLocker-side problem, and it explains the downstream address behaviour in §4.12.

---

### 4.11 — Liveliness Verification (module sequence 4)

**Reached by:** automatic advance once Existing Customer Data completed
**Snapshot taken:** yes

`[OBSERVED]` **Scheme 1003 does include a Liveliness Verification stage**, at module sequence
4. It appeared as a new stepper tab and became the active step.

`[OBSERVED]` The header gains a fourth field, **Applicant Name**, once eKYC completes —
absent at every earlier stage. Header is now: Applicant Name, Applicant Id, Product Name,
Scheme Name.

#### Elements observed

| Element | Type | Label / text | Initial state |
|---|---|---|---|
| Option 1 | Card + heading (h3) | `Security Code Based Liveliness Verification` | No status badge |
| Option 2 | Card + heading (h3) | `Liveliness Verification` | No status badge |
| Step Submit | Button | `Submit` | Enabled |

`[OBSERVED]` Neither option carries a `*`. Consistent with them being alternatives rather
than both-mandatory.

`[OBSERVED]` On step load, `POST aos/liveliness/status/details` returned **HTTP 200** with:
```json
{"msgCode":"LIVELINESS_SECURITY_FAIL",
 "msgDescr":"Request is not found for bank statement verification  !",
 "isError":true,"success":"FALSE"}
```
`[DEFECT]` The message text refers to **bank statement verification** on a *Liveliness*
endpoint — wrong module entirely, and it contains a double space before `!`. See D-13.

`[OBSERVED]` Status fields exposed: `liveSecurityVerifyStatus`, `livelinessVideoVerifyStatus`,
`finalStatus`, `linkCount`, `userCompletionStatus`, `sdkUrl` — all 0/null initially.

#### Option 1 — Security Code Based Liveliness Verification

`[OBSERVED]` Opening the card shows a popup headed **`Guidelines For Liveliness Check`**
containing four numbered instructions (verbatim):
> 1. **Prepare the Materials:** You'll need a white sheet of paper and a pen to write the Security Code.
> 2. **Write the Security Code:** Using the pen, write the Security Code clearly on the white sheet of paper. Make sure it's easily readable.
> 3. **Hold the Paper:** Hold the paper in your hand so that the written Security Code is visible and clearly displayed. You may want to position your hand in a way that the code is the focal point.
> 4. **Take the Photograph:** Use a camera function provided in the link to take a photograph of yourself with the white paper & Security Code clearly visible Ensure the lighting is adequate for a clear and sharp image.

Controls: `Cancel`, `Send Link`. There is **no mobile-number field** — the link goes to the
already-verified number.

`[OBSERVED]` Clicking Send Link fired `POST aos/liveliness/save/details` → 200,
`msgCode "LIVELINESS_VERIF_LINK_SEND"`, `"Link sent to the mobile number. You have 2
attempts remaining."` — so **3 link attempts** per application, matching the DigiLocker cap.

`[OBSERVED]` The card then showed a disabled `Pending` badge and an information panel:
> `A verification link for Liveliness Verification has been sent to customer on +91 XXXXXXXXXX`
> `Link Validity Remaining 28 Min 23 Sec.`
> `Resend Link After 3 Min 53 Sec.`

`[OBSERVED]` Server config from `aos/liveliness/get/details`: `linkExpiryMin: 25`,
`resendLinkAllowedDur: 30`, `linkExpiryDate` fixed at send time + 25 min.

`[DEFECT]` **Third independent instance of the timer overstatement (D-01)** — 28 m 23 s
displayed against a configured 25 min.

`[DEFECT]` **`aos/liveliness/get/details` returns `photoSecuritycode` to the browser in
plaintext** — the very code the applicant is instructed to hand-write and photograph. Anyone
with access to the agent's session can read the expected code from the network response
without ever receiving the SMS. See D-14. (The observed value is deliberately not recorded
here.)

`[OBSERVED]` **Outcome:** the verification act itself was performed by a human on a real
handset, outside this agent's control. What is directly observable is the result: the card's
badge changed from `Pending` to a disabled **`Successful`**, and the step's Submit then
advanced the workflow. The interaction on the customer's device is **not** claimed as
observed.

`[NOT VERIFIED]` Whether the security-code check actually validates the photographed
person's identity. Silver's `BUG-SILVER-004` `[REPO]` records that it does not (a different
person holding the code passed twice). **Not re-tested on 1003** — doing so would require
deliberately impersonating an applicant on a live banking KYC step.

#### Option 2 — Liveliness Verification (video/camera based)

`[OBSERVED]` Opening this card shows a popup with the **same** `Guidelines For Liveliness
Check` heading but a **different, five-point** guideline set (verbatim), introduced by
`To ensure a smooth liveliness verification process , ask applicant to -`:
> 1. **Mobile Readiness:** Please have your mobile device prepared for verification.
> 2. **Clear Communication:** Speak clearly and audibly during the process to ensure smooth communication.
> 3. **Professional Appearance:** Dress professionally and wear appropriate attire during the session.
> 4. **Optimal Lighting:** Ensure sufficient lighting for clear image quality.
> 5. **Internet Connectivity:** Stay connected and ensure a stable internet connection throughout the verification process.

Controls: `Cancel`, `Send Link`.

`[OBSERVED]` Cancel closed the popup with no link sent and no status change.

`[NOT VERIFIED]` **This option was deliberately not initiated.** Only one of the two methods
is required and Option 1 had already succeeded; initiating it would have consumed another of
the 3 link attempts and required a second human gate. Its UI, copy and controls are fully
inventoried above; its success/failure behaviour on 1003 is unverified.
`[REPO]` Silver's `BUG-SILVER-010` records this camera method failing to save for nested
applicants — not re-tested on 1003.

`[OBSERVED]` **Business rule confirmed:** the step submitted successfully with Option 1
`Successful` and Option 2 never started — the two methods are **alternatives**, and exactly
one suffices.

`[OBSERVED]` Copy defect: the intro line reads `verification process , ask applicant` — space
before the comma. Guideline 4 of Option 1 reads `…clearly visible Ensure the lighting…` —
missing sentence break. Both folded into D-10.

---

### 4.12 — Address Details (module sequence 5)

**Reached by:** submitting the Liveliness step
**Snapshot taken:** yes

`[OBSERVED]` Stepper is now: `Mobile Number Verification`, `eKYC Verification`,
`Liveliness Verification`, `Address Details`.

#### Section-level structure

| Section | Mandatory marker | Initial content | Control |
|---|---|---|---|
| `Permanent address` | `*` | **Empty** | `Click Here For Add Address` |
| `Communication Address` | `*` | Empty | `Click Here For Add Address` |
| Step Submit | — | — | `Submit` |

`[OBSERVED]` **The Permanent address was NOT auto-populated.** Both addresses require manual
entry via "Click Here For Add Address".

`[OBSERVED]` Technical confirmation from `POST aos/address/get/details` → 200: both entries
(`addrTypeId: "register_addr"` / "Permanent address", and `addrTypeId: "current_addr"` /
"Communication Address") returned **`registeredAddrFrmApi: 0`** with every field `null`.

`[INFERRED]` This is most plausibly a **downstream consequence of the DigiLocker-side issue**
recorded in §4.10.1 — `digiaadharVerifyStatus` never reached 1, so no Aadhaar document data
existed to populate an address from. `[REPO]` Silver AC21.2 and Normal AC28 both describe the
primary applicant's Permanent address being auto-populated read-only from Aadhaar. **Whether
scheme 1003 would auto-populate it given a fully successful Aadhaar fetch is
`[NOT VERIFIED]`** — this run cannot distinguish a scheme difference from an upstream-data
consequence, and it is not assumed either way.

#### Fields — "Permanent address" popup

| Field | Mandatory marker | Type | Default | Placeholder | Options source | Depends on |
|---|---|---|---|---|---|---|
| Address Line 1 | `*` | textbox | empty | `Address Line 1` | N/A | — |
| Address Line 2 | none | textbox | empty | `Address Line 2` | N/A | — |
| Area / locality | none | textbox | empty | `Area / locality` | N/A | — |
| Country | `*` | textbox, **disabled** | `India` | — | Fixed | — |
| State | `*` | dropdown | empty, `Select State` | — | **API** `GET /sahyognetwinMasterDB/master/data/get/states` | — |
| City | `*` | dropdown | empty, `Select City` | — | **API** (master data) | **Should** depend on State — it does not (see D-16) |
| Pin code | `*` | textbox | empty | `Pin code` | N/A | — |
| Upload Address Proof | **none** — optional | file | — | — | `png, jpg, pdf,camera` | — |

Controls: `Cancel`, `Submit`.

`[OBSERVED]` Country is **disabled and fixed to "India"** — non-Indian addresses cannot be
entered at this step.

`[OBSERVED]` Upload Address Proof carries **no** `*` — optional here, unlike PAN's mandatory
upload.

#### Actions taken and results

| # | Action | Result observed | Network | Evidence |
|---|---|---|---|---|
| 1 | Submit with all fields blank | **Four** inline errors shown simultaneously: `Address Line 1 is required`, `State is required`, `City is required`, `Pin code is required` | none — client-side | `[OBSERVED]` |
| 2 | Open State dropdown | 33 options | `GET master/data/get/states` → 200 | `[OBSERVED]` |
| 3 | Select `Maharashtra` | Selected; **no network call fired** | none | `[OBSERVED]` |
| 4 | Open City dropdown | **4,498 options, not filtered by the selected State** | none | `[OBSERVED]` |
| 5 | Cancel | Popup closed without saving | none | `[OBSERVED]` |

`[OBSERVED]` **Address Details flags all unmet mandatory fields at once**, unlike PAN Verification
and Driving Licence Verification which reveal them one at a time (§5 V-16, V-17). This makes
D-08 an **inconsistency between forms**, not a universal flaw.

`[DEFECT]` **State master data is incomplete and contains a typo.** The list served by
`master/data/get/states` has 33 entries and is missing **Bihar, Sikkim, Telangana and
Ladakh**; `Rajasthan` is misspelled **`Rajsthan`**. Address Details is a mandatory step, so an
applicant resident in any of those four jurisdictions **cannot complete an application at
all**. See D-15. (The list is also mis-sorted: `Uttarakhand` precedes `Uttar Pradesh`.)

`[DEFECT]` **The State → City cascade does not work.** With `Maharashtra` selected, the City
dropdown offered **4,498 entries spanning every state** — the first dozen alone include
cities in Arunachal Pradesh, Gujarat, Chhattisgarh, Assam, Tamil Nadu, Punjab, Maharashtra
and Jammu & Kashmir. Selecting a State fires **no** request and never re-filters the list.
Consequences: an unusable 4,498-item picker, and nothing preventing a saved
State/City combination that does not exist. See D-16. `[REPO]` Contrast SAD_TS001 BR4, where
the dashboard's Scheme dropdown *does* correctly cascade on Product.

`[NOT VERIFIED]` Communication Address popup contents, and whether 1003 offers a
"Same as Permanent address" checkbox or a "Use Existing Address" toggle (both documented on
1001/1002). Not opened — see §4.13.

---

### 4.12.1 — Pass 3: Address Details completed with synthetic test data

The PII blocker was lifted by the stakeholder, who authorised **fabricated** address data.
Nothing below derives from the applicant's real address or from the Aadhaar fetch.

**Test data used (recorded for reproducibility):**

| Field | Value entered |
|---|---|
| Address Line 1 | `Flat 101, Testview Apartments` |
| Address Line 2 | `Plot 42, QA Industrial Layout` |
| Area / locality | `Automation Nagar` |
| Country | `India` (disabled, fixed) |
| State | `Maharashtra` |
| City | `Abohar` — **deliberately a Punjab city**, to probe the cascade |
| Pin code | `422001` |
| Upload Address Proof | a 153-byte 100×50 PNG (`addr-proof-test.png`, since deleted) |

#### Field metadata (from the DOM)

| Field | Element | maxLength | Notes |
|---|---|---|---|
| Address Line 1 | **`<textarea name="address_line1">`** | 255 | **Not an `<input>`** — automation gotcha |
| Address Line 2 | **`<textarea name="address_line2">`** | 255 | |
| Area / locality | **`<textarea name="area">`** | 255 | |
| Country | `<input name="country">` | 255 | **disabled**, value `India` |
| State / City | PrimeReact dropdowns | — | backing filter inputs are `readonly` |
| Pin code | `<input>` | **6** | |
| Upload Address Proof | `<input type="file" id="files2">` | — | `accept=".png,.jpg,.pdf,.camera"` |

`[OBSERVED]` Pin code is numeric-only, enforced client-side: entering `ABC12X` left `12`.

`[OBSERVED]` **The Address Proof input's `accept` is `.png,.jpg,.pdf,.camera` — it *does*
include jpg**, unlike PAN's which omits jpeg. This **narrows D-06 to the PAN control
specifically**; it is not an application-wide accept-attribute fault.

#### Probe results

| # | Probe | Result | Evidence |
|---|---|---|---|
| P-01 | Impossible State/City accepted? | **Yes — saved.** `Maharashtra` + `Abohar` persisted | `[OBSERVED]` |
| P-02 | Address proof upload registers? | **No** — file bound to DOM (`files.length 1`) but `uploadFileType: null` in the save payload; no upload request | `[OBSERVED]` |
| P-03 | Pin code survives other interactions? | **No** — a filled Pin code was silently cleared | `[OBSERVED]` |
| P-04 | "Same as Permanent address" copies all fields? | **Yes — all of them** | `[OBSERVED]` |
| P-05 | Does it lock the copied fields? | **Only Address Line 1** | `[OBSERVED]` |
| P-06 | Does unticking restore prior manual values? | **No — blanks everything** | `[OBSERVED]` |
| P-07 | Can a saved address be edited? | **No affordance exists** | `[OBSERVED]` |

**P-01 — the impossible pair is stored, not merely selectable.** After submit, the saved
Permanent address renders as:
> `Flat 101, Testview Apartments , Plot 42, QA Industrial Layout , Automation Nagar , Abohar , Maharashtra , 422001 , India`

and the save payload (`POST aos/address/save/editable/details` → 200) carries both codes:
```json
"city":"Abohar","cityCode":10,"stateName":"Maharashtra","stCode":27,"pincode":"422001"
```
`[DEFECT]` **D-16 is upgraded.** The system does not merely *allow* an impossible
State/City combination in the UI — it **persists it**, with mutually inconsistent master-data
codes, and neither the client nor the server rejects it. The PIN (`422001`, a Nashik/Maharashtra
code) is also not cross-validated against the city. Severity raised **Major → Critical**.

**P-02 — the upload defect is not PAN-specific.** The address proof file bound to
`input#files2` exactly as PAN's did, yet the save payload recorded `uploadFileType: null` and
**no upload request was ever issued**. `[DEFECT]` **D-05 is upgraded from "PAN upload" to
"document upload platform-wide"** — two independent upload controls, in two different modules,
both fail to register a selected file through the Browse path. Because Address Proof is
*optional*, the step still submitted; PAN's is *mandatory*, so PAN is hard-blocked.

**P-03 — silent loss of a filled mandatory field.** `Pin code` was entered as `422001`, then
State, City and the file were set; on Submit the Pin code field was **empty** and showed
`Pin code is required`. Re-entering it and resubmitting succeeded. `[DEFECT]` D-20 — a
populated mandatory field is silently cleared by a later interaction in the same form.

**P-04/P-05/P-06 — "Same as Permanent address".** `[OBSERVED]` The Communication Address
popup carries a `Same as Permanent address` checkbox (unchecked by default). Ticking it
populated **every** field with correctly structured values:

| Field | Value after ticking |
|---|---|
| Address Line 1 | `Flat 101, Testview Apartments` |
| Address Line 2 | `Plot 42, QA Industrial Layout` |
| Area / locality | `Automation Nagar` |
| Country | `India` |
| State | `Maharashtra` |
| City | `Abohar` |
| Pin code | `422001` |

`[OBSERVED]` **This directly contradicts `[REPO]` BUG-SILVER-002 / BUG-NORMAL-001**, which
report that the equivalent control populates only Address Line 1 (as one unstructured string)
and leaves State, City and Pin Code empty. On scheme 1003 the copy is complete and
structured. Either the defect has been fixed, or it is scheme-specific. **Recorded as a
contradiction of repo documentation, not as a defect.**

`[OBSERVED]` Ticking disables **only** Address Line 1. Address Line 2, Area and Pin code
remain editable, so a user can tick "same as permanent" and then silently diverge the copy.
`[DEFECT]` D-21 — partial, inconsistent locking.

`[OBSERVED]` **Unticking blanks every field and does not restore prior input.** Verified
destructively: `MANUAL COMM ADDRESS 99` was typed into Address Line 1, the checkbox was
ticked (overwriting it), then unticked — the field came back **empty**, not restored.
`[DEFECT]` D-22 — silent, unrecoverable data loss with no warning and no undo.

`[OBSERVED]` What is persisted is **both** a copy and a flag. The Communication save payload
carries every copied value *and* `"sameAsRegaddrReq":1`, plus `"registeredAddrFrmApi":0`.
`[INFERRED]` Because the values are denormalised rather than referenced, a later edit to the
Permanent address would leave the Communication copy stale.

**P-07 — saved addresses cannot be edited.** `[OBSERVED]` Once saved, an address renders as
read-only text. Clicking it does not reopen the form, and the only SVGs in the section are
decorative map pins plus the panel's back chevron — there is no edit or delete control.
`[GAP]` A mistyped address cannot be corrected at this step.

`[NOT VERIFIED]` **Whether the Communication copy goes stale when the Permanent address is
edited** — untestable from the UI, because P-07 shows the Permanent address cannot be edited
once saved. The staleness risk is visible in the data model but cannot be triggered here.

`[OBSERVED]` **No conflict was raised between the fabricated address and the Aadhaar-verified
identity.** The system performed no cross-validation: a real DigiLocker-verified identity now
carries an entirely invented address, in a city in the wrong state, and the step submitted
cleanly. `[GAP]` No address/identity consistency check exists at this stage.

---

### 4.13 — Branch Selection (module sequence 6)

**Reached by:** submitting Address Details
**Snapshot taken:** yes

`[OBSERVED]` A **default branch is pre-selected** with no user action:

| Element | Value |
|---|---|
| Branch name | `AMGAON BRANCH` |
| Branch Id | `1005` |
| Branch address | `NIRMAL COMPLEX IN FRONT OF STATE BANK OF Gondiya Maharashtra` |
| Controls | `Change Branch?`, `Submit` |

`[OBSERVED]` The default branch bears **no relationship to the address just entered** — the
applicant's stated city was Abohar and the branch is in Gondiya. No proximity or
address-driven branch suggestion is applied.

`[OBSERVED]` `Change Branch?` opens a searchable list (`Search` placeholder) of **7 further
branches**, each showing name, `Branch Id: NNNN` and address, with `Back` and `Submit`:

| Branch | Id |
|---|---|
| ASSET2 BRANCH | 1081 |
| MORGAON ARJUNI BRANCH | 1019 |
| Sadak Arjuni Branch | 10556 |
| GOREGAON BRANCH | 1002 |
| SALEKASA BRANCH | 1009 |
| TIRORA BRANCH | 1012 |
| SADAK ARJUNI BRANCH | 1017 |

`[OBSERVED]` The currently-selected branch (AMGAON, 1005) is **excluded** from the list.

`[DEFECT]` **Apparent duplicate branch master data:** `Sadak Arjuni Branch` (Id `10556`) and
`SADAK ARJUNI BRANCH` (Id `1017`) differ only in casing but carry different Branch Ids. See
D-23.

`[OBSERVED]` **A single Submit from the default-branch view saves.** Clicking `Back` then
`Submit` fired `POST branch/selection/submit/details` → 200 on the **first** click and
advanced the step. `[REPO]` Normal's AC27 reports a two-click behaviour (the first click only
collapsing the branch-card list). The two are consistent: the extra click applies when
submitting *from inside* the Change Branch list, not from the default summary view. **The
change-branch save path itself was not exercised on 1003** — `[NOT VERIFIED]`, deliberately,
to avoid the known ambiguity around `[REPO]` BUG-SILVER-009.

---

### 4.14 — Basic Details (module sequence 7)

**Reached by:** submitting Branch Selection
**Snapshot taken:** yes

This is where scheme 1003 diverges most sharply from 1001/1002.

#### Field inventory (29 fields)

| # | Field | Mandatory | Type | Default / auto-filled | maxLength |
|---|---|---|---|---|---|
| 1 | Mode of Operation | `*` | dropdown | `Select Mode of Operation` | — |
| 2 | Prefix | `*` | dropdown | `Select Prefix` | — |
| 3 | First name | `*` | text | **auto-filled from eKYC**, editable | 100 |
| 4 | Middle name | — | text | auto-filled, editable | 100 |
| 5 | Last name | `*` | text | auto-filled, editable | 100 |
| 6 | Full name | `*` | text | auto-filled, **disabled** | 100 |
| 7 | Date of Birth | `*` | date | auto-filled, **disabled** | — |
| 8 | Gender | `*` | dropdown | `Select Gender` | — |
| 9 | Email ID | `*` | text | empty | 300 |
| 10 | Marital Status | `*` | dropdown | `Select Marital Status` | — |
| 11 | Father First Name | `*` | text | empty | 100 |
| 12 | Father Middle Name | — | text | empty | 100 |
| 13 | Father Last Name | `*` | text | empty | 100 |
| 14 | Mother's Name | `*` | text | empty | 100 |
| 15 | Spouse / Father's Name | — | text | empty | **20** |
| 16 | Religion | — | dropdown | `Select Religion` | — |
| 17 | Caste Category | `*` | dropdown | `Select Caste Category` | — |
| 18 | Politically Exposed Person | `*` | dropdown | **`None`** | — |
| 19 | Person with Disabilities | — | dropdown | **`No`** | — |
| 20 | Education/Qualification | `*` | dropdown | `Select Education/Qualification` | — |
| 21 | Country of Tax Residence is India | `*` | dropdown | **`Yes`** | — |
| 22 | Region | `*` | dropdown | `Select Region` | — |
| 23 | **Is Staff** | `*` | dropdown | **`YES`** | — |
| 24 | Funding Mode | `*` | dropdown | `Select Funding Mode` | — |
| 25 | **Staff Id** | `*` | text | empty | 100 |
| 26 | Expected Value of Transaction (yearly) | `*` | text | empty | 12 |
| 27 | Expected Number of Transaction (yearly) | `*` | text | empty | 12 |
| 28 | Agriculture Income | `*` | text | empty | 12 |
| 29 | Other Than Agricultural Income | `*` | text | empty | 12 |

#### Scheme-specific findings

`[OBSERVED]` **Fields 23 (`Is Staff`) and 25 (`Staff Id`) are unique to scheme 1003** — neither
appears in the `[REPO]` Basic Details inventories for Silver (AC23) or Normal. These are the
product's actual differentiators in the data model.

`[OBSERVED]` **`Is Staff` offers exactly one option: `YES`.** It is a mandatory dropdown with
a single selectable value, pre-selected. It cannot be set to anything else. `[GAP]` Presenting
a one-value mandatory dropdown as a choice is misleading; it is effectively a constant.
(Mirrors `[REPO]` Silver's Minor KYC "Select Identification Document", which likewise had only
one option.)

`[OBSERVED]` **Three fields present on 1001/1002 are ABSENT on 1003:** `Employment Type`,
`Designation/Profession`, and `Initial Funding Amount`. `[INFERRED]` 1003 substitutes
`Is Staff` + `Staff Id` for the employment-classification fields — the applicant's employment
is a given for a staff product.

`[INFERRED]` **The Employment-Type routing matrix does not apply to scheme 1003.** With no
Employment Type field, `[REPO]` RULE_23 (→ Salaried Information) and RULE_24 (→ Self Employed
Information) have no input to evaluate, and `[REPO]` BUG-SILVER-005 ("Employment type is
invalid for Minor") cannot arise. **Not directly demonstrated** — Basic Details was not
submitted (see §4.15) — so the actual post-Basic-Details destination for 1003 is
`[NOT VERIFIED]`.

`[OBSERVED]` **`Spouse / Father's Name` has `maxLength: 20`** — reproducing `[REPO]`
BUG-SILVER-003 on scheme 1003. Two differences from Silver: on 1003 the field is **not**
marked mandatory, and the cap is a hard `maxlength` (the browser refuses the 21st character)
rather than post-submission truncation. The substance of the defect stands: 20 characters is
unrealistically short for a full name and no counter or hint warns the user. See D-24.

`[OBSERVED]` `Mode of Operation` offers 8 options: `Self`, `Either or Survivor`,
`Former or Survivor`, `Jointly`, `Guardian`, **`Any Two Jointhly`**, `Jointly With Others`,
`Any One`. The typo `Any Two Jointhly` reproduces `[REPO]` Silver TC-SIL-083 on 1003 (D-10).

`[DEFECT]` The list is **not filtered by customer type**: `Jointly`, `Guardian`,
`Jointly With Others` and `Any Two Jointhly` are all offered on a scheme that is
Individual-only and has no Account Type step. `[REPO]` Silver enforces a Mode-of-Operation ↔
Account-Type rule; whether 1003 rejects a Joint/Guardian mode on submit is `[NOT VERIFIED]`.
See D-25.

---

### 4.14.1 — Pass 4: Basic Details completed; stages 8 and 9 reached

Basic Details was completed in one continuous pass with synthetic data and submitted
successfully, advancing the workflow two further stages.

**Test data used (recorded for reproducibility).** Name and Date of Birth were left as
auto-populated from eKYC and are not reproduced here (PII).

| Field | Value |
|---|---|
| Mode of Operation | `Self` |
| Prefix | `Mr` |
| Gender | `Male` |
| Email ID | `qatestuser@example.com` |
| Marital Status | `Unmarried` |
| Father First / Middle / Last Name | `Testfather` / `Qatest` / `Testsurname` |
| Mother's Name | `Testmother Testsurname` |
| Spouse / Father's Name | typed `Testfather Testsurname XY` (25 chars) |
| Religion | left blank (optional) |
| Caste Category | `General` |
| Politically Exposed Person | `None` (default) |
| Person with Disabilities | `No` (default) |
| Education/Qualification | `Graduate` |
| Country of Tax Residence is India | `Yes` (default) |
| Region | `Metropolitian City` |
| **Is Staff** | `YES` (only option) |
| Funding Mode | `Cash` |
| **Staff Id** | `STAFF0001` |
| Expected Value / Number of Transaction (yearly) | `500000` / `120` |
| Agriculture Income / Other Than Agricultural Income | `0` / `600000` |

`[OBSERVED]` Submission succeeded and advanced to **Salaried Information**.

`[OBSERVED]` **All dropdowns reset to their unselected placeholder when the step is
revisited**, even where a value had been chosen in an earlier session — confirming `[REPO]`
that this form does not persist partial progress and must be completed in one pass.

#### D-24 characterised precisely

`[OBSERVED]` `Spouse / Father's Name` was given 25 characters and stored exactly **20**
(`Testfather Testsurna`). This is an **enforced `maxLength="20"`** — the browser refuses the
21st character as typed — **not** post-submission truncation. No counter, hint or message
warns the user.

`[OBSERVED]` **The cap applies to this field alone.** `Mother's Name` accepted 22 characters
(`Testmother Testsurname`) without truncation, and all other name fields carry `maxLength`
100. D-24 is therefore a single-field defect, not a family-wide one.

#### `Is Staff` and `Staff Id` — the scheme's differentiators

`[OBSERVED]` **`Is Staff`** is a mandatory dropdown that is **pre-selected to `YES` on load**
and whose option list contains **exactly one entry, `YES`**. It cannot be cleared or set to
any other value; opening it offers only the value already selected. The control is therefore
**decorative** — it conveys a constant while presenting itself as a choice. `[GAP]` It should
be a read-only display or removed; as a mandatory single-option dropdown it adds interaction
cost and implies a decision that does not exist.

`[OBSERVED]` **`Staff Id`** is a free-text field, `maxLength: 100`, with **no format mask, no
pattern validation and no lookup**. `STAFF0001` was accepted, and **no network request was
issued when the field was completed or when the step was submitted beyond the ordinary Basic
Details save** — so it is **not checked against any staff master or employee register** at
this stage. `[DEFECT]` For the one field that establishes entitlement to a staff-only product,
accepting arbitrary text unvalidated is a meaningful control weakness. See D-27.

`[NOT VERIFIED]` Whether `Staff Id` is validated later (at approval/decisioning) — that
workflow is out of scope.

#### D-25 partially answered

`[OBSERVED]` `Mode of Operation` offers all 8 options — `Self`, `Either or Survivor`,
`Former or Survivor`, `Jointly`, `Guardian`, `Any Two Jointhly`, `Jointly With Others`,
`Any One` — on a scheme with no Account Type step and a fixed Individual customer type. The
four multi-holder/guardian options are **selectable**.

`[NOT VERIFIED]` **Whether an inappropriate mode is accepted on save.** `Self` was chosen, so
the journey could proceed; deliberately submitting `Jointly` would have required a second
full 29-field pass to recover (the form discards partial progress). D-25 therefore remains
"inappropriate options are offered", not "inappropriate options are stored".

#### Master-data quality observed in Basic Details dropdowns

| Dropdown | Count | Issue |
|---|---|---|
| Prefix | 10 | `Mr`, `Ms`, `Mrs`, `Dr`, `Shrimati`, `Kumari`, `Baby`, `Master`, `Miss`, `Shri` — mixes English and Hindi honorifics inconsistently |
| Gender | 2 | `Female`, `Male` only — no third/undisclosed option |
| Marital Status | 8 | Includes both `Widowed` and `Widower` |
| Caste Category | 4 | `SC`, `ST`, `OBC`, `General` |
| Education/Qualification | 6 | Contains **`MS computers`** — reads as stray test data in a live master list |
| Region | 4 | Contains the typo **`Metropolitian City`** (should be "Metropolitan") — reproduces `[REPO]` Silver TC-SIL-083 on 1003 |
| Mode of Operation | 8 | Contains the typo **`Any Two Jointhly`** — also reproduces on 1003 |

`[DEFECT]` `MS computers` in a production Education/Qualification list, and the two typos, are
folded into D-10 / new D-28.

---

### 4.14.2 — Salaried Information (module sequence 8)

**Reached by:** submitting Basic Details
**Snapshot taken:** yes

`[OBSERVED]` Basic Details on scheme 1003 routes to **Salaried Information** — despite 1003
having **no Employment Type field at all**. The routing is therefore **unconditional** on this
scheme (or driven by the fixed `Is Staff = YES`), not by an Employment Type selection.

`[INFERRED]` This confirms the earlier inference in a stronger form: the `[REPO]`
Employment-Type routing matrix (RULE_23/RULE_24) and `[REPO]` BUG-SILVER-005 ("Employment type
is invalid for Minor") **cannot arise on 1003**, because there is no Employment Type input to
evaluate. Not directly demonstrated — no alternative routing exists on 1003 to contrast against.

#### Fields

| Field | Mandatory | Type | Default |
|---|---|---|---|
| Category | **none** | dropdown | `Select Category` |
| Organization's Name | **none** | text | empty |
| **Designation/Profession** | `*` | dropdown | `Select Designation/Profession` |
| Annual Income | **none** | text | **`0.00`** |
| Source of Income | **none** | text | empty |

`[OBSERVED]` **Only `Designation/Profession` is mandatory on this step.**

`[OBSERVED]` **CORRECTION to §4.14.** `Designation/Profession` is **not absent from scheme
1003** — it is **relocated** from Basic Details (where 1001/1002 place it) to Salaried
Information, and it is **mandatory** here. The earlier `[INFERRED]` claim that 1003 omits it
was wrong and is retracted.

`[OBSERVED]` Still genuinely absent from 1003: **`Employment Type`** and
**`Initial Funding Amount`** — neither appears on Basic Details nor on Salaried Information.

`[OBSERVED]` `Category` offers 5 options: `Central Government Employee`,
`State Government Employee`, `Public Sector Undertaking (PSU)`,
`Defence Services (Army, Navy, Air Force)`, `Private Sector Employee – Corporate / MNC` —
matching the `[REPO]` Silver list.

`[OBSERVED]` `Designation/Profession` offers **83 options** and contains **visible duplicates**:
`Shop Owner`, `Hotel Owner`, `Dairy Farmer` and `Labourer` each appear **twice**.
`[DEFECT]` See D-28.

`[OBSERVED]` `Annual Income` is pre-populated with `0.00` while carrying no mandatory marker —
so the step can be submitted recording a zero income for a salaried applicant without any
prompt. `[GAP]` For a salary-linked product, an unvalidated zero-defaulted income is a weak
default.

**Test data used:** Category `Private Sector Employee – Corporate / MNC`, Organization's Name
`Testcorp QA Solutions Pvt Ltd`, Designation/Profession `Private Company Employee`,
Annual Income `600000`, Source of Income `Salary`.

`[OBSERVED]` Submission succeeded and advanced to **Applicant Photo**.

---

### 4.14.3 — Applicant Photo (module sequence 9) — **JOURNEY BLOCKED HERE**

**Reached by:** submitting Salaried Information
**Snapshot taken:** yes

#### Fields

| Field | Mandatory | Control(s) offered |
|---|---|---|
| Applicant Name | `*` | text, **disabled**, auto-filled from eKYC |
| Upload Applicant Photo | `*` | `Capture Using Camera` **OR** `Capture Using Camera` + `Verified Photo` |
| Upload Applicant Signature | `*` | `Capture Using Camera` **OR** `Capture Using Camera` |

`[DEFECT]` **"Capture Using Camera" is rendered twice on both controls**, where every other
upload point in this journey renders "Browse Computer or drag and drop … OR … Capture Using
Camera". The Browse option is missing/duplicated-over. This **reproduces `[REPO]` Silver's UI
defect on scheme 1003**. See D-29.

`[OBSERVED]` **There is no `<input type="file">` anywhere on this step** (verified:
`document.querySelectorAll('input[type="file"]').length === 0`). Neither Photo nor Signature
offers any file-upload fallback — camera capture is the only path, and Signature has no
"Verified" alternative either.

#### Verified Photo sub-flow

`[OBSERVED]` `Verified Photo` opens a popup titled **`Verified Photo`** containing a
`Select Verified Photo *` dropdown, `Cancel`, and a `Submit` that is **correctly disabled
until a source is chosen** — good state-aware UI, and the only control in this journey
observed to gate its Submit on input.

`[OBSERVED]` The dropdown offers **two sources: `Aadhaar Verification Photo` and
`Liveliness Verification Photo`** — confirming both upstream verifications produced reusable
images. `POST applicant/photo/get/verify/module/list` → 200 backs it.

`[OBSERVED]` Selecting `Aadhaar Verification Photo` rendered the actual image thumbnail
(`temp:digilocker_<uuid>.jpg`) with a pre-checked checkbox and the message
**`Only one image available — auto-selected.`** — matching `[REPO]` Silver.

`[OBSERVED]` **The popup's Submit does not complete.** Clicking it produced **no network
request, no console error, and did not close the popup**; the step remained unchanged across
repeated clicks. This reproduces the `[REPO]` automation note that this popup requires the
browser context to pre-grant `geolocation` (and `camera`) permissions, without which its
Submit silently fails to register.

#### Pass 5 — permission grant attempted; root cause isolated

Three escalating attempts were made to clear this gate without restarting the browser.

**Attempt 1 — grant permissions in the live context.** Via Playwright:
```js
await context.grantPermissions(['camera','geolocation'], { origin: 'https://sahyogagentweb.drutam.in:9634' });
await context.setGeolocation({ latitude: 19.9975, longitude: 73.7898 });
```
`[OBSERVED]` `navigator.permissions.query` then returned `camera: "granted"`,
`geolocation: "granted"`, and `getCurrentPosition` resolved successfully.

`[OBSERVED]` **This unblocked the Verified Photo flow outright.** The Upload Applicant Photo
control changed to **`Document Uploaded`** without any further interaction — the previously
"dead" popup Submit had in fact been processed once permissions existed.

`[OBSERVED]` **CORRECTION to D-29.** The Verified Photo popup's Submit is **permission-gated,
not defective**. Before the grant it fired no request and did not close; after the grant the
photo registered. The earlier reading — that the Submit might be separately broken — is
**retracted**. What remains of D-29 is only the missing Browse option and the duplicated
"Capture Using Camera" label (below), which are genuine UI faults independent of permissions.

**Attempt 2 — capture the signature from a real device.** `[OBSERVED]` Not possible: the
browser context exposes **no video input device at all**.
```
navigator.mediaDevices.enumerateDevices() → audioinput, audiooutput only; videoInputs: 0
navigator.mediaDevices.getUserMedia({video:true}) → NotFoundError: Requested device not found
```
A trusted (Playwright-generated) click on the signature's `label.btn` produced **no `<video>`
and no `<canvas>` element** — the capture UI cannot open because there is no camera to open.

**Attempt 3 — is the block environmental or an application defect?** `[OBSERVED]`
**Unambiguously environmental.** `getUserMedia` fails at the browser/OS layer with
`NotFoundError` before any application code runs. The application is not at fault for the
signature capture failing here.

`[OBSERVED]` Submitting the step with the photo registered but no signature is correctly
rejected, client-side, with the verbatim message:
> `Upload Applicant Signature is required`

confirming Signature is genuinely mandatory and that photo alone is insufficient.

#### Why the journey stops here

`[NOT VERIFIED]` **Applicant Photo cannot be completed in this environment.** The sole
remaining blocker is that **Signature is camera-capture-only with no file-upload fallback**,
and this browser context has **no camera device** (`videoInputs: 0`). This is a **device
gate, not an application defect** — proven at the `getUserMedia` layer.

This is a **fourth human/device gate**, after the SMS OTP, DigiLocker consent and Liveliness
check.

**To clear it, a follow-up session needs the MCP browser launched with**
`--use-fake-device-for-media-stream --use-fake-ui-for-media-stream` (which synthesises a video
input device), **plus** `permissions: ['geolocation','camera']`. The permissions alone are
**not** sufficient — they were granted successfully here and the signature still could not be
captured, because the device itself is absent. Alternatively, a human operator with a real
webcam can complete the step.

---

### 4.15 — Stages beyond Applicant Photo — **NOW REACHED (Pass 6)**

**Status: RESOLVED.** The blocker described in earlier passes is cleared. All remaining
stages were reached and documented this pass. The authoritative stage list, read from the
server (`introducer/save/details` → `aosStepList`, §8 N-30), is:

| `aosModuleSequence` | `stepCode` | Step name | `isEditable` | `skipAllowed` |
|---|---|---|---|---|
| 1 | `MOBILE_VERIFICATION` | Mobile Number Verification | 0 | 0 |
| 2 | `EKYC_VERIFICATION` | eKYC Verification | 0 | 0 |
| 3 | `EXISTING_CUSTOMER_DATA` | Existing Customer Data | 0 | 0 |
| 4 | `LIVELINESS_VERIFICATION` | Liveliness Verification | 0 | 0 |
| 5 | `ADDR_VERIFICATION` | Address Details | **1** | 0 |
| 6 | `BRANCH_SELECTION` | Branch Selection | 0 | 0 |
| 7 | `INDIV_BASIC_INFORMATION` | Basic Details | **1** | 0 |
| 10 | `SALARIED_INFORMATION` | Salaried Information | 0 | 0 |
| 11 | `APPLICANT_PHOTO` | Applicant Photo | **1** | 0 |
| 12 | `NOMINEE_INFORMATION` | Nominee Details | **1** | 0 |
| 13 | `APPL_DOCUMENT` | Document Upload | **1** | **1** |
| 15 | `INTRODUCER_DETAILS` | Introducer Details | 0 | 0 |
| 16 | `LEAD_DETAILS` | Lead Details | **1** | 0 |
| — | *(no `stepCode`)* | Summary | — | — |

`[OBSERVED]` **The stepper's displayed position and the server's `aosModuleSequence` do not
match.** Applicant Photo is the 9th tab but `aosModuleSequence: 11`. Sequences **8, 9 and 14
are absent** from 1003 — they are configured on the workflow but not applicable to this
scheme. Any test asserting on a numeric stage index must use the tab position, not the
sequence, or read the sequence from the API.

`[OBSERVED]` **`Document Upload` is the only step in the entire 1003 journey with
`skipAllowed: 1`.** Every other step is `skipAllowed: 0`. This is a deliberate server-side
configuration, not an oversight in the UI — see §4.17 and D-35.

`[OBSERVED]` **13 steps are followed by a Summary screen**, which is *not* itself a workflow
step — it has no `stepCode` and does not appear in `aosStepList`.

**Correction to earlier passes.** §10.1 item 5 previously recorded the sequence as ending at
"9 Applicant Photo". That list was a UI-tab reading and is superseded by the table above.

---

### 4.16 — Applicant Photo cleared (Pass 6)

#### 4.16.1 — Nothing from Pass 5 had persisted

`[OBSERVED]` On resuming `SAH-1003-812` via Dashboard → View, the Applicant Photo step
rendered **both** upload controls in their initial capture state, not as `Document Uploaded`.
`POST applicant/photo/get/doc` returned **HTTP 200** with:

```json
{"applicantPhotoUuid":null,"photoScanDocId":null,"signatureScanId":null,
 "resultVo":{"msgCode":"500","msgDescr":"No record found!","isError":true,"success":"FALSE"}}
```

`[OBSERVED]` **Document registration is client-side until the step's own Submit succeeds.**
Because Pass 5 could never submit the step (no signature), the photo it had registered was
discarded. Both images had to be captured again this pass.

`[OBSERVED]` This call also demonstrates D-03 again, in a sharper form: a **legitimately
empty** state (no photo saved yet, on a step the user has not completed) is reported as
`msgCode: "500"`, `isError: true`, `"No record found!"` inside an HTTP 200. This is a normal
condition being signalled as a server error.

`[OBSERVED]` `document.querySelectorAll('input[type="file"]').length === 0` on this step —
**D-29 reproduces exactly.** No file-upload fallback exists for either control.

#### 4.16.2 — The camera device, and the signature capture

`[OBSERVED]` With the `playwright-camera` server the context exposes exactly one video input:

```
enumerateDevices() → videoinput: "fake_device_0"   (videoinputs: 1)
getUserMedia({video:true}) → resolved, label "fake_device_0",
                             settings { width:640, height:480, frameRate:20 }
```

No permission prompt appeared — `camera` was pre-granted. This is the precise condition Pass 5
identified as missing.

`[OBSERVED]` Clicking `Capture Using Camera` under **Upload Applicant Signature** opened a
modal dialog titled **`Capture Image`** containing, in order:

| Element | Value observed |
|---|---|
| `Address:` | `1777, near DCB Bank, Lower Parel, Friends Colony, Kurla West, Kurla, Mumbai, Maharashtra 400070, India` |
| `Latitude:` | `19.076` |
| `Longitude:` | `72.8777` |
| `Date Time:` | `Tue Aug 18 2026 10:57:50 GMT+0530 (India Standard Time)` |
| Control | `Capture photo` button |
| Control | `Close` (X) |

`[OBSERVED]` The dialog **reverse-geocodes the browser's geolocation before any photo is
taken**, via `POST aos/location/capture/fetch/address` → 200. The live `<video>` element
reported `videoWidth 500 × videoHeight 450`, `readyState 4`, `paused false` — i.e. the app
requests 500×450, not the device's native 640×480.

`[OBSERVED]` Clicking `Capture photo` closed the dialog immediately and the Signature panel
changed to **`Document Uploaded`**. The image was posted to
`POST sahyogDocumentDbModule/doc/n/image1` → 200.

> ⚠️ **The captured signature is a SYNTHETIC fake-device video frame** — Chromium's rolling
> test pattern, not a handwritten signature. `SAH-1003-812` therefore carries an image in the
> signature slot that is not a signature at all. This is recorded explicitly for any later
> data-quality review, and is a direct consequence of the test method, **not** an application
> defect.

`[OBSERVED]` **No thumbnail or preview is rendered after capture** — the panel shows only the
words `Document Uploaded`. The agent cannot see what was captured, cannot confirm it is
legible, and no retake control is offered. `[GAP]` / see D-36.

#### 4.16.3 — The photo, via Verified Photo

`[OBSERVED]` The `Verified Photo` popup behaved exactly as Pass 5 recorded, confirming that
finding: Submit **disabled** until a source is chosen; dropdown offers
`Aadhaar Verification Photo` and `Liveliness Verification Photo`; selecting Aadhaar rendered
the thumbnail `temp:digilocker_<uuid>.jpg` with a pre-checked checkbox and the message
`Only one image available — auto-selected.`; Submit then enabled and closed the popup, and the
Photo panel became `Document Uploaded`.

`[OBSERVED]` This is the **only Submit control observed anywhere in the 1003 journey that is
correctly gated on its input.**

#### 4.16.4 — Step submit, and what is stored

`[OBSERVED]` `POST applicant/photo/save/doc` → 200, `"Details saved successfully!"`. Request
body (abridged, PII removed):

```json
{"photoScanDocId":"6a82d6a52c5e881e0c37a7ec",
 "signatureScanId":"6a83ee442c5e881e0c37a7f7",
 "lat":19.076,"lng":72.8777,"signatureLat":19.076,"signatureLng":72.8777,
 "applicantPhotoAddress":"…Kurla, Mumbai, Maharashtra 400070, India,19.076,72.8777",
 "applicantSignatureAddress":"…Kurla, Mumbai, Maharashtra 400070, India,19.076,72.8777",
 "photoReferenceFrom":"Aadhaar Verification Photo",
 "verificationReqVO":{"currentModuleCode":"APPLICANT_PHOTO","currentModuleSequence":11,…}}
```

`[OBSERVED]` **Both images are geo-stamped and address-stamped**, and the provenance of the
photo is recorded (`photoReferenceFrom`). The lat/lng is stamped **per image** — photo and
signature carry independent coordinate pairs.

`[OBSERVED]` **No consistency check exists between the capture location and any other address
on the application.** The capture geolocation resolves to **Mumbai**, the applicant's
(fabricated) permanent address is **Abohar**, and the selected branch is in **Gondiya**. All
three are mutually inconsistent and the step saved cleanly. `[GAP]` — extends the
identity/address gap already recorded at §4.12.1.

`[OBSERVED]` Submission advanced the workflow to **Nominee Details**.

---

### 4.17 — Nominee Details (module sequence 12) — **NEW**

**Reached by:** submitting Applicant Photo
This step has **two pages**: `Nominee Details` and `Address Details (Nominee)`.

#### Page 1 — Nominee Details

| Field | Element | Mandatory | Type | maxLength | Notes |
|---|---|---|---|---|---|
| Full Name | `input[name="nominee_name"]` | `*` | text | 255 | |
| Relation of nominee with applicant | PrimeReact dropdown | `*` | list | — | 17 options, from `GET relation/app/getRelationList` |
| Date of Birth | `input[name="nominee_dob"]` | `*` | **`type="date"`** | — | `min="1900-01-01"`, `max="2026-08-18"` (today) |
| Age ( In Years ) | `input[name="nominee_age"]` | none | text | 100 | **disabled**, computed, defaults `0` |

`[OBSERVED]` **There is no opt-out.** No "no nominee" checkbox, no skip control, and
`skipAllowed: 0` server-side. A nominee is unconditionally mandatory to open the account.
`[GAP]` Nomination is normally a customer right that may be declined; no path to decline
exists.

`[OBSERVED]` **Empty submit flags all three mandatory fields simultaneously**, verbatim:
> `Full Name is required`
> `Relation of nominee with applicant is required`
> `Date of Birth is required`

`[OBSERVED]` **This CONTRADICTS D-08**, which recorded mandatory errors surfacing one at a
time. D-08 holds for the eKYC PAN and DL popups but **not** for this step. D-08 is therefore
narrowed from a form-validation platform behaviour to a **step-specific** one — see §10.3.

**Relation master data — 17 options, verbatim, in returned order:**
`Wife`, `Grand Father`, `Daughter`, `Grand Mother`, `Others`, `Natural Guardian`, `Son`,
`Father`, `Mother`, `Brother`, `Sister`, `No Relation`, `Husband`, `Business Associate`,
`Spouse`, `Parent`, `Sibling`

`[DEFECT]` The list is **unsorted** and contains **three overlapping pairs/triples**:
`Wife`/`Husband` vs `Spouse`, `Father`/`Mother` vs `Parent`, `Brother`/`Sister` vs `Sibling`.
It also offers `No Relation` and `Business Associate` for a *nominee*. Two agents recording
the same relationship will pick different values, making the field unusable for reporting.
See D-37.

#### Age computation — a real defect

`[OBSERVED]` `Age ( In Years )` is computed client-side from DOB and rendered **fractionally
to two decimal places**: DOB `1990-05-15` → `36.03`; DOB `2020-01-01` → `6.07`. A person's age
in years is an integer; `36.03` is not a meaningful age. See D-30.

`[OBSERVED]` **A future DOB is accepted by the application's own handler.** Setting
`2030-01-01` (which the browser flags `validity.rangeOverflow === true` against the field's own
`max`) produced **`Age = -4.07`** — a negative age — with no error and no correction. The
`max` attribute is present but the React change handler does not enforce it. See D-30.

`[NOT VERIFIED]` **Whether the server rejects a future nominee DOB on save.** Deliberately not
tested: submitting would have persisted a corrupt nominee onto the live application being used
to reach Summary, and nominee edits were not proven recoverable at that point. The client-side
fault above is `[OBSERVED]`; server enforcement is unknown.

#### Minor nominee → guardian sub-form (business rule)

`[OBSERVED]` Setting a DOB that makes the nominee a minor (`2020-01-01`, age `6.07`)
**dynamically revealed five additional mandatory fields**:

| Field | Element | Mandatory |
|---|---|---|
| Guardian Name | `input[name="guardian_name"]` | `*` |
| Relation of guardian with nominee | dropdown | `*` |
| Guardian Address | `textarea[name="guardian_address"]` | `*` |
| Guardian Date of Birth | `input[name="guardian_dob"]` | `*` |
| Guardian Age | `input[name="guardian_age"]` | `*` |

`[OBSERVED]` Restoring an adult DOB **collapsed the guardian block cleanly**, with no residue.
This is a **correctly implemented, correctly reactive business rule** — one of the better
behaviours observed in this journey.

**Test data used (synthetic):** Full Name `Testnominee Qatest`, Relation `Brother`,
DOB `1990-05-15` (→ Age `36.03`).

`[OBSERVED]` `POST aos/nominee/save/details` → 200, advancing to page 2.

#### Page 2 — Address Details (Nominee)

`[OBSERVED]` Renders a `Registered Address *` panel with a single
`Click Here For Add Address` link. Opening it presents a `Registered Address` popup with a
**checked-by-default `Use Existing Address` checkbox**, and two fields not present on the
applicant's own address form:

| Field | Value pre-filled |
|---|---|
| Address Source `*` | `Applicant - <applicant name>` |
| Address Type `*` | `Permanent address` |

`[OBSERVED]` Every address field was **pre-populated from the applicant's permanent address** —
`Flat 101, Testview Apartments` / `Plot 42, QA Industrial Layout` / `Automation Nagar` /
`India` (disabled) / `Maharashtra` / `Abohar` / `422001`.

`[OBSERVED]` **D-16 propagates.** The impossible `Maharashtra` + `Abohar` pair is copied into
the nominee's address record unchallenged, so one bad master-data entry now contaminates two
records on the same application.

`[OBSERVED]` **Two further faults on this popup:**

1. `<input name="422001">` — the Pin Code input's **`name` attribute is set to its *value***
   rather than a field name. Every other field on the form uses a proper name
   (`address_line1`, `area`, `country`). See D-33. Also an automation gotcha: this selector
   changes whenever the data changes.
2. The `Upload Address Proof` control renders **`Browse Computer` twice** —
   "Browse Computer or drag and drop … OR … Browse Computer" — with no camera option, where
   the applicant's equivalent control offers Browse OR Capture. This is the **same duplicated-
   label bug as D-29**, with the labels duplicated the other way round, confirming the fault is
   a shared component defect rather than an Applicant-Photo-specific one. See D-29 (scope
   widened).

`[OBSERVED]` `accept=".png,.jpg,.pdf"` here — **no `.camera`**, unlike the applicant's
`.png,.jpg,.pdf,.camera`. A third distinct accept string across three controls (cf. D-06).

`[OBSERVED]` Saving (`aos/address/save/editable/details` → 200,
`aos/address/final/submit/details` → 200) rendered the address as read-only text, matching the
applicant address behaviour (P-07: no edit affordance once saved).

---

### 4.18 — Document Upload (module sequence 13) — **NEW**

**Reached by:** submitting Address Details (Nominee)

`[OBSERVED]` Contents: a heading `Select Applicant Document`, **two** `Select` dropdowns, one
upload widget, and a `+ Add Custom Document` button.

`[OBSERVED]` The upload widget here renders **correctly** —
"`Browse Computer` or drag and drop … OR … `Capture Using Camera`" — which is the intended
pattern. This confirms D-29 (Applicant Photo) and the nominee-address variant (§4.17) are
**anomalies against the platform's own correct control**, not the norm.

#### The step is fully skippable

`[OBSERVED]` **Clicking `Submit` with zero documents selected and zero files attached
advanced the workflow straight to Introducer Details.** No warning, no confirmation, no
"are you sure" — the step simply completed empty.

`[OBSERVED]` This is **by server-side design**, not a UI slip: `APPL_DOCUMENT` is the **only**
step in the 1003 workflow carrying `skipAllowed: 1` (§4.15).

`[OBSERVED]` The Summary screen later renders the `Document Upload` section as a **bare
heading with nothing beneath it** (§4.20.3) — the reviewer is given no statement that zero
documents were attached.

`[DEFECT]` For a KYC-regulated savings product this is a material control weakness, and it
compounds with **D-05** (document uploads never register at all): on scheme 1003 an
application can reach final submission with **no supporting documents whatsoever**, and the
review screen does not draw attention to it. See D-35.

`[NOT VERIFIED]` The contents of the two `Select` dropdowns and the `+ Add Custom Document`
sub-flow — not opened, because exercising uploads is blocked by D-05 and the objective was
Summary.

---

### 4.19 — Introducer Details (module sequence 15) — **NEW**

**Reached by:** submitting Document Upload

| Field | Element | Mandatory | maxLength | Validation |
|---|---|---|---|---|
| Introducer's Name | `input[name="introducer_name"]` | `*` | 255 | none client-side |
| Introducer Account Number | `input[name="introducer_bank_acc"]` | `*` | **255** | none client-side |
| Period of Acquaintance | `input[name="introducer_period"]` | `*` | 255 | none client-side; **free text** |

`[OBSERVED]` **Empty submit flags all three simultaneously** (`Introducer's Name is required`,
`Introducer Account Number is required`, `Period of Acquaintance is required`) — a second
contradiction of D-08.

`[OBSERVED]` `Period of Acquaintance` is **unconstrained free text** — `5 years` was accepted;
there is no unit, no numeric field, no picker. Any string is storable in a field a reviewer is
expected to assess. `[GAP]`

#### The account number IS checked against CBS — but failures are silent

`[OBSERVED]` Submitting a deliberately invalid account number (`ABC!@#$%^&*()_+`, retained
verbatim by the field — **no client-side sanitisation**) produced
`POST introducer/save/details` → **HTTP 200** with:

```json
{"resultVO":{"msgCode":"503","msgDescr":"CBS connection error",
             "isError":true,"success":"FALSE"},
 "bankAccountUserName":null,"introducerCustomerId":null,"isNameMismatch":0}
```

`[OBSERVED]` **The UI displayed absolutely nothing.** No message, no toast, no field
highlight, no console error (0 errors across the whole session). The step did not advance and
the Submit button simply returned to its idle state. A user would see a click that did nothing
and have no idea why. See **D-31** — this is the most user-hostile failure mode found in the
journey.

`[OBSERVED]` The response shape (`bankAccountUserName`, `introducerCustomerId`,
`isNameMismatch`) proves the account number is **resolved against the Core Banking System and
name-matched** against the entered Introducer's Name. This is a genuine integration, not a
free-text field — which makes the silent failure worse, because the one field with real
back-end validation gives the least feedback.

`[OBSERVED]` Re-submitting with a **valid** account number (supplied by the stakeholder
mid-session; not reproduced here — third-party account data) returned
`{"msgCode":"200","msgDescr":"Details saved successfully!","isNameMismatch":0}` and advanced
to Lead Details.

`[OBSERVED]` `bankAccountUserName` came back **`null`** even on success, while
`isNameMismatch: 0` asserted the names match. A null name cannot meaningfully match anything;
the flag appears to default to 0 rather than reflect a real comparison. `[INFERRED]` the
name-mismatch control may not actually be enforcing. See D-32.

`[NOT VERIFIED]` Whether a genuine name mismatch (valid account + wrong name) sets
`isNameMismatch: 1` and how the UI reacts — would require a second real third-party account.

---

### 4.20 — Summary (final screen) — **REACHED**

**Reached by:** submitting Lead Details
**Loaded by:** a single call — `POST app/get/aosRequest/summary` → 200
**Screenshot:** `.playwright-mcp/STAFF_TS001-summary-screen.png` (full page)

#### 4.20.1 — Lead Details (module sequence 16), the step immediately before

| Field | Element | Mandatory | maxLength | Control |
|---|---|---|---|---|
| Lead Converter Code | `input[name="lead_converter_code"]` | `*` | 255 | + `Verify` button |
| Sourcer Code | `input[name="lead_generator_code"]` | `*` | 255 | + `Verify` button |

`[OBSERVED]` Each code must be **verified before the step can be submitted**.
`POST lead/details/verify` → 200 resolves the code to a staff name, which is then displayed as
`Name: <staff name>`, the input becomes `disabled`, and the `Verify` button is replaced by
**`Change`**. This is a well-implemented verify-and-lock pattern.

`[OBSERVED]` **Verifying the first code silently cleared the second.** Both fields were
populated, then `Verify` was clicked on Lead Converter Code; afterwards
`lead_generator_code.value === ""`. The typed value was destroyed with no warning. This is the
**same class of fault as D-20** (Address Details pin code) — a populated field wiped by an
unrelated interaction in the same form. See D-34.

`[OBSERVED]` **The same code was accepted for both roles.** `SAH09078` verified successfully
as *both* Lead Converter and Sourcer, resolving to the same staff name in both slots, and the
step submitted cleanly. No separation-of-duties rule is enforced between the person who
sourced the lead and the person who converted it. `[GAP]` — see D-38.

#### 4.20.2 — Structure of the Summary screen

`[OBSERVED]` The Summary renders **13 sections**, one per workflow step, in workflow order.
The backing payload is a single JSON string field, `summaryDataJson`, containing an array of
13 module objects, each `{moduleName, moduleCode, moduleType, moduleData}`; each `moduleData`
entry is `{subModuleName, subModuleType, subModVerified, subModuleData[], subModuleDocumentData[]}`
and each field is `{keyName, keyValue, valueType, verified}`.

`[OBSERVED]` `subModuleType` takes three values: `title` (a labelled sub-section with no
fields), `formData` (key/value list), `listModuleData` (tabular, used for Nominee).

#### 4.20.3 — Full field-by-field record, and comparison against what was entered

**This is the Phase 2 correctness check.** Every value below was compared against the
synthetic data recorded earlier in this log (§4.12.1, §4.14.1, §4.14.2, §4.17).

**Headline result: `[OBSERVED]` no value corruption was found. Every field that the Summary
displays matches what was entered upstream.** The findings are about **omission and
formatting**, not mistransmission.

| Section | Field | Entered (per this log) | Shown on Summary | Verdict |
|---|---|---|---|---|
| Mobile Number Verification | Mobile Number | *(applicant's)* | same | ✔ match |
| eKYC Verification | Aadhaar / PAN / DL / Voter Id | Aadhaar only succeeded | **4 bare titles, no status shown** | ⚠ see 4.20.4 |
| Existing Customer Data | CIF ID / Customer Name | *(none — new customer)* | `-` / `-` | ✔ |
| Liveliness Verification | method used | Security Code Based | 2 bare titles, no status | ⚠ see 4.20.4 |
| Address Details | Permanent address | `Flat 101, Testview Apartments , Plot 42, QA Industrial Layout , Automation Nagar , Abohar , Maharashtra , 422001 , India` | identical | ✔ (impossible pair persists) |
| Address Details | Communication Address | same as permanent | identical | ✔ |
| Branch Selection | Branch Name / ID | `AMGAON BRANCH` / `1005` | same | ✔ |
| Basic Details | Mode of Operation | `Self` | `Self` | ✔ |
| Basic Details | Prefix | `Mr` | `Mr` | ✔ |
| Basic Details | First / Middle / Last / Full name | *(from eKYC)* | consistent | ✔ |
| Basic Details | Date of Birth | *(from eKYC)* | ISO `YYYY-MM-DD` | ✔ |
| Basic Details | Gender | `Male` | `Male` | ✔ |
| Basic Details | Email ID | `qatestuser@example.com` | same | ✔ |
| Basic Details | Marital Status | `Unmarried` | same | ✔ |
| Basic Details | Father First / Middle / Last | `Testfather` / `Qatest` / `Testsurname` | same | ✔ |
| Basic Details | Mother's Name | `Testmother Testsurname` | same (22 chars intact) | ✔ |
| Basic Details | **Spouse / Father's Name** | typed 25 chars `Testfather Testsurname XY` | **`Testfather Testsurna`** | ⚠ **truncated to 20 — D-24 confirmed persisting all the way to review** |
| Basic Details | **Religion** | **left blank** (optional) | **`NA`** | ⚠ substituted, see 4.20.4 |
| Basic Details | Caste Category | `General` | `General` | ✔ |
| Basic Details | Politically Exposed Person | `None` | `None` | ✔ |
| Basic Details | Person with Disabilities | `No` | `No` | ✔ |
| Basic Details | Education/Qualification | `Graduate` | `Graduate` | ✔ |
| Basic Details | Country of Tax Residence is India | `Yes` | `Yes` | ✔ |
| Basic Details | Region | `Metropolitian City` | `Metropolitian City` | ✔ (D-28 typo persists to review) |
| Basic Details | Is Staff | `YES` | `YES` | ✔ |
| Basic Details | Staff Id | `STAFF0001` | `STAFF0001` | ✔ (unvalidated — D-27) |
| Basic Details | Funding Mode | `Cash` | `Cash` | ✔ |
| Basic Details | Expected Value of Transaction (yearly) | `500000` | `500000.00` | ✔ |
| Basic Details | **Expected Number of Transaction (yearly)** | `120` | **`120.00`** | ⚠ a **count** rendered as a 2-dp decimal; `valueType: "number"` |
| Basic Details | Agriculture Income | `0` | `0.00` | ✔ |
| Basic Details | Other Than Agricultural Income | `600000` | `600000.00` | ✔ |
| Salaried Information | Category | `Private Sector Employee – Corporate / MNC` | same | ✔ |
| Salaried Information | Organization's Name | `Testcorp QA Solutions Pvt Ltd` | same | ✔ |
| Salaried Information | Designation/Profession | `Private Company Employee` | same | ✔ |
| Salaried Information | Annual Income | `600000` | `600000.00` | ✔ |
| Salaried Information | Source of Income | `Salary` | `Salary` | ✔ |
| Applicant Photo | Applicant Name | *(from eKYC)* | same | ✔ |
| Applicant Photo | **Upload Applicant Photo** | captured | **label only — no image** (`keyValue` is a doc id, `valueType:"file"`) | ⚠ see 4.20.4 |
| Applicant Photo | **Upload Applicant Signature** | captured | **label only — no image** | ⚠ see 4.20.4 |
| Nominee Details | Full name | `Testnominee Qatest` | same | ✔ |
| Nominee Details | Status | — | `Successful` (`keyValue: "1"`) | ✔ |
| Nominee Details | **Relation / DOB / Age / Address** | `Brother` / `1990-05-15` / `36.03` / full address | **ABSENT ENTIRELY** | ⚠ see 4.20.4 |
| Document Upload | *(any)* | none attached | **section empty** | ⚠ see 4.20.4 |
| Introducer Details | Name / Account No. / Period | *(stakeholder-supplied)* / `5 years` | same | ✔ |
| Lead Details | Lead Converter Code | `SAH09078` | `SAH09078` | ✔ |
| Lead Details | Sourcer Code | `SAH09078` | `SAH09078` | ✔ |

#### 4.20.4 — What the Summary omits (the substantive findings)

`[DEFECT]` **1 — eKYC verification status is carried in the payload but not rendered.** The
API returns `subModVerified: true` for `Aadhaar Verification through DigiLocker` and
`subModVerified: false` for PAN, Driving Licence and Voter Id. **The UI renders all four
identically**, as plain sub-headings with no tick, no colour, no label. A reviewer cannot tell
from the review screen which identity checks actually passed. Same for Liveliness
(`Security Code Based` true, `Liveliness Verification` false). See D-39.

`[DEFECT]` **2 — the photo and signature are not displayed.** `keyValue` holds a document id
(`6a82d6a52c5e881e0c37a7ec`) with `valueType: "file"`, but the screen shows only the field
label with no value, no thumbnail and no link. There are **zero `<img>` elements** in the
Summary body. The last opportunity to notice that the signature is a camera test pattern
rather than a signature is therefore **absent**. See D-36.

`[DEFECT]` **3 — nominee details are materially incomplete.** Only `Full name` and `Status`
are present in the payload. The nominee's **relation, date of birth, age and entire address**
— all mandatory to capture — are **absent from the review screen**. A reviewer approving this
application cannot see who the nominee is beyond a name. See D-40.

`[DEFECT]` **4 — the Document Upload section is silently empty.** It renders as a heading with
no content and no statement that no documents were attached. See D-35.

`[DEFECT]` **5 — inconsistent null rendering.** A blank optional field renders as **`NA`**
(Religion) while blank system fields render as **`-`** (CIF ID, Customer Name). Two
conventions for "no value" on one screen. See D-41.

`[OBSERVED]` **6 — an API schema typo.** Branch Selection's fields carry
`"valueType": "charcter varying"` — misspelled — where every other section correctly reads
`"character varying"`. Cosmetic today, but it will break any consumer switching on
`valueType`. See D-41.

#### 4.20.5 — Edit affordances

`[OBSERVED]` **There are no per-section edit controls on the Summary.** No pencil icons, no
"Edit" links, no "Change" buttons anywhere in the body — the only interactive elements are the
disabled nominee `Successful` chip and the `Submit` button.

`[OBSERVED]` **Editing is done solely through the stepper tabs**, which remain clickable from
the Summary. Behaviour depends on the step's server-side `isEditable` flag:

| Step clicked | `isEditable` | Result `[OBSERVED]` |
|---|---|---|
| `Basic Details` | 1 | Opens the **full editable form**, pre-populated with saved values, with a working `Submit`. 29 inputs, only `full_name` and `dob` disabled. |
| `Branch Selection` | 0 | Opens a **read-only view** — 0 inputs, **no Submit button at all** — showing the saved branch. |

`[OBSERVED]` **Returning to the Summary works** — the `Summary` tab stays present and
selectable, and re-selecting it re-issues `app/get/aosRequest/summary`. Navigation is a clean
round trip; `redirectionalProcessing: 1` server-side.

`[DEFECT]` **Editable and locked steps are visually indistinguishable.** Every tab carries the
identical class `scroll_tab_first` (the current one adds `tab_selected`). A user cannot tell
which of the 13 steps they are able to correct without clicking each one to find out. See
D-42.

`[OBSERVED]` **Correction to §4.14.1.** That section recorded "All dropdowns reset to their
unselected placeholder when the step is revisited". **On a completed step revisited from the
Summary this is false** — `Mode of Operation`, `Prefix`, `Gender`, `Marital Status`,
`Caste Category`, `Politically Exposed Person`, `Person with Disabilities`,
`Education/Qualification`, `Country of Tax Residence`, `Region`, `Is Staff` and `Funding Mode`
**all retained their saved values**. Only `Religion` showed `Select Religion`, correctly,
because it was genuinely left blank. The earlier observation applied to an *incomplete* step
and is hereby narrowed, not retracted.

#### 4.20.6 — The Submit control — documented, NOT operated

`[OBSERVED]` Exact markup:

```html
<button type="submit">Submit</button>
```

| Property | Value |
|---|---|
| Label | `Submit` |
| `disabled` | **`false` — enabled immediately on load** |
| `aria-disabled` | absent |
| `class` | *(none — completely unstyled)* |
| Inside a `<form>`? | **No** (`closest('form') === null`) |
| What enables it | **Nothing. It is never disabled.** |

`[DEFECT]` **There are no declarations, consents, terms or acknowledgements on the Summary
screen, and nothing gates the Submit.** Verified exhaustively:

- `input[type=checkbox]` visible on the screen: **0**
- `input[type=radio]`: **0**
- inputs/textareas/selects of any kind: **0**
- regex sweep of the rendered text for `declar|consent|terms|i agree|hereby|undertak|certif`:
  **no match**

The final, irreversible act of an account-opening journey is a bare unstyled button that is
live from the moment the screen paints, with no declaration to accept, no confirmation dialog
observed prior to it, and no acknowledgement that the data has been reviewed. See **D-43**.

> ### 🛑 FINAL SUBMIT WAS NOT CLICKED
>
> Per the standing instruction, the Submit control was **inspected only**. `SAH-1003-812`
> carries a real DigiLocker-verified identity with a fabricated address, a synthetic
> camera-frame "signature", and zero supporting documents; submission would push it
> irreversibly into the approval workflow, where Cancel is the only exit and is itself
> one-way. **What happens on submit — the confirmation dialog (if any), the success screen,
> the resulting application status, and the endpoint called — is `[NOT VERIFIED]`.**

`[OBSERVED]` **Console: 0 errors and 0 warnings across all 138 messages** captured for the
entire Pass 6 session, including every step transition and the Summary load. The silent
failures documented in D-31 produce no console trace either — they are genuinely invisible.

`[OBSERVED]` `SAH-1003-812` is left **parked on the Summary screen with all 13 steps complete
and unsubmitted**, resumable via Dashboard → View.

---

## 5. Validation Probing

| # | Field | Input used | Expected | Actual | Network fired? | Verdict |
|---|---|---|---|---|---|---|
| V-01 | Mobile Number | `abcdefghij` | Rejected | Field stayed empty | No → client | Correct |
| V-02 | Mobile Number | `98!@#76$%^5432` | Digits kept or all rejected | Held `9876` — partial extraction | No → client | Correct-ish; see note |
| V-03 | Mobile Number | 10 digits | Accepted | Accepted, button revealed | No | Correct |
| V-04 | Mobile Number | 4 digits | Button visible (per repo) | **Button stayed hidden**; appeared only at 10 | No → client | **Contradicts repo** |
| V-05 | Enter OTP | stale 6-digit code | Rejected | Rejected server-side | **Yes** | Correct, but see D-03 |
| V-06 | PAN Number | *(blank)* + Submit | `required` message | `PAN Number is required` | No → client | Correct |
| V-07 | PAN Number | `12345` | Format error | Accepted, no live check | No | Deferred to submit |
| V-08 | PAN Number | `ABCDE1234FGHIJKL` | Truncate or error | Silently truncated to `ABCDE1234F` | No → client | `[DEFECT]` D-11 |
| V-09 | Upload PAN | *(blank)* + Submit, PAN filled | `required` message | `Upload PAN is required` | No → client | Correct |
| V-10 | Upload PAN | valid `.png`, all 3 paths | Accepted | **Never registered** | **No** | `[DEFECT]` D-05 |
| V-11 | DL Number | *(blank)* + Verify | `required` message | `Enter driving licence number` | No → client | Correct |
| V-12 | DL Number | `MH0000000000000000000` | Length/format error | Accepted (maxLength 50) | No | `[DEFECT]` D-12 |
| V-13 | DL Number + DOB | invalid pair | Failure message | `Driving Licence verification failed` | Yes | Correct, but see D-03 |
| V-14 | Voter Id Number | *(blank)* + Verify | `required` message | `Enter voter id number` | No → client | Correct |
| V-15 | Voter Id Number | `ZZZ0000000` | Failure message | `Voter ID verification failed` | Yes | Correct, but see D-03 |
| V-16 | *(form-level)* | blank PAN form | **All** required fields flagged | Only the first; document error appeared only after PAN was filled | No → client | `[DEFECT]` D-08 |
| V-17 | *(form-level)* | blank DL form | **All** required fields flagged | Only DL Number; DOB never flagged | No → client | `[DEFECT]` D-08 |
| V-18 | *(form-level)* Nominee | blank form + Submit | All 3 flagged | **All 3 flagged together** | No → client | Correct — **contradicts D-08** |
| V-19 | *(form-level)* Introducer | blank form + Submit | All 3 flagged | **All 3 flagged together** | No → client | Correct — **contradicts D-08** |
| V-20 | Nominee Date of Birth | `2030-01-01` (future) | Rejected — field has `max` = today | **Accepted by handler**; Age became **`-4.07`** | No → client | `[DEFECT]` D-30 |
| V-21 | Nominee Date of Birth | `2020-01-01` (minor) | Guardian block appears | 5 mandatory guardian fields revealed | No → client | Correct |
| V-22 | Nominee Date of Birth | `1990-05-15` (adult) | Guardian block hidden | Collapsed cleanly, no residue | No → client | Correct |
| V-23 | Nominee Age (derived) | any valid DOB | Integer years | **`36.03`** — fractional, 2 dp | No → client | `[DEFECT]` D-30 |
| V-24 | Introducer Account Number | `ABC!@#$%^&*()_+` | Rejected with a message | Retained verbatim; server 200 `CBS connection error`; **UI showed nothing** | **Yes** | `[DEFECT]` D-31 |
| V-25 | Introducer Account Number | valid account | Accepted | `Details saved successfully!`; CBS name resolved | **Yes** | Correct |
| V-26 | Period of Acquaintance | `5 years` | Structured/numeric | Free text, `maxLength` 255, anything accepted | No | `[GAP]` |
| V-27 | Document Upload step | nothing selected + Submit | Blocked, or warned | **Advanced silently with zero documents** | Yes | `[DEFECT]` D-35 |
| V-28 | Lead Details | verify code 1 with code 2 already typed | Code 2 preserved | **Code 2 silently cleared** | Yes | `[DEFECT]` D-34 |
| V-29 | Lead Details | same code for both roles | Rejected or warned | **Accepted for both**, same name resolved twice | Yes | `[GAP]` D-38 |
| V-30 | Summary | inspect for gating on Submit | Some declaration/consent gate | **0 checkboxes, 0 inputs, no terms text; Submit always enabled** | — | `[DEFECT]` D-43 |

**Note on V-20/V-24/V-28:** values were set programmatically with a native setter plus
`input`/`change` events, so keystroke-level sanitisers are `[INFERRED]` rather than
`[OBSERVED]`. The *outcomes* — the computed negative age, the CBS round trip, and the cleared
field — are `[OBSERVED]`, since each was read back from the rendered DOM or a captured
response.

**Note on V-02:** input `98!@#76$%^5432` contains digits `9,8,7,6,5,4,3,2` but the field
retained only `9876`. Non-digits are stripped and the remainder after the second separator
run is dropped. Because this was a programmatic `fill()` rather than keystrokes, the exact
sanitiser semantics are `[INFERRED]`; the net effect (no invalid characters persist) is
`[OBSERVED]`.

---

## 6. Business Rule Probing

| # | Rule under test | Setup | Trigger | Result | Verdict |
|---|---|---|---|---|---|
| B-01 | Applicant record is created only on OTP send, not on scheme selection | Fresh 1003 draft | Click scheme, then Send Verification Code | Header gained Applicant Id only at step 2 | **Enforced** |
| B-02 | Mobile Number becomes immutable after OTP send | Post-send | Inspect field | `disabled`; "Change Mobile Number?" offered instead | **Enforced** |
| B-03 | A completed step becomes non-editable | Post-verification | `aos/steps/getdetails` | `MOBILE_VERIFICATION isEditable: 0` | **Enforced** |
| B-04 | Steps are strictly sequential, none skippable | Fresh draft | Read stepper + step flags | One tab only; `skipAllowed: 0`, `sequencialProcessing: 1` | **Enforced** |
| B-05 | Only Aadhaar is mandatory within eKYC | Aadhaar Successful, others untouched | Step Submit | Advanced to sequence 3 | **Enforced** |
| B-06 | Scheme 1003 has no Account Type selection | Fresh 1003 draft | Complete mobile verification | Advanced straight to eKYC; `seq=2` is `EKYC_VERIFICATION` | **Confirmed absent** |
| B-07 | Customer Type is auto-assigned Individual | After eKYC | Read Dashboard row | Customer Type "Individual", never chosen | **Enforced** |
| B-08 | PAN 4th character must be `P` | — | Read field config | `field_validation: panno.charAt(3) != 'P'` | **Configured** — `[NOT VERIFIED]` in the UI, blocked by D-05 |
| B-09 | OTP send attempts are capped | — | Send, then resend | "2 attempts left" → "1 attempts left" | **Enforced** — 3 total |
| B-10 | DigiLocker link attempts are capped | — | Send link | "You have 2 attempts remaining." | **Enforced** — 3 total |
| B-11 | OTP expires server-side | Wait ~95 min | Submit stale OTP | Rejected: `OTP is expired` | **Enforced** — 15 min per config |
| B-12 | Cancel on DigiLocker popup initiates nothing | Popup open | Click Cancel | No `send/link` call; status stayed 0 | **Enforced** |
| B-13 | A minor nominee requires a guardian | Nominee DOB = `2020-01-01` | Change DOB | 5 mandatory guardian fields appear; collapse on adult DOB | **Enforced** — correctly reactive |
| B-14 | Applicant Photo + Signature are both mandatory | Photo only | Step Submit (Pass 5) | `Upload Applicant Signature is required` | **Enforced** |
| B-15 | Captured images are geo- and time-stamped | Camera dialog | Capture | lat/lng + reverse-geocoded address stamped **per image** | **Enforced** |
| B-16 | Photo provenance is recorded | Verified Photo → Aadhaar | Step save | `photoReferenceFrom: "Aadhaar Verification Photo"` | **Enforced** |
| B-17 | Documents persist only after the step's own Submit | Photo registered, step not submitted | Resume next day | `photoScanDocId: null`, `"No record found!"` | **Enforced** (by design) |
| B-18 | A nominee is unconditionally required | Nominee step | Look for opt-out | None; `skipAllowed: 0` | **Enforced** — `[GAP]` no way to decline |
| B-19 | Document Upload may be skipped entirely | Document Upload step | Submit empty | Advanced with zero documents; `skipAllowed: 1` | **Permitted by design** — see D-35 |
| B-20 | Introducer account is validated against CBS | Introducer step | Submit account no. | CBS lookup; `bankAccountUserName` / `isNameMismatch` returned | **Enforced** (but see D-31/D-32) |
| B-21 | Lead codes must be verified before submit | Lead Details | Enter + Verify | Code resolves to a staff name, input locks, `Verify`→`Change` | **Enforced** |
| B-22 | Lead Converter and Sourcer must differ | Lead Details | Same code both | **Accepted** | **NOT enforced** — D-38 |
| B-23 | Completed steps are re-editable per `isEditable` | Summary | Click stepper tabs | `isEditable:1` → editable form; `isEditable:0` → read-only, no Submit | **Enforced** |
| B-24 | A completed step retains its saved dropdown values | Summary → Basic Details | Reopen | All 12 dropdowns retained values | **Enforced** — corrects §4.14.1 |
| B-25 | Final Submit is gated on a declaration/consent | Summary | Inspect | **No gate of any kind; Submit always enabled** | **NOT enforced** — D-43 |

---

## 7. Async / State Probing

| # | Probe | Result |
|---|---|---|
| A-01 | Control disabled during in-flight request? | `[OBSERVED]` Mobile Number becomes `disabled` after OTP send. During the `existing/customer/data/submit` call the whole panel is replaced by a wait message, so no control is clickable. |
| A-02 | Double-click / double-submit prevented? | `[NOT VERIFIED]` on 1003 — not probed; the OTP attempt budget (3) made repeat submits too costly to risk. |
| A-03 | Control recovers after error without refresh? | `[OBSERVED]` **No** for the 504 case — the wait state never clears and no retry is offered (D-07). Yes for validation errors, which clear on next input. |
| A-04 | Data persists after page refresh? | `[OBSERVED]` **Yes.** Reload resumed `SAH-1003-812` with mobile verification intact and marked submitted. |
| A-05 | Navigate away mid-request → state on return? | `[OBSERVED]` Navigating to `/HOME` → `/UNPOSTED` and back left the workflow in the same stuck state; the pending call was not resumed. |
| A-06 | Direct-URL re-entry | `[OBSERVED]` `/applndetails` resumes the most recent application without going through the Dashboard. |
| A-07 | Stale-tab click after step lock | `[OBSERVED]` Clicking a locked step's tab is a silent no-op — no message explains why. |
| A-08 | Client polling behaviour | `[OBSERVED]` `aos/ekyc/get/status/dtl` polled ~every 10 s throughout the pending window, with no backoff. |

---

## 8. Network Capture

| # | Endpoint | Method | Status | Body / response shape | Triggered by | Flag |
|---|---|---|---|---|---|---|
| N-01 | `/sahyogUserManagementAPI/oauth2/token` | POST | 200 | bearer token | Login | — |
| N-02 | `/sahyogAosAPI/app/activity/list` | POST | 200 | application list | Dashboard load | — |
| N-03 | `/sahyogAosAPI/products/getUserwiseAllproducts` | POST | 200 | product list | Dashboard/scheme load | — |
| N-04 | `/sahyogAosAPI/scheme/getUserwiseAllscheme` | POST | 200 | `schemeDetailsResponseVOs[]` — for 1003: `schemeCode "1003"`, `aosSchemeUuid 16fec5a3-…7fb6`, `aosWorkflowDtlUuid "…stsa"`, `custType "I"`, `acType 10`, `interestRate 6.0` | Scheme list + search | — |
| N-05 | `/sahyogAosAPI/app/get/aosModules` | POST | 200 | module metadata | Wizard load | — |
| N-06 | `/sahyogAosAPI/aos/steps/getdetails` | POST | 200 | `aosStepList[]` with `stepCode`/`stepDesc`/`stepStatus`/`isEditable`/`nextModuleStepsVO` | Wizard load | — |
| N-07 | `/sahyogAosAPI/aos/mobile/verify/get/details` | POST | 200 | mobile-verification record incl. `otpExpiryMin`, `linkExpiryMin`, **`mobileOtp` bcrypt hash** | Stage load | ⚠ see D-02 |
| N-08 | `/sahyogAosAPI/aos/mobile/verify/save` | POST | 200 | `msgCode "MOB_VERIF_OTP"`, `"Mobile OTP sent successfully! You have 2 attempts left."`, `applicationId "SAH-1003-812"` | Send Verification Code | — |
| N-09 | `/sahyogAosAPI/aos/mobile/verify/submit/otp` | POST | **200** | `{"msgCode":"001-004","msgDescr":"Entered mobile number OTP is expired! ","isError":true,"success":"FALSE"}` | Stale OTP Submit | ⚠ **silent failure** |
| N-10 | `/sahyogAosAPI/aos/mobile/verify/send/otp` | POST | 200 | `msgCode "MOB_VERIF_OTP"`, `"OTP sent to the mobile number. You have 1 attempts left."` | Resend OTP | — |
| N-11 | `/sahyogAosAPI/aos/mobile/verify/submit/otp` | POST | 200 | `msgCode "MOB_VERIFI_SUCCESS"`, `"Mobile OTP Verification done successfully !"`; `aosStepList` shows `seq=2 EKYC_VERIFICATION` — **no Account Type** | Valid OTP Submit | — |
| N-12 | `/sahyogAosAPI/aos/ekyc/get/status/dtl` | POST | 200 | `{digilockerVerifyStatus, digiaadharVerifyStatus, voteridVerifyStatus, drlicenceVerifyStatus, finalStatus, panVerifyStatus}` | eKYC load + polling | — |
| N-13 | `/sahyogAosAPI/digilocker/get/details` | POST | **200** | `{"msgCode":"500","msgDescr":"Details are not present !","isError":true,"success":"FALSE"}` | Open Aadhaar card (pre-send) | ⚠ **silent failure** |
| N-14 | `/sahyogAosAPI/digilocker/send/link` | POST | 200 | `msgCode "DIGILOCKER_VERIF_LINK_SEND"`, `"Link sent to the mobile number. You have 2 attempts remaining."` | Send Link | — |
| N-15 | `/sahyogAosAPI/digilocker/get/details` | POST | 200 | `digilockerVerifyStatus 3`, `linkExpiryDate "…10:01:09Z"`, `linkExpiryMin 25`, `resendLinkAllowedDur 30` | Post-send | — |
| N-16 | `/sahyogAosAPI/aos/button/field/get/configuration/details` | POST | 200 | `moduleDataJson` — per-scheme field config for `scheme_code 1003` | PAN card open | — |
| N-17 | `/sahyogAosAPI/aos/pan/get/details` | POST | **200** | `{"msgCode":"500","msgDescr":"PAN Verification details are not present !","isError":true,"success":"FALSE"}` | Open PAN card | ⚠ **silent failure** |
| N-18 | `/sahyogAosAPI/aos/ekyc/get/drLicence/dtls` | POST | 200 | DL record (empty) | Open DL card | — |
| N-19 | `/sahyogAosAPI/aos/ekyc/verify/drLicence` | POST | **200** | `{"msgCode":"DRLIC_VERI_FAILED","msgDescr":"Driving Licence verification failed","isError":true,"success":"FALSE"}` | DL Verify, invalid data | ⚠ **silent failure** |
| N-20 | `/sahyogAosAPI/aos/ekyc/get/voterId/dtls` | POST | 200 | Voter record (empty) | Open Voter card | — |
| N-21 | `/sahyogAosAPI/aos/ekyc/verify/voterId` | POST | **200** | `{"msgCode":"VOTER_VERI_FAILED","msgDescr":"Voter ID verification failed","isError":true,"success":"FALSE"}` | Voter Verify, invalid data | ⚠ **silent failure** |
| N-22 | `/sahyogAosAPI/aos/ekyc/get/status/dtl` | POST | 200 | `digilockerVerifyStatus 1`, `digiaadharVerifyStatus 0`, `finalStatus 0` | After DigiLocker success | — |
| N-23 | `/sahyogAosAPI/existing/customer/data/submit` | POST | **504** | Gateway Time-out — no body | eKYC step Submit | ⚠ **5xx — upstream/transient; self-healed (§4.10.1)** |
| N-24 | `/sahyogAosAPI/aos/liveliness/status/details` | POST | **200** | `{"msgCode":"LIVELINESS_SECURITY_FAIL","msgDescr":"Request is not found for bank statement verification  !","isError":true,"success":"FALSE"}` | Liveliness step load | ⚠ **silent failure + wrong module text** |
| N-25 | `/sahyogAosAPI/aos/liveliness/save/details` | POST | 200 | `msgCode "LIVELINESS_VERIF_LINK_SEND"`, `"Link sent to the mobile number. You have 2 attempts remaining."` | Send Link (Security Code) | — |
| N-26 | `/sahyogAosAPI/aos/liveliness/get/details` | POST | 200 | `linkExpiryMin 25`, `resendLinkAllowedDur 30`, `liveSecurityVerifyStatus 0`, `livelinessVideoVerifyStatus 0`, **`photoSecuritycode` in plaintext** | Post-send | ⚠ see D-14 |
| N-27 | `/sahyogAosAPI/aos/address/get/details` | POST | 200 | `addressDtlResponseVOList[]` — `register_addr` "Permanent address" + `current_addr` "Communication Address", both with **`registeredAddrFrmApi: 0`** and all fields null | Address Details load | — |
| N-28 | `/sahyognetwinMasterDB/master/data/get/states` | **GET** | 200 | 33 state objects `{state_srno, code, state_sf, name, bankMapperCode}` | State dropdown open | ⚠ see D-15 |
| N-29 | `/sahyogAosAPI/applicant/photo/get/doc` | POST | **200** | `{"photoScanDocId":null,"signatureScanId":null,"resultVo":{"msgCode":"500","msgDescr":"No record found!","isError":true,"success":"FALSE"}}` | Applicant Photo load (nothing saved yet) | ⚠ **normal empty state reported as a 500 error** |
| N-30 | `/sahyogAosAPI/aos/location/capture/fetch/address` | POST | 200 | Reverse-geocoded address for the browser geolocation | Camera dialog open | — |
| N-31 | `/sahyogDocumentDbModule/doc/n/image1` | POST | 200 | Stores the captured frame; returns the scan doc id | `Capture photo` | — |
| N-32 | `/sahyogAosAPI/applicant/photo/get/verify/module/list` | POST | 200 | Verified-photo sources: Aadhaar + Liveliness | Verified Photo popup | — |
| N-33 | `/sahyogDocumentDbModule/doc/getDocumentById` | POST | 200 | Thumbnail bytes for the chosen verified photo | Source selected | — |
| N-34 | `/sahyogAosAPI/applicant/photo/save/doc` | POST | 200 | `photoScanDocId`, `signatureScanId`, per-image `lat`/`lng`, stamped addresses, `photoReferenceFrom` | Applicant Photo Submit | — |
| N-35 | `/sahyognetwinMasterDB/relation/app/getRelationList` | **GET** | 200 | 17 nominee relation options, unsorted, overlapping | Relation dropdown open | ⚠ see D-37 |
| N-36 | `/sahyogAosAPI/aos/nominee/get/details` | POST | 200 | Nominee record | Nominee step load | — |
| N-37 | `/sahyogAosAPI/aos/nominee/save/details` | POST | 200 | Saves nominee page 1 | Nominee Submit | — |
| N-38 | `/sahyogAosAPI/aos/address/get/copyFrom/details` | POST | 200 | Source list for `Use Existing Address` | Nominee address popup | — |
| N-39 | `/sahyogAosAPI/aos/req/doc` + `/aos/req/doc/sav` | POST | 200 | Document Upload load + save — **saved with an empty document set** | Document Upload Submit | ⚠ see D-35 |
| N-40 | `/sahyogAosAPI/introducer/save/details` | POST | **200** | *Invalid account:* `{"msgCode":"503","msgDescr":"CBS connection error","isError":true,"success":"FALSE"}` — **no UI feedback at all** | Introducer Submit | ⚠ **silent failure — D-31** |
| N-41 | `/sahyogAosAPI/introducer/save/details` | POST | 200 | *Valid account:* `{"msgCode":"200","msgDescr":"Details saved successfully!"}` + full `aosStepList[]`, `bankAccountUserName: null`, `isNameMismatch: 0` | Introducer Submit | ⚠ see D-32 |
| N-42 | `/sahyogAosAPI/lead/details/data` | POST | 200 | Lead Details step data | Lead step load | — |
| N-43 | `/sahyogAosAPI/lead/details/verify` | POST | 200 | Resolves a staff code to a name; locks the input | `Verify` | — |
| N-44 | `/sahyogAosAPI/lead/details/submit` | POST | 200 | Saves both codes | Lead Details Submit | — |
| N-45 | `/sahyogAosAPI/app/get/aosRequest/summary` | POST | 200 | `summaryDataJson` — a **JSON string** holding 13 module objects; plus `applicationId`, `schemeCode`, `productName` | Summary load | ⚠ see D-39/D-40/D-41 |

**No document-upload endpoint was ever observed**, on any of the three upload attempts — see D-05.

**N-30/N-34 note.** Geolocation is captured and reverse-geocoded **before** the shutter is
pressed, and each image is stamped independently. No endpoint cross-checks the capture
location against the applicant's address or the selected branch.

**N-45 note.** The entire Summary is served by **one** call, and the payload is a JSON
*string* requiring a second parse — relevant to Step 2 if it asserts on the response.

**Console errors:**

| Screen | Message |
|---|---|
| eKYC step submit | `Failed to load resource: the server responded with a status of 504 (Gateway Time-out) @ .../sahyogAosAPI/existing/customer/data/submit` |
| Login (pre-auth, expected) | Three `401`s on `notification/list`, `sidemenu/list`, `alert/get/list` before token acquisition |

Apart from the 504, the journey produced **zero console errors** across scheme selection,
mobile verification and the whole eKYC step.

**Pass 6 console:** `browser_console_messages(level=error, all=true)` returned
**0 errors and 0 warnings out of 138 total messages**, covering Applicant Photo, camera
capture, Nominee Details, Document Upload, Introducer Details, Lead Details and the Summary
load. Notably, **the silent failures in D-31 leave no console trace either** — an operator has
no channel, visual or diagnostic, by which to learn the submit failed.

---

## 9. Not Verified

| Area | Attempted? | Reason not verified |
|---|---|---|
| Account Type on 1003 | N/A | Step does not exist — no control to exercise |
| Joint / Minor journeys on 1003 | No | Unreachable without an Account Type step |
| PAN successful verification + name/DOB sub-step | Yes | Blocked by D-05 — document upload never registers |
| PAN document content validation | Yes | Blocked by D-05 — no document could be submitted |
| Driving Licence successful verification | No | **Safety constraint** — real government lookup, invalid data only |
| Voter ID successful verification | No | **Safety constraint** — real government lookup, invalid data only |
| DigiLocker denial / "Action Required" status | No | Requires a second real consent cycle; would consume limited attempts |
| DigiLocker link expiry + resend cooldown enforcement | No | Time-bound; would consume the remaining 2 link attempts |
| OTP max-attempt lockout behaviour | No | Would strand `SAH-1003-812` entirely (only 1 send attempt remained) |
| "Change Mobile Number?" flow | No | Would consume an OTP send attempt |
| Liveliness — video/camera method | No | Deliberately not initiated: only one method is required and the other had succeeded; would consume 1 of 3 link attempts and need a second human gate. UI fully inventoried (§4.11) |
| Liveliness — identity-matching integrity | No | Would require deliberately impersonating an applicant on a live KYC step. `[REPO]` BUG-SILVER-004 not re-tested on 1003 |
| Whether 1003 auto-populates Permanent address from Aadhaar | Yes | Inconclusive — the Aadhaar document fetch never completed (`digiaadharVerifyStatus: 0`) due to the upstream DigiLocker issue, so a scheme difference cannot be distinguished from a data consequence (§4.12) |
| Communication Address popup contents / "Same as Permanent" toggle | No | Not opened — exploration stopped at the Permanent address form |
| ~~Branch Selection, Basic Details~~ | — | **RESOLVED** — both reached (§4.13, §4.14.1) |
| ~~Employment / Salaried information~~ | — | **RESOLVED** — reached (§4.14.2) |
| ~~Applicant Photo, Nominee Details, Document Upload~~ | — | **RESOLVED Pass 6** — all three reached and documented (§4.16, §4.17, §4.18) |
| ~~Introducer Details, Lead Details, Summary~~ | — | **RESOLVED Pass 6** — all reached and documented (§4.19, §4.20) |
| **Final Submit (post-Summary)** | **No — deliberately** | **Not authorised.** Irreversible; pushes a record carrying a real verified identity, a fabricated address and a synthetic signature into the approval workflow, where Cancel is the only exit and is one-way. The confirmation dialog (if any), success screen, resulting status and endpoint are all unknown (§4.20.6) |
| ~~Funding Mode / Employment Type routing matrix on 1003~~ | — | **RESOLVED** — no Employment Type field exists on 1003 (§4.14.2) |
| Server-side rejection of a future nominee DOB | Client side only | Would have persisted a corrupt nominee onto the application being used to reach Summary (§4.17). Client-side fault is `[OBSERVED]`; server behaviour unknown |
| Introducer name-mismatch handling (`isNameMismatch: 1`) | No | Needs a second real third-party CBS account with a deliberately wrong name (§4.19) |
| Document Upload — document-type dropdowns and `+ Add Custom Document` | No | Not opened; uploads are blocked by D-05 regardless, and the objective was Summary (§4.18) |
| Whether Mode of Operation `Jointly` is accepted on save (D-25) | No | Still unresolved — would require a second full 29-field Basic Details pass; `Self` was needed to reach Summary |
| Per-field character-set validation on Basic Details | No | Deprioritised against the Summary objective; the step was already complete and re-probing risked the record |
| Nominee edit/delete after save | No | Not exercised — no second nominee added, and the record was needed intact |
| Cancel / Track Application on a 1003 application | No | **Safety constraint** — Cancel is irreversible and was explicitly forbidden |
| Double-submit / rapid re-click on OTP | No | Attempt budget too small to risk |
| Responsive / mobile-viewport behaviour | No | Time — deprioritised against journey discovery |
| `SAH-1003-772` (pre-existing draft) internals | No | Real third-party in-progress application; left untouched |

### 9.1 Testability constraint (for Step 2's test plan)

`[OBSERVED]` Scheme 1003 presents **three consecutive human-only gates** before any
data-entry stage is reachable:

| # | Gate | What a human must physically do | Attempt budget |
|---|---|---|---|
| 1 | Mobile OTP | Read an SMS on the registered handset | 3 sends |
| 2 | Aadhaar via DigiLocker | Open an SMS link and grant document access | 3 links |
| 3 | Liveliness | Write a code on paper and photograph themselves, **or** complete a video check | 3 links |

**Consequence:** the 1003 journey **cannot be automated end to end**. Everything from
Address Details onward is reachable only after all three gates are cleared by a real person,
and each attempt consumes a real SMS against a capped budget. This mirrors the established
pattern for every OTP-gated module in this project `[REPO]`.

**What *is* safely automatable on 1003:** scheme listing/search, Mobile Number field
validation (invalid input never triggers a send), the eKYC card inventory, PAN/DL/Voter ID
client-side validation with invalid data, Address Details field inventory and its
required-field validation, and stepper/navigation/persistence behaviour. Step 2 should scope
automated coverage to these and treat the rest as Manual (Live-Assisted).

#### 9.1.1 — Update after Pass 6: the fourth gate is now automatable

`[OBSERVED]` The **camera gate is no longer a blocker**. Applicant Photo — previously listed
as a fourth human-only gate — is fully automatable provided the browser is launched with a
**fake video device**:

```
npx @playwright/mcp@latest --config playwright-mcp-camera.config.json
```
supplying `--use-fake-device-for-media-stream`, `--use-fake-ui-for-media-stream`, and
`contextOptions.permissions: ["camera","geolocation"]` with a fixed `geolocation`.

**Both halves of the step are automatable:** the signature via camera capture, and the photo
via the `Verified Photo` → `Aadhaar Verification Photo` path. Neither needs a human.

> **Two prerequisites Step 2 must encode, learned the hard way:**
> 1. **The matching browser build must be installed** — this session failed at launch until
>    `npx @playwright/mcp@latest install-browser chromium` fetched `chromium-1237`.
> 2. **Permissions alone are insufficient** and **a device alone is insufficient** — Pass 5
>    proved the first, and the `Verified Photo` popup's Submit is *permission*-gated while the
>    signature is *device*-gated. Both must be configured together.

`[OBSERVED]` **Everything from Applicant Photo through Summary is automatable** — Nominee
Details, Document Upload, Introducer Details, Lead Details and the Summary screen involve no
human gate. Two of these need externally-supplied fixtures:

| Step | Fixture needed | Why |
|---|---|---|
| Introducer Details | A **valid CBS account number** | The field is resolved against the Core Banking System; an invalid value fails silently (D-31) |
| Lead Details | A **valid staff code** | Both codes must pass `lead/details/verify` before the step will submit |

**Revised automation boundary:** the three human gates (OTP, DigiLocker, Liveliness) remain
the only true blockers. A test suite that resumes a **seeded application already past
Liveliness** can drive the journey automatically all the way to the Summary screen — which is
exactly the seed strategy already recorded for the NSA module `[REPO]`. Final Submit should
remain manual-only given its irreversibility.

---

## 10. Findings Summary

### 10.1 Current behaviour — confirmed

1. `[OBSERVED]` Scheme 1003 is listed as `Staff Salary Account - 1003` under product
   `Savings Account`, alongside 1001 and 1002.
2. `[OBSERVED]` Scheme 1003 runs its **own workflow definition** (`aosWorkflowDtlUuid`
   ending `…stsa`), distinct from Silver's `…sas` and Normal's `…nsa`.
3. `[OBSERVED]` Scheme search is server-side, case-insensitive, substring, excluding
   inactive schemes.
4. `[OBSERVED]` Selecting the scheme does not create an application; the record and the
   `SAH-1003-nnn` Applicant Id are created on the first successful "Send Verification Code".
5. `[OBSERVED]` **The 1003 workflow is COMPLETE and fully mapped (Pass 6): Mobile Number
   Verification → eKYC Verification → Existing Customer Data (system step, no UI) →
   Liveliness Verification → Address Details → Branch Selection → Basic Details →
   Salaried Information → Applicant Photo → Nominee Details → Document Upload →
   Introducer Details → Lead Details → Summary.** That is **13 workflow steps plus a Summary
   screen**, which is not itself a step. There is **no Account Type step**. The authoritative
   `aosModuleSequence` values and per-step `isEditable`/`skipAllowed` flags are tabulated in
   §4.15; note the stepper's tab position and the server's sequence number **do not agree**.
5e. `[OBSERVED]` **The Summary screen was reached and fully documented (§4.20). Final Submit
   was inspected but deliberately NOT operated.**
5f. `[OBSERVED]` **Summary data fidelity is good: every value it displays matches what was
   entered upstream — no corruption was found** (§4.20.3). Its problems are **omissions**:
   no eKYC pass/fail status, no photo/signature images, and nominee relation/DOB/age/address
   missing entirely.
5g. `[OBSERVED]` **The Applicant Photo step is automatable after all** — with a fake video
   device plus pre-granted camera/geolocation. It is **not** a human gate (§9.1.1).
5h. `[OBSERVED]` **Documents registered on a step are discarded unless that step's own Submit
   succeeds** — proven by Pass 5's photo being absent on resume (§4.16.1).
3a. `[OBSERVED]` Basic Details routes to **Salaried Information unconditionally** on 1003 —
   there is no Employment Type field to branch on. `[INFERRED]` the `[REPO]` Employment-Type
   routing matrix and BUG-SILVER-005 cannot arise on this scheme.
3b. `[OBSERVED]` **`Designation/Profession` is NOT absent on 1003** — it is relocated to
   Salaried Information and is the only mandatory field there. (Corrects an earlier
   inference.) Genuinely absent: `Employment Type` and `Initial Funding Amount`.
3c. `[OBSERVED]` `Is Staff` is a mandatory dropdown pre-set to `YES` with **exactly one
   option**; `Staff Id` is free text with **no validation or master lookup**.
3d. `[OBSERVED]` `Spouse / Father's Name` enforces `maxLength` 20 (25 chars → 20 stored);
   the cap applies to **that field only** — `Mother's Name` accepted 22.
4a. `[OBSERVED]` **Basic Details carries two fields unique to scheme 1003 — `Is Staff`
   (a mandatory dropdown whose only option is `YES`) and `Staff Id` (mandatory, maxLength
   100)** — and **omits** `Employment Type`, `Designation/Profession` and
   `Initial Funding Amount`, all of which exist on 1001/1002. These are the product's real
   differentiators in the data model.
4b. `[INFERRED]` With no Employment Type field, the `[REPO]` Employment-Type routing matrix
   (RULE_23/RULE_24, and BUG-SILVER-005) has no input on 1003 and cannot apply. The actual
   post-Basic-Details destination is `[NOT VERIFIED]`.
4c. `[OBSERVED]` **"Same as Permanent address" works correctly on 1003** — it copies all
   seven address fields as structured values, **contradicting** `[REPO]` BUG-SILVER-002 /
   BUG-NORMAL-001, which report only Address Line 1 being populated.
4d. `[OBSERVED]` An address that is internally inconsistent (city in the wrong state) and
   wholly unrelated to the Aadhaar-verified identity is accepted and stored without any
   cross-validation.
5a. `[OBSERVED]` Liveliness Verification offers two **alternative** methods — Security Code
   Based and video/camera based; exactly one is required, and the step submitted with only
   the first completed.
5b. `[OBSERVED]` The header gains an **Applicant Name** field once eKYC completes.
5c. `[OBSERVED]` Both eKYC (DigiLocker consent) and Liveliness require a **real human on a
   real handset**. Combined with the OTP gate, scheme 1003 has **three separate human-only
   gates** before Address Details — a hard limit on end-to-end automation (§9.1).
6. `[OBSERVED]` Customer Type is auto-assigned **Individual** with no user choice, matching
   `custType:"I"` on the scheme record.
7. `[OBSERVED]` Mobile Number accepts digits only, is capped at 10, and reveals
   "Send Verification Code" only at a full 10 digits.
8. `[OBSERVED]` OTP send is capped at 3 attempts per application; server-side expiry is
   15 minutes; expiry is enforced server-side even when the client already shows "expired".
9. `[OBSERVED]` eKYC presents exactly four cards in fixed order, with **only Aadhaar
   mandatory**; the step submits successfully on Aadhaar alone.
10. `[OBSERVED]` DigiLocker link send is capped at 3 attempts; configured link validity is
    25 minutes; Cancel initiates nothing.
11. `[OBSERVED]` Field rules are **data-driven per scheme** and exposed by
    `aos/button/field/get/configuration/details` — including a configured PAN rule that the
    4th character must be `P`.
12. `[OBSERVED]` Completed steps become non-editable (`isEditable: 0`); steps are strictly
    sequential (`skipAllowed: 0`) and cannot be previewed ahead.
13. `[OBSERVED]` Data persists across reload; `/applndetails` resumes the most recent
    application directly.
14. `[OBSERVED]` Every wizard stage shares one route — no per-stage URL.

### 10.2 Gaps — does not exist today

1. `[GAP]` No visible indication of which eKYC options are optional beyond the single `*` on
   Aadhaar — the three optional cards look identical in weight to the mandatory one.
2. `[GAP]` No "save and exit" or explicit draft-save control anywhere in the wizard; the
   user must infer that progress is retained.
3. `[GAP]` No retry affordance when a server call fails mid-step (directly enables D-07).
4. `[GAP]` No character counter or max-length hint on PAN Number, which silently truncates.
5. `[GAP]` The stepper cannot show the full journey ahead, so a user cannot see how many
   stages remain or what will be required of them.
6. `[GAP]` No uploaded-filename display on any upload widget, so a user cannot confirm which
   file is attached.
7. `[GAP]` No search/type-ahead is usable on the 4,498-entry City dropdown, and no
   pin-code-driven auto-fill of State/City exists — either would remove the need for the
   broken cascade entirely.
8. `[GAP]` The two Liveliness methods are presented with no explanation of the difference
   between them, so an agent cannot tell which to choose or that they are alternatives.
9. `[GAP]` No way to enter a non-Indian address — Country is disabled and fixed to "India".
10. `[GAP]` **No way to decline nomination.** A nominee is unconditionally mandatory
    (`skipAllowed: 0`, no opt-out control). Nomination is normally a right a customer may
    waive; on 1003 the account cannot be opened without one (§4.17).
11. `[GAP]` **No preview or retake of a captured photo/signature.** The control shows only the
    words `Document Uploaded` — no thumbnail, no filename, no retake. An illegible or wrong
    capture cannot be detected, at capture time or at review (§4.16.2, §4.20.4).
12. `[GAP]` **`Period of Acquaintance` is unconstrained free text** (`maxLength` 255). No
    units, no numeric input, no picker — yet a reviewer is expected to assess it (§4.19).
13. `[GAP]` **No separation of duties between Lead Converter and Sourcer** — the same staff
    code is accepted for both roles (§4.20.1, D-38).
14. `[GAP]` **No cross-check between the photo capture location and any address on the
    application.** Capture geolocation (Mumbai), applicant address (Abohar) and branch
    (Gondiya) were mutually inconsistent and nothing objected (§4.16.4).
15. `[GAP]` **The Summary offers no per-section edit control.** Correcting anything means
    knowing to click the stepper tab, and the tabs give no clue which steps are editable
    (§4.20.5, D-42).

### 10.3 Defect candidates — exists but wrong

| # | Area | Observed | Expected | Proposed severity | Repro |
|---|---|---|---|---|---|
| D-01 | OTP & DigiLocker timers | UI counts down from ~18 m 19 s while server `otpExpiryMin` is **15**; DigiLocker shows 27 m 14 s against `linkExpiryMin` **25**. Two independent sends produced near-identical values (18:19, 18:18), indicating hard-coded client constants. | Countdown derived from server config/expiry timestamp | **Major** | §4.3 step 4/6; §4.6 |
| D-02 | OTP secret exposure | `aos/mobile/verify/get/details` returns `mobileOtp` as a bcrypt hash (`$2a$10$…`) to the browser | OTP never sent to the client in any form | **Major (Security)** | §8 N-07 |
| D-03 | Error signalling | **Eight** endpoints return **HTTP 200** carrying `success:"FALSE"` / `isError:true`, including `msgCode:"500"` and `msgCode:"503"` inside a 200. **Pass 6 additions:** `applicant/photo/get/doc` reports a **legitimately empty state** (no photo saved yet) as `msgCode:"500"`, `"No record found!"`, `isError:true` — a *normal* condition signalled as a server error; and `introducer/save/details` returns `msgCode:"503"` `"CBS connection error"` in a 200 (which the UI then swallows entirely — D-31). A naive status check passes on every one of these | Non-2xx status for failures; empty ≠ error | **Major** | §8 N-09, N-13, N-17, N-19, N-21, **N-29, N-40** |
| D-04 | DigiLocker popup copy | Renders "The link has been sent on +91-…" **before** any link is sent, while the backing call reports "Details are not present !" | No send claim until a link is actually sent | **Major** | §4.6 |
| D-05 | **Document upload — platform-wide** | File binds to `input#files2` (`files.length === 1`) but never registers. Confirmed on **two independent controls in two modules**: PAN Verification (no upload request on any of 3 paths; Submit stays blocked by "Upload PAN is required") and Address Proof (no upload request; `uploadFileType: null` in the save payload). PAN is hard-blocked because its upload is mandatory. | Selected file is accepted and uploaded | **Critical** *(upgraded from PAN-specific; pending one manual confirmation)* | §4.7 steps 5–8, §4.12.1 P-02 |
| D-06 | Upload accept filter — **PAN control only** | PAN's rendered `accept=".png,.pdf,.camera"` omits **jpeg**, contradicting its label and backend `upload_file_type: "png,jpeg,pdf,camera"`. The Address Proof control's accept correctly reads `.png,.jpg,.pdf,.camera`, so this is **not** application-wide. | jpeg accepted as advertised | **Major** *(narrowed to PAN)* | §4.7, §4.12.1 |
| D-07 | Existing Customer Data — **error handling only** | An upstream (DigiLocker-side) timeout surfaced as a 504 on `existing/customer/data/submit`. The UI then showed an **indefinite spinner with no error message, no retry control and no indication anything had failed**. *(The 504 itself is environmental, not a product defect, and the workflow self-healed — see §4.10.1.)* | Upstream failure surfaced to the user with a retry option | **Minor** *(downgraded from Blocker after re-test)* | §4.10, §4.10.1 |
| D-13 | Liveliness status message | `aos/liveliness/status/details` returns `msgCode "LIVELINESS_SECURITY_FAIL"` with `msgDescr "Request is not found for bank statement verification  !"` — text from an unrelated module, plus a double space | Message describes the liveliness step | **Minor** | §4.11 |
| D-14 | Liveliness security code exposure | `aos/liveliness/get/details` returns **`photoSecuritycode` in plaintext** to the browser — the code the applicant must hand-write and photograph. Readable from the agent's session without ever receiving the SMS. Combined with `[REPO]` BUG-SILVER-004 (the check does not verify identity), the control is defeatable end-to-end. | Code never exposed to the initiating client | **Critical (Security)** | §4.11 |
| D-15 | State master data | `master/data/get/states` returns 33 entries **missing Bihar, Sikkim, Telangana and Ladakh**, with `Rajasthan` misspelled `Rajsthan` and `Uttarakhand` sorted before `Uttar Pradesh`. Address Details is mandatory, so applicants in those four jurisdictions **cannot open an account**. | Complete, correctly-spelled, correctly-sorted jurisdiction list | **Critical** | §4.12 |
| D-16 | State → City cascade | Selecting a State fires no request and does not filter City (4,498 entries from every state). **Confirmed live that an impossible pair is not merely selectable but PERSISTED**: `Maharashtra` + `Abohar` (a Punjab city) saved successfully with `stCode:27` / `cityCode:10`, rejected by neither client nor server; the PIN is not cross-validated either. | City filtered to State; impossible pairs rejected | **Critical** *(upgraded from Major — the system stores it)* | §4.12, §4.12.1 P-01 |
| D-20 | Address form field loss | A populated mandatory `Pin code` (`422001`) was **silently cleared** by later interaction in the same form; Submit then failed with `Pin code is required` | Entered values persist within the form | Major | §4.12.1 P-03 |
| D-21 | "Same as Permanent address" partial lock | Ticking disables **only** Address Line 1; Address Line 2, Area and Pin code stay editable, so the "same as" copy can be silently diverged | All copied fields locked, or none | Minor | §4.12.1 P-05 |
| D-22 | "Same as Permanent address" data loss | Unticking **blanks every field** and does not restore previously-typed values (verified: `MANUAL COMM ADDRESS 99` was not recovered). No warning, no undo | Prior manual input restored, or a warning shown | Major | §4.12.1 P-06 |
| D-23 | Branch master data | `Sadak Arjuni Branch` (Id `10556`) and `SADAK ARJUNI BRANCH` (Id `1017`) appear to be the same branch duplicated with different casing and different Ids | One record per branch | Minor | §4.13 |
| D-24 | Spouse / Father's Name length | `maxLength: 20` on 1003 — unrealistically short for a full name, with no counter or hint. Reproduces `[REPO]` BUG-SILVER-003 (here as a hard `maxlength`, and the field is not mandatory) | Realistic limit, or a visible hint | Minor | §4.14 |
| D-25 | Mode of Operation not filtered | Offers `Jointly`, `Guardian`, `Jointly With Others`, `Any Two Jointhly` on an **Individual-only** scheme with no Account Type step; all are selectable | Options filtered to valid modes | Minor *(submit-time rejection `[NOT VERIFIED]`)* | §4.14, §4.14.1 |
| D-27 | **`Staff Id` unvalidated** | The field establishing entitlement to a staff-only product is free text (`maxLength` 100) with **no format mask, no pattern validation and no lookup against any staff master** — `STAFF0001` accepted with no verification request | Validated against an employee register, or at minimum format-checked | **Major** | §4.14.1 |
| D-28 | Master-data quality in dropdowns | `Designation/Profession` (83 options) contains **duplicates**: `Shop Owner`, `Hotel Owner`, `Dairy Farmer`, `Labourer` each twice. `Education/Qualification` contains **`MS computers`**, apparently stray test data in a live master list. `Region` contains typo `Metropolitian City`; `Mode of Operation` contains typo `Any Two Jointhly` | De-duplicated, correctly-spelled production master data | Minor | §4.14.1, §4.14.2 |
| D-29 | Duplicated upload-option label — **shared component fault** | `Capture Using Camera` rendered **twice** on both Applicant Photo and Signature, and **no `<input type="file">` exists on that step at all**, so Signature has no non-camera path — an applicant or agent without a working camera cannot complete the application. **Scope widened Pass 6:** the nominee's Address Proof control renders **`Browse Computer` twice** (with no camera option), i.e. the *second* option label duplicates the first in both places. Meanwhile the main Document Upload control renders the pattern **correctly** ("Browse … OR … Capture Using Camera"), proving the correct component exists and these two instances are misconfigured. **Scope corrected (Pass 5):** the Verified Photo popup's Submit is *not* part of this defect — it was permission-gated, not broken | Browse + Camera offered consistently, as the working control does | **Major** | §4.14.3, §4.16.1, §4.17, §4.18 |
| D-08 | Form validation — **eKYC popups only** | Mandatory-field errors surface **one at a time** — blank PAN form flagged only PAN Number; blank DL form flagged only DL Number, never the mandatory DOB. **Scope narrowed Pass 6:** Nominee Details and Introducer Details each flag **all** their mandatory fields together (V-18, V-19), so this is **not** platform-wide form behaviour — it is specific to the eKYC PAN/DL popups | All unmet mandatory fields flagged together | **Minor** *(narrowed)* | §5 V-16, V-17; contrast V-18, V-19 |
| D-30 | **Nominee age computation** | `Age ( In Years )` is derived from DOB and shown **fractionally to 2 dp** (`36.03`, `6.07`). A **future DOB is accepted by the app's own change handler** despite the input's `max` (browser reports `validity.rangeOverflow`), yielding **`Age = -4.07`** — a negative age — with no error and no correction | Integer age; future DOB rejected with a message | **Major** | §4.17, §5 V-20, V-23 |
| D-31 | **Introducer CBS failure is completely silent** | An invalid account number produced `introducer/save/details` → **HTTP 200** `{"msgCode":"503","msgDescr":"CBS connection error","success":"FALSE"}`. The UI showed **no message, no toast, no field highlight, and no console error**; the step simply did not advance. The user sees a click that does nothing | Failure surfaced with an actionable message and a retry | **Major** — worst UX failure in the journey | §4.19, §5 V-24, §8 N-40 |
| D-32 | Introducer name-match may be vacuous | On success `bankAccountUserName` is **`null`** while `isNameMismatch: 0` asserts the names match. A null name cannot match anything; the flag looks defaulted rather than computed | Name resolved from CBS and genuinely compared | **Major** *(`[INFERRED]` — needs a mismatch fixture)* | §4.19, §8 N-41 |
| D-33 | Nominee Pin Code input `name` attribute | The nominee address Pin Code renders as **`<input name="422001">`** — the `name` attribute holds the field's **value**, not a field name, while every sibling uses a proper name (`address_line1`, `area`, `country`). Also breaks any stable selector | `name="pincode"` or equivalent | **Minor** | §4.17 |
| D-34 | Lead Details field loss | Clicking `Verify` on Lead Converter Code **silently cleared the already-populated Sourcer Code**. Same class as D-20 — a populated field destroyed by an unrelated interaction in the same form, with no warning | Other fields untouched by a verify action | **Major** | §4.20.1, §5 V-28 |
| D-35 | **Document Upload is skippable and invisibly empty** | The step submits with **zero documents** and no warning (`skipAllowed: 1` server-side — by design). The Summary then renders `Document Upload` as a **bare heading with nothing beneath it**, giving the reviewer no statement that nothing was attached. Compounds with D-05 (uploads never register at all), so a 1003 application can reach final submission with **no supporting documents whatsoever** | Required documents enforced, or the absence stated explicitly at review | **Critical** *(regulatory)* | §4.18, §4.20.4, §5 V-27 |
| D-36 | Captured images are never visible | No preview, thumbnail, filename or retake after capture — the control shows only `Document Uploaded`. The Summary likewise renders the photo and signature as **labels with no image** (`valueType: "file"`, zero `<img>` on the page). There is **no point in the journey where anyone can see what was captured** | Thumbnail at capture and at review, with a retake option | **Major** | §4.16.2, §4.20.4 |
| D-37 | Nominee relation master data | 17 options, **unsorted**, with three overlapping sets — `Wife`/`Husband` vs `Spouse`, `Father`/`Mother` vs `Parent`, `Brother`/`Sister` vs `Sibling` — plus `No Relation` and `Business Associate` offered as *nominee* relations. Two agents will record the same relationship differently | De-duplicated, sorted, semantically distinct list | **Minor** | §4.17, §8 N-35 |
| D-38 | No separation of duties on Lead Details | The **same staff code** (`SAH09078`) was accepted as both `Lead Converter Code` and `Sourcer Code`, resolving to the same name twice, and submitted cleanly | Distinct parties enforced, or the overlap justified | **Minor** | §4.20.1, §5 V-29 |
| D-39 | Summary hides eKYC/Liveliness outcomes | The payload carries `subModVerified: true` for Aadhaar and `false` for PAN/DL/Voter Id (and likewise for the two Liveliness methods), but **the UI renders all of them identically** as plain sub-headings. A reviewer cannot tell which identity checks actually passed | Verified state rendered per sub-module | **Major** | §4.20.4 |
| D-40 | Summary omits most nominee data | Only `Full name` and `Status` appear. The nominee's **relation, date of birth, age and entire address** — all mandatory to capture — are **absent from the review screen** | All captured nominee data shown | **Major** | §4.20.3, §4.20.4 |
| D-41 | Summary rendering & schema inconsistencies | Blank optional fields render `NA` (Religion) while blank system fields render `-` (CIF ID) — two null conventions on one screen. A transaction **count** renders as `120.00`. Branch Selection's fields carry the misspelled `"valueType": "charcter varying"` | One null convention; counts as integers; correct schema strings | **Minor** | §4.20.3, §4.20.4 |
| D-42 | Editable vs locked steps indistinguishable | Every stepper tab carries the identical class `scroll_tab_first`. Six of thirteen steps are `isEditable: 1` and seven are `isEditable: 0`, but the user must click each to find out which | Locked steps visually distinct | **Minor** | §4.20.5 |
| D-43 | **No declaration, consent or gate before final submission** | The Summary carries **0 checkboxes, 0 radios, 0 inputs of any kind**, and a text sweep for `declar\|consent\|terms\|i agree\|hereby\|undertak\|certif` finds **nothing**. The Submit control is a bare `<button type="submit">Submit</button>` — unstyled, outside any `<form>`, and **enabled from the moment the screen paints**. Nothing whatsoever gates the final, irreversible act of the journey | An explicit declaration/consent the applicant must accept, and a Submit gated on it | **Critical** *(regulatory)* | §4.20.6 |
| D-09 | Field marking | "Enter OTP" carries no `*` despite being unconditionally required | Consistent mandatory marking | **Minor** | §4.3 |
| D-10 | Copy consistency | `Digilocker` (popup title) vs `DigiLocker` (card); `png,jpeg,pdf,camera` (PAN) vs `png, jpg, pdf, camera` (DL/Voter) — jpeg vs jpg differ too; `PAN Number is required` (declarative) vs `Enter driving licence number` (imperative); `You have 1 attempts left` (grammar) | Consistent terminology, formatting and grammar | **Minor** | §4.6–4.9 |
| D-11 | PAN Number length | Backend `field_size: "100"`, DOM `maxlength="10"`; 16 chars silently truncated to 10 with no message | Config and UI agree; truncation surfaced | **Minor** | §4.7, §5 V-08 |
| D-12 | DL Number validation | `maxLength: 50`, no format validation; a 21-char nonsense value was passed to a real government lookup | Format/length validated before an external call | **Major** | §4.8, §5 V-12 |

### 10.4 Open questions for stakeholders

1. **Is Staff Salary Account intended to be Individual-only?** 1003 has no Account Type step
   and auto-assigns Individual. Plausible for a staff product — but it must be confirmed as
   design, not a missing workflow configuration, because it removes Joint/Minor and
   everything downstream of them.
2. ~~**Is the 504 on `existing/customer/data/submit` environmental or reproducible?**~~
   **ANSWERED.** Environmental and transient — attributed by the stakeholder to a
   DigiLocker-side issue, and confirmed self-healed on re-test (§4.10.1). The residual
   question is narrower: *should* an upstream timeout surface an error and a retry to the
   user, rather than an indefinite spinner (D-07)?
3. **Does PAN document upload work under real mouse-driven interaction?** All three
   programmatic paths failed with no network call. One manual attempt would settle whether
   D-05 is a product defect or an automation-only limitation.
4. **What are the intended OTP and DigiLocker link validity windows?** The UI and the server
   config disagree in both cases (D-01). Which is authoritative?
5. **Should the scheme description's promises be enforced anywhere?** 1003 advertises
   zero-balance, free debit card and loan concessions, yet its scheme record is identical to
   1001/1002 (same 6% rate, same `acType`). Is there downstream product configuration that
   this exploration could not see?
6. ~~**What is `stepStatus: 13`?**~~ **ANSWERED.** A transient in-progress state — it
   resolved to `1` without intervention (§4.10.1).
7. **Are Bihar, Sikkim, Telangana and Ladakh intentionally excluded from the State master
   data (D-15)?** If not, applicants in those jurisdictions cannot open an account at all,
   since Address Details is mandatory. Who owns `sahyognetwinMasterDB` master data?
8. **Should the City dropdown filter by State (D-16)?** It currently offers 4,498 unfiltered
   entries and permits impossible State/City combinations. Confirm the intended behaviour
   before Step 2 writes cascade test cases.
9. **Is exposing `photoSecuritycode` in plaintext to the agent's browser intended (D-14)?**
   The agent initiating the check can read the code the applicant is supposed to prove
   possession of, which defeats the control's purpose.
10. **Would scheme 1003 auto-populate the Permanent address from Aadhaar on a clean run?**
    This run could not tell, because the Aadhaar document fetch never completed (§4.12). A
    single clean re-run would settle whether 1003 differs from 1001/1002 here.
11. **Is it intended that a Staff Salary Account can be submitted with ZERO supporting
    documents?** `Document Upload` is the only step configured `skipAllowed: 1`, it submits
    empty without a warning, and the Summary does not flag the absence (D-35). For a
    KYC-regulated product this needs an explicit product/compliance decision — is the step
    optional by design, or is the flag a misconfiguration?
12. **Where is the applicant's declaration/consent meant to be captured?** The Summary carries
    no declaration, no consent, no terms and no acknowledgement, and its Submit is
    unconditionally enabled (D-43). Either this is captured somewhere outside the journey
    (paper, or a downstream approval screen), or it is missing. Compliance must confirm which.
13. **Should nomination be declinable?** The journey makes a nominee unconditionally mandatory
    with no opt-out. Nomination is ordinarily a right the customer may waive — is forcing it a
    deliberate product rule?
14. **Is `isNameMismatch` actually computed?** On a successful introducer save it returned `0`
    while `bankAccountUserName` was `null` (D-32). If the flag is defaulted rather than
    derived, the introducer name check is not a control at all.
15. **Should Lead Converter and Sourcer be allowed to be the same person?** The system accepts
    one code for both roles (D-38). If these are meant to be distinct parties for incentive or
    control reasons, it is unenforced.
16. **Which is authoritative for stage numbering — the stepper position or `aosModuleSequence`?**
    They disagree (Applicant Photo is tab 9, sequence 11), and sequences 8, 9 and 14 are absent
    on 1003 (§4.15). Step 2 needs to know which to assert on.

---

## 11. Evidence Index

| Artefact | Path |
|---|---|
| **Summary screen screenshot (Pass 6)** | `.playwright-mcp/STAFF_TS001-summary-screen.png` — full-page capture of the completed Summary |
| **Summary API payload (Pass 6)** | `.playwright-mcp/summary-response.json` — full `app/get/aosRequest/summary` response |
| Other screenshots | none — all remaining evidence is accessibility snapshots + captured network bodies |
| Session page snapshots (Passes 1–5) | `.playwright-mcp/page-2026-08-17T07-*.yml` … `page-2026-08-17T09-5*.yml` |
| Session page snapshots (Pass 6) | `.playwright-mcp/page-2026-08-18T05-2*.yml` … `page-2026-08-18T05-4*.yml` |
| Session console logs | `.playwright-mcp/console-2026-08-17T07-48-52-297Z.log`, `console-2026-08-17T09-5*.log`, `console-2026-08-18T05-25-27-853Z.log` (Pass 6 — **0 errors / 0 warnings across 138 messages**) |
| Camera browser config | `playwright-mcp-camera.config.json` (requires `chromium-1237` — see §9.1.1) |
| Generated story | `user-stories/US_010_Staff_Salary_Account_Journey.md` |
| Application under test | `SAH-1003-812` — **all 13 steps complete, parked on the Summary screen, NOT submitted.** Resumable via Dashboard → View |

**State of `SAH-1003-812` at end of Pass 6.** Carries a real DigiLocker-verified identity, a
**fabricated address** (`Flat 101, Testview Apartments … Abohar, Maharashtra, 422001` — an
impossible city/state pair, D-16), a **synthetic camera-frame image in the signature slot**
(§4.16.2), **zero supporting documents** (D-35), and stakeholder-supplied introducer and lead
codes. **It must not be submitted**, and it is not suitable as a golden record for anything
downstream. It is, however, an ideal **seed for Step 2**: any suite that resumes it lands
directly on the Summary screen with all upstream gates already cleared.
