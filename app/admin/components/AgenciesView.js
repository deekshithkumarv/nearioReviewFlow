'use client';

import { ArrowRight, Building2, KeyRound, Plus } from 'lucide-react';
import EmptyState from '../../components/ui/EmptyState';
import { LoginBadge, RefreshButton, SkeletonRows, Spinner, ViewHead, ViewMotion, formatDate } from './shared';
import s from '../admin.module.css';

export default function AgenciesView({ agencies, refreshing, onRefresh, onAddAgency, onViewClients, onResend, resendingId }) {
  return (
    <ViewMotion>
      <ViewHead title="Agencies" description="Partners who onboard and look after client businesses on Neario.">
        <RefreshButton refreshing={refreshing} onRefresh={onRefresh} />
        <button type="button" className="btn btn-primary btn-sm" onClick={onAddAgency}>
          <Plus aria-hidden="true" />
          Add agency
        </button>
      </ViewHead>

      {!refreshing && agencies.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Building2}
            title="No agencies yet"
            action={
              <button type="button" className="btn btn-primary" onClick={onAddAgency}>
                <Plus aria-hidden="true" />
                Add agency
              </button>
            }
          >
            Add an agency to give its manager a login for their clients.
          </EmptyState>
        </div>
      ) : (
        <div className={s.tableCard}>
          <div className={s.tableScroll}>
            <table className={s.table} aria-busy={refreshing || undefined}>
              <caption className="visually-hidden">Agency partners</caption>
              <thead>
                <tr>
                  <th scope="col">Agency</th>
                  <th scope="col">Clients</th>
                  <th scope="col">Paying</th>
                  <th scope="col">Manager login</th>
                  <th scope="col">Added</th>
                  <th scope="col" className={s.alignEnd}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {refreshing ? (
                  <SkeletonRows widths={['170px', '40px', '40px', '100px', '90px', '200px']} rows={4} />
                ) : (
                  agencies.map((a) => {
                    const invited = a.owner_status === 'invited' && a.owner_user_id;
                    const resending = invited && resendingId === a.owner_user_id;
                    return (
                      <tr key={a.id}>
                        <td className={s.cellPrimary} data-label="Agency">
                          <div className={s.cellTitle}>{a.name}</div>
                        </td>
                        <td data-label="Clients" className={s.num}>
                          {a.clients ?? 0}
                        </td>
                        <td data-label="Paying" className={s.num}>
                          {a.paying ?? 0}
                        </td>
                        <td data-label="Manager login">
                          <LoginBadge status={a.owner_status} />
                        </td>
                        <td data-label="Added" className={s.cellMuted}>
                          {formatDate(a.created_at)}
                        </td>
                        <td className={`${s.alignEnd} ${s.cellActions}`}>
                          <div className={s.rowActions}>
                            {invited && (
                              <button
                                type="button"
                                className="btn btn-sm"
                                disabled={Boolean(resendingId)}
                                aria-busy={resending || undefined}
                                onClick={() => onResend({ userId: a.owner_user_id, name: a.name, email: '' })}
                              >
                                {resending ? <Spinner /> : <KeyRound aria-hidden="true" />}
                                <span>{resending ? 'Creating…' : 'New invite link'}</span>
                                <span className="visually-hidden"> for {a.name}</span>
                              </button>
                            )}
                            <button type="button" className="btn btn-sm" onClick={() => onViewClients(a)}>
                              View clients
                              <span className="visually-hidden"> of {a.name}</span>
                              <ArrowRight aria-hidden="true" />
                            </button>
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
