import Link from 'next/link';

export const metadata = { title: 'Page not found', robots: { index: false } };

export default function NotFound() {
  return (
    <main id="main" className="state-page">
      <p className="state-code">404</p>
      <h1>We couldn’t find that page</h1>
      <p>The link may be old or mistyped. If you scanned a QR code at a business, please let the staff know.</p>
      <div className="state-actions">
        <Link href="/" className="btn btn-primary">Go to the home page</Link>
        <Link href="/login" className="btn">Sign in</Link>
      </div>
    </main>
  );
}
