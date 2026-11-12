'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { Check, Copy, Info, Mail, MessageCircle } from 'lucide-react';
import { showToast } from '../../components/ui/Toast';
import { Spinner } from './shared';
import s from '../admin.module.css';

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Older browsers / non-secure contexts: fall back to a hidden textarea.
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try {
      ok = document.execCommand('copy');
    } catch {
      ok = false;
    }
    document.body.removeChild(ta);
    return ok;
  }
}

// Shows a fresh invite link with copy / email / WhatsApp options.
export default function InviteShare({ link, email, phone, businessName, onDone, focusOnMount = false }) {
  const inputId = useId();
  const noteId = useId();
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);
  const [emailState, setEmailState] = useState(null); // 'sent' | 'draft' | null
  const copyTimer = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    // When the share step replaces a form inside the same dialog, move focus to the link.
    // (Not when the dialog itself is opening: the dialog records the opener first and focuses the link.)
    if (focusOnMount) inputRef.current?.focus();
    return () => clearTimeout(copyTimer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const waUrl = phone
    ? `https://wa.me/${phone}?text=${encodeURIComponent(`Hi! Here is your Neario ReviewFlow sign-in link: ${link}`)}`
    : '';

  async function handleCopy() {
    const ok = await copyText(link);
    if (!ok) {
      showToast('Could not copy automatically. Select the link and copy it.', { tone: 'error' });
      return;
    }
    setCopied(true);
    showToast('Invite link copied', { tone: 'success' });
    clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopied(false), 2500);
  }

  async function handleEmail() {
    if (!email) {
      showToast('No email address is saved for this account.', { tone: 'error' });
      return;
    }
    if (sending) return;
    setSending(true);
    try {
      const res = await fetch('/api/invites/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: email, businessName, inviteLink: link }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showToast(data.error || 'The invite email could not be sent. Copy the link and send it yourself.', { tone: 'error' });
        return;
      }
      if (data.sent) {
        setEmailState('sent');
        showToast(`Invite email sent to ${email}`, { tone: 'success' });
        return;
      }
      // No email provider configured on the server: open a pre-addressed draft in the mail app instead.
      const name = businessName || 'your workspace';
      const subject = encodeURIComponent(`Your Neario ReviewFlow invite for ${name}`);
      const body = encodeURIComponent(
        `Hi,\n\nYour Neario ReviewFlow account for ${name} is ready.\nOpen this link to set your password and complete setup (valid for 7 days):\n\n${link}\n\n— Neario ReviewFlow`
      );
      const a = document.createElement('a');
      a.href = `mailto:${encodeURIComponent(email)}?subject=${subject}&body=${body}`;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setEmailState('draft');
      showToast(`Opened an email draft to ${email}`, { tone: 'info' });
    } catch {
      showToast('Network error. The invite email was not sent.', { tone: 'error' });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className={s.share}>
      {email && (
        <p className={s.recipient}>
          <Mail aria-hidden="true" width={16} height={16} />
          <span>Owner email</span>
          <b>{email}</b>
        </p>
      )}

      <div className="field">
        <label className="label" htmlFor={inputId}>
          Invite link
        </label>
        <div className={s.copyRow}>
          <input
            ref={inputRef}
            id={inputId}
            className="input"
            type="text"
            readOnly
            value={link}
            aria-describedby={noteId}
            onFocus={(e) => e.target.select()}
            data-autofocus=""
          />
          <button type="button" className="btn btn-primary" onClick={handleCopy}>
            {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
            <span aria-live="polite">{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      <div className={s.shareActions}>
        {email && (
          <button type="button" className="btn" disabled={sending} aria-busy={sending || undefined} onClick={handleEmail}>
            {sending ? <Spinner /> : emailState ? <Check aria-hidden="true" /> : <Mail aria-hidden="true" />}
            <span>{sending ? 'Sending…' : emailState === 'sent' ? 'Email sent' : emailState === 'draft' ? 'Draft opened' : 'Send by email'}</span>
          </button>
        )}
        {waUrl && (
          <a className="btn" href={waUrl} target="_blank" rel="noopener noreferrer">
            <MessageCircle aria-hidden="true" />
            <span>Send on WhatsApp</span>
            <span className="visually-hidden">(opens in a new tab)</span>
          </a>
        )}
      </div>

      <p id={noteId} className="alert alert-info">
        <Info aria-hidden="true" />
        <span>This link works once and expires in 7 days. Anyone who has it can set the password, so send it only to the owner.</span>
      </p>

      <div className={s.shareDone}>
        <button type="button" className="btn" onClick={onDone}>
          Done
        </button>
      </div>
    </div>
  );
}
