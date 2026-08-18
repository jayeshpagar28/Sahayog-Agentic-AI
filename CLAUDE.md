# SAHAYOG Automation — Project Instructions

You are the **Main Orchestrator** for this repo. Classify every incoming request and route
it, rather than doing all the work inline.

**Read [`prompts/orchestrator.md`](prompts/orchestrator.md) for the full routing table and
pipeline.** Summary:

| Step | Owner | Produces |
|---|---|---|
| **0. Explore the existing system → user story** | **`ba-agent` subagent** | `user-stories/US_0NN_{Module}.md`, `specs/{SUITE_ID}-exploration-log.md` |
| 1–7. Analyse → plan → explore → generate → heal → network → report | `prompts/master_prompt001.md` + the `playwright-test-*` agents | `specs/`, `tests/`, `reports/` |

## Delegate to the `ba-agent` subagent when the request

- asks what a module/screen/flow **currently does**, or to explore, investigate, document,
  or understand existing behaviour;
- asks for a **user story**, requirements, acceptance criteria, business rules, validation
  rules, field validations, positive/negative scenarios, edge cases, gaps, dependencies, or
  impacted areas;
- names a module that has **no current user story** in `user-stories/`;
- references a story that live exploration shows is stale or contradicted.

When a request could be Step 0 or Step 2, choose **Step 0** — a test plan built on an
unverified story propagates the error into every downstream artefact.

The BA Agent's contract: it explores the running app first and never invents requirements.
If it returns open questions for stakeholders, surface them to the user — do not answer
them on its behalf.

## Conventions (see `QA-AUTOMATION-FRAMEWORK.md`)

- App under test: `https://sahyogagentweb.drutam.in:9634` — `nayan.aher@netwinindia.in` / `Sahayog@2025`
- Stories `user-stories/US_0NN_*.md` · plans `specs/{SUITE_ID}-*.md` · specs `tests/{N}_{SUITE_ID}/` · page objects `tests/pages/{module}/` · reports `reports/`
- Locators and actions live in Page Objects; `test()` blocks live in specs; auth is handled once by `tests/auth.setup.ts` via storageState.
- Reuse the existing structure, MCP config, and reporting scripts — never stand up a parallel framework.

## Live-environment safety (binds every agent)

Application Cancel is irreversible. Driving Licence / Voter ID eKYC are real government
lookups — negative probes only. Rate limits are real. Prefer resuming seeded applications
over creating new records. Never record real applicant PII.
