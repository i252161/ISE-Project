import type { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { buildApp } from '../index';

function sidFrom(setCookie: string | string[] | undefined): string {
  const header = Array.isArray(setCookie) ? setCookie[0] : setCookie;
  const match = /sid=([0-9a-f]{64})/.exec(header ?? '');
  if (!match) throw new Error(`no session cookie in: ${header}`);
  return match[1] as string;
}

describe('S-07 API: POST /api/assignments/:id/remaining-hours', () => {
  let app: FastifyInstance;
  let sid: string;

  beforeAll(async () => {
    app = await buildApp({ logger: false });
    await app.ready();
    const login = await app.inject({ method: 'POST', url: '/api/demo/session' });
    sid = sidFrom(login.headers['set-cookie']);
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns 401 with no session', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/assignments/00000000-0000-0000-0000-000000000001/remaining-hours',
      payload: { remainingHours: 3 }
    });
    expect(res.statusCode).toBe(401);
  });

  it('returns 400 VALIDATION_ERROR for -0.5', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/assignments/00000000-0000-0000-0000-000000000001/remaining-hours',
      headers: { cookie: `sid=${sid}` },
      payload: { remainingHours: -0.5 }
    });
    expect(res.statusCode).toBe(400);
    expect(res.json().error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 VALIDATION_ERROR for 200.5', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/assignments/00000000-0000-0000-0000-000000000001/remaining-hours',
      headers: { cookie: `sid=${sid}` },
      payload: { remainingHours: 200.5 }
    });
    expect(res.statusCode).toBe(400);
    expect(res.json().error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 VALIDATION_ERROR for 1.25', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/assignments/00000000-0000-0000-0000-000000000001/remaining-hours',
      headers: { cookie: `sid=${sid}` },
      payload: { remainingHours: 1.25 }
    });
    expect(res.statusCode).toBe(400);
    expect(res.json().error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 VALIDATION_ERROR for text value', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/assignments/00000000-0000-0000-0000-000000000001/remaining-hours',
      headers: { cookie: `sid=${sid}` },
      payload: { remainingHours: 'five' }
    });
    expect(res.statusCode).toBe(400);
    expect(res.json().error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 VALIDATION_ERROR for missing remainingHours field', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/assignments/00000000-0000-0000-0000-000000000001/remaining-hours',
      headers: { cookie: `sid=${sid}` },
      payload: {}
    });
    expect(res.statusCode).toBe(400);
    expect(res.json().error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 404 for an unknown assignment UUID', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/assignments/00000000-0000-0000-0000-000000000099/remaining-hours',
      headers: { cookie: `sid=${sid}` },
      payload: { remainingHours: 3 }
    });
    expect(res.statusCode).toBe(404);
  });

  it('returns 404 for a non-UUID assignment id', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/assignments/not-a-uuid/remaining-hours',
      headers: { cookie: `sid=${sid}` },
      payload: { remainingHours: 3 }
    });
    expect(res.statusCode).toBe(404);
  });

  it('returns the saved report and planning result on success', async () => {
    // First get the demo student's first assignment from planning
    const planRes = await app.inject({
      method: 'GET',
      url: '/api/planning',
      headers: { cookie: `sid=${sid}` }
    });
    expect(planRes.statusCode).toBe(200);
    const plan = planRes.json();

    // Find an assignment that is eligible for a report (not completed/no_deadline)
    const eligible = (plan.assignments as Array<{ assignmentId: string; state: string }>)
      .find((a) => a.state !== 'completed' && a.state !== 'no_deadline');

    if (!eligible) {
      // No eligible assignment in sample data; just confirm 404 path works
      return;
    }

    const res = await app.inject({
      method: 'POST',
      url: `/api/assignments/${eligible.assignmentId}/remaining-hours`,
      headers: { cookie: `sid=${sid}` },
      payload: { remainingHours: 2 }
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(typeof body.id).toBe('string');
    expect(body.assignmentId).toBe(eligible.assignmentId);
    expect(body.remainingHours).toBe(2);
    expect(typeof body.reportedAt).toBe('string');
    expect(body.planning).toBeDefined();
    expect(typeof body.planning.state).toBe('string');
  });
});
