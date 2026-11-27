# Final Validated Product Requirements Document (PRD)

**Project:** Google Classroom-Linked AI Academic Deadline Planner  
**Course:** Intro to Software Engineering — Deliverable 2  
**Section:** SE-A, FAST-NUCES Islamabad  
**Team:** Ali Hassan (25I-3191), Ahmad Hussain (25I-3044), Muhammad Rehan (25I-2535), Muhammad Subhan (25I-2161)  
**Version:** Post-critique consolidated specification (V-01–V-11) with TA client requirements TA-01 to TA-03 (FR-15 to FR-17)

> **Evidence boundary:** Requirements and base flows below come from the group’s RE Process Evidence Report. Changes explicitly associated with V-01–V-11 come from the group’s detailed Word Human Validation Report. Technical feasibility and unresolved behavior remain in Open Questions. No unspecified algorithm or API capability is claimed as verified. FR-15 to FR-17 come from the three additional requirements the TAs, acting as clients, gave at the Deliverable 2 demo (TA-01 to TA-03); their wording is reproduced verbatim. The edge-case handling and criteria for them are the team's decisions, drafted from those requirements.

## 1. Problem, selected solution and product intent

**Client problem.** The client M.Fariz, an MS student with overlapping deadlines, doesn't know how early to start assignments, especially when effort is misjudged. Forgotten work, overlapping deadlines and neglect of medium-difficulty courses were also discussed.


**Selected solution.** A Google Classroom-linked deadline planner website based on the client-selected Prototype 2 in Deliverable 1.

**User need.** The user judges urgency by due date alone and doesn't know how many hours each assignment needs at his skill level. Alerts say when work is due, not when to start. When deadlines stack up, courses are overlooked and starts come too late.

**Product intent.** A Classroom-linked planner that turns assignment deadlines into effort-based start-by dates, shows insufficient Study availability, warns of course neglect, and reminds the student on phone and laptop. Estimates are personalized by the student’s per-course confidence rating. The student stays in control: correcting estimates, entering missing deadlines, adjusting suggested hours, and deciding what happens to imported data.

### User goals
| ID | User-level goal |
| --- | --- |
| UG-1 | Know when to start each assignment, based on the effort it needs at his skill level in that course. |
| UG-2 | Know when Study availability can't cover his workload, including when deadlines stack up. |
| UG-3 | Notice when a course is getting too little attention, before its work becomes urgent. |
| UG-4 | Be prompted on phone and laptop and see the plan where he already looks, without remembering to check. |


### Product goals
| ID | Goal | Supports |
| --- | --- | --- |
| G-1 | Connect to Classroom, import his section’s assignments and deadlines, keep them current, and let him decide what to keep if access is revoked. | UG-1 |
| G-2 | Estimate each assignment's effort from assignment information and his course skill rating, flag unreliable estimates, and allow correction. | UG-1 |
| G-3 | Calculate start-by dates from estimated effort, study availability and deadline; recalculate when any change. | UG-1 |
| G-4 | Show when Study availability is insufficient or a start-by date has passed, suggest adjustments, and propose an adjustable hour allocation. | UG-2 |
| G-5 | Warn about possible course neglect early, with wording that matches how certain the evidence is. | UG-3 |
| G-6 | Track each assignment’s start, finished and submitted status so reminders stay relevant. | UG-4 |
| G-7 | Send Notifications to phone and laptop until acknowledged, and daily Reminders while work is unstarted and not Finished or Submitted. | UG-4 |
| G-8 | Show the study plan in Google Calendar and keep the plan usable when calendar sync fails. | UG-4 |


### Non-goals and approval state
| ID | Non-goal | Recorded state |
| --- | --- | --- |
| N-01 | Does not decide which assignments matter more. The student keeps control of priorities. | Confirmed |
| N-02 | Does not learn from past assignments to adjust estimates automatically. | Confirmed |
| N-03 | Never claims unwarranted certainty: missing progress isn't no work, missing Study availability isn't 0 hours, and no start-by date is shown when time is insufficient. | Confirmed |
| N-04 | Does not guarantee estimate accuracy. Estimates are guides the student can correct. | Confirmed |
| N-05 | Does not replace Classroom or submit assignments on the student's behalf. | Proposed |
| N-06 | Not a general task manager: covers Classroom assignments plus manual deadlines for undated ones. | Proposed |
| N-07 | Has no teacher, instructor or multi-student features. It serves one student's own plan. | Proposed |
| N-08 | No graphical weekly load view in this version (deferred, RG-49); FR-06 shows hours shortages instead. It was part of the Deliverable 1 selected solution. | Proposed |


> N-05 to N-08 are marked Proposed in the source record. N-08 reflects RG-49’s scope deferral, but the wording/approval state should be checked in the shared Project before calling it fully approved. A proposed non-goal must not silently become a constraint.

## 2. Agreed domain language

### Glossary
| Term | Meaning | Recorded state |
| --- | --- | --- |
| Student | The person who uses the planner and whose Classroom assignments it plans (Deliverable 1; RG-11). | Approved |
| Assignment | Coursework (lab, report, review) from Classroom, or an undated one given a manual deadline (RG-10). | Approved |
| Study availability | Hours the Student can study on an individual day (RG-01, RG-02). A day with no value is unknown, not 0 hours (RG-42). | Approved |
| Course skill rating | The Student’s self-assessed confidence in completing a course’s assignments, 1 to 5, labelled Very Low to Very High Confidence (RG-35 to RG-38). | Approved |
| Effort estimate | Hours the system estimates an assignment needs for this Student, or his manual correction (RG-04, RG-14). | Approved |
| Start-by date | The date by which the Student should start an assignment, calculated from Effort estimate, Study availability and deadline (Deliverable 1; RG-01). | Approved |
| Study plan | The start-by dates and suggested hour allocations kept for unfinished assignments (RG-03, RG-41). | Approved |
| Calendar block | A Google Calendar entry showing part of the study plan for an assignment (Deliverable 1; RG-17). | Approved |
| Notification | A message sent to the Student’s phone and laptop, acknowledged with “Got it” (RG-19; BR-19). | Approved |
| Reminder | A Notification prompting action on an assignment: a start Reminder, repeated daily while unstarted, or a submission Reminder for a Finished but not Submitted assignment (RG-22, RG-23; submission timing open in OQ-20). | Approved |
| Acknowledgment | The Student’s “Got it” to a Notification: seen, not started (RG-07). | Approved |
| Started | The Student confirmed work began via “Already Started”. “Confirmed not started”: he chose “Not Started”. Neither: unconfirmed (RG-07, RG-24, RG-47). | Approved |
| Finished | The Student’s own statement that his work is done; not Submitted (RG-12, RG-13). | Approved |
| Submitted | Classroom reports the assignment turned in; not set by the Student (RG-12, RG-13). | Proposed |
| Subtask | An individual item of work inside an existing assignment that the Student creates, edits, deletes and marks completed (TA-01). It is not an assignment and has no deadline or Effort estimate of its own. | Approved |
| Study timer | A timer the Student starts, pauses, resumes and stops for a selected assignment (TA-02). | Approved |
| Study session | One completed run of the Study timer for an assignment, saved with its duration (TA-02). | Approved |
| Recorded study time | The total of the saved Study session durations for an assignment. It is not the Effort estimate or the reported remaining effort (TA-02, BR-21). | Approved |


### Terminology decisions
| Variants | Ambiguity | Working resolution |
| --- | --- | --- |
| start-by, Start by Runway, start date, runway | Several names for one concept | Start-by date |
| alert, notification, reminder | Used interchangeably | Notification (any message sent to a device); Reminder (a Notification prompting action: a start Reminder repeats daily while the assignment is unstarted and neither Finished nor Submitted; a submission Reminder is for Finished but not Submitted, timing open in OQ-20). Retire "alert". |
| start-by block, study block, calendar block | Several names for one calendar entry | Calendar block |
| weight, hours, effort | Unclear whether AI outputs a weight or hours | Effort estimate (in hours). Retire "weight". |
| capacity, availability | Prototype shows a 4-hour capacity that no decision defines | Study availability (RG-01). Retire "capacity". |
| due date, deadline | Same thing | Deadline |
| task, work, assignment | Lab, report and review named differently | Assignment |
| overloaded week, insufficient study time | Overload threshold never defined | Insufficient Study availability (RG-03, RG-29). Retire "overloaded" and "insufficient study time". |
| core subject, medium-difficulty course | Undefined. Neglect detection (RG-25) uses deadlines and progress, not course type. | Retired; kept only as the client's own words in the problem description. |
| complete, done | Conflicts with RG-13 | Finished and Submitted only |
| skill, strength, skill level, rating | Mixed usage | Course skill rating. “Skill level” kept only as client wording in User Needs and UG-1. |
| GCR, Google Classroom | Two names | Classroom |
| client, user, student | Mixed roles | Student (person using the planner) |
| deadline visualizer, deadline planner, planner, Planner, system, website | Several names for the product | “The system” in requirements (FR, NFR, BR); “the planner” in intent and decision-log prose. Retire “deadline visualizer” and “website”. |
| notice, warning, Notification | Messages named inconsistently, with no rule for which reach a device | Notification: the only message sent to a device (BR-19). Notice and warning: shown inside the system only (course-balance notice, urgent start-by warning, shortage warning, outdated-data warning); sending them to devices is open in OQ-34. |
| subtask, sub-task, task, to-do | “Task” is retired for assignments, but the TA requirement uses “subtask” for an item inside an assignment | Subtask (an item inside an assignment, never a separate assignment). Study timer, Study session and Recorded study time are the terms for TA-02. |
| start-by plan, study plan, internal plan, internal study plan, plan | Several names for one thing | Study plan. Calendar blocks copy the study plan. Retire “start-by plan” and “internal plan”. |


## 3. Functional requirements (14 core capabilities and 3 TA client requirements)

FR-01 to FR-14 are the team’s recorded candidate-to-final selection from Task 5. FR-15 to FR-17 were added after the Deliverable 2 demo from the TA client requirements TA-01 to TA-03; they were not part of the Task 5 AI-candidate comparison. They are capabilities, not individual UI buttons. The **Post-validation clarification** under each affected requirement records the explicitly described changes V-01–V-11.

| ID | Final base wording (RE process evidence) | AI proposal disposition | Decision basis |
| --- | --- | --- | --- |
| FR-01 | The system shall connect to the Student’s Classroom, retrieve the section’s assignments and deadlines, update deadlines when Classroom changes them, recalculate affected start-by dates, and notify the Student of the change. | Modify | Omitted deadline-change update and notification (RG-05). |
| FR-02 | The system shall display Classroom assignments without deadlines and allow the Student to enter a manual deadline for them. Where an official deadline later appears, the system shall preserve any earlier user-set date as a labelled personal pacing target while retaining the official due date as the hard deadline. | Accept | Matches RG-10; manual vs official dates covered by BR-02. |
| FR-03 | The system shall allow the Student to enter and edit individual-day Study availability and recalculate affected start-by dates when availability changes. It shall also support an explicitly Student-confirmed recurring future availability baseline for dates beyond the initial seven-day onboarding horizon. | Accept | Matches RG-01 and RG-02. |
| FR-04 | The system shall estimate assignment effort using available assignment information and the Student’s Course skill rating, flag unreliable estimates, and allow manual correction of estimated hours, after which affected start-by dates are recalculated. It shall preserve manual corrections and request their review when a course rating changes by more than two points. | Modify | Omitted recalculating start-by dates after manual correction (RG-04). |
| FR-05 | The system shall calculate and display a start-by date using assignment effort, Study availability, and the applicable deadline, and recalculate affected dates when relevant inputs change. | Accept | Core capability; matches RG-01 to RG-05, RG-29, RG-39, RG-40. |
| FR-06 | The system shall identify insufficient Study availability, explain the hours shortage, suggest study-plan adjustments, and allow the Student to adjust a suggested allocation without having assignment priorities imposed. The system shall keep all suggestions non-binding and editable, taking reported workload and course difficulty into account without imposing assignment priorities. | Accept | Matches RG-03, RG-29, RG-41, N-01 (student controls priorities). |
| FR-07 | The system shall allow the Student to report assignment progress and remaining effort and use those reports to recalculate the remaining workload and affected start-by dates. | Accept | Matches RG-15, RG-16; progress and remaining effort kept separate. |
| FR-08 | The system shall identify possible course neglect using assignment deadlines and available progress evidence, communicate uncertainty when progress is incomplete, distinguish possible imbalance from confirmed unstarted work past its start-by date, and show early balance notices separately from urgent start-by warnings. When a start-by date is over three consecutive days past with no activity logged, it shall show a non-punitive possible-unlogged-activity notice without treating unknown progress as confirmed inactivity. | Modify | Omitted early balance notices separate from urgent start-by warnings (RG-26). |
| FR-09 | The system shall track assignment start status separately from Notification acknowledgment and allow the Student to confirm that an assignment has already started or that it has not started. | Modify | Matches RG-07, RG-22 to RG-24: “Got it” isn’t started. Added “Not Started” confirmation, which RG-28 needs (RG-47). “Reminder acknowledgment” replaced by glossary term Notification acknowledgment. |
| FR-10 | The system shall track Finished and Submitted as separate statuses, detect submission status through Classroom where available, allow the Student to update the Finished status manually, and support submission reminders when required. | Modify | Matches RG-12, RG-13. “Manual completion” replaced by glossary term Finished. Reminder timing open in OQ-20; manual vs Classroom status open in OQ-21. |
| FR-11 | The system shall send Notifications to the Student’s phone and laptop, repeat unacknowledged Notifications daily, synchronize acknowledgment across devices, and treat “Got it” as a 48-hour pause for new start Reminders for that assignment. After that pause, new daily start Reminders may resume if it remains unstarted and neither Finished nor Submitted. | Modify | Matches RG-19 to RG-23; delivery time open in OQ-18. Original issued Reminders with no stop for Finished or Submitted work (RG-46). |
| FR-12 | The system shall synchronize Calendar blocks with the Study plan, preserve the plan during sync failure, and import manual changes to study-block times from Google Calendar when permitted, subject to the official assignment deadline. | Modify | Failure behavior (keep plan, warn, retry) is an RG-17 rule, moved to BR-13; FR-12 keeps only the capability. |
| FR-13 | The system shall, when Classroom access is revoked, stop synchronization and let the Student choose whether to keep or delete previously imported assignments. It shall preserve in-progress saved edits safely during revocation and reconcile Classroom assignment IDs with retained local assignments when access is restored. | Add | RG-11 (revoked access) was covered only by BR-14, with no FR. Team-authored, so Accept / Modify / Reject doesn't apply. |
| FR-14 | The system shall allow the Student to enter a Course skill rating for each course on a scale from 1 to 5 with descriptive labels, and to edit a rating after the first entry. Rating changes shall re-estimate only unfinished system-generated effort estimates and shall not overwrite manually corrected estimates or re-estimate Finished or Submitted assignments. | Add | BR-16, FR-04-E2 and NFR-04 depend on entering ratings, but no FR covered it. RG-35 to RG-38 define the rating; the client asked for it in Prototype 1 feedback. Team-authored, so Accept / Modify / Reject doesn't apply. |
| FR-15 | The system shall allow the Student to create, edit, delete, and mark as completed individual subtasks within an existing assignment. The system shall display the number of completed subtasks out of the total subtasks for each assignment, without automatically changing its Started, Finished, or Submitted status. | Add | TA client requirement TA-01 (Deliverable 2 demo). Team-authored, so Accept / Modify / Reject does not apply. BR-20. |
| FR-16 | The system shall allow the Student to start, pause, resume, and stop a study timer associated with a selected assignment. The system shall save the duration of each completed study session and display the total recorded study time for that assignment separately from its Effort estimate and reported remaining effort. | Add | TA client requirement TA-02 (Deliverable 2 demo). Team-authored, so Accept / Modify / Reject does not apply. BR-21. |
| FR-17 | The system shall allow the Student to search assignments by title and filter them by course, submission status, and deadline range. The system shall display only matching assignments, allow the results to be sorted by deadline, and provide an option to clear all filters and restore the complete assignment list. | Add | TA client requirement TA-03 (Deliverable 2 demo). Team-authored, so Accept / Modify / Reject does not apply. |


