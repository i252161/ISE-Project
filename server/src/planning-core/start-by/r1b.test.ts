import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { closePool, getPool, runMigrations } from '../../data-access/index';
import { recalculateStudentPlan } from '../recalculate';
import {
  calculateR1BPlan,
  type R1BAssignmentInput,
  type R1BAvailabilityInput
} from './r1b';
import { updateAssignmentEffort, validateEffortBody } from './service';

const TODAY_MON = '2026-11-30'; // Monday
const TUE = '2026-12-01';
const WED = '2026-12-02';
const THU = '2026-12-03';
const FRI = '2026-12-04';
const YESTERDAY = '2026-11-29';

function makeAssignment(overrides: Partial<R1BAssignmentInput> & { id: string }): R1BAssignmentInput {
  return {
    title: `Assignment ${overrides.id}`,
    courseId: 'course-1',
    courseName: 'Course 1',
    officialDeadline: null,
    studentDeadline: null,
    status: 'not_started',
    submissionStatus: 'not_submitted',
    effortHours: null,
    effortUpdatedAt: null,
    latestRemainingHours: null,
    latestRemainingReportedAt: null,
    isSample: false,
    version: 1,
    ...overrides
  };
}

describe('S-03 R1-B pure calculation', () => {
  it('reproduces Example 1 exactly (today = Monday, A 4h due Thu, B 4h due Fri, Mon-Thu 2h each)', () => {
    const availability: R1BAvailabilityInput[] = [
      { studyDate: TODAY_MON, hours: 2 },
      { studyDate: TUE, hours: 2 },
      { studyDate: WED, hours: 2 },
      { studyDate: THU, hours: 2 }
    ];
    const assignments: R1BAssignmentInput[] = [
      makeAssignment({
        id: 'a-1',
        title: 'Assignment A',
        officialDeadline: THU,
        effortHours: 4,
        effortUpdatedAt: new Date('2026-11-29T10:00:00Z')
      }),
      makeAssignment({
        id: 'b-1',
        title: 'Assignment B',
        officialDeadline: FRI,
        effortHours: 4,
        effortUpdatedAt: new Date('2026-11-29T10:00:00Z')
      })
    ];

    const plan = calculateR1BPlan({
      studentId: 'student-1',
      timeZone: 'Asia/Karachi',
      today: TODAY_MON,
      assignments,
      availability
    });

    const a = plan.assignments.find((x) => x.assignmentId === 'a-1')!;
    const b = plan.assignments.find((x) => x.assignmentId === 'b-1')!;

    expect(b.state).toBe('scheduled');
    expect(b.startBy).toBe(WED);
    expect(b.suggested).toEqual([
      { date: WED, hours: 2 },
      { date: THU, hours: 2 }
    ]);

    expect(a.state).toBe('scheduled');
    expect(a.startBy).toBe(TODAY_MON);
    expect(a.suggested).toEqual([
      { date: TODAY_MON, hours: 2 },
      { date: TUE, hours: 2 }
    ]);
  });

  it('reproduces Example 2 exactly (A needs 6h -> no start-by date, short by 2 h)', () => {
    const availability: R1BAvailabilityInput[] = [
      { studyDate: TODAY_MON, hours: 2 },
      { studyDate: TUE, hours: 2 },
      { studyDate: WED, hours: 2 },
      { studyDate: THU, hours: 2 }
    ];
    const assignments: R1BAssignmentInput[] = [
      makeAssignment({
        id: 'a-1',
        title: 'Assignment A',
        officialDeadline: THU,
        effortHours: 6,
        effortUpdatedAt: new Date('2026-11-29T10:00:00Z')
      }),
      makeAssignment({
        id: 'b-1',
        title: 'Assignment B',
        officialDeadline: FRI,
        effortHours: 4,
        effortUpdatedAt: new Date('2026-11-29T10:00:00Z')
      })
    ];

    const plan = calculateR1BPlan({
      studentId: 'student-1',
      timeZone: 'Asia/Karachi',
      today: TODAY_MON,
      assignments,
      availability
    });

    const a = plan.assignments.find((x) => x.assignmentId === 'a-1')!;
    const b = plan.assignments.find((x) => x.assignmentId === 'b-1')!;

    expect(b.state).toBe('scheduled');
    expect(b.startBy).toBe(WED);

    expect(a.state).toBe('shortage');
    expect(a.startBy).toBeNull();
    expect(a.shortageHours).toBe(2);
    expect(a.message).toBe('No start-by date — short by 2 h.');
  });

  it('reproduces Example 3 exactly (blank Tuesday -> cannot be determined yet; Tue=0 -> short by 1 h; 2h effort -> Mon + prompt)', () => {
    const assignments3h = [
      makeAssignment({
        id: 'c-1',
        title: 'Assignment C',
        officialDeadline: THU,
        effortHours: 3,
        effortUpdatedAt: new Date('2026-11-29T10:00:00Z')
      })
    ];

    // Sub-case 3a: Mon 1, Tue blank, Wed 1, effort 3 h -> cannot be determined yet
    const plan3a = calculateR1BPlan({
      studentId: 'student-1',
      timeZone: 'Asia/Karachi',
      today: TODAY_MON,
      assignments: assignments3h,
      availability: [
        { studyDate: TODAY_MON, hours: 1 },
        { studyDate: WED, hours: 1 }
      ]
    });
    expect(plan3a.assignments[0]!.state).toBe('unknown_availability');
    expect(plan3a.assignments[0]!.startBy).toBeNull();
    expect(plan3a.assignments[0]!.unknownDates).toEqual([TUE]);
    expect(plan3a.assignments[0]!.message).toBe(
      'Cannot be determined yet — enter availability for Tuesday.'
    );

    // Sub-case 3b: Tuesday entered as 0 -> short by 1 h
    const plan3b = calculateR1BPlan({
      studentId: 'student-1',
      timeZone: 'Asia/Karachi',
      today: TODAY_MON,
      assignments: assignments3h,
      availability: [
        { studyDate: TODAY_MON, hours: 1 },
        { studyDate: TUE, hours: 0 },
        { studyDate: WED, hours: 1 }
      ]
    });
    expect(plan3b.assignments[0]!.state).toBe('shortage');
    expect(plan3b.assignments[0]!.startBy).toBeNull();
    expect(plan3b.assignments[0]!.shortageHours).toBe(1);
    expect(plan3b.assignments[0]!.message).toBe('No start-by date — short by 1 h.');

    // Sub-case 3c: C needs 2 h and Tuesday is blank -> start-by Monday + prompt for Tuesday
    const plan3c = calculateR1BPlan({
      studentId: 'student-1',
      timeZone: 'Asia/Karachi',
      today: TODAY_MON,
      assignments: [
        makeAssignment({
          id: 'c-1',
          title: 'Assignment C',
          officialDeadline: THU,
          effortHours: 2,
          effortUpdatedAt: new Date('2026-11-29T10:00:00Z')
        })
      ],
      availability: [
        { studyDate: TODAY_MON, hours: 1 },
        { studyDate: WED, hours: 1 }
      ]
    });
    expect(plan3c.assignments[0]!.state).toBe('scheduled');
    expect(plan3c.assignments[0]!.startBy).toBe(TODAY_MON);
    expect(plan3c.assignments[0]!.unknownDates).toEqual([TUE]);
    expect(plan3c.assignments[0]!.message).toContain('Tuesday');
  });

  it('checks exact fit vs +0.5 h shortage', () => {
    const availability: R1BAvailabilityInput[] = [
      { studyDate: TODAY_MON, hours: 2 },
      { studyDate: TUE, hours: 2 }
    ];

    const exact = calculateR1BPlan({
      studentId: 's1',
      timeZone: 'Asia/Karachi',
      today: TODAY_MON,
      assignments: [
        makeAssignment({
          id: 'a-exact',
          officialDeadline: WED,
          effortHours: 4,
          effortUpdatedAt: new Date('2026-11-29T10:00:00Z')
        })
      ],
      availability
    });
    expect(exact.assignments[0]!.state).toBe('scheduled');
    expect(exact.assignments[0]!.startBy).toBe(TODAY_MON);

    const plusHalf = calculateR1BPlan({
      studentId: 's1',
      timeZone: 'Asia/Karachi',
      today: TODAY_MON,
      assignments: [
        makeAssignment({
          id: 'a-plus',
          officialDeadline: WED,
          effortHours: 4.5,
          effortUpdatedAt: new Date('2026-11-29T10:00:00Z')
        })
      ],
      availability
    });
    expect(plusHalf.assignments[0]!.state).toBe('shortage');
    expect(plusHalf.assignments[0]!.shortageHours).toBe(0.5);
  });

  it('orders equal deadlines deterministically by assignment ID ascending', () => {
    const availability: R1BAvailabilityInput[] = [
      { studyDate: TODAY_MON, hours: 2 },
      { studyDate: TUE, hours: 2 }
    ];
    const plan = calculateR1BPlan({
      studentId: 's1',
      timeZone: 'Asia/Karachi',
      today: TODAY_MON,
      assignments: [
        makeAssignment({
          id: 'id-2',
          officialDeadline: WED,
          effortHours: 2,
          effortUpdatedAt: new Date('2026-11-29T10:00:00Z')
        }),
        makeAssignment({
          id: 'id-1',
          officialDeadline: WED,
          effortHours: 2,
          effortUpdatedAt: new Date('2026-11-29T10:00:00Z')
        })
      ],
      availability
    });

    const first = plan.assignments.find((x) => x.assignmentId === 'id-1')!;
    const second = plan.assignments.find((x) => x.assignmentId === 'id-2')!;
    // id-1 runs first and takes Tuesday; id-2 takes Monday
    expect(first.startBy).toBe(TUE);
    expect(second.startBy).toBe(TODAY_MON);
  });

  it('ensures finished, submitted, no-effort, no-deadline, and 0-remaining assignments take no hours', () => {
    const availability: R1BAvailabilityInput[] = [{ studyDate: TODAY_MON, hours: 2 }];
    const plan = calculateR1BPlan({
      studentId: 's1',
      timeZone: 'Asia/Karachi',
      today: TODAY_MON,
      assignments: [
        makeAssignment({
          id: 'a-finished',
          officialDeadline: TUE,
          status: 'finished',
          effortHours: 10,
          effortUpdatedAt: new Date('2026-11-29T10:00:00Z')
        }),
        makeAssignment({
          id: 'a-submitted',
          officialDeadline: TUE,
          submissionStatus: 'submitted',
          effortHours: 10,
          effortUpdatedAt: new Date('2026-11-29T10:00:00Z')
        }),
        makeAssignment({
          id: 'a-no-effort',
          officialDeadline: TUE,
          effortHours: null
        }),
        makeAssignment({
          id: 'a-no-deadline',
          officialDeadline: null,
          studentDeadline: null,
          effortHours: 10
        }),
        makeAssignment({
          id: 'a-zero-rem',
          officialDeadline: TUE,
          effortHours: 5,
          effortUpdatedAt: new Date('2026-11-29T09:00:00Z'),
          latestRemainingHours: 0,
          latestRemainingReportedAt: new Date('2026-11-29T10:00:00Z')
        }),
        makeAssignment({
          id: 'a-active',
          officialDeadline: TUE,
          effortHours: 2,
          effortUpdatedAt: new Date('2026-11-29T10:00:00Z')
        })
      ],
      availability
    });

    expect(plan.assignments.find((x) => x.assignmentId === 'a-finished')!.state).toBe('completed');
    expect(plan.assignments.find((x) => x.assignmentId === 'a-submitted')!.state).toBe('completed');
    expect(plan.assignments.find((x) => x.assignmentId === 'a-no-effort')!.state).toBe('no_estimate');
    expect(plan.assignments.find((x) => x.assignmentId === 'a-no-deadline')!.state).toBe('no_deadline');
    expect(plan.assignments.find((x) => x.assignmentId === 'a-zero-rem')!.state).toBe('no_remaining_effort');
    expect(plan.assignments.find((x) => x.assignmentId === 'a-active')!.state).toBe('scheduled');
    expect(plan.assignments.find((x) => x.assignmentId === 'a-active')!.startBy).toBe(TODAY_MON);
  });

  it('handles deadline yesterday -> deadline_passed, and deadline today -> shortage', () => {
    const plan = calculateR1BPlan({
      studentId: 's1',
      timeZone: 'Asia/Karachi',
      today: TODAY_MON,
      assignments: [
        makeAssignment({
          id: 'a-yesterday',
          officialDeadline: YESTERDAY,
          effortHours: 4,
          effortUpdatedAt: new Date('2026-11-28T10:00:00Z')
        }),
        makeAssignment({
          id: 'a-today',
          officialDeadline: TODAY_MON,
          effortHours: 3,
          effortUpdatedAt: new Date('2026-11-29T10:00:00Z')
        })
      ],
      availability: [{ studyDate: TODAY_MON, hours: 5 }]
    });

    const yesterday = plan.assignments.find((x) => x.assignmentId === 'a-yesterday')!;
    expect(yesterday.state).toBe('deadline_passed');
    expect(yesterday.startBy).toBeNull();

    const todayItem = plan.assignments.find((x) => x.assignmentId === 'a-today')!;
    expect(todayItem.state).toBe('shortage');
    expect(todayItem.startBy).toBeNull();
    expect(todayItem.shortageHours).toBe(3);
  });

  it('validates effort BVA: 0 rejected, 0.5 accepted, 200 accepted, 200.5 rejected, blank accepted', () => {
    expect(validateEffortBody({ hours: 0, version: 1 }).ok).toBe(false);
    expect(validateEffortBody({ hours: 0.5, version: 1 })).toEqual({ ok: true, hours: 0.5, version: 1 });
    expect(validateEffortBody({ hours: 200, version: 1 })).toEqual({ ok: true, hours: 200, version: 1 });
    expect(validateEffortBody({ hours: 200.5, version: 1 }).ok).toBe(false);
    expect(validateEffortBody({ hours: 1.25, version: 1 }).ok).toBe(false);
    expect(validateEffortBody({ hours: null, version: 1 })).toEqual({ ok: true, hours: null, version: 1 });
  });
});

