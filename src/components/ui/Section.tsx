import type { ReactNode, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export type SectionTone = 'bg' | 'alt' | 'foot';

export interface SectionProps extends HTMLAttributes<HTMLElement> {
  tone?: SectionTone;
  id?: string;
  children: ReactNode;
}

const toneClasses: Record<SectionTone, string> = {
  bg: 'bg-[var(--bg)] text-[var(--ink)]',
  alt: 'bg-[var(--alt)] text-[var(--ink)]',
  foot: 'bg-[var(--foot)] text-[var(--ink)]',
};

export function Section({
  tone = 'bg',
  id,
  children,
  className,
  ...rest
}: SectionProps) {
  return (
    <section
      id={id}
      className={cn('py-[88px]', toneClasses[tone], className)}
      {...rest}
    >
      {children}
    </section>
  );
}
