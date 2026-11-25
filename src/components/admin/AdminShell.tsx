'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { AdminDrawer } from '@/components/admin/AdminDrawer';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminSidebarContent } from '@/components/admin/AdminSidebar';
import { ADMIN_SIDEBAR_STORAGE_KEY } from '@/components/admin/paths';
import { cn } from '@/lib/utils';

const SIDEBAR_ID = 'admin-sidebar';

function readCollapsed(): boolean {
  try {
    return window.localStorage.getItem(ADMIN_SIDEBAR_STORAGE_KEY) === 'collapsed';
  } catch {
    return false;
  }
}

function writeCollapsed(collapsed: boolean): void {
  try {
    window.localStorage.setItem(ADMIN_SIDEBAR_STORAGE_KEY, collapsed ? 'collapsed' : 'expanded');
  } catch {
    // Storage may be unavailable (private mode, blocked); the UI still works.
  }
}

/**
 * Admin layout: sidebar (desktop, expandable) or drawer (under 1024 px),
 * sticky header and the main landmark. All state here is UI state, kept in
 * component state and localStorage, never in the domain store.
 */
export function AdminShell({ email, children }: { email: string; children: ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  // Read the persisted preference after mount so server and client markup match.
  useEffect(() => {
    setCollapsed(readCollapsed());
  }, []);

  // Close the drawer after navigation.
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  const toggleCollapsed = useCallback(() => {
    const next = !collapsed;
    setCollapsed(next);
    writeCollapsed(next);
  }, [collapsed]);

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    menuButtonRef.current?.focus();
  }, []);

  return (
    <div className="min-h-[100svh] bg-[var(--bg)] text-[var(--ink)] lg:flex">
      <aside
        id={SIDEBAR_ID}
        className={cn(
          'sticky top-0 hidden h-[100svh] shrink-0 border-r border-[var(--line)] bg-[var(--panel)] transition-[width] duration-200 lg:block',
          collapsed ? 'w-[72px]' : 'w-[240px]'
        )}
      >
        <AdminSidebarContent
          collapsed={collapsed}
          onToggleCollapsed={toggleCollapsed}
          controlsId={SIDEBAR_ID}
        />
      </aside>

      {drawerOpen ? (
        <AdminDrawer onClose={closeDrawer}>
          <AdminSidebarContent collapsed={false} onClose={closeDrawer} />
        </AdminDrawer>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader
          email={email}
          drawerOpen={drawerOpen}
          onOpenMenu={() => setDrawerOpen(true)}
          menuButtonRef={menuButtonRef}
        />
        <main id="main" tabIndex={-1} className="flex-1 px-4 py-6 outline-none sm:px-6 sm:py-8 lg:px-10">
          <div className="mx-auto w-full max-w-[1100px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
