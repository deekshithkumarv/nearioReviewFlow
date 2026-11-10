export default {
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/demo',
          destination: '/dashboard.html',
        },
        {
          source: '/demo/:path*',
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
