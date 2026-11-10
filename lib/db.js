// Production database: Neon serverless HTTP driver (Cloudflare Workers + Node.js compatible).
import { neon, types } from '@neondatabase/serverless';

// Parse PostgreSQL int8 (bigint/bigserial) as JS integer numbers.
types.setTypeParser(20, (val) => (val === null ? null : parseInt(val, 10)));

let override;

export async function resolveEnv(key) {
  if (process.env[key]) return process.env[key];
  try {
    const mod = await import('@opennextjs/cloudflare');
    const ctx = await mod.getCloudflareContext({ async: true });
    if (ctx?.env?.[key]) return ctx.env[key];
  } catch {
    // Not running inside OpenNext Cloudflare runtime.
  }
  return undefined;
}

export async function getDb() {
  if (override) return override;
  const url = await resolveEnv('DATABASE_URL');
  if (!url) throw new Error('DATABASE_URL is not set');

  // Create per-request HTTP query client so Cloudflare Workers never reuse I/O across requests.
  const sql = neon(url);

  return {
    query: async (text, params) => {
      try {
        return await sql.query(text, params);
      } catch (err) {
        const msg = String(err?.message || '');
        const code = err?.code || err?.sourceError?.cause?.code || err?.sourceError?.code;
        if (code === 'EAI_AGAIN' || code === 'ECONNRESET' || code === 'ETIMEDOUT' || msg.includes('fetch failed')) {
          console.warn('Transient Neon HTTP error, retrying once...', msg);
          return await sql.query(text, params);
        }
        throw err;
      }
    },
  };
}

export function setDbForTests(db) {
  override = db;
}
