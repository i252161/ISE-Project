-- E-03 foundation migration (DL-55, DL-45). Creates every table the committed slices need,
-- so no slice has to wait for another slice's tables. Spec: docs/design/data-model.md.
-- Never edit this file once applied; a slice that finds a real omission uses its reserved number.
-- Half-hour steps are checked with (value * 2) = trunc(value * 2). PostgreSQL rounds to
-- numeric(n,1) BEFORE the check runs: 1.25 becomes 1.3 and is rejected, but 0.96 becomes
-- 1.0 and is accepted. The database is only a backstop; the API must validate (DL-41, DL-49).

CREATE TABLE students (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name text        NOT NULL,
  time_zone    text        NOT NULL,
  is_sample    boolean     NOT NULL DEFAULT false,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE courses (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid        NOT NULL REFERENCES students (id) ON DELETE CASCADE,
  name       text        NOT NULL CHECK (btrim(name) <> ''),
  code       text,
  is_sample  boolean     NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (student_id, name)
);

CREATE TABLE assignments (
  id                uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id        uuid         NOT NULL REFERENCES students (id) ON DELETE CASCADE,
  course_id         uuid         NOT NULL REFERENCES courses (id) ON DELETE CASCADE,
  title             text         NOT NULL CHECK (btrim(title) <> ''),
  description       text,
  official_deadline date,
  student_deadline  date,
  status            text         NOT NULL DEFAULT 'not_started'
                    CHECK (status IN ('not_started', 'already_started', 'finished')),
  submission_status text         NOT NULL DEFAULT 'unavailable'
                    CHECK (submission_status IN ('submitted', 'not_submitted', 'unavailable')),
  effort_hours      numeric(5,1)
                    CHECK (effort_hours IS NULL
                           OR (effort_hours BETWEEN 0.5 AND 200 AND effort_hours * 2 = trunc(effort_hours * 2))),
  effort_updated_at timestamptz,
  last_activity_at  timestamptz,
  is_sample         boolean      NOT NULL DEFAULT false,
  version           integer      NOT NULL DEFAULT 1,
  created_at        timestamptz  NOT NULL DEFAULT now(),
  updated_at        timestamptz  NOT NULL DEFAULT now()
);
CREATE INDEX assignments_student_course_idx   ON assignments (student_id, course_id);
CREATE INDEX assignments_student_deadline_idx ON assignments (student_id, official_deadline, student_deadline);

CREATE TABLE study_availability (
  id         uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid         NOT NULL REFERENCES students (id) ON DELETE CASCADE,
  study_date date         NOT NULL,
  hours      numeric(3,1) NOT NULL CHECK (hours BETWEEN 0 AND 24 AND hours * 2 = trunc(hours * 2)),
  source     text         NOT NULL DEFAULT 'individual' CHECK (source IN ('individual', 'baseline')),
  created_at timestamptz  NOT NULL DEFAULT now(),
  updated_at timestamptz  NOT NULL DEFAULT now(),
  UNIQUE (student_id, study_date)
);

CREATE TABLE course_skill_ratings (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid        NOT NULL REFERENCES students (id) ON DELETE CASCADE,
  course_id  uuid        NOT NULL REFERENCES courses (id) ON DELETE CASCADE,
  rating     smallint    NOT NULL CHECK (rating BETWEEN 1 AND 5),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (student_id, course_id)
);

CREATE TABLE remaining_hours_reports (
  id              uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id   uuid         NOT NULL REFERENCES assignments (id) ON DELETE CASCADE,
  remaining_hours numeric(5,1) NOT NULL
                  CHECK (remaining_hours BETWEEN 0 AND 200 AND remaining_hours * 2 = trunc(remaining_hours * 2)),
  reported_at     timestamptz  NOT NULL DEFAULT now(),
  created_at      timestamptz  NOT NULL DEFAULT now()
);
CREATE INDEX remaining_hours_reports_latest_idx ON remaining_hours_reports (assignment_id, reported_at DESC);

CREATE TABLE allocation_overrides (
  id            uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid         NOT NULL REFERENCES assignments (id) ON DELETE CASCADE,
  study_date    date         NOT NULL,
  hours         numeric(5,1) NOT NULL CHECK (hours > 0 AND hours * 2 = trunc(hours * 2)),
  version       integer      NOT NULL DEFAULT 1,
  created_at    timestamptz  NOT NULL DEFAULT now(),
  updated_at    timestamptz  NOT NULL DEFAULT now(),
  UNIQUE (assignment_id, study_date)
);

CREATE TABLE subtasks (
  id            uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid         NOT NULL REFERENCES assignments (id) ON DELETE CASCADE,
  title         varchar(200) NOT NULL CHECK (title = btrim(title) AND char_length(title) >= 1),
  is_completed  boolean      NOT NULL DEFAULT false,
  position      integer      NOT NULL,
  version       integer      NOT NULL DEFAULT 1,
  created_at    timestamptz  NOT NULL DEFAULT now(),
  updated_at    timestamptz  NOT NULL DEFAULT now()
);
CREATE INDEX subtasks_assignment_position_idx ON subtasks (assignment_id, position);

-- student_id is repeated here so the database can enforce "one running timer per Student".
-- A paused timer does not block a new one (FR-16-AC8).
CREATE TABLE study_timer_sessions (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id       uuid        NOT NULL REFERENCES students (id) ON DELETE CASCADE,
  assignment_id    uuid        NOT NULL REFERENCES assignments (id) ON DELETE CASCADE,
  state            text        NOT NULL CHECK (state IN ('running', 'paused', 'stopped')),
  started_at       timestamptz NOT NULL DEFAULT now(),
  paused_at        timestamptz,
  paused_seconds   integer     NOT NULL DEFAULT 0 CHECK (paused_seconds >= 0),
  ended_at         timestamptz,
  duration_seconds integer     CHECK (duration_seconds IS NULL OR duration_seconds >= 0),
  version          integer     NOT NULL DEFAULT 1,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  CHECK (state <> 'paused'  OR paused_at IS NOT NULL),
  CHECK (state <> 'stopped' OR (ended_at IS NOT NULL AND duration_seconds IS NOT NULL))
);
CREATE UNIQUE INDEX one_running_timer_per_student ON study_timer_sessions (student_id) WHERE state = 'running';
CREATE INDEX study_timer_sessions_assignment_idx ON study_timer_sessions (assignment_id);

-- S-19 reserve.
CREATE TABLE weekly_availability_baselines (
  id              uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id      uuid         NOT NULL UNIQUE REFERENCES students (id) ON DELETE CASCADE,
  monday_hours    numeric(3,1) CHECK (monday_hours    BETWEEN 0 AND 24 AND monday_hours    * 2 = trunc(monday_hours    * 2)),
  tuesday_hours   numeric(3,1) CHECK (tuesday_hours   BETWEEN 0 AND 24 AND tuesday_hours   * 2 = trunc(tuesday_hours   * 2)),
  wednesday_hours numeric(3,1) CHECK (wednesday_hours BETWEEN 0 AND 24 AND wednesday_hours * 2 = trunc(wednesday_hours * 2)),
  thursday_hours  numeric(3,1) CHECK (thursday_hours  BETWEEN 0 AND 24 AND thursday_hours  * 2 = trunc(thursday_hours  * 2)),
  friday_hours    numeric(3,1) CHECK (friday_hours    BETWEEN 0 AND 24 AND friday_hours    * 2 = trunc(friday_hours    * 2)),
  saturday_hours  numeric(3,1) CHECK (saturday_hours  BETWEEN 0 AND 24 AND saturday_hours  * 2 = trunc(saturday_hours  * 2)),
  sunday_hours    numeric(3,1) CHECK (sunday_hours    BETWEEN 0 AND 24 AND sunday_hours    * 2 = trunc(sunday_hours    * 2)),
  confirmed_at    timestamptz  NOT NULL,
  created_at      timestamptz  NOT NULL DEFAULT now(),
  updated_at      timestamptz  NOT NULL DEFAULT now()
);
