import { createHash } from 'node:crypto';

/**
 * E-04 sample data (DL-28, DL-47, DL-55). Made-up courses and assignments; there is no
 * Google Classroom in D4.
 *
 * Pure and deterministic: the same (studentId, today) always gives the same rows and the same
 * ids, so re-running `npm run seed:sample` reloads identical data. Every date is relative to
 * `today` (an Asia/Karachi calendar day) so the demo never goes stale.
 *
 * Nothing here talks to the database. The loader is load-sample-data.ts.
 *
 * What each slice can rely on (keep this list true when editing the specs below):
 *  - S-01  availability for today + 13 days: some blank (Unknown), one explicit 0.
 *  - S-02  5 courses; Programming Fundamentals is unrated.
 *  - S-03  deadlines in the past, today, the same day for several assignments, and up to 3 weeks
 *          ahead; effort entered, blank, and older/newer than the latest remaining-hours report.
 *  - S-04  allocation overrides, including one on an explicit-0 day (over-allocated).
 *  - S-07  remaining-hours history, including a report of 0.
 *  - S-08  every status and submission status, including status and submission that disagree.
 *  - S-09  Technical Writing has had no activity for 9 days, has work starting within 3 days,
 *          and the other courses had activity in the last 7 days (DL-34 worked example).
 *  - S-10  undated assignments, one with only a Student deadline, one with both deadlines.
 *  - S-14  subtasks, some completed.
 *  - S-15  stopped timer sessions, one with a pause and one of 0 seconds.
 *  - S-16  "Lab 3" in three courses, "Quiz 2" in four, and a course without a code.
 */

export type Status = 'not_started' | 'already_started' | 'finished';
export type SubmissionStatus = 'submitted' | 'not_submitted' | 'unavailable';

export interface SampleCourse {
  id: string;
  key: string;
  name: string;
  code: string | null;
}

export interface SampleRating {
  id: string;
  courseId: string;
  rating: 1 | 2 | 3 | 4 | 5;
}

export interface SampleAssignment {
  id: string;
  courseId: string;
  title: string;
  description: string;
  officialDeadline: string | null;
  studentDeadline: string | null;
  status: Status;
  submissionStatus: SubmissionStatus;
  effortHours: number | null;
  effortUpdatedAt: string | null;
  lastActivityAt: string | null;
}

export interface SampleAvailability {
  id: string;
  studyDate: string;
  hours: number;
}

export interface SampleReport {
  id: string;
  assignmentId: string;
  remainingHours: number;
  reportedAt: string;
}

export interface SampleSubtask {
  id: string;
  assignmentId: string;
  title: string;
  isCompleted: boolean;
  position: number;
}

export interface SampleTimerSession {
  id: string;
  assignmentId: string;
  startedAt: string;
  endedAt: string;
  pausedSeconds: number;
  durationSeconds: number;
}

export interface SampleOverride {
  id: string;
  assignmentId: string;
  studyDate: string;
  hours: number;
}

export interface SampleDataset {
  studentId: string;
  today: string;
  /** Last day (inclusive) that sample availability covers. The loader reloads only this window. */
  availabilityTo: string;
  courses: SampleCourse[];
  ratings: SampleRating[];
  assignments: SampleAssignment[];
  availability: SampleAvailability[];
  reports: SampleReport[];
  subtasks: SampleSubtask[];
  timerSessions: SampleTimerSession[];
  overrides: SampleOverride[];
}

// ---------------------------------------------------------------------------
// Date helpers (Asia/Karachi has no daylight saving, so +05:00 is always right)
// ---------------------------------------------------------------------------

export function todayInKarachi(now: Date): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Karachi',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(now);
  const v = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  return `${v.year}-${v.month}-${v.day}`;
}

export function addDays(date: string, days: number): string {
  const [year, month, day] = date.split('-').map(Number) as [number, number, number];
  const moved = new Date(Date.UTC(year, month - 1, day + days));
  return [
    moved.getUTCFullYear(),
    String(moved.getUTCMonth() + 1).padStart(2, '0'),
    String(moved.getUTCDate()).padStart(2, '0')
  ].join('-');
}

