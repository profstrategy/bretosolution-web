import type { Metadata } from 'next';
import { siteDescription } from '@/content/site';
import { solutionsContent } from '@/content/solutions';
import SolutionsView from '@/views/SolutionsView';

export const metadata: Metadata = {
  title: solutionsContent.documentTitle,
  description: siteDescription,
};

export default function SolutionsPage() {
  return <SolutionsView />;
}
