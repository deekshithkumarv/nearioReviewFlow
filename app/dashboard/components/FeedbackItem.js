import { Star, Phone, Languages, RotateCcw } from 'lucide-react';
import s from '../dashboard.module.css';
import { formatDateTime, formatRelative, formatPhone, tagsOf, LANG_NAMES } from './format';

export function Stars({ rating }) {
  const r = Math.max(0, Math.min(5, Number(rating) || 0));
  return (
    <span className={s.stars} role="img" aria-label={`Rated ${r} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} aria-hidden="true" className={i <= r ? s.starOn : s.starOff} />
      ))}
    </span>
  );
}

// One piece of customer feedback. `as` lets lists render it as an <li>.
export function FeedbackItem({ f, className = '', as: Tag = 'li' }) {
  const tags = tagsOf(f);
  const showPhone = f.contact_ok && f.phone;
  return (
    <Tag className={`${s.fbItem} ${className}`}>
      <div className={s.fbTop}>
        <Stars rating={f.rating} />
        <time className={s.fbDate} dateTime={f.created_at} title={formatDateTime(f.created_at)}>
          {formatRelative(f.created_at)}
        </time>
      </div>
      {f.text ? <p className={s.fbText}>{f.text}</p> : <p className={s.fbTextEmpty}>Rating only, no written comment.</p>}
      {(f.service || tags.length > 0 || f.lang || showPhone) && (
        <div className={s.fbMeta}>
          {f.service && <span className="badge badge-brand">{f.service}</span>}
          {tags.map((t) => (
            <span key={t} className="badge">
              {t}
            </span>
          ))}
          {f.lang && f.lang !== 'en' && (
            <span className="badge badge-info">
              <Languages aria-hidden="true" />
              {LANG_NAMES[f.lang] || f.lang}
            </span>
          )}
          {showPhone && (
            <a className={s.phoneLink} href={`tel:+${String(f.phone).replace(/\D/g, '')}`}>
              <Phone aria-hidden="true" />
              <span>
                <span className="visually-hidden">Call </span>
                {formatPhone(f.phone)}
              </span>
            </a>
          )}
        </div>
      )}
    </Tag>
  );
}

export function FeedbackSkeleton({ rows = 3 }) {
  return (
    <div aria-busy="true" aria-label="Loading feedback">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className={s.fbItem}>
          <div className={s.fbTop}>
            <span className="skeleton" style={{ width: 96, height: 16 }} />
            <span className="skeleton" style={{ width: 64, height: 12 }} />
          </div>
          <span className="skeleton" style={{ width: '92%', height: 12 }} />
          <span className="skeleton" style={{ width: '64%', height: 12 }} />
        </div>
      ))}
    </div>
  );
}

export function FeedbackError({ name, onRetry }) {
  return (
    <div className="empty" role="alert">
      <h3>We couldn&rsquo;t load feedback</h3>
      <p>Something went wrong while loading feedback for {name}. Check your connection and try again.</p>
      <button type="button" className="btn btn-sm" onClick={onRetry}>
        <RotateCcw aria-hidden="true" />
        Try again
      </button>
    </div>
  );
}
