import { SITE_URL } from '../lib/site';

const PAGES = ['', 'how', 'features', 'agencies', 'pricing', 'honest', 'faq', 'start', 'privacy', 'terms'];

export default function sitemap() {
  return PAGES.map((p) => ({
    url: `${SITE_URL}/${p}`,
    changeFrequency: 'monthly',
    priority: p === '' ? 1 : p === 'privacy' || p === 'terms' ? 0.3 : 0.7,
  }));
}
