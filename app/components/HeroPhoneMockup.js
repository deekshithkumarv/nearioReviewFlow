'use client';

import { useState, useEffect, useRef } from 'react';

export default function HeroPhoneMockup() {
  const [rating, setRating] = useState(4);
  const [activeTags, setActiveTags] = useState(['Friendly staff', 'Clean space']);
  const [commentText, setCommentText] = useState('Loved the atmosphere & warm staff!');
  const [stage, setStage] = useState(0); // 0: rating & tags, 1: typing comment, 2: sending, 3: google review prompt
  const [radarPing, setRadarPing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Auto-play timeline simulation
  useEffect(() => {
    if (isHovered) return;

    const timer = setInterval(() => {
      setStage((prev) => {
        if (prev === 0) {
          // Animate stars to 5 and add tag
          setRating(5);
          setActiveTags(['Friendly staff', 'Clean space', 'Waiting time']);
          return 1;
        } else if (prev === 1) {
          // Show typing / comment
          setCommentText('Loved the atmosphere & warm staff!');
          return 2; // trigger send button
        } else if (prev === 2) {
          // Sent! Trigger radar sync
          setRadarPing(true);
          setTimeout(() => setRadarPing(false), 2800);
          return 3; // show Google Review prompt
        } else {
          // Reset to initial loop state
          setRating(4);
          setActiveTags(['Friendly staff', 'Clean space']);
          setCommentText('');
          return 0;
        }
      });
    }, 2800);

    return () => clearInterval(timer);
  }, [isHovered]);

  function handleStarClick(num) {
    setRating(num);
  }

  function handleTagClick(tag) {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  return (
    <div
      className="vis hero-mockup-wrapper"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label="Interactive customer feedback and review flow preview"
    >
      {/* Realistic Mobile Device Container */}
      <div className="phone-device">
        {/* Dynamic Notch / Camera Island */}
        <div className="phone-island">
          <div className="phone-camera" />
          <div className="phone-speaker" />
        </div>

        {/* Status Bar */}
        <div className="phone-status-bar">
          <span className="status-time">9:41</span>
          <div className="status-icons">
            <svg width="12" height="10" viewBox="0 0 16 12" fill="currentColor">
              <path d="M1 9h2v3H1V9zm4-3h2v6H5V6zm4-3h2v9H9V3zm4-3h2v12h-2V0z" />
            </svg>
            <svg width="12" height="10" viewBox="0 0 16 12" fill="currentColor">
              <path d="M8 2.5C5.2 2.5 2.7 3.6.8 5.4l7.2 8.1 7.2-8.1C13.3 3.6 10.8 2.5 8 2.5z" />
            </svg>
            <div className="status-battery">
              <div className="battery-level" />
            </div>
          </div>
        </div>

        {/* Screen Content */}
        <div className="phone-screen">
          {stage < 3 ? (
            <div className="screen-feedback-flow">
              {/* Business Name Badge */}
              <div className="biz-header">
                <span className="biz-avatar">GH</span>
                <div>
                  <b className="biz-name">The Green House</b>
                  <span className="biz-loc">Indiranagar · Salon &amp; Spa</span>
                </div>
              </div>

              {/* Question */}
              <div className="flow-q">How was your visit?</div>

              {/* Star Rating Interactive Display */}
              <div className="flow-stars" role="group" aria-label="Rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`star-btn ${star <= rating ? 'active' : ''}`}
                    onClick={() => handleStarClick(star)}
                    aria-label={`${star} star`}
                  >
                    ★
                  </button>
                ))}
              </div>

              {/* Dynamic Sentiment Chip */}
              <div className="sentiment-pill">
                {rating === 5 && '🌟 Excellent experience!'}
                {rating === 4 && '😊 Very good visit!'}
                {rating <= 3 && '💬 How can we improve?'}
              </div>

              {/* Tag Chips */}
              <div className="flow-tags">
                {['Friendly staff', 'Waiting time', 'Clean space', 'Value for money'].map((tag) => {
                  const isSelected = activeTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      className={`flow-chip ${isSelected ? 'on' : ''}`}
                      onClick={() => handleTagClick(tag)}
                    >
                      {isSelected ? '✓ ' : ''}{tag}
                    </button>
                  );
                })}
              </div>

              {/* Typed Comment Preview */}
              <div className="flow-comment-box">
                <span className="comment-icon">“</span>
                <span className="comment-text">
                  {commentText || 'Add a quick note...'}
                </span>
              </div>

              {/* CTA Send Button */}
              <button
                type="button"
                className={`flow-submit-btn ${stage === 2 ? 'submitting' : ''}`}
                onClick={() => setStage(3)}
              >
                {stage === 2 ? (
                  <span className="btn-loading">
                    <span className="spinner" /> Saving feedback...
                  </span>
                ) : (
                  <span>Send feedback →</span>
                )}
              </button>
            </div>
          ) : (
            /* Stage 3: Immediate Google Review Transition Flow */
            <div className="screen-success-flow">
              <div className="success-icon-badge">✓</div>
              <h4 className="success-title">Feedback Saved!</h4>
              <p className="success-sub">
                Your private feedback went directly to <b>The Green House</b>.
              </p>

              {/* Google Review Conversion Card */}
              <div className="google-review-card">
                <div className="g-card-header">
                  <span className="g-logo">G</span>
                  <div>
                    <b>Share on Google too?</b>
                    <div className="g-stars">★★★★★</div>
                  </div>
                </div>
                <p className="g-card-copy">
                  Help other customers find us on Google Maps with your {rating}★ review.
                </p>
                <div className="g-action-btn">
                  Write Google Review ↗
                </div>
              </div>

              <button
                type="button"
                className="btn-restart-demo"
                onClick={() => setStage(0)}
              >
                ↺ Replay demo flow
              </button>
            </div>
          )}

          {/* Home swipe bar */}
          <div className="phone-home-indicator" />
        </div>
      </div>

      {/* Floating Business Growth Radar Card */}
      <div className={`float-radar ${radarPing ? 'radar-pulse' : ''}`}>
        <div className="radar-head">
          <div className="radar-title-wrap">
            <span className="radar-sparkle">✦</span>
            <h3>Business Growth Radar</h3>
          </div>
          <span className="radar-live-pill">
            <span className="live-dot" /> {radarPing ? 'Live sync' : 'AI Active'}
          </span>
        </div>

        <div className="radar-metric-rows">
          <div className="radar-row positive">
            <div className="radar-icon-wrap green">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </div>
            <div className="radar-text">
              <b>Staff behaviour is a strength</b>
              <span>+44 customers praised the team</span>
            </div>
            <span className="trend-badge up">↑ 26%</span>
          </div>

          <div className="radar-row warning">
            <div className="radar-icon-wrap orange">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <div className="radar-text">
              <b>Waiting time needs attention</b>
              <span>Mentioned in 21 reviews</span>
            </div>
            <span className="trend-badge attention">Fix</span>
          </div>
        </div>

        {radarPing && (
          <div className="radar-toast-banner">
            <span>⚡ New feedback synced to owner radar!</span>
          </div>
        )}
      </div>
    </div>
  );
}
