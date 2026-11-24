import { routes } from '@/content/site';

export interface AuditLogRow {
  label: string;
  value: string;
}

export interface NumberedItem {
  number: string;
  label: string;
}

export interface PrincipleItem {
  title: string;
  description: string;
}

export interface ServiceLink {
  label: string;
  href: string;
}

export interface AuditStep {
  step: number;
  title: string;
  description: string;
}

export interface OfferCard {
  badge: string;
  title: string;
  description: string;
  inverted?: boolean;
}

export const homeContent = {
  documentTitle: 'Bretosolution — AI Visibility & Web Growth',
  hero: {
    eyebrow: 'Restaurants and hospitality · AI search visibility',
    heading: 'Be discovered by the customers already searching for',
    headingScript: 'what you offer.',
    description:
      'We help businesses improve their visibility across search engines and AI-powered platforms while building high-performing websites that turn visitors into customers.',
    primaryCta: {
      label: 'Request a Free AI Visibility Audit',
      href: routes.audit,
    },
    secondaryCta: {
      label: 'Explore Our Solutions',
      href: routes.solutions,
    },
    window1: {
      title: 'Our Audit report · format example',
      badge: 'Not a real result',
      rows: [
        {
          label: 'Platform',
          value: 'ChatGPT Search',
        },
        {
          label: 'Query',
          value: '“Recommend restaurants for a family dinner in Wuse, Abuja.”',
        },
        {
          label: 'Test date',
          value: '17/11/2026',
        },
        {
          label: 'Business mentioned',
          value: 'No',
        },
        {
          label: 'Website cited',
          value: 'No',
        },
        {
          label: 'Hours, address, menu',
          value: 'Accurate',
        },
        {
          label: 'Competitors named',
          value: 'Citro Abuja, Wakkis Food, Marks at the Park',
        },
      ] satisfies AuditLogRow[],
    },
    window2: {
      title: 'AI search · sample query',
      userBubble: 'Where can I get French cuisine in Wuse, around Aminu Kano Cres axis?',
      assistantBubble: '[Answer recorded here, with the sources it cited]',
    },
    disclaimer:
      'One test is an observation, not a ranking, we repeat tests and report the limits.',
  },
  problemSolution: {
    heading: 'Rise in social media followers',
    headingScript: 'Your search discovery should, too.',
    description:
      'When discoverability improves on Google and AI-powered platforms, your tools become the connection in between.',
    left: {
      label: 'Where most restaurants are today',
      followersCount: '23k',
      followersSubtext: 'followers on Instagram | Facebook | LinkedIn',
      row1: {
        number: '01',
        label: 'No visibility on',
      },
      otherRows: [
        { number: '02', label: 'No or dead website' },
        { number: '03', label: 'Incomplete business profile' },
      ] satisfies NumberedItem[],
      resultNumber: '<10',
      resultSuffix: ' online orders / month',
    },
    right: {
      label: 'How Bretosolution solves it',
      rows: [
        { number: '01', label: 'Strong local SEO' },
        { number: '02', label: 'AI visibility' },
        { number: '03', label: 'A website that converts visitors' },
        { number: '04', label: 'Social media' },
      ] satisfies NumberedItem[],
      resultNumber: '30+',
      resultSuffix: ' online orders / month',
    },
    // footnote:
    //   'Illustrative scenario to explain the idea. These figures are not a client result and not a promise of outcomes.',
  },
  principles: {
    eyebrow: 'How we work',
    heading: 'What we sell, and what we don’t.',
    items: [
      {
        title: 'Verifiable improvements',
        description:
          'Clearer business information, a faster website and a booking or ordering path that works on a phone. You can check each one.',
      },
      {
        title: 'Dated, repeatable tests',
        description:
          'Every AI search result we show carries its platform, query and date. We record what appeared and what the platform cited.',
      },
      {
        title: 'No guaranteed rankings',
        description:
          'No agency can promise a particular ChatGPT, Gemini or Google AI answer. We improve what you control and measure what follows.',
      },
    ] satisfies PrincipleItem[],
  },
  services: {
    eyebrow: 'Solutions',
    heading: 'Three services that work together.',
    description:
      'Search visibility, a website that converts, and the monthly work that keeps both improving.',
    links: [
      {
        label: 'AI Search Visibility',
        href: `${routes.solutions}#ai-search-visibility`,
      },
      {
        label: 'Website Development',
        href: `${routes.solutions}#website-development`,
      },
      {
        label: 'Ongoing Digital Growth',
        href: `${routes.solutions}#ongoing-digital-growth`,
      },
    ] satisfies ServiceLink[],
    // caption:
    //   'Example restaurant admin dashboard with demo data, beside a local search results view. Google Maps is a trademark of Google LLC.',
  },
  auditProcess: {
    eyebrow: 'The free audit',
    heading: 'See how your business appears',
    headingScript: 'before you spend anything.',
    description:
      'We run the same customer-style searches on each platform, record what comes back, and give you five prioritised recommendations.',
    cta: {
      label: 'Request a Free AI Visibility Audit',
      href: routes.audit,
    },
    steps: [
      {
        step: 1,
        title: 'Verify the business',
        description:
          'Official website, business listings, social profiles and the competitors in your area.',
      },
      {
        step: 2,
        title: 'Test live on AI search',
        description:
          'Ten customer-intent queries on ChatGPT Search, Gemini and Perplexity. We record mentions, citations, accuracy and the sources each platform used.',
      },
      {
        step: 3,
        title: 'Review the foundations',
        description:
          'Crawlability, local listings, menu content, mobile experience and the path from visit to booking or order.',
      },
      {
        step: 4,
        title: 'Prioritise and plan',
        description:
          'Five recommendations with the reasoning behind each, an implementation roadmap and a proposed next step.',
      },
    ] satisfies AuditStep[],
  },
  restaurants: {
    eyebrow: 'Restaurants and hospitality',
    heading: 'Guests ask AI where to eat. Then they look for',
    headingScript: 'a menu and a way to book.',
    description:
      'We test the questions your guests actually ask, for your location, and then fix what stands between a search and a table.',
    loseGuestsLabel: 'Where restaurants lose guests',
    loseGuestsItems: [
      'Menu locked in a PDF or an image',
      'Hours and address that differ between listings',
      'No clear booking or ordering action on mobile',
      'No page for each location',
      'Few credible mentions outside your own channels',
    ],
    queriesLabel: 'Queries we test',
    queries: [
      'What are the best restaurants in [location]?',
      'Where can I get [cuisine] in [location]?',
      'Which restaurants offer online ordering in [location]?',
      'Best restaurants for a business meeting in [location]?',
      'Recommend restaurants with outdoor seating in [location].',
      'Tell me about [your restaurant] and its offerings.',
    ],
  },
  offers: {
    eyebrow: 'Ways to work with us',
    heading: 'Start free. Pay only for scoped work.',
    cards: [
      {
        badge: 'Start here · Free',
        title: 'AI Visibility Diagnostic',
        description:
          'A short research-led diagnostic with competitor observations and prioritised opportunities.',
        inverted: true,
      },
      {
        badge: 'Project',
        title: 'AI Visibility Optimization',
        description:
          'Technical and local SEO, business information, content improvements, structured data where appropriate, and baseline and follow-up testing.',
      },
      {
        badge: 'Project',
        title: 'Website + AI Visibility',
        description:
          'A custom responsive website, technical SEO foundations, conversion flow, analytics and an initial visibility assessment.',
      },
      {
        badge: 'Monthly',
        title: 'Visibility Growth Management',
        description:
          'Monitoring, content optimization, local SEO maintenance, website support and reporting.',
      },
    ] satisfies OfferCard[],
    note: 'Prices are quoted after your audit and set by scope, integrations and content.',
    linkLabel: 'See how pricing works.',
    linkHref: routes.pricing,
  },
  proof: {
    eyebrow: 'Case studies',
    heading: 'We publish a case study only when the results are real.',
    description:
      'Each one will come from a signed client and measured data. Until then, this section says so instead of showing numbers we can’t stand behind.',
    boxTitle: 'First client case studies',
    boxPill: 'In progress',
    listEyebrow: 'Every case study will show',
    listItems: [
      'The starting situation, the agreed objective and baseline measurements',
      'The work delivered and its scope',
      'Before and after results over comparable periods',
      'Changes in enquiries, bookings or orders, where measurable',
      'AI search test results with dates and limitations',
      'Client feedback only when it is genuine and approved',
    ],
  },
  closingCta: {
    heading: 'See how search and AI describe your business.',
    primaryCta: {
      label: 'Request a Free AI Visibility Audit',
      href: routes.audit,
    },
    secondaryCta: {
      label: 'Book an Audit Call',
      href: routes.bookCall,
    },
  },
} as const;
