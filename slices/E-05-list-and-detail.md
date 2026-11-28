# E-05 — Assignment list and detail screens (read-only)

**Type:** setup task (not a slice) · **Status:** blocked: E-04 not built · **Plan:** plan.md v03 §8 · **Decisions:** DL-55
**Owner:** Ahmad · **Reviewer:** Ali (DL-56)

## What this is
A read-only list of the Student's assignments, and a detail page for one assignment. S-03, S-08, S-14, S-15 and S-16 all add to these screens, so they must exist first.

## What must exist when it is done
- **Assignment list:** title, course and deadline (or "no deadline"), with a visible "sample data" label.
- **Assignment detail page,** with an empty, clearly marked slot for each later slice, so that slices never edit the same lines (DL-55):
  - status (S-08);
  - subtasks (S-14);
  - timer (S-15);
  - start-by date (S-03).
- Data comes from the server through the API Layer (no data stored on the device).

## Acceptance checks
- All seeded assignments appear in the list.
- Opening one shows its details.
- The "sample data" label is visible.
- A second browser shows the same data.

## Context to give the coding agent
- `agent.md` §§2–8 and §12.
- The E-03 API contract and wireframes.

## Rules for the agent
- Read-only: no editing features yet.
- Do not edit `server/.dependency-cruiser.cjs`.

## Branch and merge
- Branch `setup/E-05-list-detail` (suggested name).
- Run the tests and `npm run check:boundaries`.
- A peer reviewer who is not the author; merge one at a time.

## Evidence (real results only)
- `evidence/Workflow-Evidence-Log.md`: one row.
- `evidence/Test-Evidence.md`: one row per check.
- Gate 3 output.

**Mode (recommendation):** AFK. **Estimate (recommendation):** 2–3 h.
