'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formControlBaseClass } from '@/components/forms/FormField';
import { getLoginErrorMessage, loginErrorMessages } from '@/lib/auth/errors';
import { cn } from '@/lib/utils';

export interface LoginFormProps {
  /** Error code from the URL (?error=...), e.g. after a rejected Google sign-in. */
  initialErrorCode: string | null;
  /** Same-origin /admin path to land on after sign-in. */
  callbackUrl: string;
}

const focusRing =
  'focus-visible:outline-[3px] focus-visible:outline-[var(--accent)] focus-visible:outline-offset-[2px]';

export function LoginForm({ initialErrorCode, callbackUrl }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(() =>
    getLoginErrorMessage(initialErrorCode)
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl,
      });
      if (result?.ok && !result.error) {
        router.replace(callbackUrl);
        router.refresh();
        return;
      }
      setPassword('');
      setError(getLoginErrorMessage(result?.error ?? null) ?? loginErrorMessages.generic);
    } catch {
      setError(loginErrorMessages.generic);
    }
    setSubmitting(false);
  }

  async function handleGoogle() {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      // Redirects to Google; a rejected account comes back as ?error=AccessDenied.
      await signIn('google', { callbackUrl });
    } catch {
      setError(loginErrorMessages.generic);
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full">
      <div aria-live="assertive" className="min-h-0">
        {error ? (
          <p
            role="alert"
            className="mb-5 rounded-[10px] border border-[var(--line)] border-l-[4px] border-l-[var(--accent)] bg-[var(--bg)] px-4 py-3 font-[family-name:var(--font-sans)] text-[14px] leading-snug text-[var(--ink)]"
          >
            {error}
          </p>
        ) : null}
      </div>

      <form onSubmit={handleSubmit}>
        <fieldset disabled={submitting} className="flex flex-col gap-4 disabled:opacity-80">
          <div>
            <label
              htmlFor="admin-email"
              className="mb-1.5 block font-[family-name:var(--font-sans)] text-[14px] font-medium text-[var(--ink)]"
            >
              Email
            </label>
            <input
              id="admin-email"
              name="email"
              type="email"
              autoComplete="username"
              inputMode="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={cn(formControlBaseClass, focusRing)}
            />
          </div>

          <div>
            <label
              htmlFor="admin-password"
              className="mb-1.5 block font-[family-name:var(--font-sans)] text-[14px] font-medium text-[var(--ink)]"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="admin-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={cn(formControlBaseClass, focusRing, 'pr-[52px]')}
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
                aria-controls="admin-password"
                className={cn(
                  'absolute right-[2px] top-1/2 inline-flex h-[44px] w-[44px] -translate-y-1/2 cursor-pointer items-center justify-center rounded-[8px] text-[var(--muted)] transition-colors hover:text-[var(--ink)] motion-reduce:transition-none',
                  focusRing
                )}
              >
                {showPassword ? (
                  <EyeOff className="h-[18px] w-[18px]" aria-hidden="true" />
                ) : (
                  <Eye className="h-[18px] w-[18px]" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          <Button type="submit" className="mt-1 w-full">
            {submitting ? 'Signing in…' : 'Sign in'}
          </Button>
        </fieldset>
      </form>

      <div className="my-6 flex items-center gap-3" aria-hidden="true">
        <span className="h-px flex-1 bg-[var(--line)]" />
        <span className="font-[family-name:var(--font-sans)] text-[12px] font-semibold uppercase tracking-[0.09em] text-[var(--muted)]">
          or
        </span>
        <span className="h-px flex-1 bg-[var(--line)]" />
      </div>

      <Button
        variant="secondary"
        onClick={handleGoogle}
        disabled={submitting}
        className="w-full"
      >
        Continue with Google
      </Button>
    </div>
  );
}
