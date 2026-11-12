'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Eye, ExternalLink, Store, WifiOff } from 'lucide-react';
import Logo from '../components/ui/Logo';
import EmptyState from '../components/ui/EmptyState';
import s from './dashboard.module.css';
import Shell from './components/Shell';
import Overview from './components/Overview';
import FeedbackView from './components/FeedbackView';
import FollowUps from './components/FollowUps';
import QrCardView from './components/QrCardView';
import ReportView from './components/ReportView';
import AccessLog from './components/AccessLog';
import ClientsView from './components/ClientsView';
import AddClientModal from './components/AddClientModal';

// Skeleton that mirrors the shell and the overview, shown on first render (server and client agree on it).
function DashboardSkeleton() {
  return (
    <div className={s.app}>
      <aside className={s.sidebar} aria-label="Sidebar">
        <div className={s.sidebarLogo}>
          <Logo href="/" size={30} />
        </div>
        <div style={{ display: 'grid', gap: 10, padding: '0 8px' }}>
          {[70, 55, 62, 48, 58, 52].map((w, i) => (
            <span key={i} className="skeleton" style={{ height: 14, width: `${w}%` }} />
          ))}
        </div>
      </aside>
      <header className={s.topbar}>
        <Logo href="/" size={28} />
      </header>
      <main id="main" className={s.main} aria-busy="true">
        <h1 className="visually-hidden">Loading your dashboard</h1>
        <div className={s.stack}>
          <div style={{ display: 'grid', gap: 10 }}>
            <span className="skeleton" style={{ height: 12, width: 140 }} />
            <span className="skeleton" style={{ height: 32, width: 'min(320px, 80%)' }} />
          </div>
          <div className={s.statStrip}>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className={s.stat}>
                <span className="skeleton" style={{ height: 12, width: '60%' }} />
                <span className={`skeleton ${s.statSkel}`} />
                <span className="skeleton" style={{ height: 10, width: '75%' }} />
              </div>
            ))}
          </div>
          <div className={s.overviewGrid}>
            <div className={s.panel} style={{ padding: 20, display: 'grid', gap: 14 }}>
              {[0, 1, 2, 3].map((i) => (
                <span key={i} className="skeleton" style={{ height: 48 }} />
              ))}
            </div>
            <div className={s.panel} style={{ padding: 20, display: 'grid', gap: 14 }}>
              {[0, 1, 2, 3, 4].map((i) => (
                <span key={i} className="skeleton" style={{ height: 12 }} />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [origin, setOrigin] = useState('');
  const [businesses, setBusinesses] = useState([]);
  const [activeBizIndex, setActiveBizIndex] = useState(0);
  const [mode, setMode] = useState('owner'); // 'owner' | 'agency'
  const [route, setRoute] = useState('overview'); // overview | feedback | followups | qr | report | access | clients
  const [feedbackList, setFeedbackList] = useState([]);
  const [viewLogs, setViewLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [feedbackErr, setFeedbackErr] = useState(false);
  const [feedbackAttempt, setFeedbackAttempt] = useState(0);
  const [addClientOpen, setAddClientOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [initError, setInitError] = useState(false);
  const [initAttempt, setInitAttempt] = useState(0);

  // Load the user and their businesses on mount.
  useEffect(() => {
    async function init() {
      setInitError(false);
      setLoading(true);
      try {
        setOrigin(window.location.origin);
        const meRes = await fetch('/api/me');
        if (meRes.status === 401) {
          router.replace('/login');
          return;
        }
        if (!meRes.ok) throw new Error('me ' + meRes.status);
        const meData = await meRes.json();
        setUser(meData.user);

        const bizRes = await fetch('/api/businesses');
        if (!bizRes.ok) throw new Error('businesses ' + bizRes.status);
        const list = (await bizRes.json()).businesses || [];
        setBusinesses(list);

        // ?b=<id> opens one business directly (used by the admin console). Agencies and Neario staff otherwise
        // start on the client list, so no client's feedback is opened (and logged) until they pick one.
        const wanted = Number(new URLSearchParams(window.location.search).get('b'));
        const idx = wanted ? list.findIndex((b) => Number(b.id) === wanted) : -1;
        if (idx > -1) {
          setActiveBizIndex(idx);
          setMode('owner');
          setRoute('overview');
        } else if (meData.user.role !== 'client_user') {
          setMode('agency');
          setRoute('clients');
        }

        const logRes = await fetch('/api/view-log');
        if (logRes.ok) {
          const lData = await logRes.json();
          setViewLogs(lData.log || []);
        }
      } catch {
        // Network or server problem: say so instead of showing an empty dashboard.
        setInitError(true);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [router, initAttempt]);

  const activeBiz = businesses[activeBizIndex] || null;
  const activeBizId = activeBiz?.id;

  // Load feedback only when a business is actually open in owner view. Opening it as an agency or Neario
  // admin writes a view-log row, so this must not run while they are just looking at the client list.
  useEffect(() => {
    if (loading || mode !== 'owner' || !activeBizId) return;
    const ctrl = new AbortController();
    setLoadingFeedback(true);
    setFeedbackErr(false);
    setFeedbackList([]);
    fetch(`/api/businesses/${activeBizId}/feedback?reason=${encodeURIComponent('Opened dashboard')}`, { signal: ctrl.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error(String(res.status));
        setFeedbackList((await res.json()).feedback || []);
        setLoadingFeedback(false);
      })
      .catch((err) => {
        if (err.name === 'AbortError') return; // a newer business was picked; its request owns the state
        setFeedbackErr(true);
        setLoadingFeedback(false);
      });
    return () => ctrl.abort();
  }, [loading, mode, activeBizId, feedbackAttempt]);

  // The access log is re-read whenever it is opened, so recent visits show up. Reading it writes nothing.
  useEffect(() => {
    if (loading || mode !== 'owner' || route !== 'access') return;
    const ctrl = new AbortController();
    setLogsLoading(true);
    fetch('/api/view-log', { signal: ctrl.signal })
      .then(async (res) => {
        if (res.ok) setViewLogs((await res.json()).log || []);
        setLogsLoading(false);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') setLogsLoading(false);
      });
    return () => ctrl.abort();
  }, [loading, mode, route]);

  // Totals and the average come from the server (all feedback). The list itself is capped at the latest 500,
  // so the satisfaction split is computed from those and labelled as recent.
  const stats = useMemo(() => {
    const n = feedbackList.length;
    const total = activeBiz?.feedback_count ?? n;
    const avgNum = activeBiz?.avg_rating ?? (n ? feedbackList.reduce((acc, f) => acc + f.rating, 0) / n : 0);
    const high = feedbackList.filter((f) => f.rating >= 4).length;
    const low = feedbackList.filter((f) => f.rating <= 3).length;
    return {
      n,
      total: Number(total) || 0,
      avg: Number(avgNum || 0).toFixed(1),
      sat: n ? Math.round((high / n) * 100) : 0,
      low,
      high,
      capped: !loadingFeedback && n > 0 && total > n,
    };
  }, [feedbackList, activeBiz, loadingFeedback]);

  if (loading) return <DashboardSkeleton />;
  if (initError) {
    return (
      <main id="main" className="state-page">
        <Logo href="/" size={30} />
        <EmptyState
          icon={WifiOff}
          title="We couldn’t load your dashboard"
          role="alert"
          action={
            <button type="button" className="btn btn-primary" onClick={() => setInitAttempt((n) => n + 1)}>
              Try again
            </button>
          }
        >
          Check your connection and try again. Your data is safe.
        </EmptyState>
      </main>
    );
  }

  const isAgencyUser = user?.role === 'agency_user' || user?.role === 'super_admin';
  const orgName = user?.role === 'super_admin' ? 'Neario team' : user?.agency_name || businesses[0]?.agency_name || '';

  function navigate(id) {
    if (id === 'clients') {
      setMode('agency');
      setRoute('clients');
    } else {
      setMode('owner');
      setRoute(id);
    }
    window.scrollTo({ top: 0 });
  }

  function openClient(idx) {
    setActiveBizIndex(idx);
    setMode('owner');
    setRoute('overview');
    window.scrollTo({ top: 0 });
  }

  function switchBiz(idx) {
    setActiveBizIndex(idx);
    setMode('owner');
    if (route === 'clients') setRoute('overview');
  }

  async function refreshBusinesses() {
    try {
      const res = await fetch('/api/businesses');
      if (res.ok) setBusinesses((await res.json()).businesses || []);
    } catch {
      // The list refreshes on the next visit; the invite link is already on screen.
    }
  }

  async function signOut() {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Still leave: the login page will show whether the session is gone.
    }
    router.push('/login');
  }

  const retryFeedback = () => setFeedbackAttempt((n) => n + 1);
  const viewProps = {
    biz: activeBiz,
    stats,
    list: feedbackList,
    loadingList: loadingFeedback,
    error: feedbackErr,
    onRetry: retryFeedback,
    onNavigate: navigate,
  };

  const banner =
    isAgencyUser && mode === 'owner' && activeBiz ? (
      <div className={s.banner}>
        <p className={s.bannerText}>
          <Eye aria-hidden="true" />
          <span>
            You are viewing <strong>{activeBiz.name}</strong> as {orgName || 'your agency'}. Each visit is recorded in the owner&rsquo;s access log.
          </span>
        </p>
        <button type="button" className="btn btn-sm" onClick={() => navigate('clients')}>
          <ArrowLeft aria-hidden="true" />
          Back to all clients
        </button>
      </div>
    ) : null;

  let content;
  if (mode === 'agency') {
    content = (
      <ClientsView
        businesses={businesses}
        orgName={orgName}
        isAdmin={user?.role === 'super_admin'}
        onOpen={openClient}
        onAdd={() => setAddClientOpen(true)}
      />
    );
  } else if (!activeBiz) {
    content = (
      <>
        <h1 className="visually-hidden">Dashboard</h1>
        <div className={s.panel}>
          <EmptyState icon={Store} title="No business linked to your account yet">
            Ask whoever set up your login, your agency or the Neario team, to link your business. Once it is linked, your feedback appears here.
          </EmptyState>
        </div>
      </>
    );
  } else if (route === 'feedback') {
    content = <FeedbackView {...viewProps} />;
  } else if (route === 'followups') {
    content = <FollowUps {...viewProps} />;
  } else if (route === 'qr') {
    content = <QrCardView biz={activeBiz} origin={origin} />;
  } else if (route === 'report') {
    content = <ReportView {...viewProps} />;
  } else if (route === 'access') {
    content = <AccessLog biz={activeBiz} logs={viewLogs} loading={logsLoading} />;
  } else {
    content = (
      <Overview
        {...viewProps}
        canEdit={user?.role !== 'super_admin'}
        headActions={
          <Link href={`/feedback/${activeBiz.id}`} target="_blank" rel="noopener noreferrer" className="btn">
            <ExternalLink aria-hidden="true" />
            Open customer page
            <span className="visually-hidden"> (opens in a new tab)</span>
          </Link>
        }
      />
    );
  }

  return (
    <>
      <Shell
        user={user}
        isAgencyUser={isAgencyUser}
        businesses={businesses}
        activeBiz={activeBiz}
        activeBizIndex={activeBizIndex}
        mode={mode}
        route={route}
        counts={{ followups: loadingFeedback || feedbackErr ? 0 : stats.low }}
        onNavigate={navigate}
        onSwitchBiz={switchBiz}
        onSignOut={signOut}
        signingOut={signingOut}
        banner={banner}
      >
        <div key={`${mode}-${route}-${activeBizId ?? 'none'}`}>{content}</div>
      </Shell>

      {isAgencyUser && (
        <AddClientModal
          open={addClientOpen}
          onClose={() => setAddClientOpen(false)}
          orgName={user?.role === 'super_admin' ? 'Neario' : orgName}
          origin={origin}
          onCreated={refreshBusinesses}
        />
      )}
    </>
  );
}
