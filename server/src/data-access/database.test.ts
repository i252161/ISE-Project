import { afterAll, describe, expect, it } from 'vitest';
import { closePool, getPool, runMigrations } from './index';

describe('data-access embedded PostgreSQL', () => {
  afterAll(async () => {
    await closePool();
  });

  it('executes SELECT 1 against the real embedded database', async () => {
    const pool = getPool();
    const result = await pool.query<{ ok: number }>('SELECT 1 AS ok');
    expect(result.rows[0]?.ok).toBe(1);
  });

  it('runs the migration runner and ensures schema_migrations exists', async () => {
    const pool = getPool();
    const applied = await runMigrations(pool);
    expect(Array.isArray(applied)).toBe(true);

    const tableCheck = await pool.query<{ exists: string | null }>(
      "SELECT to_regclass('public.schema_migrations')::text AS exists"
    );
    expect(tableCheck.rows[0]?.exists).toBe('schema_migrations');
  });
});
