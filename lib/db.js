// Production database: any Postgres reachable by DATABASE_URL (Neon, Vercel Postgres, Supabase, RDS...).
let pool, override;

async function createPool() {
  const pg = (await import('pg')).default;
  // Parse PostgreSQL int8 (bigint/bigserial) as JS integer numbers
  pg.types.setTypeParser(20, (val) => (val === null ? null : parseInt(val, 10)));
  const newPool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 5 });
  newPool.on('error', (err) => {
    console.warn('Database pool client error:', err.message);
  });
  return newPool;
}

export async function getDb() {
  if (override) return override;
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');
  if (!pool) {
    pool = await createPool();
  }
  return {
    query: async (text, params) => {
      try {
        return (await pool.query(text, params)).rows;
      } catch (err) {
        // Auto-recover from transient connection drops (e.g. system wake from sleep, DNS EAI_AGAIN, ECONNRESET)
        if (
          err.code === 'EAI_AGAIN' ||
          err.code === 'ECONNRESET' ||
          err.code === 'ETIMEDOUT' ||
          err.message?.includes('Connection terminated')
        ) {
          console.warn('Transient DB connection issue, refreshing pool and retrying once...', err.message);
          try {
            await pool.end().catch(() => {});
          } catch {}
          pool = await createPool();
          return (await pool.query(text, params)).rows;
        }
        throw err;
      }
    },
  };
}
export function setDbForTests(db) { override = db; }
