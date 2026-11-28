# E-03 Data Model Contract

**Project:** AI Academic Deadline Planner (D4)  
**Status:** Design artefact for peer review; implementation is deferred until E-01 is merged.  
**Database:** PostgreSQL. **Migration owner:** Data Access Layer. **Time zone:** `Asia/Karachi`.

## 1. Contract rules

- E-03's foundation migration creates every table below. Slice migrations are reserved for genuine omissions only.
- The Data Access Layer is the only module permitted to access PostgreSQL or own SQL transactions.
- Planning Core owns Student-entered planning data, overrides, calculations, progress interpretation, warnings, subtasks and timer state.
- Store Student overrides separately from calculated values. Recalculation must never overwrite an override.
- Use `date` for academic days/deadlines and `timestamptz` for event timestamps.
- Use `numeric` for hour values. Enforce the stated half-hour steps in validation and database constraints where practical.
- Sample records have an explicit `is_sample` marker. The UI labels sample data visibly. E-04 fills every required field.
- A missing availability value is **Unknown**, not zero. An explicit `0` is valid.
- This is the D4 sample-data planner. Classroom integration, AI estimation, device notifications and Calendar integration are deferred.

## 2. Tables and columns

The following is the minimum persisted contract required by the committed slices and S-19 reserve. UUID primary keys are used consistently. Every table includes `created_at timestamptz NOT NULL DEFAULT now()` and `updated_at timestamptz NOT NULL DEFAULT now()` where rows are editable; append-only report/session tables retain their event timestamps.

### `students`
| Column | Type | Rules |
|---|---|---|
| `id` | uuid | Primary key |
| `display_name` | text | Required |
| `time_zone` | text | Required; D4 value `Asia/Karachi` |
| `is_sample` | boolean | Required, default false |
| `created_at`, `updated_at` | timestamptz | Required |

### `courses`
| Column | Type | Rules |
|---|---|---|
| `id` | uuid | Primary key |
| `student_id` | uuid | FK → students |
| `name` | text | Required |
| `code` | text | Nullable |
| `is_sample` | boolean | Required |
| `created_at`, `updated_at` | timestamptz | Required |

Unique: `(student_id, name)`.

### `assignments`
| Column | Type | Rules |
|---|---|---|
| `id` | uuid | Primary key |
| `student_id` | uuid | FK → students |
| `course_id` | uuid | FK → courses |
| `title` | text | Required |
| `description` | text | Nullable |
| `official_deadline` | date | Nullable; authoritative when present |
| `student_deadline` | date | Nullable; used only when official deadline is absent |
| `status` | text | `Not Started`, `Already Started`, `Finished` |
| `submission_status` | text | `Submitted`, `Not Submitted`, `Unavailable` |
| `effort_hours` | numeric(5,1) | Nullable; Student-entered effort, 0.5–200 by 0.5 |
| `effort_updated_at` | timestamptz | Nullable; used to compare with latest remaining-hours report |
| `last_activity_at` | timestamptz | Nullable; activity as defined in DL-34 |
| `is_sample` | boolean | Required |
| `version` | integer | Required, default 1; incremented on every change (ADR-002, rule 8) |
| `created_at`, `updated_at` | timestamptz | Required |

The applicable deadline is `official_deadline` when present, otherwise `student_deadline`. A Student-entered deadline must be today or later. AI estimates and unreliable-estimate flags are not part of D4.

The API uses snake_case codes (`not_started`, `already_started`, `finished`; `submitted`, `not_submitted`, `unavailable`). The server maps them to the stored values above. In D4, `submission_status` comes from labelled sample data and is not edited by the Student (S-08, FR-10).

### `study_availability`
| Column | Type | Rules |
|---|---|---|
| `id` | uuid | Primary key |
| `student_id` | uuid | FK → students |
| `study_date` | date | Required; Asia/Karachi calendar day |
| `hours` | numeric(3,1) | Required; 0–24 inclusive, 0.5 increments |
| `source` | text | `individual` or `baseline` |
| `created_at`, `updated_at` | timestamptz | Required |

