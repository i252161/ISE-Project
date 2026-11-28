import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { assignmentReads, closePool, getPool, runMigrations } from './index';
import { seedSampleData } from './seed/load-sample-data';

// E-05: assignment reads are always scoped to one Student. Uses fresh Students (DL-58).

async function newStudent(): Promise<string> {
  const r = await getPool().query<{ id: string }>(
    "INSERT INTO students (display_name, time_zone) VALUES ('E-05 test', 'Asia/Karachi') RETURNING id"
  );
  return r.rows[0]!.id;
}

describe('E-05 assignment reads (data-access)', () => {
  let alice: string;
  let bob: string;

  beforeAll(async () => {
    await runMigrations(getPool());
    alice = await newStudent();
    bob = await newStudent();
    const now = new Date('2026-12-07T07:00:00Z');
    await seedSampleData(getPool(), { studentId: alice, now });
    await seedSampleData(getPool(), { studentId: bob, now });
  });
  afterAll(async () => {
    await closePool();
  });

  it('E-05-T1 lists only the Student’s own assignments', async () => {
    const mine = await assignmentReads.listForStudent(alice);
    const theirs = await assignmentReads.listForStudent(bob);
    expect(mine).toHaveLength(56);
    expect(theirs).toHaveLength(56);
    const theirIds = new Set(theirs.map((a) => a.id));
    expect(mine.some((a) => theirIds.has(a.id))).toBe(false);
  });

  it('E-05-T2 cannot open another Student’s assignment', async () => {
    const [theirs] = await assignmentReads.listForStudent(bob);
    expect(await assignmentReads.findForStudent(alice, theirs!.id)).toBeNull();
    expect(await assignmentReads.findForStudent(bob, theirs!.id)).not.toBeNull();
  });

  it('E-05-T3 returns calendar days as text, hours as numbers, and only the latest report', async () => {
    const list = await assignmentReads.listForStudent(alice);
    const lab3 = list.find((a) => a.courseName === 'Data Structures' && a.title === 'Lab 3')!;
    expect(lab3.officialDeadline).toBe('2026-12-10');
    expect(lab3.effortHours).toBe(5);
    expect(lab3.latestReportHours).toBe(3.5);
    expect(lab3.latestReportAt?.toISOString()).toBe('2026-12-06T13:00:00.000Z');
    const undated = list.find((a) => a.title === 'Writing Portfolio')!;
    expect(undated).toMatchObject({ officialDeadline: null, studentDeadline: null, latestReportHours: null });
  });
});
