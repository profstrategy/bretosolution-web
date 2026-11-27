'use client';

import type { LucideIcon } from 'lucide-react';
import { ChevronsLeft, ChevronsRight, Mail, X } from 'lucide-react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { AppLink } from '@/components/ui/AppLink';
import { assets } from '@/content/assets';
import { adminShellCopy } from '@/content/admin';
import { site } from '@/content/site';
import { cn } from '@/lib/utils';
import { ADMIN_EMAILS_PATH } from '@/components/admin/paths';

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

const NAV_ITEMS: readonly NavItem[] = [
  { label: adminShellCopy.sections.emails, href: ADMIN_EMAILS_PATH, icon: Mail },
];

const iconButtonClass =
  'inline-flex h-[44px] w-[44px] min-h-[44px] min-w-[44px] shrink-0 cursor-pointer items-center justify-center rounded-[10px] border border-[var(--pillline)] bg-transparent text-[var(--ink)] transition-colors hover:bg-[var(--btn2)]';

interface SidebarContentProps {
  /** Icon-only rail (desktop collapsed). Labels stay available to assistive tech. */
  collapsed: boolean;
  /** Desktop: collapse/expand control. */
  onToggleCollapsed?: () => void;
  /** Drawer: close control. */
  onClose?: () => void;
  /** id of the element the collapse button controls. */
  controlsId?: string;
}

export function AdminSidebarContent({
  collapsed,
  onToggleCollapsed,
  onClose,
  controlsId,
}: SidebarContentProps) {
  const pathname = usePathname() ?? '';

  return (
    <div className="flex h-full flex-col">
      <div
        className={cn(
          'flex h-[64px] shrink-0 items-center gap-3 border-b border-[var(--line)]',
          collapsed ? 'justify-center px-2' : 'justify-between px-4'
        )}
      >
        <AppLink
          href={ADMIN_EMAILS_PATH}
          className="inline-flex min-h-[44px] min-w-0 items-center gap-3 rounded-[10px]"
          aria-label={`${site.name} ${adminShellCopy.brandSuffix}`}
        >
          <Image
            src={assets.bretoLogo.src}
            alt=""
            width={36}
            height={36}
            className="h-[36px] w-[36px] shrink-0 rounded-[10px] object-cover"
          />
          {collapsed ? null : (
            <span className="flex min-w-0 items-baseline gap-2">
              <span className="font-[family-name:var(--font-display)] text-[19px] font-semibold leading-none tracking-[0.08em] text-[var(--ink)]">
                {site.wordmark}
              </span>
              <span className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.08em] text-[var(--muted)]">
                {adminShellCopy.brandSuffix}
              </span>
            </span>
          )}
        </AppLink>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            aria-label={adminShellCopy.closeMenuLabel}
            className={iconButtonClass}
          >
            <X className="h-[20px] w-[20px]" aria-hidden="true" />
          </button>
        ) : null}
      </div>

      <nav aria-label={adminShellCopy.navLabel} className="flex-1 px-3 py-4">
        <ul className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <AppLink
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'group relative flex min-h-[44px] items-center gap-3 rounded-[10px] font-[family-name:var(--font-sans)] text-[15px] font-medium transition-colors',
                    collapsed ? 'justify-center px-0' : 'px-3',
                    isActive
                      ? 'bg-[var(--btn2)] text-[var(--ink)] shadow-[inset_3px_0_0_var(--accent)]'
                      : 'text-[var(--muted)] hover:bg-[var(--btn2)] hover:text-[var(--ink)]'
                  )}
                >
                  <Icon className="h-[20px] w-[20px] shrink-0" aria-hidden="true" />
                  <span className={collapsed ? 'sr-only' : 'truncate'}>{item.label}</span>
                  {collapsed ? (
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-[8px] border border-[var(--line)] bg-[var(--panel)] px-2.5 py-1 text-[13px] text-[var(--ink)] opacity-0 shadow-[0_4px_12px_var(--shadow)] transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
                    >
                      {item.label}
                    </span>
                  ) : null}
                </AppLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {onToggleCollapsed ? (
        <div
          className={cn(
            'flex shrink-0 border-t border-[var(--line)] p-3',
            collapsed ? 'justify-center' : 'justify-end'
          )}
        >
          <button
            type="button"
            onClick={onToggleCollapsed}
            aria-expanded={!collapsed}
            aria-controls={controlsId}
            aria-label={collapsed ? adminShellCopy.expandSidebarLabel : adminShellCopy.collapseSidebarLabel}
            className={iconButtonClass}
          >
            {collapsed ? (
              <ChevronsRight className="h-[18px] w-[18px]" aria-hidden="true" />
            ) : (
              <ChevronsLeft className="h-[18px] w-[18px]" aria-hidden="true" />
            )}
          </button>
        </div>
      ) : null}
    </div>
  );
}
