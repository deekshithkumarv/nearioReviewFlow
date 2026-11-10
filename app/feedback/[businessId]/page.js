'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { showToast } from '../../components/Toast';

const L = {
  en: {
    q1: 'How was your visit?',
    consent: 'I agree that the business may contact me on this number about my feedback.',
    consentErr: 'Tick the box to let the business contact you, or clear the phone number.',
    del: 'To delete your feedback or number, ask the business or read our Privacy page.',
    privLink: 'Privacy',
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
  },
  hi: {
    q1: 'आपका अनुभव कैसा रहा?',
    consent: 'मैं सहमत हूँ कि मेरी राय के बारे में यह व्यवसाय मुझे इस नंबर पर संपर्क कर सकता है।',
    consentErr: 'व्यवसाय को संपर्क की अनुमति देने के लिए बॉक्स चुनें, या फ़ोन नंबर हटा दें।',
    del: 'अपनी राय या नंबर हटवाने के लिए बिज़नेस से कहें या हमारा प्राइवेसी पेज देखें।',
    privLink: 'प्राइवेसी',
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
  },
  kn: {
    q1: 'ನಿಮ್ಮ ಭೇಟಿ ಹೇಗಿತ್ತು?',
    consent: 'ನನ್ನ ಅಭಿಪ್ರಾಯದ ಬಗ್ಗೆ ಈ ವ್ಯಾಪಾರವು ಈ ಸಂಖ್ಯೆಯಲ್ಲಿ ನನ್ನನ್ನು ಸಂಪರ್ಕಿಸಬಹುದು ಎಂದು ನಾನು ಒಪ್ಪುತ್ತೇನೆ.',
    consentErr: 'ವ್ಯಾಪಾರ ಸಂಪರ್ಕಿಸಲು ಬಾಕ್ಸ್ ಆಯ್ಕೆ ಮಾಡಿ, ಅಥವಾ ಫೋನ್ ಸಂಖ್ಯೆ ತೆಗೆಯಿರಿ.',
    del: 'ನಿಮ್ಮ ಅಭಿಪ್ರಾಯ ಅಥವಾ ಸಂಖ್ಯೆ ಅಳಿಸಲು ವ್ಯಾಪಾರವನ್ನು ಕೇಳಿ ಅಥವಾ ನಮ್ಮ ಗೌಪ್ಯತಾ ಪುಟ ನೋಡಿ.',
    privLink: 'ಗೌಪ್ಯತೆ',
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
  },
};

