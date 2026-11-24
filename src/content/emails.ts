import { site } from '@/content/site';

export const auditConfirmationCopy = {
  subject: "We've received your free AI Visibility Audit request",
  preheader: 'Your audit will be with you shortly',
  greeting: 'Hi {businessName} team,',
  fallbackGreeting: 'Hi there,',
  paragraphs: [
    "Thank you for requesting our free AI Visibility Audit. We're here to help your business show up where customers search today, on Google and on AI platforms, so that more of them find you and choose you.",
    'Our team is now preparing your audit. We will send it to you shortly.',
    "You don't need to do anything in the meantime. If you want to add anything, just reply to this email.",
  ],
  signoff: 'The Bretosolution team',
} as const;

export const quoteConfirmationCopy = {
  subject: "We've received your quote request",
  preheader: "We're reviewing your request and will be in touch.",
  greeting: 'Hi {contactName},',
  fallbackGreeting: 'Hi there,',
  paragraphs: [
    "Thank you for asking Bretosolution for a quote. We've received your request and our team is reviewing the details you shared.",
    "We'll reply to this email address with next steps and any questions we have about the scope of work.",
    'A quote becomes binding only once a written scope of work has been agreed and signed by both sides.',
  ],
  signoff: 'The Bretosolution team',
} as const;

export const emailFooterCopy = {
  submittedNotice:
    'You received this email because you submitted a request on bretosolution.com.',
  unsubscribeLabel: 'Unsubscribe',
  unsubscribeSubject: 'Unsubscribe',
  unsubscribeBody: 'Please stop emailing me.',
  postalAddress: site.postalAddress,
} as const;

export function getUnsubscribeUrl(): string {
  return (
    `mailto:${site.contactEmail}?subject=${encodeURIComponent(emailFooterCopy.unsubscribeSubject)}` +
    `&body=${encodeURIComponent(emailFooterCopy.unsubscribeBody)}`
  );
}

export const ownerNotificationCopy = {
  audit: {
    title: 'New audit request',
    labels: {
      businessName: 'Business name',
      websiteOrInstagram: 'Website or Instagram',
      city: 'City',
      businessType: 'Business type',
      email: 'Email',
      consent: 'Consent',
      received: 'Received',
    },
  },
  quote: {
    title: 'New quote request',
    labels: {
      businessType: 'Business type',
      helpNeeded: 'Help needed',
      mainChallenge: 'Main challenge',
      contactName: 'Contact name',
      businessName: 'Business name',
      email: 'Email',
      phoneOrWhatsapp: 'Phone or WhatsApp',
      websiteOrInstagram: 'Website or Instagram',
      countryRegion: 'Country or region',
      consent: 'Consent',
      received: 'Received',
    },
  },
} as const;
