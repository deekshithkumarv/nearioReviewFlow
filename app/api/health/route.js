import { getDb, resolveEnv } from '../../../lib/db.js';
import { json } from '../../../lib/http.js';

// Public uptime check. It says only whether the service is healthy; which setting is missing
// goes to the server log, not to the public.
export async function GET() {
  const rawDbUrl = await resolveEnv('DATABASE_URL');
  const sessionSecret = await resolveEnv('SESSION_SECRET');
  const hasDbUrl = typeof rawDbUrl === 'string' && rawDbUrl.trim() !== '';
  const hasSessionSecret = typeof sessionSecret === 'string' && sessionSecret.length >= 32;

  let dbOk = false;
  if (hasDbUrl) {
    try {
      await (await getDb()).query('SELECT 1');
      dbOk = true;
    } catch (e) {
      console.error('[health] database check failed', e);
    }
  }
  if (!hasDbUrl || !hasSessionSecret) {
    console.error('[health] missing configuration', { databaseUrl: hasDbUrl, sessionSecret: hasSessionSecret });
  }

  const ok = hasDbUrl && hasSessionSecret && dbOk;
  return json({ ok }, ok ? 200 : 503);
}
