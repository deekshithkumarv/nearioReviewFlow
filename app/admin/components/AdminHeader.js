'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { LayoutDashboard, LogOut } from 'lucide-react';
import Logo from '../../components/ui/Logo';
import { Spinner } from './shared';
import s from '../admin.module.css';

export const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'leads', label: 'Sign-ups' },
  { id: 'clients', label: 'Clients' },
  { id: 'agencies', label: 'Agencies' },
  { id: 'audit', label: 'Access log' },
];

export default function AdminHeader({ user, tab, onTabChange, newLeadCount = 0, onSignOut, signingOut, loading = false }) {
  const tabRefs = useRef({});

  // Keep the selected tab visible inside the horizontal strip on small screens.
  useEffect(() => {
    const el = tabRefs.current[tab];
    if (el && typeof el.scrollIntoView === 'function') el.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [tab]);

  function onKeyDown(e) {
    const i = TABS.findIndex((t) => t.id === tab);
    let next = null;
    if (e.key === 'ArrowRight') next = (i + 1) % TABS.length;
    else if (e.key === 'ArrowLeft') next = (i - 1 + TABS.length) % TABS.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = TABS.length - 1;
    if (next === null) return;
    e.preventDefault();
    const id = TABS[next].id;
    onTabChange(id);
    tabRefs.current[id]?.focus();
  }

  return (
    <header className={s.topbar}>
      <div className="container">
        <div className={s.topRow}>
          <div className={s.brand}>
            <Logo size={30} />
            <span className={s.adminTag}>Admin</span>
          </div>

          <div className={s.account}>
            {loading ? (
              <span className="skeleton" style={{ width: 180, height: 32 }} aria-hidden="true" />
            ) : (
              <>
                <Link href="/dashboard" className={`btn btn-ghost btn-sm ${s.iconOnlySm}`}>
                  <LayoutDashboard aria-hidden="true" />
                  <span className={s.collapseLabel}>Client view</span>
                </Link>
                {user?.email && (
                  <span className={s.email} title={user.email}>
                    {user.email}
                  </span>
                )}
                <button
                  type="button"
                  className={`btn btn-sm ${s.iconOnlySm}`}
                  onClick={onSignOut}
                  disabled={signingOut}
                  aria-busy={signingOut || undefined}
                >
                  {signingOut ? <Spinner /> : <LogOut aria-hidden="true" />}
                  <span className={s.collapseLabel}>{signingOut ? 'Signing out…' : 'Sign out'}</span>
                </button>
              </>
            )}
          </div>
        </div>

        {loading ? (
          <div className={s.skelTabs} aria-hidden="true">
            {[88, 92, 76, 84, 96].map((w, i) => (
              <span key={i} className="skeleton" style={{ width: w, height: 40, borderRadius: 8 }} />
            ))}
          </div>
        ) : (
          <div className={s.tabScroller}>
            <div role="tablist" aria-label="Admin sections" className={s.tablist} onKeyDown={onKeyDown}>
              {TABS.map((t) => {
                const selected = tab === t.id;
                return (
                  <button
                    key={t.id}
                    ref={(el) => {
                      tabRefs.current[t.id] = el;
                    }}
                    type="button"
                    role="tab"
                    id={`tab-${t.id}`}
                    aria-selected={selected}
                    aria-controls={`panel-${t.id}`}
                    tabIndex={selected ? 0 : -1}
                    className={s.tab}
                    onClick={() => onTabChange(t.id)}
                  >
                    {t.label}
                    {t.id === 'leads' && newLeadCount > 0 && (
                      <span className={s.tabCount}>
                        {newLeadCount}
                        <span className="visually-hidden"> new</span>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
