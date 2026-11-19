import type { Metadata } from 'next';
import { homeContent } from '@/content/home';
import { siteDescription } from '@/content/site';
import HomeView from '@/views/HomeView';

export const metadata: Metadata = {
  title: homeContent.documentTitle,
  description: siteDescription,
};

export default function HomePage() {
  return <HomeView />;
}
