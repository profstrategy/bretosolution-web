import { BUSINESS_TYPES, type BusinessType } from '@/schemas/audit';
import { routes } from '@/content/site';

export const auditPageContent = {
  documentTitle: 'Request a free AI visibility audit | Bretosolution',
  eyebrow: 'Free AI visibility audit',
  heading: 'Find out how your restaurant appears to customers',
  headingScript: 'who ask AI.',
  description:
    'Tell us about your business. We review each request, run the tests described on our site and reply by email with what we find.',
  readyToTalkText: 'Ready to talk? You can book without completing this form.',
  readyToTalkCta: {
    label: 'Book an Audit Call',
    href: routes.bookCall,
  },
} as const;

export const auditFormContent = {
  businessNameLabel: 'Business name',
  businessNamePlaceholder: '[Your restaurant or venue]',
  websiteLabel: 'Website or Instagram page',
  websitePlaceholder: '[Link, or “none yet”]',
  cityLabel: 'City',
  cityPlaceholder: '[City]',
  businessTypeLabel: 'Business type',
  businessTypes: BUSINESS_TYPES satisfies readonly BusinessType[],
  emailLabel: 'Business email',
  emailPlaceholder: '[name@yourbusiness.com]',
  honeypotLabel: 'Company site',
  submitIdle: 'Request My Audit',
  submitSending: 'Sending…',
  privacyNote:
    'We use these details only to prepare your audit and reply to you. You can ask us to stop contacting you at any time.',
  successHeading: 'Request received',
  successBodyPrefix: 'Your reference is',
  successBodySuffix: 'We will reply by email.',
  preferToTalkPrefix: 'Prefer to talk instead?',
  preferToTalkLinkLabel: 'Book an audit call',
  preferToTalkHref: routes.bookCall,
  sendAnotherLabel: 'Send another request',
  errorMessage:
    'Something went wrong. Your details are still here. Please try again.',
  retryLabel: 'Try again',
} as const;
