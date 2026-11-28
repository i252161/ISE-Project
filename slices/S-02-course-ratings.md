# S-02 — Rate confidence per course

**Owner:** Ahmad · **Reviewer:** Ali (DL-56)

**Tier:** Committed (DL-19) · **Status:** blocked: E-04 not built · **Plan:** plan.md v03 §7

## What the Student can do
Rate their confidence for each course from 1 to 5, labelled **Very Low, Low, Moderate, High, Very High Confidence**, and change a rating later. A new course appears unrated, and the Student is prompted to rate it.

## Requirements
- **PRD:** FR-14 (AC1; prompt part of AC2; AC5 with sample courses), FR-14-E2, BR-16, NFR-04 (part).
- **Decisions:** DL-41 (labels).

## Scope
- **In:** entering and editing ratings; the prompt for unrated courses.
- **Out:** the "unreliable estimate" flag and re-estimation (both deferred; DL-35).

## Acceptance criteria
- **FR-14-AC1:** each course can be rated 1–5 with the labels, and ratings are kept.
- **FR-14-AC5:** a course with no rating appears unrated and the Student is prompted.
- **FR-14-E2:** an out-of-range value is rejected with a message, and the previous rating is kept.

## Checks to run
- **BVA:** 0 (rejected), 1, 5 (accepted), 6 (rejected).
- **EP:** a value that isn't a whole number (rejected).
- Edit a rating, then reload: the new rating is kept.

## Depends on
The foundation must be merged: E-01 to E-04 (sample courses).

## Context to give the coding agent
- `agent.md` §§2–8 and §12.
- `PRD.md`: FR-14 section, BR-16.
- `decision-log.md`: DL-41.
- The E-03 data model and API contract.

## Rules for the agent
- No new packages.
- Use only this slice's migration number.
- Do not edit `server/.dependency-cruiser.cjs`.
- No AI estimation (DL-35).
- If anything is unclear, stop and ask.

## Files this slice may change (DL-55)
- Only this slice's own folders: `server/src/<module>/<slice-name>/` and `client/src/features/<slice-name>/`.
- Only this slice's marked line in each shared file: the API route list, the client navigation, Planning Core's `index.ts`, and its slot on the assignment detail page.
- A new migration only if the E-03 contract is missing something, using this slice's reserved number, `0003` (`docs/design/data-model.md` §5). The foundation migration `0001` already creates every table, so most slices need no migration.
- **Never** `package.json`, `server/.dependency-cruiser.cjs`, or another slice's folder.
- Merge through a GitHub pull request approved by **Ali**, then squash and merge.

## Branch and merge (DL-22)
- Branch `slice/S-02-ratings` (suggested name), in your own worktree or clone, with its own test database.
- Bring in `main`; run the tests and `npm run check:boundaries`.
- A peer reviewer who is not the author; merge one at a time.

## Evidence (real results only)
- `evidence/Workflow-Evidence-Log.md`: one row per loop.
- `evidence/Test-Evidence.md`: one row per check.
- Gates 1–4 in `evidence/Quality-Gates-Checklist.md`.

**Mode (recommendation):** AFK. **Estimate (recommendation):** 3–4 h.
