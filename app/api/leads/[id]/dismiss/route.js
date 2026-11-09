import { handle } from '../../../../../lib/http.js';
import { dismissLead } from '../../../../../lib/service.js';

export const POST = handle(({ db, actor, params }) => dismissLead(db, actor, params.id));

