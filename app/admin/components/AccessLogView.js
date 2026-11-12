'use client';

import { ScrollText } from 'lucide-react';
import EmptyState from '../../components/ui/EmptyState';
import { RefreshButton, SkeletonRows, ViewHead, ViewMotion, formatDateTime } from './shared';
import s from '../admin.module.css';

export default function AccessLogView({ viewLogs, refreshing, onRefresh }) {
  return (
    <ViewMotion>
      <ViewHead
        title="Access log"
        description="Every time someone at Neario or an agency opens a client’s feedback, it is recorded here. Owners viewing their own business are not logged."
      >
        <RefreshButton refreshing={refreshing} onRefresh={onRefresh} />
      </ViewHead>

      {!refreshing && viewLogs.length === 0 ? (
        <div className="card">
          <EmptyState icon={ScrollText} title="Nothing recorded yet">
            When Neario or an agency opens a client dashboard, the visit appears here.
          </EmptyState>
        </div>
      ) : (
        <div className={s.tableCard}>
          <div className={s.tableScroll}>
            <table className={s.table} aria-busy={refreshing || undefined}>
              <caption className="visually-hidden">Access log, newest first{viewLogs.length >= 200 ? ', latest 200 entries' : ''}</caption>
              <thead>
                <tr>
                  <th scope="col">Time</th>
                  <th scope="col">Who</th>
                  <th scope="col">From</th>
                  <th scope="col">Business</th>
                  <th scope="col">Reason</th>
                </tr>
              </thead>
              <tbody>
                {refreshing ? (
                  <SkeletonRows widths={['140px', '130px', '100px', '150px', '140px']} />
                ) : (
                  viewLogs.map((log) => (
                    <tr key={log.id}>
                      <td data-label="Time" className={`${s.cellPrimary} ${s.cellMuted} ${s.num}`}>
                        {formatDateTime(log.created_at)}
                      </td>
                      <td data-label="Who">
                        <div>
                          <div>{log.actor_name || log.actor_email}</div>
                          {log.actor_name && log.actor_email && <div className={s.cellSub}>{log.actor_email}</div>}
                        </div>
                      </td>
                      <td data-label="From">{log.actor_agency || 'Neario team'}</td>
                      <td data-label="Business" className={s.cellTitle}>
                        {log.business_name}
                      </td>
                      <td data-label="Reason">{log.reason || 'Opened dashboard'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </ViewMotion>
  );
}
