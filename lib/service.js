// All business rules live here. Every function that reads or changes client data takes the
// logged-in `actor` and scopes its SQL by it. Routes never write their own queries.
// `db` is anything with: await db.query(sql, params) -> array of row objects.
import { hashPassword, verifyPassword, DUMMY_HASH, newInviteToken, hashToken } from './auth.js';

export class ServiceError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}
const bad = (m) => new ServiceError(400, m);
const forbidden = () => new ServiceError(403, 'You do not have access to this.');
const notFound = () => new ServiceError(404, 'Not found.');

const MAX_FAILS = 5, LOCK_MINUTES = 15, INVITE_DAYS = 7;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PLANS = ['monthly', 'yearly'];

const str = (v, max = 200) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
function needEmail(v) { const e = str(v, 254).toLowerCase(); if (!EMAIL_RE.test(e)) throw bad('Enter a valid email address.'); return e; }
function needText(v, label, max = 120) { const s = str(v, max); if (!s) throw bad(`Enter the ${label}.`); return s; }
const one = (rows) => rows[0] || null;

// ---- the one place that decides which businesses an actor may touch -------------------------
// Returns an SQL condition on alias `b` plus its params. Nothing else decides visibility.
function businessScope(actor, startAt = 1) {
  switch (actor.role) {
    case 'super_admin': return { sql: 'TRUE', params: [] };
    case 'agency_user': return { sql: `b.agency_id = $${startAt}`, params: [actor.agency_id] };
    case 'client_user': return { sql: `b.id = $${startAt}`, params: [actor.business_id] };
    default: throw forbidden();
  }
}

// ---- sign in ---------------------------------------------------------------------------------
export async function loadActor(db, userId) {
  const u = one(await db.query(
    `SELECT id, email, name, role, agency_id, business_id FROM users WHERE id = $1 AND status = 'active'`, [userId]));
  return u;
}

export async function login(db, { email, password }) {
  const e = str(email, 254).toLowerCase();
  const pw = typeof password === 'string' ? password : '';
  const u = one(await db.query(
    `SELECT id, email, name, role, agency_id, business_id, password_hash, status, locked_until,
            (locked_until IS NOT NULL AND locked_until > now()) AS locked
       FROM users WHERE lower(email) = $1`, [e]));
  // Always do one hash check so timing does not reveal whether the email exists.
  const ok = await verifyPassword(pw, u?.password_hash || DUMMY_HASH);
  if (!u || u.status !== 'active') return null;
  if (u.locked) throw new ServiceError(429, 'Too many wrong attempts. Try again in a few minutes.');
  if (!ok) {
    await db.query(
      `UPDATE users SET failed_logins = failed_logins + 1,
              locked_until = CASE WHEN failed_logins + 1 >= $2 THEN now() + ($3 || ' minutes')::interval ELSE locked_until END
        WHERE id = $1`, [u.id, MAX_FAILS, String(LOCK_MINUTES)]);
    return null;
  }
  await db.query(`UPDATE users SET failed_logins = 0, locked_until = NULL WHERE id = $1`, [u.id]);
  const { password_hash, status, locked_until, locked, ...actor } = u;
  return actor;
}

// ---- invites ---------------------------------------------------------------------------------
async function createInvite(db, userId) {
  const { token, hash } = newInviteToken();
  await db.query(
    `INSERT INTO invites (user_id, token_hash, expires_at) VALUES ($1, $2, now() + ($3 || ' days')::interval)`,
    [userId, hash, String(INVITE_DAYS)]);
  return token; // email this inside a link; it is never stored in readable form
}

