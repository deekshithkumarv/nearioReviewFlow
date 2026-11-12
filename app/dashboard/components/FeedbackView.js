'use client';

import { useId, useMemo, useState } from 'react';
import { Search, SearchX } from 'lucide-react';
import EmptyState from '../../components/ui/EmptyState';
import Reveal from '../../components/ui/Reveal';
import s from '../dashboard.module.css';
import { FeedbackItem, FeedbackSkeleton, FeedbackError } from './FeedbackItem';
import { NoFeedbackYet } from './Overview';
import { tagsOf } from './format';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: '5', label: '5 stars' },
  { id: '4', label: '4 stars' },
  { id: '3', label: '3 and below' },
];

export default function FeedbackView({ biz, stats, list, loadingList, error, onRetry, onNavigate }) {
  const [ratingFilter, setRatingFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const searchId = useId();
  const filterLabelId = useId();

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return list.filter((f) => {
      const matchR = ratingFilter === 'all' || (ratingFilter === '3' ? f.rating <= 3 : f.rating === Number(ratingFilter));
      if (!matchR) return false;
      if (!q) return true;
      const haystack = `${f.text || ''} ${f.service || ''} ${tagsOf(f).join(' ')}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [list, ratingFilter, searchQuery]);

  const filtering = ratingFilter !== 'all' || searchQuery.trim() !== '';
  const clear = () => {
    setRatingFilter('all');
    setSearchQuery('');
  };

  return (
    <Reveal>
      <div className={s.pageHead}>
        <div className={s.pageHeadText}>
          <h1 className={s.pageTitle}>Feedback</h1>
          <p className={s.pageSub}>
            Everything customers have told {biz.name} privately, newest first.
            {stats.capped ? ` Showing the latest ${stats.n} of ${stats.total.toLocaleString('en-IN')}.` : ''}
          </p>
        </div>
      </div>

      <section className={s.panel} aria-label="Feedback list">
        {error ? (
          <FeedbackError name={biz.name} onRetry={onRetry} />
        ) : !loadingList && list.length === 0 ? (
          <NoFeedbackYet biz={biz} onGoQr={() => onNavigate('qr')} />
        ) : (
          <>
            <div className={s.toolbar}>
              <div className={`field ${s.searchField}`}>
                <label className="label" htmlFor={searchId}>
                  Search
                </label>
                <div className={s.searchWrap}>
                  <Search aria-hidden="true" />
                  <input
                    id={searchId}
                    type="search"
                    className="input"
                    placeholder="Words, service or topic"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoComplete="off"
                  />
                </div>
              </div>
              <div className="field">
                <span className="label" id={filterLabelId}>
                  Rating
                </span>
                <div className={s.segmented} role="group" aria-labelledby={filterLabelId}>
                  {FILTERS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      className={s.segBtn}
                      aria-pressed={ratingFilter === opt.id}
                      onClick={() => setRatingFilter(opt.id)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {loadingList ? (
              <FeedbackSkeleton rows={5} />
            ) : (
              <>
                <p className={s.resultCount} role="status" aria-live="polite">
                  {filtering ? `${filtered.length} of ${list.length} match` : `${list.length} ${list.length === 1 ? 'entry' : 'entries'}`}
                </p>
                {filtered.length === 0 ? (
                  <EmptyState
                    icon={SearchX}
                    title="No feedback matches"
                    action={
                      <button type="button" className="btn btn-sm" onClick={clear}>
                        Clear filters
                      </button>
                    }
                  >
                    Try a different word or rating.
                  </EmptyState>
                ) : (
                  <ul className={s.fbList}>
                    {filtered.map((f) => (
                      <FeedbackItem key={f.id} f={f} />
                    ))}
                  </ul>
                )}
              </>
            )}
          </>
        )}
      </section>
    </Reveal>
  );
}
