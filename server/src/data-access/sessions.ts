import { createHash, randomBytes } from 'node:crypto';
import type { Pool } from 'pg';
import { findMigrationsDir, runMigrations } from './migrate';
import { DEMO_STUDENT_ID, seedDemoStudent } from './seed/demo-student';

export interface SessionPrincipal {
  studentId: string;
  displayName: string;
  timeZone: string;
}

const SESSION_ID_PATTERN = /^[0-9a-f]{64}$/;
const DEFAULT_TTL_DAYS = 7;

function hashSessionId(sessionId: string): string {
  return createHash('sha256').update(sessionId).digest('hex');
}

function ttlSeconds(): number {
  const days = Number(process.env.SESSION_TTL_DAYS ?? DEFAULT_TTL_DAYS);
  const safeDays = Number.isFinite(days) && days > 0 ? days : DEFAULT_TTL_DAYS;
  return safeDays * 24 * 60 * 60;
}

const readyByPool = new WeakMap<Pool, Promise<void>>();

function ensureReady(pool: Pool): Promise<void> {
  let ready = readyByPool.get(pool);
  if (!ready) {
    ready = (async () => {
      await runMigrations(pool, findMigrationsDir());
      await seedDemoStudent(pool);
    })();
    ready.catch(() => readyByPool.delete(pool));
    readyByPool.set(pool, ready);
  }
  return ready;
}

/**
 * The only Data Access Layer surface the API Layer may use (agent.md §4.3, DL-44).
 * Session operations: issue, validate, expire. Nothing else.
 */
export function createSessions(getPool: () => Pool) {
  return {
    /** Id of the seeded demo Student (DL-27). */
    demoStudentId: DEMO_STUDENT_ID,

    async issue(studentId: string): Promise<{ sessionId: string; expiresAt: Date }> {
      const pool = getPool();
      await ensureReady(pool);
      await pool.query('DELETE FROM app_sessions WHERE expires_at <= now()');

      const sessionId = randomBytes(32).toString('hex');
      const result = await pool.query<{ expires_at: Date }>(
        `INSERT INTO app_sessions (token_hash, student_id, expires_at)
         VALUES ($1, $2, now() + make_interval(secs => $3))
         RETURNING expires_at`,
        [hashSessionId(sessionId), studentId, ttlSeconds()]
      );
      return { sessionId, expiresAt: (result.rows[0] as { expires_at: Date }).expires_at };
    },

    async validate(sessionId: string): Promise<SessionPrincipal | null> {
      if (!SESSION_ID_PATTERN.test(sessionId)) {
        return null;
      }
      const pool = getPool();
      await ensureReady(pool);
      const result = await pool.query<{
        student_id: string;
        display_name: string;
        time_zone: string;
      }>(
        `SELECT s.student_id, st.display_name, st.time_zone
           FROM app_sessions s
           JOIN students st ON st.id = s.student_id
          WHERE s.token_hash = $1 AND s.expires_at > now()`,
        [hashSessionId(sessionId)]
      );
      const row = result.rows[0];
      if (!row) {
        return null;
      }
      return { studentId: row.student_id, displayName: row.display_name, timeZone: row.time_zone };
    },

    async expire(sessionId: string): Promise<void> {
      if (!SESSION_ID_PATTERN.test(sessionId)) {
        return;
      }
      const pool = getPool();
      await ensureReady(pool);
      await pool.query('DELETE FROM app_sessions WHERE token_hash = $1', [hashSessionId(sessionId)]);
    }
  };
}
