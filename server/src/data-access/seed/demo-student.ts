import type { Pool } from 'pg';

// Fixed id so the seed is idempotent and the demo Student is always the same row (DL-27).
export const DEMO_STUDENT_ID = '00000000-0000-4000-8000-0000000000d1';

export async function seedDemoStudent(pool: Pool): Promise<void> {
  await pool.query(
    `INSERT INTO students (id, display_name, time_zone, is_sample)
     VALUES ($1, 'Demo Student', 'Asia/Karachi', true)
     ON CONFLICT (id) DO NOTHING`,
    [DEMO_STUDENT_ID]
  );
}
