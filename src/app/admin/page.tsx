import type { Metadata } from 'next';
import { SignOutButton } from '@/components/admin/SignOutButton';
import { requireAdminPage } from '@/lib/auth/requireAdmin';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Admin',
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

/** Placeholder until Stage 3 adds the admin layout and dashboard. */
export default async function AdminHomePage() {
  const session = await requireAdminPage();

  return (
    <div className="flex min-h-[100svh] items-center justify-center bg-[var(--bg)] px-4 pt-[112px] pb-16">
      <div className="w-full max-w-[420px] rounded-[20px] border border-[var(--line)] bg-[var(--panel)] px-5 py-8 sm:px-8">
        <h1 className="font-[family-name:var(--font-display)] text-[30px] font-semibold text-[var(--ink)]">
          Admin
        </h1>
        <p className="mt-3 mb-6 break-words font-[family-name:var(--font-sans)] text-[15px] text-[var(--muted)]">
          Signed in as {session.email}
        </p>
        <SignOutButton />
      </div>
    </div>
  );
}
