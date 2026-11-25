import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: {
    default: 'Admin',
    template: '%s | Bretosolution admin',
  },
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

/**
 * Shared by the protected dashboard and /admin/login. Protection lives in
 * (dashboard)/layout.tsx so the login page is not wrapped or guarded.
 */
export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return children;
}
