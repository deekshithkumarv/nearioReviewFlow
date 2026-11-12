'use client';

import { useId, useState } from 'react';
import Link from 'next/link';
import { Copy, ExternalLink, Printer } from 'lucide-react';
import QrCode from '../../components/QrCode';
import Reveal from '../../components/ui/Reveal';
import { showToast } from '../../components/ui/Toast';
import s from '../dashboard.module.css';
import { copyText } from './format';

const LANGS = [
  { id: 'en', label: 'English', caption: 'Scan to share feedback' },
  { id: 'hi', label: 'हिन्दी', caption: 'अपनी राय देने के लिए स्कैन करें' },
  { id: 'kn', label: 'ಕನ್ನಡ', caption: 'ಅಭಿಪ್ರಾಯ ನೀಡಲು ಸ್ಕ್ಯಾನ್ ಮಾಡಿ' },
];
const SIZES = [
  { id: 'A6', note: 'Table tent' },
  { id: 'A5', note: 'Counter stand' },
  { id: 'A4', note: 'Wall poster' },
];

export default function QrCardView({ biz, origin }) {
  const [lang, setLang] = useState('en');
  const [size, setSize] = useState('A5');
  const sizeLabel = useId();
  const langLabel = useId();
  const url = `${origin}/feedback/${biz.id}`;
  const caption = LANGS.find((l) => l.id === lang)?.caption;

  return (
    <Reveal>
      {/* Page size for this print only; the style tag goes away when the view does. */}
      <style>{`@page { size: ${size} portrait; margin: 10mm; }`}</style>

      <div className={`${s.pageHead} ${s.noPrint}`}>
        <div className={s.pageHeadText}>
          <h1 className={s.pageTitle}>QR card</h1>
          <p className={s.pageSub}>Print this card for your counter or tables. Every scan opens the private feedback page for {biz.name}.</p>
        </div>
      </div>

      <div className={s.qrLayout}>
        <div className={`${s.controls} ${s.noPrint}`}>
          <div className="field">
            <span className="label">Feedback link</span>
            <code className={s.linkBox}>{url}</code>
            <div className={s.btnRow}>
              <button type="button" className="btn btn-sm" onClick={() => copyText(url, 'Feedback link copied.', showToast)}>
                <Copy aria-hidden="true" />
                Copy link
              </button>
              <Link href={`/feedback/${biz.id}`} target="_blank" rel="noopener noreferrer" className="btn btn-sm">
                <ExternalLink aria-hidden="true" />
                Open page
                <span className="visually-hidden"> (opens in a new tab)</span>
              </Link>
            </div>
          </div>

          <div className="field">
            <span className="label" id={sizeLabel}>
              Card size
            </span>
            <div className={s.segmented} role="group" aria-labelledby={sizeLabel}>
              {SIZES.map((sz) => (
                <button key={sz.id} type="button" className={s.segBtn} aria-pressed={size === sz.id} onClick={() => setSize(sz.id)}>
                  {sz.id}
                </button>
              ))}
            </div>
            <span className="hint">{SIZES.find((x) => x.id === size)?.note}. Print on thick paper or card for best results.</span>
          </div>

          <div className="field">
            <span className="label" id={langLabel}>
              Card language
            </span>
            <div className={s.segmented} role="group" aria-labelledby={langLabel}>
              {LANGS.map((l) => (
                <button key={l.id} type="button" lang={l.id} className={s.segBtn} aria-pressed={lang === l.id} onClick={() => setLang(l.id)}>
                  {l.label}
                </button>
              ))}
            </div>
            <span className="hint">Customers can still switch language on the feedback page.</span>
          </div>

          <div>
            <button type="button" className="btn btn-primary" onClick={() => window.print()}>
              <Printer aria-hidden="true" />
              Print or save as PDF
            </button>
          </div>
        </div>

        <div className={s.preview}>
          <span className={`${s.previewLabel} ${s.noPrint}`}>Preview</span>
          <div className={`${s.printCard} print-card`} data-size={size}>
            <div className={s.cardName}>{biz.name}</div>
            {biz.city && <div className={s.cardCity}>{biz.city}</div>}
            <div className={s.cardQr}>
              <QrCode value={url} size={220} label={`QR code linking to the feedback page for ${biz.name}`} />
            </div>
            <div className={s.cardCaption} lang={lang}>
              {caption}
            </div>
            <div className={s.cardFoot}>
              {biz.agency_name ? `Managed by ${biz.agency_name} · ` : ''}Powered by Neario
            </div>
          </div>
        </div>
      </div>
    </Reveal>
  );
}
