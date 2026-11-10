// All business rules live here. Every function that reads or changes client data takes the
// logged-in `actor` and scopes its SQL by it. Routes never write their own queries.
// `db` is anything with: await db.query(sql, params) -> array of row objects.
import { hashPassword, verifyPassword, getDummyHash, newInviteToken, hashToken } from './auth.js';

export class ServiceError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}
const bad = (m) => new ServiceError(400, m);
const forbidden = () => new ServiceError(403, 'You do not have access to this.');
const notFound = () => new ServiceError(404, 'Not found.');

const MAX_FAILS = 5, LOCK_MINUTES = 15, INVITE_DAYS = 7;
const EMAIL_RE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PHONE_10_RE = /^\d{10}$/;
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
    `SELECT u.id, u.email, u.name, u.role, u.agency_id, u.business_id,
            (SELECT a.name FROM agencies a WHERE a.id = u.agency_id) AS agency_name
       FROM users u WHERE u.id = $1 AND u.status = 'active'`, [userId]));
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
  const ok = await verifyPassword(pw, u?.password_hash || await getDummyHash());
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
            count(b.id) FILTER (WHERE b.pay_status = 'paid')::int AS paying,
            (SELECT u.id FROM users u WHERE u.agency_id = a.id ORDER BY u.id LIMIT 1) AS owner_user_id,
            (SELECT u.status FROM users u WHERE u.agency_id = a.id ORDER BY u.id LIMIT 1) AS owner_status
       FROM agencies a LEFT JOIN businesses b ON b.agency_id = a.id
      GROUP BY a.id ORDER BY a.name`);
}

async function assertEmailFree(db, email) {
  if (one(await db.query(`SELECT 1 FROM users WHERE lower(email) = $1`, [email]))) {
    throw new ServiceError(409, 'That email already has a Neario login.');
  }
}

// ---- businesses ------------------------------------------------------------------------------
const BIZ_COLS = `b.id, b.name, b.type, b.city, b.plan, b.pay_status, b.agency_id, b.created_at, b.google_review_url, b.services, b.onboarded_at,
  a.name AS agency_name,
  (SELECT u.status FROM users u WHERE u.business_id = b.id AND u.role = 'client_user' ORDER BY u.id LIMIT 1) AS login_status,
  (SELECT u.id FROM users u WHERE u.business_id = b.id AND u.role = 'client_user' ORDER BY u.id LIMIT 1) AS owner_user_id,
  (SELECT u.email FROM users u WHERE u.business_id = b.id AND u.role = 'client_user' ORDER BY u.id LIMIT 1) AS owner_email,
  (SELECT count(*) FROM feedback f WHERE f.business_id = b.id)::int AS feedback_count,
  (SELECT round(avg(f.rating)::numeric, 2)::float8 FROM feedback f WHERE f.business_id = b.id) AS avg_rating,
  (SELECT max(f.created_at) FROM feedback f WHERE f.business_id = b.id) AS last_feedback_at`;

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
    `SELECT id, rating, text, service, tags, lang, contact_ok,
            CASE WHEN contact_ok THEN phone END AS phone, created_at
       FROM feedback WHERE business_id = $1 ORDER BY created_at DESC, id DESC LIMIT 500`, [biz.id]);
}

// Public: what the customer's feedback page needs to show. Nothing private.
export async function getPublicBusiness(db, businessId) {
  if (businessId === 'demo-cafe-1' || businessId === 'demo' || businessId === 'gh') {
    return {
      name: 'The Green House',
      type: 'Salon or spa',
      city: 'Indiranagar, Bengaluru',
      googleReviewUrl: 'https://maps.google.com',
      services: ['Haircut', 'Hair Spa', 'Facial', 'Beard Trim', 'Head Massage'],
    };
  }
  const b = one(await db.query(`SELECT name, type, city, google_review_url, services FROM businesses WHERE id = $1`, [toId(businessId)]));
  if (!b) throw notFound();
  return { name: b.name, type: b.type, city: b.city, googleReviewUrl: b.google_review_url || null, services: Array.isArray(b.services) ? b.services : null };
}

const LANGS = ['en', 'hi', 'kn'];
const FEEDBACK_HOURLY_CAP = 300;
// Public: a customer sending feedback from the QR page. No login, and it reads nothing back.
// A phone number is kept only when the customer ticked the box to be contacted.
export async function addFeedback(db, businessId, input) {
  if (businessId === 'demo-cafe-1' || businessId === 'demo' || businessId === 'gh') {
    const rating = Number(input.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw badRequest('Rating must be 1 to 5');
    return { ok: true, id: 9999, demo: true };
  }
  const bid = toId(businessId);
  const rating = Number(input.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw bad('Rating must be 1 to 5.');
  if (!one(await db.query(`SELECT 1 FROM businesses WHERE id = $1`, [bid]))) throw notFound();
  const tags = (Array.isArray(input.tags) ? input.tags : []).slice(0, 8).map((t) => str(t, 40)).filter(Boolean);
  let phone = null;
  const contactConsent = input.contactOk === true || input.contact_ok === true;
  if (str(input.phone, 30)) {
    if (!contactConsent) throw bad('Tick the box to let the business contact you, or leave the phone number empty.');
    phone = cleanPhone(input.phone);
  }
  const recent = one(await db.query(`SELECT count(*)::int AS n FROM feedback WHERE business_id = $1 AND created_at > now() - interval '1 hour'`, [bid]));
  if (recent.n >= FEEDBACK_HOURLY_CAP) throw new ServiceError(429, 'Too much feedback at once. Please try again in a little while.');
  const feedbackText = str(input.text || input.txt, 2000) || null;
  await db.query(
    `INSERT INTO feedback (business_id, rating, text, service, tags, phone, contact_ok, lang) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [bid, rating, feedbackText, str(input.service, 40) || null, tags.length ? JSON.stringify(tags) : null,
     phone, phone !== null, LANGS.includes(input.lang) ? input.lang : null]);
  return { ok: true };
}

