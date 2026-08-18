# Exploration Log — {SUITE_ID} (<Module name>)

**Explored by:** BA Agent
**Date:** YYYY-MM-DD
**Environment:** https://sahyogagentweb.drutam.in:9634
**Account:** nayan.aher@netwinindia.in
**Depth:** recon | standard | deep
**Related story:** `user-stories/US_0NN_<Module>.md`

> This is the raw evidence trail. Every claim in the user story must be checkable against a
> line in this file. Chronological and specific beats tidy and vague.

---

## 1. Task & Scope

**Task as assigned:** <verbatim from the Orchestrator>

**Restated:** <one sentence>

**In scope:** <…>

**Out of scope:** <…>

---

## 2. Known Before Exploration (static recon)

What the repo already claimed about this module, before touching the browser.

| Source | Claim | Re-verified live? |
|---|---|---|
| `user-stories/US_00N_*.md` | | Yes / No / Contradicted |
| `specs/{SUITE_ID}-test-plan.md` | | |
| `tests/pages/<module>/<X>Page.ts` | | |
| `reports/{SUITE_ID}-test-report.md` | Known defect: … | |

**Contradictions found:** <repo says X, live app does Y — each one is a finding>

---

## 3. Navigation Map

```
Login
 └── <Landing>
      └── <Module>            /route
           ├── <Sub-module>   /route
           └── <Modal>        (no route — overlay)
```

| Screen / step | Route | Reached by | Direct URL works? |
|---|---|---|---|
| | | | Yes / No |

---

## 4. Screen-by-Screen Observations

Repeat this block per screen, step, tab or modal.

### 4.N — <Screen name>

**Route:** `/…`
**Reached by:** <…>
**Snapshot taken:** yes/no

#### Elements observed

| Element | Type | Label / text | Initial state | Enabled by |
|---|---|---|---|---|
| | | | | |

#### Fields

| Field | Mandatory marker | Type | Default | Placeholder | Max length | Options source | Depends on |
|---|---|---|---|---|---|---|---|
| | `*` / none | | | | | API `<endpoint>` / static | |

#### Actions taken and results

| # | Action | Result observed | Network | Evidence |
|---|---|---|---|---|
| 1 | | | `POST /…` → 200 `{…}` | `[OBSERVED]` |

#### Messages captured (verbatim)

| Trigger | Message text | Style | Client or server |
|---|---|---|---|
| | | Inline / Toast / Modal | |

---

## 5. Validation Probing

One row per probe. Verbatim messages only — paraphrasing here destroys the value.

| # | Field | Input used | Expected | Actual | Network fired? | Verdict |
|---|---|---|---|---|---|---|
| V-01 | | | | | No → client-side | Correct / `[DEFECT]` |

---

## 6. Business Rule Probing

| # | Rule under test | Setup | Trigger | Result | Verdict |
|---|---|---|---|---|---|
| B-01 | | | | | Enforced / Not enforced / `[NOT VERIFIED]` |

---

## 7. Async / State Probing

| # | Probe | Result |
|---|---|---|
| A-01 | Control disabled during in-flight request? | |
| A-02 | Double-click / double-submit prevented? | |
| A-03 | Control recovers after error without refresh? | |
| A-04 | Data persists after page refresh? | |
| A-05 | Navigate away mid-request → state on return? | |

---

## 8. Network Capture

| # | Endpoint | Method | Status | Body / response shape | Triggered by | Flag |
|---|---|---|---|---|---|---|
| N-01 | `/app/…` | POST | 200 | `{"success":"TRUE",…}` | | — |
| N-02 | | | 200 | `{"success":"FALSE",…}` | | ⚠ silent failure |
| N-03 | | | 4xx/5xx | | | ⚠ |

**Console errors:**

| Screen | Message |
|---|---|

---

## 9. Not Verified

| Area | Attempted? | Reason not verified |
|---|---|---|
| | | Irreversible / no test data / no access / time-bound / rate-limited / safety constraint |

---

## 10. Findings Summary

### 10.1 Current behaviour — confirmed
1. `[OBSERVED]` …

### 10.2 Gaps — does not exist today
1. `[GAP]` …

### 10.3 Defect candidates — exists but wrong
| # | Area | Observed | Expected | Proposed severity | Repro |
|---|---|---|---|---|---|
| D-01 | | | | | §4.N step <n> |

### 10.4 Open questions for stakeholders
1. <question a human must answer — never guessed>

---

## 11. Evidence Index

| Artefact | Path |
|---|---|
| Screenshots | `screenshots/<module-slug>/` |
| Network capture | `screenshots/<module-slug>/network_requests.txt` |
| Generated story | `user-stories/US_0NN_<Module>.md` |