/** A Karachi wall-clock time `daysAgo` days before `today`, as ISO 8601 with +05:00. */
function at(today: string, daysAgo: number, hour: number, minute = 0): string {
  const hh = String(hour).padStart(2, '0');
  const mm = String(minute).padStart(2, '0');
  return `${addDays(today, -daysAgo)}T${hh}:${mm}:00+05:00`;
}

/** Stable UUID (v4 layout) from a name, so reloads keep the same ids. */
function stableId(studentId: string, name: string): string {
  const hex = createHash('sha1').update(`d4-sample:${studentId}:${name}`).digest('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-8${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

// ---------------------------------------------------------------------------
// Courses (5). Programming Fundamentals is deliberately unrated (S-02).
// Technical Writing has no course code (code is nullable).
// ---------------------------------------------------------------------------

const COURSES = [
  { key: 'pf', name: 'Programming Fundamentals', code: 'CS1002', rating: null },
  { key: 'dsa', name: 'Data Structures', code: 'CS2001', rating: 4 },
  { key: 'db', name: 'Database Systems', code: 'CS2005', rating: 3 },
  { key: 'dm', name: 'Discrete Mathematics', code: 'MT1008', rating: 5 },
  { key: 'tw', name: 'Technical Writing', code: null, rating: 2 }
] as const;

type CourseKey = (typeof COURSES)[number]['key'];

// ---------------------------------------------------------------------------
// Assignments (56). Offsets are days from today: negative = past, 0 = today, null = none.
//   own        Student-entered deadline offset (S-10). Must be today or later.
//   act        days ago of the last status change (DL-34 activity). Omitted = no activity.
//   effortAgo  days ago the manual effort was saved. Default 5.
// Reports below also count as activity; last_activity_at takes whichever is newer.
// ---------------------------------------------------------------------------

interface AssignmentSpec {
  c: CourseKey;
  title: string;
  due: number | null;
  own?: number;
  st: Status;
  sub: SubmissionStatus;
  effort: number | null;
  effortAgo?: number;
  act?: number;
}

const S = { ns: 'not_started', as: 'already_started', fi: 'finished' } as const;
const U = { sub: 'submitted', no: 'not_submitted', un: 'unavailable' } as const;

const SPECS: AssignmentSpec[] = [
  // --- Programming Fundamentals (12)
  { c: 'pf', title: 'Lab 1', due: -35, st: S.fi, sub: U.sub, effort: 3, effortAgo: 40, act: 36 },
  { c: 'pf', title: 'Lab 2', due: -21, st: S.fi, sub: U.sub, effort: 3, effortAgo: 26, act: 22 },
  { c: 'pf', title: 'Lab 3', due: 4, st: S.ns, sub: U.no, effort: 4 },
  { c: 'pf', title: 'Lab 4', due: 11, st: S.ns, sub: U.un, effort: 4 },
  // Submitted but never marked Finished: status and submission are independent (S-08).
  { c: 'pf', title: 'Quiz 1', due: -14, st: S.as, sub: U.sub, effort: 1, effortAgo: 18, act: 15 },
  { c: 'pf', title: 'Quiz 2', due: 2, st: S.as, sub: U.no, effort: 2, act: 1 },
  // Deadline passed while still unfinished (S-03 "deadline passed").
  { c: 'pf', title: 'Calculator Program', due: -3, st: S.as, sub: U.no, effort: 6, act: 2 },
  // Due today (S-03: a deadline today gives a shortage).
  { c: 'pf', title: 'Pointers Practice', due: 0, st: S.ns, sub: U.no, effort: 3 },
  { c: 'pf', title: 'Midterm Project', due: 14, st: S.ns, sub: U.un, effort: null },
  { c: 'pf', title: 'Pseudocode Worksheet', due: null, st: S.ns, sub: U.un, effort: null },
  { c: 'pf', title: 'Debugging Exercise', due: 8, st: S.ns, sub: U.un, effort: 2 },
  // Only a Student-entered deadline (S-10).
  { c: 'pf', title: 'Final Project Proposal', due: null, own: 20, st: S.ns, sub: U.un, effort: null },

  // --- Data Structures (11)
  { c: 'dsa', title: 'Lab 1', due: -30, st: S.fi, sub: U.sub, effort: 3, effortAgo: 35, act: 31 },
  { c: 'dsa', title: 'Lab 2', due: -16, st: S.fi, sub: U.sub, effort: 4, effortAgo: 21, act: 17 },
  { c: 'dsa', title: 'Lab 3', due: 3, st: S.as, sub: U.no, effort: 5, act: 1 },
  // Finished but not submitted.
  { c: 'dsa', title: 'Linked List Assignment', due: -6, st: S.fi, sub: U.no, effort: 4, effortAgo: 11, act: 7 },
  { c: 'dsa', title: 'Stack and Queue Assignment', due: 3, st: S.ns, sub: U.un, effort: 4 },
  { c: 'dsa', title: 'Quiz 1', due: -9, st: S.fi, sub: U.sub, effort: 1, effortAgo: 14, act: 10 },
  { c: 'dsa', title: 'Quiz 2', due: 9, st: S.ns, sub: U.un, effort: 2 },
  { c: 'dsa', title: 'Tree Traversal Project', due: 14, st: S.as, sub: U.no, effort: 10, act: 2 },
  { c: 'dsa', title: 'Graph Algorithms Project', due: 21, st: S.ns, sub: U.un, effort: 12 },
  { c: 'dsa', title: 'Sorting Benchmark Report', due: null, st: S.ns, sub: U.un, effort: 3 },
  { c: 'dsa', title: 'Course Project Milestone', due: 5, st: S.ns, sub: U.un, effort: null },

  // --- Database Systems (11)
  { c: 'db', title: 'Lab 1', due: -28, st: S.fi, sub: U.sub, effort: 3, effortAgo: 33, act: 29 },
  { c: 'db', title: 'Lab 2', due: -14, st: S.fi, sub: U.sub, effort: 3, effortAgo: 19, act: 15 },
  // Manual effort saved after the latest report: effective effort is the manual entry (DL-50).
  { c: 'db', title: 'Lab 3', due: 4, st: S.as, sub: U.no, effort: 4, effortAgo: 1, act: 1 },
  { c: 'db', title: 'ER Diagram Assignment', due: -8, st: S.fi, sub: U.sub, effort: 3, effortAgo: 13, act: 9 },
  { c: 'db', title: 'SQL Queries Assignment', due: 7, st: S.ns, sub: U.un, effort: 5 },
  { c: 'db', title: 'Normalization Quiz', due: 2, st: S.ns, sub: U.no, effort: 1.5 },
  { c: 'db', title: 'Quiz 2', due: 10, st: S.ns, sub: U.un, effort: 1 },
  { c: 'db', title: 'Database Design Project', due: 17, st: S.ns, sub: U.un, effort: 14 },
  // Latest report is 0: no remaining effort, status unchanged (DL-50, DL-38).
  { c: 'db', title: 'Indexing Lab Report', due: 1, st: S.as, sub: U.no, effort: 2, act: 1 },
  { c: 'db', title: 'Transactions Worksheet', due: null, st: S.ns, sub: U.un, effort: null },
  { c: 'db', title: 'Stored Procedures Task', due: 12, st: S.ns, sub: U.un, effort: 4 },

  // --- Discrete Mathematics (11)
  { c: 'dm', title: 'Problem Set 1', due: -27, st: S.fi, sub: U.sub, effort: 3, effortAgo: 32, act: 28 },
  { c: 'dm', title: 'Problem Set 2', due: -20, st: S.fi, sub: U.sub, effort: 3, effortAgo: 25, act: 21 },
  { c: 'dm', title: 'Problem Set 3', due: -6, st: S.fi, sub: U.sub, effort: 3, effortAgo: 11, act: 7 },
  { c: 'dm', title: 'Problem Set 4', due: 8, st: S.as, sub: U.no, effort: 4, act: 1 },
  { c: 'dm', title: 'Quiz 1', due: -10, st: S.fi, sub: U.sub, effort: 1, effortAgo: 15, act: 11 },
  { c: 'dm', title: 'Quiz 2', due: 6, st: S.ns, sub: U.un, effort: 1 },
  { c: 'dm', title: 'Proofs Assignment', due: 13, st: S.ns, sub: U.un, effort: 6 },
  { c: 'dm', title: 'Graph Theory Assignment', due: null, st: S.ns, sub: U.un, effort: null },
  { c: 'dm', title: 'Logic Puzzle Set', due: 1, st: S.ns, sub: U.no, effort: 2 },
  { c: 'dm', title: 'Combinatorics Challenge', due: null, st: S.ns, sub: U.un, effort: 4 },
  // Official AND Student deadline: the official one applies (data-model.md §2).
  { c: 'dm', title: 'Make-up Quiz', due: 15, own: 10, st: S.ns, sub: U.un, effort: 1 },

  // --- Technical Writing (11). Last activity 9 days ago; nothing since (S-09, DL-34).
  { c: 'tw', title: 'Memo Draft', due: -18, st: S.fi, sub: U.sub, effort: 2, effortAgo: 23, act: 19 },
  { c: 'tw', title: 'Memo Final', due: -12, st: S.fi, sub: U.sub, effort: 2, effortAgo: 17, act: 13 },
  { c: 'tw', title: 'Report Outline', due: -4, st: S.as, sub: U.no, effort: 3, effortAgo: 12, act: 9 },
  { c: 'tw', title: 'Proposal Draft', due: 3, st: S.ns, sub: U.no, effort: 6 },
  { c: 'tw', title: 'Technical Report', due: 10, st: S.ns, sub: U.un, effort: 8 },
  { c: 'tw', title: 'Peer Review Exercise', due: 5, st: S.ns, sub: U.un, effort: 2 },
  { c: 'tw', title: 'Presentation Slides', due: 16, st: S.ns, sub: U.un, effort: null },
  { c: 'tw', title: 'Citation Quiz', due: 7, st: S.ns, sub: U.un, effort: 1 },
  { c: 'tw', title: 'Writing Portfolio', due: null, st: S.ns, sub: U.un, effort: null },
  { c: 'tw', title: 'Resume Assignment', due: -1, st: S.ns, sub: U.no, effort: 2 },
  { c: 'tw', title: 'Email Etiquette Quiz', due: -22, st: S.fi, sub: U.sub, effort: 1, effortAgo: 27, act: 23 }
];

// Remaining-hours reports (S-07). `ago` is days ago, `hour` is Karachi time.
const REPORT_SPECS: Array<{ c: CourseKey; title: string; remaining: number; ago: number; hour: number }> = [
  { c: 'pf', title: 'Quiz 2', remaining: 1.5, ago: 2, hour: 14 },
  { c: 'pf', title: 'Quiz 2', remaining: 1, ago: 1, hour: 20 },
  { c: 'pf', title: 'Calculator Program', remaining: 4, ago: 2, hour: 16 },
  // Reports newer than the manual effort: effective effort is the latest report (DL-50).
  { c: 'dsa', title: 'Lab 3', remaining: 4, ago: 3, hour: 15 },
  { c: 'dsa', title: 'Lab 3', remaining: 3.5, ago: 1, hour: 18 },
  { c: 'dsa', title: 'Tree Traversal Project', remaining: 9, ago: 4, hour: 13 },
  { c: 'dsa', title: 'Tree Traversal Project', remaining: 8, ago: 2, hour: 17 },
  // Older than the manual effort (saved 1 day ago): effective effort is the manual entry.
  { c: 'db', title: 'Lab 3', remaining: 2, ago: 3, hour: 11 },
  { c: 'db', title: 'Indexing Lab Report', remaining: 0.5, ago: 2, hour: 19 },
  { c: 'db', title: 'Indexing Lab Report', remaining: 0, ago: 1, hour: 22 },
  { c: 'dm', title: 'Problem Set 4', remaining: 3, ago: 1, hour: 21 },
  { c: 'tw', title: 'Report Outline', remaining: 2.5, ago: 9, hour: 12 }
];

const SUBTASK_SPECS: Array<{ c: CourseKey; title: string; items: Array<[string, boolean]> }> = [
  { c: 'pf', title: 'Lab 3', items: [['Read the requirements', true], ['Write the program', false], ['Test with sample input', false]] },
  {
    c: 'dsa',
    title: 'Tree Traversal Project',
    items: [
      ['Read the requirements', true],
      ['Build the tree class', true],
      ['Implement in-order traversal', false],
      ['Implement level-order traversal', false],
      ['Write the report', false]
    ]
  },
  { c: 'dsa', title: 'Lab 3', items: [['Read the requirements', true], ['Complete implementation', false]] },
  { c: 'db', title: 'Database Design Project', items: [['Choose a domain', false], ['Draw the ER diagram', false], ['Write the schema', false], ['Load test data', false]] },
  { c: 'dm', title: 'Proofs Assignment', items: [['Prove the first claim', false], ['Prove the second claim', false]] },
  { c: 'tw', title: 'Proposal Draft', items: [['Outline the problem', true], ['Write the budget section', false], ['Proofread', false]] }
];

// Stopped study sessions (S-15). duration = (end - start) - paused, as the server computes it.
// Only stopped sessions are seeded: a seeded running timer would keep running forever.
const TIMER_SPECS: Array<{ c: CourseKey; title: string; ago: number; hour: number; running: number; paused: number }> = [
  { c: 'pf', title: 'Calculator Program', ago: 3, hour: 10, running: 1800, paused: 0 },
  { c: 'pf', title: 'Calculator Program', ago: 2, hour: 15, running: 2700, paused: 300 },
  { c: 'dsa', title: 'Lab 3', ago: 2, hour: 16, running: 3600, paused: 0 },
  { c: 'db', title: 'Indexing Lab Report', ago: 1, hour: 18, running: 0, paused: 0 },
  { c: 'dm', title: 'Problem Set 4', ago: 1, hour: 20, running: 1200, paused: 120 }
];

// Student overrides of the suggested allocation (S-04). `day` is days from today.
const OVERRIDE_SPECS: Array<{ c: CourseKey; title: string; day: number; hours: number }> = [
  { c: 'dsa', title: 'Lab 3', day: 0, hours: 1.5 },
  { c: 'db', title: 'Lab 3', day: 3, hours: 1 },
  // Day 1 has 0 available hours: the override is kept and the day is over-allocated (DL-51).
  { c: 'pf', title: 'Lab 3', day: 1, hours: 1 }
];

// Availability for today and the next 13 days. null = no row = Unknown (not zero).
// Day 1 is an explicit 0, which is different from the blank days.
const AVAILABILITY_PATTERN: Array<number | null> = [2, 0, null, 1.5, 3, null, 2, 4, null, 2.5, 0, 3, null, 2];

// ---------------------------------------------------------------------------
// Builder
// ---------------------------------------------------------------------------

export function buildSampleData(studentId: string, today: string): SampleDataset {
  const id = (name: string) => stableId(studentId, name);
  const courseId = (key: CourseKey) => id(`course:${key}`);
  const assignmentId = (key: CourseKey, title: string) => id(`assignment:${key}:${title}`);
  const courseName = (key: CourseKey) => COURSES.find((c) => c.key === key)!.name;

  const courses: SampleCourse[] = COURSES.map((c) => ({ id: courseId(c.key), key: c.key, name: c.name, code: c.code }));

  const ratings: SampleRating[] = COURSES.flatMap((c) =>
    c.rating === null ? [] : [{ id: id(`rating:${c.key}`), courseId: courseId(c.key), rating: c.rating }]
  );

  // Latest report per assignment, so last_activity_at is never older than a report (DL-34).
  const latestReport = new Map<string, { ago: number; hour: number }>();
  for (const r of REPORT_SPECS) {
    const key = assignmentId(r.c, r.title);
    const known = latestReport.get(key);
    if (!known || r.ago < known.ago || (r.ago === known.ago && r.hour > known.hour)) {
      latestReport.set(key, { ago: r.ago, hour: r.hour });
    }
  }

  const assignments: SampleAssignment[] = SPECS.map((s) => {
    const aid = assignmentId(s.c, s.title);
    let activity = s.act === undefined ? null : { ago: s.act, hour: 12 };
    const report = latestReport.get(aid);
    if (report && (!activity || report.ago < activity.ago || (report.ago === activity.ago && report.hour > activity.hour))) {
      activity = report;
    }
    return {
      id: aid,
      courseId: courseId(s.c),
      title: s.title,
      description: `${s.title} for ${courseName(s.c)}. Sample data: made up for the D4 demo, not imported from Google Classroom.`,
      officialDeadline: s.due === null ? null : addDays(today, s.due),
      studentDeadline: s.own === undefined ? null : addDays(today, s.own),
      status: s.st,
      submissionStatus: s.sub,
      effortHours: s.effort,
      effortUpdatedAt: s.effort === null ? null : at(today, s.effortAgo ?? 5, 9),
      lastActivityAt: activity ? at(today, activity.ago, activity.hour) : null
    };
  });

  // Keyed by date, not offset: rows before today survive a reload, so an offset key would collide
  // with yesterday's row when the seed is run again the next day.
  const availability: SampleAvailability[] = AVAILABILITY_PATTERN.flatMap((hours, offset) => {
    const studyDate = addDays(today, offset);
    return hours === null ? [] : [{ id: id(`availability:${studyDate}`), studyDate, hours }];
  });

  const reports: SampleReport[] = REPORT_SPECS.map((r, index) => ({
    id: id(`report:${r.c}:${r.title}:${index}`),
    assignmentId: assignmentId(r.c, r.title),
    remainingHours: r.remaining,
    reportedAt: at(today, r.ago, r.hour)
  }));

  const subtasks: SampleSubtask[] = SUBTASK_SPECS.flatMap((spec) =>
    spec.items.map(([title, isCompleted], index) => ({
      id: id(`subtask:${spec.c}:${spec.title}:${index}`),
      assignmentId: assignmentId(spec.c, spec.title),
      title,
      isCompleted,
      position: index + 1
    }))
  );

  const timerSessions: SampleTimerSession[] = TIMER_SPECS.map((t, index) => {
    const start = new Date(at(today, t.ago, t.hour));
    const end = new Date(start.getTime() + (t.running + t.paused) * 1000);
    return {
      id: id(`timer:${t.c}:${t.title}:${index}`),
      assignmentId: assignmentId(t.c, t.title),
      startedAt: start.toISOString(),
      endedAt: end.toISOString(),
      pausedSeconds: t.paused,
      durationSeconds: t.running
    };
  });

  const overrides: SampleOverride[] = OVERRIDE_SPECS.map((o) => ({
    id: id(`override:${o.c}:${o.title}:${o.day}`),
    assignmentId: assignmentId(o.c, o.title),
    studyDate: addDays(today, o.day),
    hours: o.hours
  }));

  return {
    studentId,
    today,
    availabilityTo: addDays(today, AVAILABILITY_PATTERN.length - 1),
    courses,
    ratings,
    assignments,
    availability,
    reports,
    subtasks,
    timerSessions,
    overrides
  };
}
