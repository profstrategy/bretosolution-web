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

export const calendlyUrl = '[Calendly scheduling link]';

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
  contactEmail: 'hello@bretosolution.com',
  contactPhone: '0916 034 7172',
  domain: 'bretosolution.com',
  legalPrivacy: '[Privacy notice]',
  legalTerms: '[Terms of service]',
  contact: {
    email: 'hello@bretosolution.com',
    phone: '0916 034 7172',
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
      'hello@bretosolution.com'
    ],
    rightsSuffix: 'Bretosolution. All rights reserved.',
    legalNotice: '[Privacy notice] · [Terms of service]',
  },
} as const;
