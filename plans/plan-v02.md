# plan.md — AI Academic Deadline Planner (D4)

**Version:** v02 (corrected 27 November 2026, second pass) · **Date:** 27 November 2026
**Status:**
- The team approved the scope, rules, setup decisions and gap resolutions on 27 November. They are recorded as DL-18 to DL-54 in `decision-log.md`.
- The team asked the AI assistant to draft the wording of the gap resolutions (DL-44 to DL-53). The team reviews that wording at the next plan version.
- The schedule, estimates, checkpoints and parallel-work advice are still recommendations.

**Saved copies:** `plans/plan-v01.md` (v01, 26 Nov) and `plans/plan-v02.md` (this version, including the second-pass corrections). Each meaningful change gets a new copy. D4 deducts marks for missing plan history.

> **How to read this plan.**
> - **Approved:** decided by the team; the decision-log entry (DL-xx) is cited.
> - **Recommendation:** advice from the AI-assisted review, not a team decision.
> - **Blocked:** cannot start yet; the blocker is named.
> - **Ready:** every blocking decision is approved and every dependency exists.
> - No item is owned, done, tested or accepted.

**Plain-language terms**
- **Vertical slice:** one small feature a user can see, built through every part of the system (screen → server → logic → database).
- **HITL ("human in the loop"):** a team member works alongside the AI and checks each step. **AFK / delegated:** the AI works alone and a human reviews the result afterwards.
- **Migration:** a numbered SQL file that creates or changes database tables.
- **Sample data:** made-up courses and assignments, used so that features work without Google Classroom.
- **Walking skeleton:** the thinnest version of the whole app that runs end to end, with no real features yet.
- **EP / BVA:** EP (equivalence partitioning) tests one example from each group of similar inputs. BVA (boundary value analysis) tests values at and just beside a limit.
- **Override:** a value the Student entered that the system must never replace automatically.

---

## 0. What changed since v01

**First pass, 27 Nov:**
- **Decisions:** D-01 to D-26 approved (DL-18 to DL-41).
- **Scope:** 11 committed slices plus reserve S-19; S-04 moved to committed; S-05 and S-11 deferred; seven slices deferred in total.
- **Feasibility checks:** F-AI, F2 and F1 removed.
- **Rules:** R1-B, R2-A and R3-A approved, with examples.
- **Schedule:** rewritten for 27–30 Nov, with S-07 before S-09; checkpoints added; the hours table removed.

**Second pass, 27 Nov (corrections):**
- **D-21 corrected (DL-42):** the TypeScript skill check is required before E-01 starts.
- **D-23 corrected (DL-43):** follow FR-16-AC4. Every stopped session is saved, including 0-second sessions.
- **NG-1 to NG-10 approved (DL-44 to DL-53)** and applied in §4.4, §5, §7 and §8. They no longer block anything.
- **CF-1 to CF-10 resolved (DL-54 and others; §4.3):** none is awaiting a team decision.
- **Statuses:** slices are now blocked only by enabling work that hasn't been done (E-01 to E-05) or by earlier slices.

## 1. Product objective

Source: `PRD.md` §1. This is a Google Classroom-linked planner that:
- turns assignment deadlines into effort-based **start-by dates**;
- shows when study availability is insufficient;
- warns about course neglect;
- reminds the Student on phone and laptop.

Estimates are personalised by the Student's per-course confidence rating, and the Student stays in control of the plan. User goals UG-1 to UG-4 and product goals G-1 to G-8 are in PRD §1. Course grading criteria are **not** product requirements and are kept separate (Section 2).

**For D4 (approved, DL-19):** the committed scope in §6 runs on labelled sample data. Classroom connection, AI estimation, device notifications and Google Calendar are deferred and will not be built. The report must state plainly that FR-01 and FR-04's AI estimation are not delivered (DL-20).

## 2. Confirmed context

| Item | Status |
|---|---|
| Today | Friday 27 November 2026. |
| Deadline | **30 November 2026**, confirmed by the instructor. |
| Document discrepancy | `Final Project Deliverable (D4).docx` (line 4) and `Instructions-D4.docx` (lines 15 and 69) say **27 November 2026**. This plan follows the instructor's 30 November date. Keep the instructor's confirmation as evidence and mention it in the final report. |
| Submission time on 30 Nov | Unknown. |
| Feature days | 27, 28 and 29 November. **Feature freeze on Sunday 29 November in the evening.** 30 November is only for final verification, the report, packaging and demo preparation; no new features that day. |
| Implementation | Not started. There is no source code, README.md or Git history in the project folder. |
| Team | Four members. Each prompts one coding-agent session (see A-05). |
| Team target | At least **11** genuinely complete, user-visible slices. A slice counts only when it is implemented, checked against its acceptance criteria, reviewed by a teammate other than the author, accepted, integrated and recorded in `evidence/Workflow-Evidence-Log.md`. D4 itself asks only for "multiple meaningful slices". |

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

## 3. Assumptions

