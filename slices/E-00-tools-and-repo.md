# E-00 — Tools and shared repository

**Type:** setup task (not a slice) · **Status:** ready · **Plan:** plan.md v03 §8 · **Decisions:** DL-22, DL-23, DL-24
**Owners:** everyone on their own laptop; **Rehan creates the private repository** (DL-56)

## What this is
Get every laptop ready, and create the one place where code is shared.

## Steps
1. **On every laptop:** install Docker Desktop and confirm that a PostgreSQL container can start (Docker Compose, architecture.md §9.5). Docker was not found on at least one laptop on 27 November.
2. **On every laptop:** install Node.js (current LTS release).
3. **Once:** create a **private** GitHub repository and give all four members access.
4. **Agree the branch rules (DL-22):**
   - one branch per slice or setup task;
   - merge one branch at a time;
   - the author never reviews their own work.
5. Each member checks they can clone the repository and push a branch.

## Rules
- Local execution only: no Azure, no tunnel (DL-24).
- Never commit secrets or environment files.

## Can run in parallel
Steps 1 and 2 on all four laptops at once. Step 3 needs only one person.

## Evidence
A row in the "Other evidence" table of `evidence/Workflow-Evidence-Log.md`, stating what was installed and which laptops are ready. Record only what actually happened.

**Estimate (recommendation):** 1–2 h per laptop.
