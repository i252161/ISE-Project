# ISE-Project
Software solution built using a disciplined AI-Native, vertical-slice workflow. Includes approved context (PRD, architecture, ADRs, AGENTS.md), versioned plan.md history, quality-gated test logs, CCP analysis, and contribution records.

## Start, test, check

- **Install dependencies (once):**
  - `npm --prefix server install`
  - `npm --prefix client install`
- **Start the embedded PostgreSQL database (terminal 1):**
  - `npm --prefix server run dev:db`
- **Start the backend server (terminal 2):**
  - `npm --prefix server run dev`
- **Start the PWA client (terminal 3):**
  - `npm --prefix client run dev`
- **Run server tests (uses an isolated embedded PostgreSQL instance):**
  - `npm --prefix server test`
- **Check module boundaries:**
  - `npm --prefix server run check:boundaries`