| ID | Assumption | If wrong |
|---|---|---|
| A-02 | The ADRs and agent.md apply as written, except where DL-54 gives a decision-log entry precedence for D4 (agent.md §12). | Re-plan the affected slices |
| A-03 | The team does not wait for TA answers (DL-26). It uses these team defaults as assumptions: DL-01 ("local" means the system's own database), DL-05 ("no estimate" plus manual effort), DL-06 (AI allow-list; unused, because nothing is sent) and DL-10 (NFR-03 reading; unused, because S-17 is deferred). | A later TA answer is handled as a change request |
| A-04 | Estimates are AI-assisted guesses that include checks and evidence logging, with roughly ±50% uncertainty. Agent turnaround times are not guaranteed. | Use the reserve and checkpoints (§9, §10) |
| A-05 | At most four coding-agent sessions run at once, one per teammate. This is an assumption, not a verified fact, and no more parallelism is assumed. | Use the sequential fallback in §11 |

## 4. Decisions

### 4.1 Approved on 27 November 2026

| ID | Approved decision (short) | Entry |
|---|---|---|
| D-01 | `PRD.md` is authoritative. `Final_Validated_PRD.md` and `Draft prd.md` are superseded. | DL-18 |
| D-02 | 11 committed slices; S-19 as the single reserve; S-05, S-06, S-11, S-12, S-13, S-17 and S-18 deferred and not built. No requirement is deleted. | DL-19 |
| — | Feasibility checks F-AI, F2 and F1 are skipped. FR-01 and FR-04's AI estimation are not delivered. | DL-20 |
| D-21 | The TypeScript stack stays. **The skill check is required before E-01 starts.** No result is recorded until the team gives one. Every slice is reviewed by a teammate other than the author, who runs the checks. | DL-21, corrected by DL-42 |
| D-25 | Private GitHub repository; one branch per slice; branches merged one at a time; the author never reviews their own slice. | DL-22 |
| D-26 | PostgreSQL runs in Docker Desktop (Docker Compose). | DL-23 |
| D-11 | Local execution only: no Azure, no tunnel. | DL-24 |
| D-18 | DL-17 is re-approved, except behaviour belonging to deferred slices. The four sign-off lines in ASR file §11 are to be signed. | DL-25 |
| D-20 | No waiting for TA answers; team defaults are recorded as assumptions. | DL-26 |
| D-07 | One seeded demo Student with a real session, issued through the API Layer's sessions-only path. | DL-27 |
| D-08 | A script loads the sample data straight into the database: at least 50 assignments across 5 courses, including undated ones and mixed statuses. The UI labels it "sample data". | DL-28 |
| D-09 | Separate `client/` and `server/` folders; all 11 modules each in their own folder under `server/`. | DL-29 |
| D-10 | A local boundary-check command must pass before any slice branch is merged; its output goes into the Gate 3 evidence. | DL-30 |
| D-19 | ADR-001 lists all 11 modules and interfaces, and its dependency table has rows for both interfaces. | DL-31 |
| D-03 | Start-by rule R1-B, with conventions C-0 (§5). | DL-32 |
| D-04 | Allocation rule R2-A (§5). | DL-33 |
| D-05 | Neglect rule R3-A, the definition of "activity", and the 3-day advisory (§5). | DL-34 |
| D-06 / D-14 | AI estimation is not built. Effort is entered manually; no student data is sent anywhere. | DL-35 |
| D-12 | A blank day is unknown, never default hours. PRD V-01 wording fixed; OQ-01 resolved. | DL-36 |
| D-17 | Planning uses the official deadline, or the Student-entered deadline when the assignment is undated. | DL-37 |
| D-22 | Progress report = remaining hours (0–200, 0.5 steps) plus a timestamp. | DL-38 |
| D-23 | **Follow FR-16-AC4:** every stopped session is saved with its duration, including 0 seconds. | DL-39, corrected by DL-43 |
| D-24 | A Student-entered deadline may be today or later. | DL-40 |
| D-13 | Input limits (§5). | DL-41 |
| NG-1 to NG-10 | Gap resolutions (§4.4) | DL-44 to DL-53 |
| CF-1, 2, 3, 7, 10 | D4 precedence of decision-log entries over the original document wording (§4.3) | DL-54 |

### 4.2 Still open
- **The result of the TypeScript skill check.** It is required before E-01 (DL-42). No result is recorded yet, and E-01 is blocked until the team gives one.
- **The member sign-offs in ASR file §11 (DL-25):** a team action. They do not block any slice.
- **D-15 (Calendar block times) and D-16 (notification details):** not decided, because S-17 and S-18 are not built.

### 4.3 Resolved conflicts and D4 precedence

None of these is awaiting a decision. Where an entry has precedence, the original wording stays in its document.

| ID | Resolution | Entry |
|---|---|---|
| CF-1 | For D4, DL-27 (demo Student) takes precedence over ADR-006 Decision 1. | DL-54 |
| CF-2 | For D4, DL-24 (local execution only) takes precedence over DL-02, ADR-001 Hosting and D1–D2, architecture.md §9.5, and agent.md §6 rule 8 and §7. | DL-54 |
| CF-3 | For D4, DL-30 and DL-46 (local check) take precedence over the CI wording in ADR-001, architecture.md §6.2, and agent.md §4.2 and §4.5. The allow-list and default-deny rules still apply. | DL-54 |
| CF-4 | The skill check comes before E-01, as DL-14 and ADR-001 already said. | DL-42 |
| CF-5 | FR-16-AC4 is followed: 0-second sessions are saved. | DL-43 |
| CF-6 | "3 or more full days" is the team's approved interpretation. FR-08's text is unchanged. | DL-34 |
| CF-7 | For D4, deferred slices are not built: all 11 module folders exist with `index.ts`, and modules that serve only deferred slices contain no deferred behaviour (agent.md §12). | DL-54 |
| CF-8 | The DL-17 status lines now read "re-approved 27 November 2026 (DL-25)". | DL-25 |
| CF-9 | ADR-001's dependency table now has rows for the Push Gateway and OAuth Client interfaces. | DL-31 |
| CF-10 | For D4, DL-35 (no AI estimation) takes precedence over DL-13, ADR-003 Decision 6 and ADR-006 Decision 7. | DL-54 |

### 4.4 Approved gap resolutions (wording drafted by the AI assistant at the team's request)

| ID | Resolution | Entry |
|---|---|---|
| NG-1 | One `index.ts` per module. The Data Access Layer exports a named `sessions` group, and it is the only thing the API Layer imports from it. Planning Core exports `readOnly` (unused in D4). Gate 3 review checks this. | DL-44 |
| NG-2 | `client/`; module folders under `server/src/` (`api-layer`, `planning-core`, `sync-engine`, `classroom-adapter`, `calendar-adapter`, `ai-adapter`, `notification-scheduler`, `credential-handling`, `data-access`, `push-gateway`, `oauth-client`). Migrations are `server/src/data-access/migrations/NNNN_short_name.sql`, numbered in advance per slice and never edited once applied. | DL-45 |
| NG-3 | `npm run check:boundaries`, run in `server/`, with its configuration in `server/.dependency-cruiser.cjs`. | DL-46 |
| NG-4 | Seed code in `server/src/data-access/seed/`, run with `npm run seed:sample` in `server/`. It can be re-run safely and is not a migration. | DL-47 |
| NG-5 | R1-B: blank days, equal deadlines, which assignments take part, deadlines already passed (§5). | DL-48 |
| NG-6 | Manual effort is 0.5–200 h in 0.5 steps; 0 is rejected; blank means "no estimate". | DL-49 |
| NG-7 | Planning uses whichever was saved most recently: the effort entry or the latest remaining-hours report. | DL-50 |
| NG-8 | An allocation edit is a per-day override. Edits beyond a day's free availability are rejected; a day that becomes over-allocated is flagged (§5). | DL-51 |
| NG-9 | Days without activity are counted from the later of the start-by date and the last activity; any activity restarts the count (§5). | DL-52 |
| NG-10 | One value per weekday; applies from today + 7 onward; needs an explicit confirmation; filled days are labelled "baseline" (§5). | DL-53 |

## 5. Approved product rules (27 November 2026)

**Conventions C-0 (DL-32, extended by DL-50):**
- Today counts as a planning day; the deadline day does not.
- Hours are in steps of 0.5.
- Effective effort = whichever was saved most recently: the Student's effort entry or the latest remaining-hours report. D4 has no AI estimates (DL-35), so an assignment with no entered effort shows "no estimate" and no start-by date (DL-05).
- The applicable deadline follows DL-37.

**R1-B Start-by date (DL-32, details DL-48):**
- Sort the assignments that take part by deadline, latest first. Equal deadlines are ordered by assignment ID, a technical order that is not a priority.
- Fill each one's effective effort backwards into the hours still free on usable days before its deadline.
- Its start-by date is the earliest day that received hours.
- If the free hours can't cover the effort, show no start-by date, just the shortage (BR-04).
- **Which assignments take part:** those with a deadline, effective effort above 0, and neither Finished nor Submitted. A deadline before today gives "deadline passed" and takes no hours.
- **Blank days:** a blank day gives no hours.
  - If the entered hours cover the effort, show the start-by date and prompt for the blank days.
  - If not, and any day before the deadline is blank, show "cannot be determined yet" and name the blank days.
  - If every day is entered, show the shortage.
- *Example 1 (today = Monday):* Assignment A needs 4 h, due Thursday. Assignment B needs 4 h, due Friday. There are 2 h on each of Mon–Thu.
  - B goes first: Thu 2 + Wed 2 → **B starts Wednesday**.
  - A: Wednesday has 0 h left, so Tue 2 + Mon 2 → **A starts Monday**.
- *Example 2:* the same, but A needs 6 h. A gets Mon 2 + Tue 2 = 4 h → **no start-by date, short by 2 h**.
- *Example 3 (blank day):* C needs 3 h, due Thursday; Mon 1, Tue blank, Wed 1.
  - → **"Cannot be determined yet — enter availability for Tuesday."**
  - With Tuesday entered as 0 → short by 1 h.
  - If C needs 2 h and Tuesday is blank → start-by Monday, with a prompt to fill in Tuesday.

**R2-A Allocation (DL-33, details DL-51):**
- Show R1-B's daily split as the suggested allocation.
- When hours run short, suggestions are neutral facts only and never ranked (BR-05, N-01).
- **Edits:** an edit is stored as an override for that assignment and day. Overrides are placed first and count towards the assignment's effort; R1-B fills the rest around them.
  - An edit larger than the day's availability minus the other overrides is rejected with a message.
  - If availability later falls below the overrides, they are kept and the day is flagged "over-allocated".
- *Example (from R1-B example 2):* "B: Wed 2 h, Thu 2 h". "A: Mon 2 h, Tue 2 h — short by 2 h before Thursday". Suggestions: "Add 2 h of availability between Monday and Wednesday" or "Review the effort entered for A". Neither is placed above the other.
- *Edit example:* the Student sets A to 2 h on Wednesday.
  - B then gets Thu 2 + Tue 2 → B starts Tuesday.
  - A gets Wed 2 + Mon 2 = 4 of 6 h → no start-by date, short by 2 h.
  - Setting A to 3 h on Wednesday is rejected, because Wednesday has only 2 h.

**R3-A Neglect (DL-34, details DL-52):** a course gets a cautiously worded possible-imbalance notice when all three hold:
1. it has an unfinished, unsubmitted assignment whose start-by date is within the next 3 days or has passed;
2. none of its assignments has had any activity in the last 7 days;
3. at least one other course has had activity in that period.

- **Activity** means: marking an assignment Already Started or Finished (S-08), or entering a progress or remaining-hours report (S-07). Study timer sessions are **not** activity (OQ-40). So S-09 depends on S-07 and S-08.
- **3-day advisory:**
  - Days without activity = today minus the later of the start-by date and the last activity date (Asia/Karachi days).
  - Shown once the start-by date has passed and the count is 3 or more. Any activity restarts the count.
  - BVA: start-by Monday with no activity → Wednesday 2 (no), Thursday 3 (yes), Friday 4 (yes).
  - This is the team's approved interpretation of FR-08; its text is unchanged.
- *Example:* Math has a start-by date in 2 days and its last activity was 9 days ago. Physics had activity yesterday. English has nothing upcoming. → **Only Math** gets a notice: "No recent progress logged for Math — you may not have recorded it."

**Other approved rules:**
- **D-12 / DL-36 and DL-53 (availability and baseline):**
  - A blank day is unknown, never default hours.
  - The only way to prefill days is S-19's baseline: one value per weekday, Monday to Sunday, each 0–24 h in steps of 0.5 or blank.
  - It applies only to unentered days from today + 7 onward, is saved only after an explicit "Use this weekly pattern" confirmation, and filled days are labelled "baseline".
- **D-17 / DL-37:** planning uses the official deadline, or the Student-entered deadline when undated. There is no separate pacing target.
- **D-22 / DL-38:** a progress report stores remaining hours (0 or more, steps of 0.5, maximum 200) with a timestamp. The latest report replaces older ones. 0 remaining does not change the status.
- **DL-49:** manual effort is 0.5–200 h in steps of 0.5; 0 is rejected; blank means "no estimate".
- **D-23 / DL-43:** every stopped timer session is saved with its duration, including 0 seconds (FR-16-AC4). Only one timer can run at a time.
- **D-24 / DL-40:** a Student-entered deadline may be today or later. Yesterday or earlier is rejected with a message. A deadline of today means no planning days, so the result is a shortage.
- **D-13 / DL-41:**
  - Availability: 0–24 h in steps of 0.5; 0 is allowed and differs from blank.
  - Time zone: Asia/Karachi; a day starts at midnight; "next 7 days" = today plus 6.
  - Rating labels: Very Low, Low, Moderate, High, Very High Confidence.
  - Subtask title: 1–200 characters after trimming whitespace.
  - FR-17 date range: includes both end dates; a range ending before it starts is rejected.

## 6. Slice backlog

- **Tier:** approved (DL-19).
- **Est. h and Mode:** recommendations. Size: S = 4 h or less, M = 4–8 h, L = more than 8 h.
- **Status:** nothing is "ready" yet, because no enabling work (E-01 to E-05) exists, and E-01 waits for the skill check (DL-42).
- **FR coverage:** ✓ = the whole FR; ◐ = part of it.

| ID | Slice (what the Student can do) | Requirements | Tier | Est. h | Mode | Status (blocker) |
|---|---|---|---|---|---|---|
| S-01 | Enter daily study availability for 7 days | FR-03◐, BR-17, NFR-04◐ | Committed | 5–7 M | HITL | blocked: E-01, E-02 not built |
| S-02 | Rate confidence per course (1–5) | FR-14◐, BR-16, NFR-04◐ | Committed | 3–4 S | AFK | blocked: E-04 not built |
| S-03 | See start-by date, shortage, or "cannot be determined yet" | FR-05◐, FR-03◐, FR-06◐, FR-04◐ (manual effort), BR-04 | Committed | 8–12 L | HITL | blocked: S-01, E-05 not built |
| S-08 | Mark Already Started / Not Started / Finished; see Submitted separately | FR-09◐, FR-10◐, FR-07◐, BR-08, BR-09 | Committed | 4–6 M | AFK | blocked: E-05 not built |
| S-14 | Break an assignment into subtasks | FR-15✓, BR-20 | Committed | 5–7 M | AFK | blocked: E-05 not built |
| S-15 | Time study sessions | FR-16✓, BR-21 | Committed | 6–8 M | AFK + HITL review | blocked: E-05 not built |
| S-16 | Search, filter and sort assignments | FR-17✓ | Committed | 5–7 M | AFK | blocked: E-05 not built |
| S-07 | Report remaining hours | FR-07◐, FR-03◐, BR-03 | Committed | 3–5 S | HITL-light | blocked: S-03 not built |
| S-09 | Course-balance and start-by warnings | FR-08✓, BR-03, BR-10 | Committed | 6–8 M | HITL | blocked: S-03, S-07, S-08 not built |
| S-10 | Give an undated assignment a deadline | FR-02◐, BR-02 | Committed | 3–4 S | AFK | blocked: S-03, E-04 not built |
| S-04 | Shortage suggestions and adjustable allocation | FR-05◐, FR-06◐, BR-05 | Committed | 6–8 M | HITL | blocked: S-03, S-07 not built |
| S-19 | Set a recurring weekly availability baseline | FR-03◐ (AC6), BR-17 | Reserve | 3–4 S | HITL-light | blocked: S-01 not built |
| S-05 | AI effort estimate with "unreliable" flag | FR-04◐, FR-14◐, BR-15 | Deferred | — | — | not built (DL-19) |
| S-06 | Re-estimate after a rating change | FR-04◐, FR-14◐ | Deferred | — | — | not built |
| S-11 | Google sign-in and Classroom import | FR-01◐, FR-10◐, FR-14◐ | Deferred | — | — | not built |
| S-12 | Classroom deadline changes and outages | FR-01◐, FR-02◐, NFR-02◐ | Deferred | — | — | not built |
| S-13 | Classroom revocation: keep or delete, then reconnect | FR-13✓, FR-01◐ | Deferred | — | — | not built |
| S-17 | Phone and laptop reminders with "Got it" | FR-11✓, FR-09◐, FR-10◐, NFR-03 | Deferred | — | — | not built |
| S-18 | Study plan in Google Calendar | FR-12✓, NFR-02◐ | Deferred | — | — | not built |

Count check: 11 committed (S-01, S-02, S-03, S-04, S-07, S-08, S-09, S-10, S-14, S-15, S-16), 1 reserve (S-19) and 7 deferred, for 19 cards in total.

**Traceability** (deferred parts are not delivered in D4; see PRD §11)

| Requirement | Slices |
|---|---|
| FR-01 | Deferred: S-11 (AC1), S-12 (AC2–AC4), S-13 (AC5) |
| FR-02 | S-10 (AC1, AC2, AC5); deferred: S-12 (AC3, AC4, AC6) |
| FR-03 | S-01 (AC1, AC3), S-03 (AC2, AC4), S-07 (AC5); reserve S-19 (AC6) |
| FR-04 | S-03 (manual effort only); deferred: S-05, S-06 |
| FR-05 / FR-06 | S-03 (FR-05-AC1–AC3, FR-06-AC1–AC2), S-04 (FR-05-AC4, FR-06-AC3–AC6) |
| FR-07 | S-07 (AC1–AC4, AC6), S-08 (AC5) |
| FR-08 | S-09 |
| FR-09 | S-08 (AC2–AC6); deferred: S-17 (AC1) |
| FR-10 | S-08 (AC2, AC3, AC5 display, on sample data); deferred: S-11 (Classroom detection), S-17 (AC4) |
| FR-11 / FR-12 / FR-13 | Deferred: S-17 / S-18 / S-13 |
| FR-14 | S-02 (AC1, AC2 prompt, AC5 on sample courses); deferred: S-05, S-06 (flag and re-estimation) |
| FR-15 / FR-16 / FR-17 | S-14 / S-15 / S-16 |
| NFR-01 | Measured at Gate 5 with 50 sample assignments (only partial without Classroom) |
| NFR-02 / NFR-03 | Not demonstrated (S-12, S-18 / S-17 deferred) |
| NFR-04 | S-01 + S-02, timed with an unaided person at Gate 5 |

## 7. Slice cards

### Committed (approved scope, DL-19)

**S-01 — Enter daily study availability.** *Recommended first slice.*
- **Outcome:** hours for each of the next 7 days (today plus 6), editable. Blank days show "Unknown", never 0.
- **Acceptance criteria:**
  - FR-03-AC3; FR-03-AC1 (the first-seven-days part);
  - values persist on the server after a reload;
  - *proposed criterion, needs approval:* an invalid entry is rejected with a message and the previous value is kept.
- **Excludes:** recurring baseline (S-19) and recalculation (comes with S-03).
- **Checks:**
  - BVA: −0.5, 0, 0.5, 23.5, 24, 24.5.
  - EP: 1.25 (wrong step), text, blank.
  - Today plus 6 is shown; today plus 7 is not.
  - A second browser shows the same values.

**S-02 — Rate confidence per course.**
- **Outcome:** a 1–5 scale labelled Very Low, Low, Moderate, High, Very High Confidence. A new course appears unrated and the Student is prompted.
- **Acceptance criteria:** FR-14-AC1, AC5; FR-14-E2 (out-of-range rejected, previous rating kept).
- **Excludes:** re-estimation and the "unreliable" flag (both deferred).
- **Checks:** BVA 0, 1, 5, 6; EP not a whole number; edit, then reload.

**S-03 — See when to start each assignment.**
- **Outcome:** with manual effort entry (DL-35, DL-49), the Student sees a start-by date, or "no date — short by X h", or "cannot be determined yet", or "deadline passed". It updates when inputs change.
- **Acceptance criteria:** FR-05-AC1 to AC3, FR-03-AC2, AC4, FR-06-AC1, AC2; R1-B examples 1 to 3 (§5) reproduced exactly.
- **Checks:**
  - available hours exactly equal to effort, and effort + 0.5;
  - effort BVA 0 (rejected), 0.5, 200, 200.5 (rejected);
  - equal deadlines;
  - Finished, Submitted and no-effort assignments take no hours;
  - deadline yesterday → "deadline passed"; deadline today → shortage.

**S-08 — Assignment status.**
- **Outcome:** "Already Started" and "Not Started" (latest wins), and a manual "Finished". Submitted is shown separately, as "unavailable" when no data exists.
- **Acceptance criteria:** FR-09-AC2, AC3, AC4, AC6; FR-10-AC2, AC3, AC5 (display); FR-07-AC5.
- **Excludes:** the "Got it" pause and reminders (S-17, deferred).
- **Checks:** a repeated confirmation changes nothing; a second browser shows the same state; "unavailable" ≠ "not submitted". These actions also count as activity for S-09.

**S-14 — Subtasks.**
- **Outcome:** add, edit, complete, un-complete and delete subtasks; the list shows "2 of 5". The assignment's status never changes because of subtasks.
- **Acceptance criteria:** FR-15-AC1 to AC9.
- **Checks:**
  - title length 0 (empty), 1, 200, 201 after trimming;
  - a whitespace-only title is rejected;
  - all complete → status unchanged (AC6);
  - no subtasks → no "0 of 0" (E4).

**S-15 — Study timer.**
- **Outcome:** start, pause, resume and stop. **Every stopped session is saved with its duration, including 0 seconds** (DL-43). The total recorded time is shown apart from effort. Sessions are not activity for S-09.
- **Acceptance criteria:** FR-16-AC1 to AC9. Timer state is stored on the server (DL-16).
- **Checks:** a 0-second stop is saved with 0 s; a 1-second stop is saved; paused time is excluded (AC5); a second timer is refused (AC8); close the browser and return (AC9); two devices show the same state.

**S-16 — Search, filter and sort.**
- **Acceptance criteria:** FR-17-AC1 to AC9.
- **Checks:**
  - "lab" matches "Lab 3" (part of the title, any letter case);
  - combined filters (AC5);
  - a range ending before it starts is rejected;
  - BVA: a deadline equal to the start date is included, one equal to the end date is included, the day after the end is excluded;
  - undated assignments are excluded from range filters and sorted last;
  - unavailable status is not treated as "not submitted" (AC9).

**S-07 — Report remaining hours.**
- **Acceptance criteria:** FR-07-AC1 to AC4, AC6; FR-03-AC5.
- **Checks:**
  - BVA −0.5, 0, 0.5, 199.5, 200, 200.5;
  - the latest report replaces older ones;
  - the most recent of an effort edit and a report is the one used (DL-50 example);
  - 0 remaining → no hours taken, status unchanged;
  - remaining hours that don't fit → a shortage.

**S-09 — Course-balance and start-by warnings.**
- **Acceptance criteria:** FR-08-AC1 to AC6; R3-A example (§5).
- **Checks:**
  - advisory BVA: Wednesday 2 (no), Thursday 3 (yes), Friday 4 (yes);
  - an activity restarts the count;
  - a timer session does not restart it;
  - the wording never says "no work was done";
  - a balance notice and an urgent warning are shown as separate, labelled messages (AC3).

**S-10 — Deadline for an undated assignment.**
- **Acceptance criteria:** FR-02-AC1, AC2, AC5; BR-02 (labelled as Student-entered).
- **Checks:** yesterday rejected; today accepted → shortage; tomorrow accepted; blank or invalid rejected. Uses sample undated items.

**S-04 — Shortage suggestions and adjustable allocation.**
- **Acceptance criteria:** FR-05-AC4; FR-06-AC3 to AC6; R2-A examples (§5).
- **Checks:**
  - reject the suggestions → shortage stays;
  - the edit example (Wednesday 2 h accepted, 3 h rejected);
  - availability lowered below an override → kept and flagged "over-allocated";
  - suggestions are never ranked.

### Reserve (approved, DL-19)

**S-19 — Recurring weekly availability baseline (FR-03-AC6).**
- **Source:** FR-03, second sentence ("shall also support an explicitly Student-confirmed recurring future availability baseline"); FR-03-E1; BR-17; DL-53.
- **Outcome:** the Student enters one value per weekday (or leaves it blank) and confirms with "Use this weekly pattern". Unentered days from today + 7 onward use it and are labelled "baseline". Clearing it returns them to unknown.
- **Checks:**
  - today plus 6 stays unknown, today plus 7 uses the baseline;
  - an entered day overrides the baseline;
  - a blank weekday stays unknown;
  - no confirmation → not saved.
- **Use:** replaces any one committed slice that slips.

### Deferred (approved, DL-19; not built)
- **S-05 AI estimate:** AI estimation is not built (DL-35); effort is manual.
- **S-06 Re-estimation:** depends on S-05.
- **S-11 Google sign-in and Classroom import:** Classroom deferred; the demo uses labelled sample data (DL-28).
- **S-12 Classroom changes and outages:** needs Classroom sync and device Notifications.
- **S-13 Revocation:** needs a Classroom connection.
- **S-17 Device reminders:** local execution only (DL-24); no push.
- **S-18 Google Calendar:** Calendar deferred; D-15 not decided.

## 8. Enabling and required non-slice work

Enabling work is not counted as slices.

| ID | Work | Est. h | Status (blocker) |
|---|---|---|---|
| E-00 | Docker Desktop with PostgreSQL (DL-23) and Node LTS on every laptop; private GitHub repository with branch rules (DL-22) | 1–2 | ready |
| SC | TypeScript skill check (DL-42): an honest team check of who can review TypeScript; record the result when the team gives it | 0.5 | ready |
| E-01 | Walking skeleton per agent.md and DL-29, DL-44, DL-45, DL-46: `client/` and `server/src/<module>/` for the 11 modules, each with `index.ts`; Fastify; a React/Vite PWA shell; `pg` with migrations in `server/src/data-access/migrations/`; Vitest on real PostgreSQL; the `sessions` and `readOnly` export groups; `server/.dependency-cruiser.cjs` and `npm run check:boundaries` | 8–12 | blocked: skill check (SC), E-00 |
| E-02 | Demo-Student session through the Data Access Layer's `sessions` group (DL-27, DL-44) | 2–3 | blocked: E-01 not built |
| E-03 | **Stage 3 artefacts** (D4): data model including **all** assignment-table columns that S-03, S-07, S-08 and S-10 need, how rows are marked as sample data, and migration numbers per slice; API contract; UI wireframes (review the UI) | 3–4 | drafting can start as a document; merge after E-01 |
| E-04 | Sample-data script `npm run seed:sample` in `server/src/data-access/seed/` (DL-28, DL-47), labelled in the UI | 2–3 | blocked: E-01, E-03 not built |
| E-05 | Read-only assignment list and detail screens | 2–3 | blocked: E-04 not built |

The feasibility checks F1, F2 and F-AI are removed (DL-20).

| Required non-slice work | Notes | Est. h |
|---|---|---|
| plan.md versions | v01 and v02 exist. New copies after: the first loop, end of 28 Nov, feature freeze, final. | 3 |
| README.md | Prerequisites (Docker Desktop, Node), environment file, start, test, `npm run check:boundaries`, `npm run seed:sample` | 2.5 |
| Document updates | Record any change to DL-44 to DL-53 after the team reviews them, as new decision-log entries | 1–2 |
| Sign-offs | ASR file §11, four lines (DL-25); record the skill-check result (DL-42) | 0.5 |
| Evidence upkeep | `evidence/` files, filled continuously and never reconstructed at the end | 2 (plus per slice) |
| Group Contribution Log (D4) | `evidence/Group-Contribution-Log.md` | 1.5 |
| Final validation (Gate 5) | End-to-end flows; NFR-01 timing; NFR-04 stopwatch | 6–8 |
| Final report and CCP analysis | Must state that FR-01 and FR-04's AI estimation are not delivered (DL-20). Measured results come only from real tests. | 8–10 |
| Demo preparation and packaging | Script covering the D4 "Final Demo" list; rehearsal | 5 |

## 9. Schedule and checkpoints (recommendation)

These are work streams A–D, not people, and no owners are assigned. Up to four agent sessions are assumed (A-05). Within one slice the steps happen in order: agent → peer review and checks → Accept, Revise or Reject → merge. Different slices overlap only on separate branches, and merges happen one at a time (DL-22).

| Day | A | B | C | D | Integration |
|---|---|---|---|---|---|
| **Fri 27** | Skill check (SC, whole team) → E-01 → S-01 | E-00 → E-03 drafting → E-04 → E-05 | E-00; README draft; evidence setup | E-00; E-02 after E-01 → S-02 after E-04 | E-01, E-02, E-03 to E-05, S-01, S-02 merged one at a time; new plan version |
| **Sat 28** | S-03 → S-07 in the evening, if S-03 is accepted by afternoon | S-14 | S-15 | S-16 → S-08 | Merge each slice as it is accepted; Gate 4 regression; new plan version |
| **Sun 29** | S-07 (if not done Saturday) → S-04 | S-09, **only after S-07 and S-08 are merged** | S-10 | S-19 (reserve) | **Feature freeze in the evening**; full regression; new plan version |
| **Mon 30** | Gate 5 end-to-end | NFR-01 and NFR-04 measurements; README | Report and CCP; contribution log; sign-offs | Packaging; demo rehearsal | No new features |

**Accepted-slice checkpoints (cumulative)**

| Checkpoint | Target | If behind |
|---|---|---|
| End of Fri 27 | E-01 to E-05 merged; **2** accepted (S-01, S-02) | If E-01 isn't merged by about 16:00, all four teammates help finish and review it, with no feature branches until it's merged. Saturday then starts with S-01 and S-02. |
| End of Sat 28 | **7** (+S-03, S-08, S-14, S-15, S-16); 8 if S-07 is also accepted | If fewer than 7, or S-03 isn't accepted: on Sunday one track works only on S-03 and another starts S-19. Tell the team openly that 11 is now at risk. |
| Sun 29 freeze | **11** (+S-07, S-09, S-10, S-04) | Don't add features on 30 Nov and don't count partly finished slices. Record the real count in the evidence log and the report. |

## 10. Cut line and reserve (recommendation within the approved scope)

- 11 is the team's minimum, so **no cut keeps 11**. The reserve S-19 can replace any one committed slice that slips; once it's used, there is no margin left.
- Deferred slices are **not** reserves (DL-19). Building one needs a new team decision.
- Most at risk: S-04 and S-09, because they come last in the dependency chain and both depend on S-03 and S-07. S-03 is the single most critical slice: if it slips, S-04, S-07, S-09 and S-10 slip with it.
- Do not drop the Nov 30 verification, report or evidence work to make up time; it is mandatory.

## 11. Parallel work (recommendation, per DL-22, DL-29, DL-30, DL-44 to DL-47)

**Before any feature work:**
1. E-00 is done on every laptop.
2. The skill check is done (DL-42).
3. E-01 is merged with `npm run check:boundaries` passing.
4. E-03 has fixed all assignment-table columns and given each slice its own migration number.
5. Every agent prompt includes agent.md, the slice card from this plan and the E-03 contract, plus three rules: no new packages, change only your own migration, never edit `server/.dependency-cruiser.cjs`.

**Keeping agents apart:**
- one branch per slice, named for example `slice/S-01-availability` (naming is advice only);
- one worktree or clone per agent session;
- each with its own local test database name.

**Safe parallel sets:**
- Friday: S-01 alongside E-04 and E-05, after E-01 is merged.
- Saturday: S-03, S-14, S-15 and S-16.
- Sunday: S-04, S-09 (once S-07 and S-08 are merged), S-10 and S-19. S-07 and S-04 both change the start-by calculation, so keep them one after the other.

**Shared places where agents could clash:**
- `server/src/data-access/migrations/`;
- the assignment-table columns;
- Planning Core's `index.ts`, the Data Access Layer's `sessions` group, and the API route registration (add only, never rewrite);
- the PWA navigation, and the assignment list and detail screens (agree one slot each for S-14, S-15 and S-16);
- `package.json` and the lockfile;
- the sample dataset;
- the client and server data types (the E-03 contract is the reference);
- `server/.dependency-cruiser.cjs`.

**Merging, one branch at a time:**
1. Bring the latest main branch into the slice branch.
2. Run all tests and `npm run check:boundaries`, and paste the output into the Gate 3 evidence. Also check by eye that the API Layer imports only `sessions` from the Data Access Layer (DL-44).
3. A peer reviewer who is not the author runs the checks and records Accept, Revise or Reject in the Workflow Evidence Log.
4. Merge, then everyone pulls the new main.

**Sequential fallback:** if four separate branches can't be used, run at most two agents in sequence on one machine and keep the checkpoints in §9.

## 12. Status summary

- **Ready:** E-00 and the skill check (SC). E-03 can be drafted as a document.
- **Blocked:** E-01, until the skill check is done. All 11 committed slices and the reserve, until the enabling work they depend on (E-01 to E-05) and their earlier slices exist.
- No decision blocks any slice any more.
- Nothing is in progress, done, tested or accepted. No owners are assigned, and no skill-check result is recorded.
