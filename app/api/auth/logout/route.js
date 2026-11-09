import { handle, json, secureCookies } from '../../../../lib/http.js';
import { clearCookie } from '../../../../lib/auth.js';
export const POST = handle(async () => json({ ok: true }, 200, { 'Set-Cookie': clearCookie({ secure: secureCookies() }) }), { anonymous: true });
