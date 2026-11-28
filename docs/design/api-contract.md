# E-03 API Contract

**Status:** Design contract for D4 committed slices. Route names below are proposed resource-oriented routes; align the shared route registry with these names.  
**Conventions:** JSON; dates `YYYY-MM-DD`; timestamps ISO 8601; hour values numeric; all academic-day interpretation uses `Asia/Karachi`. Authenticated application session is required. The API Layer may use Data Access Layer only for application-session operations; all feature data access goes through the owning module's public interface.

## 0. Application session (E-02, DL-27, DL-44)

There is no sign-in in D4. One seeded demo Student gets a real session cookie (`sid`, HttpOnly, SameSite=Lax, 7 days by default; `Secure` only when the server runs with `COOKIE_SECURE=true`). Every route needs a valid session except the two public ones below.

| Route | Needs session | Purpose |
|---|---|---|
| `GET /api/health` | No | Liveness |
| `POST /api/demo/session` | No | Issues the cookie for the demo Student. Returns `{ "student": { "studentId", "displayName", "timeZone" } }` |
| `GET /api/me` | Yes | Returns the current `student` |
| `POST /api/auth/logout` | Yes | Ends the session and clears the cookie. Returns `{ "ok": true }` |

A missing, invalid or expired session returns `401`:
```json
{ "error": { "code": "UNAUTHENTICATED", "message": "A valid session is required." } }
```
The Student is always taken from the session, never from the request body or query.

## 1. Common response and validation rules

