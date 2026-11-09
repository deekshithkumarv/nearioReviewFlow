// Production database: any Postgres reachable by DATABASE_URL (Neon, Vercel Postgres, Supabase, RDS...).
let pool, override;
export async function getDb() {
  if (override) return override;
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');
  if (!pool) {
    const pg = (await import('pg')).default;
    // Parse PostgreSQL int8 (bigint/bigserial) as JS integer numbers
    pg.types.setTypeParser(20, (val) => (val === null ? null : parseInt(val, 10)));
    pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 5 });
  }
  return { query: async (text, params) => (await pool.query(text, params)).rows };
}
export function setDbForTests(db) { override = db; }
