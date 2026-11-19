import type { MetadataRoute } from 'next';
import { seoContent } from '@/content/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    seoContent.pages.home,
    seoContent.pages.solutions,
    seoContent.pages.pricing,
  ].map((page) => ({
    url: new URL(page.canonicalPath, seoContent.siteUrl).toString(),
  }));
}
