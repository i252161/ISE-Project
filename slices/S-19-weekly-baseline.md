# S-19 — Recurring weekly availability baseline (reserve)

**Owner:** Subhan · **Reviewer:** Ahmad (DL-56)

**Tier:** Reserve (DL-19). Build this only when the team starts it, normally to replace a committed slice that slips.
**Status:** blocked: S-01 not built · **Plan:** plan.md v03 §7

## What the Student can do
Set a weekly pattern, for example "Mondays 2 h", and confirm it. Days **from one week ahead onward** that have no entry use the pattern and are labelled **"baseline"**. Without a pattern, those days stay unknown.

## Requirements
- **PRD:** FR-03 second sentence ("shall also support an explicitly Student-confirmed recurring future availability baseline"), FR-03-AC6, FR-03-E1, BR-17.
- **Decisions:** DL-36, DL-53.

## Approved rule (DL-53)
- One value per weekday, Monday to Sunday, each 0–24 h in steps of 0.5, or blank. A blank weekday stays unknown.
- Applies only to days from today + 7 onward that have no individual entry.
- Saved only after an explicit **"Use this weekly pattern"** confirmation.
- Clearing the pattern returns those days to unknown.

## Acceptance criteria
- FR-03-AC6.
- **Example:** the pattern sets Monday 2 h and leaves Tuesday blank.
  - A Monday at today + 7 with no entry → 2 h, labelled "baseline".
  - A Tuesday at today + 8 with no entry → unknown.
  - Any day from today to today + 6 with no entry → unknown.

## Checks to run
- **Boundary:** today + 6 stays unknown; today + 7 uses the pattern.
- An entered day overrides the pattern.
- A blank weekday stays unknown.
- Without the confirmation, nothing is saved.
- **Value BVA:** −0.5, 0, 24, 24.5.

## Depends on
Rehan's S-01 must be merged. Build this only if the team agrees that a committed slice has slipped.

## Context to give the coding agent
- `agent.md` §§2–8 and §12.
- `PRD.md`: FR-03 section; BR-17.
- `decision-log.md`: DL-36, DL-41, DL-53.
- The E-03 data model.

## Rules for the agent
- No new packages; use only this slice's migration number.
- Do not edit `server/.dependency-cruiser.cjs`.

## Files this slice may change (DL-55)
- Only this slice's own folders: `server/src/<module>/<slice-name>/` and `client/src/features/<slice-name>/`.
- Only this slice's marked line in each shared file: the API route list, the client navigation, Planning Core's `index.ts`, and its slot on the assignment detail page.
- A new migration only if the E-03 contract is missing something, using this slice's reserved number, `0013` (`docs/design/data-model.md` §5). The foundation migration `0001` already creates every table, so most slices need no migration.
- **Never** `package.json`, `server/.dependency-cruiser.cjs`, or another slice's folder.
- Merge through a GitHub pull request approved by **Ahmad**, then squash and merge.

## Branch and merge (DL-22)
- Branch `slice/S-19-baseline` (suggested name), in your own worktree or clone, with its own test database.
- Bring in `main`; run the tests and `npm run check:boundaries`.
- A peer reviewer who is not the author; merge one at a time.

## Evidence (real results only)
- `evidence/Workflow-Evidence-Log.md`: one row per loop.
- `evidence/Test-Evidence.md`: one row per check.
- Gates 1–4.

**Mode (recommendation):** HITL-light. **Estimate (recommendation):** 3–4 h.
