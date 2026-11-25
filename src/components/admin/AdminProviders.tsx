'use client';

import type { ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';
import { DomainProvider } from '@/state';

/** Client providers for the protected admin area only (not the public site). */
export function AdminProviders({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <DomainProvider>{children}</DomainProvider>
    </SessionProvider>
  );
}
