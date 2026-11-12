import Link from 'next/link';

// Monogram: a single-stroke "n" with a marigold dot (the star a customer gives).
export function LogoMark({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" focusable="false" style={{ flexShrink: 0 }}>
      <rect width="32" height="32" rx="8" fill="var(--logo-bg, var(--brand))" />
      <path
        d="M10 23V13.4a3.4 3.4 0 0 1 6.8 0V23"
        fill="none"
        stroke="var(--logo-fg, var(--on-brand))"
        strokeWidth="2.8"
        strokeLinecap="round"
      />
      <circle cx="22.5" cy="10" r="2.4" fill="var(--accent)" />
    </svg>
  );
}

// Wordmark link. tone="light" for use on the dark green band / footer.
export default function Logo({ href = '/', tone = 'default', size = 32, className = '', onClick }) {
  const light = tone === 'light';
  return (
    <Link
      href={href}
      onClick={onClick}
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        textDecoration: 'none',
        color: light ? 'var(--band-ink)' : 'var(--ink)',
        ...(light ? { '--logo-bg': 'var(--band-ink)', '--logo-fg': 'var(--band)' } : null),
      }}
    >
      <LogoMark size={size} />
      <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: Math.round(size * 0.62), letterSpacing: '-0.03em' }}>
          neario
        </span>{' '}
        <span style={{ fontSize: Math.max(9, Math.round(size * 0.28)), fontWeight: 600, letterSpacing: '0.18em', opacity: 0.65, marginTop: 3 }}>
          REVIEWFLOW
        </span>
        <span className="visually-hidden"> home</span>
      </span>
    </Link>
  );
}
