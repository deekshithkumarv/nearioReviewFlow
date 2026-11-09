'use client';

import { useState } from 'react';
import Link from 'next/link';
import { showToast } from './components/Toast';

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [plan, setPlan] = useState('yearly');
  const [who, setWho] = useState('owner');
  const [biz, setBiz] = useState('');
  const [eml, setEml] = useState('');
  const [cat, setCat] = useState('Salon or spa');
  const [submitted, setSubmitted] = useState(false);
  const [err, setErr] = useState('');

  const pricingData = {
    monthly: {
      n: 'Monthly',
      a: '₹599',
      u: 'per month',
      d: 'Billed every month. Choose yearly instead and your first 3 months are free.',
      c: 'Get started with monthly',
    },
    yearly: {
      n: 'Yearly',
      a: '₹5,391',
      s: '₹7,188',
      u: 'one bill for the year',
      d: 'You pay for 9 months and use Neario for 12. That is about ₹449 a month, and you save ₹1,797.',
      c: 'Get started with yearly',
    },
  };

  const curPrice = pricingData[plan];

  function handleFormSubmit(e) {
    e.preventDefault();
    setErr('');
    if (!biz.trim()) {
      setErr(who === 'agency' ? 'Enter your agency name.' : 'Enter your business name.');
      return;
    }
    if (!eml.trim() || !/^\S+@\S+\.\S+$/.test(eml)) {
      setErr('Enter a valid email address.');
      return;
    }
    setSubmitted(true);
    showToast('Thank you! We will set up your workspace and email you shortly.');
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Banner Navigation */}
      <header className="topbar" style={{ position: 'sticky', top: 0, zIndex: 50, background: 'var(--surface)', borderBottom: '1px solid var(--line)', padding: '12px 20px' }}>
        <div className="in" style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <Link href="/" className="brand" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="mark" style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--primary)', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 18 }}>N</span>
            <span className="wm">
              <b style={{ fontSize: 22, letterSpacing: '-.06em', lineHeight: 1, color: 'var(--accent-text)' }}>neario</b>
              <small style={{ fontSize: 9, letterSpacing: '.32em', fontWeight: 700, color: 'var(--muted)', display: 'block' }}>REVIEWFLOW</small>
            </span>
          </Link>

          <nav className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: 20, fontSize: 14, fontWeight: 600 }}>
            <a href="#how" style={{ textDecoration: 'none', color: 'var(--muted)' }}>How it works</a>
            <a href="#features" style={{ textDecoration: 'none', color: 'var(--muted)' }}>Features</a>
            <a href="#agencies" style={{ textDecoration: 'none', color: 'var(--muted)' }}>For Agencies</a>
            <a href="#pricing" style={{ textDecoration: 'none', color: 'var(--muted)' }}>Pricing</a>
            <a href="#faq" style={{ textDecoration: 'none', color: 'var(--muted)' }}>FAQ</a>
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Link href="/login" className="btn ghost" style={{ textDecoration: 'none', fontSize: 13, padding: '7px 14px' }}>
              Sign in
            </Link>
            <Link href="/dashboard" className="btn p" style={{ textDecoration: 'none', fontSize: 13, padding: '7px 14px' }}>
              Open Dashboard →
            </Link>
            <button
              type="button"
              className="burger-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{ display: 'none', background: 'none', border: '1px solid var(--line)', borderRadius: 8, padding: 8, cursor: 'pointer' }}
              aria-label="Toggle navigation menu"
            >
              ☰
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div style={{ padding: '16px 20px', borderTop: '1px solid var(--line)', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <a href="#how" onClick={() => setMobileMenuOpen(false)} style={{ textDecoration: 'none', color: 'var(--fg)', fontWeight: 600 }}>How it works</a>
            <a href="#features" onClick={() => setMobileMenuOpen(false)} style={{ textDecoration: 'none', color: 'var(--fg)', fontWeight: 600 }}>Features</a>
            <a href="#agencies" onClick={() => setMobileMenuOpen(false)} style={{ textDecoration: 'none', color: 'var(--fg)', fontWeight: 600 }}>For Agencies</a>
            <a href="#pricing" onClick={() => setMobileMenuOpen(false)} style={{ textDecoration: 'none', color: 'var(--fg)', fontWeight: 600 }}>Pricing</a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)} style={{ textDecoration: 'none', color: 'var(--fg)', fontWeight: 600 }}>FAQ</a>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <Link href="/login" className="btn s" style={{ flex: 1, textAlign: 'center', textDecoration: 'none' }}>Sign in</Link>
              <Link href="/dashboard" className="btn p" style={{ flex: 1, textAlign: 'center', textDecoration: 'none' }}>Dashboard</Link>
            </div>
          </div>
        )}
      </header>

      <main style={{ flex: 1 }}>
        {/* Hero Section */}
        <section className="hero-sec" style={{ padding: '60px 20px 40px', maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--sage)', color: 'var(--sage-ink)', padding: '6px 14px', borderRadius: 99, fontSize: 13, fontWeight: 700, marginBottom: 18 }}>
            <span>⭐ Google Review Growth &amp; Private Feedback</span>
          </div>
          <h1 style={{ fontSize: 'clamp(34px, 5.5vw, 56px)', letterSpacing: '-.04em', lineHeight: 1.1, margin: '0 0 16px', textWrap: 'balance' }}>
            Turn real customer smiles into 5-star Google reviews.
          </h1>
          <p style={{ fontSize: 'clamp(16px, 2vw, 19px)', color: 'var(--muted)', maxWidth: '62ch', margin: '0 auto 28px', lineHeight: 1.5 }}>
            Help local retail, clinics, salons, and restaurants turn happy in-store guests into glowing Google reviews while handling complaints privately before they hurt your rating.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="#start" className="btn p" style={{ textDecoration: 'none', fontSize: 16, padding: '13px 26px' }}>
              Get started for free
            </a>
            <Link href="/onboarding" className="btn s" style={{ textDecoration: 'none', fontSize: 16, padding: '13px 22px' }}>
              Test Setup Wizard 🚀
            </Link>
          </div>
        </section>

        {/* All Portals & Working Pages Showcase */}
        <section style={{ maxWidth: 1100, margin: '0 auto', padding: '20px 20px 50px' }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 24, padding: 32, boxShadow: 'var(--shadow)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--primary)', marginBottom: 4 }}>
                  Full-Stack Architecture
                </div>
                <h2 style={{ fontSize: 24, margin: 0 }}>Explore All Connected Portals</h2>
              </div>
              <p style={{ color: 'var(--muted)', margin: 0, fontSize: 14, maxWidth: '45ch' }}>
                Each page is integrated with our Neon PostgreSQL database and ready for real data.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
              <Link href="/dashboard" style={{ textDecoration: 'none', color: 'inherit', background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 16, padding: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <b style={{ fontSize: 16 }}>📊 Business Dashboard</b>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: 'var(--green-soft)', color: 'var(--green)' }}>Live</span>
                </div>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--muted)', lineHeight: 1.4 }}>
                  Owner &amp; Agency cockpit with real-time feedback, rating trends, AI radar, and Google review approvals.
                </p>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)', marginTop: 'auto' }}>Open Dashboard →</span>
              </Link>

              <Link href="/feedback/1" target="_blank" style={{ textDecoration: 'none', color: 'inherit', background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 16, padding: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <b style={{ fontSize: 16 }}>📱 Customer Feedback</b>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: 'var(--orange-soft)', color: 'var(--orange)' }}>Public QR</span>
                </div>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--muted)', lineHeight: 1.4 }}>
                  Customer experience after scanning QR or tapping NFC stand. Submits real ratings directly to Neon DB.
                </p>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)', marginTop: 'auto' }}>Test Feedback Form ↗</span>
              </Link>

              <Link href="/admin" style={{ textDecoration: 'none', color: 'inherit', background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 16, padding: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <b style={{ fontSize: 16 }}>🔐 Neario Super Admin</b>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: 'var(--purple-soft)', color: 'var(--purple)' }}>Operator</span>
                </div>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--muted)', lineHeight: 1.4 }}>
                  Team console with MRR metrics, Agencies partner management, client health records, and audit log.
                </p>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)', marginTop: 'auto' }}>Open Admin Console →</span>
              </Link>

              <Link href="/onboarding" style={{ textDecoration: 'none', color: 'inherit', background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 16, padding: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <b style={{ fontSize: 16 }}>🚀 Setup &amp; QR Wizard</b>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: 'var(--green-soft)', color: 'var(--green)' }}>Wizard</span>
                </div>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--muted)', lineHeight: 1.4 }}>
                  6-step wizard configuring services, multiple branches, Google review connection, and scannable cards.
                </p>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)', marginTop: 'auto' }}>Launch Setup Wizard →</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Agency Section */}
        <section id="agencies" style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 20px' }}>
          <div style={{ background: 'var(--primary)', color: 'var(--on-primary)', borderRadius: 24, padding: 'clamp(28px, 4vw, 44px)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 32, alignItems: 'center' }}>
            <div>
              <div style={{ background: 'rgba(255,255,255,0.18)', color: '#fff', display: 'inline-block', padding: '4px 12px', borderRadius: 99, fontSize: 12, fontWeight: 700, marginBottom: 12 }}>
                For Marketing Agencies
              </div>
              <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 36px)', lineHeight: 1.15, margin: '0 0 12px' }}>
                Run feedback for all your clients from one login.
              </h2>
              <p style={{ opacity: 0.9, lineHeight: 1.5, margin: '0 0 20px', fontSize: 15.5 }}>
                Marketing agencies can add client businesses, monitor ratings, and send automated reports. Clients are billed directly by Neario, so you have zero invoice collection headaches. Your agency name appears co-branded on reports and print cards.
              </p>
              <a href="#start" className="btn" style={{ background: '#fff', color: 'var(--primary)', textDecoration: 'none', fontWeight: 700 }}>
                Sign up as an agency →
              </a>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.15)', borderRadius: 16, padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{ background: '#fff', color: 'var(--primary)', width: 28, height: 28, borderRadius: '50%', display: 'grid', placeItems: 'center', fontWeight: 800, flexShrink: 0 }}>1</span>
                <div>
                  <b style={{ display: 'block' }}>Instant Client Onboarding</b>
                  <span style={{ opacity: 0.85, fontSize: 13 }}>Invite owners with a single click. They get their own private login.</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{ background: '#fff', color: 'var(--primary)', width: 28, height: 28, borderRadius: '50%', display: 'grid', placeItems: 'center', fontWeight: 800, flexShrink: 0 }}>2</span>
                <div>
                  <b style={{ display: 'block' }}>Direct Client Billing</b>
                  <span style={{ opacity: 0.85, fontSize: 13 }}>Each client pays Neario directly via monthly or yearly plans.</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{ background: '#fff', color: 'var(--primary)', width: 28, height: 28, borderRadius: '50%', display: 'grid', placeItems: 'center', fontWeight: 800, flexShrink: 0 }}>3</span>
                <div>
                  <b style={{ display: 'block' }}>View-As Agency Cockpit</b>
                  <span style={{ opacity: 0.85, fontSize: 13 }}>Inspect any client dashboard with automated transparency and audit logs.</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px', textAlign: 'center' }}>
          <h2 style={{ fontSize: 32, margin: '0 0 8px' }}>Two ways to pay</h2>
          <p style={{ color: 'var(--muted)', margin: '0 0 24px', fontSize: 15 }}>
            Everything is included either way. Choose monthly, or pay yearly to get 3 months free.
          </p>

          <div style={{ display: 'inline-flex', background: 'var(--surface-2)', padding: 4, borderRadius: 12, border: '1px solid var(--line)', marginBottom: 28 }}>
            <button
              type="button"
              onClick={() => setPlan('monthly')}
              style={{ padding: '8px 18px', border: 0, borderRadius: 8, fontWeight: 700, cursor: 'pointer', background: plan === 'monthly' ? 'var(--surface)' : 'transparent', color: plan === 'monthly' ? 'var(--fg)' : 'var(--muted)' }}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setPlan('yearly')}
              style={{ padding: '8px 18px', border: 0, borderRadius: 8, fontWeight: 700, cursor: 'pointer', background: plan === 'yearly' ? 'var(--surface)' : 'transparent', color: plan === 'yearly' ? 'var(--fg)' : 'var(--muted)' }}
            >
              Yearly <span style={{ background: '#f6c344', color: '#2a1d00', fontSize: 10, padding: '2px 6px', borderRadius: 99, marginLeft: 6 }}>3 months free</span>
            </button>
          </div>

          <div className="card" style={{ padding: 36, borderRadius: 24, textAlign: 'left', border: '2px solid var(--primary)', position: 'relative', boxShadow: 'var(--shadow)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>Growth Plan</span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
                  <b style={{ fontSize: 38, letterSpacing: '-.04em' }}>{curPrice.a}</b>
                  {curPrice.s && <s style={{ color: 'var(--muted)', fontSize: 18 }}>{curPrice.s}</s>}
                  <span style={{ color: 'var(--muted)', fontSize: 14 }}>{curPrice.u}</span>
                </div>
              </div>
              <a href="#start" className="btn p" style={{ textDecoration: 'none', padding: '10px 20px' }}>
                {curPrice.c}
              </a>
            </div>
            <p style={{ color: 'var(--muted)', margin: '14px 0 20px', fontSize: 14 }}>{curPrice.d}</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10, fontSize: 14 }}>
              <li>✓ Scannable counter QR codes &amp; Tap stands</li>
              <li>✓ Real-time ratings &amp; Sentiment radar</li>
              <li>✓ Google Review approval workflow</li>
              <li>✓ English, Hindi, and Kannada feedback support</li>
              <li>✓ Agency co-branding &amp; multi-branch reports</li>
            </ul>
          </div>
        </section>

        {/* Sign-up Form */}
        <section id="start" style={{ maxWidth: 640, margin: '40px auto 60px', padding: '0 20px' }}>
          <div className="card" style={{ padding: 32, borderRadius: 24, boxShadow: 'var(--shadow)' }}>
            <h2 style={{ fontSize: 24, margin: '0 0 6px' }}>Start collecting honest feedback</h2>
            <p style={{ color: 'var(--muted)', margin: '0 0 24px', fontSize: 14 }}>
              Tell us about your business or agency and we will activate your workspace.
            </p>

            {err && (
              <div style={{ background: 'var(--red-soft)', color: 'var(--red)', padding: '10px 14px', borderRadius: 8, fontSize: 13.5, marginBottom: 16, fontWeight: 600 }}>
                {err}
              </div>
            )}

            {submitted ? (
              <div style={{ background: 'var(--green-soft)', color: 'var(--green)', padding: 20, borderRadius: 12, textAlign: 'center' }}>
                <b style={{ display: 'block', fontSize: 18, marginBottom: 4 }}>Request Received!</b>
                <p style={{ margin: 0, fontSize: 14 }}>
                  We are preparing your workspace. In the meantime, you can explore the live demo portals anytime!
                </p>
                <div style={{ marginTop: 16 }}>
                  <Link href="/dashboard" className="btn p" style={{ textDecoration: 'none', fontSize: 14 }}>
                    Go to Dashboard →
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <label className="f2">
                  <span style={{ fontSize: 13, fontWeight: 600 }}>I am a</span>
                  <select
                    value={who}
                    onChange={(e) => setWho(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface-2)' }}
                  >
                    <option value="owner">Business owner</option>
                    <option value="agency">Agency managing clients</option>
                  </select>
                </label>

                <label className="f2">
                  <span style={{ fontSize: 13, fontWeight: 600 }}>
                    {who === 'agency' ? 'Agency name' : 'Business name'}
                  </span>
                  <input
                    type="text"
                    required
                    placeholder={who === 'agency' ? 'e.g. Pixel & Co Marketing' : 'e.g. The Green House'}
                    value={biz}
                    onChange={(e) => setBiz(e.target.value)}
                    className="inp"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface-2)' }}
                  />
                </label>

                <label className="f2">
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Email address</span>
                  <input
                    type="email"
                    required
                    placeholder="you@domain.com"
                    value={eml}
                    onChange={(e) => setEml(e.target.value)}
                    className="inp"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface-2)' }}
                  />
                </label>

                <label className="f2">
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Business type</span>
                  <select
                    value={cat}
                    onChange={(e) => setCat(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface-2)' }}
                  >
                    <option>Salon or spa</option>
                    <option>Restaurant or café</option>
                    <option>Clinic</option>
                    <option>Retail</option>
                    <option>Other</option>
                  </select>
                </label>

                <button type="submit" className="primary" style={{ padding: 12, borderRadius: 8, fontWeight: 700, marginTop: 8 }}>
                  Get started
                </button>
              </form>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--line)', background: 'var(--surface)', padding: '40px 20px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px 24px' }}>
          <div>
            <div className="brand" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <span className="mark" style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--primary)', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 16 }}>N</span>
              <span className="wm">
                <b style={{ fontSize: 20, color: 'var(--accent-text)' }}>neario</b>
                <small style={{ fontSize: 8, letterSpacing: '.3em', fontWeight: 700, color: 'var(--muted)', display: 'block' }}>REVIEWFLOW</small>
              </span>
            </div>
            <p style={{ margin: 0, color: 'var(--muted)', fontSize: 13, lineHeight: 1.5 }}>
              Customer feedback and Google review growth for retail, clinics, salons, and hospitality.
            </p>
          </div>

          <div>
            <b style={{ display: 'block', marginBottom: 12, fontSize: 14 }}>Portals &amp; Demos</b>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13.5 }}>
              <Link href="/dashboard" style={{ textDecoration: 'none', color: 'var(--muted)' }}>Owner &amp; Agency Dashboard</Link>
              <Link href="/feedback/1" target="_blank" style={{ textDecoration: 'none', color: 'var(--muted)' }}>Customer Feedback Form ↗</Link>
              <Link href="/onboarding" style={{ textDecoration: 'none', color: 'var(--muted)' }}>Setup &amp; QR Wizard</Link>
              <Link href="/admin" style={{ textDecoration: 'none', color: 'var(--muted)' }}>Neario Admin Console</Link>
            </div>
          </div>

          <div>
            <b style={{ display: 'block', marginBottom: 12, fontSize: 14 }}>Legal &amp; Policy</b>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13.5 }}>
              <Link href="/terms" style={{ textDecoration: 'none', color: 'var(--muted)' }}>Terms of Service</Link>
              <Link href="/privacy" style={{ textDecoration: 'none', color: 'var(--muted)' }}>Privacy Policy</Link>
              <Link href="/login" style={{ textDecoration: 'none', color: 'var(--muted)' }}>Sign in to account</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
