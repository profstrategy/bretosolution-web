'use client';

import { X } from 'lucide-react';
import {
  selectToasts,
  toastDismissed,
  useDomainDispatch,
  useDomainSelector,
  type Toast,
} from '@/state';
import { cn } from '@/lib/utils';

const kindLabel: Record<Toast['kind'], string> = {
  success: 'Success',
  info: 'Notice',
  error: 'Error',
};

function ToastCard({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const isError = toast.kind === 'error';

  return (
    <li
      role={isError ? 'alert' : undefined}
      className={cn(
        'pointer-events-auto flex items-start gap-2 rounded-[12px] border border-l-[4px] bg-[var(--panel)] py-2 pl-4 pr-1 text-[var(--ink)] shadow-[0_8px_24px_var(--shadow)]',
        isError
          ? 'border-[var(--line)] border-l-[var(--accent)]'
          : 'border-[var(--line)] border-l-[var(--ink)]'
      )}
    >
      <p className="min-w-0 flex-1 self-center py-1.5 font-[family-name:var(--font-sans)] text-[14px] leading-snug">
        <span className="sr-only">{kindLabel[toast.kind]}: </span>
        {toast.message}
      </p>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
        className="inline-flex h-[44px] w-[44px] min-h-[44px] min-w-[44px] shrink-0 cursor-pointer items-center justify-center rounded-[10px] text-[var(--muted)] transition-colors hover:bg-[var(--btn2)] hover:text-[var(--ink)] focus-visible:outline-[3px] focus-visible:outline-[var(--accent)] focus-visible:outline-offset-[2px] motion-reduce:transition-none"
      >
        <X className="h-[18px] w-[18px]" aria-hidden="true" />
      </button>
    </li>
  );
}

/**
 * Renders domain toasts. Subscribes only to `selectToasts`.
 * Bottom-centre below 640 px, bottom-right from 640 px.
 */
export function Toaster() {
  const toasts = useDomainSelector(selectToasts);
  const dispatch = useDomainDispatch();
  const dismiss = (id: string) => dispatch(toastDismissed(id));

  const errors = toasts.filter((toast) => toast.kind === 'error');
  const notices = toasts.filter((toast) => toast.kind !== 'error');

  return (
    <div className="pointer-events-none fixed bottom-[max(16px,env(safe-area-inset-bottom))] left-1/2 z-[200] flex w-[calc(100%-32px)] max-w-[400px] -translate-x-1/2 flex-col gap-2 sm:left-auto sm:right-4 sm:translate-x-0">
      {/* Live regions stay mounted so new toasts are announced. */}
      <ul className="flex flex-col gap-2" aria-label="Errors">
        {errors.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onDismiss={dismiss} />
        ))}
      </ul>
      <ul className="flex flex-col gap-2" aria-live="polite" aria-label="Notifications">
        {notices.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onDismiss={dismiss} />
        ))}
      </ul>
    </div>
  );
}
