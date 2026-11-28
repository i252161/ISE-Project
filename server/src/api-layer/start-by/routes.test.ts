import type { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { buildApp } from '../index';
import * as planningCore from '../../planning-core/index';

function sidFrom(setCookie: string | string[] | undefined): string {
  const header = Array.isArray(setCookie) ? setCookie[0] : setCookie;
  const match = /sid=([0-9a-f]{64})/.exec(header ?? '');
  if (!match) {
    throw new Error(`no session cookie in: ${header}`);
  }
  return match[1] as string;
}

describe('S-03 API routes (/api/planning & /api/assignments/:id/effort)', () => {
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

  it('requires an authenticated session for /api/planning and /api/assignments/:id/effort', async () => {
    const planRes = await app.inject({ method: 'GET', url: '/api/planning' });
    expect(planRes.statusCode).toBe(401);

    const effortRes = await app.inject({
      method: 'PUT',
      url: '/api/assignments/00000000-0000-0000-0000-000000000001/effort',
      payload: { hours: 2, version: 1 }
    });
    expect(effortRes.statusCode).toBe(401);
  });

  it('rejects invalid effort inputs (0, 200.5, 1.25, missing version) with 400 VALIDATION_ERROR', async () => {
    const id = '00000000-0000-0000-0000-000000000001';
    for (const payload of [
      { hours: 0, version: 1 },
      { hours: 200.5, version: 1 },
      { hours: 1.25, version: 1 },
      { hours: 2 }
    ]) {
      const res = await app.inject({
        method: 'PUT',
        url: `/api/assignments/${id}/effort`,
        headers: { cookie: `sid=${sid}` },
        payload
      });
      expect(res.statusCode).toBe(400);
      expect(res.json().error.code).toBe('VALIDATION_ERROR');
    }
  });

  it('returns 404 for unknown assignment ID', async () => {
    const res = await app.inject({
      method: 'PUT',
      url: '/api/assignments/00000000-0000-0000-0000-000000000099/effort',
      headers: { cookie: `sid=${sid}` },
      payload: { hours: 2, version: 1 }
    });
    expect(res.statusCode).toBe(404);
  });

  it('returns 409 VERSION_CONFLICT with current representation when version is stale', async () => {
    const spy = vi.spyOn(planningCore, 'updateAssignmentEffort').mockResolvedValueOnce({
      kind: 'version_conflict',
      current: {
        id: '00000000-0000-0000-0000-000000000010',
        title: 'Test',
        courseId: '00000000-0000-0000-0000-000000000020',
        courseName: 'Math',
        officialDeadline: '2026-12-03',
        studentDeadline: null,
        status: 'not_started',
        submissionStatus: 'not_submitted',
        effortHours: 3,
        effortUpdatedAt: '2026-11-28T10:00:00.000Z',
        isSample: false,
        version: 2
      }
    });

    const res = await app.inject({
      method: 'PUT',
      url: '/api/assignments/00000000-0000-0000-0000-000000000010/effort',
      headers: { cookie: `sid=${sid}` },
      payload: { hours: 4, version: 1 }
    });
    spy.mockRestore();

    expect(res.statusCode).toBe(409);
    expect(res.json().error.code).toBe('VERSION_CONFLICT');
    expect(res.json().current.version).toBe(2);
  });

  it('returns derived planning state from GET /api/planning', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/planning',
      headers: { cookie: `sid=${sid}` }
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.timeZone).toBe('Asia/Karachi');
    expect(Array.isArray(body.assignments)).toBe(true);
  });
});
