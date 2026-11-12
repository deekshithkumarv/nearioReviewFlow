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

export const POST = handle(async ({ actor, body, req }) => {
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
  // Only links to this site's own invite page may be emailed, so this endpoint can't be used to send
  // Neario-branded mail pointing somewhere else.
  const ownHost = req.headers.get('x-forwarded-host') || req.headers.get('host') || new URL(req.url).host;
  if (
    !['http:', 'https:'].includes(linkUrl.protocol) ||
    linkUrl.host !== ownHost ||
    linkUrl.pathname !== '/accept' ||
    !/^[A-Za-z0-9_-]{20,}$/.test(linkUrl.searchParams.get('token') || '')
  ) {
    throw new ServiceError(400, 'Invalid invite link.');
  }

  const businessName =
    typeof body?.businessName === 'string' && body.businessName.trim()
      ? body.businessName.trim().slice(0, 120)
      : 'your workspace';

  const subject = `Welcome to Neario ReviewFlow — Activate ${businessName}`;
  const safeName = escapeHtml(businessName);
  const safeLink = escapeHtml(linkUrl.toString());

  const text = [
    `Welcome to Neario ReviewFlow!`,
    ``,
    `Your workspace for ${businessName} has been approved and is ready to activate.`,
    ``,
    `Quick setup (takes ~2 minutes):`,
    `1. Create your password using the invite link below (valid for 7 days)`,
    `2. Add your Google Review link and services`,
    `3. Download & print your QR counter stand to start collecting customer feedback`,
    ``,
    `Activate your workspace:`,
    linkUrl.toString(),
    ``,
    `Need help? Simply reply to this email.`,
    `— Neario ReviewFlow`,
  ].join('\n');

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Activate your Neario ReviewFlow account</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f6f4ef; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1a241e; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f6f4ef; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 560px; background-color: #ffffff; border: 1px solid #e6e2d8; border-radius: 18px; overflow: hidden; box-shadow: 0 8px 28px rgba(22, 78, 54, 0.06);">
          <!-- Header -->
          <tr>
            <td style="padding: 24px 28px; background-color: #164e36; color: #ffffff;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td valign="middle">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="width: 34px; height: 34px; background-color: #ffffff; color: #164e36; font-weight: 800; font-size: 18px; text-align: center; line-height: 34px; border-radius: 9px;">N</td>
                        <td style="padding-left: 10px;">
                          <div style="font-size: 18px; font-weight: 800; letter-spacing: -0.03em; line-height: 1.1; color: #ffffff;">neario</div>
                          <div style="font-size: 9px; font-weight: 700; letter-spacing: 0.24em; color: #b7d7c5; text-transform: uppercase;">REVIEWFLOW</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td align="right" valign="middle">
                    <span style="display: inline-block; background-color: rgba(255,255,255,0.16); color: #ffffff; font-size: 11px; font-weight: 700; padding: 5px 11px; border-radius: 99px; letter-spacing: 0.02em;">
                      Workspace Ready
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Body -->
          <tr>
            <td style="padding: 30px 28px 24px;">
              <h1 style="margin: 0 0 10px; font-size: 22px; line-height: 1.3; font-weight: 800; letter-spacing: -0.02em; color: #164e36;">
                Activate your workspace for ${safeName}
              </h1>
              <p style="margin: 0 0 20px; font-size: 15px; line-height: 1.6; color: #3f4b44;">
                Your Neario ReviewFlow account has been created. Set your password below to unlock your feedback dashboard and QR counter stand kit.
              </p>

              <!-- 3-Step Quick Overview -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f8f7f3; border: 1px solid #ebe7de; border-radius: 12px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 16px 18px;">
                    <div style="font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em; color: #5b6961; margin-bottom: 10px;">
                      What happens next
                    </div>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="font-size: 13.5px; line-height: 1.5; color: #2b3730;">
                      <tr>
                        <td style="padding: 4px 0;">
                          <strong style="color: #164e36;">1. Set your password</strong> &mdash; takes 10 seconds via your private link
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0;">
                          <strong style="color: #164e36;">2. Connect Google Reviews</strong> &mdash; paste your Google review link &amp; services
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0;">
                          <strong style="color: #164e36;">3. Share your QR stand</strong> &mdash; capture honest feedback &amp; grow 5-star reviews
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 0 20px;">
                <tr>
                  <td align="center" bgcolor="#164e36" style="border-radius: 11px;">
                    <a href="${safeLink}" target="_blank" style="display: inline-block; padding: 13px 24px; font-size: 14.5px; font-weight: 700; color: #ffffff; text-decoration: none; border-radius: 11px;">
                      Accept Invite &amp; Set Password &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 18px; font-size: 12.5px; color: #647068;">
                This private invite link is single-use and expires in <strong>7 days</strong>.
              </p>

              <!-- Fallback URL -->
              <div style="border-top: 1px solid #ece8df; padding-top: 16px;">
                <p style="margin: 0 0 6px; font-size: 12px; color: #647068;">
                  Button not working? Copy and paste this link into your browser:
                </p>
                <p style="margin: 0; font-size: 11.5px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; word-break: break-all; background-color: #f4f3ef; padding: 10px 12px; border-radius: 8px; border: 1px solid #e6e2d8; color: #1a241e;">
                  ${safeLink}
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 16px 28px; background-color: #faf9f5; border-top: 1px solid #ece8df; font-size: 12px; color: #6d7871; line-height: 1.5;">
              Sent by <strong style="color: #1a241e;">Neario ReviewFlow</strong>. Have a question or need help getting set up? Simply reply to this email.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
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
