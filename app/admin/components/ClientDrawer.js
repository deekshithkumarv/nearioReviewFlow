'use client';

import Link from 'next/link';
import { ArrowUpRight, KeyRound, Star } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import { LoginBadge, PayStatusSelect, Spinner, formatDate, payInfo, planLabel } from './shared';
import s from '../admin.module.css';

export default function ClientDrawer({ client, onClose, onPayChange, onResend, resendingId }) {
  const open = Boolean(client);
  const c = client || {};
  const pay = payInfo(c.pay_status);
  const canResend = c.login_status === 'invited' && c.owner_user_id;
  const resending = canResend && resendingId === c.owner_user_id;

  return (
    <Modal
      open={open}
      onClose={onClose}
      variant="drawer"
      title={c.name || 'Client'}
      description={[c.type || 'Other', c.city].filter(Boolean).join(' · ')}
      closeLabel="Close client details"
    >
      {open && (
        <>
          <div className={s.drawerBadges}>
            <span className={`badge ${pay.badge}`}>{pay.label}</span>
            <LoginBadge status={c.login_status} />
          </div>

          <dl className={s.facts}>
            <dt>Managed by</dt>
            <dd>{c.agency_name || 'Direct client'}</dd>

            <dt>Plan</dt>
            <dd>
              {planLabel(c.plan)}
              <small>{c.plan === 'monthly' ? '₹599 a month' : '₹5,391 a year'}</small>
            </dd>

            <dt>
              <label htmlFor="drawer-pay">Payment</label>
            </dt>
            <dd>
              <PayStatusSelect id="drawer-pay" value={c.pay_status} onChange={(v) => onPayChange(c, v)} />
            </dd>

            <dt>Owner login</dt>
            <dd>
              {c.owner_email || 'No owner email'}
              <small>
                {c.login_status === 'active'
                  ? 'Password set'
                  : c.login_status === 'invited'
                    ? 'Invite not accepted yet'
                    : 'No login created'}
              </small>
            </dd>

            <dt>Feedback</dt>
            <dd>
              <span className={s.num}>{c.feedback_count || 0}</span> {c.feedback_count === 1 ? 'response' : 'responses'}
              {c.avg_rating ? (
                <span className={s.rating}>
                  <Star aria-hidden="true" />
                  {Number(c.avg_rating).toFixed(1)}
                  <span className="visually-hidden"> average rating</span>
                </span>
              ) : null}
            </dd>

            <dt>Created</dt>
            <dd>{formatDate(c.created_at)}</dd>
          </dl>

          <div className={s.drawerActions}>
            <Link href={`/dashboard?b=${c.id}`} className="btn btn-primary btn-block">
              <span>Open client dashboard</span>
              <ArrowUpRight aria-hidden="true" />
            </Link>
            {canResend && (
              <button
                type="button"
                className="btn btn-block"
                disabled={Boolean(resendingId)}
                aria-busy={resending || undefined}
                onClick={() => onResend({ userId: c.owner_user_id, name: c.name, email: c.owner_email })}
              >
                {resending ? <Spinner /> : <KeyRound aria-hidden="true" />}
                <span>{resending ? 'Creating link…' : 'Create a new invite link'}</span>
              </button>
            )}
          </div>
        </>
      )}
    </Modal>
  );
}
