'use client';

import { useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { useModalFocus } from '@/components/admin/useModalFocus';

interface ConfirmDialogProps {
  title: string;
  children: ReactNode;
  confirmLabel: string;
  busyLabel: string;
  cancelLabel: string;
  busy: boolean;
  /** Destructive actions use the accent colour. */
  danger?: boolean;
  /** Disables the confirm button (the body explains why). */
  confirmDisabled?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Small accessible confirmation (alertdialog). Focus starts on Cancel. */
export function ConfirmDialog({
  title,
  children,
  confirmLabel,
  busyLabel,
  cancelLabel,
  busy,
  danger = false,
  confirmDisabled = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const titleId = useId();
  const bodyId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const onKeyDown = useModalFocus(panelRef, {
    initialFocus: () => cancelRef.current,
    onEscape: () => {
      if (!busy) onCancel();
    },
  });

  return createPortal(
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div aria-hidden="true" onClick={busy ? undefined : onCancel} className="absolute inset-0 bg-[var(--shadow)]" />
      <div
        ref={panelRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={bodyId}
        tabIndex={-1}
        onKeyDown={onKeyDown}
        className="relative w-full max-w-[440px] rounded-[16px] border border-[var(--line)] bg-[var(--panel)] p-5 text-[var(--ink)] shadow-[0_24px_64px_var(--shadow)] outline-none focus-visible:outline-none"
      >
        <h2 id={titleId} className="font-[family-name:var(--font-display)] text-[20px] font-semibold">
          {title}
        </h2>
        <div id={bodyId} className="mt-2 font-[family-name:var(--font-sans)] text-[15px] leading-relaxed text-[var(--muted)] [overflow-wrap:anywhere]">
          {children}
        </div>
        <div className="mt-5 grid grid-cols-2 gap-2 sm:flex sm:justify-end">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="min-h-[44px] cursor-pointer rounded-[10px] border border-[var(--line)] px-4 font-[family-name:var(--font-sans)] text-[15px] font-semibold text-[var(--ink)] hover:bg-[var(--btn2)] focus-visible:outline-[3px] focus-visible:outline-offset-[2px] focus-visible:outline-[var(--accent)] disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy || confirmDisabled}
            aria-busy={busy || undefined}
            className={cn(
              'min-h-[44px] cursor-pointer rounded-[10px] px-4 font-[family-name:var(--font-sans)] text-[15px] font-semibold text-[var(--btnfg)] hover:opacity-90 focus-visible:outline-[3px] focus-visible:outline-offset-[2px] disabled:cursor-default disabled:opacity-50',
              danger ? 'bg-[var(--accent)] focus-visible:outline-[var(--ink)]' : 'bg-[var(--btn)] focus-visible:outline-[var(--accent)]'
            )}
          >
            {busy ? busyLabel : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
