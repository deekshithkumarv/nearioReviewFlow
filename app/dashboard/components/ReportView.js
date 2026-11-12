import { Printer } from 'lucide-react';
import Reveal from '../../components/ui/Reveal';
import s from '../dashboard.module.css';
import { FeedbackError } from './FeedbackItem';
import { RatingDistribution, TagCounts } from './Overview';
import { formatDate } from './format';

export default function ReportView({ biz, stats, list, loadingList, error, onRetry }) {
  const hasAny = stats.total > 0;
  const recentScope = stats.capped ? `Latest ${stats.n} of ${stats.total.toLocaleString('en-IN')}` : 'All feedback';

  return (
    <Reveal>
      <article className={`${s.panel} ${s.report}`} aria-labelledby="report-title">
        <header className={s.reportHead}>
          <div>
            <p className="eyebrow">
              {biz.agency_name ? `Prepared by ${biz.agency_name} · ` : ''}Neario ReviewFlow
            </p>
            <h1 id="report-title" className={s.pageTitle} style={{ marginTop: 6 }}>
              {biz.name} feedback summary
            </h1>
            <p className={s.pageSub}>
              {[biz.type, biz.city].filter(Boolean).join(' · ')}
              {biz.type || biz.city ? ' · ' : ''}
              All feedback to {formatDate(new Date())}
            </p>
          </div>
          <button type="button" className={`btn btn-primary ${s.noPrint}`} onClick={() => window.print()}>
            <Printer aria-hidden="true" />
            Print or save as PDF
          </button>
        </header>

        <dl className={s.reportNums}>
          <div className={s.reportNum}>
            <dt>Feedback received</dt>
            <dd>{stats.total.toLocaleString('en-IN')}</dd>
            <small>All time</small>
          </div>
          <div className={s.reportNum}>
            <dt>Average rating</dt>
            <dd>{hasAny ? `${stats.avg} / 5` : '–'}</dd>
            <small>All time</small>
          </div>
          <div className={s.reportNum}>
            <dt>Rated 4 or 5 stars</dt>
            <dd>{loadingList ? '…' : stats.n ? `${stats.sat}%` : '–'}</dd>
            <small>{recentScope}</small>
          </div>
          <div className={s.reportNum}>
            <dt>Rated 3 or below</dt>
            <dd>{loadingList ? '…' : stats.n ? stats.low : '–'}</dd>
            <small>{recentScope}</small>
          </div>
        </dl>

        {error ? (
          <div className={s.noPrint}>
            <FeedbackError name={biz.name} onRetry={onRetry} />
          </div>
        ) : (
          !loadingList &&
          list.length > 0 && (
            <div className={s.reportCols}>
              <section aria-labelledby="rep-dist">
                <h2 id="rep-dist">Ratings</h2>
                <RatingDistribution list={list} />
              </section>
              <section aria-labelledby="rep-tags">
                <h2 id="rep-tags">Most mentioned</h2>
                <TagCounts list={list} />
              </section>
            </div>
          )
        )}

        <p className={s.reportFoot}>
          Private feedback collected through this business&rsquo;s Neario feedback page. Google reviews are separate and not included.
          {stats.capped ? ` Ratings breakdown and topics use the latest ${stats.n} entries.` : ''}
        </p>
      </article>
    </Reveal>
  );
}
