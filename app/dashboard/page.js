'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { showToast } from '../components/Toast';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [businesses, setBusinesses] = useState([]);
  const [activeBizIndex, setActiveBizIndex] = useState(0);
  const [mode, setMode] = useState('owner'); // 'owner' | 'agency'
  const [route, setRoute] = useState('overview'); // 'overview' | 'feedback' | 'fixit' | 'campaigns' | 'reports' | 'agency' | 'viewlog'
  const [feedbackList, setFeedbackList] = useState([]);
  const [viewLogs, setViewLogs] = useState([]);
  const [loadingFeedback, setLoadingFeedback] = useState(false);

  // Filters inside feedback view
  const [ratingFilter, setRatingFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Add Client Modal (Agency Mode)
  const [addClientModal, setAddClientModal] = useState(false);
  const [acName, setAcName] = useState('');
  const [acType, setAcType] = useState('Salon or spa');
  const [acLoc, setAcLoc] = useState('');
  const [acOwner, setAcOwner] = useState('');
  const [acEmail, setAcEmail] = useState('');
  const [acPlan, setAcPlan] = useState('yearly');
  const [acConsent, setAcConsent] = useState(false);
  const [createdClientInvite, setCreatedClientInvite] = useState(null);

  // Print Kit Options
  const [pkLang, setPkLang] = useState('en');
  const [pkSize, setPkSize] = useState('A5');

  // Load User and Businesses on Mount
  useEffect(() => {
    async function init() {
      try {
        const meRes = await fetch('/api/me');
        if (!meRes.ok) {
          router.push('/login');
          return;
        }
        const meData = await meRes.json();
        setUser(meData.user);

        if (meData.user.role === 'agency_user') {
          setMode('agency');
          setRoute('agency');
        }

        const bizRes = await fetch('/api/businesses');
        if (bizRes.ok) {
          const bData = await bizRes.json();
          setBusinesses(bData.businesses || []);
        }

        const logRes = await fetch('/api/view-log');
        if (logRes.ok) {
          const lData = await logRes.json();
          setViewLogs(lData.log || []);
        }
      } catch (err) {
        console.error('Dashboard init error:', err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [router]);

  const activeBiz = businesses[activeBizIndex] || null;

  // Load Feedback whenever active business changes
  useEffect(() => {
    async function fetchFeedback() {
      if (!activeBiz) return;
      setLoadingFeedback(true);
      try {
        const res = await fetch(`/api/businesses/${activeBiz.id}/feedback?reason=Opened dashboard`);
        if (res.ok) {
          const data = await res.json();
          setFeedbackList(data.feedback || []);
        }
      } catch (err) {
        console.error('Fetch feedback error:', err);
      } finally {
        setLoadingFeedback(false);
      }
    }
    fetchFeedback();
  }, [activeBiz]);

  // Statistics Computations
  const stats = useMemo(() => {
    const total = feedbackList.length;
    if (!total) {
      return { total: 0, avg: '0.0', sat: 0, low: 0, high: 0 };
    }
    const sum = feedbackList.reduce((acc, f) => acc + f.rating, 0);
    const avg = (sum / total).toFixed(1);
    const high = feedbackList.filter((f) => f.rating >= 4).length;
    const low = feedbackList.filter((f) => f.rating <= 3).length;
    const sat = Math.round((high / total) * 100);
    return { total, avg, sat, low, high };
  }, [feedbackList]);

  const lowRatedFeedback = useMemo(() => feedbackList.filter((f) => f.rating <= 3), [feedbackList]);

  // Client Filtered Feedback
  const filteredFeedback = useMemo(() => {
    return feedbackList.filter((f) => {
      const matchR =
        ratingFilter === 'all' ||
        (ratingFilter === '3' ? f.rating <= 3 : f.rating === Number(ratingFilter));
      const haystack = `${f.text || ''} ${f.service || ''} ${(Array.isArray(f.tags) ? f.tags.join(' ') : '')}`.toLowerCase();
      const matchQ = !searchQuery.trim() || haystack.includes(searchQuery.toLowerCase());
      return matchR && matchQ;
    });
  }, [feedbackList, ratingFilter, searchQuery]);

  async function handleAddClient(e) {
    e.preventDefault();
    if (!acName.trim()) {
      showToast('Enter the business name.');
      return;
    }
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(acEmail.trim())) {
      showToast('Enter a valid owner email address.');
      return;
    }
    if (!acConsent) {
      showToast('Please confirm client owner permission.');
      return;
    }
    try {
      const res = await fetch('/api/businesses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: acName.trim(),
          type: acType,
          city: acLoc.trim(),
          ownerName: acOwner.trim(),
          ownerEmail: acEmail.trim(),
          plan: acPlan,
          ownerPermission: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Failed to add client');
        return;
      }
      showToast(`Client ${acName} added!`);
      setCreatedClientInvite(`${window.location.origin}/accept?token=${data.inviteToken}`);
      const bizRes = await fetch('/api/businesses');
      if (bizRes.ok) {
        const bData = await bizRes.json();
        setBusinesses(bData.businesses || []);
      }
    } catch (err) {
      showToast('Error adding client.');
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--bg)' }}>
        <div className="card" style={{ padding: 32, borderRadius: 16 }}>Loading Dashboard…</div>
      </div>
    );
  }

  const isAgencyUser = user?.role === 'agency_user' || user?.role === 'super_admin';
  const agencyName = user?.role === 'agency_user' ? (businesses[0]?.agency_name || 'Your Agency') : 'Neario Operator';
  const liveQrUrl = typeof window !== 'undefined' && activeBiz ? `${window.location.origin}/feedback/${activeBiz.id}` : `/feedback/${activeBiz?.id || 1}`;

  function renderFeedbackMeta(f) {
    const tags = Array.isArray(f.tags) ? f.tags : [];
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6, alignItems: 'center' }}>
        {f.service && (
          <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: 'var(--sage)', color: 'var(--sage-ink)' }}>
            {f.service}
          </span>
        )}
        {f.lang && (
          <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 7px', borderRadius: 99, background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--muted)', textTransform: 'uppercase' }}>
            {f.lang}
          </span>
        )}
        {tags.map((tg) => (
          <span key={tg} style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 99, background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--fg)' }}>
            {tg}
          </span>
        ))}
        {f.contact_ok && f.phone && (
          <a href={`tel:+${f.phone}`} style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--primary)', textDecoration: 'none', marginLeft: 4 }}>
            📞 +{f.phone}
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="app" style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)', color: 'var(--fg)', flexWrap: 'wrap' }}>
      {/* Sidebar Navigation */}
      <aside className="side" style={{ width: 260, flexShrink: 0, background: 'var(--surface)', borderRight: '1px solid var(--line)', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Link href="/" className="brand" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="mark" style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--primary)', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 800 }}>N</span>
          <span className="wm">
            <b style={{ fontSize: 20, letterSpacing: '-.04em', color: 'var(--accent-text)' }}>neario</b>
            <small style={{ fontSize: 8, letterSpacing: '.3em', fontWeight: 700, color: 'var(--muted)', display: 'block' }}>REVIEWFLOW</small>
          </span>
        </Link>

        {isAgencyUser && (
          <div style={{ fontSize: 11, fontWeight: 700, padding: '4px 8px', borderRadius: 6, background: 'var(--surface-2)', color: 'var(--muted)' }}>
            Agency: <b style={{ color: 'var(--fg)' }}>{agencyName}</b>
          </div>
        )}

        {businesses.length > 0 && mode === 'owner' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>Active Workspace</span>
            <select
              value={activeBizIndex}
              onChange={(e) => setActiveBizIndex(Number(e.target.value))}
              style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface-2)', fontWeight: 600, fontSize: 13 }}
            >
              {businesses.map((b, idx) => (
                <option key={b.id} value={idx}>{b.name}</option>
              ))}
            </select>
          </div>
        )}

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8 }}>
          {isAgencyUser && (
            <button
              type="button"
              onClick={() => {
                setMode('agency');
                setRoute('agency');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                borderRadius: 10,
                border: 0,
                fontSize: 13.5,
                fontWeight: 700,
                cursor: 'pointer',
                textAlign: 'left',
                background: mode === 'agency' ? 'var(--primary)' : 'transparent',
                color: mode === 'agency' ? '#fff' : 'inherit',
              }}
            >
              👥 Agency Overview ({businesses.length})
            </button>
          )}

          {[
            { id: 'overview', icon: '📊', label: 'Overview' },
            { id: 'feedback', icon: '💬', label: 'Feedback Feed', badge: stats.total || null },
            { id: 'fixit', icon: '📥', label: 'Fix-it Inbox', badge: stats.low || null },
            { id: 'campaigns', icon: '📷', label: 'Print QR Cards' },
            { id: 'reports', icon: '📄', label: 'Monthly Report' },
            { id: 'viewlog', icon: '🛡️', label: 'View-As Audit Log' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setMode('owner');
                setRoute(item.id);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                borderRadius: 10,
                border: 0,
                fontSize: 13.5,
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'left',
                background: mode === 'owner' && route === item.id ? 'var(--sage)' : 'transparent',
                color: mode === 'owner' && route === item.id ? 'var(--sage-ink)' : 'inherit',
              }}
            >
              <span>{item.icon}</span>
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge > 0 && (
                <span style={{ fontSize: 11, fontWeight: 700, padding: '1px 7px', borderRadius: 8, background: 'var(--surface)', border: '1px solid var(--line)' }}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, borderTop: '1px solid var(--line)', paddingTop: 12 }}>
          <Link href="/onboarding" style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)', textDecoration: 'none', padding: '6px 10px', borderRadius: 8 }}>
            ⚙️ Setup Wizard &amp; Services
          </Link>
          <a href="/demo/overview" style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)', textDecoration: 'none', padding: '6px 10px', borderRadius: 8 }}>
            ✨ Sample Data Demo ↗
          </a>
        </div>

        {/* User Info & Logout at bottom */}
        <div style={{ marginTop: 'auto', borderTop: '1px solid var(--line)', paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 12, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Logged in as:<br />
            <b style={{ color: 'var(--fg)' }}>{user?.email}</b> ({user?.role})
          </div>
          {user?.role === 'super_admin' && (
            <Link href="/admin" className="btn s" style={{ fontSize: 12, padding: '6px', textAlign: 'center', textDecoration: 'none' }}>
              🔐 Open Super Admin
            </Link>
          )}
          <button
            type="button"
            className="btn s"
            onClick={async () => {
              await fetch('/api/auth/logout', { method: 'POST' });
              router.push('/login');
            }}
            style={{ fontSize: 12, padding: '6px' }}
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Header */}
        <header style={{ padding: '16px 24px', background: 'var(--surface)', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 20 }}>
              {mode === 'agency' ? 'Agency Overview' : (activeBiz?.name || 'Workspace Dashboard')}
            </h1>
            <span style={{ fontSize: 12.5, color: 'var(--muted)' }}>
              {mode === 'agency'
                ? `Managing ${businesses.length} client businesses`
                : `${activeBiz?.type || 'Business'} · ${activeBiz?.city || 'India'} · Plan: ${activeBiz?.plan || 'yearly'}`}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {isAgencyUser && (
              <div style={{ display: 'inline-flex', background: 'var(--surface-2)', padding: 3, borderRadius: 8 }}>
                <button
                  type="button"
                  onClick={() => {
                    setMode('owner');
                    if (route === 'agency') setRoute('overview');
                  }}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 6,
                    border: 0,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: mode === 'owner' ? 'var(--surface)' : 'transparent',
                  }}
                >
                  Owner View
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('agency');
                    setRoute('agency');
                  }}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 6,
                    border: 0,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: mode === 'agency' ? 'var(--surface)' : 'transparent',
                  }}
                >
                  Agency View
                </button>
              </div>
            )}

            <Link href="/onboarding" className="btn s" style={{ fontSize: 12, padding: '7px 12px', textDecoration: 'none' }}>
              ⚙️ Setup Business
            </Link>

            {activeBiz && (
              <Link href={`/feedback/${activeBiz.id}`} target="_blank" className="btn p" style={{ fontSize: 12, padding: '7px 12px', textDecoration: 'none' }}>
                📱 Open QR Feedback Page ↗
              </Link>
            )}
          </div>
        </header>

        {/* Viewing-As Agency Banner */}
        {isAgencyUser && mode === 'owner' && activeBiz && (
          <div className="vas" style={{ background: 'var(--primary)', color: '#fff', padding: '10px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13.5, flexWrap: 'wrap', gap: 8 }}>
            <span>
              Viewing <b>{activeBiz.name}</b> as <b>{agencyName}</b>. This is your client&apos;s live dashboard (access logged).
            </span>
            <button
              type="button"
              className="ghost"
              onClick={() => {
                setMode('agency');
                setRoute('agency');
              }}
              style={{ background: 'rgba(255,255,255,0.18)', border: 0, color: '#fff', padding: '4px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 700 }}
            >
              Back to all clients
            </button>
          </div>
        )}

        <div style={{ padding: '24px', width: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {businesses.length === 0 && mode === 'owner' ? (
            <div className="card" style={{ padding: 36, borderRadius: 16, textAlign: 'center' }}>
              <h2 style={{ margin: '0 0 8px' }}>No Business Workspace Assigned</h2>
              <p style={{ color: 'var(--muted)', margin: '0 0 18px', fontSize: 14 }}>
                {isAgencyUser
                  ? 'Add a client business in Agency View to start collecting live feedback.'
                  : 'Ask your Neario administrator to link a business to your account.'}
              </p>
              {isAgencyUser && (
                <button type="button" className="btn p" onClick={() => { setMode('agency'); setAddClientModal(true); }}>
                  + Add Your First Client Business
                </button>
              )}
            </div>
          ) : null}

          {/* AGENCY VIEW MODE */}
          {mode === 'agency' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                <div className="card" style={{ padding: 18, borderRadius: 14 }}>
                  <span style={{ fontSize: 12, color: 'var(--muted)' }}>Clients Managed</span>
                  <b style={{ fontSize: 28, display: 'block' }}>{businesses.length}</b>
                  <small style={{ color: 'var(--muted)' }}>Active in {agencyName}</small>
                </div>
                <div className="card" style={{ padding: 18, borderRadius: 14 }}>
                  <span style={{ fontSize: 12, color: 'var(--muted)' }}>Selected Client Feedback</span>
                  <b style={{ fontSize: 28, display: 'block' }}>{businesses.reduce((acc, b) => acc + (b.feedback_count || 0), 0)}</b>
                  <small style={{ color: 'var(--muted)' }}>Across all managed clients</small>
                </div>
                <div className="card" style={{ padding: 18, borderRadius: 14 }}>
                  <span style={{ fontSize: 12, color: 'var(--muted)' }}>Awaiting Payment</span>
                  <b style={{ fontSize: 28, display: 'block' }}>{businesses.filter((b) => b.pay_status !== 'paid').length}</b>
                  <small style={{ color: 'var(--muted)' }}>Directly billed to clients</small>
                </div>
                <div className="card" style={{ padding: 18, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <button type="button" className="btn p" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setAddClientModal(true)}>
                    + Add a Client Business
                  </button>
                </div>
              </div>

              <div className="card" style={{ padding: 0, borderRadius: 16, overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, fontSize: 16 }}>Client Workspaces</h3>
                  <button type="button" className="btn s" onClick={() => setAddClientModal(true)}>+ New Client</button>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13.5 }}>
                    <thead>
                      <tr style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--line)' }}>
                        <th style={{ padding: '12px 16px' }}>Business</th>
                        <th style={{ padding: '12px 16px' }}>Type</th>
                        <th style={{ padding: '12px 16px' }}>Location</th>
                        <th style={{ padding: '12px 16px' }}>Feedback</th>
                        <th style={{ padding: '12px 16px' }}>Plan</th>
                        <th style={{ padding: '12px 16px' }}>Payment</th>
                        <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {businesses.length === 0 ? (
                        <tr>
                          <td colSpan={7} style={{ padding: 32, textAlign: 'center', color: 'var(--muted)' }}>
                            No client businesses added yet. Click &apos;+ Add a Client Business&apos; to onboard your first client.
                          </td>
                        </tr>
                      ) : (
                        businesses.map((b, i) => (
                          <tr key={b.id} style={{ borderBottom: '1px solid var(--line)' }}>
                            <td style={{ padding: '12px 16px', fontWeight: 700 }}>{b.name}</td>
                            <td style={{ padding: '12px 16px' }}>{b.type}</td>
                            <td style={{ padding: '12px 16px', color: 'var(--muted)' }}>{b.city || '–'}</td>
                            <td style={{ padding: '12px 16px' }}>{b.feedback_count || 0} {b.avg_rating ? `(${b.avg_rating}★)` : ''}</td>
                            <td style={{ padding: '12px 16px', textTransform: 'capitalize' }}>{b.plan}</td>
                            <td style={{ padding: '12px 16px' }}>
                              <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 99, background: b.pay_status === 'paid' ? 'var(--green-soft)' : 'var(--orange-soft)', color: b.pay_status === 'paid' ? 'var(--green)' : 'var(--orange)' }}>
                                {b.pay_status}
                              </span>
                            </td>
                            <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                              <button
                                type="button"
                                className="btn p"
                                style={{ fontSize: 12, padding: '5px 12px' }}
                                onClick={() => {
                                  setActiveBizIndex(i);
                                  setMode('owner');
                                  setRoute('overview');
                                }}
                              >
                                Open Dashboard →
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

          {/* BUSINESS OWNER VIEW MODE */}
          {mode === 'owner' && activeBiz && (
            <>
              {route === 'overview' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                    <div className="card" style={{ padding: 18, borderRadius: 14 }}>
                      <span style={{ fontSize: 12, color: 'var(--muted)' }}>Feedback Received</span>
                      <b style={{ fontSize: 32, display: 'block', margin: '4px 0' }}>{stats.total}</b>
                      <small style={{ color: 'var(--muted)' }}>Total verified reviews</small>
                    </div>
                    <div className="card" style={{ padding: 18, borderRadius: 14 }}>
                      <span style={{ fontSize: 12, color: 'var(--muted)' }}>Average Rating</span>
                      <b style={{ fontSize: 32, display: 'block', margin: '4px 0' }}>{stats.avg} ★</b>
                      <small style={{ color: 'var(--muted)' }}>Out of 5 stars</small>
                    </div>
                    <div className="card" style={{ padding: 18, borderRadius: 14 }}>
                      <span style={{ fontSize: 12, color: 'var(--muted)' }}>Customer Satisfaction</span>
                      <b style={{ fontSize: 32, display: 'block', margin: '4px 0' }}>{stats.sat}%</b>
                      <small style={{ color: 'var(--green)', fontWeight: 600 }}>Rated 4 or 5 stars</small>
                    </div>
                    <div className="card" style={{ padding: 18, borderRadius: 14 }}>
                      <span style={{ fontSize: 12, color: 'var(--muted)' }}>Follow-ups Needed</span>
                      <b style={{ fontSize: 32, display: 'block', margin: '4px 0' }}>{stats.low}</b>
                      <small style={{ color: 'var(--orange)', fontWeight: 600 }}>Rated 1 to 3 stars</small>
                    </div>
                  </div>

                  {/* Quick Setup Status Banner */}
                  {(!activeBiz.google_review_url || !activeBiz.onboarded_at) && (
                    <div className="card" style={{ padding: 18, borderRadius: 14, background: 'var(--sage)', color: 'var(--sage-ink)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                      <div>
                        <b style={{ display: 'block', fontSize: 15 }}>Finish setting up {activeBiz.name}</b>
                        <span style={{ fontSize: 13 }}>Add your services and Google Review link so customers can leave public reviews too.</span>
                      </div>
                      <Link href="/onboarding" className="btn p" style={{ textDecoration: 'none', fontSize: 13, padding: '8px 16px' }}>
                        Open Setup Wizard →
                      </Link>
                    </div>
                  )}

                  <div className="card" style={{ padding: 24, borderRadius: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <h3 style={{ margin: 0, fontSize: 18 }}>Recent Guest Feedback</h3>
                      <button type="button" className="btn s" onClick={() => setRoute('feedback')}>View All ({stats.total}) →</button>
                    </div>

                    {loadingFeedback ? (
                      <p style={{ color: 'var(--muted)', textAlign: 'center', padding: 24 }}>Loading live feedback from Neon database…</p>
                    ) : feedbackList.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--muted)' }}>
                        <p style={{ margin: '0 0 12px' }}>No feedback submitted yet for this business.</p>
                        <Link href={`/feedback/${activeBiz.id}`} target="_blank" className="btn p" style={{ textDecoration: 'none', display: 'inline-block' }}>
                          Open QR Feedback Form ↗
                        </Link>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {feedbackList.slice(0, 5).map((f) => (
                          <div key={f.id} style={{ background: 'var(--surface-2)', padding: 14, borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                            <div>
                              <div style={{ color: 'var(--orange)', fontWeight: 700, fontSize: 14 }}>
                                {'★'.repeat(f.rating)}{'☆'.repeat(5 - f.rating)} <span style={{ color: 'var(--fg)', marginLeft: 6 }}>{f.rating} stars</span>
                              </div>
                              <p style={{ margin: '4px 0 0', fontSize: 13.5 }}>{f.text || 'Rating only (no written comment).'}</p>
                              {renderFeedbackMeta(f)}
                            </div>
                            <span style={{ fontSize: 12, color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                              {new Date(f.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {route === 'feedback' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                    <h2 style={{ fontSize: 22, margin: 0 }}>All Feedback ({filteredFeedback.length})</h2>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      <input
                        type="search"
                        placeholder="Search text, service, tag…"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface-2)' }}
                      />
                      <select
                        value={ratingFilter}
                        onChange={(e) => setRatingFilter(e.target.value)}
                        style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface-2)' }}
                      >
                        <option value="all">All ratings</option>
                        <option value="5">5 stars only</option>
                        <option value="4">4 stars only</option>
                        <option value="3">3 stars &amp; below</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {filteredFeedback.length === 0 ? (
                      <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>
                        No feedback matches your filter.
                      </div>
                    ) : (
                      filteredFeedback.map((f) => (
                        <div key={f.id} className="card" style={{ padding: 18, borderRadius: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ color: 'var(--orange)', fontWeight: 800, fontSize: 16 }}>
                              {'★'.repeat(f.rating)}{'☆'.repeat(5 - f.rating)}
                            </div>
                            <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                              {new Date(f.created_at).toLocaleString()}
                            </span>
                          </div>
                          <p style={{ margin: 0, fontSize: 14 }}>{f.text || 'Rating only.'}</p>
                          {renderFeedbackMeta(f)}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {route === 'fixit' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <h2 style={{ fontSize: 22, margin: 0 }}>Fix-it Inbox ({lowRatedFeedback.length})</h2>
                      <p style={{ margin: '4px 0 0', color: 'var(--muted)', fontSize: 13.5 }}>
                        Private feedback rated 3 stars or below. Follow up directly when customers left permission.
                      </p>
                    </div>
                  </div>

                  {lowRatedFeedback.length === 0 ? (
                    <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>
                      No low-rated feedback to follow up on right now! 🎉
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {lowRatedFeedback.map((f) => (
                        <div key={f.id} className="card" style={{ padding: 18, borderRadius: 14, borderLeft: '4px solid var(--orange)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                            <div style={{ color: 'var(--orange)', fontWeight: 800, fontSize: 16 }}>
                              {'★'.repeat(f.rating)}{'☆'.repeat(5 - f.rating)} ({f.rating}/5)
                            </div>
                            <span style={{ fontSize: 12, color: 'var(--muted)' }}>{new Date(f.created_at).toLocaleString()}</span>
                          </div>
                          <p style={{ margin: 0, fontSize: 14 }}>{f.text || 'Rating submitted without comment.'}</p>
                          {renderFeedbackMeta(f)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {route === 'campaigns' && (
                <div className="card" style={{ padding: 28, borderRadius: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, alignItems: 'center' }}>
                  <div>
                    <h2 style={{ fontSize: 22, margin: '0 0 8px' }}>Print QR Stand Cards</h2>
                    <p style={{ color: 'var(--muted)', margin: '0 0 16px', fontSize: 14 }}>
                      Share or print your unique QR link for <b>{activeBiz.name}</b>. Every response goes directly to your live dashboard.
                    </p>

                    <div style={{ background: 'var(--surface-2)', padding: '10px 12px', borderRadius: 10, fontFamily: 'monospace', fontSize: 12.5, wordBreak: 'break-all', marginBottom: 14 }}>
                      {liveQrUrl}
                    </div>

                    <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        className="btn s"
                        onClick={() => {
                          navigator.clipboard.writeText(liveQrUrl);
                          showToast('Feedback QR link copied!');
                        }}
                      >
                        Copy QR Link
                      </button>
                      <Link href={`/feedback/${activeBiz.id}`} target="_blank" className="btn s" style={{ textDecoration: 'none' }}>
                        Test Live Feedback Form ↗
                      </Link>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div>
                        <b style={{ fontSize: 13, display: 'block', marginBottom: 6 }}>Card Size</b>
                        <div style={{ display: 'flex', gap: 8 }}>
                          {['A6', 'A5', 'A4'].map((sz) => (
                            <button
                              key={sz}
                              type="button"
                              className={`btn ${pkSize === sz ? 'p' : 's'}`}
                              onClick={() => setPkSize(sz)}
                              style={{ padding: '6px 14px', fontSize: 12 }}
                            >
                              {sz}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <b style={{ fontSize: 13, display: 'block', marginBottom: 6 }}>Language</b>
                        <div style={{ display: 'flex', gap: 8 }}>
                          {[['en', 'English'], ['hi', 'हिन्दी'], ['kn', 'ಕನ್ನಡ']].map(([code, name]) => (
                            <button
                              key={code}
                              type="button"
                              className={`btn ${pkLang === code ? 'p' : 's'}`}
                              onClick={() => setPkLang(code)}
                              style={{ padding: '6px 14px', fontSize: 12 }}
                            >
                              {name}
                            </button>
                          ))}
                        </div>
                      </div>

                      <button type="button" className="btn p" onClick={() => window.print()} style={{ marginTop: 8 }}>
                        🖨️ Print or Save as PDF
                      </button>
                    </div>
                  </div>

                  <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 16, padding: 24, textAlign: 'center', boxShadow: 'var(--shadow)', maxWidth: 280, margin: '0 auto' }}>
                    <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--fg)', marginBottom: 4 }}>{activeBiz.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 12 }}>{activeBiz.city || 'India'} · {pkSize}</div>
                    <div style={{ border: '2px solid #000', padding: 12, borderRadius: 12, display: 'inline-block', marginBottom: 12 }}>
                      <div style={{ width: 140, height: 140, background: '#f5f5f5', display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 700, padding: 8 }}>
                        QR Link #{activeBiz.id}
                      </div>
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 700 }}>
                      {pkLang === 'hi' ? 'अपनी राय देने के लिए स्कैन करें' : pkLang === 'kn' ? 'ಅಭಿಪ್ರಾಯ ನೀಡಲು ಸ್ಕ್ಯಾನ್ ಮಾಡಿ' : 'Scan to share feedback'}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 8, borderTop: '1px solid var(--line)', paddingTop: 6 }}>
                      Managed by {activeBiz.agency_name || agencyName} · Powered by Neario
                    </div>
                  </div>
                </div>
              )}

              {route === 'reports' && (
                <div className="card" style={{ padding: 28, borderRadius: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, borderBottom: '1px solid var(--line)', paddingBottom: 16 }}>
                    <div>
                      <span style={{ fontSize: 12, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.05em' }}>
                        Prepared by {activeBiz.agency_name || agencyName} · Neario ReviewFlow
                      </span>
                      <h2 style={{ fontSize: 24, margin: '4px 0' }}>{activeBiz.name} Monthly Report</h2>
                      <p style={{ margin: 0, color: 'var(--muted)', fontSize: 13 }}>Generated from verified database feedback</p>
                    </div>
                    <button type="button" className="btn p" onClick={() => window.print()}>Print / Export PDF</button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, margin: '20px 0' }}>
                    <div style={{ background: 'var(--surface-2)', padding: 14, borderRadius: 10 }}>
                      <span style={{ fontSize: 11, color: 'var(--muted)' }}>Total Feedback</span>
                      <b style={{ fontSize: 24, display: 'block' }}>{stats.total}</b>
                    </div>
                    <div style={{ background: 'var(--surface-2)', padding: 14, borderRadius: 10 }}>
                      <span style={{ fontSize: 11, color: 'var(--muted)' }}>Average Rating</span>
                      <b style={{ fontSize: 24, display: 'block' }}>{stats.avg} ★</b>
                    </div>
                    <div style={{ background: 'var(--surface-2)', padding: 14, borderRadius: 10 }}>
                      <span style={{ fontSize: 11, color: 'var(--muted)' }}>Guest Satisfaction</span>
                      <b style={{ fontSize: 24, display: 'block' }}>{stats.sat}%</b>
                    </div>
                  </div>

                  <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>
                    Official Neario ReviewFlow monthly progress summary. All ratings were collected in premises.
                  </p>
                </div>
              )}

              {route === 'viewlog' && (
                <div className="card" style={{ padding: 24, borderRadius: 16 }}>
                  <h3 style={{ fontSize: 18, margin: '0 0 6px' }}>View-As Transparency Log</h3>
                  <p style={{ margin: '0 0 16px', color: 'var(--muted)', fontSize: 13 }}>
                    Every time an agency or Neario admin opens your business data, it is recorded here for your peace of mind.
                  </p>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                      <thead>
                        <tr style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--line)' }}>
                          <th style={{ padding: '10px 14px' }}>Date &amp; Time</th>
                          <th style={{ padding: '10px 14px' }}>Actor Name</th>
                          <th style={{ padding: '10px 14px' }}>Agency</th>
                          <th style={{ padding: '10px 14px' }}>Reason</th>
                        </tr>
                      </thead>
                      <tbody>
                        {viewLogs.length === 0 ? (
                          <tr>
                            <td colSpan={4} style={{ padding: 20, textAlign: 'center', color: 'var(--muted)' }}>
                              No external accesses recorded yet.
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
                              <td style={{ padding: '10px 14px' }}>{log.reason || 'Opened dashboard'}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Add Client Modal (Agency Mode) */}
      {addClientModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'grid', placeItems: 'center', background: 'rgba(0,0,0,0.4)', padding: 16 }}>
          <div className="card" style={{ width: '100%', maxWidth: 480, padding: 32, borderRadius: 20 }}>
            <h2 style={{ margin: '0 0 6px', fontSize: 22 }}>Add Client Business</h2>
            <p style={{ color: 'var(--muted)', margin: '0 0 20px', fontSize: 13.5 }}>
              The client gets their own login and pays Neario directly.
            </p>

            {createdClientInvite ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ background: 'var(--green-soft)', color: 'var(--green)', padding: 14, borderRadius: 10, fontSize: 13.5, fontWeight: 600 }}>
                  ✓ Client added! Share this setup link with the business owner:
                </div>
                <div style={{ background: 'var(--surface-2)', padding: 12, borderRadius: 8, fontSize: 12.5, fontFamily: 'monospace', wordBreak: 'break-all' }}>
                  {createdClientInvite}
                </div>
                <button
                  type="button"
                  className="btn p"
                  onClick={() => {
                    navigator.clipboard.writeText(createdClientInvite);
                    showToast('Invite link copied!');
                  }}
                >
                  Copy Client Invite Link
                </button>
                <button
                  type="button"
                  className="btn s"
                  onClick={() => {
                    setCreatedClientInvite(null);
                    setAddClientModal(false);
                  }}
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleAddClient} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <label className="f2">
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Business Name</span>
                  <input
                    type="text"
                    required
                    minLength={2}
                    placeholder="e.g. Copper Chimney"
                    value={acName}
                    onChange={(e) => setAcName(e.target.value)}
                    className="inp"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface-2)' }}
                  />
                </label>

                <div style={{ display: 'flex', gap: 10 }}>
                  <label className="f2" style={{ flex: 1 }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>Type</span>
                    <select
                      value={acType}
                      onChange={(e) => setAcType(e.target.value)}
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
                    <span style={{ fontSize: 13, fontWeight: 600 }}>Location</span>
                    <input
                      type="text"
                      placeholder="e.g. Indiranagar"
                      value={acLoc}
                      onChange={(e) => setAcLoc(e.target.value)}
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
                    value={acOwner}
                    onChange={(e) => setAcOwner(e.target.value)}
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
                    value={acEmail}
                    onChange={(e) => setAcEmail(e.target.value)}
                    className="inp"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface-2)' }}
                  />
                </label>

                <label className="f2">
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Billing Plan</span>
                  <select
                    value={acPlan}
                    onChange={(e) => setAcPlan(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface-2)' }}
                  >
                    <option value="yearly">Yearly · ₹5,391 (first 3 months free)</option>
                    <option value="monthly">Monthly · ₹599 a month</option>
                  </select>
                </label>

                <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 13.5 }}>
                  <input
                    type="checkbox"
                    checked={acConsent}
                    onChange={(e) => setAcConsent(e.target.checked)}
                    style={{ width: 18, height: 18, marginTop: 2, accentColor: 'var(--primary)' }}
                  />
                  <span>The business owner agrees that {agencyName} can manage their feedback.</span>
                </label>

                <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                  <button type="button" className="btn s" onClick={() => setAddClientModal(false)} style={{ flex: 1 }}>Cancel</button>
                  <button type="submit" className="btn p" style={{ flex: 2 }}>Add Client &amp; Generate Invite</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
