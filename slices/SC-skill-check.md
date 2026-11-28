# SC — TypeScript skill check

**Type:** setup task (not a slice) · **Status:** ready · **Plan:** plan.md v03 §8 · **Decision:** DL-42 (corrects DL-21)
**Owners:** the whole team together; Subhan records the result once the team gives it (DL-56)

## What this is
A short, honest check, done as a team, of who can read and review TypeScript code. **It must happen before E-01 starts.** Every slice is reviewed by a teammate other than its author, so the team needs enough reviewers.

## How to run it (suggested format)
1. Pick one short TypeScript file, of about 30–60 lines (any small example).
2. Each member explains in their own words what the code does and spots one problem or improvement.
3. Note who could review TypeScript code with confidence.

## Rules
- **Record no result until the team gives it.** Then add it as a new entry in `decision-log.md` (do not edit DL-42).
- If fewer than two members can review TypeScript, the ADR-001 revisit condition applies. The team must decide what to do before E-01.

## Documents
- `decision-log.md`: DL-14, DL-21, DL-42.
- `ADR-001-architecture-style.md`: Trade-offs and Revisit conditions.

## Evidence
- The new decision-log entry with the result, once known.
- A row in the "Other evidence" table of `evidence/Workflow-Evidence-Log.md`.

**Estimate (recommendation):** about 0.5 h for the whole team.
