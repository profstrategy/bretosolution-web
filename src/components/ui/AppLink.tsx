import type { AnchorHTMLAttributes, ReactNode } from 'react';
import Link from 'next/link';

export interface AppLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: ReactNode;
}

export function AppLink({ href, children, onClick, ...rest }: AppLinkProps) {
  const isExternalOrAnchor =
    /^(https?:\/\/|\/\/|mailto:|tel:|#)/i.test(href);

  if (isExternalOrAnchor) {
    return (
      <a href={href} onClick={onClick} {...rest}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} onClick={onClick} {...rest}>
      {children}
    </Link>
  );
}
