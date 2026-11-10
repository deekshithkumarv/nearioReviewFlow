'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function DemoCatchAllPage() {
  const params = useParams();

  useEffect(() => {
    const slug = params?.slug
      ? Array.isArray(params.slug)
        ? params.slug.join('/')
        : params.slug
      : 'overview';
    window.location.replace('/demo/' + slug + window.location.search);
  }, [params]);

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#f7f3ea', fontFamily: 'sans-serif' }}>
      <div style={{ fontWeight: 600, color: '#65726a', fontSize: 16 }}>Loading Dashboard Demo…</div>
    </div>
  );
}

