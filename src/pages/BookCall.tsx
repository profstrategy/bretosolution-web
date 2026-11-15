import { PlaceholderPageSection } from '@/components/sections/PlaceholderPageSection';
import { placeholdersContent } from '@/content/placeholders';

export function BookCall() {
  const { bookCall } = placeholdersContent;

  return (
    <main>
      <PlaceholderPageSection
        eyebrow={bookCall.eyebrow}
        heading={bookCall.heading}
        description={bookCall.description}
      />
    </main>
  );
}
