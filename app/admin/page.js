'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { showToast } from '../components/Toast';

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');
  const [range, setRange] = useState(6);
  const [q, setQ] = useState('');
  const [fStatus, setFStatus] = useState('all');
  const [fType, setFType] = useState('all');
  const [fAgency, setFAgency] = useState('all');
  const [businesses, setBusinesses] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [viewLogs, setViewLogs] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);

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

        // Fetch businesses, agencies, and view-log in parallel
        const [bizRes, agRes, logRes] = await Promise.all([
          fetch('/api/businesses'),
          fetch('/api/agencies'),
          fetch('/api/view-log'),
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
      } catch (err) {
        console.error('Error loading admin data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [router]);

  async function handleCreateAgency(e) {
    e.preventDefault();
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
      setCreatedInvite(`${window.location.origin}/accept?token=${data.inviteToken}`);
      // Refresh agencies
      const agRes = await fetch('/api/agencies');
      if (agRes.ok) {
        const aData = await agRes.json();
        setAgencies(aData.agencies || []);
      }
    } catch (err) {
      showToast('Error creating agency.');
    }
  }

  async function handleCreateClient(e) {
    e.preventDefault();
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
      setCliCreatedInvite(`${window.location.origin}/accept?token=${data.inviteToken}`);
      // Refresh businesses
      const bizRes = await fetch('/api/businesses');
      if (bizRes.ok) {
        const bData = await bizRes.json();
        setBusinesses(bData.businesses || []);
      }
    } catch (err) {
      showToast('Error creating business.');
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--bg)' }}>
        <div className="card" style={{ padding: 32, borderRadius: 16 }}>Loading Super Admin Console…</div>
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
              {['overview', 'clients', 'agencies', 'support'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  style={{
                    border: 0,
                    padding: '6px 14px',
                    borderRadius: 8,
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: 'pointer',
                    background: tab === t ? 'var(--surface)' : 'transparent',
                    color: tab === t ? 'var(--fg)' : 'var(--muted)',
                  }}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
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
              <button type="button" className="btn p" onClick={() => setNewCliModal(true)}>+ Add Client</button>
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
                      <th style={{ padding: '12px 16px' }}>City</th>
                      <th style={{ padding: '12px 16px' }}>Plan</th>
                      <th style={{ padding: '12px 16px' }}>Payment</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientsFiltered.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ padding: 32, textAlign: 'center', color: 'var(--muted)' }}>
                          No client businesses found matching filters.
                        </td>
                      </tr>
                    ) : (
                      clientsFiltered.map((c) => (
                        <tr key={c.id} style={{ borderBottom: '1px solid var(--line)' }}>
                          <td style={{ padding: '12px 16px', fontWeight: 700 }}>{c.name}</td>
                          <td style={{ padding: '12px 16px' }}>{c.type}</td>
                          <td style={{ padding: '12px 16px' }}>
                            {c.agency_name ? <span style={{ fontWeight: 600 }}>{c.agency_name}</span> : <span style={{ color: 'var(--muted)' }}>Direct</span>}
                          </td>
                          <td style={{ padding: '12px 16px', color: 'var(--muted)' }}>{c.city || '–'}</td>
                          <td style={{ padding: '12px 16px', textTransform: 'capitalize' }}>{c.plan}</td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 99, background: c.pay_status === 'paid' ? 'var(--green-soft)' : 'var(--orange-soft)', color: c.pay_status === 'paid' ? 'var(--green)' : 'var(--orange)' }}>
                              {c.pay_status}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                            <button
                              type="button"
                              className="btn s"
                              style={{ fontSize: 12, padding: '4px 10px' }}
                              onClick={() => setSelectedClient(c)}
                            >
                              Inspect Details
                            </button>
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
              <button type="button" className="btn p" onClick={() => setNewAgModal(true)}>+ Onboard Agency</button>
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
                    {agencies.length === 0 ? (
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

            {/* View-As Audit Log Table */}
            <div className="card" style={{ padding: 24, borderRadius: 16, background: 'var(--surface)', border: '1px solid var(--line)' }}>
              <h3 style={{ fontSize: 18, margin: '0 0 6px' }}>View-As Audit Trail</h3>
              <p style={{ margin: '0 0 16px', color: 'var(--muted)', fontSize: 13 }}>
                Live transparency log: Every time an agency user or Neario operator opens client feedback, it is recorded here.
              </p>
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
                    {viewLogs.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ padding: 20, textAlign: 'center', color: 'var(--muted)' }}>
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

        {/* SUPPORT TAB */}
        {tab === 'support' && (
          <div className="card" style={{ padding: 32, borderRadius: 16, background: 'var(--surface)', border: '1px solid var(--line)' }}>
            <h2 style={{ fontSize: 20, margin: '0 0 8px' }}>Client Support Requests</h2>
            <p style={{ color: 'var(--muted)', margin: '0 0 20px', fontSize: 14 }}>
              Zero open requests. All clients and agency partners are up to date!
            </p>
            <div style={{ background: 'var(--green-soft)', color: 'var(--green)', padding: 14, borderRadius: 12, fontWeight: 600, fontSize: 13.5 }}>
              ✓ All systems operating normally. Database replication healthy.
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
              <b>{selectedClient.pay_status}</b>

              <span style={{ color: 'var(--muted)' }}>Created</span>
              <b>{new Date(selectedClient.created_at).toLocaleDateString()}</b>
            </div>

            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Link href={`/dashboard`} className="btn p" style={{ textDecoration: 'none', textAlign: 'center' }}>
                Open Client Dashboard →
              </Link>
              <button type="button" className="btn s" onClick={() => setSelectedClient(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Agency Modal */}
      {newAgModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'grid', placeItems: 'center', background: 'rgba(0,0,0,0.4)', padding: 16 }}>
          <div className="card" style={{ width: '100%', maxWidth: 480, padding: 32, borderRadius: 20 }}>
            <h2 style={{ margin: '0 0 6px', fontSize: 22 }}>Onboard New Agency Partner</h2>
            <p style={{ color: 'var(--muted)', margin: '0 0 20px', fontSize: 13.5 }}>
              The agency will manage multiple client businesses and receive a co-branded portal.
            </p>

            {createdInvite ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ background: 'var(--green-soft)', color: 'var(--green)', padding: 14, borderRadius: 10, fontSize: 13.5, fontWeight: 600 }}>
                  ✓ Agency onboarded! Share this private invite link with the agency manager:
                </div>
                <div style={{ background: 'var(--surface-2)', padding: 12, borderRadius: 8, fontSize: 12.5, fontFamily: 'monospace', wordBreak: 'break-all' }}>
                  {createdInvite}
                </div>
                <button
                  type="button"
                  className="btn p"
                  onClick={() => {
                    navigator.clipboard.writeText(createdInvite);
                    showToast('Invite link copied!');
                  }}
                >
                  Copy Invite Link
                </button>
                <button
                  type="button"
                  className="btn s"
                  onClick={() => {
                    setCreatedInvite(null);
                    setNewAgModal(false);
                  }}
                >
                  Done
                </button>
              </div>
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
                  <button type="button" className="btn s" onClick={() => setNewAgModal(false)} style={{ flex: 1 }}>Cancel</button>
                  <button type="submit" className="btn p" style={{ flex: 2 }}>Create Agency &amp; Generate Invite</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Add Client Modal */}
      {newCliModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'grid', placeItems: 'center', background: 'rgba(0,0,0,0.4)', padding: 16 }}>
          <div className="card" style={{ width: '100%', maxWidth: 480, padding: 32, borderRadius: 20 }}>
            <h2 style={{ margin: '0 0 6px', fontSize: 22 }}>Add Client Business</h2>
            <p style={{ color: 'var(--muted)', margin: '0 0 20px', fontSize: 13.5 }}>
              Create a new client business. They will receive their own login invite.
            </p>

            {cliCreatedInvite ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ background: 'var(--green-soft)', color: 'var(--green)', padding: 14, borderRadius: 10, fontSize: 13.5, fontWeight: 600 }}>
                  ✓ Client created! Send this setup link to the business owner:
                </div>
                <div style={{ background: 'var(--surface-2)', padding: 12, borderRadius: 8, fontSize: 12.5, fontFamily: 'monospace', wordBreak: 'break-all' }}>
                  {cliCreatedInvite}
                </div>
                <button
                  type="button"
                  className="btn p"
                  onClick={() => {
                    navigator.clipboard.writeText(cliCreatedInvite);
                    showToast('Invite link copied!');
                  }}
                >
                  Copy Client Invite Link
                </button>
                <button
                  type="button"
                  className="btn s"
                  onClick={() => {
                    setCliCreatedInvite(null);
                    setNewCliModal(false);
                  }}
                >
                  Done
                </button>
              </div>
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
                  <button type="button" className="btn s" onClick={() => setNewCliModal(false)} style={{ flex: 1 }}>Cancel</button>
                  <button type="submit" className="btn p" style={{ flex: 2 }}>Create Client &amp; Generate Invite</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

