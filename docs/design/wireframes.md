# E-03 UI Wireframes

**Status:** Initial low-fidelity wireframes for team review. These are structural layouts, not visual styling specifications. The team must review and record actual changes before E-03 is accepted.

## Global application shell

```text
┌──────────────────────────────────────────────────────────────┐
│ AI Academic Deadline Planner       [Sample data] [Student]   │
├───────────────────┬──────────────────────────────────────────┤
│ Overview          │ Page title                               │
│ Assignments       │                                          │
│ Availability      │ Main page content                        │
│ Courses           │                                          │
└───────────────────┴──────────────────────────────────────────┘
```

- Show a visible “Sample data” label whenever the active dataset is sample data.
- Do not imply a live Google Classroom connection in D4.
- All dates use Asia/Karachi calendar days.

## 1. Daily availability — S-01

```text
┌──────────────────────────────────────────────────────────────┐
│ Study availability                  Next 7 days              │
│ Set the hours you can study each day. Blank means Unknown.   │
├─────────────┬───────────────────────┬────────────────────────┤
│ Day / Date  │ Available hours       │ State                  │
├─────────────┼───────────────────────┼────────────────────────┤
│ Today       │ [  2.0  ] hours       │ Known                  │
│ Sat 28 Nov  │ [       ] hours       │ Unknown                │
│ Sun 29 Nov  │ [  0.0  ] hours       │ Known                  │
│ Mon 30 Nov  │ [  1.5  ] hours       │ Known                  │
│ Tue 01 Dec  │ [       ] hours       │ Unknown                │
│ Wed 02 Dec  │ [  3.0  ] hours       │ Known                  │
│ Thu 03 Dec  │ [       ] hours       │ Unknown                │
├─────────────┴───────────────────────┴────────────────────────┤
│ [Save availability]                                           │
│ Enter 0–24 hours in 0.5-hour steps. Invalid values are        │
│ rejected; the last saved value is retained.                  │
└──────────────────────────────────────────────────────────────┘
```

Show exactly today plus six days. A blank value is displayed as **Unknown**, never as `0`. A valid explicit zero is shown as `0.0`. Saving a newer value replaces the earlier value for that date. Invalid input shows a field-level message and does not change the stored value.

## 2. Course confidence ratings — S-02

```text
┌──────────────────────────────────────────────────────────────┐
│ Course confidence                                            │
│ Rate how confident you feel in each course.                  │
├───────────────────────────────┬──────────────────────────────┤
│ Course                        │ Your confidence              │
├───────────────────────────────┼──────────────────────────────┤
│ Programming Fundamentals      │ [Choose rating ▼]            │
│                               │ Not rated — please rate      │
│ Database Systems              │ [3 — Moderate ▼]              │
│ Discrete Mathematics          │ [5 — Very High Confidence ▼] │
└───────────────────────────────┴──────────────────────────────┘
```

Options are exactly: 1 Very Low, 2 Low, 3 Moderate, 4 High, 5 Very High Confidence. Unrated courses remain visibly unrated and prompt the Student. Invalid/non-integer values show an error and preserve the previous rating. Do not show AI estimate or unreliable-estimate controls in D4.

## 3. Assignment list — E-05 / S-16

```text
┌──────────────────────────────────────────────────────────────┐
│ Assignments                                  [+ sample data] │
│ [Search title................] [Course ▼] [Submission ▼]     │
│ Deadline from [date] to [date]       [Clear all filters]     │
│ Sort by: [Deadline ▼]                                         │
├──────────────────────────────────────────────────────────────┤
│ Assignment       Course       Deadline      Start-by  Status  │
│ Lab 3            PF           02 Dec        30 Nov    Not...  │
│ Project          DSA          05 Dec        01 Dec    Started │
│ Quiz 2           DB           —             No date   —       │
├──────────────────────────────────────────────────────────────┤
│ No matches? Clear all filters to see all assignments.        │
└──────────────────────────────────────────────────────────────┘
```

- Search is case-insensitive partial matching on title.
- Filters combine with AND: course, submission status, inclusive deadline range.
- Undated assignments are excluded from a date-range filter and appear last when sorting by deadline.
- “Unavailable” submission status is distinct from “Not Submitted”.
- Invalid reversed date range shows a message and keeps prior results.
- Clear all filters clears search text and every filter.

## 4. Assignment detail — shared page

```text
┌──────────────────────────────────────────────────────────────┐
│ ← Assignments                                                │
│ Lab 3 — Programming Fundamentals                 [Sample]    │
│ Official deadline: 02 Dec 2026                               │
│ Student deadline:  —                                         │
│ Status: [Not Started ▼]    Submission: Not Submitted (read-only) │
├──────────────────────────────────────────────────────────────┤
│ PLAN                                                         │
│ Start by: 30 Nov 2026                                        │
│ Suggested effort: [ 4.0 ] hours                              │
│ [Enter / update effort]                                      │
│                                                              │
│ ALLOCATION                                                   │
│ Mon 30 Nov  [2.0 h suggested] [override: __ ]                │
│ Tue 01 Dec  [2.0 h suggested] [override: __ ]                │
│                                                              │
│ REMAINING HOURS                                               │
│ [ 3.0 ] hours remaining      [Save report]                   │
│                                                              │
│ SUBTASKS                                                     │
│ [ ] Read the requirements                          [Edit] [×]│
│ [ ] Complete implementation                        [Edit] [×]│
│ [New subtask........................] [Add]                  │
│                                                              │
│ STUDY TIMER                                                  │
│ Total recorded: 00:45:00                                     │
│ [Start] [Pause] [Resume] [Stop]                              │
│                                                              │
│ WARNINGS                                                     │
│ No recent progress logged for this course — you may not      │
│ have recorded it.                                            │
└──────────────────────────────────────────────────────────────┘
```

