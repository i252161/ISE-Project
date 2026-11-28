import type { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { buildApp } from './index';

function sidFrom(setCookie: string | string[] | undefined): string {
  const header = Array.isArray(setCookie) ? setCookie[0] : setCookie;
  const match = /sid=([0-9a-f]{64})/.exec(header ?? '');
  if (!match) {
    throw new Error(`no session cookie in: ${header}`);
  }
  return match[1] as string;
}

describe('E-02 demo session (API Layer)', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    delete process.env.SESSION_TTL_DAYS;
    app = await buildApp({ logger: false });
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('E-02-AC7 refuses a request with no session', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/me' });
    expect(res.statusCode).toBe(401);
    expect(res.json()).toEqual({
      error: { code: 'UNAUTHENTICATED', message: 'A valid session is required.' }
    });
  });

  it('E-02-AC8 refuses unknown routes and other methods without a session', async () => {
    expect((await app.inject({ method: 'GET', url: '/api/nothing' })).statusCode).toBe(401);
    expect((await app.inject({ method: 'GET', url: '/api/demo/session' })).statusCode).toBe(401);
    expect((await app.inject({ method: 'POST', url: '/api/auth/logout' })).statusCode).toBe(401);
  });

  it('E-02-AC9 refuses an invalid session cookie', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/me',
      headers: { cookie: `sid=${'a'.repeat(64)}` }
    });
    expect(res.statusCode).toBe(401);
  });

  it('E-02-AC10 health stays public', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/health' });
    expect(res.statusCode).toBe(200);
  });

  it('E-02-AC11 demo session sets an HttpOnly SameSite cookie for the demo Student', async () => {
    const res = await app.inject({ method: 'POST', url: '/api/demo/session' });
    expect(res.statusCode).toBe(200);
    const setCookie = String(res.headers['set-cookie']);
    expect(setCookie).toMatch(/HttpOnly/i);
    expect(setCookie).toMatch(/SameSite=Lax/i);
    expect(res.json().student.displayName).toBe('Demo Student');
  });

  it('E-02-AC12 a valid session reaches /api/me', async () => {
    const login = await app.inject({ method: 'POST', url: '/api/demo/session' });
    const sid = sidFrom(login.headers['set-cookie']);
    const me = await app.inject({ method: 'GET', url: '/api/me', headers: { cookie: `sid=${sid}` } });
    expect(me.statusCode).toBe(200);
    expect(me.json().student.displayName).toBe('Demo Student');
  });

  it('E-02-AC13 logout ends the session', async () => {
    const login = await app.inject({ method: 'POST', url: '/api/demo/session' });
    const sid = sidFrom(login.headers['set-cookie']);
    const out = await app.inject({ method: 'POST', url: '/api/auth/logout', headers: { cookie: `sid=${sid}` } });
    expect(out.statusCode).toBe(200);
    const after = await app.inject({ method: 'GET', url: '/api/me', headers: { cookie: `sid=${sid}` } });
    expect(after.statusCode).toBe(401);
  });

  it('E-02-AC14 an expired session is refused', async () => {
    process.env.SESSION_TTL_DAYS = '0.00002'; // about 1.7 seconds
    const login = await app.inject({ method: 'POST', url: '/api/demo/session' });
    delete process.env.SESSION_TTL_DAYS;
    const sid = sidFrom(login.headers['set-cookie']);
    const live = await app.inject({ method: 'GET', url: '/api/me', headers: { cookie: `sid=${sid}` } });
    expect(live.statusCode).toBe(200);
    await new Promise((resolve) => setTimeout(resolve, 2500));
    const expired = await app.inject({ method: 'GET', url: '/api/me', headers: { cookie: `sid=${sid}` } });
    expect(expired.statusCode).toBe(401);
  });

  it('E-02-AC15 the cookie is not Secure by default and is Secure when COOKIE_SECURE=true', async () => {
    const plain = await app.inject({ method: 'POST', url: '/api/demo/session' });
    expect(String(plain.headers['set-cookie'])).not.toMatch(/;\s*Secure/i);
    process.env.COOKIE_SECURE = 'true';
    const secure = await app.inject({ method: 'POST', url: '/api/demo/session' });
    delete process.env.COOKIE_SECURE;
    expect(String(secure.headers['set-cookie'])).toMatch(/;\s*Secure/i);
  });
});
