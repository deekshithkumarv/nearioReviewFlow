import { readFileSync } from 'node:fs';
import pg from 'pg';
const c = new pg.Client({ connectionString: process.env.DATABASE_URL });
await c.connect();
await c.query(readFileSync(new URL('../lib/schema.sql', import.meta.url), 'utf8'));
await c.end();
console.log('Schema is up to date.');