### FR-01 — Full flow, exceptions and verification

> **D4 delivery status (27 November 2026, decision-log.md DL-19, DL-20):** Not delivered in D4. Deferred to slices S-11, S-12 and S-13; the D4 demo uses labelled sample data instead of Classroom. See Section 11.

**Post-validation requirement.** The system shall connect to the Student’s Classroom, retrieve the section’s assignments and deadlines, update deadlines when Classroom changes them, recalculate affected start-by dates, and notify the Student of the change.

**Main flow.**

- **Requirement:** The system shall connect to the Student's Classroom account, retrieve the Student's section assignments and available deadlines, update deadlines when Classroom changes them, recalculate affected start-by dates, and notify the Student of the change.

- **Trigger:** The Student connects Classroom, or an available Classroom assignment or deadline changes.

- **Actors:** Student; Classroom; system.

- **Preconditions:** Classroom access and available account information permit the operation.

- **Normal sequence:** 1. The Student connects their Classroom account.
2. The system retrieves the Student's section assignments and available deadlines.
3. The system makes the retrieved assignments and deadlines available to the Student.
4. When Classroom changes a deadline, the system updates the deadline.
5. The system recalculates affected start-by dates.
6. The system notifies the Student of the change.

- **Successful outcome:** Classroom assignments and deadlines are reflected in the system; affected start-by dates are recalculated after changes and the Student is notified.

**Edge cases and documented handling.**
| ID | Abnormal / conflicting situation | Current response | Basis |
| --- | --- | --- | --- |
| ID | Abnormal or conflicting situation | Team decision | Basis |
| FR-01-E1 | Classroom access is denied or revoked during synchronization. | Stop sync; keep imported assignments until the Student chooses keep or delete. | FR-13, BR-14. OQ-27 open. |
| FR-01-E2 | Classroom changes a deadline while an earlier change is processing. | Use the latest deadline; notify once per assignment. | Team decision. OQ-25 open. |
| FR-01-E3 | An assignment is retrieved, but its deadline is missing. | Show the assignment as undated and let the Student enter a manual deadline. | FR-02, RG-10. |
| FR-01-E4 | Classroom unavailable or sync fails after earlier retrieval. | Keep saved assignments, warn data may be outdated, allow retry. | BR-12, NFR-02. OQ-29 open. |
| FR-01-E5 | A deadline changes while the Student edits availability or the plan. | Apply the Classroom change, keep the Student's edit, recalculate once with latest saved inputs. | Team decision (FR-03, FR-05). |


**Acceptance criteria.**
| ID | Given / When / Then criterion | Verifies |
| --- | --- | --- |
| ID | Acceptance criterion | Verifies (FR / BR / NFR / edge case ID) |
| FR-01-AC1 | Given a connected Classroom account with accessible assignments and deadlines, When the system retrieves them, Then they appear in the assignment list. | FR-01 |
| FR-01-AC2 | Given a Classroom assignment deadline, When Classroom changes it, Then the system applies the latest deadline, recalculates affected dates once from latest saved inputs, and notifies the Student once for that assignment. | FR-01, FR-01-E2, FR-01-E5 |
| FR-01-AC3 | Given Classroom changes a deadline several times before processing, When the system processes them, Then it uses the latest deadline and notifies the Student once. | FR-01, FR-01-E2 |
| FR-01-AC4 | Given sync fails after assignments were saved, When the Student views the list, Then saved assignments remain, a warning says information may be outdated, and retry is available. | BR-12, NFR-02, FR-01-E4 |
| FR-01-AC5 | Given access is revoked during sync, When detected, Then sync stops and imported assignments remain until the Student chooses keep or delete. | FR-13, BR-14, FR-01-E1 |


### FR-02 — Full flow, exceptions and verification

> **D4 delivery status (27 November 2026, DL-19):** Partly delivered. Manual deadlines for undated assignments are planned in slice S-10 (AC1, AC2, AC5). AC3, AC4 and AC6 need an official Classroom deadline to arrive later and are deferred (S-12). See Section 11.

**Post-validation requirement.** The system shall display Classroom assignments without deadlines and allow the Student to enter a manual deadline for them. Where an official deadline later appears, the system shall preserve any earlier user-set date as a labelled personal pacing target while retaining the official due date as the hard deadline.

**Post-validation clarification.** Where an official Classroom deadline later appears, preserve any earlier student-set date as a labelled personal target (if earlier); treat the official deadline as the hard submission boundary. Update the plan and notify the Student.

**Main flow.**

- **Requirement:** The system shall display Classroom assignments without deadlines and allow the Student to enter a manual deadline for them.

- **Trigger:** A Classroom assignment has no deadline, or the Student opens it to add one.

- **Actors:** Student; system; Classroom.

- **Preconditions:** An undated assignment has been retrieved and is available.

- **Normal sequence:** 1. The system displays the assignment without an official deadline.
2. The Student enters a manual deadline.
3. The system records the manual deadline as distinguishable from an official Classroom deadline.
4. The system uses the available deadline information for scheduling.

- **Successful outcome:** The Student can give an undated assignment a deadline, and its source stays distinguishable.

**Edge cases and documented handling.**
| ID | Abnormal / conflicting situation | Current response | Basis |
| --- | --- | --- | --- |
| ID | Abnormal or conflicting situation | Team decision | Basis |
| FR-02-E1 | Classroom supplies an official deadline after a manual one was entered. | Use the official Classroom deadline as the hard submission boundary, preserve any earlier manual date as an explicitly labelled personal pacing target, recalculate the plan and notify the Student. | BR-01, BR-02. Manual date display open (OQ-28). |
| FR-02-E2 | The manual deadline is incomplete or invalid. | Reject with a message; assignment stays visible and undated. | RG-10. |
| FR-02-E3 | The Student changes a previously entered manual deadline. | Keep only the current manual deadline and recalculate; no edit history. | Team decision; FR-05. |
| FR-02-E4 | Manual deadline entered while Classroom is unavailable. | Keep the manual date as a provisional due date while offline. After sync, the official Classroom due date controls submission; any earlier manual date remains only an internal pacing target. | BR-01, BR-12. OQ-29 open. |


**Acceptance criteria.**
| ID | Given / When / Then criterion | Verifies |
| --- | --- | --- |
| ID | Acceptance criterion | Verifies (FR / BR / NFR / edge case ID) |
| FR-02-AC1 | Given an assignment has no deadline, When the Student opens it, Then it appears undated and accepts a manual deadline. | FR-02, FR-01-E3 |
| FR-02-AC2 | Given an incomplete or invalid manual deadline, When validated, Then it is rejected with a message and the assignment stays visible and undated. | FR-02, FR-02-E2 |
| FR-02-AC3 | Given a Student has entered a manual date and Classroom later publishes an official deadline, When syncing, Then the official date remains the submission boundary, any earlier student-entered date is labelled a personal pacing target, and affected recommendations are updated and the Student informed. | BR-01, BR-02, FR-02-E1, FR-05-E4 |
| FR-02-AC4 | Given a valid manual date entered during sync failure, When sync resumes, Then the official Classroom due date remains the hard deadline and an earlier manual date is retained only as an internal pacing target. | BR-01, BR-12, FR-02-E4 |
| FR-02-AC5 | Given a manual deadline, When the Student changes it, Then only the current one is kept, start-by dates are recalculated, and no history is kept. | FR-02, FR-02-E3 |


**Additional validation-derived acceptance criteria (post-critique).**
| ID | Verification scenario | Validation basis |
| --- | --- | --- |
| FR-02-AC6 | Given a Student personal target earlier than the official deadline, when Classroom publishes the official deadline, then the earlier personal target remains labelled as a target and the official submission deadline remains unchanged. | V-06, BR-01 |


### FR-03 — Full flow, exceptions and verification

**Post-validation requirement.** The system shall allow the Student to enter and edit individual-day Study availability and recalculate affected start-by dates when availability changes. It shall also support an explicitly Student-confirmed recurring future availability baseline for dates beyond the initial seven-day onboarding horizon.

**Post-validation clarification.** For dates beyond seven explicitly entered onboarding days, use a student-confirmed recurring availability baseline when available. A missing baseline remains unknown; do not invent available hours.

**Main flow.**

- **Requirement:** The system shall allow the Student to enter and edit individual-day Study availability and recalculate affected start-by dates when availability changes.

- **Trigger:** The Student enters or edits availability for a day.

- **Actors:** Student; system.

- **Preconditions:** The Student can access the Study availability settings.

- **Normal sequence:** 1. The Student enters Study availability for an individual day.
2. The system records the availability.
3. The Student edits availability when needed.
4. The system updates the recorded availability.
5. The system recalculates affected start-by dates.

- **Successful outcome:** Individual-day availability is recorded and editable; affected start-by dates are recalculated on change.

**Edge cases and documented handling.**
| ID | Abnormal / conflicting situation | Current response | Basis |
| --- | --- | --- | --- |
| ID | Abnormal or conflicting situation | Team decision | Basis |
| FR-03-E1 | No availability entered for a day the plan needs. | For the initial seven-day explicit-entry horizon, absent availability remains unknown. Beyond that horizon, use a Student-confirmed recurring baseline if one exists and identify its use; otherwise keep the day unknown and request an input. Never equate unknown with 0 hours. | BR-17, RG-42, N-03. OQ-01 open. |
| FR-03-E2 | Availability reduced so effort can't fit before a deadline. | Show no start-by date, show the hours shortage, suggest adjustments. | BR-04, FR-06. OQ-04 open. |
| FR-03-E3 | Availability edited while a deadline or estimate changes. | Recalculate once using the latest saved inputs. | Team decision (FR-01, FR-04). OQ-02 open. |
| FR-03-E4 | Availability overlaps or conflicts with another day's representation. | One value per day; newer entry replaces earlier. Weekly pattern vs dated entries open. | OQ-01. |
| FR-03-E5 | Availability changes while progress data is outdated or missing. | Treat progress as unknown; recalculate from available information. | BR-03. OQ-05 open. |


**Acceptance criteria.**
| ID | Given / When / Then criterion | Verifies |
| --- | --- | --- |
| ID | Acceptance criterion | Verifies (FR / BR / NFR / edge case ID) |
| FR-03-AC1 | Given a missing availability entry within the first seven-day horizon, When planning, Then treat it as unknown, not zero. For later dates use a Student-confirmed recurring baseline if present and flag the assumed horizon; otherwise keep availability unknown and do not report a fabricated shortage. | FR-03, BR-17, FR-03-E1 |
| FR-03-AC2 | Given a change in availability makes an assignment infeasible, When recalculating, Then no start-by date is shown, the hours shortage is displayed, and adjustments are suggested. | FR-03, BR-04, FR-06, FR-03-E2 |
| FR-03-AC3 | Given a stored availability value for a day, When the Student saves a newer one, Then it replaces the earlier. | FR-03, FR-03-E4 |
| FR-03-AC4 | Given availability changes while an Effort estimate or deadline also changes, When processed, Then the plan is recalculated once from the latest saved inputs. | FR-03, FR-03-E3 |
| FR-03-AC5 | Given progress is missing or outdated when availability changes, When recalculating, Then progress is treated as unknown, not as no work. | BR-03, FR-03-E5, FR-05-E5 |


**Additional validation-derived acceptance criteria (post-critique).**
| ID | Verification scenario | Validation basis |
| --- | --- | --- |
| FR-03-AC6 | Given an assignment beyond the seven-day onboarding horizon and a Student-confirmed recurring baseline, when scheduling, then future unentered days use that baseline and the recommendation identifies its basis. With no baseline, availability stays unknown. | V-01, BR-17 |


### FR-04 — Full flow, exceptions and verification

> **D4 delivery status (27 November 2026, DL-19, DL-35):** Partly delivered. Only manual effort entry is planned (the DL-05 default). AI estimation, the unreliable-estimate flag and re-estimation (S-05, S-06) are deferred and not built. See Section 11.

**Post-validation requirement.** The system shall estimate assignment effort using available assignment information and the Student’s Course skill rating, flag unreliable estimates, and allow manual correction of estimated hours, after which affected start-by dates are recalculated. It shall preserve manual corrections and request their review when a course rating changes by more than two points.

**Post-validation clarification.** For a skill rating change of more than two points, retain manual effort overrides and invite the Student to review them; do not overwrite corrections.

**Main flow.**

- **Requirement:** The system shall estimate assignment effort using available assignment information and the Student's Course skill rating, flag unreliable estimates, and allow manual correction of estimated hours, after which affected start-by dates are recalculated.

- **Trigger:** An assignment becomes available for estimation, its information changes, or the Student changes an estimate or rating requiring re-estimation.

- **Actors:** Student; system; Classroom.

- **Preconditions:** Assignment information and relevant rating are available as needed for estimation.

- **Normal sequence:** 1. The system uses available assignment information and the Student's Course skill rating to estimate effort.
2. The system flags an estimate when it is unreliable.
3. The Student may manually correct the estimated hours.
4. The system records the corrected estimate.
5. The system recalculates affected start-by dates.

- **Successful outcome:** The Student sees an effort estimate, spots unreliable ones, corrects hours, and gets start-by dates recalculated.

**Edge cases and documented handling.**
| ID | Abnormal / conflicting situation | Current response | Basis |
| --- | --- | --- | --- |
| ID | Abnormal or conflicting situation | Team decision | Basis |
| FR-04-E1 | Important assignment information is missing. | Flag the estimate as unreliable and allow manual correction. | BR-15. OQ-13 open. |
| FR-04-E2 | The Student has not provided a Course skill rating. | Prompt for a rating; flag the estimate unreliable until provided. | RG-14, FR-14. OQ-14 open. |
| FR-04-E3 | The Student corrects hours manually, then changes the rating. | Keep the manual correction; re-estimate only unfinished system-generated estimates. | BR-06, BR-07. OQ-17 open. |
| FR-04-E4 | An assignment's information changes after an estimate exists. | Re-estimate unfinished system-generated estimates; keep manual corrections. | RG-44, BR-06, BR-07, BR-15. OQ-13, OQ-15 open. |
| FR-04-E5 | Estimate flagged unreliable but the Student doesn't correct it. | Plan with the estimate, shown as flagged. | RG-14. OQ-15 open. |


