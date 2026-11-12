'use client';

import { useRef } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import Reveal from '../ui/Reveal';
import s from './landing.module.css';

const PLANS = {
  monthly: {
    name: 'Monthly',
    amount: '₹599',
    unit: 'a month',
    desc: 'Billed every month. Switch to yearly and your first 3 months are free.',
    cta: 'Start with monthly',
    note: 'The price you see is the price you pay. No GST is added.',
  },
  yearly: {
    name: 'Yearly',
    amount: '₹5,391',
    was: '₹7,188',
    unit: 'one bill for 12 months',
    desc: 'You pay for 9 months and use Neario for 12. That is about ₹449 a month, and you save ₹1,797.',
    cta: 'Start with yearly',
    note: 'No GST is added. Full refund if you ask within 7 days of paying.',
  },
};

const OPTIONS = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly', extra: '3 months free' },
];

const INCLUDED = [
  'QR cards and TapReview stand pages for each location',
  'Dashboard with rating trends and a breakdown by service',
  'Growth Radar themes from what customers write',
  'Google review reply drafts, posted only when you approve',
  'Feedback page in English, Hindi and Kannada',
];

export default function Pricing({ plan, setPlan, onStart }) {
  const refs = useRef({});
  const cur = PLANS[plan] || PLANS.yearly;

  function onKeyDown(e) {
    const keys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'];
    if (!keys.includes(e.key)) return;
    e.preventDefault();
    const idx = OPTIONS.findIndex((o) => o.value === plan);
    let next = idx;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (idx - 1 + OPTIONS.length) % OPTIONS.length;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (idx + 1) % OPTIONS.length;
    if (e.key === 'Home') next = 0;
    if (e.key === 'End') next = OPTIONS.length - 1;
    const value = OPTIONS[next].value;
    setPlan(value);
    refs.current[value]?.focus();
  }

  return (
    <div className={`container ${s.pricingGrid}`}>
      <div className={s.pricingCopy}>
        <p className="eyebrow">Pricing</p>
        <h2 id="pricing-title" className={s.h2}>
          One plan. Two ways to pay.
        </h2>
        <p className={s.lead}>
          Everything is included either way. Pay monthly, or pay once for the year and get the first 3 months free.
        </p>
        <h3 className={s.includedTitle}>Included in both</h3>
        <ul className={s.included}>
          {INCLUDED.map((item) => (
            <li key={item}>
              <Check aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <Reveal className={s.priceCard}>
        <div className={s.segmented} role="radiogroup" aria-label="Billing period" onKeyDown={onKeyDown}>
          {OPTIONS.map((o) => {
            const checked = plan === o.value;
            return (
              <button
                key={o.value}
                ref={(el) => {
                  refs.current[o.value] = el;
                }}
                type="button"
                role="radio"
                aria-checked={checked}
                tabIndex={checked ? 0 : -1}
                className={s.segment}
                onClick={() => setPlan(o.value)}
              >
                {o.label}
                {o.extra && <span className={s.segmentExtra}>{o.extra}</span>}
              </button>
            );
          })}
        </div>

        <div className={s.priceBody} aria-live="polite">
          <p className={s.planName}>
            Growth plan · {cur.name}
            {plan === 'yearly' && <span className={`badge badge-brand ${s.planBadge}`}>First 3 months free</span>}
          </p>
          <p key={plan} className={s.amountRow}>
            <span className={s.amount}>{cur.amount}</span>
            {cur.was && (
              <s className={s.was}>
                <span className="visually-hidden">instead of </span>
                {cur.was}
              </s>
            )}
            <span className={s.unit}>{cur.unit}</span>
          </p>
          <p className={s.priceDesc}>{cur.desc}</p>
        </div>

        <a href="/start" className="btn btn-primary btn-lg btn-block" onClick={onStart}>
          {cur.cta}
          <ArrowRight aria-hidden="true" />
        </a>
        <p className={s.priceNote}>{cur.note}</p>
      </Reveal>
    </div>
  );
}
