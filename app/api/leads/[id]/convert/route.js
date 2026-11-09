import { handle } from '../../../../../lib/http.js';
import { convertLead } from '../../../../../lib/service.js';

export const POST = handle(({ db, actor, params }) => convertLead(db, actor, params.id));

