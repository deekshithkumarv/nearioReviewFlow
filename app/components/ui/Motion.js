'use client';

import { LazyMotion, domAnimation } from 'framer-motion';

// Framer Motion (LazyMotion + domAnimation, used through `m.*` components) for the pages that animate
// step changes: the customer feedback page, onboarding and the admin console. Only their layouts mount
// this, so marketing pages and the dashboard don't download Framer at all.
export function MotionProvider({ children }) {
  return (
    <LazyMotion features={domAnimation} strict>
      {children}
    </LazyMotion>
  );
}