**Acceptance criteria.**
| ID | Given / When / Then criterion | Verifies |
| --- | --- | --- |
| ID | Acceptance criterion | Verifies (FR / BR / NFR / edge case ID) |
| FR-04-AC1 | Given important assignment information is missing, When estimating, Then the estimate is flagged unreliable and the Student can correct hours manually. | FR-04, BR-15, FR-04-E1 |
| FR-04-AC2 | Given no Course skill rating, When estimating, Then the Student is prompted and the estimate is flagged unreliable until rated. | FR-04, FR-04-E2 |
| FR-04-AC3 | Given manually corrected hours, When the rating changes, Then the correction stays and only unfinished system-generated estimates are re-estimated. | FR-04, BR-06, BR-07, FR-04-E3 |
| FR-04-AC4 | Given an uncorrected unreliable estimate, When preparing the plan, Then planning proceeds with the estimate, flagged. | FR-04, FR-04-E5 |
| FR-04-AC5 | Given assignment information changes after estimation, When re-estimating, Then unfinished system-generated estimates are re-estimated and manual corrections stay. | FR-04, BR-06, BR-07, FR-04-E4 |


**Additional validation-derived acceptance criteria (post-critique).**
| ID | Verification scenario | Validation basis |
| --- | --- | --- |
| FR-04-AC6 | Given a manual effort correction and a Course skill rating change exceeding two points, when recalculating, then the corrected effort is preserved and the Student is prompted to review it. | V-05, BR-06 |


### FR-05 — Full flow, exceptions and verification

**Post-validation requirement.** The system shall calculate and display a start-by date using assignment effort, Study availability, and the applicable deadline, and recalculate affected dates when relevant inputs change.

**Main flow.**

- **Requirement:** The system shall calculate and display a start-by date using assignment effort, Study availability, and the applicable deadline, and recalculate affected dates when relevant inputs change.

- **Trigger:** An assignment becomes available for planning, or its effort, availability or deadline changes.

- **Actors:** Student; system; Classroom, where an official deadline exists.

- **Preconditions:** Effort, availability and deadline are available as needed for calculation.

- **Normal sequence:** 1. The system obtains the available assignment effort, Study availability, and applicable deadline.
2. The system calculates a start-by date using those inputs.
3. The system displays the calculated start-by date to the Student.
4. When a relevant input changes, the system recalculates affected dates.
5. The system displays the recalculated dates.

- **Successful outcome:** The Student sees start-by dates calculated from relevant inputs and recalculated when they change.

**Edge cases and documented handling.**
| ID | Abnormal / conflicting situation | Current response | Basis |
| --- | --- | --- | --- |
| ID | Abnormal or conflicting situation | Team decision | Basis |
| FR-05-E1 | Availability can't cover required effort before the deadline. | Show no start-by date, show the hours shortage, suggest adjustments. Only when every day before the deadline has availability; otherwise see FR-03-E1. | BR-04, BR-17, RG-29. OQ-04 open. |
| FR-05-E2 | Several assignments compete for the same hours. | Suggest an adjustable allocation; impose no priorities. | BR-05, RG-41. OQ-03 open. |
| FR-05-E3 | Effort, availability and deadline change at nearly the same time. | Recalculate once using the latest saved inputs. | OQ-02, OQ-25 open. |
| FR-05-E4 | An official deadline appears after a manual one. | Official deadline governs; notify the Student. | BR-01, BR-02. OQ-28 open. |
| FR-05-E5 | Progress missing or outdated during recalculation. | Treat progress as unknown; calculate from available information. | BR-03. OQ-05, OQ-07 open. |


**Acceptance criteria.**
| ID | Given / When / Then criterion | Verifies |
| --- | --- | --- |
| ID | Acceptance criterion | Verifies (FR / BR / NFR / edge case ID) |
| FR-05-AC1 | Given effort, availability and an applicable deadline, When the plan is calculated, Then a start-by date is displayed. | FR-05 |
| FR-05-AC2 | Given the Effort estimate, availability or deadline changes, When processed, Then affected start-by dates are recalculated once from latest saved inputs. | FR-05, FR-05-E3 |
| FR-05-AC3 | Given availability can't cover effort before the deadline and every day before it has entered availability, When calculating, Then no start-by date is shown, the hours shortage is displayed, and adjustments are suggested. | FR-05, BR-04, BR-17, FR-05-E1 |
| FR-05-AC4 | Given assignments compete for hours, When a suggested allocation is shown, Then the Student can adjust it and no priorities are imposed. | FR-05, BR-05, FR-05-E2 |


### FR-06 — Full flow, exceptions and verification

**Post-validation requirement.** The system shall identify insufficient Study availability, explain the hours shortage, suggest study-plan adjustments, and allow the Student to adjust a suggested allocation without having assignment priorities imposed. The system shall keep all suggestions non-binding and editable, taking reported workload and course difficulty into account without imposing assignment priorities.

**Post-validation clarification.** Allocation suggestions are advisory, editable and rejectable. They may account for course difficulty/estimated effort, but cannot enforce a subjective assignment priority.

**Main flow.**

- **Requirement:** The system shall identify insufficient Study availability, explain the hours shortage, suggest study-plan adjustments, and allow the Student to adjust a suggested allocation without having assignment priorities imposed.

- **Trigger:** The system finds availability insufficient for required effort before the deadline.

- **Actors:** Student; system.

- **Preconditions:** Effort, availability and deadlines are available as needed to identify a shortage.

- **Normal sequence:** 1. The system identifies insufficient Study availability.
2. The system explains the shortage in study hours.
3. The system suggests study-plan adjustments.
4. The Student reviews a suggested allocation.
5. The Student may adjust the suggested allocation.
6. The system reflects the Student's adjustment in the study plan without imposing assignment priorities.

- **Successful outcome:** The Student understands the shortage, reviews suggestions, and adjusts the allocation without imposed priorities.

**Edge cases and documented handling.**
| ID | Abnormal / conflicting situation | Current response | Basis |
| --- | --- | --- | --- |
| ID | Abnormal or conflicting situation | Team decision | Basis |
| FR-06-E1 | Shortage can't be determined because an input other than the estimate is missing: no deadline, or availability not entered for some days before it. | When an actual deadline or necessary availability data is unknown, including missing future baseline and no explicit entry, say shortage cannot yet be determined and identify the missing input; do not invent a zero-hour value. | RG-45, BR-17, FR-04-E5, N-03. OQ-02, OQ-04 open. |
| FR-06-E2 | No suggested allocation can resolve the shortage before the deadline. | Identify infeasible assignments and show the hours shortage; no start-by date for them. | BR-04, RG-29. OQ-04 open. |
| FR-06-E3 | The Student changes an allocation while the plan is recalculating. | Keep the edit; recalculate from the latest saved allocation; discard nothing silently. | BR-05. OQ-02, OQ-03 open. |
| FR-06-E4 | The Student rejects all suggestions, or an allocation still leaves a shortage. | Plan unchanged, shortage warning continues, no priorities imposed. | BR-04, BR-05. OQ-04 open. |
| FR-06-E5 | Inputs change while the Student reviews suggestions. | Refresh shortage explanation and suggestions from latest inputs. | FR-05, BR-04. |


**Acceptance criteria.**
| ID | Given / When / Then criterion | Verifies |
| --- | --- | --- |
| ID | Acceptance criterion | Verifies (FR / BR / NFR / edge case ID) |
| FR-06-AC1 | Given a missing deadline or required unknown daily availability without a Student-confirmed baseline, When evaluating capacity, Then state that shortage cannot be determined, identify missing inputs, and show no unsupported numerical shortage. | FR-06, BR-17, FR-06-E1 |
| FR-06-AC2 | Given assignments can't fit available hours before their deadlines, When evaluating, Then it identifies them, shows the hours shortage, and shows no start-by date for them. | FR-06, BR-04, FR-06-E2 |
| FR-06-AC3 | Given the Student adjusts an allocation during recalculation, When it completes, Then the edit is retained, the latest saved allocation is used, and nothing is discarded silently. | FR-06, BR-05, FR-06-E3 |
| FR-06-AC4 | Given the Student rejects suggestions or makes no resolving adjustment, When the plan updates, Then it stays unchanged, the shortage warning continues, and no priorities are imposed. | FR-06, BR-04, BR-05, FR-06-E4 |
| FR-06-AC5 | Given effort, availability or deadline changes while a shortage is displayed, When the latest saved inputs are processed, Then the explanation and suggestions refresh. | FR-06, FR-05, BR-04, FR-06-E5 |


**Additional validation-derived acceptance criteria (post-critique).**
| ID | Verification scenario | Validation basis |
| --- | --- | --- |
| FR-06-AC6 | Given an infeasible workload and a suggested allocation, when the Student rejects or changes the suggestion, then the system preserves the Student choice without enforcing its suggested priorities. | V-10, BR-05 |


### FR-07 — Full flow, exceptions and verification

**Post-validation requirement.** The system shall allow the Student to report assignment progress and remaining effort and use those reports to recalculate the remaining workload and affected start-by dates.

**Main flow.**

- **Requirement:** The system shall allow the Student to report assignment progress and remaining effort and use those reports to recalculate the remaining workload and affected start-by dates.

- **Trigger:** The Student reports or updates progress or remaining effort.

- **Actors:** Student; system.

- **Preconditions:** The Student can open the assignment and submit a report.

- **Normal sequence:** 1. The Student opens an assignment.
2. The Student reports assignment progress and remaining effort.
3. The system records the report.
4. The system uses the report to recalculate the remaining workload.
5. The system recalculates affected start-by dates.
6. The system displays the updated planning information.

- **Successful outcome:** The Student reports progress and remaining effort; remaining workload and start-by dates update.

**Edge cases and documented handling.**
| ID | Abnormal / conflicting situation | Current response | Basis |
| --- | --- | --- | --- |
| ID | Abnormal or conflicting situation | Team decision | Basis |
| FR-07-E1 | No progress report, or the report is outdated. | Treat progress as unknown, not no work; may optionally ask for an update. | BR-03, RG-09. OQ-05, OQ-06 open. |
| FR-07-E2 | Newly reported remaining effort conflicts with an earlier estimate or report. | The latest reported remaining hours replace the earlier ones. | RG-15, RG-16. OQ-07 open. |
| FR-07-E3 | Several updates arrive close together, or an earlier one arrives after a newer one. | Use the update with the most recent time; ignore earlier ones. | OQ-05, OQ-07 open. |
| FR-07-E4 | The Student reports Finished but Classroom shows not Submitted. | Keep both statuses separate: Finished stays, Submitted shows not submitted, submission reminders apply. | BR-08, RG-13. OQ-21 open. |
| FR-07-E5 | Reported remaining effort can't fit available hours before the deadline. | Show no start-by date, show the hours shortage, suggest adjustments. | BR-04. OQ-04, OQ-07 open. |


**Acceptance criteria.**
| ID | Given / When / Then criterion | Verifies |
| --- | --- | --- |
| ID | Acceptance criterion | Verifies (FR / BR / NFR / edge case ID) |
| FR-07-AC1 | Given an available assignment, When the Student submits a progress report and remaining effort, Then it is recorded and remaining workload and start-by dates are recalculated. | FR-07 |
| FR-07-AC2 | Given progress is missing or outdated, When recalculating workload, Then it is treated as unknown, not no work; the Student may optionally be asked for an update. | FR-07, BR-03, FR-07-E1 |
| FR-07-AC3 | Given a new remaining-effort value, When processed, Then the latest hours replace the earlier. | FR-07, FR-07-E2 |
| FR-07-AC4 | Given multiple progress updates with different times, When processed, Then the most recent is used and earlier ones are ignored. | FR-07, FR-07-E3 |
| FR-07-AC5 | Given the Student marks Finished while Classroom shows not submitted, When statuses are displayed, Then Finished stays recorded separately, Submitted shows not submitted, and submission reminders apply. | FR-07, BR-08, FR-07-E4 |
| FR-07-AC6 | Given reported remaining effort can't fit available hours, When recalculating, Then no start-by date is shown, the hours shortage is displayed, and adjustments are suggested. | FR-07, BR-04, FR-07-E5 |


### FR-08 — Full flow, exceptions and verification

**Post-validation requirement.** The system shall identify possible course neglect using assignment deadlines and available progress evidence, communicate uncertainty when progress is incomplete, distinguish possible imbalance from confirmed unstarted work past its start-by date, and show early balance notices separately from urgent start-by warnings. When a start-by date is over three consecutive days past with no activity logged, it shall show a non-punitive possible-unlogged-activity notice without treating unknown progress as confirmed inactivity.

**Post-validation clarification.** If no activity is logged for three consecutive days after a passed start-by date, issue a clearly labelled possible-unlogged-activity advisory, not a claim of confirmed inactivity.

**Main flow.**

- **Requirement:** The system shall identify possible course neglect using deadlines and available progress evidence, communicate uncertainty when progress is incomplete, distinguish possible imbalance from confirmed unstarted work past its start-by date, and show early balance notices separately from urgent start-by warnings.

- **Trigger:** Relevant deadlines or progress evidence become available or change.

- **Actors:** Student; system.

- **Preconditions:** Deadlines and available progress evidence can be considered.

- **Normal sequence:** 1. The system considers deadlines and available progress evidence.
2. The system identifies possible course neglect or imbalance where the evidence supports it.
3. The system communicates uncertainty when progress is incomplete.
4. The system distinguishes possible imbalance from confirmed unstarted work past its start-by date.
5. The system presents early balance notices separately from urgent start-by warnings.

- **Successful outcome:** The Student can tell early balance notices from urgent start-by warnings, and possible imbalance from confirmed unstarted work past its start-by date.

**Edge cases and documented handling.**
| ID | Abnormal / conflicting situation | Current response | Basis |
| --- | --- | --- | --- |
| ID | Abnormal or conflicting situation | Team decision | Basis |
| FR-08-E1 | Progress missing or outdated, but deadlines suggest course neglect. | Show a possible-imbalance notice with cautious wording that progress is unknown; never say no work was done. | BR-03, BR-10, RG-27. OQ-08, OQ-10 open. |
| FR-08-E2 | Assignment past its start-by date, but evidence doesn't confirm work hasn't started. | Display a cautious warning when progress is unknown; issue a non-punitive possible-unlogged-activity advisory if no work is logged for three consecutive days past the start-by date. Use a confirmed-unstarted warning only if the Student explicitly reports Not Started. | RG-28, RG-47, BR-10. OQ-11 open (narrowed). |
| FR-08-E3 | A balance notice and an urgent start-by warning apply together. | Show two separate, clearly labelled notices. | RG-26, RG-48, BR-10. |
| FR-08-E4 | Courses differ in effort and difficulty, so attention is hard to compare. | Not decided. | Open: OQ-09. |
| FR-08-E5 | New progress arrives during balance evaluation. | Use the latest saved progress and reassess. | BR-03. OQ-05, OQ-08 open. |


