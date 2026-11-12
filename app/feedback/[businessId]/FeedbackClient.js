'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { m, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, CircleAlert, Copy, ExternalLink, MapPin, QrCode, RotateCcw, ShieldCheck, Star, WifiOff } from 'lucide-react';
import { showToast } from '../../components/ui/Toast';
import { LogoMark } from '../../components/ui/Logo';
import s from './feedback.module.css';

// All customer-facing text. Every key exists in en, hi and kn.
const L = {
  en: {
    q1: 'How was your visit?',
    phoneErr: 'Enter a valid 10-digit mobile number, or leave it blank.',
    sendErr: 'We could not send your feedback. Nothing was lost, please try again.',
    offlineErr: 'You seem to be offline. Your feedback is still here, try again when you are connected.',
    copyErr: 'Could not copy. Select the text and copy it yourself.',
    retry: 'Try again',
    ph: 'Tell us what you liked or what we can do better…',
    consent: 'I agree that the business may contact me on this number about my feedback.',
    consentErr: 'Tick the box to let the business contact you, or clear the phone number.',
    del: 'To delete your feedback or number, ask the business.',
    privLink: 'Privacy policy',
    next: 'Next',
    q2: 'Tell us a little more',
    svc: 'Which service did you have?',
    tags: 'What stood out? (optional)',
    txt: 'Your feedback (optional)',
    contact: 'Phone number (optional, only if you want us to get in touch)',
    back: 'Back',
    send: 'Send feedback',
    privacy: 'Your feedback goes directly to the business. Your phone number is only used if you ask us to contact you.',
    thanks: 'Thank you!',
    saved: 'Your feedback was saved securely in Neario.',
    gTitle: 'Want to share it on Google too?',
    gBody: 'It is your choice. Anyone can leave a public Google review, whatever their rating. You write and post it yourself.',
    gBtn: 'Write a Google review',
    copy: 'Copy my feedback',
    done: 'Rate another visit',
    foot: 'Powered by Neario ReviewFlow',
    copied: 'Feedback copied. Paste it into your Google review.',
    pick: 'Please pick a rating',
    r: ['Poor', 'Fair', 'Good', 'Very good', 'Excellent'],
    S: ['Haircut', 'Facial', 'Hair Spa', 'Other'],
    T: ['Friendly staff', 'Clean space', 'Waiting time', 'Value for money', 'Result quality', 'Booking was easy'],
    stepOf: (n) => `Step ${n} of 3`,
    starN: (n) => (n === 1 ? '1 star' : `${n} stars`),
    langLabel: 'Language',
    phPhone: '10-digit mobile number',
    newTab: '(opens in a new tab)',
  },
  hi: {
    q1: 'आपका अनुभव कैसा रहा?',
    phoneErr: 'सही 10 अंकों का मोबाइल नंबर डालें, या इसे खाली छोड़ दें।',
    sendErr: 'आपकी राय नहीं भेजी जा सकी। कुछ भी नहीं खोया, कृपया फिर से कोशिश करें।',
    offlineErr: 'आप ऑफ़लाइन लगते हैं। आपकी राय यहीं है, कनेक्ट होने पर फिर से भेजें।',
    copyErr: 'कॉपी नहीं हो सका। टेक्स्ट चुनकर खुद कॉपी करें।',
    retry: 'फिर से कोशिश करें',
    ph: 'बताइए क्या अच्छा लगा या हम क्या बेहतर कर सकते हैं…',
    consent: 'मैं सहमत हूँ कि मेरी राय के बारे में यह व्यवसाय मुझे इस नंबर पर संपर्क कर सकता है।',
    consentErr: 'व्यवसाय को संपर्क की अनुमति देने के लिए बॉक्स चुनें, या फ़ोन नंबर हटा दें।',
    del: 'अपनी राय या नंबर हटवाने के लिए बिज़नेस से कहें।',
    privLink: 'प्राइवेसी पॉलिसी',
    next: 'आगे',
    q2: 'थोड़ा और बताइए',
    svc: 'आपने कौन सी सेवा ली?',
    tags: 'क्या खास लगा? (वैकल्पिक)',
    txt: 'आपकी राय (वैकल्पिक)',
    contact: 'फ़ोन नंबर (वैकल्पिक, केवल तभी जब आप चाहें कि हम संपर्क करें)',
    back: 'पीछे',
    send: 'राय भेजें',
    privacy: 'आपकी राय बिज़नेस मालिक तक जाती है। फ़ोन नंबर केवल तभी इस्तेमाल होगा जब आप संपर्क के लिए कहें।',
    thanks: 'धन्यवाद!',
    saved: 'आपकी राय Neario में सुरक्षित रूप से दर्ज कर ली गई है।',
    gTitle: 'क्या आप इसे Google पर भी साझा करना चाहेंगे?',
    gBody: 'यह आपकी मर्ज़ी है। रेटिंग चाहे जो हो, कोई भी Google पर सार्वजनिक रिव्यू लिख सकता है। आप खुद लिखते और पोस्ट करते हैं।',
    gBtn: 'Google रिव्यू लिखें',
    copy: 'मेरी राय कॉपी करें',
    done: 'फिर से रेटिंग दें',
    foot: 'Neario ReviewFlow द्वारा',
    copied: 'कॉपी हो गया। इसे अपने Google रिव्यू में चिपकाएँ।',
    pick: 'कृपया रेटिंग चुनें',
    r: ['खराब', 'ठीक-ठाक', 'अच्छा', 'बहुत अच्छा', 'शानदार'],
    S: ['हेयरकट', 'फ़ेशियल', 'हेयर स्पा', 'अन्य'],
    T: ['मिलनसार स्टाफ', 'साफ़-सफ़ाई', 'इंतज़ार का समय', 'पैसे की कीमत', 'काम की क्वालिटी', 'बुकिंग आसान थी'],
    stepOf: (n) => `चरण ${n} / 3`,
    starN: (n) => `${n} स्टार`,
    langLabel: 'भाषा',
    phPhone: '10 अंकों का मोबाइल नंबर',
    newTab: '(नए टैब में खुलेगा)',
  },
  kn: {
    q1: 'ನಿಮ್ಮ ಭೇಟಿ ಹೇಗಿತ್ತು?',
    phoneErr: 'ಸರಿಯಾದ 10 ಅಂಕಿಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ನಮೂದಿಸಿ, ಅಥವಾ ಖಾಲಿ ಬಿಡಿ.',
    sendErr: 'ನಿಮ್ಮ ಅಭಿಪ್ರಾಯ ಕಳುಹಿಸಲಾಗಲಿಲ್ಲ. ಏನೂ ಕಳೆದುಹೋಗಿಲ್ಲ, ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
    offlineErr: 'ನೀವು ಆಫ್‌ಲೈನ್ ಇರುವಂತಿದೆ. ನಿಮ್ಮ ಅಭಿಪ್ರಾಯ ಇಲ್ಲೇ ಇದೆ, ಸಂಪರ್ಕ ಸಿಕ್ಕಾಗ ಮತ್ತೆ ಕಳುಹಿಸಿ.',
    copyErr: 'ನಕಲಿಸಲಾಗಲಿಲ್ಲ. ಪಠ್ಯವನ್ನು ಆಯ್ಕೆಮಾಡಿ ನೀವೇ ನಕಲಿಸಿ.',
    retry: 'ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ',
    ph: 'ಏನು ಇಷ್ಟವಾಯಿತು ಅಥವಾ ನಾವು ಏನು ಉತ್ತಮಪಡಿಸಬಹುದು ಎಂದು ತಿಳಿಸಿ…',
    consent: 'ನನ್ನ ಅಭಿಪ್ರಾಯದ ಬಗ್ಗೆ ಈ ವ್ಯಾಪಾರವು ಈ ಸಂಖ್ಯೆಯಲ್ಲಿ ನನ್ನನ್ನು ಸಂಪರ್ಕಿಸಬಹುದು ಎಂದು ನಾನು ಒಪ್ಪುತ್ತೇನೆ.',
    consentErr: 'ವ್ಯಾಪಾರ ಸಂಪರ್ಕಿಸಲು ಬಾಕ್ಸ್ ಆಯ್ಕೆ ಮಾಡಿ, ಅಥವಾ ಫೋನ್ ಸಂಖ್ಯೆ ತೆಗೆಯಿರಿ.',
    del: 'ನಿಮ್ಮ ಅಭಿಪ್ರಾಯ ಅಥವಾ ಸಂಖ್ಯೆ ಅಳಿಸಲು ವ್ಯಾಪಾರವನ್ನು ಕೇಳಿ.',
    privLink: 'ಗೌಪ್ಯತಾ ನೀತಿ',
    next: 'ಮುಂದೆ',
    q2: 'ಸ್ವಲ್ಪ ಹೆಚ್ಚು ಹೇಳಿ',
    svc: 'ನೀವು ಯಾವ ಸೇವೆ ಪಡೆದಿರಿ?',
    tags: 'ಏನು ವಿಶೇಷವೆನಿಸಿತು? (ಐಚ್ಛಿಕ)',
    txt: 'ನಿಮ್ಮ ಅಭಿಪ್ರಾಯ (ಐಚ್ಛಿಕ)',
    contact: 'ಫೋನ್ ಸಂಖ್ಯೆ (ಐಚ್ಛಿಕ, ನಾವು ಸಂಪರ್ಕಿಸಬೇಕೆಂದರೆ ಮಾತ್ರ)',
    back: 'ಹಿಂದೆ',
    send: 'ಅಭಿಪ್ರಾಯ ಕಳುಹಿಸಿ',
    privacy: 'ನಿಮ್ಮ ಅಭಿಪ್ರಾಯ ವ್ಯಾಪಾರ ಮಾಲೀಕರಿಗೆ ಹೋಗುತ್ತದೆ. ನೀವು ಕೇಳಿದರೆ ಮಾತ್ರ ಫೋನ್ ಸಂಖ್ಯೆ ಬಳಸಲಾಗುತ್ತದೆ.',
    thanks: 'ಧನ್ಯವಾದಗಳು!',
    saved: 'ನಿಮ್ಮ ಅಭಿಪ್ರಾಯ Neario ನಲ್ಲಿ ದಾಖಲಾಗಿದೆ.',
    gTitle: 'Google ನಲ್ಲಿಯೂ ಹಂಚಿಕೊಳ್ಳಲು ಬಯಸುವಿರಾ?',
    gBody: 'ಇದು ನಿಮ್ಮ ಆಯ್ಕೆ. ರೇಟಿಂಗ್ ಏನೇ ಇರಲಿ, ಯಾರು ಬೇಕಾದರೂ Google ನಲ್ಲಿ ವಿಮರ್ಶೆ ಬರೆಯಬಹುದು. ನೀವೇ ಬರೆದು ಪೋಸ್ಟ್ ಮಾಡುತ್ತೀರಿ.',
    gBtn: 'Google ವಿಮರ್ಶೆ ಬರೆಯಿರಿ',
    copy: 'ನನ್ನ ಅಭಿಪ್ರಾಯ ನಕಲಿಸಿ',
    done: 'ಮತ್ತೆ ರೇಟಿಂಗ್ ನೀಡಿ',
    foot: 'Neario ReviewFlow ನಿಂದ',
    copied: 'ನಕಲಿಸಲಾಗಿದೆ. ನಿಮ್ಮ Google ವಿಮರ್ಶೆಯಲ್ಲಿ ಅಂಟಿಸಿ.',
    pick: 'ದಯವಿಟ್ಟು ರೇಟಿಂಗ್ ಆರಿಸಿ',
    r: ['ಕಳಪೆ', 'ಸಾಧಾರಣ', 'ಒಳ್ಳೆಯದು', 'ತುಂಬಾ ಒಳ್ಳೆಯದು', 'ಅತ್ಯುತ್ತಮ'],
    S: ['ಹೇರ್‌ಕಟ್', 'ಫೇಶಿಯಲ್', 'ಹೇರ್ ಸ್ಪಾ', 'ಇತರೆ'],
    T: ['ಸ್ನೇಹಪರ ಸಿಬ್ಬಂದಿ', 'ಸ್ವಚ್ಛತೆ', 'ಕಾಯುವ ಸಮಯ', 'ಹಣಕ್ಕೆ ತಕ್ಕ ಮೌಲ್ಯ', 'ಕೆಲಸದ ಗುಣಮಟ್ಟ', 'ಬುಕಿಂಗ್ ಸುಲಭವಾಗಿತ್ತು'],
    stepOf: (n) => `ಹಂತ ${n} / 3`,
    starN: (n) => `${n} ನಕ್ಷತ್ರ`,
    langLabel: 'ಭಾಷೆ',
    phPhone: '10 ಅಂಕಿಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ',
    newTab: '(ಹೊಸ ಟ್ಯಾಬ್‌ನಲ್ಲಿ ತೆರೆಯುತ್ತದೆ)',
  },
};