Unique: `(student_id, study_date)`. Missing row means Unknown. Clearing a field deletes the row. An individual entry takes precedence over S-19 baseline data. Invalid input is rejected with a message and the prior saved value remains unchanged (user-approved E-03 API behavior).

### `course_skill_ratings`
| Column | Type | Rules |
|---|---|---|
| `id` | uuid | Primary key |
| `student_id` | uuid | FK → students |
| `course_id` | uuid | FK → courses |
| `rating` | smallint | Required; integer 1–5 |
| `created_at`, `updated_at` | timestamptz | Required |

Unique: `(student_id, course_id)`. Labels: 1 Very Low, 2 Low, 3 Moderate, 4 High, 5 Very High Confidence. Missing row means unrated. The rating is retained as Student input; it does not trigger AI estimation in D4.

### `remaining_hours_reports`
| Column | Type | Rules |
|---|---|---|
| `id` | uuid | Primary key |
| `assignment_id` | uuid | FK → assignments |
| `remaining_hours` | numeric(5,1) | Required; 0–200 inclusive, 0.5 increments |
| `reported_at` | timestamptz | Required; server timestamp |
| `created_at` | timestamptz | Required |

Append-only history. The latest report is the current report. A report of 0 means no remaining effort and gives no start-by date; it does not change assignment status. Effective effort is whichever was saved most recently: manual effort entry or latest report.

### `allocation_overrides`
| Column | Type | Rules |
|---|---|---|
| `id` | uuid | Primary key |
| `assignment_id` | uuid | FK → assignments |
| `study_date` | date | Required |
| `hours` | numeric(5,1) | Required; positive 0.5-hour increments |
| `created_at`, `updated_at` | timestamptz | Required |

Unique: `(assignment_id, study_date)`. Store Student-edited allocation separately from R1-B calculated suggestions. Recalculation must preserve overrides. If an override exceeds available hours, preserve it and show the over-allocation condition.

### `subtasks`
| Column | Type | Rules |
|---|---|---|
| `id` | uuid | Primary key |
| `assignment_id` | uuid | FK → assignments |
| `title` | varchar(200) | Required; 1–200 characters after trimming |
| `is_completed` | boolean | Required, default false |
| `position` | integer | Required; display order |
| `version` | integer | Required, default 1; incremented on every change (ADR-002, rule 8) |
| `created_at`, `updated_at` | timestamptz | Required |

Subtask completion does not change assignment status. A write based on an out-of-date `version` fails with `409 VERSION_CONFLICT` and nothing is overwritten silently (FR-15-AC9).

### `study_timer_sessions`
| Column | Type | Rules |
|---|---|---|
| `id` | uuid | Primary key |
| `assignment_id` | uuid | FK → assignments |
| `student_id` | uuid | FK → students; lets the database enforce one running timer per Student |
| `started_at` | timestamptz | Required; server-recorded |
| `ended_at` | timestamptz | Nullable until stopped |
| `paused_seconds` | integer | Required, default 0; total of completed pauses |
| `paused_at` | timestamptz | Nullable; set when the session is paused, cleared on resume. On resume, `paused_seconds` increases by `now() - paused_at` |
| `duration_seconds` | integer | Nullable until stopped; may be 0 |
| `state` | text | `running`, `paused`, `stopped` |
| `created_at`, `updated_at` | timestamptz | Required |

Server is authoritative for timer state and elapsed time. Only one timer may be running at a time: a partial unique index on `(student_id) WHERE state = 'running'` enforces it (FR-16-AC8). Duration = `ended_at - started_at - paused_seconds`, computed from stored timestamps, never from a client timer. Every stopped session is saved, including a 0-second session. Timer sessions are not activity for S-09 and never change effort or remaining hours.

