import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { closePool, getPool, runMigrations, sessions } from '../index';
import { DEMO_STUDENT_ID } from './demo-student';
import { seedSampleData } from './load-sample-data';
import { addDays, buildSampleData } from './sample-data';

// E-04 acceptance checks. Database tests use a FRESH Student each time: the demo Student's sample
// data is loaded once in test-setup.ts and other test files read it in parallel.

const TODAY = '2026-12-07';
const NOW = new Date('2026-12-07T07:00:00Z'); // 12:00 Karachi
const data = buildSampleData('00000000-0000-4000-8000-0000000000aa', TODAY);
const pool = () => getPool();

async function newStudent(): Promise<string> {
  const r = await pool().query<{ id: string }>(
    "INSERT INTO students (display_name, time_zone, is_sample) VALUES ($1, 'Asia/Karachi', true) RETURNING id",
    [`E-04 test ${randomUUID()}`]
  );
  return r.rows[0]!.id;
}

/** Every sample row of one Student, without the created_at / updated_at bookkeeping. */
async function snapshot(studentId: string) {
  const q = async (sql: string) => (await pool().query(sql, [studentId])).rows;
  return {
    courses: await q('SELECT id, name, code, is_sample FROM courses WHERE student_id = $1 ORDER BY id'),
    ratings: await q('SELECT id, course_id, rating FROM course_skill_ratings WHERE student_id = $1 ORDER BY id'),
    assignments: await q(
      `SELECT id, course_id, title, description, official_deadline::text, student_deadline::text, status,
              submission_status, effort_hours::text, effort_updated_at, last_activity_at, is_sample, version
         FROM assignments WHERE student_id = $1 ORDER BY id`
    ),
    availability: await q('SELECT id, study_date::text, hours::text, source FROM study_availability WHERE student_id = $1 ORDER BY study_date'),
    reports: await q(
      `SELECT r.id, r.assignment_id, r.remaining_hours::text, r.reported_at
         FROM remaining_hours_reports r JOIN assignments a ON a.id = r.assignment_id WHERE a.student_id = $1 ORDER BY r.id`
    ),
    subtasks: await q(
      `SELECT s.id, s.assignment_id, s.title, s.is_completed, s.position
         FROM subtasks s JOIN assignments a ON a.id = s.assignment_id WHERE a.student_id = $1 ORDER BY s.id`
    ),
    timers: await q(
      `SELECT id, assignment_id, state, started_at, ended_at, paused_seconds, duration_seconds
         FROM study_timer_sessions WHERE student_id = $1 ORDER BY id`
    ),
    overrides: await q(
      `SELECT o.id, o.assignment_id, o.study_date::text, o.hours::text
         FROM allocation_overrides o JOIN assignments a ON a.id = o.assignment_id WHERE a.student_id = $1 ORDER BY o.id`
    )
  };
}

