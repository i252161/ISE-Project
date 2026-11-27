# START HERE — D4 implementation handoff

**Project:** AI Academic Deadline Planner. **Deadline:** Monday 30 November 2026 (confirmed by the instructor; the D4 documents say 27 November).

**Status when this zip was made (27 November 2026):** everything is **planned, not built**. There is no code yet, and nothing has been tested. Everyone's tasks are in `TEAM-SPLIT.md` (plan.md v03; DL-55 and DL-56).

## What's in this zip
| Folder / file | What it is |
|---|---|
| `slices/` | **One handoff file per task.** Open `slices/README.md` first. |
| `plan.md`, `plans/` | The plan (v02) and its saved versions. D4 marks you down if plan history is missing. |
| `agent.md` | The coding-agent rules (its title is AGENTS.md). Give it to every coding agent. |
| `decision-log.md` | Every approved decision (DL-01 to DL-54). Handoff files refer to these numbers. |
| `PRD.md` | The authoritative requirements (DL-18). Section 11 says what D4 does and doesn't deliver. |
| `architecture.md`, `ADR-001` to `ADR-006`, `ASRs_and_Architectural_Drivers.md`, `architectural-decisions.md`, `Architecture diagram.png` | The architecture context |
| `evidence/` | Empty evidence templates: Workflow Evidence Log, Test Evidence, Quality Gates checklist, Group Contribution Log |
| `course/` | The D4 testing and instruction documents |

## First steps, in order
1. **Skill check:** the whole team, about 30 minutes (`slices/SC-skill-check.md`). It must happen before E-01.
2. **Tools and repository (`slices/E-00-tools-and-repo.md`):**
   - every laptop needs Docker Desktop and Node LTS;
   - one person creates the **private GitHub repository** and copies this zip's contents into it;
   - everyone clones it.
3. **Friday: the foundation (E-01 to E-05).**
   - Ali builds E-01, the skeleton. **Nobody else changes code until it is merged.**
   - Rehan drafts the E-03 contract at the same time, then Subhan does E-04 and Ahmad does E-02 and E-05.
4. **Saturday and Sunday: everyone builds their own slices in parallel.**
   - Slices depend only on the foundation, except Ali's own chain S-03 → S-07 → S-04.
   - See `TEAM-SPLIT.md` and `slices/README.md`.

## How each teammate works on a task
1. Take a handoff file whose status says ready: everything it depends on has been merged.
2. Create your own branch (for example `slice/S-01-availability`) in your own clone or worktree, with your own test database.
3. Give your coding agent:
   - the handoff file;
   - `agent.md`;
   - the documents listed in the file;
   - the E-03 design, once it exists.
4. Before merging:
   1. bring in the latest `main`;
   2. run the tests;
   3. run `npm run check:boundaries` in `server/`.
5. **A teammate who is not the author reviews the work, runs the checks themselves, and decides Accept, Revise or Reject.**
6. Merge one branch at a time, and everyone pulls `main`.
7. Record **real** results only in `evidence/`, as you go. Never fill evidence in afterwards from memory.

## Rules nobody breaks
- Do not build the deferred features: Google Classroom, AI estimation (Gemini), phone notifications, Google Calendar, or revocation (agent.md §12).
- No new packages or tools without a team decision recorded in `decision-log.md`.
- Feature freeze is on **Sunday 29 November in the evening**. Monday 30 November is only for final checks, the report, packaging and demo preparation.
- When something is unclear, stop and ask the team. Don't let the agent guess.
