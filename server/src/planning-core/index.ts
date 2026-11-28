// Planning Core public interface (agent.md §3, §4.4, DL-44, DL-55)

/**
 * Restricted read-only interface for Notification Scheduler (agent.md §4.4, DL-44).
 * Unused in D4 because Notification Scheduler is deferred.
 */
export const readOnly = {} as const;

// Foundation placeholder recalculation (DL-55, data-model.md §3). S-07 and S-10 call it;
// S-03 replaces the body of recalculate.ts with the real R1-B calculation.
export { recalculateStudentPlan } from './recalculate';

// --- Slice exports (one line per slice, DL-55) ---
export * as availability from './availability/index';
// [S-02] Course rating exports
// [S-03] Start-by date calculation exports
export { computeStudentPlan, updateAssignmentEffort } from './start-by/service';
export type { AssignmentPlanningResult, PlanningState, StudentPlanResult } from './start-by/r1b';
// [S-04] Allocation & shortage exports
// [S-07] Remaining hours exports
// [S-08] Assignment status exports
// [S-09] Course-balance & start-by warning exports
// [S-10] Manual deadline exports
// [S-14] Subtasks exports
// [S-15] Study timer exports
// [S-16] Search, filter & sort exports
// [S-19] Recurring weekly availability baseline exports
