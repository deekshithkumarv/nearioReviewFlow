import { handle } from '../../../../lib/http.js';
import { resendInvite } from '../../../../lib/service.js';
// Returns the new link token so your server can email it. Never show it to anyone but the invited person.
export const POST = handle(({ db, actor, body }) => resendInvite(db, actor, Number(body?.userId)));
