# plan.md — AI Academic Deadline Planner (D4)

**Version:** v01 (draft) · **Date:** 26 November 2026 · **Status:** DRAFT, nothing in this plan is approved by the team yet.
**Saved copy:** `plans/plan-v01.md`. Each meaningful change gets a new copy (`plan-v02.md`, …). D4 deducts marks for missing plan history.

> **How to read this plan.** "Recommendation" means a suggestion from the AI-assisted Stage 2 review, with a reason. "Proposed" means waiting for a team decision. "Blocked" means it cannot start until an open decision (Section 4) is made. No item is approved, owned, done or tested.

**Plain-language terms**
- **Vertical slice:** one small feature a user can see, built through every part of the system (screen → server → logic → database).
- **HITL ("human in the loop"):** a team member works alongside the AI and checks each step. **AFK / delegated:** the AI works alone and a human reviews the result afterwards.
- **Migration:** a numbered SQL file that creates or changes database tables.
- **Sample data:** made-up courses and assignments, used so that features work without Google Classroom.
- **Walking skeleton:** the thinnest version of the whole app that runs end to end, with no real features yet.
- **EP / BVA:** EP (equivalence partitioning) tests one example from each group of similar inputs. BVA (boundary value analysis) tests values at and just beside a limit.
- **Override:** a value the Student entered that the system must never replace automatically.

---

## 1. Product objective

Source: `PRD.md` §1. This is a Google Classroom-linked planner that:
- turns assignment deadlines into effort-based **start-by dates**;
- shows when study availability is insufficient;
- warns about course neglect;
- reminds the Student on phone and laptop.

Estimates are personalised by the Student's per-course confidence rating, and the Student stays in control of the plan. User goals UG-1 to UG-4 and product goals G-1 to G-8 are in PRD §1. Course grading criteria are **not** product requirements and are kept separate (Section 2).

## 2. Confirmed context

| Item | Status |
|---|---|
| Deadline | **30 November 2026**, confirmed by the instructor. |
| Document discrepancy | `Final Project Deliverable (D4).docx` (line 4) and `Instructions-D4.docx` (lines 15 and 69) say **27 November 2026**. This plan follows the instructor's 30 November date. Keep the instructor's confirmation as evidence and mention it in the final report. |
| Submission time on 30 Nov | Unknown. |
| Implementation | Not started. There is no source code, README.md or Git history in the project folder. |
| Team | Four members. Hours per person are unknown (see the capacity table in Section 9). |

**What the course requires (from the D4 documents, separate from product requirements)**
- **Workflow:** Stage 2 Validate & Plan → Stage 3 AI-generated supporting artefacts → Stage 4 slice-by-slice loop → Stage 5 final validation and demo.
- **Stage 4 start:** only when plan.md is good enough to guide implementation (D4, Stage 2).
- **Evidence:**
  - plan.md history, mandatory;
  - Workflow Evidence Log, per slice;
  - test evidence table;
  - Quality Gates 1–5;
  - Group Contribution Log.
- **Final submission:** working product and source, latest context documents (PRD, architecture, AGENTS.md, ADRs, README), final plan.md and its history, Workflow Evidence Log, Final Report with CCP Analysis, run instructions, Group Contribution Log.
- **Testing:** basic functional, negative, and EP/BVA where meaningful (Testing Instructions document).
- **Deployment:** local execution is acceptable. Git and cloud are optional. Anything promised must work at the demo.

## 3. Assumptions (proposed, not approved)

| ID | Assumption | If wrong |
|---|---|---|
| A-01 | `PRD.md` is the authoritative PRD (**proposed, pending team confirmation**). Evidence: it contains `Final_Validated_PRD.md` plus FR-15 to FR-17 and §7a. Only 5 header and trace lines of `Final_Validated_PRD.md` differ. `agent.md` §2 and D4 both name `PRD.md`. However, the ASR file §11, DL-17 and the D3 contribution log cite `Final_Validated_PRD.md`, so the documents do not settle this conclusively. | Re-check requirement references |
| A-02 | The ADRs and agent.md apply as written unless the team records a change. | Re-plan the affected slices |
| A-03 | Team defaults still awaiting TA confirmation (DL-01, DL-05, DL-06, DL-10) are used as labelled assumptions. | Revisit the affected ADR |
| A-04 | Estimates are AI-assisted guesses that include checks and evidence logging, with roughly ±50% uncertainty. | Use the cut line (Section 10) |

