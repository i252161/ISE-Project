# Quality Gates Checklist (D4 Gates 1–5)

**Project:** AI Academic Deadline Planner (D4)
**Required by:** Testing Instructions and Quality Gates (D4), section "Quality Gates".

## How to use this checklist

- Copy the "Per-slice record" table once for each slice and tick the boxes only after the check has really been done.
- Link the evidence in each row (a `Test-Evidence.md` row, a `Workflow-Evidence-Log.md` row, or a commit).
- These course gates (1–5) are **not** the feasibility tests called "Gates 1–3" in `decision-log.md`. In `plan.md` those are renamed F1–F3.
- During the demo the team may be asked to show how a slice passed its gates, so keep failed attempts and re-tests.

## Gate definitions (from the D4 Testing Instructions)

| Gate | When | Minimum pass condition | If the gate fails |
|---|---|---|---|
| Gate 1: Slice Readiness | Before implementation | The slice has clear scope, linked requirement(s) and acceptance criteria | Clarify or update the plan, PRD or context before coding |
| Gate 2: Functional Verification | After the slice is implemented | Core behaviour works; important negative cases are handled; relevant EP/BVA cases pass where they apply | Revise the slice and repeat testing |
| Gate 3: Architecture / Constraint Check | Before integration | No obvious violation of the architecture, ADRs, AGENTS.md or agreed constraints | Revise the implementation, or update the approved artefacts if the design legitimately changed |
| Gate 4: Regression / Integration Check | Before accepting the slice | The new slice does not obviously break previously accepted functionality and integrates correctly | Fix the integration issue before acceptance |
| Gate 5: Final Product Check | After all planned slices | Main end-to-end flows work; the promised scope is demonstrable; important edge cases and selected NFRs are reasonably verified | Resolve critical failures before the final demo |

## Per-slice record (copy for each slice)

**Slice:** ________ **plan.md version:** ________

| Gate | Check | Done? | Evidence link | Notes |
|---|---|---|---|---|
| 1 | Scope written | ☐ | | |
| 1 | Requirement IDs linked | ☐ | | |
| 1 | Acceptance criteria clear | ☐ | | |
| 1 | Blocking open decisions (`plan.md` §4) resolved | ☐ | | |
| 2 | Core behaviour checked by a team member | ☐ | | |
| 2 | Important negative cases checked | ☐ | | |
| 2 | Relevant EP/BVA cases checked (or "not applicable" with reason) | ☐ | | |
| 3 | Boundary check (dependency-cruiser) passes | ☐ | | |
| 3 | Only the 11 agreed backend modules/interfaces used | ☐ | | |
| 3 | No prohibited technology (agent.md §7.1) | ☐ | | |
| 3 | Only the Data Access Layer touches PostgreSQL | ☐ | | |
| 3 | Any design change recorded in the ADR or decision log | ☐ | | |
| 4 | Previously accepted slices re-checked | ☐ | | |
| 4 | Merged and runs from a clean start (migrations apply) | ☐ | | |

## Final product record (Gate 5)

| Check | Done? | Evidence link | Notes |
|---|---|---|---|
| Main end-to-end flows work | ☐ | | |
| Promised (committed) scope is demonstrable | ☐ | | |
| Important edge cases checked | ☐ | | |
| Selected NFRs measured (for example NFR-01 timing, NFR-04 onboarding), with actual values recorded | ☐ | | |
| Critical failures resolved, or listed as known issues | ☐ | | |
