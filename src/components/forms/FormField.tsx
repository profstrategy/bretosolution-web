import type { ReactNode } from 'react';

export const formControlBaseClass =
  'w-full min-h-[48px] rounded-[8px] border border-[var(--line)] bg-[var(--bg)] px-3.5 py-2.5 font-[family-name:var(--font-sans)] text-[16px] text-[var(--ink)] placeholder:text-[var(--muted)] transition-colors';

export const formTextareaBaseClass =
  'w-full rounded-[8px] border border-[var(--line)] bg-[var(--bg)] px-3.5 py-2.5 font-[family-name:var(--font-sans)] text-[16px] text-[var(--ink)] placeholder:text-[var(--muted)] transition-colors';

export interface FormFieldProps {
  id: string;
  label: string;
  optionalSuffix?: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}

export function FormField({
  id,
  label,
  optionalSuffix,
  hint,
  error,
  children,
}: FormFieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block font-[family-name:var(--font-sans)] text-[14px] font-medium text-[var(--ink)]"
      >
        <span>{label}</span>
        {optionalSuffix ? (
          <span className="ml-1 font-normal text-[var(--muted)]">
            {optionalSuffix}
          </span>
        ) : null}
      </label>

      {children}

      {hint ? (
        <p
          id={`${id}-hint`}
          className="mt-1.5 font-[family-name:var(--font-sans)] text-[12px] leading-relaxed text-[var(--muted)]"
        >
          {hint}
        </p>
      ) : null}

      {error ? (
        <p
          id={`${id}-error`}
          role="alert"
          className="mt-1.5 font-[family-name:var(--font-sans)] text-[13px] text-[var(--accent)]"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
