'use client';

import { useEffect, useState } from 'react';
import { ArrowUpRight, Check, Pause, Play, Star } from 'lucide-react';
import p from './landing/phone.module.css';

// Decorative, looping illustration of the customer flow:
// stars -> tags -> note -> sending -> sent + "Share on Google too?".
// It is one role="img" with a text description, so nothing inside is focusable.
// Pauses on hover, while the pause button has focus, when the tab is hidden, or when the visitor presses Pause.
// With reduced motion it shows one still frame.

const STAGE_MS = [1100, 1500, 1500, 1900, 1100, 3600]; // 0 empty, 1 stars, 2 tags, 3 note, 4 sending, 5 sent
const STILL_STAGE = 3;
const TAGS = [
  { label: 'Friendly staff', on: true },
  { label: 'Clean space', on: true },
  { label: 'Short wait', on: false },
  { label: 'Good value', on: false },
];
const DESCRIPTION =
  'Illustration of the customer feedback page on a phone. A customer of The Green House salon gives five stars, picks “Friendly staff” and “Clean space”, adds a short note and sends it. They then see the same option every customer sees: share a Google review too. Beside the phone, an example Growth Radar card lists themes from feedback.';

export default function HeroPhoneMockup() {
  const [reduce, setReduce] = useState(false);
  const [stage, setStage] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [tabHidden, setTabHidden] = useState(false);

  const paused = hovered || focused || userPaused || tabHidden;
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
    if (reduce || paused) return undefined;
    const t = setTimeout(() => setStage((prev) => (prev + 1) % STAGE_MS.length), STAGE_MS[stage]);
    return () => clearTimeout(t);
  }, [stage, paused, reduce]);

  const sent = shown >= 5;

  return (
    <div className={p.wrap} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <div className={p.stage} role="img" aria-label={DESCRIPTION}>
        <div className={p.backdrop} />

        <div className={p.phone}>
          <div className={p.screen}>
            <div className={p.statusBar}>
              <span>9:41</span>
              <span className={p.island} />
              <span className={p.battery} />
            </div>

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
                      style={{ transitionDelay: shown >= 1 ? `${i * 90}ms` : '0ms' }}
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
                        style={{ transitionDelay: on ? `${i * 160}ms` : '0ms' }}
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
        </div>

        <div className={p.radar}>
          <div className={p.radarHead}>
            <strong>Growth Radar</strong>
            <span className={p.example}>Example</span>
          </div>
          <ul className={p.radarRows}>
            <li data-tone="praise">
              <span className={p.radarDot} />
              <span>
                <strong>Friendly, patient staff</strong>
                <em>Praised often</em>
              </span>
            </li>
            <li data-tone="attention">
              <span className={p.radarDot} />
              <span>
                <strong>Weekend waiting time</strong>
                <em>Worth a look</em>
              </span>
            </li>
          </ul>
          <p className={p.radarNew} data-on={sent ? 'true' : undefined}>
            New note added to “Friendly staff”
          </p>
        </div>
      </div>

      {!reduce && (
        <button
          type="button"
          className={`btn btn-ghost btn-sm ${p.pauseBtn}`}
          aria-pressed={userPaused}
          onClick={() => setUserPaused((v) => !v)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        >
          {userPaused ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />}
          Pause animation
        </button>
      )}
    </div>
  );
}
