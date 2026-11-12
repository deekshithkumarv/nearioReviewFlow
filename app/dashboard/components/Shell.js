'use client';

import { useId, useState } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  MessageSquareText,
  PhoneCall,
  QrCode as QrIcon,
  FileText,
  ShieldCheck,
  Users,
  Settings,
  Shield,
  LogOut,
  Menu,
  Sparkles,
} from 'lucide-react';
import Logo from '../../components/ui/Logo';
import Modal from '../../components/ui/Modal';
import s from '../dashboard.module.css';

export const BIZ_NAV = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'feedback', label: 'Feedback', icon: MessageSquareText },
  { id: 'followups', label: 'Follow-ups', icon: PhoneCall },
  { id: 'qr', label: 'QR card', icon: QrIcon },
  { id: 'report', label: 'Report', icon: FileText },
  { id: 'access', label: 'Access log', icon: ShieldCheck },
];

const ROLE_LABEL = { client_user: 'Business owner', agency_user: 'Agency', super_admin: 'Neario team' };

function NavContent({ user, isAgencyUser, businesses, activeBiz, activeBizIndex, mode, route, counts, onNavigate, onSwitchBiz, onSignOut, signingOut }) {
  const switchId = useId();
  const showBizNav = !isAgencyUser ? Boolean(activeBiz) : mode === 'owner' && Boolean(activeBiz);
  const showSwitcher = mode === 'owner' && businesses.length > 1;

  return (
    <>
      {showSwitcher && (
        <div className={s.switcher}>
          <label className="label" htmlFor={switchId}>
            {isAgencyUser ? 'Client' : 'Business'}
          </label>
          <select id={switchId} className="select" value={activeBizIndex} onChange={(e) => onSwitchBiz(Number(e.target.value))}>
            {businesses.map((b, idx) => (
              <option key={b.id} value={idx}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <nav aria-label="Dashboard">
        {isAgencyUser && (
          <div className={s.navGroup}>
            <ul className={s.navList}>
              <li>
                <button type="button" className={s.navItem} aria-current={mode === 'agency' ? 'page' : undefined} onClick={() => onNavigate('clients')}>
                  <Users aria-hidden="true" />
                  <span className={s.navText}>Clients</span>
                  <span className={s.navCount}>{businesses.length}</span>
                </button>
              </li>
            </ul>
          </div>
        )}

        {showBizNav ? (
          <div className={s.navGroup}>
            {(isAgencyUser || businesses.length > 1) && <span className={s.navLabel}>{activeBiz.name}</span>}
            <ul className={s.navList}>
              {BIZ_NAV.map((item) => {
                const Icon = item.icon;
                const current = mode === 'owner' && route === item.id;
                const count = item.id === 'followups' ? counts.followups : null;
                return (
                  <li key={item.id}>
                    <button type="button" className={s.navItem} aria-current={current ? 'page' : undefined} onClick={() => onNavigate(item.id)}>
                      <Icon aria-hidden="true" />
                      <span className={s.navText}>{item.label}</span>
                      {count > 0 && (
                        <span className={`${s.navCount} ${s.navCountWarn}`}>
                          {count}
                          <span className="visually-hidden"> to follow up</span>
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : (
          isAgencyUser && businesses.length > 0 && <p className={s.navHint}>Open a client to see its feedback, QR card and report.</p>
        )}
      </nav>

      <div className={s.sideFoot}>
        {user?.role !== 'super_admin' && activeBiz && (
          <Link href={`/onboarding?b=${activeBiz.id}`} className={s.navItem}>
            <Settings aria-hidden="true" />
            <span className={s.navText}>Business settings</span>
          </Link>
        )}
        {user?.role === 'super_admin' && (
          <Link href="/admin" className={s.navItem}>
            <Shield aria-hidden="true" />
            <span className={s.navText}>Admin console</span>
          </Link>
        )}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- the demo replaces the whole document, so it needs a full page load */}
        <a href="/demo/overview" className={s.navItem}>
          <Sparkles aria-hidden="true" />
          <span className={s.navText}>Sample dashboard</span>
        </a>

        <div className={s.userBlock}>
          <span className={s.avatar} aria-hidden="true">
            {(user?.name || user?.email || '?').trim().charAt(0)}
          </span>
          <span className={s.userText}>
            <span className={s.userName} title={user?.email}>
              {user?.name || user?.email}
            </span>
            <span className={s.userRole}>
              {ROLE_LABEL[user?.role] || 'Signed in'}
              {user?.role === 'agency_user' && user?.agency_name ? ` · ${user.agency_name}` : ''}
            </span>
          </span>
        </div>
        <button type="button" className={s.navItem} onClick={onSignOut} disabled={signingOut} aria-busy={signingOut || undefined}>
          {signingOut ? <span className="spinner" aria-hidden="true" /> : <LogOut aria-hidden="true" />}
          <span className={s.navText}>{signingOut ? 'Signing out…' : 'Sign out'}</span>
        </button>
      </div>
    </>
  );
}

// Sidebar on desktop, a top bar with a drawer below 1024px. Children are the page content inside <main>.
export default function Shell(props) {
  const { activeBiz, mode, children, banner, onNavigate, onSwitchBiz } = props;
  const [menuOpen, setMenuOpen] = useState(false);

  const navProps = {
    ...props,
    onNavigate: (id) => {
      setMenuOpen(false);
      onNavigate(id);
    },
    onSwitchBiz: (idx) => {
      setMenuOpen(false);
      onSwitchBiz(idx);
    },
  };

  return (
    <div className={s.app}>
      <aside className={s.sidebar} aria-label="Sidebar">
        <div className={s.sidebarLogo}>
          <Logo href="/" size={30} />
        </div>
        <NavContent {...navProps} />
      </aside>

      <header className={s.topbar}>
        <Logo href="/" size={28} />
        <span className={s.topbarBiz}>
          {mode === 'owner' && activeBiz ? activeBiz.name : mode === 'agency' ? 'Clients' : ''}
        </span>
        <button
          type="button"
          className="btn btn-ghost btn-icon"
          aria-label="Open menu"
          aria-haspopup="dialog"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(true)}
        >
          <Menu aria-hidden="true" />
        </button>
      </header>

      <Modal open={menuOpen} onClose={() => setMenuOpen(false)} title="Menu" variant="drawer" maxWidth={340} closeLabel="Close menu">
        <div className={s.drawerNav}>
          <NavContent {...navProps} />
        </div>
      </Modal>

      <main id="main" className={s.main} tabIndex={-1}>
        {banner}
        {children}
      </main>
    </div>
  );
}
