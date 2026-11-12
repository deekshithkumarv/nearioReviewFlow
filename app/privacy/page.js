import Link from 'next/link';
import Logo from '../components/ui/Logo';
import l from './legal.module.css';

export const metadata = {
  title: 'Privacy | Neario ReviewFlow',
  description: 'How Neario ReviewFlow handles feedback and personal data.',
};

const SECTIONS = [
  {
    id: 'people',
    title: 'Two kinds of people',
    body: (
      <p>
        <strong>Customers</strong> leave feedback for a business. <strong>Business owners</strong> use Neario to read
        that feedback. This page covers both.
      </p>
    ),
  },
  {
    id: 'customers',
    title: 'What a customer shares',
    body: (
      <>
        <ul>
          <li>A star rating, the service they picked, and any comment they type.</li>
          <li>The language they chose for the feedback page, and the date and time they sent it.</li>
          <li>A phone number, only if they type one in and tick the box that lets the business contact them.</li>
        </ul>
        <p>We do not ask customers to create an account.</p>
      </>
    ),
  },
  {
    id: 'why',
    title: 'Why we use it',
    body: (
      <>
        <ul>
          <li>To show the feedback to the business that was reviewed, so it can improve.</li>
          <li>To create the business’s charts, trends and suggestions.</li>
          <li>To contact the customer about their feedback, only if they gave a number and agreed.</li>
        </ul>
        <p>We do not sell customer feedback or phone numbers.</p>
      </>
    ),
  },
  {
    id: 'google',
    title: 'Google reviews are separate',
    body: (
      <p>
        Feedback sent through Neario is private feedback. It is not a Google review. After sending feedback, every
        customer sees the same option to write a Google review, whatever their rating. Customers write and post Google
        reviews themselves, on Google.
      </p>
    ),
  },
  {
    id: 'owners',
    title: 'What a business owner shares',
    body: (
      <p>
        Name, email, business details, services, locations, and a Google Business Profile connection if the owner
        chooses to connect one. Billing details are handled by our payment provider.
      </p>
    ),
  },
  {
    id: 'who-can-see',
    title: 'Who can see it',
    body: (
      <ul>
        <li>The business that received the feedback, and its team members.</li>
        <li>The agency that manages that business on Neario, if there is one.</li>
        <li>The small set of service providers that run Neario for us, such as hosting and payments.</li>
        <li>Anyone the law requires us to share it with.</li>
      </ul>
    ),
  },
  {
    id: 'agencies',
    title: 'Agencies',
    body: (
      <p>
        Some businesses are looked after by a marketing agency that uses Neario. When that happens, the agency can see
        that business’s dashboard and the feedback it receives, including any name or phone number a customer chose to
        share. Each business still has its own login, and the agency’s name appears on reports and QR cards. Agencies
        can only see the businesses they manage, never another agency’s. An agency must have the business owner’s
        permission before it is added.
      </p>
    ),
  },
  {
    id: 'security',
    title: 'Security',
    body: (
      <p>
        We use encrypted connections and limit who on our team can open client data. No online service can promise
        perfect security.
      </p>
    ),
  },
  {
    id: 'cookies',
    title: 'Cookies',
    body: (
      <p>
        We use a strictly necessary sign-in cookie (<code>neario_session</code>) for logged-in businesses and agencies,
        and nothing else. We do not use analytics, advertising or tracking cookies. Your browser also remembers that you
        have seen our cookie notice, using local storage on your device.
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <div className={l.page}>
      <header className={l.header}>
        <div className={`container ${l.headerInner}`}>
          <Logo />
          <nav aria-label="Site" className={l.headerNav}>
            <Link href="/" className={`${l.headerLink} ${l.hideSmall}`}>
              Home
            </Link>
            <Link href="/terms" className={l.headerLink}>
              Terms
            </Link>
            <Link href="/login" className="btn btn-sm">
              Sign in
            </Link>
          </nav>
        </div>
      </header>

      <main id="main" className={`container ${l.main}`}>
        <div className={l.layout}>
          <aside className={l.toc}>
            <nav aria-labelledby="toc-title">
              <p id="toc-title" className={l.tocTitle}>
                On this page
              </p>
              <ol className={l.tocList}>
                {SECTIONS.map((sec) => (
                  <li key={sec.id}>
                    <a href={`#${sec.id}`}>{sec.title}</a>
                  </li>
                ))}
              </ol>
            </nav>
          </aside>

          <article className={l.doc}>
            <p className="eyebrow">Legal</p>
            <h1 className={l.title}>Privacy</h1>
            <p className={l.updated}>
              Last updated: <time dateTime="2026-11-05">5 November 2026</time>
            </p>
            <p className={l.intro}>
              Neario ReviewFlow helps local businesses collect feedback from their customers. This page explains what we
              collect, why, and how you can have it removed.
            </p>
            <p className={l.todo}>
              <span className={l.todoTag}>To do</span>
              Contact: [support email to be added]
            </p>

            {SECTIONS.map((sec) => (
              <section key={sec.id} id={sec.id} className={l.section} aria-labelledby={`${sec.id}-title`}>
                <h2 id={`${sec.id}-title`}>{sec.title}</h2>
                {sec.body}
              </section>
            ))}
          </article>
        </div>
      </main>

      <footer className={l.footer}>
        <div className={`container ${l.footerInner}`}>
          <span>© 2026 Neario ReviewFlow</span>
          <ul className={l.footerLinks}>
            <li>
              <Link href="/">Home</Link>
            </li>
            <li>
              <Link href="/terms">Terms</Link>
            </li>
            <li>
              <Link href="/faq">FAQ</Link>
            </li>
            <li>
              <Link href="/login">Sign in</Link>
            </li>
          </ul>
        </div>
      </footer>
    </div>
  );
}
