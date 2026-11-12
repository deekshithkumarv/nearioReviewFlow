// Per-IP rate limiting with Cloudflare's Workers Rate Limiting bindings (configured in wrangler.jsonc).
// Outside Cloudflare (local dev, tests) the bindings don't exist and every request is allowed;
// the database-level hourly caps in lib/service.js still apply everywhere.
import { ServiceError } from './service.js';

async function getBinding(name) {
  try {
    const mod = await import('@opennextjs/cloudflare');
    const ctx = await mod.getCloudflareContext({ async: true });
    return ctx?.env?.[name] || null;
  } catch {
    return null;
  }
}

function clientIp(req) {
  return req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
}

// bucket: a short label so different endpoints don't share one counter.
export async function enforceRateLimit(req, bindingName, bucket) {
  const limiter = await getBinding(bindingName);
  if (!limiter?.limit) return;
  let ok = true;
  try {
    ({ success: ok } = await limiter.limit({ key: `${bucket}:${clientIp(req)}` }));
  } catch (e) {
    console.error('[ratelimit] limiter unavailable, allowing request', e); // fail open: never lock out real customers
    return;
  }
  if (!ok) throw new ServiceError(429, 'Too many attempts. Please wait a minute and try again.');
}
