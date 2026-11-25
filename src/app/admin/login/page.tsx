import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { LoginForm } from '@/components/admin/LoginForm';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { getAdminSession } from '@/lib/auth/requireAdmin';
import { site } from '@/content/site';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Admin sign in',
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

const DEFAULT_CALLBACK = '/admin';

/** Accept only same-origin /admin paths (no protocol-relative or external URLs). */
function safeCallbackUrl(value: string | string[] | undefined): string {
  if (typeof value !== 'string') return DEFAULT_CALLBACK;
  if (!value.startsWith('/admin') || value.startsWith('/admin/login')) return DEFAULT_CALLBACK;
  if (value.startsWith('//') || value.includes('\\')) return DEFAULT_CALLBACK;
  return value;
}

interface AdminLoginPageProps {
  searchParams: Promise<{ error?: string | string[]; callbackUrl?: string | string[] }>;
}

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  if (await getAdminSession()) redirect(DEFAULT_CALLBACK);

  const params = await searchParams;
  const errorCode = typeof params.error === 'string' ? params.error : null;
  const callbackUrl = safeCallbackUrl(params.callbackUrl);

  return (
    <div className="flex min-h-[100svh] items-center justify-center bg-[var(--bg)] px-4 pt-[112px] pb-16">
      <div className="w-full max-w-[420px] rounded-[20px] border border-[var(--line)] bg-[var(--panel)] px-5 py-8 shadow-[0_12px_40px_var(--shadow)] sm:px-8">
        <p className="font-[family-name:var(--font-display)] text-[21px] font-semibold tracking-[0.08em] text-[var(--ink)]">
          {site.wordmark}
        </p>
        <Eyebrow className="mt-1">Admin</Eyebrow>
        <h1 className="mt-4 mb-6 font-[family-name:var(--font-display)] text-[30px] font-semibold leading-[1.15] text-[var(--ink)]">
          Admin sign in
        </h1>
        <LoginForm initialErrorCode={errorCode} callbackUrl={callbackUrl} />
      </div>
    </div>
  );
}
