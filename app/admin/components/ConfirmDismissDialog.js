'use client';

import Modal from '../../components/ui/Modal';
import { Spinner } from './shared';
import s from '../admin.module.css';

// Replaces window.confirm for dismissing a website sign-up.
export default function ConfirmDismissDialog({ lead, busy, onCancel, onConfirm }) {
  return (
    <Modal
      open={Boolean(lead)}
      onClose={() => {
        if (!busy) onCancel();
      }}
      title="Dismiss this sign-up?"
      maxWidth={440}
    >
      {lead && (
        <>
          <p className={s.confirmText}>
            <b>{lead.business_name}</b> ({lead.email}) will be removed from the sign-up list. No account is created and
            nothing is sent to them.
          </p>
          <div className={s.formActions}>
            <button type="button" className="btn" onClick={onCancel} disabled={busy} data-autofocus="">
              Keep it
            </button>
            <button type="button" className="btn btn-danger" onClick={() => onConfirm(lead)} disabled={busy} aria-busy={busy || undefined}>
              {busy && <Spinner />}
              <span>{busy ? 'Dismissing…' : 'Dismiss sign-up'}</span>
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}
