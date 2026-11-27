# E-03 — Stage 3 design artefacts

**Type:** setup task (not a slice; required by D4 Stage 3) · **Status:** built on `Ahmad's-Branch` together with E-02 (one pull request); Subhan's review done (Revise, fixes applied); wireframe team review still pending. E-01 is merged · **Plan:** plan.md v03 §8
**Decisions:** DL-41, DL-45, DL-47, DL-55
**Owner:** Rehan · **Reviewer:** Subhan (DL-56)

## What this is
The AI-generated design documents that D4 Stage 3 asks for. They are also what lets four agents work in parallel without clashing.

## What must exist when it is done
1. **Data model, the "contract" (DL-55):**
   - **every** table and column the committed slices need: availability (and the S-19 baseline), course ratings, assignment status, effort entry, remaining-hours reports, Student-entered deadlines, allocation overrides, subtasks and timer sessions;
   - **one foundation migration that creates all of them**, so every slice can start without waiting for another slice's tables;
   - how sample rows are marked so the UI can label them (DL-28, DL-47);
   - a **reserved migration number per slice** (DL-45), used only if a slice finds something the contract missed;
   - the **name of the placeholder recalculation function** in Planning Core, which S-07 and S-10 call and S-03 replaces with the real calculation.
2. **API contract:** every request and response the committed slices need, with input limits from DL-41 and DL-49. This is the reference for client and server data types.
3. **UI wireframes:** availability, ratings, assignment list, assignment detail (with a slot each for subtasks, timer and status), start-by and shortage display, warnings. D4 allows the team to review and change the UI.

## Acceptance checks
- Every committed slice card in `plan.md` §7 can be built from this model and contract without inventing new columns.
- Migration numbers don't overlap.
- The wireframes have been reviewed by the team.

## Context to give the coding agent
- `plan.md` §5 (rules) and §7 (all committed cards).
- `PRD.md`: the sections for FR-02, FR-03, FR-05 to FR-10 and FR-14 to FR-17.
- `ADR-002-data-persistence-and-ownership.md` (overrides kept separate from calculated values).
- `decision-log.md`: DL-32 to DL-53.
- `agent.md` §§2–8.

## Rules
- Documents, plus the one foundation migration `0001_foundation.sql`, its test `foundation.test.ts`, and the placeholder `recalculateStudentPlan` in `planning-core/recalculate.ts` (plan.md: "the placeholder recalculation is in Planning Core" is a foundation condition). No other application code, except the migration-runner lock found in review (see the Workflow log).
- Keep the artefacts in the repository; D4 says to keep any artefact that becomes implementation context.

## Branch and merge
- Delivered on `Ahmad's-Branch` together with E-02 (team choice).
- A peer reviewer who is not the author.
- Merge after E-01.

## Evidence (real results only)
- `evidence/Workflow-Evidence-Log.md`: one row, noting what the team changed in the wireframes.

**Mode (recommendation):** HITL for the UI review. **Estimate (recommendation):** 3–4 h.
