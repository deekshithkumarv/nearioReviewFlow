// Public base URL, used for canonical links, Open Graph, robots and the sitemap.
// Set NEXT_PUBLIC_SITE_URL when the app moves to its own domain.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://nearioreviewflow.glcdemo.workers.dev').replace(/\/+$/, '');
export const SITE_NAME = 'Neario ReviewFlow';
