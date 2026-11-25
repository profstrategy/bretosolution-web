'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { adminShellCopy } from '@/content/admin';

export const ADMIN_DRAWER_ID = 'admin-drawer';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface AdminDrawerProps {
  onClose: () => void;
  children: ReactNode;
}

/**
 * Off-canvas navigation under 1024 px. Moves focus into the panel on open,
 * keeps Tab inside it, closes on Escape or overlay click, and locks page
 * scroll while open. The caller returns focus to the menu button on close.
 */
export function AdminDrawer({ onClose, children }: AdminDrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    const focusables = () => Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
    focusables()[0]?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && (active === first || !panel.contains(active))) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && (active === last || !panel.contains(active))) {
        event.preventDefault();
        first?.focus();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] lg:hidden">
      <div
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 bg-[var(--shadow)] backdrop-blur-[2px]"
      />
      <div
        ref={panelRef}
        id={ADMIN_DRAWER_ID}
        role="dialog"
        aria-modal="true"
        aria-label={adminShellCopy.drawerLabel}
        className="absolute inset-y-0 left-0 w-[min(280px,85vw)] border-r border-[var(--line)] bg-[var(--panel)] shadow-[0_12px_40px_var(--shadow)]"
      >
        {children}
      </div>
    </div>
  );
}
