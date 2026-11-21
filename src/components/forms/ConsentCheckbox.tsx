import type { UseFormRegisterReturn } from 'react-hook-form';
import { cn } from '@/lib/utils';

export interface ConsentCheckboxProps {
  id: string;
  name: string;
  label: string;
  error?: string;
  registration: UseFormRegisterReturn;
}

export function ConsentCheckbox({
  id,
  name,
  label,
  error,
  registration,
}: ConsentCheckboxProps) {
  const termsText = 'Terms of Service';
  const privacyText = 'Privacy Policy';

  const parts = label.split(
    new RegExp(`(${termsText}|${privacyText})`)
  );

  return (
    <div>
      <div className="flex min-h-[44px] items-start gap-3 rounded-[8px] py-1">
        <input
          {...registration}
          id={id}
          name={name}
          type="checkbox"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn(
            'mt-0.5 h-5 w-5 shrink-0 cursor-pointer rounded-[4px] border border-[var(--line)] bg-[var(--bg)] accent-[var(--accent)]',
            'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2',
            error && 'border-[var(--accent)]'
          )}
        />
        <label
          htmlFor={id}
          className="cursor-pointer font-[family-name:var(--font-sans)] text-[14px] leading-[1.6] text-[var(--ink)]"
        >
          {parts.map((part, index) => {
            if (part === termsText) {
              return (
                <a
                  key={`terms-${index}`}
                  href="/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(event) => event.stopPropagation()}
                  onMouseDown={(event) => event.stopPropagation()}
                  className="underline underline-offset-4 transition-colors hover:text-[var(--accent)]"
                >
                  {part}
                </a>
              );
            }
            if (part === privacyText) {
              return (
                <a
                  key={`privacy-${index}`}
                  href="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(event) => event.stopPropagation()}
                  onMouseDown={(event) => event.stopPropagation()}
                  className="underline underline-offset-4 transition-colors hover:text-[var(--accent)]"
                >
                  {part}
                </a>
              );
            }
            return <span key={`text-${index}`}>{part}</span>;
          })}
        </label>
      </div>
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
