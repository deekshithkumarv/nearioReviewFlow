import { Plus, Star, Users, ArrowRight } from 'lucide-react';
import EmptyState from '../../components/ui/EmptyState';
import Reveal from '../../components/ui/Reveal';
import s from '../dashboard.module.css';
import { formatDate, formatDateTime } from './format';

const PAY = {
  paid: { label: 'Paid', tone: 'badge-success' },
  awaiting_payment: { label: 'Awaiting payment', tone: 'badge-warn' },
  past_due: { label: 'Past due', tone: 'badge-danger' },
  cancelled: { label: 'Cancelled', tone: '' },
};
const LOGIN = {
  active: { label: 'Active', tone: 'badge-success' },
  invited: { label: 'Invited', tone: 'badge-info' },
};
const PLAN = { monthly: 'Monthly', yearly: 'Yearly' };

export default function ClientsView({ businesses, orgName, isAdmin, onOpen, onAdd }) {
  const totalFeedback = businesses.reduce((acc, b) => acc + (b.feedback_count || 0), 0);
  const awaiting = businesses.filter((b) => b.pay_status === 'awaiting_payment' || b.pay_status === 'past_due').length;

  return (
    <Reveal>
      <div className={s.pageHead}>
        <div className={s.pageHeadText}>
          {orgName && <p className="eyebrow">{orgName}</p>}
          <h1 className={s.pageTitle}>Clients</h1>
          <p className={s.pageSub}>
            {isAdmin ? 'Every business on Neario.' : 'Businesses you manage.'} Opening a client&rsquo;s feedback is recorded in their access log.
          </p>
        </div>
        <div className={s.pageActions}>
          <button type="button" className="btn btn-primary" onClick={onAdd}>
            <Plus aria-hidden="true" />
            Add client
          </button>
        </div>
      </div>

      {businesses.length === 0 ? (
        <div className={s.panel}>
          <EmptyState
            icon={Users}
            title="No clients yet"
            action={
              <button type="button" className="btn btn-primary" onClick={onAdd}>
                <Plus aria-hidden="true" />
                Add your first client
              </button>
            }
          >
            Add a business and we&rsquo;ll create an invite link for the owner. They set a password, and you both see the same feedback.
          </EmptyState>
        </div>
      ) : (
        <div className={s.stack}>
          <section aria-label="Summary" className={`${s.statStrip} ${s.statStrip3}`} style={{ '--cols': 3 }}>
            <div className={s.stat}>
              <span className={s.statLabel}>Clients</span>
              <span className={s.statValue}>{businesses.length}</span>
            </div>
            <div className={s.stat}>
              <span className={s.statLabel}>Feedback across clients</span>
              <span className={s.statValue}>{totalFeedback.toLocaleString('en-IN')}</span>
            </div>
            <div className={s.stat}>
              <span className={s.statLabel}>Awaiting payment</span>
              <span className={`${s.statValue} ${awaiting > 0 ? s.statValueWarn : ''}`}>{awaiting}</span>
            </div>
          </section>

          <section className={s.panel} aria-label="Client list">
            <div className={s.tableWrap}>
              <table className={`${s.table} ${s.stackTable} ${s.clientsTable}`}>
                <caption className="visually-hidden">Client businesses</caption>
                <thead>
                  <tr>
                    <th scope="col">Business</th>
                    <th scope="col">Type and city</th>
                    <th scope="col">Feedback</th>
                    <th scope="col">Plan</th>
                    <th scope="col">Payment</th>
                    <th scope="col">Owner login</th>
                    <th scope="col">Last feedback</th>
                    <th scope="col">
                      <span className="visually-hidden">Action</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {businesses.map((b, i) => {
                    const pay = PAY[b.pay_status] || { label: b.pay_status || 'Unknown', tone: '' };
                    const login = LOGIN[b.login_status] || { label: 'No login', tone: '' };
                    return (
                      <tr key={b.id}>
                        <td data-label="">
                          <span className={s.cellMain}>{b.name}</span>
                          {b.owner_email && <span className={s.cellSub}>{b.owner_email}</span>}
                        </td>
                        <td data-label="Type and city">
                          {[b.type, b.city].filter(Boolean).join(' · ') || '–'}
                        </td>
                        <td data-label="Feedback" className={s.nowrap}>
                          <span className="num">{(b.feedback_count || 0).toLocaleString('en-IN')}</span>
                          {b.avg_rating != null && b.feedback_count > 0 && (
                            <span className={s.ratingInline}>
                              <Star aria-hidden="true" />
                              <span className="visually-hidden">average </span>
                              {Number(b.avg_rating).toFixed(1)}
                            </span>
                          )}
                        </td>
                        <td data-label="Plan">{PLAN[b.plan] || b.plan || '–'}</td>
                        <td data-label="Payment">
                          <span className={`badge ${pay.tone}`}>{pay.label}</span>
                        </td>
                        <td data-label="Owner login">
                          <span className={`badge ${login.tone}`}>{login.label}</span>
                        </td>
                        <td data-label="Last feedback" className={s.nowrap}>
                          {b.last_feedback_at ? (
                            <time dateTime={b.last_feedback_at} title={formatDateTime(b.last_feedback_at)}>
                              {formatDate(b.last_feedback_at)}
                            </time>
                          ) : (
                            <span className="muted">None yet</span>
                          )}
                        </td>
                        <td className={`${s.alignEnd} ${s.rowAction}`}>
                          <button type="button" className="btn btn-sm" onClick={() => onOpen(i)}>
                            Open
                            <span className="visually-hidden"> {b.name}</span>
                            <ArrowRight aria-hidden="true" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
    </Reveal>
  );
}