const LANGS = [
  { code: 'en', short: 'EN', name: 'English' },
  { code: 'hi', short: 'हिंदी', name: 'हिन्दी' },
  { code: 'kn', short: 'ಕನ್ನಡ', name: 'ಕನ್ನಡ' },
];

const EASE = [0.2, 0.8, 0.2, 1];

// "The Green House" -> "GH": first letters of the first two words, skipping a leading "The".
function initials(name) {
  let words = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (words.length > 1 && /^the$/i.test(words[0])) words = words.slice(1);
  const firstLetter = (w) => (w.match(/[\p{L}\p{N}]/u) || [Array.from(w)[0] || ''])[0];
  const out = words.slice(0, 2).map(firstLetter).join('').toUpperCase();
  return out || 'N';
}

// The server page (page.js) loads the business and passes it in, so the form is in the first HTML response.
// The client fetch below only runs when the server couldn't load it (and for "Try again").
export default function FeedbackClient({ businessId: rawId, initialBusiness = null, initialState = 'loading' }) {
  const businessId = encodeURIComponent(rawId || '');
  const reduce = useReducedMotion();

  const [business, setBusiness] = useState(initialBusiness);
  const [loadState, setLoadState] = useState(initialState); // 'loading' | 'ready' | 'notfound' | 'error'
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [submitErr, setSubmitErr] = useState('');
  const sendingRef = useRef(false);
  const [lang, setLang] = useState('en');
  const [step, setStep] = useState(1);
  const [dir, setDir] = useState(1);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedSvc, setSelectedSvc] = useState(-1);
  const [selectedTags, setSelectedTags] = useState([]);
  const [txt, setTxt] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneErr, setPhoneErr] = useState(false);
  const [consent, setConsent] = useState(false);
  const [consentErr, setConsentErr] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const starRefs = useRef([]);
  const phoneRef = useRef(null);
  const consentRef = useRef(null);
  const focusHeadingNext = useRef(false);

  useEffect(() => {
    // First render: trust what the server sent unless it couldn't reach the data.
    if (loadAttempt === 0 && (initialState === 'ready' || initialState === 'notfound')) return;
    const ctrl = new AbortController();
    setLoadState('loading');
    fetch(`/api/feedback/${businessId}`, { signal: ctrl.signal })
      .then(async (res) => {
        if (!res.ok) {
          res.body?.cancel().catch(() => {}); // release the connection; we only need the status
          return setLoadState(res.status === 404 ? 'notfound' : 'error');
        }
        setBusiness(await res.json());
        setLoadState('ready');
      })
      .catch((err) => {
        if (err.name !== 'AbortError') setLoadState('error');
      });
    return () => ctrl.abort();
  }, [businessId, loadAttempt]); // eslint-disable-line react-hooks/exhaustive-deps -- initialState only matters on the first run

  const t = L[lang];
  const usingOwnServices = Array.isArray(business?.services) && business.services.length > 0;
  const servicesList = usingOwnServices
    ? business.services
    : t.S;

  // Moves between steps. The new step's heading takes focus once it mounts, so screen readers hear it.
  function goTo(next, direction = next > step ? 1 : -1) {
    setDir(direction);
    focusHeadingNext.current = true;
    setStep(next);
    if (typeof window !== 'undefined' && window.scrollY > 0) {
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    }
  }

  const headingRef = useCallback((node) => {
    if (node && focusHeadingNext.current) {
      focusHeadingNext.current = false;
      node.focus({ preventScroll: true });
    }
  }, []);

  function toggleTag(idx) {
    setSelectedTags((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  }

  function onStarKey(e, star) {
    let next = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') next = Math.min(5, star + 1);
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') next = Math.max(1, star - 1);
    else if (e.key === 'Home') next = 1;
    else if (e.key === 'End') next = 5;
    if (next === null) return;
    e.preventDefault();
    setRating(next);
    starRefs.current[next - 1]?.focus();
  }

  async function handleSendFeedback() {
    if (sendingRef.current) return; // a fast double tap must not send twice
    setSubmitErr('');
    if (phone.trim()) {
      if (!/^\d{10}$/.test(phone.trim()) || /^0{10}$/.test(phone.trim())) {
        setPhoneErr(true);
        phoneRef.current?.focus();
        return;
      }
      if (!consent) {
        setConsentErr(true);
        consentRef.current?.focus();
        return;
      }
    }
    setPhoneErr(false);
    setConsentErr(false);
    sendingRef.current = true;
    setSubmitting(true);

    try {
      // Stored in English so the owner's dashboard groups the same answer together whatever language the customer used.
      const svcName = selectedSvc < 0 ? null : usingOwnServices ? servicesList[selectedSvc] : L.en.S[selectedSvc];
      const tagNames = selectedTags.map((i) => L.en.T[i]);

      const res = await fetch(`/api/feedback/${businessId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating,
          text: txt.trim() || null,
          service: svcName,
          tags: tagNames,
          phone: phone.trim() || null,
          contactOk: consent,
          lang,
        }),
      });

      if (res.ok) {
        res.body?.cancel().catch(() => {});
        goTo(3, 1);
        return;
      }
      const errData = await res.json().catch(() => ({}));
      // Validation messages from the server are safe to show; anything else gets a friendly retry message.
      setSubmitErr(res.status >= 400 && res.status < 500 && errData.error ? errData.error : t.sendErr);
    } catch {
      setSubmitErr(navigator.onLine === false ? t.offlineErr : t.sendErr);
    } finally {
      sendingRef.current = false;
      setSubmitting(false);
    }
  }

  function handleReset() {
    setRating(0);
    setHoverRating(0);
    setSelectedSvc(-1);
    setSelectedTags([]);
    setTxt('');
    setPhone('');
    setPhoneErr(false);
    setConsent(false);
    setConsentErr(false);
    setSubmitErr('');
    goTo(1, 1);
  }

  async function copyFeedback() {
    try {
      await navigator.clipboard.writeText(txt);
      showToast(t.copied, { tone: 'success' });
    } catch {
      showToast(t.copyErr, { tone: 'error' });
    }
  }

  const stepVariants = {
    enter: (d) => ({ opacity: 0, x: reduce ? 0 : 28 * d }),
    center: { opacity: 1, x: 0 },
    exit: (d) => ({ opacity: 0, x: reduce ? 0 : -28 * d }),
  };
  const stepTransition = { duration: reduce ? 0 : 0.26, ease: EASE };
  const revealProps = {
    initial: { height: 0, opacity: 0 },
    animate: { height: 'auto', opacity: 1 },
    exit: { height: 0, opacity: 0 },
    transition: { duration: reduce ? 0 : 0.22, ease: EASE },
  };

  const footer = (
    <footer className={s.foot}>
      <p>
        {t.del}{' '}
        <Link href="/privacy" target="_blank" rel="noopener">
          {t.privLink}
        </Link>
      </p>
      <p className={s.powered}>
        <LogoMark size={16} />
        <span>{t.foot}</span>
      </p>
    </footer>
  );

  if (loadState !== 'ready') {
    return (
      <div className={s.page} lang="en">
        <main id="main" className={s.wrap}>
          {loadState === 'loading' ? (
            <div aria-busy="true" aria-label="Loading feedback page" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <span className="skeleton" style={{ height: 44, width: 168, borderRadius: 10 }} />
              </div>
              <div className={s.skelHead}>
                <span className="skeleton" style={{ height: 56, width: 56, borderRadius: 14 }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <span className="skeleton" style={{ height: 22, width: '65%' }} />
                  <span className="skeleton" style={{ height: 14, width: '40%' }} />
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span className="skeleton" style={{ height: 12, width: 80 }} />
                <span className="skeleton" style={{ height: 6 }} />
              </div>
              <div className={s.card}>
                <div className={s.step}>
                  <span className="skeleton" style={{ height: 34, width: '70%' }} />
                  <div className={s.skelStars}>
                    {[1, 2, 3, 4, 5].map((n) => <span key={n} className="skeleton" />)}
                  </div>
                  <span className="skeleton" style={{ height: 20, width: '30%', alignSelf: 'center' }} />
                  <span className="skeleton" style={{ height: 52, borderRadius: 10 }} />
                </div>
              </div>
            </div>
          ) : (
            <section className={`${s.card} ${s.problem}`} role="alert">
              <span className={s.problemIcon} aria-hidden="true">
                {loadState === 'notfound' ? <QrCode /> : <WifiOff />}
              </span>
              <h1>
                {loadState === 'notfound' ? 'This feedback link isn’t active' : 'We couldn’t open this page'}
              </h1>
              <p>
                {loadState === 'notfound'
                  ? 'The QR code or link may be out of date. Please let the staff know.'
                  : 'Check your connection and try again.'}
              </p>
              {loadState === 'error' && (
                <button type="button" className="btn btn-primary btn-lg" onClick={() => setLoadAttempt((n) => n + 1)}>
                  <RotateCcw aria-hidden="true" />
                  Try again
                </button>
              )}
            </section>
          )}
        </main>
      </div>
    );
  }

  const shownRating = hoverRating || rating;
  const phoneShown = phone.trim().length > 0;

  return (
    <div className={s.page} lang={lang}>
      <div className={s.wrap}>
        <header className={s.header}>
          <div className={s.topbar}>
            <div className={s.langs} role="group" aria-label={t.langLabel}>
              {LANGS.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  className={s.langBtn}
                  onClick={() => setLang(l.code)}
                  aria-pressed={lang === l.code}
                  lang={l.code}
                >
                  {l.short}
                </button>
              ))}
            </div>
          </div>
          <div className={s.biz}>
            <div className={s.avatar} aria-hidden="true">{initials(business.name)}</div>
            <div className={s.bizText}>
              <p className={s.bizName}>{business.name}</p>
              {business.city && (
                <p className={s.bizCity}>
                  <MapPin aria-hidden="true" />
                  <span>{business.city}</span>
                </p>
              )}
            </div>
          </div>
        </header>

        <main id="main" className={s.main}>
          <div className={s.progress}>
            <p className={s.progressLabel}>{t.stepOf(step)}</p>
            <div className={s.segments} aria-hidden="true">
              {[1, 2, 3].map((n) => (
                <span key={n} className={s.segment}>
                  <m.span
                    className={s.segmentFill}
                    initial={false}
                    animate={{ scaleX: step >= n ? 1 : 0 }}
                    transition={{ duration: reduce ? 0 : 0.36, ease: EASE, delay: reduce ? 0 : 0.08 }}
                  />
                </span>
              ))}
            </div>
          </div>

          <div className={s.card}>
            <AnimatePresence mode="wait" initial={false} custom={dir}>
              {step === 1 && (
                <m.section
                  key="rate"
                  className={s.step}
                  custom={dir}
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={stepTransition}
                  aria-labelledby="fb-h-1"
                >
                  <h1 id="fb-h-1" ref={headingRef} tabIndex={-1}>{t.q1}</h1>

                  <div>
                    <div
                      className={s.stars}
                      role="group"
                      aria-labelledby="fb-h-1"
                      onPointerLeave={() => setHoverRating(0)}
                    >
                      {[1, 2, 3, 4, 5].map((star) => {
                        const filled = star <= shownRating;
                        const popped = star <= rating;
                        return (
                          <button
                            key={star}
                            ref={(el) => { starRefs.current[star - 1] = el; }}
                            type="button"
                            className={s.star}
                            data-on={filled}
                            onClick={() => setRating(star)}
                            onKeyDown={(e) => onStarKey(e, star)}
                            onPointerEnter={(e) => { if (e.pointerType === 'mouse') setHoverRating(star); }}
                            aria-pressed={star === rating}
                            aria-label={`${t.starN(star)}, ${t.r[star - 1]}`}
                          >
                            <m.span
                              key={popped ? `on-${rating}` : 'off'}
                              className={s.starIcon}
                              initial={popped && !reduce ? { scale: 0.55 } : false}
                              animate={{ scale: 1 }}
                              whileTap={reduce ? undefined : { scale: 0.86 }}
                              transition={{ type: 'spring', stiffness: 520, damping: 14, delay: (star - 1) * 0.035 }}
                            >
                              <Star aria-hidden="true" strokeWidth={1.5} fill={filled ? 'currentColor' : 'none'} />
                            </m.span>
                          </button>
                        );
                      })}
                    </div>
                    <p className={s.ratingWord} aria-live="polite">
                      {shownRating ? t.r[shownRating - 1] : <span className={s.ratingHint}>{t.pick}</span>}
                    </p>
                  </div>

                  <button
                    type="button"
                    className="btn btn-primary btn-lg btn-block"
                    disabled={!rating}
                    onClick={() => {
                      if (!rating) {
                        showToast(t.pick);
                        return;
                      }
                      goTo(2);
                    }}
                  >
                    {t.next}
                    <ArrowRight aria-hidden="true" />
                  </button>
                </m.section>
              )}

              {step === 2 && (
                <m.section
                  key="details"
                  className={s.step}
                  custom={dir}
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={stepTransition}
                  aria-labelledby="fb-h-2"
                >
                  <div className={s.headGroup}>
                    <span className={s.summary}>
                      <span className={s.summaryStars} aria-hidden="true">
                        {Array.from({ length: rating }, (_, i) => (
                          <Star key={i} fill="currentColor" strokeWidth={1.5} />
                        ))}
                      </span>
                      <span>
                        <span className="visually-hidden">{t.starN(rating)}, </span>
                        {t.r[rating - 1]}
                      </span>
                    </span>
                    <h1 id="fb-h-2" ref={headingRef} tabIndex={-1}>{t.q2}</h1>
                  </div>

                  <fieldset className={s.fieldset}>
                    <legend className={s.legend}>{t.svc}</legend>
                    <div className={s.chips}>
                      {servicesList.map((sv, i) => (
                        <button
                          key={sv}
                          type="button"
                          className={s.chip}
                          onClick={() => setSelectedSvc(selectedSvc === i ? -1 : i)}
                          aria-pressed={selectedSvc === i}
                        >
                          {selectedSvc === i && <Check aria-hidden="true" strokeWidth={2.5} />}
                          {sv}
                        </button>
                      ))}
                    </div>
                  </fieldset>

                  <fieldset className={s.fieldset}>
                    <legend className={s.legend}>{t.tags}</legend>
                    <div className={s.chips}>
                      {t.T.map((tag, i) => {
                        const on = selectedTags.includes(i);
                        return (
                          <button
                            key={tag}
                            type="button"
                            className={s.chip}
                            onClick={() => toggleTag(i)}
                            aria-pressed={on}
                          >
                            {on && <Check aria-hidden="true" strokeWidth={2.5} />}
                            {tag}
                          </button>
                        );
                      })}
                    </div>
                  </fieldset>

                  <div className="field">
                    <div className={s.labelRow}>
                      <label className="label" htmlFor="fb-text">{t.txt}</label>
                      <span className={s.counter} id="fb-text-count">{txt.length}/500</span>
                    </div>
                    <textarea
                      id="fb-text"
                      className="textarea"
                      value={txt}
                      onChange={(e) => setTxt(e.target.value)}
                      maxLength={500}
                      rows={4}
                      placeholder={t.ph}
                      aria-describedby="fb-text-count"
                    />
                  </div>

                  <div className="field">
                    <label className="label" htmlFor="fb-phone">{t.contact}</label>
                    <input
                      ref={phoneRef}
                      id="fb-phone"
                      className="input"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel-national"
                      maxLength={10}
                      pattern="\d{10}"
                      placeholder={t.phPhone}
                      value={phone}
                      onChange={(e) => {
                        const v = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setPhone(v);
                        setPhoneErr(false);
                        if (!v) setConsentErr(false);
                      }}
                      aria-invalid={phoneErr || undefined}
                      aria-describedby={phoneErr ? 'fb-phone-err' : undefined}
                    />
                    {phoneErr && (
                      <p id="fb-phone-err" className="field-error" role="alert">
                        <CircleAlert aria-hidden="true" />
                        {t.phoneErr}
                      </p>
                    )}
                  </div>

                  <AnimatePresence initial={false}>
                    {phoneShown && (
                      <m.div key="consent" className={s.reveal} {...revealProps}>
                        <div className={s.consent}>
                          <label className="check" htmlFor="fb-consent">
                            <input
                              ref={consentRef}
                              id="fb-consent"
                              type="checkbox"
                              checked={consent}
                              onChange={(e) => {
                                setConsent(e.target.checked);
                                if (e.target.checked) setConsentErr(false);
                              }}
                              aria-invalid={consentErr || undefined}
                              aria-describedby={consentErr ? 'fb-consent-err' : undefined}
                            />
                            <span>{t.consent}</span>
                          </label>
                          {consentErr && (
                            <p id="fb-consent-err" className="field-error" role="alert" style={{ marginTop: 8 }}>
                              <CircleAlert aria-hidden="true" />
                              {t.consentErr}
                            </p>
                          )}
                        </div>
                      </m.div>
                    )}
                  </AnimatePresence>

                  <p className={s.privacyNote}>
                    <ShieldCheck aria-hidden="true" />
                    <span>{t.privacy}</span>
                  </p>

                  {submitErr && (
                    <div className="alert alert-danger" role="alert">
                      <CircleAlert aria-hidden="true" />
                      <span>{submitErr}</span>
                    </div>
                  )}

                  <div className={s.actions}>
                    <button type="button" className="btn btn-lg" onClick={() => goTo(1)} disabled={submitting}>
                      <ArrowLeft aria-hidden="true" />
                      {t.back}
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary btn-lg"
                      disabled={submitting}
                      aria-busy={submitting}
                      onClick={handleSendFeedback}
                    >
                      {submitting ? <><span className="spinner" aria-hidden="true" /> {t.send}…</> : submitErr ? t.retry : t.send}
                    </button>
                  </div>
                </m.section>
              )}

              {step === 3 && (
                <m.section
                  key="thanks"
                  className={`${s.step} ${s.done}`}
                  custom={dir}
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={stepTransition}
                  aria-labelledby="fb-h-3"
                >
                  <div className={s.check} aria-hidden="true">
                    <svg viewBox="0 0 52 52">
                      <m.circle
                        cx="26"
                        cy="26"
                        r="25"
                        fill="var(--success-soft)"
                        initial={reduce ? false : { scale: 0.4, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 380, damping: 18, delay: 0.05 }}
                      />
                      <m.path
                        d="M15.5 27l7 7 14-15"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={reduce ? false : { pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 0.38, ease: EASE, delay: 0.22 }}
                      />
                    </svg>
                  </div>

                  <div className={s.doneText}>
                    <h1 id="fb-h-3" ref={headingRef} tabIndex={-1}>{t.thanks}</h1>
                    <p>{t.saved}</p>
                  </div>

                  {txt && <blockquote className={s.quote}>“{txt}”</blockquote>}

                  {business.googleReviewUrl && (
                    <section className={s.google} aria-labelledby="fb-g-title">
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <h2 id="fb-g-title">{t.gTitle}</h2>
                        <p>{t.gBody}</p>
                      </div>
                      <div className={s.googleBtns}>
                        <a
                          href={business.googleReviewUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-primary btn-lg btn-block"
                        >
                          {t.gBtn}
                          <ExternalLink aria-hidden="true" />
                          <span className="visually-hidden"> {t.newTab}</span>
                        </a>
                        {txt && (
                          <button type="button" className="btn btn-lg btn-block" onClick={copyFeedback}>
                            <Copy aria-hidden="true" />
                            {t.copy}
                          </button>
                        )}
                      </div>
                    </section>
                  )}

                  <button type="button" className="btn btn-ghost btn-lg" onClick={handleReset}>
                    <RotateCcw aria-hidden="true" />
                    {t.done}
                  </button>
                </m.section>
              )}
            </AnimatePresence>
          </div>
        </main>

        {footer}
      </div>
    </div>
  );
}
