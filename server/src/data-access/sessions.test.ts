import { createHash } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { closePool, getPool, sessions } from './index';

describe('E-02 sessions group (data-access)', () => {
  beforeAll(async () => {
    delete process.env.SESSION_TTL_DAYS;
    // First call applies migrations and seeds the demo Student.
    await sessions.issue(sessions.demoStudentId);
  });

  afterAll(async () => {
    await closePool();
  });

  it('E-02-AC1 seeds exactly one demo Student, safely re-runnable', async () => {
    await sessions.issue(sessions.demoStudentId);
    const rows = await getPool().query(
      "SELECT id, display_name, is_sample FROM students WHERE is_sample = true AND display_name = 'Demo Student'"
    );
    expect(rows.rowCount).toBe(1);
    expect(rows.rows[0].id).toBe(sessions.demoStudentId);
  });

  it('E-02-AC2 issue returns a 64-hex id and stores only its hash', async () => {
    const { sessionId } = await sessions.issue(sessions.demoStudentId);
    expect(sessionId).toMatch(/^[0-9a-f]{64}$/);
    const raw = await getPool().query('SELECT 1 FROM app_sessions WHERE token_hash = $1', [sessionId]);
    expect(raw.rowCount).toBe(0);
  });

  it('E-02-AC3 validate returns the demo Student for a live session', async () => {
    const { sessionId } = await sessions.issue(sessions.demoStudentId);
    const principal = await sessions.validate(sessionId);
    expect(principal).toEqual({
      studentId: sessions.demoStudentId,
      displayName: 'Demo Student',
      timeZone: 'Asia/Karachi'
    });
  });

  it('E-02-AC4 validate rejects unknown and malformed ids', async () => {
    expect(await sessions.validate('0'.repeat(64))).toBeNull();
    expect(await sessions.validate('not-a-session')).toBeNull();
    expect(await sessions.validate('')).toBeNull();
  });

  it('E-02-AC5 validate rejects an expired session', async () => {
    const { sessionId } = await sessions.issue(sessions.demoStudentId);
    // Target this session's own row: auth.test.ts issues sessions on the same database in parallel.
    const tokenHash = createHash('sha256').update(sessionId).digest('hex');
    const updated = await getPool().query(
      "UPDATE app_sessions SET expires_at = now() - interval '1 second' WHERE token_hash = $1",
      [tokenHash]
    );
    expect(updated.rowCount).toBe(1);
    expect(await sessions.validate(sessionId)).toBeNull();
  });

  it('E-02-AC6 expire invalidates a session', async () => {
    const { sessionId } = await sessions.issue(sessions.demoStudentId);
    expect(await sessions.validate(sessionId)).not.toBeNull();
    await sessions.expire(sessionId);
    expect(await sessions.validate(sessionId)).toBeNull();
  });
});
