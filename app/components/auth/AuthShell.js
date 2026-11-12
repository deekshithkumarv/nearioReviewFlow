import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import Logo from '../ui/Logo';
import s from './auth.module.css';

const POINTS = [
  'Customers scan your QR code and rate their visit in English, Hindi or Kannada.',
  'Their feedback comes to you privately, so you can see what to fix next.',
  'Every customer is offered the same Google review link, whatever their rating.',
];

// Split layout for sign-in style pages: a quiet brand panel on wide screens, the form on the right.
// The page passes its own heading and form as children; this renders the one <main id="main">.
export default function AuthShell({ children, topAction }) {
  return (
    <div className={s.shell}>
      <aside className={s.brand} aria-label="About Neario ReviewFlow">
        <Logo tone="light" size={34} />
        <div className={s.brandBody}>
          <p className={s.brandLine}>Feedback from your counter, straight to you.</p>
          <ol className={s.points}>
            {POINTS.map((p, i) => (
              <li key={p}>
                <span className={s.pointNum} aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                <span>{p}</span>
              </li>
            ))}
          </ol>
        </div>
        <figure className={s.sample} aria-label="Sample of the customer feedback screen">
          <span className={s.sampleTag}>Sample</span>
          <p className={s.sampleQ}>How was your visit?</p>
          <div className={s.sampleStars} aria-hidden="true">
            {[1, 2, 3, 4, 5].map((n) => (
              <svg key={n} viewBox="0 0 24 24" width="22" height="22">
                <path
                  d="M12 2.8l2.8 5.7 6.3.9-4.55 4.43 1.07 6.27L12 17.13 6.38 20.1l1.07-6.27L2.9 9.4l6.3-.9z"
                  fill={n <= 4 ? 'var(--accent)' : 'none'}
                  stroke={n <= 4 ? 'var(--accent)' : 'var(--band-muted)'}
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
            ))}
          </div>
          <figcaption className={s.sampleCap}>What customers see after scanning your QR code</figcaption>
        </figure>
      </aside>

      <div className={s.side}>
        <header className={s.top}>
          <span className={s.mobileLogo}>
            <Logo size={30} />
          </span>
          <span className={s.topLinks}>
            {topAction || (
              <Link href="/" className="btn btn-ghost btn-sm">
                <ArrowLeft aria-hidden="true" />
                Back to home
              </Link>
            )}
          </span>
        </header>
        <main id="main" className={s.main}>
          <div className={s.panel}>{children}</div>
        </main>
        <footer className={s.foot}>
          <Link href="/privacy">Privacy</Link>
          <span aria-hidden="true">·</span>
          <span>Neario ReviewFlow</span>
        </footer>
      </div>
    </div>
  );
}
