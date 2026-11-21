
import type { MetadataRoute } from 'next';
import { seoContent } from '@/content/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/'],
      },
      {
        userAgent: 'OAI-SearchBot',
        allow: '/',
      },
      {
        userAgent: 'Claude-SearchBot',
        allow: '/',
      },
      {
        userAgent: 'PerplexityBot',
        allow: '/',
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/'],
      },
      {
        userAgent: 'Google-Extended',
        allow: '/',
      },
      {
        userAgent: 'GPTBot',
        allow: '/',
      },
      {
        userAgent: 'ClaudeBot',
        allow: '/',
      },
      {
        userAgent: 'Claude-User',
        allow: '/',
      },
      {
        userAgent: 'ChatGPT-User',
        allow: '/',
        disallow: ['/api/'],
      },
       {
        userAgent: 'OAI-AdsBot',
        allow: '/',
        disallow: ['/api/'],
      },
      {
        userAgent: 'cohere-ai',
        allow: '/',
        disallow: ['/api/'],
      },
       {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: ['/api/'],
      }
    ],
    sitemap: `${seoContent.siteUrl}/sitemap.xml`,
  };
}
