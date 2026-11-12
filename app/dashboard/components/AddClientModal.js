'use client';

import { useId, useState } from 'react';
import { AlertCircle, CheckCircle2, Copy } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import { showToast } from '../../components/ui/Toast';
import s from '../dashboard.module.css';
import { copyText } from './format';

const EMAIL_RE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const TYPES = ['Salon or spa', 'Restaurant or café', 'Clinic', 'Retail', 'Other'];
const EMPTY = { name: '', type: 'Salon or spa', city: '', owner: '', email: '', plan: 'yearly', consent: false };

function FieldError({ id, children }) {
  if (!children) return null;
  return (
    <span id={id} className="field-error" role="alert">
      <AlertCircle aria-hidden="true" />
      {children}
    </span>
  );
}

// Agency (or Neario) adds a client business. On success the owner's one-time invite link is shown to copy.
export default function AddClientModal({ open, onClose, orgName, origin, onCreated }) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [adding, setAdding] = useState(false);
  const [invite, setInvite] = useState(null);
  const uid = useId();
  const id = (k) => `${uid}-${k}`;

  const set = (k) => (e) => {
    const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((er) => ({ ...er, [k]: undefined }));
  };

  function close() {
    setForm(EMPTY);
    setErrors({});
    setServerError('');
    setInvite(null);
    onClose();
  }

  async function submit(e) {
    e.preventDefault();
    if (adding) return;
    const next = {};
    if (!form.name.trim()) next.name = 'Enter the business name.';
    if (!EMAIL_RE.test(form.email.trim())) next.email = 'Enter a valid email address for the owner.';
    if (!form.consent) next.consent = 'Confirm that the owner has agreed before adding them.';
    setErrors(next);
    setServerError('');
    if (Object.keys(next).length) {
      document.getElementById(id(Object.keys(next)[0]))?.focus();
      return;
    }

    setAdding(true);
    try {
      const res = await fetch('/api/businesses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          type: form.type,
          city: form.city.trim(),
          ownerName: form.owner.trim(),
          ownerEmail: form.email.trim(),
          plan: form.plan,
          ownerPermission: true,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setServerError(data.error || 'We could not add this client. Please try again.');
        return;
      }
      showToast(`${form.name.trim()} added.`, { tone: 'success' });
      setInvite(`${origin}/accept?token=${data.inviteToken}`);
      onCreated?.();
    } catch {
      setServerError('Network error. The client was not added. Check your connection and try again.');
    } finally {
      setAdding(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={adding ? () => {} : close}
      title={invite ? 'Client added' : 'Add a client'}
      description={invite ? undefined : 'The owner gets their own login and pays Neario directly.'}
      maxWidth={540}
    >
      {invite ? (
        <div className={s.form}>
          <div className="alert alert-success">
            <CheckCircle2 aria-hidden="true" />
            <span>
              Send this link to {form.owner.trim() || form.email.trim()} so they can set a password. It works once and expires in 7 days.
            </span>
          </div>
          <div className="field">
            <label className="label" htmlFor={id('invite')}>
              Invite link
            </label>
            <div className={s.inviteRow}>
              <input id={id('invite')} autoFocus className="input" readOnly value={invite} onFocus={(e) => e.target.select()} />
              <button type="button" className="btn" onClick={() => copyText(invite, 'Invite link copied.', showToast)}>
                <Copy aria-hidden="true" />
                Copy
              </button>
            </div>
          </div>
          <div className={s.formActions}>
            <button type="button" className="btn btn-primary" onClick={close}>
              Done
            </button>
          </div>
        </div>
      ) : (
        <form className={s.form} onSubmit={submit} noValidate>
          <div className="field">
            <label className="label" htmlFor={id('name')}>
              Business name
            </label>
            <input
              id={id('name')}
              className="input"
              value={form.name}
              onChange={set('name')}
              placeholder="e.g. Copper Chimney"
              autoComplete="organization"
              aria-invalid={errors.name ? 'true' : undefined}
              aria-describedby={errors.name ? id('name-err') : undefined}
            />
            <FieldError id={id('name-err')}>{errors.name}</FieldError>
          </div>

          <div className={s.formRow}>
            <div className="field">
              <label className="label" htmlFor={id('type')}>
                Type
              </label>
              <select id={id('type')} className="select" value={form.type} onChange={set('type')}>
                {TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label className="label" htmlFor={id('city')}>
                Area or city <span className="optional">(optional)</span>
              </label>
              <input id={id('city')} className="input" value={form.city} onChange={set('city')} placeholder="e.g. Indiranagar" />
            </div>
          </div>

          <div className={s.formRow}>
            <div className="field">
              <label className="label" htmlFor={id('owner')}>
                Owner name <span className="optional">(optional)</span>
              </label>
              <input id={id('owner')} className="input" value={form.owner} onChange={set('owner')} autoComplete="off" />
            </div>
            <div className="field">
              <label className="label" htmlFor={id('email')}>
                Owner email
              </label>
              <input
                id={id('email')}
                type="email"
                inputMode="email"
                className="input"
                value={form.email}
                onChange={set('email')}
                autoComplete="off"
                aria-invalid={errors.email ? 'true' : undefined}
                aria-describedby={errors.email ? id('email-err') : id('email-hint')}
              />
              {errors.email ? (
                <FieldError id={id('email-err')}>{errors.email}</FieldError>
              ) : (
                <span id={id('email-hint')} className="hint">
                  Used for their login. They can&rsquo;t already have a Neario account.
                </span>
              )}
            </div>
          </div>

          <div className="field">
            <label className="label" htmlFor={id('plan')}>
              Billing plan
            </label>
            <select id={id('plan')} className="select" value={form.plan} onChange={set('plan')}>
              <option value="yearly">Yearly · ₹5,391 (first 3 months free)</option>
              <option value="monthly">Monthly · ₹599 a month</option>
            </select>
          </div>

          <div className="field">
            <label className="check" htmlFor={id('consent')}>
              <input
                id={id('consent')}
                type="checkbox"
                checked={form.consent}
                onChange={set('consent')}
                aria-invalid={errors.consent ? 'true' : undefined}
                aria-describedby={errors.consent ? id('consent-err') : undefined}
              />
              <span>The business owner has agreed that {orgName || 'we'} can manage their feedback on Neario.</span>
            </label>
            <FieldError id={id('consent-err')}>{errors.consent}</FieldError>
          </div>

          {serverError && (
            <div className="alert alert-danger" role="alert">
              <AlertCircle aria-hidden="true" />
              <span>{serverError}</span>
            </div>
          )}

          <div className={s.formActions}>
            <button type="button" className="btn btn-ghost" onClick={close}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={adding} aria-busy={adding || undefined}>
              {adding ? (
                <>
                  <span className="spinner" aria-hidden="true" />
                  Adding…
                </>
              ) : (
                'Add client and create invite'
              )}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
