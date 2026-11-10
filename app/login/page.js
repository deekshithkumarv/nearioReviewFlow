'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { showToast } from '../components/Toast';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to sign in.');
        setLoading(false);
        return;
      }

      showToast(`Welcome back, ${data.user.name || data.user.email}!`);
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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <header style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, color: 'inherit' }}>
          <div className="mark" aria-hidden="true" style={{ width: 34, height: 34, background: 'var(--primary)', color: '#fff', borderRadius: 8, display: 'grid', placeItems: 'center', fontWeight: 800 }}>N</div>
          <div><b style={{ fontSize: 16 }}>neario</b> <small style={{ color: 'var(--muted)', fontSize: 11, letterSpacing: '.05em' }}>REVIEWFLOW</small></div>
        </Link>
        <Link href="/" className="btn ghost" style={{ textDecoration: 'none', fontSize: 13 }}>← Back to Home</Link>
      </header>

      <main style={{ flex: 1, display: 'grid', placeItems: 'center', padding: '24px 16px' }}>
        <div className="card" style={{ width: '100%', maxWidth: 420, padding: 32, borderRadius: 16, boxShadow: 'var(--shadow)' }}>
          <h1 style={{ fontSize: 24, margin: '0 0 6px' }}>Sign in</h1>
          <p className="sub" style={{ margin: '0 0 24px', color: 'var(--muted)', fontSize: 14 }}>
            Enter your Neario credentials to access your dashboard.
          </p>

          {error && (
            <div style={{ background: 'var(--red-soft)', color: 'var(--red)', padding: '10px 14px', borderRadius: 8, fontSize: 13.5, marginBottom: 16, fontWeight: 500 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <label className="f2">
              <span style={{ fontSize: 13, fontWeight: 600 }}>Email address</span>
              <input
                type="email"
                required
                autoComplete="email"
                placeholder="you@business.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="inp"
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface)' }}
              />
            </label>

            <label className="f2">
              <span style={{ fontSize: 13, fontWeight: 600 }}>Password</span>
              <input
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--line)', fontSize: 12.5, color: 'var(--muted)', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <span>Have an invite link? Open the link from your email or WhatsApp to set up your password.</span>
            <a href="/demo/overview" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>
              Just exploring? Open Interactive Dashboard Demo →
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}

