import type { PoolClient } from 'pg';
import { getPool } from '../index';

export interface PlanningTx {
  readonly __brand: 'PlanningTx';
}

export interface AssignmentInputRow {
  id: string;
  title: string;
  courseId: string;
  courseName: string;
  officialDeadline: string | null;
  studentDeadline: string | null;
  status: 'not_started' | 'already_started' | 'finished';
  submissionStatus: 'submitted' | 'not_submitted' | 'unavailable';
  effortHours: number | null;
  effortUpdatedAt: Date | null;
  latestRemainingHours: number | null;
  latestRemainingReportedAt: Date | null;
  isSample: boolean;
  version: number;
}

export interface AvailabilityInputRow {
  studyDate: string;
  hours: number;
}

export interface StudentPlanningInputs {
  studentId: string;
  timeZone: string;
  assignments: AssignmentInputRow[];
  availability: AvailabilityInputRow[];
}

export interface AssignmentEffortSnapshot {
  id: string;
  title: string;
  courseId: string;
  courseName: string;
  officialDeadline: string | null;
  studentDeadline: string | null;
  status: 'not_started' | 'already_started' | 'finished';
  submissionStatus: 'submitted' | 'not_submitted' | 'unavailable';
  effortHours: number | null;
  effortUpdatedAt: string | null;
  isSample: boolean;
  version: number;
}

export type UpdateEffortTxResult<TPlan> =
  | { kind: 'not_found' }
  | { kind: 'version_conflict'; current: AssignmentEffortSnapshot }
  | {
      kind: 'ok';
      effortHours: number | null;
      effortUpdatedAt: string;
      version: number;
      plan: TPlan;
    };

function toNullableNumber(value: string | number | null): number | null {
  if (value === null || value === undefined) {
    return null;
  }
  return Number(value);
}

async function queryPlanningInputs(
  client: PoolClient,
  studentId: string
): Promise<StudentPlanningInputs | null> {
  const studentRes = await client.query<{ id: string; time_zone: string }>(
    `SELECT id, time_zone FROM students WHERE id = $1`,
    [studentId]
  );
  const student = studentRes.rows[0];
  if (!student) {
    return null;
  }

  const assignmentsRes = await client.query<{
    id: string;
    title: string;
    course_id: string;
    course_name: string;
    official_deadline: string | null;
    student_deadline: string | null;
    status: 'not_started' | 'already_started' | 'finished';
    submission_status: 'submitted' | 'not_submitted' | 'unavailable';
    effort_hours: string | null;
    effort_updated_at: Date | null;
    latest_remaining_hours: string | null;
    latest_remaining_reported_at: Date | null;
    is_sample: boolean;
    version: number;
  }>(
    `SELECT
       a.id,
       a.title,
       a.course_id,
       c.name AS course_name,
       to_char(a.official_deadline, 'YYYY-MM-DD') AS official_deadline,
       to_char(a.student_deadline, 'YYYY-MM-DD') AS student_deadline,
       a.status,
       a.submission_status,
       a.effort_hours,
       a.effort_updated_at,
       r.remaining_hours AS latest_remaining_hours,
       r.reported_at AS latest_remaining_reported_at,
       a.is_sample,
       a.version
     FROM assignments a
     JOIN courses c ON c.id = a.course_id
     LEFT JOIN LATERAL (
       SELECT remaining_hours, reported_at
       FROM remaining_hours_reports
       WHERE assignment_id = a.id
       ORDER BY reported_at DESC, created_at DESC
       LIMIT 1
     ) r ON true
     WHERE a.student_id = $1
     ORDER BY a.id ASC`,
    [studentId]
  );

  const availabilityRes = await client.query<{ study_date: string; hours: string }>(
    `SELECT
       to_char(study_date, 'YYYY-MM-DD') AS study_date,
       hours
     FROM study_availability
     WHERE student_id = $1
     ORDER BY study_date ASC`,
    [studentId]
  );

  return {
    studentId: student.id,
    timeZone: student.time_zone,
    assignments: assignmentsRes.rows.map((row) => ({
      id: row.id,
      title: row.title,
      courseId: row.course_id,
      courseName: row.course_name,
      officialDeadline: row.official_deadline,
      studentDeadline: row.student_deadline,
      status: row.status,
      submissionStatus: row.submission_status,
      effortHours: toNullableNumber(row.effort_hours),
      effortUpdatedAt: row.effort_updated_at,
      latestRemainingHours: toNullableNumber(row.latest_remaining_hours),
      latestRemainingReportedAt: row.latest_remaining_reported_at,
      isSample: row.is_sample,
      version: row.version
    })),
    availability: availabilityRes.rows.map((row) => ({
      studyDate: row.study_date,
      hours: Number(row.hours)
    }))
  };
}

