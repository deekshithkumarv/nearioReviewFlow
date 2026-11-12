'use client';

import { useEffect, useRef, useState } from 'react';
import { AlertCircle, ArrowRight, RotateCcw } from 'lucide-react';
import s from './landing.module.css';

const EMAIL_RE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PHONE_RE = /^\d{10}$/;
const RESET_SECONDS = 20;
const FIELD_ORDER = ['who', 'name', 'email', 'phone', 'plan', 'type'];
const FIELD_IDS = { who: 'who', name: 'biz', email: 'eml', phone: 'tel', plan: 'plan', type: 'cat' };
const BUSINESS_TYPES = ['Salon or spa', 'Restaurant or café', 'Clinic', 'Retail', 'Other'];

const NEXT_STEPS = [
  'We check your details and set up your workspace.',
  'You get a sign-in link by email or WhatsApp within one working day.',
  'Print your QR card, put it on the counter, and start reading feedback.',
];

function validate({ who, name, email, phone, plan, type }) {
  const errors = {};
  if (!['owner', 'agency'].includes(who)) {
    errors.who = 'Please select whether you are a business owner or an agency.';
  }
  if (!name) {
    errors.name = who === 'agency' ? 'Enter your agency name.' : 'Enter your business name.';
  } else if (name.length < 2 || !/[a-zA-Z0-9ऀ-ॿಀ-೿]/.test(name)) {
    errors.name =
      who === 'agency'
        ? 'Enter a valid agency name (at least 2 characters).'
        : 'Enter a valid business name (at least 2 characters).';
  }
  if (!email || !EMAIL_RE.test(email)) {
    errors.email = 'Enter a valid email address, like name@business.com.';
  }
  if (!PHONE_RE.test(phone) || /^0{10}$/.test(phone)) {
    errors.phone = 'Enter a valid 10-digit WhatsApp number.';
  }
  if (!['yearly', 'monthly'].includes(plan)) {
    errors.plan = 'Please select a valid plan.';
  }
  if (!type.trim()) {
    errors.type = 'Please select a business type.';
  }
  return errors;
}

function FieldError({ id, message }) {
  if (!message) return null;
  return (
    <p id={id} className="field-error" role="alert">
      <AlertCircle aria-hidden="true" />
      {message}
    </p>
  );
}

