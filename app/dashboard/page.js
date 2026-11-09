'use client';

import { useEffect } from 'react';

export default function DashboardPage() {
  useEffect(() => {
    window.location.replace('/dashboard/overview' + window.location.search);
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#f7f3ea', fontFamily: 'sans-serif' }}>
      <div style={{ fontWeight: 600, color: '#65726a', fontSize: 16 }}>Loading Dashboard Demo…</div>
    </div>
  );
}
