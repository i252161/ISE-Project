# S-15 — Study timer

**Owner:** Subhan · **Reviewer:** Ahmad (DL-56)

**Tier:** Committed (DL-19) · **Status:** blocked: E-05 not built · **Plan:** plan.md v03 §7

## What the Student can do
Start, pause, resume and stop a study timer for an assignment. **Every stopped session is saved with its duration, including 0 seconds.** The total recorded study time is shown separately from the effort figures and never changes them.

## Requirements
- **PRD:** FR-16 (AC1–AC9), BR-21 (TA client requirement TA-02).
- **Decisions:** DL-16 (timer state on the server), DL-43 (save every stopped session; FR-16-AC4), DL-34 (timer sessions are **not** activity for S-09).

## Acceptance criteria
FR-16-AC1 to FR-16-AC9. In particular, FR-16-AC4: a stopped session is saved with its duration.

## Checks to run
- Stop immediately (0 s) → saved with 0 s. Stop after 1 s → saved.
- Paused time is not counted (FR-16-AC5). Use a controllable clock in tests.
- A second timer can't start while one is running (FR-16-AC8).
- Close the browser while running, then return → it kept counting from its recorded start (FR-16-AC9).
- Two devices show the same timer state (FR-16-E4).
- Total recorded time = the sum of saved sessions (FR-16-AC6). Effort and remaining hours are unchanged (FR-16-AC7).

## Depends on
The foundation must be merged (E-01 to E-05).

## Context to give the coding agent
- `agent.md` §§2–8 and §12; §5 (time is computed on the server from stored timestamps, never a client timer).
- `PRD.md`: FR-16 section; BR-21.
- `ADR-002` (data ownership: timer state).
- `decision-log.md`: DL-16, DL-43.
- The E-03 data model and the E-05 detail-page slot for the timer.

## Rules for the agent
- No timer state stored on the device.
- No new packages; use only this slice's migration number.
- Writes to assignments, allocation overrides, subtasks or timer sessions are version-checked: send and check `version`, and return `409 VERSION_CONFLICT` with `current` on a stale write (`docs/design/api-contract.md` §1.1).
- Do not edit `server/.dependency-cruiser.cjs`.

## Files this slice may change (DL-55)
- Only this slice's own folders: `server/src/<module>/<slice-name>/` and `client/src/features/<slice-name>/`.
- Only this slice's marked line in each shared file: the API route list, the client navigation, Planning Core's `index.ts`, and its slot on the assignment detail page.
- A new migration only if the E-03 contract is missing something, using this slice's reserved number, `0011` (`docs/design/data-model.md` §5). The foundation migration `0001` already creates every table, so most slices need no migration.
- **Never** `package.json`, `server/.dependency-cruiser.cjs`, or another slice's folder.
- Merge through a GitHub pull request approved by **Ahmad**, then squash and merge.

## Branch and merge (DL-22)
- Branch `slice/S-15-timer` (suggested name), in your own worktree or clone, with its own test database.
- Bring in `main`; run the tests and `npm run check:boundaries`.
- A peer reviewer who is not the author checks the time calculations; merge one at a time.

## Evidence (real results only)
- `evidence/Workflow-Evidence-Log.md`: one row per loop.
- `evidence/Test-Evidence.md`: one row per check.
- Gates 1–4.

**Mode (recommendation):** AFK, with a HITL review of the time calculations. **Estimate (recommendation):** 6–8 h.
