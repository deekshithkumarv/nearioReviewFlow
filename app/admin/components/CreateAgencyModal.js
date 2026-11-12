'use client';

import { useRef, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import { showToast } from '../../components/ui/Toast';
import InviteShare from './InviteShare';
import { EMAIL_RE, Spinner } from './shared';
import s from '../admin.module.css';

// Mounted only while open, so the fields always start empty.
export default function CreateAgencyModal({ onClose, onCreated }) {
  const [name, setName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [invite, setInvite] = useState(null);
  const nameRef = useRef(null);
  const emailRef = useRef(null);

  function close() {
    if (submitting) return; // keep the dialog until the request finishes, or the invite link would be lost
    onClose();
  }

  function validate() {
    const next = {};
    if (!name.trim()) next.name = 'Enter the agency name.';
    if (!ownerEmail.trim()) next.ownerEmail = 'Enter the email the agency manager will sign in with.';
    else if (!EMAIL_RE.test(ownerEmail.trim())) next.ownerEmail = 'Enter a valid email address, like name@agency.com.';
    return next;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting) return;
    const found = validate();
    setErrors(found);
    if (found.name) return nameRef.current?.focus();
    if (found.ownerEmail) return emailRef.current?.focus();

    setSubmitting(true);
    try {
      const res = await fetch('/api/agencies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, ownerEmail, ownerName }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showToast(data.error || 'The agency could not be created. Check the details and try again.', { tone: 'error' });
        return;
      }
      showToast(`Agency ${name.trim()} created`, { tone: 'success' });
      setInvite({
        link: `${window.location.origin}/accept?token=${data.inviteToken}`,
        email: ownerEmail.trim(),
        name: name.trim(),
      });
      onCreated?.();
    } catch {
      showToast('Network error. The agency was not created.', { tone: 'error' });
    } finally {
      setSubmitting(false);
    }
  }

  const clearError = (key) => errors[key] && setErrors((prev) => ({ ...prev, [key]: undefined }));

  return (
    <Modal
      open
      onClose={close}
      title={invite ? `Invite for ${invite.name}` : 'Add an agency'}
      description={
        invite
          ? 'Agency created. Send this setup link to the agency manager so they can set a password.'
          : 'Agencies manage several client businesses. The manager gets their own login.'
      }
    >
      {invite ? (
        <InviteShare link={invite.link} email={invite.email} businessName={invite.name} onDone={onClose} focusOnMount />
      ) : (
        <form className={s.form} onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label className="label" htmlFor="ag-name">
              Agency name<span className={s.req} aria-hidden="true">*</span>
            </label>
            <input
              ref={nameRef}
              id="ag-name"
              className="input"
              type="text"
              autoComplete="organization"
              placeholder="e.g. Pixel & Co Marketing"
              value={name}
              required
              aria-invalid={errors.name ? 'true' : undefined}
              aria-describedby={errors.name ? 'ag-name-err' : undefined}
              onChange={(e) => {
                setName(e.target.value);
                clearError('name');
              }}
            />
            {errors.name && (
              <p id="ag-name-err" className="field-error" role="alert">
                <AlertCircle aria-hidden="true" />
                {errors.name}
              </p>
            )}
          </div>

          <div className="field">
            <label className="label" htmlFor="ag-owner">
              Manager name <span className="optional">(optional)</span>
            </label>
            <input
              id="ag-owner"
              className="input"
              type="text"
              autoComplete="name"
              placeholder="e.g. Asha Verma"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
            />
          </div>

          <div className="field">
            <label className="label" htmlFor="ag-email">
              Manager email<span className={s.req} aria-hidden="true">*</span>
            </label>
            <input
              ref={emailRef}
              id="ag-email"
              className="input"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="asha@pixelco.in"
              value={ownerEmail}
              required
              aria-invalid={errors.ownerEmail ? 'true' : undefined}
              aria-describedby={errors.ownerEmail ? 'ag-email-hint ag-email-err' : 'ag-email-hint'}
              onChange={(e) => {
                setOwnerEmail(e.target.value);
                clearError('ownerEmail');
              }}
            />
            <p id="ag-email-hint" className="hint">
              They sign in with this email. It must not already have a Neario login.
            </p>
            {errors.ownerEmail && (
              <p id="ag-email-err" className="field-error" role="alert">
                <AlertCircle aria-hidden="true" />
                {errors.ownerEmail}
              </p>
            )}
          </div>

          <div className={s.formActions}>
            <button type="button" className="btn" onClick={close} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting} aria-busy={submitting || undefined}>
              {submitting && <Spinner />}
              <span>{submitting ? 'Creating agency…' : 'Create agency and invite link'}</span>
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
