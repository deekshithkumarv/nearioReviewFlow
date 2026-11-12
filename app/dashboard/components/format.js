// Small formatting helpers shared by the dashboard views. All dates are shown in Indian English.

const DATE_OPTS = { day: 'numeric', month: 'short', year: 'numeric' };
const DATETIME_OPTS = { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' };

function toDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatDate(value) {
  const d = toDate(value);
  return d ? d.toLocaleDateString('en-IN', DATE_OPTS) : '';
}

export function formatDateTime(value) {
  const d = toDate(value);
  return d ? d.toLocaleString('en-IN', DATETIME_OPTS) : '';
}

const rtf = typeof Intl !== 'undefined' && Intl.RelativeTimeFormat ? new Intl.RelativeTimeFormat('en-IN', { numeric: 'auto' }) : null;

// "2 hours ago", "yesterday", then a plain date after a week.
export function formatRelative(value) {
  const d = toDate(value);
  if (!d) return '';
  const diffSec = Math.round((d.getTime() - Date.now()) / 1000);
  const abs = Math.abs(diffSec);
  if (!rtf || abs >= 7 * 86400) return formatDate(d);
  if (abs < 60) return 'just now';
  if (abs < 3600) return rtf.format(Math.round(diffSec / 60), 'minute');
  if (abs < 86400) return rtf.format(Math.round(diffSec / 3600), 'hour');
  return rtf.format(Math.round(diffSec / 86400), 'day');
}

// Tags come back from the database as an array, but be forgiving about a JSON string.
export function tagsOf(f) {
  if (Array.isArray(f?.tags)) return f.tags.filter((t) => typeof t === 'string' && t.trim());
  if (typeof f?.tags === 'string') {
    try {
      const parsed = JSON.parse(f.tags);
      return Array.isArray(parsed) ? parsed.filter((t) => typeof t === 'string' && t.trim()) : [];
    } catch {
      return [];
    }
  }
  return [];
}

// Stored as 91XXXXXXXXXX.
export function formatPhone(phone) {
  const d = String(phone || '').replace(/\D/g, '');
  if (d.length === 12 && d.startsWith('91')) return `+91 ${d.slice(2, 7)} ${d.slice(7)}`;
  return `+${d}`;
}

export const LANG_NAMES = { en: 'English', hi: 'Hindi', kn: 'Kannada' };

export function ratingCounts(list) {
  const counts = [0, 0, 0, 0, 0, 0];
  list.forEach((f) => {
    const r = Number(f.rating);
    if (r >= 1 && r <= 5) counts[r] += 1;
  });
  return counts;
}

export function topTags(list, limit = 8) {
  const map = new Map();
  list.forEach((f) => {
    tagsOf(f).forEach((t) => {
      const key = t.trim();
      map.set(key, (map.get(key) || 0) + 1);
    });
  });
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([tag, count]) => ({ tag, count }));
}

export async function copyText(text, okMessage, showToast) {
  try {
    await navigator.clipboard.writeText(text);
    showToast(okMessage, { tone: 'success' });
  } catch {
    showToast('Could not copy. Select the link and copy it yourself.', { tone: 'error' });
  }
}
