import { handle } from '../../../lib/http.js';
import { addLead, listLeads } from '../../../lib/service.js';

// GET: Neario admin only. POST: the website sign-up form (no login, same-site only, never reads anything back).
export const GET = handle(async ({ db, actor }) => ({ leads: await listLeads(db, actor) }));
export const POST = handle(({ db, body }) => addLead(db, body || {}), { anonymous: true });
