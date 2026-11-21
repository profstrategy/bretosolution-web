import { assets } from '@/content/assets';

const defaultSiteUrl = 'https://bretosolution.com';
const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

export const siteUrl =
  (configuredSiteUrl || defaultSiteUrl).replace(/\/+$/, '') || defaultSiteUrl;

export const seoContent = {
  siteName: 'Bretosolution',
  siteUrl,
  logoPath: assets.bretoLogo.src,
  pages: {
    home: {
      title: 'AI Search Visibility',
      description:
        'We help businesses improve their visibility across search engines and AI-powered platforms.',
      canonicalPath: '/',
    },
    solutions: {
      title: 'How Guests Find and Choose a Restaurant',
      description:
        'Search visibility, a website that converts, and the monthly work that keeps both improving. Each service stands alone and works better together.',
      canonicalPath: '/solutions',
    },
    pricing: {
      title: 'Request a Quote',
      description:
        'Describe your restaurant and the problem you want solved. We reply with a scoped quote, not a generic package price.',
      canonicalPath: '/pricing',
    },
    audit: {
      title: 'Free AI Visibility Audit',
      description:
        'Tell us about your business. We review each request, run the tests described on our site and reply by email with what we find.',
      canonicalPath: '/audit',
    },
    bookCall: {
      title: 'Book an Audit Call',
      description:
        'Choose a time to talk about how your restaurant appears on Google and AI search, and where to start.',
      canonicalPath: '/book-call',
    },
    privacy: {
      title: 'Privacy Policy',
      description:
        'How Bretosolution collects and uses information submitted through this website.',
      canonicalPath: '/privacy',
    },
    terms: {
      title: 'Terms of Service',
      description:
        'Terms for using the Bretosolution website and requesting an audit or quote.',
      canonicalPath: '/terms',
    },
  },
} as const;
