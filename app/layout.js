import './globals.css';
import { Bricolage_Grotesque, Instrument_Sans } from 'next/font/google';
import { ToastHost } from './components/ui/Toast';
import CookieConsent from './components/CookieConsent';
import { SITE_URL, SITE_NAME } from '../lib/site';

// Self-hosted at build time by next/font: no render-blocking request to Google, no layout shift.
const display = Bricolage_Grotesque({ subsets: ['latin'], variable: '--font-bricolage', display: 'optional', axes: ['opsz'] });
// 'optional': the preloaded font is used when it arrives in time (and always once cached); otherwise the
// fallback stays for that visit. A late swap would reflow the hero and hurt LCP and layout stability.
const body = Instrument_Sans({ subsets: ['latin'], variable: '--font-instrument', display: 'optional' });

const DESCRIPTION =
  'QR and tap-stand feedback for salons, clinics, cafés and shops in India. Customers rate their visit in English, Hindi or Kannada, every customer gets the same Google review link, and you see what to fix next.';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME} · Customer feedback and Google reviews for local businesses`, template: `%s · ${SITE_NAME}` },
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  alternates: { canonical: '/' },
  openGraph: { type: 'website', siteName: SITE_NAME, title: SITE_NAME, description: DESCRIPTION, url: '/', locale: 'en_IN' },
  twitter: { card: 'summary', title: SITE_NAME, description: DESCRIPTION },
};

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f6f3ec' },
    { media: '(prefers-color-scheme: dark)', color: '#0d1410' },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en-IN" className={`${display.variable} ${body.variable}`}>
      <body>
        <a href="#main" className="skip-link">Skip to content</a>
        {children}
        <ToastHost />
        <CookieConsent />
      </body>
    </html>
  );
}

