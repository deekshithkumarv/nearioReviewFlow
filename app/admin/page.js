'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Modal from '../components/ui/Modal';
import { showToast } from '../components/ui/Toast';
import AdminHeader, { TABS } from './components/AdminHeader';
import OverviewView from './components/OverviewView';
import LeadsView from './components/LeadsView';
import ClientsView from './components/ClientsView';
import AgenciesView from './components/AgenciesView';
import AccessLogView from './components/AccessLogView';
import ClientDrawer from './components/ClientDrawer';
import CreateAgencyModal from './components/CreateAgencyModal';
import CreateClientModal from './components/CreateClientModal';
import ConfirmDismissDialog from './components/ConfirmDismissDialog';
import InviteShare from './components/InviteShare';
import { payInfo } from './components/shared';
import s from './admin.module.css';

const NO_FILTERS = { q: '', agency: 'all', status: 'all', type: 'all' };

// Loads the four admin lists in parallel. A list whose request fails is left out (the old data stays).
async function fetchLists() {
  const [bizRes, agRes, logRes, leadRes] = await Promise.all([
    fetch('/api/businesses'),
    fetch('/api/agencies'),
    fetch('/api/view-log'),
    fetch('/api/leads'),
  ]);
  let failed = 0;
  async function read(res, key) {
    if (!res.ok) {
      failed += 1;
      return undefined;
    }
    const data = await res.json().catch(() => null);
    if (!data) {
      failed += 1;
      return undefined;
    }
    return data[key] || [];
  }
  const out = {
    businesses: await read(bizRes, 'businesses'),
    agencies: await read(agRes, 'agencies'),
    log: await read(logRes, 'log'),
    leads: await read(leadRes, 'leads'),
  };
  return { ...out, failed };
}

