import { calendlyUrl, routes } from '@/content/site';

export function isPlaceholderCalendlyUrl(url?: string): boolean {
  if (!url) return true;
  const trimmed = url.trim();
  if (!trimmed || trimmed.includes('[')) return true;
  return !trimmed.startsWith('https://');
}

export const bookCallContent = {
  documentTitle: 'Book an audit call | Bretosolution',
  headingPrefix: 'Book an',
  headingScript: 'Audit Call',
  description:
    'Choose a time to talk about how your restaurant appears on Google and AI search, and where to start.',
  calendlyUrl,
  openNewTabLabel: 'Open Calendly in a new tab',
  auditFormLink: {
    label: 'Prefer to fill in the audit form first?',
    href: routes.audit,
  },
  embed: {
    iframeTitle: 'Book an audit call',
    brandName: 'Bretosolution',
    placeholderMessage:
      'Your booking calendar will appear here once Calendly is connected.',
    eventRowLabel: 'Audit call · [duration]',
    previewPillLabel: 'Preview placeholder',
    slowLoadMessage: 'The calendar is taking a while to load.',
    openNewTabButtonLabel: 'Open Calendly in a new tab',
  },
} as const;
