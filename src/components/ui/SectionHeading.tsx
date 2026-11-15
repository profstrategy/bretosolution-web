import type { ReactNode, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface SectionHeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode;
  script?: string;
  align?: 'left' | 'center';
}

export function SectionHeading({
  children,
  script,
  align = 'left',
  className,
  ...rest
}: SectionHeadingProps) {
  return (
    <h2
      className={cn(
        'font-[family-name:var(--font-display)] font-semibold text-[clamp(30px,3.4vw,46px)] leading-[1.12] [text-wrap:balance] text-[var(--ink)]',
        align === 'center' ? 'text-center mx-auto' : 'text-left',
        className
      )}
      {...rest}
    >
      <span>{children}</span>
      {script ? (
        <span className="block font-[family-name:var(--font-script)] font-normal text-[var(--accent)] text-[1.3em] leading-[1.15] mt-1">
          {script}
        </span>
      ) : null}
    </h2>
  );
}
