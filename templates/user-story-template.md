# User Story: <Verb + what this story covers>

**Story ID:** US_0NN
**Suite ID:** {SUITE_ID}
**Module:** <Module name — use the application's own label>
**Sub-module:** <Sub-module / screen / step>
**Priority:** Critical | High | Medium | Low
**Role:** <User role this story is written for>
**Explored on:** YYYY-MM-DD
**Explored against:** https://sahyogagentweb.drutam.in:9634 (<environment>)
**Evidence log:** `specs/{SUITE_ID}-exploration-log.md`

> Every behavioural statement below is tagged `[OBSERVED]`, `[REPO]`, `[INFERRED]`,
> `[NOT VERIFIED]`, `[GAP]` or `[DEFECT]` — see `prompts/ba_agent_prompt.md` §4.
> Untagged lines are not permitted.

---

## 1. Module / Sub-module

| | |
|---|---|
| **Module** | <…> |
| **Sub-module** | <…> |
| **Navigation path** | Login → <…> → <…> |
| **Route(s)** | `/<path>` |
| **Direct-URL reachable** | Yes / No — `[OBSERVED]` |
| **Related modules** | <…> |

---

## 2. User Story

**As a** <role>,

**I want** <capability>,

**So that** <business value>.

---

## 3. Business Requirement

<Two to four sentences: the business problem this module solves and why it exists.
Derived from observed behaviour and any existing documentation — not from imagination.
Where the business intent could not be confirmed, say so.>

---

## 4. Pre-conditions

* <System/user state required before this flow can start> — `[OBSERVED]`
* <Data that must already exist>
* <Permissions/role required>

---

## 5. User Flow

### 5.1 Primary flow (as it works today)

| # | Actor action | System response | Evidence |
|---|---|---|---|
| 1 | | | `[OBSERVED]` |
| 2 | | | `[OBSERVED]` |

### 5.2 Alternate / exit paths

* **Cancel** — <what happens> `[OBSERVED]`
* **Back / breadcrumb** — <what happens, does state survive?> `[OBSERVED]`
* **Browser back** — <behaviour> `[OBSERVED]`
* **Re-entry mid-flow** — <can the user resume? from where?> `[OBSERVED]`

### 5.3 State transitions

| From | Trigger | To | Notes |
|---|---|---|---|
| | | | |

---

## 6. Functional Requirements

Numbered `FR-01…`. Each states what the system **does today**, with evidence. Items marked
`[GAP]` are proposed changes and are listed separately in §6.2.

### 6.1 Existing behaviour

| ID | Requirement | Evidence |
|---|---|---|
| FR-01 | | `[OBSERVED]` |
| FR-02 | | `[REPO]` |

### 6.2 Required changes / gaps

| ID | Proposed requirement | Why | Tag |
|---|---|---|---|
| FR-G01 | | | `[GAP]` |

---

## 7. UI Requirements

### 7.1 Screen elements

| Element | Type | Label | Default state | Notes | Evidence |
|---|---|---|---|---|---|
| | Button / Input / Dropdown / Tab / Modal | | Enabled / Disabled / Hidden | | `[OBSERVED]` |

### 7.2 Layout, messaging and states

* **Headings / branding** — <…> `[OBSERVED]`
* **Loading state** — <spinner, skeleton, disabled controls> `[OBSERVED]`
* **Empty state** — <exact message text> `[OBSERVED]`
* **Success feedback** — <toast/inline, exact text> `[OBSERVED]`
* **Error feedback** — <toast/inline, exact text> `[OBSERVED]`
* **Responsiveness** — <observed breakpoints / issues, or `[NOT VERIFIED]`>

---

## 8. Business Rules

| ID | Rule | Enforced where | Evidence |
|---|---|---|---|
| BR-01 | | Client / Server / Both | `[OBSERVED]` |

> "Enforced where" is determined by whether a network call fires before the rule triggers.

---

## 9. Validation Rules

One row per field. `Source of options` distinguishes API-populated dropdowns from
hardcoded ones — this drives Step 2's form-field deep-validation cases.

| Field | Mandatory | Type / format | Length / range | Allowed chars | Default | Source of options | Dependency | Error message (verbatim) | Fires | Evidence |
|---|---|---|---|---|---|---|---|---|---|---|
| | Yes / No | | | | | API / Static / N-A | | | Client / Server | `[OBSERVED]` |

---

## 10. Positive Scenarios

| # | Scenario | Expected outcome | Verified |
|---|---|---|---|
| PS-01 | | | `[OBSERVED]` |

---

## 11. Negative Scenarios

| # | Scenario | Expected outcome | Actual outcome | Verified |
|---|---|---|---|---|
| NS-01 | | | | `[OBSERVED]` |

> Where **Actual** differs from **Expected**, tag the row `[DEFECT]` and mirror it in §15.

---

## 12. Edge Cases

| # | Edge case | Behaviour | Verified |
|---|---|---|---|
| EC-01 | Boundary — max length + 1 | | `[OBSERVED]` |
| EC-02 | Double-submit / rapid re-click | | `[OBSERVED]` |
| EC-03 | Navigate away mid-request | | `[NOT VERIFIED]` — <reason> |
| EC-04 | Session expiry mid-flow | | |
| EC-05 | Leading/trailing whitespace | | |

---

## 13. Acceptance Criteria

Given / When / Then. Tag each with its type so Step 2 can map test types onto it directly.

### AC1: <Title> — *Type: Functional*

**Given** <precondition>

**When** <action>

**Then**

* <observable outcome>
* <observable outcome>

*Basis:* `[OBSERVED]` — <how this was verified>

---

### AC2: <Title> — *Type: Validation*

…

---

## 14. Dependencies / Assumptions

### 14.1 Dependencies

| Dependency | Type | Impact if unavailable |
|---|---|---|
| | Module / API / Third-party / Data / Permission | |

### 14.2 Assumptions

| # | Assumption | Why it is an assumption and not a fact | Needs confirmation from |
|---|---|---|---|
| A-01 | | | Stakeholder / Dev / Further exploration |

### 14.3 Not verified during exploration

| Area | Reason not verified |
|---|---|
| | Blocked / no data / no access / irreversible / time-bound |

---

## 15. Impacted Areas

### 15.1 Application areas touched by this story

| Area | Nature of impact | Regression risk |
|---|---|---|
| | Direct / Indirect / Shared component | High / Medium / Low |

### 15.2 Automation assets affected

| Asset | Action needed |
|---|---|
| `tests/pages/<module>/<X>Page.ts` | New / Update / Reuse as-is |
| `tests/{N}_{SUITE_ID}/<feature>.spec.ts` | New / Update |

### 15.3 Defect candidates found during exploration

| # | Area | Observed | Expected | Proposed severity | Tag |
|---|---|---|---|---|---|
| D-01 | | | | Blocker / Critical / Major / Minor / Trivial | `[DEFECT]` |

> Handed to the Orchestrator. Not filed into `reports/{SUITE_ID}-defect-sheet.xlsx` by the
> BA Agent — defect logging is Step 7.

---

## Current System Behaviour Summary

<A short prose paragraph a stakeholder can read: what the module does today, what works,
what does not, and what is missing. This is the section that proves exploration happened
before requirements were written.>

---

## Out of Scope

The following are deliberately excluded from this story:

* <area> — covered by `US_0NN`
* <area> — not yet implemented
