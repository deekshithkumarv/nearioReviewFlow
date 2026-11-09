import { handle, preflight } from '../../../../lib/http.js';
import { addFeedback } from '../../../../lib/service.js';
// Public: the customer feedback page posts here. No login. Put a rate limit in front of it (see README).
export const POST = handle(({ db, params, body }) => addFeedback(db, params.businessId, body || {}), { public: true });
export const OPTIONS = preflight;
