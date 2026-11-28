import type { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { buildApp } from './index';

// E-05 acceptance checks over HTTP. Reads the demo Student's sample data that test-setup.ts
// loaded once (as of SAMPLE_DATA_TODAY = 2027-01-11). Read-only: never changes it.

function sidFrom(setCookie: string | string[] | undefined): string {
  const header = Array.isArray(setCookie) ? setCookie[0] : setCookie;
  const match = /sid=([0-9a-f]{64})/.exec(header ?? '');
  if (!match) throw new Error(`no session cookie in: ${header}`);
  return match[1] as string;
}

const TODAY = '2027-01-11';

describe('E-05 assignment list and detail (API Layer)', () => {
  let app: FastifyInstance;
  let sid: string;
  const get = (url: string, session = sid) => app.inject({ method: 'GET', url, headers: { cookie: `sid=${session}` } });

  beforeAll(async () => {
    app = await buildApp({ logger: false });
    await app.ready();
    sid = sidFrom((await app.inject({ method: 'POST', url: '/api/demo/session' })).headers['set-cookie']);
  });
  afterAll(async () => {
    await app.close();
  });

  it('E-05-AC1 lists every seeded assignment with title, course, deadline and the sample marker', async () => {
    const res = await get('/api/assignments');
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.sort).toBe('deadline');
    expect(body.assignments).toHaveLength(56);
    expect(new Set(body.assignments.map((a: { course: { id: string } }) => a.course.id)).size).toBe(5);
    expect(body.assignments.every((a: { isSample: boolean }) => a.isSample)).toBe(true);
    const lab3 = body.assignments.find((a: { title: string; course: { name: string } }) => a.title === 'Lab 3' && a.course.name === 'Programming Fundamentals');
    expect(lab3).toMatchObject({
      officialDeadline: '2027-01-15', studentDeadline: null, applicableDeadline: '2027-01-15',
      status: 'not_started', submissionStatus: 'not_submitted', effortHours: 4, effectiveEffortHours: 4,
      startBy: null, planningState: null, version: 1
    });
  });

  it('E-05-AC2 sorts by deadline ascending with undated assignments last', async () => {
    const list = (await get('/api/assignments')).json().assignments as Array<{ applicableDeadline: string | null }>;
    const dated = list.filter((a) => a.applicableDeadline !== null).map((a) => a.applicableDeadline!);
    expect(dated).toEqual([...dated].sort());
    const firstUndated = list.findIndex((a) => a.applicableDeadline === null);
    expect(firstUndated).toBeGreaterThan(0);
    expect(list.slice(firstUndated).every((a) => a.applicableDeadline === null)).toBe(true);
    expect(list.slice(firstUndated)).toHaveLength(6);
  });

  it('E-05-AC3 a Student-only deadline is the applicable one; the official one wins when both exist', async () => {
    const list = (await get('/api/assignments')).json().assignments as Array<Record<string, unknown>>;
    expect(list.find((a) => a.title === 'Final Project Proposal')).toMatchObject({
      officialDeadline: null, studentDeadline: '2027-01-31', applicableDeadline: '2027-01-31'
    });
    expect(list.find((a) => a.title === 'Make-up Quiz')).toMatchObject({
      officialDeadline: '2027-01-26', studentDeadline: '2027-01-21', applicableDeadline: '2027-01-26'
    });
  });

  it('E-05-AC4 effective effort follows DL-50 (newer report wins; newer manual effort wins)', async () => {
    const list = (await get('/api/assignments')).json().assignments as Array<{ title: string; course: { name: string }; effortHours: number; effectiveEffortHours: number }>;
    const find = (course: string, title: string) => list.find((a) => a.course.name === course && a.title === title)!;
    expect(find('Data Structures', 'Lab 3')).toMatchObject({ effortHours: 5, effectiveEffortHours: 3.5 });
    expect(find('Database Systems', 'Lab 3')).toMatchObject({ effortHours: 4, effectiveEffortHours: 4 });
    expect(find('Database Systems', 'Indexing Lab Report')).toMatchObject({ effortHours: 2, effectiveEffortHours: 0 });
  });

  it('E-05-AC5 opening one shows its details, with an empty slot per later slice', async () => {
    const list = (await get('/api/assignments')).json().assignments as Array<{ id: string; title: string; course: { name: string } }>;
    const target = list.find((a) => a.title === 'Tree Traversal Project')!;
    const res = await get(`/api/assignments/${target.id}`);
    expect(res.statusCode).toBe(200);
    const detail = res.json();
    expect(detail).toMatchObject({
      id: target.id, title: 'Tree Traversal Project', course: { name: 'Data Structures' },
      status: 'already_started', isSample: true, effortHours: 10, effectiveEffortHours: 8,
      latestRemainingHours: { remainingHours: 8, reportedAt: '2027-01-09T12:00:00.000Z' },
      lastActivityAt: '2027-01-09T12:00:00.000Z',
      planning: null, allocation: null, subtasks: null, timer: null, warnings: null
    });
    expect(detail.description).toMatch(/Sample data/);
  });

  it('E-05-AC6 an unknown or malformed id is 404; no session is 401', async () => {
    expect((await get('/api/assignments/00000000-0000-4000-8000-000000000000')).statusCode).toBe(404);
    const bad = await get('/api/assignments/not-a-uuid');
    expect(bad.statusCode).toBe(404);
    expect(bad.json()).toEqual({ error: { code: 'NOT_FOUND', message: 'Assignment not found.' } });
    expect((await app.inject({ method: 'GET', url: '/api/assignments' })).statusCode).toBe(401);
    expect((await app.inject({ method: 'GET', url: '/api/assignments/x' })).statusCode).toBe(401);
  });

  it('E-05-AC7 a second browser (second session) sees the same data', async () => {
    const other = sidFrom((await app.inject({ method: 'POST', url: '/api/demo/session' })).headers['set-cookie']);
    expect(other).not.toBe(sid);
    const a = (await get('/api/assignments')).json();
    const b = (await get('/api/assignments', other)).json();
    expect(b).toEqual(a);
    const id = a.assignments[0].id;
    expect((await get(`/api/assignments/${id}`, other)).json()).toEqual((await get(`/api/assignments/${id}`)).json());
  });

  it('E-05-AC8 is read-only: writes to the list and detail routes are not offered', async () => {
    const id = (await get('/api/assignments')).json().assignments[0].id;
    for (const method of ['POST', 'PUT', 'PATCH', 'DELETE'] as const) {
      const res = await app.inject({ method, url: `/api/assignments/${id}`, headers: { cookie: `sid=${sid}` } });
      expect(res.statusCode).toBe(404);
    }
    expect(process.env.SAMPLE_DATA_TODAY).toBe(TODAY);
  });
});
