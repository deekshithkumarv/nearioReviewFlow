import Link from 'next/link';
import { Star, ExternalLink, MessageSquareText, QrCode as QrIcon, CheckCircle2, Circle, ArrowRight, Settings } from 'lucide-react';
import EmptyState from '../../components/ui/EmptyState';
import Reveal from '../../components/ui/Reveal';
import s from '../dashboard.module.css';
import { FeedbackItem, FeedbackSkeleton, FeedbackError } from './FeedbackItem';
import { ratingCounts, topTags } from './format';

export function StatStrip({ stats, loadingList, label }) {
  const hasAny = stats.total > 0;
  const scope = stats.capped ? `of the latest ${stats.n}` : 'of all feedback';
  return (
    <section aria-label={label} className={s.statStrip}>
      <div className={s.stat}>
        <span className={s.statLabel}>Feedback received</span>
        <span className={s.statValue}>{stats.total.toLocaleString('en-IN')}</span>
        <span className={s.statNote}>All time</span>
      </div>
      <div className={s.stat}>
        <span className={s.statLabel}>Average rating</span>
        <span className={s.statValue}>
          {hasAny ? (
            <>
              {stats.avg}
              <Star aria-hidden="true" />
              <span className="visually-hidden"> out of 5</span>
            </>
          ) : (
            '–'
          )}
        </span>
        <span className={s.statNote}>{hasAny ? 'Out of 5, all time' : 'No ratings yet'}</span>
      </div>
      <div className={s.stat}>
        <span className={s.statLabel}>Rated 4–5</span>
        {loadingList ? (
          <span className={`skeleton ${s.statSkel}`} />
        ) : (
          <span className={s.statValue}>{stats.n ? `${stats.sat}%` : '–'}</span>
        )}
        <span className={s.statNote}>{stats.n ? `${stats.high} ${scope}` : 'Share of happy customers'}</span>
      </div>
      <div className={s.stat}>
        <span className={s.statLabel}>Need follow-up</span>
        {loadingList ? (
          <span className={`skeleton ${s.statSkel}`} />
        ) : (
          <span className={`${s.statValue} ${stats.low > 0 ? s.statValueWarn : ''}`}>{stats.n ? stats.low : '–'}</span>
        )}
        <span className={s.statNote}>Rated 3 or below{stats.capped ? ', latest 500' : ''}</span>
      </div>
    </section>
  );
}

export function RatingDistribution({ list }) {
  const counts = ratingCounts(list);
  const n = list.length;
  return (
    <ul className={s.dist}>
      {[5, 4, 3, 2, 1].map((r) => {
        const pct = n ? Math.round((counts[r] / n) * 100) : 0;
        return (
          <li key={r} className={s.distRow}>
            <span className={s.distLabel}>
              {r}
              <Star aria-hidden="true" />
              <span className="visually-hidden"> stars:</span>
            </span>
            <span className={s.bar} aria-hidden="true">
              <span className={`${s.barFill} ${r <= 3 ? s.barFillLow : ''}`} style={{ width: `${pct}%`, display: 'block' }} />
            </span>
            <span className={s.distCount}>
              {counts[r]} <span aria-hidden="true">·</span> {pct}%
            </span>
          </li>
        );
      })}
    </ul>
  );
}

export function TagCounts({ list }) {
  const tags = topTags(list);
  if (!tags.length) {
    return <p className={s.mutedText}>Customers haven&rsquo;t picked any topics yet. Topics they choose on the feedback page show up here.</p>;
  }
  const max = tags[0].count;
  return (
    <ol className={s.tagList}>
      {tags.map(({ tag, count }) => (
        <li key={tag} className={s.tagRow}>
          <span className={s.tagName} title={tag}>
            {tag}
          </span>
          <span className={s.bar} aria-hidden="true">
            <span className={s.barFill} style={{ width: `${Math.round((count / max) * 100)}%`, display: 'block' }} />
          </span>
          <span className={s.tagCount}>
            {count}
            <span className="visually-hidden"> mentions</span>
          </span>
        </li>
      ))}
    </ol>
  );
}

