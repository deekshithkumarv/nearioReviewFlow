import { resolveEnv } from '../../../../lib/db.js';
import { handle, json } from '../../../../lib/http.js';
import { ServiceError } from '../../../../lib/service.js';

const EMAIL_RE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export const POST = handle(async ({ actor, body }) => {
  if (actor.role !== 'super_admin' && actor.role !== 'agency_user') {
    throw new ServiceError(403, 'You do not have access to this.');
  }

  const to = typeof body?.to === 'string' ? body.to.trim().toLowerCase() : '';
  if (!EMAIL_RE.test(to)) {
    throw new ServiceError(400, 'Enter a valid recipient email address.');
  }

  const rawLink = typeof body?.inviteLink === 'string' ? body.inviteLink.trim() : '';
  let linkUrl;
  try {
    linkUrl = new URL(rawLink);
  } catch {
    throw new ServiceError(400, 'Invalid invite link.');
  }
  if (!['http:', 'https:'].includes(linkUrl.protocol) || !linkUrl.pathname.startsWith('/accept')) {
    throw new ServiceError(400, 'Invalid invite link.');
  }

  const businessName =
    typeof body?.businessName === 'string' && body.businessName.trim()
      ? body.businessName.trim().slice(0, 120)
      : 'your workspace';

  const subject = `Your Neario ReviewFlow invite for ${businessName}`;
  const safeName = escapeHtml(businessName);
  const safeLink = escapeHtml(linkUrl.toString());

  const text = [
    `Hi,`,
    ``,
    `Your Neario ReviewFlow account for ${businessName} is ready.`,
    `Open the link below to set your password and finish setup (valid for 7 days):`,
    ``,
    linkUrl.toString(),
    ``,
    `— Neario ReviewFlow`,
  ].join('\n');

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; color: #1a241e;">
      <h2 style="margin: 0 0 12px; font-size: 20px; color: #164e36;">Your Neario ReviewFlow account is ready</h2>
      <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.5; color: #3f4b44;">
        An account has been created for <strong>${safeName}</strong>. Click the button below to choose your password and launch your feedback QR kit (this link expires in 7 days):
      </p>
      <p style="margin: 24px 0;">
        <a href="${safeLink}" style="display: inline-block; background: #164e36; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 14px; padding: 12px 20px; border-radius: 10px;">
          Accept Invite &amp; Set Password
        </a>
      </p>
      <p style="margin: 0 0 8px; font-size: 12.5px; color: #647068;">
        Or copy and paste this link into your browser:
      </p>
      <p style="margin: 0; font-size: 12px; font-family: monospace; word-break: break-all; background: #f4f3ef; padding: 10px 12px; border-radius: 8px; color: #1a241e;">
        ${safeLink}
      </p>
    </div>
  `.trim();

  // Option 1: Personal Gmail via Google Apps Script Web App webhook
  const gmailWebhookUrl = (await resolveEnv('GMAIL_WEBHOOK_URL'))?.trim();
  const gmailWebhookSecret = (await resolveEnv('GMAIL_WEBHOOK_SECRET'))?.trim();
  if (gmailWebhookUrl) {
    if (!gmailWebhookSecret) {
      throw new ServiceError(500, 'GMAIL_WEBHOOK_SECRET must be set alongside GMAIL_WEBHOOK_URL.');
    }
    let hookParsed;
    try {
      hookParsed = new URL(gmailWebhookUrl);
    } catch {
      throw new ServiceError(500, 'GMAIL_WEBHOOK_URL is not a valid URL.');
    }
    if (hookParsed.protocol !== 'https:') {
      throw new ServiceError(500, 'GMAIL_WEBHOOK_URL must use https://.');
    }

    const hookRes = await fetch(hookParsed.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: gmailWebhookSecret,
        to,
        subject,
        text,
        html,
        senderName: 'Neario ReviewFlow',
      }),
    });

    const raw = await hookRes.text();
    let hookData = null;
    try {
      hookData = JSON.parse(raw);
    } catch {
      throw new ServiceError(
        502,
        'Gmail webhook did not return JSON. Ensure Apps Script is deployed as Web App with "Who has access: Anyone".'
      );
    }

    if (!hookRes.ok || !hookData?.ok) {
      throw new ServiceError(
        502,
        hookData?.error || 'Failed to send invite via Gmail webhook.'
      );
    }

    return json({
      ok: true,
      sent: true,
      configured: true,
      provider: 'gmail_webhook',
      to,
    });
  }

  // Option 2: Resend API (requires verified custom domain for EMAIL_FROM)
  const apiKey = (await resolveEnv('RESEND_API_KEY'))?.trim();
  if (!apiKey) {
    return json({ ok: false, sent: false, configured: false, to });
  }

  const from =
    (await resolveEnv('EMAIL_FROM'))?.trim() ||
    'Neario ReviewFlow <onboarding@resend.dev>';

  const resendRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      text,
      html,
    }),
  });

  const resendData = await resendRes.json().catch(() => ({}));
  if (!resendRes.ok) {
    throw new ServiceError(
      502,
      resendData?.message || 'Failed to send invite email from email provider.'
    );
  }

  return json({
    ok: true,
    sent: true,
    configured: true,
    provider: 'resend',
    to,
    id: resendData?.id || null,
  });
});
