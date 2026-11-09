import { handle } from '../../../lib/http.js';
export const GET = handle(async ({ actor }) => ({ user: actor }));
