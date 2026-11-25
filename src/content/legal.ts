export const LEGAL_VERSION = '2026-11-21';
export const LEGAL_LAST_UPDATED = '2026-11-21';
export const CONSENT_ERROR_MESSAGE =
  'Please accept the Terms of Service and Privacy Policy to continue.';

export interface LegalSection {
  id: string;
  heading: string;
  paragraphs?: string[];
  list?: string[];
}

export const privacyPolicy: LegalSection[] = [
  {
    id: 'who-we-are',
    heading: 'Who we are and how to contact us',
    paragraphs: [
      'Bretosolution operates this website at bretosolution.com. We provide information about digital visibility and website services, and we handle requests submitted through our forms.',
      'Our registered business name is BRETO DIGITAL SOLUTIONS AGENCY, and our registered business address is Jakana Plaza, Lagos Street,Maiduguri Borno State.',
      'You can send privacy questions to hello@bretosolution.com.',
    ],
  },
  {
    id: 'what-we-collect',
    heading: 'What we collect',
    paragraphs: [
      'We collect only the information shown below when you use the relevant feature.',
    ],
    list: [
      'Audit request: business name, website or Instagram address or handle, city, business type, and business email.',
      'Quote request: business type, the service you need, an optional main-challenge description, contact name, business name, email, an optional phone or WhatsApp number, an optional website or Instagram address or handle, and whether the business is based in Nigeria or another country.',
      'Booking via Calendly: the booking fields and other information you enter in Calendly. The site currently uses a Calendly scheduling link placeholder, so no live booking page or Calendly booking data is active in the code today.',
      'Technical data: when you submit a form, the server records a salted SHA-256 hash of the IP address, a user-agent string limited to 200 characters, the submission time, notification status, and rate-limit bucket records with the time of each hit. Raw IP addresses are not stored. The hidden honeypot fields are checked to reduce automated submissions; a value in a honeypot is not saved.',
      'Browser storage: we store the selected theme, either light or dark, in localStorage under the key breto-theme.',
    ],
  },
  {
    id: 'why-we-use-it',
    heading: 'Why we use it and our legal basis',
    paragraphs: [
      'Under the Nigeria Data Protection Act 2023, we use the information for the purpose and legal basis described below.',
    ],
    list: [
      'Consent: when you submit an audit or quote form, you provide the information so we can prepare a response and contact you about that request.',
      'Legitimate interest: we use the hashed IP address, limited user-agent data, timestamps, and rate-limit records to protect the forms from abuse and to keep the service available. We use request and notification records to manage and respond to submitted requests.',
    ],
  },
  {
    id: 'who-receives-it',
    heading: 'Who receives it',
    paragraphs: [
      'Audit and quote information is stored in our PostgreSQL database and may be sent to our nominated email recipient through Resend for lead notification.',
      'The database hosting provider is SUPABASE. The website hosting provider is hostinger deployed on vercel. The Resend account region or processing location is US Region.',
      'Calendly may receive the information you enter if you use a live Calendly scheduling page. Its use is not active today because the scheduling link remains a placeholder.',
      'Next font generation is configured for Inter, Playfair Display, JetBrains Mono, and Satisfy; the code does not identify a separate browser-side font service or script provider.',
    ],
  },
  {
    id: 'international-transfers',
    heading: 'International transfers',
    paragraphs: [
      'A service provider may process submitted information outside Nigeria. We do not assert a transfer mechanism in this policy where the code and contracts do not establish one.',
      'Before we confirm providers or regions, we rely on the safeguards offered by each provider as the facts and our agreements allow.',
    ],
  },
  {
    id: 'how-long-we-keep-it',
    heading: 'How long we keep it',
    paragraphs: [
      'Audit and quote lead records are kept for 48 hours. The code does not currently contain a lead deletion or retention rule, so records remain until an operator changes or deletes them.',
      'Rate-limit records are automatically deleted after 24 hours, as implemented in the server code.',
      'The code does not establish a retention period for database backups or for information held by the email provider.',
    ],
  },
  {
    id: 'your-rights',
    heading: 'Your rights',
    paragraphs: [
      'Subject to applicable law, you may ask for access to personal information we hold about you, correction of inaccurate information, deletion of information, restriction of processing, or an explanation of our objection to certain processing.',
      'You may ask for a copy of personal information you provided in a usable format. You may withdraw consent for future contact at any time. Withdrawing consent does not affect processing that occurred before withdrawal.',
      'You may complain to the Nigeria Data Protection Commission if you believe your information has been handled unlawfully.',
    ],
  },
  {
    id: 'security',
    heading: 'Security',
    paragraphs: [
      'We limit the form data we accept and use a honeypot and rate limits to reduce automated abuse. Raw form submission IP addresses are not stored; the server stores a salted hash.',
      'The repository does not document database encryption settings, backup controls, or internal access controls. These are matters for the operator and hosting providers, which cannot be verified from this code.',
    ],
  },
  {
    id: 'cookies-and-local-storage',
    heading: 'Cookies and local storage',
    paragraphs: [
      'The application does not set cookies in the code currently present.',
      'It stores one localStorage preference: breto-theme, set to light or dark. Removing or changing that browser preference changes the stored theme setting.',
    ],
  },
  {
    id: 'children',
    heading: 'Children',
    paragraphs: [
      'The website and its forms are not directed to children under 18.',
    ],
  },
  {
    id: 'changes',
    heading: 'Changes to this policy',
    paragraphs: [
      'We may update this policy when our services or data practices change. The updated date at the top of this document shows the most recent version.',
    ],
  },
  {
    id: 'contact',
    heading: 'Contact',
    paragraphs: [
      'For privacy requests or questions, contact hello@bretosolution.com.',
    ],
  },
];

