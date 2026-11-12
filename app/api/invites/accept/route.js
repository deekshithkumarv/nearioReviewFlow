import { handle, json, secureCookies } from '../../../../lib/http.js';
import { acceptInvite } from '../../../../lib/service.js';
import { signSession, sessionCookie } from '../../../../lib/auth.js';
export const POST = handle(async ({ db, body, sessionSecret }) => {
  const user = await acceptInvite(db, { token: body?.token, password: body?.password });
  return json({ user }, 200, { 'Set-Cookie': sessionCookie(signSession(user.id, sessionSecret || process.env.SESSION_SECRET), { secure: secureCookies() }) });
}, { anonymous: true, rateLimit: ['AUTH_LIMITER', 'accept'] });
