import type { Pool } from 'pg';

export interface AvailabilityRow {
  study_date: string;
  hours: string | number;
  source: 'individual' | 'baseline';
}

export function createAvailability(getPool: () => Pool) {
  return {
    async getRange(studentId: string, from: string, days: number): Promise<AvailabilityRow[]> {
      const result = await getPool().query<AvailabilityRow>(
        `SELECT study_date::text AS study_date, hours::text, source
           FROM study_availability
          WHERE student_id = $1
            AND study_date >= $2::date
            AND study_date < ($2::date + $3::integer)`,
        [studentId, from, days]
      );
      return result.rows;
    },

    async upsert(studentId: string, studyDate: string, hours: number, updatedAt: string): Promise<void> {
      await getPool().query(
        `INSERT INTO study_availability (student_id, study_date, hours, source, updated_at)
         VALUES ($1, $2::date, $3, 'individual', $4::timestamptz)
         ON CONFLICT (student_id, study_date)
         DO UPDATE SET hours = EXCLUDED.hours,
                       source = 'individual',
                       updated_at = EXCLUDED.updated_at`,
        [studentId, studyDate, hours, updatedAt]
      );
    },

    async clear(studentId: string, studyDate: string): Promise<void> {
      await getPool().query(
        'DELETE FROM study_availability WHERE student_id = $1 AND study_date = $2::date',
        [studentId, studyDate]
      );
    }
  };
}
