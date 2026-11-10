'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { showToast } from '../components/Toast';

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [convertingLeadId, setConvertingLeadId] = useState(null);
  const [dismissingLeadId, setDismissingLeadId] = useState(null);
  const [creatingAgency, setCreatingAgency] = useState(false);
  const [creatingClient, setCreatingClient] = useState(false);
  const [sendingInviteEmail, setSendingInviteEmail] = useState(false);
  const [emailSentTo, setEmailSentTo] = useState(null);
  const [copiedInvite, setCopiedInvite] = useState(false);
  const [tab, setTab] = useState('overview');
  const [range, setRange] = useState(6);
  const [q, setQ] = useState('');
  const [fStatus, setFStatus] = useState('all');
  const [fType, setFType] = useState('all');
  const [fAgency, setFAgency] = useState('all');
  const [businesses, setBusinesses] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [viewLogs, setViewLogs] = useState([]);
  const [leads, setLeads] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [inviteModal, setInviteModal] = useState(null);

  // New Agency Modal State
  const [newAgModal, setNewAgModal] = useState(false);
  const [agName, setAgName] = useState('');
  const [agOwnerEmail, setAgOwnerEmail] = useState('');
  const [agOwnerName, setAgOwnerName] = useState('');
  const [createdInvite, setCreatedInvite] = useState(null);

  // New Client Modal State
  const [newCliModal, setNewCliModal] = useState(false);
  const [cliName, setCliName] = useState('');
  const [cliType, setCliType] = useState('Salon or spa');
  const [cliCity, setCliCity] = useState('');
  const [cliEmail, setCliEmail] = useState('');
  const [cliOwner, setCliOwner] = useState('');
  const [cliPlan, setCliPlan] = useState('yearly');
  const [cliAgId, setCliAgId] = useState('');
  const [cliCreatedInvite, setCliCreatedInvite] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const meRes = await fetch('/api/me');
        if (!meRes.ok) {
          router.push('/login');
          return;
        }
        const meData = await meRes.json();
        if (meData.user?.role !== 'super_admin') {
          router.push('/dashboard');
          return;
        }
        setUser(meData.user);

        // Fetch businesses, agencies, view-log, and leads in parallel
        const [bizRes, agRes, logRes, leadRes] = await Promise.all([
          fetch('/api/businesses'),
          fetch('/api/agencies'),
          fetch('/api/view-log'),
          fetch('/api/leads'),
        ]);

        if (bizRes.ok) {
          const bData = await bizRes.json();
          setBusinesses(bData.businesses || []);
        }
        if (agRes.ok) {
          const aData = await agRes.json();
          setAgencies(aData.agencies || []);
        }
        if (logRes.ok) {
          const lData = await logRes.json();
          setViewLogs(lData.log || []);
        }
        if (leadRes.ok) {
          const ldData = await leadRes.json();
          setLeads(ldData.leads || []);
        }
      } catch (err) {
        console.error('Error loading admin data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [router]);

  async function refreshData({ showSkeleton = false } = {}) {
    if (showSkeleton) setRefreshing(true);
    try {
      const fetchAll = Promise.all([
        fetch('/api/businesses'),
        fetch('/api/agencies'),
        fetch('/api/view-log'),
        fetch('/api/leads'),
      ]);
      const [results] = await Promise.all([
        fetchAll,
        showSkeleton ? new Promise((r) => setTimeout(r, 320)) : Promise.resolve(),
      ]);
      const [bizRes, agRes, logRes, leadRes] = results;
      if (bizRes.ok) setBusinesses((await bizRes.json()).businesses || []);
      if (agRes.ok) setAgencies((await agRes.json()).agencies || []);
      if (logRes.ok) setViewLogs((await logRes.json()).log || []);
      if (leadRes.ok) setLeads((await leadRes.json()).leads || []);
    } catch (err) {
      console.error('Error refreshing data:', err);
      if (showSkeleton) showToast('Failed to refresh data.');
    } finally {
      if (showSkeleton) setRefreshing(false);
    }
  }

  async function handleConvertLead(lead) {
    const leadId = typeof lead === 'object' ? lead.id : lead;
    const fallbackEmail = typeof lead === 'object' ? lead.email : '';
    const fallbackPhone = typeof lead === 'object' ? lead.phone : '';
    setConvertingLeadId(leadId);
    try {
      const res = await fetch(`/api/leads/${leadId}/convert`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Failed to convert lead');
        return;
      }
      showToast(`Account created for ${data.name}!`);
      const link = `${window.location.origin}/accept?token=${data.inviteToken}`;
      const phone = data.phone || fallbackPhone;
      const email = data.email || fallbackEmail;
      const waMsg = encodeURIComponent(
        `Hi! Here is your Neario ReviewFlow sign-in link: ${link}`
      );
      const waUrl = phone ? `https://wa.me/${phone}?text=${waMsg}` : '';
      setCopiedInvite(false);
      setEmailSentTo(null);
      setInviteModal({
        title: `Invite for ${data.name}`,
        businessName: data.name,
        email,
        phone,
        link,
        waUrl,
      });
      refreshData();
    } catch (err) {
      showToast('Error converting lead.');
    } finally {
      setConvertingLeadId(null);
    }
  }

  async function handleDismissLead(leadId) {
    if (!confirm('Dismiss this website sign-up?')) return;
    setDismissingLeadId(leadId);
    try {
      const res = await fetch(`/api/leads/${leadId}/dismiss`, { method: 'POST' });
      if (!res.ok) {
        const data = await res.json();
        showToast(data.error || 'Failed to dismiss lead');
        return;
      }
      showToast('Lead dismissed');
      refreshData();
    } catch (err) {
      showToast('Error dismissing lead.');
    } finally {
      setDismissingLeadId(null);
    }
  }

  async function handleSendInviteEmail({ to, businessName, inviteLink }) {
    if (!to) {
      showToast('No registered email address found for this account.');
      return;
    }
    setSendingInviteEmail(true);
    try {
      const res = await fetch('/api/invites/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, businessName, inviteLink }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Failed to send invite email.');
        return;
      }
      if (data.sent) {
        setEmailSentTo(to);
        showToast(`Invite email sent to ${to}!`);
        return;
      }
      // Server email provider (RESEND_API_KEY) is not configured yet: open pre-addressed mail draft dynamically.
      const subject = encodeURIComponent(`Your Neario ReviewFlow invite for ${businessName || 'your workspace'}`);
      const body = encodeURIComponent(
        `Hi,\n\nYour Neario ReviewFlow account for ${businessName || 'your workspace'} is ready.\nOpen this link to set your password and complete setup (valid for 7 days):\n\n${inviteLink}\n\n— Neario ReviewFlow`
      );
      const mailtoHref = `mailto:${encodeURIComponent(to)}?subject=${subject}&body=${body}`;
      const a = document.createElement('a');
      a.href = mailtoHref;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setEmailSentTo(to);
      showToast(`Opened email draft for ${to}.`);
    } catch (err) {
      showToast('Error sending invite email.');
    } finally {
      setSendingInviteEmail(false);
    }
  }

  async function handleUpdatePayStatus(bizId, newStatus) {
    try {
      const res = await fetch(`/api/businesses/${bizId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payStatus: newStatus }),
      });
      if (!res.ok) {
        const data = await res.json();
        showToast(data.error || 'Failed to update payment status');
        return;
      }
      showToast(`Payment status updated to ${newStatus}`);
      refreshData();
    } catch (err) {
      showToast('Error updating status.');
    }
  }

  async function handleCreateAgency(e) {
    e.preventDefault();
    setCreatingAgency(true);
    try {
      const res = await fetch('/api/agencies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: agName, ownerEmail: agOwnerEmail, ownerName: agOwnerName }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Failed to create agency');
        return;
      }
      showToast(`Agency ${agName} created!`);
      setCopiedInvite(false);
      setEmailSentTo(null);
      setCreatedInvite({
        link: `${window.location.origin}/accept?token=${data.inviteToken}`,
        email: agOwnerEmail.trim(),
        name: agName.trim(),
      });
      // Refresh agencies
      const agRes = await fetch('/api/agencies');
      if (agRes.ok) {
        const aData = await agRes.json();
        setAgencies(aData.agencies || []);
      }
    } catch (err) {
      showToast('Error creating agency.');
    } finally {
      setCreatingAgency(false);
    }
  }

  async function handleCreateClient(e) {
    e.preventDefault();
    setCreatingClient(true);
    try {
      const res = await fetch('/api/businesses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: cliName,
          type: cliType,
          city: cliCity,
          ownerEmail: cliEmail,
          ownerName: cliOwner,
          plan: cliPlan,
          agencyId: cliAgId ? Number(cliAgId) : null,
          ownerPermission: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Failed to create business');
        return;
      }
      showToast(`Business ${cliName} added!`);
      setCopiedInvite(false);
      setEmailSentTo(null);
      setCliCreatedInvite({
        link: `${window.location.origin}/accept?token=${data.inviteToken}`,
        email: cliEmail.trim(),
        name: cliName.trim(),
      });
      // Refresh businesses
      const bizRes = await fetch('/api/businesses');
      if (bizRes.ok) {
        const bData = await bizRes.json();
        setBusinesses(bData.businesses || []);
      }
    } catch (err) {
      showToast('Error creating business.');
    } finally {
      setCreatingClient(false);
    }
  }

  function renderTableSkeletonRows(colWidths, rowCount = 6) {
    return Array.from({ length: rowCount }).map((_, rIdx) => (
      <tr key={`sk-${rIdx}`} style={{ borderBottom: '1px solid var(--line)' }}>
        {colWidths.map((w, cIdx) => (
          <td key={cIdx} style={{ padding: '14px 16px' }}>
            <span
              className="skeleton"
              style={{
                height: 14,
                width: w,
                marginLeft: cIdx === colWidths.length - 1 ? 'auto' : 0,
              }}
            />
            {cIdx === 1 || cIdx === 2 ? (
              <span className="skeleton" style={{ height: 10, width: '60%', marginTop: 6 }} />
            ) : null}
          </td>
        ))}
      </tr>
    ));
  }

  async function copyInviteLink(link) {
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = link;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopiedInvite(true);
    showToast('Invite link copied to clipboard!');
    setTimeout(() => setCopiedInvite(false), 2500);
  }

  function renderInviteShareSection({ link, email, businessName, waUrl, onClose }) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {(email || waUrl) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', fontSize: 12.5, color: 'var(--muted)', background: 'var(--surface-2)', padding: '8px 12px', borderRadius: 10, border: '1px solid var(--line)' }}>
            <span style={{ fontWeight: 700, color: 'var(--fg)' }}>Recipient:</span>
            {email && <span style={{ fontFamily: 'monospace', color: 'var(--fg)' }}>{email}</span>}
          </div>
        )}

        <div style={{ background: 'var(--surface-2)', padding: '10px 12px', borderRadius: 10, fontSize: 12, fontFamily: 'monospace', wordBreak: 'break-all', border: '1px solid var(--line)', color: 'var(--fg)' }}>
          {link}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 2 }}>
          <button
            type="button"
            className="btn p btn-sm"
            onClick={() => copyInviteLink(link)}
          >
            {copiedInvite ? '✓ Copied' : 'Copy Link'}
          </button>

          {email && (
            <button
              type="button"
              className="btn s btn-sm"
              disabled={sendingInviteEmail}
              onClick={() => handleSendInviteEmail({ to: email, businessName, inviteLink: link })}
              style={{
                borderColor: emailSentTo === email ? 'var(--green)' : 'var(--line)',
                color: emailSentTo === email ? 'var(--green)' : 'var(--fg)',
              }}
            >
              {sendingInviteEmail ? (
                <span className="btn-loading">
                  <span className="spinner spinner-dark" aria-hidden="true" />
                  <span>Sending…</span>
                </span>
              ) : emailSentTo === email ? (
                '✓ Email Sent'
              ) : (
                '✉ Send via Email'
              )}
            </button>
          )}

          {waUrl && (
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-sm"
              style={{
                background: '#16a34a',
                color: '#fff',
                fontWeight: 700,
              }}
            >
              Send on WhatsApp ↗
            </a>
          )}

          <button
            type="button"
            className="btn s btn-sm"
            style={{ marginLeft: 'auto' }}
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="admin-page" style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--fg)', display: 'flex', flexDirection: 'column' }}>
        <header className="bar" style={{ background: 'var(--surface)', borderBottom: '1px solid var(--line)', padding: '12px 20px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span className="skeleton" style={{ width: 34, height: 34, borderRadius: 10 }} />
              <span className="skeleton" style={{ width: 140, height: 20 }} />
            </div>
            <span className="skeleton" style={{ width: 220, height: 28, borderRadius: 10 }} />
          </div>
        </header>
        <main style={{ maxWidth: 1200, width: '100%', margin: '0 auto', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <span className="skeleton" style={{ height: 42, borderRadius: 12 }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            {[0, 1, 2, 3].map((idx) => (
              <div key={idx} className="card" style={{ padding: 20, borderRadius: 16, background: 'var(--surface)', border: '1px solid var(--line)' }}>
                <span className="skeleton" style={{ height: 13, width: '55%', marginBottom: 10 }} />
                <span className="skeleton" style={{ height: 30, width: '40%', marginBottom: 8 }} />
                <span className="skeleton" style={{ height: 11, width: '70%' }} />
              </div>
            ))}
          </div>
          <div className="card" style={{ padding: 0, borderRadius: 16, overflow: 'hidden', background: 'var(--surface)', border: '1px solid var(--line)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>{renderTableSkeletonRows(['60px', '140px', '170px', '80px', '70px', '130px'], 6)}</tbody>
            </table>
          </div>
        </main>
      </div>
    );
  }

  const clientsFiltered = businesses.filter((b) => {
    const matchesQ = !q.trim() || `${b.name} ${b.city || ''} ${b.agency_name || ''}`.toLowerCase().includes(q.toLowerCase());
    const matchesStatus = fStatus === 'all' || b.pay_status === fStatus;
    const matchesType = fType === 'all' || b.type === fType;
    const matchesAgency = fAgency === 'all' || (fAgency === 'Direct' ? !b.agency_id : b.agency_name === fAgency);
    return matchesQ && matchesStatus && matchesType && matchesAgency;
  });

  const viaAgencyCount = businesses.filter((b) => b.agency_id).length;
  const directCount = businesses.length - viaAgencyCount;
  const payingCount = businesses.filter((b) => b.pay_status === 'paid').length;
  const totalMrr = businesses.reduce((acc, b) => acc + (b.plan === 'yearly' ? 449 : 599), 0);

  return (
    <div className="admin-page" style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--fg)', display: 'flex', flexDirection: 'column' }}>
      {/* Top Bar */}
      <header className="bar" style={{ background: 'var(--surface)', borderBottom: '1px solid var(--line)', padding: '12px 20px', position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link href="/" className="brand" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="mark" style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--primary)', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 800 }}>N</span>
              <div>
                <b style={{ fontSize: 16 }}>Neario ReviewFlow</b>
                <span style={{ fontSize: 11, color: 'var(--muted)', display: 'block' }}>Super Admin</span>
              </div>
            </Link>

            <div className="tabs" style={{ display: 'flex', gap: 4, background: 'var(--surface-2)', padding: 3, borderRadius: 10 }}>
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'leads', label: `Sign-ups (${leads.filter((l) => l.status === 'new').length})` },
                { id: 'clients', label: 'Clients' },
                { id: 'agencies', label: 'Agencies' },
                { id: 'audit', label: 'Audit Log' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  style={{
                    border: 0,
                    padding: '6px 14px',
                    borderRadius: 8,
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: 'pointer',
                    background: tab === t.id ? 'var(--surface)' : 'transparent',
                    color: tab === t.id ? 'var(--fg)' : 'var(--muted)',
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link href="/dashboard" className="btn s" style={{ fontSize: 12, padding: '6px 12px', textDecoration: 'none' }}>
              📊 Client Dashboard
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, color: 'var(--muted)' }}>{user?.email}</span>
              <button
                type="button"
                className="btn s"
                onClick={async () => {
                  await fetch('/api/auth/logout', { method: 'POST' });
                  router.push('/login');
                }}
                style={{ fontSize: 12, padding: '5px 10px' }}
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main View Area */}
      <main style={{ maxWidth: 1200, width: '100%', margin: '0 auto', padding: '24px 20px', flex: 1 }}>
        {/* Notice Bar */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 12, padding: '10px 16px', fontSize: 13, marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <span>
            <b>Live Database Connection:</b> Connected to Neon PostgreSQL (`neondb`). Data below reflects live database state.
          </span>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>
            Super Admin mode · Direct SQL Row Level Isolation
          </span>
        </div>

        {/* OVERVIEW TAB */}
        {tab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <h2 style={{ fontSize: 20, margin: 0 }}>Operator Overview</h2>
              <button
                type="button"
                className="btn s btn-sm"
                disabled={refreshing}
                onClick={() => refreshData({ showSkeleton: true })}
              >
                <span className={refreshing ? 'spin-icon' : ''} aria-hidden="true">↻</span>
                <span>{refreshing ? 'Refreshing…' : 'Refresh'}</span>
              </button>
            </div>

            {refreshing ? (
              <div className="kpis" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                {[0, 1, 2, 3].map((idx) => (
                  <div key={idx} className="card kpi" style={{ padding: 20, borderRadius: 16, background: 'var(--surface)', border: '1px solid var(--line)' }}>
                    <span className="skeleton" style={{ height: 13, width: '60%', marginBottom: 10 }} />
                    <span className="skeleton" style={{ height: 32, width: '42%', marginBottom: 8 }} />
                    <span className="skeleton" style={{ height: 12, width: '75%' }} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="kpis" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                <div className="card kpi" style={{ padding: 20, borderRadius: 16, background: 'var(--surface)', border: '1px solid var(--line)' }}>
                  <span style={{ fontSize: 13, color: 'var(--muted)' }}>Monthly Recurring Revenue</span>
                  <b className="num" style={{ fontSize: 30, display: 'block', margin: '4px 0' }}>₹{totalMrr.toLocaleString('en-IN')}</b>
                  <small style={{ color: 'var(--green)', fontWeight: 600 }}>↑ 12% vs last month</small>
                </div>

                <div className="card kpi" style={{ padding: 20, borderRadius: 16, background: 'var(--surface)', border: '1px solid var(--line)' }}>
                  <span style={{ fontSize: 13, color: 'var(--muted)' }}>Total Businesses</span>
                  <b className="num" style={{ fontSize: 30, display: 'block', margin: '4px 0' }}>{businesses.length}</b>
                  <small style={{ color: 'var(--muted)' }}>{payingCount} paying · {businesses.length - payingCount} awaiting payment</small>
                </div>

                <div className="card kpi" style={{ padding: 20, borderRadius: 16, background: 'var(--surface)', border: '1px solid var(--line)' }}>
                  <span style={{ fontSize: 13, color: 'var(--muted)' }}>Partner Agencies</span>
                  <b className="num" style={{ fontSize: 30, display: 'block', margin: '4px 0' }}>{agencies.length}</b>
                  <small style={{ color: 'var(--muted)' }}>{viaAgencyCount} clients via agencies · {directCount} direct</small>
                </div>

                <div className="card kpi" style={{ padding: 20, borderRadius: 16, background: 'var(--surface)', border: '1px solid var(--line)' }}>
                  <span style={{ fontSize: 13, color: 'var(--muted)' }}>View-As Audit Events</span>
                  <b className="num" style={{ fontSize: 30, display: 'block', margin: '4px 0' }}>{viewLogs.length}</b>
                  <small style={{ color: 'var(--muted)' }}>Recorded in `view_log` table</small>
                </div>
              </div>
            )}

            {/* Needs Attention */}
            <div className="card" style={{ padding: 20, borderRadius: 16, background: 'var(--surface)', border: '1px solid var(--line)' }}>
              <h3 style={{ margin: '0 0 12px', fontSize: 16 }}>Needs Attention</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {leads.filter((l) => l.status === 'new').length > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface-2)', padding: '12px 14px', borderRadius: 12 }}>
                    <div>
                      <b>{leads.filter((l) => l.status === 'new').length} new sign-up(s) from website</b>
                      <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>Create their account and send WhatsApp invite link.</div>
                    </div>
                    <button type="button" className="btn p" style={{ fontSize: 12, padding: '6px 14px' }} onClick={() => setTab('leads')}>
                      Review Sign-ups →
                    </button>
                  </div>
                )}
                {businesses.filter((b) => b.pay_status === 'past_due' || b.pay_status === 'awaiting_payment').slice(0, 3).map((b) => (
                  <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface-2)', padding: '10px 14px', borderRadius: 12 }}>
                    <div>
                      <b>{b.name}</b>
                      <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>
                        {b.pay_status === 'past_due' ? 'Payment failed. Plan on hold.' : 'Invited · Payment awaiting.'}
                      </div>
                    </div>
                    <button type="button" className="btn s" style={{ fontSize: 12, padding: '5px 12px' }} onClick={() => setSelectedClient(b)}>
                      Inspect
                    </button>
                  </div>
                ))}
                {leads.filter((l) => l.status === 'new').length === 0 && businesses.filter((b) => b.pay_status === 'past_due').length === 0 && (
                  <div style={{ color: 'var(--muted)', fontSize: 13.5 }}>✓ All clear! No pending sign-ups or failed payments.</div>
                )}
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="card" style={{ padding: 24, borderRadius: 16, background: 'var(--surface)', border: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
              <div>
                <h3 style={{ margin: '0 0 4px', fontSize: 18 }}>Quick Operator Actions</h3>
                <p style={{ margin: 0, color: 'var(--muted)', fontSize: 13.5 }}>Add an agency partner or create a direct client business on Neario.</p>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" className="btn s" onClick={() => setNewAgModal(true)}>+ Add Partner Agency</button>
                <button type="button" className="btn p" onClick={() => setNewCliModal(true)}>+ Add Client Business</button>
              </div>
            </div>
          </div>
        )}

        {/* CLIENTS TAB */}
        {tab === 'clients' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h2 style={{ fontSize: 22, margin: '0 0 4px' }}>Client Businesses</h2>
                <p style={{ margin: 0, color: 'var(--muted)', fontSize: 13 }}>{clientsFiltered.length} businesses matching filters</p>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button
                  type="button"
                  className="btn s btn-sm"
                  disabled={refreshing}
                  onClick={() => refreshData({ showSkeleton: true })}
                >
                  <span className={refreshing ? 'spin-icon' : ''} aria-hidden="true">↻</span>
                  <span>{refreshing ? 'Refreshing…' : 'Refresh'}</span>
                </button>
                <button type="button" className="btn p btn-sm" onClick={() => setNewCliModal(true)}>+ Add Client</button>
              </div>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', background: 'var(--surface)', padding: 12, borderRadius: 12, border: '1px solid var(--line)' }}>
              <input
                type="search"
                placeholder="Search name, city, agency…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface-2)', minWidth: 220 }}
              />
              <select
                value={fAgency}
                onChange={(e) => setFAgency(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface-2)' }}
              >
                <option value="all">All agencies</option>
                <option value="Direct">Direct clients only</option>
                {agencies.map((a) => (
                  <option key={a.id} value={a.name}>{a.name}</option>
                ))}
              </select>
              <select
                value={fStatus}
                onChange={(e) => setFStatus(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface-2)' }}
              >
                <option value="all">All statuses</option>
                <option value="paid">Paid</option>
                <option value="awaiting_payment">Awaiting payment</option>
                <option value="past_due">Payment failed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Client Table */}
            <div className="card" style={{ padding: 0, borderRadius: 16, overflow: 'hidden', background: 'var(--surface)', border: '1px solid var(--line)' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13.5 }}>
                  <thead>
                    <tr style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--line)' }}>
                      <th style={{ padding: '12px 16px' }}>Business</th>
                      <th style={{ padding: '12px 16px' }}>Type</th>
                      <th style={{ padding: '12px 16px' }}>Agency Partner</th>
                      <th style={{ padding: '12px 16px' }}>Feedback</th>
                      <th style={{ padding: '12px 16px' }}>Plan</th>
                      <th style={{ padding: '12px 16px' }}>Payment Status</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {refreshing ? (
                      renderTableSkeletonRows(['140px', '90px', '110px', '85px', '65px', '120px', '140px'], 6)
                    ) : clientsFiltered.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ padding: 32, textAlign: 'center', color: 'var(--muted)' }}>
                          No client businesses found matching filters.
                        </td>
                      </tr>
                    ) : (
                      clientsFiltered.map((c) => (
                        <tr key={c.id} style={{ borderBottom: '1px solid var(--line)' }}>
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ fontWeight: 700 }}>{c.name}</div>
                            <div style={{ fontSize: 12, color: 'var(--muted)' }}>{c.city || '–'}</div>
                          </td>
                          <td style={{ padding: '12px 16px' }}>{c.type || 'Other'}</td>
                          <td style={{ padding: '12px 16px' }}>
                            {c.agency_name ? <span style={{ fontWeight: 600 }}>{c.agency_name}</span> : <span style={{ color: 'var(--muted)' }}>Direct</span>}
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <span>{c.feedback_count || 0} reviews</span>
                            {c.avg_rating ? <span style={{ marginLeft: 6, color: '#f59e0b', fontWeight: 600 }}>({Number(c.avg_rating).toFixed(1)} ★)</span> : null}
                          </td>
                          <td style={{ padding: '12px 16px', textTransform: 'capitalize' }}>{c.plan}</td>
                          <td style={{ padding: '12px 16px' }}>
                            <select
                              value={c.pay_status || 'awaiting_payment'}
                              onChange={(e) => handleUpdatePayStatus(c.id, e.target.value)}
                              style={{
                                fontSize: 12,
                                fontWeight: 700,
                                padding: '4px 8px',
                                borderRadius: 8,
                                border: '1px solid var(--line)',
                                background: c.pay_status === 'paid' ? 'var(--green-soft)' : 'var(--orange-soft)',
                                color: c.pay_status === 'paid' ? 'var(--green)' : 'var(--orange)',
                                cursor: 'pointer',
                              }}
                            >
                              <option value="awaiting_payment">Awaiting payment</option>
                              <option value="paid">Paid</option>
                              <option value="past_due">Payment failed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: 6 }}>
                              <Link
                                href={`/dashboard?b=${c.id}`}
                                className="btn s"
                                style={{ fontSize: 12, padding: '4px 10px', textDecoration: 'none' }}
                              >
                                Dashboard ↗
                              </Link>
                              <button
                                type="button"
                                className="btn s"
                                style={{ fontSize: 12, padding: '4px 10px' }}
                                onClick={() => setSelectedClient(c)}
                              >
                                Inspect
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* LEADS TAB */}
        {tab === 'leads' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h2 style={{ fontSize: 22, margin: '0 0 4px' }}>Website Sign-ups</h2>
                <p style={{ margin: 0, color: 'var(--muted)', fontSize: 13 }}>
                  People who filled in the sign-up form on neario. Nothing is created until you click &quot;Create account&quot;.
                </p>
              </div>
              <button
                type="button"
                className="btn s btn-sm"
                disabled={refreshing}
                onClick={() => refreshData({ showSkeleton: true })}
              >
                <span className={refreshing ? 'spin-icon' : ''} aria-hidden="true">↻</span>
                <span>{refreshing ? 'Refreshing…' : 'Refresh'}</span>
              </button>
            </div>

            <div className="card" style={{ padding: 0, borderRadius: 16, overflow: 'hidden', background: 'var(--surface)', border: '1px solid var(--line)' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13.5 }}>
                  <thead>
                    <tr style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--line)' }}>
                      <th style={{ padding: '12px 16px' }}>Date</th>
                      <th style={{ padding: '12px 16px' }}>Business</th>
                      <th style={{ padding: '12px 16px' }}>Contact</th>
                      <th style={{ padding: '12px 16px' }}>Plan / Notes</th>
                      <th style={{ padding: '12px 16px' }}>Status</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {refreshing ? (
                      renderTableSkeletonRows(['56px', '150px', '185px', '72px', '78px', '165px'], 6)
                    ) : leads.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ padding: 32, textAlign: 'center', color: 'var(--muted)' }}>
                          No website sign-ups yet. New leads from the landing page form will appear here.
                        </td>
                      </tr>
                    ) : (
                      leads.map((l) => {
                        const isNew = l.status === 'new';
                        const isConverting = convertingLeadId === l.id;
                        const isDismissing = dismissingLeadId === l.id;
                        const rowBusy = isConverting || isDismissing;
                        return (
                          <tr key={l.id} style={{ borderBottom: '1px solid var(--line)' }}>
                            <td style={{ padding: '12px 16px', color: 'var(--muted)', fontSize: 12 }}>
                              {new Date(l.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              <div style={{ fontWeight: 700 }}>{l.business_name}</div>
                              <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                                {l.kind === 'agency' ? 'Agency Partner' : (l.business_type || 'Business')}
                                {l.city ? ` · ${l.city}` : ''}
                              </div>
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              <div style={{ fontWeight: 600 }}>{l.contact_name || l.email}</div>
                              <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                                {l.email}
                                {l.phone ? ` · +${l.phone}` : ''}
                              </div>
                            </td>
                            <td style={{ padding: '12px 16px', fontSize: 12 }}>
                              <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{l.plan || 'yearly'}</span>
                              {l.notes && <div style={{ color: 'var(--muted)', marginTop: 2 }}>{l.notes}</div>}
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              <span
                                style={{
                                  fontSize: 11,
                                  fontWeight: 700,
                                  padding: '3px 8px',
                                  borderRadius: 99,
                                  background: isNew ? 'var(--blue-soft, #e0f2fe)' : l.status === 'converted' ? 'var(--green-soft)' : 'var(--surface-2)',
                                  color: isNew ? '#0284c7' : l.status === 'converted' ? 'var(--green)' : 'var(--muted)',
                                }}
                              >
                                {isNew ? 'New' : l.status === 'converted' ? 'Converted' : 'Dismissed'}
                              </span>
                            </td>
                            <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                              {isNew ? (
                                <div style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                                  <button
                                    type="button"
                                    className="btn p btn-xs"
                                    disabled={rowBusy || convertingLeadId !== null}
                                    onClick={() => handleConvertLead(l)}
                                  >
                                    {isConverting ? (
                                      <span className="btn-loading">
                                        <span className="spinner" aria-hidden="true" />
                                        <span>Creating…</span>
                                      </span>
                                    ) : (
                                      'Create account'
                                    )}
                                  </button>
                                  <button
                                    type="button"
                                    className="btn s btn-xs"
                                    disabled={rowBusy || dismissingLeadId !== null}
                                    onClick={() => handleDismissLead(l.id)}
                                  >
                                    {isDismissing ? (
                                      <span className="btn-loading">
                                        <span className="spinner spinner-dark" aria-hidden="true" />
                                        <span>Dismissing…</span>
                                      </span>
                                    ) : (
                                      'Dismiss'
                                    )}
                                  </button>
                                </div>
                              ) : l.status === 'converted' ? (
                                <span style={{ fontSize: 12, color: 'var(--green)', fontWeight: 600 }}>✓ Account active</span>
                              ) : (
                                <span style={{ fontSize: 12, color: 'var(--muted)' }}>Dismissed</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* AGENCIES TAB */}
        {tab === 'agencies' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h2 style={{ fontSize: 22, margin: '0 0 4px' }}>Agency Partners</h2>
                <p style={{ margin: 0, color: 'var(--muted)', fontSize: 13 }}>
                  Agencies that onboard and manage client businesses on Neario ReviewFlow.
                </p>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button
                  type="button"
                  className="btn s btn-sm"
                  disabled={refreshing}
                  onClick={() => refreshData({ showSkeleton: true })}
                >
                  <span className={refreshing ? 'spin-icon' : ''} aria-hidden="true">↻</span>
                  <span>{refreshing ? 'Refreshing…' : 'Refresh'}</span>
                </button>
                <button type="button" className="btn p btn-sm" onClick={() => setNewAgModal(true)}>+ Onboard Agency</button>
              </div>
            </div>

            {/* Agency Partners Table */}
            <div className="card" style={{ padding: 0, borderRadius: 16, overflow: 'hidden', background: 'var(--surface)', border: '1px solid var(--line)' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13.5 }}>
                  <thead>
                    <tr style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--line)' }}>
                      <th style={{ padding: '12px 16px' }}>Agency Name</th>
                      <th style={{ padding: '12px 16px' }}>Clients Managed</th>
                      <th style={{ padding: '12px 16px' }}>Created Date</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {refreshing ? (
                      renderTableSkeletonRows(['170px', '90px', '100px', '110px'], 4)
                    ) : agencies.length === 0 ? (
                      <tr>
                        <td colSpan={4} style={{ padding: 32, textAlign: 'center', color: 'var(--muted)' }}>
                          No agencies registered yet. Click &apos;+ Onboard Agency&apos; to create your first partner.
                        </td>
                      </tr>
                    ) : (
                      agencies.map((a) => {
                        const clientCount = businesses.filter((b) => b.agency_id === a.id).length;
                        return (
                          <tr key={a.id} style={{ borderBottom: '1px solid var(--line)' }}>
                            <td style={{ padding: '12px 16px', fontWeight: 700 }}>{a.name}</td>
                            <td style={{ padding: '12px 16px' }}>{clientCount} clients</td>
                            <td style={{ padding: '12px 16px', color: 'var(--muted)' }}>
                              {new Date(a.created_at).toLocaleDateString()}
                            </td>
                            <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                              <button
                                type="button"
                                className="btn s"
                                style={{ fontSize: 12, padding: '4px 10px' }}
                                onClick={() => {
                                  setFAgency(a.name);
                                  setTab('clients');
                                }}
                              >
                                View Clients →
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* AUDIT TAB */}
        {tab === 'audit' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h2 style={{ fontSize: 22, margin: '0 0 4px' }}>View-As Audit Trail</h2>
                <p style={{ margin: 0, color: 'var(--muted)', fontSize: 13 }}>
                  Live transparency log: Every time an agency user or Neario operator opens client feedback, it is recorded here.
                </p>
              </div>
              <button
                type="button"
                className="btn s btn-sm"
                disabled={refreshing}
                onClick={() => refreshData({ showSkeleton: true })}
              >
                <span className={refreshing ? 'spin-icon' : ''} aria-hidden="true">↻</span>
                <span>{refreshing ? 'Refreshing…' : 'Refresh'}</span>
              </button>
            </div>

            <div className="card" style={{ padding: 0, borderRadius: 16, overflow: 'hidden', background: 'var(--surface)', border: '1px solid var(--line)' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--line)' }}>
                      <th style={{ padding: '10px 14px' }}>Timestamp</th>
                      <th style={{ padding: '10px 14px' }}>Actor</th>
                      <th style={{ padding: '10px 14px' }}>Agency</th>
                      <th style={{ padding: '10px 14px' }}>Client Business</th>
                      <th style={{ padding: '10px 14px' }}>Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {refreshing ? (
                      renderTableSkeletonRows(['140px', '130px', '110px', '140px', '140px'], 5)
                    ) : viewLogs.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ padding: 24, textAlign: 'center', color: 'var(--muted)' }}>
                          No view-as events recorded yet.
                        </td>
                      </tr>
                    ) : (
                      viewLogs.map((log) => (
                        <tr key={log.id} style={{ borderBottom: '1px solid var(--line)' }}>
                          <td style={{ padding: '10px 14px', color: 'var(--muted)' }}>
                            {new Date(log.created_at).toLocaleString()}
                          </td>
                          <td style={{ padding: '10px 14px', fontWeight: 600 }}>{log.actor_name || log.actor_email}</td>
                          <td style={{ padding: '10px 14px' }}>{log.actor_agency || 'Neario Admin'}</td>
                          <td style={{ padding: '10px 14px', fontWeight: 600 }}>{log.business_name}</td>
                          <td style={{ padding: '10px 14px' }}>{log.reason || 'Opened dashboard'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Detail Drawer for Client */}
      {selectedClient && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', justifyContent: 'flex-end', background: 'rgba(0,0,0,0.3)' }}>
          <div style={{ width: '100%', maxWidth: 440, background: 'var(--surface)', height: '100%', padding: 28, display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 99, background: 'var(--green-soft)', color: 'var(--green)' }}>
                {selectedClient.pay_status}
              </span>
              <button type="button" className="x" onClick={() => setSelectedClient(null)}>✕</button>
            </div>

            <h2 style={{ margin: 0, fontSize: 24 }}>{selectedClient.name}</h2>
            <p style={{ margin: 0, color: 'var(--muted)', fontSize: 14 }}>{selectedClient.type} · {selectedClient.city || 'India'}</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '10px 14px', fontSize: 13.5, margin: '14px 0' }}>
              <span style={{ color: 'var(--muted)' }}>Managed By</span>
              <b>{selectedClient.agency_name || 'Direct Client'}</b>

              <span style={{ color: 'var(--muted)' }}>Plan</span>
              <b>{selectedClient.plan} (₹{selectedClient.plan === 'yearly' ? '5,391/yr' : '599/mo'})</b>

              <span style={{ color: 'var(--muted)' }}>Payment Status</span>
              <div>
                <select
                  value={selectedClient.pay_status || 'awaiting_payment'}
                  onChange={async (e) => {
                    const newStatus = e.target.value;
                    await handleUpdatePayStatus(selectedClient.id, newStatus);
                    setSelectedClient({ ...selectedClient, pay_status: newStatus });
                  }}
                  style={{
                    fontSize: 12.5,
                    fontWeight: 700,
                    padding: '4px 8px',
                    borderRadius: 8,
                    border: '1px solid var(--line)',
                    background: selectedClient.pay_status === 'paid' ? 'var(--green-soft)' : 'var(--orange-soft)',
                    color: selectedClient.pay_status === 'paid' ? 'var(--green)' : 'var(--orange)',
                  }}
                >
                  <option value="awaiting_payment">Awaiting payment</option>
                  <option value="paid">Paid</option>
                  <option value="past_due">Payment failed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <span style={{ color: 'var(--muted)' }}>Feedback Count</span>
              <b>{selectedClient.feedback_count || 0} reviews</b>

              <span style={{ color: 'var(--muted)' }}>Created</span>
              <b>{new Date(selectedClient.created_at).toLocaleDateString()}</b>
            </div>

            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Link href={`/dashboard?b=${selectedClient.id}`} className="btn p" style={{ textDecoration: 'none', textAlign: 'center' }}>
                Open Client Dashboard →
              </Link>
              <button type="button" className="btn s" onClick={() => setSelectedClient(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Agency Modal */}
      {newAgModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'grid', placeItems: 'center', background: 'rgba(0,0,0,0.45)', padding: 16 }}>
          <div className="card" style={{ width: '100%', maxWidth: 500, padding: '24px 26px', borderRadius: 18, background: 'var(--surface)', border: '1px solid var(--line)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
              <div>
                <h2 style={{ margin: '0 0 4px', fontSize: 20 }}>Onboard New Agency Partner</h2>
                <p style={{ color: 'var(--muted)', margin: 0, fontSize: 13 }}>
                  {createdInvite
                    ? 'Agency onboarded! Send this setup link (valid for 7 days):'
                    : 'The agency will manage multiple client businesses and receive a co-branded portal.'}
                </p>
              </div>
              <button
                type="button"
                aria-label="Close modal"
                onClick={() => {
                  setCreatedInvite(null);
                  setNewAgModal(false);
                }}
                style={{ width: 32, height: 32, borderRadius: 9, border: '1px solid var(--line)', background: 'var(--surface-2)', cursor: 'pointer', fontSize: 14, flexShrink: 0 }}
              >
                ✕
              </button>
            </div>

            {createdInvite ? (
              renderInviteShareSection({
                link: createdInvite.link,
                email: createdInvite.email,
                businessName: createdInvite.name,
                onClose: () => {
                  setCreatedInvite(null);
                  setNewAgModal(false);
                },
              })
            ) : (
              <form onSubmit={handleCreateAgency} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <label className="f2">
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Agency Name</span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pixel & Co Marketing"
                    value={agName}
                    onChange={(e) => setAgName(e.target.value)}
                    className="inp"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface-2)' }}
                  />
                </label>

                <label className="f2">
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Agency Manager Name</span>
                  <input
                    type="text"
                    placeholder="e.g. Asha Verma"
                    value={agOwnerName}
                    onChange={(e) => setAgOwnerName(e.target.value)}
                    className="inp"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface-2)' }}
                  />
                </label>

                <label className="f2">
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Agency Manager Email</span>
                  <input
                    type="email"
                    required
                    placeholder="asha@pixelco.com"
                    value={agOwnerEmail}
                    onChange={(e) => setAgOwnerEmail(e.target.value)}
                    className="inp"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface-2)' }}
                  />
                </label>

                <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                  <button type="button" className="btn s btn-sm" onClick={() => setNewAgModal(false)} style={{ flex: 1 }}>Cancel</button>
                  <button type="submit" className="btn p btn-sm" disabled={creatingAgency} style={{ flex: 2 }}>
                    {creatingAgency ? (
                      <span className="btn-loading">
                        <span className="spinner" aria-hidden="true" />
                        <span>Creating Agency…</span>
                      </span>
                    ) : (
                      'Create Agency & Generate Invite'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Add Client Modal */}
      {newCliModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'grid', placeItems: 'center', background: 'rgba(0,0,0,0.45)', padding: 16 }}>
          <div className="card" style={{ width: '100%', maxWidth: 500, padding: '24px 26px', borderRadius: 18, background: 'var(--surface)', border: '1px solid var(--line)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
              <div>
                <h2 style={{ margin: '0 0 4px', fontSize: 20 }}>Add Client Business</h2>
                <p style={{ color: 'var(--muted)', margin: 0, fontSize: 13 }}>
                  {cliCreatedInvite
                    ? 'Client created! Send this setup link to the business owner (valid for 7 days):'
                    : 'Create a new client business. They will receive their own login invite.'}
                </p>
              </div>
              <button
                type="button"
                aria-label="Close modal"
                onClick={() => {
                  setCliCreatedInvite(null);
                  setNewCliModal(false);
                }}
                style={{ width: 32, height: 32, borderRadius: 9, border: '1px solid var(--line)', background: 'var(--surface-2)', cursor: 'pointer', fontSize: 14, flexShrink: 0 }}
              >
                ✕
              </button>
            </div>

            {cliCreatedInvite ? (
              renderInviteShareSection({
                link: cliCreatedInvite.link,
                email: cliCreatedInvite.email,
                businessName: cliCreatedInvite.name,
                onClose: () => {
                  setCliCreatedInvite(null);
                  setNewCliModal(false);
                },
              })
            ) : (
              <form onSubmit={handleCreateClient} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <label className="f2">
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Business Name</span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Copper Chimney"
                    value={cliName}
                    onChange={(e) => setCliName(e.target.value)}
                    className="inp"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface-2)' }}
                  />
                </label>

                <div style={{ display: 'flex', gap: 10 }}>
                  <label className="f2" style={{ flex: 1 }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>Type</span>
                    <select
                      value={cliType}
                      onChange={(e) => setCliType(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface-2)' }}
                    >
                      <option>Salon or spa</option>
                      <option>Restaurant or café</option>
                      <option>Clinic</option>
                      <option>Retail</option>
                      <option>Other</option>
                    </select>
                  </label>

                  <label className="f2" style={{ flex: 1 }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>City</span>
                    <input
                      type="text"
                      placeholder="Bengaluru"
                      value={cliCity}
                      onChange={(e) => setCliCity(e.target.value)}
                      className="inp"
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface-2)' }}
                    />
                  </label>
                </div>

                <label className="f2">
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Owner Name</span>
                  <input
                    type="text"
                    placeholder="Priya Sharma"
                    value={cliOwner}
                    onChange={(e) => setCliOwner(e.target.value)}
                    className="inp"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface-2)' }}
                  />
                </label>

                <label className="f2">
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Owner Email (for their login)</span>
                  <input
                    type="email"
                    required
                    placeholder="priya@example.com"
                    value={cliEmail}
                    onChange={(e) => setCliEmail(e.target.value)}
                    className="inp"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface-2)' }}
                  />
                </label>

                <div style={{ display: 'flex', gap: 10 }}>
                  <label className="f2" style={{ flex: 1 }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>Assign Agency</span>
                    <select
                      value={cliAgId}
                      onChange={(e) => setCliAgId(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface-2)' }}
                    >
                      <option value="">Direct Client (No Agency)</option>
                      {agencies.map((a) => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                      ))}
                    </select>
                  </label>

                  <label className="f2" style={{ flex: 1 }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>Plan</span>
                    <select
                      value={cliPlan}
                      onChange={(e) => setCliPlan(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface-2)' }}
                    >
                      <option value="yearly">Yearly (₹5,391)</option>
                      <option value="monthly">Monthly (₹599)</option>
                    </select>
                  </label>
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                  <button type="button" className="btn s btn-sm" onClick={() => setNewCliModal(false)} style={{ flex: 1 }}>Cancel</button>
                  <button type="submit" className="btn p btn-sm" disabled={creatingClient} style={{ flex: 2 }}>
                    {creatingClient ? (
                      <span className="btn-loading">
                        <span className="spinner" aria-hidden="true" />
                        <span>Creating Client…</span>
                      </span>
                    ) : (
                      'Create Client & Generate Invite'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Lead Conversion / Invite Modal */}
      {inviteModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 110, display: 'grid', placeItems: 'center', background: 'rgba(0,0,0,0.5)', padding: 16 }}>
          <div className="card" style={{ width: '100%', maxWidth: 520, padding: '24px 26px', borderRadius: 18, background: 'var(--surface)', border: '1px solid var(--line)', boxShadow: '0 20px 50px rgba(0,0,0,0.18)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <span style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--green-soft)', color: 'var(--green)', display: 'grid', placeItems: 'center', fontWeight: 800, flexShrink: 0 }}>✓</span>
                <div>
                  <h2 style={{ margin: '0 0 4px', fontSize: 19 }}>{inviteModal.title}</h2>
                  <p style={{ color: 'var(--muted)', margin: 0, fontSize: 13, lineHeight: 1.4 }}>
                    Account created. Send this setup link so the owner can set their password (valid for 7 days):
                  </p>
                </div>
              </div>
              <button
                type="button"
                aria-label="Close modal"
                onClick={() => setInviteModal(null)}
                style={{ width: 32, height: 32, borderRadius: 9, border: '1px solid var(--line)', background: 'var(--surface-2)', cursor: 'pointer', fontSize: 14, flexShrink: 0 }}
              >
                ✕
              </button>
            </div>

            {renderInviteShareSection({
              link: inviteModal.link,
              email: inviteModal.email,
              businessName: inviteModal.businessName,
              waUrl: inviteModal.waUrl,
              onClose: () => setInviteModal(null),
            })}
          </div>
        </div>
      )}
    </div>
  );
}