## 4. Open decisions

None of these is decided. "Who": Team = whole team; Tech = a technical owner proposes and the team approves; TA = instructor or TA.

| ID | Decision needed | Who | Blocks | Other work can continue? |
|---|---|---|---|---|
| D-01 | Confirm `PRD.md` as authoritative, and label or archive the other PRD files | Team | All requirement links (lightly) | Yes |
| D-02 | Committed, stretch and deferred scope. Record in PRD §8 (OQ-30/31/33) and decision-log.md. | Team | Start of Stage 4 | **No** |
| D-03 | Start-by date rule (OQ-02), plus conventions: does today count, does the deadline day count, hour step size, which deadline applies | Team | S-03, S-04, S-07, S-09, S-18 | Yes |
| D-04 | Study-hour allocation and suggestion rule (OQ-03, OQ-04) | Team | S-04, S-18 | Yes |
| D-05 | Neglect rule (OQ-08 to OQ-10); what counts as "activity logged"; whether the 3-day advisory starts at 3 days or after more than 3 (FR-08 says "over three", FR-08-AC2 says "after three") | Team | S-09 | Yes |
| D-06 | Effort-estimation rule (OQ-13, OQ-14, OQ-15) and how the rating affects the estimate | Team | S-05, S-06 | Yes |
| D-07 | Identity for the early slices: a seeded demo Student given a real session by the API Layer, instead of Google sign-in. This departs from ADR-006 Decision 1 and needs a decision-log entry. | Team + Tech | E-02 and all slices | **No** |
| D-08 | Sample data source: (a) returned by the Classroom Adapter, which exercises the real import path; or (b) seeded straight into the database, which is faster but skips that path. Must be labelled "sample data" in the UI. | Tech + Team | E-04 and all assignment slices | **No** |
| D-09 | Repo layout and restricted interfaces (agent.md §8.1, questions 1–3) | Tech | E-01 | **No** |
| D-10 | How the dependency-cruiser check is enforced without hosted CI (agent.md §4.5 says "required CI check") | Team | Finishing E-01 | No |
| D-11 | Demo hosting: local, or the Azure VM (DL-02). Phone push needs real HTTPS, not localhost (ADR-005). | Team | S-17, F1 | Yes |
| D-12 | V-01 wording conflict: PRD §7 line 1060 ("default study hours") vs BR-17, FR-03-E1, FR-03-AC1 and AC6 ("Student-confirmed baseline, otherwise unknown"); also OQ-01 | Team | S-01 baseline part, S-03 | Partly |
| D-13 | Input limits for tests: per-day hours range and step; time zone and when a day starts; whether the FR-17 range includes its end dates; subtask title limit (OQ-37); middle labels of the 1–5 rating scale | Tech → Team | Exact BVA tests in S-01, S-02, S-14, S-16 | Yes |
| D-14 | Gemini billing. If there is none, may the demo use synthetic data on the free tier? (ADR-003 allows the free tier only "in development and tests".) | Team (TA if unsure) | S-05 | Yes |
| D-15 | Clock times for Calendar blocks: availability is only hours per day, so nothing says when in the day a block goes | Team | S-18 | Yes |
| D-16 | Reminder time of day (OQ-18), submission reminder timing (OQ-20), delivery failure (OQ-23) | Team / TA | S-17 | Yes |
| D-17 | When both exist, does planning use the personal pacing target or the official deadline? | Team | S-10, S-12, S-03 edge cases | Yes |
| D-18 | Re-approve DL-17 and complete the member sign-offs (ASR file §11) | Team | S-12, S-13, S-17, S-18 | Yes |
| D-19 | Amend ADR-001: line 65 lists 9 modules, while architecture.md and agent.md list 11 | Team | E-01 | Do before E-01 |
| D-20 | TA confirmations: DL-01 (meaning of "local"), DL-05 ("estimating" / "no estimate"), DL-06 (AI allow-list), DL-10 (NFR-03 reading) | TA | Nothing hard | Yes |
| D-21 | DL-14 skill check: can at least two members review TypeScript? | Team | All code review | Answer first |
| D-22 | What a progress report contains, beyond remaining hours (FR-07; RG-16 says percent done is not remaining effort) | Team | S-07 | Yes |
| D-23 | Whether a zero-length study session is saved (start then immediately stop; not covered by FR-16) | Team | S-15 (one edge case) | Yes |
| D-24 | Whether a past date is allowed as a manual deadline (not covered by FR-02) | Team | S-10 (one edge case) | Yes |

