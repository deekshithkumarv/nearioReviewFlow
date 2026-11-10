'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { showToast } from './Toast';

export const CONSENT_KEY = 'neario_cookie_consent';
const CONSENT_VERSION = '1.0';
const MAX_AGE_SECONDS = 60 * 60 * 24 * 180; // 180 days

function parseConsentCookie() {
  if (typeof document === 'undefined') return null;
  const parts = document.cookie.split(';');
  for (const part of parts) {
    const idx = part.indexOf('=');
    if (idx <= 0) continue;
    const k = part.slice(0, idx).trim();
    if (k !== CONSENT_KEY) continue;
    try {
      const parsed = JSON.parse(decodeURIComponent(part.slice(idx + 1).trim()));
      if (parsed && typeof parsed === 'object' && parsed.version) return parsed;
    } catch {
      return null;
    }
  }
  try {
    const ls = window.localStorage.getItem(CONSENT_KEY);
    if (ls) {
      const parsed = JSON.parse(ls);
      if (parsed && typeof parsed === 'object' && parsed.version) return parsed;
    }
  } catch {}
  return null;
}

function persistConsent(prefs) {
  const payload = {
    version: CONSENT_VERSION,
    necessary: true,
    preferences: Boolean(prefs.preferences),
    analytics: Boolean(prefs.analytics),
    updatedAt: new Date().toISOString(),
  };
  const encoded = encodeURIComponent(JSON.stringify(payload));
  const secure = typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${CONSENT_KEY}=${encoded}; Path=/; SameSite=Lax; Max-Age=${MAX_AGE_SECONDS}${secure}`;
  try {
    window.localStorage.setItem(CONSENT_KEY, JSON.stringify(payload));
  } catch {}
  if (typeof document !== 'undefined') {
    document.documentElement.dataset.cookiePreferences = String(payload.preferences);
    document.documentElement.dataset.cookieAnalytics = String(payload.analytics);
    window.dispatchEvent(new CustomEvent('neario:cookie-consent', { detail: payload }));
  }
  return payload;
}

export function openCookieSettings() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('neario:open-cookie-settings'));
  }
}

export function CookieSettingsButton({ className = '', style = {}, children = 'Cookie Settings' }) {
  return (
    <button
      type="button"
      className={className}
      style={style}
      onClick={() => openCookieSettings()}
    >
      {children}
    </button>
  );
}

export default function CookieConsent() {
  const pathname = usePathname() || '/';
  const [hydrated, setHydrated] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [preferencesOn, setPreferencesOn] = useState(false);
  const [analyticsOn, setAnalyticsOn] = useState(false);

  // Skip customer QR feedback view and static demo loader so we never obstruct mobile QR rating taps.
  const isHiddenRoute = pathname.startsWith('/feedback') || pathname.startsWith('/demo');

  useEffect(() => {
    const saved = parseConsentCookie();
    if (saved) {
      setPreferencesOn(Boolean(saved.preferences));
      setAnalyticsOn(Boolean(saved.analytics));
      document.documentElement.dataset.cookiePreferences = String(Boolean(saved.preferences));
      document.documentElement.dataset.cookieAnalytics = String(Boolean(saved.analytics));
      setShowBanner(false);
    } else {
      setShowBanner(true);
    }
    setHydrated(true);

    const onOpenSettings = () => {
      const current = parseConsentCookie();
      if (current) {
        setPreferencesOn(Boolean(current.preferences));
        setAnalyticsOn(Boolean(current.analytics));
      }
      setShowModal(true);
    };
    window.addEventListener('neario:open-cookie-settings', onOpenSettings);
    return () => window.removeEventListener('neario:open-cookie-settings', onOpenSettings);
  }, []);

  if (!hydrated || isHiddenRoute) return null;

  function handleAcceptAll() {
    persistConsent({ preferences: true, analytics: true });
    setPreferencesOn(true);
    setAnalyticsOn(true);
    setShowBanner(false);
    setShowModal(false);
    showToast('Cookie preferences saved (all accepted).');
  }

  function handleRejectOptional() {
    persistConsent({ preferences: false, analytics: false });
    setPreferencesOn(false);
    setAnalyticsOn(false);
    setShowBanner(false);
    setShowModal(false);
    showToast('Optional cookies rejected. Only essential cookies are active.');
  }

  function handleSaveCustom() {
    persistConsent({ preferences: preferencesOn, analytics: analyticsOn });
    setShowBanner(false);
    setShowModal(false);
    showToast('Cookie preferences updated.');
  }

  return (
    <>
      {showBanner && !showModal && (
        <div
          className="cookie-banner"
          id="cookie-banner"
          role="region"
          aria-label="Cookie consent"
        >
          <div className="cookie-banner-copy">
            <div className="cookie-banner-title">
              <span className="cookie-badge" aria-hidden="true">🍪</span>
              <b>We value your privacy</b>
            </div>
            <p>
              Neario ReviewFlow uses strictly necessary cookies for secure sign-in and optional cookies to remember preferences and improve our service.{' '}
              <Link href="/privacy">Read our Privacy Policy</Link>.
            </p>
          </div>

          <div className="cookie-banner-actions">
            <button
              type="button"
              className="cookie-link-btn"
              onClick={() => setShowModal(true)}
            >
              Manage preferences
            </button>
            <button
              type="button"
              className="btn s btn-sm"
              onClick={handleRejectOptional}
            >
              Reject non-essential
            </button>
            <button
              type="button"
              className="btn p btn-sm"
              onClick={handleAcceptAll}
            >
              Accept all
            </button>
          </div>
        </div>
      )}

      {showModal && (
        <div
          className="cookie-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
        >
          <div className="cookie-modal card">
            <div className="cookie-modal-head">
              <div>
                <h2 id="cookie-modal-title">Cookie Preferences</h2>
                <p>Choose which cookies Neario ReviewFlow may store in your browser.</p>
              </div>
              <button
                type="button"
                className="cookie-close-x"
                aria-label="Close cookie preferences"
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="cookie-cats">
              <div className="cookie-cat">
                <div className="cookie-cat-info">
                  <div className="cookie-cat-title">
                    <b>Strictly Necessary Cookies</b>
                    <span className="cookie-always-on">Always active</span>
                  </div>
                  <p>
                    Essential for authentication (<code>neario_session</code>), CSRF protection, and remembering your consent choice (<code>neario_cookie_consent</code>).
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked="true"
                  aria-label="Strictly Necessary Cookies"
                  disabled
                  className="cookie-switch on locked"
                >
                  <span className="cookie-switch-thumb" />
                </button>
              </div>

              <div className="cookie-cat">
                <div className="cookie-cat-info">
                  <div className="cookie-cat-title">
                    <b>Preferences</b>
                  </div>
                  <p>
                    Remembers helpful choices such as your selected plan tier or preferred view settings across visits.
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={preferencesOn}
                  aria-label="Toggle Preference Cookies"
                  className={`cookie-switch ${preferencesOn ? 'on' : ''}`}
                  onClick={() => setPreferencesOn((v) => !v)}
                >
                  <span className="cookie-switch-thumb" />
                </button>
              </div>

              <div className="cookie-cat">
                <div className="cookie-cat-info">
                  <div className="cookie-cat-title">
                    <b>Analytics</b>
                  </div>
                  <p>
                    Helps us measure aggregate page performance and sign-up flow quality without selling personal data.
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={analyticsOn}
                  aria-label="Toggle Analytics Cookies"
                  className={`cookie-switch ${analyticsOn ? 'on' : ''}`}
                  onClick={() => setAnalyticsOn((v) => !v)}
                >
                  <span className="cookie-switch-thumb" />
                </button>
              </div>
            </div>

            <div className="cookie-modal-foot">
              <button type="button" className="btn s btn-sm" onClick={handleRejectOptional}>
                Reject non-essential
              </button>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button type="button" className="btn s btn-sm" onClick={handleSaveCustom}>
                  Save preferences
                </button>
                <button type="button" className="btn p btn-sm" onClick={handleAcceptAll}>
                  Accept all
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

