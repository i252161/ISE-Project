# S-10 — Give an undated assignment a deadline

**Owner:** Subhan · **Reviewer:** Ahmad (DL-56)

**Tier:** Committed (DL-19) · **Status:** blocked: E-04, E-05 not built · **Plan:** plan.md v03 §7

## What the Student can do
See the assignments that have no deadline and give one a deadline of their own. That date is labelled as **Student-entered**, and the start-by date is recalculated.

## Requirements
- **PRD:** FR-02 (AC1, AC2, AC5), BR-02.
- **Decisions:** DL-37 (planning uses this date when the assignment is undated), DL-40 (date limits).

## Scope
- **In:** entering and changing a manual deadline on sample undated assignments.
- **Out:** an official deadline arriving later from Classroom (FR-02 AC3, AC4 and AC6; deferred to S-12).

## Approved rules
- A manual deadline may be today or later.
- Yesterday or earlier is rejected with a message.
- A deadline of today leaves no planning days, so the result is a shortage.
- Only the current manual deadline is kept; there is no history (FR-02-AC5).

## Acceptance criteria
FR-02-AC1, FR-02-AC2, FR-02-AC5; BR-02 (the date is labelled as Student-entered).

## Checks to run
- **Date BVA:** yesterday (rejected), today (accepted → shortage), tomorrow (accepted).
- A blank or invalid date is rejected; the assignment stays visible and undated (FR-02-AC2).
- Changing the date keeps only the new one and recalculates the start-by date (FR-02-AC5).

## Depends on
The foundation must be merged (E-01 to E-05).

When the deadline changes, call the **placeholder recalculation** named in E-03. S-03 replaces it with the real calculation.

**This slice is accepted only after integration check I-1:** re-run the FR-02-AC5 recalculation check once S-03 is merged.

## Context to give the coding agent
- `agent.md` §§2–8 and §12.
- `PRD.md`: FR-02 section; BR-02.
- `decision-log.md`: DL-37, DL-40.
- The E-03 data model.

## Rules for the agent
- No Classroom calls.
- No new packages; use only this slice's migration number.
- Do not edit `server/.dependency-cruiser.cjs`.

## Files this slice may change (DL-55)
- Only this slice's own folders: `server/src/<module>/<slice-name>/` and `client/src/features/<slice-name>/`.
- Only this slice's marked line in each shared file: the API route list, the client navigation, Planning Core's `index.ts`, and its slot on the assignment detail page.
- A new migration only if the E-03 contract is missing something, using this slice's reserved number.
- **Never** `package.json`, `server/.dependency-cruiser.cjs`, or another slice's folder.
- Merge through a GitHub pull request approved by **Ahmad**, then squash and merge.

## Branch and merge (DL-22)
- Branch `slice/S-10-manual-deadline` (suggested name), in your own worktree or clone, with its own test database.
- Bring in `main`; run the tests and `npm run check:boundaries`.
- A peer reviewer who is not the author; merge one at a time.

## Evidence (real results only)
- `evidence/Workflow-Evidence-Log.md`: one row per loop.
- `evidence/Test-Evidence.md`: one row per check.
- Gates 1–4.

**Mode (recommendation):** AFK. **Estimate (recommendation):** 3–4 h.
