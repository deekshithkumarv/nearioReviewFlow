import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { psqlDb } from './psql-db.js';
import * as svc from '../lib/service.js';
import { hashPassword, signSession, readSession, parseCookies } from '../lib/auth.js';

// Local: set PSQL_ARGS="-h /tmp -p 5544 -U postgres neario_test". Needs an empty throwaway database.
const db = psqlDb((process.env.PSQL_ARGS || '-h /tmp -p 5544 -U postgres neario_test').split(' '));
const PW = 'correct horse battery';
const S = {};

async function accept(inviteToken) { return svc.acceptInvite(db, { token: inviteToken, password: PW }); }
const rejects = (p, status) => assert.rejects(p, (e) => e instanceof svc.ServiceError && e.status === status, `expected ${status}`);

before(async () => {
  await db.run('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
  await db.run(readFileSync(new URL('../lib/schema.sql', import.meta.url), 'utf8'));
  const [adm] = await db.query(`INSERT INTO users (email,name,role,status,password_hash) VALUES ('admin@neario.test','Neario','super_admin','active',$1) RETURNING id,email,name,role,agency_id,business_id`, [await hashPassword(PW)]);
  S.admin = adm;
  const a = await svc.createAgency(db, S.admin, { name: 'Pixel & Co', ownerEmail: 'a@pixel.test', ownerName: 'Asha' });
  const b = await svc.createAgency(db, S.admin, { name: 'Brandwise', ownerEmail: 'b@brandwise.test', ownerName: 'Bala' });
  S.agA = a.agency; S.agB = b.agency;
  S.A = await accept(a.inviteToken); S.B = await accept(b.inviteToken);
  const mk = async (actor, name, email, extra = {}) => {
    const r = await svc.createBusiness(db, actor, { name, ownerEmail: email, ownerPermission: true, plan: 'monthly', ...extra });
    return { biz: r.business, user: await accept(r.inviteToken) };
  };
  S.a1 = await mk(S.A, 'A One', 'o1@a.test'); S.a2 = await mk(S.A, 'A Two', 'o2@a.test');
  S.b1 = await mk(S.B, 'B One', 'o1@b.test');
  S.d1 = await mk(S.admin, 'Direct One', 'o1@direct.test');
  for (const x of [S.a1, S.a2, S.b1, S.d1]) await svc.addFeedback(db, x.biz.id, { rating: 4, text: `hello ${x.biz.name}` });
});

const names = (rows) => rows.map((r) => r.name).sort();

test('agency sees only its own clients', async () => {
  assert.deepEqual(names(await svc.listBusinesses(db, S.A)), ['A One', 'A Two']);
  assert.deepEqual(names(await svc.listBusinesses(db, S.B)), ['B One']);
});
test('agency cannot open another agency, or a direct client', async () => {
  assert.equal(await svc.getBusiness(db, S.A, S.b1.biz.id), null);
  assert.equal(await svc.getBusiness(db, S.A, S.d1.biz.id), null);
  assert.equal(await svc.listFeedback(db, S.A, S.b1.biz.id), null);
  assert.equal(await svc.listFeedback(db, S.A, S.d1.biz.id), null);
  const [{ n }] = await db.query(`SELECT count(*)::int AS n FROM view_log WHERE business_id = $1`, [S.b1.biz.id]);
  assert.equal(n, 0, 'a refused attempt must not write a view-log row');
});
test('ids that are not numbers are treated as not found', async () => {
  for (const bad of ['1 OR 1=1', '-1', '0', 'abc', null, '1.5']) assert.equal(await svc.getBusiness(db, S.A, bad).catch((e) => e.status), 404);
});
test('agency cannot create a client under another agency', async () => {
  const r = await svc.createBusiness(db, S.A, { name: 'Sneaky', ownerEmail: 's@a.test', ownerPermission: true, agencyId: S.agB.id });
  assert.equal(r.business.agency_id, S.agA.id);
  assert.equal(await svc.getBusiness(db, S.B, r.business.id), null);
});
test('client owner sees only their own business', async () => {
  assert.deepEqual(names(await svc.listBusinesses(db, S.a1.user)), ['A One']);
  assert.equal(await svc.getBusiness(db, S.a1.user, S.a2.biz.id), null);
  assert.equal(await svc.listFeedback(db, S.a1.user, S.a2.biz.id), null);
  assert.equal((await svc.listFeedback(db, S.a1.user, S.a1.biz.id)).length, 1);
});
test('client owner cannot create clients, agencies or list agencies', async () => {
  await rejects(svc.createBusiness(db, S.a1.user, { name: 'x', ownerEmail: 'x@x.test', ownerPermission: true }), 403);
  await rejects(svc.createAgency(db, S.a1.user, { name: 'x', ownerEmail: 'x@x.test' }), 403);
  await rejects(svc.listAgencies(db, S.a1.user), 403);
});
test('agency user cannot create agencies or list agencies', async () => {
  await rejects(svc.createAgency(db, S.A, { name: 'x', ownerEmail: 'x@x.test' }), 403);
  await rejects(svc.listAgencies(db, S.A), 403);
});
test('super admin sees everything', async () => {
  assert.ok((await svc.listBusinesses(db, S.admin)).length >= 5);
  const ag = await svc.listAgencies(db, S.admin);
  assert.deepEqual(ag.map((a) => a.name).sort(), ['Brandwise', 'Pixel & Co']);
});
test('view-as log: written for agency and admin, scoped for everyone', async () => {
  await svc.listFeedback(db, S.A, S.a1.biz.id, { reason: 'Monthly report' });
  await svc.listFeedback(db, S.B, S.b1.biz.id);
  await svc.listFeedback(db, S.admin, S.a2.biz.id, { reason: 'Support ticket' });
  await svc.listFeedback(db, S.a1.user, S.a1.biz.id); // owner looking at own data: not logged
  const adminLog = await svc.listViewLog(db, S.admin);
  assert.equal(adminLog.length, 3);
  const aLog = await svc.listViewLog(db, S.A);
  assert.deepEqual(aLog.map((l) => l.business_name).sort(), ['A One', 'A Two']); // includes the admin's view of A Two
  assert.ok(aLog.every((l) => l.business_name !== 'B One'));
  const bLog = await svc.listViewLog(db, S.B);
  assert.deepEqual(bLog.map((l) => l.business_name), ['B One']);
  const own = await svc.listViewLog(db, S.a1.user); // owners can see who looked at their data
  assert.deepEqual(own.map((l) => l.reason), ['Monthly report']);
  assert.deepEqual(await svc.listViewLog(db, S.a2.user).then((r) => r.map((l) => l.actor_role)), ['super_admin']);
});
test('creating a client needs owner permission, valid email, free email', async () => {
  await rejects(svc.createBusiness(db, S.A, { name: 'N', ownerEmail: 'n@a.test', ownerPermission: false }), 400);
  await rejects(svc.createBusiness(db, S.A, { name: 'N', ownerEmail: 'nope', ownerPermission: true }), 400);
  await rejects(svc.createBusiness(db, S.A, { name: '', ownerEmail: 'n@a.test', ownerPermission: true }), 400);
  await rejects(svc.createBusiness(db, S.A, { name: 'N', ownerEmail: 'O1@A.test', ownerPermission: true }), 409);
});
test('invites: single use, hashed at rest, expire, need a decent password', async () => {
  const r = await svc.createBusiness(db, S.A, { name: 'Inv', ownerEmail: 'inv@a.test', ownerPermission: true });
  const rows = await db.query(`SELECT token_hash FROM invites`);
  assert.ok(rows.every((x) => x.token_hash !== r.inviteToken));
  await rejects(svc.acceptInvite(db, { token: r.inviteToken, password: 'short' }), 400);
  await rejects(svc.acceptInvite(db, { token: 'wrong', password: PW }), 400);
  await svc.acceptInvite(db, { token: r.inviteToken, password: PW });
  await rejects(svc.acceptInvite(db, { token: r.inviteToken, password: PW }), 400);
  const r2 = await svc.createBusiness(db, S.A, { name: 'Inv2', ownerEmail: 'inv2@a.test', ownerPermission: true });
  await db.query(`UPDATE invites SET expires_at = now() - interval '1 minute'`);
  await rejects(svc.acceptInvite(db, { token: r2.inviteToken, password: PW }), 400);
});
test('resend invite only for your own clients', async () => {
  const r = await svc.createBusiness(db, S.A, { name: 'Pending', ownerEmail: 'p@a.test', ownerPermission: true });
  const [u] = await db.query(`SELECT id FROM users WHERE lower(email)='p@a.test'`);
  assert.ok((await svc.resendInvite(db, S.A, u.id)).inviteToken);
  await rejects(svc.resendInvite(db, S.B, u.id), 404);
  await rejects(svc.resendInvite(db, S.a1.user, u.id), 404);
});
test('login: wrong password, unknown email, invited user, lockout', async () => {
  assert.equal(await svc.login(db, { email: 'a@pixel.test', password: 'nope' }), null);
  assert.equal(await svc.login(db, { email: 'ghost@x.test', password: PW }), null);
  const r = await svc.createBusiness(db, S.A, { name: 'NoPw', ownerEmail: 'nopw@a.test', ownerPermission: true });
  assert.equal(await svc.login(db, { email: 'nopw@a.test', password: PW }), null, 'invited users cannot log in');
  assert.equal((await svc.login(db, { email: 'A@Pixel.test', password: PW })).role, 'agency_user');
  for (let i = 0; i < 5; i++) await svc.login(db, { email: 'o2@a.test', password: 'bad' });
  await rejects(svc.login(db, { email: 'o2@a.test', password: PW }), 429);
  await db.query(`UPDATE users SET locked_until = now() - interval '1 second' WHERE lower(email)='o2@a.test'`);
  assert.ok(await svc.login(db, { email: 'o2@a.test', password: PW }));
});
test('disabled users lose access even with a valid session', async () => {
  const uid = S.b1.user.id;
  assert.ok(await svc.loadActor(db, uid));
  await db.query(`UPDATE users SET status='disabled' WHERE id=$1`, [uid]);
  assert.equal(await svc.loadActor(db, uid), null);
  await db.query(`UPDATE users SET status='active' WHERE id=$1`, [uid]);
});
test('public feedback: validated, lands in the right business only', async () => {
  await rejects(svc.addFeedback(db, S.a1.biz.id, { rating: 6 }), 400);
  await rejects(svc.addFeedback(db, S.a1.biz.id, { rating: 'x' }), 400);
  await rejects(svc.addFeedback(db, 999999, { rating: 5 }), 404);
  await svc.addFeedback(db, S.a1.biz.id, { rating: 5, text: 'Great' });
  assert.equal((await svc.listFeedback(db, S.a1.user, S.a1.biz.id)).length, 2);
  assert.equal((await svc.listFeedback(db, S.a2.user, S.a2.biz.id)).length, 1);
});
test('database refuses a user that belongs to the wrong scope', async () => {
  await assert.rejects(db.query(`INSERT INTO users (email, role, agency_id, business_id) VALUES ('bad@x.test','agency_user',$1,$2)`, [S.agA.id, S.a1.biz.id]), /users_scope_ck/);
  await assert.rejects(db.query(`INSERT INTO users (email, role) VALUES ('bad2@x.test','client_user')`), /users_scope_ck/);
});
test('sessions: valid, tampered, expired, wrong secret', () => {
  const secret = 'x'.repeat(40);
  const t = signSession(7, secret);
  assert.equal(readSession(t, secret), 7);
  assert.equal(readSession(t.slice(0, -2) + 'AA', secret), null);
  assert.equal(readSession(t, 'y'.repeat(40)), null);
  assert.equal(readSession(signSession(7, secret, Date.now() - 8 * 86400e3), secret), null);
  assert.equal(readSession('garbage', secret), null);
  const forged = Buffer.from(JSON.stringify({ u: 1, e: 9999999999 })).toString('base64url') + '.' + t.split('.')[1];
  assert.equal(readSession(forged, secret), null);
  assert.throws(() => signSession(1, 'short'));
  assert.equal(parseCookies('a=1; neario_session=abc%3D').neario_session, 'abc=');
});
