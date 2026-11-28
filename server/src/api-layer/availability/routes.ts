import type { FastifyInstance } from 'fastify';
import { availability } from '../../planning-core/index';

export interface AvailabilityRouteOptions {
  clock?: () => Date;
}

export function registerAvailabilityRoutes(app: FastifyInstance, options: AvailabilityRouteOptions = {}): void {
  app.get('/api/availability', async (request, reply) => {
    const query = request.query as { from?: unknown; days?: unknown };
    const now = options.clock ? options.clock() : new Date();
    const today = availability.todayInKarachi(now);
    const from = typeof query.from === 'string' ? query.from : today;
    const days = query.days === undefined ? 7 : Number(query.days);

    try {
      return await availability.getAvailability(request.student!.studentId, from, days, now);
    } catch (error) {
      if (error instanceof availability.ValidationError) {
        return reply.code(400).send({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'The availability query is invalid.',
            fieldErrors: error.fieldErrors
          }
        });
      }
      throw error;
    }
  });

  app.put<{ Params: { date: string }; Body: { hours?: unknown } }>('/api/availability/:date', async (request, reply) => {
    const now = options.clock ? options.clock() : new Date();
    try {
      const body = request.body;
      if (!body || typeof body !== 'object' || Array.isArray(body)) {
        throw new availability.ValidationError({ hours: 'Enter 0 to 24 hours in 0.5-hour steps.' });
      }
      if (!Object.prototype.hasOwnProperty.call(body, 'hours')) {
        throw new availability.ValidationError({ hours: 'Enter 0 to 24 hours in 0.5-hour steps.' });
      }
      return await availability.putAvailability(
        request.student!.studentId,
        request.params.date,
        body.hours,
        now
      );
    } catch (error) {
      if (error instanceof availability.ValidationError) {
        return reply.code(400).send({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'The availability value is invalid.',
            fieldErrors: error.fieldErrors
          }
        });
      }
      throw error;
    }
  });
}
