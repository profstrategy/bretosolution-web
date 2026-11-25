// Fixed wording that surrounds the personal message you write for each reply.
// Edit here, never inside the templates.
//
// `footerReason` is shown ONLY when the email is linked to a website request
// (AuditRequest or QuoteRequest) whose email matches the recipient. A newly
// created or cold email never shows it. See src/lib/server/adminEmailRender.ts.
export const replyCopy = {
  audit: {
    eyebrow: 'Free AI Visibility Audit',
    heading: 'Your AI Visibility Audit',
    attachmentTitle: 'Your audit report',
    attachmentNote:
      'It is attached to this email as a PDF. If you cannot open it, reply and we will send it another way.',
    ctaLead:
      'Want to go through the findings together? Pick a time that suits you.',
    ctaLabel: 'Book a call',
    footerReason:
      'You received this email because you requested a free AI Visibility Audit on bretosolution.com.',
    defaultSubject: 'Your AI Visibility Audit',
  },
  quote: {
    eyebrow: 'Quote',
    heading: 'Your quote from Bretosolution',
    rowsTitle: 'At a glance',
    attachmentTitle: 'Attached document',
    attachmentNote: 'It is attached to this email as a PDF.',
    ctaLead:
      'If it is easier to talk it through, pick a time that suits you.',
    ctaLabel: 'Book a call',
    bindingNote:
      'A quote becomes binding only once a written scope of work has been agreed and signed by both sides.',
    footerReason:
      'You received this email because you requested a quote on bretosolution.com.',
    defaultSubject: 'Your quote from Bretosolution',
  },
  general: {
    attachmentTitle: 'Attached document',
    attachmentNote: 'It is attached to this email as a PDF.',
    ctaLead: 'If it is easier to talk it through, pick a time that suits you.',
    ctaLabel: 'Book a call',
    footerReason:
      'You received this email because you submitted a request on bretosolution.com.',
  },
  common: {
    greetingFallback: 'Hi there,',
    defaultSigner: 'The Bretosolution team',
    unsubscribeLabel: 'Unsubscribe',
    unsubscribeHref:
      'mailto:hello@bretosolution.com?subject=Unsubscribe&body=Please%20stop%20emailing%20me.',
  },
} as const;
