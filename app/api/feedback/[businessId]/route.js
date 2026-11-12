import { handle, preflight } from '../../../../lib/http.js';
import { addFeedback, getPublicBusiness } from '../../../../lib/service.js';

// Public: the customer feedback page. No login. Writes are rate limited per IP (lib/ratelimit.js).
// GET gives the page the business name and the Google link. POST saves the customer's feedback.
export const GET = handle(({ db, params }) => getPublicBusiness(db, params.businessId), { public: true });
export const POST = handle(({ db, params, body }) => addFeedback(db, params.businessId, body || {}), { public: true, rateLimit: ['PUBLIC_WRITE_LIMITER', 'feedback'] });
export const OPTIONS = preflight;
