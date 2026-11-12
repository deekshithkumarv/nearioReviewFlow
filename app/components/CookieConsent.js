'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Neario only sets one strictly necessary cookie (the sign-in session), so there is nothing to opt in to.
// This is a one-time notice, not a consent form.
const KEY = 'neario_cookie_notice_seen';

export default function CookieConsent() {
  const pathname = usePathname() || '/';
  const [show, setShow] = useState(false);
  // Not on the customer page or the demo (it would cover the form), nor on signed-in tools (it would cover controls).
  const hidden = ['/feedback', '/demo', '/dashboard', '/admin', '/onboarding'].some((p) => pathname.startsWith(p));

  useEffect(() => {
    try {
      setShow(!window.localStorage.getItem(KEY));
    } catch {
      setShow(false);
    }
  }, []);

  if (!show || hidden) return null;

  function dismiss() {
    try { window.localStorage.setItem(KEY, '1'); } catch { /* storage blocked: just hide for this visit */ }
    setShow(false);
  }

  return (
    <div className="cookie-note" role="region" aria-label="Cookie notice">
      <p>
        We only use a cookie to keep you signed in. No tracking, no ads. <Link href="/privacy#cookies">Privacy</Link>
      </p>
      <button type="button" className="cookie-note-btn" onClick={dismiss}>
        Got it
      </button>
    </div>
  );
}
