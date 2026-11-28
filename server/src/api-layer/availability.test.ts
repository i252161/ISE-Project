import type { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { closePool, getPool, runMigrations } from '../data-access/index';
import { availability } from '../planning-core/index';
import { buildApp } from './index';

function sidFrom(setCookie: string | string[] | undefined): string {
  const header = Array.isArray(setCookie) ? setCookie[0] : setCookie;
  const match = /sid=([0-9a-f]{64})/.exec(header ?? '');
  if (!match) throw new Error(`no session cookie in: ${header}`);
  return match[1] as string;
}

describe('S-01 daily study availability', () => {
  let app: FastifyInstance;
  let sid: string;
  const clock = () => new Date('2026-11-27T18:30:00Z');
  const today = '2026-11-27';

  beforeAll(async () => {
    await runMigrations(getPool());
    app = await buildApp({ logger: false, clock });
    await app.ready();
    const login = await app.inject({ method: 'POST', url: '/api/demo/session' });
    sid = sidFrom(login.headers['set-cookie']);
  });

  afterAll(async () => {
    await app.close();
    await closePool();
  });

  function put(date: string, body: unknown) {
    return app.inject({
      method: 'PUT',
      url: `/api/availability/${date}`,
      headers: { cookie: `sid=${sid}`, 'content-type': 'application/json' },
      payload: body
    });
  }

  it('BVA hours: -0.5 and 24.5 are rejected', async () => {
    for (const value of [-0.5, 24.5]) {
      const response = await put(today, { hours: value });
      expect(response.statusCode).toBe(400);
      expect(response.json().error.code).toBe('VALIDATION_ERROR');
      expect(response.json().error.fieldErrors.hours).toBeDefined();
    }
  });

  it('BVA hours: 0, 0.5, 23.5 and 24 are saved', async () => {
    for (const value of [0, 0.5, 23.5, 24]) {
      const response = await put(today, { hours: value });
      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({
        date: today,
        hours: value,
        availability: 'known',
        source: 'individual'
      });
    }
  });

  it('EP rejects wrong step, text, NaN and string numbers; null deletes the row', async () => {
    for (const value of [1.25, 'abc', '2', true, false]) {
      expect((await put(today, { hours: value })).statusCode).toBe(400);
    }

    expect((await put(today, { hours: null })).statusCode).toBe(200);
    const get = await app.inject({
      method: 'GET',
      url: '/api/availability?from=2026-11-27&days=7',
      headers: { cookie: `sid=${sid}` }
    });
    expect(get.statusCode).toBe(200);
    expect(get.json().days[0]).toEqual({
      date: today,
      hours: null,
      availability: 'unknown',
      source: null
    });
  });

  it('a rejected PUT keeps the previous value', async () => {
    expect((await put(today, { hours: 3 })).statusCode).toBe(200);
    expect((await put(today, { hours: 1.25 })).statusCode).toBe(400);
    const get = await app.inject({
      method: 'GET',
      url: '/api/availability',
      headers: { cookie: `sid=${sid}` }
    });
    expect(get.json().days[0].hours).toBe(3);
  });

  it('0 is known and blank is unknown', async () => {
    await put(today, { hours: 0 });
    await put(today, { hours: null });
    await put(today, { hours: 0 });
    const get = await app.inject({
      method: 'GET',
      url: '/api/availability',
      headers: { cookie: `sid=${sid}` }
    });
    expect(get.json().days[0]).toEqual({
      date: today,
      hours: 0,
      availability: 'known',
      source: 'individual'
    });
  });

  it('a newer value replaces older and leaves one row', async () => {
    await put(today, { hours: 2 });
    await put(today, { hours: 5.5 });
    const get = await app.inject({
      method: 'GET',
      url: '/api/availability',
      headers: { cookie: `sid=${sid}` }
    });
    expect(get.json().days[0].hours).toBe(5.5);
    const row = await getPool().query(
      'SELECT count(*)::int AS count FROM study_availability WHERE study_date = $1',
      [today]
    );
    expect(row.rows[0].count).toBe(1);
  });

  it('GET returns today plus six and PUT today plus seven is rejected', async () => {
    const get = await app.inject({
      method: 'GET',
      url: '/api/availability?days=7',
      headers: { cookie: `sid=${sid}` }
    });
    expect(get.statusCode).toBe(200);
    expect(get.json().days).toHaveLength(7);
    expect(get.json().days.map((day: { date: string }) => day.date)).toEqual([
      '2026-11-27', '2026-11-28', '2026-11-29', '2026-11-30',
      '2026-12-01', '2026-12-02', '2026-12-03'
    ]);
    expect(get.json().days.some((day: { date: string }) => day.date === '2026-12-04')).toBe(false);

    expect((await put('2026-12-04', { hours: 2 })).statusCode).toBe(400);
  });

  it('days must be 7 and a value persists across new sessions', async () => {
    await put(today, { hours: 7.5 });
    const badDays = await app.inject({
      method: 'GET',
      url: '/api/availability?days=6',
      headers: { cookie: `sid=${sid}` }
    });
    expect(badDays.statusCode).toBe(400);

    const login = await app.inject({ method: 'POST', url: '/api/demo/session' });
    const newSid = sidFrom(login.headers['set-cookie']);
    const get = await app.inject({
      method: 'GET',
      url: '/api/availability',
      headers: { cookie: `sid=${newSid}` }
    });
    expect(get.json().days[0].hours).toBe(7.5);
  });

  it('no session cookie returns 401', async () => {
    expect((await app.inject({ method: 'GET', url: '/api/availability' })).statusCode).toBe(401);
    expect((await app.inject({
      method: 'PUT',
      url: `/api/availability/${today}`,
      headers: { 'content-type': 'application/json' },
      payload: { hours: 1 }
    })).statusCode).toBe(401);
  });

  it('day boundary uses Asia/Karachi around UTC midnight', () => {
    expect(availability.todayInKarachi(new Date('2026-11-27T18:59:59Z'))).toBe('2026-11-27');
    expect(availability.todayInKarachi(new Date('2026-11-27T19:00:00Z'))).toBe('2026-11-28');
  });
});
