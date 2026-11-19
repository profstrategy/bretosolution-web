import type { Metadata } from 'next';
import { bookCallContent } from '@/content/bookCall';
import { siteDescription } from '@/content/site';
import BookCallView from '@/views/BookCallView';

export const metadata: Metadata = {
  title: bookCallContent.documentTitle,
  description: siteDescription,
};

export default function BookCallPage() {
  return <BookCallView />;
}
