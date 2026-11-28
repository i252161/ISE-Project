import path from 'node:path';
import type { Pool } from 'pg';
import { closePool, getPool } from '../index';
import { runMigrations } from '../migrate';
import { DEMO_STUDENT_ID, seedDemoStudent } from './demo-student';
import { buildSampleDataset, type SampleDataset } from './sample-data';

export interface SeedSampleResult {
  today: string;
  counts: {
    courses: number;
    ratings: number;
    assignments: number;
    reports: number;
    availability: number;
    subtasks: number;
    allocationOverrides: number;
    timerSessions: number;
  };
}

/**
 * Idempotently reloads all sample data for the demo Student inside one transaction.
 * Never deletes or recreates the demo Student row (sessions reference it with ON DELETE CASCADE).
 */
export async function seedSampleData(pool: Pool, now: Date = new Date()): Promise<SeedSampleResult> {
  await seedDemoStudent(pool);
  const dataset: SampleDataset = buildSampleDataset(now);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Deleting the demo Student's courses cascades to assignments, ratings, reports,
    // allocation_overrides, subtasks, and study_timer_sessions.
    await client.query('DELETE FROM courses WHERE student_id = $1', [DEMO_STUDENT_ID]);
    await client.query('DELETE FROM study_availability WHERE student_id = $1', [DEMO_STUDENT_ID]);

    for (const c of dataset.courses) {
      await client.query(
        `INSERT INTO courses (id, student_id, name, code, is_sample)
         VALUES ($1, $2, $3, $4, $5)`,
        [c.id, c.studentId, c.name, c.code, c.isSample]
      );
    }

    for (const r of dataset.ratings) {
      await client.query(
        `INSERT INTO course_skill_ratings (id, student_id, course_id, rating)
         VALUES ($1, $2, $3, $4)`,
        [r.id, r.studentId, r.courseId, r.rating]
      );
    }

    for (const a of dataset.assignments) {
      await client.query(
        `INSERT INTO assignments (
           id, student_id, course_id, title, description,
           official_deadline, student_deadline, status, submission_status,
           effort_hours, effort_updated_at, last_activity_at, is_sample, version
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
        [
          a.id,
          a.studentId,
          a.courseId,
          a.title,
          a.description,
          a.officialDeadline,
          a.studentDeadline,
          a.status,
          a.submissionStatus,
          a.effortHours,
          a.effortUpdatedAt,
          a.lastActivityAt,
          a.isSample,
          a.version
        ]
      );
    }

    for (const rep of dataset.reports) {
      await client.query(
        `INSERT INTO remaining_hours_reports (id, assignment_id, remaining_hours, reported_at)
         VALUES ($1, $2, $3, $4)`,
        [rep.id, rep.assignmentId, rep.remainingHours, rep.reportedAt]
      );
    }

    for (const av of dataset.availability) {
      await client.query(
        `INSERT INTO study_availability (id, student_id, study_date, hours, source)
         VALUES ($1, $2, $3, $4, $5)`,
        [av.id, av.studentId, av.studyDate, av.hours, av.source]
      );
    }

    for (const st of dataset.subtasks) {
      await client.query(
        `INSERT INTO subtasks (id, assignment_id, title, is_completed, position, version)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [st.id, st.assignmentId, st.title, st.isCompleted, st.position, st.version]
      );
    }

    for (const ov of dataset.allocationOverrides) {
      await client.query(
        `INSERT INTO allocation_overrides (id, assignment_id, study_date, hours, version)
         VALUES ($1, $2, $3, $4, $5)`,
        [ov.id, ov.assignmentId, ov.studyDate, ov.hours, ov.version]
      );
    }

    for (const ts of dataset.timerSessions) {
      await client.query(
        `INSERT INTO study_timer_sessions (
           id, student_id, assignment_id, state,
           started_at, paused_at, paused_seconds, ended_at, duration_seconds, version
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          ts.id,
          ts.studentId,
          ts.assignmentId,
          ts.state,
          ts.startedAt,
          ts.pausedAt,
          ts.pausedSeconds,
          ts.endedAt,
          ts.durationSeconds,
          ts.version
        ]
      );
    }

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }

  return {
    today: dataset.today,
    counts: {
      courses: dataset.courses.length,
      ratings: dataset.ratings.length,
      assignments: dataset.assignments.length,
      reports: dataset.reports.length,
      availability: dataset.availability.length,
      subtasks: dataset.subtasks.length,
      allocationOverrides: dataset.allocationOverrides.length,
      timerSessions: dataset.timerSessions.length
    }
  };
}

if (require.main === module) {
  const pool = getPool();
  const migrationsDir = path.resolve(__dirname, '../../..', 'src/data-access/migrations');
  runMigrations(pool, migrationsDir)
    .then(() => seedSampleData(pool))
    .then((result) => {
      console.log(`Sample data seeded for ${DEMO_STUDENT_ID} (Asia/Karachi today: ${result.today}):`);
      console.log(JSON.stringify(result.counts, null, 2));
      return closePool();
    })
    .catch(async (err) => {
      console.error('Failed to seed sample data:', err);
      await closePool();
      process.exit(1);
    });
}