export default function SignupForm({ plan, setPlan, who, setWho }) {
  const [biz, setBiz] = useState('');
  const [eml, setEml] = useState('');
  const [tel, setTel] = useState('');
  const [cat, setCat] = useState(BUSINESS_TYPES[0]);
  const [honeypot, setHoneypot] = useState('');
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(RESET_SECONDS);
  const sendingRef = useRef(false);
  const successRef = useRef(null);
  const focusFormRef = useRef(false);

  // Success state returns to the form on its own after 20 seconds, with a visible countdown.
  useEffect(() => {
    if (!success) return undefined;
    setCountdown(RESET_SECONDS);
    successRef.current?.focus();
    const interval = setInterval(() => setCountdown((prev) => (prev > 1 ? prev - 1 : 0)), 1000);
    const timer = setTimeout(() => {
      // Only move focus back to the form if the reader was still in the confirmation.
      focusFormRef.current = Boolean(successRef.current?.parentElement?.contains(document.activeElement));
      setSuccess(false);
    }, RESET_SECONDS * 1000);
    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [success]);

  useEffect(() => {
    if (success || !focusFormRef.current) return;
    focusFormRef.current = false;
    document.getElementById('who')?.focus();
  }, [success]);

  function clearError(key) {
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
    if (serverError) setServerError('');
  }

  async function submit() {
    if (sendingRef.current) return;
    setServerError('');

    const values = { who, name: biz.trim(), email: eml.trim(), phone: tel.trim(), plan, type: cat };
    const found = validate(values);
    setErrors(found);
    const firstBad = FIELD_ORDER.find((k) => found[k]);
    if (firstBad) {
      document.getElementById(FIELD_IDS[firstBad])?.focus();
      return;
    }

    sendingRef.current = true;
    setSubmitting(true);
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: values.who,
          name: values.name,
          email: values.email,
          phone: values.phone,
          plan: values.plan,
          type: values.type,
          company_url: honeypot,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong. Please try again.');
      }
      setBiz('');
      setEml('');
      setTel('');
      setErrors({});
      setSuccess(true);
    } catch (err) {
      const offline = err instanceof TypeError;
      setServerError(
        offline
          ? 'We could not reach our server. Check your connection and try again.'
          : err.message || 'Could not submit your details. Please try again.'
      );
    } finally {
      sendingRef.current = false;
      setSubmitting(false);
    }
  }

  function onSubmit(e) {
    e.preventDefault();
    submit();
  }

  function sendAnother() {
    focusFormRef.current = true;
    setSuccess(false);
  }

  const invalid = (key) => (errors[key] ? 'true' : undefined);
  const describe = (key, hintId) => [hintId, errors[key] ? `${FIELD_IDS[key]}-error` : null].filter(Boolean).join(' ') || undefined;
  const nameLabel = who === 'agency' ? 'Agency name' : 'Business name';

  return (
    <div className={`container ${s.startGrid}`}>
      <div className={s.startCopy}>
        <p className="eyebrow">Get started</p>
        <h2 id="start-title" className={s.h2}>
          Tell us about your business
        </h2>
        <p className={s.lead}>It takes about a minute. No payment is needed to send this form.</p>
        <h3 className={s.includedTitle}>What happens next</h3>
        <ol className={s.nextSteps}>
          {NEXT_STEPS.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </div>

      <div className={s.formCard}>
        {success ? (
          <div className={s.success}>
            <svg className={s.successCheck} viewBox="0 0 52 52" aria-hidden="true" focusable="false">
              <circle className={s.successCircle} cx="26" cy="26" r="24" />
              <path className={s.successTick} d="M15 27l7 7 15-16" />
            </svg>
            <h3 ref={successRef} tabIndex={-1} className={s.successTitle}>
              Thanks, we have your details
            </h3>
            <p className={s.successText}>
              We’ll review it and send your sign-in link by email or WhatsApp within one working day.
            </p>
            <button type="button" className="btn" onClick={sendAnother}>
              <RotateCcw aria-hidden="true" />
              Send another
            </button>
            <p className={s.countdown}>
              Going back to the form in <span className="tabular">{countdown}</span>s
            </p>
          </div>
        ) : (
          <form className={s.form} noValidate onSubmit={onSubmit} aria-labelledby="start-title">
            <div className={s.honeypot} aria-hidden="true">
              <label htmlFor="company_url">Do not fill this in</label>
              <input
                id="company_url"
                name="company_url"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
              />
            </div>

            <div className="field">
              <label className="label" htmlFor="who">
                I am a
              </label>
              <select
                id="who"
                className="select"
                value={who}
                aria-invalid={invalid('who')}
                aria-describedby={describe('who')}
                onChange={(e) => {
                  setWho(e.target.value);
                  clearError('who');
                  if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                }}
              >
                <option value="owner">Business owner</option>
                <option value="agency">Agency managing clients</option>
              </select>
              <FieldError id="who-error" message={errors.who} />
            </div>

            <div className="field">
              <label className="label" htmlFor="biz">
                {nameLabel}
              </label>
              <input
                id="biz"
                name="biz"
                className="input"
                autoComplete="organization"
                maxLength={100}
                placeholder={who === 'agency' ? 'e.g. Pixel & Co Marketing' : 'e.g. The Green House'}
                required
                value={biz}
                aria-invalid={invalid('name')}
                aria-describedby={describe('name')}
                onChange={(e) => {
                  setBiz(e.target.value);
                  clearError('name');
                }}
              />
              <FieldError id="biz-error" message={errors.name} />
            </div>

            <div className={s.formRow}>
              <div className="field">
                <label className="label" htmlFor="eml">
                  Email
                </label>
                <input
                  id="eml"
                  name="eml"
                  type="email"
                  className="input"
                  autoComplete="email"
                  maxLength={254}
                  placeholder="you@business.com"
                  required
                  value={eml}
                  aria-invalid={invalid('email')}
                  aria-describedby={describe('email')}
                  onChange={(e) => {
                    setEml(e.target.value);
                    clearError('email');
                  }}
                />
                <FieldError id="eml-error" message={errors.email} />
              </div>

              <div className="field">
                <label className="label" htmlFor="tel">
                  WhatsApp number
                </label>
                <input
                  id="tel"
                  name="tel"
                  type="tel"
                  className="input"
                  inputMode="numeric"
                  maxLength={10}
                  pattern="\d{10}"
                  autoComplete="tel-national"
                  placeholder="10-digit mobile number"
                  required
                  value={tel}
                  aria-invalid={invalid('phone')}
                  aria-describedby={describe('phone', 'tel-hint')}
                  onChange={(e) => {
                    setTel(e.target.value.replace(/\D/g, '').slice(0, 10));
                    clearError('phone');
                  }}
                />
                <p id="tel-hint" className="hint">
                  10 digits, without +91 or a leading 0.
                </p>
                <FieldError id="tel-error" message={errors.phone} />
              </div>
            </div>

            <div className={s.formRow}>
              <div className="field">
                <label className="label" htmlFor="plan">
                  Plan
                </label>
                <select
                  id="plan"
                  className="select"
                  value={plan}
                  aria-invalid={invalid('plan')}
                  aria-describedby={describe('plan')}
                  onChange={(e) => {
                    setPlan(e.target.value);
                    clearError('plan');
                  }}
                >
                  <option value="yearly">Yearly · 3 months free · ₹5,391</option>
                  <option value="monthly">Monthly · ₹599 a month</option>
                </select>
                <FieldError id="plan-error" message={errors.plan} />
              </div>

              <div className="field">
                <label className="label" htmlFor="cat">
                  Type of business
                </label>
                <select
                  id="cat"
                  className="select"
                  value={cat}
                  aria-invalid={invalid('type')}
                  aria-describedby={describe('type')}
                  onChange={(e) => {
                    setCat(e.target.value);
                    clearError('type');
                  }}
                >
                  {BUSINESS_TYPES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
                <FieldError id="cat-error" message={errors.type} />
              </div>
            </div>

            {serverError && (
              <div className={`alert alert-danger ${s.serverError}`} role="alert">
                <AlertCircle aria-hidden="true" />
                <div>
                  <p>{serverError}</p>
                  <button type="button" className={s.retry} onClick={submit} disabled={submitting}>
                    Try again
                  </button>
                </div>
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={submitting}>
              {submitting ? (
                <>
                  <span className="spinner" aria-hidden="true" />
                  Sending your details
                </>
              ) : (
                <>
                  Send my details
                  <ArrowRight aria-hidden="true" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
