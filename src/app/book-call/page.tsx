import type { Metadata } from 'next';
import { seoContent } from '@/content/seo';
import BookCallView from '@/views/BookCallView';

export const metadata: Metadata = {
  title: seoContent.pages.bookCall.title,
  description: seoContent.pages.bookCall.description,
  alternates: {
    canonical: seoContent.pages.bookCall.canonicalPath,
  },
  openGraph: {
    type: 'website',
    siteName: seoContent.siteName,
    locale: 'en',
    title: seoContent.pages.bookCall.title,
    description: seoContent.pages.bookCall.description,
    url: seoContent.pages.bookCall.canonicalPath,
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function BookCallPage() {
  return <BookCallView />;
}
