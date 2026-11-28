import { Pool } from 'pg';
import { createAssignmentReads } from './assignments';
import { runMigrations } from './migrate';
import { createSessions } from './sessions';
import { createAvailability } from './availability';

let pool: Pool | null = null;

export function getPool(connectionString?: string): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString:
        connectionString ??
        process.env.DATABASE_URL ??
        'postgresql://postgres:postgres@127.0.0.1:5432/postgres'
    });
  }
  return pool;
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

/**
 * Restricted session-management interface for API Layer (agent.md §4.3, DL-44).
 * Implemented in sessions.ts (E-02).
 */
export const sessions = createSessions(() => getPool());

// --- S-01 availability data access (DL-55 marked line) ---
export const availability = createAvailability(() => getPool());

// [S-03] Start-by date & manual effort queries
export { startByQueries } from './start-by/queries';
export type {
  AssignmentEffortSnapshot,
  AssignmentInputRow,
  AvailabilityInputRow,
  PlanningTx,
  StudentPlanningInputs
} from './start-by/queries';

// [S-07] Remaining hours report queries
export { remainingHoursQueries } from './remaining-hours/queries';
export type { RemainingHoursReportRow, InsertRemainingHoursTxResult } from './remaining-hours/queries';

/**
 * Read-only assignment queries for Planning Core (E-05). Not for the API Layer (agent.md §4.3).
 */
export const assignmentReads = createAssignmentReads(() => getPool());

export type { AssignmentRecord } from './assignments';
export { runMigrations };
