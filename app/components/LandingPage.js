'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Languages,
  MapPin,
  Menu,
  QrCode,
  Reply,
  TrendingUp,
  UtensilsCrossed,
} from 'lucide-react';
import Logo from './ui/Logo';
import Modal from './ui/Modal';
import Reveal, { RevealItem } from './ui/Reveal';
import HeroPhoneMockup from './HeroPhoneMockup';
import Pricing from './landing/Pricing';
import Faq from './landing/Faq';
import SignupForm from './landing/SignupForm';
import SiteFooter from './landing/SiteFooter';
import s from './landing/landing.module.css';

const SECTION_IDS = ['how', 'features', 'agencies', 'pricing', 'honest', 'faq', 'start'];

const DESKTOP_NAV = [
  { id: 'how', label: 'How it works' },
  { id: 'features', label: 'Features' },
  { id: 'agencies', label: 'For agencies' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'faq', label: 'FAQ' },
];

const DRAWER_NAV = [
  { id: 'how', label: 'How it works' },
  { id: 'features', label: 'Features' },
  { id: 'honest', label: 'Honest reviews' },
  { id: 'agencies', label: 'For agencies' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'faq', label: 'FAQ' },
];

const STEPS = [
  {
    title: 'A customer scans or taps',
    body: 'A QR card on your counter or a TapReview stand opens a short feedback page in their browser. No app, no sign-up, in English, Hindi or Kannada.',
  },
  {
    title: 'You read it in your dashboard',
    body: 'Ratings, services and comments, sorted by location and date. Private feedback stays private. It is never posted anywhere.',
  },
  {
    title: 'You decide what to fix',
    body: 'Growth Radar groups what customers write into themes, so you can see what is working and what keeps coming up.',
  },
];

const FEATURES = [
  { icon: QrCode, title: 'QR cards and tap stands', body: 'One feedback page per location, ready to print or to put on a TapReview stand.' },
  { icon: TrendingUp, title: 'Rating trends', body: 'Daily, weekly and monthly averages, with the full spread of ratings behind them.' },
  { icon: Reply, title: 'Google review replies', body: 'Draft a reply, edit it, approve it. Nothing goes out without you.' },
  { icon: Languages, title: 'Three languages', body: 'Customers pick English, हिन्दी or ಕನ್ನಡ on the feedback page.' },
  { icon: MapPin, title: 'Services and branches', body: 'Compare a haircut with a facial, or one branch with another.' },
];

const RADAR_EXAMPLE = [
  { tone: 'praise', label: 'Praise', text: 'Staff are friendly and patient' },
  { tone: 'attention', label: 'Keeps coming up', text: 'Waiting time on weekends' },
  { tone: 'idea', label: 'Asked for', text: 'Reminders before appointments' },
];

const HONEST_RULES = [
  { title: 'No review gating', body: 'The same Google link goes to every customer, whatever they rated.' },
  { title: 'Customers write their own words', body: 'Neario never invents experiences or writes reviews for anyone.' },
  { title: 'Private feedback stays private', body: 'It is labelled private and never shown as a published Google review.' },
];

const DINEOUT_FLOW = [
  { title: 'Scan', body: 'Guest scans the table QR' },
  { title: 'Order', body: 'Orders and pays on their phone' },
  { title: 'Eat', body: 'The kitchen gets the order' },
  { title: 'Feedback', body: 'A short page opens after the meal' },
];

const AGENCY_STEPS = [
  { title: 'Join', body: 'Neario sets up your agency account.' },
  { title: 'Add clients', body: 'Invite each business owner, with their permission.' },
  { title: 'Client pays', body: 'Each client pays Neario directly. You are not billed.' },
  { title: 'You manage', body: 'Open any client’s dashboard and send them reports.' },
];

// Fixed 7x7 pattern for the decorative QR card (not a scannable code).
const QR_CELLS = '1110101100101110101011011010100011101110010111011'.split('');

function isModifiedClick(e) {
  return e && (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button === 1);
}

