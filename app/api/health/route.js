import { getDb, resolveEnv } from '../../../lib/db.js';
import { json } from '../../../lib/http.js';

export async function GET() {
  const rawDbUrl = await resolveEnv('DATABASE_URL');
  const hasDbUrl = Boolean(typeof rawDbUrl === 'string' && rawDbUrl.trim());
  const sessionSecret = await resolveEnv('SESSION_SECRET');
  const hasSessionSecret = Boolean(typeof sessionSecret === 'string' && sessionSecret.length >= 32);

  let dbOk = false;
  if (hasDbUrl) {
    try {
      const db = await getDb();
      await db.query('SELECT 1');
      dbOk = true;
    } catch {
      dbOk = false;
    }
  }

  const ok = hasDbUrl && hasSessionSecret && dbOk;
  return json(
    {
      ok,
      env: {
        databaseUrl: hasDbUrl,
        sessionSecret: hasSessionSecret,
      },
      db: dbOk ? 'ok' : 'unavailable',
    },
    ok ? 200 : 503
  );
}
