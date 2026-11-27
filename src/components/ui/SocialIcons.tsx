import type { SVGProps } from 'react';

/**
 * Instagram and LinkedIn icons. lucide-react 1.x removed brand icons, so these
 * are Lucide's original drawings (ISC licence, lucide.dev) with Lucide's
 * defaults: 24×24 viewBox, 2px round stroke, currentColor. They take the same
 * `size` prop as lucide-react icons and are decorative (aria-hidden) by
 * default; the surrounding link carries the accessible name.
 */
export interface SocialIconProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

function SocialIcon({ size = 24, children, ...props }: SocialIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export function InstagramIcon(props: SocialIconProps) {
  return (
    <SocialIcon {...props}>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </SocialIcon>
  );
}

export function LinkedinIcon(props: SocialIconProps) {
  return (
    <SocialIcon {...props}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </SocialIcon>
  );
}