export async function acceptInvite(db, { token, password }) {
  if (typeof password !== 'string' || password.length < 10) throw bad('Choose a password of at least 10 characters.');
  if (password.length > 200) throw bad('That password is too long.');
  const inv = one(await db.query(
    `SELECT i.id, i.user_id FROM invites i
      WHERE i.token_hash = $1 AND i.used_at IS NULL AND i.expires_at > now()`, [hashToken(token)]));
  if (!inv) throw bad('This invite link is invalid or has expired. Ask for a new one.');
  const hash = await hashPassword(password);
  // Single-use: only the request that flips used_at may proceed.
  const claimed = await db.query(`UPDATE invites SET used_at = now() WHERE id = $1 AND used_at IS NULL RETURNING id`, [inv.id]);
  if (!claimed.length) throw bad('This invite link has already been used.');
  await db.query(`UPDATE users SET password_hash = $2, status = 'active' WHERE id = $1`, [inv.user_id, hash]);
  return one(await db.query(`SELECT id, email, name, role, agency_id, business_id FROM users WHERE id = $1`, [inv.user_id]));
}

export async function resendInvite(db, actor, userId) {
  const u = one(await db.query(
    `SELECT u.id, u.role, u.agency_id, u.business_id, u.status, b.agency_id AS biz_agency
       FROM users u LEFT JOIN businesses b ON b.id = u.business_id WHERE u.id = $1`, [userId]));
  if (!u || u.status !== 'invited') throw notFound();
  const allowed =
    actor.role === 'super_admin' ||
    (actor.role === 'agency_user' && (u.agency_id === actor.agency_id || u.biz_agency === actor.agency_id));
  if (!allowed) throw notFound();
  return { inviteToken: await createInvite(db, u.id) };
}

// ---- agencies (Neario super admin only) ------------------------------------------------------
export async function createAgency(db, actor, input) {
  if (actor.role !== 'super_admin') throw forbidden();
  const name = needText(input.name, 'agency name');
  const email = needEmail(input.ownerEmail);
  const ownerName = str(input.ownerName, 120) || null;
  await assertEmailFree(db, email);
  const ag = one(await db.query(`INSERT INTO agencies (name) VALUES ($1) RETURNING id, name`, [name]));
  const u = one(await db.query(
    `INSERT INTO users (email, name, role, agency_id) VALUES ($1, $2, 'agency_user', $3) RETURNING id`, [email, ownerName, ag.id]));
  return { agency: ag, inviteToken: await createInvite(db, u.id) };
}

export async function listAgencies(db, actor) {
  if (actor.role !== 'super_admin') throw forbidden();
  return db.query(
    `SELECT a.id, a.name, a.created_at,
            count(b.id)::int AS clients,
            count(b.id) FILTER (WHERE b.pay_status = 'paid')::int AS paying
       FROM agencies a LEFT JOIN businesses b ON b.agency_id = a.id
      GROUP BY a.id ORDER BY a.name`);
}

async function assertEmailFree(db, email) {
  if (one(await db.query(`SELECT 1 FROM users WHERE lower(email) = $1`, [email]))) {
    throw new ServiceError(409, 'That email already has a Neario login.');
  }
}

// ---- businesses ------------------------------------------------------------------------------
const BIZ_COLS = `b.id, b.name, b.type, b.city, b.plan, b.pay_status, b.agency_id, b.created_at,
  a.name AS agency_name,
  (SELECT u.status FROM users u WHERE u.business_id = b.id AND u.role = 'client_user' ORDER BY u.id LIMIT 1) AS login_status`;

export async function listBusinesses(db, actor) {
  const sc = businessScope(actor);
  return db.query(
    `SELECT ${BIZ_COLS} FROM businesses b LEFT JOIN agencies a ON a.id = b.agency_id
      WHERE ${sc.sql} ORDER BY b.created_at DESC, b.id DESC`, sc.params);
}

export async function getBusiness(db, actor, id) {
  const bid = toId(id);
  const sc = businessScope(actor, 2);
  return one(await db.query(
    `SELECT ${BIZ_COLS} FROM businesses b LEFT JOIN agencies a ON a.id = b.agency_id
      WHERE b.id = $1 AND ${sc.sql}`, [bid, ...sc.params]));
}

