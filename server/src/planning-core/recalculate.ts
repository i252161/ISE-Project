/**
 * PLACEHOLDER (DL-55). Recalculates the Student's derived plan from stored inputs.
 *
 * Callers (S-07, S-10) call this after a Student edit, in the same transaction as the edit
 * once S-03 gives it real work (agent.md §5, "Recalculation"). Until S-03 merges it does
 * nothing, so derived values (start-by, shortage, allocation suggestions) are not produced.
 *
 * S-03 replaces this file's body. Keep the name and signature: other slices depend on it.
 * Integration check I-1 confirms this placeholder is gone.
 */
export async function recalculateStudentPlan(_studentId: string): Promise<void> {
  // Intentionally empty until S-03.
}
