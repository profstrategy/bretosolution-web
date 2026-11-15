import type { ReactNode, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Container({ children, className, ...rest }: ContainerProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full max-w-[1200px] px-[clamp(16px,4vw,48px)]',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