// After a dialog closes because its trigger disappeared (a converted lead, a tab switch),
// put focus on the current view's heading instead of leaving it on <body>.
function focusHeadingIfLost() {
  setTimeout(() => {
    const active = document.activeElement;
    if (active && active !== document.body && document.contains(active)) return;
    document.querySelector('[role="tabpanel"]:not([hidden]) [data-view-heading]')?.focus();
  }, 60);
}

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [tab, setTab] = useState('overview');

  const [businesses, setBusinesses] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [viewLogs, setViewLogs] = useState([]);
  const [leads, setLeads] = useState([]);

  const [filters, setFilters] = useState(NO_FILTERS);
  const [convertingLeadId, setConvertingLeadId] = useState(null);
  const [dismissingLeadId, setDismissingLeadId] = useState(null);
  const [dismissTarget, setDismissTarget] = useState(null);
  const [resendingId, setResendingId] = useState(null);
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [inviteModal, setInviteModal] = useState(null);
  const [agencyModalOpen, setAgencyModalOpen] = useState(false);
  const [clientModalOpen, setClientModalOpen] = useState(false);

  const payRequests = useRef({});
  const focusHeadingOnTab = useRef(false);

  function applyLists(r) {
    if (r.businesses) setBusinesses(r.businesses);
    if (r.agencies) setAgencies(r.agencies);
    if (r.log) setViewLogs(r.log);
    if (r.leads) setLeads(r.leads);
  }

  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      let redirecting = false;
      try {
        const meRes = await fetch('/api/me');
        if (meRes.status === 401) {
          redirecting = true;
          router.replace('/login');
          return;
        }
        // A server or network problem is not "signed out": fall through to the error toast below.
        if (!meRes.ok) throw new Error('me ' + meRes.status);
        const meData = await meRes.json();
        if (meData.user?.role !== 'super_admin') {
          redirecting = true;
          router.push('/dashboard');
          return;
        }
        if (cancelled) return;
        setUser(meData.user);

        const r = await fetchLists();
        if (cancelled) return;
        if (r.businesses) setBusinesses(r.businesses);
        if (r.agencies) setAgencies(r.agencies);
        if (r.log) setViewLogs(r.log);
        if (r.leads) setLeads(r.leads);
        if (r.failed) showToast('Some lists could not be loaded. Use Refresh to try again.', { tone: 'error' });
      } catch {
        if (!cancelled) showToast('Could not load the admin data. Check your connection and refresh.', { tone: 'error' });
      } finally {
        // Keep the skeleton while we are being sent elsewhere.
        if (!cancelled && !redirecting) setLoading(false);
      }
    }
    loadData();
    return () => {
      cancelled = true;
    };
  }, [router]);

  // Move focus to the new view's heading when a tab change came from a button inside a view.
  useEffect(() => {
    if (!focusHeadingOnTab.current) return;
    focusHeadingOnTab.current = false;
    document.querySelector(`#panel-${tab} [data-view-heading]`)?.focus();
  }, [tab]);

  async function refreshData({ showSkeleton = false } = {}) {
    if (showSkeleton) setRefreshing(true);
    try {
      const [r] = await Promise.all([fetchLists(), showSkeleton ? new Promise((res) => setTimeout(res, 320)) : null]);
      applyLists(r);
      if (showSkeleton && r.failed) showToast('Some lists could not be refreshed. Try again.', { tone: 'error' });
    } catch {
      if (showSkeleton) showToast('Could not refresh. Check your connection and try again.', { tone: 'error' });
    } finally {
      if (showSkeleton) setRefreshing(false);
    }
  }
  const manualRefresh = () => refreshData({ showSkeleton: true });

  function goToTab(id) {
    focusHeadingOnTab.current = true;
    setTab(id);
  }

  async function handleConvertLead(lead) {
    if (convertingLeadId !== null) return;
    setConvertingLeadId(lead.id);
    try {
      const res = await fetch(`/api/leads/${lead.id}/convert`, { method: 'POST' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showToast(data.error || 'The account could not be created. Try again.', { tone: 'error' });
        if (res.status === 409) refreshData();
        return;
      }
      showToast(`Account created for ${data.name}`, { tone: 'success' });
      setInviteModal({
        title: `Invite for ${data.name}`,
        description:
          data.kind === 'agency'
            ? 'Agency account created. Send this setup link so the manager can set a password.'
            : 'Account created. Send this setup link so the owner can set a password.',
        businessName: data.name,
        email: data.email || lead.email,
        phone: data.phone || lead.phone,
        link: `${window.location.origin}/accept?token=${data.inviteToken}`,
      });
      refreshData();
    } catch {
      showToast('Network error. No account was created.', { tone: 'error' });
    } finally {
      setConvertingLeadId(null);
    }
  }

  async function handleDismissLead(lead) {
    if (dismissingLeadId !== null) return;
    setDismissingLeadId(lead.id);
    try {
      const res = await fetch(`/api/leads/${lead.id}/dismiss`, { method: 'POST' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        showToast(data.error || 'The sign-up could not be dismissed. Try again.', { tone: 'error' });
        return;
      }
      showToast(`${lead.business_name} dismissed`, { tone: 'success' });
      setDismissTarget(null);
      // The row (and its Dismiss button) goes away once the list reloads.
      refreshData().then(focusHeadingIfLost);
    } catch {
      showToast('Network error. The sign-up was not dismissed.', { tone: 'error' });
    } finally {
      setDismissingLeadId(null);
    }
  }

  // A fresh single-use link for someone who has not set a password yet (lost or expired invite).
  async function handleResendInvite({ userId, name, email }) {
    if (!userId || resendingId) return;
    setResendingId(userId);
    try {
      const res = await fetch('/api/invites/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showToast(data.error || 'Could not create a new invite link.', { tone: 'error' });
        return;
      }
      setSelectedClientId(null);
      setInviteModal({
        title: `New invite for ${name}`,
        description: 'Send this new setup link so they can set a password.',
        businessName: name,
        email,
        phone: '',
        link: `${window.location.origin}/accept?token=${data.inviteToken}`,
      });
    } catch {
      showToast('Network error. No new invite was created.', { tone: 'error' });
    } finally {
      setResendingId(null);
    }
  }

  // Optimistic: the select changes at once and rolls back if the server says no.
  async function handlePayChange(biz, next) {
    const prev = biz.pay_status || 'awaiting_payment';
    if (prev === next) return;
    const token = (payRequests.current[biz.id] || 0) + 1;
    payRequests.current[biz.id] = token;
    const setStatus = (value) => setBusinesses((list) => list.map((b) => (b.id === biz.id ? { ...b, pay_status: value } : b)));
    setStatus(next);
    try {
      const res = await fetch(`/api/businesses/${biz.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payStatus: next }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Payment status for ${biz.name} was not changed. Try again.`);
      }
      showToast(`${biz.name} marked as ${payInfo(next).label.toLowerCase()}`, { tone: 'success' });
      refreshData();
    } catch (err) {
      // Only roll back if no newer change for this business has been made since.
      if (payRequests.current[biz.id] === token) setStatus(prev);
      const offline = err instanceof TypeError;
      showToast(offline ? `Network error. Payment status for ${biz.name} was not changed.` : err.message, { tone: 'error' });
    }
  }

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Go to the sign-in page anyway.
    } finally {
      router.push('/login');
    }
  }

  function setFilter(key, value) {
    setFilters((f) => ({ ...f, [key]: value }));
  }

  if (loading) {
    return (
      <div className={s.page}>
        <AdminHeader loading tab={tab} onTabChange={setTab} />
        <main id="main" className={`container ${s.main}`} tabIndex={-1} aria-busy="true">
          <div className={s.view}>
            <h1 className="visually-hidden">Admin</h1>
            <p className="visually-hidden" role="status">
              Loading the admin console…
            </p>
            <div aria-hidden="true">
              <span className="skeleton" style={{ height: 34, width: 180 }} />
              <span className="skeleton" style={{ height: 14, width: 320, maxWidth: '100%', marginTop: 10 }} />
            </div>
            <div className={s.metrics} aria-hidden="true">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className={s.metric}>
                  <span className="skeleton" style={{ height: 12, width: '55%' }} />
                  <span className="skeleton" style={{ height: 30, width: '45%', margin: '8px 0 6px' }} />
                  <span className="skeleton" style={{ height: 10, width: '70%' }} />
                </div>
              ))}
            </div>
            <div className={s.overviewGrid} aria-hidden="true">
              <span className="skeleton" style={{ height: 240, borderRadius: 14 }} />
              <span className="skeleton" style={{ height: 180, borderRadius: 14 }} />
            </div>
          </div>
        </main>
      </div>
    );
  }

  const newLeadCount = leads.filter((l) => l.status === 'new').length;
  const selectedClient = selectedClientId == null ? null : businesses.find((b) => b.id === selectedClientId) || null;
  const openClient = (b) => setSelectedClientId(b.id);

  function renderView(id) {
    switch (id) {
      case 'overview':
        return (
          <OverviewView
            businesses={businesses}
            agencies={agencies}
            viewLogs={viewLogs}
            newLeadCount={newLeadCount}
            refreshing={refreshing}
            onRefresh={manualRefresh}
            onGoTo={goToTab}
            onOpenClient={openClient}
            onAddAgency={() => setAgencyModalOpen(true)}
            onAddClient={() => setClientModalOpen(true)}
          />
        );
      case 'leads':
        return (
          <LeadsView
            leads={leads}
            refreshing={refreshing}
            onRefresh={manualRefresh}
            convertingId={convertingLeadId}
            dismissingId={dismissingLeadId}
            onConvert={handleConvertLead}
            onAskDismiss={setDismissTarget}
          />
        );
      case 'clients':
        return (
          <ClientsView
            businesses={businesses}
            agencies={agencies}
            filters={filters}
            setFilter={setFilter}
            clearFilters={() => setFilters(NO_FILTERS)}
            refreshing={refreshing}
            onRefresh={manualRefresh}
            onAddClient={() => setClientModalOpen(true)}
            onOpenClient={openClient}
            onPayChange={handlePayChange}
            onResend={handleResendInvite}
            resendingId={resendingId}
          />
        );
      case 'agencies':
        return (
          <AgenciesView
            agencies={agencies}
            refreshing={refreshing}
            onRefresh={manualRefresh}
            onAddAgency={() => setAgencyModalOpen(true)}
            onViewClients={(a) => {
              setFilters({ ...NO_FILTERS, agency: String(a.id) });
              goToTab('clients');
            }}
            onResend={handleResendInvite}
            resendingId={resendingId}
          />
        );
      case 'audit':
        return <AccessLogView viewLogs={viewLogs} refreshing={refreshing} onRefresh={manualRefresh} />;
      default:
        return null;
    }
  }

  return (
    <div className={s.page}>
      <AdminHeader
        user={user}
        tab={tab}
        onTabChange={setTab}
        newLeadCount={newLeadCount}
        onSignOut={handleSignOut}
        signingOut={signingOut}
      />

      <main id="main" className={`container ${s.main}`} tabIndex={-1}>
        {TABS.map((t) => (
          <div key={t.id} role="tabpanel" id={`panel-${t.id}`} aria-labelledby={`tab-${t.id}`} hidden={tab !== t.id}>
            {tab === t.id && renderView(t.id)}
          </div>
        ))}
      </main>

      <ClientDrawer
        client={selectedClient}
        onClose={() => setSelectedClientId(null)}
        onPayChange={handlePayChange}
        onResend={handleResendInvite}
        resendingId={resendingId}
      />

      {agencyModalOpen && <CreateAgencyModal onClose={() => setAgencyModalOpen(false)} onCreated={() => refreshData()} />}

      {clientModalOpen && (
        <CreateClientModal agencies={agencies} onClose={() => setClientModalOpen(false)} onCreated={() => refreshData()} />
      )}

      <ConfirmDismissDialog
        lead={dismissTarget}
        busy={dismissingLeadId !== null}
        onCancel={() => setDismissTarget(null)}
        onConfirm={handleDismissLead}
      />

      <Modal
        open={Boolean(inviteModal)}
        onClose={() => {
          setInviteModal(null);
          focusHeadingIfLost();
        }}
        title={inviteModal?.title || 'Invite link'}
        description={inviteModal?.description}
      >
        {inviteModal && (
          <InviteShare
            link={inviteModal.link}
            email={inviteModal.email}
            phone={inviteModal.phone}
            businessName={inviteModal.businessName}
            onDone={() => {
              setInviteModal(null);
              focusHeadingIfLost();
            }}
          />
        )}
      </Modal>
    </div>
  );
}
