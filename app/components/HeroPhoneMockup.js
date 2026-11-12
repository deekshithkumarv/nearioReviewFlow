'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Check, Lock, RotateCw, Star } from 'lucide-react';
import p from './landing/phone.module.css';

// Decorative, looping illustration of the customer flow:
// stars -> tags -> note -> sending -> sent + "Share on Google too?".
// It is one role="img" with a text description, so nothing inside is focusable.
// One full loop takes about 6 seconds. It pauses on hover, when the tab is hidden and when it is scrolled
// off screen (no wasted work), and shows a single still frame when the visitor prefers reduced motion.

const STAGE_MS = [500, 800, 850, 1000, 600, 2400]; // 0 empty, 1 stars, 2 tags, 3 note, 4 sending, 5 sent
const STILL_STAGE = 3;
const TAGS = [
  { label: 'Friendly staff', on: true },
  { label: 'Clean space', on: true },
  { label: 'Short wait', on: false },
  { label: 'Good value', on: false },
];
const DESCRIPTION =
  'Illustration of the customer feedback page on a phone. A customer of The Green House salon gives five stars, picks “Friendly staff” and “Clean space”, adds a short note and sends it. They then see the same option every customer sees: share a Google review too.';

function StatusIcons() {
  return (
    <span className={p.statusIcons} aria-hidden="true">
      <svg viewBox="0 0 18 12" width="17" height="11">
        <rect x="0" y="8" width="3" height="4" rx="0.8" />
        <rect x="5" y="5.5" width="3" height="6.5" rx="0.8" />
        <rect x="10" y="3" width="3" height="9" rx="0.8" />
        <rect x="15" y="0" width="3" height="12" rx="0.8" />
      </svg>
      <svg viewBox="0 0 16 12" width="15" height="11">
        <path d="M8 2.2c2.4 0 4.6.9 6.2 2.5l1.2-1.3A10.4 10.4 0 0 0 8 .4 10.4 10.4 0 0 0 .6 3.4l1.2 1.3A8.6 8.6 0 0 1 8 2.2Z" />
        <path d="M8 5.6c1.5 0 2.8.6 3.8 1.5l1.2-1.3A7.2 7.2 0 0 0 8 3.8a7.2 7.2 0 0 0-5 2l1.2 1.3c1-.9 2.3-1.5 3.8-1.5Z" />
        <path d="M8 9c.6 0 1.1.2 1.5.6L8 11.3 6.5 9.6C6.9 9.2 7.4 9 8 9Z" />
      </svg>
      <span className={p.battery}>
        <span className={p.batteryLevel} />
      </span>
    </span>
  );
}

export default function HeroPhoneMockup() {
  const [reduce, setReduce] = useState(false);
  const [stage, setStage] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [tabHidden, setTabHidden] = useState(false);
  const [offscreen, setOffscreen] = useState(false);
  const wrapRef = useRef(null);

  const paused = hovered || tabHidden || offscreen;
  const shown = reduce ? STILL_STAGE : stage;

  // Read the motion preference after mount so server and client render the same first frame.
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduce(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    const onVis = () => setTabHidden(document.visibilityState === 'hidden');
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return undefined;
    const io = new IntersectionObserver(([entry]) => setOffscreen(!entry.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (reduce || paused) return undefined;
    const t = setTimeout(() => setStage((prev) => (prev + 1) % STAGE_MS.length), STAGE_MS[stage]);
    return () => clearTimeout(t);
  }, [stage, paused, reduce]);

  const sent = shown >= 5;

  return (
    <div ref={wrapRef} className={p.wrap} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <div className={p.stage} role="img" aria-label={DESCRIPTION}>
        <div className={p.phone}>
          <span className={p.btnAction} />
          <span className={p.btnVolUp} />
          <span className={p.btnVolDown} />
          <span className={p.btnPower} />
          <div className={p.bezel}>
            <div className={p.screen}>
              <span className={p.island}>
                <span className={p.lens} />
              </span>
              <div className={p.statusBar}>
                <span className={p.clock}>9:41</span>
                <StatusIcons />
              </div>

              <div className={p.content}>
                {!sent ? (
                  <div key="form" className={p.view}>
                    <div className={p.biz}>
                      <span className={p.avatar}>GH</span>
                      <span className={p.bizText}>
                        <strong>The Green House</strong>
                        <span>Salon · Indiranagar</span>
                      </span>
                      <span className={p.lang}>EN</span>
                    </div>

                    <p className={p.question}>How was your visit?</p>
                    <div className={p.stars}>
                      {[0, 1, 2, 3, 4].map((i) => (
                        <span
                          key={i}
                          className={p.star}
                          data-on={shown >= 1 ? 'true' : undefined}
                          style={{ transitionDelay: shown >= 1 ? `${i * 55}ms` : '0ms' }}
                        >
                          <Star />
                        </span>
                      ))}
                    </div>
                    <p className={p.starCaption}>{shown >= 1 ? 'Loved it' : 'Tap a star'}</p>

                    <p className={p.label}>What stood out?</p>
                    <div className={p.chips}>
                      {TAGS.map((tag, i) => {
                        const on = tag.on && shown >= 2;
                        return (
                          <span
                            key={tag.label}
                            className={p.chip}
                            data-on={on ? 'true' : undefined}
                            style={{ transitionDelay: on ? `${i * 90}ms` : '0ms' }}
                          >
                            {on && <Check />}
                            {tag.label}
                          </span>
                        );
                      })}
                    </div>

                    <p className={p.label}>Anything else?</p>
                    <div className={p.note}>
                      {shown >= 3 ? (
                        <span key="typed" className={p.typed}>
                          Rekha was lovely. Will book again.
                        </span>
                      ) : (
                        <span className={p.placeholder}>Add a short note</span>
                      )}
                    </div>

                    <div className={p.send} data-busy={shown === 4 ? 'true' : undefined}>
                      {shown === 4 ? (
                        <>
                          <span className={p.dotSpinner} />
                          Sending
                        </>
                      ) : (
                        'Send feedback'
                      )}
                    </div>
                  </div>
                ) : (
                  <div key="sent" className={`${p.view} ${p.sentView}`}>
                    <span className={p.sentIcon}>
                      <Check />
                    </span>
                    <p className={p.sentTitle}>Sent to The Green House</p>
                    <p className={p.sentText}>Thank you. The team reads every note.</p>

                    <div className={p.google}>
                      <p className={p.googleTitle}>Share on Google too?</p>
                      <p className={p.googleText}>Every customer sees this, whatever they rated.</p>
                      <span className={p.googleBtn}>
                        Write a Google review
                        <ArrowUpRight />
                      </span>
                      <span className={p.later}>Maybe later</span>
                    </div>
                  </div>
                )}
              </div>

              <div className={p.browser}>
                <span className={p.browserAa}>aA</span>
                <span className={p.browserUrl}>
                  <Lock />
                  The Green House · Feedback
                </span>
                <RotateCw className={p.browserReload} />
              </div>
              <span className={p.homeIndicator} />
              <span className={p.glare} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
