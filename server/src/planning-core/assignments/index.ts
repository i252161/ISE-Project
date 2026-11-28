import { assignmentReads, type AssignmentRecord } from '../../data-access/index';

/**
 * E-05 assignment list and detail (read-only). Field names follow api-contract.md §4.
 *
 * Derived values that later slices compute are `null` until that slice merges (DL-59):
 * `startBy` / `planningState` (S-03) in the list, and one key per slice in the detail.
 * Each slice replaces only its own marked line below.
 */

export interface AssignmentListItem {
  id: string;
  title: string;
  course: { id: string; name: string };
  officialDeadline: string | null;
  studentDeadline: string | null;
  applicableDeadline: string | null;
  status: AssignmentRecord['status'];
  submissionStatus: AssignmentRecord['submissionStatus'];
  effortHours: number | null;
  effectiveEffortHours: number | null;
  startBy: string | null;
  planningState: string | null;
  isSample: boolean;
  version: number;
}

export interface AssignmentDetail extends AssignmentListItem {
  description: string | null;
  effortUpdatedAt: string | null;
  lastActivityAt: string | null;
  latestRemainingHours: { remainingHours: number; reportedAt: string } | null;
  planning: unknown | null;
  allocation: unknown | null;
  subtasks: unknown[] | null;
  timer: unknown | null;
  warnings: unknown[] | null;
}

/** The official deadline wins when present; otherwise the Student's (data-model.md §2). */
export function applicableDeadline(a: Pick<AssignmentRecord, 'officialDeadline' | 'studentDeadline'>): string | null {
  return a.officialDeadline ?? a.studentDeadline;
}

/**
 * DL-50: whichever was saved most recently, the manual effort or the latest remaining-hours report.
 * S-03 and S-07 should use this function rather than writing their own.
 */
export function effectiveEffortHours(
  a: Pick<AssignmentRecord, 'effortHours' | 'effortUpdatedAt' | 'latestReportHours' | 'latestReportAt'>
): number | null {
  if (a.latestReportHours === null || a.latestReportAt === null) {
    return a.effortHours;
  }
  if (a.effortHours === null || a.effortUpdatedAt === null) {
    return a.latestReportHours;
  }
  return a.latestReportAt.getTime() > a.effortUpdatedAt.getTime() ? a.latestReportHours : a.effortHours;
}

/** Deadline ascending, undated last (api-contract.md §4); ties by title, then id, so order is stable. */
export function compareByDeadline(x: AssignmentListItem, y: AssignmentListItem): number {
  const dx = x.applicableDeadline;
  const dy = y.applicableDeadline;
  if (dx !== dy) {
    if (dx === null) return 1;
    if (dy === null) return -1;
    return dx < dy ? -1 : 1;
  }
  return x.title.localeCompare(y.title) || (x.id < y.id ? -1 : x.id > y.id ? 1 : 0);
}

function toListItem(a: AssignmentRecord): AssignmentListItem {
  return {
    id: a.id,
    title: a.title,
    course: { id: a.courseId, name: a.courseName },
    officialDeadline: a.officialDeadline,
    studentDeadline: a.studentDeadline,
    applicableDeadline: applicableDeadline(a),
    status: a.status,
    submissionStatus: a.submissionStatus,
    effortHours: a.effortHours,
    effectiveEffortHours: effectiveEffortHours(a),
    startBy: null, // [S-03] start-by date
    planningState: null, // [S-03] planning state
    isSample: a.isSample,
    version: a.version
  };
}

export async function listAssignments(studentId: string): Promise<AssignmentListItem[]> {
  const rows = await assignmentReads.listForStudent(studentId);
  return rows.map(toListItem).sort(compareByDeadline);
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Returns null when the id is malformed, unknown, or belongs to another Student. */
export async function getAssignmentDetail(studentId: string, assignmentId: string): Promise<AssignmentDetail | null> {
  if (!UUID.test(assignmentId)) {
    return null;
  }
  const a = await assignmentReads.findForStudent(studentId, assignmentId);
  if (!a) {
    return null;
  }
  return {
    ...toListItem(a),
    description: a.description,
    effortUpdatedAt: a.effortUpdatedAt?.toISOString() ?? null,
    lastActivityAt: a.lastActivityAt?.toISOString() ?? null,
    latestRemainingHours:
      a.latestReportHours === null || a.latestReportAt === null
        ? null
        : { remainingHours: a.latestReportHours, reportedAt: a.latestReportAt.toISOString() },
    // --- Slice-owned parts of the detail (one line per slice, DL-55; null = not built yet) ---
    planning: null, // [S-03] start-by / shortage / unknown availability
    allocation: null, // [S-04] suggested allocation and overrides
    subtasks: null, // [S-14] subtasks
    timer: null, // [S-15] study timer summary
    warnings: null // [S-09] possible-imbalance and 3-day advisory
  };
}
