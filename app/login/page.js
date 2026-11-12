'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, CircleAlert } from 'lucide-react';
import { showToast } from '../components/ui/Toast';
import AuthShell from '../components/auth/AuthShell';
import PasswordField from '../components/auth/PasswordField';
import s from '../components/auth/auth.module.css';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const emailRef = useRef(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (loading) return;
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      // A proxy or crashed worker can answer with HTML, so never assume JSON.
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.user) {
        setError(
          data.error ||
            (res.status >= 500
              ? 'Sign-in is not working right now. Please try again in a minute.'
              : 'We could not sign you in. Check your email and password and try again.'),
        );
        setLoading(false);
        emailRef.current?.focus();
        return;
      }

      showToast(`Welcome back, ${data.user.name || data.user.email}.`, { tone: 'success' });
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
    <AuthShell>
      <div className={s.head}>
        <p className="eyebrow">For business owners and agencies</p>
        <h1>Sign in</h1>
        <p>Read your customers’ feedback and see what to fix next.</p>
      </div>

      <form className={s.form} onSubmit={handleSubmit}>
        {error && (
          <div id="login-error" className="alert alert-danger" role="alert">
            <CircleAlert aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        <div className="field">
          <label className="label" htmlFor="login-email">Email address</label>
          <input
            ref={emailRef}
            id="login-email"
            className="input"
            type="email"
            name="email"
            required
            autoComplete="email"
            inputMode="email"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="you@business.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? 'login-error' : undefined}
          />
        </div>

        <PasswordField
          id="login-password"
          name="password"
          label="Password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          hint="Forgot your password? Ask your Neario contact or agency for a new invite link."
          hintId="login-password-hint"
          extraDescribedBy={error ? 'login-error' : undefined}
          aria-invalid={error ? true : undefined}
        />

        <button type="submit" className={`btn btn-primary btn-lg btn-block ${s.submit}`} disabled={loading} aria-busy={loading}>
          {loading ? (
            <>
              <span className="spinner" aria-hidden="true" />
              Signing in…
            </>
          ) : (
            'Sign in'
          )}
        </button>
      </form>

      <div className={s.after}>
        <p>Have an invite link? Open it from your email or WhatsApp to set your password.</p>
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- the demo replaces the whole document, so it needs a full page load */}
        <a href="/demo/overview" className={s.demoLink}>
          Just looking? Open the sample dashboard
          <ArrowRight aria-hidden="true" />
        </a>
      </div>
    </AuthShell>
  );
}
