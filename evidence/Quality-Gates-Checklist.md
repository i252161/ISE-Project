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

## Record: E-03 Stage 3 design artefacts

**Slice:** E-03 **plan.md version:** v03

| Gate | Check | Done? | Evidence link | Notes |
|---|---|---|---|---|
| 1 | Scope written | ☐ | | |
| 1 | Requirement IDs linked | ☐ | | |
| 1 | Acceptance criteria clear | ☐ | | |
| 1 | Blocking open decisions (`plan.md` §4) resolved | ☐ | | |
| 2 | Core behaviour checked by a team member | ☐ | | Re-run on a Windows team machine by Claude for the reviewer; Subhan to confirm |
| 2 | Important negative cases checked | ☐ | | |
| 2 | Relevant EP/BVA cases checked (or "not applicable" with reason) | ☐ | | |
| 3 | Boundary check (dependency-cruiser) passes | ☑ | `Test-Evidence.md`, row "E-03 / Gate 3" | 27 modules, 21 dependencies, no violations |
| 3 | Only the 11 agreed backend modules/interfaces used | ☑ | `ls server/src` | 11 module folders; `recalculate.ts` is a file inside Planning Core, exported through its `index.ts` |
| 3 | No prohibited technology (agent.md §7.1) | ☑ | `git diff` | No `package.json` change; advisory lock is plain PostgreSQL |
| 3 | Only the Data Access Layer touches PostgreSQL | ☑ | search for `from 'pg'` outside `data-access` | No matches |
| 3 | Any design change recorded in the ADR or decision log | ☐ | `api-contract.md` §1.1 | Version-checked write rule is in the contract; **still needs a decision-log entry (proposed DL-57)** |
| 4 | Previously accepted slices re-checked | ☐ | | No slice accepted yet |
| 4 | Merged and runs from a clean start (migrations apply) | ☐ | | Migrations apply from empty in the tests; tick after merge |

## Record: E-02 Demo Student session

**Slice:** E-02 **plan.md version:** v03

| Gate | Check | Done? | Evidence link | Notes |
|---|---|---|---|---|
| 1 | Scope written | ☐ | | |
| 1 | Requirement IDs linked | ☐ | | |
| 1 | Acceptance criteria clear | ☐ | | |
| 1 | Blocking open decisions (`plan.md` §4) resolved | ☐ | | |
| 2 | Core behaviour checked by a team member | ☐ | `Test-Evidence.md`, rows "E-02 / … (review)" | Re-run on a Windows team machine by Claude for Ali; tick when Ali confirms |
| 2 | Important negative cases checked | ☐ | | Negative tests exist (AC4 to AC9, AC14); tick after the team re-run |
| 2 | Relevant EP/BVA cases checked (or "not applicable" with reason) | ☐ | | |
| 3 | Boundary check (dependency-cruiser) passes | ☑ | `Test-Evidence.md`, rows "E-02 / Gate 3" and "E-02 / Gate 3 (review)" | Re-run in review on top of E-03: 32 modules, 35 dependencies, no violations |
| 3 | Only the 11 agreed backend modules/interfaces used | ☑ | `ls server/src` | 11 module folders, none added; the API Layer imports only `sessions` from `data-access` (`api-layer/index.ts` line 3) |
| 3 | No prohibited technology (agent.md §7.1) | ☑ | `git diff` | No `package.json` change; tests use Vitest; no cache, broker, queue or push transport added |
| 3 | Only the Data Access Layer touches PostgreSQL | ☑ | search for `from 'pg'` outside `data-access` | No matches |
| 3 | Any design change recorded in the ADR or decision log | ☑ | `docs/design/api-contract.md` §0 | The only addition, the opt-in `Secure` cookie flag, is recorded in the contract. DL-27 and DL-44 unchanged |
| 4 | Previously accepted slices re-checked | ☐ | | No slice accepted yet; whole suite passes (31 of 31, 5 of 5 runs, in review) |
| 4 | Merged and runs from a clean start (migrations apply) | ☐ | | Migrations apply from empty in the tests; tick after merge |

## Record: E-01 Walking skeleton (setup task)

**Slice:** E-01 **plan.md version:** v03

