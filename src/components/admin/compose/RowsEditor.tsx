'use client';

import { Plus, X } from 'lucide-react';
import { adminComposerCopy as copy } from '@/content/admin';
import { MAX_ROW_LABEL, MAX_ROW_VALUE, MAX_ROWS } from '@/schemas/adminEmail';
import { cn } from '@/lib/utils';
import { newRow, type FieldErrors, type RowValue } from './composeForm';
import { fieldErrorClass, inputClass } from './fieldStyles';

interface RowsEditorProps {
  rows: RowValue[];
  errors: FieldErrors;
  disabled: boolean;
  onChange: (rows: RowValue[]) => void;
  register: (key: string) => (node: HTMLElement | null) => void;
  idPrefix: string;
}

/** "At a glance" rows for a quote: label + value, up to 8. */
export function RowsEditor({ rows, errors, disabled, onChange, register, idPrefix }: RowsEditorProps) {
  const update = (key: string, field: 'label' | 'value', value: string) =>
    onChange(rows.map((row) => (row.key === key ? { ...row, [field]: value } : row)));
  const remove = (key: string) => onChange(rows.filter((row) => row.key !== key));
  const groupError = errors.rows;

  return (
    <fieldset className="min-w-0">
      <legend className="font-[family-name:var(--font-sans)] text-[15px] font-semibold text-[var(--ink)]">
        {copy.rows} <span className="font-normal text-[var(--muted)]">({copy.optional})</span>
      </legend>
      <p className="mt-1 font-[family-name:var(--font-sans)] text-[13px] text-[var(--muted)]">{copy.rowsHint}</p>

      {rows.length > 0 ? (
        <ol className="mt-3 flex flex-col gap-3">
          {rows.map((row, index) => {
            const n = index + 1;
            const labelKey = `rows.${index}.label`;
            const valueKey = `rows.${index}.value`;
            const labelError = errors[labelKey];
            const valueError = errors[valueKey];
            return (
              <li key={row.key} className="flex items-start gap-2">
                <div className="grid min-w-0 flex-1 grid-cols-1 gap-2 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
                  <div className="min-w-0">
                    <label htmlFor={`${idPrefix}-${row.key}-label`} className="sr-only">
                      {copy.rowLabelFor(n)}
                    </label>
                    <input
                      ref={register(labelKey)}
                      id={`${idPrefix}-${row.key}-label`}
                      value={row.label}
                      maxLength={MAX_ROW_LABEL}
                      placeholder={copy.rowLabel}
                      disabled={disabled}
                      aria-invalid={labelError ? true : undefined}
                      aria-describedby={labelError ? `${idPrefix}-${row.key}-label-error` : undefined}
                      onChange={(event) => update(row.key, 'label', event.target.value)}
                      className={inputClass}
                    />
                    {labelError ? (
                      <p id={`${idPrefix}-${row.key}-label-error`} className={fieldErrorClass}>
                        {labelError}
                      </p>
                    ) : null}
                  </div>
                  <div className="min-w-0">
                    <label htmlFor={`${idPrefix}-${row.key}-value`} className="sr-only">
                      {copy.rowValueFor(n)}
                    </label>
                    <input
                      ref={register(valueKey)}
                      id={`${idPrefix}-${row.key}-value`}
                      value={row.value}
                      maxLength={MAX_ROW_VALUE}
                      placeholder={copy.rowValue}
                      disabled={disabled}
                      aria-invalid={valueError ? true : undefined}
                      aria-describedby={valueError ? `${idPrefix}-${row.key}-value-error` : undefined}
                      onChange={(event) => update(row.key, 'value', event.target.value)}
                      className={inputClass}
                    />
                    {valueError ? (
                      <p id={`${idPrefix}-${row.key}-value-error`} className={fieldErrorClass}>
                        {valueError}
                      </p>
                    ) : null}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => remove(row.key)}
                  disabled={disabled}
                  aria-label={copy.removeRowLabel(n)}
                  className="inline-flex h-[44px] w-[44px] shrink-0 cursor-pointer items-center justify-center rounded-[10px] text-[var(--muted)] hover:bg-[var(--btn2)] hover:text-[var(--ink)] focus-visible:outline-[3px] focus-visible:outline-offset-[2px] focus-visible:outline-[var(--accent)] disabled:opacity-40"
                >
                  <X className="h-[18px] w-[18px]" aria-hidden="true" />
                </button>
              </li>
            );
          })}
        </ol>
      ) : null}

      {groupError ? <p className={fieldErrorClass}>{groupError}</p> : null}

      <button
        ref={register('rows')}
        type="button"
        onClick={() => onChange([...rows, newRow()])}
        disabled={disabled || rows.length >= MAX_ROWS}
        className={cn(
          'mt-3 inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-[10px] border border-dashed border-[var(--line)] px-4 font-[family-name:var(--font-sans)] text-[15px] font-semibold text-[var(--ink)] hover:bg-[var(--btn2)] focus-visible:outline-[3px] focus-visible:outline-offset-[2px] focus-visible:outline-[var(--accent)] disabled:cursor-default disabled:opacity-40'
        )}
      >
        <Plus className="h-[18px] w-[18px]" aria-hidden="true" />
        {copy.addRow}
        <span className="font-normal text-[var(--muted)]">
          ({rows.length}/{MAX_ROWS})
        </span>
      </button>
    </fieldset>
  );
}