### Marked slice slots on the shared assignment detail page

DL-55 requires one marked slot per slice. Keep these markers in the shared page so each slice can add only its own component without editing another slice's area.

```text
<!-- E-03 shared assignment detail page: slice-owned slots -->
<section data-slice-slot="S-03-start-by">Start-by / shortage / unknown availability</section>
<section data-slice-slot="S-04-allocation">Suggested allocation and Student overrides</section>
<section data-slice-slot="S-07-remaining-hours">Remaining-hours report</section>
<section data-slice-slot="S-08-status">Assignment status controls</section>
<section data-slice-slot="S-09-balance-warnings">Possible-imbalance and 3-day advisory</section>
<section data-slice-slot="S-10-student-deadline">Student-entered deadline</section>
<section data-slice-slot="S-14-subtasks">Subtasks</section>
<section data-slice-slot="S-15-study-timer">Study timer</section>
```

S-01 availability and S-02 ratings have their own pages; S-16 belongs to the assignment list. S-19 baseline is a reserve and adds a section to the availability page only if the team activates it.

## 5. Start-by and shortage states — S-03

```text
┌──────────────────────────────────────────────────────────────┐
│ START-BY                                                     │
│ Start by: Monday, 30 November                                │
│                                                              │
│ OR                                                           │
│ No start-by date — short by 2 h.                             │
│                                                              │
│ OR                                                           │
│ Cannot be determined yet — enter availability for Tuesday.  │
│                                                              │
│ OR                                                           │
│ Deadline passed.                                             │
│                                                              │
│ OR                                                           │
│ No estimate — enter the effort required.                     │
└──────────────────────────────────────────────────────────────┘
```

Use exactly the R1-B outcomes. If known availability suffices despite blank days, show the start-by date and prompt the Student to fill those days. If blank days could change an insufficient result, show “cannot be determined yet” and identify the blank dates. A deadline today produces shortage; a deadline before today produces “deadline passed”.

## 6. Allocation view — S-04

```text
┌──────────────────────────────────────────────────────────────┐
│ Suggested allocation                                         │
│ Wed 25 Nov     2 h                                           │
│ Thu 26 Nov     2 h                                           │
│                                                              │
│ Your overrides                                               │
│ Wed 25 Nov     [2.0] h                                        │
│ Thu 26 Nov     [1.5] h                                        │
│                                                              │
│ Over-allocation: Thu 26 Nov is 0.5 h above availability.     │
│ Suggestions are neutral; they do not rank assignments.      │
└──────────────────────────────────────────────────────────────┘
```

Calculated suggestions and Student overrides must be visually distinct. An override is retained even if availability later decreases; show over-allocation rather than silently changing the override. An edit larger than that day's availability minus the other overrides is rejected with a message (DL-51); the over-allocation notice appears only after availability later falls below existing overrides.

## 7. Remaining hours — S-07

Show a numeric input (0–200, half-hour increments), a “Save report” action, the latest reported value and its timestamp. A value of 0 is allowed, means no remaining effort, and does not automatically mark the assignment Finished. Explain that the latest report is used for planning.

## 8. Status — S-08

Provide a control for assignment status: Not Started / Already Started / Finished.

Show submission status (Submitted / Not Submitted / Unavailable) separately and **read-only**. In D4 it comes from labelled sample data, because Classroom is deferred (S-08, FR-10). Do not combine the two into one control. A status change counts as activity. A Submitted or Finished assignment is excluded from R1-B planning.

## 9. Student-entered deadline — S-10

Show the official deadline (read-only in D4) and a separate Student-entered deadline field for undated assignments. Date picker minimum is today. Yesterday or earlier shows an error and leaves the previous value unchanged. Explain that official deadline takes precedence whenever present.

## 10. Possible-imbalance warning — S-09

Display warning text as an advisory, not a factual accusation. Example: “No recent progress logged for Mathematics — you may not have recorded it.” Trigger only under the R3-A conditions. Show the reason/context where useful. Timer sessions do not count as activity. Show the possible-imbalance notice and any urgent start-by warning as two separate, labelled messages (FR-08-AC3). A "confirmed not started" warning appears when an assignment marked Not Started has a passed start-by date (FR-08-AC5).

## 11. Study timer — S-15

Show server-authoritative state, elapsed time, and total recorded time separately from effort:
- No active session: Start.
- Running: Pause, Stop.
- Paused: Resume, Stop.
- On Stop, save every session including 0 seconds.
- Paused time is excluded.
- Browser close/reopen must not reset a running timer.

## 12. Weekly baseline — S-19 reserve

Only show if the reserve slice is activated by the team.

```text
┌──────────────────────────────────────────────────────────────┐
│ Weekly availability pattern                                  │
│ Mon [2.0] Tue [   ] Wed [1.5] Thu [   ] Fri [2.0]             │
│ Sat [0.0] Sun [   ]                                          │
│ Blank weekdays remain Unknown.                               │
│ [Use this weekly pattern]                                     │
│ Pattern starts one week ahead (today + 7). Individual entries│
│ always take precedence.                                      │
│ [Clear pattern]                                               │
└──────────────────────────────────────────────────────────────┘
```

No pattern is persisted until explicit confirmation. A pattern only fills future dates from today + 7 onward where there is no individual entry. Clearing it returns those dates to Unknown.

## 13. Team review record

This is a review-ready initial proposal, not evidence that a team review has occurred. After review, record the actual changes in `evidence/Workflow-Evidence-Log.md`; do not claim review or acceptance before it happens.
