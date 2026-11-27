# S-09 — Course-balance and start-by warnings

**Owner:** Rehan · **Reviewer:** Subhan (DL-56)

**Tier:** Committed (DL-19) · **Status:** blocked: E-04, E-05 not built · **Plan:** plan.md v03 §5, §7

## What the Student can do
See an early, carefully worded notice when a course may be getting too little attention. The notice is shown separately from urgent start-by warnings. The app **never** claims "no work was done"; it says progress is unknown.

## Requirements
- **PRD:** FR-08 (AC1–AC6), BR-03, BR-10.
- **Decisions:** DL-34 (R3-A, activity, the 3-day advisory), DL-52 (counting).

## Approved rules
**Possible-imbalance notice (R3-A).** Shown for a course when all three hold:
1. it has an unfinished, unsubmitted assignment whose start-by date is within the next 3 days or has passed;
2. none of its assignments has had activity in the last 7 days;
3. at least one other course has had activity in that time.

**Activity** means marking an assignment Already Started or Finished (S-08), or a progress or remaining-hours report (S-07). **Timer sessions are not activity.**

**3-day advisory (DL-52):**
- Days without activity = today minus the later of the start-by date and the last activity date (Asia/Karachi days).
- Shown once the start-by date has passed and the count is 3 or more.
- Any activity restarts the count.
- This is the team's approved reading of FR-08; the PRD text is unchanged.

## Acceptance criteria
- FR-08-AC1 to AC6.
- **Example:** Math has a start-by date in 2 days and its last activity was 9 days ago. Physics had activity yesterday. English has nothing upcoming.
  - → **only Math** gets a notice, for example "No recent progress logged for Math — you may not have recorded it."

## Checks to run
- **Advisory BVA** (start-by Monday, no activity): Wednesday 2 → no; Thursday 3 → yes; Friday 4 → yes.
- Any activity restarts the count; a timer session does not.
- The wording never says "no work was done".
- A balance notice and an urgent start-by warning are shown as two separate, labelled messages (FR-08-AC3).
- "Not Started" plus a passed start-by date → a clear "confirmed not started" warning (FR-08-AC5).

## Depends on
The foundation must be merged (E-01 to E-05).

Build and test against the **sample status and progress data** (E-04) and **fixture start-by dates** in your tests, so you do **not** wait for S-03, S-07 or S-08.

**This slice is accepted only after integration check I-1:** once S-03 is merged, re-run the checks that need real start-by dates.

## Context to give the coding agent
- `agent.md` §§2–8 and §12.
- `plan.md` §5.
- `PRD.md`: FR-08 section; BR-03, BR-10.
- `ADR-002` (progress evidence is Observed or Unknown).
- `decision-log.md`: DL-34, DL-52.

## Rules for the agent
- Notices appear inside the app only, with no device notifications (BR-19, agent.md §12).
- No new packages; use only this slice's migration number.
- Do not edit `server/.dependency-cruiser.cjs`.

## Files this slice may change (DL-55)
- Only this slice's own folders: `server/src/<module>/<slice-name>/` and `client/src/features/<slice-name>/`.
- Only this slice's marked line in each shared file: the API route list, the client navigation, Planning Core's `index.ts`, and its slot on the assignment detail page.
- A new migration only if the E-03 contract is missing something, using this slice's reserved number.
- **Never** `package.json`, `server/.dependency-cruiser.cjs`, or another slice's folder.
- Merge through a GitHub pull request approved by **Subhan**, then squash and merge.

## Branch and merge (DL-22)
- Branch `slice/S-09-balance` (suggested name), in your own worktree or clone, with its own test database.
- Bring in `main`; run the tests and `npm run check:boundaries`.
- A peer reviewer who is not the author checks the wording; merge one at a time.

## Evidence (real results only)
- `evidence/Workflow-Evidence-Log.md`: one row per loop.
- `evidence/Test-Evidence.md`: one row per check.
- Gates 1–4.

**Mode (recommendation):** HITL. **Estimate (recommendation):** 6–8 h.