Successful reads/writes return JSON with the resource or derived result. Validation failures return `400` with:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Explain what is invalid.",
    "fieldErrors": { "hours": "Enter 0 to 24 hours in 0.5-hour steps." }
  }
}
```
A rejected update is atomic: no field is changed and the previously saved value remains. This applies to invalid availability, ratings, effort, deadlines, date ranges and subtask titles. `404` means the requested resource does not exist; `409` means a state conflict: `VERSION_CONFLICT` (§1.1) or `TIMER_ALREADY_RUNNING` (§11).

### 1.1 Version-checked writes (ADR-002 rule 8, FR-15-AC9)

Four resources have a `version` column (`data-model.md` §2): **assignments, allocation overrides, subtasks and timer sessions**. They can be changed from two browsers or two devices, so a write must never silently overwrite a newer change.

- Every read of one of these resources includes its current `"version": <integer>`.
- Every write to one of them sends the `version` the client last read, in the JSON body. This applies to:
  - assignment writes: `PUT …/effort`, `…/status`, `…/submission-status`, `…/student-deadline`;
  - `PUT /api/assignments/{id}/allocation/{date}` when an override already exists for that date (omit `version` to create a new one);
  - `PATCH /api/subtasks/{id}` and `DELETE /api/subtasks/{id}`;
  - `POST /api/timer/{sessionId}/pause | resume | stop`.
- A missing or non-integer `version` returns `400 VALIDATION_ERROR`.
- If the stored version differs, nothing is changed and the server returns `409`:
  ```json
  { "error": { "code": "VERSION_CONFLICT", "message": "This was changed somewhere else. The latest values are shown." }, "current": { "...": "the fresh representation, including its new version" } }
  ```
  The client shows `current` and lets the Student apply the edit again. That is how "no edit is discarded silently" (FR-15-AC9) is met.
- On success the server increments `version` by 1 (one `UPDATE … WHERE id = $1 AND version = $2` in the Data Access Layer) and returns the new value.
- Server-side bookkeeping does **not** take or bump a version: a remaining-hours report (§7) updating `last_activity_at` does not make the client's assignment version stale.

*Added in the E-03 peer review (Subhan), 28 Nov 2026: the draft required version-checked writes in §10 but never said how the client sends the version. Record it as a decision-log entry when the team confirms.*

### 1.2 Other rules

All write operations return the saved representation. All timestamps are server-generated. Do not accept Student identity, sample marker, timer elapsed duration, or derived planning results from the client.

## 2. Availability — S-01

### `GET /api/availability?from=YYYY-MM-DD&days=7`
Returns the seven calendar days beginning at `from` (today plus six for the normal S-01 view). Unknown days are represented explicitly:
```json
{
  "days": [
    { "date": "2026-11-27", "hours": null, "availability": "unknown", "source": null },
    { "date": "2026-11-28", "hours": 0, "availability": "known", "source": "individual" }
  ],
  "timeZone": "Asia/Karachi"
}
```
`days` is limited to 7 for S-01.

### `PUT /api/availability/{date}`
Request:
```json
{ "hours": 0 }
```
`hours` must be 0–24 inclusive in 0.5 increments. `null` or a cleared field means no entry/Unknown. Blank is not coerced to zero. Response:
```json
{ "date": "2026-11-27", "hours": 0, "availability": "known", "source": "individual" }
```
Invalid values are rejected with a message and preserve the old value.

## 3. Course ratings — S-02

### `GET /api/courses`
Returns courses and rating state:
```json
{
  "courses": [
    { "id": "uuid", "name": "Mathematics", "code": null, "rating": null, "ratingLabel": null, "needsRating": true, "isSample": true }
  ]
}
```
Unrated courses remain unrated and are flagged for the UI prompt.

### `PUT /api/courses/{courseId}/rating`
Request: `{ "rating": 3 }`. Integer 1–5 only. Labels map to 1 Very Low, 2 Low, 3 Moderate, 4 High, 5 Very High Confidence.
Response: `{ "courseId": "uuid", "rating": 3, "ratingLabel": "Moderate" }`.
Out-of-range or non-integer input is rejected; previous rating remains.

## 4. Assignment list, detail and filtering — E-05 / S-16

### `GET /api/assignments`
Optional query parameters:
- `q`: case-insensitive partial title search.
- `courseId`: exact course filter.
- `submissionStatus`: `submitted`, `not_submitted`, or `unavailable`.
- `deadlineFrom`, `deadlineTo`: inclusive date range; both ends included.
- `sort`: `deadline` (ascending default for the list contract).

Combined filters are ANDed. Undated assignments are excluded from a date-range filter and sorted last when sorting by deadline. A range ending before it starts is rejected and prior client results remain visible.

Response:
```json
{
  "assignments": [
    {
      "id": "uuid", "title": "Lab 3", "course": { "id": "uuid", "name": "Programming" },
      "officialDeadline": "2026-12-02", "studentDeadline": null,
      "applicableDeadline": "2026-12-02", "status": "not_started",
      "submissionStatus": "not_submitted", "effortHours": 4,
      "effectiveEffortHours": 4, "startBy": "2026-11-30",
      "planningState": "scheduled", "isSample": true, "version": 1
    }
  ],
  "filters": { "q": "", "courseId": null, "submissionStatus": null, "deadlineFrom": null, "deadlineTo": null },
  "sort": "deadline"
}
```
`submissionStatus=unavailable` is distinct from `not_submitted`. Empty result is a successful response with an empty array.

### `GET /api/assignments/{assignmentId}`
Returns assignment fields plus course, start-by/shortage state, allocation, subtasks, timer summary and warnings available to the detail view. The response uses the same field names as the list representation and includes:
```json
{
  "planning": {
    "state": "scheduled | shortage | unknown_availability | no_estimate | deadline_passed | no_remaining_effort",
    "startBy": "YYYY-MM-DD or null",
    "shortageHours": 0,
    "unknownDates": []
  },
  "allocation": { "suggested": [], "overrides": [], "overAllocatedDates": [] },
  "subtasks": [],
  "timer": { "isRunning": false, "totalRecordedSeconds": 0, "activeSession": null },
  "warnings": []
}
```

**E-05 delivery notes (DL-59):**
- Until the owning slice merges, its part of the response is `null`, meaning "not built yet": `startBy` and `planningState` in the list and `planning` in the detail (S-03), `allocation` (S-04), `subtasks` (S-14), `timer` (S-15), `warnings` (S-09). An empty array (`[]`) is reserved for "built, and there are none". Each slice fills only its own marked line in `server/src/planning-core/assignments/index.ts`.
- The detail also returns `description`, `effortUpdatedAt`, `lastActivityAt` and `latestRemainingHours` (`{ remainingHours, reportedAt }` or `null`).
- An unknown id, a malformed id, or another Student's assignment returns `404` `{ "error": { "code": "NOT_FOUND", "message": "Assignment not found." } }`.
- Until S-16 merges, `GET /api/assignments` ignores its query parameters and always sorts by applicable deadline, undated last (ties: title, then id).

## 5. Manual effort and start-by calculation — S-03

### `PUT /api/assignments/{assignmentId}/effort`
Request: `{ "hours": 2.5, "version": 3 }`. Manual effort must be 0.5–200 in 0.5 steps. `0` is rejected; blank means no estimate (`null`). Response returns saved `effortHours`, timestamp and recalculated `planning` object.
No AI estimate, confidence-based estimation, unreliable-estimate flag or re-estimation is delivered in D4.

### `GET /api/planning`
Returns the current Student plan and per-assignment derived planning state. This is a derived read, not a write endpoint. Derived planning fields include start-by, shortage, unknown availability dates and allocation suggestions.

Planning rules:
- Today counts; deadline day does not.
- Applicable deadline is official deadline if present, otherwise Student-entered deadline.
- Eligible assignments have a deadline, effective effort above zero, and are neither Finished nor Submitted.
- Order latest deadline first; equal deadlines use assignment ID as deterministic technical order.
- Fill backwards into free hours before the deadline.
- Blank availability means no known hours. If unknown days could change an insufficient result, return `unknown_availability` and the date list; if known hours suffice, return scheduled result and an unknown-days prompt; if all days are known and insufficient, return shortage.
- Past deadline returns `deadline_passed`; deadline today returns shortage.
- Effective effort is whichever was saved most recently: manual effort or latest remaining-hours report.

Example planning result:
```json
{
  "assignmentId": "uuid",
  "state": "shortage",
  "startBy": null,
  "shortageHours": 2,
  "unknownDates": [],
  "message": "No start-by date — short by 2 h."
}
```

## 6. Allocation overrides — S-04

### `GET /api/assignments/{assignmentId}/allocation`
Returns suggested R1-B daily split, saved overrides and over-allocation dates.

### `PUT /api/assignments/{assignmentId}/allocation/{date}`
Request: `{ "hours": 2 }`, plus `"version"` when replacing an existing override (§1.1). Positive half-hour increments only. Stores a Student override, never overwrites the calculated suggestion. Response returns saved override and refreshed allocation view. If the override exceeds that day's availability, preserve it and report the over-allocation state. Suggestions and shortage explanations are neutral; they do not rank assignments.

## 7. Remaining-hours reports — S-07

### `POST /api/assignments/{assignmentId}/remaining-hours`
Request: `{ "remainingHours": 3.5 }`. Range 0–200 inclusive, 0.5 increments. Server supplies `reportedAt`.
Response:
```json
{
  "id": "uuid", "assignmentId": "uuid", "remainingHours": 3.5,
  "reportedAt": "2026-11-27T10:00:00+05:00",
  "planning": { "state": "scheduled", "startBy": "2026-11-30", "shortageHours": 0 }
}
```
Latest report replaces older report as current. Zero does not change assignment status and results in no start-by date. Report activity updates last-activity tracking.

## 8. Assignment status — S-08

### `PUT /api/assignments/{assignmentId}/status`
Request: `{ "status": "already_started", "version": 3 }`. Allowed values: `not_started`, `already_started`, `finished`.
Response returns saved status, timestamp/last-activity value and refreshed planning state. Status changes count as activity. Status and submission status are independent.

### `PUT /api/assignments/{assignmentId}/submission-status`
Request: `{ "submissionStatus": "submitted", "version": 4 }`. Allowed values: `submitted`, `not_submitted`, `unavailable`.
Response returns saved submission status and refreshed planning state. Submitted assignments do not take planning hours.

## 9. Student-entered deadline — S-10

### `PUT /api/assignments/{assignmentId}/student-deadline`
Request: `{ "deadline": "2026-12-01", "version": 2 }` or `{ "deadline": null, "version": 2 }` to clear.
A date must be today or later. Yesterday or earlier is rejected and leaves the previous deadline unchanged. Planning uses official deadline whenever one exists; otherwise it uses the Student-entered deadline.
Response returns `studentDeadline`, `applicableDeadline`, and refreshed planning result. This operation calls `recalculateStudentPlan(studentId)`.

## 10. Subtasks — S-14

### `GET /api/assignments/{assignmentId}/subtasks`
Returns ordered subtasks.

### `POST /api/assignments/{assignmentId}/subtasks`
Request: `{ "title": "Read the requirements" }`. Trim whitespace; resulting title length must be 1–200 characters.
Response returns created subtask.

### `PATCH /api/subtasks/{subtaskId}`
Request may update `{ "title": "..." }`, `{ "isCompleted": true }`, or both, and always carries `"version"` (§1.1).
Response returns saved subtask. Completion does not alter assignment status.

### `DELETE /api/subtasks/{subtaskId}`
Request: `{ "version": 2 }`. Returns `{ "deleted": true }`. A stale version returns `409 VERSION_CONFLICT` (§1.1), so a subtask edited on another device is never deleted unseen.

## 11. Study timer — S-15

### `GET /api/assignments/{assignmentId}/timer`
Returns server-authoritative active timer state and total saved duration:
```json
{
  "activeSession": { "id": "uuid", "state": "running", "startedAt": "timestamp", "pausedSeconds": 0, "version": 1 },
  "totalRecordedSeconds": 3600
}
```
`activeSession` is null if no timer is running/paused.

### `POST /api/assignments/{assignmentId}/timer/start`
Request: `{}`. Starts a session using server time. If another timer is already running, return `409 TIMER_ALREADY_RUNNING`.

Pause, resume and stop each send `{ "version": n }` (§1.1).

### `POST /api/timer/{sessionId}/pause`
Pauses the active session; response returns updated server state.

### `POST /api/timer/{sessionId}/resume`
Resumes a paused session; response returns updated server state.

### `POST /api/timer/{sessionId}/stop`
Stops and persists every session, including duration `0`. Response returns saved session and refreshed total seconds. Paused time is excluded. Closing the browser does not stop the server timer. Timer data never changes effort/remaining-hours and is not activity for S-09.

## 12. Possible-imbalance warnings — S-09

### `GET /api/warnings`
Returns possible-imbalance and 3-day advisory warnings derived from S-07/S-08 activity and S-03 start-by dates. Warning text must communicate that progress is unknown, not assert that a Student has neglected a course.

R3-A conditions:
1. Course has unfinished, unsubmitted assignment with start-by within next 3 days or passed.
2. No assignment in that course has activity in last 7 days.
3. At least one other course has activity in that period.

Activity: status changed to Already Started or Finished, or progress/remaining-hours report entered. Timer sessions are not activity. The 3-day advisory appears after 3 or more full days without activity, counted in Asia/Karachi time.

## 13. Weekly baseline — S-19 reserve

### `GET /api/availability/baseline`
Returns seven nullable weekday values and confirmation state.

### `PUT /api/availability/baseline`
Request:
```json
{
  "monday": 2, "tuesday": null, "wednesday": 1.5,
  "thursday": null, "friday": 2, "saturday": 0, "sunday": null,
  "confirm": true
}
```
Each weekday is blank or 0–24 in 0.5 steps. The pattern is saved only when `confirm` is true (explicit “Use this weekly pattern” action). It applies only from today + 7 onward and only where no individual entry exists. Individual availability wins. Clearing the baseline returns affected future dates to Unknown.
Response returns saved pattern and the effective baseline dates.

## 14. Shared contract cautions

- API field names are JSON camelCase; database names are snake_case.
- Never accept derived start-by dates, shortage values, suggested allocations, timer duration, last-activity timestamps, or `isSample` from a client write.
- Sample data is labelled in read responses, not client-editable metadata.
- The exact route registration lines are slice-owned shared-file slots under DL-55; each slice adds only its marked line.
