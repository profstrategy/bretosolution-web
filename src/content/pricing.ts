import { routes } from '@/content/site';

export interface PricingOfferRow {
  tag: string;
  title: string;
  description: string;
  price: string;
  isDisplayPrice?: boolean;
}

export interface PaymentColumnItem {
  title: string;
  description: string;
}

export interface StraightAnswerRow {
  question: string;
  answer: string;
}

export const pricingContent = {
  hero: {
    eyebrow: 'Pricing',
    heading: 'Priced by scope,',
    headingScript: 'not by page count.',
    description:
      'Price follows complexity, business value, content, integrations and delivery risk. Every project starts with a free audit and ends with a signed scope of work.',
    primaryCta: {
      label: 'Request a Free AI Visibility Audit',
      href: routes.audit,
    },
    secondaryCta: {
      label: 'Explore Our Solutions',
      href: routes.solutions,
    },
  },
  offers: {
    eyebrow: 'Four ways to work with us',
    heading: 'Start free. Move up only when it makes sense.',
    priceLabel: 'Price',
    rows: [
      {
        tag: 'Start here',
        title: 'AI Visibility Diagnostic',
        description:
          'A short research-led diagnostic with competitor observations and prioritised opportunities.',
        price: 'Free',
        isDisplayPrice: true,
      },
      {
        tag: 'One-time project',
        title: 'AI Visibility Optimization',
        description:
          'Technical and local SEO, business information, content improvements, structured data where appropriate, and baseline and follow-up testing.',
        price: '[₦ price, set after audit]',
      },
      {
        tag: 'Fixed-scope project',
        title: 'Website + AI Visibility',
        description:
          'A custom responsive website, technical SEO foundations, conversion flow, analytics and an initial visibility assessment. Typically four to six weeks.',
        price: '[₦ price, set after audit]',
      },
      {
        tag: 'Monthly',
        title: 'Visibility Growth Management',
        description:
          'Monitoring, content optimization, local SEO maintenance, website support and reporting. Offered when there is ongoing work to do.',
        price: '[₦ per month]',
      },
    ] satisfies PricingOfferRow[],
    note: 'Add-on modules such as online ordering, an admin dashboard or a chatbot are quoted separately. Nigerian and international clients receive separate quotes and contracts.',
  },
  paymentWorks: {
    eyebrow: 'How payment works',
    heading: 'No surprises on the invoice.',
    columns: [
      {
        title: 'Smaller projects',
        description:
          'Sixty percent upfront and forty percent before final handover.',
      },
      {
        title: 'Larger projects',
        description:
          'Milestone billing, with each milestone and its deliverables written into the scope of work.',
      },
      {
        title: 'Third-party costs',
        description:
          'Hosting, domains, premium subscriptions, paid APIs and stock assets are listed separately from our fee.',
      },
    ] satisfies PaymentColumnItem[],
  },
  signedScope: {
    eyebrow: 'Signed scope of work',
    heading: 'Everything agreed in writing before we start.',
    description:
      'A clear scope protects both sides. It is also the reason we can hold a price.',
    items: [
      'Deliverables, listed one by one',
      'Acceptance criteria for each area of work',
      'Revision limits',
      'Timeline and what we need from you, and when',
      'Exclusions',
      'Ownership and handover terms',
    ],
  },
  straightAnswers: {
    eyebrow: 'Straight answers',
    heading: 'The questions owners ask before they hire us.',
    rows: [
      {
        question: 'Can you guarantee ChatGPT will recommend us?',
        answer:
          'No, and no responsible agency can. We improve the website and business information, monitor actual results and make evidence-based changes.',
      },
      {
        question: 'We already have a website.',
        answer:
          'That helps. The first step is to assess its performance, discoverability and conversion. Replacing it may not be necessary.',
      },
      {
        question: 'AI doesn’t bring us customers.',
        answer:
          'A fair concern. We set a baseline and measure referral traffic and enquiries instead of assuming that mentions create sales.',
      },
      {
        question: 'The price is too high for us.',
        answer:
          'We revisit the scope and put the improvements with the most commercial value first. We don’t cut the quality of delivery.',
      },
    ] satisfies StraightAnswerRow[],
  },
  closingCta: {
    heading: 'See your own numbers first,',
    headingScript: 'then decide.',
    cta: {
      label: 'Request a Free AI Visibility Audit',
      href: routes.audit,
    },
  },
} as const;