**Naming note:** decision-log.md "Gates 1–3" are feasibility tests. This plan calls them **F1** (phone notifications), **F2** (real Classroom account) and **F3** (TA meaning of "local") so they are not confused with the course **Quality Gates 1–5**.

## 5. Product rules

**No product rule beyond the PRD text has been approved.** Worked examples will be added only after the team approves a rule.

| Open rule | PRD reference | Affected slices |
|---|---|---|
| How effort, availability and deadline produce a start-by date | OQ-02 (D-03) | S-03, S-04, S-07, S-09, S-18 |
| How hours are split across overlapping assignments, and which suggestions are given | OQ-03, OQ-04 (D-04) | S-04, S-18 |
| When a course-balance notice appears; what counts as activity | OQ-08 to OQ-10, FR-08 (D-05) | S-09 |
| What makes an estimate unreliable; how type and rating affect it | OQ-13 to OQ-15 (D-06) | S-05, S-06 |

The Stage 2 review gave draft options for each rule, with one worked example each (in the review response, saved as Stage 2 evidence). They stay proposals until approved.

PRD rules that already apply include:
- BR-03 / BR-17: unknown is never treated as zero.
- BR-04: no start-by date is shown when hours are insufficient.
- BR-06 / BR-07: manual corrections are protected.
- BR-09: "Got it" does not mean Started.
- BR-20 / BR-21: subtasks and study time never change status or effort.

## 6. Proposed slice backlog (recommendations, pending team approval)

- **Tier** (recommendation): Must / Should / Could.
- **Size:** S = 4 h or less, M = 4–8 h, L = more than 8 h. Estimates are recommendations.
- **FR coverage:** ✓ = the whole FR; ◐ = part of it.

| ID | Slice (what the Student can do) | Requirements | Depends on | Tier | Est. h | Mode | Status |
|---|---|---|---|---|---|---|---|
| S-01 | Enter daily study availability for 7 days | FR-03◐, BR-17, NFR-04◐ | E-01, E-02, D-13 | Must | 5–7 M | HITL | proposed |
| S-02 | Rate confidence per course (1–5) | FR-14◐, BR-16, NFR-04◐ | E-04, D-13 | Must | 3–4 S | AFK | proposed |
| S-03 | See start-by date, shortage, or "cannot be determined yet" | FR-05◐, FR-03◐, FR-06◐, FR-04◐ (manual effort), BR-04 | S-01, E-05, D-03, D-12 | Must | 8–12 L | HITL | blocked |
| S-08 | Mark Already Started / Not Started / Finished; see Submitted separately | FR-09◐, FR-10◐, FR-07◐, BR-08, BR-09 | E-05 | Must | 4–6 M | AFK | proposed |
| S-14 | Break an assignment into subtasks | FR-15✓, BR-20 | E-05, D-13 | Must | 5–7 M | AFK | proposed |
| S-15 | Time study sessions | FR-16✓, BR-21 | E-05, D-23 | Must | 6–8 M | AFK + HITL review | proposed |
| S-16 | Search, filter and sort assignments | FR-17✓ | E-05, D-13 | Must | 5–7 M | AFK | proposed |
| S-07 | Report remaining hours and progress | FR-07◐, FR-03◐, BR-03 | S-03, D-22 | Must | 3–5 S | HITL-light | blocked |
| S-09 | Course-balance and start-by warnings | FR-08✓, BR-03, BR-10 | S-03, S-08, D-05 | Must | 6–8 M | HITL | blocked |
| S-10 | Give an undated assignment a deadline | FR-02◐, BR-02 | E-04, S-03, D-24 | Should | 3–4 S | AFK | proposed |
| S-05 | AI effort estimate with "unreliable" flag | FR-04◐, FR-14◐, BR-15 | S-02, S-03, F-AI, D-06, D-14 | Should (stretch) | 8–10 L | HITL | blocked |
| S-11 | Sign in with Google and import from Classroom | FR-01◐, FR-10◐, FR-14◐ | F2, D-07 | Should (stretch) | 12–16 L | HITL | blocked |
| S-04 | Shortage suggestions and adjustable allocation | FR-05◐, FR-06◐, BR-05 | S-03, D-04 | Should (stretch) | 6–8 M | HITL | blocked |
| S-06 | Re-estimate after a rating change, keeping corrections | FR-04◐, FR-14◐, BR-06, BR-07 | S-05, D-06 | Could (defer) | 4–6 M | HITL | blocked |
| S-12 | Classroom deadline changes and sync outages | FR-01◐, FR-02◐, BR-01, BR-12, NFR-02◐ | S-11, D-17, D-18 | Could (defer) | 6–8 M | HITL | blocked |
| S-13 | Revoke Classroom: keep or delete, then reconnect | FR-13✓, FR-01◐ | S-11, D-18 | Could (defer) | 8–12 L | HITL | blocked |
| S-17 | Phone and laptop reminders with "Got it" | FR-11✓, FR-09◐, FR-10◐, NFR-03 | F1, D-11, D-16, D-18, S-03, S-08 | Could (defer) | 14–20 L | HITL | blocked |
| S-18 | Study plan in Google Calendar | FR-12✓, NFR-02◐ | D-15, S-04, S-11, D-18 | Could (defer) | 14–20 L | HITL | blocked |

