export interface NavItem {
  label: string;
  href: string;
}

export const routes = {
  home: '/',
  solutions: '/solutions',
  pricing: '/pricing',
  audit: '/audit',
  bookCall: '/book-call',
} as const;

export const calendlyUrl = 'https://calendly.com/breto';

const contactEmail = 'hello@bretosolution.com';
const contactPhone = '0916 034 7172';
/** WhatsApp chat link: wa.me needs the international form (Nigeria, +234, no leading 0). */
const whatsappUrl = `https://wa.me/234${contactPhone.replace(/\D/g, '').replace(/^0/, '')}`;
const postalAddress = [
  '35, Jakana Plaza',
  'Lagos Street',
  'Maiduguri, Borno State',
  '600215',
  'Nigeria',
] as const;

export const siteDescription =
  'Bretosolution helps restaurants and hospitality and other businesses improve their visibility on Google and AI search platforms and builds websites that convert visitors into customers.';

export const site = {
  name: 'Bretosolution',
  wordmark: 'BRETO',
  descriptor: 'AI Visibility & Web Growth',
  routes,
  calendlyUrl,
  navItems: [
    { label: 'Solutions', href: routes.solutions },
    { label: 'Pricing', href: routes.pricing },
  ] satisfies NavItem[],
  auditCtaLabel: 'Free AI Visibility Audit',
  longCtaLabel: 'Request a Free AI Visibility Audit',
  contactEmail,
  postalAddress,
  contactPhone,
  domain: 'bretosolution.com',
  legalPrivacy: '[Privacy notice]',
  legalTerms: '[Terms of service]',
  contact: {
    email: contactEmail,
    phone: contactPhone,
    whatsapp: contactPhone,
    whatsappUrl,
  },
  social: {
    heading: 'Follow us on social media.',
    links: [
      { id: 'instagram', label: 'Instagram', href: 'https://www.instagram.com/bretosolution/' },
      { id: 'linkedin', label: 'LinkedIn', href: 'https://www.linkedin.com/company/bretosolution/' },
    ],
  },
  legal: {
    privacy: '[Privacy notice]',
    terms: '[Terms of service]',
  },
  header: {
    skipToContentLabel: 'Skip to content',
    homeAriaLabel: 'Breto home',
    mainNavAriaLabel: 'Main',
    switchToDarkLabel: 'Switch to dark mode',
    switchToLightLabel: 'Switch to light mode',
    openMenuLabel: 'Open navigation menu',
    closeMenuLabel: 'Close navigation menu',
  },
  footer: {
    brandDescription:
      'Bretosolution · AI search optimization, technical SEO and website development for restaurants and hospitality.',
    companyEyebrow: 'Company',
    companyLinks: [
      { label: 'Solutions', href: routes.solutions },
      { label: 'Pricing', href: routes.pricing },
      { label: 'Free audit', href: routes.audit },
      { label: 'Book an audit call', href: routes.bookCall },
    ] satisfies NavItem[],
    contactEyebrow: 'Contact',
    contactItems: [
      contactEmail
    ],
    rightsSuffix: 'Bretosolution. All rights reserved.',
    legalNotice: '[Privacy notice] · [Terms of service]',
  },
} as const;
