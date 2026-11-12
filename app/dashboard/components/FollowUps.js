import { CheckCircle2, Info, Phone, MessageSquareText } from 'lucide-react';
import EmptyState from '../../components/ui/EmptyState';
import Reveal from '../../components/ui/Reveal';
import s from '../dashboard.module.css';
import { FeedbackItem, FeedbackSkeleton, FeedbackError } from './FeedbackItem';

export default function FollowUps({ biz, stats, list, loadingList, error, onRetry }) {
  const low = list.filter((f) => f.rating <= 3);
  const reachable = low.filter((f) => f.contact_ok && f.phone);
  const other = low.filter((f) => !(f.contact_ok && f.phone));

  return (
    <Reveal>
      <div className={s.pageHead}>
        <div className={s.pageHeadText}>
          <h1 className={s.pageTitle}>Follow-ups</h1>
          <p className={s.pageSub}>
            Feedback rated 3 stars or below. Customers who left a phone number agreed to be contacted, so start with them.
            {stats.capped ? ` From the latest ${stats.n} entries.` : ''}
          </p>
        </div>
      </div>

      <div className={s.stack}>
        <div className="alert alert-info" role="note">
          <Info aria-hidden="true" />
          <span>
            Call to understand what went wrong and put it right. Please don&rsquo;t ask customers to change or remove a review, and don&rsquo;t offer
            discounts or gifts in return for a better rating.
          </span>
        </div>

        {error ? (
          <div className={s.panel}>
            <FeedbackError name={biz.name} onRetry={onRetry} />
          </div>
        ) : loadingList ? (
          <div className={s.panel}>
            <FeedbackSkeleton rows={3} />
          </div>
        ) : low.length === 0 ? (
          <div className={s.panel}>
            <EmptyState icon={CheckCircle2} title="Nothing to follow up">
              {list.length === 0
                ? 'Once customers start leaving feedback, any rating of 3 stars or below will show up here.'
                : 'No recent feedback is rated 3 stars or below.'}
            </EmptyState>
          </div>
        ) : (
          <>
            {reachable.length > 0 && (
              <section aria-labelledby="fu-call">
                <h2 id="fu-call" className={s.sectionTitle}>
                  <Phone aria-hidden="true" width={18} height={18} />
                  Can be contacted ({reachable.length})
                </h2>
                <ul className={`${s.panel} ${s.fbList} ${s.clip}`}>
                  {reachable.map((f) => (
                    <FeedbackItem key={f.id} f={f} className={`${s.followItem} ${s.followItemContact}`} />
                  ))}
                </ul>
              </section>
            )}
            {other.length > 0 && (
              <section aria-labelledby="fu-other">
                <h2 id="fu-other" className={s.sectionTitle}>
                  <MessageSquareText aria-hidden="true" width={18} height={18} />
                  No contact details ({other.length})
                </h2>
                <ul className={`${s.panel} ${s.fbList} ${s.clip}`}>
                  {other.map((f) => (
                    <FeedbackItem key={f.id} f={f} className={s.followItem} />
                  ))}
                </ul>
              </section>
            )}
          </>
        )}
      </div>
    </Reveal>
  );
}