async function getAssignmentSnapshot(
  client: PoolClient,
  studentId: string,
  assignmentId: string
): Promise<AssignmentEffortSnapshot | null> {
  const res = await client.query<{
    id: string;
    title: string;
    course_id: string;
    course_name: string;
    official_deadline: string | null;
    student_deadline: string | null;
    status: 'not_started' | 'already_started' | 'finished';
    submission_status: 'submitted' | 'not_submitted' | 'unavailable';
    effort_hours: string | null;
    effort_updated_at: Date | null;
    is_sample: boolean;
    version: number;
  }>(
    `SELECT
       a.id,
       a.title,
       a.course_id,
       c.name AS course_name,
       to_char(a.official_deadline, 'YYYY-MM-DD') AS official_deadline,
       to_char(a.student_deadline, 'YYYY-MM-DD') AS student_deadline,
       a.status,
       a.submission_status,
       a.effort_hours,
       a.effort_updated_at,
       a.is_sample,
       a.version
     FROM assignments a
     JOIN courses c ON c.id = a.course_id
     WHERE a.id = $1 AND a.student_id = $2`,
    [assignmentId, studentId]
  );
  const row = res.rows[0];
  if (!row) {
    return null;
  }
  return {
    id: row.id,
    title: row.title,
    courseId: row.course_id,
    courseName: row.course_name,
    officialDeadline: row.official_deadline,
    studentDeadline: row.student_deadline,
    status: row.status,
    submissionStatus: row.submission_status,
    effortHours: toNullableNumber(row.effort_hours),
    effortUpdatedAt: row.effort_updated_at ? row.effort_updated_at.toISOString() : null,
    isSample: row.is_sample,
    version: row.version
  };
}

export const startByQueries = {
  async getStudentPlanningInputs(
    studentId: string,
    tx?: PlanningTx
  ): Promise<StudentPlanningInputs | null> {
    if (tx) {
      return queryPlanningInputs(tx as unknown as PoolClient, studentId);
    }
    const client = await getPool().connect();
    try {
      return await queryPlanningInputs(client, studentId);
    } finally {
      client.release();
    }
  },

  async updateAssignmentEffortInTx<TPlan>(params: {
    studentId: string;
    assignmentId: string;
    hours: number | null;
    expectedVersion: number;
    recalculate: (tx: PlanningTx) => Promise<TPlan>;
  }): Promise<UpdateEffortTxResult<TPlan>> {
    const client = await getPool().connect();
    try {
      await client.query('BEGIN');

      const updateRes = await client.query<{
        effort_hours: string | null;
        effort_updated_at: Date;
        version: number;
      }>(
        `UPDATE assignments
         SET effort_hours = $1,
             effort_updated_at = now(),
             updated_at = now(),
             version = version + 1
         WHERE id = $2 AND student_id = $3 AND version = $4
         RETURNING effort_hours, effort_updated_at, version`,
        [params.hours, params.assignmentId, params.studentId, params.expectedVersion]
      );

      const updated = updateRes.rows[0];
      if (!updated) {
        const current = await getAssignmentSnapshot(client, params.studentId, params.assignmentId);
        await client.query('ROLLBACK');
        if (!current) {
          return { kind: 'not_found' };
        }
        return { kind: 'version_conflict', current };
      }

      const plan = await params.recalculate(client as unknown as PlanningTx);
      await client.query('COMMIT');

      return {
        kind: 'ok',
        effortHours: toNullableNumber(updated.effort_hours),
        effortUpdatedAt: updated.effort_updated_at.toISOString(),
        version: updated.version,
        plan
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
};
