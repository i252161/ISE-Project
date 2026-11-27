// Planning Core public interface (agent.md §3, §4.4, DL-44, DL-55)

/**
 * Restricted read-only interface for Notification Scheduler (agent.md §4.4, DL-44).
 * Unused in D4 because Notification Scheduler is deferred.
 */
export const readOnly = {} as const;

// --- Slice exports (one line per slice, DL-55) ---
// [S-01] Availability planning exports
// [S-02] Course rating exports
// [S-03] Start-by date calculation exports
// [S-04] Allocation & shortage exports
// [S-07] Remaining hours exports
// [S-08] Assignment status exports
// [S-09] Course-balance & start-by warning exports
// [S-10] Manual deadline exports
// [S-14] Subtasks exports
// [S-15] Study timer exports
// [S-16] Search, filter & sort exports
// [S-19] Recurring weekly availability baseline exports
