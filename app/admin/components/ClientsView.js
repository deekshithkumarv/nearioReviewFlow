'use client';

import Link from 'next/link';
import { ArrowUpRight, FilterX, KeyRound, Plus, Search, Star, Store } from 'lucide-react';
import EmptyState from '../../components/ui/EmptyState';
import { LoginBadge, PAY_STATUSES, PayStatusSelect, RefreshButton, SkeletonRows, Spinner, ViewHead, ViewMotion, planLabel } from './shared';
import s from '../admin.module.css';

export default function ClientsView({
  businesses,
  agencies,
  filters,
  setFilter,
  clearFilters,
  refreshing,
  onRefresh,
  onAddClient,
  onOpenClient,
  onPayChange,
  onResend,
  resendingId,
}) {
  const { q, agency, status, type } = filters;
  const types = [...new Set(businesses.map((b) => b.type || 'Other'))].sort((a, b) => a.localeCompare(b));
  const needle = q.trim().toLowerCase();

  const rows = businesses.filter((b) => {
    const matchesQ = !needle || `${b.name} ${b.city || ''} ${b.agency_name || ''}`.toLowerCase().includes(needle);
    const matchesStatus = status === 'all' || (b.pay_status || 'awaiting_payment') === status;
    const matchesType = type === 'all' || (b.type || 'Other') === type;
    const matchesAgency = agency === 'all' || (agency === 'direct' ? !b.agency_id : String(b.agency_id) === agency);
    return matchesQ && matchesStatus && matchesType && matchesAgency;
  });
  const filtered = Boolean(needle) || agency !== 'all' || status !== 'all' || type !== 'all';

  return (
    <ViewMotion>
      <ViewHead title="Clients" description="Every business on Neario, with its agency, plan and payment status.">
        <RefreshButton refreshing={refreshing} onRefresh={onRefresh} />
        <button type="button" className="btn btn-primary btn-sm" onClick={onAddClient}>
          <Plus aria-hidden="true" />
          Add client
        </button>
      </ViewHead>

      <form className={s.filters} role="search" aria-label="Filter clients" onSubmit={(e) => e.preventDefault()}>
        <div className={`field ${s.filterSearch}`}>
          <label className="label" htmlFor="f-q">
            Search
          </label>
          <div className={s.searchWrap}>
            <Search aria-hidden="true" />
            <input
              id="f-q"
              className="input"
              type="search"
              placeholder="Name, city or agency"
              value={q}
              onChange={(e) => setFilter('q', e.target.value)}
            />
          </div>
        </div>
        <div className="field">
          <label className="label" htmlFor="f-agency">
            Agency
          </label>
          <select id="f-agency" className="select" value={agency} onChange={(e) => setFilter('agency', e.target.value)}>
            <option value="all">All</option>
            <option value="direct">Direct clients</option>
            {agencies.map((a) => (
              <option key={a.id} value={String(a.id)}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label className="label" htmlFor="f-status">
            Payment
          </label>
          <select id="f-status" className="select" value={status} onChange={(e) => setFilter('status', e.target.value)}>
            <option value="all">All</option>
            {PAY_STATUSES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label className="label" htmlFor="f-type">
            Type
          </label>
          <select id="f-type" className="select" value={type} onChange={(e) => setFilter('type', e.target.value)}>
            <option value="all">All</option>
            {types.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <button type="button" className="btn btn-ghost" onClick={clearFilters} disabled={!filtered}>
          <FilterX aria-hidden="true" />
          Clear
        </button>
      </form>

      <p className={s.filterCount} aria-live="polite">
        {refreshing
          ? 'Loading clients…'
          : filtered
            ? `${rows.length} of ${businesses.length} businesses match`
            : `${businesses.length} business${businesses.length === 1 ? '' : 'es'}`}
      </p>

      {!refreshing && rows.length === 0 ? (
        <div className="card">
          {filtered ? (
            <EmptyState
              icon={FilterX}
              title="No businesses match"
              action={
                <button type="button" className="btn" onClick={clearFilters}>
                  Clear filters
                </button>
              }
            >
              Try a different search or clear the filters.
            </EmptyState>
          ) : (
            <EmptyState
              icon={Store}
              title="No client businesses yet"
              action={
                <button type="button" className="btn btn-primary" onClick={onAddClient}>
                  <Plus aria-hidden="true" />
                  Add client
                </button>
              }
            >
              Convert a website sign-up or add a business yourself.
            </EmptyState>
          )}
        </div>
      ) : (
        <div className={s.tableCard}>
          <div className={s.tableScroll}>
            <table className={s.table} aria-busy={refreshing || undefined}>
              <caption className="visually-hidden">Client businesses</caption>
              <thead>
                <tr>
                  <th scope="col">Business</th>
                  <th scope="col">Agency</th>
                  <th scope="col">Feedback</th>
                  <th scope="col">Plan</th>
                  <th scope="col">Payment</th>
                  <th scope="col" className={s.alignEnd}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {refreshing ? (
                  <SkeletonRows widths={['160px', '100px', '80px', '60px', '150px', '170px']} />
                ) : (
                  rows.map((c) => {
                    const invited = c.login_status === 'invited' && c.owner_user_id;
                    const resending = invited && resendingId === c.owner_user_id;
                    return (
                      <tr key={c.id}>
                        <td className={s.cellPrimary} data-label="Business">
                          <div className={s.cellTitle}>{c.name}</div>
                          <div className={s.cellSub}>
                            {[c.type || 'Other', c.city].filter(Boolean).join(' · ')}
                          </div>
                          {c.login_status !== 'active' && (
                            <div style={{ marginTop: 6 }}>
                              <LoginBadge status={c.login_status} />
                            </div>
                          )}
                        </td>
                        <td data-label="Agency">
                          {c.agency_name ? <span>{c.agency_name}</span> : <span className="muted">Direct</span>}
                        </td>
                        <td data-label="Feedback" className={s.nowrap}>
                          <span className={s.num}>{c.feedback_count || 0}</span>
                          {c.avg_rating ? (
                            <span className={s.rating}>
                              <Star aria-hidden="true" />
                              {Number(c.avg_rating).toFixed(1)}
                              <span className="visually-hidden"> average rating</span>
                            </span>
                          ) : null}
                        </td>
                        <td data-label="Plan">{planLabel(c.plan)}</td>
                        <td data-label="Payment">
                          <PayStatusSelect value={c.pay_status} label={`Payment status for ${c.name}`} onChange={(v) => onPayChange(c, v)} />
                        </td>
                        <td className={`${s.alignEnd} ${s.cellActions}`}>
                          <div className={s.rowActions}>
                            {invited && (
                              <button
                                type="button"
                                className="btn btn-sm"
                                disabled={Boolean(resendingId)}
                                aria-busy={resending || undefined}
                                onClick={() => onResend({ userId: c.owner_user_id, name: c.name, email: c.owner_email })}
                              >
                                {resending ? <Spinner /> : <KeyRound aria-hidden="true" />}
                                <span>{resending ? 'Creating…' : 'New invite link'}</span>
                                <span className="visually-hidden"> for {c.name}</span>
                              </button>
                            )}
                            <button type="button" className="btn btn-sm" onClick={() => onOpenClient(c)}>
                              Details
                              <span className="visually-hidden"> for {c.name}</span>
                            </button>
                            <Link href={`/dashboard?b=${c.id}`} className="btn btn-ghost btn-sm">
                              Dashboard
                              <span className="visually-hidden"> for {c.name}</span>
                              <ArrowUpRight aria-hidden="true" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </ViewMotion>
  );
}
