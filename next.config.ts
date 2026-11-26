import type { NextConfig } from 'next';

/** Admin pages: never indexed, never framed (clickjacking). */
const adminPageHeaders = [
  { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
  { key: 'X-Frame-Options', value: 'DENY' },
];

/**
 * Admin API: never cached by the browser or a proxy. The JSON helpers also set
 * this; the rule here covers every response, including body-parsing errors
 * and Next's own error responses.
 */
const adminApiHeaders = [
  { key: 'Cache-Control', value: 'no-store' },
  { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      { source: '/admin', headers: adminPageHeaders },
      { source: '/admin/:path*', headers: adminPageHeaders },
      { source: '/api/admin/:path*', headers: adminApiHeaders },
    ];
  },
};

export default nextConfig;
