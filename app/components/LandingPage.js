'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import HeroPhoneMockup from './HeroPhoneMockup';

const SECTION_IDS = ['how', 'features', 'agencies', 'pricing', 'honest', 'faq', 'start'];

export default function LandingPage({ initialSection = 'top' }) {
  const [plan, setPlan] = useState('yearly');
  const [who, setWho] = useState('owner');
  const [biz, setBiz] = useState('');
  const [eml, setEml] = useState('');
  const [tel, setTel] = useState('');
  const [cat, setCat] = useState('Salon or spa');
  const [honeypot, setHoneypot] = useState('');
  const [formErr, setFormErr] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [activeSection, setActiveSection] = useState(initialSection);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  const scrollToSection = (sectionId, behavior = 'smooth') => {
    if (!sectionId || sectionId === 'top') {
      window.scrollTo({ top: 0, behavior });
      return;
    }
    const el = document.getElementById(sectionId);
    if (el) el.scrollIntoView({ behavior, block: 'start' });
  };

  useEffect(() => {
    // Clean any legacy /#section hash into clean path /section
    const rawHash = (window.location.hash || '').replace(/^#/, '');
    if (rawHash && SECTION_IDS.includes(rawHash)) {
      window.history.replaceState({ section: rawHash }, '', '/' + rawHash);
      setActiveSection(rawHash);
      requestAnimationFrame(() => scrollToSection(rawHash, 'smooth'));
    } else if (initialSection && initialSection !== 'top') {
      setActiveSection(initialSection);
      requestAnimationFrame(() => scrollToSection(initialSection, 'smooth'));
    }

    const onPopState = () => {
      const slug = window.location.pathname.replace(/^\/+|\/+$/g, '');
      const target = SECTION_IDS.includes(slug) ? slug : 'top';
      setActiveSection(target);
      scrollToSection(target, 'smooth');
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [initialSection]);

  function handleSectionNav(e, sectionId) {
    if (e) e.preventDefault();
    closeMobileMenu();
    const targetUrl = sectionId === 'top' ? '/' : '/' + sectionId;
    if (window.location.pathname !== targetUrl || window.location.hash) {
      window.history.pushState({ section: sectionId }, '', targetUrl);
    }
    setActiveSection(sectionId);
    scrollToSection(sectionId, 'smooth');
  }

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

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

  async function handleFormSubmit(e) {
    e.preventDefault();
    setFormErr('');

    const bizTrim = biz.trim();
    const emlTrim = eml.trim();
    const telTrim = tel.trim();
    const EMAIL_RE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const PHONE_RE = /^\d{10}$/;

    if (!['owner', 'agency'].includes(who)) {
      setFormErr('Please select whether you are a business owner or an agency.');
      return;
    }
    if (!bizTrim) {
      setFormErr(who === 'agency' ? 'Enter your agency name.' : 'Enter your business name.');
      return;
    }
    if (bizTrim.length < 2 || !/[a-zA-Z0-9\u0900-\u097F\u0C80-\u0CFF]/.test(bizTrim)) {
      setFormErr(
        who === 'agency'
          ? 'Enter a valid agency name (at least 2 characters).'
          : 'Enter a valid business name (at least 2 characters).'
      );
      return;
    }
    if (!emlTrim || !EMAIL_RE.test(emlTrim)) {
      setFormErr('Enter a valid email address, like name@business.com.');
      return;
    }
    if (!PHONE_RE.test(telTrim) || /^0{10}$/.test(telTrim)) {
      setFormErr('Enter a valid 10-digit WhatsApp number.');
      return;
    }
    if (!['yearly', 'monthly'].includes(plan)) {
      setFormErr('Please select a valid plan.');
      return;
    }
    if (!cat.trim()) {
      setFormErr('Please select a business type.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: who,
          name: bizTrim,
          email: emlTrim,
          phone: telTrim,
          plan,
          type: cat,
          company_url: honeypot,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong. Please try again.');
      }

      setFormSuccess(true);
      setBiz('');
      setEml('');
      setTel('');
    } catch (err) {
      setFormErr(err.message || 'Could not submit your details. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      {/* SVG Symbols */}
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
        <a href="/pricing" onClick={(e) => handleSectionNav(e, 'pricing')}>See the offer</a>
      </div>

      {/* Navigation Header */}
      <div className="in">
        <header className="nav">
          <Link className="brand" href="/" onClick={(e) => handleSectionNav(e, 'top')} aria-label="Neario ReviewFlow home">
            <span className="mark" aria-hidden="true">N</span>
            <span className="wm">
              <b>neario</b>
              <small>REVIEWFLOW</small>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="links desktop-links" aria-label="Page sections">
            <a href="/how" className={activeSection === 'how' ? 'active' : ''} onClick={(e) => handleSectionNav(e, 'how')}>How it works</a>
            <a href="/features" className={activeSection === 'features' ? 'active' : ''} onClick={(e) => handleSectionNav(e, 'features')}>Features</a>
            <a href="/agencies" className={activeSection === 'agencies' ? 'active' : ''} onClick={(e) => handleSectionNav(e, 'agencies')}>For agencies</a>
            <a href="/pricing" className={activeSection === 'pricing' ? 'active' : ''} onClick={(e) => handleSectionNav(e, 'pricing')}>Pricing</a>
            <a href="/demo/overview" style={{ display: 'inline-flex', alignItems: 'center' }}>
              Dashboard
              <span className="nav-badge demo">DEMO</span>
            </a>
            <Link className="si" href="/login">
              Sign in
            </Link>
            <a className="btn p" href="/start" onClick={(e) => handleSectionNav(e, 'start')}>
              Get 3 months free
            </a>
          </nav>

          {/* Mobile Navigation Toggle */}
          <div className="mobile-nav-toggle">
            <Link className="mobile-si" href="/login">
              Sign in
            </Link>
            <a className="btn p btn-sm mobile-cta" href="/start" onClick={(e) => handleSectionNav(e, 'start')}>
              3 months free
            </a>
            <button
              type="button"
              className="nav-burger"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <line x1="4" y1="7" x2="20" y2="7" />
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <line x1="4" y1="17" x2="20" y2="17" />
                </svg>
              )}
            </button>
          </div>
        </header>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-drawer" role="dialog" aria-modal="true" aria-label="Mobile navigation">
          <div className="mobile-drawer-back" onClick={closeMobileMenu} />
          <div className="mobile-drawer-box">
            <div className="mobile-drawer-head">
              <Link className="brand" href="/" onClick={(e) => handleSectionNav(e, 'top')}>
                <span className="mark" aria-hidden="true">N</span>
                <span className="wm">
                  <b>neario</b>
                  <small>REVIEWFLOW</small>
                </span>
              </Link>
              <button
                type="button"
                className="mobile-drawer-close"
                aria-label="Close menu"
                onClick={closeMobileMenu}
              >
                ✕
              </button>
            </div>

            <a className="btn p full-btn" href="/start" onClick={(e) => handleSectionNav(e, 'start')}>
              Get 3 months free
            </a>

            <div className="mobile-drawer-sec">Navigation</div>
            <nav className="mobile-drawer-links" aria-label="Mobile page sections">
              <a href="/how" onClick={(e) => handleSectionNav(e, 'how')}>
                <span>How it works</span>
                <span aria-hidden="true">→</span>
              </a>
              <a href="/features" onClick={(e) => handleSectionNav(e, 'features')}>
                <span>Features</span>
                <span aria-hidden="true">→</span>
              </a>
              <a href="/agencies" onClick={(e) => handleSectionNav(e, 'agencies')}>
                <span>For agencies</span>
                <span aria-hidden="true">→</span>
              </a>
              <a href="/pricing" onClick={(e) => handleSectionNav(e, 'pricing')}>
                <span>Pricing</span>
                <span aria-hidden="true">→</span>
              </a>
              <a href="/faq" onClick={(e) => handleSectionNav(e, 'faq')}>
                <span>FAQ</span>
                <span aria-hidden="true">→</span>
              </a>
            </nav>

            <div className="mobile-drawer-sec">Portals & Demo</div>
            <nav className="mobile-drawer-links" aria-label="Mobile portals">
              <a href="/demo/overview" onClick={closeMobileMenu}>
                <span>Dashboard Demo</span>
                <span className="badge green">Demo</span>
              </a>
              <Link href="/feedback/demo-cafe-1" onClick={closeMobileMenu}>
                <span>Customer Feedback QR</span>
                <span className="badge orange">Try QR</span>
              </Link>
              <Link href="/login" onClick={closeMobileMenu}>
                <span>Client & Agency Sign In</span>
                <span aria-hidden="true">→</span>
              </Link>
              <Link href="/onboarding" onClick={closeMobileMenu}>
                <span>Setup & QR Wizard</span>
                <span className="badge purple">Wizard</span>
              </Link>
              <Link href="/admin" onClick={closeMobileMenu}>
                <span>Super Admin Console</span>
                <span className="badge sage">Admin</span>
              </Link>
              <Link
                href="/login"
                onClick={closeMobileMenu}
                style={{ fontWeight: 700, color: 'var(--primary)' }}
              >
                <span>Sign In to Account</span>
                <span aria-hidden="true">→</span>
              </Link>
            </nav>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main id="top">
        {/* Hero Section */}
        <section className="in hero">
          <div>
            <a className="burst" href="/pricing" onClick={(e) => handleSectionNav(e, 'pricing')}>
              <b>First 3 months free</b>
              <span>Yearly plan: pay for 9 months, use 12</span>
            </a>
            <div className="kick">Feedback and Google reviews for local businesses</div>
            <h1>
              Hear every customer. <em>Grow</em> from what they say.
            </h1>
            <p className="lead">
              Customers scan a QR code or tap a stand, leave feedback in their own language, and every one of them can also post a Google review. Neario turns what they write into clear next steps.
            </p>
            <div className="cta">
              <a className="btn p" href="/start" onClick={(e) => handleSectionNav(e, 'start')}>
                Get 3 months free
              </a>
              <a className="btn s" href="/how" onClick={(e) => handleSectionNav(e, 'how')}>
                See how it works
              </a>
            </div>
            <p className="fine">
              Yearly plan: one bill of ₹5,391 covers 12 months. Prefer monthly? It is ₹599 a month.
            </p>
          </div>

          <HeroPhoneMockup />
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
                <p>Complaints, praise and recurring themes from real feedback, each with the number of entries behind it.</p>
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

        {/* Honest Reviews Band */}
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

        {/* Planned with Neario Dineout */}
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

        {/* For Agencies */}
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
              <a href="/start" onClick={(e) => handleSectionNav(e, 'start')}>Tell us you are an agency</a>.
            </p>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="sec" id="pricing">
          <div className="in">
            <div className="head" style={{ alignItems: 'center', textAlign: 'center' }}>
              <h2 style={{ maxWidth: 'none' }}>Two ways to pay</h2>
              <p>Everything is included either way. Choose monthly, or pay once for the year and get 3 months free.</p>
            </div>

            <div className="seg" role="radiogroup" aria-label="Billing">
              <button
                type="button"
                role="radio"
                id="pm"
                aria-checked={plan === 'monthly'}
                onClick={() => setPlan('monthly')}
              >
                Monthly
              </button>
              <button
                type="button"
                role="radio"
                id="py"
                aria-checked={plan === 'yearly'}
                onClick={() => setPlan('yearly')}
              >
                Yearly <span className="save">3 months free</span>
              </button>
            </div>

            <div className="price">
              {plan === 'yearly' && <div className="ribbon" id="pr">First 3 months free</div>}
              <div>
                <div className="kick" style={{ margin: 0 }}>
                  Growth Plan · <span id="pn">{curPrice.n}</span>
                </div>
                <div className="amt">
                  <b id="pa">{curPrice.a}</b>
                  {curPrice.s && (
                    <s id="ps" aria-label={`instead of ${curPrice.s}`}>
                      {curPrice.s}
                    </s>
                  )}
                  <span id="pu">{curPrice.u}</span>
                </div>
                <p id="pd" className="pdesc">{curPrice.d}</p>
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

              <a className="btn p" id="pc" href="/start" onClick={(e) => handleSectionNav(e, 'start')}>
                {curPrice.c}
              </a>
              <p className="pnote" id="pnote">{curPrice.note}</p>
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

        {/* Start Collecting Honest Feedback Today */}
        <section className="sec" id="start" style={{ paddingTop: 20 }}>
          <div className="in">
            <div className="signup">
              <div>
                <h2>Start collecting honest feedback today</h2>
                <p>Tell us about your business and we will set up your workspace.</p>
              </div>

              <form id="f" noValidate onSubmit={handleFormSubmit}>
                {formSuccess ? (
                  <div
                    className="ok"
                    id="ok"
                    role="status"
                    style={{
                      background: '#dcfce7',
                      border: '1.5px solid #22c55e',
                      color: '#166534',
                      padding: '28px 24px',
                      borderRadius: '16px',
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      margin: 0,
                    }}
                  >
                    <div style={{ fontSize: '30px', lineHeight: 1, marginBottom: '10px' }}>🎉</div>
                    <b style={{ display: 'block', fontSize: '18px', color: '#14532d', marginBottom: '8px' }}>
                      Request Received!
                    </b>
                    <p style={{ margin: '0 auto 18px', maxWidth: '38ch', fontSize: '14px', lineHeight: 1.55, color: '#166534', textAlign: 'center' }}>
                      Thanks! We have your details. Our team will review your business and send your sign-in invite link and setup details via Email or WhatsApp within one working day.
                    </p>
                    <button
                      type="button"
                      className="btn s btn-sm"
                      onClick={() => setFormSuccess(false)}
                      style={{ background: '#ffffff', border: '1px solid #86efac', color: '#15803d' }}
                    >
                      Submit another inquiry
                    </button>
                  </div>
                ) : (
                  <>
                    <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', top: 'auto', width: 1, height: 1, overflow: 'hidden' }}>
                      <label>
                        Do not fill this in
                        <input
                          name="company_url"
                          tabIndex={-1}
                          autoComplete="off"
                          value={honeypot}
                          onChange={(e) => setHoneypot(e.target.value)}
                        />
                      </label>
                    </div>

                    <label htmlFor="who">
                      I am a
                      <select
                        id="who"
                        value={who}
                        onChange={(e) => {
                          setWho(e.target.value);
                          if (formErr) setFormErr('');
                        }}
                      >
                        <option value="owner">Business owner</option>
                        <option value="agency">Agency managing clients</option>
                      </select>
                    </label>

                    <label htmlFor="biz" id="bizl">
                      {who === 'agency' ? 'Agency name' : 'Business name'}
                      <input
                        id="biz"
                        name="biz"
                        autoComplete="organization"
                        maxLength={100}
                        minLength={2}
                        placeholder={who === 'agency' ? 'e.g. Pixel & Co Marketing' : 'e.g. The Green House'}
                        required
                        value={biz}
                        onChange={(e) => {
                          setBiz(e.target.value);
                          if (formErr) setFormErr('');
                        }}
                      />
                    </label>

                    <label htmlFor="eml">
                      Email
                      <input
                        id="eml"
                        name="eml"
                        type="email"
                        autoComplete="email"
                        maxLength={254}
                        placeholder="you@business.com"
                        required
                        value={eml}
                        onChange={(e) => {
                          setEml(e.target.value);
                          if (formErr) setFormErr('');
                        }}
                      />
                    </label>

                    <label htmlFor="tel">
                      WhatsApp number
                      <input
                        id="tel"
                        name="tel"
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        pattern="\d{10}"
                        autoComplete="tel"
                        placeholder="10-digit mobile number"
                        required
                        value={tel}
                        onChange={(e) => {
                          const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 10);
                          setTel(digitsOnly);
                          if (formErr) setFormErr('');
                        }}
                      />
                    </label>

                    <label htmlFor="plan">
                      Plan
                      <select id="plan" value={plan} onChange={(e) => setPlan(e.target.value)}>
                        <option value="yearly">Yearly · first 3 months free · ₹5,391</option>
                        <option value="monthly">Monthly · ₹599 per month</option>
                      </select>
                    </label>

                    <label htmlFor="cat">
                      Type of business
                      <select id="cat" value={cat} onChange={(e) => setCat(e.target.value)}>
                        <option>Salon or spa</option>
                        <option>Restaurant or café</option>
                        <option>Clinic</option>
                        <option>Retail</option>
                        <option>Other</option>
                      </select>
                    </label>

                    {formErr && (
                      <div id="err" style={{ color: 'var(--red, #c8442f)', fontSize: 14, fontWeight: 600 }} role="alert">
                        {formErr}
                      </div>
                    )}

                    <button
                      className="btn p"
                      type="submit"
                      disabled={submitting}
                      style={{ justifyContent: 'center' }}
                    >
                      {submitting ? 'Submitting...' : 'Get started'}
                    </button>
                  </>
                )}
              </form>
            </div>
          </div>
        </section>
      </main>

      {/* Clean Footer */}
      <footer>
        <div className="in">
          <div>
            <b style={{ color: 'var(--fg)' }}>Neario ReviewFlow</b>
            <br />
            Feedback and review management for local businesses.
          </div>
          <nav aria-label="Footer">
            <a href="/how" onClick={(e) => handleSectionNav(e, 'how')}>How it works</a>
            <a href="/agencies" onClick={(e) => handleSectionNav(e, 'agencies')}>For agencies</a>
            <a href="/pricing" onClick={(e) => handleSectionNav(e, 'pricing')}>Pricing</a>
            <a href="/faq" onClick={(e) => handleSectionNav(e, 'faq')}>FAQ</a>
            <a href="/start" onClick={(e) => handleSectionNav(e, 'start')}>Sign up</a>
            <Link href="/login">Sign in</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
          </nav>
        </div>
      </footer>
    </>
  );
}
