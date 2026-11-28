import type { Pool, PoolClient } from 'pg';
import { DEMO_STUDENT_ID, seedDemoStudent } from './demo-student';
import { buildSampleData, todayInKarachi, type SampleDataset } from './sample-data';

export interface SeedSampleOptions {
  /** Whose sample rows to reload. Defaults to the demo Student (DL-27). */
  studentId?: string;
  /** Clock used to pick "today" in Asia/Karachi. Defaults to the real time. */
  now?: Date;
}

export interface SeedSampleResult {
  studentId: string;
  today: string;
  counts: Record<
    'courses' | 'ratings' | 'assignments' | 'availability' | 'reports' | 'subtasks' | 'timerSessions' | 'overrides',
    number
  >;
}

// Same idea as the migration lock: two reloads of one Student never interleave.
const SEED_LOCK_KEY = 2026112802;

/**
 * Reloads the sample rows of one Student in a single transaction (E-04, DL-28, DL-47).
 *
 * - Never deletes or re-creates the Student row: sessions reference it with ON DELETE CASCADE,
 *   so deleting it would log everyone out.
 * - Deletes only that Student's `is_sample` courses. The foreign keys cascade to their
 *   assignments, ratings, reports, overrides, subtasks and timer sessions.
 * - Availability has no sample marker, so only the dates sample data covers are reloaded
 *   (today to today + 13). Earlier and later entries are left alone.
 * - Safe to run again: ids are stable, so a second run on the same day gives identical rows.
 */
export async function seedSampleData(pool: Pool, options: SeedSampleOptions = {}): Promise<SeedSampleResult> {
  const studentId = options.studentId ?? DEMO_STUDENT_ID;
  const today = todayInKarachi(options.now ?? new Date());
  if (studentId === DEMO_STUDENT_ID) {
    await seedDemoStudent(pool);
  }
  const data = buildSampleData(studentId, today);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_xact_lock($1, hashtext($2))', [SEED_LOCK_KEY, studentId]);

    const student = await client.query('SELECT 1 FROM students WHERE id = $1', [studentId]);
    if (student.rowCount !== 1) {
      throw new Error(`Student ${studentId} does not exist; sample data is loaded only for an existing Student.`);
    }

    await client.query('DELETE FROM courses WHERE student_id = $1 AND is_sample', [studentId]);
    await client.query(
      'DELETE FROM study_availability WHERE student_id = $1 AND study_date BETWEEN $2::date AND $3::date',
      [studentId, data.today, data.availabilityTo]
    );
    await insertAll(client, data);

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }

  return {
    studentId,
    today,
    counts: {
      courses: data.courses.length,
      ratings: data.ratings.length,
      assignments: data.assignments.length,
      availability: data.availability.length,
      reports: data.reports.length,
      subtasks: data.subtasks.length,
      timerSessions: data.timerSessions.length,
      overrides: data.overrides.length
    }
  };
}

/** One INSERT per table: the rows travel as one JSON array and are expanded by PostgreSQL. */
async function insertAll(client: PoolClient, data: SampleDataset): Promise<void> {
  const sid = data.studentId;

  await client.query(
    `INSERT INTO courses (id, student_id, name, code, is_sample)
     SELECT x.id, $2, x.name, x.code, true
       FROM jsonb_to_recordset($1::jsonb) AS x(id uuid, name text, code text)`,
    [JSON.stringify(data.courses), sid]
  );

  await client.query(
    `INSERT INTO course_skill_ratings (id, student_id, course_id, rating)
     SELECT x.id, $2, x."courseId", x.rating
       FROM jsonb_to_recordset($1::jsonb) AS x(id uuid, "courseId" uuid, rating smallint)`,
    [JSON.stringify(data.ratings), sid]
  );

  await client.query(
    `INSERT INTO assignments (
       id, student_id, course_id, title, description, official_deadline, student_deadline,
       status, submission_status, effort_hours, effort_updated_at, last_activity_at, is_sample
     )
     SELECT x.id, $2, x."courseId", x.title, x.description, x."officialDeadline", x."studentDeadline",
            x.status, x."submissionStatus", x."effortHours", x."effortUpdatedAt", x."lastActivityAt", true
       FROM jsonb_to_recordset($1::jsonb) AS x(
         id uuid, "courseId" uuid, title text, description text,
         "officialDeadline" date, "studentDeadline" date, status text, "submissionStatus" text,
         "effortHours" numeric, "effortUpdatedAt" timestamptz, "lastActivityAt" timestamptz
       )`,
    [JSON.stringify(data.assignments), sid]
  );

  await client.query(
    `INSERT INTO study_availability (id, student_id, study_date, hours, source)
     SELECT x.id, $2, x."studyDate", x.hours, 'individual'
       FROM jsonb_to_recordset($1::jsonb) AS x(id uuid, "studyDate" date, hours numeric)`,
    [JSON.stringify(data.availability), sid]
  );

  await client.query(
    `INSERT INTO remaining_hours_reports (id, assignment_id, remaining_hours, reported_at, created_at)
     SELECT x.id, x."assignmentId", x."remainingHours", x."reportedAt", x."reportedAt"
       FROM jsonb_to_recordset($1::jsonb) AS x(id uuid, "assignmentId" uuid, "remainingHours" numeric, "reportedAt" timestamptz)`,
    [JSON.stringify(data.reports)]
  );

  await client.query(
    `INSERT INTO subtasks (id, assignment_id, title, is_completed, position)
     SELECT x.id, x."assignmentId", x.title, x."isCompleted", x.position
       FROM jsonb_to_recordset($1::jsonb) AS x(id uuid, "assignmentId" uuid, title text, "isCompleted" boolean, position integer)`,
    [JSON.stringify(data.subtasks)]
  );

  await client.query(
    `INSERT INTO study_timer_sessions (
       id, student_id, assignment_id, state, started_at, paused_seconds, ended_at, duration_seconds
     )
     SELECT x.id, $2, x."assignmentId", 'stopped', x."startedAt", x."pausedSeconds", x."endedAt", x."durationSeconds"
       FROM jsonb_to_recordset($1::jsonb) AS x(
         id uuid, "assignmentId" uuid, "startedAt" timestamptz, "pausedSeconds" integer,
         "endedAt" timestamptz, "durationSeconds" integer
       )`,
    [JSON.stringify(data.timerSessions), sid]
  );

  await client.query(
    `INSERT INTO allocation_overrides (id, assignment_id, study_date, hours)
     SELECT x.id, x."assignmentId", x."studyDate", x.hours
       FROM jsonb_to_recordset($1::jsonb) AS x(id uuid, "assignmentId" uuid, "studyDate" date, hours numeric)`,
    [JSON.stringify(data.overrides)]
  );
}
