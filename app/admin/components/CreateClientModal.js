'use client';

import { useRef, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import { showToast } from '../../components/ui/Toast';
import InviteShare from './InviteShare';
import { EMAIL_RE, Spinner } from './shared';
import s from '../admin.module.css';

export const BUSINESS_TYPES = ['Salon or spa', 'Restaurant or café', 'Clinic', 'Retail', 'Other'];

// Mounted only while open, so the fields always start empty.
export default function CreateClientModal({ agencies, onClose, onCreated }) {
  const [form, setForm] = useState({
    name: '',
    type: BUSINESS_TYPES[0],
    city: '',
    ownerName: '',
    ownerEmail: '',
    agencyId: '',
    plan: 'yearly',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [invite, setInvite] = useState(null);
  const nameRef = useRef(null);
  const emailRef = useRef(null);

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function close() {
    if (submitting) return;
    onClose();
  }

  function validate() {
    const next = {};
    if (!form.name.trim()) next.name = 'Enter the business name.';
    if (!form.ownerEmail.trim()) next.ownerEmail = 'Enter the email the owner will sign in with.';
    else if (!EMAIL_RE.test(form.ownerEmail.trim())) next.ownerEmail = 'Enter a valid email address, like name@business.com.';
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
      const res = await fetch('/api/businesses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          type: form.type,
          city: form.city,
          ownerEmail: form.ownerEmail,
          ownerName: form.ownerName,
          plan: form.plan,
          agencyId: form.agencyId ? Number(form.agencyId) : null,
          ownerPermission: true,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showToast(data.error || 'The business could not be created. Check the details and try again.', { tone: 'error' });
        return;
      }
      showToast(`${form.name.trim()} added`, { tone: 'success' });
      setInvite({
        link: `${window.location.origin}/accept?token=${data.inviteToken}`,
        email: form.ownerEmail.trim(),
        name: form.name.trim(),
      });
      onCreated?.();
    } catch {
      showToast('Network error. The business was not created.', { tone: 'error' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open
      onClose={close}
      title={invite ? `Invite for ${invite.name}` : 'Add a client business'}
      description={
        invite
          ? 'Business created. Send this setup link to the owner so they can set a password.'
          : 'The owner gets their own login. Assign an agency if one manages this business.'
      }
    >
      {invite ? (
        <InviteShare link={invite.link} email={invite.email} businessName={invite.name} onDone={onClose} focusOnMount />
      ) : (
        <form className={s.form} onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label className="label" htmlFor="cl-name">
              Business name<span className={s.req} aria-hidden="true">*</span>
            </label>
            <input
              ref={nameRef}
              id="cl-name"
              className="input"
              type="text"
              autoComplete="organization"
              placeholder="e.g. Copper Chimney"
              value={form.name}
              required
              aria-invalid={errors.name ? 'true' : undefined}
              aria-describedby={errors.name ? 'cl-name-err' : undefined}
              onChange={(e) => set('name', e.target.value)}
            />
            {errors.name && (
              <p id="cl-name-err" className="field-error" role="alert">
                <AlertCircle aria-hidden="true" />
                {errors.name}
              </p>
            )}
          </div>

          <div className={s.formRow}>
            <div className="field">
              <label className="label" htmlFor="cl-type">
                Type
              </label>
              <select id="cl-type" className="select" value={form.type} onChange={(e) => set('type', e.target.value)}>
                {BUSINESS_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label className="label" htmlFor="cl-city">
                City <span className="optional">(optional)</span>
              </label>
              <input
                id="cl-city"
                className="input"
                type="text"
                autoComplete="address-level2"
                placeholder="Bengaluru"
                value={form.city}
                onChange={(e) => set('city', e.target.value)}
              />
            </div>
          </div>

          <div className="field">
            <label className="label" htmlFor="cl-owner">
              Owner name <span className="optional">(optional)</span>
            </label>
            <input
              id="cl-owner"
              className="input"
              type="text"
              autoComplete="name"
              placeholder="Priya Sharma"
              value={form.ownerName}
              onChange={(e) => set('ownerName', e.target.value)}
            />
          </div>

          <div className="field">
            <label className="label" htmlFor="cl-email">
              Owner email<span className={s.req} aria-hidden="true">*</span>
            </label>
            <input
              ref={emailRef}
              id="cl-email"
              className="input"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="priya@example.com"
              value={form.ownerEmail}
              required
              aria-invalid={errors.ownerEmail ? 'true' : undefined}
              aria-describedby={errors.ownerEmail ? 'cl-email-hint cl-email-err' : 'cl-email-hint'}
              onChange={(e) => set('ownerEmail', e.target.value)}
            />
            <p id="cl-email-hint" className="hint">
              The owner signs in with this email. It must not already have a Neario login.
            </p>
            {errors.ownerEmail && (
              <p id="cl-email-err" className="field-error" role="alert">
                <AlertCircle aria-hidden="true" />
                {errors.ownerEmail}
              </p>
            )}
          </div>

          <div className={s.formRow}>
            <div className="field">
              <label className="label" htmlFor="cl-agency">
                Agency
              </label>
              <select id="cl-agency" className="select" value={form.agencyId} onChange={(e) => set('agencyId', e.target.value)}>
                <option value="">Direct client (no agency)</option>
                {agencies.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label className="label" htmlFor="cl-plan">
                Plan
              </label>
              <select id="cl-plan" className="select" value={form.plan} onChange={(e) => set('plan', e.target.value)}>
                <option value="yearly">Yearly (₹5,391)</option>
                <option value="monthly">Monthly (₹599)</option>
              </select>
            </div>
          </div>

          <div className={s.formActions}>
            <button type="button" className="btn" onClick={close} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting} aria-busy={submitting || undefined}>
              {submitting && <Spinner />}
              <span>{submitting ? 'Creating business…' : 'Create business and invite link'}</span>
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
