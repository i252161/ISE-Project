# S-07 — Report remaining hours

**Owner:** Ali · **Reviewer:** Rehan (DL-56)

**Tier:** Committed (DL-19) · **Status:** blocked: S-03 not built (same person) · **Plan:** plan.md v03 §7

## What the Student can do
Tell the planner how many hours of work are left on an assignment. Their start-by dates and shortages are recalculated. Missing progress is treated as **unknown**, never as "no work".

## Requirements
- **PRD:** FR-07 (AC1–AC4, AC6), FR-03-AC5, BR-03.
- **Decisions:** DL-38 (report content), DL-50 (how a report feeds planning), DL-34 (a report counts as activity for S-09).

## Approved rules
- A report stores remaining hours (0 or more, steps of 0.5, maximum 200) with a timestamp. The latest report replaces older ones.
- Planning uses whichever was saved **most recently**: the effort entry or the latest report (DL-50).
- A report of 0 takes no hours and gives no start-by date. **The status does not change**; the Student marks Finished in S-08.

## Acceptance criteria
- FR-07-AC1 to AC4, FR-07-AC6, FR-03-AC5.
- **Example:** effort 6 h entered on Monday; 4 h remaining reported on Tuesday → planning uses 4 h. The effort is then edited to 5 h on Wednesday → planning uses 5 h.

## Checks to run
- **BVA:** −0.5 (rejected), 0, 0.5, 199.5, 200 (accepted), 200.5 (rejected).
- The latest report replaces older ones, and an older report arriving later is ignored (FR-07-AC4).
- The DL-50 example above.
- 0 remaining → no hours taken, status unchanged.
- Remaining hours that don't fit before the deadline → a shortage (FR-07-AC6).

## Depends on
Your own S-03 must be merged first.

## Context to give the coding agent
- `agent.md` §§2–8 and §12.
- `plan.md` §5.
- `PRD.md`: FR-07 section; BR-03.
- `decision-log.md`: DL-32, DL-38, DL-50.
- The E-03 data model.

## Rules for the agent
- No new packages; use only this slice's migration number.
- Call `recalculateStudentPlan(studentId)` from `planning-core/index.ts` after the write (`docs/design/data-model.md` §3). It is a no-op until S-03 merges.
- Do not edit `server/.dependency-cruiser.cjs`.
- If anything is unclear, stop and ask.

## Files this slice may change (DL-55)
- Only this slice's own folders: `server/src/<module>/<slice-name>/` and `client/src/features/<slice-name>/`.
- Only this slice's marked line in each shared file: the API route list, the client navigation, Planning Core's `index.ts`, and its slot on the assignment detail page.
- A new migration only if the E-03 contract is missing something, using this slice's reserved number, `0006` (`docs/design/data-model.md` §5). The foundation migration `0001` already creates every table, so most slices need no migration.
- **Never** `package.json`, `server/.dependency-cruiser.cjs`, or another slice's folder.
- Merge through a GitHub pull request approved by **Rehan**, then squash and merge.

## Branch and merge (DL-22)
- Branch `slice/S-07-remaining-hours` (suggested name), in your own worktree or clone, with its own test database.
- Bring in `main`; run the tests and `npm run check:boundaries`.
- A peer reviewer who is not the author; merge one at a time.

## Evidence (real results only)
- `evidence/Workflow-Evidence-Log.md`: one row per loop.
- `evidence/Test-Evidence.md`: one row per check.
- Gates 1–4.

**Mode (recommendation):** HITL-light. **Estimate (recommendation):** 3–5 h.
