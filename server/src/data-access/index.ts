import { Pool } from 'pg';
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

export { runMigrations };
