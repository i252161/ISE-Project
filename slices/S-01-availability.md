# S-01 — Enter daily study availability

**Owner:** Rehan · **Reviewer:** Subhan (DL-56)

**Tier:** Committed (DL-19) · **Status:** blocked: E-01, E-02, E-03 not built · **Plan:** plan.md v03 §7 · *Recommended first slice.*

## What the Student can do
Enter how many hours they can study on each of the next 7 days (today plus 6), and edit them. Days left blank show **"Unknown"**, never 0.

## Requirements
- **PRD:** FR-03 (AC1, first-seven-days part; AC3), BR-17, RG-42, NFR-04 (part).
- **Decisions:** DL-36 (blank = unknown), DL-41 (limits).

## Scope
- **In:** entering and editing hours for 7 days; a newer value replaces the older one.
- **Out:** the recurring weekly baseline (S-19); recalculating start-by dates (comes with S-03).

## Acceptance criteria
- **FR-03-AC3:** a newer value for a day replaces the earlier one.
- **FR-03-AC1 (first seven days):** a missing entry is treated as unknown, not 0.
- Values persist on the server after a reload.
- **Limits (DL-41):**
  - 0–24 h in steps of 0.5;
  - 0 is allowed and is different from blank;
  - time zone Asia/Karachi, with days starting at midnight.
- *Proposed criterion, needs team approval:* an invalid entry is rejected with a message and the previous value is kept.

## Checks to run
- **BVA:** −0.5 (rejected), 0, 0.5, 23.5, 24 (accepted), 24.5 (rejected).
- **EP:** 1.25 (wrong step), text, blank (stays Unknown).
- Today plus 6 is shown; today plus 7 is not.
- A second browser shows the same values.

## Depends on
The foundation must be merged: E-01, E-02 (demo session) and E-03 (the availability table).

## Context to give the coding agent
- `agent.md` §§2–8 and §12.
- `plan.md` §5 (D-12, D-13 rules).
- `PRD.md`: FR-03 section, BR-17.
- `decision-log.md`: DL-36, DL-41.
- The E-03 data model, API contract and wireframe.

## Rules for the agent
- No new packages.
- Use only this slice's migration number.
- Do not edit `server/.dependency-cruiser.cjs`.
- The API Layer imports only `sessions` from the Data Access Layer.
- No deferred behaviour (agent.md §12).
- If anything is unclear, stop and ask.

## Files this slice may change (DL-55)
- Only this slice's own folders: `server/src/<module>/<slice-name>/` and `client/src/features/<slice-name>/`.
- Only this slice's marked line in each shared file: the API route list, the client navigation, Planning Core's `index.ts`, and its slot on the assignment detail page.
- A new migration only if the E-03 contract is missing something, using this slice's reserved number, `0002` (`docs/design/data-model.md` §5). The foundation migration `0001` already creates every table, so most slices need no migration.
- **Never** `package.json`, `server/.dependency-cruiser.cjs`, or another slice's folder.
- Merge through a GitHub pull request approved by **Subhan**, then squash and merge.

## Branch and merge (DL-22)
- Branch `slice/S-01-availability` (suggested name), in your own worktree or clone, with its own test database.
- Bring in `main`; run the tests and `npm run check:boundaries`.
- A teammate other than the author reviews, runs the checks and decides Accept / Revise / Reject.
- Merge one at a time.

## Evidence (real results only)
- `evidence/Workflow-Evidence-Log.md`: one row per loop, with every field.
- `evidence/Test-Evidence.md`: one row per check above.
- `evidence/Quality-Gates-Checklist.md`: Gates 1–4 for this slice, with the Gate 3 command output.

**Mode (recommendation):** HITL — the team's first full loop. **Estimate (recommendation):** 5–7 h.
