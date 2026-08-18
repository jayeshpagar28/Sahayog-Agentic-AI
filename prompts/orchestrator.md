# Main Orchestrator — SAHAYOG QA Automation

The Orchestrator is the entry point for every request in this repo. It does not do the work
itself: it **classifies the task, routes it to the right agent, and threads that agent's
output into the next step**.

```
User Command
   → Main Orchestrator
      → Identify Task
         → Assign to Agent
            → Agent executes
               → Structured output returned
                  → Orchestrator decides next step
```

---

## 1. The Pipeline

| Step | Owner | Input | Output |
|---|---|---|---|
| **0. Explore & write the user story** | **BA Agent** | A module/feature to investigate | `user-stories/US_0NN_{Module}.md` + `specs/{SUITE_ID}-exploration-log.md` |
| 1. Analyse the user story | Orchestrator | The story from Step 0 | `specs/{SUITE_ID}-story-analysis.md` |
| 2. Create the test plan | `playwright-test-planner` | Story analysis | `specs/{SUITE_ID}-test-plan.md` |
| 3. Exploratory testing | Orchestrator (Playwright MCP) | Test plan | `screenshots/{module-slug}/` |
| 4. Generate automation scripts | `playwright-test-generator` | Test plan | `tests/pages/{module}/`, `tests/{N}_{SUITE_ID}/` |
| 5. Execute and heal | `playwright-test-healer` | Spec files | Updated POM/specs, healing log |
| 6. Network & API defect analysis | Orchestrator | Run traffic | `screenshots/{module-slug}/network_requests.txt` |
| 7. Generate QA report | Orchestrator | All of the above | `reports/{SUITE_ID}-test-report.md` + `.xlsx` |

Steps 1–7 are defined in [`master_prompt001.md`](./master_prompt001.md).
Step 0 is defined in [`ba_agent_prompt.md`](./ba_agent_prompt.md).

**Step 0 is not optional when the user story does not yet exist or is stale.** Steps 1–7
consume a user story; they do not produce one. Writing a story from the task description
instead of from the running system is the failure mode this pipeline exists to prevent.

---

## 2. Task Classification & Routing

Match the request against these signals, top to bottom. First match wins.

| If the request… | Route to | Step |
|---|---|---|
| asks what a module/screen/flow **currently does**, or to explore, investigate, document, or understand existing behaviour | **BA Agent** | 0 |
| asks for a **user story**, requirements, acceptance criteria, business rules, validation rules, or field-level specs | **BA Agent** | 0 |
| names a module with no `user-stories/US_*.md` covering it | **BA Agent** | 0 |
| references a story that live exploration shows is **stale or contradicted** | **BA Agent** | 0 (refresh) |
| asks what changed / what's missing / where the **gaps** are in an existing module | **BA Agent** | 0 |
| asks for a **test plan** or test cases, and a current story exists | `playwright-test-planner` | 2 |
| asks to **run exploratory testing** against a plan | Orchestrator + Playwright MCP | 3 |
| asks to **write or generate automation scripts / specs / page objects** | `playwright-test-generator` | 4 |
| asks to **run, fix, heal, or debug failing tests** | `playwright-test-healer` | 5 |
| asks for a **report or defect sheet** | Orchestrator | 7 |
| is a full end-to-end request ("cover module X") | Run 0 → 7 in sequence | all |

### Signal words that mean "BA/System Exploration" → BA Agent

> explore · investigate · understand · document · what does X do · how does X work ·
> current behaviour · existing implementation · as-is · walk through · user story ·
> requirements · acceptance criteria · business rules · validation rules · field
> validations · positive/negative scenarios · edge cases · gaps · impacted areas ·
> dependencies · what's missing

### Ambiguity rule

If a request could be Step 0 or Step 2, **choose Step 0** when any of these hold:

- no user story exists for the module, **or**
- the story exists but has no evidence tags / no "Explored on" date, **or**
- the repo's own docs disagree with each other about the module.

