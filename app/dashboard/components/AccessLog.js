import { ShieldCheck } from 'lucide-react';
import EmptyState from '../../components/ui/EmptyState';
import Reveal from '../../components/ui/Reveal';
import s from '../dashboard.module.css';
import { formatDateTime, formatRelative } from './format';

export default function AccessLog({ biz, logs, loading }) {
  const rows = logs.filter((l) => l.business_id == null || String(l.business_id) === String(biz.id));

  return (
    <Reveal>
      <div className={s.pageHead}>
        <div className={s.pageHeadText}>
          <h1 className={s.pageTitle}>Access log</h1>
          <p className={s.pageSub}>
            Each time an agency or the Neario team opens {biz.name}&rsquo;s feedback, it is recorded here. Your own visits are not logged.
          </p>
        </div>
      </div>

      <section className={s.panel} aria-label="Access records">
        {loading && rows.length === 0 ? (
          <div aria-busy="true" aria-label="Loading access log" style={{ display: 'grid', gap: 14, padding: 20 }}>
            {[0, 1, 2].map((i) => (
              <span key={i} className="skeleton" style={{ height: 14 }} />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <EmptyState icon={ShieldCheck} title="No one else has opened this data">
            If an agency or the Neario team views this business&rsquo;s feedback, you will see who, when and why.
          </EmptyState>
        ) : (
          <div className={s.tableWrap}>
            <table className={`${s.table} ${s.stackTable}`}>
              <caption className="visually-hidden">Who opened {biz.name}&rsquo;s feedback</caption>
              <thead>
                <tr>
                  <th scope="col">When</th>
                  <th scope="col">Who</th>
                  <th scope="col">Organisation</th>
                  <th scope="col">Reason</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((log) => (
                  <tr key={log.id}>
                    <td data-label="When" className={s.nowrap}>
                      <time dateTime={log.created_at} title={formatDateTime(log.created_at)}>
                        {formatDateTime(log.created_at)}
                      </time>
                      <span className="visually-hidden"> ({formatRelative(log.created_at)})</span>
                    </td>
                    <td data-label="Who">
                      <span className={s.cellMain}>{log.actor_name || log.actor_email}</span>
                      {log.actor_name && log.actor_email && <span className={s.cellSub}>{log.actor_email}</span>}
                    </td>
                    <td data-label="Organisation">{log.actor_agency || 'Neario team'}</td>
                    <td data-label="Reason">{log.reason || 'Opened dashboard'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </Reveal>
  );
}
