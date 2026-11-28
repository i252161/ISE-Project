import type { FastifyInstance } from 'fastify';
import {
  computeStudentPlan,
  recalculateStudentPlan,
  updateAssignmentEffort
} from '../../planning-core/index';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function registerStartByRoutes(app: FastifyInstance): void {
  app.get('/api/planning', async (request, reply) => {
    const studentId = request.student!.studentId;
    const plan = await computeStudentPlan(studentId);
    if (!plan) {
      reply.code(404).send({
        error: { code: 'NOT_FOUND', message: 'Student not found.' }
      });
      return;
    }
    return plan;
  });

  app.put<{ Params: { assignmentId: string } }>(
    '/api/assignments/:assignmentId/effort',
    async (request, reply) => {
      const studentId = request.student!.studentId;
      const { assignmentId } = request.params;

      if (!UUID_REGEX.test(assignmentId)) {
        reply.code(404).send({
          error: { code: 'NOT_FOUND', message: 'Assignment not found.' }
        });
        return;
      }

      const result = await updateAssignmentEffort({
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

      if (result.kind === 'version_conflict') {
        reply.code(409).send({
          error: {
            code: 'VERSION_CONFLICT',
            message: 'This was changed somewhere else. The latest values are shown.'
          },
          current: result.current
        });
        return;
      }

      return {
        assignmentId,
        effortHours: result.effortHours,
        effortUpdatedAt: result.effortUpdatedAt,
        version: result.version,
        planning: result.planning
      };
    }
  );
}
