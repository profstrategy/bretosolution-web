import type { ReactNode, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface EyebrowProps extends HTMLAttributes<HTMLParagraphElement> {
  children: ReactNode;
}

export function Eyebrow({ children, className, ...rest }: EyebrowProps) {
  return (
    <p
      className={cn(
        'font-[family-name:var(--font-sans)] text-[12px] font-semibold uppercase tracking-[0.09em] text-[var(--accent)]',
        className
      )}
      {...rest}
    >
      {children}
    </p>
  );
}