**Acceptance criteria.**
| ID | Given / When / Then criterion | Verifies |
| --- | --- | --- |
| ID | Acceptance criterion | Verifies (FR / BR / NFR / edge case ID) |
| FR-08-AC1 | Given deadlines suggest neglect but progress is missing, When evaluating balance, Then a possible-imbalance notice with cautious wording says progress is unknown and doesn't claim no work was done. | FR-08, BR-03, BR-10, FR-08-E1 |
| FR-08-AC2 | Given unknown work progress and a past start-by date, When evaluating, Then communicate possible neglect without asserting confirmed inactivity; after three consecutive days of unlogged activity show the labelled non-punitive advisory. | FR-08, BR-10, FR-08-E2 |
| FR-08-AC3 | Given a balance notice and an urgent start-by warning both apply, When displayed, Then both appear as separate, clearly labelled notices. | FR-08, BR-10, FR-08-E3 |
| FR-08-AC4 | Given new progress is saved while balance evaluation is pending, When reassessing, Then the latest saved progress is used. | FR-08, BR-03, FR-08-E5 |
| FR-08-AC5 | Given a passed start-by date and the Student confirmed not started, When evaluating status, Then a clear warning shows the assignment is confirmed unstarted. | FR-08, FR-09, BR-10, FR-08-E2 |


**Additional validation-derived acceptance criteria (post-critique).**
| ID | Verification scenario | Validation basis |
| --- | --- | --- |
| FR-08-AC6 | Given three consecutive days without logged activity after a missed start-by date, when the balance notice is displayed, then it describes a possible unlogged-activity issue without asserting confirmed inactivity. | V-07, BR-03 |


### FR-09 — Full flow, exceptions and verification

> **D4 delivery status (27 November 2026, DL-19):** Partly delivered. Start status (AC2 to AC6) is planned in slice S-08. AC1 (the "Got it" acknowledgment and 48-hour pause) needs device Notifications and is deferred (S-17). See Section 11.

**Post-validation requirement.** The system shall track assignment start status separately from Notification acknowledgment and allow the Student to confirm that an assignment has already started or that it has not started.

**Main flow.**

- **Requirement:** The system shall track assignment start status separately from Notification acknowledgment and allow the Student to confirm that an assignment has already started or that it has not started.

- **Trigger:** A Notification is acknowledged, or the Student confirms an assignment has or hasn't started.

- **Actors:** Student; system.

- **Preconditions:** The assignment is available to the Student.

- **Normal sequence:** 1. The system tracks the assignment’s start status separately from Notification acknowledgment.
2. The Student may confirm that the assignment has started (“Already Started”) or has not started (“Not Started”).
3. The system records the start confirmation.
4. The system keeps the Notification acknowledgment and assignment start status distinct.

- **Successful outcome:** The Student can acknowledge a Notification without it counting as work started, and separately confirm started or not started.

**Edge cases and documented handling.**
| ID | Abnormal / conflicting situation | Current response | Basis |
| --- | --- | --- | --- |
| ID | Abnormal or conflicting situation | Team decision | Basis |
| FR-09-E1 | A reminder is acknowledged without confirming work started. | “Got it” acknowledges the Notification without marking Started; for the same unstarted assignment a 48-hour pause applies to new start Reminders, after which daily reminders can resume. | RG-22, RG-23, BR-09. OQ-19 open. |
| FR-09-E2 | The Student confirmed work started, but later reports show no progress or none exist. | Keep the start confirmation; missing progress is unknown, not a conflict. | BR-03. OQ-05, OQ-19 open. |
| FR-09-E3 | The Student confirms started more than once. | Harmless duplicate; nothing changes. | Team decision. |
| FR-09-E4 | The Student confirms started on one device while another hasn't synchronized. | Start status belongs to the assignment, not a device; the other device shows it on next sync. Not a Notification acknowledgment, so BR-11 and NFR-03 don't apply. | RG-43, RG-07. |
| FR-09-E5 | Classroom shows Submitted, but the Student hasn't confirmed work started. | Show Submitted, stop its reminders, don't auto-mark started. | RG-12, BR-08, BR-09. OQ-21 open. |
| FR-09-E6 | The Student confirms “Not Started” then “Already Started”, or the reverse. | Latest confirmation applies; confirmed not started is never inferred from a missing report. | RG-47, RG-51, BR-03. |


**Acceptance criteria.**
| ID | Given / When / Then criterion | Verifies |
| --- | --- | --- |
| ID | Acceptance criterion | Verifies (FR / BR / NFR / edge case ID) |
| FR-09-AC1 | Given a “Got it” acknowledgment with no start confirmation, When planning next reminders, Then start status remains unconfirmed and the same assignment receives a 48-hour new-reminder pause before daily reminders can resume. | FR-09, BR-09, FR-09-E1 |
| FR-09-AC2 | Given a start confirmation and later missing progress, When evaluating, Then the confirmation stays and missing progress is treated as unknown, not a conflict. | FR-09, BR-03, FR-09-E2 |
| FR-09-AC3 | Given a started assignment, When the Student confirms again, Then nothing changes. | FR-09, FR-09-E3 |
| FR-09-AC4 | Given the Student confirms started on one device, When the other device next syncs, Then it shows started, and the confirmation isn't treated as a Notification acknowledgment. | FR-09, BR-09, FR-09-E4 |
| FR-09-AC5 | Given Classroom shows Submitted and the Student hasn't confirmed starting, When displayed, Then Submitted shows, its reminders stop, and it isn't auto-marked started. | FR-09, BR-08, BR-09, FR-09-E5 |
| FR-09-AC6 | Given the Student chooses “Not Started”, When recorded, Then the assignment shows confirmed not started, and a later “Already Started” replaces it. | FR-09, FR-09-E6 |


### FR-10 — Full flow, exceptions and verification

> **D4 delivery status (27 November 2026, DL-19):** Partly delivered. Separate Finished and Submitted display is planned in slice S-08, with Submitted values from labelled sample data. Classroom submission detection (S-11) and submission reminders (AC4, S-17) are deferred. See Section 11.

**Post-validation requirement.** The system shall track Finished and Submitted as separate statuses, detect submission status through Classroom where available, allow the Student to update the Finished status manually, and support submission reminders when required.

**Main flow.**

- **Requirement:** The system shall track Finished and Submitted as separate statuses, detect submission status through Classroom where available, allow the Student to update the Finished status manually, and support submission reminders when required.

- **Trigger:** Classroom submission information changes, the Student updates Finished, or a submission reminder is due.

- **Actors:** Student; system; Classroom.

- **Preconditions:** The assignment is available. Classroom submission status is used only where available.

- **Normal sequence:** 1. The system tracks Finished and Submitted separately.
2. The system detects submission status through Classroom where available.
3. The Student may manually update the Finished status.
4. The system reflects the available status information without merging Finished and Submitted.
5. The system supports submission reminders when required.

- **Successful outcome:** The Student distinguishes finishing from submitting, updates Finished manually, and gets submission reminders when required.

**Edge cases and documented handling.**
| ID | Abnormal / conflicting situation | Current response | Basis |
| --- | --- | --- | --- |
| ID | Abnormal or conflicting situation | Team decision | Basis |
| FR-10-E1 | The Student marks Finished, but Classroom shows not Submitted. | Keep Finished; show Submitted as not submitted; submission reminders apply. | RG-13, BR-08. OQ-21 open. |
| FR-10-E2 | Classroom submission status unavailable or undetectable. | Show submission status as unavailable, not "not submitted"; keep manual Finished. | RG-12, C-01. OQ-21, OQ-24 open. |
| FR-10-E3 | The Student's Finished differs from Classroom's submission status. | Show both separately; Classroom provides Submitted, the Student provides Finished; neither overrides. | RG-13, BR-08. OQ-21 open. |
| FR-10-E4 | Submission reminder due for an assignment Finished but not Submitted. | Issue a submission reminder. | RG-13. Generation, repetition and stopping open (OQ-20, OQ-21). |
| FR-10-E5 | Classroom shows Submitted while manual status shows unfinished. | Show Submitted, stop its reminders, leave Finished for the Student to update. | RG-12, BR-08. OQ-16, OQ-21 open. |


**Acceptance criteria.**
| ID | Given / When / Then criterion | Verifies |
| --- | --- | --- |
| ID | Acceptance criterion | Verifies (FR / BR / NFR / edge case ID) |
| FR-10-AC1 | Given Finished but Classroom shows not submitted, When statuses are displayed, Then Finished stays, Submitted shows not submitted, and submission reminders apply. | FR-10, BR-08, FR-10-E1 |
| FR-10-AC2 | Given Classroom submission status is unavailable, When displayed, Then it shows unavailable, not “not submitted”, and keeps manual Finished. | FR-10, C-01, FR-10-E2 |
| FR-10-AC3 | Given Finished and Classroom's Submitted differ, When displayed, Then both show separately and neither overrides the other. | FR-10, BR-08, FR-10-E3 |
| FR-10-AC4 | Given a submission reminder is due for a Finished, not Submitted assignment, When issuing reminders, Then one is issued. | FR-10, FR-10-E4 |
| FR-10-AC5 | Given Classroom shows Submitted while manual status is unfinished, When displayed, Then Submitted shows, reminders stop, and Finished is left for the Student to update. | FR-10, BR-08, FR-10-E5 |


### FR-11 — Full flow, exceptions and verification

> **D4 delivery status (27 November 2026, DL-19, DL-24):** Not delivered in D4. Deferred to slice S-17; D4 runs locally only, with no push notifications. See Section 11.

**Post-validation requirement.** The system shall send Notifications to the Student’s phone and laptop, repeat unacknowledged Notifications daily, synchronize acknowledgment across devices, and treat “Got it” as a 48-hour pause for new start Reminders for that assignment. After that pause, new daily start Reminders may resume if it remains unstarted and neither Finished nor Submitted.

**Post-validation clarification.** A Got it acknowledgment stops the current notification across devices and snoozes new start reminders for 48 hours; after the snooze, daily start reminders resume only if the assignment remains marked unstarted. Unacknowledged alerts follow the agreed daily repetition rule.

**Main flow.**

- **Requirement:** The system shall send Notifications to the Student’s phone and laptop, repeat unacknowledged Notifications daily, synchronize acknowledgment across devices, and issue new daily Reminders while an assignment remains unstarted and is neither Finished nor Submitted.

- **Trigger:** A Notification is due or remains unacknowledged, or an assignment stays unstarted (not Finished or Submitted) and a daily Reminder is due.

- **Actors:** Student; system; Student's phone; Student's laptop.

- **Preconditions:** Assignments or Notifications need delivery; delivery and sync depend on available capabilities (C-03).

- **Normal sequence:** 1. The system sends a Notification to the Student’s phone and laptop.
2. The Student may acknowledge a Notification.
3. The system synchronizes the acknowledgment across devices.
4. The system repeats unacknowledged Notifications daily.
5. The system issues new daily Reminders while an assignment remains unstarted and is neither Finished nor Submitted.
6. The system stops the start Reminders for an assignment when it becomes Started, Finished or Submitted.

- **Successful outcome:** Notifications and Reminders reach devices where available, acknowledgments sync, and daily repeats follow approved rules.

**Edge cases and documented handling.**
| ID | Abnormal / conflicting situation | Current response | Basis |
| --- | --- | --- | --- |
| ID | Abnormal or conflicting situation | Team decision | Basis |
| FR-11-E1 | A Notification can't be delivered to one or both devices. | Not decided. | Open: OQ-23. |
| FR-11-E2 | Acknowledged on one device while the other is offline or unsynchronized. | Acknowledgment applies to both once synchronized, within the NFR-03 target. | BR-11, NFR-03. OQ-22 open. |
| FR-11-E3 | A Notification stays unacknowledged across several daily cycles. | Repeat once daily until acknowledged. | RG-20, RG-21, BR-11. OQ-18 open. |
| FR-11-E4 | The Student acknowledges, but the assignment remains unstarted. | Acknowledgment pauses new daily start Reminders for that assignment for 48 hours; when the pause expires, daily Reminders may resume while it remains unstarted. “Got it” never changes Started status. | RG-22, RG-23, BR-09. OQ-19 open. |
| FR-11-E5 | A daily Reminder is due while an earlier Notification for the same assignment is unacknowledged. | Combine into one Notification per assignment per day. | OQ-18, OQ-19 open. |
| FR-11-E6 | An assignment with a pending start Notification or daily start Reminders becomes Started, Finished or Submitted. | Stop its start Reminders and further repeats of its start Notification. If Finished but not Submitted, submission Reminders apply (FR-10); if Submitted, no further Reminders. | RG-46, BR-18, FR-09-E5, FR-10-E5. OQ-20 open. |


**Acceptance criteria.**
| ID | Given / When / Then criterion | Verifies |
| --- | --- | --- |
| ID | Acceptance criterion | Verifies (FR / BR / NFR / edge case ID) |
| FR-11-AC1 | Given an unacknowledged Notification, When another day passes, Then it repeats once per day until acknowledged. | FR-11, BR-11, FR-11-E3 |
| FR-11-AC2 | Given acknowledgment on one device, When sync completes, Then it applies to both devices, meeting the NFR-03 target (within 1 minute in at least 95% of attempts). | FR-11, BR-11, NFR-03, FR-11-E2 |
| FR-11-AC3 | Given an acknowledged start Notification and an unstarted assignment, When the next start Reminder is considered, Then no new reminder is sent during the 48-hour acknowledgment pause; afterward daily reminders may resume while unstarted. | FR-11, BR-09, FR-11-E4 |
| FR-11-AC4 | Given an unacknowledged earlier Notification when a daily Reminder is due, When preparing that day's Notifications, Then they combine into one per assignment. | FR-11, FR-11-E5 |
| FR-11-AC5 | Given an unacknowledged start Notification or daily start Reminders, When the assignment becomes Started, Finished or Submitted, Then no further start Reminders or repeats are issued; if Finished but not Submitted, submission Reminders apply; if Submitted, none. | FR-11, BR-18, FR-11-E6, FR-09-E5, FR-10-E5 |


**Additional validation-derived acceptance criteria (post-critique).**
| ID | Verification scenario | Validation basis |
| --- | --- | --- |
| FR-11-AC6 | Given a Got it acknowledgment for an unstarted assignment, when the next 48 hours pass, then no new start reminder is issued during the pause; the daily reminder policy resumes after the pause if the work remains unstarted. | V-03, BR-18 |


### FR-12 — Full flow, exceptions and verification

> **D4 delivery status (27 November 2026, DL-19):** Not delivered in D4. Deferred to slice S-18. See Section 11.

**Post-validation requirement.** The system shall synchronize Calendar blocks with the Study plan, preserve the plan during sync failure, and import manual changes to study-block times from Google Calendar when permitted, subject to the official assignment deadline.

**Post-validation clarification.** Support importing a user-moved Calendar block back into the Study plan, but do not silently accept a time beyond the official deadline. If the change creates an infeasible conflict, show the conflict for Student resolution.

**Main flow.**

- **Requirement:** The system shall display the study plan in Google Calendar as Calendar blocks and update the blocks when the plan changes.

- **Trigger:** The study plan is available for Calendar display, or changes.

- **Actors:** Student; system; Google Calendar.

- **Preconditions:** Calendar access and availability permit synchronization (C-02).

- **Normal sequence:** 1. The system obtains the current study plan.
2. The system displays the plan in Google Calendar as Calendar blocks.
3. When the plan changes, the system updates the corresponding Calendar blocks.
4. The Student can view the plan in Google Calendar.

- **Successful outcome:** Calendar blocks reflect the study plan, and plan changes appear in the blocks when sync succeeds.

