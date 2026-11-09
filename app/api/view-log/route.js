import { handle } from '../../../lib/http.js';
import { listViewLog } from '../../../lib/service.js';
export const GET = handle(async ({ db, actor }) => ({ log: await listViewLog(db, actor) }));
