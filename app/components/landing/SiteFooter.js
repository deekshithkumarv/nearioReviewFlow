'use client';

import Link from 'next/link';
import Logo from '../ui/Logo';
import s from './landing.module.css';

// onNav(e, sectionId) keeps section links on the same page (pushState + smooth scroll).
export default function SiteFooter({ onNav }) {
  const section = (id, label) => (
    <li>
      <a href={'/' + id} onClick={(e) => onNav(e, id)}>
        {label}
      </a>
    </li>
  );

  return (
    <footer className={s.footer}>
      <div className="container">
        <div className={s.footerGrid}>
          <div className={s.footerBrand}>
            <Logo tone="light" onClick={(e) => onNav(e, 'top')} />
            <p>
              QR and tap-stand feedback for local businesses in India. Customers rate their visit in their own
              language, you read what they said, and every customer gets the same Google review link.
            </p>
            <p className={s.footerLangs}>
              English · हिन्दी · ಕನ್ನಡ
            </p>
          </div>

          <nav className={s.footerCol} aria-labelledby="footer-product">
            <h2 id="footer-product">Product</h2>
            <ul>
              {section('how', 'How it works')}
              {section('features', 'Features')}
              {section('pricing', 'Pricing')}
              <li>
                {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- the demo needs a full page load */}
                <a href="/demo/overview">Dashboard demo</a>
              </li>
              <li>
                <Link href="/feedback/demo-cafe-1">Try the customer page</Link>
              </li>
            </ul>
          </nav>

          <nav className={s.footerCol} aria-labelledby="footer-business">
            <h2 id="footer-business">For businesses</h2>
            <ul>
              {section('honest', 'Honest reviews')}
              {section('agencies', 'For agencies')}
              {section('start', 'Get 3 months free')}
            </ul>
          </nav>

          <nav className={s.footerCol} aria-labelledby="footer-company">
            <h2 id="footer-company">Company</h2>
            <ul>
              {section('faq', 'FAQ')}
              <li>
                <Link href="/privacy">Privacy</Link>
              </li>
              <li>
                <Link href="/terms">Terms</Link>
              </li>
              <li>
                <Link href="/login">Sign in</Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className={s.footerBottom}>
          <p>© 2026 Neario ReviewFlow</p>
          <p>₹599 a month or ₹5,391 a year · No GST added</p>
        </div>
      </div>
    </footer>
  );
}
