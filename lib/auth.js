// Passwords (scrypt), signed session cookies (HMAC-SHA256), invite tokens. Node built-ins only.
import { scrypt as _scrypt, randomBytes, timingSafeEqual, createHmac, createHash } from 'node:crypto';
import { promisify } from 'node:util';
const scrypt = promisify(_scrypt);

export const SESSION_COOKIE = 'neario_session';
export const SESSION_SECONDS = 60 * 60 * 24 * 7;

export async function hashPassword(pw) {
  const salt = randomBytes(16);
  const key = await scrypt(pw, salt, 64);
  return `s1$${salt.toString('base64')}$${key.toString('base64')}`;
}
export async function verifyPassword(pw, stored) {
  const [v, s, k] = String(stored || '').split('$');
  if (v !== 's1' || !s || !k) return false;
  const want = Buffer.from(k, 'base64');
  const got = await scrypt(pw, Buffer.from(s, 'base64'), want.length);
  return want.length === got.length && timingSafeEqual(want, got);
}
// Used to spend the same time when an email does not exist (lazy-initialized so Worker startup avoids top-level await).
let _dummyHashPromise;
export function getDummyHash() {
  if (!_dummyHashPromise) _dummyHashPromise = hashPassword('not-a-real-password');
  return _dummyHashPromise;
}

const b64u = (b) => Buffer.from(b).toString('base64url');
function secretOf(secret) {
  if (!secret || secret.length < 32) throw new Error('SESSION_SECRET must be set to at least 32 characters');
  return secret;
}
export function signSession(userId, secret, now = Date.now()) {
  const body = b64u(JSON.stringify({ u: String(userId), e: Math.floor(now / 1000) + SESSION_SECONDS }));
  const sig = createHmac('sha256', secretOf(secret)).update(body).digest('base64url');
  return `${body}.${sig}`;
}
export function readSession(token, secret, now = Date.now()) {
  if (!token || typeof token !== 'string') return null;
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;
  const want = createHmac('sha256', secretOf(secret)).update(body).digest();
  const got = Buffer.from(sig, 'base64url');
  if (want.length !== got.length || !timingSafeEqual(want, got)) return null;
  try {
    const p = JSON.parse(Buffer.from(body, 'base64url').toString());
    // Postgres returns bigint ids as strings, so the id is stored as text and read back as a number.
    if (!p || !/^\d{1,15}$/.test(String(p.u)) || p.e < Math.floor(now / 1000)) return null;
    return Number(p.u);
  } catch { return null; }
}
export function parseCookies(header) {
  const out = {};
  for (const part of String(header || '').split(';')) {
    const i = part.indexOf('=');
    if (i <= 0) continue;
    const raw = part.slice(i + 1).trim();
    let val = raw;
    try { val = decodeURIComponent(raw); } catch { /* a malformed cookie from another app must not break sign-in */ }
    out[part.slice(0, i).trim()] = val;
  }
  return out;
}
export function sessionCookie(token, { secure = true } = {}) {
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_SECONDS}${secure ? '; Secure' : ''}`;
}
export function clearCookie({ secure = true } = {}) {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure ? '; Secure' : ''}`;
}
export function newInviteToken() {
  const token = randomBytes(32).toString('base64url');
  return { token, hash: hashToken(token) };
}
export const hashToken = (t) => createHash('sha256').update(String(t)).digest('hex');
