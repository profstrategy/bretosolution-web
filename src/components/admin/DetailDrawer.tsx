'use client';

import { useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useModalFocus } from '@/components/admin/useModalFocus';

interface DetailDrawerProps {
  title: string;
  closeLabel: string;
  onClose: () => void;
  children: ReactNode;
  /** Sticky action bar at the bottom. */
  footer?: ReactNode;
  fallbackFocus?: () => HTMLElement | null;
}

/**
 * Detail panel: full screen under 640 px, a right-side drawer (up to 640 px
 * wide) from 640 px. Modal: focus is kept inside and returns on close.
 */
export function DetailDrawer({ title, closeLabel, onClose, children, footer, fallbackFocus }: DetailDrawerProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const onKeyDown = useModalFocus(panelRef, {
    initialFocus: () => closeRef.current,
    onEscape: onClose,
    fallbackFocus,
  });

  return createPortal(
    <div className="fixed inset-0 z-[70]">
      <div aria-hidden="true" onClick={onClose} className="absolute inset-0 hidden bg-[var(--shadow)] sm:block" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onKeyDown={onKeyDown}
        className="absolute inset-0 flex flex-col bg-[var(--panel)] text-[var(--ink)] outline-none focus-visible:outline-none sm:left-auto sm:w-[min(640px,100%)] sm:border-l sm:border-[var(--line)] sm:shadow-[-12px_0_40px_var(--shadow)]"
      >
        <header className="flex shrink-0 items-center gap-3 border-b border-[var(--line)] py-2 pl-5 pr-2">
          <h2 id={titleId} title={title} className="min-w-0 flex-1 truncate font-[family-name:var(--font-display)] text-[20px] font-semibold">
            {title}
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="inline-flex h-[44px] w-[44px] shrink-0 cursor-pointer items-center justify-center rounded-[10px] text-[var(--muted)] hover:bg-[var(--btn2)] hover:text-[var(--ink)] focus-visible:outline-[3px] focus-visible:outline-offset-[2px] focus-visible:outline-[var(--accent)]"
          >
            <X className="h-[20px] w-[20px]" aria-hidden="true" />
          </button>
        </header>
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain">{children}</div>
        {footer ? (
          <footer className="shrink-0 border-t border-[var(--line)] bg-[var(--panel)] px-5 py-3 pb-[max(12px,env(safe-area-inset-bottom))]">
            {footer}
          </footer>
        ) : null}
      </div>
    </div>,
    document.body
  );
}
