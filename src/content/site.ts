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
  devFoundation: '/dev/foundation',
} as const;

export const site = {
  name: 'Bretosolution',
  wordmark: 'BRETO',
  descriptor: 'AI Visibility & Web Growth',
  routes,
  navItems: [
    { label: 'Solutions', href: routes.solutions },
    { label: 'Pricing', href: routes.pricing },
  ] satisfies NavItem[],
  auditCtaLabel: 'Free AI Visibility Audit',
  longCtaLabel: 'Request a Free AI Visibility Audit',
  contactEmail: '[Business email]',
  contactPhone: '[Phone or WhatsApp]',
  domain: 'bretosolution.com',
  legalPrivacy: '[Privacy notice]',
  legalTerms: '[Terms of service]',
  contact: {
    email: '[Business email]',
    phone: '[Phone or WhatsApp]',
  },
  legal: {
    privacy: '[Privacy notice]',
    terms: '[Terms of service]',
  },
  header: {
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
      '[Business email]',
      '[Phone or WhatsApp]',
      'bretosolution.com',
    ],
    rightsSuffix: 'Bretosolution. All rights reserved.',
    legalNotice: '[Privacy notice] · [Terms of service]',
  },
} as const;
