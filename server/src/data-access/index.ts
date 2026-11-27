import { Pool } from 'pg';
import { runMigrations } from './migrate';

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
 * E-02 implements the real session persistence.
 */
export const sessions = {
  async issue(_studentId: string): Promise<{ sessionId: string }> {
    throw new Error('sessions.issue not implemented yet (owned by E-02)');
  },
  async validate(_sessionId: string): Promise<{ studentId: string } | null> {
    throw new Error('sessions.validate not implemented yet (owned by E-02)');
  },
  async expire(_sessionId: string): Promise<void> {
    throw new Error('sessions.expire not implemented yet (owned by E-02)');
  }
};

export { runMigrations };
