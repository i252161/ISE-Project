export type PlanningState =
  | 'scheduled'
  | 'shortage'
  | 'unknown_availability'
  | 'no_estimate'
  | 'no_deadline'
  | 'completed'
  | 'deadline_passed'
  | 'no_remaining_effort';

export interface R1BAssignmentInput {
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

export interface R1BAvailabilityInput {
  studyDate: string;
  hours: number;
}

export interface DailyAllocation {
  date: string;
  hours: number;
}

export interface AssignmentPlanningResult {
  assignmentId: string;
  title: string;
  course: { id: string; name: string };
  officialDeadline: string | null;
  studentDeadline: string | null;
  applicableDeadline: string | null;
  status: 'not_started' | 'already_started' | 'finished';
  submissionStatus: 'submitted' | 'not_submitted' | 'unavailable';
  effortHours: number | null;
  effectiveEffortHours: number | null;
  state: PlanningState;
  startBy: string | null;
  shortageHours: number;
  unknownDates: string[];
  suggested: DailyAllocation[];
  message: string;
  isSample: boolean;
  version: number;
}

export interface StudentPlanResult {
  studentId: string;
  today: string;
  timeZone: string;
  assignments: AssignmentPlanningResult[];
}

export function toHalfHours(hours: number): number {
  return Math.round(hours * 2);
}

export function fromHalfHours(halfHours: number): number {
  return halfHours / 2;
}

export function addDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(Date.UTC(y!, m! - 1, d! + days));
  return dt.toISOString().slice(0, 10);
}

export function getTodayInTimeZone(timeZone: string, now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(now);
}

function getWeekdayName(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    timeZone: 'UTC'
  }).format(new Date(Date.UTC(y!, m! - 1, d!)));
}

function formatBlankDays(dates: string[]): string {
  const names = dates.map((d) => getWeekdayName(d));
  const counts = new Map<string, number>();
  for (const name of names) {
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }
  return dates
    .map((d, idx) => {
      const name = names[idx]!;
      return (counts.get(name) ?? 0) > 1 ? `${name} (${d})` : name;
    })
    .join(', ');
}

function formatHours(hours: number): string {
  return Number.isInteger(hours) ? String(hours) : hours.toFixed(1);
}

export function resolveEffectiveEffortHours(assignment: R1BAssignmentInput): number | null {
  const hasManual = assignment.effortUpdatedAt !== null || assignment.effortHours !== null;
  const hasReport = assignment.latestRemainingReportedAt !== null && assignment.latestRemainingHours !== null;

  if (hasManual && hasReport) {
    const manualMs = assignment.effortUpdatedAt ? assignment.effortUpdatedAt.getTime() : 0;
    const reportMs = assignment.latestRemainingReportedAt!.getTime();
    return reportMs > manualMs ? assignment.latestRemainingHours : assignment.effortHours;
  }
  if (hasReport) {
    return assignment.latestRemainingHours;
  }
  if (hasManual) {
    return assignment.effortHours;
  }
  return null;
}

/**
 * Pure R1-B start-by calculation using whole half-hour units.
 * No database or I/O side effects.
 */
