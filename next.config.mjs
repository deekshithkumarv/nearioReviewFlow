export default {
  serverExternalPackages: ['pg'],
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/dashboard',
          destination: '/dashboard.html',
        },
      ],
    };
  },
  async headers() {
    return [{ source: '/(.*)', headers: [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    ] }];
  },
};
