import fs from 'node:fs/promises';
import path from 'node:path';
import type { Pool } from 'pg';

const MIGRATION_PATTERN = /^\d{4}_[a-z0-9_]+\.sql$/i;

/**
 * Runs unapplied versioned SQL migrations from data-access/migrations/ in order.
 */
export async function runMigrations(
  pool: Pool,
  migrationsDir: string = path.join(__dirname, 'migrations')
): Promise<string[]> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  let entries: string[] = [];
  try {
    entries = await fs.readdir(migrationsDir);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    throw err;
  }

  const migrationFiles = entries
    .filter((name) => MIGRATION_PATTERN.test(name))
    .sort();

  const appliedResult = await pool.query<{ filename: string }>(
    'SELECT filename FROM schema_migrations'
  );
  const applied = new Set(appliedResult.rows.map((r) => r.filename));

  const newlyApplied: string[] = [];
  for (const file of migrationFiles) {
    if (applied.has(file)) {
      continue;
    }

    const sql = await fs.readFile(path.join(migrationsDir, file), 'utf8');
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [file]);
      await client.query('COMMIT');
      newlyApplied.push(file);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  return newlyApplied;
}