**Why S-14, S-15 and S-16 are recommended as Must:** they are client requirements (TA-01 to TA-03, PRD §7a), each has 9 acceptance criteria in the PRD, and they depend on very little.

**Traceability**

| Requirement | Slices |
|---|---|
| FR-01 | S-11 (AC1), S-12 (AC2–AC4), S-13 (AC5) |
| FR-02 | S-10 (AC1, AC2, AC5), S-12 (AC3, AC4, AC6) |
| FR-03 | S-01 (AC1, AC3, AC6 once D-12 is decided), S-03 (AC2, AC4), S-07 (AC5) |
| FR-04 | S-03 (manual effort only), S-05 (AC1, AC2, AC4, AC5), S-06 (AC3, AC6) |
| FR-05 | S-03 (AC1–AC3), S-04 (AC4) |
| FR-06 | S-03 (AC1, AC2), S-04 (AC3–AC6) |
| FR-07 | S-07 (AC1–AC4, AC6), S-08 (AC5) |
| FR-08 | S-09 |
| FR-09 | S-08 (AC2–AC6), S-17 (AC1) |
| FR-10 | S-08 (AC2, AC3, AC5 display), S-11 (Classroom detection), S-17 (AC4) |
| FR-11 | S-17 |
| FR-12 | S-18 |
| FR-13 | S-13 |
| FR-14 | S-02 (AC1, AC2 prompt, AC5), S-05 (AC2 flag), S-06 (AC3, AC4, AC6, AC7) |
| FR-15 / FR-16 / FR-17 | S-14 / S-15 / S-16 |
| NFR-01 | Measured at Gate 5 with 50 sample assignments (only partial without Classroom) |
| NFR-02 | S-12, S-18. Not demonstrated if those are deferred. |
| NFR-03 | S-17. Not demonstrated if it is deferred. |
| NFR-04 | S-01 + S-02, timed with an unaided person at Gate 5 |

## 7. Slice cards (pending team approval)

### Committed-scope candidates (recommendation)

**S-01 — Enter daily study availability.** *Recommended first slice.*
- **Why first:** fully specified, no external service, no undefined rule, it passes through every layer, and S-03 needs it.
- **Outcome:** hours for each of the next 7 days, editable. Blank days show "Unknown", never 0.
- **Acceptance criteria:**
  - FR-03-AC3; FR-03-AC1 (the first-seven-days part);
  - values persist on the server after a reload;
  - *proposed criterion, needs approval:* an invalid entry is rejected with a message and the previous value is kept.
