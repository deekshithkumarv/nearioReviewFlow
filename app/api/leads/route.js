import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json();
    const { kind, name, email, phone, plan, type } = body || {};

    if (!name || !email || !phone) {
      return NextResponse.json(
        { error: 'Please provide all required details (name, email, and phone).' },
        { status: 400 }
      );
    }

    console.log('[LEAD SUBMITTED]', {
      kind,
      name,
      email,
      phone,
      plan: plan || 'yearly',
      type: type || 'Salon or spa',
      submittedAt: new Date().toISOString(),
    });

    return NextResponse.json({ ok: true, message: 'Thank you! We have received your details.' });
  } catch (err) {
    console.error('Leads API error:', err);
    return NextResponse.json({ error: 'Could not process request.' }, { status: 500 });
  }
}

