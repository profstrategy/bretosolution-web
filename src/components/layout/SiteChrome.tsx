'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';

interface SiteChromeProps {
  header: ReactNode;
  footer: ReactNode;
  children: ReactNode;
}

function isAdminPath(pathname: string): boolean {
  return pathname === '/admin' || pathname.startsWith('/admin/');
}

/**
 * Renders the public header, main landmark and footer around public pages,
 * with exactly the markup the root layout used before. Under /admin it adds
 * nothing, because the admin area renders its own shell and <main>.
 */
export function SiteChrome({ header, footer, children }: SiteChromeProps) {
  const pathname = usePathname() ?? '';

  if (isAdminPath(pathname)) return <>{children}</>;

  return (
    <>
      {header}
      <main id="main" tabIndex={-1} className="outline-none">
        {children}
      </main>
      {footer}
    </>
  );
}
