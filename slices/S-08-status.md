# S-08 — Assignment status

**Owner:** Ahmad · **Reviewer:** Ali (DL-56)

**Tier:** Committed (DL-19) · **Status:** blocked: E-05 not built · **Plan:** plan.md v03 §7

## What the Student can do
- Mark an assignment **"Already Started"** or **"Not Started"** (the latest choice wins).
- Mark it **"Finished"** themselves.
- See **Submitted** shown separately, as "unavailable" when there is no data. In D4 this comes from labelled sample data, not Classroom.

## Requirements
- **PRD:** FR-09 (AC2, AC3, AC4, AC6), FR-10 (AC2, AC3, AC5 display), FR-07-AC5, BR-08, BR-09.
- **Decisions:** DL-34 (Already Started and Finished count as activity for S-09).

## Scope
- **In:** the three buttons; the separate Submitted display.
- **Out:** the "Got it" pause and reminders (S-17, deferred); Classroom submission detection (S-11, deferred).

## Acceptance criteria
FR-09-AC2, AC3, AC4, AC6; FR-10-AC2, AC3, AC5 (display); FR-07-AC5.

## Checks to run
- Confirming "Already Started" twice changes nothing (FR-09-AC3).
- "Not Started" then "Already Started" → Started; the reverse → Not Started (FR-09-AC6).
- A second browser shows the same status.
- "Unavailable" is never shown as "not submitted" (FR-10-AC2).
- Finished and Submitted are shown separately, and neither overrides the other (FR-10-AC3).

## Depends on
The foundation must be merged (E-01 to E-05).

## Context to give the coding agent
- `agent.md` §§2–8 and §12.
- `PRD.md`: FR-07, FR-09, FR-10 sections; BR-08, BR-09.
- `decision-log.md`: DL-34.
- The E-03 data model and the E-05 detail-page slot for status.

## Rules for the agent
- No notifications and no Classroom calls (agent.md §12).
- No new packages; use only this slice's migration number.
- Do not edit `server/.dependency-cruiser.cjs`.

## Files this slice may change (DL-55)
- Only this slice's own folders: `server/src/<module>/<slice-name>/` and `client/src/features/<slice-name>/`.
- Only this slice's marked line in each shared file: the API route list, the client navigation, Planning Core's `index.ts`, and its slot on the assignment detail page.
- A new migration only if the E-03 contract is missing something, using this slice's reserved number.
- **Never** `package.json`, `server/.dependency-cruiser.cjs`, or another slice's folder.
- Merge through a GitHub pull request approved by **Ali**, then squash and merge.

## Branch and merge (DL-22)
- Branch `slice/S-08-status` (suggested name), in your own worktree or clone, with its own test database.
- Bring in `main`; run the tests and `npm run check:boundaries`.
- A peer reviewer who is not the author; merge one at a time.

## Evidence (real results only)
- `evidence/Workflow-Evidence-Log.md`: one row per loop.
- `evidence/Test-Evidence.md`: one row per check.
- Gates 1–4.

**Mode (recommendation):** AFK. **Estimate (recommendation):** 4–6 h.
