'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

// Tiny global toast store. Call showToast('Saved', { tone: 'success' }) from anywhere on the client.
// <ToastHost /> is mounted once in the root layout.
let listeners = [];
let seq = 0;

export function showToast(message, { tone = 'info', duration = 4000 } = {}) {
  if (typeof window === 'undefined') return;
  const toast = { id: ++seq, message, tone, duration };
  listeners.forEach((fn) => fn(toast));
}

const ICONS = { success: CheckCircle2, error: AlertCircle, info: Info };

export function ToastHost() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const add = (t) => {
      setToasts((list) => [...list.slice(-2), t]); // never more than 3 on screen
      setTimeout(() => setToasts((list) => list.map((x) => (x.id === t.id ? { ...x, leaving: true } : x))), t.duration);
      setTimeout(() => setToasts((list) => list.filter((x) => x.id !== t.id)), t.duration + 200);
    };
    listeners.push(add);
    return () => {
      listeners = listeners.filter((fn) => fn !== add);
    };
  }, []);

  return (
    <div className="toast-region" role="status" aria-live="polite" aria-atomic="false">
      {toasts.map((t) => {
        const Icon = ICONS[t.tone] || Info;
        return (
          <div key={t.id} className="toast" data-tone={t.tone} data-leaving={t.leaving ? 'true' : undefined}>
            <Icon aria-hidden="true" />
            <span>{t.message}</span>
          </div>
        );
      })}
    </div>
  );
}
