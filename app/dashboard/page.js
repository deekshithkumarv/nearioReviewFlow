'use client';

import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const [iframeSrc, setIframeSrc] = useState('/dashboard.html');

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search) {
      setIframeSrc(`/dashboard.html${window.location.search}`);
    }
  }, []);

  return (
    <div style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', margin: 0, padding: 0, overflow: 'hidden', background: '#f7f3ea' }}>
      <iframe
        src={iframeSrc}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          display: 'block',
        }}
        title="Neario ReviewFlow Dashboard"
      />
    </div>
  );
}
