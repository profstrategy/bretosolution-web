import { SolutionsHero } from '@/components/sections/solutions/SolutionsHero';
import { AiSearchVisibilitySection } from '@/components/sections/solutions/AiSearchVisibilitySection';
import { WebsiteDevelopmentSection } from '@/components/sections/solutions/WebsiteDevelopmentSection';
import { OngoingGrowthSection } from '@/components/sections/solutions/OngoingGrowthSection';
import { AcceptanceCriteriaSection } from '@/components/sections/solutions/AcceptanceCriteriaSection';
import { SolutionsClosingCta } from '@/components/sections/solutions/SolutionsClosingCta';

export function Solutions() {
  return (
    <main>
      <SolutionsHero />
      <AiSearchVisibilitySection />
      <WebsiteDevelopmentSection />
      <OngoingGrowthSection />
      <AcceptanceCriteriaSection />
      <SolutionsClosingCta />
    </main>
  );
}
