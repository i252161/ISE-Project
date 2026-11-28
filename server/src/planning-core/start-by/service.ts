import { startByQueries, type AssignmentEffortSnapshot, type PlanningTx } from '../../data-access/index';
import {
  calculateR1BPlan,
  type AssignmentPlanningResult,
  type StudentPlanResult
} from './r1b';

export type ValidationFailure = {
  code: 'VALIDATION_ERROR';
  message: string;
  fieldErrors: Record<string, string>;
};

export function validateEffortBody(body: unknown):
  | { ok: true; hours: number | null; version: number }
  | { ok: false; error: ValidationFailure } {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return {
      ok: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request body must be a JSON object.',
        fieldErrors: { body: 'Expected JSON object with hours and version.' }
      }
    };
  }

  const record = body as Record<string, unknown>;
  const fieldErrors: Record<string, string> = {};

  if (typeof record.version !== 'number' || !Number.isInteger(record.version) || record.version < 1) {
    fieldErrors.version = 'Version must be a positive integer.';
  }

  const rawHours = record.hours;
  let parsedHours: number | null = null;

  if (rawHours === null || rawHours === '') {
    parsedHours = null;
  } else if (typeof rawHours !== 'number' || !Number.isFinite(rawHours)) {
    fieldErrors.hours = 'Enter 0.5 to 200 hours in 0.5-hour steps, or leave blank.';
  } else if (rawHours < 0.5 || rawHours > 200) {
    fieldErrors.hours = 'Enter 0.5 to 200 hours in 0.5-hour steps.';
  } else {
    const doubled = rawHours * 2;
    if (Math.abs(doubled - Math.round(doubled)) > 1e-9) {
      fieldErrors.hours = 'Hours must be in 0.5-hour steps.';
    } else {
      parsedHours = Math.round(doubled) / 2;
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      ok: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: Object.values(fieldErrors)[0]!,
        fieldErrors
      }
    };
  }

  return {
    ok: true,
    hours: parsedHours,
    version: record.version as number
  };
}

export async function computeStudentPlan(
  studentId: string,
  options?: { today?: string; tx?: PlanningTx }
): Promise<StudentPlanResult | null> {
  const inputs = await startByQueries.getStudentPlanningInputs(studentId, options?.tx);
  if (!inputs) {
    return null;
  }

  return calculateR1BPlan({
    studentId: inputs.studentId,
    timeZone: inputs.timeZone,
    today: options?.today,
    assignments: inputs.assignments,
    availability: inputs.availability
  });
}

export type UpdateEffortServiceResult =
  | { kind: 'validation_error'; error: ValidationFailure }
  | { kind: 'not_found' }
  | { kind: 'version_conflict'; current: AssignmentEffortSnapshot }
  | {
      kind: 'ok';
      effortHours: number | null;
      effortUpdatedAt: string;
      version: number;
      planning: AssignmentPlanningResult;
    };

export async function updateAssignmentEffort(params: {
  studentId: string;
  assignmentId: string;
  body: unknown;
  recalculate: (studentId: string, tx?: PlanningTx) => Promise<StudentPlanResult | null>;
}): Promise<UpdateEffortServiceResult> {
  const validated = validateEffortBody(params.body);
  if (!validated.ok) {
    return { kind: 'validation_error', error: validated.error };
  }

  const txResult = await startByQueries.updateAssignmentEffortInTx({
    studentId: params.studentId,
    assignmentId: params.assignmentId,
    hours: validated.hours,
    expectedVersion: validated.version,
    recalculate: (tx) => params.recalculate(params.studentId, tx)
  });

  if (txResult.kind === 'not_found') {
    return { kind: 'not_found' };
  }
  if (txResult.kind === 'version_conflict') {
    return { kind: 'version_conflict', current: txResult.current };
  }

  const planning = txResult.plan?.assignments.find((a) => a.assignmentId === params.assignmentId);
  if (!planning) {
    return { kind: 'not_found' };
  }

  return {
    kind: 'ok',
    effortHours: txResult.effortHours,
    effortUpdatedAt: txResult.effortUpdatedAt,
    version: txResult.version,
    planning
  };
}
