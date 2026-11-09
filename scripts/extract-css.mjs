import fs from 'node:fs';
import path from 'node:path';

const baseDir = "C:\\Users\\Asus'\\Downloads\\neario-reviewflow (1)";
const files = [
  'index.html',
  'dashboard.html',
  'admin.html',
  'feedback.html',
  'onboarding.html',
  'terms.html',
];

let out = `/* Neario ReviewFlow Complete Unified Stylesheet */\n`;

// Also check if _old_index.html exists for any newer index rules
const indexFile = fs.existsSync('_old_index.html') ? '_old_index.html' : path.join(baseDir, 'index.html');
const indexContent = fs.readFileSync(indexFile, 'utf8');
const indexMatches = [...indexContent.matchAll(/<style>([\s\S]*?)<\/style>/g)];
if (indexMatches.length > 0) {
  const mainStyle = indexMatches[indexMatches.length - 1][1].trim();
  out += `\n/* ==================== LANDING & BASE STYLES ==================== */\n` + mainStyle + '\n';
}

for (const f of ['dashboard.html', 'admin.html', 'feedback.html', 'onboarding.html', 'terms.html']) {
  const p = path.join(baseDir, f);
  if (!fs.existsSync(p)) continue;
  const content = fs.readFileSync(p, 'utf8');
  const matches = [...content.matchAll(/<style>([\s\S]*?)<\/style>/g)];
  for (const m of matches) {
    const s = m[1].trim();
    if (s.length > 80) {
      out += `\n/* ==================== STYLES FROM ${f} ==================== */\n` + s + '\n';
    }
  }
}

// Ensure toast notification styles are included
out += `
/* Toast Notifications */
.toasts {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 8px;
  pointer-events: none;
}
.toast-msg {
  background: var(--fg, #17261d);
  color: var(--bg, #f7f3ea);
  padding: 12px 18px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  box-shadow: var(--shadow, 0 10px 30px rgba(0,0,0,0.2));
  animation: toastIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  pointer-events: auto;
}
@keyframes toastIn {
  from { opacity: 0; transform: translateY(12px) scale(0.96); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
`;

fs.writeFileSync('app/globals.css', out, 'utf8');
console.log('globals.css written successfully. Size:', out.length, 'bytes');

