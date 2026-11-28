import { getPool } from '../index';
import type { PlanningTx } from '../start-by/queries';

/** A saved remaining-hours report (S-07, DL-38). */
export interface RemainingHoursReportRow {
  id: string;
  assignmentId: string;
  remainingHours: number;
  reportedAt: string;
}

export type InsertRemainingHoursTxResult<TPlan> =
  | { kind: 'not_found' }
  | { kind: 'ok'; report: RemainingHoursReportRow; plan: TPlan };

export const remainingHoursQueries = {
  /**
   * Saves a remaining-hours report in one transaction (ADR-002 rule 1):
   * 1. checks that the assignment belongs to the Student (otherwise nothing is written);
   * 2. inserts the report with a server timestamp;
   * 3. records the activity on the assignment (DL-34) WITHOUT changing its version
   *    (api-contract.md §1.1: server bookkeeping never makes the client's version stale);
   * 4. recalculates the plan inside the same transaction.
   */
  async insertRemainingHoursReportInTx<TPlan>(params: {
    studentId: string;
    assignmentId: string;
    remainingHours: number;
    recalculate: (tx: PlanningTx) => Promise<TPlan>;
  }): Promise<InsertRemainingHoursTxResult<TPlan>> {
    const client = await getPool().connect();
    try {
      await client.query('BEGIN');

      const owned = await client.query<{ id: string }>(
        `SELECT id FROM assignments WHERE id = $1 AND student_id = $2 FOR UPDATE`,
        [params.assignmentId, params.studentId]
      );
      if (!owned.rows[0]) {
        await client.query('ROLLBACK');
        return { kind: 'not_found' };
      }

      const inserted = await client.query<{
        id: string;
        assignment_id: string;
        remaining_hours: string;
        reported_at: Date;
      }>(
        `INSERT INTO remaining_hours_reports (assignment_id, remaining_hours, reported_at)
         VALUES ($1, $2, now())
         RETURNING id, assignment_id, remaining_hours, reported_at`,
        [params.assignmentId, params.remainingHours]
      );

      await client.query(
        `UPDATE assignments SET last_activity_at = now() WHERE id = $1 AND student_id = $2`,
        [params.assignmentId, params.studentId]
      );

      const plan = await params.recalculate(client as unknown as PlanningTx);
      await client.query('COMMIT');

      const row = inserted.rows[0]!;
      return {
        kind: 'ok',
        report: {
          id: row.id,
          assignmentId: row.assignment_id,
          remainingHours: Number(row.remaining_hours),
          reportedAt: row.reported_at.toISOString()
        },
        plan
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
};
