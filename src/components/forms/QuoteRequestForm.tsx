"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight } from 'lucide-react';
import {
  FormField,
  formControlBaseClass,
  formTextareaBaseClass,
} from '@/components/forms/FormField';
import { Button } from '@/components/ui/Button';
import { pricingContent } from '@/content/pricing';
import { submitQuoteRequest } from '@/lib/api/quote';
import { cn } from '@/lib/utils';
import {
  quoteRequestSchema,
  type QuoteRequestValues,
} from '@/schemas/quote';

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

const STEP_1_FIELDS: Array<keyof QuoteRequestValues> = [
  'businessType',
  'helpNeeded',
  'mainChallenge',
];

export function QuoteRequestForm() {
  const copy = pricingContent.quoteForm;
  const [step, setStep] = useState<1 | 2>(1);
  const [status, setStatus] = useState<FormStatus>('idle');
  const [reference, setReference] = useState<string>('');

  const {
    register,
    handleSubmit,
    trigger,
    setFocus,
    reset,
    getValues,
    formState: { errors },
  } = useForm<QuoteRequestValues>({
    resolver: zodResolver(quoteRequestSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    shouldFocusError: true,
    defaultValues: {
      businessType: '',
      helpNeeded: '',
      mainChallenge: '',
      contactName: '',
      businessName: '',
      email: '',
      phoneOrWhatsapp: '',
      websiteOrInstagram: '',
      countryRegion: '',
      company_site: '',
    },
  });

  const handleContinueToStep2 = async () => {
    const isValid = await trigger(STEP_1_FIELDS);
    if (!isValid) {
      const currentValues = getValues();
      if (!currentValues.businessType) {
        setFocus('businessType');
      } else if (!currentValues.helpNeeded) {
        setFocus('helpNeeded');
      } else {
        setFocus('mainChallenge');
      }
      return;
    }
    setStep(2);
  };

  const onSubmit = async (values: QuoteRequestValues) => {
    if (status === 'submitting') return;
    setStatus('submitting');
    try {
      const result = await submitQuoteRequest(values);
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
    setStep(1);
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
        <h2 className="font-[family-name:var(--font-display)] text-[26px] font-semibold text-[var(--ink)]">
          {copy.successHeading}
        </h2>
        <p className="font-[family-name:var(--font-sans)] text-[16px] leading-relaxed text-[var(--muted)]">
          {copy.successBodyPrefix}{' '}
          <span className="font-[family-name:var(--font-mono)] font-medium text-[var(--ink)]">
            {reference}
          </span>
          . {copy.successBodySuffix}
        </p>
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
      id="quote-form"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="scroll-mt-[96px] space-y-5 rounded-[16px] border border-[var(--line)] bg-[var(--alt)] p-[clamp(20px,3vw,36px)] shadow-[0_18px_48px_var(--shadow)]"
    >
      {/* Hidden honeypot field */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-[9999px] h-0 w-0 overflow-hidden opacity-0"
      >
        <label htmlFor="quote-company-site">{copy.honeypotLabel}</label>
        <input
          id="quote-company-site"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          {...register('company_site')}
        />
      </div>

      {/* Step header & two-segment progress bar */}
      <div className="space-y-3">
        <p className="font-[family-name:var(--font-sans)] text-[13px] text-[var(--muted)]">
          {step === 1 ? copy.step1Badge : copy.step2Badge}
        </p>
        <h2 className="font-[family-name:var(--font-display)] text-[26px] font-semibold leading-[1.2] text-[var(--ink)]">
          {step === 1 ? copy.step1Title : copy.step2Title}
        </h2>
        <div
          aria-hidden="true"
          className="grid grid-cols-2 gap-1.5 pt-1"
        >
          <span className="h-[3px] w-full rounded-full bg-[var(--accent)]" />
          <span
            className={cn(
              'h-[3px] w-full rounded-full transition-colors',
              step === 2 ? 'bg-[var(--accent)]' : 'bg-[var(--line)]'
            )}
          />
        </div>
      </div>

      <p className="font-[family-name:var(--font-sans)] text-[12px] text-[var(--muted)]">
        {copy.requiredNote}
      </p>

      {/* STEP 1 FIELDS */}
      <div className={cn('space-y-5', step !== 1 && 'hidden')}>
        <FormField
          id="quote-business-type"
          label={copy.businessTypeLabel}
          error={errors.businessType?.message}
        >
          <select
            id="quote-business-type"
            aria-invalid={Boolean(errors.businessType)}
            aria-describedby={
              errors.businessType ? 'quote-business-type-error' : undefined
            }
            className={cn(
              formControlBaseClass,
              errors.businessType && 'border-[var(--accent)]'
            )}
            {...register('businessType')}
          >
            <option value="">{copy.businessTypePlaceholder}</option>
            {copy.businessTypeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </FormField>

        <FormField
          id="quote-help-needed"
          label={copy.helpNeededLabel}
          error={errors.helpNeeded?.message}
        >
          <select
            id="quote-help-needed"
            aria-invalid={Boolean(errors.helpNeeded)}
            aria-describedby={
              errors.helpNeeded ? 'quote-help-needed-error' : undefined
            }
            className={cn(
              formControlBaseClass,
              errors.helpNeeded && 'border-[var(--accent)]'
            )}
            {...register('helpNeeded')}
          >
            <option value="">{copy.helpNeededPlaceholder}</option>
            {copy.helpNeededOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </FormField>

        <FormField
          id="quote-main-challenge"
          label={copy.mainChallengeLabel}
          optionalSuffix={copy.mainChallengeOptionalSuffix}
          hint={copy.mainChallengeHint}
          error={errors.mainChallenge?.message}
        >
          <textarea
            id="quote-main-challenge"
            rows={4}
            aria-invalid={Boolean(errors.mainChallenge)}
            aria-describedby={
              errors.mainChallenge
                ? 'quote-main-challenge-hint quote-main-challenge-error'
                : 'quote-main-challenge-hint'
            }
            className={cn(
              formTextareaBaseClass,
              errors.mainChallenge && 'border-[var(--accent)]'
            )}
            {...register('mainChallenge')}
          />
        </FormField>

        <div className="pt-1">
          <Button
            variant="primary"
            type="button"
            onClick={() => void handleContinueToStep2()}
            className="flex w-full items-center justify-between"
          >
            <span>{copy.continueButtonLabel}</span>
            <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
          </Button>
        </div>
      </div>

      {/* STEP 2 FIELDS */}
      <div className={cn('space-y-5', step !== 2 && 'hidden')}>
        <FormField
          id="quote-contact-name"
          label={copy.contactNameLabel}
          error={errors.contactName?.message}
        >
          <input
            id="quote-contact-name"
            type="text"
            placeholder={copy.contactNamePlaceholder}
            aria-invalid={Boolean(errors.contactName)}
            aria-describedby={
              errors.contactName ? 'quote-contact-name-error' : undefined
            }
            className={cn(
              formControlBaseClass,
              errors.contactName && 'border-[var(--accent)]'
            )}
            {...register('contactName')}
          />
        </FormField>

        <FormField
          id="quote-business-name"
          label={copy.businessNameLabel}
          error={errors.businessName?.message}
        >
          <input
            id="quote-business-name"
            type="text"
            placeholder={copy.businessNamePlaceholder}
            aria-invalid={Boolean(errors.businessName)}
            aria-describedby={
              errors.businessName ? 'quote-business-name-error' : undefined
            }
            className={cn(
              formControlBaseClass,
              errors.businessName && 'border-[var(--accent)]'
            )}
            {...register('businessName')}
          />
        </FormField>

        <FormField
          id="quote-email"
          label={copy.emailLabel}
          error={errors.email?.message}
        >
          <input
            id="quote-email"
            type="email"
            placeholder={copy.emailPlaceholder}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'quote-email-error' : undefined}
            className={cn(
              formControlBaseClass,
              errors.email && 'border-[var(--accent)]'
            )}
            {...register('email')}
          />
        </FormField>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            id="quote-phone"
            label={copy.phoneLabel}
            optionalSuffix={copy.phoneOptionalSuffix}
            error={errors.phoneOrWhatsapp?.message}
          >
            <input
              id="quote-phone"
              type="tel"
              placeholder={copy.phonePlaceholder}
              aria-invalid={Boolean(errors.phoneOrWhatsapp)}
              aria-describedby={
                errors.phoneOrWhatsapp ? 'quote-phone-error' : undefined
              }
              className={cn(
                formControlBaseClass,
                errors.phoneOrWhatsapp && 'border-[var(--accent)]'
              )}
              {...register('phoneOrWhatsapp')}
            />
          </FormField>

          <FormField
            id="quote-website"
            label={copy.websiteLabel}
            optionalSuffix={copy.websiteOptionalSuffix}
            error={errors.websiteOrInstagram?.message}
          >
            <input
              id="quote-website"
              type="text"
              placeholder={copy.websitePlaceholder}
              aria-invalid={Boolean(errors.websiteOrInstagram)}
              aria-describedby={
                errors.websiteOrInstagram ? 'quote-website-error' : undefined
              }
              className={cn(
                formControlBaseClass,
                errors.websiteOrInstagram && 'border-[var(--accent)]'
              )}
              {...register('websiteOrInstagram')}
            />
          </FormField>
        </div>

        <FormField
          id="quote-country-region"
          label={copy.countryRegionLabel}
          error={errors.countryRegion?.message}
        >
          <select
            id="quote-country-region"
            aria-invalid={Boolean(errors.countryRegion)}
            aria-describedby={
              errors.countryRegion ? 'quote-country-region-error' : undefined
            }
            className={cn(
              formControlBaseClass,
              errors.countryRegion && 'border-[var(--accent)]'
            )}
            {...register('countryRegion')}
          >
            <option value="">{copy.countryRegionPlaceholder}</option>
            {copy.countryRegionOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </FormField>

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

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <Button
            variant="secondary"
            type="button"
            disabled={isSubmitting}
            onClick={() => setStep(1)}
            className="flex-1 sm:flex-none"
          >
            {copy.backButtonLabel}
          </Button>
          <Button
            variant="primary"
            type="submit"
            disabled={isSubmitting}
            className="flex-[2_1_180px]"
          >
            {isSubmitting ? copy.submitSendingLabel : copy.submitIdleLabel}
          </Button>
        </div>

        <p className="font-[family-name:var(--font-sans)] text-[13px] leading-relaxed text-[var(--muted)]">
          {copy.consentNote}
        </p>
      </div>
    </form>
  );
}
