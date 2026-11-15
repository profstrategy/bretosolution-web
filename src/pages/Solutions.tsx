import { useEffect } from 'react';
import { SolutionsHero } from '@/components/sections/solutions/SolutionsHero';
import { AiSearchVisibilitySection } from '@/components/sections/solutions/AiSearchVisibilitySection';
import { WebsiteDevelopmentSection } from '@/components/sections/solutions/WebsiteDevelopmentSection';
import { OngoingGrowthSection } from '@/components/sections/solutions/OngoingGrowthSection';
import { AcceptanceCriteriaSection } from '@/components/sections/solutions/AcceptanceCriteriaSection';
import { SolutionsClosingCta } from '@/components/sections/solutions/SolutionsClosingCta';
import { solutionsContent } from '@/content/solutions';

export function Solutions() {
  useEffect(() => {
    try {
      document.title = solutionsContent.documentTitle;
    } catch {
      // Ignore document errors
    }
  }, []);

  return (
    <main id="main-content" tabIndex={-1} className="outline-none">
      <SolutionsHero />
      <AiSearchVisibilitySection />
      <WebsiteDevelopmentSection />
      <OngoingGrowthSection />
      <AcceptanceCriteriaSection />
      <SolutionsClosingCta />
    </main>
  );
}
