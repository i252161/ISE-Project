import Fastify, { FastifyInstance } from 'fastify';
import cookie from '@fastify/cookie';
import { sessions } from '../data-access/index';
import { registerStartByRoutes } from './start-by/routes';

// The API Layer reaches the Data Access Layer only through `sessions` (agent.md §4.3, DL-44).
type SessionPrincipal = NonNullable<Awaited<ReturnType<typeof sessions.validate>>>;

declare module 'fastify' {
  interface FastifyRequest {
    student: SessionPrincipal | null;
  }
}

const SESSION_COOKIE = 'sid';

// Everything else requires a valid session (E-02).
const PUBLIC_ROUTES = new Set(['GET /api/health', 'POST /api/demo/session']);

export async function buildApp(options: { logger?: boolean } = {}): Promise<FastifyInstance> {
  const app = Fastify({ logger: options.logger ?? true });

  await app.register(cookie);

  app.decorateRequest('student', null);

  app.addHook('onRequest', async (request, reply) => {
    const routeKey = `${request.method} ${request.url.split('?')[0]}`;
    if (PUBLIC_ROUTES.has(routeKey)) {
      return;
    }
    const sessionId = request.cookies[SESSION_COOKIE];
    const principal = sessionId ? await sessions.validate(sessionId) : null;
    if (!principal) {
      reply.clearCookie(SESSION_COOKIE, { path: '/' });
      reply.code(401).send({ error: { code: 'UNAUTHENTICATED', message: 'A valid session is required.' } });
      return reply;
    }
    request.student = principal;
  });

  app.get('/api/health', async () => {
    return { status: 'ok', sessionsReady: typeof sessions.validate === 'function' };
  });

  // --- Demo Student session (E-02, DL-27) ---
  app.post('/api/demo/session', async (_request, reply) => {
    const { sessionId, expiresAt } = await sessions.issue(sessions.demoStudentId);
    const principal = await sessions.validate(sessionId);
    reply.setCookie(SESSION_COOKIE, sessionId, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.COOKIE_SECURE === 'true',
      path: '/',
      expires: expiresAt
    });
    return { student: principal };
  });

  app.get('/api/me', async (request) => {
    return { student: request.student };
  });

  app.post('/api/auth/logout', async (request, reply) => {
    const sessionId = request.cookies[SESSION_COOKIE];
    if (sessionId) {
      await sessions.expire(sessionId);
    }
    reply.clearCookie(SESSION_COOKIE, { path: '/' });
    return { ok: true };
  });

  // --- Slice route registration (one line per slice, DL-55) ---
  // [S-01] Availability routes
  // [S-02] Course rating routes
  // [S-03] Start-by date & manual effort routes
  registerStartByRoutes(app);
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
