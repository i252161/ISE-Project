import { DEMO_STUDENT_ID } from './demo-student';

export type AssignmentStatus = 'not_started' | 'already_started' | 'finished';
export type SubmissionStatus = 'submitted' | 'not_submitted' | 'unavailable';

export interface SampleCourse {
  id: string;
  studentId: string;
  name: string;
  code: string;
  isSample: true;
}

export interface SampleCourseRating {
  id: string;
  studentId: string;
  courseId: string;
  rating: 1 | 2 | 3 | 4 | 5;
}

export interface SampleAssignment {
  id: string;
  studentId: string;
  courseId: string;
  title: string;
  description: string;
  officialDeadline: string | null;
  studentDeadline: string | null;
  status: AssignmentStatus;
  submissionStatus: SubmissionStatus;
  effortHours: number | null;
  effortUpdatedAt: string | null;
  lastActivityAt: string | null;
  isSample: true;
  version: 1;
}

export interface SampleRemainingHoursReport {
  id: string;
  assignmentId: string;
  remainingHours: number;
  reportedAt: string;
}

export interface SampleStudyAvailability {
  id: string;
  studentId: string;
  studyDate: string;
  hours: number;
  source: 'individual';
}

export interface SampleSubtask {
  id: string;
  assignmentId: string;
  title: string;
  isCompleted: boolean;
  position: number;
  version: 1;
}

export interface SampleAllocationOverride {
  id: string;
  assignmentId: string;
  studyDate: string;
  hours: number;
  version: 1;
}

export interface SampleTimerSession {
  id: string;
  studentId: string;
  assignmentId: string;
  state: 'stopped';
  startedAt: string;
  pausedAt: null;
  pausedSeconds: number;
  endedAt: string;
  durationSeconds: number;
  version: 1;
}

export interface SampleDataset {
  today: string;
  courses: SampleCourse[];
  ratings: SampleCourseRating[];
  assignments: SampleAssignment[];
  reports: SampleRemainingHoursReport[];
  availability: SampleStudyAvailability[];
  subtasks: SampleSubtask[];
  allocationOverrides: SampleAllocationOverride[];
  timerSessions: SampleTimerSession[];
}

function makeUuid(prefixHex4: string, index: number): string {
  return `00000000-0000-4000-8000-${prefixHex4}${String(index).padStart(8, '0')}`;
}

export function getKarachiToday(now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Karachi',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(now);
  const year = parts.find((p) => p.type === 'year')!.value;
  const month = parts.find((p) => p.type === 'month')!.value;
  const day = parts.find((p) => p.type === 'day')!.value;
  return `${year}-${month}-${day}`;
}

export function addDays(dateStr: string, deltaDays: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const utc = new Date(Date.UTC(y, m - 1, d + deltaDays));
  return utc.toISOString().slice(0, 10);
}

function karachiTs(today: string, deltaDays: number, time = '10:00:00'): string {
  return `${addDays(today, deltaDays)}T${time}+05:00`;
}

interface AssignmentSpec {
  courseIndex: 0 | 1 | 2 | 3 | 4;
  title: string;
  description: string;
  officialDelta: number | null;
  studentDelta: number | null;
  status: AssignmentStatus;
  submissionStatus: SubmissionStatus;
  effortHours: number | null;
  effortUpdatedDelta: number | null;
  lastActivityDelta: number | null;
  lastActivityTime?: string;
  reports?: Array<{ remainingHours: number; deltaDays: number; time?: string }>;
}

