import Link from 'next/link';

export const metadata = {
  title: 'Privacy | Neario ReviewFlow',
  description: 'How Neario ReviewFlow handles feedback and personal data.',
};

export default function PrivacyPage() {
  return (
    <div style={{ padding: '24px 16px 56px', minHeight: '100vh', background: 'var(--bg)' }}>
      <main style={{ maxWidth: 720, margin: '0 auto' }}>
        <div className="top" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
          <Link href="/" className="brand" style={{ display: 'flex', gap: 10, alignItems: 'center', textDecoration: 'none', color: 'var(--fg)', fontWeight: 800, fontSize: 20 }}>
            <span className="mark" style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--primary)', color: '#fff', display: 'grid', placeItems: 'center' }}>N</span>
            neario
          </Link>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center', fontSize: 14.5, fontWeight: 600 }}>
            <Link href="/" style={{ color: 'var(--accent-text)' }}>Home</Link>
            <Link href="/dashboard" style={{ color: 'var(--accent-text)' }}>Dashboard</Link>
            <Link href="/terms" style={{ color: 'var(--accent-text)' }}>Terms</Link>
          </div>
        </div>

        <h1 style={{ fontSize: 'clamp(30px,5vw,42px)', letterSpacing: '-.04em', lineHeight: 1.1, margin: '0 0 8px' }}>Privacy</h1>
        <p className="upd" style={{ color: 'var(--muted)', fontSize: 14, margin: '0 0 24px' }}>Last updated: 5 November 2026</p>
        <p>Neario ReviewFlow helps local businesses collect feedback from their customers. This page explains what we collect, why, and how you can have it removed.</p>

        <h2 style={{ fontSize: 20, letterSpacing: '-.02em', margin: '32px 0 8px' }}>Two kinds of people</h2>
        <p><b>Customers</b> leave feedback for a business. <b>Business owners</b> use Neario to read that feedback. This page covers both.</p>

        <h2 style={{ fontSize: 20, letterSpacing: '-.02em', margin: '32px 0 8px' }}>What a customer shares</h2>
        <ul>
          <li>A star rating, the service they picked, and any comment they type.</li>
          <li>Which location they visited, and whether they scanned a QR code or tapped a device.</li>
          <li>A phone number, only if they type one in and tick the box that lets the business contact them.</li>
        </ul>
        <p>We do not ask customers to create an account.</p>

        <h2 style={{ fontSize: 20, letterSpacing: '-.02em', margin: '32px 0 8px' }}>Why we use it</h2>
        <ul>
          <li>To show the feedback to the business that was reviewed, so it can improve.</li>
          <li>To create the business&apos;s charts, trends and suggestions.</li>
          <li>To contact the customer about their feedback, only if they gave a number and agreed.</li>
        </ul>
        <p>We do not sell customer feedback or phone numbers.</p>

        <h2 style={{ fontSize: 20, letterSpacing: '-.02em', margin: '32px 0 8px' }}>Google reviews are separate</h2>
        <p>Feedback sent through Neario is private feedback. It is not a Google review. After sending feedback, every customer sees the same option to write a Google review, whatever their rating. Customers write and post Google reviews themselves, on Google.</p>

        <h2 style={{ fontSize: 20, letterSpacing: '-.02em', margin: '32px 0 8px' }}>What a business owner shares</h2>
        <p>Name, email, business details, services, locations, and a Google Business Profile connection if the owner chooses to connect one. Billing details are handled by our payment provider.</p>

        <h2 style={{ fontSize: 20, letterSpacing: '-.02em', margin: '32px 0 8px' }}>Who can see it</h2>
        <ul>
          <li>The business that received the feedback, and its team members.</li>
          <li>The agency that manages that business on Neario, if there is one.</li>
          <li>The small set of service providers that run Neario for us, such as hosting and payments.</li>
          <li>Anyone the law requires us to share it with.</li>
        </ul>

        <h2 style={{ fontSize: 20, letterSpacing: '-.02em', margin: '32px 0 8px' }}>Agencies</h2>
        <p>Some businesses are looked after by a marketing agency that uses Neario. When that happens, the agency can see that business’s dashboard and the feedback it receives, including any name or phone number a customer chose to share. Each business still has its own login, and the agency’s name appears on reports and QR cards. Agencies can only see the businesses they manage, never another agency’s. An agency must have the business owner’s permission before it is added.</p>

        <h2 style={{ fontSize: 20, letterSpacing: '-.02em', margin: '32px 0 8px' }}>Security</h2>
        <p>We use encrypted connections and limit who on our team can open client data. No online service can promise perfect security.</p>

        <hr style={{ border: 0, borderTop: '1px solid var(--line)', margin: '36px 0 20px' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, fontSize: 14, color: 'var(--muted)' }}>
          <span>Neario ReviewFlow</span>
          <div style={{ display: 'flex', gap: 14 }}>
            <Link href="/">Home</Link>
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/terms">Terms of Service</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