- **Excludes:** recurring baseline (FR-03-AC6, needs D-12) and recalculation (comes with S-03).
- **Checks:** EP (valid, negative, text, blank); BVA at the D-13 limits; a second browser shows the same values.

**S-02 — Rate confidence per course.**
- **Outcome:** a 1–5 scale labelled "Very Low" to "Very High Confidence". A new course appears unrated and the Student is prompted.
- **Acceptance criteria:** FR-14-AC1, AC5; FR-14-E2 (out-of-range rejected, previous rating kept).
- **Excludes:** re-estimation (S-06) and the "unreliable" flag (S-05).
- **Checks:** BVA 0, 1, 5, 6; EP not a whole number; edit, then reload.

**S-03 — See when to start each assignment.** *Blocked by D-03 and D-12.*
- **Outcome:** with manual effort entry when no estimate exists, the Student sees a start-by date, or "no date — short by X h", or "cannot be determined yet". It updates when inputs change.
- **Acceptance criteria:** FR-05-AC1 to AC3, FR-03-AC2, AC4, FR-06-AC1, AC2; the approved rule's worked examples, once written.
- **Checks:**
  - available hours exactly equal to effort, and effort + one step;
  - a blank day before the deadline;
  - effort 0 or negative;
  - deadline today, or in the past.
- **Manual effort:** follows the DL-05 default ("no estimate" plus manual entry), which awaits confirmation.

**S-08 — Assignment status.**
- **Outcome:** "Already Started" and "Not Started" (latest wins), and a manual "Finished". Submitted is shown separately, as "unavailable" when no Classroom data exists.
- **Acceptance criteria:** FR-09-AC2, AC3, AC4, AC6; FR-10-AC2, AC3, AC5 (display); FR-07-AC5.
- **Excludes:** the "Got it" pause and reminders (S-17), and real Classroom detection (S-11).
- **Checks:** a repeated confirmation changes nothing; a second browser shows the same state; "unavailable" ≠ "not submitted".

**S-14 — Subtasks.**
- **Outcome:** add, edit, complete, un-complete and delete subtasks; the list shows "2 of 5". The assignment's status never changes because of subtasks.
- **Acceptance criteria:** FR-15-AC1 to AC9.
- **Checks:** blank and whitespace-only titles (AC8); BVA at the D-13 title limit; all complete → status unchanged (AC6); no subtasks → no "0 of 0" (E4).

**S-15 — Study timer.**
- **Outcome:** start, pause, resume and stop. Each session is saved. The total recorded time is shown apart from effort.
- **Acceptance criteria:** FR-16-AC1 to AC9. Timer state is stored on the server as timestamps (DL-16).
- **Checks:** paused time is excluded (AC5); a second timer is refused (AC8); close the browser and return (AC9); two devices show the same state; the zero-length case once D-23 is decided.

**S-16 — Search, filter and sort.**
- **Acceptance criteria:** FR-17-AC1 to AC9.
- **Checks:**
  - "lab" matches "Lab 3" (part of the title, any letter case);
  - combined filters (AC5);
  - a range ending before it starts is rejected (E5);
  - BVA on the range end dates (D-13);
  - undated assignments are excluded from range filters and sorted last;
  - unavailable status is not treated as "not submitted" (AC9).

**S-07 — Remaining hours and progress.** *Blocked by D-03 and D-22.*
- **Acceptance criteria:** FR-07-AC1 to AC4, AC6; FR-03-AC5.
- **Checks:** the latest report replaces older ones; remaining hours that don't fit → a shortage; 0 or negative values.

**S-09 — Course-balance and start-by warnings.** *Blocked by D-05.*
- **Acceptance criteria:** FR-08-AC1 to AC6.
- **Checks:** BVA on the advisory boundary once D-05 is decided; the wording never says "no work was done"; a balance notice and an urgent warning are shown as separate, labelled messages (AC3).

**S-10 — Manual deadline for an undated assignment.**
- **Acceptance criteria:** FR-02-AC1, AC2, AC5; BR-02 (the date is labelled as Student-entered).
- **Note:** this uses sample undated items. Arrival of an official deadline is S-12.

