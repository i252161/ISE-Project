import fs from 'node:fs/promises';
import net from 'node:net';
import path from 'node:path';
import EmbeddedPostgres from 'embedded-postgres';
import { Pool } from 'pg';
import { findMigrationsDir, runMigrations } from './migrate';
import { seedSampleData } from './seed/load-sample-data';

/**
 * E-04: the demo Student's sample data is loaded ONCE here, before any test file runs, so slice
 * tests can read it without racing each other (test files run in parallel on one database).
 * Test files must not reload the demo Student's sample data themselves; use a fresh Student.
 * The date is fixed so results are repeatable, and is clear of the dates other tests write
 * for the demo Student (S-01 uses 2026-11-27 to 2026-12-03). Read it from SAMPLE_DATA_TODAY.
 */
export const SAMPLE_DATA_NOW = new Date('2027-01-11T07:00:00Z'); // 12:00 in Karachi, Monday

async function getFreePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.unref();
    srv.on('error', reject);
    srv.listen(0, '127.0.0.1', () => {
      const addr = srv.address();
      if (addr && typeof addr === 'object') {
        const { port } = addr;
        srv.close(() => resolve(port));
      } else {
        srv.close(() => reject(new Error('Could not allocate free port')));
      }
    });
  });
}

export async function setup(): Promise<() => Promise<void>> {
  const databaseDir = path.resolve(__dirname, `../../.pgdata/test-${process.pid}-${Date.now()}`);
  const port = await getFreePort();

  const pg = new EmbeddedPostgres({
    databaseDir,
    user: 'postgres',
    password: 'postgres',
    port,
    persistent: false
  });

  await pg.initialise();
  await pg.start();

  process.env.DATABASE_URL = `postgresql://postgres:postgres@127.0.0.1:${port}/postgres`;

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    await runMigrations(pool, findMigrationsDir());
    const seeded = await seedSampleData(pool, { now: SAMPLE_DATA_NOW });
    process.env.SAMPLE_DATA_TODAY = seeded.today;
  } catch (err) {
    await pool.end();
    await pg.stop();
    throw err;
  }
  await pool.end();

  return async () => {
    await pg.stop();
    try {
      await fs.rm(databaseDir, { recursive: true, force: true, maxRetries: 3, retryDelay: 200 });
    } catch {
      // Ignore transient Windows file lock on temp test data dir
    }
  };
}