export const termsOfService: LegalSection[] = [
  {
    id: 'about-these-terms',
    heading: 'About these terms and who they apply to',
    paragraphs: [
      'These terms govern your use of this Bretosolution website and your requests through the audit or quote forms.',
      'They apply to visitors and to people who submit a form or request information.',
    ],
  },
  {
    id: 'what-we-offer',
    heading: 'What we offer on this site',
    paragraphs: [
      'The site provides information about AI visibility, search visibility, technical SEO, website development, and ongoing growth services.',
      'It allows visitors to request a free AI Visibility Audit or request a quote. A form submission is an enquiry, not a purchase or service agreement.',
    ],
  },
  {
    id: 'free-audit',
    heading: 'The free AI Visibility Audit',
    paragraphs: [
      'A free audit is an assessment based on public information available for review. It does not guarantee rankings, traffic, mentions on Google or AI platforms, bookings, sales, or any other result.',
      'The audit is not a contract for services. Whether we provide project work is decided separately under a signed scope of work.',
    ],
  },
  {
    id: 'quotes-and-projects',
    heading: 'Quotes and projects',
    paragraphs: [
      'A quote or estimate is not binding. It is not a binding offer.',
      'Project work starts only when both parties sign a written scope of work. The signed scope sets the prices, timelines, payment terms, deliverables, revisions, exclusions, and other project commitments.',
      'Nothing published on this website overrides or replaces that signed scope.',
    ],
  },
  {
    id: 'acceptable-use',
    heading: 'Acceptable use',
    paragraphs: [
      'You must use the site lawfully and must not use it to mislead others or submit false information.',
      'You must not scrape, disrupt, overload, or misuse the site or its forms. Automated abuse and attempts to bypass form safeguards are not allowed.',
    ],
  },
  {
    id: 'your-information',
    heading: 'Your information',
    paragraphs: [
      'Information submitted through our forms is handled according to the Privacy Policy.',
      'By submitting a form, you confirm that you have permission to provide the information and that it is accurate to the best of your knowledge.',
    ],
  },
  {
    id: 'intellectual-property',
    heading: 'Intellectual property',
    paragraphs: [
      'The Bretosolution name, site content, brand elements, and design belong to Bretosolution or its licensors.',
      'You keep rights to material you own. Project ownership, source files, licensing, and handover are set in the signed scope of work.',
    ],
  },
  {
    id: 'third-party-services',
    heading: 'Third-party services and links',
    paragraphs: [
      'The site may link to or embed third-party services, including Calendly and public Google or AI-platform services. We do not control those services or their terms.',
      'A third party may have its own privacy and use rules. Your use of a third-party service is subject to its terms.',
    ],
  },
  {
    id: 'no-guarantees',
    heading: 'No guarantees and limitation of liability',
    paragraphs: [
      'This website is provided as is, subject to rights that cannot be excluded under applicable law.',
      'To the extent the law allows, Bretosolution is not responsible for indirect or consequential loss caused by use of the website or reliance on general site content.',
      'Nothing in these terms excludes or limits liability that applicable Nigerian law does not allow us to exclude.',
    ],
  },
  {
    id: 'changes',
    heading: 'Changes to the site and terms',
    paragraphs: [
      'We may change or remove site content and may update these terms.',
      'The updated date identifies the current terms. Continued use of the site after an update is subject to the terms then in effect.',
    ],
  },
  {
    id: 'governing-law',
    heading: 'Governing law',
    paragraphs: [
      'These terms are governed by the laws of Nigeria.',
      'Courts in Borno State have jurisdiction to the extent allowed by law.',
    ],
  },
  {
    id: 'contact',
    heading: 'Contact',
    paragraphs: [
      'Questions about these terms may be sent to hello@bretosolution.com.',
    ],
  },
];