| Gate | Check | Done? | Evidence link | Notes |
|---|---|---|---|---|
| 1 | Scope written | ☑ | `slices/E-01-walking-skeleton.md` | |
| 1 | Requirement IDs linked | ☑ | `slices/E-01-walking-skeleton.md` | DL-29, DL-30, DL-44, DL-45, DL-46, DL-55 |
| 1 | Acceptance criteria clear | ☑ | `slices/E-01-walking-skeleton.md` | |
| 1 | Blocking open decisions (`plan.md` §4) resolved | ☐ | | No record that the TypeScript skill check (DL-42), required before E-01, was done |
| 2 | Core behaviour checked by a team member | ☐ | `Test-Evidence.md`, rows "E-01" | Database test, boundary check and build re-run by Claude for Ali on Ali's machine; server/client start reported by Antigravity only. Tick after Rehan's review |
| 2 | Important negative cases checked | ☐ | `Test-Evidence.md`, row "E-01 / Gate 3 forbidden import" | Agent-reported only; re-run needed |
| 2 | Relevant EP/BVA cases checked (or "not applicable" with reason) | ☑ | | Not applicable: E-01 has no user input |
| 3 | Boundary check (dependency-cruiser) passes | ☑ | `Test-Evidence.md`, row "E-01 / Gate 3 boundaries" | No dependency violations (24 modules, 17 dependencies), local repository and fresh clone |
| 3 | Only the 11 agreed backend modules/interfaces used | ☑ | `ls server/src` | Exactly 11 module folders, each with one `index.ts`; `main.ts` imports only `api-layer`; the API Layer imports only `sessions` from `data-access` |
| 3 | No prohibited technology (agent.md §7.1) | ☑ | `server/package.json`, `client/package.json` | fastify, @fastify/cookie, pg, react, react-dom; dev: typescript, vite, vitest, dependency-cruiser, embedded-postgres, type packages |
| 3 | Only the Data Access Layer touches PostgreSQL | ☑ | `server/.dependency-cruiser.cjs` | `pg` and `embedded-postgres` are used only inside `data-access` |
| 3 | Any design change recorded in the ADR or decision log | ☐ | | Docker (DL-23) replaced by `embedded-postgres`: not yet recorded in `decision-log.md` |
| 4 | Previously accepted slices re-checked | ☑ | | Not applicable: E-01 is the first code merged |
| 4 | Merged and runs from a clean start (migrations apply) | ☑ | PR #4, `22082bd` | Fresh clone: `npm ci`, tests 2 of 2 and the boundary check passed before the push. Merged without a peer review |

## Record: E-04 Sample data

**Slice:** E-04 **plan.md version:** v03

| Gate | Check | Done? | Evidence link | Notes |
|---|---|---|---|---|
| 3 | Boundary check (dependency-cruiser) passes | ☑ | `Test-Evidence.md`, row "E-04 / Gate 3" | 36 modules, 50 dependencies, no violations |
| 3 | Only the 11 agreed backend modules/interfaces used | ☑ | `ls server/src` | All new code is inside `data-access/seed/` |
| 3 | No prohibited technology (agent.md §7.1) | ☑ | `git diff` | Only `package.json` change is the `seed:sample` script the slice card requires; no new package |
| 3 | Only the Data Access Layer touches PostgreSQL | ☑ | search for `from 'pg'` outside `data-access` | No matches |
| 3 | Seeding is code, not a migration (agent.md §8.2, DL-47) | ☑ | `server/src/data-access/migrations/` | No migration added |
| 3 | Any design change recorded in the ADR or decision log | ☑ | `decision-log.md` DL-58 | |
| 4 | Previously accepted slices re-checked | ☐ | | Whole suite passes (48 of 48, 5 of 5 runs); tick after review |
| 4 | Merged and runs from a clean start (migrations apply) | ☐ | | Tick after merge |

## Record: E-05 Assignment list and detail

**Slice:** E-05 **plan.md version:** v03

| Gate | Check | Done? | Evidence link | Notes |
|---|---|---|---|---|
| 3 | Boundary check (dependency-cruiser) passes | ☑ | `Test-Evidence.md`, row "E-05 / Gate 3" | 42 modules, 66 dependencies, no violations |
| 3 | Only the 11 agreed backend modules/interfaces used | ☑ | `ls server/src` | New folders are inside existing modules: `api-layer/assignments/`, `planning-core/assignments/`; file `data-access/assignments.ts` |
| 3 | No prohibited technology (agent.md §7.1) | ☑ | `git diff` | No `package.json` change; no router package |
| 3 | Only the Data Access Layer touches PostgreSQL | ☑ | search for `from 'pg'` outside `data-access` | No matches |
| 3 | API Layer → Data Access Layer is sessions only (agent.md §4.3) | ☑ | `api-layer/index.ts` line 3 | Assignment reads go through Planning Core |
| 3 | No academic data stored on the device (DL-11) | ☑ | `client/src/features/assignments/` | No `localStorage` or IndexedDB; requests use `cache: 'no-store'`; the service worker skips `/api/` |
| 3 | Any design change recorded in the ADR or decision log | ☑ | `decision-log.md` DL-59; `api-contract.md` §4 notes | |
| 4 | Previously accepted slices re-checked | ☐ | | Whole suite passes (62 of 62, 5 of 5 runs); tick after review |
| 4 | Merged and runs from a clean start (migrations apply) | ☐ | | Tick after merge |
