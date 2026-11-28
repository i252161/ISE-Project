import type { Pool } from 'pg';

/** One assignment as stored, with its course and its latest remaining-hours report (E-05). */
export interface AssignmentRecord {
  id: string;
  courseId: string;
  courseName: string;
  title: string;
  description: string | null;
  officialDeadline: string | null;
  studentDeadline: string | null;
  status: 'not_started' | 'already_started' | 'finished';
  submissionStatus: 'submitted' | 'not_submitted' | 'unavailable';
  effortHours: number | null;
  effortUpdatedAt: Date | null;
  lastActivityAt: Date | null;
  latestReportHours: number | null;
  latestReportAt: Date | null;
  isSample: boolean;
  version: number;
}

interface Row {
  id: string;
  course_id: string;
  course_name: string;
  title: string;
  description: string | null;
  official_deadline: string | null;
  student_deadline: string | null;
  status: AssignmentRecord['status'];
  submission_status: AssignmentRecord['submissionStatus'];
  effort_hours: string | null;
  effort_updated_at: Date | null;
  last_activity_at: Date | null;
  latest_report_hours: string | null;
  latest_report_at: Date | null;
  is_sample: boolean;
  version: number;
}

// Dates come back as text so no time zone is applied to a calendar day; numeric as text, then Number.
const SELECT = `
  SELECT a.id, a.course_id, c.name AS course_name, a.title, a.description,
         a.official_deadline::text AS official_deadline, a.student_deadline::text AS student_deadline,
         a.status, a.submission_status, a.effort_hours::text AS effort_hours, a.effort_updated_at,
         a.last_activity_at, r.remaining_hours::text AS latest_report_hours, r.reported_at AS latest_report_at,
         a.is_sample, a.version
    FROM assignments a
    JOIN courses c ON c.id = a.course_id
    LEFT JOIN LATERAL (
      SELECT remaining_hours, reported_at
        FROM remaining_hours_reports
       WHERE assignment_id = a.id
       ORDER BY reported_at DESC, created_at DESC
       LIMIT 1
    ) r ON true
   WHERE a.student_id = $1`;

function toRecord(row: Row): AssignmentRecord {
  return {
    id: row.id,
    courseId: row.course_id,
    courseName: row.course_name,
    title: row.title,
    description: row.description,
    officialDeadline: row.official_deadline,
    studentDeadline: row.student_deadline,
    status: row.status,
    submissionStatus: row.submission_status,
    effortHours: row.effort_hours === null ? null : Number(row.effort_hours),
    effortUpdatedAt: row.effort_updated_at,
    lastActivityAt: row.last_activity_at,
    latestReportHours: row.latest_report_hours === null ? null : Number(row.latest_report_hours),
    latestReportAt: row.latest_report_at,
    isSample: row.is_sample,
    version: row.version
  };
}

/**
 * Read-only assignment queries (E-05). Always scoped to one Student: a Student can never read
 * another Student's assignment. Writes belong to the slices that own them (S-03, S-08, S-10).
 */
export function createAssignmentReads(getPool: () => Pool) {
  return {
    async listForStudent(studentId: string): Promise<AssignmentRecord[]> {
      const result = await getPool().query<Row>(SELECT, [studentId]);
      return result.rows.map(toRecord);
    },

    async findForStudent(studentId: string, assignmentId: string): Promise<AssignmentRecord | null> {
      const result = await getPool().query<Row>(`${SELECT} AND a.id = $2`, [studentId, assignmentId]);
      const row = result.rows[0];
      return row ? toRecord(row) : null;
    }
  };
}
