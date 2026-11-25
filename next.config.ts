import type { NextConfig } from 'next';

const noIndexHeaders = [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }];

const nextConfig: NextConfig = {
  async headers() {
    return [
      { source: '/admin', headers: noIndexHeaders },
      { source: '/admin/:path*', headers: noIndexHeaders },
    ];
  },
};

export default nextConfig;
