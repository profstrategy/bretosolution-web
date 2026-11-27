/** Shared Tailwind classes for composer fields (site tokens, both themes). */

export const inputClass =
  'min-h-[44px] w-full rounded-[10px] border border-[var(--line)] bg-[var(--panel)] px-3 font-[family-name:var(--font-sans)] text-[16px] text-[var(--ink)] placeholder:text-[var(--muted)] outline-none transition-colors focus-visible:border-[var(--accent)] focus-visible:outline-[3px] focus-visible:outline-offset-[1px] focus-visible:outline-[var(--accent)] disabled:opacity-60 aria-[invalid=true]:border-[var(--accent)] motion-reduce:transition-none';

export const labelClass = 'font-[family-name:var(--font-sans)] text-[15px] font-semibold text-[var(--ink)]';

export const hintClass = 'mt-1 font-[family-name:var(--font-sans)] text-[13px] text-[var(--muted)]';

export const fieldErrorClass =
  'mt-1 font-[family-name:var(--font-sans)] text-[13px] font-semibold text-[var(--accent)]';
