import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  FormField,
  formControlBaseClass,
} from '@/components/forms/FormField';
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
        className="space-y-5 rounded-[16px] border border-[var(--line)] bg-[var(--alt)] p-[clamp(20px,3vw,36px)] shadow-[0_18px_48px_var(--shadow)]"
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
          <Button variant="secondary" type="button" onClick={handleReset}>
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
      className="space-y-5 rounded-[16px] border border-[var(--line)] bg-[var(--alt)] p-[clamp(20px,3vw,36px)] shadow-[0_18px_48px_var(--shadow)]"
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
      <FormField
        id="audit-business-name"
        label={copy.businessNameLabel}
        error={errors.businessName?.message}
      >
        <input
          id="audit-business-name"
          type="text"
          placeholder={copy.businessNamePlaceholder}
          aria-invalid={Boolean(errors.businessName)}
          aria-describedby={
            errors.businessName ? 'audit-business-name-error' : undefined
          }
          className={cn(
            formControlBaseClass,
            errors.businessName && 'border-[var(--accent)]'
          )}
          {...register('businessName')}
        />
      </FormField>

      {/* 2. Website or Instagram page */}
      <FormField
        id="audit-website"
        label={copy.websiteLabel}
        error={errors.websiteOrInstagram?.message}
      >
        <input
          id="audit-website"
          type="text"
          placeholder={copy.websitePlaceholder}
          aria-invalid={Boolean(errors.websiteOrInstagram)}
          aria-describedby={
            errors.websiteOrInstagram ? 'audit-website-error' : undefined
          }
          className={cn(
            formControlBaseClass,
            errors.websiteOrInstagram && 'border-[var(--accent)]'
          )}
          {...register('websiteOrInstagram')}
        />
      </FormField>

      {/* 3. City & 4. Business type */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField
          id="audit-city"
          label={copy.cityLabel}
          error={errors.city?.message}
        >
          <input
            id="audit-city"
            type="text"
            placeholder={copy.cityPlaceholder}
            aria-invalid={Boolean(errors.city)}
            aria-describedby={errors.city ? 'audit-city-error' : undefined}
            className={cn(
              formControlBaseClass,
              errors.city && 'border-[var(--accent)]'
            )}
            {...register('city')}
          />
        </FormField>

        <FormField
          id="audit-business-type"
          label={copy.businessTypeLabel}
          error={errors.businessType?.message}
        >
          <select
            id="audit-business-type"
            aria-invalid={Boolean(errors.businessType)}
            aria-describedby={
              errors.businessType ? 'audit-business-type-error' : undefined
            }
            className={cn(
              formControlBaseClass,
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
        </FormField>
      </div>

      {/* 5. Business email */}
      <FormField
        id="audit-email"
        label={copy.emailLabel}
        error={errors.email?.message}
      >
        <input
          id="audit-email"
          type="email"
          placeholder={copy.emailPlaceholder}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? 'audit-email-error' : undefined}
          className={cn(
            formControlBaseClass,
            errors.email && 'border-[var(--accent)]'
          )}
          {...register('email')}
        />
      </FormField>

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

      {/* Privacy / consent note */}
      <p className="font-[family-name:var(--font-sans)] text-[13px] leading-relaxed text-[var(--muted)]">
        {copy.privacyNote}
      </p>
    </form>
  );
}
