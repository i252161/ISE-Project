import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { closePool, getPool, runMigrations } from './index';

const pool = () => getPool();

async function migrate(): Promise<void> {
  // runMigrations holds an advisory lock, so parallel test files are safe without retries.
  await runMigrations(pool());
}

async function newStudent(): Promise<string> {
  const r = await pool().query<{ id: string }>(
    "INSERT INTO students (display_name, time_zone) VALUES ($1, 'Asia/Karachi') RETURNING id",
    [`E-03 test ${randomUUID()}`]
  );
  return (r.rows[0] as { id: string }).id;
}

async function newCourse(studentId: string): Promise<string> {
  const r = await pool().query<{ id: string }>(
    'INSERT INTO courses (student_id, name) VALUES ($1, $2) RETURNING id',
    [studentId, `Course ${randomUUID()}`]
  );
  return (r.rows[0] as { id: string }).id;
}

async function newAssignment(studentId: string, courseId: string): Promise<string> {
  const r = await pool().query<{ id: string }>(
    "INSERT INTO assignments (student_id, course_id, title) VALUES ($1, $2, 'Lab 3') RETURNING id",
    [studentId, courseId]
  );
  return (r.rows[0] as { id: string }).id;
}

async function ctx() {
  const studentId = await newStudent();
  const courseId = await newCourse(studentId);
  const assignmentId = await newAssignment(studentId, courseId);
  return { studentId, courseId, assignmentId };
}

