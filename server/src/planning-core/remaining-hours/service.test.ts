import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { closePool, getPool, runMigrations } from '../../data-access/index';
import { recalculateStudentPlan } from '../recalculate';
import { validateRemainingHoursBody, submitRemainingHours } from './service';

// ---------------------------------------------------------------------------
// Unit tests: validateRemainingHoursBody (no database)
// ---------------------------------------------------------------------------
describe('S-07 validateRemainingHoursBody (unit)', () => {
  it('BVA: rejects -0.5', () => {
    expect(validateRemainingHoursBody({ remainingHours: -0.5 }).ok).toBe(false);
  });

  it('BVA: accepts 0', () => {
    const r = validateRemainingHoursBody({ remainingHours: 0 });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.remainingHours).toBe(0);
  });

  it('BVA: accepts 0.5', () => {
    const r = validateRemainingHoursBody({ remainingHours: 0.5 });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.remainingHours).toBe(0.5);
  });

  it('BVA: accepts 199.5', () => {
    const r = validateRemainingHoursBody({ remainingHours: 199.5 });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.remainingHours).toBe(199.5);
  });

  it('BVA: accepts 200', () => {
    const r = validateRemainingHoursBody({ remainingHours: 200 });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.remainingHours).toBe(200);
  });

  it('BVA: rejects 200.5', () => {
    expect(validateRemainingHoursBody({ remainingHours: 200.5 }).ok).toBe(false);
  });

  it('rejects 1.25 (not a 0.5 step)', () => {
    expect(validateRemainingHoursBody({ remainingHours: 1.25 }).ok).toBe(false);
  });

  it('rejects a text value', () => {
    expect(validateRemainingHoursBody({ remainingHours: 'five' }).ok).toBe(false);
  });

  it('rejects a missing value (undefined)', () => {
    expect(validateRemainingHoursBody({}).ok).toBe(false);
  });

  it('rejects null', () => {
    expect(validateRemainingHoursBody({ remainingHours: null }).ok).toBe(false);
  });

  it('error contains VALIDATION_ERROR code', () => {
    const r = validateRemainingHoursBody({ remainingHours: -1 });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe('VALIDATION_ERROR');
  });
});

