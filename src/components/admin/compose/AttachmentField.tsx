'use client';

import { useRef, useState, type DragEvent } from 'react';
import { FileText, Upload, X } from 'lucide-react';
import { adminComposerCopy as copy } from '@/content/admin';
import { formatFileSize } from '@/lib/admin/emailFormat';
import { cn } from '@/lib/utils';
import type { AttachmentValue } from './composeForm';
import { fieldErrorClass, hintClass, labelClass } from './fieldStyles';

export interface UploadProgress {
  name: string;
  size: number;
  /** 0..1 */
  fraction: number;
}

interface AttachmentFieldProps {
  id: string;
  attachment: AttachmentValue | null;
  upload: UploadProgress | null;
  required: boolean;
  error?: string;
  disabled: boolean;
  onFiles: (files: File[]) => void;
  onRemove: () => void;
  register: (node: HTMLElement | null) => void;
}

/** PDF picker: drag-and-drop zone plus a "Choose PDF" button (keyboard path). */
export function AttachmentField({
  id,
  attachment,
  upload,
  required,
  error,
  disabled,
  onFiles,
  onRemove,
  register,
}: AttachmentFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const labelId = `${id}-label`;
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [hintId, error ? errorId : null].filter(Boolean).join(' ');

  const onDragOver = (event: DragEvent<HTMLDivElement>) => {
    if (disabled || upload) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
    if (!dragging) setDragging(true);
  };
  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    if (disabled || upload) return;
    onFiles(Array.from(event.dataTransfer.files));
  };

  const percent = upload ? Math.round(upload.fraction * 100) : 0;

  return (
    <div role="group" aria-labelledby={labelId} aria-describedby={describedBy}>
      <p id={labelId} className={labelClass}>
        {copy.pdf}{' '}
        <span className="font-normal text-[var(--muted)]">
          ({required ? copy.pdfRequired : copy.pdfOptional})
        </span>
      </p>

      {upload ? (
        <div className="mt-2 rounded-[12px] border border-[var(--line)] bg-[var(--bg)] p-4">
          <div className="flex items-center gap-3">
            <FileText className="h-[20px] w-[20px] shrink-0 text-[var(--muted)]" aria-hidden="true" />
            <span className="min-w-0 flex-1 truncate font-[family-name:var(--font-sans)] text-[15px] text-[var(--ink)]">
              {upload.name}
            </span>
            <button
              type="button"
              onClick={onRemove}
              aria-label={copy.removePdfLabel(upload.name)}
              className="inline-flex h-[44px] w-[44px] shrink-0 cursor-pointer items-center justify-center rounded-[10px] text-[var(--muted)] hover:bg-[var(--btn2)] hover:text-[var(--ink)] focus-visible:outline-[3px] focus-visible:outline-offset-[2px] focus-visible:outline-[var(--accent)]"
            >
              <X className="h-[18px] w-[18px]" aria-hidden="true" />
            </button>
          </div>
          <div
            role="progressbar"
            aria-label={copy.uploading(percent)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
            className="mt-3 h-[6px] overflow-hidden rounded-full bg-[var(--btn2)]"
          >
            <div
              className="h-full rounded-full bg-[var(--accent)] transition-[width] motion-reduce:transition-none"
              style={{ width: `${percent}%` }}
            />
          </div>
          <p className="mt-2 font-[family-name:var(--font-mono)] text-[12px] text-[var(--muted)]" aria-live="polite">
            {copy.uploading(percent)}
          </p>
        </div>
      ) : attachment ? (
        <div className="mt-2 flex items-center gap-3 rounded-[12px] border border-[var(--line)] bg-[var(--bg)] py-2 pl-4 pr-2">
          <FileText className="h-[20px] w-[20px] shrink-0 text-[var(--accent)]" aria-hidden="true" />
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="truncate font-[family-name:var(--font-sans)] text-[15px] font-semibold text-[var(--ink)]">
              {attachment.name}
            </span>
            <span className="font-[family-name:var(--font-mono)] text-[12px] text-[var(--muted)]">
              {formatFileSize(attachment.size)}
            </span>
          </span>
          <button
            ref={register}
            type="button"
            onClick={onRemove}
            disabled={disabled}
            aria-label={copy.removePdfLabel(attachment.name)}
            className="inline-flex min-h-[44px] shrink-0 cursor-pointer items-center gap-1 rounded-[10px] px-3 font-[family-name:var(--font-sans)] text-[15px] font-semibold text-[var(--ink)] hover:bg-[var(--btn2)] focus-visible:outline-[3px] focus-visible:outline-offset-[2px] focus-visible:outline-[var(--accent)] disabled:opacity-40"
          >
            <X className="h-[16px] w-[16px]" aria-hidden="true" />
            {copy.removePdf}
          </button>
        </div>
      ) : (
        <div
          onDragOver={onDragOver}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={cn(
            'mt-2 flex flex-col items-center gap-3 rounded-[12px] border-[1.5px] border-dashed px-4 py-6 text-center transition-colors motion-reduce:transition-none sm:flex-row sm:justify-center sm:text-left',
            dragging ? 'border-[var(--accent)] bg-[var(--btn2)]' : error ? 'border-[var(--accent)]' : 'border-[var(--line)]'
          )}
        >
          <Upload className="h-[22px] w-[22px] shrink-0 text-[var(--muted)]" aria-hidden="true" />
          <span className="font-[family-name:var(--font-sans)] text-[15px] text-[var(--muted)]">{copy.dropHint}</span>
          <button
            ref={register}
            type="button"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
            aria-describedby={describedBy}
            className="inline-flex min-h-[44px] cursor-pointer items-center rounded-[10px] border border-[var(--line)] bg-[var(--btn2)] px-4 font-[family-name:var(--font-sans)] text-[15px] font-semibold text-[var(--ink)] hover:opacity-90 focus-visible:outline-[3px] focus-visible:outline-offset-[2px] focus-visible:outline-[var(--accent)] disabled:opacity-40"
          >
            {copy.choosePdf}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf,.pdf"
            tabIndex={-1}
            aria-hidden="true"
            className="sr-only"
            onChange={(event) => {
              const files = Array.from(event.target.files ?? []);
              // Reset so choosing the same file again still fires change.
              event.target.value = '';
              onFiles(files);
            }}
          />
        </div>
      )}

      <p id={hintId} className={hintClass}>
        {copy.pdfLimit}
      </p>
      {error ? (
        <p id={errorId} className={fieldErrorClass} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