describe('E-03 foundation migration 0001 (real PostgreSQL)', () => {
  beforeAll(async () => {
    await migrate();
  });
  afterAll(async () => {
    await closePool();
  });

  it('E-03-T1 creates every table in the data model', async () => {
    const expected = [
      'students', 'courses', 'assignments', 'study_availability', 'course_skill_ratings',
      'remaining_hours_reports', 'allocation_overrides', 'subtasks', 'study_timer_sessions',
      'weekly_availability_baselines'
    ];
    const r = await pool().query<{ table_name: string }>(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
    );
    const found = r.rows.map((row) => row.table_name);
    for (const name of expected) expect(found).toContain(name);
  });

  it('E-03-T2 availability: accepts 0, 0.5, 24; rejects -0.5, 24.5, 1.25; one row per day', async () => {
    const { studentId } = await ctx();
    const insert = (day: string, hours: number) =>
      pool().query('INSERT INTO study_availability (student_id, study_date, hours) VALUES ($1, $2, $3)', [studentId, day, hours]);
    await insert('2026-12-01', 0);
    await insert('2026-12-02', 0.5);
    await insert('2026-12-03', 24);
    await expect(insert('2026-12-04', -0.5)).rejects.toThrow();
    await expect(insert('2026-12-05', 24.5)).rejects.toThrow();
    await expect(insert('2026-12-06', 1.25)).rejects.toThrow();
    await expect(insert('2026-12-01', 2)).rejects.toThrow(); // duplicate day
  });

  it('E-03-T3 ratings: accepts 1 and 5; rejects 0 and 6; one rating per course', async () => {
    const { studentId, courseId } = await ctx();
    const insert = (course: string, rating: number) =>
      pool().query('INSERT INTO course_skill_ratings (student_id, course_id, rating) VALUES ($1, $2, $3)', [studentId, course, rating]);
    await insert(courseId, 1);
    await expect(insert(courseId, 5)).rejects.toThrow(); // duplicate
    const c2 = await newCourse(studentId);
    await insert(c2, 5);
    const c3 = await newCourse(studentId);
    await expect(insert(c3, 0)).rejects.toThrow();
    await expect(insert(c3, 6)).rejects.toThrow();
  });

  it('E-03-T4 effort: rejects 0 and 200.5; accepts blank, 0.5 and 200', async () => {
    const { assignmentId } = await ctx();
    const set = (value: number | null) =>
      pool().query('UPDATE assignments SET effort_hours = $1 WHERE id = $2', [value, assignmentId]);
    await set(null);
    await set(0.5);
    await set(200);
    await expect(set(0)).rejects.toThrow();
    await expect(set(200.5)).rejects.toThrow();
  });

  it('E-03-T5 remaining hours: accepts 0 and 200; rejects -0.5 and 200.5', async () => {
    const { assignmentId } = await ctx();
    const add = (hours: number) =>
      pool().query('INSERT INTO remaining_hours_reports (assignment_id, remaining_hours) VALUES ($1, $2)', [assignmentId, hours]);
    await add(0);
    await add(200);
    await expect(add(-0.5)).rejects.toThrow();
    await expect(add(200.5)).rejects.toThrow();
  });

  it('E-03-T6 assignment defaults and status values', async () => {
    const { assignmentId } = await ctx();
    const r = await pool().query('SELECT status, submission_status, version, is_sample FROM assignments WHERE id = $1', [assignmentId]);
    expect(r.rows[0]).toEqual({ status: 'not_started', submission_status: 'unavailable', version: 1, is_sample: false });
    await pool().query("UPDATE assignments SET status = 'already_started' WHERE id = $1", [assignmentId]);
    await expect(pool().query("UPDATE assignments SET status = 'Not Started' WHERE id = $1", [assignmentId])).rejects.toThrow();
    await expect(pool().query("UPDATE assignments SET submission_status = 'done' WHERE id = $1", [assignmentId])).rejects.toThrow();
  });

  it('E-03-T7 an assignment may have no deadline (S-10)', async () => {
    const { assignmentId } = await ctx();
    const r = await pool().query('SELECT official_deadline, student_deadline FROM assignments WHERE id = $1', [assignmentId]);
    expect(r.rows[0]).toEqual({ official_deadline: null, student_deadline: null });
  });

  it('E-03-T8 subtask title: rejects empty, untrimmed and 201 chars; accepts 1 and 200', async () => {
    const { assignmentId } = await ctx();
    const add = (title: string) =>
      pool().query('INSERT INTO subtasks (assignment_id, title, position) VALUES ($1, $2, 1)', [assignmentId, title]);
    await add('a');
    await add('x'.repeat(200));
    await expect(add('')).rejects.toThrow();
    await expect(add('  padded ')).rejects.toThrow();
    await expect(add('x'.repeat(201))).rejects.toThrow();
  });

  it('E-03-T9 allocation override: positive half-hour steps, one per day', async () => {
    const { assignmentId } = await ctx();
    const add = (day: string, hours: number) =>
      pool().query('INSERT INTO allocation_overrides (assignment_id, study_date, hours) VALUES ($1, $2, $3)', [assignmentId, day, hours]);
    await add('2026-12-01', 2);
    await expect(add('2026-12-02', 0)).rejects.toThrow();
    await expect(add('2026-12-03', 1.25)).rejects.toThrow();
    await expect(add('2026-12-01', 3)).rejects.toThrow();
  });

  it('E-03-T10 timer: one running per Student; paused allowed; 0-second stop saved', async () => {
    const { studentId, assignmentId } = await ctx();
    const a2 = await newAssignment(studentId, await newCourse(studentId));
    const start = (assignment: string) =>
      pool().query("INSERT INTO study_timer_sessions (student_id, assignment_id, state) VALUES ($1, $2, 'running')", [studentId, assignment]);
    await start(assignmentId);
    await expect(start(a2)).rejects.toThrow(); // FR-16-AC8
    await pool().query("UPDATE study_timer_sessions SET state = 'paused', paused_at = now() WHERE student_id = $1", [studentId]);
    await start(a2); // a paused timer does not block a new one
    await pool().query(
      "INSERT INTO study_timer_sessions (student_id, assignment_id, state, ended_at, duration_seconds) VALUES ($1, $2, 'stopped', now(), 0)",
      [studentId, assignmentId]
    );
    const zero = await pool().query('SELECT duration_seconds FROM study_timer_sessions WHERE state = $1 AND student_id = $2', ['stopped', studentId]);
    expect(zero.rows[0].duration_seconds).toBe(0);
  });

  it('E-03-T11 timer: stopped needs an end and a duration; paused needs paused_at', async () => {
    const { studentId, assignmentId } = await ctx();
    await expect(
      pool().query("INSERT INTO study_timer_sessions (student_id, assignment_id, state) VALUES ($1, $2, 'stopped')", [studentId, assignmentId])
    ).rejects.toThrow();
    await expect(
      pool().query("INSERT INTO study_timer_sessions (student_id, assignment_id, state) VALUES ($1, $2, 'paused')", [studentId, assignmentId])
    ).rejects.toThrow();
  });

  it('E-03-T12 weekly baseline: blank weekdays allowed, range enforced, one per Student', async () => {
    const { studentId } = await ctx();
    await pool().query('INSERT INTO weekly_availability_baselines (student_id, monday_hours, friday_hours, confirmed_at) VALUES ($1, 2, 0, now())', [studentId]);
    await expect(pool().query('INSERT INTO weekly_availability_baselines (student_id, confirmed_at) VALUES ($1, now())', [studentId])).rejects.toThrow();
    const s2 = await newStudent();
    await expect(pool().query('INSERT INTO weekly_availability_baselines (student_id, sunday_hours, confirmed_at) VALUES ($1, 24.5, now())', [s2])).rejects.toThrow();
  });

  it('E-03-T13 deleting an assignment removes its subtasks, overrides, reports and timer sessions (FR-13-AC3)', async () => {
    const { studentId, assignmentId } = await ctx();
    await pool().query("INSERT INTO subtasks (assignment_id, title, position) VALUES ($1, 'a', 1)", [assignmentId]);
    await pool().query("INSERT INTO allocation_overrides (assignment_id, study_date, hours) VALUES ($1, '2026-12-01', 1)", [assignmentId]);
    await pool().query('INSERT INTO remaining_hours_reports (assignment_id, remaining_hours) VALUES ($1, 1)', [assignmentId]);
    await pool().query("INSERT INTO study_timer_sessions (student_id, assignment_id, state, ended_at, duration_seconds) VALUES ($1, $2, 'stopped', now(), 5)", [studentId, assignmentId]);
    await pool().query('DELETE FROM assignments WHERE id = $1', [assignmentId]);
    for (const table of ['subtasks', 'allocation_overrides', 'remaining_hours_reports', 'study_timer_sessions']) {
      const r = await pool().query(`SELECT count(*)::int AS n FROM ${table} WHERE assignment_id = $1`, [assignmentId]);
      expect(r.rows[0].n).toBe(0);
    }
  });

  it('E-03-T14 five concurrent migration runs succeed and apply nothing twice', async () => {
    const results = await Promise.all(Array.from({ length: 5 }, () => runMigrations(pool())));
    expect(results.flat()).toEqual([]);
    const dupes = await pool().query(
      'SELECT filename FROM schema_migrations GROUP BY filename HAVING count(*) > 1'
    );
    expect(dupes.rowCount).toBe(0);
  });
});
