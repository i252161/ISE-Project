# S-03 — See when to start each assignment

**Owner:** Ali · **Reviewer:** Rehan (DL-56)

**Tier:** Committed (DL-19) · **Status:** blocked: E-04, E-05 not built · **Plan:** plan.md v03 §5, §7
**This is the most critical slice.** S-04, S-07, S-09 and S-10 all depend on it.

## What the Student can do
Enter the effort (hours) an assignment needs, then see one of these:
- a **start-by date**;
- **"no date — short by X h"**;
- **"cannot be determined yet — enter availability for …"**;
- **"deadline passed"**.

The result updates when effort, availability or the deadline changes.

## Requirements
- **PRD:** FR-05 (AC1–AC3), FR-03 (AC2, AC4), FR-06 (AC1, AC2), FR-04 (manual effort only), BR-04, RG-42, RG-45.
- **Decisions:** DL-32 (R1-B, C-0), DL-35 (no AI estimate), DL-37 (which deadline), DL-48 (details), DL-49 (effort limits), DL-50 (remaining hours).

## Approved rule (R1-B with conventions C-0)
**Conventions:**
- Today counts as a planning day; the deadline day does not.
- Hours are in steps of 0.5.
- Effective effort = whichever was saved most recently: the effort entry or the latest remaining-hours report (DL-50). No effort entered → "no estimate", and no start-by date.
- Planning uses the official deadline, or the Student-entered deadline if the assignment is undated (DL-37).

**Which assignments take part:** those with a deadline, effort above 0, and neither Finished nor Submitted.

**The rule:**
1. Sort those assignments by deadline, latest first. Equal deadlines are ordered by assignment ID, a technical order that is not a priority.
2. Fill each assignment's effort backwards into the hours still free on the days before its deadline.
3. Its start-by date is the earliest day that received hours.
4. If the free hours can't cover the effort, show no start-by date, only the shortage (BR-04).

**Blank days:**
- A blank day gives no hours.
- If the entered hours still cover the effort, show the date and prompt for the blank days.
- If they don't, and a day before the deadline is blank, show "cannot be determined yet" and name the blank days.
- If every day is entered, show the shortage.

**Deadlines:** a deadline before today gives "deadline passed" and takes no hours. A deadline of today gives a shortage.

## Acceptance criteria
- FR-05-AC1 to AC3, FR-03-AC2, FR-03-AC4, FR-06-AC1, FR-06-AC2.
- These worked examples (today = Monday) are reproduced exactly:
  - **Example 1:** A needs 4 h, due Thursday; B needs 4 h, due Friday; 2 h on each of Monday to Thursday.
    - → **B starts Wednesday** (Thursday 2 + Wednesday 2).
    - → **A starts Monday** (Tuesday 2 + Monday 2).
  - **Example 2:** the same, but A needs 6 h → **A: no start-by date, short by 2 h**.
  - **Example 3:** C needs 3 h, due Thursday; Monday 1, Tuesday blank, Wednesday 1.
    - → **"Cannot be determined yet — enter availability for Tuesday."**
    - With Tuesday entered as 0 → short by 1 h.
    - If C needs 2 h and Tuesday is blank → start-by Monday, plus a prompt to fill in Tuesday.

## Checks to run
- Available hours exactly equal to the effort → a date. Effort + 0.5 → a shortage.
- **Effort BVA:** 0 (rejected), 0.5, 200 (accepted), 200.5 (rejected). Blank → "no estimate".
- Two assignments with the same deadline.
- Finished, Submitted and no-effort assignments take no hours.
- Deadline yesterday → "deadline passed"; deadline today → shortage.
- Changing the effort, the availability or the deadline recalculates once (FR-05-AC2).

## Depends on
The foundation must be merged (E-01 to E-05). This slice uses the **sample availability** from E-04, so it does **not** wait for S-01. It **replaces the placeholder recalculation** in Planning Core (DL-55). Once it's merged, the team runs integration check I-1 (S-09 and S-10).

## Context to give the coding agent
- `agent.md` §§2–8 and §12.
- `plan.md` §5.
- `PRD.md`: FR-03, FR-04, FR-05, FR-06 sections; BR-04.
- `ADR-002-data-persistence-and-ownership.md` (recompute on write; overrides kept separate).
- `decision-log.md`: DL-32, DL-35, DL-37, DL-48, DL-49, DL-50.
- The E-03 data model and API contract.

## Rules for the agent
- The calculation lives in Planning Core and calls only the Data Access Layer.
- An edit and its recalculation commit in one transaction (ADR-002 rule 1).
- No new packages; use only this slice's migration number.
- Writes to assignments, allocation overrides, subtasks or timer sessions are version-checked: send and check `version`, and return `409 VERSION_CONFLICT` with `current` on a stale write (`docs/design/api-contract.md` §1.1).
- Do not edit `server/.dependency-cruiser.cjs`.
- No AI estimation (DL-35).
- If anything is unclear, stop and ask.

## Files this slice may change (DL-55)
- Only this slice's own folders: `server/src/<module>/<slice-name>/` and `client/src/features/<slice-name>/`.
- Only this slice's marked line in each shared file: the API route list, the client navigation, Planning Core's `index.ts`, and its slot on the assignment detail page.
- A new migration only if the E-03 contract is missing something, using this slice's reserved number, `0004` (`docs/design/data-model.md` §5). The foundation migration `0001` already creates every table, so most slices need no migration.
- **Never** `package.json`, `server/.dependency-cruiser.cjs`, or another slice's folder.
- Merge through a GitHub pull request approved by **Rehan**, then squash and merge.

## Branch and merge (DL-22)
- Branch `slice/S-03-start-by` (suggested name), in your own worktree or clone, with its own test database.
- Bring in `main`; run the tests and `npm run check:boundaries`.
- A peer reviewer who is not the author hand-checks the examples; merge one at a time.

## Evidence (real results only)
- `evidence/Workflow-Evidence-Log.md`: one row per loop.
- `evidence/Test-Evidence.md`: one row per example and check.
- Gates 1–4 in `evidence/Quality-Gates-Checklist.md`.

**Mode (recommendation):** HITL. **Estimate (recommendation):** 8–12 h.
