// Test-only adapter: runs the same SQL on a real Postgres through the psql command.
// Lets the tests run where the `pg` package is not installed. Production uses lib/db.js.
import { spawn } from 'node:child_process';
const lit = (v) => {
  if (v === null || v === undefined) return 'NULL';
  if (typeof v === 'number' || typeof v === 'bigint') return String(v);
  if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
  if (v instanceof Date) return `'${v.toISOString()}'`;
  return `'${String(v).replace(/'/g, "''")}'`;
};
export function psqlDb(args) {
  const run = (sql) => new Promise((res, rej) => {
    const p = spawn('psql', [...args, '-X', '-q', '-A', '-t', '-v', 'ON_ERROR_STOP=1'], { stdio: ['pipe', 'pipe', 'pipe'] });
    let out = '', err = '';
    p.stdout.on('data', (d) => (out += d)); p.stderr.on('data', (d) => (err += d));
    p.on('close', (c) => (c === 0 ? res(out) : rej(Object.assign(new Error(err.trim()), { code: (err.match(/ERROR:\s+(.*)/) || [])[1] }))));
    p.stdin.end(sql);
  });
  return {
    run,
    async query(text, params = []) {
      const sql = text.replace(/\$(\d+)/g, (_, n) => lit(params[Number(n) - 1])).trim().replace(/;$/, '');
      if (/^(select|with)\b/i.test(sql)) {
        return JSON.parse((await run(`SELECT coalesce(json_agg(t),'[]'::json) FROM (${sql}) t`)).trim());
      }
      if (/\breturning\b/i.test(sql)) {
        return JSON.parse((await run(`WITH q AS (${sql}) SELECT coalesce(json_agg(q),'[]'::json) FROM q`)).trim());
      }
      await run(sql); return [];
    },
  };
}
