'use client';

import { useSyncExternalStore, type ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { AlertCircle, Info } from 'lucide-react';
import { adminEmailsCopy } from '@/content/admin';
import { cn } from '@/lib/utils';

export const cardClass = 'rounded-[16px] border border-[var(--line)] bg-[var(--panel)]';

export const smallButtonClass =
  'inline-flex min-h-[44px] cursor-pointer items-center justify-center gap-1.5 rounded-[10px] border border-[var(--line)] px-3 font-[family-name:var(--font-sans)] text-[14px] font-semibold text-[var(--ink)] transition-colors hover:bg-[var(--btn2)] focus-visible:outline-[3px] focus-visible:outline-offset-[2px] focus-visible:outline-[var(--accent)] disabled:cursor-default disabled:opacity-50 aria-disabled:cursor-default aria-disabled:opacity-50 motion-reduce:transition-none';

export function EmptyState({
  icon: Icon,
  heading,
  body,
  action,
}: {
  icon: LucideIcon;
  heading: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className={`${cardClass} flex flex-col items-center px-6 py-12 text-center sm:py-16`}>
      <span className="inline-flex h-[56px] w-[56px] items-center justify-center rounded-full border border-[var(--line)] bg-[var(--bg)] text-[var(--accent)]">
        <Icon className="h-[24px] w-[24px]" aria-hidden="true" />
      </span>
      <h2 className="mt-5 font-[family-name:var(--font-display)] text-[22px] font-semibold text-[var(--ink)]">
        {heading}
      </h2>
      <p className="mt-2 max-w-[48ch] font-[family-name:var(--font-sans)] text-[15px] leading-relaxed text-[var(--muted)] [overflow-wrap:anywhere]">
        {body}
      </p>
      {action ? <div className="mt-6 w-full sm:w-auto">{action}</div> : null}
    </div>
  );
}

export function InfoPanel({ heading, body }: { heading: string; body: string }) {
  return (
    <div role="status" className={`${cardClass} flex items-start gap-4 px-5 py-5`}>
      <Info className="mt-0.5 h-[22px] w-[22px] shrink-0 text-[var(--accent)]" aria-hidden="true" />
      <div className="min-w-0">
        <h2 className="font-[family-name:var(--font-sans)] text-[16px] font-semibold text-[var(--ink)]">{heading}</h2>
        <p className="mt-1 font-[family-name:var(--font-sans)] text-[15px] leading-relaxed text-[var(--muted)] [overflow-wrap:anywhere]">
          {body}
        </p>
      </div>
    </div>
  );
}

export function ListSkeleton({ label }: { label: string }) {
  return (
    <div className={cardClass} role="status" aria-live="polite">
      <span className="sr-only">{label}</span>
      <ul aria-hidden="true" className="divide-y divide-[var(--line)]">
        {[0, 1, 2].map((row) => (
          <li key={row} className="flex items-center gap-4 px-5 py-4">
            <span className="flex min-w-0 flex-1 flex-col gap-2">
              <span className="h-[12px] w-2/3 max-w-[320px] rounded-full bg-[var(--btn2)] motion-safe:animate-pulse" />
              <span className="h-[10px] w-1/3 max-w-[180px] rounded-full bg-[var(--btn2)] motion-safe:animate-pulse" />
            </span>
            <span className="hidden h-[10px] w-[72px] shrink-0 rounded-full bg-[var(--btn2)] motion-safe:animate-pulse sm:block" />
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Inline list error with a retry button (the action also shows a toast). */
export function ListError({ message, onRetry, compact = false }: { message: string; onRetry: () => void; compact?: boolean }) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-start gap-3 sm:flex-row sm:items-center',
        compact ? 'mt-3' : `${cardClass} px-5 py-5`
      )}
    >
      <p className="flex min-w-0 flex-1 items-center gap-2 font-[family-name:var(--font-sans)] text-[15px] text-[var(--ink)]">
        <AlertCircle className="h-[18px] w-[18px] shrink-0 text-[var(--accent)]" aria-hidden="true" />
        {message}
      </p>
      <button type="button" onClick={onRetry} className={smallButtonClass}>
        {adminEmailsCopy.tryAgain}
      </button>
    </div>
  );
}

export function LoadMoreButton({ onClick, pending }: { onClick: () => void; pending: boolean }) {
  return (
    <div className="mt-4 flex justify-center">
      {/* aria-disabled, not disabled: a disabled button drops keyboard focus to <body>. */}
      <button type="button" onClick={() => { if (!pending) onClick(); }} aria-disabled={pending || undefined} aria-busy={pending || undefined} className={cn(smallButtonClass, 'min-w-[140px]')}>
        {pending ? adminEmailsCopy.loadingMore : adminEmailsCopy.loadMore}
      </button>
    </div>
  );
}

export type BadgeTone = 'neutral' | 'accent' | 'ink' | 'muted';

export function Badge({ tone = 'neutral', children }: { tone?: BadgeTone; children: ReactNode }) {
  return (
    <span
      className={cn(
        'inline-flex h-[22px] shrink-0 items-center rounded-full border px-2 font-[family-name:var(--font-sans)] text-[12px] font-semibold leading-none',
        tone === 'accent' && 'border-[var(--accent)] text-[var(--accent)]',
        tone === 'ink' && 'border-[var(--ink)] bg-[var(--ink)] text-[var(--bg)]',
        tone === 'neutral' && 'border-[var(--line)] bg-[var(--btn2)] text-[var(--ink)]',
        tone === 'muted' && 'border-[var(--line)] text-[var(--muted)]'
      )}
    >
      {children}
    </span>
  );
}

// ---- time --------------------------------------------------------------------------

let now = Date.now();
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | undefined;

function subscribeNow(listener: () => void): () => void {
  if (listeners.size === 0) {
    now = Date.now();
    timer = setInterval(() => {
      now = Date.now();
      for (const notify of Array.from(listeners)) notify();
    }, 60_000);
  }
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && timer !== undefined) {
      clearInterval(timer);
      timer = undefined;
    }
  };
}

/** Current time, updated once a minute while anything shows a relative date. */
function useNow(): number {
  return useSyncExternalStore(subscribeNow, () => now, () => now);
}

const relative = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
const exact = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' });
const shortDate = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

export function formatExact(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? '' : exact.format(date);
}

function formatRelative(date: Date, current: number): string {
  const seconds = Math.round((date.getTime() - current) / 1000);
  const abs = Math.abs(seconds);
  if (abs < 45) return adminEmailsCopy.justNow;
  if (abs < 3600) return relative.format(Math.round(seconds / 60), 'minute');
  if (abs < 86_400) return relative.format(Math.round(seconds / 3600), 'hour');
  if (abs < 7 * 86_400) return relative.format(Math.round(seconds / 86_400), 'day');
  return shortDate.format(date);
}

/** "5 minutes ago", with the exact date and time in the title. */
export function RelativeTime({ iso, className }: { iso: string | null; className?: string }) {
  const current = useNow();
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return (
    <time dateTime={iso} title={exact.format(date)} className={className}>
      {formatRelative(date, current)}
    </time>
  );
}

/** "Amina Bello <amina@x.com>" → { name: "Amina Bello", email: "amina@x.com" }. */
export function parseAddress(value: string): { name: string; email: string } {
  const match = /^\s*"?([^"<]*?)"?\s*<([^>]+)>\s*$/.exec(value);
  if (match) return { name: (match[1] ?? '').trim(), email: (match[2] ?? '').trim() };
  return { name: '', email: value.trim() };
}
