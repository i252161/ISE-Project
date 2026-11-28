import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { closePool, getPool, runMigrations, sessions } from '../index';
import { DEMO_STUDENT_ID } from './demo-student';
import { addDays, getKarachiToday } from './sample-data';
import { seedSampleData } from './seed-sample';

const pool = () => getPool();

describe('E-04 sample data seed (real PostgreSQL)', () => {
  beforeAll(async () => {
    await runMigrations(pool());
  });

  afterAll(async () => {
    await closePool();
  });

  it('E-04-T1 seeds expected counts (>=50 assignments, 5 courses, 4 ratings, plus child tables)', async () => {
    await seedSampleData(pool());

    const counts = await pool().query<{
      courses: number;
      ratings: number;
      assignments: number;
      reports: number;
      availability: number;
      subtasks: number;
      overrides: number;
      timers: number;
      baselines: number;
    }>(
      `SELECT
        (SELECT count(*)::int FROM courses WHERE student_id = $1) AS courses,
        (SELECT count(*)::int FROM course_skill_ratings WHERE student_id = $1) AS ratings,
        (SELECT count(*)::int FROM assignments WHERE student_id = $1) AS assignments,
        (SELECT count(*)::int FROM remaining_hours_reports r JOIN assignments a ON a.id = r.assignment_id WHERE a.student_id = $1) AS reports,
        (SELECT count(*)::int FROM study_availability WHERE student_id = $1) AS availability,
        (SELECT count(*)::int FROM subtasks s JOIN assignments a ON a.id = s.assignment_id WHERE a.student_id = $1) AS subtasks,
        (SELECT count(*)::int FROM allocation_overrides o JOIN assignments a ON a.id = o.assignment_id WHERE a.student_id = $1) AS overrides,
        (SELECT count(*)::int FROM study_timer_sessions WHERE student_id = $1) AS timers,
        (SELECT count(*)::int FROM weekly_availability_baselines WHERE student_id = $1) AS baselines`,
      [DEMO_STUDENT_ID]
    );

    const row = counts.rows[0];
    expect(row.courses).toBe(5);
    expect(row.ratings).toBe(4);
    expect(row.assignments).toBeGreaterThanOrEqual(50);
    expect(row.assignments).toBe(54);
    expect(row.reports).toBeGreaterThanOrEqual(20);
    expect(row.availability).toBe(10);
    expect(row.subtasks).toBeGreaterThanOrEqual(5);
    expect(row.overrides).toBeGreaterThanOrEqual(1);
    expect(row.timers).toBeGreaterThanOrEqual(1);
    expect(row.baselines).toBe(0);
  });

  it('E-04-T2 is idempotent: running twice yields identical counts, no duplicates, and stable IDs', async () => {
    await seedSampleData(pool());
    const firstAssignments = await pool().query<{ id: string }>(
      'SELECT id FROM assignments WHERE student_id = $1 ORDER BY id',
      [DEMO_STUDENT_ID]
    );
    const firstCourses = await pool().query<{ id: string }>(
      'SELECT id FROM courses WHERE student_id = $1 ORDER BY id',
      [DEMO_STUDENT_ID]
    );

    await seedSampleData(pool());
    const secondAssignments = await pool().query<{ id: string }>(
      'SELECT id FROM assignments WHERE student_id = $1 ORDER BY id',
      [DEMO_STUDENT_ID]
    );
    const secondCourses = await pool().query<{ id: string }>(
      'SELECT id FROM courses WHERE student_id = $1 ORDER BY id',
      [DEMO_STUDENT_ID]
    );

    expect(secondAssignments.rows).toEqual(firstAssignments.rows);
    expect(secondCourses.rows).toEqual(firstCourses.rows);

    const dupes = await pool().query<{ count: number }>(
      `SELECT count(*)::int AS count FROM (
         SELECT course_id, title FROM assignments WHERE student_id = $1
         GROUP BY course_id, title HAVING count(*) > 1
       ) d`,
      [DEMO_STUDENT_ID]
    );
    expect(dupes.rows[0].count).toBe(0);
  });

  it('E-04-T3 preserves demo Student row and existing app_sessions across reseed', async () => {
    await seedSampleData(pool());
    const studentBefore = await pool().query(
      'SELECT id, display_name, time_zone, is_sample, created_at FROM students WHERE id = $1',
      [DEMO_STUDENT_ID]
    );
    const issued = await sessions.issue(DEMO_STUDENT_ID);

    await seedSampleData(pool());

    const studentAfter = await pool().query(
      'SELECT id, display_name, time_zone, is_sample, created_at FROM students WHERE id = $1',
      [DEMO_STUDENT_ID]
    );
    expect(studentAfter.rows[0]).toEqual(studentBefore.rows[0]);

    const validated = await sessions.validate(issued.sessionId);
    expect(validated?.studentId).toBe(DEMO_STUDENT_ID);
  });

  it('E-04-T4 covers undated, student-only, due-today, same-deadline pair, past-deadline, statuses, and Lab 3 search', async () => {
    await seedSampleData(pool());
    const today = getKarachiToday();

    const undated = await pool().query<{ n: number }>(
      'SELECT count(*)::int AS n FROM assignments WHERE student_id = $1 AND official_deadline IS NULL AND student_deadline IS NULL',
      [DEMO_STUDENT_ID]
    );
    expect(undated.rows[0].n).toBe(6);

    const studentOnly = await pool().query<{ n: number }>(
      'SELECT count(*)::int AS n FROM assignments WHERE student_id = $1 AND official_deadline IS NULL AND student_deadline >= $2::date',
      [DEMO_STUDENT_ID, today]
    );
    expect(studentOnly.rows[0].n).toBe(2);

    const dueToday = await pool().query<{ n: number }>(
      'SELECT count(*)::int AS n FROM assignments WHERE student_id = $1 AND COALESCE(official_deadline, student_deadline) = $2::date',
      [DEMO_STUDENT_ID, today]
    );
    expect(dueToday.rows[0].n).toBe(1);

    const sameDeadline = await pool().query<{ course_id: string }>(
      'SELECT DISTINCT course_id FROM assignments WHERE student_id = $1 AND official_deadline = $2::date',
      [DEMO_STUDENT_ID, addDays(today, 3)]
    );
    expect(sameDeadline.rows.length).toBe(2);

    const past = await pool().query<{ n: number }>(
      'SELECT count(*)::int AS n FROM assignments WHERE student_id = $1 AND official_deadline < $2::date',
      [DEMO_STUDENT_ID, today]
    );
    expect(past.rows[0].n).toBe(4);

    const statuses = await pool().query<{ status: string }>(
      'SELECT DISTINCT status FROM assignments WHERE student_id = $1',
      [DEMO_STUDENT_ID]
    );
    expect(statuses.rows.map((r) => r.status).sort()).toEqual(['already_started', 'finished', 'not_started']);

    const subStatuses = await pool().query<{ submission_status: string }>(
      'SELECT DISTINCT submission_status FROM assignments WHERE student_id = $1',
      [DEMO_STUDENT_ID]
    );
    expect(subStatuses.rows.map((r) => r.submission_status).sort()).toEqual([
      'not_submitted',
      'submitted',
      'unavailable'
    ]);

    const lab3 = await pool().query<{ title: string }>(
      "SELECT title FROM assignments WHERE student_id = $1 AND title ILIKE '%lab 3%'",
      [DEMO_STUDENT_ID]
    );
    expect(lab3.rows.length).toBe(2);
  });

  it('E-04-T5 marks all courses/assignments as sample, has blank & 0 availability, 1 unrated course, and 9-day inactive Math', async () => {
    await seedSampleData(pool());
    const today = getKarachiToday();

    const nonSampleCourses = await pool().query<{ n: number }>(
      'SELECT count(*)::int AS n FROM courses WHERE student_id = $1 AND is_sample = false',
      [DEMO_STUDENT_ID]
    );
    expect(nonSampleCourses.rows[0].n).toBe(0);

    const nonSampleAssignments = await pool().query<{ n: number }>(
      'SELECT count(*)::int AS n FROM assignments WHERE student_id = $1 AND is_sample = false',
      [DEMO_STUDENT_ID]
    );
    expect(nonSampleAssignments.rows[0].n).toBe(0);

    const zeroAvail = await pool().query<{ n: number }>(
      'SELECT count(*)::int AS n FROM study_availability WHERE student_id = $1 AND hours = 0',
      [DEMO_STUDENT_ID]
    );
    expect(zeroAvail.rows[0].n).toBe(1);

    const next7Avail = await pool().query<{ n: number }>(
      'SELECT count(*)::int AS n FROM study_availability WHERE student_id = $1 AND study_date BETWEEN $2::date AND $3::date',
      [DEMO_STUDENT_ID, today, addDays(today, 6)]
    );
    expect(next7Avail.rows[0].n).toBeLessThanOrEqual(5); // at least 2 blank in next 7 days

    const unrated = await pool().query<{ name: string }>(
      `SELECT c.name FROM courses c
       LEFT JOIN course_skill_ratings r ON r.course_id = c.id
       WHERE c.student_id = $1 AND r.id IS NULL`,
      [DEMO_STUDENT_ID]
    );
    expect(unrated.rows.map((r) => r.name)).toEqual(['English Composition']);

    const mathInactive = await pool().query<{ max_days: number; min_days: number }>(
      `SELECT
         min((($2::date) - (a.last_activity_at AT TIME ZONE 'Asia/Karachi')::date))::int AS min_days,
         max((($2::date) - (a.last_activity_at AT TIME ZONE 'Asia/Karachi')::date))::int AS max_days
       FROM assignments a
       JOIN courses c ON c.id = a.course_id
       WHERE a.student_id = $1 AND c.name = 'Mathematics'`,
      [DEMO_STUDENT_ID, today]
    );
    expect(mathInactive.rows[0]).toEqual({ min_days: 9, max_days: 9 });

    const nonStoppedTimers = await pool().query<{ n: number }>(
      "SELECT count(*)::int AS n FROM study_timer_sessions WHERE student_id = $1 AND state <> 'stopped'",
      [DEMO_STUDENT_ID]
    );
    expect(nonStoppedTimers.rows[0].n).toBe(0);
  });
});