describe('E-04 sample data: the dataset (pure)', () => {
  it('E-04-AC2 has at least 50 assignments across exactly 5 courses, every course used', () => {
    expect(data.assignments.length).toBeGreaterThanOrEqual(50);
    expect(data.courses).toHaveLength(5);
    for (const c of data.courses) {
      expect(data.assignments.some((a) => a.courseId === c.id)).toBe(true);
    }
  });

  it('E-04-AC3 has undated assignments, a Student-only deadline, and both deadlines on one', () => {
    const undated = data.assignments.filter((a) => a.officialDeadline === null && a.studentDeadline === null);
    expect(undated.length).toBeGreaterThanOrEqual(3);
    expect(data.assignments.some((a) => a.officialDeadline === null && a.studentDeadline !== null)).toBe(true);
    expect(data.assignments.some((a) => a.officialDeadline !== null && a.studentDeadline !== null)).toBe(true);
    for (const a of data.assignments) {
      if (a.studentDeadline !== null) expect(a.studentDeadline >= TODAY).toBe(true); // S-10 rule
    }
  });

  it('E-04-AC4 has every status and every submission status, including combinations that disagree', () => {
    const statuses = new Set(data.assignments.map((a) => a.status));
    const submissions = new Set(data.assignments.map((a) => a.submissionStatus));
    expect([...statuses].sort()).toEqual(['already_started', 'finished', 'not_started']);
    expect([...submissions].sort()).toEqual(['not_submitted', 'submitted', 'unavailable']);
    expect(data.assignments.some((a) => a.status === 'finished' && a.submissionStatus === 'not_submitted')).toBe(true);
    expect(data.assignments.some((a) => a.status !== 'finished' && a.submissionStatus === 'submitted')).toBe(true);
  });

  it('E-04-AC5 has deadlines in the past, today, shared by two assignments, and weeks ahead', () => {
    const deadlines = data.assignments.map((a) => a.officialDeadline).filter((d): d is string => d !== null);
    expect(deadlines.some((d) => d < TODAY)).toBe(true);
    expect(deadlines.filter((d) => d === TODAY)).toHaveLength(1);
    const perDay = new Map<string, number>();
    for (const d of deadlines) perDay.set(d, (perDay.get(d) ?? 0) + 1);
    expect([...perDay.values()].some((n) => n >= 2)).toBe(true);
    expect(deadlines.some((d) => d >= addDays(TODAY, 14))).toBe(true);
  });

  it('E-04-AC6 makes search testable: "Lab 3" appears in more than one course', () => {
    const lab3 = data.assignments.filter((a) => a.title === 'Lab 3');
    expect(new Set(lab3.map((a) => a.courseId)).size).toBeGreaterThanOrEqual(2);
  });

  it('E-04-AC7 fills every field: ratings with one unrated course, availability with blanks and a 0', () => {
    expect(data.ratings).toHaveLength(4); // 5 courses, one unrated
    expect(data.availability.length).toBeGreaterThan(0);
    expect(data.availability.length).toBeLessThan(14); // some of the 14 days left blank (Unknown)
    expect(data.availability.some((d) => d.hours === 0)).toBe(true);
    expect(data.assignments.some((a) => a.effortHours !== null)).toBe(true);
    expect(data.assignments.some((a) => a.effortHours === null)).toBe(true);
    expect(data.reports.some((r) => r.remainingHours === 0)).toBe(true);
    expect(data.subtasks.length).toBeGreaterThan(0);
    expect(data.timerSessions.some((t) => t.durationSeconds === 0)).toBe(true);
    expect(data.timerSessions.some((t) => t.pausedSeconds > 0)).toBe(true);
    expect(data.overrides.length).toBeGreaterThan(0);
  });

  it('E-04-AC8 has one course whose last activity was 9 days ago while the others were active this week', () => {
    const karachiDay = (ts: string) => ts.slice(0, 10); // timestamps are written with +05:00
    const lastActivityDay = data.courses.map((c) => {
      const days = data.assignments
        .filter((a) => a.courseId === c.id && a.lastActivityAt !== null)
        .map((a) => karachiDay(a.lastActivityAt!))
        .sort();
      return { name: c.name, last: days[days.length - 1] };
    });
    const quiet = lastActivityDay.filter((c) => c.last! < addDays(TODAY, -7));
    expect(quiet).toEqual([{ name: 'Technical Writing', last: addDays(TODAY, -9) }]);
  });

  it('E-04-AC9 every value is within the data-model limits', () => {
    const halfStep = (n: number) => n * 2 === Math.trunc(n * 2);
    for (const a of data.assignments) {
      if (a.effortHours !== null) expect(a.effortHours >= 0.5 && a.effortHours <= 200 && halfStep(a.effortHours)).toBe(true);
      expect((a.effortHours === null) === (a.effortUpdatedAt === null)).toBe(true);
    }
    for (const d of data.availability) expect(d.hours >= 0 && d.hours <= 24 && halfStep(d.hours)).toBe(true);
    for (const r of data.reports) expect(r.remainingHours >= 0 && r.remainingHours <= 200 && halfStep(r.remainingHours)).toBe(true);
    for (const o of data.overrides) expect(o.hours > 0 && halfStep(o.hours)).toBe(true);
    for (const s of data.subtasks) expect(s.title).toBe(s.title.trim());
  });

  it('E-04-AC10 is deterministic and every id is unique', () => {
    expect(buildSampleData(data.studentId, TODAY)).toEqual(data);
    const ids = [
      ...data.courses, ...data.ratings, ...data.assignments, ...data.availability,
      ...data.reports, ...data.subtasks, ...data.timerSessions, ...data.overrides
    ].map((row) => row.id);
    expect(new Set(ids).size).toBe(ids.length);
    // Different Students never share ids.
    const other = buildSampleData('00000000-0000-4000-8000-0000000000bb', TODAY);
    expect(other.assignments[0]!.id).not.toBe(data.assignments[0]!.id);
  });
});

