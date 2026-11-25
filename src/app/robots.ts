
import type { MetadataRoute } from 'next';
import { seoContent } from '@/content/seo';

/**
 * A crawler obeys only the most specific group that matches its user agent,
 * so `/admin` is disallowed in every group, not just `*`.
 */
const ADMIN_PATH = '/admin';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', ADMIN_PATH],
      },
      {
        userAgent: 'OAI-SearchBot',
        allow: '/',
        disallow: [ADMIN_PATH],
      },
      {
        userAgent: 'Claude-SearchBot',
        allow: '/',
        disallow: [ADMIN_PATH],
      },
      {
        userAgent: 'PerplexityBot',
        allow: '/',
        disallow: [ADMIN_PATH],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [ADMIN_PATH],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', ADMIN_PATH],
      },
      {
        userAgent: 'Google-Extended',
        allow: '/',
        disallow: [ADMIN_PATH],
      },
      {
        userAgent: 'GPTBot',
        allow: '/',
        disallow: [ADMIN_PATH],
      },
      {
        userAgent: 'ClaudeBot',
        allow: '/',
        disallow: [ADMIN_PATH],
      },
      {
        userAgent: 'Claude-User',
        allow: '/',
        disallow: [ADMIN_PATH],
      },
      {
        userAgent: 'ChatGPT-User',
        allow: '/',
        disallow: ['/api/', ADMIN_PATH],
      },
       {
        userAgent: 'OAI-AdsBot',
        allow: '/',
        disallow: ['/api/', ADMIN_PATH],
      },
      {
        userAgent: 'cohere-ai',
        allow: '/',
        disallow: ['/api/', ADMIN_PATH],
      },
       {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: ['/api/', ADMIN_PATH],
      }
    ],
    sitemap: `${seoContent.siteUrl}/sitemap.xml`,
  };
}
