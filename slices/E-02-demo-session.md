# E-02 — Demo Student session

**Type:** setup task (not a slice) · **Status:** blocked: E-01 not built · **Plan:** plan.md v03 §8 · **Decisions:** DL-27, DL-44
**Owner:** Ahmad · **Reviewer:** Ali (DL-56)

## What this is
There is no Google sign-in in D4. Instead, one seeded demo Student is given a **real** application session. That way every later slice knows which Student is using the app.

## What must exist when it is done
- One demo Student row in the database.
- The API Layer issues, validates and expires a session cookie (HttpOnly, SameSite) for that Student. It does this **only** through the Data Access Layer's `sessions` group (DL-44).
- Requests without a valid session are refused.

## Acceptance checks
- Opening the app gives a working session for the demo Student.
- A request with no session, or an expired or invalid one, is refused.
- The API Layer imports nothing from `data-access` except `sessions` (check by eye at review).
- `npm run check:boundaries` passes.

## Context to give the coding agent
- `agent.md` §§2–8 and §12, especially §4.3 (API Layer → Data Access Layer: sessions only).
- `ADR-006-identity-credentials-and-privacy.md`, Decision 1, as background only. DL-27 takes precedence for D4 (agent.md §12).
- `decision-log.md`: DL-27, DL-44.

## Rules for the agent
- No Google OAuth and no passwords (agent.md §12).
- Use only the migration number that E-03 gave this task.
- Do not edit `server/.dependency-cruiser.cjs`.

## Branch and merge
- Branch `setup/E-02-demo-session` (suggested name), in your own worktree or clone with its own test database.
- Bring in `main`, run the tests and `npm run check:boundaries`.
- A peer reviewer who is not the author; merge one at a time.

## Evidence (real results only)
- `evidence/Workflow-Evidence-Log.md`: one row.
- `evidence/Test-Evidence.md`: one row per check.
- Gate 3 output in `evidence/Quality-Gates-Checklist.md`.

**Mode (recommendation):** HITL. **Estimate (recommendation):** 2–3 h.
