'use client';

import { Children, cloneElement, isValidElement, useEffect, useRef } from 'react';

// Scroll reveal without a library. Server-rendered content is visible immediately (so it never delays
// first paint or LCP); only elements that start below the fold are faded in once as they scroll into view.
// Styles live in globals.css ([data-reveal]); prefers-reduced-motion turns the effect off there.
export default function Reveal({ as: Tag = 'div', stagger = false, delay = 0, className, children, style, ...rest }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) return; // already on screen: leave it alone
    el.dataset.reveal = 'pending';
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          el.dataset.reveal = 'in';
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px -8% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const items = stagger
    ? Children.map(children, (child, i) =>
        isValidElement(child) && child.type === RevealItem ? cloneElement(child, { index: i }) : child,
      )
    : children;

  return (
    <Tag
      ref={ref}
      className={className}
      data-reveal-root={stagger ? 'stagger' : 'single'}
      style={delay ? { ...style, '--reveal-delay': `${delay}s` } : style}
      {...rest}
    >
      {items}
    </Tag>
  );
}

// A staggered child of <Reveal stagger>. Each one starts a little after the previous.
export function RevealItem({ as: Tag = 'div', className, children, index = 0, style, ...rest }) {
  return (
    <Tag className={className} data-reveal-item="" style={{ ...style, '--reveal-i': index }} {...rest}>
      {children}
    </Tag>
  );
}
