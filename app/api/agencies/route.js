import { handle } from '../../../lib/http.js';
import { listAgencies, createAgency } from '../../../lib/service.js';
export const GET = handle(async ({ db, actor }) => ({ agencies: await listAgencies(db, actor) }));
export const POST = handle(({ db, actor, body }) => createAgency(db, actor, body || {}));
