import type { FastifyInstance } from 'fastify';
import { assignments } from '../../planning-core/index';

/**
 * E-05 read-only routes (api-contract.md §4). The Student always comes from the session.
 * S-16 adds search, filters and sort to GET /api/assignments here; until then the query string
 * is ignored and the list is sorted by deadline, undated last.
 */
export function registerAssignmentRoutes(app: FastifyInstance): void {
  app.get('/api/assignments', async (request) => {
    const list = await assignments.listAssignments(request.student!.studentId);
    return {
      assignments: list,
      filters: { q: '', courseId: null, submissionStatus: null, deadlineFrom: null, deadlineTo: null },
      sort: 'deadline'
    };
  });

  app.get<{ Params: { assignmentId: string } }>('/api/assignments/:assignmentId', async (request, reply) => {
    const detail = await assignments.getAssignmentDetail(request.student!.studentId, request.params.assignmentId);
    if (!detail) {
      return reply.code(404).send({ error: { code: 'NOT_FOUND', message: 'Assignment not found.' } });
    }
    return detail;
  });
}
