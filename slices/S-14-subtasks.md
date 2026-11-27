# S-14 — Subtasks

**Owner:** Rehan · **Reviewer:** Subhan (DL-56)

**Tier:** Committed (DL-19) · **Status:** blocked: E-05 not built · **Plan:** plan.md v03 §7

## What the Student can do
Break an assignment into smaller items: add, rename, tick off, un-tick and delete them. The assignment list shows progress such as **"2 of 5"**. Ticking subtasks **never** changes the assignment's Started, Finished or Submitted status.

## Requirements
- **PRD:** FR-15 (AC1–AC9), BR-20 (TA client requirement TA-01).
- **Decisions:** DL-41 (title limit).

## Acceptance criteria
FR-15-AC1 to FR-15-AC9.

## Checks to run
- **Title BVA (after trimming spaces):**
  - 0 characters (empty) → rejected;
  - 1 → accepted;
  - 200 → accepted;
  - 201 → rejected.
- A title of only spaces is rejected with a message (FR-15-AC8).
- All subtasks complete → status unchanged (FR-15-AC6).
- No subtasks → no "0 of 0" shown (FR-15-E4).
- Un-tick a completed subtask → the count goes down (FR-15-E8).
- Delete a subtask → the count and total are recalculated (FR-15-AC3).
- The same subtask changed in two browser tabs → the latest save wins and nothing is lost silently (FR-15-AC9).

## Depends on
The foundation must be merged (E-01 to E-05).

## Context to give the coding agent
- `agent.md` §§2–8 and §12.
- `PRD.md`: FR-15 section; BR-20.
- `decision-log.md`: DL-41.
- The E-03 data model and the E-05 detail-page slot for subtasks.

## Rules for the agent
- Subtasks live in Planning Core and must not change status, effort or start-by dates (agent.md §5).
- No new packages; use only this slice's migration number.
- Do not edit `server/.dependency-cruiser.cjs`.

## Files this slice may change (DL-55)
- Only this slice's own folders: `server/src/<module>/<slice-name>/` and `client/src/features/<slice-name>/`.
- Only this slice's marked line in each shared file: the API route list, the client navigation, Planning Core's `index.ts`, and its slot on the assignment detail page.
- A new migration only if the E-03 contract is missing something, using this slice's reserved number.
- **Never** `package.json`, `server/.dependency-cruiser.cjs`, or another slice's folder.
- Merge through a GitHub pull request approved by **Subhan**, then squash and merge.

## Branch and merge (DL-22)
- Branch `slice/S-14-subtasks` (suggested name), in your own worktree or clone, with its own test database.
- Bring in `main`; run the tests and `npm run check:boundaries`.
- A peer reviewer who is not the author; merge one at a time.

## Evidence (real results only)
- `evidence/Workflow-Evidence-Log.md`: one row per loop.
- `evidence/Test-Evidence.md`: one row per check.
- Gates 1–4.

**Mode (recommendation):** AFK. **Estimate (recommendation):** 5–7 h.
