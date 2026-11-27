# S-16 — Search, filter and sort assignments

**Owner:** Ahmad · **Reviewer:** Ali (DL-56)

**Tier:** Committed (DL-19) · **Status:** blocked: E-05 not built · **Plan:** plan.md v03 §7

## What the Student can do
- Search assignments by title.
- Filter by course, submission status and deadline range.
- Sort by deadline.
- Clear everything with one action to get the full list back.

## Requirements
- **PRD:** FR-17 (AC1–AC9) (TA client requirement TA-03). OQ-41 asks whether NFR-01's 3-second target applies here; it is still open in the PRD.
- **Decisions:** DL-41 (date ranges include both end dates).

## Acceptance criteria
FR-17-AC1 to FR-17-AC9.

## Checks to run
- **EP:** "lab" finds "Lab 3" (matches part of the title, ignoring letter case).
- Search and several filters combined → only assignments matching all of them (FR-17-AC5).
- **Range BVA:**
  - a deadline equal to the start date is included;
  - one equal to the end date is included;
  - the day after the end date is excluded.
- A range that ends before it starts is rejected with a message, and the previous results are kept.
- Undated assignments are left out of a range filter and listed last when sorting by deadline (FR-17-E4).
- Submission status "unavailable" is not treated as "not submitted" (FR-17-AC9).
- No matches → an empty-result message, with "clear all filters" still available (FR-17-AC8).
- "Clear all filters" also clears the search text (FR-17-AC7).

## Depends on
The foundation must be merged (E-01 to E-05), including the varied sample data from E-04.

## Context to give the coding agent
- `agent.md` §§2–8 and §12.
- `PRD.md`: FR-17 section.
- `decision-log.md`: DL-41.
- The E-03 API contract and the E-05 list screen.

## Rules for the agent
- The list filtering belongs to this slice. Don't change other slices' detail-page slots.
- No new packages.
- Do not edit `server/.dependency-cruiser.cjs`.

## Files this slice may change (DL-55)
- Only this slice's own folders: `server/src/<module>/<slice-name>/` and `client/src/features/<slice-name>/`.
- Only this slice's marked line in each shared file: the API route list, the client navigation, Planning Core's `index.ts`, and its slot on the assignment detail page.
- A new migration only if the E-03 contract is missing something, using this slice's reserved number, `0012` (`docs/design/data-model.md` §5). The foundation migration `0001` already creates every table, so most slices need no migration.
- **Never** `package.json`, `server/.dependency-cruiser.cjs`, or another slice's folder.
- Merge through a GitHub pull request approved by **Ali**, then squash and merge.

## Branch and merge (DL-22)
- Branch `slice/S-16-search` (suggested name), in your own worktree or clone, with its own test database.
- Bring in `main`; run the tests and `npm run check:boundaries`.
- A peer reviewer who is not the author; merge one at a time.

## Evidence (real results only)
- `evidence/Workflow-Evidence-Log.md`: one row per loop.
- `evidence/Test-Evidence.md`: one row per check.
- Gates 1–4.

**Mode (recommendation):** AFK. **Estimate (recommendation):** 5–7 h.
