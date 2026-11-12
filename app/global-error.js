'use client';

// Last-resort screen if the root layout itself fails. It must render its own <html> and avoid app CSS.
export default function GlobalError({ reset }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, minHeight: '100vh', display: 'grid', placeItems: 'center', fontFamily: 'system-ui, sans-serif', background: '#f7f3ea', color: '#17261d', padding: 16 }}>
        <main role="alert" style={{ maxWidth: 420, textAlign: 'center' }}>
          <h1 style={{ fontSize: 24, margin: '0 0 8px' }}>Neario is having trouble loading</h1>
          <p style={{ margin: '0 0 20px', color: '#5b6961' }}>Please try again in a moment.</p>
          <button type="button" onClick={() => reset()} style={{ background: '#1f5a36', color: '#fff', border: 0, borderRadius: 12, padding: '12px 20px', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
