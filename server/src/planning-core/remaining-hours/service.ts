import { remainingHoursQueries } from '../../data-access/index';
import type { PlanningTx } from '../../data-access/index';
import type { AssignmentPlanningResult, StudentPlanResult } from '../start-by/r1b';

export type RemainingHoursValidationFailure = {
  code: 'VALIDATION_ERROR';
  message: string;
  fieldErrors: Record<string, string>;
};

/**
 * Validates the POST /api/assignments/:id/remaining-hours request body.
 * remainingHours: 0–200 in 0.5 steps (0 is allowed; negative and 200.5 are rejected).
 * DL-38, DL-49, api-contract.md §7.
 */
export function validateRemainingHoursBody(body: unknown):
  | { ok: true; remainingHours: number }
  | { ok: false; error: RemainingHoursValidationFailure } {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return {
      ok: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request body must be a JSON object.',
        fieldErrors: { remainingHours: 'Enter 0 to 200 hours in 0.5-hour steps.' }
      }
    };
  }

  const record = body as Record<string, unknown>;
  const raw = record['remainingHours'];

  if (raw === undefined || raw === null || raw === '') {
    return {
      ok: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'remainingHours is required.',
        fieldErrors: { remainingHours: 'Enter 0 to 200 hours in 0.5-hour steps.' }
      }
    };
  }

  if (typeof raw !== 'number' || !Number.isFinite(raw)) {
    return {
      ok: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Enter 0 to 200 hours in 0.5-hour steps.',
        fieldErrors: { remainingHours: 'Enter 0 to 200 hours in 0.5-hour steps.' }
      }
    };
  }

  if (raw < 0 || raw > 200) {
    return {
      ok: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Enter 0 to 200 hours in 0.5-hour steps.',
        fieldErrors: { remainingHours: 'Enter 0 to 200 hours in 0.5-hour steps.' }
      }
    };
  }

  const doubled = raw * 2;
  if (Math.abs(doubled - Math.round(doubled)) > 1e-9) {
    return {
      ok: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Hours must be in 0.5-hour steps.',
        fieldErrors: { remainingHours: 'Hours must be in 0.5-hour steps.' }
      }
    };
  }

  return { ok: true, remainingHours: Math.round(doubled) / 2 };
}

export interface RemainingHoursReport {
  id: string;
  assignmentId: string;
  remainingHours: number;
  reportedAt: string;
}

export type SubmitRemainingHoursResult =
  | { kind: 'validation_error'; error: RemainingHoursValidationFailure }
  | { kind: 'not_found' }
  | {
      kind: 'ok';
      report: RemainingHoursReport;
      planning: AssignmentPlanningResult;
    };

export async function submitRemainingHours(params: {
  studentId: string;
  assignmentId: string;
  body: unknown;
  recalculate: (studentId: string, tx?: PlanningTx) => Promise<StudentPlanResult | null>;
}): Promise<SubmitRemainingHoursResult> {
  const validated = validateRemainingHoursBody(params.body);
  if (!validated.ok) {
    return { kind: 'validation_error', error: validated.error };
  }

  const txResult = await remainingHoursQueries.insertRemainingHoursReportInTx({
    studentId: params.studentId,
    assignmentId: params.assignmentId,
    remainingHours: validated.remainingHours,
    recalculate: (tx) => params.recalculate(params.studentId, tx)
  });

  if (txResult.kind === 'not_found') {
    return { kind: 'not_found' };
  }

  const plan = txResult.plan as StudentPlanResult | null;
  const planning = plan?.assignments.find((a) => a.assignmentId === params.assignmentId);
  if (!planning) {
    return { kind: 'not_found' };
  }

  return {
    kind: 'ok',
    report: txResult.report,
    planning
  };
}