**Edge cases and documented handling.**
| ID | Abnormal / conflicting situation | Current response | Basis |
| --- | --- | --- | --- |
| ID | Abnormal or conflicting situation | Team decision | Basis |
| FR-12-E1 | Calendar access unavailable or sync fails. | Keep the study plan, warn the Student, and allow retry. | BR-13, RG-17, C-02. OQ-29 open. |
| FR-12-E2 | The plan changes while a previous Calendar update is processing. | Update blocks from the latest plan. | OQ-26 open. |
| FR-12-E3 | A Calendar block no longer matches the latest plan. | Update after the next successful sync; until then warn the Calendar may be out of date. | BR-13, RG-17. OQ-26 open. |
| FR-12-E4 | A block is changed directly in Google Calendar. | A valid manual change to the study block in Google Calendar may update the Study plan after sync. If it conflicts with the official hard deadline or available hours, show an explicit conflict instead of silently overwriting the user edit. | OQ-26. |
| FR-12-E5 | Calendar access revoked while blocks exist. | Stop Calendar sync, keep the plan, warn the Student, leave existing blocks. | C-02, BR-13. OQ-26, OQ-29 open. |


**Acceptance criteria.**
| ID | Given / When / Then criterion | Verifies |
| --- | --- | --- |
| ID | Acceptance criterion | Verifies (FR / BR / NFR / edge case ID) |
| FR-12-AC1 | Given a plan and successful Calendar sync, When synchronizing, Then the plan appears in Google Calendar as Calendar blocks. | FR-12 |
| FR-12-AC2 | Given the plan changes, When Calendar blocks update, Then they use the latest plan. | FR-12, FR-12-E2 |
| FR-12-AC3 | Given Calendar is unavailable or sync fails, When the Student accesses the plan, Then it remains available, a warning shows, and retry is available; saved assignments and the plan stay viewable in 100% of simulated failure tests. | FR-12, BR-13, NFR-02, FR-12-E1 |
| FR-12-AC4 | Given a block no longer matches the plan because sync failed, When the next sync succeeds, Then the block updates; until then the Student is warned Calendar may be out of date. | FR-12, BR-13, FR-12-E3 |
| FR-12-AC5 | Given Calendar access is revoked while blocks exist, When detected, Then sync stops, the plan remains, the Student is warned, and existing blocks stay as they are. | FR-12, C-02, BR-13, FR-12-E5 |
| FR-12-AC6 | Given a Study block moved directly in Google Calendar, When permitted synchronization succeeds, Then import the manual study-time adjustment into the plan unless it violates an official deadline, in which case show a conflict requiring Student action. | FR-12, FR-12-E4 |


**Additional validation-derived acceptance criteria (post-critique).**
| ID | Verification scenario | Validation basis |
| --- | --- | --- |
| FR-12-AC7 | Given a Student moves an existing Calendar study block to a valid time, when synchronization succeeds, then the internal plan reflects the new preferred study time; moves conflicting with an official deadline are flagged for resolution. | V-04, FR-12 |


### FR-13 — Full flow, exceptions and verification

> **D4 delivery status (27 November 2026, DL-19):** Not delivered in D4. Deferred to slice S-13, because there is no Classroom connection in D4. See Section 11.

**Post-validation requirement.** The system shall, when Classroom access is revoked, stop synchronization and let the Student choose whether to keep or delete previously imported assignments. It shall preserve in-progress saved edits safely during revocation and reconcile Classroom assignment IDs with retained local assignments when access is restored.

**Post-validation clarification.** Persist local edits safely before disconnection; on reconnection match upstream assignment identifiers, update official fields, and preserve separate local effort corrections and personal target dates.

**Main flow.**

- **Requirement:** The system shall, when Classroom access is revoked, stop synchronization and let the Student choose whether to keep or delete previously imported assignments.

- **Trigger:** Classroom access is revoked.

- **Actors:** Student; system; Classroom.

- **Preconditions:** Previously imported assignments exist and Classroom access has been revoked.

- **Normal sequence:** 1. The system detects that Classroom access has been revoked.
2. The system stops synchronization.
3. The system presents the Student with the choice to keep or delete previously imported assignments.
4. The Student chooses whether to keep or delete the imported assignments.
5. The system applies the Student's choice.

- **Successful outcome:** Sync stops and the Student controls whether imported assignments are kept or deleted.

**Edge cases and documented handling.**
| ID | Abnormal / conflicting situation | Current response | Basis |
| --- | --- | --- | --- |
| ID | Abnormal or conflicting situation | Team decision | Basis |
| FR-13-E1 | Access revoked during sync. | Stop sync immediately; keep imported assignments pending the Student's choice. | FR-13, BR-14. OQ-27 open. |
| FR-13-E2 | The Student hasn't chosen keep or delete yet. | Keep assignments available; prompt the Student to choose. | RG-11, BR-14. OQ-27 open. |
| FR-13-E3 | The Student deletes imported assignments used in the study plan. | Warn that related plan data will be removed; ask confirmation before deleting. | RG-11. OQ-27, OQ-29 open. |
| FR-13-E4 | Classroom access restored after sync stopped. | On reconnection, match stable Classroom assignment identifiers to retained local records. Do not duplicate matched assignments; preserve manual effort corrections and personal targets while refreshing official deadline fields. | BR-01. OQ-27 open. |
| FR-13-E5 | Access revoked while the Student edits an imported assignment or manual deadline. | Commit or safely roll back active local edits before finalizing a Classroom disconnection or imported-data deletion; inform the Student of any recoverable failure before proceeding. | BR-14. OQ-27, OQ-28 open. |


**Acceptance criteria.**
| ID | Given / When / Then criterion | Verifies |
| --- | --- | --- |
| ID | Acceptance criterion | Verifies (FR / BR / NFR / edge case ID) |
| FR-13-AC1 | Given access is revoked during sync, When detected, Then sync stops immediately and imported assignments remain pending the Student's choice. | FR-13, BR-14, FR-13-E1 |
| FR-13-AC2 | Given revoked access and no keep-or-delete choice yet, When the Student accesses imported assignments, Then they remain available and he is prompted to choose. | FR-13, BR-14, FR-13-E2 |
| FR-13-AC3 | Given the Student deletes assignments used in the study plan, When deletion is requested, Then the system warns that related plan data will be removed and asks confirmation. | FR-13, FR-13-E3 |
| FR-13-AC4 | Given the Student reconnects Classroom after retaining imported assignments, When synchronization runs, Then Classroom IDs are matched without duplicate assignments, official dates refresh, and local progress/manual correction and personal target fields are preserved. | FR-13, BR-01, FR-13-E4 |
| FR-13-AC5 | Given Classroom access revoked during a local assignment edit, When disconnecting, Then persist the local edit transactionally or report a recoverable failure without losing the previous committed edit. | FR-13, BR-14, FR-13-E5 |


**Additional validation-derived acceptance criteria (post-critique).**
| ID | Verification scenario | Validation basis |
| --- | --- | --- |
| FR-13-AC6 | Given access is revoked while a local edit is being saved, when disconnection proceeds, then the edit is committed or a recoverable failure is reported without losing the previous saved state. | V-08, FR-13-E5 |
| FR-13-AC7 | Given a Classroom reconnection, when assignments are fetched, then existing Classroom identifiers do not create duplicates, local manual corrections remain, and official deadline fields update. | V-09, FR-13-E4 |


### FR-14 — Full flow, exceptions and verification

> **D4 delivery status (27 November 2026, DL-19, DL-35):** Partly delivered. Entering and editing ratings is planned in slice S-02 (AC1, the prompt part of AC2, and AC5 with sample courses). The unreliable flag and re-estimation after rating changes (the flag part of AC2, AC3, AC4, AC6, AC7) depend on AI estimation and are deferred (S-05, S-06). See Section 11.

**Post-validation requirement.** The system shall allow the Student to enter a Course skill rating for each course on a scale from 1 to 5 with descriptive labels, and to edit a rating after the first entry. Rating changes shall re-estimate only unfinished system-generated effort estimates and shall not overwrite manually corrected estimates or re-estimate Finished or Submitted assignments.

**Post-validation clarification.** When course rating changes, re-estimate only unfinished system-generated estimates; Finished or Submitted assignments remain excluded and manually corrected estimates remain intact.

**Main flow.**

- **Requirement:** The system shall allow the Student to enter a Course skill rating for each course on a scale from 1 to 5 with descriptive labels, and to edit a rating after the first entry.

- **Trigger:** The Student enters ratings for the first time or edits one.

- **Actors:** Student; system.

- **Preconditions:** Courses are available and the rating settings are accessible.

- **Normal sequence:** 1. The system presents each course with the 1 to 5 scale and labels Very Low to Very High Confidence.
2. The Student selects a rating for a course.
3. The system records the Course skill rating.
4. The Student edits a rating when his confidence changes.
5. The system records the new rating and applies BR-07 to the affected estimates.

- **Successful outcome:** The Student has a rating per course, can change any later, and estimates reflect current ratings.

**Edge cases and documented handling.**
| ID | Abnormal / conflicting situation | Current response | Basis |
| --- | --- | --- | --- |
| ID | Abnormal or conflicting situation | Team decision | Basis |
| FR-14-E1 | The Student has not rated a course. | Prompt for a rating; until then flag that course's estimates unreliable. | FR-04-E2, RG-35. |
| FR-14-E2 | The Student enters a value outside the 1 to 5 scale. | Reject the entry with a message and keep the previous rating, if any. | RG-36. |
| FR-14-E3 | The Student edits a rating after estimates exist. | Re-estimate unfinished system-generated assignments only, excluding Finished and Submitted; preserve manual effort corrections. If the course rating changes by more than two points, ask the Student to review those corrections. | RG-38, RG-39, BR-06, BR-07. OQ-16, OQ-17 open. |
| FR-14-E4 | A new Classroom course appears after the Student rated others. | Add it unrated and prompt to rate; until then treat as FR-14-E1. | RG-35, FR-04-E2. |
| FR-14-E5 | Rating edited during a recalculation. | Use the latest saved rating, recalculate once; discard no edit silently. | RG-51. |


**Acceptance criteria.**
| ID | Given / When / Then criterion | Verifies |
| --- | --- | --- |
| ID | Acceptance criterion | Verifies (FR / BR / NFR / edge case ID) |
| FR-14-AC1 | Given available courses, When the Student opens rating settings, Then each course can be rated 1 to 5 with labels Very Low to Very High Confidence, and ratings are retained. | FR-14, BR-16 |
| FR-14-AC2 | Given a course without a rating, When estimating for it, Then the Student is prompted and the estimate is flagged unreliable until rated. | FR-14, FR-04-E2, FR-14-E1 |
| FR-14-AC3 | Given a Course skill rating changes after effort estimates exist, When recalculating, Then only unfinished system-generated estimates change, Finished or Submitted remain unchanged, and manual effort overrides remain intact. | FR-14, FR-14-E2 |
| FR-14-AC4 | Given estimates for a course with some manually corrected, When the rating is edited, Then unfinished system-generated estimates are re-estimated, manual corrections stay, and start-by dates are recalculated. | FR-14, BR-06, BR-07, FR-14-E3 |
| FR-14-AC5 | Given a new course after other courses were rated, When added, Then it appears unrated and the Student is prompted to rate it. | FR-14, FR-14-E4 |
| FR-14-AC6 | Given a rating edited during recalculation, When it completes, Then the latest saved rating was used and no edit was discarded silently. | FR-14, FR-14-E5 |


**Additional validation-derived acceptance criteria (post-critique).**
| ID | Verification scenario | Validation basis |
| --- | --- | --- |
| FR-14-AC7 | Given a rating change affecting already Finished or Submitted assignments, when re-estimation runs, then those assignments and their historical effort remain unchanged. | V-02, BR-07 |


### FR-15 — Full flow, exceptions and verification

**Post-validation requirement.** The system shall allow the Student to create, edit, delete, and mark as completed individual subtasks within an existing assignment. The system shall display the number of completed subtasks out of the total subtasks for each assignment, without automatically changing its Started, Finished, or Submitted status.

**Source.** TA client requirement TA-01, given at the Deliverable 2 demo. Wording is verbatim. Edge-case handling is the team's decision.

**Main flow.**

- **Requirement:** The system shall allow the Student to create, edit, delete, and mark as completed individual subtasks within an existing assignment. The system shall display the number of completed subtasks out of the total subtasks for each assignment, without automatically changing its Started, Finished, or Submitted status.

- **Trigger:** The Student creates, edits, deletes or marks completed a subtask, or views the assignment list.

- **Actors:** Student; system.

- **Preconditions:** The assignment exists, whether imported from Classroom or given a manual deadline.

- **Normal sequence:** 1. The Student opens an existing assignment and creates a subtask with a title.
2. The system saves the subtask under that assignment.
3. The Student edits a subtask's title, marks it completed, or deletes it.
4. The system saves the change and recalculates the subtask count for the assignment.
5. The system displays the number of completed subtasks out of the total for each assignment.
6. The system leaves the assignment's Started, Finished and Submitted status unchanged.

- **Successful outcome:** The Student can break an assignment into subtasks and see completed out of total subtasks per assignment, and no status changes without the Student's own action.

**Edge cases and documented handling.**
| ID | Abnormal or conflicting situation | Team decision | Basis |
| --- | --- | --- | --- |
| FR-15-E1 | All subtasks of an assignment are marked completed. | The count shows all completed (for example 4 of 4). Started, Finished and Submitted status do not change; the Student updates Finished himself (FR-10). | TA-01, BR-20, BR-08. FR-10. |
| FR-15-E2 | The Student deletes a subtask, whether completed or not. | Remove it and recalculate both the completed count and the total. No status changes. | TA-01, BR-20. |
| FR-15-E3 | The Student enters a blank subtask title or edits a title to blank. | Reject the entry with a message and keep the previous title, if any. | Team decision. Same pattern as FR-02-E2. OQ-37. |
| FR-15-E4 | An assignment has no subtasks. | Show no subtask count for that assignment instead of a misleading 0 of 0. | Team decision. OQ-37. |
| FR-15-E5 | The assignment is Finished or Submitted but has incomplete subtasks. | Keep the subtasks and their counts as they are; neither status changes the subtasks, and the subtasks do not change the status. | TA-01, BR-20, BR-08. |
| FR-15-E6 | The same subtask is changed on both devices before they have synchronized. | Use the latest saved value and discard no edit silently. | RG-51. |
| FR-15-E7 | Classroom access is revoked, or an imported assignment is deleted, while it has subtasks. | Subtasks follow their assignment: kept if the Student keeps the assignment, removed with it if he deletes it, with the usual confirmation warning. | FR-13, FR-13-E3, RG-11. OQ-27 open. |
| FR-15-E8 | The Student wants to mark a completed subtask as not completed. | Allowed: the Student can mark a completed subtask as not completed, and the counts update. No status changes. | Team decision. BR-20. |


