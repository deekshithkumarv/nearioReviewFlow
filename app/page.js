'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function HomePage() {
  const [plan, setPlan] = useState('yearly');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [who, setWho] = useState('owner');
  const [biz, setBiz] = useState('');
  const [eml, setEml] = useState('');
  const [cat, setCat] = useState('Salon or spa');
  const [formErr, setFormErr] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);

  const pricingData = {
    monthly: {
      n: 'Monthly',
      a: '₹599',
      u: 'per month',
      d: 'Billed every month. Choose yearly instead and your first 3 months are free.',
      c: 'Get started with monthly',
      note: 'Prices are final. No GST is added.',
    },
    yearly: {
      n: 'Yearly',
      a: '₹5,391',
      s: '₹7,188',
      u: 'one bill for the year',
      d: 'You pay for 9 months and use Neario for 12. That is about ₹449 a month, and you save ₹1,797.',
      c: 'Get started with yearly',
      note: 'Prices are final. No GST is added. Yearly plan: full refund if you ask within 7 days of paying.',
    },
  };

  const curPrice = pricingData[plan];

  function handleFormSubmit(e) {
    e.preventDefault();
    setFormErr('');
    if (!biz.trim()) {
      setFormErr(who === 'agency' ? 'Enter your agency name.' : 'Enter your business name.');
      return;
    }
    if (!eml.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(eml)) {
      setFormErr('Enter a valid email, like name@business.com.');
      return;
    }
    setFormSuccess(true);
  }

  return (
    <>
      {/* SVG Symbol Definitions */}
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <defs>
          <symbol id="qr" viewBox="0 0 24 24">
            <rect x="3.5" y="3.5" width="6" height="6" rx="1.5" />
            <rect x="14.5" y="3.5" width="6" height="6" rx="1.5" />
            <rect x="3.5" y="14.5" width="6" height="6" rx="1.5" />
            <path d="M14.5 14.5h3v3M20.5 14.5v0M14.5 20.5h3M20.5 17.5v3" />
          </symbol>
          <symbol id="radar" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9" />
            <circle cx="12" cy="12" r="4.5" />
            <path d="M12 12 18 6" />
          </symbol>
          <symbol id="reply" viewBox="0 0 24 24">
            <path d="M9 7 4 12l5 5M4 12h10a6 6 0 0 1 6 6" />
          </symbol>
          <symbol id="trend" viewBox="0 0 24 24">
            <path d="M3 17 9 11l4 4 8-9M15 6h6v6" />
          </symbol>
          <symbol id="globe" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9" />
            <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
          </symbol>
          <symbol id="pin" viewBox="0 0 24 24">
            <path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z" />
            <circle cx="12" cy="9.5" r="2.5" />
          </symbol>
          <symbol id="ck" viewBox="0 0 24 24">
            <path d="m5 12.5 4.5 4.5L19 7.5" />
          </symbol>
        </defs>
      </svg>

      {/* Top Announcement Bar */}
      <div className="promo" role="note">
        <b>First 3 months free</b> on the yearly plan. Pay for 9 months, use Neario for 12.
        <a href="#pricing">See the offer</a>
      </div>

      {/* Navigation Header */}
      <div className="in">
        <header className="nav">
          <Link className="brand" href="/" aria-label="Neario ReviewFlow home">
            <span className="mark" aria-hidden="true">N</span>
            <span className="wm">
              <b>neario</b>
              <small>REVIEWFLOW</small>
            </span>
          </Link>

          <nav className="links" aria-label="Main navigation">
            <a href="#how">How it works</a>
            <a href="#features">Features</a>
            <a href="#honest">Honest reviews</a>
            <a href="#agencies">For agencies</a>
            <a href="#pricing">Pricing</a>
            <Link href="/dashboard" style={{ color: 'var(--accent-text)', fontWeight: 700 }}>
              Dashboard <span className="badge sage">Demo</span>
            </Link>
            <Link href="/feedback/1">
              Feedback <span className="badge orange">QR</span>
            </Link>

            <div className="nav-drop">
              <button type="button" className="nav-drop-btn" aria-haspopup="true">
                More Pages ▾
              </button>
              <div className="nav-drop-menu" role="menu">
                <Link href="/onboarding" role="menuitem">
                  <div>
                    <b>Setup &amp; QR Wizard</b>
                    <small>6-step business onboarding</small>
                  </div>
                </Link>
                <Link href="/admin" role="menuitem">
                  <div>
                    <b>Admin Console</b>
                    <small>Operator portal &amp; MRR metrics</small>
                  </div>
                </Link>
                <Link href="/login" role="menuitem">
                  <div>
                    <b>Sign In / Log In</b>
                    <small>Client, Agency &amp; Admin login</small>
                  </div>
                </Link>
                <Link href="/privacy" role="menuitem">
                  <div>
                    <b>Privacy Policy</b>
                    <small>Customer data &amp; phone policy</small>
                  </div>
                </Link>
                <Link href="/terms" role="menuitem">
                  <div>
                    <b>Terms of Service</b>
                    <small>Fair pricing &amp; 7-day refund</small>
                  </div>
                </Link>
              </div>
            </div>

            <Link className="btn p" href="/onboarding">
              Start Setup
            </Link>
          </nav>

          <button
            type="button"
            className="nav-burger"
            id="burgerBtn"
            aria-label="Open navigation menu"
            aria-expanded={mobileDrawerOpen}
            onClick={() => setMobileDrawerOpen(true)}
          >
            <svg viewBox="0 0 24 24">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </header>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileDrawerOpen && (
        <div className="mobile-drawer" role="dialog" aria-modal="true">
          <div
            className="mobile-drawer-back"
            onClick={() => setMobileDrawerOpen(false)}
          />
          <div className="mobile-drawer-box">
            <div className="mobile-drawer-head">
              <div className="brand">
                <span className="mark" aria-hidden="true">N</span>
                <span className="wm">
                  <b>neario</b>
                  <small>REVIEWFLOW</small>
                </span>
              </div>
              <button
                type="button"
                className="mobile-drawer-close"
                onClick={() => setMobileDrawerOpen(false)}
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>

            <div className="mobile-drawer-sec">App Portals &amp; Demos</div>
            <div className="mobile-drawer-links">
              <Link href="/dashboard" onClick={() => setMobileDrawerOpen(false)}>
                <span>📊 Business Dashboard</span>
                <span className="badge sage">Demo</span>
              </Link>
              <Link href="/feedback/1" onClick={() => setMobileDrawerOpen(false)}>
                <span>📱 Customer Feedback</span>
                <span className="badge orange">QR Flow</span>
              </Link>
              <Link href="/onboarding" onClick={() => setMobileDrawerOpen(false)}>
                <span>🚀 Setup &amp; QR Wizard</span>
                <span className="badge green">Setup</span>
              </Link>
              <Link href="/admin" onClick={() => setMobileDrawerOpen(false)}>
                <span>🔐 Admin Console</span>
                <span className="badge purple">Operator</span>
              </Link>
              <Link href="/login" onClick={() => setMobileDrawerOpen(false)}>
                <span>🔑 Sign In</span>
                <span className="badge sage">Portal</span>
              </Link>
            </div>

            <div className="mobile-drawer-sec">Overview &amp; Marketing</div>
            <div className="mobile-drawer-links">
              <a href="#how" onClick={() => setMobileDrawerOpen(false)}>How it works</a>
              <a href="#features" onClick={() => setMobileDrawerOpen(false)}>Features</a>
              <a href="#honest" onClick={() => setMobileDrawerOpen(false)}>Honest reviews</a>
              <a href="#agencies" onClick={() => setMobileDrawerOpen(false)}>For agencies</a>
              <a href="#pricing" onClick={() => setMobileDrawerOpen(false)}>Pricing</a>
              <a href="#faq" onClick={() => setMobileDrawerOpen(false)}>FAQ</a>
            </div>

            <div className="mobile-drawer-sec">Legal &amp; Policy</div>
            <div className="mobile-drawer-links">
              <Link href="/privacy" onClick={() => setMobileDrawerOpen(false)}>Privacy Policy</Link>
              <Link href="/terms" onClick={() => setMobileDrawerOpen(false)}>Terms of Service</Link>
            </div>

            <div style={{ marginTop: 'auto', paddingTop: 14 }}>
              <Link
                className="btn p"
                href="/onboarding"
                onClick={() => setMobileDrawerOpen(false)}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Start Free Setup
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main id="top">
        {/* Hero Section */}
        <section className="in hero">
          <div>
            <a className="burst" href="#pricing">
              <b>First 3 months free</b>
              <span>Yearly plan: pay for 9 months, use 12</span>
            </a>
            <div className="kick">Feedback and Google reviews for local businesses</div>
            <h1>
              Hear every customer. <em>Grow from what they say.</em>
            </h1>
            <p className="lead">
              Customers scan a QR code or tap a stand, leave feedback in their own language, and every one of them can also post a Google review. Neario turns what they write into clear next steps.
            </p>
            <div className="cta">
              <Link className="btn p" href="/onboarding">
                Start Setup (Free)
              </Link>
              <Link className="btn s" href="/dashboard">
                Explore Dashboard Demo →
              </Link>
              <Link className="btn s" href="/feedback/1">
                Try Feedback Flow
              </Link>
            </div>
            <p className="fine">
              Yearly plan: one bill of ₹5,391 covers 12 months. Prefer monthly? It is ₹599 a month.
            </p>
          </div>

          <div className="vis" aria-hidden="true">
            <div className="phone">
              <div className="b">The Green House</div>
              <div className="q">How was your visit?</div>
              <div className="st">★★★★<s>★</s></div>
              <div className="ch">
                <i className="on">Friendly staff</i>
                <i>Waiting time</i>
                <i className="on">Clean space</i>
              </div>
              <div className="go">Send feedback</div>
            </div>
            <div className="float">
              <h3>
                Business Growth Radar <span className="ex">Example</span>
              </h3>
              <div className="ir">
                <i style={{ background: 'var(--orange-soft)', color: 'var(--orange)' }}>!</i>
                <div>
                  <b>Waiting time needs attention</b>
                  <span>Customers mentioned delays</span>
                </div>
              </div>
              <div className="ir">
                <i style={{ background: 'var(--green-soft)', color: 'var(--green)' }}>♥</i>
                <div>
                  <b>Staff behaviour is a strength</b>
                  <span>Customers praised the team</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* All Portals & Working Demos */}
        <section className="sec" style={{ paddingTop: 0, paddingBottom: 30 }}>
          <div className="in">
            <div className="portals-box">
              <div className="portals-head">
                <div>
                  <div className="kick" style={{ marginBottom: 6 }}>Working Prototypes</div>
                  <h2 style={{ fontSize: 'clamp(24px, 3.2vw, 34px)', lineHeight: 1.1 }}>
                    Explore All 6 Connected Pages
                  </h2>
                </div>
                <p style={{ color: 'var(--muted)', maxWidth: '48ch', margin: 0, fontSize: '14.5px' }}>
                  Everything in Neario ReviewFlow is ready to explore. Click any card below to open the portal directly.
                </p>
              </div>

              <div className="portals-grid">
                <Link href="/dashboard" className="pcard">
                  <div className="pcard-top">
                    <span className="pcard-title">📊 Business Dashboard</span>
                    <span className="badge sage">Live Demo</span>
                  </div>
                  <p>
                    Owner cockpit with real-time feedback, AI Growth Radar, rating trends, and Google review approval flow.
                  </p>
                  <span className="pcard-act">Open Owner Dashboard →</span>
                </Link>

                <Link href="/feedback/1" className="pcard">
                  <div className="pcard-top">
                    <span className="pcard-title">📱 Customer Feedback Page</span>
                    <span className="badge orange">QR / Tap</span>
                  </div>
                  <p>
                    Customer mobile experience after scanning counter QR or tapping NFC stand. Available in English, Hindi, and Kannada.
                  </p>
                  <span className="pcard-act">Test Feedback Flow →</span>
                </Link>

                <Link href="/onboarding" className="pcard">
                  <div className="pcard-top">
                    <span className="pcard-title">🚀 Setup &amp; QR Wizard</span>
                    <span className="badge green">Onboarding</span>
                  </div>
                  <p>
                    6-step setup configuring business details, services, locations, Google connection, and scannable QR code.
                  </p>
                  <span className="pcard-act">Launch Setup Wizard →</span>
                </Link>

                <Link href="/admin" className="pcard">
                  <div className="pcard-top">
                    <span className="pcard-title">🔐 Neario Admin Console</span>
                    <span className="badge purple">Operator</span>
                  </div>
                  <p>
                    Internal team console with MRR charts, plan mix, searchable client table with detail drawer, and audit trail.
                  </p>
                  <span className="pcard-act">Open Admin Console →</span>
                </Link>

                <Link href="/privacy" className="pcard">
                  <div className="pcard-top">
                    <span className="pcard-title">📄 Privacy Policy</span>
                    <span className="badge sage">Compliance</span>
                  </div>
                  <p>
                    Clear disclosure of what customers share, how feedback is handled, and complete data deletion rights.
                  </p>
                  <span className="pcard-act">View Privacy Policy →</span>
                </Link>

                <Link href="/terms" className="pcard">
                  <div className="pcard-top">
                    <span className="pcard-title">📜 Terms of Service</span>
                    <span className="badge sage">Terms</span>
                  </div>
                  <p>
                    Transparent terms of use, simple billing rules, 7-day refund guarantee, and anti-review-gating pledge.
                  </p>
                  <span className="pcard-act">View Terms of Service →</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works (Three Steps) */}
        <section className="sec" id="how">
          <div className="in">
            <div className="head">
              <h2>From a scan to a decision in three steps</h2>
              <p>No app to install for your customers. No spreadsheet for you.</p>
            </div>
            <div className="steps">
              <div className="step">
                <span className="n">1</span>
                <h3>Customer scans or taps</h3>
                <p>
                  A QR code on the counter or a TapReview stand opens a short feedback page in English, Hindi or Kannada.
                </p>
              </div>
              <div className="step">
                <span className="n">2</span>
                <h3>Feedback lands in your dashboard</h3>
                <p>
                  Ratings, services and comments are organised by location and date. Private feedback stays private.
                </p>
              </div>
              <div className="step">
                <span className="n">3</span>
                <h3>You act on clear insights</h3>
                <p>
                  The Growth Radar groups what customers say into themes, shows the trend, and suggests what to do next.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="sec" id="features" style={{ paddingTop: 20 }}>
          <div className="in">
            <div className="head">
              <h2>Everything a local business needs, nothing it doesn’t</h2>
            </div>
            <div className="feat">
              <div className="f">
                <svg><use href="#qr" /></svg>
                <h3>QR codes and tap stands</h3>
                <p>One feedback page per location, ready to print or tap.</p>
              </div>
              <div className="f">
                <svg><use href="#radar" /></svg>
                <h3>AI Business Growth Radar</h3>
                <p>
                  Complaints, praise and recurring themes from real feedback, each with the number of entries behind it.
                </p>
              </div>
              <div className="f">
                <svg><use href="#trend" /></svg>
                <h3>Rating trends</h3>
                <p>Daily, weekly and monthly averages with the full rating spread.</p>
              </div>
              <div className="f">
                <svg><use href="#reply" /></svg>
                <h3>Google review replies</h3>
                <p>Draft a personal reply, edit it, approve it. Nothing goes out without you.</p>
              </div>
              <div className="f">
                <svg><use href="#globe" /></svg>
                <h3>Customer languages</h3>
                <p>The feedback page speaks English, Hindi and Kannada.</p>
              </div>
              <div className="f">
                <svg><use href="#pin" /></svg>
                <h3>Many services and locations</h3>
                <p>Compare haircut with facial, or one branch with another.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Honest Reviews Green Band */}
        <section className="sec" id="honest" style={{ paddingTop: 20 }}>
          <div className="in">
            <div className="band">
              <div>
                <div className="kick" style={{ color: '#9bd8ab' }}>Built for honest reviews</div>
                <h2>Every customer gets the same chance to review you on Google.</h2>
                <p>
                  Google’s policies forbid steering only happy customers to a review page. Neario is built the other way round, so your profile stays safe and your reviews stay believable.
                </p>
              </div>
              <ul className="rules">
                <li>
                  <svg viewBox="0 0 24 24"><use href="#ck" /></svg>
                  <div>
                    <b>No review gating</b>
                    The same Google link goes to every customer, whatever their rating.
                  </div>
                </li>
                <li>
                  <svg viewBox="0 0 24 24"><use href="#ck" /></svg>
                  <div>
                    <b>Customers write their own words</b>
                    Neario never invents experiences or reviews.
                  </div>
                </li>
                <li>
                  <svg viewBox="0 0 24 24"><use href="#ck" /></svg>
                  <div>
                    <b>Private feedback is labelled private</b>
                    It is never shown as a published Google review.
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Dineout Planned Section */}
        <section className="sec" id="dineout" style={{ paddingTop: 20 }}>
          <div className="in">
            <div className="dine">
              <div>
                <div className="kick">Planned with Neario Dineout</div>
                <h2>One table QR. Order first, feedback after.</h2>
                <p>
                  For restaurants and cafés, the same QR on the table can take a guest from ordering to a short feedback page once the meal is done. Neario Dineout is the ordering side. This bundle is in planning and is not available yet.
                </p>
              </div>
              <ol className="flow" aria-label="Table QR flow">
                <li><b>Scan</b>Guest scans the table QR</li>
                <li><b>Order</b>Orders and pays on their phone</li>
                <li><b>Eat</b>Kitchen gets the order</li>
                <li><b>Feedback</b>Short page opens after the meal</li>
              </ol>
            </div>
          </div>
        </section>

        {/* For Agencies Section */}
        <section className="sec" id="agencies" style={{ paddingTop: 20 }}>
          <div className="in">
            <div className="dine">
              <div>
                <div className="kick">For agencies</div>
                <h2>Run feedback for all your clients from one login.</h2>
                <p>
                  Marketing agencies can add their clients to Neario and look after each one from a single place. Every client gets their own login and pays Neario directly, so there is nothing to invoice. Your agency name appears on the reports and QR cards you prepare, next to the Neario name.
                </p>
              </div>
              <ol className="flow" aria-label="How agencies work">
                <li><b>Join</b>Neario sets up your agency</li>
                <li><b>Add clients</b>Invite each business owner</li>
                <li><b>Client pays</b>Each client pays Neario directly</li>
                <li><b>You manage</b>See each client dashboard and send reports</li>
              </ol>
            </div>
            <p style={{ margin: '14px 0 0', color: 'var(--muted)', fontSize: 14 }}>
              Agencies follow the same Google rules as everyone: no review gating, the same Google link for every customer, and replies approved by the owner.{' '}
              <a href="#start">Tell us you are an agency</a>.
            </p>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="sec" id="pricing">
          <div className="in">
            <div className="head" style={{ alignItems: 'center', textAlign: 'center' }}>
              <h2 style={{ maxWidth: 'none' }}>Two ways to pay</h2>
              <p>
                Everything is included either way. Choose monthly, or pay once for the year and get 3 months free.
              </p>
            </div>

            <div className="seg" role="radiogroup" aria-label="Billing">
              <button
                type="button"
                role="radio"
                aria-checked={plan === 'monthly'}
                onClick={() => setPlan('monthly')}
              >
                Monthly
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={plan === 'yearly'}
                onClick={() => setPlan('yearly')}
              >
                Yearly <span className="save">3 months free</span>
              </button>
            </div>

            <div className="price">
              {plan === 'yearly' && (
                <div className="ribbon">First 3 months free</div>
              )}
              <div>
                <div className="kick" style={{ margin: 0 }}>
                  Growth Plan · <span>{curPrice.n}</span>
                </div>
                <div className="amt">
                  <b>{curPrice.a}</b>
                  {plan === 'yearly' && (
                    <s aria-label="instead of ₹7,188">{curPrice.s}</s>
                  )}
                  <span>{curPrice.u}</span>
                </div>
                <p className="pdesc">{curPrice.d}</p>
              </div>

              <ul>
                <li>
                  <svg viewBox="0 0 24 24"><use href="#ck" /></svg>
                  QR codes and TapReview feedback pages
                </li>
                <li>
                  <svg viewBox="0 0 24 24"><use href="#ck" /></svg>
                  Dashboard with rating trends and service breakdown
                </li>
                <li>
                  <svg viewBox="0 0 24 24"><use href="#ck" /></svg>
                  AI Business Growth Radar
                </li>
                <li>
                  <svg viewBox="0 0 24 24"><use href="#ck" /></svg>
                  Google review reply drafts with your approval
                </li>
                <li>
                  <svg viewBox="0 0 24 24"><use href="#ck" /></svg>
                  English, Hindi and Kannada feedback pages
                </li>
              </ul>

              <a className="btn p" href="#start">
                {curPrice.c}
              </a>
              <p className="pnote">{curPrice.note}</p>
            </div>
          </div>
        </section>

        {/* FAQ Accordion */}
        <section className="sec" id="faq" style={{ paddingTop: 20 }}>
          <div className="in">
            <div className="head">
              <h2>Questions owners ask</h2>
            </div>
            <div className="faq">
              <details>
                <summary>Do you only send happy customers to Google?</summary>
                <p>No. That is review gating and Google does not allow it. Every customer sees the same Google review option after sending feedback.</p>
              </details>
              <details>
                <summary>Does Neario write reviews for my customers?</summary>
                <p>No. Customers write and post their own Google reviews. The tool can help tidy grammar in a customer’s own words, but never changes what they meant.</p>
              </details>
              <details>
                <summary>How does yearly billing work?</summary>
                <p>You pay one bill of ₹5,391, which covers 9 months at ₹599. The first 3 months are free, so you use Neario for the full 12 months.</p>
              </details>
              <details>
                <summary>Do I pay GST on top?</summary>
                <p>No. The price you see is the price you pay. No GST is added right now.</p>
              </details>
              <details>
                <summary>Can I get a refund on the yearly plan?</summary>
                <p>Yes, if you ask within 7 days of paying. We refund the full ₹5,391. After 7 days the yearly payment is not refundable.</p>
              </details>
              <details>
                <summary>I run an agency. How do I pay?</summary>
                <p>Each of your clients pays Neario directly and has their own login. You are not billed for them. Your agency name appears on the reports and QR cards you prepare.</p>
              </details>
              <details>
                <summary>Do my customers need to install an app?</summary>
                <p>No. They scan a QR code or tap a stand and the page opens in their browser.</p>
              </details>
              <details>
                <summary>What is a TapReview device?</summary>
                <p>A small stand that opens the same feedback page as the QR code when a phone is tapped on it.</p>
              </details>
              <details>
                <summary>Can the replies post automatically?</summary>
                <p>You can approve each reply yourself. Automatic replies are optional and come with limits you set, such as holding low-rated reviews for your approval.</p>
              </details>
              <details>
                <summary>Which languages can customers use?</summary>
                <p>The feedback page is available in English, Hindi and Kannada.</p>
              </details>
            </div>
          </div>
        </section>

        {/* Start Sign-Up Form Section */}
        <section className="sec" id="start" style={{ paddingTop: 20 }}>
          <div className="in">
            <div className="signup">
              <div>
                <h2>Start collecting honest feedback today</h2>
                <p>Tell us about your business and we will set up your workspace.</p>
              </div>

              <form onSubmit={handleFormSubmit} noValidate>
                <label htmlFor="who">
                  I am a
                  <select
                    id="who"
                    value={who}
                    onChange={(e) => setWho(e.target.value)}
                  >
                    <option value="owner">Business owner</option>
                    <option value="agency">Agency managing clients</option>
                  </select>
                </label>

                <label htmlFor="biz">
                  {who === 'agency' ? 'Agency name' : 'Business name'}
                  <input
                    id="biz"
                    name="biz"
                    type="text"
                    autoComplete="organization"
                    value={biz}
                    onChange={(e) => setBiz(e.target.value)}
                    required
                  />
                </label>

                <label htmlFor="eml">
                  Email
                  <input
                    id="eml"
                    name="eml"
                    type="email"
                    autoComplete="email"
                    value={eml}
                    onChange={(e) => setEml(e.target.value)}
                    required
                  />
                </label>

                <label htmlFor="plan-select">
                  Plan
                  <select
                    id="plan-select"
                    value={plan}
                    onChange={(e) => setPlan(e.target.value)}
                  >
                    <option value="yearly">Yearly · first 3 months free · ₹5,391</option>
                    <option value="monthly">Monthly · ₹599 per month</option>
                  </select>
                </label>

                <label htmlFor="cat">
                  Type of business
                  <select
                    id="cat"
                    value={cat}
                    onChange={(e) => setCat(e.target.value)}
                  >
                    <option>Salon or spa</option>
                    <option>Restaurant or café</option>
                    <option>Clinic</option>
                    <option>Retail</option>
                    <option>Other</option>
                  </select>
                </label>

                {formErr && (
                  <div
                    style={{ color: 'var(--red, #c8442f)', fontSize: 14, fontWeight: 600 }}
                    role="alert"
                  >
                    {formErr}
                  </div>
                )}

                <button className="btn p" type="submit" style={{ justifyContent: 'center' }}>
                  Get started
                </button>

                {formSuccess && (
                  <div className="ok" role="status">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <span>
                        Thanks! We are ready to set up <b>{biz}</b>.
                      </span>
                      <Link
                        className="btn p"
                        href="/onboarding"
                        style={{ fontSize: 14, padding: '10px 16px', width: 'max-content', textDecoration: 'none' }}
                      >
                        Continue to Setup Wizard →
                      </Link>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer>
        <div className="in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px 24px' }}>
          <div>
            <div className="brand" style={{ marginBottom: 12 }}>
              <span className="mark" aria-hidden="true">N</span>
              <span className="wm">
                <b>neario</b>
                <small>REVIEWFLOW</small>
              </span>
            </div>
            <p style={{ margin: '0 0 12px', color: 'var(--muted)', fontSize: '13.5px', maxWidth: '32ch' }}>
              Honest customer feedback and Google review growth for local businesses.
            </p>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>
              © 2026 Neario ReviewFlow. All rights reserved.
            </div>
          </div>

          <div>
            <b style={{ color: 'var(--fg)', display: 'block', marginBottom: 12, fontSize: 14 }}>Product</b>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '13.5px' }} aria-label="Product navigation">
              <a href="#how" style={{ textDecoration: 'none', color: 'var(--muted)' }}>How it works</a>
              <a href="#features" style={{ textDecoration: 'none', color: 'var(--muted)' }}>Features</a>
              <a href="#honest" style={{ textDecoration: 'none', color: 'var(--muted)' }}>Honest reviews</a>
              <a href="#agencies" style={{ textDecoration: 'none', color: 'var(--muted)' }}>For agencies</a>
              <a href="#pricing" style={{ textDecoration: 'none', color: 'var(--muted)' }}>Pricing &amp; offer</a>
              <a href="#faq" style={{ textDecoration: 'none', color: 'var(--muted)' }}>FAQ</a>
            </nav>
          </div>

          <div>
            <b style={{ color: 'var(--fg)', display: 'block', marginBottom: 12, fontSize: 14 }}>Portals &amp; Demos</b>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '13.5px' }} aria-label="Portals navigation">
              <Link href="/dashboard" style={{ textDecoration: 'none', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                Owner Dashboard <span className="badge sage" style={{ fontSize: '9.5px' }}>Demo</span>
              </Link>
              <Link href="/feedback/1" style={{ textDecoration: 'none', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                Customer Feedback <span className="badge orange" style={{ fontSize: '9.5px' }}>QR</span>
              </Link>
              <Link href="/onboarding" style={{ textDecoration: 'none', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                Setup &amp; QR Wizard <span className="badge green" style={{ fontSize: '9.5px' }}>Setup</span>
              </Link>
              <Link href="/admin" style={{ textDecoration: 'none', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                Neario Admin Console <span className="badge purple" style={{ fontSize: '9.5px' }}>Team</span>
              </Link>
              <Link href="/login" style={{ textDecoration: 'none', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                Sign In / Login <span className="badge sage" style={{ fontSize: '9.5px' }}>Auth</span>
              </Link>
            </nav>
          </div>

          <div>
            <b style={{ color: 'var(--fg)', display: 'block', marginBottom: 12, fontSize: 14 }}>Legal &amp; Policy</b>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '13.5px' }} aria-label="Legal navigation">
              <Link href="/privacy" style={{ textDecoration: 'none', color: 'var(--muted)' }}>Privacy Policy</Link>
              <Link href="/terms" style={{ textDecoration: 'none', color: 'var(--muted)' }}>Terms of Service</Link>
              <a href="#start" style={{ textDecoration: 'none', color: 'var(--muted)' }}>Contact &amp; Sign up</a>
            </nav>
          </div>
        </div>
      </footer>
    </>
  );
}