function SetupChecklist({ biz, canEdit }) {
  const items = [
    { done: Boolean(biz.onboarded_at), label: 'Business details and services' },
    { done: Boolean(biz.google_review_url), label: 'Google review link' },
    { done: (biz.feedback_count || 0) > 0, label: 'First customer feedback' },
  ];
  const doneCount = items.filter((i) => i.done).length;
  return (
    <section className={s.setup} aria-labelledby="setup-title">
      <div>
        <h2 id="setup-title">Finish setting up {biz.name}</h2>
        <p className={s.setupMeta}>
          {doneCount} of {items.length} done. The feedback page offers every customer your Google review link, so add it before you put the QR card out.
        </p>
        <ul className={s.checkList}>
          {items.map((i) => (
            <li key={i.label} className={i.done ? s.checkDone : undefined}>
              {i.done ? <CheckCircle2 aria-hidden="true" /> : <Circle aria-hidden="true" />}
              <span>
                {i.label}
                <span className="visually-hidden">{i.done ? ' (done)' : ' (to do)'}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
      {canEdit && (
        <Link href={`/onboarding?b=${biz.id}`} className="btn">
          <Settings aria-hidden="true" />
          Open setup
        </Link>
      )}
    </section>
  );
}

export function NoFeedbackYet({ biz, onGoQr }) {
  return (
    <EmptyState
      icon={MessageSquareText}
      title="No feedback yet"
      action={
        <div className={s.btnRow} style={{ justifyContent: 'center' }}>
          <button type="button" className="btn btn-primary" onClick={onGoQr}>
            <QrIcon aria-hidden="true" />
            Get your QR card
          </button>
          <Link className="btn" href={`/feedback/${biz.id}`} target="_blank" rel="noopener noreferrer">
            <ExternalLink aria-hidden="true" />
            Open customer page
            <span className="visually-hidden"> (opens in a new tab)</span>
          </Link>
        </div>
      }
    >
      When customers scan your QR card and rate their visit, their feedback appears here. Try the customer page yourself to see what they see.
    </EmptyState>
  );
}

export default function Overview({ biz, stats, list, loadingList, error, onRetry, onNavigate, canEdit, headActions }) {
  const needsSetup = !biz.google_review_url || !biz.onboarded_at;
  const recent = list.slice(0, 5);
  const capNote = stats.capped ? `Based on the latest ${stats.n} of ${stats.total}.` : null;
  const empty = !loadingList && !error && list.length === 0;

  return (
    <Reveal className={s.stack}>
      <div className={s.pageHead} style={{ marginBottom: 0 }}>
        <div className={s.pageHeadText}>
          <p className="eyebrow">{[biz.type, biz.city].filter(Boolean).join(' · ') || 'Overview'}</p>
          <h1 className={s.pageTitle}>{biz.name}</h1>
        </div>
        <div className={s.pageActions}>{headActions}</div>
      </div>

      <StatStrip stats={stats} loadingList={loadingList} label="Key numbers" />

      {needsSetup && <SetupChecklist biz={biz} canEdit={canEdit} />}

      {error ? (
        <div className={s.panel}>
          <FeedbackError name={biz.name} onRetry={onRetry} />
        </div>
      ) : empty ? (
        <div className={s.panel}>
          <NoFeedbackYet biz={biz} onGoQr={() => onNavigate('qr')} />
        </div>
      ) : (
        <div className={s.overviewGrid}>
          <section className={s.panel} aria-labelledby="recent-title">
            <div className={s.panelHead}>
              <h2 id="recent-title">Recent feedback</h2>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => onNavigate('feedback')}>
                See all
                <ArrowRight aria-hidden="true" />
              </button>
            </div>
            {loadingList ? (
              <FeedbackSkeleton rows={4} />
            ) : (
              <ul className={s.fbList}>
                {recent.map((f) => (
                  <FeedbackItem key={f.id} f={f} />
                ))}
              </ul>
            )}
          </section>

          <div className={s.sideCol}>
            <section className={s.panel} aria-labelledby="dist-title">
              <div className={s.panelHead}>
                <h2 id="dist-title">Ratings</h2>
              </div>
              <div className={s.panelBody}>
                {loadingList ? (
                  <div aria-busy="true" aria-label="Loading ratings" style={{ display: 'grid', gap: 14 }}>
                    {[0, 1, 2, 3, 4].map((i) => (
                      <span key={i} className="skeleton" style={{ height: 12 }} />
                    ))}
                  </div>
                ) : (
                  <RatingDistribution list={list} />
                )}
              </div>
              {capNote && !loadingList && <p className={s.panelNote}>{capNote}</p>}
            </section>

            <section className={s.panel} aria-labelledby="tags-title">
              <div className={s.panelHead}>
                <h2 id="tags-title">Most mentioned</h2>
              </div>
              <div className={s.panelBody}>
                {loadingList ? (
                  <div aria-busy="true" aria-label="Loading topics" style={{ display: 'grid', gap: 12 }}>
                    {[0, 1, 2, 3].map((i) => (
                      <span key={i} className="skeleton" style={{ height: 12, width: `${90 - i * 15}%` }} />
                    ))}
                  </div>
                ) : (
                  <TagCounts list={list} />
                )}
              </div>
              {capNote && !loadingList && <p className={s.panelNote}>{capNote}</p>}
            </section>
          </div>
        </div>
      )}
    </Reveal>
  );
}
