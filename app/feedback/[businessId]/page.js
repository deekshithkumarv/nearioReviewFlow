import FeedbackClient from './FeedbackClient';
import { getDb } from '../../../lib/db';
import { getPublicBusiness, ServiceError } from '../../../lib/service';

// Server-renders the customer page with the business already loaded, so a customer who scans the QR
// sees the form straight away instead of a loading skeleton. Uses the same public, read-only service
// call as GET /api/feedback/:id (name, type, city, services and the Google review link; nothing private).
export const dynamic = 'force-dynamic';

export default async function FeedbackPage({ params }) {
  const { businessId: raw } = await params;
  let businessId = raw;
  try { businessId = decodeURIComponent(raw); } catch { /* malformed escape: treat as-is, it will be not found */ }
  let business = null;
  let state = 'ready';
  try {
    let real;
    const db = { query: async (text, values) => (real ||= await getDb()).query(text, values) };
    business = await getPublicBusiness(db, businessId);
  } catch (e) {
    state = e instanceof ServiceError && e.status === 404 ? 'notfound' : 'error';
    if (state === 'error') console.error('[feedback page] could not load business', e);
  }
  return <FeedbackClient businessId={businessId} initialBusiness={business} initialState={state} />;
}
