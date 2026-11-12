import Link from 'next/link';
import Logo from '../components/ui/Logo';
import l from '../privacy/legal.module.css';

export const metadata = {
  title: 'Terms | Neario ReviewFlow',
  description: 'Terms of use for Neario ReviewFlow.',
};

const SECTIONS = [
  {
    id: 'what-neario-does',
    title: 'What Neario does',
    body: (
      <p>
        Neario gives a business a feedback page, a dashboard of the feedback it receives, insights based on that
        feedback, and help drafting replies to Google reviews.
      </p>
    ),
  },
  {
    id: 'plans',
    title: 'Plans and prices',
    body: (
      <>
        <ul>
          <li>
            <strong>Monthly:</strong> ₹599 a month, billed every month.
          </li>
          <li>
            <strong>Yearly:</strong> ₹5,391 in one bill for 12 months of use. This is 9 months paid, with the first 3
            months free.
          </li>
        </ul>
        <p>
          Prices are final. No GST is added at this time. If that changes, we will tell you before it applies to your
          next payment.
        </p>
      </>
    ),
  },
  {
    id: 'refunds',
    title: 'Refunds',
    body: (
      <p>
        On the yearly plan, ask within 7 days of paying and we refund the full ₹5,391. After 7 days the yearly payment
        is not refundable.
      </p>
    ),
  },
  {
    id: 'google-rules',
    title: 'Google review rules you agree to follow',
    body: (
      <>
        <p>Google’s policies protect honest reviews, and you agree to follow them. When you use Neario you will:</p>
        <ul>
          <li>Give every customer the same chance to leave a Google review, whatever their rating.</li>
          <li>Not offer money, discounts or free items in exchange for a review, or for changing or removing one.</li>
          <li>
            Not ask staff to collect a set number of reviews, or reviews that say something specific, such as a staff
            member’s name.
          </li>
          <li>Not pressure customers to rate or review while they are in your premises.</li>
          <li>Not write reviews yourself or on behalf of customers.</li>
        </ul>
        <p>We may suspend an account that breaks these rules, because it can put your Google profile at risk.</p>
      </>
    ),
  },
  {
    id: 'responsibilities',
    title: 'Your responsibilities',
    body: (
      <ul>
        <li>Keep your login private and tell us if it is misused.</li>
        <li>
          Only collect feedback and phone numbers in line with our <Link href="/privacy">Privacy</Link> page and the
          law.
        </li>
        <li>Do not use Neario to harass customers or to publish false or unlawful content.</li>
      </ul>
    ),
  },
  {
    id: 'agencies',
    title: 'Agencies and their clients',
    body: (
      <ul>
        <li>An agency can add businesses it manages to Neario. It must have each owner’s permission first.</li>
        <li>Every business gets its own login and pays Neario directly. The agency is not billed for its clients.</li>
        <li>The agency can see its clients’ dashboards and feedback, and its name appears on reports and QR cards.</li>
        <li>Agencies follow the same Google review rules as every other customer.</li>
      </ul>
    ),
  },
  {
    id: 'suggestions',
    title: 'Insights and replies are suggestions',
    body: (
      <p>
        The insights, trends and reply drafts are generated to help you. Please read them and use your own judgement
        before acting on them or posting a reply.
      </p>
    ),
  },
  {
    id: 'ending',
    title: 'Ending your account',
    body: (
      <p>
        You can stop using Neario at any time. We may suspend or close an account that breaks these terms. When an
        account closes, its data is deleted within a reasonable period after closure. You can ask us to delete it
        sooner.
      </p>
    ),
  },
  {
    id: 'limits',
    title: 'Limits',
    body: (
      <p>
        We work to keep Neario available, but we cannot promise it will never be interrupted. To the extent the law
        allows, our responsibility to you is limited to the amount you paid in the 12 months before the problem.
      </p>
    ),
  },
];

export default function TermsPage() {
  return (
    <div className={l.page}>
      <header className={l.header}>
        <div className={`container ${l.headerInner}`}>
          <Logo />
          <nav aria-label="Site" className={l.headerNav}>
            <Link href="/" className={`${l.headerLink} ${l.hideSmall}`}>
              Home
            </Link>
            <Link href="/privacy" className={l.headerLink}>
              Privacy
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
            <h1 className={l.title}>Terms</h1>
            <p className={l.updated}>
              Last updated: <time dateTime="2026-11-05">5 November 2026</time>
            </p>
            <p className={l.intro}>
              These terms apply when a business signs up for Neario ReviewFlow. By using it you agree to them.
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
              <Link href="/privacy">Privacy</Link>
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
