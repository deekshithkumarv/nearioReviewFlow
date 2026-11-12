'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { m, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, CircleAlert, Copy, Download, ExternalLink, Plus, Printer, RotateCcw, ShieldCheck, Store, X } from 'lucide-react';
import { showToast } from '../components/ui/Toast';
import Logo from '../components/ui/Logo';
import QrCode from '../components/QrCode';
import s from './onboarding.module.css';

const STEPS = ['Business', 'Services', 'Google link', 'QR code'];
const SUGG = {
  'Salon or spa': ['Haircut', 'Facial', 'Hair Spa', 'Manicure', 'Waxing', 'Bridal'],
  'Restaurant or café': ['Dine-in', 'Takeaway', 'Delivery', 'Catering'],
  'Clinic': ['Consultation', 'Check-up', 'Lab test', 'Follow-up'],
  'Retail': ['In-store', 'Online order', 'Returns'],
  'Other': ['Service', 'Product', 'Support'],
};
const ALL_SUGGESTED = new Set(Object.values(SUGG).flat().map((x) => x.toLowerCase()));
const MAX_SVC = 12;
const MAX_SVC_LEN = 40;
const EASE = [0.2, 0.8, 0.2, 1];

const slugify = (v) =>
  String(v || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'feedback';

export default function OnboardingPage() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [bizId, setBizId] = useState(null);
  const [d, setD] = useState({
    biz: '',
    cat: 'Salon or spa',
    svc: ['Haircut', 'Facial', 'Hair Spa'],
    gurl: '',
  });
  const [newSvc, setNewSvc] = useState('');
  const [errs, setErrs] = useState({});
  const [initState, setInitState] = useState('loading'); // 'loading' | 'ready' | 'nobiz' | 'error'
  const [saving, setSaving] = useState(false);
  const [saveErr, setSaveErr] = useState('');
  const [origin, setOrigin] = useState('');
  const [fromParam, setFromParam] = useState(false); // opened as /onboarding?b=<id>

  const nameRef = useRef(null);
  const newSvcRef = useRef(null);
  const gurlRef = useRef(null);
  const qrRef = useRef(null);
  const focusHeadingNext = useRef(false);

  useEffect(() => {
    setOrigin(window.location.origin);
    async function loadBiz() {
      try {
        const meRes = await fetch('/api/me');
        if (meRes.status === 401) {
          router.replace('/login');
          return;
        }
        if (!meRes.ok) throw new Error('me failed');
        const meData = await meRes.json();
        if (meData.user?.role === 'super_admin') {
          router.replace('/admin');
          return;
        }
        const bRes = await fetch('/api/businesses');
        if (!bRes.ok) throw new Error('businesses failed');
        const list = (await bRes.json()).businesses || [];
        // Agencies manage several businesses: the dashboard links here with ?b=<id> for the one being viewed.
        const wanted = new URLSearchParams(window.location.search).get('b');
        const first = wanted ? list.find((b) => Number(b.id) === Number(wanted)) : list[0];
        if (!first) {
          setInitState('nobiz');
          return;
        }
        const cat = SUGG[first.type] ? first.type : 'Other';
        setBizId(first.id);
        setFromParam(Boolean(wanted));
        setD((prev) => ({
          ...prev,
          biz: first.name || '',
          cat,
          gurl: first.google_review_url || '',
          svc: Array.isArray(first.services) && first.services.length > 0 ? first.services : SUGG[cat].slice(0, 3),
        }));
        setInitState('ready');
      } catch {
        setInitState('error');
      }
    }
    loadBiz();
  }, [router]);

  // The new step's heading takes focus once it mounts, so screen readers announce where they are.
  const headingRef = useCallback((node) => {
    if (node && focusHeadingNext.current) {
      focusHeadingNext.current = false;
      node.focus({ preventScroll: true });
    }
  }, []);

  function goTo(next) {
    setDir(next > step ? 1 : -1);
    focusHeadingNext.current = true;
    setStep(next);
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  }

  function validate() {
    const e = {};
    if (step === 0 && !d.biz.trim()) e.biz = 'Enter your business name.';
    if (step === 1 && !d.svc.length) e.svc = 'Pick or add at least one service.';
    if (step === 2 && d.gurl.trim()) {
      let ok = false;
      try {
        ok = new URL(d.gurl.trim()).protocol === 'https:';
      } catch {
        ok = false;
      }
      if (!ok) e.gurl = 'Paste the full link, starting with https://';
    }
    setErrs(e);
    if (e.biz) nameRef.current?.focus();
    if (e.gurl) gurlRef.current?.focus();
    return Object.keys(e).length === 0;
  }

  // Saves one change and waits for the answer. Returns true only when the server accepted it,
  // so the wizard never moves on (or says "done") after a failed save.
  async function save(body) {
    if (!bizId) return true;
    setSaving(true);
    setSaveErr('');
    try {
      const res = await fetch(`/api/businesses/${bizId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) return true;
      const data = await res.json().catch(() => ({}));
      setSaveErr(data.error || 'We could not save this step. Please try again.');
      return false;
    } catch {
      setSaveErr('Network error. Nothing was saved, please try again.');
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function handleNext() {
    if (saving || !validate()) return;
    let ok = true;
    if (step === 0) ok = await save({ name: d.biz.trim(), type: d.cat });
    else if (step === 1) ok = await save({ services: d.svc });
    else if (step === 2) ok = await save({ googleReviewUrl: d.gurl.trim() });
    if (!ok) return;
    goTo(step + 1);
  }

  const dashboardHref = fromParam && bizId ? `/dashboard?b=${bizId}` : '/dashboard';

  async function handleFinish() {
    if (saving) return;
    if (!(await save({ onboarded: true }))) return;
    showToast('Setup complete. Welcome to your dashboard.', { tone: 'success' });
    router.push(dashboardHref);
  }

  async function handleSkipLater() {
    if (saving) return;
    if (!(await save({ onboarded: true }))) return;
    router.push(dashboardHref);
  }

  function handleBack(to = step - 1) {
    if (saving) return;
    setErrs({});
    setSaveErr('');
    goTo(to);
  }

  function changeType(cat) {
    setD((prev) => {
      // Keep anything the owner typed themselves; swap the suggestions for the new type's.
      const custom = prev.svc.filter((x) => !ALL_SUGGESTED.has(x.toLowerCase()));
      return { ...prev, cat, svc: [...(SUGG[cat] || []).slice(0, 3), ...custom].slice(0, MAX_SVC) };
    });
  }

  function toggleService(sv) {
    if (d.svc.includes(sv)) {
      setD((prev) => ({ ...prev, svc: prev.svc.filter((x) => x !== sv) }));
      return;
    }
    if (d.svc.length >= MAX_SVC) {
      setErrs((e) => ({ ...e, svc: `You can list up to ${MAX_SVC} services. Remove one to add another.` }));
      return;
    }
    setErrs((e) => ({ ...e, svc: undefined }));
    setD((prev) => ({ ...prev, svc: [...prev.svc, sv] }));
  }

  function removeService(sv) {
    setErrs((e) => ({ ...e, svc: undefined }));
    setD((prev) => ({ ...prev, svc: prev.svc.filter((x) => x !== sv) }));
  }

  function addService() {
    const v = newSvc.trim().replace(/\s+/g, ' ');
    if (!v) return;
    let err = '';
    if (v.length > MAX_SVC_LEN) err = `Keep each service under ${MAX_SVC_LEN} characters.`;
    else if (d.svc.some((x) => x.toLowerCase() === v.toLowerCase())) err = `“${v}” is already in your list.`;
    else if (d.svc.length >= MAX_SVC) err = `You can list up to ${MAX_SVC} services. Remove one to add another.`;
    if (err) {
      setErrs((e) => ({ ...e, newSvc: err }));
      newSvcRef.current?.focus();
      return;
    }
    setD((prev) => ({ ...prev, svc: [...prev.svc, v] }));
    setErrs((e) => ({ ...e, newSvc: undefined, svc: undefined }));
    setNewSvc('');
  }

  const feedbackUrl = origin && bizId ? `${origin}/feedback/${bizId}` : '';

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(feedbackUrl);
      showToast('Feedback link copied.', { tone: 'success' });
    } catch {
      showToast('Could not copy. Select the link and copy it yourself.', { tone: 'error' });
    }
  }

  function downloadQr() {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) {
      showToast('The QR code is not ready yet. Please try again.', { tone: 'error' });
      return;
    }
    const NS = 'http://www.w3.org/2000/svg';
    const clone = svg.cloneNode(true);
    clone.setAttribute('width', '1024');
    clone.setAttribute('height', '1024');
    clone.removeAttribute('style');
    const bg = document.createElementNS(NS, 'rect');
    bg.setAttribute('width', '100%');
    bg.setAttribute('height', '100%');
    bg.setAttribute('fill', '#ffffff');
    clone.insertBefore(bg, clone.firstChild);
    let markup = new XMLSerializer().serializeToString(clone);
    if (!/\sxmlns=/.test(markup.slice(0, markup.indexOf('>')))) markup = markup.replace('<svg', `<svg xmlns="${NS}"`);
    const blob = new Blob([`<?xml version="1.0" encoding="UTF-8"?>\n${markup}`], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `neario-qr-${slugify(d.biz)}.svg`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast('QR code downloaded.', { tone: 'success' });
  }

  const stepVariants = {
    enter: (v) => ({ opacity: 0, x: reduce ? 0 : 24 * v }),
    center: { opacity: 1, x: 0 },
    exit: (v) => ({ opacity: 0, x: reduce ? 0 : -24 * v }),
  };
  const stepTransition = { duration: reduce ? 0 : 0.26, ease: EASE };

  if (initState !== 'ready') {
    return (
      <div className={s.page}>
        <header className={s.header}>
          <div className={s.headerInner}>
            <Logo size={30} />
          </div>
        </header>
        <main id="main" className={s.shell}>
          {initState === 'loading' ? (
            <div aria-busy="true" aria-label="Loading setup" className={s.skel}>
              <span className="skeleton" style={{ height: 44 }} />
              <span className="skeleton" style={{ height: 4 }} />
              <div className={`card ${s.card}`}>
                <div className={s.body}>
                  <span className="skeleton" style={{ height: 14, width: 90 }} />
                  <span className="skeleton" style={{ height: 36, width: '60%' }} />
                  <span className="skeleton" style={{ height: 18, width: '85%' }} />
                  <span className="skeleton" style={{ height: 46, marginTop: 12 }} />
                  <span className="skeleton" style={{ height: 46 }} />
                </div>
              </div>
            </div>
          ) : (
            <div className={`card ${s.problem}`} role="alert">
              <span className={s.problemIcon} aria-hidden="true">
                {initState === 'nobiz' ? <Store /> : <CircleAlert />}
              </span>
              <h1>{initState === 'nobiz' ? 'No business is linked to your account yet' : 'We couldn’t load your setup'}</h1>
              <p>
                {initState === 'nobiz'
                  ? 'Ask your Neario contact or agency to link your business, then sign in again.'
                  : 'Check your connection and try again.'}
              </p>
              {initState === 'error' ? (
                <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>
                  <RotateCcw aria-hidden="true" />
                  Try again
                </button>
              ) : (
                <Link href="/dashboard" className="btn">Go to dashboard</Link>
              )}
            </div>
          )}
        </main>
      </div>
    );
  }

  const suggestions = SUGG[d.cat] || [];
  const isLast = step === STEPS.length - 1;
  const gurlInvalid = Boolean(errs.gurl) || (step === 2 && Boolean(saveErr));

  return (
    <div className={s.page}>
      <header className={s.header}>
        <div className={s.headerInner}>
          <Logo size={30} />
          <button type="button" className="btn btn-ghost btn-sm" onClick={handleSkipLater} disabled={saving}>
            Set up later
          </button>
        </div>
      </header>

      <main id="main" className={s.shell}>
        <nav aria-label="Setup steps">
          <ol className={s.rail}>
            {STEPS.map((label, i) => {
              const state = i < step ? 'done' : i === step ? 'current' : 'todo';
              const inner = (
                <>
                  <span className={s.railNum} aria-hidden="true">
                    {i < step ? <Check strokeWidth={3} /> : i + 1}
                  </span>
                  <span className={s.railLabel}>{label}</span>
                  {i < step && <span className="visually-hidden"> (done)</span>}
                </>
              );
              return (
                <li key={label} className={s.railItem} data-state={state} aria-current={i === step ? 'step' : undefined}>
                  {i < step ? (
                    <button type="button" className={s.railStep} onClick={() => handleBack(i)} disabled={saving}>
                      {inner}
                    </button>
                  ) : (
                    <span className={s.railStep}>{inner}</span>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>

        <div className={s.bar} aria-hidden="true">
          <m.span
            className={s.barFill}
            initial={false}
            animate={{ scaleX: (step + 1) / STEPS.length }}
            transition={{ duration: reduce ? 0 : 0.4, ease: EASE }}
          />
        </div>

        <div className={`card ${s.card}`}>
          <AnimatePresence mode="wait" initial={false} custom={dir}>
            <m.section
              key={step}
              className={s.body}
              custom={dir}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={stepTransition}
              aria-labelledby="ob-heading"
            >
              <div className={s.intro}>
                <p className="eyebrow">Step {step + 1} of {STEPS.length}</p>
                <h1 id="ob-heading" ref={headingRef} tabIndex={-1}>
                  {step === 0 && 'Tell us about your business'}
                  {step === 1 && 'What do customers come in for?'}
                  {step === 2 && 'Add your Google review link'}
                  {step === 3 && 'Your QR code is ready'}
                </h1>
                <p className={s.lead}>
                  {step === 0 && 'Customers see this name at the top of your feedback page.'}
                  {step === 1 && 'Customers can pick one of these when they leave feedback. You can change them later.'}
                  {step === 2 && 'After sending feedback, customers can choose to post a public review on Google with this link.'}
                  {step === 3 && 'Print it for your counter or tap stand. Customers scan it to open your feedback page.'}
                </p>
              </div>

              {step === 0 && (
                <div className={s.fields}>
                  <div className="field">
                    <label className="label" htmlFor="ob-name">Business name</label>
                    <input
                      ref={nameRef}
                      id="ob-name"
                      className="input"
                      type="text"
                      autoComplete="organization"
                      maxLength={120}
                      placeholder="e.g. Copper Chimney"
                      value={d.biz}
                      onChange={(e) => setD({ ...d, biz: e.target.value })}
                      aria-invalid={errs.biz ? true : undefined}
                      aria-describedby={errs.biz ? 'ob-name-err' : undefined}
                      required
                    />
                    {errs.biz && (
                      <p id="ob-name-err" className="field-error" role="alert">
                        <CircleAlert aria-hidden="true" />
                        {errs.biz}
                      </p>
                    )}
                  </div>

                  <div className="field">
                    <label className="label" htmlFor="ob-type">Type of business</label>
                    <select
                      id="ob-type"
                      className="select"
                      value={d.cat}
                      onChange={(e) => changeType(e.target.value)}
                      aria-describedby="ob-type-hint"
                    >
                      {Object.keys(SUGG).map((k) => (
                        <option key={k} value={k}>{k}</option>
                      ))}
                    </select>
                    <p id="ob-type-hint" className="hint">We use this to suggest services in the next step.</p>
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className={s.fields}>
                  <fieldset className={s.fieldset}>
                    <legend className="label">Suggested for {d.cat.toLowerCase()}</legend>
                    <div className={s.chips}>
                      {suggestions.map((sv) => {
                        const on = d.svc.includes(sv);
                        return (
                          <button key={sv} type="button" className={s.chip} aria-pressed={on} onClick={() => toggleService(sv)}>
                            {on ? <Check aria-hidden="true" strokeWidth={2.5} /> : <Plus aria-hidden="true" />}
                            {sv}
                          </button>
                        );
                      })}
                    </div>
                  </fieldset>

                  <div className="field">
                    <label className="label" htmlFor="ob-new-svc">Add your own</label>
                    <div className={s.addRow}>
                      <input
                        ref={newSvcRef}
                        id="ob-new-svc"
                        className="input"
                        type="text"
                        maxLength={MAX_SVC_LEN}
                        placeholder="e.g. Keratin treatment"
                        value={newSvc}
                        onChange={(e) => {
                          setNewSvc(e.target.value);
                          if (errs.newSvc) setErrs((x) => ({ ...x, newSvc: undefined }));
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addService();
                          }
                        }}
                        aria-invalid={errs.newSvc ? true : undefined}
                        aria-describedby={`ob-new-svc-hint${errs.newSvc ? ' ob-new-svc-err' : ''}`}
                      />
                      <button type="button" className="btn" onClick={addService}>
                        <Plus aria-hidden="true" />
                        Add
                      </button>
                    </div>
                    <p id="ob-new-svc-hint" className="hint">
                      Press Enter to add. Up to {MAX_SVC} services, {MAX_SVC_LEN} characters each.
                    </p>
                    {errs.newSvc && (
                      <p id="ob-new-svc-err" className="field-error" role="alert">
                        <CircleAlert aria-hidden="true" />
                        {errs.newSvc}
                      </p>
                    )}
                  </div>

                  <div className={s.listBox}>
                    <div className={s.listHead}>
                      <h2 id="ob-list-title">Your list</h2>
                      <span className={s.count}>{d.svc.length} of {MAX_SVC}</span>
                    </div>
                    {d.svc.length ? (
                      <ul className={s.chips} aria-labelledby="ob-list-title">
                        <AnimatePresence initial={false}>
                          {d.svc.map((sv) => (
                            <m.li
                              key={sv}
                              className={s.tag}
                              initial={reduce ? false : { opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, scale: 0.9 }}
                              transition={{ duration: 0.18, ease: EASE }}
                            >
                              <span>{sv}</span>
                              <button type="button" className={s.tagX} onClick={() => removeService(sv)} aria-label={`Remove ${sv}`}>
                                <X aria-hidden="true" />
                              </button>
                            </m.li>
                          ))}
                        </AnimatePresence>
                      </ul>
                    ) : (
                      <p className="hint">Nothing here yet. Pick a suggestion or add your own.</p>
                    )}
                    {errs.svc && (
                      <p className="field-error" role="alert">
                        <CircleAlert aria-hidden="true" />
                        {errs.svc}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className={s.fields}>
                  <div className="field">
                    <label className="label" htmlFor="ob-gurl">
                      Google review link <span className="optional">(optional)</span>
                    </label>
                    <input
                      ref={gurlRef}
                      id="ob-gurl"
                      className="input"
                      type="url"
                      inputMode="url"
                      autoComplete="url"
                      autoCapitalize="none"
                      spellCheck={false}
                      placeholder="https://g.page/r/…/review"
                      value={d.gurl}
                      onChange={(e) => {
                        setD({ ...d, gurl: e.target.value });
                        if (errs.gurl) setErrs((x) => ({ ...x, gurl: undefined }));
                      }}
                      aria-invalid={gurlInvalid || undefined}
                      aria-describedby={`ob-gurl-help${errs.gurl ? ' ob-gurl-err' : ''}${step === 2 && saveErr ? ' ob-save-err' : ''}`}
                    />
                    <p id="ob-gurl-help" className="hint">
                      It starts with https://g.page, https://maps.app.goo.gl or https://www.google.com. You can leave this empty and add it later.
                    </p>
                    {errs.gurl && (
                      <p id="ob-gurl-err" className="field-error" role="alert">
                        <CircleAlert aria-hidden="true" />
                        {errs.gurl}
                      </p>
                    )}
                  </div>

                  <div className={s.howto}>
                    <h2>Where to find it</h2>
                    <ol>
                      <li>Open your Google Business Profile. Search for your business name on Google while signed in, or open the Google Maps app.</li>
                      <li>Choose <b>Ask for reviews</b> (it may say <b>Get more reviews</b>).</li>
                      <li>Copy the link and paste it above.</li>
                    </ol>
                  </div>

                  <p className={s.note}>
                    <ShieldCheck aria-hidden="true" />
                    <span>
                      Every customer sees the same Google review link after sending feedback, whatever their rating. Neario does not filter who gets it.
                    </span>
                  </p>
                </div>
              )}

              {step === 3 && (
                <div className={s.qrLayout}>
                  <div className={s.qrFrame} ref={qrRef}>
                    <QrCode value={feedbackUrl} size={184} label={`QR code for the ${d.biz} feedback page`} />
                  </div>
                  <div className={s.qrSide}>
                    <div className="field">
                      <span className="label" id="ob-url-label">Your feedback page</span>
                      <p className={s.url} aria-labelledby="ob-url-label">{feedbackUrl}</p>
                    </div>
                    <div className={s.qrActions}>
                      <button type="button" className="btn" onClick={copyLink} disabled={!feedbackUrl}>
                        <Copy aria-hidden="true" />
                        Copy link
                      </button>
                      <Link href={`/feedback/${bizId}`} target="_blank" rel="noopener noreferrer" className="btn">
                        <ExternalLink aria-hidden="true" />
                        Open the page
                        <span className="visually-hidden"> (opens in a new tab)</span>
                      </Link>
                      <button type="button" className="btn" onClick={() => window.print()}>
                        <Printer aria-hidden="true" />
                        Print card
                      </button>
                      <button type="button" className="btn" onClick={downloadQr} disabled={!feedbackUrl}>
                        <Download aria-hidden="true" />
                        Download QR (SVG)
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </m.section>
          </AnimatePresence>

          <div className={s.nav}>
            {saveErr && (
              <div id="ob-save-err" className={`alert alert-danger ${s.navAlert}`} role="alert">
                <CircleAlert aria-hidden="true" />
                <span>{saveErr}</span>
              </div>
            )}
            <div className={s.navBtns}>
              {step > 0 ? (
                <button type="button" className="btn btn-lg" onClick={() => handleBack()} disabled={saving}>
                  <ArrowLeft aria-hidden="true" />
                  Back
                </button>
              ) : (
                <span />
              )}
              <button
                type="button"
                className="btn btn-primary btn-lg"
                onClick={isLast ? handleFinish : handleNext}
                disabled={saving}
                aria-busy={saving}
              >
                {saving ? (
                  <>
                    <span className="spinner" aria-hidden="true" />
                    Saving…
                  </>
                ) : isLast ? (
                  <>
                    Finish setup
                    <Check aria-hidden="true" />
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight aria-hidden="true" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Only this card prints (see @media print in the module). Always black on white. */}
      {step === 3 && feedbackUrl && (
        <div className={`${s.printCard} print-card`} aria-hidden="true">
          <p className={s.printName}>{d.biz}</p>
          <p className={s.printAsk}>How was your visit? Scan to tell us</p>
          <QrCode value={feedbackUrl} size={260} label="" />
          <p className={s.printFoot}>Powered by Neario ReviewFlow</p>
        </div>
      )}
    </div>
  );
}
