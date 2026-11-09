import Link from 'next/link';

export const metadata = {
  title: 'Terms | Neario ReviewFlow',
  description: 'Terms of use for Neario ReviewFlow.',
};

export default function TermsPage() {
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
            <Link href="/privacy" style={{ color: 'var(--accent-text)' }}>Privacy</Link>
          </div>
        </div>

        <h1 style={{ fontSize: 'clamp(30px,5vw,42px)', letterSpacing: '-.04em', lineHeight: 1.1, margin: '0 0 8px' }}>Terms</h1>
        <p className="upd" style={{ color: 'var(--muted)', fontSize: 14, margin: '0 0 24px' }}>Last updated: 5 November 2026</p>
        <p>These terms apply when a business signs up for Neario ReviewFlow. By using it you agree to them.</p>

        <h2 style={{ fontSize: 20, letterSpacing: '-.02em', margin: '32px 0 8px' }}>What Neario does</h2>
        <p>Neario gives a business a feedback page, a dashboard of the feedback it receives, insights based on that feedback, and help drafting replies to Google reviews.</p>

        <h2 style={{ fontSize: 20, letterSpacing: '-.02em', margin: '32px 0 8px' }}>Plans and prices</h2>
        <ul>
          <li><b>Monthly:</b> ₹599 a month, billed every month.</li>
          <li><b>Yearly:</b> ₹5,391 in one bill for 12 months of use. This is 9 months paid, with the first 3 months free.</li>
        </ul>
        <p>Prices are final. No GST is added at this time. If that changes, we will tell you before it applies to your next payment.</p>

        <h2 style={{ fontSize: 20, letterSpacing: '-.02em', margin: '32px 0 8px' }}>Refunds</h2>
        <p>On the yearly plan, ask within 7 days of paying and we refund the full ₹5,391. After 7 days the yearly payment is not refundable.</p>

        <h2 style={{ fontSize: 20, letterSpacing: '-.02em', margin: '32px 0 8px' }}>Google review rules you agree to follow</h2>
        <p>Google&apos;s policies protect honest reviews, and you agree to follow them. When you use Neario you will:</p>
        <ul>
          <li>Give every customer the same chance to leave a Google review, whatever their rating.</li>
          <li>Not offer money, discounts or free items in exchange for a review, or for changing or removing one.</li>
          <li>Not ask staff to collect a set number of reviews, or reviews that say something specific, such as a staff member&apos;s name.</li>
          <li>Not pressure customers to rate or review while they are in your premises.</li>
          <li>Not write reviews yourself or on behalf of customers.</li>
        </ul>
        <p>We may suspend an account that breaks these rules, because it can put your Google profile at risk.</p>

        <h2 style={{ fontSize: 20, letterSpacing: '-.02em', margin: '32px 0 8px' }}>Your responsibilities</h2>
        <ul>
          <li>Keep your login private and tell us if it is misused.</li>
          <li>Only collect feedback and phone numbers in line with our <Link href="/privacy">Privacy</Link> page and the law.</li>
          <li>Do not use Neario to harass customers or to publish false or unlawful content.</li>
        </ul>

        <h2 style={{ fontSize: 20, letterSpacing: '-.02em', margin: '32px 0 8px' }}>Agencies and their clients</h2>
        <ul>
          <li>An agency can add businesses it manages to Neario. It must have each owner’s permission first.</li>
          <li>Every business gets its own login and pays Neario directly. The agency is not billed for its clients.</li>
          <li>The agency can see its clients’ dashboards and feedback, and its name appears on reports and QR cards.</li>
          <li>Agencies follow the same Google review rules as every other customer.</li>
        </ul>

        <h2 style={{ fontSize: 20, letterSpacing: '-.02em', margin: '32px 0 8px' }}>Insights and replies are suggestions</h2>
        <p>The insights, trends and reply drafts are generated to help you. Please read them and use your own judgement before acting on them or posting a reply.</p>

        <h2 style={{ fontSize: 20, letterSpacing: '-.02em', margin: '32px 0 8px' }}>Ending your account</h2>
        <p>You can stop using Neario at any time. We may suspend or close an account that breaks these terms. When an account closes, its data is deleted as described on our Privacy page.</p>

        <h2 style={{ fontSize: 20, letterSpacing: '-.02em', margin: '32px 0 8px' }}>Limits</h2>
        <p>We work to keep Neario available, but we cannot promise it will never be interrupted. To the extent the law allows, our responsibility to you is limited to the amount you paid in the 12 months before the problem.</p>

        <hr style={{ border: 0, borderTop: '1px solid var(--line)', margin: '36px 0 20px' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, fontSize: 14, color: 'var(--muted)' }}>
          <span>Neario ReviewFlow</span>
          <div style={{ display: 'flex', gap: 14 }}>
            <Link href="/">Home</Link>
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/privacy">Privacy Policy</Link>
          </div>
        </div>
      </main>
    </div>
  );
}