export default function LandingPage({ initialSection = 'top' }) {
  const [plan, setPlan] = useState('yearly');
  const [who, setWho] = useState('owner');
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(initialSection);
  const menuOpenRef = useRef(false);
  menuOpenRef.current = menuOpen;

  const scrollToSection = useCallback((sectionId, behavior = 'smooth') => {
    if (!sectionId || sectionId === 'top') {
      window.scrollTo({ top: 0, behavior });
      return;
    }
    const el = document.getElementById(sectionId);
    if (el) el.scrollIntoView({ behavior, block: 'start' });
  }, []);

  // Initial section from the route, legacy /#section hashes, and back/forward.
  useEffect(() => {
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
  }, [initialSection, scrollToSection]);

  // Highlight the nav item for the section being read (does not touch the URL).
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const ids = ['hero', ...SECTION_IDS, 'dineout'];
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean);
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.id;
          setActiveSection(id === 'hero' ? 'top' : id);
        });
      },
      { rootMargin: '-40% 0px -55% 0px' }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const handleSectionNav = useCallback(
    (e, sectionId) => {
      if (isModifiedClick(e)) return;
      if (e) e.preventDefault();
      const fromMenu = menuOpenRef.current;
      setMenuOpen(false);
      const targetUrl = sectionId === 'top' ? '/' : '/' + sectionId;
      if (window.location.pathname !== targetUrl || window.location.hash) {
        window.history.pushState({ section: sectionId }, '', targetUrl);
      }
      setActiveSection(sectionId);
      const go = () => {
        scrollToSection(sectionId, 'smooth');
        // Move focus with the scroll so keyboard and screen reader users land in the section.
        const el = sectionId === 'top' ? null : document.getElementById(sectionId);
        if (el) el.focus({ preventScroll: true });
      };
      // Let the drawer close (and hand focus back) before scrolling.
      if (fromMenu) requestAnimationFrame(() => requestAnimationFrame(go));
      else go();
    },
    [scrollToSection]
  );

  const navLink = (id, label, className) => (
    <a
      key={id}
      href={'/' + id}
      className={className}
      aria-current={activeSection === id ? 'true' : undefined}
      onClick={(e) => handleSectionNav(e, id)}
    >
      {label}
    </a>
  );

  return (
    <>
      <div className={s.promo} role="note">
        <div className={`container ${s.promoInner}`}>
          <span>
            <strong>First 3 months free on the yearly plan.</strong>{' '}
            <span className={s.promoMore}>Pay for 9 months, use Neario for 12.</span>
          </span>
          <a href="/pricing" className={s.promoLink} onClick={(e) => handleSectionNav(e, 'pricing')}>
            See pricing
            <ArrowRight aria-hidden="true" />
          </a>
        </div>
      </div>

      <header className={s.header}>
        <div className={`container ${s.headerInner}`}>
          <Logo onClick={(e) => handleSectionNav(e, 'top')} />

          <nav className={s.desktopNav} aria-label="Page sections">
            {DESKTOP_NAV.map((item) => navLink(item.id, item.label, s.navLink))}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- the demo needs a full page load */}
            <a href="/demo/overview" className={s.navLink}>
              Demo
            </a>
          </nav>

          <div className={s.headerActions}>
            <Link href="/login" className={`btn btn-ghost ${s.signIn}`}>
              Sign in
            </Link>
            <a href="/start" className={`btn btn-primary ${s.headerCta}`} onClick={(e) => handleSectionNav(e, 'start')}>
              <span className={s.ctaLong}>Get 3 months free</span>
              <span className={s.ctaShort}>Start free</span>
            </a>
            <button
              type="button"
              className={`btn btn-ghost btn-icon ${s.menuBtn}`}
              aria-label="Open menu"
              aria-haspopup="dialog"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(true)}
            >
              <Menu aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      <Modal open={menuOpen} onClose={() => setMenuOpen(false)} title="Menu" variant="drawer" closeLabel="Close menu">
        <nav aria-label="Site" className={s.drawerNav}>
          <ul className={s.drawerList}>
            {DRAWER_NAV.map((item) => (
              <li key={item.id}>{navLink(item.id, item.label, s.drawerLink)}</li>
            ))}
          </ul>
          <p className={s.drawerLabel}>Try it yourself</p>
          <ul className={s.drawerList}>
            <li>
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- the demo needs a full page load */}
              <a href="/demo/overview" className={s.drawerLink}>
                Dashboard demo
                <ArrowUpRight aria-hidden="true" />
              </a>
            </li>
            <li>
              <Link href="/feedback/demo-cafe-1" className={s.drawerLink} onClick={() => setMenuOpen(false)}>
                Try the customer page
                <ArrowUpRight aria-hidden="true" />
              </Link>
            </li>
            <li>
              <Link href="/login" className={s.drawerLink} onClick={() => setMenuOpen(false)}>
                Sign in
                <ArrowRight aria-hidden="true" />
              </Link>
            </li>
          </ul>
          <a href="/start" className="btn btn-primary btn-lg btn-block" onClick={(e) => handleSectionNav(e, 'start')}>
            Get 3 months free
          </a>
        </nav>
      </Modal>

      <main id="main" className={s.main}>
        {/* Hero */}
        <section id="hero" className={s.hero} aria-labelledby="hero-title">
          <div className={`container ${s.heroGrid}`}>
            <div className={s.heroCopy}>
              <p className="eyebrow">For salons, clinics, cafés and shops</p>
              <h1 id="hero-title" className={s.heroTitle}>
                Find out how every visit <span className={s.heroUnderline}>really</span> went.
              </h1>
              <p className={s.heroLead}>
                Customers scan a QR code or tap a stand at your counter, rate their visit in English, Hindi or Kannada,
                and add a note if they like. You read it all in one place, and every customer gets the same link to
                review you on Google.
              </p>
              <div className={s.heroActions}>
                <a href="/start" className="btn btn-primary btn-lg" onClick={(e) => handleSectionNav(e, 'start')}>
                  Get 3 months free
                  <ArrowRight aria-hidden="true" />
                </a>
                <a href="/how" className="btn btn-lg" onClick={(e) => handleSectionNav(e, 'how')}>
                  See how it works
                </a>
              </div>
              <ul className={s.heroFacts}>
                <li>No app for your customers</li>
                <li>₹599 a month, or ₹5,391 for the year</li>
                <li>No GST added</li>
              </ul>
            </div>
            <div className={s.heroVisual}>
              <HeroPhoneMockup />
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how" tabIndex={-1} className={s.section} aria-labelledby="how-title">
          <div className="container">
            <div className={s.splitHead}>
              <div>
                <p className="eyebrow">How it works</p>
                <h2 id="how-title" className={s.h2}>From a scan at the counter to a clear next step</h2>
              </div>
              <p className={s.splitHeadText}>
                Nothing for your customers to install. No spreadsheet for you. Your QR card works from the day it is
                printed.
              </p>
            </div>
            <Reveal as="ol" stagger className={s.steps}>
              {STEPS.map((step, i) => (
                <RevealItem as="li" key={step.title} className={s.step}>
                  <span className={s.stepNum} aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className={s.h3}>{step.title}</h3>
                  <p className={s.body}>{step.body}</p>
                </RevealItem>
              ))}
            </Reveal>
          </div>
        </section>

        {/* Features */}
        <section id="features" tabIndex={-1} className={`${s.section} ${s.sectionTint}`} aria-labelledby="features-title">
          <div className="container">
            <div className={s.featuresHead}>
              <p className="eyebrow">Features</p>
              <h2 id="features-title" className={s.h2}>Small enough to check between customers</h2>
            </div>
            <div className={s.featuresGrid}>
              <Reveal className={s.radarPanel}>
                <div className={s.radarPanelHead}>
                  <h3 className={s.h3}>Growth Radar</h3>
                  <span className="badge">Example</span>
                </div>
                <p className={s.body}>
                  Growth Radar reads the comments customers leave and groups them into themes: what people praise, what
                  keeps coming up, and what they ask for. Each theme shows the feedback behind it, so you can check it
                  yourself.
                </p>
                <ul className={s.radarList} aria-label="Example themes">
                  {RADAR_EXAMPLE.map((row) => (
                    <li key={row.text} className={s.radarRow} data-tone={row.tone}>
                      <span className={s.radarTag}>{row.label}</span>
                      <span className={s.radarText}>{row.text}</span>
                    </li>
                  ))}
                </ul>
                <p className={s.small}>Sample themes for illustration. Yours come from your own customers.</p>
              </Reveal>

              <Reveal as="ul" stagger className={s.featureList}>
                {FEATURES.map(({ icon: Icon, title, body }) => (
                  <RevealItem as="li" key={title} className={s.feature}>
                    <span className={s.featureIcon}>
                      <Icon aria-hidden="true" />
                    </span>
                    <div>
                      <h3 className={s.h4}>{title}</h3>
                      <p className={s.body}>{body}</p>
                    </div>
                  </RevealItem>
                ))}
              </Reveal>
            </div>
          </div>
        </section>

        {/* Honest reviews band */}
        <section id="honest" tabIndex={-1} className={s.band} aria-labelledby="honest-title">
          <div className={`container ${s.bandGrid}`}>
            <div>
              <p className={s.bandEyebrow}>No review gating</p>
              <h2 id="honest-title" className={s.bandTitle}>
                Every customer gets the same Google review link. Happy or not.
              </h2>
              <p className={s.bandText}>
                Some tools only send happy customers to Google. That is called review gating. Google’s policies do not
                allow it, and it makes reviews harder to trust. Neario does the opposite, so your profile stays safe and
                your reviews stay believable.
              </p>
            </div>
            <Reveal as="ul" stagger className={s.rules}>
              {HONEST_RULES.map((rule) => (
                <RevealItem as="li" key={rule.title} className={s.rule}>
                  <span className={s.ruleIcon}>
                    <Check aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className={s.ruleTitle}>{rule.title}</h3>
                    <p>{rule.body}</p>
                  </div>
                </RevealItem>
              ))}
            </Reveal>
          </div>
        </section>

        {/* Planned: Dineout */}
        <section id="dineout" tabIndex={-1} className={s.sectionSlim} aria-labelledby="dineout-title">
          <div className="container">
            <Reveal className={s.dineout}>
              <div className={s.dineoutHead}>
                <span className={s.dineoutIcon}>
                  <UtensilsCrossed aria-hidden="true" />
                </span>
                <div>
                  <div className={s.dineoutMeta}>
                    <p className="eyebrow">Planned with Neario Dineout</p>
                    <span className="badge badge-warn">Not available yet</span>
                  </div>
                  <h2 id="dineout-title" className={s.h3}>
                    One table QR: order first, feedback after.
                  </h2>
                  <p className={s.body}>
                    For restaurants and cafés, the same QR on the table could take a guest from ordering to a short
                    feedback page once the meal is done. Neario Dineout is the ordering side. This bundle is still being
                    planned and you cannot sign up for it yet.
                  </p>
                </div>
              </div>
              <ol className={s.flow} aria-label="Planned table QR flow">
                {DINEOUT_FLOW.map((step, i) => (
                  <li key={step.title} className={s.flowStep}>
                    <span className={s.flowNum} aria-hidden="true">
                      {i + 1}
                    </span>
                    <span>
                      <strong>{step.title}</strong>
                      {step.body}
                    </span>
                  </li>
                ))}
              </ol>
            </Reveal>
          </div>
        </section>

        {/* Agencies */}
        <section id="agencies" tabIndex={-1} className={s.section} aria-labelledby="agencies-title">
          <div className={`container ${s.agencyGrid}`}>
            <div className={s.agencyCopy}>
              <p className="eyebrow">For agencies</p>
              <h2 id="agencies-title" className={s.h2}>
                Look after every client’s feedback from one login
              </h2>
              <p className={s.lead}>
                Add the businesses you manage and move between them from one place. Each client has their own login
                and pays Neario directly, so there is nothing for you to invoice. Your agency’s name appears on the
                reports and QR cards you prepare, next to the Neario name.
              </p>
              <Reveal as="ol" stagger className={s.timeline}>
                {AGENCY_STEPS.map((step) => (
                  <RevealItem as="li" key={step.title} className={s.timelineItem}>
                    <strong>{step.title}</strong>
                    <span>{step.body}</span>
                  </RevealItem>
                ))}
              </Reveal>
              <p className={s.small}>
                Agencies follow the same Google rules as everyone: no review gating, the same Google link for every
                customer, and replies approved by the owner.{' '}
                <a
                  href="/start"
                  className={s.inlineLink}
                  onClick={(e) => {
                    setWho('agency');
                    handleSectionNav(e, 'start');
                  }}
                >
                  Tell us you are an agency
                </a>
              </p>
            </div>

            <Reveal className={s.qrCardWrap} delay={0.1}>
              <figure className={s.qrCard}>
                <figcaption className="visually-hidden">
                  Example of a printed QR card that shows your agency name next to the Neario name.
                </figcaption>
                <div aria-hidden="true">
                  <p className={s.qrCardBiz}>The Green House Salon</p>
                  <p className={s.qrCardAsk}>Tell us how your visit went</p>
                  <div className={s.qrGrid}>
                    {QR_CELLS.map((c, i) => (
                      <span key={i} data-on={c === '1' ? 'true' : undefined} />
                    ))}
                  </div>
                  <p className={s.qrCardLangs}>English · हिन्दी · ಕನ್ನಡ</p>
                  <div className={s.qrCardFoot}>
                    <span>
                      Prepared by <strong>Your Agency</strong>
                    </span>
                    <span>Neario ReviewFlow</span>
                  </div>
                </div>
              </figure>
              <span className={`badge ${s.qrBadge}`}>Example card</span>
            </Reveal>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" tabIndex={-1} className={`${s.section} ${s.sectionTint}`} aria-labelledby="pricing-title">
          <Pricing plan={plan} setPlan={setPlan} onStart={(e) => handleSectionNav(e, 'start')} />
        </section>

        {/* FAQ */}
        <section id="faq" tabIndex={-1} className={s.section} aria-labelledby="faq-title">
          <Faq />
        </section>

        {/* Sign up */}
        <section id="start" tabIndex={-1} className={`${s.section} ${s.startSection}`} aria-labelledby="start-title">
          <SignupForm plan={plan} setPlan={setPlan} who={who} setWho={setWho} />
        </section>
      </main>

      <SiteFooter onNav={handleSectionNav} />
    </>
  );
}
