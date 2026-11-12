'use client';

import { useRef, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check, CircleAlert, CircleCheck } from 'lucide-react';
import { showToast } from '../components/ui/Toast';
import AuthShell from '../components/auth/AuthShell';
import PasswordField from '../components/auth/PasswordField';
import s from '../components/auth/auth.module.css';

const MIN = 10;

function AcceptInviteForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlToken = (searchParams.get('token') || '').trim();
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errs, setErrs] = useState({});
  const codeRef = useRef(null);
  const pwRef = useRef(null);
  const confirmRef = useRef(null);

  const token = urlToken || code.trim();
  const longEnough = password.length >= MIN;
  const matches = confirmPassword.length > 0 && password === confirmPassword;

  async function handleSubmit(e) {
    e.preventDefault();
    if (loading) return;
    setError('');

    const next = {};
    if (!token) next.code = 'Paste the invite code from your message, or open the link you were sent.';
    if (!longEnough) next.pw = `Choose a password of at least ${MIN} characters.`;
    else if (password !== confirmPassword) next.confirm = 'The two passwords don’t match yet.';
    setErrs(next);
    if (next.code) return codeRef.current?.focus();
    if (next.pw) return pwRef.current?.focus();
    if (next.confirm) return confirmRef.current?.focus();

    setLoading(true);
    try {
      const res = await fetch('/api/invites/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.user) {
        setError(
          data.error ||
            (res.status >= 500
              ? 'We could not set your password right now. Please try again in a minute.'
              : 'This invite link did not work. It may have expired or already been used. Ask your Neario contact or agency for a new one.'),
        );
        setLoading(false);
        return;
      }

      showToast(`Your account is ready. Welcome to Neario ReviewFlow${data.user.name ? `, ${data.user.name}` : ''}.`, { tone: 'success' });
      if (data.user.role === 'super_admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch {
      setError('We could not reach Neario. Check your connection and try again.');
      setLoading(false);
    }
  }

  return (
    <>
      <div className={s.head}>
        <p className="eyebrow">Activate your account</p>
        <h1>Set your password</h1>
        <p>You have been invited to Neario ReviewFlow. Choose a password and you’ll go straight to your dashboard.</p>
      </div>

      <form className={s.form} onSubmit={handleSubmit} noValidate>
        {error && (
          <div className="alert alert-danger" role="alert">
            <CircleAlert aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        {urlToken ? (
          <div className={s.detected}>
            <CircleCheck aria-hidden="true" />
            <p>
              <b>Invite link detected</b>
              <span>You only need to choose a password.</span>
            </p>
          </div>
        ) : (
          <div className="field">
            <label className="label" htmlFor="invite-code">Invite code</label>
            <input
              ref={codeRef}
              id="invite-code"
              className="input"
              type="text"
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              aria-invalid={errs.code ? true : undefined}
              aria-describedby={`invite-code-hint${errs.code ? ' invite-code-error' : ''}`}
            />
            <p id="invite-code-hint" className="hint">
              It’s the long code at the end of the invite link in your email or WhatsApp message. Opening the link fills it in for you.
            </p>
            {errs.code && (
              <p id="invite-code-error" className="field-error" role="alert">
                <CircleAlert aria-hidden="true" />
                {errs.code}
              </p>
            )}
          </div>
        )}

        <PasswordField
          ref={pwRef}
          id="new-password"
          name="new-password"
          label="New password"
          required
          minLength={MIN}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          extraDescribedBy="password-rules"
          error={errs.pw}
          errorId="new-password-error"
        />

        <PasswordField
          ref={confirmRef}
          id="confirm-password"
          name="confirm-password"
          label="Confirm password"
          required
          minLength={MIN}
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={errs.confirm}
          errorId="confirm-password-error"
        />

        <ul id="password-rules" className={s.rules} aria-live="polite">
          <li data-ok={longEnough}>
            <span className={s.ruleIcon} aria-hidden="true">{longEnough && <Check strokeWidth={3} />}</span>
            At least {MIN} characters
            <span className="visually-hidden">{longEnough ? '(done)' : '(not yet)'}</span>
          </li>
          <li data-ok={matches}>
            <span className={s.ruleIcon} aria-hidden="true">{matches && <Check strokeWidth={3} />}</span>
            Both passwords match
            <span className="visually-hidden">{matches ? '(done)' : '(not yet)'}</span>
          </li>
        </ul>

        <button type="submit" className={`btn btn-primary btn-lg btn-block ${s.submit}`} disabled={loading} aria-busy={loading}>
          {loading ? (
            <>
              <span className="spinner" aria-hidden="true" />
              Setting your password…
            </>
          ) : (
            'Set password and continue'
          )}
        </button>
      </form>

      <div className={s.after}>
        <p>Link not working? Invite links expire. Ask your Neario contact or agency to send a new one.</p>
      </div>
    </>
  );
}

function FormSkeleton() {
  return (
    <div className={s.skel} aria-busy="true" aria-label="Loading your invite">
      <span className="skeleton" style={{ height: 14, width: '40%' }} />
      <span className="skeleton" style={{ height: 40, width: '75%' }} />
      <span className="skeleton" style={{ height: 18, width: '90%', marginBottom: 16 }} />
      <span className="skeleton" style={{ height: 46 }} />
      <span className="skeleton" style={{ height: 46 }} />
      <span className="skeleton" style={{ height: 52 }} />
    </div>
  );
}

export default function AcceptPage() {
  return (
    <AuthShell
      topAction={
        <Link href="/login" className="btn btn-ghost btn-sm">
          Already set up? Sign in
        </Link>
      }
    >
      <Suspense fallback={<FormSkeleton />}>
        <AcceptInviteForm />
      </Suspense>
    </AuthShell>
  );
}
