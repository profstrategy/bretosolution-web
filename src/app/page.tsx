import type { Metadata } from 'next';
import { seoContent } from '@/content/seo';
import HomeView from '@/views/HomeView';

export const metadata: Metadata = {
  title: {
    absolute: `${seoContent.pages.home.title} | ${seoContent.siteName}`,
  },
  description: seoContent.pages.home.description,
  alternates: {
    canonical: seoContent.pages.home.canonicalPath,
  },
  openGraph: {
    type: 'website',
    siteName: seoContent.siteName,
    locale: 'en',
    title: seoContent.pages.home.title,
    description: seoContent.pages.home.description,
    url: seoContent.pages.home.canonicalPath,
  },
};

export default function HomePage() {
  return <HomeView />;
}