**Acceptance criteria.**
| ID | Given / When / Then criterion | Verifies |
| --- | --- | --- |
| FR-15-AC1 | Given an existing assignment, When the Student creates a subtask with a title, Then the subtask is saved under that assignment and appears in its subtask list. | FR-15 |
| FR-15-AC2 | Given an existing subtask, When the Student edits its title, Then the new title is saved. | FR-15 |
| FR-15-AC3 | Given an existing subtask, When the Student deletes it, Then it is removed and the completed count and total are recalculated. | FR-15, FR-15-E2 |
| FR-15-AC4 | Given an incomplete subtask, When the Student marks it completed, Then it is recorded as completed and the completed count increases by one. | FR-15 |
| FR-15-AC5 | Given an assignment with subtasks, When the assignment list is displayed, Then each assignment with subtasks shows the number of completed subtasks out of its total (for example 2 of 5). | FR-15 |
| FR-15-AC6 | Given all subtasks of an assignment are completed, When the count is displayed, Then Started, Finished and Submitted status are unchanged. | FR-15, BR-20, FR-15-E1 |
| FR-15-AC7 | Given a Finished or Submitted assignment with incomplete subtasks, When statuses and counts are displayed, Then both remain as recorded and neither changes the other. | FR-15, BR-20, FR-15-E5 |
| FR-15-AC8 | Given a blank subtask title, When the Student saves it, Then it is rejected with a message and no subtask is created or changed. | FR-15, FR-15-E3 |
| FR-15-AC9 | Given the same subtask is changed on two devices before synchronizing, When both changes are processed, Then the latest saved change is used and no edit is discarded silently. | FR-15, FR-15-E6, RG-51 |


### FR-16 — Full flow, exceptions and verification

**Post-validation requirement.** The system shall allow the Student to start, pause, resume, and stop a study timer associated with a selected assignment. The system shall save the duration of each completed study session and display the total recorded study time for that assignment separately from its Effort estimate and reported remaining effort.

**Source.** TA client requirement TA-02, given at the Deliverable 2 demo. Wording is verbatim. Edge-case handling is the team's decision.

**Main flow.**

- **Requirement:** The system shall allow the Student to start, pause, resume, and stop a study timer associated with a selected assignment. The system shall save the duration of each completed study session and display the total recorded study time for that assignment separately from its Effort estimate and reported remaining effort.

- **Trigger:** The Student starts, pauses, resumes or stops a study timer for a selected assignment.

- **Actors:** Student; system.

- **Preconditions:** The assignment exists and the Student has selected it.

- **Normal sequence:** 1. The Student selects an assignment and starts the study timer.
2. The system records the start of a Study session for that assignment.
3. The Student may pause and resume the timer.
4. The Student stops the timer.
5. The system saves the duration of the completed Study session.
6. The system displays the total Recorded study time for the assignment, separately from its Effort estimate and reported remaining effort.

- **Successful outcome:** Each completed Study session is saved with its duration, and the Student sees the total Recorded study time for the assignment next to, and not mixed with, its Effort estimate and reported remaining effort.

**Edge cases and documented handling.**
| ID | Abnormal or conflicting situation | Team decision | Basis |
| --- | --- | --- | --- |
| FR-16-E1 | The Student starts a timer while another timer is running. | Only one timer is active at a time. The system asks the Student to stop or pause the running timer first. | Team decision. OQ-38. |
| FR-16-E2 | The timer is paused for part of the session. | Paused time is not counted; the saved duration is the running time only. | Team decision. OQ-38. |
| FR-16-E3 | The Student closes the app or loses connection while a timer is running or paused. | A running timer keeps counting until the Student pauses or stops it, measured from its recorded start, so no time or session is lost. A paused timer stays paused. The Student sees the current state when he returns. | Team decision. |
| FR-16-E4 | The Student views the assignment on another device while a timer is running. | The other device shows the same timer state (running or paused) and elapsed time, and the Student may pause or stop the timer from either device. Timer state belongs to the assignment, not a device. | Team decision. Same principle as FR-09-E4. |
| FR-16-E5 | Recorded study time exceeds the Effort estimate, or differs from the reported remaining effort. | Show all values unchanged and separate. Recorded study time does not change the Effort estimate, the reported remaining effort or any start-by date. | TA-02, BR-21, FR-07. |
| FR-16-E6 | The assignment becomes Finished or Submitted while its timer is running. | The Student's timer is not stopped by a status change; the session is saved when he stops it. | Team decision. OQ-38. |
| FR-16-E7 | Classroom access is revoked, or an imported assignment is deleted, while it has Study sessions. | Study sessions and their total follow their assignment: kept if the assignment is kept, removed with it if the Student deletes it, with the usual confirmation warning. | FR-13, FR-13-E3, RG-11. OQ-27 open. |
| FR-16-E8 | The Student wants to edit or delete a saved Study session, or add one manually. | Not supported in this version. Saved Study sessions are kept as recorded and removed only with their assignment (FR-16-E7). | Team decision, to keep scope feasible (C-04). |


**Acceptance criteria.**
| ID | Given / When / Then criterion | Verifies |
| --- | --- | --- |
| FR-16-AC1 | Given a selected assignment and no running timer, When the Student starts the timer, Then a Study session begins for that assignment. | FR-16 |
| FR-16-AC2 | Given a running timer, When the Student pauses it, Then the timer stops counting and the session stays open. | FR-16 |
| FR-16-AC3 | Given a paused timer, When the Student resumes it, Then the timer continues counting in the same session. | FR-16 |
| FR-16-AC4 | Given a running or paused timer, When the Student stops it, Then the session is saved with its duration. | FR-16 |
| FR-16-AC5 | Given a session with paused periods, When it is saved, Then the saved duration counts running time only. | FR-16, FR-16-E2 |
| FR-16-AC6 | Given an assignment with saved Study sessions, When the assignment is displayed, Then the total Recorded study time is shown as the sum of its saved session durations. | FR-16 |
| FR-16-AC7 | Given Recorded study time, an Effort estimate and a reported remaining effort for an assignment, When they are displayed, Then Recorded study time is shown separately and none of the three values is changed by another. | FR-16, BR-21, FR-16-E5 |
| FR-16-AC8 | Given a running timer, When the Student tries to start another timer, Then the system does not start a second one and asks the Student to stop or pause the first. | FR-16, FR-16-E1 |
| FR-16-AC9 | Given a running timer, When the Student closes the app and returns later, Then the timer kept counting from its recorded start, no time was lost, and its current state is shown. | FR-16, FR-16-E3 |


### FR-17 — Full flow, exceptions and verification

**Post-validation requirement.** The system shall allow the Student to search assignments by title and filter them by course, submission status, and deadline range. The system shall display only matching assignments, allow the results to be sorted by deadline, and provide an option to clear all filters and restore the complete assignment list.

**Source.** TA client requirement TA-03, given at the Deliverable 2 demo. Wording is verbatim. Edge-case handling is the team's decision.

**Main flow.**

- **Requirement:** The system shall allow the Student to search assignments by title and filter them by course, submission status, and deadline range. The system shall display only matching assignments, allow the results to be sorted by deadline, and provide an option to clear all filters and restore the complete assignment list.

- **Trigger:** The Student enters search text, applies or changes a filter or the sort order, or clears the filters.

- **Actors:** Student; system.

- **Preconditions:** The Student has assignments in the assignment list.

- **Normal sequence:** 1. The Student enters search text and/or selects a course, a submission status or a deadline range.
2. The system displays only the assignments that match.
3. The Student sorts the results by deadline.
4. The Student selects the option to clear all filters.
5. The system restores the complete assignment list.

- **Successful outcome:** The Student can find assignments by title, course, submission status and deadline range, sort them by deadline, and return to the full list in one action.

**Edge cases and documented handling.**
| ID | Abnormal or conflicting situation | Team decision | Basis |
| --- | --- | --- | --- |
| FR-17-E1 | No assignment matches the search and filters. | Show an empty-result message and keep the option to clear all filters. | Team decision. |
| FR-17-E2 | More than one filter or search text is applied together. | All of them apply together; only assignments matching every condition are shown. | Team decision. OQ-39. |
| FR-17-E3 | The search text matches part of a title or differs in letter case. | Match any part of the title, ignoring letter case. | Team decision. |
| FR-17-E4 | An assignment has no deadline while a deadline-range filter or deadline sort is used. | Undated assignments are not shown when a deadline-range filter is applied, and are listed last when sorting by deadline. | FR-02. Team decision. |
| FR-17-E5 | The deadline range ends before it starts. | Reject the range with a message and keep the previous results. | Team decision. |
| FR-17-E6 | Classroom synchronization changes a deadline or submission status while filters are applied. | Keep the filters and refresh the results from the latest saved data. | FR-01, FR-10. Team decision. |
| FR-17-E7 | Classroom submission status is unavailable for an assignment. | The submission-status filter treats it as unavailable, not as 'not submitted'. | FR-10-E2, C-01. |
| FR-17-E8 | The Student selects 'clear all filters' while search text is entered. | Clear the search text and every filter and show the complete list. | TA-03. OQ-39. |


**Acceptance criteria.**
| ID | Given / When / Then criterion | Verifies |
| --- | --- | --- |
| FR-17-AC1 | Given assignments with different titles, When the Student enters search text, Then only assignments whose title matches are displayed. | FR-17 |
| FR-17-AC2 | Given assignments from several courses, When the Student filters by course, Then only assignments of that course are displayed. | FR-17 |
| FR-17-AC3 | Given assignments with different submission statuses, When the Student filters by submission status, Then only assignments with that status are displayed. | FR-17, FR-10 |
| FR-17-AC4 | Given assignments with different deadlines, When the Student filters by a deadline range, Then only assignments with a deadline inside the range are displayed. | FR-17 |
| FR-17-AC5 | Given a search and one or more filters, When the results are displayed, Then every displayed assignment matches all conditions and no non-matching assignment is displayed. | FR-17, FR-17-E2 |
| FR-17-AC6 | Given displayed results, When the Student sorts by deadline, Then they are ordered by deadline. | FR-17 |
| FR-17-AC7 | Given a search and filters are applied, When the Student selects 'clear all filters', Then the complete assignment list is restored. | FR-17, FR-17-E8 |
| FR-17-AC8 | Given no assignment matches, When the results are displayed, Then an empty-result message is shown and filters can be cleared. | FR-17, FR-17-E1 |
| FR-17-AC9 | Given an assignment with unavailable Classroom submission status, When the Student filters by submission status, Then it is not treated as 'not submitted'. | FR-17, FR-10-E2, FR-17-E7 |


## 4. Non-functional requirements (exactly four)

| ID | Testable requirement | Original AI decision | Rationale |
| --- | --- | --- | --- |
| NFR-01 | The system shall display the Student’s assignment list and start-by dates within 3 seconds for up to 50 assignments. | Modify | Limit and test condition were TBD; the team set 3 seconds for up to 50 assignments (RG-53). |
| NFR-02 | The system shall keep previously saved assignments and the study plan available when Classroom or Calendar synchronization fails: after a simulated synchronization failure, 100% of saved assignments and the study plan shall remain viewable. | Modify | Supported by RG-06, RG-17; target undefined. 100% fits the decision that saved data stays accessible (RG-53). |
| NFR-03 | An acknowledgment made on one device shall be reflected on the Student’s other device within 1 minute, in at least 95% of test attempts. | Modify | RG-19 requires cross-device acknowledgment, but “consistent state” and the time allowed were undefined. The team set 1 minute in at least 95% of test attempts (RG-53). |
| NFR-04 | A new Student shall be able to enter Study availability for the next 7 days (one value per day) and a Course skill rating for each of up to 5 courses in under 5 minutes without help. | Modify | Test scope depended on OQ-01; now fixed at 7 individual days and up to 5 courses (Prototype 2 shows five), testable whichever way OQ-01 is decided (RG-53). |


### NFR verification criteria

| ID | Verification criterion |
| --- | --- |
| NFR-01-AC1 | With 50 available assignments, assignment list and start-by dates display within 3 seconds. |
| NFR-02-AC1 | In simulated Classroom or Calendar sync failure, 100% of saved assignments and the study plan remain viewable. |
| NFR-03-AC1 | In at least 20 cross-device acknowledgment attempts, the other device reflects acknowledgment within 1 minute in at least 95% of attempts. |
| NFR-04-AC1 | An unaided new Student enters 7 days of availability and ratings for up to five courses in under 5 minutes. |


## 5. Business rules

The base business rules are taken from the RE Process Evidence Report; where a rule was marked **Same as original**, its original wording is reproduced. The amendments below distinguish what the Human Validation Report added.

| ID | Post-validation consolidated rule | Historical AI-candidate disposition | Reason |
| --- | --- | --- | --- |
| BR-01 | An official Classroom deadline is the hard submission boundary; an earlier student-entered date may be retained only as a labelled personal pacing target. Sync changes recalculate affected recommendations and notify the Student. | Modify | RG-30 also requires recalculation and notification, which the original omitted. |
| BR-02 | A manual deadline for an assignment without an official deadline shall remain distinguishable from an official Classroom deadline. | Accept | Matches RG-10 (student-entered dates are marked as such). |
| BR-03 | Missing or outdated reported progress is unknown, not zero. Three days after a passed start-by date without logged activity may trigger a non-punitive possible-unlogged-activity advisory, not a confirmed-neglect claim. | Accept | Matches RG-09 and non-goal N-03. |
| BR-04 | The system shall not display a feasible start-by date when available Study availability cannot cover the required assignment effort before the deadline. | Accept | Matches RG-29, N-03; the hours shortage is shown instead (FR-06). |
| BR-05 | Study-hour allocation suggestions may use recorded effort and course difficulty factors but must remain neutral, optional, editable and rejectable; the system shall not impose assignment priorities. | Accept | Matches RG-03, RG-41 and N-01. |
| BR-06 | Manually corrected effort estimates shall never be overwritten by automated re-estimation; when a course rating changes by more than two points, the Student shall be prompted to review retained corrections. | Modify | Matches RG-04, RG-39. RG-44 extends protection to assignment-information changes. Recalculation scope open in OQ-17. |
| BR-07 | Course rating or assignment-information updates shall recalculate eligible unfinished system-generated estimates and dependent start-by dates, explicitly excluding Finished and Submitted assignments. | Modify | Matches RG-38 to RG-40. RG-44 adds re-estimation on assignment-information changes (FR-04-E4). “Unfinished” open in OQ-16. |
| BR-08 | The system shall distinguish a Finished assignment from a Submitted assignment. | Accept | Matches RG-12, RG-13. Overlaps FR-10, but kept as a rule governing several features (reminders, re-estimation). |
| BR-09 | A “Got it” acknowledgment shall indicate that the Student has acknowledged a Notification, not that the assignment has started. | Accept | Matches RG-07 and RG-22. |
| BR-10 | Course-balance notices shall express uncertainty when progress evidence is incomplete and shall distinguish possible neglect from confirmed unstarted work past its start-by date. | Accept | Matches RG-25 to RG-28; exact trigger open in OQ-08 to OQ-12. |
| BR-11 | Unacknowledged Notifications shall repeat daily, and acknowledgment of the same Notification on one device shall apply across devices. | Accept | Matches RG-19 to RG-23; delivery time open in OQ-18. |
| BR-12 | If Classroom synchronization fails, previously saved assignments shall remain accessible, the Student shall be warned that information may be outdated, and retry shall be available. | Accept | Matches RG-06. |
| BR-13 | If Calendar synchronization fails, the study plan shall remain available, the Student shall be warned, and retry shall be available. | Modify | Matches RG-17. Failure behavior moved from FR-12 to here and NFR-02. “Internal study plan” replaced by glossary term “study plan”. |
| BR-14 | When Classroom access is revoked, synchronization shall stop and the Student shall be offered a choice to retain or delete previously imported assignments. | Accept | Matches RG-11; FR-13 provides the capability. Data lifecycle open in OQ-27. |
| BR-15 | The system shall flag estimates when important assignment information is missing, considering the title, description, type, and instructions collectively rather than relying on one field alone. | Accept | Matches RG-33, RG-34; sufficiency rule open in OQ-13. |
| BR-16 | Course skill ratings shall represent the Student’s self-assessed confidence in completing assignments, use a numerical scale from 1 to 5 with descriptive confidence labels, and remain editable. | Accept | Matches RG-35 to RG-38; FR-14 provides the capability. |
| BR-17 | During initial onboarding, unentered days in the next seven days remain unknown, never 0. For later dates, a Student-confirmed recurring baseline may be used and labelled; if not configured, missing availability remains unknown and shortage or feasibility shall not be fabricated. | Add | FR-03-E1 treated an unentered day as 0 hours, contradicting BR-03 and N-03 and showing new Students false shortages (RG-42). Team-authored, so Accept / Modify / Reject doesn't apply. |
| BR-18 | Start Reminders cease once Started, Finished, or Submitted. “Got it” acknowledges the active Notification and pauses new daily start Reminders for that assignment for 48 hours; they may resume daily after the pause if still unstarted. Submission Reminders cease at Submitted. | Add | FR-11 repeated Reminders with no stop for Finished or Submitted work, while FR-09-E5 and FR-10-E5 already stop them on Submitted (RG-46). Team-authored, so Accept / Modify / Reject doesn't apply. |
| BR-19 | Only Notifications shall be sent to the Student’s devices. Course-balance notices, start-by warnings and outdated-data warnings shall be shown inside the system. | Add | The glossary used notice, warning and Notification with no rule for what reaches a device (RG-50). Sending notices and warnings to devices is open in OQ-34. Team-authored, so Accept / Modify / Reject doesn't apply. |
| BR-20 | The system shall not change an assignment's Started, Finished or Submitted status because of any change to its subtasks, including all subtasks being completed. | Add | Derived from TA-01 (FR-15). Team-authored, so Accept / Modify / Reject does not apply. Keeps FR-09 and FR-10 the only sources of those statuses (BR-08, BR-09). |
| BR-21 | Recorded study time shall be kept and displayed separately from the Effort estimate and the reported remaining effort, and shall not by itself change either or any start-by date. | Add | Derived from TA-02 (FR-16). Team-authored, so Accept / Modify / Reject does not apply. Whether recorded time should later inform remaining effort is open in OQ-40. |