export async function createBusiness(db, actor, input) {
  if (actor.role === 'client_user') throw forbidden();
  const name = needText(input.name, 'business name');
  const type = str(input.type, 60) || 'Other';
  const city = str(input.city, 80) || null;
  const plan = PLANS.includes(input.plan) ? input.plan : 'yearly';
  const email = needEmail(input.ownerEmail);
  const ownerName = str(input.ownerName, 120) || null;
  // The agency must confirm it has the owner's permission (Terms: "Agencies and their clients").
  if (input.ownerPermission !== true) throw bad('Confirm that the owner has agreed to this.');

  // An agency can only ever create clients under itself. Whatever agencyId was sent is ignored.
  let agencyId = null;
  if (actor.role === 'agency_user') agencyId = actor.agency_id;
  else if (input.agencyId != null) {
    agencyId = toId(input.agencyId);
    if (!one(await db.query(`SELECT 1 FROM agencies WHERE id = $1`, [agencyId]))) throw bad('That agency does not exist.');
  }
  await assertEmailFree(db, email);
  const b = one(await db.query(
    `INSERT INTO businesses (name, type, city, plan, agency_id, owner_permission_at)
     VALUES ($1, $2, $3, $4, $5, CASE WHEN $5::bigint IS NULL THEN NULL ELSE now() END) RETURNING id`,
    [name, type, city, plan, agencyId]));
  const u = one(await db.query(
    `INSERT INTO users (email, name, role, business_id) VALUES ($1, $2, 'client_user', $3) RETURNING id`,
    [email, ownerName, b.id]));
  return { business: await getBusiness(db, actor, b.id), inviteToken: await createInvite(db, u.id) };
}

// ---- feedback and the view-as log ------------------------------------------------------------
export async function listFeedback(db, actor, businessId, { reason } = {}) {
  const biz = await getBusiness(db, actor, businessId); // null when not visible: same answer as "does not exist"
  if (!biz) return null;
  // Opening a client's data as Neario or as an agency is always recorded. The owner's own view is not.
  if (actor.role !== 'client_user') {
    await db.query(
      `INSERT INTO view_log (actor_user_id, actor_role, business_id, reason) VALUES ($1, $2, $3, $4)`,
      [actor.id, actor.role, biz.id, str(reason, 200) || 'Opened dashboard']);
  }
  return db.query(
    `SELECT id, rating, text, created_at FROM feedback WHERE business_id = $1 ORDER BY created_at DESC, id DESC LIMIT 500`, [biz.id]);
}

// Public: a customer sending feedback from the QR page. No login, and it reads nothing back.
export async function addFeedback(db, businessId, input) {
  const bid = toId(businessId);
  const rating = Number(input.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw bad('Rating must be 1 to 5.');
  if (!one(await db.query(`SELECT 1 FROM businesses WHERE id = $1`, [bid]))) throw notFound();
  await db.query(`INSERT INTO feedback (business_id, rating, text) VALUES ($1, $2, $3)`, [bid, rating, str(input.text, 2000) || null]);
  return { ok: true };
}

export async function listViewLog(db, actor) {
  const sc = businessScope(actor); // same scoping: agencies see only their clients, owners see only their own business
  return db.query(
    `SELECT l.id, l.created_at, l.actor_role, l.reason, u.name AS actor_name, u.email AS actor_email,
            b.id AS business_id, b.name AS business_name, a.name AS actor_agency
       FROM view_log l
       JOIN businesses b ON b.id = l.business_id
       JOIN users u ON u.id = l.actor_user_id
       LEFT JOIN agencies a ON a.id = u.agency_id
      WHERE ${sc.sql} ORDER BY l.created_at DESC, l.id DESC LIMIT 200`, sc.params);
}

function toId(v) {
  const n = Number(v);
  if (!Number.isSafeInteger(n) || n <= 0) throw notFound();
  return n;
}
