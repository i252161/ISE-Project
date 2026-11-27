# E-01 — Walking skeleton

**Type:** setup task (not a slice) · **Status:** merged to `main` (pull request #4) · **Plan:** plan.md v03 §8
**Decisions:** DL-29, DL-30, DL-31, DL-44, DL-45, DL-46, DL-55
**Owner:** Ali · **Reviewer:** Rehan (DL-56)

## What this is
The thinnest version of the whole app that runs end to end: folders, a server, a database and a web page, with no real features yet. Every other task builds on it, so **only this task touches code until it is merged.**

## What must exist when it is done
- **`client/`:** a React + Vite PWA shell. It caches only its static shell and stores no academic data on the device.
- **`server/`:** Node.js + TypeScript + Fastify.
- **`server/src/`:** these 11 module folders, each with exactly one public `index.ts` (DL-45):
  `api-layer`, `planning-core`, `sync-engine`, `classroom-adapter`, `calendar-adapter`, `ai-adapter`, `notification-scheduler`, `credential-handling`, `data-access`, `push-gateway`, `oauth-client`.
- **Database access:**
  - `pg` inside `data-access` only;
  - migrations in `server/src/data-access/migrations/NNNN_short_name.sql`, numbered in order and never edited once applied;
  - a migration runner;
  - a PostgreSQL database in Docker Compose.
- **Named export groups (DL-44):**
  - `data-access/index.ts` exports a `sessions` group (issue, validate, expire);
  - `planning-core/index.ts` exports a `readOnly` group (empty or placeholder in D4).
- **Tests:** Vitest, running against a real PostgreSQL test database, not a mock.
- **Boundary check (DL-46):** `server/.dependency-cruiser.cjs`, holding the allow-list from agent.md §4.1, and the script `npm run check:boundaries` in `server/package.json`. Unlisted cross-module imports must fail.
- **Merge-friendly setup (DL-55):**
  - **Every package** the committed slices need is installed now, so no slice changes `package.json` later.
  - **Shared files are prepared with one marked line per slice** (S-01, S-02, S-03, S-04, S-07, S-08, S-09, S-10, S-14, S-15, S-16, S-19) in:
    - the API route list;
    - the client navigation;
    - Planning Core's `index.ts`.

    Each slice later fills in only its own line.
  - Empty feature folders: `client/src/features/` exists, ready for each slice's folder.

## Acceptance checks
- The server starts and the client page loads locally.
- A sample test runs against the real test database.
- `npm run check:boundaries` passes.
- A deliberate forbidden import (for example `planning-core` importing `sync-engine`) makes the check fail. Remove the import afterwards.
- No folder or module exists beyond the 11 (agent.md §3), and no prohibited technology is used (agent.md §7.1).

## Context to give the coding agent
- `agent.md`, all of it, especially §§2–8 and §12.
- `ADR-001-architecture-style.md` (Decision section and dependency table).
- `ADR-002-data-persistence-and-ownership.md` (transaction rules).
- `decision-log.md`: DL-29, DL-30, DL-44, DL-45, DL-46.

## Rules for the agent
- Use only the technologies in agent.md §7. Add no other package categories.
- Build no feature behaviour and no deferred behaviour (agent.md §12).
- If anything is unclear, stop and ask (agent.md §10).

## Branch and merge
- Branch `setup/E-01-skeleton` (suggested name).
- Before merging, run the tests and `npm run check:boundaries`.
- A teammate who is not the author reviews and runs the checks.
- Merge to `main`; everyone pulls.

## Evidence (real results only)
- `evidence/Workflow-Evidence-Log.md`: one row for this task, with every field filled.
- `evidence/Test-Evidence.md`: one row per acceptance check above.
- Paste the `npm run check:boundaries` output into the Gate 3 part of `evidence/Quality-Gates-Checklist.md`.

**Mode (recommendation):** HITL. **Estimate (recommendation):** 8–12 h.