describe('S-03 PostgreSQL integration: recalculateStudentPlan & effort updates', () => {
  let studentId: string;
  let courseId: string;
  let assignmentId: string;

  beforeAll(async () => {
    const pool = getPool();
    await runMigrations(pool, path.resolve(__dirname, '../../data-access/migrations'));

    studentId = randomUUID();
    courseId = randomUUID();
    assignmentId = randomUUID();

    await pool.query(
      `INSERT INTO students (id, display_name, time_zone, is_sample)
       VALUES ($1, 'S-03 Test Student', 'Asia/Karachi', false)`,
      [studentId]
    );
    await pool.query(
      `INSERT INTO courses (id, student_id, name, is_sample)
       VALUES ($1, $2, 'Test Course', false)`,
      [courseId, studentId]
    );
    await pool.query(
      `INSERT INTO assignments (id, student_id, course_id, title, official_deadline, status, submission_status, is_sample)
       VALUES ($1, $2, $3, 'Test Assignment', (now() AT TIME ZONE 'Asia/Karachi')::date + 2, 'not_started', 'not_submitted', false)`,
      [assignmentId, studentId, courseId]
    );
    await pool.query(
      `INSERT INTO study_availability (student_id, study_date, hours, source)
       VALUES
         ($1, (now() AT TIME ZONE 'Asia/Karachi')::date, 2, 'individual'),
         ($1, (now() AT TIME ZONE 'Asia/Karachi')::date + 1, 2, 'individual')`,
      [studentId]
    );
  });

  afterAll(async () => {
    const pool = getPool();
    await pool.query('DELETE FROM students WHERE id = $1', [studentId]);
    // Close this file's pool so the test database can shut down cleanly at the end of the run.
    await closePool();
  });

  it("does not let a Student change or see another Student's assignment", async () => {
    const pool = getPool();
    const otherStudentId = randomUUID();
    const otherCourseId = randomUUID();
    const otherAssignmentId = randomUUID();
    await pool.query(
      `INSERT INTO students (id, display_name, time_zone, is_sample)
       VALUES ($1, 'Other Student', 'Asia/Karachi', false)`,
      [otherStudentId]
    );
    await pool.query(
      `INSERT INTO courses (id, student_id, name, is_sample) VALUES ($1, $2, 'Other Course', false)`,
      [otherCourseId, otherStudentId]
    );
    await pool.query(
      `INSERT INTO assignments (id, student_id, course_id, title, official_deadline, is_sample)
       VALUES ($1, $2, $3, 'Other Assignment', (now() AT TIME ZONE 'Asia/Karachi')::date + 3, false)`,
      [otherAssignmentId, otherStudentId, otherCourseId]
    );

    try {
      const result = await updateAssignmentEffort({
        studentId,
        assignmentId: otherAssignmentId,
        body: { hours: 3, version: 1 },
        recalculate: recalculateStudentPlan
      });
      expect(result.kind).toBe('not_found');

      const unchanged = await pool.query<{ effort_hours: string | null; version: number }>(
        'SELECT effort_hours, version FROM assignments WHERE id = $1',
        [otherAssignmentId]
      );
      expect(unchanged.rows[0]?.effort_hours).toBeNull();
      expect(unchanged.rows[0]?.version).toBe(1);

      const plan = await recalculateStudentPlan(studentId);
      expect(plan?.assignments.some((a) => a.assignmentId === otherAssignmentId)).toBe(false);
    } finally {
      await pool.query('DELETE FROM students WHERE id = $1', [otherStudentId]);
    }
  });

  it('recalculates once on effort edit, enforces version check, and persists no derived rows', async () => {
    const recalcSpy = vi.fn(recalculateStudentPlan);

    // 1. Set effort to 2 h -> scheduled, version becomes 2
    const res1 = await updateAssignmentEffort({
      studentId,
      assignmentId,
      body: { hours: 2, version: 1 },
      recalculate: recalcSpy
    });
    expect(res1.kind).toBe('ok');
    if (res1.kind === 'ok') {
      expect(res1.version).toBe(2);
      expect(res1.effortHours).toBe(2);
      expect(res1.planning.state).toBe('scheduled');
      expect(res1.planning.startBy).not.toBeNull();
    }
    expect(recalcSpy).toHaveBeenCalledTimes(1);

    // 2. Stale version (1) returns version_conflict without recalculating
    const stale = await updateAssignmentEffort({
      studentId,
      assignmentId,
      body: { hours: 4, version: 1 },
      recalculate: recalcSpy
    });
    expect(stale.kind).toBe('version_conflict');
    expect(recalcSpy).toHaveBeenCalledTimes(1);

    // 3. Blank effort (null) -> no_estimate, version becomes 3
    const cleared = await updateAssignmentEffort({
      studentId,
      assignmentId,
      body: { hours: null, version: 2 },
      recalculate: recalcSpy
    });
    expect(cleared.kind).toBe('ok');
    if (cleared.kind === 'ok') {
      expect(cleared.version).toBe(3);
      expect(cleared.effortHours).toBeNull();
      expect(cleared.planning.state).toBe('no_estimate');
    }
    expect(recalcSpy).toHaveBeenCalledTimes(2);
  });
});