### Stretch candidates (recommendation: attempt only if the feasibility checks pass)

**S-05 — AI effort estimate.** *Blocked by D-06, D-14 and F-AI.*
- **Acceptance criteria:** FR-04-AC1, AC2, AC4, AC5; FR-14-AC2; the AI payload contains only the ADR-006 allow-list.
- **Fallback (documented in ADR-003 Decision 6 and DL-05):** the AI adapter is disabled, showing "no estimate" with manual effort. **This does not meet FR-04's estimation requirement.**
- **Not a fallback option:** a local rule-based estimator would change the requirement (ADR-006, Alternative 3C).

**S-11 — Google sign-in and Classroom import.** *Blocked by F2 and D-07.*
- **Acceptance criteria:** FR-01-AC1; Classroom submission status (FR-10); new courses unrated (FR-14-AC5); scopes and token rules per ADR-006.
- **Fallback:** sample data (D-08). **This does not meet FR-01**, and the UI must show "sample data".

**S-04 — Shortage suggestions and adjustable allocation.** *Blocked by D-04.*
- **Acceptance criteria:** FR-05-AC4; FR-06-AC3 to AC6.
- **Checks:** suggestions never rank assignments (N-01, BR-05).

### Deferred candidates (recommendation, pending approval)

- **S-06:** depends on S-05, which is itself a stretch item.
- **S-12:** needs real Classroom sync (S-11). The deadline-change notice is meant to be a device Notification (ADR-003), which also needs S-17.
- **S-13:** needs S-11 and the OQ-27 details.
- **S-17:** needs an HTTPS host or tunnel and the F1 test on the team's phones; largest risk. An in-app list would **not** meet FR-11.
- **S-18:** needs D-15, S-04 and S-11. There is no fallback that meets FR-12.

## 8. Enabling and required non-slice work

Enabling work is not counted as slices. All estimates are recommendations.

| ID | Work | Est. h | Depends on |
|---|---|---|---|
| E-00 | Check tools on each laptop (Node LTS, Docker with PostgreSQL); set up a local Git repository with one branch per slice | 1–2 | — |
| E-01 | Walking skeleton per agent.md: 11 module folders each with `index.ts`, Fastify, React/Vite PWA shell, `pg` with migrations in `data-access/migrations/`, Vitest on real PostgreSQL, dependency-cruiser allow-list | 8–12 | D-09, D-10, D-19, D-21 |
| E-02 | Demo-Student session | 2–3 | E-01, D-07 |
| E-03 | **Stage 3 artefacts** (D4): data model including the shared assignment table, API contract, UI wireframes (review the UI) | 3–4 | E-01 |
| E-04 | Sample data, labelled in the UI: about 50 assignments across 5 courses, including undated ones and mixed statuses | 2–3 | E-03, D-08 |
| E-05 | Read-only assignment list and detail screens | 2–3 | E-04 |
| F2 | Classroom feasibility check with a real Student account (time-boxed) | 3–4 | Google Cloud project |
| F-AI | Gemini check: can billing be enabled, and does one synthetic call work? | 1.5–2 | — |
| F1 | Phone push feasibility test (ADR-005), only if S-17 is attempted | 4–6 | D-11 |

| Required non-slice work | Notes | Est. h |
|---|---|---|
| plan.md versions | v01 now. Then new copies after: decisions, skeleton and Stage 3, first loop, end of 28 Nov, feature freeze, final. | 4 |
| README.md | Prerequisites, environment file, how to start, test and run the boundary check, sample-data mode | 2.5 |
| Document updates | PRD §8 (OQ-30/31/33), new decision-log entries, ADR-001/003/006 notes, agent.md §8.1 and §11, architecture.md §9.5–9.6 | 3–4 |
| Evidence upkeep | `evidence/` files, filled continuously and never reconstructed at the end | 2 (plus per slice) |
| Group Contribution Log (D4) | `evidence/Group-Contribution-Log.md` | 1.5 |
| Final validation (Gate 5) | End-to-end flows; NFR-01 timing; NFR-04 stopwatch | 6–8 |
| Final report and CCP analysis | CCP sources: PRD §1; ASR file §2 and §5; ADR alternatives and trade-offs; ADR-006 privacy. Measured results come only from real tests. | 8–10 |
| Demo preparation and packaging | Script covering the D4 "Final Demo" list; rehearsal | 5 |

