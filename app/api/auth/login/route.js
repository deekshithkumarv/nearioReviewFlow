import { handle, json, secureCookies } from '../../../../lib/http.js';
import { login } from '../../../../lib/service.js';
import { signSession, sessionCookie } from '../../../../lib/auth.js';
export const POST = handle(async ({ db, body, sessionSecret }) => {
  const actor = await login(db, body || {});
  if (!actor) return json({ error: 'Wrong email or password.' }, 401);
  const token = signSession(actor.id, sessionSecret || process.env.SESSION_SECRET);
  return json({ user: actor }, 200, { 'Set-Cookie': sessionCookie(token, { secure: secureCookies() }) });
}, { anonymous: true });
