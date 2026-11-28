import type { PlanningTx } from '../data-access/index';
import type { StudentPlanResult } from './start-by/r1b';
import { computeStudentPlan } from './start-by/service';

/**
 * Recalculates the Student's derived plan from stored inputs using rule R1-B.
 *
 * Callers (S-03, S-07, S-10) call this after a Student edit, in the same transaction
 * as the edit (agent.md §5, "Recalculation"). Derived values are not persisted to the
 * database; callers that ignore the return value continue to work unchanged.
 */
export async function recalculateStudentPlan(
  studentId: string,
  tx?: PlanningTx
): Promise<StudentPlanResult | null> {
  return computeStudentPlan(studentId, { tx });
}
