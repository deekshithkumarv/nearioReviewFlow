import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { psqlDb } from './psql-db.js';
import { setDbForTests } from '../lib/db.js';
import { hashPassword } from '../lib/auth.js';
import { POST as login } from '../app/api/auth/login/route.js';
import { POST as accept } from '../app/api/invites/accept/route.js';
import { GET as me } from '../app/api/me/route.js';
import { GET as listBiz, POST as addBiz } from '../app/api/businesses/route.js';
import { GET as getBiz } from '../app/api/businesses/[id]/route.js';
import { GET as getFb } from '../app/api/businesses/[id]/feedback/route.js';
import { POST as addAgency, GET as listAg } from '../app/api/agencies/route.js';
import { POST as pubFb, OPTIONS as pubOpts } from '../app/api/feedback/[businessId]/route.js';
import { GET as viewLog } from '../app/api/view-log/route.js';

process.env.SESSION_SECRET = 'z'.repeat(40);
const db = psqlDb((process.env.PSQL_ARGS || '-h /tmp -p 5544 -U postgres neario_test').split(' '));
const H = 'http://neario.test';
const PW = 'correct horse battery';
const req = (path, { method = 'GET', body, cookie, origin, ct = 'application/json' } = {}) =>
  new Request(H + path, { method, headers: { host: 'neario.test', ...(cookie ? { cookie } : {}), ...(origin ? { origin } : {}), ...(body !== undefined ? { 'content-type': ct } : {}) }, body: body !== undefined ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined });
const ctx = (params) => ({ params: Promise.resolve(params) });
const cookieOf = (res) => (res.headers.get('set-cookie') || '').split(';')[0];
const S = {};

async function signUp(inviteToken) { const r = await accept(req('/api/invites/accept', { method: 'POST', body: { token: inviteToken, password: PW } })); assert.equal(r.status, 200); return cookieOf(r); }

before(async () => {
  setDbForTests(db);
  await db.run('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
  await db.run(readFileSync(new URL('../lib/schema.sql', import.meta.url), 'utf8'));
  await db.query(`INSERT INTO users (email,name,role,status,password_hash) VALUES ('admin@neario.test','Neario','super_admin','active',$1)`, [await hashPassword(PW)]);
  const l = await login(req('/api/auth/login', { method: 'POST', body: { email: 'admin@neario.test', password: PW } }));
  S.admin = cookieOf(l);
  const mkAg = async (name, email) => (await (await addAgency(req('/api/agencies', { method: 'POST', cookie: S.admin, body: { name, ownerEmail: email } }))).json());
  const a = await mkAg('Pixel', 'a@p.test'), b = await mkAg('Brandwise', 'b@b.test');
  S.A = await signUp(a.inviteToken); S.B = await signUp(b.inviteToken);
  const mkBiz = async (cookie, name, email) => (await (await addBiz(req('/api/businesses', { method: 'POST', cookie, body: { name, ownerEmail: email, ownerPermission: true } }))).json());
  S.a1 = await mkBiz(S.A, 'A One', 'o@a.test'); S.b1 = await mkBiz(S.B, 'B One', 'o@b1.test');
  S.a1c = await signUp(S.a1.inviteToken);
});

test('no cookie, bad cookie: 401', async () => {
  assert.equal((await me(req('/api/me'))).status, 401);
  assert.equal((await me(req('/api/me', { cookie: 'neario_session=abc.def' }))).status, 401);
  assert.equal((await listBiz(req('/api/businesses'))).status, 401);
});
test('login sets an HttpOnly SameSite cookie; wrong password is a generic 401', async () => {
  const ok = await login(req('/api/auth/login', { method: 'POST', body: { email: 'a@p.test', password: PW } }));
  const sc = ok.headers.get('set-cookie'); assert.match(sc, /HttpOnly/); assert.match(sc, /SameSite=Lax/);
  assert.equal(ok.headers.get('cache-control'), 'no-store');
  const bad = await login(req('/api/auth/login', { method: 'POST', body: { email: 'a@p.test', password: 'x' } }));
  assert.equal(bad.status, 401);
  assert.equal((await bad.json()).error, 'Wrong email or password.');
});
test('agency A cannot read agency B through the API (404, not 403)', async () => {
  const id = S.b1.business.id;
  assert.equal((await getBiz(req(`/api/businesses/${id}`, { cookie: S.A }), ctx({ id: String(id) }))).status, 404);
  assert.equal((await getFb(req(`/api/businesses/${id}/feedback`, { cookie: S.A }), ctx({ id: String(id) }))).status, 404);
  const mine = await (await listBiz(req('/api/businesses', { cookie: S.A }))).json();
  assert.deepEqual(mine.businesses.map((b) => b.name), ['A One']);
});
test('opening a client via the API writes the view log; the owner can see it', async () => {
  const id = S.a1.business.id;
  const r = await getFb(req(`/api/businesses/${id}/feedback?reason=Monthly%20report`, { cookie: S.A }), ctx({ id: String(id) }));
  assert.equal(r.status, 200);
  const own = await (await viewLog(req('/api/view-log', { cookie: S.a1c }))).json();
  assert.equal(own.log.length, 1); assert.equal(own.log[0].reason, 'Monthly report'); assert.equal(own.log[0].actor_agency, 'Pixel');
  assert.equal((await (await viewLog(req('/api/view-log', { cookie: S.B }))).json()).log.length, 0);
});
test('role checks over HTTP', async () => {
  assert.equal((await listAg(req('/api/agencies', { cookie: S.A }))).status, 403);
  assert.equal((await listAg(req('/api/agencies', { cookie: S.admin }))).status, 200);
  assert.equal((await addBiz(req('/api/businesses', { method: 'POST', cookie: S.a1c, body: { name: 'x', ownerEmail: 'x@x.test', ownerPermission: true } }))).status, 403);
});
test('cross-site POST and non-JSON POST are refused', async () => {
  const body = { name: 'Evil', ownerEmail: 'e@e.test', ownerPermission: true };
  assert.equal((await addBiz(req('/api/businesses', { method: 'POST', cookie: S.A, body, origin: 'https://evil.example' }))).status, 403);
  assert.equal((await addBiz(req('/api/businesses', { method: 'POST', cookie: S.A, body: 'name=x', ct: 'text/plain' }))).status, 415);
  assert.equal((await addBiz(req('/api/businesses', { method: 'POST', cookie: S.A, body: '{oops' }))).status, 400);
  assert.equal((await addBiz(req('/api/businesses', { method: 'POST', cookie: S.A, body, origin: 'http://neario.test' }))).status, 200);
});
test('public feedback needs no login, allows cross-origin, validates', async () => {
  const id = S.a1.business.id;
  const ok = await pubFb(req(`/api/feedback/${id}`, { method: 'POST', body: { rating: 5, text: 'Lovely' }, origin: 'https://feedback.site' }), ctx({ businessId: String(id) }));
  assert.equal(ok.status, 200); assert.equal(ok.headers.get('access-control-allow-origin'), '*');
  assert.equal((await pubFb(req(`/api/feedback/${id}`, { method: 'POST', body: { rating: 9 } }), ctx({ businessId: String(id) }))).status, 400);
  assert.equal(pubOpts().status, 204);
});
test('server errors do not leak details', async () => {
  const orig = console.error; console.error = () => {};
  setDbForTests({ query: async () => { throw new Error('secret table name users_xyz'); } });
  const r = await me(req('/api/me', { cookie: S.A }));
  console.error = orig; setDbForTests(db);
  assert.equal(r.status, 500); assert.ok(!(await r.text()).includes('secret'));
});