### `weekly_availability_baselines` (S-19 reserve)
| Column | Type | Rules |
|---|---|---|
| `id` | uuid | Primary key |
| `student_id` | uuid | FK → students; one active pattern per Student |
| `monday_hours` … `sunday_hours` | numeric(3,1) | Each nullable; 0–24 in 0.5 steps |
| `confirmed_at` | timestamptz | Required once explicitly confirmed |
| `created_at`, `updated_at` | timestamptz | Required |

A blank weekday remains Unknown. Pattern applies only from today + 7 onward, and only where there is no individual entry. It is saved only after explicit “Use this weekly pattern” confirmation. Clearing the pattern returns affected days to Unknown.

## 3. Derived values (not Student input)

Do not persist these as overrides:
- R1-B start-by date and shortage hours.
- “Cannot be determined yet” state and the list of blank days preventing determination.
- Suggested daily allocation.
- Balance/possible-imbalance warning text and its supporting derived state.
- Total recorded timer duration (sum of saved sessions).

Planning Core recalculates from persisted inputs. Placeholder function name: **`recalculateStudentPlan(studentId)`**. S-07 and S-10 call it; S-03 replaces its placeholder implementation with the actual R1-B calculation.

## 4. R1-B and supporting persistence semantics

- Today is a planning day; deadline day is excluded.
- Sort eligible assignments by applicable deadline, latest first. Equal deadlines use assignment ID as deterministic technical order, not priority.
- Only assignments with an applicable deadline, effective effort above zero, and neither Finished nor Submitted participate.
- Fill each assignment backwards into free availability before its deadline.
- If hours cannot cover effort, show no start-by date and show shortage.
- Blank days have no hours. If blank days could change an insufficient result, show “cannot be determined yet” and identify them. If known hours suffice, show the date and prompt for blank days.
- A deadline before today gives “deadline passed” and consumes no hours. A deadline today gives a shortage.
- A remaining-hours report replaces older reports as the current report; compare its timestamp with manual effort timestamp to determine effective effort.
- Assignment status and submission status are independent.

## 5. Migration reservations

Location: `server/src/data-access/migrations/` (DL-45).

| Number | Reservation |
|---|---|
| `0001` | E-03 foundation migration: all tables and constraints in this document |
| `0002` | S-01 availability |
| `0003` | S-02 course ratings |
| `0004` | S-03 start-by date |
| `0005` | S-04 allocation |
| `0006` | S-07 remaining-hours report |
| `0007` | S-08 assignment status |
| `0008` | S-09 balance warnings |
| `0009` | S-10 Student-entered deadline |
| `0010` | S-14 subtasks |
| `0011` | S-15 timer |
| `0012` | S-16 search/filter |
| `0013` | S-19 weekly baseline (reserve) |

The foundation migration creates all tables. A reserved slice migration is used only if the slice proves the foundation contract omitted a required schema change; do not create empty migrations.

## 6. Slice-to-table traceability

| Slice | Tables / fields |
|---|---|
| S-01 | `study_availability` (`student_id`, `study_date`, `hours`, timestamps) |
| S-02 | `course_skill_ratings` (`student_id`, `course_id`, `rating`); `courses` |
| S-03 | `assignments` (deadlines, `effort_hours`, `effort_updated_at`, `status`, `submission_status`); `study_availability`; `remaining_hours_reports` |
| S-04 | `allocation_overrides`; `study_availability`; `assignments` |
| S-07 | `remaining_hours_reports`; `assignments.effort_hours`, `effort_updated_at`, `last_activity_at` |
| S-08 | `assignments.status`, `submission_status`, `last_activity_at` |
| S-09 | `assignments` (course, status, submission status, last activity); derived start-by result |
| S-10 | `assignments.student_deadline`, `official_deadline` |
| S-14 | `subtasks` |
| S-15 | `study_timer_sessions` |
| S-16 | `assignments` (title, course, deadlines, submission status) |
| S-19 reserve | `weekly_availability_baselines`; `study_availability` individual-entry precedence |
