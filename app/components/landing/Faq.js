'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import s from './landing.module.css';

const FAQ_ITEMS = [
  {
    q: 'Do you only send happy customers to Google?',
    a: 'No. That is review gating and Google does not allow it. Every customer sees the same Google review option after sending feedback.',
  },
  {
    q: 'Does Neario write reviews for my customers?',
    a: 'No. Customers write and post their own Google reviews. The tool can help tidy grammar in a customer’s own words, but never changes what they meant.',
  },
  {
    q: 'How does yearly billing work?',
    a: 'You pay one bill of ₹5,391, which covers 9 months at ₹599. The first 3 months are free, so you use Neario for the full 12 months.',
  },
  {
    q: 'Do I pay GST on top?',
    a: 'No. The price you see is the price you pay. No GST is added right now.',
  },
  {
    q: 'Can I get a refund on the yearly plan?',
    a: 'Yes, if you ask within 7 days of paying. We refund the full ₹5,391. After 7 days the yearly payment is not refundable.',
  },
  {
    q: 'I run an agency. How do I pay?',
    a: 'Each of your clients pays Neario directly and has their own login. You are not billed for them. Your agency name appears on the reports and QR cards you prepare.',
  },
  {
    q: 'Do my customers need to install an app?',
    a: 'No. They scan a QR code or tap a stand and the page opens in their browser.',
  },
  {
    q: 'What is a TapReview device?',
    a: 'A small stand that opens the same feedback page as the QR code when a phone is tapped on it.',
  },
  {
    q: 'Can the replies post automatically?',
    a: 'You can approve each reply yourself. Automatic replies are optional and come with limits you set, such as holding low-rated reviews for your approval.',
  },
  {
    q: 'Which languages can customers use?',
    a: 'The feedback page is available in English, Hindi and Kannada.',
  },
];

export default function Faq() {
  const [open, setOpen] = useState(null);

  return (
    <div className={`container ${s.faqGrid}`}>
      <div className={s.faqIntro}>
        <p className="eyebrow">FAQ</p>
        <h2 id="faq-title" className={s.h2}>
          Questions owners ask
        </h2>
        <p className={s.lead}>Short, straight answers about reviews, billing and setup.</p>
      </div>

      <ul className={s.faqList}>
        {FAQ_ITEMS.map((item, idx) => {
          const isOpen = open === idx;
          const qId = `faq-q-${idx}`;
          const aId = `faq-a-${idx}`;
          return (
            <li key={item.q} className={s.faqItem} data-open={isOpen ? 'true' : undefined}>
              <h3 className={s.faqHeading}>
                <button
                  type="button"
                  id={qId}
                  className={s.faqQ}
                  aria-expanded={isOpen}
                  aria-controls={aId}
                  onClick={() => setOpen((prev) => (prev === idx ? null : idx))}
                >
                  <span>{item.q}</span>
                  <Plus aria-hidden="true" className={s.faqIcon} />
                </button>
              </h3>
              <div id={aId} role="region" aria-labelledby={qId} className={s.faqA}>
                <div className={s.faqAInner}>
                  <p>{item.a}</p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
