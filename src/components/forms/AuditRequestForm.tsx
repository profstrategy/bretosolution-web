import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/Button';
import { AppLink } from '@/components/ui/AppLink';
import {
  auditRequestSchema,
  type AuditRequestValues,
} from '@/schemas/audit';
import { submitAuditRequest } from '@/lib/api/audit';
import { auditFormContent } from '@/content/audit';
import { cn } from '@/lib/utils';

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

const inputBaseClass =
  'w-full min-h-[48px] rounded-[8px] border border-[var(--line)] bg-[var(--bg)] px-3.5 py-2.5 font-[family-name:var(--font-sans)] text-[16px] text-[var(--ink)] placeholder:text-[var(--muted)] transition-colors';

export function AuditRequestForm() {
  const copy = auditFormContent;
  const [status, setStatus] = useState<FormStatus>('idle');
  const [reference, setReference] = useState<string>('');

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors },
  } = useForm<AuditRequestValues>({
    resolver: zodResolver(auditRequestSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    shouldFocusError: true,
    defaultValues: {
      businessName: '',
      websiteOrInstagram: '',
      city: '',
      businessType: 'Restaurant',
      email: '',
      company_site: '',
    },
  });

  const onSubmit = async (values: AuditRequestValues) => {
    if (status === 'submitting') return;
    setStatus('submitting');
    try {
      const result = await submitAuditRequest(values);
      if (result.ok) {
        setReference(result.ref);
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  const handleReset = () => {
    reset();
    setReference('');
    setStatus('idle');
  };

  const handleRetry = () => {
    void onSubmit(getValues());
  };

  if (status === 'success') {
    return (
      <div
        role="status"
        aria-live="polite"
        className="rounded-[16px] border border-[var(--line)] bg-[var(--alt)] p-[clamp(20px,3vw,36px)] shadow-[0_18px_48px_var(--shadow)] space-y-5"
      >
        <h3 className="font-[family-name:var(--font-display)] text-[26px] font-semibold text-[var(--ink)]">
          {copy.successHeading}
        </h3>
        <div className="space-y-2">
          <p className="font-[family-name:var(--font-sans)] text-[16px] leading-relaxed text-[var(--muted)]">
            {copy.successBodyPrefix}{' '}
            <span className="font-[family-name:var(--font-mono)] font-medium text-[var(--ink)]">
              {reference}
            </span>
            . {copy.successBodySuffix}
          </p>
          <p className="font-[family-name:var(--font-sans)] text-[15px] leading-relaxed text-[var(--muted)]">
            {copy.preferToTalkPrefix}{' '}
            <AppLink
              href={copy.preferToTalkHref}
              className="font-semibold text-[var(--ink)] underline underline-offset-4 transition-colors hover:text-[var(--accent)]"
            >
              {copy.preferToTalkLinkLabel}
            </AppLink>
            .
          </p>
        </div>
        <div>
          <Button variant="secondary" onClick={handleReset}>
            {copy.sendAnotherLabel}
          </Button>
        </div>
      </div>
    );
  }

  const isSubmitting = status === 'submitting';

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="rounded-[16px] border border-[var(--line)] bg-[var(--alt)] p-[clamp(20px,3vw,36px)] shadow-[0_18px_48px_var(--shadow)] space-y-5"
    >
      {/* Hidden honeypot field */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-[9999px] h-0 w-0 overflow-hidden opacity-0"
      >
        <label htmlFor="audit-company-site">{copy.honeypotLabel}</label>
        <input
          id="audit-company-site"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          {...register('company_site')}
        />
      </div>

      {/* 1. Business name */}
      <div>
        <label
          htmlFor="audit-business-name"
          className="mb-1.5 block font-[family-name:var(--font-sans)] text-[14px] font-medium text-[var(--ink)]"
        >
          {copy.businessNameLabel}
        </label>
        <input
          id="audit-business-name"
          type="text"
          placeholder={copy.businessNamePlaceholder}
          aria-invalid={Boolean(errors.businessName)}
          aria-describedby={
            errors.businessName ? 'audit-business-name-error' : undefined
          }
          className={cn(
            inputBaseClass,
            errors.businessName && 'border-[var(--accent)]'
          )}
          {...register('businessName')}
        />
        {errors.businessName ? (
          <p
            id="audit-business-name-error"
            role="alert"
            className="mt-1.5 font-[family-name:var(--font-sans)] text-[13px] text-[var(--accent)]"
          >
            {errors.businessName.message}
          </p>
        ) : null}
      </div>

      {/* 2. Website or Instagram page */}
      <div>
        <label
          htmlFor="audit-website"
          className="mb-1.5 block font-[family-name:var(--font-sans)] text-[14px] font-medium text-[var(--ink)]"
        >
          {copy.websiteLabel}
        </label>
        <input
          id="audit-website"
          type="text"
          placeholder={copy.websitePlaceholder}
          aria-invalid={Boolean(errors.websiteOrInstagram)}
          aria-describedby={
            errors.websiteOrInstagram ? 'audit-website-error' : undefined
          }
          className={cn(
            inputBaseClass,
            errors.websiteOrInstagram && 'border-[var(--accent)]'
          )}
          {...register('websiteOrInstagram')}
        />
        {errors.websiteOrInstagram ? (
          <p
            id="audit-website-error"
            role="alert"
            className="mt-1.5 font-[family-name:var(--font-sans)] text-[13px] text-[var(--accent)]"
          >
            {errors.websiteOrInstagram.message}
          </p>
        ) : null}
      </div>

      {/* 3. City & 4. Business type (half-width on desktop, stacked on mobile) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="audit-city"
            className="mb-1.5 block font-[family-name:var(--font-sans)] text-[14px] font-medium text-[var(--ink)]"
          >
            {copy.cityLabel}
          </label>
          <input
            id="audit-city"
            type="text"
            placeholder={copy.cityPlaceholder}
            aria-invalid={Boolean(errors.city)}
            aria-describedby={errors.city ? 'audit-city-error' : undefined}
            className={cn(
              inputBaseClass,
              errors.city && 'border-[var(--accent)]'
            )}
            {...register('city')}
          />
          {errors.city ? (
            <p
              id="audit-city-error"
              role="alert"
              className="mt-1.5 font-[family-name:var(--font-sans)] text-[13px] text-[var(--accent)]"
            >
              {errors.city.message}
            </p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="audit-business-type"
            className="mb-1.5 block font-[family-name:var(--font-sans)] text-[14px] font-medium text-[var(--ink)]"
          >
            {copy.businessTypeLabel}
          </label>
          <select
            id="audit-business-type"
            aria-invalid={Boolean(errors.businessType)}
            aria-describedby={
              errors.businessType ? 'audit-business-type-error' : undefined
            }
            className={cn(
              inputBaseClass,
              errors.businessType && 'border-[var(--accent)]'
            )}
            {...register('businessType')}
          >
            {copy.businessTypes.map((typeOption) => (
              <option key={typeOption} value={typeOption}>
                {typeOption}
              </option>
            ))}
          </select>
          {errors.businessType ? (
            <p
              id="audit-business-type-error"
              role="alert"
              className="mt-1.5 font-[family-name:var(--font-sans)] text-[13px] text-[var(--accent)]"
            >
              {errors.businessType.message}
            </p>
          ) : null}
        </div>
      </div>

      {/* 5. Business email */}
      <div>
        <label
          htmlFor="audit-email"
          className="mb-1.5 block font-[family-name:var(--font-sans)] text-[14px] font-medium text-[var(--ink)]"
        >
          {copy.emailLabel}
        </label>
        <input
          id="audit-email"
          type="email"
          placeholder={copy.emailPlaceholder}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? 'audit-email-error' : undefined}
          className={cn(
            inputBaseClass,
            errors.email && 'border-[var(--accent)]'
          )}
          {...register('email')}
        />
        {errors.email ? (
          <p
            id="audit-email-error"
            role="alert"
            className="mt-1.5 font-[family-name:var(--font-sans)] text-[13px] text-[var(--accent)]"
          >
            {errors.email.message}
          </p>
        ) : null}
      </div>

      {/* Inline error state if submission fails */}
      {status === 'error' ? (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-[10px] border border-[var(--accent)] bg-[var(--bg)] p-3.5 text-[14px] text-[var(--accent)]"
        >
          <span>{copy.errorMessage}</span>
          <Button variant="small" type="button" onClick={handleRetry}>
            {copy.retryLabel}
          </Button>
        </div>
      ) : null}

      {/* Primary submit button */}
      <div className="pt-1">
        <Button
          variant="primary"
          type="submit"
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? copy.submitSending : copy.submitIdle}
        </Button>
      </div>

      {/* Privacy note */}
      <p className="font-[family-name:var(--font-sans)] text-[13px] leading-relaxed text-[var(--muted)]">
        {copy.privacyNote}
      </p>
    </form>
  );
}
