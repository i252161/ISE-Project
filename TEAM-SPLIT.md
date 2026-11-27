# Team split: who does what (plan.md v03, 27 November 2026)

**Approved by the team:** the contract-first split (DL-55) and this assignment (DL-56). To swap people, swap their rows; the tasks stay the same. Nothing is built or tested yet.

## The idea in one paragraph
**Friday** the team builds the foundation **once**: the skeleton, every table, sample data for every field, a placeholder calculation, and shared files with one marked line per slice. After that, **nobody waits for anybody**. Every slice depends only on the foundation, except Ali's own chain S-03 → S-07 → S-04 and the reserve S-19, which comes after S-01. Each slice changes only its own folders, so merges don't conflict.

| Person | Fri 27 (foundation) | Sat 28 | Sun 29 | Mon 30 (no new features) |
|---|---|---|---|---|
| **Ali** | Skill check (everyone) → **E-01** skeleton (all packages + prepared shared files) | **S-03** start-by (replaces the placeholder) → **S-07** remaining hours | S-07 (if not done) → **S-04** allocation | Gate 5 end-to-end check |
| **Rehan** | E-00 + **create the private repo** → **E-03** contract (draft now; its migration after E-01) → **S-01** availability if the foundation is merged | S-01 (if not done) → **S-14** subtasks | **S-09** warnings; I-1 re-check after S-03 merges | NFR-01 and NFR-04 measurements; final README |
| **Subhan** | E-00; README draft; evidence setup → **E-04** sample data (after E-01, E-03) | **S-15** study timer | **S-10** manual deadline; I-1 re-check; **S-19** reserve only if needed | Final report and CCP; contribution log; sign-offs |
| **Ahmad** | E-00 → **E-02** demo session (after E-01) → **E-05** screens (after E-04) → **S-02** ratings if time allows | S-02 (if not done) → **S-16** search → **S-08** status | Reviews and testing; spare capacity | Packaging; demo rehearsal |

## Peer review rotation (nobody reviews their own work)
| The work of… | is reviewed by… |
|---|---|
| Ali | Rehan |
| Rehan | Subhan |
| Subhan | Ahmad |
| Ahmad | Ali |

The reviewer runs the checks themselves, records **Accept, Revise or Reject** in `evidence/Workflow-Evidence-Log.md`, and approves the GitHub pull request.

## Merging without conflicts
- Change only your slice's folders, `server/src/<module>/<slice-name>/` and `client/src/features/<slice-name>/`, plus your own marked line in each shared file.
- Never change `package.json`, `server/.dependency-cruiser.cjs`, or another slice's folder.
- Pull `main` before you start a slice. Before you open a pull request, bring the latest `main` in, then run the tests and `npm run check:boundaries`.
- **One pull request per slice** → your reviewer approves → **squash and merge**.

## Checkpoints (recommendation)
| Checkpoint | Target |
|---|---|
| End of Friday | Foundation merged; S-01 and S-02 if time allows |
| End of Saturday | **7** accepted: S-01, S-02, S-03, S-08, S-14, S-15, S-16 |
| Sunday evening freeze | **11** accepted: plus S-07, S-04, S-09, S-10 (S-09 and S-10 after I-1) |
