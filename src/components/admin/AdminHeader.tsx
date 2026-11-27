'use client';

import type { Ref } from 'react';
import { Menu } from 'lucide-react';
import { AdminBreadcrumb } from '@/components/admin/AdminBreadcrumb';
import { ADMIN_DRAWER_ID } from '@/components/admin/AdminDrawer';
import { LogoutButton } from '@/components/admin/LogoutButton';
import { ThemeToggle } from '@/components/admin/ThemeToggle';
import { adminShellCopy } from '@/content/admin';

interface AdminHeaderProps {
  email: string;
  drawerOpen: boolean;
  onOpenMenu: () => void;
  menuButtonRef: Ref<HTMLButtonElement>;
}

export function AdminHeader({ email, drawerOpen, onOpenMenu, menuButtonRef }: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex h-[64px] shrink-0 items-center gap-2 border-b border-[var(--line)] bg-[var(--pill)] px-4 backdrop-blur-[14px] sm:gap-3 sm:px-6">
      <button
        ref={menuButtonRef}
        type="button"
        onClick={onOpenMenu}
        aria-label={adminShellCopy.openMenuLabel}
        aria-expanded={drawerOpen}
        aria-controls={ADMIN_DRAWER_ID}
        className="inline-flex h-[44px] w-[44px] min-h-[44px] min-w-[44px] shrink-0 cursor-pointer items-center justify-center rounded-[10px] border border-[var(--pillline)] bg-transparent text-[var(--ink)] transition-colors hover:bg-[var(--btn2)] lg:hidden"
      >
        <Menu className="h-[20px] w-[20px]" aria-hidden="true" />
      </button>

      <AdminBreadcrumb className="flex-1" />

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <ThemeToggle />
        <span
          className="hidden max-w-[220px] truncate font-[family-name:var(--font-mono)] text-[12px] text-[var(--muted)] sm:inline"
          title={email}
        >
          <span className="sr-only">{adminShellCopy.signedInAs} </span>
          {email}
        </span>
        <LogoutButton />
      </div>
    </header>
  );
}