**Rough totals (recommendation):**
- Committed candidates: about 123 h (range 100–150), including enabling and non-slice work.
- Stretch: +30 h.
- Deferred: about 60 h.

## 9. Provisional schedule and capacity

**This schedule is provisional until the team fills in the capacity table.** Tracks A–D are work streams, not people; owners are not assigned.

| Day | Track A | Track B | Track C | Track D | End of day |
|---|---|---|---|---|---|
| Thu 26 Nov (evening) | Decisions meeting (D-01, D-02, D-07 to D-10, D-13, D-19, D-21; D-03 if possible) | E-00 tooling check | Create Google Cloud project; F2 setup | Save Stage 2 evidence; plan-v01 | plan-v01 saved |
| Fri 27 Nov | E-01 → S-01 (first full loop, team reviews) | E-03 → E-04 → E-05 | F2 + F-AI (morning), then go / no-go for S-11 and S-05 | README draft; document updates; S-02 after S-01 merges | Gate 4; new plan version |
| Sat 28 Nov | S-03 (needs D-03) | S-14 | S-15 | S-16 | Merge; Gate 4; new plan version; stretch decision |
| Sun 29 Nov | S-08 → S-09 (needs D-05) | S-07 → S-10 | S-05 if F-AI passed, otherwise testing | S-11 if F2 passed, otherwise report and CCP drafting | Feature freeze (recommended about 18:00); full regression; new plan version |
| Mon 30 Nov | Gate 5 end-to-end | NFR measurements; README final | Report, CCP, contribution log | Packaging; demo rehearsal | Submit; final plan version |

**Capacity table** (fill in available hours; do not guess)

| Member | 26 Nov | 27 Nov | 28 Nov | 29 Nov | 30 Nov | Total |
|---|---|---|---|---|---|---|
| Member 1 | | | | | | |
| Member 2 | | | | | | |
| Member 3 | | | | | | |
| Member 4 | | | | | | |
| **Team total** | | | | | | **Compare with about 123 h for the committed candidates** |

## 10. Cut line (recommendation)

**Reason:** protect the two core problems named in RG-32 (knowing when to start, and spotting neglected courses) and drop the riskiest or most dependent work first.

- **If time runs short, drop in this order:** S-04 → S-11 → S-05 → S-10 → S-07 → reduce S-16 to search plus course filter → S-15 → S-14.
- **Do not drop:** S-01, S-02, S-03, S-08, S-09.
- **Honest impact:** without S-05, S-11, S-17 and S-18, the demo uses labelled sample data with manual effort, and has no Classroom link, AI estimate or notifications. Record any deferral through PRD §8 and decision-log.md, and do not promise these features.

## 11. Parallel work (recommendation)

**Reason:** four people editing the same files without Git branches is the biggest integration risk.

- **26–27 Nov:** not four-way. One track builds the skeleton (E-01). The others work on Stage 3 artefacts, feasibility checks and documents, which don't touch the same files.
- **From 28 Nov:** S-03, S-14, S-15 and S-16 in parallel, but only after E-00 (Git branches), E-03 (schema and API contract), E-04 and E-05 are merged, and D-03 is decided for S-03. **Safer fallback:** two in parallel (S-03 and S-14).
- **Shared hotspots to agree first:**
  1. the single `data-access/migrations/` folder (pre-assign migration numbers per slice);
  2. the assignment table columns;
  3. Planning Core's `index.ts` and the API route registration (add only, don't rewrite);
  4. the assignment list and detail screens (agree a slot for each of S-14, S-15 and S-16);
  5. client and server data types (no shared package is allowed, so the E-03 API contract is the reference);
  6. the sample dataset;
  7. the dependency-cruiser configuration (changed only in E-01).

## 12. Status summary

All slices are **proposed** or **blocked**. Nothing is in progress, done or tested. The next step: the team reviews this plan, decides the "No" rows in Section 4, then saves the result as plan-v02.