export function buildSampleDataset(now: Date = new Date()): SampleDataset {
  const today = getKarachiToday(now);

  const courseSpecs: Array<{ name: string; code: string; rating: 1 | 2 | 3 | 4 | 5 | null }> = [
    { name: 'Programming Fundamentals', code: 'CS-101', rating: 4 },
    { name: 'Mathematics', code: 'MT-101', rating: 2 },
    { name: 'Applied Physics', code: 'PH-101', rating: 3 },
    { name: 'Discrete Structures', code: 'CS-102', rating: 5 },
    { name: 'English Composition', code: 'EN-101', rating: null }
  ];

  const courses: SampleCourse[] = courseSpecs.map((c, idx) => ({
    id: makeUuid('c001', idx + 1),
    studentId: DEMO_STUDENT_ID,
    name: c.name,
    code: c.code,
    isSample: true
  }));

  const ratings: SampleCourseRating[] = [];
  courseSpecs.forEach((c, idx) => {
    if (c.rating !== null) {
      ratings.push({
        id: makeUuid('c002', ratings.length + 1),
        studentId: DEMO_STUDENT_ID,
        courseId: courses[idx].id,
        rating: c.rating
      });
    }
  });

  // 54 assignments: 11 / 11 / 11 / 11 / 10 across the 5 courses.
  // Deadlines:
  // - 6 with no deadline (official null, student null)
  // - 2 with only student_deadline (official null, student >= today)
  // - Exactly 1 due today (official = today)
  // - 2 in different courses with same official deadline today+3 (CS-101 & MT-101)
  // - 4 past deadlines (< today): 3 finished/submitted, 1 unfinished & past due
  // - Remaining 39 spread over next ~6 weeks (today+1 .. today+42, excluding today)
  const specs: AssignmentSpec[] = [
    // --- Course 0: Programming Fundamentals (11) ---
    {
      courseIndex: 0,
      title: 'Lab 1',
      description: 'Variables, standard input/output, and basic arithmetic exercises.',
      officialDelta: -6,
      studentDelta: null,
      status: 'finished',
      submissionStatus: 'submitted',
      effortHours: 2.0,
      effortUpdatedDelta: -8,
      lastActivityDelta: -7,
      reports: [{ remainingHours: 0.5, deltaDays: -7 }]
    },
    {
      courseIndex: 0,
      title: 'Lab 2',
      description: 'Conditional branching and loop control structures in C++.',
      officialDelta: -3,
      studentDelta: null,
      status: 'finished',
      submissionStatus: 'submitted',
      effortHours: 2.5,
      effortUpdatedDelta: -5,
      lastActivityDelta: -4
    },
    {
      courseIndex: 0,
      title: 'Lab 3',
      description: 'Functions, parameter passing, and modular decomposition.',
      officialDelta: 3, // Same official deadline (today+3) as Mathematics Assignment
      studentDelta: null,
      status: 'already_started',
      submissionStatus: 'not_submitted',
      effortHours: 4.0,
      effortUpdatedDelta: -3,
      lastActivityDelta: -2,
      reports: [
        { remainingHours: 3.5, deltaDays: -4 },
        { remainingHours: 2.5, deltaDays: -2 } // newer than effortUpdatedAt
      ]
    },
    {
      courseIndex: 0,
      title: 'Lab 4',
      description: 'One-dimensional and two-dimensional array manipulation.',
      officialDelta: 7,
      studentDelta: null,
      status: 'not_started',
      submissionStatus: 'not_submitted',
      effortHours: 3.5,
      effortUpdatedDelta: -2,
      lastActivityDelta: null
    },
    {
      courseIndex: 0,
      title: 'Lab 5',
      description: 'Pointers, dynamic memory allocation, and string processing.',
      officialDelta: 14,
      studentDelta: null,
      status: 'not_started',
      submissionStatus: 'unavailable',
      effortHours: 4.5,
      effortUpdatedDelta: -1,
      lastActivityDelta: null
    },
    {
      courseIndex: 0,
      title: 'Quiz 1: Control Flow',
      description: 'Short online quiz covering loops, switch statements, and scope.',
      officialDelta: 0, // Exactly 1 assignment due today
      studentDelta: null,
      status: 'already_started',
      submissionStatus: 'not_submitted',
      effortHours: 1.5,
      effortUpdatedDelta: -2,
      lastActivityDelta: -1,
      reports: [{ remainingHours: 0.5, deltaDays: -1 }]
    },
    {
      courseIndex: 0,
      title: 'Assignment 1: Grade Calculator',
      description: 'Build a CLI program to compute weighted course grades from a file.',
      officialDelta: 10,
      studentDelta: null,
      status: 'already_started',
      submissionStatus: 'not_submitted',
      effortHours: 6.0,
      effortUpdatedDelta: -1,
      lastActivityDelta: -2,
      reports: [{ remainingHours: 5.0, deltaDays: -2 }] // older than effortUpdatedAt
    },
    {
      courseIndex: 0,
      title: 'Assignment 2: Recursion Toolkit',
      description: 'Implement recursive sorting and backtracking utilities with tests.',
      officialDelta: 21,
      studentDelta: null,
      status: 'not_started',
      submissionStatus: 'not_submitted',
      effortHours: 8.0,
      effortUpdatedDelta: -2,
      lastActivityDelta: null
    },
    {
      courseIndex: 0,
      title: 'Midterm Preparation Sheet',
      description: 'Practice problems on memory layout, recursion, and complexity.',
      officialDelta: 28,
      studentDelta: null,
      status: 'not_started',
      submissionStatus: 'unavailable',
      effortHours: null,
      effortUpdatedDelta: null,
      lastActivityDelta: null
    },
    {
      courseIndex: 0,
      title: 'Mini Project Proposal',
      description: 'Draft a 1-page proposal for the end-of-semester console project.',
      officialDelta: null,
      studentDelta: 6, // Student-only deadline #1
      status: 'already_started',
      submissionStatus: 'unavailable',
      effortHours: 2.0,
      effortUpdatedDelta: -2,
      lastActivityDelta: -2
    },
    {
      courseIndex: 0,
      title: 'Optional Debugging Workshop',
      description: 'Self-paced gdb and valgrind debugging exercises.',
      officialDelta: null, // Undated #1
      studentDelta: null,
      status: 'not_started',
      submissionStatus: 'unavailable',
      effortHours: null,
      effortUpdatedDelta: null,
      lastActivityDelta: null
    },

    // --- Course 1: Mathematics (11) ---
    // Rule: every assignment's last_activity_at and latest report is exactly 9 days ago (-9),
    // and it has an unfinished, unsubmitted assignment with a deadline within 3 days.
    {
      courseIndex: 1,
      title: 'Assignment 1: Limits & Continuity',
      description: 'Problem set on epsilon-delta proofs and one-sided limits.',
      officialDelta: 3, // Same official deadline (today+3) as CS-101 Lab 3; unfinished & unsubmitted
      studentDelta: null,
      status: 'already_started',
      submissionStatus: 'not_submitted',
      effortHours: 3.0,
      effortUpdatedDelta: -11,
      lastActivityDelta: -9,
      reports: [
        { remainingHours: 4.0, deltaDays: -12 },
        { remainingHours: 2.5, deltaDays: -9 } // latest report 9 days ago
      ]
    },
    {
      courseIndex: 1,
      title: 'Quiz 1: Differentiation Rules',
      description: 'Chain rule, implicit differentiation, and related rates.',
      officialDelta: -4,
      studentDelta: null,
      status: 'finished',
      submissionStatus: 'not_submitted', // finished but not_submitted (past #3)
      effortHours: 2.0,
      effortUpdatedDelta: -10,
      lastActivityDelta: -9,
      reports: [{ remainingHours: 0, deltaDays: -10 }] // wait: latest report must be -9 for Math!
    },
    {
      courseIndex: 1,
      title: 'Assignment 2: Optimization Problems',
      description: 'Applied maxima/minima and curve sketching exercises.',
      officialDelta: 8,
      studentDelta: null,
      status: 'already_started',
      submissionStatus: 'not_submitted',
      effortHours: 5.0,
      effortUpdatedDelta: -10,
      lastActivityDelta: -9,
      reports: [{ remainingHours: 3.5, deltaDays: -9 }]
    },
    {
      courseIndex: 1,
      title: 'Quiz 2: Mean Value Theorem',
      description: 'Rolle’s theorem, MVT applications, and L’Hôpital’s rule.',
      officialDelta: 12,
      studentDelta: null,
      status: 'not_started',
      submissionStatus: 'not_submitted',
      effortHours: 2.5,
      effortUpdatedDelta: -10,
      lastActivityDelta: -9
    },
    {
      courseIndex: 1,
      title: 'Assignment 3: Definite Integrals',
      description: 'Riemann sums, Fundamental Theorem of Calculus, and substitution.',
      officialDelta: 17,
      studentDelta: null,
      status: 'not_started',
      submissionStatus: 'not_submitted',
      effortHours: 6.0,
      effortUpdatedDelta: -10,
      lastActivityDelta: -9,
      reports: [{ remainingHours: 5.5, deltaDays: -9 }]
    },
    {
      courseIndex: 1,
      title: 'Midterm Review Packet',
      description: 'Comprehensive calculus problem set covering chapters 1 through 4.',
      officialDelta: 24,
      studentDelta: null,
      status: 'not_started',
      submissionStatus: 'unavailable',
      effortHours: 10.0,
      effortUpdatedDelta: -10,
      lastActivityDelta: -9
    },
    {
      courseIndex: 1,
      title: 'Assignment 4: Integration by Parts',
      description: 'Techniques of integration and trigonometric substitutions.',
      officialDelta: 30,
      studentDelta: null,
      status: 'not_started',
      submissionStatus: 'not_submitted',
      effortHours: 5.5,
      effortUpdatedDelta: -10,
      lastActivityDelta: -9
    },
    {
      courseIndex: 1,
      title: 'Quiz 3: Improper Integrals',
      description: 'Convergence tests for improper integrals.',
      officialDelta: 35,
      studentDelta: null,
      status: 'not_started',
      submissionStatus: 'unavailable',
      effortHours: 2.0,
      effortUpdatedDelta: -10,
      lastActivityDelta: -9
    },
    {
      courseIndex: 1,
      title: 'Project: Modeling Growth Rates',
      description: 'Differential equation modeling write-up with plots.',
      officialDelta: 40,
      studentDelta: null,
      status: 'not_started',
      submissionStatus: 'not_submitted',
      effortHours: 12.0,
      effortUpdatedDelta: -10,
      lastActivityDelta: -9
    },
    {
      courseIndex: 1,
      title: 'Extra Practice: Taylor Series',
      description: 'Optional convergence radius and Maclaurin expansion problems.',
      officialDelta: null, // Undated #2
      studentDelta: null,
      status: 'not_started',
      submissionStatus: 'unavailable',
      effortHours: null,
      effortUpdatedDelta: null,
      lastActivityDelta: -9
    },
    {
      courseIndex: 1,
      title: 'Formula Sheet Preparation',
      description: 'Compile personal reference sheet for calculus identities.',
      officialDelta: null, // Undated #3
      studentDelta: null,
      status: 'not_started',
      submissionStatus: 'unavailable',
      effortHours: 1.5,
      effortUpdatedDelta: -10,
      lastActivityDelta: -9
    },

    // --- Course 2: Applied Physics (11) ---
    // Rule: has activity yesterday (-1), and includes "Lab 3".
    {
      courseIndex: 2,
      title: 'Lab 1: Vernier & Micrometer',
      description: 'Measurement uncertainty and error propagation lab report.',
      officialDelta: -2, // Past due unfinished #4
      studentDelta: null,
      status: 'already_started',
      submissionStatus: 'not_submitted',
      effortHours: 3.0,
      effortUpdatedDelta: -4,
      lastActivityDelta: -1,
      lastActivityTime: '15:00:00',
      reports: [{ remainingHours: 1.5, deltaDays: -1, time: '15:00:00' }]
    },
    {
      courseIndex: 2,
      title: 'Lab 2: Projectile Motion',
      description: 'Kinematics experiment analyzing range vs launch angle.',
      officialDelta: 4,
      studentDelta: null,
      status: 'already_started',
      submissionStatus: 'not_submitted',
      effortHours: 3.5,
      effortUpdatedDelta: -1, // effort updated yesterday, older report at -3
      lastActivityDelta: -1,
      lastActivityTime: '16:00:00',
      reports: [{ remainingHours: 2.5, deltaDays: -3 }]
    },
    {
      courseIndex: 2,
      title: 'Lab 3',
      description: 'Newton’s second law and friction coefficient measurements.',
      officialDelta: 9,
      studentDelta: null,
      status: 'not_started',
      submissionStatus: 'not_submitted',
      effortHours: 4.0,
      effortUpdatedDelta: -2,
      lastActivityDelta: null
    },
    {
      courseIndex: 2,
      title: 'Assignment 1: Vectors & Kinematics',
      description: '2D motion and relative velocity problem set.',
      officialDelta: 5,
      studentDelta: null,
      status: 'finished',
      submissionStatus: 'submitted',
      effortHours: 3.0,
      effortUpdatedDelta: -5,
      lastActivityDelta: -2,
      reports: [{ remainingHours: 0.5, deltaDays: -3 }]
    },
    {
      courseIndex: 2,
      title: 'Quiz 1: Newton’s Laws',
      description: 'Free-body diagrams and tension systems.',
      officialDelta: 11,
      studentDelta: null,
      status: 'not_started',
      submissionStatus: 'not_submitted',
      effortHours: 2.0,
      effortUpdatedDelta: -2,
      lastActivityDelta: null
    },
    {
      courseIndex: 2,
      title: 'Assignment 2: Work & Energy',
      description: 'Conservation of mechanical energy and power calculations.',
      officialDelta: 16,
      studentDelta: null,
      status: 'already_started',
      submissionStatus: 'not_submitted',
      effortHours: 4.5,
      effortUpdatedDelta: -3,
      lastActivityDelta: -1,
      reports: [{ remainingHours: 0, deltaDays: -1 }] // Report of 0 on unfinished assignment!
    },
    {
      courseIndex: 2,
      title: 'Midterm: Mechanics & Waves',
      description: 'In-class midterm covering chapters 1–6.',
      officialDelta: 22,
      studentDelta: null,
      status: 'not_started',
      submissionStatus: 'unavailable',
      effortHours: 14.0,
      effortUpdatedDelta: -2,
      lastActivityDelta: null
    },
    {
      courseIndex: 2,
      title: 'Assignment 3: Rotational Dynamics',
      description: 'Moment of inertia, torque, and angular momentum problems.',
      officialDelta: 29,
      studentDelta: null,
      status: 'not_started',
      submissionStatus: 'not_submitted',
      effortHours: 5.0,
      effortUpdatedDelta: -2,
      lastActivityDelta: null
    },
    {
      courseIndex: 2,
      title: 'Lab 4: Simple Harmonic Motion',
      description: 'Pendulum and spring oscillation period analysis.',
      officialDelta: 34,
      studentDelta: null,
      status: 'not_started',
      submissionStatus: 'unavailable',
      effortHours: null,
      effortUpdatedDelta: null,
      lastActivityDelta: null
    },
    {
      courseIndex: 2,
      title: 'Project: Solar Cell Efficiency',
      description: 'Experimental setup and data report on photovoltaic output.',
      officialDelta: 41,
      studentDelta: null,
      status: 'not_started',
      submissionStatus: 'not_submitted',
      effortHours: 16.0,
      effortUpdatedDelta: -2,
      lastActivityDelta: null
    },
    {
      courseIndex: 2,
      title: 'Reading: Thermodynamics Primer',
      description: 'Background reading notes on zeroth and first laws.',
      officialDelta: null, // Undated #4
      studentDelta: null,
      status: 'not_started',
      submissionStatus: 'unavailable',
      effortHours: null,
      effortUpdatedDelta: null,
      lastActivityDelta: null
    },

    // --- Course 3: Discrete Structures (11) ---
    {
      courseIndex: 3,
      title: 'Assignment 1: Propositional Logic',
      description: 'Truth tables, logical equivalences, and natural deduction.',
      officialDelta: 2,
      studentDelta: null,
      status: 'already_started',
      submissionStatus: 'not_submitted',
      effortHours: 3.0,
      effortUpdatedDelta: -4,
      lastActivityDelta: -2,
      reports: [
        { remainingHours: 2.5, deltaDays: -3 },
        { remainingHours: 1.5, deltaDays: -2 }
      ]
    },
    {
      courseIndex: 3,
      title: 'Quiz 1: Predicates & Quantifiers',
      description: 'Translating English statements into predicate logic.',
      officialDelta: 6,
      studentDelta: null,
      status: 'not_started',
      submissionStatus: 'not_submitted',
      effortHours: 2.0,
      effortUpdatedDelta: -2,
      lastActivityDelta: null
    },
    {
      courseIndex: 3,
      title: 'Assignment 2: Set Theory & Relations',
      description: 'Equivalence relations, partial orders, and Hasse diagrams.',
      officialDelta: 13,
      studentDelta: null,
      status: 'already_started',
      submissionStatus: 'not_submitted',
      effortHours: 4.5,
      effortUpdatedDelta: -1,
      lastActivityDelta: -3,
      reports: [{ remainingHours: 3.0, deltaDays: -3 }] // older than effortUpdatedAt
    },
    {
      courseIndex: 3,
      title: 'Assignment 3: Mathematical Induction',
      description: 'Weak, strong, and structural induction proof exercises.',
      officialDelta: 18,
      studentDelta: null,
      status: 'not_started',
      submissionStatus: 'not_submitted',
      effortHours: 5.5,
      effortUpdatedDelta: -2,
      lastActivityDelta: null
    },
    {
      courseIndex: 3,
      title: 'Quiz 2: Counting & Pigeonhole',
      description: 'Permutations, combinations, and pigeonhole principle.',
      officialDelta: 23,
      studentDelta: null,
      status: 'not_started',
      submissionStatus: 'unavailable',
      effortHours: 2.5,
      effortUpdatedDelta: -2,
      lastActivityDelta: null
    },
    {
      courseIndex: 3,
      title: 'Midterm: Logic & Proofs',
      description: 'Midterm exam covering logic, sets, functions, and induction.',
      officialDelta: 26,
      studentDelta: null,
      status: 'not_started',
      submissionStatus: 'unavailable',
      effortHours: 12.0,
      effortUpdatedDelta: -2,
      lastActivityDelta: null
    },
    {
      courseIndex: 3,
      title: 'Assignment 4: Recurrence Relations',
      description: 'Solving linear homogeneous and non-homogeneous recurrences.',
      officialDelta: 32,
      studentDelta: null,
      status: 'not_started',
      submissionStatus: 'not_submitted',
      effortHours: 6.0,
      effortUpdatedDelta: -2,
      lastActivityDelta: null
    },
    {
      courseIndex: 3,
      title: 'Assignment 5: Graph Theory',
      description: 'Eulerian paths, Hamiltonian cycles, and planar graphs.',
      officialDelta: 37,
      studentDelta: null,
      status: 'not_started',
      submissionStatus: 'not_submitted',
      effortHours: null,
      effortUpdatedDelta: null,
      lastActivityDelta: null
    },
    {
      courseIndex: 3,
      title: 'Project: Shortest Path Visualizer',
      description: 'Document and trace Dijkstra’s algorithm on sample graphs.',
      officialDelta: 42,
      studentDelta: null,
      status: 'not_started',
      submissionStatus: 'unavailable',
      effortHours: 20.0,
      effortUpdatedDelta: -2,
      lastActivityDelta: null
    },
    {
      courseIndex: 3,
      title: 'Proof Writing Practice Set',
      description: 'Self-study proof exercises on divisibility and modular arithmetic.',
      officialDelta: null,
      studentDelta: 13, // Student-only deadline #2
      status: 'not_started',
      submissionStatus: 'unavailable',
      effortHours: 3.0,
      effortUpdatedDelta: -2,
      lastActivityDelta: null
    },
    {
      courseIndex: 3,
      title: 'Bonus: Boolean Algebra Notes',
      description: 'Optional reading on Karnaugh maps and logic minimization.',
      officialDelta: null, // Undated #5
      studentDelta: null,
      status: 'not_started',
      submissionStatus: 'unavailable',
      effortHours: null,
      effortUpdatedDelta: null,
      lastActivityDelta: null
    },

    // --- Course 4: English Composition (10, NO rating row = unrated) ---
    {
      courseIndex: 4,
      title: 'Diagnostic Essay',
      description: 'Short baseline persuasive essay on technology in education.',
      officialDelta: 1,
      studentDelta: null,
      status: 'finished',
      submissionStatus: 'submitted',
      effortHours: 2.0,
      effortUpdatedDelta: -5,
      lastActivityDelta: -3
    },
    {
      courseIndex: 4,
      title: 'Reading Response 1',
      description: '500-word critical response to assigned rhetorical essay.',
      officialDelta: 4,
      studentDelta: null,
      status: 'already_started',
      submissionStatus: 'not_submitted',
      effortHours: 2.0,
      effortUpdatedDelta: -3,
      lastActivityDelta: -2,
      reports: [{ remainingHours: 1.0, deltaDays: -2 }]
    },
    {
      courseIndex: 4,
      title: 'Grammar & Style Quiz',
      description: 'Online quiz on clause structure, punctuation, and conciseness.',
      officialDelta: 7,
      studentDelta: null,
      status: 'not_started',
      submissionStatus: 'not_submitted',
      effortHours: 1.0,
      effortUpdatedDelta: -2,
      lastActivityDelta: null
    },
    {
      courseIndex: 4,
      title: 'Annotated Bibliography',
      description: 'Collect and annotate 6 peer-reviewed sources for research paper.',
      officialDelta: 15,
      studentDelta: null,
      status: 'already_started',
      submissionStatus: 'not_submitted',
      effortHours: 5.0,
      effortUpdatedDelta: -4,
      lastActivityDelta: -2,
      reports: [
        { remainingHours: 4.5, deltaDays: -3 },
        { remainingHours: 3.5, deltaDays: -2 }
      ]
    },
    {
      courseIndex: 4,
      title: 'Research Paper Outline',
      description: 'Structured thesis statement and section-by-section outline.',
      officialDelta: 19,
      studentDelta: null,
      status: 'not_started',
      submissionStatus: 'not_submitted',
      effortHours: null,
      effortUpdatedDelta: null,
      lastActivityDelta: null
    },
    {
      courseIndex: 4,
      title: 'Midterm: Rhetorical Analysis',
      description: 'Timed in-class rhetorical analysis of an unseen passage.',
      officialDelta: 25,
      studentDelta: null,
      status: 'not_started',
      submissionStatus: 'unavailable',
      effortHours: 4.0,
      effortUpdatedDelta: -2,
      lastActivityDelta: null
    },
    {
      courseIndex: 4,
      title: 'Peer Review Workshop',
      description: 'Provide written feedback on two classmates’ rough drafts.',
      officialDelta: 31,
      studentDelta: null,
      status: 'not_started',
      submissionStatus: 'unavailable',
      effortHours: null,
      effortUpdatedDelta: null,
      lastActivityDelta: null
    },
    {
      courseIndex: 4,
      title: 'Final Research Paper Draft',
      description: 'Complete 2500-word research paper with APA citations.',
      officialDelta: 38,
      studentDelta: null,
      status: 'not_started',
      submissionStatus: 'not_submitted',
      effortHours: 15.0,
      effortUpdatedDelta: -2,
      lastActivityDelta: null
    },
    {
      courseIndex: 4,
      title: 'Oral Presentation Slides',
      description: 'Prepare 8 slides summarizing research findings.',
      officialDelta: 42,
      studentDelta: null,
      status: 'not_started',
      submissionStatus: 'unavailable',
      effortHours: null,
      effortUpdatedDelta: null,
      lastActivityDelta: null
    },
    {
      courseIndex: 4,
      title: 'Portfolio Reflection Notes',
      description: 'Unscheduled brainstorming notes for end-of-term portfolio.',
      officialDelta: null, // Undated #6
      studentDelta: null,
      status: 'not_started',
      submissionStatus: 'unavailable',
      effortHours: null,
      effortUpdatedDelta: null,
      lastActivityDelta: null
    }
  ];

  // Fix Quiz 1: Differentiation Rules (Mathematics) so its report is also at -9 days ago
  // (already noted in comment above; update it cleanly here)
  const mathQuiz1 = specs.find((s) => s.courseIndex === 1 && s.title === 'Quiz 1: Differentiation Rules');
  if (mathQuiz1 && mathQuiz1.reports) {
    mathQuiz1.reports = [
      { remainingHours: 1.0, deltaDays: -11 },
      { remainingHours: 0.5, deltaDays: -9 }
    ];
  }

  // Add a few more assignments with reports so ~20 assignments have reports total
  const extraReportTargets: Array<{ title: string; reports: Array<{ remainingHours: number; deltaDays: number }> }> = [
    {
      title: 'Lab 4',
      reports: [{ remainingHours: 3.0, deltaDays: -3 }] // older than effortUpdatedDelta (-2)
    },
    {
      title: 'Assignment 2: Recursion Toolkit',
      reports: [{ remainingHours: 7.5, deltaDays: -1 }] // newer than effortUpdatedDelta (-2)
    },
    {
      title: 'Assignment 3: Definite Integrals',
      reports: [
        { remainingHours: 6.0, deltaDays: -12 },
        { remainingHours: 5.5, deltaDays: -9 }
      ]
    },
    {
      title: 'Midterm Review Packet',
      reports: [{ remainingHours: 9.0, deltaDays: -9 }]
    },
    {
      title: 'Assignment 4: Integration by Parts',
      reports: [{ remainingHours: 5.0, deltaDays: -9 }]
    },
    {
      title: 'Lab 3', // Applied Physics Lab 3? Wait: CS-101 also has Lab 3; match by courseIndex below if needed
      reports: []
    },
    {
      title: 'Quiz 1: Newton’s Laws',
      reports: [{ remainingHours: 1.5, deltaDays: -3 }] // older than effortUpdatedDelta (-2)
    },
    {
      title: 'Assignment 3: Mathematical Induction',
      reports: [{ remainingHours: 5.0, deltaDays: -1 }] // newer than effortUpdatedDelta (-2)
    },
    {
      title: 'Midterm: Logic & Proofs',
      reports: [{ remainingHours: 11.0, deltaDays: -3 }] // older than effortUpdatedDelta (-2)
    },
    {
      title: 'Final Research Paper Draft',
      reports: [{ remainingHours: 14.0, deltaDays: -1 }] // newer than effortUpdatedDelta (-2)
    },
    {
      title: 'Midterm: Rhetorical Analysis',
      reports: [{ remainingHours: 3.5, deltaDays: -3 }] // older than effortUpdatedDelta (-2)
    }
  ];

  for (const target of extraReportTargets) {
    if (target.reports.length === 0) continue;
    const found = specs.find((s) => s.title === target.title);
    if (found && !found.reports) {
      found.reports = target.reports;
    }
  }

  const assignments: SampleAssignment[] = [];
  const reports: SampleRemainingHoursReport[] = [];

  specs.forEach((s, idx) => {
    const id = makeUuid('a001', idx + 1);
    assignments.push({
      id,
      studentId: DEMO_STUDENT_ID,
      courseId: courses[s.courseIndex].id,
      title: s.title,
      description: s.description,
      officialDeadline: s.officialDelta !== null ? addDays(today, s.officialDelta) : null,
      studentDeadline: s.studentDelta !== null ? addDays(today, s.studentDelta) : null,
      status: s.status,
      submissionStatus: s.submissionStatus,
      effortHours: s.effortHours,
      effortUpdatedAt: s.effortUpdatedDelta !== null ? karachiTs(today, s.effortUpdatedDelta, '09:00:00') : null,
      lastActivityAt:
        s.lastActivityDelta !== null
          ? karachiTs(today, s.lastActivityDelta, s.lastActivityTime ?? '10:00:00')
          : null,
      isSample: true,
      version: 1
    });

    if (s.reports) {
      for (const r of s.reports) {
        reports.push({
          id: makeUuid('b001', reports.length + 1),
          assignmentId: id,
          remainingHours: r.remainingHours,
          reportedAt: karachiTs(today, r.deltaDays, r.time ?? '10:00:00')
        });
      }
    }
  });

  // study_availability: 14 days starting today, source = 'individual'.
  // 4 days blank (2 in today..today+6: +2, +5; 2 in +7..+13: +9, +12).
  // 1 day explicit 0 (+6).
  const availabilitySpec: Array<{ deltaDays: number; hours: number }> = [
    { deltaDays: 0, hours: 2.5 },
    { deltaDays: 1, hours: 3.0 },
    // +2 blank (Unknown)
    { deltaDays: 3, hours: 4.0 },
    { deltaDays: 4, hours: 1.5 },
    // +5 blank (Unknown)
    { deltaDays: 6, hours: 0 }, // explicit 0
    { deltaDays: 7, hours: 3.5 },
    { deltaDays: 8, hours: 2.0 },
    // +9 blank (Unknown)
    { deltaDays: 10, hours: 4.5 },
    { deltaDays: 11, hours: 3.0 },
    // +12 blank (Unknown)
    { deltaDays: 13, hours: 2.5 }
  ];

  const availability: SampleStudyAvailability[] = availabilitySpec.map((a, idx) => ({
    id: makeUuid('d001', idx + 1),
    studentId: DEMO_STUDENT_ID,
    studyDate: addDays(today, a.deltaDays),
    hours: a.hours,
    source: 'individual'
  }));

  // Helper to look up assignment ID by courseIndex & title
  const findAssignmentId = (courseIndex: number, title: string): string => {
    const match = assignments.find((a) => a.courseId === courses[courseIndex].id && a.title === title);
    if (!match) {
      throw new Error(`Missing assignment ${title} in course ${courseIndex}`);
    }
    return match.id;
  };

  // subtasks: 5 assignments with 2-5 subtasks each, trimmed titles, positions 1..n, mix of completed/open
  const subtaskGroups: Array<{ courseIndex: number; title: string; items: Array<{ title: string; done: boolean }> }> = [
    {
      courseIndex: 0,
      title: 'Lab 3',
      items: [
        { title: 'Review function prototype rules', done: true },
        { title: 'Implement pass-by-reference swap', done: true },
        { title: 'Write unit test cases', done: false },
        { title: 'Verify edge cases and submit', done: false }
      ]
    },
    {
      courseIndex: 0,
      title: 'Assignment 1: Grade Calculator',
      items: [
        { title: 'Parse CSV input lines', done: true },
        { title: 'Compute weighted average', done: false },
        { title: 'Format summary table', done: false }
      ]
    },
    {
      courseIndex: 1,
      title: 'Assignment 1: Limits & Continuity',
      items: [
        { title: 'Solve problems 1-4', done: true },
        { title: 'Write epsilon-delta proof for Q5', done: false }
      ]
    },
    {
      courseIndex: 2,
      title: 'Lab 2: Projectile Motion',
      items: [
        { title: 'Tabulate launch angle measurements', done: true },
        { title: 'Plot trajectory curve', done: true },
        { title: 'Compute percentage error', done: false },
        { title: 'Write conclusion paragraph', done: false },
        { title: 'Proofread lab report PDF', done: false }
      ]
    },
    {
      courseIndex: 4,
      title: 'Annotated Bibliography',
      items: [
        { title: 'Find 3 journal articles', done: true },
        { title: 'Find 3 conference papers', done: false },
        { title: 'Draft 150-word annotations', done: false }
      ]
    }
  ];

  const subtasks: SampleSubtask[] = [];
  for (const group of subtaskGroups) {
    const assignmentId = findAssignmentId(group.courseIndex, group.title);
    group.items.forEach((item, posIdx) => {
      subtasks.push({
        id: makeUuid('e001', subtasks.length + 1),
        assignmentId,
        title: item.title.trim(),
        isCompleted: item.done,
        position: posIdx + 1,
        version: 1
      });
    });
  }

  // allocation_overrides: positive 0.5 steps, within that day's availability minus other overrides,
  // and never on blank or 0-hour days.
  // Day +0 has 2.5 h: 1.0 + 1.0 = 2.0 <= 2.5
  // Day +1 has 3.0 h: 1.5 <= 3.0
  // Day +3 has 4.0 h: 2.0 <= 4.0
  const allocationOverrides: SampleAllocationOverride[] = [
    {
      id: makeUuid('f001', 1),
      assignmentId: findAssignmentId(0, 'Lab 3'),
      studyDate: addDays(today, 0),
      hours: 1.0,
      version: 1
    },
    {
      id: makeUuid('f001', 2),
      assignmentId: findAssignmentId(1, 'Assignment 1: Limits & Continuity'),
      studyDate: addDays(today, 0),
      hours: 1.0,
      version: 1
    },
    {
      id: makeUuid('f001', 3),
      assignmentId: findAssignmentId(3, 'Assignment 1: Propositional Logic'),
      studyDate: addDays(today, 1),
      hours: 1.5,
      version: 1
    },
    {
      id: makeUuid('f001', 4),
      assignmentId: findAssignmentId(2, 'Lab 2: Projectile Motion'),
      studyDate: addDays(today, 3),
      hours: 2.0,
      version: 1
    }
  ];

  // study_timer_sessions: STOPPED sessions only, including one with duration 0.
  const timerSessions: SampleTimerSession[] = [
    {
      id: makeUuid('1001', 1),
      studentId: DEMO_STUDENT_ID,
      assignmentId: findAssignmentId(0, 'Lab 3'),
      state: 'stopped',
      startedAt: karachiTs(today, -2, '18:00:00'),
      pausedAt: null,
      pausedSeconds: 300,
      endedAt: karachiTs(today, -2, '18:50:00'),
      durationSeconds: 2700,
      version: 1
    },
    {
      id: makeUuid('1001', 2),
      studentId: DEMO_STUDENT_ID,
      assignmentId: findAssignmentId(0, 'Quiz 1: Control Flow'),
      state: 'stopped',
      startedAt: karachiTs(today, -1, '20:00:00'),
      pausedAt: null,
      pausedSeconds: 0,
      endedAt: karachiTs(today, -1, '20:25:00'),
      durationSeconds: 1500,
      version: 1
    },
    {
      id: makeUuid('1001', 3),
      studentId: DEMO_STUDENT_ID,
      assignmentId: findAssignmentId(1, 'Assignment 1: Limits & Continuity'),
      state: 'stopped',
      startedAt: karachiTs(today, -9, '11:00:00'),
      pausedAt: null,
      pausedSeconds: 0,
      endedAt: karachiTs(today, -9, '11:30:00'),
      durationSeconds: 1800,
      version: 1
    },
    {
      id: makeUuid('1001', 4),
      studentId: DEMO_STUDENT_ID,
      assignmentId: findAssignmentId(2, 'Lab 2: Projectile Motion'),
      state: 'stopped',
      startedAt: karachiTs(today, -1, '16:15:00'),
      pausedAt: null,
      pausedSeconds: 0,
      endedAt: karachiTs(today, -1, '16:15:00'),
      durationSeconds: 0, // 0-second stopped session (DL-43)
      version: 1
    },
    {
      id: makeUuid('1001', 5),
      studentId: DEMO_STUDENT_ID,
      assignmentId: findAssignmentId(4, 'Annotated Bibliography'),
      state: 'stopped',
      startedAt: karachiTs(today, -2, '14:00:00'),
      pausedAt: null,
      pausedSeconds: 120,
      endedAt: karachiTs(today, -2, '14:42:00'),
      durationSeconds: 2400,
      version: 1
    }
  ];

  return {
    today,
    courses,
    ratings,
    assignments,
    reports,
    availability,
    subtasks,
    allocationOverrides,
    timerSessions
  };
}
