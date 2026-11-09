// Thin wrapper shared by every API route: sign-in check, origin check, JSON in/out, safe errors.
import { getDb } from './db.js';
import { loadActor, ServiceError } from './service.js';
import { parseCookies, readSession, SESSION_COOKIE } from './auth.js';

const NO_STORE = { 'Cache-Control': 'no-store' };
export const secureCookies = () => process.env.NODE_ENV === 'production';

export function json(data, status = 200, headers = {}) {
  return Response.json(data, { status, headers: { ...NO_STORE, ...headers } });
}

export async function actorFromRequest(req, db) {
  const token = parseCookies(req.headers.get('cookie'))[SESSION_COOKIE];
  const uid = readSession(token, process.env.SESSION_SECRET);
  return uid ? loadActor(db, uid) : null; // re-read from the database on every request, so disabling a user takes effect at once
}

// Browsers always send Origin on cross-site POSTs. Refuse any that is not this site.
function checkOrigin(req) {
  if (req.method === 'GET' || req.method === 'HEAD') return;
  const origin = req.headers.get('origin');
  if (origin && new URL(origin).host !== req.headers.get('host')) throw new ServiceError(403, 'Cross-site request refused.');
}

async function readJson(req) {
  if (req.method === 'GET' || req.method === 'HEAD') return null;
  const ct = req.headers.get('content-type') || '';
  const text = await req.text().catch(() => '');
  if (!text || text.trim() === '') return {};
  if (!ct.includes('application/json')) throw new ServiceError(415, 'Send JSON.');
  try {
    const b = JSON.parse(text);
    return b && typeof b === 'object' ? b : {};
  } catch {
    throw new ServiceError(400, 'That request was not valid JSON.');
  }
}

// opts.public: no sign-in needed (customer feedback form). It may be called from your feedback site's domain.
export function handle(fn, opts = {}) {
  return async (req, ctx) => {
    const cors = opts.public ? { 'Access-Control-Allow-Origin': '*' } : {};
    try {
      if (!opts.public) checkOrigin(req);
      const db = await getDb();
      let actor = null;
      if (!opts.public && !opts.anonymous) {
        actor = await actorFromRequest(req, db);
        if (!actor) throw new ServiceError(401, 'Please sign in.');
      }
      const body = await readJson(req);
      const params = ctx?.params ? await ctx.params : {};
      const out = await fn({ db, actor, body, params, req, url: new URL(req.url) });
      return out instanceof Response ? out : json(out, 200, cors);
    } catch (e) {
      if (e instanceof ServiceError) return json({ error: e.message }, e.status, cors);
      console.error(e); // details stay in the server log
      return json({ error: 'Something went wrong. Please try again.' }, 500, cors);
    }
  };
}
export const preflight = () => new Response(null, { status: 204, headers: {
  'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'content-type' } });