### Post-validation amendments to business rules

| Reference | Consolidated rule |
| --- | --- |
| BR-01 (V-06) | Official Classroom deadline remains the hard submission boundary; an earlier student-defined date can be preserved and labelled an internal pacing target. Later manual dates cannot extend the official deadline. |
| BR-03 (V-07) | After three consecutive days without reported activity beyond the start-by date, a possible-unlogged-activity advisory may be shown. The system does not claim unknown progress is zero. |
| BR-05 (V-10) | Suggested study-time redistribution is non-binding and editable; course difficulty/effort may inform it, but there is no system-imposed subjective priority. |
| BR-06 (V-05) | Retain manually edited estimates; when Course skill rating changes by more than two points, prompt the Student to review rather than overwriting the correction. |
| BR-07 (V-02) | Do not re-estimate assignments marked Finished or Submitted, and preserve manually corrected estimates. |
| BR-17 (V-01) | During the explicitly entered first seven days, unspecified availability is unknown. Beyond that horizon, use a Student-confirmed recurring baseline when available; if absent, state that the needed availability is unknown. Label recommendations based on baseline assumptions. |
| BR-18 (V-03) | “Got it” acknowledges the active Notification across devices and pauses further new daily start reminders for the same unstarted assignment for 48 hours; resume daily reminders afterward if still unstarted, subject to existing stop conditions. |
| BR-19 (existing) | Only Notifications go to devices; in-app notices and warnings are not silently treated as push Notifications. |


## 6. Constraints and verified dependencies

| ID | Constraint / dependency | Source status |
| --- | --- | --- |
| C-01 | Classroom assignment retrieval and submission-status detection depend on the Student’s access permissions and the information the connected Classroom account makes available. | Accept |
| C-02 | Calendar block synchronization depends on Calendar access and availability. | Modify |
| C-03 | Notification behavior across phone and laptop depends on the availability of notification delivery and cross-device acknowledgment synchronization. | Accept |
| C-04 | The delivered scope must remain feasible within the course project duration, with any deferrals or simplifications explicitly decided by the team. | Accept |
| C-05 (validation V-08) | Saved local edits must be transactionally preserved before account disconnection or token-revocation cleanup; ACID-compliant local transactions were recorded in the validation report. Exact database/architecture choice remains subject to feasibility verification. | Added at validation |


**External capability caution:** Availability of Classroom submission status, relevant Calendar change permissions, and device notification delivery must be tested; the PRD does not claim those APIs are guaranteed.

## 7. Human-validation change traceability

| Finding | Recorded disposition | Critique summary | Change represented in this PRD |
| --- | --- | --- | --- |
| V-01 | Modify | BR-17 vs NFR-04: Multi-week planning blocked if distant days lack availability entries. | BR-17 & FR-03 updated: beyond the 7-day onboarding window, use a Student-confirmed recurring baseline if one exists, labelled as such; otherwise unentered days stay unknown, never default study hours (wording corrected 27 November 2026 to match BR-17, decision-log.md DL-36). |
| V-02 | Accept | BR-07 vs FR-10: Finished/Submitted tasks re-estimated upon course rating change. | BR-07 updated: explicitly exclude assignments marked Finished or Submitted from re-estimation. |
| V-03 | Modify | BR-18 vs FR-09: Tapping 'Got it' does not snooze daily reminders for unstarted tasks. | BR-18 & FR-11 updated: tapping 'Got it' snoozes daily start reminders for 48 hours. |
| V-04 | Accept | FR-12 / OQ-26: Internal plan overwrites direct student edits in Google Calendar. | FR-12 & OQ-26 resolved: implement bi-directional sync re-importing manual calendar edits into internal plan. |
| V-05 | Modify | BR-06: Manual effort overrides stay locked even if course skill rating changes radically. | BR-06 & FR-14 updated: flag manual overrides for review if course skill rating shifts by >2 points. |
| V-06 | Modify | BR-01: Official LMS deadline crushes early student manual pacing buffers. | BR-01 updated: manual deadlines earlier than LMS dates act as internal pacing targets; LMS date acts as hard limit. |
| V-07 | Accept | BR-03 vs FR-08: 'Unknown progress' rule renders neglect detection toothless during derailment. | FR-08 & BR-03 updated: add non-punitive 'prolonged unlogged activity' advisory after 3 days past start date. |
| V-08 | Accept | FR-13 / FR-13-E5: Async OAuth token drop mid-edit causes database corruption. | FR-13-E5 updated: local writes must execute within ACID-compliant transactions before trigger disconnection flow. |
| V-09 | Accept | FR-13-E4: Orphaned records kept offline lack reconciliation protocol upon LMS reconnect. | FR-13-E4 updated: define ID-matching reconciliation protocol preserving local edits while binding official deadlines. |
| V-10 | Modify | N-01 vs FR-06: Algorithmic hour cuts dictate priorities, violating student priority control. | FR-06 updated: clarify that hour suggestions are neutral math-based load-balancing factoring course difficulty. |
| V-11 | Accept | PRD Completeness: Placeholder sections (RG, OQ, Main Flows) leave foundational logic unwritten. | Fully populate all placeholder sections (RG-01-53, OQ-01-34, FR-01-07 flows) and factor course difficulty into FR-06. |


**Disposition totals from the per-finding Word record:** 6 Accept, 5 Modify, 0 Reject (11 findings). The other uploaded Markdown version conflicts on several dispositions and must not be used simultaneously as an authoritative record.

## 7a. TA client requirements added after the Deliverable 2 demo

| ID | Client requirement (verbatim from the TAs) | Represented in this PRD as |
| --- | --- | --- |
| TA-01 | The system shall allow the Student to create, edit, delete, and mark as completed individual subtasks within an existing assignment. The system shall display the number of completed subtasks out of the total subtasks for each assignment, without automatically changing its Started, Finished, or Submitted status. | FR-15, BR-20, glossary (Subtask), FR-15-E1 to E8, FR-15-AC1 to AC9, OQ-35, OQ-37, OQ-40 |
| TA-02 | The system shall allow the Student to start, pause, resume, and stop a study timer associated with a selected assignment. The system shall save the duration of each completed study session and display the total recorded study time for that assignment separately from its Effort estimate and reported remaining effort. | FR-16, BR-21, glossary (Study timer, Study session, Recorded study time), FR-16-E1 to E8, FR-16-AC1 to AC9, OQ-36, OQ-38, OQ-40 |
| TA-03 | The system shall allow the Student to search assignments by title and filter them by course, submission status, and deadline range. The system shall display only matching assignments, allow the results to be sorted by deadline, and provide an option to clear all filters and restore the complete assignment list. | FR-17, FR-17-E1 to E8, FR-17-AC1 to AC9, OQ-39, OQ-41 |

**Scope check.** FR-15 to FR-17 apply to existing assignments only, so they stay inside non-goal N-07 (not a general task manager). The TA requirements add no new non-functional requirement. The three FRs do not change the behavior of FR-01 to FR-14, and OQ-40 records that subtasks and recorded time are not linked to effort or start-by dates.

**Status of FR-15 to FR-17.** The requirement wording is the TAs' own. The edge-case handling and criteria are the team's decisions drafted from it and are part of this final validated PRD. Open questions that remain are listed in Section 8.

## 8. Open Questions and decisions still needing detail

| ID | Open question / known bounds | Status | Related decisions |
| --- | --- | --- | --- |
| OQ-01 | How are daily study hours recorded: weekly pattern, dated entries, or both? Confirm recurring baseline semantics introduced by V-01. | Resolved 27 November 2026 (decision-log.md DL-36): dated individual-day entries; blank days are unknown, never default hours; the only prefill is a Student-confirmed recurring baseline, labelled as such | RG-01, RG-02 |
| OQ-02 | How are effort, availability and deadlines combined into a start-by date? | Open | RG-01, RG-03, RG-29, RG-41 |
| OQ-03 | How is the initial hour allocation across overlapping assignments generated? | Open | RG-03, RG-15, RG-41 |
| OQ-04 | What adjustments can be suggested when time is insufficient? | Open | RG-03, RG-18, RG-29 |
| OQ-05 | How to recalculate when progress data is outdated or missing? | Open | RG-09, RG-15, RG-16 |
| OQ-06 | When is an optional progress update requested? | Open | RG-09, RG-15 |
| OQ-07 | How are reported remaining hours reconciled with earlier progress and estimates? | Open | RG-04, RG-15, RG-16 |
| OQ-08 | What exact conditions trigger an early course-balance notice? | Open | RG-08, RG-25, RG-26 |
| OQ-09 | How to compare attention across courses when assignments differ in size and difficulty? | Open | RG-08, RG-25, RG-27 |
| OQ-10 | When does incomplete progress lead to a possible-imbalance notice? | Open | RG-09, RG-25, RG-27 |
| OQ-11 | Beyond the Student’s own “Not Started” confirmation (FR-09), can other evidence confirm an assignment is not started, and does the confirmation expire? | Open | RG-07, RG-24, RG-28, RG-47 |
| OQ-12 | Resolved (RG-48, FR-08-E3): shown as two separate, clearly labelled messages. | Resolved | RG-18, RG-26, RG-28, RG-48 |
| OQ-13 | What makes title, description, type and instructions together sufficient for an estimate? | Open | RG-14, RG-33, RG-34 |
| OQ-14 | How do assignment type and skill rating affect the estimate? | Open | D1; RG-04, RG-35 |
| OQ-15 | How is an uncertain estimate presented to the student? | Open | RG-14, RG-33, RG-34 |
| OQ-16 | What counts as unfinished for re-estimation when manual and Classroom status differ? | Open | RG-12, RG-13, RG-39 |
| OQ-17 | What is the scope of recalculation after a rating change, and how are manual values protected? | Open | RG-04, RG-16, RG-39, RG-40 |
| OQ-18 | At what time of day are daily reminders sent? V-03 sets a 48-hour acknowledgment pause but not the daily clock-time. | Open | RG-20 to RG-23 |
| OQ-19 | How do reminders behave once an assignment is started but unfinished? | Open | RG-07, RG-15, RG-22 to RG-24 |
| OQ-20 | When are submission reminders generated, repeated and stopped? | Open | RG-12, RG-13 |
| OQ-21 | How to handle a manual Finished status when Classroom says not submitted, submitted or unavailable? | Open | RG-12, RG-13 |
| OQ-22 | What if one device acknowledges and another has not synchronized? | Open | RG-19, RG-21 |
| OQ-23 | What if notification delivery is unavailable on a device? | Open | D1; RG-19 to RG-24 |
| OQ-24 | Which Classroom assignment, due-date and submission data can the project access? | Open | RG-05, RG-06, RG-10, RG-12, RG-13 |
| OQ-25 | How often is Classroom synchronized and how are changes detected? | Open | RG-05, RG-06 |
| OQ-26 | How are Calendar blocks created and updated when plans change? Limited re-import of external Calendar study-block moves is specified; remaining conflict/permission details require verification. | Partially resolved by V-04 | D1; RG-02, RG-05, RG-17, RG-40 |
| OQ-27 | What happens to imported data after disconnection, reconnection or a retain or delete choice? | Open | RG-06, RG-11 |
| OQ-28 | How is an overridden manual deadline retained or displayed? | Open | RG-10, RG-30 |
| OQ-29 | What stays available when Classroom or Calendar is unavailable? | Open | RG-06, RG-17 |
| OQ-30 | Which confirmed capabilities fit the project duration? | Resolved for D4, 27 November 2026 (decision-log.md DL-19): committed scope in plan.md; delivery status in Section 11 | RG-31, RG-32 |
| OQ-31 | Beyond the weekly load view (deferred, RG-49), which capabilities, if any, will be deferred? | Resolved for D4, 27 November 2026 (DL-19): Classroom connection, AI estimation, device notifications, Calendar sync and revocation are deferred; see Section 11 | RG-31, RG-32, RG-49 |
| OQ-32 | Are cross-device notifications, Calendar and Classroom integration feasible in the target environment? | Open | D1; RG-11 to RG-13, RG-17, RG-19 |
| OQ-33 | Which approved behaviors need simplification to keep a feasible core product? | Resolved for D4, 27 November 2026 (DL-19, DL-24, DL-28, DL-35): labelled sample data instead of Classroom, manual effort instead of AI estimation, local execution only | RG-31, RG-32, RG-41 |
| OQ-34 | Should course-balance notices and urgent start-by warnings also be sent to devices as Notifications, or only shown inside the system? | Open | RG-26, RG-50 |
| OQ-35 | Can the Student mark a completed subtask as not completed again? (FR-15-E8) | Resolved: yes, allowed (FR-15-E8) | TA-01 |
| OQ-36 | Can the Student edit or delete a saved Study session, and can he add one manually? (FR-16-E8) | Resolved: not in this version (FR-16-E8) | TA-02 |
| OQ-37 | Are there limits on subtask title length or number of subtasks per assignment? (FR-15-E3) | Open | TA-01 |
| OQ-38 | How does the Study timer behave when the app is closed, when another timer is started, when it is viewed on another device, and when the assignment becomes Finished or Submitted? (FR-16-E1 to E4, E6) | Resolved by team decisions in FR-16-E1 to E4 and E6 | TA-02 |
| OQ-39 | How exactly does search match titles, how are undated assignments handled by the deadline filter and sort, and do all filters combine together? (FR-17-E2 to E4, E8) | Resolved by team decisions in FR-17-E2 to E4 and E8 | TA-03 |
| OQ-40 | Should subtask completion or Recorded study time ever feed progress, remaining effort or start-by dates? | Decided for this version: no, they are not linked (BR-20, BR-21). Revisit only if the client asks. | TA-01, TA-02; FR-07 |
| OQ-41 | Does the NFR-01 display-time target (3 seconds for up to 50 assignments) also apply to search and filter results? | Open | TA-03; NFR-01 |