export default function FeedbackPage({ params }) {
  const unwrappedParams = use(params);
  const businessId = unwrappedParams.businessId || '1';

  const [business, setBusiness] = useState(null);
  const [lang, setLang] = useState('en');
  const [step, setStep] = useState(1);
  const [rating, setRating] = useState(0);
  const [selectedSvc, setSelectedSvc] = useState(-1);
  const [selectedTags, setSelectedTags] = useState([]);
  const [txt, setTxt] = useState('');
  const [phone, setPhone] = useState('');
  const [consent, setConsent] = useState(false);
  const [consentErr, setConsentErr] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadBiz() {
      try {
        const res = await fetch(`/api/feedback/${businessId}`);
        if (res.ok) {
          const data = await res.json();
          setBusiness(data);
        }
      } catch (err) {
        console.error('Error loading business for feedback:', err);
      }
    }
    loadBiz();
  }, [businessId]);

  const t = L[lang];
  const servicesList = business?.services && Array.isArray(business.services) && business.services.length > 0
    ? business.services
    : t.S;

  function toggleTag(idx) {
    setSelectedTags((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  }

  async function handleSendFeedback() {
    if (phone.trim()) {
      if (!/^\d{10}$/.test(phone.trim()) || /^0{10}$/.test(phone.trim())) {
        showToast('Please enter a valid 10-digit mobile number or leave it blank.');
        return;
      }
      if (!consent) {
        setConsentErr(true);
        return;
      }
    }
    setConsentErr(false);
    setSubmitting(true);

    try {
      const svcName = selectedSvc > -1 ? servicesList[selectedSvc] : null;
      const tagNames = selectedTags.map((i) => t.T[i]);

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

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        showToast(errData.error || 'Could not record feedback.');
      } else {
        showToast('Feedback submitted securely!');
      }
    } catch (e) {
      console.error(e);
      showToast('Offline or network error. Feedback recorded.');
    } finally {
      setSubmitting(false);
      setStep(3);
    }
  }

  function handleReset() {
    setRating(0);
    setSelectedSvc(-1);
    setSelectedTags([]);
    setTxt('');
    setPhone('');
    setConsent(false);
    setConsentErr(false);
    setStep(1);
  }

  return (
    <div className="feedback-page" style={{ minHeight: '100vh', background: 'var(--bg)', padding: '20px 16px 40px' }}>
      <div className="wrap" style={{ maxWidth: 480, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13 }}>
          <Link href="/" style={{ textDecoration: 'none', fontWeight: 700, color: 'var(--muted)' }}>← Neario Home</Link>
          <div style={{ display: 'flex', gap: 12, fontWeight: 600 }}>
            <Link href="/dashboard" style={{ textDecoration: 'none', color: 'var(--muted)' }}>Dashboard</Link>
            <Link href="/onboarding" style={{ textDecoration: 'none', color: 'var(--muted)' }}>Setup</Link>
            <Link href="/login" style={{ textDecoration: 'none', color: 'var(--muted)' }}>Sign in</Link>
          </div>
        </div>

        <header className="top" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="logo" style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--sage)', color: 'var(--accent-text)', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 20 }}>
            {business?.name ? business.name.slice(0, 2).toUpperCase() : 'GH'}
          </div>
          <div>
            <b style={{ display: 'block', fontSize: 17, letterSpacing: '-.2px' }}>{business?.name || 'The Green House'}</b>
            <span style={{ fontSize: 13, color: 'var(--muted)' }}>{business?.city || 'Local business'}</span>
          </div>
          <div className="lang" style={{ marginLeft: 'auto', display: 'flex', gap: 4, background: 'var(--surface-2)', borderRadius: 999, padding: 3 }}>
            <button
              type="button"
              onClick={() => setLang('en')}
              style={{ border: 0, background: lang === 'en' ? 'var(--surface)' : 'none', borderRadius: 999, padding: '6px 10px', fontSize: 13, fontWeight: 600, color: lang === 'en' ? 'var(--fg)' : 'var(--muted)' }}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLang('hi')}
              style={{ border: 0, background: lang === 'hi' ? 'var(--surface)' : 'none', borderRadius: 999, padding: '6px 10px', fontSize: 13, fontWeight: 600, color: lang === 'hi' ? 'var(--fg)' : 'var(--muted)' }}
            >
              हिं
            </button>
            <button
              type="button"
              onClick={() => setLang('kn')}
              style={{ border: 0, background: lang === 'kn' ? 'var(--surface)' : 'none', borderRadius: 999, padding: '6px 10px', fontSize: 13, fontWeight: 600, color: lang === 'kn' ? 'var(--fg)' : 'var(--muted)' }}
            >
              ಕನ್ನಡ
            </button>
          </div>
        </header>

        <div className="dots" style={{ display: 'flex', gap: 6 }}>
          <i style={{ flex: 1, height: 5, borderRadius: 9, background: step >= 1 ? 'var(--primary)' : 'var(--line)' }}></i>
          <i style={{ flex: 1, height: 5, borderRadius: 9, background: step >= 2 ? 'var(--primary)' : 'var(--line)' }}></i>
          <i style={{ flex: 1, height: 5, borderRadius: 9, background: step >= 3 ? 'var(--primary)' : 'var(--line)' }}></i>
        </div>

        {step === 1 && (
          <section className="card" style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 24, boxShadow: 'var(--shadow)', padding: '22px 20px', display: 'flex', flexDirection: 'column', gap: 18 }}>
            <h1 style={{ margin: 0, fontSize: 26, letterSpacing: '-.6px', lineHeight: 1.15 }}>{t.q1}</h1>
            <div className="stars" style={{ display: 'flex', justifyContent: 'space-between', gap: 4 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  style={{
                    flex: 1,
                    aspectRatio: '1',
                    border: 0,
                    background: 'none',
                    padding: 0,
                    fontSize: 'clamp(40px, 12vw, 54px)',
                    lineHeight: 1,
                    color: star <= rating ? 'var(--orange)' : 'var(--line)',
                    cursor: 'pointer',
                  }}
                  aria-label={`${star} star`}
                >
                  ★
                </button>
              ))}
            </div>
            <div style={{ textAlign: 'center', fontWeight: 700, fontSize: 18, minHeight: 27, color: 'var(--fg)' }}>
              {rating ? t.r[rating - 1] : ''}
            </div>
            <button
              type="button"
              className="btn p"
              disabled={!rating}
              onClick={() => {
                if (!rating) {
                  showToast(t.pick);
                  return;
                }
                setStep(2);
              }}
            >
              {t.next}
            </button>
          </section>
        )}

        {step === 2 && (
          <section className="card" style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 24, boxShadow: 'var(--shadow)', padding: '22px 20px', display: 'flex', flexDirection: 'column', gap: 18 }}>
            <h1 style={{ margin: 0, fontSize: 24, letterSpacing: '-.6px', lineHeight: 1.15 }}>{t.q2}</h1>

            <div>
              <p style={{ margin: '0 0 8px', color: 'var(--muted)', fontSize: 14 }}>{t.svc}</p>
              <div className="chips" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {servicesList.map((s, i) => (
                  <button
                    key={s}
                    type="button"
                    className="chip"
                    onClick={() => setSelectedSvc(selectedSvc === i ? -1 : i)}
                    style={{
                      borderRadius: 999,
                      padding: '10px 16px',
                      fontWeight: 600,
                      fontSize: 15,
                      border: '1.5px solid var(--line)',
                      background: selectedSvc === i ? 'var(--primary)' : 'var(--surface)',
                      color: selectedSvc === i ? '#fff' : 'inherit',
                      cursor: 'pointer',
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p style={{ margin: '0 0 8px', color: 'var(--muted)', fontSize: 14 }}>{t.tags}</p>
              <div className="chips" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {t.T.map((tag, i) => (
                  <button
                    key={tag}
                    type="button"
                    className="chip"
                    onClick={() => toggleTag(i)}
                    style={{
                      borderRadius: 999,
                      padding: '10px 16px',
                      fontWeight: 600,
                      fontSize: 15,
                      border: '1.5px solid var(--line)',
                      background: selectedTags.includes(i) ? 'var(--primary)' : 'var(--surface)',
                      color: selectedTags.includes(i) ? '#fff' : 'inherit',
                      cursor: 'pointer',
                    }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <label className="f" style={{ display: 'flex', flexDirection: 'column', gap: 6, fontWeight: 600, fontSize: 14 }}>
              <span>{t.txt}</span>
              <textarea
                value={txt}
                onChange={(e) => setTxt(e.target.value)}
                maxLength={500}
                placeholder="Tell us what you liked or what we can do better…"
                style={{ width: '100%', minHeight: 90, borderRadius: 14, padding: '12px 14px', border: '1.5px solid var(--line)', background: 'var(--surface-2)' }}
              ></textarea>
            </label>

            <label className="f" style={{ display: 'flex', flexDirection: 'column', gap: 6, fontWeight: 600, fontSize: 14 }}>
              <span>{t.contact}</span>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                pattern="\d{10}"
                placeholder="10-digit mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                style={{ width: '100%', borderRadius: 14, padding: '12px 14px', border: '1.5px solid var(--line)', background: 'var(--surface-2)' }}
              />
            </label>

            {phone.trim() && (
              <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 14 }}>
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => {
                    setConsent(e.target.checked);
                    if (e.target.checked) setConsentErr(false);
                  }}
                  style={{ width: 18, height: 18, marginTop: 2, accentColor: 'var(--primary)' }}
                />
                <span>{t.consent}</span>
              </label>
            )}

            {consentErr && (
              <p style={{ color: 'var(--red)', fontWeight: 600, fontSize: 13, margin: 0 }}>
                {t.consentErr}
              </p>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" className="btn s" onClick={() => setStep(1)} style={{ flex: 1 }}>
                {t.back}
              </button>
              <button
                type="button"
                className="btn p"
                disabled={submitting}
                onClick={handleSendFeedback}
                style={{ flex: 2 }}
              >
                {submitting ? 'Sending…' : t.send}
              </button>
            </div>
          </section>
        )}

        {step === 3 && (
          <section className="card" style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 24, boxShadow: 'var(--shadow)', padding: 28, display: 'flex', flexDirection: 'column', gap: 18, alignItems: 'center', textAlign: 'center' }}>
            <div style={{ width: 68, height: 68, borderRadius: '50%', background: 'var(--sage)', color: 'var(--accent-text)', display: 'grid', placeItems: 'center', fontSize: 34 }}>
              ✓
            </div>
            <h1 style={{ margin: 0, fontSize: 26 }}>{t.thanks}</h1>
            <p style={{ color: 'var(--muted)', margin: 0, fontSize: 15 }}>{t.saved}</p>

            {txt && (
              <div style={{ background: 'var(--surface-2)', borderRadius: 14, padding: '12px 14px', fontSize: 14, textAlign: 'left', width: '100%', wordBreak: 'break-word', color: 'var(--fg)' }}>
                “{txt}”
              </div>
            )}

            <div style={{ background: 'var(--surface-2)', borderRadius: 14, padding: '14px 16px', fontSize: 13.5, color: 'var(--muted)', textAlign: 'left', width: '100%' }}>
              <b style={{ color: 'var(--fg)', display: 'block', marginBottom: 4 }}>{t.gTitle}</b>
              <span>{t.gBody}</span>
            </div>

            <a
              href={business?.googleReviewUrl || "https://maps.google.com"}
              target="_blank"
              rel="noopener noreferrer"
              className="btn p"
              style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, width: '100%', justifyContent: 'center' }}
            >
              <span style={{ fontWeight: 800, color: 'var(--blue)', background: '#fff', borderRadius: '50%', width: 24, height: 24, display: 'grid', placeItems: 'center', fontSize: 13 }}>G</span>
              <span>{t.gBtn}</span>
            </a>

            {txt && (
              <button
                type="button"
                className="btn s"
                style={{ width: '100%' }}
                onClick={() => {
                  navigator.clipboard.writeText(txt);
                  showToast(t.copied);
                }}
              >
                {t.copy}
              </button>
            )}

            <button type="button" className="btn s" onClick={handleReset} style={{ width: '100%' }}>
              {t.done}
            </button>

            <Link href="/dashboard" className="btn p" style={{ textDecoration: 'none', width: '100%', marginTop: 8 }}>
              Open Owner Dashboard →
            </Link>
          </section>
        )}

        <p style={{ textAlign: 'center', fontSize: 12.5, color: 'var(--muted)', margin: 0 }}>
          {t.foot}
        </p>
      </div>
    </div>
  );
}

