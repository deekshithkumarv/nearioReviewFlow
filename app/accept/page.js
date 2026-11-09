'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { showToast } from '../components/Toast';

function AcceptInviteForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const t = searchParams.get('token');
    if (t) setToken(t);
  }, [searchParams]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (password.length < 10) {
      setError('Choose a password of at least 10 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!token) {
      setError('Missing invite token. Please click the exact link from your email.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/invites/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to accept invite.');
        setLoading(false);
        return;
      }

      showToast(`Account activated! Welcome to Neario ReviewFlow, ${data.user.name || ''}.`);
      if (data.user.role === 'super_admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="card" style={{ width: '100%', maxWidth: 440, padding: 32, borderRadius: 16, boxShadow: 'var(--shadow)' }}>
      <h1 style={{ fontSize: 24, margin: '0 0 6px' }}>Set your password</h1>
      <p className="sub" style={{ margin: '0 0 24px', color: 'var(--muted)', fontSize: 14 }}>
        You have been invited to Neario ReviewFlow. Create your password to activate your account.
      </p>

      {error && (
        <div style={{ background: 'var(--red-soft)', color: 'var(--red)', padding: '10px 14px', borderRadius: 8, fontSize: 13.5, marginBottom: 16, fontWeight: 500 }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <label className="f2">
          <span style={{ fontSize: 13, fontWeight: 600 }}>Invite token</span>
          <input
            type="text"
            required
            placeholder="Invite token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="inp"
            style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface)' }}
          />
        </label>

        <label className="f2">
          <span style={{ fontSize: 13, fontWeight: 600 }}>Choose password (min 10 characters)</span>
          <input
            type="password"
            required
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="inp"
            style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface)' }}
          />
        </label>

        <label className="f2">
          <span style={{ fontSize: 13, fontWeight: 600 }}>Confirm password</span>
          <input
            type="password"
            required
            placeholder="••••••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="inp"
            style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface)' }}
          />
        </label>

        <button
          type="submit"
          className="primary"
          disabled={loading}
          style={{ padding: '12px', borderRadius: 8, fontWeight: 700, marginTop: 8 }}
        >
          {loading ? 'Activating account…' : 'Activate account & sign in'}
        </button>
      </form>
    </div>
  );
}

export default function AcceptPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <header style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, color: 'inherit' }}>
          <div className="mark" aria-hidden="true" style={{ width: 34, height: 34, background: 'var(--primary)', color: '#fff', borderRadius: 8, display: 'grid', placeItems: 'center', fontWeight: 800 }}>N</div>
          <div><b style={{ fontSize: 16 }}>neario</b> <small style={{ color: 'var(--muted)', fontSize: 11, letterSpacing: '.05em' }}>REVIEWFLOW</small></div>
        </Link>
        <Link href="/login" className="btn ghost" style={{ textDecoration: 'none', fontSize: 13 }}>Sign in instead →</Link>
      </header>

      <main style={{ flex: 1, display: 'grid', placeItems: 'center', padding: '24px 16px' }}>
        <Suspense fallback={<div className="card" style={{ padding: 32 }}>Loading invite details…</div>}>
          <AcceptInviteForm />
        </Suspense>
      </main>
    </div>
  );
}
