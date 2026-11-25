'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/lib/theme';
import { site } from '@/content/site';

/**
 * Same behaviour, storage key (`breto-theme`) and labels as the public
 * header's toggle, via the shared `useTheme()` hook.
 */
export function ThemeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === 'light' ? site.header.switchToDarkLabel : site.header.switchToLightLabel}
      className="inline-flex h-[44px] w-[44px] min-h-[44px] min-w-[44px] shrink-0 cursor-pointer items-center justify-center rounded-[10px] border border-[var(--pillline)] bg-transparent text-[var(--ink)] transition-colors hover:bg-[var(--btn2)]"
    >
      {theme === 'light' ? (
        <Moon className="h-[18px] w-[18px]" aria-hidden="true" />
      ) : (
        <Sun className="h-[18px] w-[18px]" aria-hidden="true" />
      )}
    </button>
  );
}
