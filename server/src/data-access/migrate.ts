import fs from 'node:fs/promises';
import path from 'node:path';
import type { Pool } from 'pg';

const MIGRATION_PATTERN = /^\d{4}_[a-z0-9_]+\.sql$/i;

// Any fixed number works; it only has to be the same everywhere this runner is used.
// One lock for the whole run, so two callers (two test files, or a restart racing a
// second process) never apply the same migration at once. Without it, parallel
// `CREATE TABLE IF NOT EXISTS` fails with a duplicate pg_type key.
const MIGRATION_LOCK_KEY = 2026112801;

/**
 * Runs unapplied versioned SQL migrations from data-access/migrations/ in order.
 * Each file is applied in its own transaction. Safe to call concurrently.
 */
export async function runMigrations(
  pool: Pool,
  migrationsDir: string = path.join(__dirname, 'migrations')
): Promise<string[]> {
  let entries: string[] = [];
  try {
    entries = await fs.readdir(migrationsDir);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw err;
    }
  }

  const migrationFiles = entries
    .filter((name) => MIGRATION_PATTERN.test(name))
    .sort();

  const client = await pool.connect();
  try {
    await client.query('SELECT pg_advisory_lock($1)', [MIGRATION_LOCK_KEY]);
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS schema_migrations (
          filename TEXT PRIMARY KEY,
          applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);

      const appliedResult = await client.query<{ filename: string }>(
        'SELECT filename FROM schema_migrations'
      );
      const applied = new Set(appliedResult.rows.map((r) => r.filename));

      const newlyApplied: string[] = [];
      for (const file of migrationFiles) {
        if (applied.has(file)) {
          continue;
        }
        const sql = await fs.readFile(path.join(migrationsDir, file), 'utf8');
        try {
          await client.query('BEGIN');
          await client.query(sql);
          await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [file]);
          await client.query('COMMIT');
        } catch (err) {
          await client.query('ROLLBACK');
          throw err;
        }
        newlyApplied.push(file);
      }
      return newlyApplied;
    } finally {
      await client.query('SELECT pg_advisory_unlock($1)', [MIGRATION_LOCK_KEY]);
    }
  } finally {
    client.release();
  }
}