export function calculateR1BPlan(params: {
  studentId: string;
  timeZone: string;
  today?: string;
  assignments: R1BAssignmentInput[];
  availability: R1BAvailabilityInput[];
}): StudentPlanResult {
  const today = params.today ?? getTodayInTimeZone(params.timeZone);

  const freeHalfHours = new Map<string, number>();
  for (const row of params.availability) {
    if (row.studyDate >= today) {
      freeHalfHours.set(row.studyDate, toHalfHours(row.hours));
    }
  }

  const resultsById = new Map<string, AssignmentPlanningResult>();
  const participating: Array<{
    assignment: R1BAssignmentInput;
    applicableDeadline: string;
    effectiveEffortHours: number;
  }> = [];

  for (const assignment of params.assignments) {
    const applicableDeadline = assignment.officialDeadline ?? assignment.studentDeadline;
    const effectiveEffortHours = resolveEffectiveEffortHours(assignment);

    const base: Omit<
      AssignmentPlanningResult,
      'state' | 'startBy' | 'shortageHours' | 'unknownDates' | 'suggested' | 'message'
    > = {
      assignmentId: assignment.id,
      title: assignment.title,
      course: { id: assignment.courseId, name: assignment.courseName },
      officialDeadline: assignment.officialDeadline,
      studentDeadline: assignment.studentDeadline,
      applicableDeadline,
      status: assignment.status,
      submissionStatus: assignment.submissionStatus,
      effortHours: assignment.effortHours,
      effectiveEffortHours,
      isSample: assignment.isSample,
      version: assignment.version
    };

    if (assignment.status === 'finished' || assignment.submissionStatus === 'submitted') {
      resultsById.set(assignment.id, {
        ...base,
        state: 'completed',
        startBy: null,
        shortageHours: 0,
        unknownDates: [],
        suggested: [],
        message: 'Completed.'
      });
      continue;
    }

    if (applicableDeadline === null) {
      resultsById.set(assignment.id, {
        ...base,
        state: 'no_deadline',
        startBy: null,
        shortageHours: 0,
        unknownDates: [],
        suggested: [],
        message: 'No deadline.'
      });
      continue;
    }

    if (applicableDeadline < today) {
      resultsById.set(assignment.id, {
        ...base,
        state: 'deadline_passed',
        startBy: null,
        shortageHours: 0,
        unknownDates: [],
        suggested: [],
        message: 'Deadline passed.'
      });
      continue;
    }

    if (effectiveEffortHours === null) {
      resultsById.set(assignment.id, {
        ...base,
        state: 'no_estimate',
        startBy: null,
        shortageHours: 0,
        unknownDates: [],
        suggested: [],
        message: 'No estimate.'
      });
      continue;
    }

    if (effectiveEffortHours === 0) {
      resultsById.set(assignment.id, {
        ...base,
        state: 'no_remaining_effort',
        startBy: null,
        shortageHours: 0,
        unknownDates: [],
        suggested: [],
        message: 'No remaining effort.'
      });
      continue;
    }

    participating.push({ assignment, applicableDeadline, effectiveEffortHours });
  }

  // Latest deadline first; equal deadlines ordered by assignment ID ascending.
  participating.sort((a, b) => {
    if (a.applicableDeadline !== b.applicableDeadline) {
      return a.applicableDeadline > b.applicableDeadline ? -1 : 1;
    }
    return a.assignment.id < b.assignment.id ? -1 : a.assignment.id > b.assignment.id ? 1 : 0;
  });

  for (const item of participating) {
    const { assignment, applicableDeadline, effectiveEffortHours } = item;
    let remainingHalfHours = toHalfHours(effectiveEffortHours);
    const unknownDatesDesc: string[] = [];
    const allocatedDesc: DailyAllocation[] = [];
    let earliestDay: string | null = null;

    for (let day = addDays(applicableDeadline, -1); day >= today; day = addDays(day, -1)) {
      if (!freeHalfHours.has(day)) {
        unknownDatesDesc.push(day);
        continue;
      }

      const availableHalfHours = freeHalfHours.get(day)!;
      if (remainingHalfHours > 0 && availableHalfHours > 0) {
        const takeHalfHours = Math.min(remainingHalfHours, availableHalfHours);
        freeHalfHours.set(day, availableHalfHours - takeHalfHours);
        remainingHalfHours -= takeHalfHours;
        earliestDay = day;
        allocatedDesc.push({ date: day, hours: fromHalfHours(takeHalfHours) });
      }
    }

    const unknownDates = unknownDatesDesc.reverse();
    const suggested = allocatedDesc.reverse();

    const base: Omit<
      AssignmentPlanningResult,
      'state' | 'startBy' | 'shortageHours' | 'unknownDates' | 'suggested' | 'message'
    > = {
      assignmentId: assignment.id,
      title: assignment.title,
      course: { id: assignment.courseId, name: assignment.courseName },
      officialDeadline: assignment.officialDeadline,
      studentDeadline: assignment.studentDeadline,
      applicableDeadline,
      status: assignment.status,
      submissionStatus: assignment.submissionStatus,
      effortHours: assignment.effortHours,
      effectiveEffortHours,
      isSample: assignment.isSample,
      version: assignment.version
    };

    if (remainingHalfHours === 0) {
      const prompt =
        unknownDates.length > 0
          ? ` (Enter availability for ${formatBlankDays(unknownDates)}.)`
          : '';
      resultsById.set(assignment.id, {
        ...base,
        state: 'scheduled',
        startBy: earliestDay,
        shortageHours: 0,
        unknownDates,
        suggested,
        message: `Start by ${earliestDay}.${prompt}`
      });
    } else if (unknownDates.length > 0) {
      resultsById.set(assignment.id, {
        ...base,
        state: 'unknown_availability',
        startBy: null,
        shortageHours: 0,
        unknownDates,
        suggested,
        message: `Cannot be determined yet — enter availability for ${formatBlankDays(unknownDates)}.`
      });
    } else {
      const shortageHours = fromHalfHours(remainingHalfHours);
      resultsById.set(assignment.id, {
        ...base,
        state: 'shortage',
        startBy: null,
        shortageHours,
        unknownDates: [],
        suggested,
        message: `No start-by date — short by ${formatHours(shortageHours)} h.`
      });
    }
  }

  // Return in deterministic deadline-ascending order (undated last) matching list display conventions.
  const ordered = params.assignments
    .map((a) => resultsById.get(a.id)!)
    .sort((a, b) => {
      if (a.applicableDeadline === null && b.applicableDeadline === null) {
        return a.assignmentId.localeCompare(b.assignmentId);
      }
      if (a.applicableDeadline === null) return 1;
      if (b.applicableDeadline === null) return -1;
      if (a.applicableDeadline !== b.applicableDeadline) {
        return a.applicableDeadline < b.applicableDeadline ? -1 : 1;
      }
      return a.assignmentId.localeCompare(b.assignmentId);
    });

  return {
    studentId: params.studentId,
    today,
    timeZone: params.timeZone,
    assignments: ordered
  };
}
