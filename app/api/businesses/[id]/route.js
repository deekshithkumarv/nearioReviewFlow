import { handle } from '../../../../lib/http.js';
import { getBusiness, updateBusiness, ServiceError } from '../../../../lib/service.js';

export const GET = handle(async ({ db, actor, params }) => {
  const business = await getBusiness(db, actor, params.id);
  if (!business) throw new ServiceError(404, 'Not found.');
  return { business };
});

export const PATCH = handle(async ({ db, actor, params, body }) => ({
  business: await updateBusiness(db, actor, params.id, body || {}),
}));
