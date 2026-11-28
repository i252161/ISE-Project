// E-05: typed reads of api-contract.md §4. Nothing is stored on the device (DL-11).

export type Status = 'not_started' | 'already_started' | 'finished';
export type SubmissionStatus = 'submitted' | 'not_submitted' | 'unavailable';

export interface AssignmentListItem {
  id: string;
  title: string;
  course: { id: string; name: string };
  officialDeadline: string | null;
  studentDeadline: string | null;
  applicableDeadline: string | null;
  status: Status;
  submissionStatus: SubmissionStatus;
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
  planning: unknown;
  allocation: unknown;
  subtasks: unknown;
  timer: unknown;
  warnings: unknown;
}

export class NotFound extends Error {}

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { credentials: 'same-origin', cache: 'no-store' });
  if (res.status === 404) throw new NotFound();
  if (!res.ok) throw new Error(`The server answered ${res.status}.`);
  return (await res.json()) as T;
}

export const fetchAssignments = () =>
  getJson<{ assignments: AssignmentListItem[] }>('/api/assignments').then((b) => b.assignments);

export const fetchAssignment = (id: string) => getJson<AssignmentDetail>(`/api/assignments/${encodeURIComponent(id)}`);

// --- Display helpers ---

export const STATUS_LABEL: Record<Status, string> = {
  not_started: 'Not Started',
  already_started: 'Already Started',
  finished: 'Finished'
};

export const SUBMISSION_LABEL: Record<SubmissionStatus, string> = {
  submitted: 'Submitted',
  not_submitted: 'Not Submitted',
  unavailable: 'Unavailable'
};

/** "2026-12-02" → "Wed 02 Dec 2026". A calendar day: no time-zone shift. */
export function formatDay(day: string | null): string {
  if (!day) return '—';
  const [y, m, d] = day.split('-').map(Number) as [number, number, number];
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'UTC',
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(new Date(Date.UTC(y, m - 1, d)));
}

/** A server timestamp shown in Asia/Karachi (all academic days use it). */
export function formatTimestamp(iso: string | null): string {
  if (!iso) return '—';
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Karachi',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(iso));
}

export function formatHours(h: number | null): string {
  return h === null ? '—' : `${h.toFixed(1)} h`;
}
