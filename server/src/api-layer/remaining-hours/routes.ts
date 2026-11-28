import type { FastifyInstance } from 'fastify';
import { recalculateStudentPlan, submitRemainingHours } from '../../planning-core/index';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function registerRemainingHoursRoutes(app: FastifyInstance): void {
  app.post<{ Params: { assignmentId: string } }>(
    '/api/assignments/:assignmentId/remaining-hours',
    async (request, reply) => {
      const studentId = request.student!.studentId;
      const { assignmentId } = request.params;

      if (!UUID_REGEX.test(assignmentId)) {
        reply.code(404).send({
          error: { code: 'NOT_FOUND', message: 'Assignment not found.' }
        });
        return;
      }

      const result = await submitRemainingHours({
        studentId,
        assignmentId,
        body: request.body,
        recalculate: recalculateStudentPlan
      });

      if (result.kind === 'validation_error') {
        reply.code(400).send({ error: result.error });
        return;
      }

      if (result.kind === 'not_found') {
        reply.code(404).send({
          error: { code: 'NOT_FOUND', message: 'Assignment not found.' }
        });
        return;
      }

      return {
        id: result.report.id,
        assignmentId: result.report.assignmentId,
        remainingHours: result.report.remainingHours,
        reportedAt: result.report.reportedAt,
        planning: result.planning
      };
    }
  );
}
