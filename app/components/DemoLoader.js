'use client';

import { useEffect, useState } from 'react';

export default function DemoLoader() {
  const [err, setErr] = useState(false);

  useEffect(() => {
    let active = true;
    if (window.location.pathname === '/demo' || window.location.pathname === '/demo/') {
      window.history.replaceState(null, '', '/demo/overview' + window.location.search);
    }
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
  }, []);

  if (err) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#f7f3ea', fontFamily: 'sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontWeight: 700, color: '#17261d' }}>Could not load Dashboard Demo.</p>
          <a href="/" style={{ color: '#1b4d3e', fontWeight: 600 }}>← Back to Home</a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#f7f3ea', fontFamily: 'sans-serif' }}>
      <div style={{ fontWeight: 600, color: '#65726a', fontSize: 16 }}>Loading Interactive Dashboard Demo…</div>
    </div>
  );
}
