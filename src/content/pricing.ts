import { routes } from '@/content/site';
import {
  QUOTE_BUSINESS_TYPES,
  QUOTE_HELP_OPTIONS,
  QUOTE_LOCATION_OPTIONS,
} from '@/schemas/quote';

export interface QuoteProcessStep {
  number: string;
  text: string;
}

export interface PricingGuidancePackage {
  iconKey: 'search' | 'layout' | 'trending';
  name: string;
  typeTag: string;
  ngnPrice: string;
  intlPrice: string;
  problem: string;
  whatYouGet: string;
  scopeItems: string[];
}

export interface PaymentColumnItem {
  title: string;
  description: string;
}

export interface SignedScopeCard {
  iconKey:
    | 'fileText'
    | 'checkCircle2'
    | 'refreshCw'
    | 'calendarClock'
    | 'ban'
    | 'keyRound';
  title: string;
  description: string;
}

export interface StraightAnswerRow {
  question: string;
  answer: string;
}

export const pricingContent = {
  documentTitle: 'Pricing & Request a Quote | Bretosolution',
  requestQuote: {
    id: 'quote',
    eyebrow: 'Request a quote',
    heading: 'Tell us what you need,',
    headingScript: 'we’ll price it by scope.',
    description:
      'Describe your restaurant and the problem you want solved. We reply with a scoped quote, not a generic package price.',
    steps: [
      {
        number: '01',
        text: 'Share your business and your goal',
      },
      {
        number: '02',
        text: 'We review your website, listings and search presence',
      },
      {
        number: '03',
        text: 'You receive a quote with deliverables and acceptance criteria',
      },
    ] satisfies QuoteProcessStep[],
    notReadyPrefix: 'Not ready for a quote? Start with the',
    notReadyLinkLabel: 'free audit',
    notReadyLinkHref: routes.audit,
  },
  quoteForm: {
    step1Badge: 'Step 1 of 2',
    step2Badge: 'Step 2 of 2',
    step1Title: 'Your needs',
    step2Title: 'Your details',
    requiredNote: '* Required fields',
    businessTypeLabel: 'Business type *',
    businessTypePlaceholder: 'Select your business type',
    businessTypeOptions: QUOTE_BUSINESS_TYPES,
    helpNeededLabel: 'What do you need help with? *',
    helpNeededPlaceholder: 'Select what you need help with',
    helpNeededOptions: QUOTE_HELP_OPTIONS,
    mainChallengeLabel: 'What is the main challenge?',
    mainChallengeOptionalSuffix: '(optional)',
    mainChallengeHint: 'A sentence is enough. What is not working today?',
    continueButtonLabel: 'Continue to your details',
    contactNameLabel: 'Your name *',
    contactNamePlaceholder: '[Your name]',
    businessNameLabel: 'Business name *',
    businessNamePlaceholder: '[Your restaurant or venue]',
    emailLabel: 'Business email *',
    emailPlaceholder: '[name@yourbusiness.com]',
    phoneLabel: 'WhatsApp or phone',
    phoneOptionalSuffix: '(optional)',
    phonePlaceholder: '[Phone or WhatsApp number]',
    websiteLabel: 'Website or Instagram page',
    websiteOptionalSuffix: '(optional)',
    websitePlaceholder: '[Link or @handle]',
    countryRegionLabel: 'Where is your business based? *',
    countryRegionPlaceholder: 'Select location',
    countryRegionOptions: QUOTE_LOCATION_OPTIONS,
    backButtonLabel: 'Back',
    submitIdleLabel: 'Request a quote',
    submitSendingLabel: 'Sending your request…',
    consentNote:
      'We use these details only to respond to your request. You can ask us to stop contacting you at any time.',
    successHeading: 'Request received',
    successBodyPrefix: 'Your reference is',
    successBodySuffix: 'We will reply by email with a scoped quote.',
    sendAnotherLabel: 'Send another request',
    errorMessage:
      'Something went wrong while sending your request. Please try again.',
    retryLabel: 'Try again',
    honeypotLabel: 'Company site',
  },
  pricingGuidance: {
    leftPanel: {
      eyebrow: 'Pricing',
      heading: 'Priced by scope,',
      headingScript: 'not by page count.',
      description:
        'Price follows complexity, business value, content, integrations and delivery risk. Every project starts with a free audit and ends with a signed scope of work.',
    },
    rightPanel: {
      diagnostic: {
        tag: 'Start here',
        title: 'AI Visibility Diagnostic',
        pricePrefix: 'Price:',
        priceValue: 'Free',
      },
      optimization: {
        tag: 'One-time project',
        title: 'AI Visibility Optimization',
        pricePrefix: 'from',
        ngnPrice: '₦150k',
        priceSeparator: '/',
        usdPrice: '$150',
        usdLabel: 'international',
      },
      description:
        'For a clearly defined improvement to your online presence. We agree the scope and price with you first. Websites and monthly management are priced by scope.',
      discussLinkLabel: 'Discuss a small project',
      discussLinkHref: '#quote',
    },
    dropdown: {
      triggerLabel: 'See packages and pricing',
      intro:
        'Examples for planning, not fixed packages or a quote. Your scope determines the final price.',
      problemLabel: 'Problem we solve',
      whatYouGetLabel: 'What you get',
      scopeLabel: 'Scope may include',
      packages: [
        {
          iconKey: 'search',
          name: 'AI Visibility Optimization',
          typeTag: 'One-time project',
          ngnPrice: '₦250k–₦500k',
          intlPrice: 'International clients: $500–$1,000',
          problem:
            'Your business details are inconsistent or hard for search and AI platforms to read.',
          whatYouGet:
            'Technical and local SEO, corrected business information, content improvements and before-and-after testing.',
          scopeItems: [
            'Technical and local SEO fixes',
            'Structured data where appropriate',
            'Baseline and follow-up AI search testing',
          ],
        },
        {
          iconKey: 'layout',
          name: 'Website + AI Visibility',
          typeTag: 'Fixed-scope project',
          ngnPrice: '₦500k–₦1.5m',
          intlPrice: 'International clients: $1,500–$4,000',
          problem:
            'You have no website, or one that is outdated and does not turn visitors into bookings or orders.',
          whatYouGet:
            'A custom responsive website with technical SEO foundations and a conversion-focused booking or ordering flow.',
          scopeItems: [
            'Responsive design, menu and location pages',
            'Analytics and indexing checks',
            'Initial AI visibility assessment',
          ],
        },
        {
          iconKey: 'trending',
          name: 'Visibility Growth Management',
          typeTag: 'Monthly',
          ngnPrice: '₦150k–₦350k / month',
          intlPrice: 'International clients: $300–$800 / month',
          problem:
            'Visibility and website quality slip when nobody looks after them.',
          whatYouGet:
            'Ongoing monitoring, content and local SEO upkeep, website support and a monthly report.',
          scopeItems: [
            'Monthly performance and AI search report',
            'Content and local SEO maintenance',
            'Website support hours',
          ],
        },
      ] satisfies PricingGuidancePackage[],
      note: 'Add-on modules such as online ordering, an admin dashboard or a chatbot are quoted separately. Nigerian and international clients receive separate quotes and contracts.',
    },
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
    cards: [
      {
        iconKey: 'fileText',
        title: 'Deliverables, listed one by one',
        description:
          'Every page, feature and integration is named in the scope, so nothing is assumed.',
      },
      {
        iconKey: 'checkCircle2',
        title: 'Acceptance criteria for each area of work',
        description:
          'Clear checks for the website, performance, SEO, analytics and conversion flows, agreed before we start.',
      },
      {
        iconKey: 'refreshCw',
        title: 'Revision limits',
        description:
          'The number of revision rounds is stated up front, so timelines and costs stay predictable.',
      },
      {
        iconKey: 'calendarClock',
        title: 'Timeline and what we need from you, and when',
        description:
          'Milestones with dates, plus the content, access and approvals we need from your team.',
      },
      {
        iconKey: 'ban',
        title: 'Exclusions',
        description:
          'What is not included is written down too, so there are no surprises later.',
      },
      {
        iconKey: 'keyRound',
        title: 'Ownership and handover terms',
        description:
          'Who owns what at handover, and the documentation you receive.',
      },
    ] satisfies SignedScopeCard[],
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
