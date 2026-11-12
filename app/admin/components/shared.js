'use client';

import { RefreshCw } from 'lucide-react';
import { m, useReducedMotion } from 'framer-motion';
import s from '../admin.module.css';

export const PAY_STATUSES = [
  { value: 'awaiting_payment', label: 'Awaiting payment', badge: 'badge-warn' },
  { value: 'paid', label: 'Paid', badge: 'badge-success' },
  { value: 'past_due', label: 'Payment failed', badge: 'badge-danger' },
  { value: 'cancelled', label: 'Cancelled', badge: '' },
];

export function payInfo(value) {
  return PAY_STATUSES.find((p) => p.value === value) || PAY_STATUSES[0];
}

export const EMAIL_RE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Yearly plans are spread over 12 months; only paid plans count as revenue.
export function monthlyValue(plan) {
  return plan === 'yearly' ? 5391 / 12 : 599;
}

export function formatDate(v) {
  if (!v) return '–';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return '–';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatDateTime(v) {
  if (!v) return '–';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return '–';
  return d.toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export function planLabel(plan) {
  return plan === 'monthly' ? 'Monthly' : 'Yearly';
}

export function LoginBadge({ status }) {
  if (status === 'active') return <span className="badge badge-success">Login active</span>;
  if (status === 'invited') return <span className="badge badge-warn">Invite pending</span>;
  return <span className="badge">No login</span>;
}

export function PayStatusSelect({ value, onChange, label, id }) {
  const current = value || 'awaiting_payment';
  return (
    <select
      id={id}
      className={`select ${s.paySelect}`}
      data-tone={current}
      value={current}
      aria-label={label}
      onChange={(e) => onChange(e.target.value)}
    >
      {PAY_STATUSES.map((p) => (
        <option key={p.value} value={p.value}>
          {p.label}
        </option>
      ))}
    </select>
  );
}

export function RefreshButton({ refreshing, onRefresh }) {
  return (
    <button type="button" className="btn btn-sm" disabled={refreshing} aria-busy={refreshing || undefined} onClick={onRefresh}>
      <RefreshCw aria-hidden="true" className={refreshing ? s.spinIcon : undefined} />
      <span>{refreshing ? 'Refreshing…' : 'Refresh'}</span>
    </button>
  );
}

// Heading block shared by every tab view. The h1 can take focus so keyboard users land somewhere sensible.
export function ViewHead({ title, description, children, headingRef }) {
  return (
    <div className={s.viewHead}>
      <div>
        <h1 ref={headingRef} tabIndex={-1} data-view-heading="">
          {title}
        </h1>
        {description && <p>{description}</p>}
      </div>
      {children && <div className={s.headActions}>{children}</div>}
    </div>
  );
}

// Subtle fade for a newly shown view. Plain element when the user prefers reduced motion.
export function ViewMotion({ children }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={s.view}>{children}</div>;
  return (
    <m.div className={s.view} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}>
      {children}
    </m.div>
  );
}

// Skeleton rows that keep the table's column layout while data loads.
export function SkeletonRows({ widths, rows = 5 }) {
  return Array.from({ length: rows }).map((_, r) => (
    <tr key={`sk-${r}`} aria-hidden="true">
      {widths.map((w, c) => (
        <td key={c} className={c === 0 ? s.cellPrimary : c === widths.length - 1 ? s.cellActions : undefined}>
          <span className={`skeleton ${s.skelLine}`} style={{ width: w, marginLeft: c === widths.length - 1 ? 'auto' : undefined }} />
          {c === 0 && <span className={`skeleton ${s.skelSub}`} />}
        </td>
      ))}
    </tr>
  ));
}

export function Spinner() {
  return <span className="spinner" aria-hidden="true" />;
}
