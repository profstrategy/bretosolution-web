// Later (Next.js): this component keeps working with the inline embed. A server route /api/webhooks/calendly will receive booking events and store them. No server code belongs in this file.

import { useEffect, useState } from 'react';
import { ArrowUpRight, ChevronRight } from 'lucide-react';
import { assets } from '@/content/assets';
import { bookCallContent } from '@/content/bookCall';
import { calendlyUrl as defaultCalendlyUrl } from '@/content/site';

export interface CalendlyEmbedProps {
  url?: string;
}

export function isPlaceholderCalendlyUrl(url?: string): boolean {
  if (!url) return true;
  const trimmed = url.trim();
  if (!trimmed || trimmed.includes('[')) return true;
  return !trimmed.startsWith('https://');
}

export function CalendlyEmbed({ url = defaultCalendlyUrl }: CalendlyEmbedProps) {
  const { embed } = bookCallContent;
  const isPlaceholder = isPlaceholderCalendlyUrl(url);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSlowLoad, setIsSlowLoad] = useState(false);

  useEffect(() => {
    setIsLoaded(false);
    setIsSlowLoad(false);

    if (isPlaceholder) {
      return;
    }

    const timer = window.setTimeout(() => {
      setIsSlowLoad(true);
    }, 8000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [url, isPlaceholder]);

  if (isPlaceholder) {
    return (
      <div className="mx-auto flex min-h-[280px] w-full max-w-[460px] flex-col justify-between rounded-[10px] border border-[var(--line)] bg-[var(--panel)] p-[28px]">
        <div className="flex flex-col items-center text-center">
          <div className="mb-3 flex w-full items-center justify-end">
            <span className="rounded-full border border-[var(--line)] bg-[var(--bg)] px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--muted)]">
              {embed.previewPillLabel}
            </span>
          </div>

          <img
            src={assets.bretoLogo.src}
            alt=""
            width={44}
            height={44}
            className="h-11 w-11 rounded-[10px] object-cover"
          />

          <p className="mt-3 font-serif text-[18px] font-semibold tracking-[0.01em] text-[var(--ink)]">
            {embed.brandName}
          </p>

          <p className="mt-2 max-w-[34ch] text-[14px] leading-[1.6] text-[var(--muted)]">
            {embed.placeholderMessage}
          </p>
        </div>

        <div className="mt-6 border-t border-[var(--line)] pt-4">
          <div
            aria-disabled="true"
            className="flex cursor-not-allowed select-none items-center justify-between rounded-[8px] px-2 py-2.5 opacity-75"
          >
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="h-3 w-3 shrink-0 rounded-full bg-[var(--accent)]"
              />
              <span className="text-[14px] font-medium text-[var(--ink)]">
                {embed.eventRowLabel}
              </span>
            </div>
            <ChevronRight
              aria-hidden="true"
              className="h-4 w-4 shrink-0 text-[var(--muted)]"
            />
          </div>
        </div>
      </div>
    );
  }

  const trimmedUrl = (url ?? '').trim();
  const separator = trimmedUrl.includes('?') ? '&' : '?';
  const iframeSrc = `${trimmedUrl}${separator}hide_gdpr_banner=1`;

  return (
    <div className="relative w-full">
      {!isLoaded && !isSlowLoad && (
        <div
          aria-live="polite"
          className="flex h-[620px] w-full animate-pulse flex-col items-center justify-center rounded-[10px] border border-[var(--line)] bg-[var(--panel)] p-6 md:h-[700px]"
        >
          <div className="h-11 w-11 rounded-[10px] bg-[var(--line)]" />
          <div className="mt-4 h-4 w-40 rounded bg-[var(--line)]" />
          <div className="mt-3 h-3 w-64 max-w-full rounded bg-[var(--line)]" />
        </div>
      )}

      {!isLoaded && isSlowLoad && (
        <div
          aria-live="polite"
          className="flex h-[620px] w-full flex-col items-center justify-center gap-4 rounded-[10px] border border-[var(--line)] bg-[var(--panel)] p-6 text-center md:h-[700px]"
        >
          <p className="text-[15px] text-[var(--muted)]">
            {embed.slowLoadMessage}
          </p>
          <a
            href={trimmedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[8px] bg-[var(--btn)] px-5 py-2.5 text-[14px] font-medium text-[var(--btnfg)] transition-opacity hover:opacity-90"
          >
            <span>{embed.openNewTabButtonLabel}</span>
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      )}

      <iframe
        src={iframeSrc}
        title={embed.iframeTitle}
        width="100%"
        onLoad={() => {
          setIsLoaded(true);
          setIsSlowLoad(false);
        }}
        className={`h-[620px] w-full border-0 md:h-[700px] ${
          isLoaded ? 'block' : 'sr-only'
        }`}
      />
    </div>
  );
}