A test plan built on an unverified story propagates the error into every downstream
artefact. Exploring first is always the cheaper mistake.

---

## 3. Delegating to the BA Agent

Hand over a task envelope:

```
TASK:      <what to explore, in one or two sentences>
MODULE:    <module name, or "discover">
SUITE_ID:  <existing suite id, or a new one>
STORY_ID:  <next free US_0NN in user-stories/>
SCOPE:     In: <…>  |  Out: <…>
DEPTH:     recon | standard | deep    (default standard)
LIVE:      yes | no                   (default yes)
```

**Invocation**

- *Claude Code* — delegate to the `ba-agent` subagent (`.claude/agents/ba-agent.md`).
- *GitHub Copilot / VS Code* — invoke the `ba-agent` agent
  (`.github/agents/ba-agent.agent.md`).
- *Manual* — paste `prompts/ba_agent_prompt.md` plus the envelope above.

**Suite ID convention:** `{MODULE_ABBR}_TS001` (e.g. `SAD_TS001`, `FUI_TS001`).
**Story ID convention:** `US_0NN` — next free number in `user-stories/`.
**Spec folder convention:** `tests/{N}_{SUITE_ID}/`, where `N` is the module's pipeline order.

---

## 4. Handling the BA Agent's Return

The BA Agent returns the envelope defined in `ba_agent_prompt.md` §8. The Orchestrator then:

| Envelope contains | Orchestrator action |
|---|---|
| Story written, no blocking questions | Proceed to Step 1 with the new story |
| **Open questions for stakeholders** | **Stop and surface them to the user.** Do not answer them on the BA Agent's behalf — that reintroduces the invented requirement the agent avoided. |
| `[NOT VERIFIED]` areas | Carry them into the test plan as explicitly-blocked cases, so coverage gaps stay visible rather than silently disappearing |
| `[DEFECT]` candidates | Hold for Step 7's defect log; do not file them yet, and do not let them alter the story's "current behaviour" sections |
| `[GAP]` items | Keep separate from current behaviour. Gaps are proposed changes and need stakeholder sign-off before they become testable ACs |
| Contradictions with existing repo docs | Flag to the user — a stale spec/report needs correcting at its source |

---

## 5. Shared Project Context (all agents)

Every agent in this repo reuses the same configuration — no agent creates a parallel
framework.

| Concern | Where |
|---|---|
| App under test | `https://sahyogagentweb.drutam.in:9634` — `nayan.aher@netwinindia.in` / `Sahayog@2025` |
| Browser tooling | Playwright MCP — `.mcp.json` (Claude Code), `.vscode/mcp.json` (VS Code) |
| Test runner config | `playwright.config.ts` — storageState auth via `tests/auth.setup.ts` |
| Architecture & conventions | `QA-AUTOMATION-FRAMEWORK.md` |
| Page objects | `tests/pages/{module}/` — reuse before creating |
| Specs | `tests/{N}_{SUITE_ID}/{feature}.spec.ts` |
| Plans & analysis | `specs/` |
| Stories | `user-stories/` |
| Templates | `templates/` |
| Reports & defect sheets | `reports/` (generators in `scripts/`) |
| Evidence | `screenshots/{module-slug}/` (gitignored) |

---

## 6. Live-Environment Rules (bind every agent, not just the BA Agent)

The app under test is shared and real:

- Application **Cancel** (`POST /endModule/app/cancel/submit`) is irreversible — no undo path exists.
- **Aadhaar / PAN** eKYC hit real verification services; **Driving Licence / Voter ID** are
  real government lookups — negative probes only, never real identifiers.
- Rate limits are real (Forgot User ID locks out for 24 hours after repeated requests).
- Prefer resuming a seeded application (Dashboard → View) over creating new records.
- Never record real applicant PII in any artefact — refer to records by application ID.
