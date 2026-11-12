'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

// The demo dashboard is a self-contained static prototype (public/demo-app.html) with sample data.
// It replaces the whole document once loaded, so links into /demo must be full page loads.
export default function DemoLoader() {
  const [err, setErr] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    if (window.location.pathname === '/demo' || window.location.pathname === '/demo/') {
      window.history.replaceState(null, '', '/demo/overview' + window.location.search);
    }
    setErr(false);
    fetch('/demo-app.html')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load demo');
        return res.text();
      })
      .then((html) => {
        if (!active) return;
        document.open();
        document.write(html);
        document.close();
      })
      .catch(() => {
        if (active) setErr(true);
      });
    return () => {
      active = false;
    };
  }, [attempt]);

  return (
    <main id="main" className="state-page" aria-busy={!err}>
      {err ? (
        <>
          <h1>The demo didn’t load</h1>
          <p>Check your connection and try again.</p>
          <div className="state-actions">
            <button type="button" className="btn btn-primary" onClick={() => setAttempt((n) => n + 1)}>Try again</button>
            <Link href="/" className="btn">Back to home</Link>
          </div>
        </>
      ) : (
        <>
          <span className="spinner" aria-hidden="true" style={{ width: 24, height: 24, color: 'var(--brand)' }} />
          <p role="status">Opening the sample dashboard…</p>
        </>
      )}
    </main>
  );
}
