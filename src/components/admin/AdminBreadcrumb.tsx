'use client';

import { Fragment } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { AppLink } from '@/components/ui/AppLink';
import { adminShellCopy } from '@/content/admin';
import { selectEmailById, selectInboxItemById, useDomainSelector } from '@/state';
import { cn } from '@/lib/utils';
import { resolveSubject } from '@/lib/admin/emailFormat';
import { ADMIN_ROOT_PATH } from '@/components/admin/paths';

interface Crumb {
  label: string;
  href: string;
}

function sectionLabel(segment: string): string {
  if (segment in adminShellCopy.sections) {
    return adminShellCopy.sections[segment as keyof typeof adminShellCopy.sections];
  }
  return segment.charAt(0).toUpperCase() + segment.slice(1);
}

/**
 * "Admin › Emails" and, while a detail panel is open (?open=<id>, or a
 * /admin/emails/<id> path), "Admin › Emails › <subject>". The subject comes
 * from the domain store.
 */
export function AdminBreadcrumb({ className }: { className?: string }) {
  const pathname = usePathname() ?? ADMIN_ROOT_PATH;
  const searchParams = useSearchParams();
  const [, , section, detailId] = pathname.split('/');
  const id = detailId ? decodeURIComponent(detailId) : (searchParams.get('open') ?? '');

  const email = useDomainSelector(selectEmailById(id));
  const inboxItem = useDomainSelector(selectInboxItemById(id));

  const crumbs: Crumb[] = [{ label: adminShellCopy.breadcrumbRoot, href: ADMIN_ROOT_PATH }];
  if (section) {
    crumbs.push({ label: sectionLabel(section), href: `${ADMIN_ROOT_PATH}/${section}` });
  }
  if (id) {
    const subject = (email ? resolveSubject(email) : '') || inboxItem?.subject || adminShellCopy.detailFallback;
    const query = searchParams.toString();
    crumbs.push({ label: subject, href: query ? `${pathname}?${query}` : pathname });
  }

  return (
    <nav aria-label="Breadcrumb" className={cn('min-w-0', className)}>
      <ol className="flex min-w-0 items-center gap-1.5 font-[family-name:var(--font-sans)] text-[14px]">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          return (
            <Fragment key={`${crumb.href}-${index}`}>
              <li className={cn('flex items-center gap-1.5', isLast ? 'min-w-0' : 'shrink-0')}>
                {index > 0 ? (
                  <span aria-hidden="true" className="shrink-0 text-[var(--muted)]">
                    ›
                  </span>
                ) : null}
                {isLast ? (
                  <span
                    aria-current="page"
                    title={crumb.label}
                    className="block truncate font-semibold text-[var(--ink)]"
                  >
                    {crumb.label}
                  </span>
                ) : (
                  <AppLink
                    href={crumb.href}
                    className="rounded-[6px] text-[var(--muted)] underline-offset-4 hover:text-[var(--ink)] hover:underline"
                  >
                    {crumb.label}
                  </AppLink>
                )}
              </li>
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
