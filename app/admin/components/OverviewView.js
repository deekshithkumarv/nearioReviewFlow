'use client';

import { AlertTriangle, ArrowRight, Building2, CheckCircle2, ChevronRight, Clock, Inbox, Store } from 'lucide-react';
import { RefreshButton, ViewHead, ViewMotion, monthlyValue } from './shared';
import s from '../admin.module.css';

const ATTENTION_LIMIT = 6;

function MetricsSkeleton() {
  return (
    <div className={s.metrics} aria-hidden="true">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className={s.metric}>
          <span className="skeleton" style={{ height: 12, width: '55%' }} />
          <span className="skeleton" style={{ height: 30, width: '45%', margin: '8px 0 6px' }} />
          <span className="skeleton" style={{ height: 10, width: '70%' }} />
        </div>
      ))}
    </div>
  );
}

function AttentionSkeleton() {
  return (
    <div aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <div key={i} className={s.attnItem}>
          <span className="skeleton" style={{ width: 36, height: 36, borderRadius: 10 }} />
          <div style={{ flex: 1 }}>
            <span className="skeleton" style={{ height: 13, width: '45%' }} />
            <span className="skeleton" style={{ height: 10, width: '65%', marginTop: 6 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function OverviewView({
  businesses,
  agencies,
  viewLogs,
  newLeadCount,
  refreshing,
  onRefresh,
  onGoTo,
  onOpenClient,
  onAddAgency,
  onAddClient,
}) {
  const paid = businesses.filter((b) => b.pay_status === 'paid');
  const awaiting = businesses.filter((b) => b.pay_status === 'awaiting_payment').length;
  const otherStatus = businesses.length - paid.length - awaiting;
  const mrr = Math.round(paid.reduce((sum, b) => sum + monthlyValue(b.plan), 0));
  const viaAgency = businesses.filter((b) => b.agency_id).length;
  const direct = businesses.length - viaAgency;

  // Failed payments first, then businesses that have not paid yet (newest first, as the API returns them).
  const attention = [
    ...businesses.filter((b) => b.pay_status === 'past_due'),
    ...businesses.filter((b) => b.pay_status === 'awaiting_payment'),
  ];
  const shown = attention.slice(0, ATTENTION_LIMIT);
  const nothingPending = newLeadCount === 0 && attention.length === 0;

  return (
    <ViewMotion>
      <ViewHead title="Overview" description="Sign-ups, payments and partners across every Neario client.">
        <RefreshButton refreshing={refreshing} onRefresh={onRefresh} />
      </ViewHead>

      {refreshing ? (
        <MetricsSkeleton />
      ) : (
        <section className={s.metrics} aria-label="Key numbers">
          <div className={`${s.metric} ${s.metricLead}`}>
            <span className={s.metricLabel}>Monthly revenue (paid plans)</span>
            <span className={s.metricValue}>₹{mrr.toLocaleString('en-IN')}</span>
            <span className={s.metricSub}>
              From {paid.length} paying business{paid.length === 1 ? '' : 'es'}. Yearly plans counted as ₹5,391 ÷ 12.
            </span>
          </div>
          <div className={s.metric}>
            <span className={s.metricLabel}>Businesses</span>
            <span className={s.metricValue}>{businesses.length}</span>
            <span className={s.metricSub}>
              {paid.length} paying · {awaiting} awaiting payment
              {otherStatus > 0 ? ` · ${otherStatus} failed or cancelled` : ''}
            </span>
          </div>
          <div className={s.metric}>
            <span className={s.metricLabel}>Agencies</span>
            <span className={s.metricValue}>{agencies.length}</span>
            <span className={s.metricSub}>
              {viaAgency} clients via agencies · {direct} direct
            </span>
          </div>
          <div className={s.metric}>
            <span className={s.metricLabel}>Access log entries</span>
            <span className={s.metricValue}>{viewLogs.length}</span>
            <span className={s.metricSub}>
              {viewLogs.length >= 200 ? 'Latest 200 shown' : 'Times a client’s feedback was opened by Neario or an agency'}
            </span>
          </div>
        </section>
      )}

      <div className={s.overviewGrid}>
        <section className={s.panel} aria-labelledby="attn-title">
          <div className={s.panelHead}>
            <h2 id="attn-title">Needs attention</h2>
          </div>
          <div className={s.panelBody}>
            {refreshing ? (
              <AttentionSkeleton />
            ) : nothingPending ? (
              <p className={s.attnClear}>
                <CheckCircle2 aria-hidden="true" />
                Nothing waiting. No new sign-ups and no unpaid or failed payments.
              </p>
            ) : (
              <>
                <ul className={s.attnList}>
                  {newLeadCount > 0 && (
                    <li className={s.attnItem}>
                      <span className={s.attnIcon} data-tone="info">
                        <Inbox aria-hidden="true" />
                      </span>
                      <div className={s.attnText}>
                        <b>
                          {newLeadCount} new sign-up{newLeadCount === 1 ? '' : 's'}
                        </b>
                        <span>Create their account and send the invite link.</span>
                      </div>
                      <button type="button" className="btn btn-primary btn-sm" onClick={() => onGoTo('leads')}>
                        Review
                        <ArrowRight aria-hidden="true" />
                      </button>
                    </li>
                  )}
                  {shown.map((b) => {
                    const failed = b.pay_status === 'past_due';
                    return (
                      <li key={b.id} className={s.attnItem}>
                        <span className={s.attnIcon} data-tone={failed ? 'danger' : 'warn'}>
                          {failed ? <AlertTriangle aria-hidden="true" /> : <Clock aria-hidden="true" />}
                        </span>
                        <div className={s.attnText}>
                          <b>{b.name}</b>
                          <span>{failed ? 'Last payment failed' : 'Waiting for payment'}</span>
                        </div>
                        <button type="button" className="btn btn-sm" onClick={() => onOpenClient(b)}>
                          Details
                          <span className="visually-hidden"> for {b.name}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
                {attention.length > shown.length && (
                  <button type="button" className={`btn btn-ghost btn-sm ${s.attnMore}`} onClick={() => onGoTo('clients')}>
                    {attention.length - shown.length} more in Clients
                    <ArrowRight aria-hidden="true" />
                  </button>
                )}
              </>
            )}
          </div>
        </section>

        <section className={s.panel} aria-labelledby="quick-title">
          <div className={s.panelHead}>
            <h2 id="quick-title">Quick actions</h2>
          </div>
          <div className={`${s.panelBody} ${s.quickList}`}>
            <button type="button" className={s.quickBtn} onClick={onAddClient}>
              <Store aria-hidden="true" />
              <span>
                <b>Add a client business</b>
                <small>Creates the business and an owner invite link</small>
              </span>
              <ChevronRight aria-hidden="true" />
            </button>
            <button type="button" className={s.quickBtn} onClick={onAddAgency}>
              <Building2 aria-hidden="true" />
              <span>
                <b>Add an agency</b>
                <small>Creates the agency and a manager invite link</small>
              </span>
              <ChevronRight aria-hidden="true" />
            </button>
          </div>
        </section>
      </div>
    </ViewMotion>
  );
}
