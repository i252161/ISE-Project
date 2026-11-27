# E-04 — Sample data

**Type:** setup task (not a slice) · **Status:** blocked: E-01 and E-03 not built · **Plan:** plan.md v03 §8 · **Decisions:** DL-28, DL-41, DL-47, DL-55
**Owner:** Subhan · **Reviewer:** Ahmad (DL-56)

## What this is
There is no Google Classroom in D4, so a script loads made-up courses and assignments. The app clearly labels them as **sample data**.

## What must exist when it is done
- Seed code inside the Data Access Layer, at `server/src/data-access/seed/`. It is **not** a migration.
- The command `npm run seed:sample` in `server/`. It can be run again safely and reloads the sample rows for the demo Student.
- At least **50 assignments across 5 courses**, including:
  - assignments with no deadline (needed by S-10);
  - mixed statuses: not started, started, Finished, Submitted, and submission "unavailable";
  - deadlines spread across the next weeks, including the same day for two assignments, today, and the past (needed by S-03 and S-16);
  - titles that make search testable, for example "Lab 3" (needed by S-16).
- Rows marked as sample data, as the E-03 data model specifies.
- **Every field filled (DL-55),** so slices can be built without waiting for each other:
  - availability for the next days, with some days left blank;
  - course ratings, with one course unrated;
  - every status (Already Started, Not Started, Finished, Submitted, unavailable);
  - effort entries;
  - dated progress / remaining-hours reports, including a course with no activity for 9 days.

## Acceptance checks
- Running `npm run seed:sample` twice gives the same data, with no duplicates.
- The counts match: at least 50 assignments and 5 courses.
- Undated assignments and every status are present.

## Context to give the coding agent
- `agent.md` §§2–8 and §12; §6 rules 11–12 (only the Data Access Layer runs SQL).
- `decision-log.md`: DL-28, DL-41, DL-47.
- The E-03 data model.

## Rules for the agent
- No Classroom calls.
- Use only the migration number E-03 assigned, if any.
- Do not edit `server/.dependency-cruiser.cjs`.

## Branch and merge
- Branch `setup/E-04-sample-data` (suggested name), in your own worktree or clone with its own test database.
- Run the tests and `npm run check:boundaries`.
- A peer reviewer who is not the author; merge one at a time.

## Evidence (real results only)
- `evidence/Workflow-Evidence-Log.md`: one row.
- `evidence/Test-Evidence.md`: one row per check.
- Gate 3 output.

**Mode (recommendation):** AFK. **Estimate (recommendation):** 2–3 h.
