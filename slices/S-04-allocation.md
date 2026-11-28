# S-04 — Shortage suggestions and adjustable allocation

**Owner:** Ali · **Reviewer:** Rehan (DL-56)

**Tier:** Committed (DL-19) · **Status:** blocked: S-07 not built (same person) · **Plan:** plan.md v03 §5, §7

## What the Student can do
See how their hours are split across assignments, day by day, and change that split. When hours run short, they see neutral suggestions. The suggestions are **never** ranked, and the system never decides which assignment matters more.

## Requirements
- **PRD:** FR-05-AC4, FR-06 (AC3–AC6), BR-05, N-01, FR-06-E3.
- **Decisions:** DL-33 (R2-A), DL-51 (edit rules).

## Approved rule (R2-A)
- The suggested split is R1-B's daily allocation.
- **Edits:**
  - an edit is stored as an override for that assignment on that day;
  - overrides are placed first and count towards the assignment's effort, and R1-B fills the rest around them;
  - an edit larger than that day's availability, minus other overrides, is rejected with a message;
  - if availability later falls below the overrides, they are kept and the day is flagged **"over-allocated"**.
- **Suggestions** are neutral facts only, such as "add N h of availability between X and Y" or "review the effort entered for A".

## Acceptance criteria
- FR-05-AC4, FR-06-AC3 to AC6.
- **Example (today = Monday; A needs 6 h, due Thursday; B needs 4 h, due Friday; 2 h on each of Monday to Thursday):**
  - The display shows "B: Wednesday 2 h, Thursday 2 h" and "A: Monday 2 h, Tuesday 2 h — short by 2 h before Thursday".
  - Suggestions: "Add 2 h of availability between Monday and Wednesday" or "Review the effort entered for A". Neither is placed above the other.
- **Edit example:** the Student sets A to 2 h on Wednesday.
  - → B gets Thursday 2 + Tuesday 2 → B starts Tuesday.
  - → A gets Wednesday 2 + Monday 2 = 4 of 6 h → no start-by date, short by 2 h.
  - Setting A to 3 h on Wednesday is **rejected**, because Wednesday has only 2 h.

## Checks to run
- Reject all suggestions → the plan is unchanged and the shortage warning stays (FR-06-AC4).
- The edit example: 2 h accepted, 3 h rejected.
- Lower the availability below an override → the override is kept and the day is flagged "over-allocated".
- An edit made during a recalculation is kept (FR-06-AC3).
- Suggestions never rank one assignment above another.

## Depends on
Your own S-07 must be merged first, because S-07 and S-04 both change the start-by calculation.

## Context to give the coding agent
- `agent.md` §§2–8 and §12.
- `plan.md` §5.
- `PRD.md`: FR-05, FR-06 sections; BR-05; N-01.
- `ADR-002` rule 5 (overrides kept separate).
- `decision-log.md`: DL-32, DL-33, DL-48, DL-51.
- The E-03 data model.

## Rules for the agent
- No new packages; use only this slice's migration number.
- Writes to assignments, allocation overrides, subtasks or timer sessions are version-checked: send and check `version`, and return `409 VERSION_CONFLICT` with `current` on a stale write (`docs/design/api-contract.md` §1.1).
- Do not edit `server/.dependency-cruiser.cjs`.
- No deferred behaviour; no Calendar.
- If anything is unclear, stop and ask.

## Files this slice may change (DL-55)
- Only this slice's own folders: `server/src/<module>/<slice-name>/` and `client/src/features/<slice-name>/`.
- Only this slice's marked line in each shared file: the API route list, the client navigation, Planning Core's `index.ts`, and its slot on the assignment detail page.
- A new migration only if the E-03 contract is missing something, using this slice's reserved number, `0005` (`docs/design/data-model.md` §5). The foundation migration `0001` already creates every table, so most slices need no migration.
- **Never** `package.json`, `server/.dependency-cruiser.cjs`, or another slice's folder.
- Merge through a GitHub pull request approved by **Rehan**, then squash and merge.

## Branch and merge (DL-22)
- Branch `slice/S-04-allocation` (suggested name), in your own worktree or clone, with its own test database.
- Bring in `main`; run the tests and `npm run check:boundaries`.
- A peer reviewer who is not the author; merge one at a time.

## Evidence (real results only)
- `evidence/Workflow-Evidence-Log.md`: one row per loop.
- `evidence/Test-Evidence.md`: one row per check.
- Gates 1–4.

**Mode (recommendation):** HITL. **Estimate (recommendation):** 6–8 h.
