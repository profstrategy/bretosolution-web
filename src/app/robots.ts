import type { MetadataRoute } from 'next';
import { seoContent } from '@/content/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/'],
    },
    sitemap: `${seoContent.siteUrl}/sitemap.xml`,
  };
}