describe('E-04 sample data: loading into PostgreSQL', () => {
  beforeAll(async () => {
    await runMigrations(pool());
  });
  afterAll(async () => {
    await closePool();
  });

  it('E-04-AC1 loading twice gives the same rows, with no duplicates', async () => {
    const studentId = await newStudent();
    const first = await seedSampleData(pool(), { studentId, now: NOW });
    const before = await snapshot(studentId);
    const second = await seedSampleData(pool(), { studentId, now: NOW });
    const after = await snapshot(studentId);
    expect(second).toEqual(first);
    expect(after).toEqual(before);
    expect(after.assignments).toHaveLength(first.counts.assignments);
    expect(after.courses).toHaveLength(5);
  });

  it('E-04-AC2 database counts match the dataset and every row is marked as sample data', async () => {
    const studentId = await newStudent();
    const result = await seedSampleData(pool(), { studentId, now: NOW });
    const snap = await snapshot(studentId);
    expect(result.today).toBe(TODAY);
    expect(snap.assignments.length).toBeGreaterThanOrEqual(50);
    expect({
      courses: snap.courses.length, ratings: snap.ratings.length, assignments: snap.assignments.length,
      availability: snap.availability.length, reports: snap.reports.length, subtasks: snap.subtasks.length,
      timerSessions: snap.timers.length, overrides: snap.overrides.length
    }).toEqual(result.counts);
    expect(snap.courses.every((c) => c.is_sample === true)).toBe(true);
    expect(snap.assignments.every((a) => a.is_sample === true)).toBe(true);
    expect(snap.timers.every((t) => t.state === 'stopped')).toBe(true);
  });

  it('E-04-AC11 keeps the Student row and its sessions (no logout)', async () => {
    const studentId = await newStudent();
    const { sessionId } = await sessions.issue(studentId);
    await seedSampleData(pool(), { studentId, now: NOW });
    await seedSampleData(pool(), { studentId, now: NOW });
    expect((await sessions.validate(sessionId))?.studentId).toBe(studentId);
  });

  it('E-04-AC12 reload leaves non-sample courses and availability outside its 14 days untouched', async () => {
    const studentId = await newStudent();
    await pool().query("INSERT INTO courses (student_id, name, is_sample) VALUES ($1, 'My own course', false)", [studentId]);
    await pool().query("INSERT INTO study_availability (student_id, study_date, hours) VALUES ($1, $2, 5)", [studentId, addDays(TODAY, -1)]);
    await pool().query("INSERT INTO study_availability (student_id, study_date, hours) VALUES ($1, $2, 6)", [studentId, addDays(TODAY, 14)]);
    // A Student edit inside the window is replaced by the sample value on reload.
    await pool().query("INSERT INTO study_availability (student_id, study_date, hours) VALUES ($1, $2, 9)", [studentId, TODAY]);
    await seedSampleData(pool(), { studentId, now: NOW });

    const own = await pool().query("SELECT 1 FROM courses WHERE student_id = $1 AND name = 'My own course'", [studentId]);
    expect(own.rowCount).toBe(1);
    const days = await pool().query<{ study_date: string; hours: string }>(
      'SELECT study_date::text, hours::text FROM study_availability WHERE student_id = $1 AND study_date IN ($2, $3, $4) ORDER BY study_date',
      [studentId, addDays(TODAY, -1), TODAY, addDays(TODAY, 14)]
    );
    expect(days.rows).toEqual([
      { study_date: addDays(TODAY, -1), hours: '5.0' },
      { study_date: TODAY, hours: '2.0' },
      { study_date: addDays(TODAY, 14), hours: '6.0' }
    ]);
  });

  it('E-04-AC13 reloading on the next day does not collide with rows from the day before', async () => {
    const studentId = await newStudent();
    await seedSampleData(pool(), { studentId, now: NOW });
    const next = await seedSampleData(pool(), { studentId, now: new Date(NOW.getTime() + 24 * 3600 * 1000) });
    expect(next.today).toBe(addDays(TODAY, 1));
    const a = await pool().query('SELECT count(*)::int AS n FROM assignments WHERE student_id = $1', [studentId]);
    expect(a.rows[0].n).toBe(next.counts.assignments);
  });

  it('E-04-AC14 three reloads at once all succeed and leave one copy', async () => {
    const studentId = await newStudent();
    await Promise.all([1, 2, 3].map(() => seedSampleData(pool(), { studentId, now: NOW })));
    const a = await pool().query('SELECT count(*)::int AS n FROM assignments WHERE student_id = $1', [studentId]);
    expect(a.rows[0].n).toBe(data.assignments.length);
  });

  it('E-04-AC15 refuses an unknown Student instead of creating one', async () => {
    await expect(seedSampleData(pool(), { studentId: randomUUID(), now: NOW })).rejects.toThrow(/does not exist/);
  });

  it('E-04-AC16 the demo Student was loaded by the test setup (read-only check)', async () => {
    const r = await pool().query(
      'SELECT count(*)::int AS n, bool_and(is_sample) AS all_sample FROM assignments WHERE student_id = $1',
      [DEMO_STUDENT_ID]
    );
    expect(r.rows[0]).toEqual({ n: data.assignments.length, all_sample: true });
    expect(process.env.SAMPLE_DATA_TODAY).toBe('2027-01-11');
  });
});
