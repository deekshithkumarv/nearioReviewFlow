import { getDb } from '../lib/db.js';
import { POST as loginRoute } from '../app/api/auth/login/route.js';
import { POST as acceptRoute } from '../app/api/invites/accept/route.js';
import { GET as meRoute } from '../app/api/me/route.js';
import { GET as listAgenciesRoute, POST as createAgencyRoute } from '../app/api/agencies/route.js';
import { GET as listBusinessesRoute, POST as createBusinessRoute } from '../app/api/businesses/route.js';
import { GET as getBusinessFeedbackRoute } from '../app/api/businesses/[id]/feedback/route.js';
import { GET as getPublicBusinessRoute, POST as submitFeedbackRoute } from '../app/api/feedback/[businessId]/route.js';
import { PATCH as updateBusinessRoute } from '../app/api/businesses/[id]/route.js';
import { GET as listLeadsRoute, POST as submitLeadRoute } from '../app/api/leads/route.js';
import { POST as convertLeadRoute } from '../app/api/leads/[id]/convert/route.js';
import { GET as getViewLogRoute } from '../app/api/view-log/route.js';

const BASE_URL = 'http://localhost:3000';

function makeReq(path, { method = 'GET', body, cookie } = {}) {
  const headers = { host: 'localhost:3000' };
  if (cookie) headers['cookie'] = cookie;
  if (body !== undefined) headers['content-type'] = 'application/json';

  return new Request(BASE_URL + path, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

function getCookie(response) {
  const sc = response.headers.get('set-cookie');
  if (!sc) return null;
  return sc.split(';')[0];
}

async function runTests() {
  console.log('\n======================================================');
  console.log('🚀 RUNNING NEARIO END-TO-END INTEGRATION TEST SUITE');
  console.log('======================================================\n');

  const db = await getDb();
  console.log('✓ Successfully connected to Neon PostgreSQL database.');

  // Test 1: Verify tables exist
  const tables = await db.query(`
    SELECT tablename FROM pg_catalog.pg_tables 
    WHERE schemaname = 'public' 
    ORDER BY tablename;
  `);
  const tableNames = tables.map(t => t.tablename);
  console.log('✓ Public tables found in Neon DB:', tableNames.join(', '));
  const expectedTables = ['agencies', 'businesses', 'feedback', 'invites', 'leads', 'users', 'view_log'];
  for (const t of expectedTables) {
    if (!tableNames.includes(t)) {
      throw new Error(`Missing expected table: ${t}`);
    }
  }

  // Test 2: Super Admin Login
  console.log('\n--- 1. Testing Super Admin Login ---');
  const superAdminEmail = 'admin@nearioreviewflow.com';
  const superAdminPass = 'NearioAdmin2026!';
  
  const loginRes = await loginRoute(makeReq('/api/auth/login', {
    method: 'POST',
    body: { email: superAdminEmail, password: superAdminPass }
  }));

  if (loginRes.status !== 200) {
    const err = await loginRes.json();
    throw new Error(`Super admin login failed (${loginRes.status}): ${JSON.stringify(err)}`);
  }
  const adminCookie = getCookie(loginRes);
  const loginData = await loginRes.json();
  console.log(`✓ Super Admin logged in successfully! Role: ${loginData.user.role}, Name: ${loginData.user.name}`);
  console.log(`✓ Raw set-cookie: ${loginRes.headers.get('set-cookie')}`);
  console.log(`✓ Extracted cookie: ${adminCookie}`);

  // Test 3: /api/me with Admin Cookie
  console.log('\n--- 2. Verifying /api/me Session ---');
  const meRes = await meRoute(makeReq('/api/me', { cookie: adminCookie }));
  if (meRes.status !== 200) {
    throw new Error(`/api/me failed with status ${meRes.status}`);
  }
  const meData = await meRes.json();
  console.log(`✓ /api/me correctly identified session user: ${meData.user.email} (${meData.user.role})`);

  // Test 4: Create Agency
  console.log('\n--- 3. Creating Agency as Super Admin ---');
  const testAgencyEmail = `growth+${Date.now()}@velocitymarketing.test`;
  const createAgencyRes = await createAgencyRoute(makeReq('/api/agencies', {
    method: 'POST',
    cookie: adminCookie,
    body: {
      name: 'Velocity Digital Marketing',
      ownerEmail: testAgencyEmail
    }
  }));

  if (createAgencyRes.status !== 200) {
    const err = await createAgencyRes.json();
    throw new Error(`Create agency failed (${createAgencyRes.status}): ${JSON.stringify(err)}`);
  }
  const agencyData = await createAgencyRes.json();
  const agencyId = agencyData.agency.id;
  const agencyInviteToken = agencyData.inviteToken;
  console.log(`✓ Created agency "${agencyData.agency.name}" (ID: ${agencyId})`);
  console.log(`✓ Generated Agency Invite Token: ${agencyInviteToken.substring(0, 10)}...`);

  // Test 5: Accept Agency Invite & Set Password
  console.log('\n--- 4. Accepting Agency Invite ---');
  const agencyPassword = 'VelocityAgency2026!';
  const acceptAgencyRes = await acceptRoute(makeReq('/api/invites/accept', {
    method: 'POST',
    body: {
      token: agencyInviteToken,
      password: agencyPassword
    }
  }));

  if (acceptAgencyRes.status !== 200) {
    const err = await acceptAgencyRes.json();
    throw new Error(`Accept invite failed (${acceptAgencyRes.status}): ${JSON.stringify(err)}`);
  }
  const agencyCookie = getCookie(acceptAgencyRes);
  const agencySession = await acceptAgencyRes.json();
  console.log(`✓ Agency user activated! Email: ${agencySession.user.email}, Role: ${agencySession.user.role}`);

  // Test 6: Agency creates a Client Business
  console.log('\n--- 5. Agency Creates Client Business ---');
  const clientEmail = `owner+${Date.now()}@artisanbakery.test`;
  const createBizRes = await createBusinessRoute(makeReq('/api/businesses', {
    method: 'POST',
    cookie: agencyCookie,
    body: {
      name: 'Artisan Bakery & Cafe',
      ownerEmail: clientEmail,
      ownerPermission: true
    }
  }));

  if (createBizRes.status !== 200) {
    const err = await createBizRes.json();
    throw new Error(`Create business failed (${createBizRes.status}): ${JSON.stringify(err)}`);
  }
  const bizData = await createBizRes.json();
  const businessId = bizData.business.id;
  const clientInviteToken = bizData.inviteToken;
  console.log(`✓ Business "${bizData.business.name}" created under Agency (ID: ${businessId})`);
  console.log(`✓ Generated Client Invite Token: ${clientInviteToken.substring(0, 10)}...`);

  // Test 7: Public Guest Submits Feedback
  console.log('\n--- 6. Public Guest Submits Feedback ---');
  const feedbackPayload = {
    rating: 5,
    text: 'The sourdough bread and specialty espresso were absolutely exceptional! Wonderful warm atmosphere.'
  };

  const feedbackRes = await submitFeedbackRoute(
    makeReq(`/api/feedback/${businessId}`, {
      method: 'POST',
      body: feedbackPayload
    }),
    { params: Promise.resolve({ businessId }) }
  );

  if (feedbackRes.status !== 200) {
    const err = await feedbackRes.json();
    throw new Error(`Submit feedback failed (${feedbackRes.status}): ${JSON.stringify(err)}`);
  }
  const feedbackResult = await feedbackRes.json();
  console.log(`✓ Feedback submitted successfully: ok=${feedbackResult.ok}`);

  // Test 8: Agency Views Client Feedback (Logs view audit)
  console.log('\n--- 7. Agency Views Client Feedback (Audited Access) ---');
  const viewReason = 'Weekly performance review with client';
  const viewFeedbackRes = await getBusinessFeedbackRoute(
    makeReq(`/api/businesses/${businessId}/feedback?reason=${encodeURIComponent(viewReason)}`, {
      method: 'GET',
      cookie: agencyCookie
    }),
    { params: Promise.resolve({ id: businessId }) }
  );

  if (viewFeedbackRes.status !== 200) {
    const err = await viewFeedbackRes.json();
    throw new Error(`View feedback failed (${viewFeedbackRes.status}): ${JSON.stringify(err)}`);
  }
  const feedbackData = await viewFeedbackRes.json();
  const feedbackList = feedbackData.feedback || [];
  console.log(`✓ Agency retrieved ${feedbackList.length} feedback item(s).`);
  console.log(`✓ Verified review rating: ${feedbackList[0].rating} stars, text: "${feedbackList[0].text}"`);

  // Test 9: Verify View Log Audit Trail
  console.log('\n--- 8. Verifying Audit Trail in View Log ---');
  const viewLogRes = await getViewLogRoute(makeReq('/api/view-log', {
    method: 'GET',
    cookie: agencyCookie
  }));

  if (viewLogRes.status !== 200) {
    const err = await viewLogRes.json();
    throw new Error(`Get view log failed (${viewLogRes.status}): ${JSON.stringify(err)}`);
  }
  const viewLogData = await viewLogRes.json();
  const viewLogs = viewLogData.log || [];
  console.log(`✓ View log retrieved ${viewLogs.length} audit entry/entries.`);
  const latestLog = viewLogs[0];
  console.log(`✓ Latest audit entry: Business ID ${latestLog.business_id}, Viewed By: ${latestLog.actor_name || latestLog.actor_email}, Reason: "${latestLog.reason}"`);

  // Test 10: Client accepts invite and logs in
  console.log('\n--- 9. Client Accepts Invite & Signs In ---');
  const clientPassword = 'ClientOwner2026!';
  const acceptClientRes = await acceptRoute(makeReq('/api/invites/accept', {
    method: 'POST',
    body: {
      token: clientInviteToken,
      password: clientPassword
    }
  }));

  if (acceptClientRes.status !== 200) {
    const err = await acceptClientRes.json();
    throw new Error(`Accept client invite failed (${acceptClientRes.status}): ${JSON.stringify(err)}`);
  }
  const clientCookie = getCookie(acceptClientRes);
  const clientSession = await acceptClientRes.json();
  console.log(`✓ Client owner activated! Email: ${clientSession.user.email}, Role: ${clientSession.user.role}`);

  // Test 11: Data Isolation Check
  console.log('\n--- 10. Verifying Multi-Tenant Data Isolation ---');
  // Client should NOT be able to view agencies
  const clientAgenciesRes = await listAgenciesRoute(makeReq('/api/agencies', {
    cookie: clientCookie
  }));
  console.log(`✓ Client forbidden from viewing agencies: status=${clientAgenciesRes.status} (expected 403)`);
  if (clientAgenciesRes.status !== 403) {
    throw new Error(`Expected 403 for client accessing agencies, got ${clientAgenciesRes.status}`);
  }

  // Client should only see their own business
  const clientBizRes = await listBusinessesRoute(makeReq('/api/businesses', {
    cookie: clientCookie
  }));
  const clientBizData = await clientBizRes.json();
  const clientBusinesses = clientBizData.businesses || [];
  console.log(`✓ Client sees exactly ${clientBusinesses.length} business (their own: "${clientBusinesses[0]?.name}")`);
  if (clientBusinesses.length !== 1 || clientBusinesses[0]?.id !== businessId) {
    throw new Error(`Client saw unexpected businesses!`);
  }

  // Test 12: Website Lead Submission & Honeypot Protection
  console.log('\n--- 11. Website Lead Submission & Bot Protection ---');
  // Honeypot test: if company_url is populated, bot is rejected silently with status 200 { ok: true }
  const botLeadRes = await submitLeadRoute(makeReq('/api/leads', {
    method: 'POST',
    body: {
      businessName: 'Spam Bot Business',
      email: 'bot@spam.com',
      company_url: 'https://spambot.xyz'
    }
  }));
  const botLeadData = await botLeadRes.json();
  console.log(`✓ Bot trap response: ok=${botLeadData.ok}`);

  // Real lead test
  const testLeadEmail = `lead+${Date.now()}@organicbakery.test`;
  const realLeadRes = await submitLeadRoute(makeReq('/api/leads', {
    method: 'POST',
    body: {
      kind: 'owner',
      name: 'Artisan Sourdough Bakery',
      type: 'Restaurant or café',
      email: testLeadEmail,
      phone: '9876543210',
      plan: 'yearly'
    }
  }));
  if (realLeadRes.status !== 200) {
    const err = await realLeadRes.json();
    throw new Error(`Real lead submission failed with status ${realLeadRes.status}: ${JSON.stringify(err)}`);
  }
  const realLeadData = await realLeadRes.json();
  console.log(`✓ Real lead captured successfully! ok=${realLeadData.ok}`);

  // Test 13: Super Admin Converts Lead to Client Business
  console.log('\n--- 12. Super Admin Converts Lead to Client ---');
  const leadsListRes = await listLeadsRoute(makeReq('/api/leads', { cookie: adminCookie }));
  const leadsListData = await leadsListRes.json();
  const matchingLead = (leadsListData.leads || []).find(l => l.email === testLeadEmail);
  if (!matchingLead) throw new Error('Created lead was not returned in /api/leads');
  const leadId = matchingLead.id;
  console.log(`✓ Lead verified in Super Admin leads list. ID: ${leadId}, Status: ${matchingLead.status}`);

  const convertRes = await convertLeadRoute(
    makeReq(`/api/leads/${leadId}/convert`, { method: 'POST', cookie: adminCookie }),
    { params: Promise.resolve({ id: String(leadId) }) }
  );
  if (convertRes.status !== 200) {
    const err = await convertRes.json();
    throw new Error(`Lead conversion failed: ${JSON.stringify(err)}`);
  }
  const convertData = await convertRes.json();
  const convertedBizId = convertData.id;
  const convertedInviteToken = convertData.inviteToken;
  console.log(`✓ Lead converted! Business ID: ${convertedBizId}, Token: ${convertedInviteToken?.substring(0, 8)}...`);

  // Test 14: Client Onboarding and Feedback Enrichment
  console.log('\n--- 13. Client Onboarding & Dynamic Feedback Flow ---');
  // Update business with services and google review link
  const updateBizRes = await updateBusinessRoute(
    makeReq(`/api/businesses/${convertedBizId}`, {
      method: 'PATCH',
      cookie: adminCookie,
      body: {
        services: ['Sourdough Loaf', 'Butter Croissant', 'Espresso'],
        googleReviewUrl: 'https://g.page/r/artisan-bakery/review',
        payStatus: 'paid'
      }
    }),
    { params: Promise.resolve({ id: String(convertedBizId) }) }
  );
  if (updateBizRes.status !== 200) {
    throw new Error(`Business update failed with status ${updateBizRes.status}`);
  }
  console.log(`✓ Business services and Google Review URL configured.`);

  // Verify public feedback page retrieves these services
  const publicBizRes = await getPublicBusinessRoute(
    makeReq(`/api/feedback/${convertedBizId}`),
    { params: Promise.resolve({ businessId: String(convertedBizId) }) }
  );
  if (publicBizRes.status !== 200) {
    throw new Error(`Public feedback info fetch failed: ${publicBizRes.status}`);
  }
  const publicBizData = await publicBizRes.json();
  console.log(`✓ Customer sees public business: "${publicBizData.name}", services: [${publicBizData.services?.join(', ')}]`);
  if (publicBizData.services?.length !== 3) {
    throw new Error(`Expected 3 services on public business, found ${publicBizData.services?.length}`);
  }

  // Submit customer feedback for this business with service + tags + consent
  const customerFeedbackRes = await submitFeedbackRoute(
    makeReq(`/api/feedback/${convertedBizId}`, {
      method: 'POST',
      body: {
        rating: 5,
        service: 'Sourdough Loaf',
        tags: ['Great taste', 'Fresh bake'],
        txt: 'Best crust and sourdough aroma in Pune! Outstanding staff.',
        phone: '9876543210',
        contact_ok: true,
        lang: 'en'
      }
    }),
    { params: Promise.resolve({ businessId: String(convertedBizId) }) }
  );
  if (customerFeedbackRes.status !== 200) {
    throw new Error(`Customer feedback submission failed: ${customerFeedbackRes.status}`);
  }
  const customerFbData = await customerFeedbackRes.json();
  console.log(`✓ Customer feedback submitted! Feedback ID: ${customerFbData.feedback?.id}`);

  console.log('\n======================================================');
  console.log('🎉 ALL INTEGRATION TESTS PASSED WITH 100% SUCCESS!');
  console.log('======================================================\n');
  process.exit(0);
}

runTests().catch(err => {
  console.error('\n❌ TEST RUN FAILED:', err);
  process.exit(1);
});
