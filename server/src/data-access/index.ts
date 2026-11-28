import { Pool } from 'pg';
import { runMigrations } from './migrate';
import { createSessions } from './sessions';

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

export { runMigrations };
