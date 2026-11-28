// `npm run seed:sample` (DL-47). Applies pending migrations, then reloads the demo Student's
// sample data. Needs the database to be running first (`npm run dev:db` in another terminal).
import { closePool, getPool } from '../index';
import { findMigrationsDir, runMigrations } from '../migrate';
import { seedSampleData } from './load-sample-data';

async function main(): Promise<void> {
  const pool = getPool();
  try {
    await runMigrations(pool, findMigrationsDir());
    const result = await seedSampleData(pool);
    console.log(`Sample data reloaded for Student ${result.studentId} (today in Asia/Karachi: ${result.today}).`);
    console.table(result.counts);
  } finally {
    await closePool();
  }
}

main().catch((err) => {
  console.error('Sample data was not loaded:', err instanceof Error ? err.message : err);
  process.exit(1);
});
