import type { ComponentType } from 'react';
import { site } from '@/content/site';
import { InstagramIcon, LinkedinIcon, type SocialIconProps } from '@/components/ui/SocialIcons';
import { cn } from '@/lib/utils';

type SocialId = (typeof site.social.links)[number]['id'];

const ICONS: Record<SocialId, ComponentType<SocialIconProps>> = {
  instagram: InstagramIcon,
  linkedin: LinkedinIcon,
};

/**
 * "Follow us on social media." with icon links to Bretosolution's profiles.
 * Used in the footer (every page) and at the end of the Terms and Privacy
 * pages. Links open in a new tab; each has a full accessible name.
 */
export function SocialLinks({ className, headingClassName }: { className?: string; headingClassName?: string }) {
  return (
    <div className={className}>
      <p
        className={cn(
          'font-[family-name:var(--font-sans)] text-[14px] text-[var(--muted)]',
          headingClassName
        )}
      >
        {site.social.heading}
      </p>
      <ul className="m-0 mt-2 flex list-none flex-wrap gap-2 p-0">
        {site.social.links.map((link) => {
          const Icon = ICONS[link.id];
          return (
            <li key={link.id}>
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${site.name} on ${link.label} (opens in a new tab)`}
                title={link.label}
                className="inline-flex h-[44px] w-[44px] items-center justify-center rounded-[10px] border border-[var(--line)] text-[var(--ink)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
              >
                <Icon size={20} />
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
