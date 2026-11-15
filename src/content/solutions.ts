import { routes } from '@/content/site';

export interface GridCellItem {
  title: string;
  description: string;
}

export interface PhaseCardItem {
  phase: string;
  title: string;
  description: string;
}

export interface AddOnItem {
  title: string;
  detail: string;
}

export const solutionsContent = {
  documentTitle: 'Solutions | Bretosolution',
  hero: {
    eyebrow: 'Solutions',
    heading: 'Built around how guests',
    headingScript: 'find and choose a restaurant.',
    description:
      'Search visibility, a website that converts, and the monthly work that keeps both improving. Each service stands alone and works better together.',
    primaryCta: {
      label: 'Request a Free AI Visibility Audit',
      href: routes.audit,
    },
    secondaryCta: {
      label: 'See how pricing works',
      href: routes.pricing,
    },
  },
  aiVisibility: {
    eyebrow: '01 · AI Search Visibility',
    heading: 'Know exactly how search and AI describe your business.',
    description:
      'We assess six areas and fix what we can control. Findings are recorded with the platform, query and date so you can see what changes.',
    cells: [
      {
        title: 'AI discovery testing',
        description:
          'Customer-intent searches on ChatGPT Search, Gemini and Perplexity. Mentions, citations and factual accuracy.',
      },
      {
        title: 'Website discoverability',
        description:
          'Crawlability, indexability, page structure, internal links, content accessibility and performance.',
      },
      {
        title: 'Local search presence',
        description:
          'Business Profile completeness, categories, address, hours, phone and consistency across public listings.',
      },
      {
        title: 'Brand authority',
        description:
          'Credible third-party references, relevant directories, reviews, local publications and mentions.',
      },
      {
        title: 'Content quality',
        description:
          'Menu, services, FAQs, location pages and the unique details that make your business useful to a guest.',
      },
      {
        title: 'Conversion readiness',
        description:
          'Booking, ordering, enquiry and contact paths, the mobile experience and the calls to action.',
      },
    ] satisfies GridCellItem[],
  },
  websiteDevelopment: {
    eyebrow: '02 · Website Development',
    heading: 'A restaurant website built in four phases.',
    description:
      'A typical project runs four to six weeks. The time depends on scope, integrations, content and how quickly your team can send what we need.',
    phases: [
      {
        phase: 'Phase 1',
        title: 'Discovery and planning',
        description:
          'Requirements, competitor review, website structure, search baseline and content requirements.',
      },
      {
        phase: 'Phase 2',
        title: 'Website development',
        description:
          'Responsive site, menu and service pages, location and contact details, booking or ordering integration, conversion-focused design.',
      },
      {
        phase: 'Phase 3',
        title: 'Search optimization',
        description:
          'Technical SEO, crawlability and indexing checks, structured data that matches the page, Business Profile review, content improvements.',
      },
      {
        phase: 'Phase 4',
        title: 'Testing and handover',
        description:
          'Mobile and desktop testing, analytics setup, indexing checks, AI visibility retest, documentation and handover.',
      },
    ] satisfies PhaseCardItem[],
    addOnsHeading: 'Add-on modules',
    addOnsDescription:
      'When a restaurant needs more than a strong website, we scope the extras separately so the base project stays clear.',
    addOns: [
      {
        title: 'Online ordering and payments',
        detail: 'menu-to-checkout flow with a Nigerian payment provider',
      },
      {
        title: 'Admin dashboard',
        detail: 'monitoring, payment tracking and blog management',
      },
      {
        title: 'Chatbot',
        detail:
          'answers menu, hours and booking questions from your own content',
      },
      {
        title: 'Real-time updates',
        detail: 'live order status or availability where the business needs it',
      },
    ] satisfies AddOnItem[],
  },
  ongoingGrowth: {
    eyebrow: '03 · Ongoing Digital Growth',
    heading: 'A monthly report you can act on.',
    paragraphs: [
      'We offer monthly management only when there is continuing work to do. A report with no work behind it is not a service.',
      'Visibility metrics and business results are kept separate. More AI mentions do not automatically mean more reservations, so we track both.',
    ],
    reportEyebrow: 'Each month’s report',
    reportItems: [
      'Google Search Console performance and relevant search queries',
      'Organic traffic and landing-page performance',
      'Enquiries, bookings, orders or other agreed conversions',
      'AI search test results, mentions and citations, with method',
      'Brand references and competitor observations',
      'Completed improvements and unresolved issues',
      'Next month’s prioritised actions',
    ],
  },
  acceptanceCriteria: {
    eyebrow: 'How we know it’s done',
    heading: 'Every project has acceptance criteria, agreed before we start.',
    cells: [
      {
        title: 'Website',
        description:
          'Agreed pages delivered. Layouts, navigation and links tested on mobile and desktop.',
      },
      {
        title: 'Performance',
        description:
          'Measured with suitable tools. Material issues documented and addressed within scope.',
      },
      {
        title: 'Technical SEO',
        description:
          'Crawlability, indexability, metadata, canonicalization and sitemap checks completed.',
      },
      {
        title: 'Structured data',
        description:
          'Markup valid and accurate to the visible page. No guarantee of rich results.',
      },
      {
        title: 'Local SEO',
        description:
          'Business details verified and agreed profile improvements completed.',
      },
      {
        title: 'Analytics',
        description:
          'Tracking configured and tested. Events and conversions documented.',
      },
      {
        title: 'AI visibility',
        description:
          'Baseline and follow-up tests recorded with method and limitations.',
      },
      {
        title: 'Conversion',
        description:
          'Contact, enquiry, booking or ordering flows tested end to end.',
      },
    ] satisfies GridCellItem[],
  },
  closingCta: {
    heading: 'Not sure where to start? Start with the audit,',
    headingScript: 'it costs nothing.',
    primaryCta: {
      label: 'Request a Free AI Visibility Audit',
      href: routes.audit,
    },
    secondaryCta: {
      label: 'See how pricing works',
      href: routes.pricing,
    },
  },
} as const;
