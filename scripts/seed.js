// Creates the first Neario super admin. Run once:  SUPER_ADMIN_EMAIL=you@x.com SUPER_ADMIN_PASSWORD='...' npm run seed
import pg from 'pg';
import { hashPassword } from '../lib/auth.js';
const { SUPER_ADMIN_EMAIL: email, SUPER_ADMIN_PASSWORD: pw, SUPER_ADMIN_NAME: name } = process.env;
if (!email || !pw || pw.length < 12) { console.error('Set SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD (12+ characters).'); process.exit(1); }
const c = new pg.Client({ connectionString: process.env.DATABASE_URL });
await c.connect();
const r = await c.query(
  `INSERT INTO users (email, name, role, status, password_hash) VALUES ($1, $2, 'super_admin', 'active', $3)
   ON CONFLICT (lower(email)) DO NOTHING RETURNING id`, [email.toLowerCase(), name || 'Neario admin', await hashPassword(pw)]);
console.log(r.rowCount ? 'Super admin created.' : 'That email already exists. Nothing changed.');
await c.end();