// ---------------------------------------------------------------------------
// Integration tests: submitRemainingHours against real embedded PostgreSQL
// ---------------------------------------------------------------------------
describe('S-07 submitRemainingHours (integration, real PostgreSQL)', () => {
  const MIGRATIONS_DIR = path.resolve(__dirname, '../../data-access/migrations');

  let studentId: string;
  let otherStudentId: string;
  let courseId: string;
  let assignmentId: string; // has a deadline 3 days from now

  beforeAll(async () => {
    const pool = getPool();
    await runMigrations(pool, MIGRATIONS_DIR);

    studentId = randomUUID();
    otherStudentId = randomUUID();
    courseId = randomUUID();
    assignmentId = randomUUID();

    // Create two students
    await pool.query(
      `INSERT INTO students (id, display_name, time_zone, is_sample) VALUES
         ($1, 'S-07 Test Student', 'Asia/Karachi', false),
         ($2, 'S-07 Other Student', 'Asia/Karachi', false)`,
      [studentId, otherStudentId]
    );
    // Course belongs to studentId
    await pool.query(
      `INSERT INTO courses (id, student_id, name, is_sample) VALUES ($1, $2, 'Test Course', false)`,
      [courseId, studentId]
    );
    // Assignment due in 3 days with 6 h effort, 2 h availability today + tomorrow
    await pool.query(
      `INSERT INTO assignments
         (id, student_id, course_id, title, official_deadline, effort_hours, effort_updated_at, status, submission_status, is_sample)
       VALUES
         ($1, $2, $3, 'S-07 Assignment',
          (now() AT TIME ZONE 'Asia/Karachi')::date + 3,
          6, now() - interval '2 days',
          'not_started', 'not_submitted', false)`,
      [assignmentId, studentId, courseId]
    );
    await pool.query(
      `INSERT INTO study_availability (student_id, study_date, hours, source) VALUES
         ($1, (now() AT TIME ZONE 'Asia/Karachi')::date,     2, 'individual'),
         ($1, (now() AT TIME ZONE 'Asia/Karachi')::date + 1, 2, 'individual'),
         ($1, (now() AT TIME ZONE 'Asia/Karachi')::date + 2, 2, 'individual')`,
      [studentId]
    );
  });

  afterAll(async () => {
    await getPool().query('DELETE FROM students WHERE id = ANY($1)', [[studentId, otherStudentId]]);
    await closePool();
  });

  // ---- another Student's assignment → 404, no row created ----
  it('returns not_found for another Student\'s assignment, and creates no report row', async () => {
    const before = await getPool().query(
      'SELECT COUNT(*) AS n FROM remaining_hours_reports WHERE assignment_id = $1',
      [assignmentId]
    );

    const result = await submitRemainingHours({
      studentId: otherStudentId, // wrong owner
      assignmentId,
      body: { remainingHours: 3 },
      recalculate: recalculateStudentPlan
    });

    const after = await getPool().query(
      'SELECT COUNT(*) AS n FROM remaining_hours_reports WHERE assignment_id = $1',
      [assignmentId]
    );

    expect(result.kind).toBe('not_found');
    expect(Number(after.rows[0]!.n)).toBe(Number(before.rows[0]!.n));
  });

  // ---- 0 remaining → no_remaining_effort, status unchanged ----
  it('0 remaining → no_remaining_effort state, assignment status unchanged', async () => {
    const result = await submitRemainingHours({
      studentId,
      assignmentId,
      body: { remainingHours: 0 },
      recalculate: recalculateStudentPlan
    });

    expect(result.kind).toBe('ok');
    if (result.kind !== 'ok') return;

    expect(result.report.remainingHours).toBe(0);
    expect(result.planning.state).toBe('no_remaining_effort');

    // Status must still be not_started
    const row = await getPool().query<{ status: string }>(
      'SELECT status FROM assignments WHERE id = $1',
      [assignmentId]
    );
    expect(row.rows[0]!.status).toBe('not_started');
  });

  // ---- last_activity_at set, version unchanged ----
  it('sets last_activity_at and does NOT change version', async () => {
    const before = await getPool().query<{ version: number; last_activity_at: Date | null }>(
      'SELECT version, last_activity_at FROM assignments WHERE id = $1',
      [assignmentId]
    );

    const result = await submitRemainingHours({
      studentId,
      assignmentId,
      body: { remainingHours: 3 },
      recalculate: recalculateStudentPlan
    });

    const after = await getPool().query<{ version: number; last_activity_at: Date | null }>(
      'SELECT version, last_activity_at FROM assignments WHERE id = $1',
      [assignmentId]
    );

    expect(result.kind).toBe('ok');
    expect(after.rows[0]!.version).toBe(before.rows[0]!.version); // version unchanged
    expect(after.rows[0]!.last_activity_at).not.toBeNull();       // activity recorded
  });

  // ---- older report inserted later does not replace newer one ----
  it('an older report inserted later (reported_at set directly) does not replace the newer one', async () => {
    const pool = getPool();
    // Insert a "new" report now
    const newerResult = await submitRemainingHours({
      studentId,
      assignmentId,
      body: { remainingHours: 4 },
      recalculate: recalculateStudentPlan
    });
    expect(newerResult.kind).toBe('ok');

    // Now directly insert an "older" report with reported_at in the past
    await pool.query(
      `INSERT INTO remaining_hours_reports (assignment_id, remaining_hours, reported_at)
       VALUES ($1, 10, now() - interval '1 day')`,
      [assignmentId]
    );

    // Plan must still use 4 h (the newer report), not 10 h
    const plan = await recalculateStudentPlan(studentId);
    const asgn = plan?.assignments.find((a) => a.assignmentId === assignmentId);
    expect(asgn?.effectiveEffortHours).toBe(4);
  });

  // ---- DL-50 example ----
  it('DL-50: effort 6 h on Monday, report 4 h on Tuesday → uses 4 h; effort 5 h on Wednesday → uses 5 h', async () => {
    const pool = getPool();
    // Fresh assignment for this test
    const aId = randomUUID();
    await pool.query(
      `INSERT INTO assignments
         (id, student_id, course_id, title, official_deadline, effort_hours, effort_updated_at, status, submission_status, is_sample)
       VALUES
         ($1, $2, $3, 'DL-50 Test',
          (now() AT TIME ZONE 'Asia/Karachi')::date + 3,
          6,
          now() - interval '2 days', -- "Monday"
          'not_started', 'not_submitted', false)`,
      [aId, studentId, courseId]
    );

    // Insert report with reported_at = "Tuesday" (1 day after effort_updated_at)
    await pool.query(
      `INSERT INTO remaining_hours_reports (assignment_id, remaining_hours, reported_at)
       VALUES ($1, 4, now() - interval '1 day')`,
      [aId]
    );

    // Check plan → should use 4 h (report is newer than effort)
    const plan1 = await recalculateStudentPlan(studentId);
    const asgn1 = plan1?.assignments.find((a) => a.assignmentId === aId);
    expect(asgn1?.effectiveEffortHours).toBe(4);

    // Now "edit effort to 5 h on Wednesday" (now() is after the report)
    await pool.query(
      `UPDATE assignments SET effort_hours = 5, effort_updated_at = now() WHERE id = $1`,
      [aId]
    );

    // Check plan → should use 5 h (effort is now newer)
    const plan2 = await recalculateStudentPlan(studentId);
    const asgn2 = plan2?.assignments.find((a) => a.assignmentId === aId);
    expect(asgn2?.effectiveEffortHours).toBe(5);
  });

  // ---- remaining hours that don't fit → shortage ----
  it('remaining hours that don\'t fit before the deadline → shortage', async () => {
    const pool = getPool();
    // Fresh assignment due in 2 days, only 2 h availability each day
    const aId = randomUUID();
    await pool.query(
      `INSERT INTO assignments
         (id, student_id, course_id, title, official_deadline, effort_hours, effort_updated_at, status, submission_status, is_sample)
       VALUES
         ($1, $2, $3, 'Shortage Test',
          (now() AT TIME ZONE 'Asia/Karachi')::date + 2,
          2, now() - interval '1 hour',
          'not_started', 'not_submitted', false)`,
      [aId, studentId, courseId]
    );

    // Report 10 h remaining → more than available
    const result = await submitRemainingHours({
      studentId,
      assignmentId: aId,
      body: { remainingHours: 10 },
      recalculate: recalculateStudentPlan
    });

    expect(result.kind).toBe('ok');
    if (result.kind !== 'ok') return;
    expect(result.planning.state).toBe('shortage');
    expect(result.planning.shortageHours).toBeGreaterThan(0);
  });
});
