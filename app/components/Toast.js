'use client';

export function showToast(message) {
  if (typeof document === 'undefined') return;
  const container = document.getElementById('toasts');
  if (!container) return;
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = message;
  container.appendChild(t);
  setTimeout(() => {
    t.remove();
  }, 3400);
}

