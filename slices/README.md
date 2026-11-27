# Slice and setup handoff files (plan.md v03)

**Updated:** 27 November 2026 (contract-first split, DL-55; team assignment, DL-56).

**Status:** most files here are **plans, not built work**. E-01 is merged. E-03 and E-02 are built and peer-reviewed, not yet merged. Everything else is not built, tested or accepted.

**Source:** `plan.md` v03 and `decision-log.md` (DL-18 to DL-56). If a file here ever disagrees with plan.md, plan.md wins.

## How the split works (DL-55)
1. **Friday: build the foundation once** (E-01 to E-05). It creates:
   - every table;
   - sample data for every field;
   - a placeholder recalculation;
   - shared files with one marked line per slice;
   - all packages.
2. **Then nobody waits for anybody.** Each slice depends only on the foundation. The exceptions are:
   - Ali's own chain S-03 → S-07 → S-04;
   - the reserve S-19, which comes after S-01.
3. **Each slice changes only its own folders and its own marked lines,** so merges don't conflict.
4. **Integration check I-1:** after S-03 is merged, Rehan and Subhan re-run the S-09 and S-10 checks that need real start-by dates. Those two slices count as accepted only after I-1.

## Who does what (DL-56)

| Person | Foundation (Friday) | Slices | Reviews the work of |
|---|---|---|---|
| **Ali** | E-01 skeleton | S-03 → S-07 → S-04 | Ahmad |
| **Rehan** | Creates the repo; E-03 contract | S-01, S-14, S-09 | Ali |
| **Subhan** | E-04 sample data; README and evidence setup | S-15, S-10, reserve S-19 | Rehan |
| **Ahmad** | E-02 demo session; E-05 screens | S-02, S-16, S-08 | Subhan |

Everyone does the skill check together and installs the tools (E-00) on their own laptop.

## Tasks and current status

| File | Owner | Status |
|---|---|---|
| [SC-skill-check.md](SC-skill-check.md) | everyone | ready |
| [E-00-tools-and-repo.md](E-00-tools-and-repo.md) | everyone (Rehan: repo) | ready |
| [E-01-walking-skeleton.md](E-01-walking-skeleton.md) | Ali | merged (PR #4) |
| [E-03-stage3-design.md](E-03-stage3-design.md) | Rehan | reviewed by Subhan (Revise, fixes applied); wireframe review pending; on `Ahmad's-Branch` with E-02 |
| [E-02-demo-session.md](E-02-demo-session.md) | Ahmad | reviewed by Ali (Accept after fixes); on `Ahmad's-Branch` with E-03 |
| [E-04-sample-data.md](E-04-sample-data.md) | Subhan | blocked: E-01, E-03 not built |
| [E-05-list-and-detail.md](E-05-list-and-detail.md) | Ahmad | blocked: E-04 not built |
| [S-01-availability.md](S-01-availability.md) | Rehan | blocked: E-01, E-02, E-03 not built |
| [S-02-course-ratings.md](S-02-course-ratings.md) | Ahmad | blocked: E-04 not built |
| [S-03-start-by-date.md](S-03-start-by-date.md) | Ali | blocked: E-04, E-05 not built |
| [S-08-status.md](S-08-status.md) | Ahmad | blocked: E-05 not built |
| [S-14-subtasks.md](S-14-subtasks.md) | Rehan | blocked: E-05 not built |
| [S-15-study-timer.md](S-15-study-timer.md) | Subhan | blocked: E-05 not built |
| [S-16-search-filter.md](S-16-search-filter.md) | Ahmad | blocked: E-05 not built |
| [S-09-balance-warnings.md](S-09-balance-warnings.md) | Rehan | blocked: E-04, E-05 not built (accepted after I-1) |
| [S-10-manual-deadline.md](S-10-manual-deadline.md) | Subhan | blocked: E-04, E-05 not built (accepted after I-1) |
| [S-07-remaining-hours.md](S-07-remaining-hours.md) | Ali | blocked: S-03 not built (same person) |
| [S-04-allocation.md](S-04-allocation.md) | Ali | blocked: S-07 not built (same person) |
| [S-19-weekly-baseline.md](S-19-weekly-baseline.md) | Subhan (reserve) | blocked: S-01 not built |

```
SC + E-00 ─► E-01 (Ali) ─┬─► E-02 (Ahmad)
                         └─► E-03 (Rehan) ─► E-04 (Subhan) ─► E-05 (Ahmad)
                                     ════ foundation merged ════
Then all of these run in parallel:
  Ali:    S-03 ─► S-07 ─► S-04
  Rehan:  S-01, S-14, S-09
  Subhan: S-15, S-10   (S-19 reserve, after S-01)
  Ahmad:  S-02, S-16, S-08
After S-03 merges: I-1 re-check of S-09 and S-10
```

## How to merge without conflicts
- Change **only** your slice's folders, `server/src/<module>/<slice-name>/` and `client/src/features/<slice-name>/`, plus your own marked line in each shared file.
- Never change `package.json`, `server/.dependency-cruiser.cjs`, or another slice's folder.
- Pull `main` before starting each slice, and bring the latest `main` in before opening a pull request.
- Run the tests and `npm run check:boundaries`.
- Open **one pull request per slice**. Your assigned reviewer, who is never you, runs the checks and approves. Then **squash and merge**.

## Deferred: not to be built in D4 (DL-19)

There are no handoff files for these seven slices:
- S-05 AI effort estimate
- S-06 re-estimation
- S-11 Google sign-in and Classroom import
- S-12 Classroom changes and outages
- S-13 Classroom revocation
- S-17 phone and laptop reminders
- S-18 Google Calendar

## Checkpoints (recommendation, plan.md §9)

| Checkpoint | Target |
|---|---|
| End of Friday | Foundation merged; S-01 and S-02 if time allows |
| End of Saturday | 7 accepted |
| Sunday evening freeze | 11 accepted |

30 November is for final checks, the report and the demo only, with no new features.
