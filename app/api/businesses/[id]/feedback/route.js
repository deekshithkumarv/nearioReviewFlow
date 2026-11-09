import { handle } from '../../../../../lib/http.js';
import { listFeedback, ServiceError } from '../../../../../lib/service.js';
// Opening this as an agency or Neario admin is written to the view-as log. Optional ?reason=...
export const GET = handle(async ({ db, actor, params, url }) => {
  const feedback = await listFeedback(db, actor, params.id, { reason: url.searchParams.get('reason') });
  if (!feedback) throw new ServiceError(404, 'Not found.');
  return { feedback };
});