// ---- business settings: the Google review link ----------------------------------------------
const GOOGLE_HOSTS = [/(^|\.)google\.[a-z]{2,3}(\.[a-z]{2})?$/, /^g\.page$/, /^g\.co$/, /^goo\.gl$/, /^maps\.app\.goo\.gl$/, /^share\.google$/];
function googleUrl(v) {
  const raw = str(v, 500);
  if (!raw) return null;
  let u; try { u = new URL(raw); } catch { throw bad('That does not look like a link. Paste the full Google review link.'); }
  if (u.protocol !== 'https:' || !GOOGLE_HOSTS.some((re) => re.test(u.hostname))) throw bad('Use your Google review link (it starts with https://g.page, https://maps.app.goo.gl or https://www.google.com).');
  return u.toString();
}
// Neario, the agency, or the owner can set it. It is one link for the business: every customer is shown the same one.
export async function updateBusiness(db, actor, id, input) {
  const biz = await getBusiness(db, actor, id);
  if (!biz) throw notFound();
  const hasUrl = 'googleReviewUrl' in input, hasPay = 'payStatus' in input;
  const hasProfile = ['name', 'type', 'city'].some((k) => k in input), hasSvc = 'services' in input, hasDone = input.onboarded === true;
  if (!hasUrl && !hasPay && !hasProfile && !hasSvc && !hasDone) throw bad('Nothing to change.');
  if (hasProfile) {
    const name = 'name' in input ? needText(input.name, 'business name') : biz.name;
    const type = 'type' in input ? (str(input.type, 60) || null) : biz.type;
    const city = 'city' in input ? (str(input.city, 80) || null) : biz.city;
    await db.query(`UPDATE businesses SET name = $2, type = $3, city = $4 WHERE id = $1`, [biz.id, name, type, city]);
  }
  if (hasSvc) {
    if (!Array.isArray(input.services)) throw bad('Services must be a list.');
    const seen = new Set(), list = [];
    for (const raw of input.services) {
      const v = str(raw, 40);
      if (v && !seen.has(v.toLowerCase())) { seen.add(v.toLowerCase()); list.push(v); }
    }
    if (list.length > 12) throw bad('Please keep it to 12 services or fewer.');
    await db.query(`UPDATE businesses SET services = $2 WHERE id = $1`, [biz.id, list.length ? JSON.stringify(list) : null]);
  }
  if (hasDone) await db.query(`UPDATE businesses SET onboarded_at = COALESCE(onboarded_at, now()) WHERE id = $1`, [biz.id]);
  if (hasPay) {
    if (actor.role !== 'super_admin') throw forbidden();
    if (!['awaiting_payment', 'paid', 'past_due', 'cancelled'].includes(input.payStatus)) throw bad('Unknown payment status.');
    await db.query(`UPDATE businesses SET pay_status = $2 WHERE id = $1`, [biz.id, input.payStatus]);
  }
  if (hasUrl) await db.query(`UPDATE businesses SET google_review_url = $2 WHERE id = $1`, [biz.id, googleUrl(input.googleReviewUrl)]);
  return getBusiness(db, actor, biz.id);
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

// ---- website sign-ups (leads) ----------------------------------------------------------------
const LEAD_HOURLY_CAP = 100;
function cleanPhone(v) {
  const d = str(v, 30).replace(/\D/g, '');
  const n = d.length === 11 && d.startsWith('0') ? d.slice(1) : d.length === 12 && d.startsWith('91') ? d.slice(2) : d;
  if (!PHONE_10_RE.test(n) || /^0{10}$/.test(n)) throw bad('Enter a valid 10-digit WhatsApp number.');
  return '91' + n;
}

// Public: the website sign-up form. It creates no login and reads nothing back.
export async function addLead(db, input) {
  if (str(input.company_url, 200)) return { ok: true }; // hidden field only bots fill in: pretend it worked, store nothing
  const kind = input.kind === 'agency' ? 'agency' : 'owner';
  const name = needText(input.name, kind === 'agency' ? 'agency name' : 'business name');
  const email = needEmail(input.email);
  const phone = cleanPhone(input.phone);
  const plan = PLANS.includes(input.plan) ? input.plan : 'yearly';
  const type = str(input.type, 60) || null;
  // The same email twice in a day counts once, and the answer never says whether it was a repeat.
  if (one(await db.query(`SELECT 1 FROM leads WHERE lower(email) = $1 AND created_at > now() - interval '1 day'`, [email]))) return { ok: true };
  const recent = one(await db.query(`SELECT count(*)::int AS n FROM leads WHERE created_at > now() - interval '1 hour'`));
  if (recent.n >= LEAD_HOURLY_CAP) throw new ServiceError(429, 'Too many sign-ups right now. Please try again in a little while.');
  await db.query(
    `INSERT INTO leads (kind, business_name, email, phone, plan, business_type) VALUES ($1, $2, $3, $4, $5, $6)`,
    [kind, name, email, phone, plan, type]);
  return { ok: true };
}

export async function listLeads(db, actor) {
  if (actor.role !== 'super_admin') throw forbidden();
  return db.query(
    `SELECT id, kind, business_name, email, phone, plan, business_type, status, business_id, agency_id, created_at
       FROM leads WHERE status <> 'dismissed' ORDER BY (status = 'new') DESC, created_at DESC, id DESC LIMIT 200`);
}

export async function dismissLead(db, actor, id) {
  if (actor.role !== 'super_admin') throw forbidden();
  const r = await db.query(`UPDATE leads SET status = 'dismissed' WHERE id = $1 AND status = 'new' RETURNING id`, [toId(id)]);
  if (!r.length) throw notFound();
  return { ok: true };
}

// One click: turns a lead into a real business (or agency) with an invite link.
export async function convertLead(db, actor, id) {
  if (actor.role !== 'super_admin') throw forbidden();
  const lid = toId(id);
  // Claim first so two clicks (or two admins) cannot create the same business twice.
  const lead = one(await db.query(`UPDATE leads SET status = 'converted' WHERE id = $1 AND status = 'new' RETURNING *`, [lid]));
  if (!lead) throw new ServiceError(409, 'This sign-up was already handled.');
  try {
    if (lead.kind === 'agency') {
      const r = await createAgency(db, actor, { name: lead.business_name, ownerEmail: lead.email });
      await db.query(`UPDATE leads SET agency_id = $2 WHERE id = $1`, [lid, r.agency.id]);
      return { kind: 'agency', id: r.agency.id, name: r.agency.name, inviteToken: r.inviteToken, phone: lead.phone };
    }
    const r = await createBusiness(db, actor, {
      name: lead.business_name, type: lead.business_type, plan: lead.plan, ownerEmail: lead.email, ownerPermission: true });
    await db.query(`UPDATE leads SET business_id = $2 WHERE id = $1`, [lid, r.business.id]);
    return { kind: 'owner', id: r.business.id, name: r.business.name, inviteToken: r.inviteToken, phone: lead.phone };
  } catch (e) {
    await db.query(`UPDATE leads SET status = 'new' WHERE id = $1`, [lid]); // nothing was created, so let it be tried again
    throw e;
  }
}

function toId(v) {
  const n = Number(v);
  if (!Number.isSafeInteger(n) || n <= 0) throw notFound();
  return n;
}