## 9. Decision-log traceability (RG-01 to RG-53)

The question, decision and reasons below are transcribed from the group RE Process Evidence document. “Partly” indicates that the main option was recorded while cited sub-questions remain unresolved.

| ID | Question raised | Recorded team decision and reason | Remaining detail |
| --- | --- | --- | --- |
| RG-01 | How should study availability feed realistic start-by dates? | Individual-day availability. Reason: schedules differ daily, so dates are more realistic. | Partly (OQ-01, OQ-02) |
| RG-02 | How should changes to daily availability be handled? | Editable availability; affected start-by dates recalculated. Reason: plan stays current. | Partly (OQ-01, OQ-26) |
| RG-03 | What if required effort exceeds available hours? | Warn and suggest adjustments; the planner doesn't rank assignments. Reason: student controls priorities. | Partly (OQ-02, OQ-03, OQ-04) |
| RG-04 | What if the student thinks an AI estimate is wrong? | Manual correction with recalculation; no automatic learning. Reason: avoids complexity. | Partly (OQ-07, OQ-14, OQ-17) |
| RG-05 | What if a teacher changes a deadline in Classroom? | Update deadline, recalculate start-by dates, notify student. Reason: plan stays accurate. | Partly (OQ-24, OQ-25, OQ-26) |
| RG-06 | What if updated Classroom data cannot be retrieved? | Keep saved assignments, warn data may be outdated, allow retry. Reason: access continues; staleness is visible. | Partly (OQ-24, OQ-25, OQ-27, OQ-29) |
| RG-07 | How should reminders behave after "Got it"? | "Got it" means seen, not started; student marks started separately; reminders continue if unstarted. Reason: seeing isn't starting. | Partly (OQ-11, OQ-19) |
| RG-08 | What triggers a course-neglect warning? | Upcoming deadlines plus reported progress, even before deadlines are close. Reason: early detection. | Partly (OQ-08, OQ-09) |
| RG-09 | How to treat missing or outdated progress? | Treat as unknown, not no work; optionally ask for updates. Reason: fewer false warnings. | Partly (OQ-05, OQ-06, OQ-10) |
| RG-10 | What about Classroom assignments with no due date? | Show them; allow a manual deadline marked student-entered. Reason: undated work must not disappear. | Partly (OQ-24, OQ-28) |
| RG-11 | What if Classroom access is revoked? | Stop sync; student keeps or deletes imported assignments. Reason: student controls own data. | Partly (OQ-27, OQ-32) |
| RG-12 | How to identify completed assignments? | Combine Classroom submission detection with manual Finished status. Reason: fewer needless reminders despite delayed sync. | Partly (OQ-16, OQ-20, OQ-21, OQ-24, OQ-32) |
| RG-13 | What if manual completion conflicts with Classroom status? | Track finished and submitted separately. Reason: finishing isn't submitting; supports submission reminders. | Partly (OQ-16, OQ-20, OQ-21, OQ-24, OQ-32) |
| RG-14 | What if information is too thin for an estimate? | Flag uncertainty; allow manual adjustment. Reason: avoid blind trust in weak estimates. | Partly (OQ-13, OQ-15) |
| RG-15 | What if the student does less than planned in a day? | Recalculate from student-reported progress. Reason: avoids assuming progress. | Partly (OQ-03, OQ-05, OQ-06, OQ-07, OQ-19) |
| RG-16 | How to estimate remaining effort after a progress update? | Ask for remaining hours. Reason: percent done isn't remaining effort. | Partly (OQ-05, OQ-07, OQ-17) |
| RG-17 | What if Google Calendar sync fails? | Keep plan, warn, allow retry. Reason: planning continues; staleness is visible. | Partly (OQ-26, OQ-29, OQ-32) |
| RG-18 | What if the start-by date has already passed? | Warn and suggest adjustments. Reason: shows how far behind he is, without unrealistic expectations. | Partly (OQ-04) |
| RG-19 | How should acknowledgment work across devices? | One acknowledgment stops the reminder on phone and laptop. Reason: no redundant notifications. | Partly (OQ-22, OQ-23, OQ-32) |
| RG-20 | How should reminder frequency be set? | Fixed, not configurable. Reason: simpler. | Partly (OQ-18, OQ-23) |
| RG-21 | What should the interval be? | Once per day. Reason: frequent reminders annoy; daily keeps awareness. | Partly (OQ-18, OQ-22, OQ-23) |
| RG-22 | Send a new reminder if an acknowledged assignment is still not started? | Yes. Reason: "Got it" does not mean work began. | Partly (OQ-18, OQ-19, OQ-23) |
| RG-23 | When is that new reminder sent? | Once per day while unstarted. Reason: simple and consistent. | Partly (OQ-18, OQ-19, OQ-23) |
| RG-24 | What if the student started but forgot to update the status? | Show unconfirmed status with an "Already Started" action. Reason: quick correction, fewer needless reminders. | Partly (OQ-11, OQ-19, OQ-23) |
| RG-25 | How to decide when to show a course-neglect warning? | Combine deadline risk, progress and unknown-status handling. Reason: no report doesn't mean no work. | Partly (OQ-08, OQ-09, OQ-10) |
| RG-26 | Show neglect warnings before the start-by date? | Yes, as early balance notices separate from urgent start-by warnings. Reason: not every imbalance is urgent. | Partly (OQ-08) |
| RG-27 | How to word imbalance when progress is incomplete? | A possible-imbalance notice with stated uncertainty. Reason: never falsely say no work was done. | Partly (OQ-09, OQ-10) |
| RG-28 | Separate possible neglect from confirmed unstarted work? | Yes: cautious wording when progress is unknown; clear warning only when the student confirms not started and the start-by date passed. Reason: wording must match evidence. | Partly (OQ-11) |
| RG-29 | What to show if no feasible start-by date exists? | No date; show the hours shortage. Reason: avoids a misleading date. | Partly (OQ-02, OQ-04) |
| RG-30 | Which deadline wins if official and manual dates conflict? | Official Classroom deadline; recalculate and notify. Reason: a wrong manual date mustn't mislead the plan. | Partly (OQ-28) |
| RG-31 | What if approved scope exceeds project time? | Prioritize essentials; defer less critical additions. Reason: protect what addresses the client's main problems. | Partly (OQ-30, OQ-31, OQ-33) |
| RG-32 | What to protect if scope is cut? | Capabilities for both core problems: knowing when to start and spotting neglected courses. Reason: they are the product's purpose. | Partly (OQ-30, OQ-31, OQ-33) |
| RG-33 | How to detect unreliable AI estimates? | Flag when important assignment details are missing. Reason: simpler than AI judging its own accuracy. | Partly (OQ-13, OQ-15) |
| RG-34 | Which missing details trigger the warning? | Judge title, description, type and instructions together. Reason: a missing description alone is fine if other details help. | Partly (OQ-13, OQ-15) |
| RG-35 | What does a skill rating represent? | Self-assessed confidence in completing assignments. Reason: closer to effort than subject understanding. | Partly (OQ-14) |
| RG-36 | How should confidence be expressed? | A numerical scale from 1 to 5. Reason: simple yet useful. | No |
| RG-37 | How should the scale be explained? | Numbers with labels from Very Low to Very High Confidence. Reason: consistent self-rating. | No |
| RG-38 | Can ratings change after onboarding? | Yes, by manual edit. Reason: confidence changes over time. | No |
| RG-39 | What happens to estimates when a rating changes? | Recalculate unfinished AI estimates; keep manual corrections. Reason: new confidence applies without overriding student values. | Partly (OQ-16, OQ-17) |
| RG-40 | Should changed estimates update start-by dates? | Yes, recalculate affected dates. Reason: the plan stays consistent. | Partly (OQ-17, OQ-26) |
| RG-41 | How to allocate time among overlapping assignments? | Suggest an adjustable allocation. Reason: weighs deadlines and remaining effort without forcing priorities. | Partly (OQ-02, OQ-03, OQ-33) |
| RG-42 | What if the student has not entered availability for a day the plan needs? | Treat the day as unknown, not 0 hours; plan from entered days and prompt for the rest. Show “cannot be determined yet” instead of a shortage unless every day before the deadline is entered. Reason: avoids false shortages for new students (follows RG-09). | Partly (OQ-01) |
| RG-43 | Must a start confirmation sync across devices like “Got it”? | No. Start status belongs to the assignment and shows on every device; only Notification acknowledgment follows RG-19's cross-device rule. Reason: seen and started differ (RG-07). | No |
| RG-44 | What happens to estimates when assignment information changes (e.g. a teacher edits the description)? | Re-estimate unfinished system-generated estimates; keep manual corrections, as in RG-39. Reason: consistent plan without overriding the student. | Partly (OQ-13, OQ-17) |
| RG-45 | When can the system say a shortage “cannot be determined”? | Only when an input other than the estimate is missing: no deadline, or unentered availability before the deadline (RG-42). The estimate is never missing, since a flagged one is always produced (RG-14). Reason: avoids contradicting RG-14 and false shortages. | Partly (OQ-02, OQ-04) |
| RG-46 | Should start Reminders stop when an assignment is Finished or Submitted without being marked started? | Yes. Start Reminders stop once Started, Finished or Submitted; submission Reminders stop once Submitted. Reason: reminding about finished work is noise and contradicts RG-12 and RG-13. | Partly (OQ-20) |
| RG-47 | How does the student confirm that work has not started? | A “Not Started” action beside “Already Started”; RG-28’s clear warning appears only after it and a passed start-by date. Reason: RG-28 needs a way to confirm; FR-09 offered only “Already Started”. | Partly (OQ-11) |
| RG-48 | How are a course-balance notice and an urgent start-by warning shown together? | As two separate, clearly labelled messages (RG-26). Reason: not every imbalance is urgent. | No |
| RG-49 | Is the weekly load view from Deliverable 1 built? | Deferred as non-goal N-08. Reason: Prototype 2 (the client's choice) excludes it; RG-32 protects start timing and neglect detection; shortages are already shown (RG-03). | Partly (OQ-31) |
| RG-50 | Which messages are sent to the student’s devices? | Only Notifications (start Reminders, submission Reminders, deadline-change notices); notices and warnings stay inside the system. Reason: few device messages (RG-21). | Partly (OQ-34) |
| RG-51 | What if several changes arrive close together? | Use the latest saved value, recalculate once, never discard a student’s edit silently. Reason: one consistent plan. | No |
| RG-52 | How are small repeats handled: repeated start confirmation, two Notifications per assignment per day, manual deadline edits? | Repeated start confirmation changes nothing; one Notification per assignment per day; only the current manual deadline kept, no history. Reason: simple, avoids redundancy (RG-19, RG-20). | No |
| RG-53 | Which measurable targets apply to the four NFRs? | Assignment list within 3 seconds for up to 50 assignments (NFR-01); 100% of saved assignments and study plan viewable after a simulated sync failure (NFR-02); acknowledgment on one device shown on the other within 1 minute in at least 95% of tests (NFR-03); new student enters 7 days of availability and ratings for up to 5 courses in under 5 minutes unaided (NFR-04). Reason: each NFR must be verifiable. | No |


## 10. Traceability and validation sign-off

**Primary trace:** User goals → product goals → FR-01–FR-14 (and TA client requirements TA-01–TA-03 → FR-15–FR-17) → FR-specific edge cases and acceptance criteria → RG records → V-01–V-11 amendments. NFR-01–NFR-04 have measurable independent acceptance criteria.

**Final reconciliation rule:** The additional validation cases listed in Section 3 take precedence over earlier criteria only for the same explicitly amended behavior (e.g., the 48-hour snooze in V-03 and Calendar edit synchronization in V-04). Unrelated earlier criteria remain unchanged.

**Approval/feasibility boundary:** This document records team-reported decisions in the source files. It does not substitute for verifying that all four members participated or that the proposed third-party integration behavior is technically achievable. Items marked Proposed/Open require confirmation rather than invented answers.

## 11. Delivery status for Deliverable 4 (added 27 November 2026)

This section is recorded under decision-log.md DL-19 and DL-20 (team decision of 27 November 2026; C-04, RG-31, RG-32). It deletes and changes no requirement. It states only what the D4 product is planned to deliver. D4 demo data is labelled sample data (DL-28), and effort is entered manually (DL-35). "Planned" means in the committed scope, not yet built or verified.

| Requirement | D4 status | Not delivered in D4 | Deferred slice(s) |
| --- | --- | --- | --- |
| FR-01 | Not delivered | All of FR-01: Classroom connection, import, deadline-change updates and notices, revocation during sync | S-11, S-12, S-13 |
| FR-02 | Partly planned | AC3, AC4, AC6 (an official deadline arriving after a manual one; the personal pacing target) | S-12 |
| FR-03 | Planned, except AC6 | AC6 (recurring baseline) only if the reserve slice S-19 is completed | — (reserve S-19) |
| FR-04 | Partly planned | AI estimation, the unreliable-estimate flag and re-estimation. Only manual effort entry is planned. | S-05, S-06 |
| FR-05, FR-06, FR-07, FR-08 | Planned | — | — |
| FR-09 | Partly planned | AC1 ("Got it" and the 48-hour pause) | S-17 |
| FR-10 | Partly planned | Classroom submission detection; submission reminders (AC4, and the reminder part of AC1). Submitted values come from sample data. | S-11, S-17 |
| FR-11 | Not delivered | All of FR-11 | S-17 |
| FR-12 | Not delivered | All of FR-12 | S-18 |
| FR-13 | Not delivered | All of FR-13 | S-13 |
| FR-14 | Partly planned | The flag part of AC2, AC3, AC4, AC6, AC7 (flag and re-estimation). AC5 is shown with sample courses, not Classroom. | S-05, S-06 |
| FR-15, FR-16, FR-17 | Planned | — | — |
| NFR-01, NFR-04 | Planned to be measured at the final check | NFR-01 is measured with sample data, not Classroom | — |
| NFR-02 | Not demonstrated | No Classroom or Calendar synchronization exists to fail | S-12, S-18 |
| NFR-03 | Not delivered | No device notifications | S-17 |
