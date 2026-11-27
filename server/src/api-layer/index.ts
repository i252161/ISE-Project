import Fastify, { FastifyInstance } from 'fastify';
import cookie from '@fastify/cookie';
import { sessions } from '../data-access/index';

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({ logger: true });

  await app.register(cookie);

  app.get('/api/health', async () => {
    return { status: 'ok', sessionsReady: typeof sessions.validate === 'function' };
  });

  // --- Slice route registration (one line per slice, DL-55) ---
  // [S-01] Availability routes
  // [S-02] Course rating routes
  // [S-03] Start-by date & manual effort routes
  // [S-04] Allocation & shortage suggestion routes
  // [S-07] Remaining hours progress report routes
  // [S-08] Assignment status routes
  // [S-09] Course-balance & start-by warning routes
  // [S-10] Manual deadline routes
  // [S-14] Subtasks routes
  // [S-15] Study timer routes
  // [S-16] Search, filter & sort routes
  // [S-19] Recurring weekly availability baseline routes

  return app;
}

export async function startServer(): Promise<void> {
  const app = await buildApp();
  const port = Number(process.env.PORT ?? 3000);
  const host = process.env.HOST ?? '127.0.0.1';
  await app.listen({ port, host });
}
