'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { showToast } from '../components/Toast';

const STEPS = ['Business', 'Services', 'Locations', 'Google', 'Plan', 'QR code'];
const SUGG = {
  'Salon or spa': ['Haircut', 'Facial', 'Hair Spa', 'Manicure', 'Waxing', 'Bridal'],
  'Restaurant or café': ['Dine-in', 'Takeaway', 'Delivery', 'Catering'],
  'Clinic': ['Consultation', 'Check-up', 'Lab test', 'Follow-up'],
  'Retail': ['In-store', 'Online order', 'Returns'],
  'Other': ['Service', 'Product', 'Support'],
};

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [d, setD] = useState({
    biz: '',
    cat: 'Salon or spa',
    owner: '',
    email: '',
    svc: ['Haircut', 'Facial', 'Hair Spa'],
    locs: [{ n: '', a: '' }],
    g: false,
    placeId: '',
    size: 'A5',
    plan: 'yearly',
  });
  const [newSvc, setNewSvc] = useState('');
  const [errs, setErrs] = useState({});
  const qrCanvasRef = useRef(null);

  function slug(s) {
    return (s || 'your-business').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'your-business';
  }

  function validate() {
    const e = {};
    if (step === 0) {
      if (!d.biz.trim()) e.biz = 'Enter your business name.';
      if (!d.owner.trim()) e.owner = 'Enter your name.';
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.email.trim())) e.email = 'Enter a valid email, like name@business.com.';
    }
    if (step === 1 && !d.svc.length) e.svc = 'Pick or add at least one service.';
    if (step === 2) {
      d.locs.forEach((l, i) => {
        if (!l.n.trim()) e['ln' + i] = 'Give this location a name.';
      });
    }
    setErrs(e);
    return Object.keys(e).length === 0;
  }

  function handleNext() {
    if (!validate()) return;
    setStep((s) => s + 1);
    window.scrollTo(0, 0);
  }

  function handleBack() {
    setStep((s) => s - 1);
    setErrs({});
    window.scrollTo(0, 0);
  }

  function toggleService(s) {
    setD((prev) => {
      const idx = prev.svc.indexOf(s);
      const updated = idx > -1 ? prev.svc.filter((x) => x !== s) : [...prev.svc, s];
      return { ...prev, svc: updated };
    });
  }

  function addService() {
    const trimmed = newSvc.trim();
    if (!trimmed) return;
    if (!d.svc.includes(trimmed)) {
      setD((prev) => ({ ...prev, svc: [...prev.svc, trimmed] }));
    }
    setNewSvc('');
  }

  const feedbackUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/feedback/1`
    : `https://feedback.example.com/${slug(d.biz)}/${slug(d.locs[0]?.n)}`;

  useEffect(() => {
    if (step === 5 && qrCanvasRef.current) {
      const canvas = qrCanvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 200, 200);
      ctx.fillStyle = '#17261d';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Scan to Rate', 100, 90);
      ctx.font = '11px monospace';
      ctx.fillStyle = '#65726a';
      ctx.fillText(d.biz || 'Neario Demo', 100, 115);
      // Outer border
      ctx.strokeStyle = '#e6dfcf';
      ctx.lineWidth = 4;
      ctx.strokeRect(10, 10, 180, 180);
    }
  }, [step, d.biz]);

  return (
    <div className="onboarding-page" style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <div className="wrap" style={{ maxWidth: 640, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <Link href="/" className="brand" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="mark" style={{ width: 36, height: 36, borderRadius: 11, background: 'var(--primary)', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 18 }}>N</span>
            <span className="wm">
              <b style={{ display: 'block', fontSize: 23, letterSpacing: '-.06em', lineHeight: 1, color: 'var(--accent-text)' }}>neario</b>
              <small style={{ fontSize: 9, letterSpacing: '.32em', fontWeight: 700, color: 'var(--muted)' }}>REVIEWFLOW</small>
            </span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, fontWeight: 600, flexWrap: 'wrap' }}>
            <Link href="/" className="btn s" style={{ textDecoration: 'none', fontSize: 12, padding: '6px 12px' }}>🏠 Home</Link>
            <Link href="/dashboard" className="btn s" style={{ textDecoration: 'none', fontSize: 12, padding: '6px 12px' }}>📊 Dashboard</Link>
            <Link href="/login" className="btn s" style={{ textDecoration: 'none', fontSize: 12, padding: '6px 12px' }}>🔐 Login</Link>
          </div>
        </div>

        <div className="demo" role="note" style={{ fontSize: 12, color: 'var(--muted)', background: 'var(--surface-2)', border: '1px dashed var(--line)', borderRadius: 12, padding: '8px 12px' }}>
          Interactive Setup Wizard. Set up your business profile, customize feedback categories, and preview your QR card.
        </div>

        <div className="rail" style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6 }}>
          {STEPS.map((s, i) => (
            <div key={s} className={i <= step ? 'on' : ''} style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 11.5, fontWeight: 600, color: i <= step ? 'var(--fg)' : 'var(--muted)' }}>
              <i style={{ height: 5, borderRadius: 9, background: i <= step ? 'var(--primary)' : 'var(--line)' }}></i>
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{i + 1}. {s}</span>
            </div>
          ))}
        </div>

        <section className="card" style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 24, boxShadow: 'var(--shadow)', padding: 'clamp(20px, 4vw, 32px)', display: 'flex', flexDirection: 'column', gap: 18 }}>
          {step === 0 && (
            <>
              <h1 style={{ margin: 0, fontSize: 'clamp(24px, 4vw, 30px)', letterSpacing: '-.04em' }}>Tell us about your business</h1>
              <p className="mut" style={{ color: 'var(--muted)', margin: 0 }}>This sets up your workspace and your customer feedback page.</p>

              <label className="f">
                Business name
                <input
                  type="text"
                  placeholder="e.g. Copper Chimney"
                  value={d.biz}
                  onChange={(e) => setD({ ...d, biz: e.target.value })}
                  style={{ borderColor: errs.biz ? 'var(--red)' : undefined }}
                />
                {errs.biz && <span className="err" style={{ color: 'var(--red)', fontSize: 13, fontWeight: 600 }}>{errs.biz}</span>}
              </label>

              <label className="f">
                Type of business
                <select value={d.cat} onChange={(e) => setD({ ...d, cat: e.target.value, svc: SUGG[e.target.value]?.slice(0, 3) || [] })}>
                  {Object.keys(SUGG).map((k) => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
              </label>

              <div className="row" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <label className="f" style={{ flex: 1, minWidth: 140 }}>
                  Your name
                  <input
                    type="text"
                    placeholder="Priya Sharma"
                    value={d.owner}
                    onChange={(e) => setD({ ...d, owner: e.target.value })}
                  />
                  {errs.owner && <span className="err" style={{ color: 'var(--red)', fontSize: 13, fontWeight: 600 }}>{errs.owner}</span>}
                </label>
                <label className="f" style={{ flex: 1, minWidth: 140 }}>
                  Email
                  <input
                    type="email"
                    placeholder="priya@example.com"
                    value={d.email}
                    onChange={(e) => setD({ ...d, email: e.target.value })}
                  />
                  {errs.email && <span className="err" style={{ color: 'var(--red)', fontSize: 13, fontWeight: 600 }}>{errs.email}</span>}
                </label>
              </div>

              <div className="nav" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
                <button type="button" className="btn p" onClick={handleNext}>Continue</button>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <h1 style={{ margin: 0, fontSize: 'clamp(24px, 4vw, 30px)', letterSpacing: '-.04em' }}>What do you offer?</h1>
              <p className="mut" style={{ color: 'var(--muted)', margin: 0 }}>Customers pick one of these when they leave feedback. You can change them later.</p>

              <div className="chips" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {SUGG[d.cat]?.map((s) => {
                  const selected = d.svc.includes(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      className="chip"
                      onClick={() => toggleService(s)}
                      aria-pressed={selected}
                      style={{
                        borderRadius: 999,
                        padding: '9px 14px',
                        fontWeight: 600,
                        border: '1.5px solid var(--line)',
                        background: selected ? 'var(--primary)' : 'var(--surface)',
                        color: selected ? '#fff' : 'inherit',
                      }}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>

              <div className="li" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <input
                  type="text"
                  placeholder="Add another custom service"
                  value={newSvc}
                  onChange={(e) => setNewSvc(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addService())}
                />
                <button type="button" className="btn s" onClick={addService}>Add</button>
              </div>

              {errs.svc && <span className="err" style={{ color: 'var(--red)', fontSize: 13, fontWeight: 600 }}>{errs.svc}</span>}

              <div className="nav" style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                <button type="button" className="btn s" onClick={handleBack}>Back</button>
                <button type="button" className="btn p" onClick={handleNext}>Continue</button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h1 style={{ margin: 0, fontSize: 'clamp(24px, 4vw, 30px)', letterSpacing: '-.04em' }}>Where do customers visit you?</h1>
              <p className="mut" style={{ color: 'var(--muted)', margin: 0 }}>Each location gets its own feedback link and QR code.</p>

              <div className="list" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {d.locs.map((l, i) => (
                  <div key={i} className="row" style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                    <label className="f" style={{ flex: 1, minWidth: 140 }}>
                      Location name
                      <input
                        type="text"
                        placeholder="e.g. Indiranagar"
                        value={l.n}
                        onChange={(e) => {
                          const updated = [...d.locs];
                          updated[i].n = e.target.value;
                          setD({ ...d, locs: updated });
                        }}
                      />
                    </label>
                    <label className="f" style={{ flex: 1, minWidth: 140 }}>
                      City / Area
                      <input
                        type="text"
                        placeholder="e.g. Bengaluru"
                        value={l.a}
                        onChange={(e) => {
                          const updated = [...d.locs];
                          updated[i].a = e.target.value;
                          setD({ ...d, locs: updated });
                        }}
                      />
                    </label>
                    {d.locs.length > 1 && (
                      <button
                        type="button"
                        className="x"
                        style={{ border: '1.5px solid var(--line)', background: 'var(--surface)', borderRadius: 12, width: 44, height: 44, cursor: 'pointer' }}
                        onClick={() => setD({ ...d, locs: d.locs.filter((_, idx) => idx !== i) })}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="add"
                style={{ alignSelf: 'flex-start', background: 'none', border: 0, color: 'var(--accent-text)', fontWeight: 700, padding: '6px 0', cursor: 'pointer' }}
                onClick={() => setD({ ...d, locs: [...d.locs, { n: '', a: '' }] })}
              >
                + Add another location
              </button>

              <div className="nav" style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                <button type="button" className="btn s" onClick={handleBack}>Back</button>
                <button type="button" className="btn p" onClick={handleNext}>Continue</button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h1 style={{ margin: 0, fontSize: 'clamp(24px, 4vw, 30px)', letterSpacing: '-.04em' }}>Connect your Google Business Profile</h1>
              <p className="mut" style={{ color: 'var(--muted)', margin: 0 }}>This lets Neario show your Google reviews and help you reply. It also gives customers your correct review link.</p>

              <div className="gcard" style={{ border: '1.5px solid var(--line)', borderRadius: 16, padding: 16, display: 'flex', gap: 14, alignItems: 'center' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#fff', color: 'var(--blue)', display: 'grid', placeItems: 'center', fontWeight: 800, border: '1px solid var(--line)' }}>G</div>
                <div style={{ flex: 1 }}>
                  <b>Google Business Profile</b><br />
                  <span className={`pill ${d.g ? 'ok' : ''}`} style={{ fontSize: 12, fontWeight: 700, borderRadius: 99, padding: '3px 10px', background: d.g ? 'var(--green-soft)' : 'var(--surface-2)', color: d.g ? 'var(--green)' : 'var(--muted)' }}>
                    {d.g ? 'Connected' : 'Not connected'}
                  </span>
                </div>
                <button
                  type="button"
                  className={`btn ${d.g ? 's' : 'p'}`}
                  onClick={() => {
                    setD({ ...d, g: !d.g });
                    showToast(d.g ? 'Disconnected Google Profile' : 'Google Profile connected!');
                  }}
                >
                  {d.g ? 'Disconnect' : 'Connect'}
                </button>
              </div>

              <div className="note" style={{ background: 'var(--sage)', color: 'var(--sage-ink)', borderRadius: 14, padding: '12px 14px', fontSize: 14 }}>
                Every customer will see the same Google review link after sending feedback, whatever their rating. Neario does not filter who gets it.
              </div>

              <div className="nav" style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                <button type="button" className="btn s" onClick={handleBack}>Back</button>
                <button type="button" className="btn p" onClick={handleNext}>Continue</button>
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <h1 style={{ margin: 0, fontSize: 'clamp(24px, 4vw, 30px)', letterSpacing: '-.04em' }}>Choose your plan</h1>
              <p className="mut" style={{ color: 'var(--muted)', margin: 0 }}>Transparent billing with no hidden fees. Everything is included either way.</p>

              <div className="plans" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                <button
                  type="button"
                  className={`pc ${d.plan === 'yearly' ? 'on' : ''}`}
                  onClick={() => setD({ ...d, plan: 'yearly' })}
                  style={{
                    position: 'relative',
                    textAlign: 'left',
                    background: 'var(--surface)',
                    border: d.plan === 'yearly' ? '2px solid var(--primary)' : '2px solid var(--line)',
                    borderRadius: 18,
                    padding: '24px 16px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                    cursor: 'pointer',
                  }}
                >
                  <span style={{ position: 'absolute', top: -12, left: 14, background: '#f6c344', color: '#2a1d00', fontWeight: 800, fontSize: 11, textTransform: 'uppercase', borderRadius: 99, padding: '4px 10px' }}>
                    First 3 months free
                  </span>
                  <b>Yearly</b>
                  <span style={{ fontSize: 30, fontWeight: 800 }}>₹5,391</span>
                  <span style={{ color: 'var(--muted)', fontSize: 13 }}>One bill for 12 months. Pay for 9, get 12 (about ₹449/mo).</span>
                </button>

                <button
                  type="button"
                  className={`pc ${d.plan === 'monthly' ? 'on' : ''}`}
                  onClick={() => setD({ ...d, plan: 'monthly' })}
                  style={{
                    textAlign: 'left',
                    background: 'var(--surface)',
                    border: d.plan === 'monthly' ? '2px solid var(--primary)' : '2px solid var(--line)',
                    borderRadius: 18,
                    padding: '24px 16px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                    cursor: 'pointer',
                  }}
                >
                  <b>Monthly</b>
                  <span style={{ fontSize: 30, fontWeight: 800 }}>₹599</span>
                  <span style={{ color: 'var(--muted)', fontSize: 13 }}>Billed monthly. Cancel anytime.</span>
                </button>
              </div>

              <div className="nav" style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                <button type="button" className="btn s" onClick={handleBack}>Back</button>
                <button type="button" className="btn p" onClick={handleNext}>Generate QR kit</button>
              </div>
            </>
          )}

          {step === 5 && (
            <>
              <h1 style={{ margin: 0, fontSize: 'clamp(24px, 4vw, 30px)', letterSpacing: '-.04em' }}>Your feedback page is ready!</h1>
              <p className="mut" style={{ color: 'var(--muted)', margin: 0 }}>Print the QR code or program it onto a TapReview counter stand.</p>

              <div className="qrbox" style={{ display: 'flex', gap: 22, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
                <canvas ref={qrCanvasRef} width={200} height={200} style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--line)' }}></canvas>
                <div style={{ flex: 1, minWidth: 200, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ fontFamily: 'monospace', fontSize: 13, background: 'var(--surface-2)', borderRadius: 10, padding: '10px 12px', wordBreak: 'break-all' }}>
                    {feedbackUrl}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      type="button"
                      className="btn s"
                      onClick={() => {
                        navigator.clipboard.writeText(feedbackUrl);
                        showToast('Feedback link copied to clipboard!');
                      }}
                    >
                      Copy link
                    </button>
                    <Link href="/feedback/1" target="_blank" className="btn s" style={{ textDecoration: 'none' }}>
                      Test page ↗
                    </Link>
                  </div>
                </div>
              </div>

              <div className="nav" style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                <button type="button" className="btn s" onClick={handleBack}>Back</button>
                <Link href="/dashboard" className="btn p" style={{ textDecoration: 'none' }}>
                  Open Dashboard →
                </Link>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

