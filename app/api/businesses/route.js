import { handle } from '../../../lib/http.js';
import { listBusinesses, createBusiness } from '../../../lib/service.js';
export const GET = handle(async ({ db, actor }) => ({ businesses: await listBusinesses(db, actor) }));
export const POST = handle(({ db, actor, body }) => createBusiness(db, actor, body || {}));
