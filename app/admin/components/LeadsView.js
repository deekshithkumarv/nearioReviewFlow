'use client';

import { Inbox, UserPlus, X } from 'lucide-react';
import EmptyState from '../../components/ui/EmptyState';
import { RefreshButton, SkeletonRows, Spinner, ViewHead, ViewMotion, formatDate, planLabel } from './shared';
import s from '../admin.module.css';

function StatusBadge({ status }) {
  if (status === 'new') return <span className="badge badge-info">New</span>;
  if (status === 'converted') return <span className="badge badge-success">Account created</span>;
  return <span className="badge">Dismissed</span>;
}

export default function LeadsView({ leads, refreshing, onRefresh, convertingId, dismissingId, onConvert, onAskDismiss }) {
  return (
    <ViewMotion>
      <ViewHead
        title="Sign-ups"
        description="People who filled in the sign-up form on the website. Nothing is created until you choose Create account."
      >
        <RefreshButton refreshing={refreshing} onRefresh={onRefresh} />
      </ViewHead>

      {!refreshing && leads.length === 0 ? (
        <div className="card">
          <EmptyState icon={Inbox} title="No sign-ups yet">
            New sign-ups from the website form will show up here.
          </EmptyState>
        </div>
      ) : (
        <div className={s.tableCard}>
          <div className={s.tableScroll}>
            <table className={s.table} aria-busy={refreshing || undefined}>
              <caption className="visually-hidden">Website sign-ups, newest first</caption>
              <thead>
                <tr>
                  <th scope="col">Business</th>
                  <th scope="col">Contact</th>
                  <th scope="col">Plan</th>
                  <th scope="col">Received</th>
                  <th scope="col">Status</th>
                  <th scope="col" className={s.alignEnd}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {refreshing ? (
                  <SkeletonRows widths={['150px', '170px', '60px', '80px', '70px', '180px']} />
                ) : (
                  leads.map((l) => {
                    const isNew = l.status === 'new';
                    const converting = convertingId === l.id;
                    const dismissing = dismissingId === l.id;
                    return (
                      <tr key={l.id}>
                        <td className={s.cellPrimary} data-label="Business">
                          <div className={s.cellTitle}>{l.business_name}</div>
                          <div className={s.cellSub}>
                            {l.kind === 'agency' ? 'Agency' : l.business_type || 'Business'}
                            {l.city ? ` · ${l.city}` : ''}
                          </div>
                        </td>
                        <td data-label="Contact">
                          <div>
                            <div className={s.cellTitle} style={{ fontWeight: 500 }}>
                              {l.email}
                            </div>
                            {l.phone && <div className={`${s.cellSub} ${s.num}`}>+{l.phone}</div>}
                          </div>
                        </td>
                        <td data-label="Plan">{planLabel(l.plan)}</td>
                        <td data-label="Received" className={s.cellMuted}>
                          {formatDate(l.created_at)}
                        </td>
                        <td data-label="Status">
                          <StatusBadge status={l.status} />
                        </td>
                        <td className={`${s.alignEnd} ${s.cellActions}`}>
                          {isNew ? (
                            <div className={s.rowActions}>
                              <button
                                type="button"
                                className="btn btn-primary btn-sm"
                                disabled={convertingId !== null || dismissing}
                                aria-busy={converting || undefined}
                                onClick={() => onConvert(l)}
                              >
                                {converting ? <Spinner /> : <UserPlus aria-hidden="true" />}
                                <span>{converting ? 'Creating…' : 'Create account'}</span>
                                <span className="visually-hidden"> for {l.business_name}</span>
                              </button>
                              <button
                                type="button"
                                className="btn btn-ghost btn-sm"
                                disabled={converting || dismissingId !== null}
                                onClick={() => onAskDismiss(l)}
                              >
                                <X aria-hidden="true" />
                                <span>Dismiss</span>
                                <span className="visually-hidden"> {l.business_name}</span>
                              </button>
                            </div>
                          ) : (
                            <span className={s.cellMuted}>No action needed</span>
                          )}
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
