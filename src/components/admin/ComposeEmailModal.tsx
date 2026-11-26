'use client';

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { adminComposerCopy as copy } from '@/content/admin';
import { formatFileSize, resolveSubject } from '@/lib/admin/emailFormat';
import { cn } from '@/lib/utils';
import { uploadUrlRequestSchema } from '@/schemas/adminEmail';
import { useDomainActions, type AdminEmailDTO, type AdminEmailKind } from '@/state';
import { RichTextEditor, type RichTextEditorHandle } from '@/components/admin/RichTextEditor';
import { AttachmentField, type UploadProgress } from '@/components/admin/compose/AttachmentField';
import { RowsEditor } from '@/components/admin/compose/RowsEditor';
import {
  firstErrorKey,
  initialContext,
  initialValues,
  toDraftInput,
  toDraftPatch,
  toPreviewInput,
  validate,
  withDefaultSubject,
  type ComposeMode,
  type ComposeValues,
  type FieldErrors,
  type ValidationPurpose,
} from '@/components/admin/compose/composeForm';
import { fieldErrorClass, hintClass, inputClass, labelClass } from '@/components/admin/compose/fieldStyles';

export type { ComposeMode } from '@/components/admin/compose/composeForm';
export { replySubject } from '@/components/admin/compose/composeForm';

interface ComposeEmailModalProps {
  mode: ComposeMode;
  onClose: () => void;
  /** Focus target when the element that opened the modal is gone. */
  fallbackFocus?: () => HTMLElement | null;
}

type View = 'form' | 'preview' | 'confirm';
type Busy = 'saving' | 'sending' | 'previewing' | null;

const KINDS: readonly AdminEmailKind[] = ['AUDIT', 'QUOTE', 'GENERAL'];

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([tabindex="-1"]), select:not([disabled]), textarea:not([disabled]), iframe, [contenteditable="true"], [tabindex]:not([tabindex="-1"])';

function isVisible(element: HTMLElement): boolean {
  return element.getClientRects().length > 0;
}

/** Reads the first bytes: every PDF starts with "%PDF-". */
async function looksLikePdf(file: File): Promise<boolean> {
  try {
    const head = await file.slice(0, 5).arrayBuffer();
    return new TextDecoder().decode(head) === '%PDF-';
  } catch {
    return false;
  }
}

function TextField({
  id,
  label,
  value,
  onChange,
  error,
  hint,
  required,
  optional,
  type = 'text',
  inputMode,
  autoComplete,
  maxLength,
  disabled,
  register,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: ReactNode;
  required?: boolean;
  optional?: boolean;
  type?: 'text' | 'email' | 'url';
  inputMode?: 'email' | 'url' | 'text';
  autoComplete?: string;
  maxLength?: number;
  disabled: boolean;
  register: (node: HTMLElement | null) => void;
}) {
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ') || undefined;
  return (
    <div className="min-w-0">
      <label htmlFor={id} className={labelClass}>
        {label}
        {optional ? <span className="font-normal text-[var(--muted)]"> ({copy.optional})</span> : null}
      </label>
      <input
        ref={register}
        id={id}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        value={value}
        maxLength={maxLength}
        required={required}
        aria-required={required || undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className={cn(inputClass, 'mt-1.5')}
      />
      {hint ? (
        <p id={hintId} className={hintClass}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className={fieldErrorClass}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

/**
 * The "Send a mail" composer. Everything typed stays in this component's
 * state until Save draft / Send now hands it to the domain actions.
 */
export function ComposeEmailModal({ mode, onClose, fallbackFocus }: ComposeEmailModalProps) {
  const actions = useDomainActions();
  const titleId = useId();
  const idBase = useId();
  const fieldId = (name: string) => `${idBase}-${name}`;
  const messageLabelId = fieldId('message-label');

  const [values, setValues] = useState<ComposeValues>(() => initialValues(mode));
  const [context] = useState(() => initialContext(mode));
  const [emailId, setEmailId] = useState<string | null>(mode.type === 'edit' ? mode.email.id : null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [dirty, setDirty] = useState(false);
  const [view, setView] = useState<View>('form');
  const [busy, setBusy] = useState<Busy>(null);
  const [upload, setUpload] = useState<UploadProgress | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<AdminEmailDTO | null>(null);
  const [discardOpen, setDiscardOpen] = useState(false);

  const dialogRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<RichTextEditorHandle>(null);
  const fieldRefs = useRef<Record<string, HTMLElement | null>>({});
  const uploadAbort = useRef<AbortController | null>(null);
  const viewHeadingRef = useRef<HTMLHeadingElement>(null);
  const keepEditingRef = useRef<HTMLButtonElement>(null);
  /** Where focus was when the discard prompt opened (restored when it closes). */
  const beforeDiscardRef = useRef<HTMLElement | null>(null);
  const fallbackFocusRef = useRef(fallbackFocus);

  const initialHtml = mode.type === 'edit' ? mode.email.bodyHtml : '';
  const uploading = upload !== null;
  const locked = busy !== null;
  const title = mode.type === 'edit' ? copy.titleEdit : mode.type === 'reply' ? copy.titleReply : copy.titleNew;

  const register = useCallback(
    (key: string) => (node: HTMLElement | null) => {
      fieldRefs.current[key] = node;
    },
    []
  );

  // ---- open/close: initial focus, scroll lock, focus return -----------------
  useEffect(() => {
    fallbackFocusRef.current = fallbackFocus;
  }, [fallbackFocus]);

  useEffect(() => {
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    fieldRefs.current.toEmail?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const abortRef = uploadAbort;
    return () => {
      document.body.style.overflow = previousOverflow;
      abortRef.current?.abort();
      const target = opener && opener.isConnected ? opener : fallbackFocusRef.current?.();
      target?.focus();
    };
  }, []);

  useEffect(() => {
    if (view !== 'form') viewHeadingRef.current?.focus();
  }, [view]);

  useEffect(() => {
    if (discardOpen) keepEditingRef.current?.focus();
  }, [discardOpen]);

  /**
   * Focus to move after the next commit, once the target exists: "restore"
   * returns to where focus was before the discard prompt (or the dialog),
   * "attachment" goes to the PDF field's button.
   */
  const pendingFocusRef = useRef<'restore' | 'attachment' | null>(null);
  useEffect(() => {
    const pending = pendingFocusRef.current;
    if (pending === null) return;
    pendingFocusRef.current = null;
    if (pending === 'attachment') {
      fieldRefs.current.attachment?.focus();
      return;
    }
    const previous = beforeDiscardRef.current;
    const target = previous && previous.isConnected && isVisible(previous) ? previous : dialogRef.current;
    target?.focus();
  });

  const closeDiscard = () => {
    // The prompt's buttons unmount; put focus back where it was.
    pendingFocusRef.current = 'restore';
    setDiscardOpen(false);
  };

  // ---- field updates ----------------------------------------------------------
  const change = (patch: Partial<ComposeValues>, clear: string[] = []) => {
    setValues((current) => withDefaultSubject({ ...current, ...patch }));
    setDirty(true);
    if (clear.length > 0) {
      setErrors((current) => {
        if (!clear.some((key) => current[key] !== undefined)) return current;
        const next = { ...current };
        for (const key of clear) delete next[key];
        return next;
      });
    }
  };

  // Typing in the editor only flips flags; it never re-renders on each key.
  const onMessageChange = useCallback(() => {
    setDirty(true);
    setErrors((current) => {
      if (current.bodyHtml === undefined) return current;
      const next = { ...current };
      delete next.bodyHtml;
      return next;
    });
  }, []);

  const focusField = (key: string | null) => {
    if (!key) return;
    if (key === 'bodyHtml') {
      editorRef.current?.focus();
      return;
    }
    const element = fieldRefs.current[key] ?? fieldRefs.current[key.split('.')[0] ?? ''];
    element?.focus();
  };

  const check = (purpose: ValidationPurpose): boolean => {
    const editor = editorRef.current;
    const html = editor?.getHTML() ?? '';
    const found = validate(values, html, editor?.isEmpty() ?? true, context, purpose);
    if (uploading && purpose !== 'preview') found.attachment = copy.errors.uploadInProgress;
    setErrors(found);
    const first = firstErrorKey(found);
    if (first) {
      focusField(first);
      return false;
    }
    return true;
  };

  // ---- PDF upload ---------------------------------------------------------------
  const setAttachmentError = (message: string | null) =>
    setErrors((current) => {
      if (message === null) {
        if (current.attachment === undefined) return current;
        const next = { ...current };
        delete next.attachment;
        return next;
      }
      return { ...current, attachment: message };
    });

  const onFiles = async (files: File[]) => {
    if (files.length !== 1) {
      setAttachmentError(copy.errors.oneFile);
      return;
    }
    const [file] = files;
    if (!file) return;
    const parsed = uploadUrlRequestSchema.safeParse({
      filename: file.name,
      size: file.size,
      contentType: 'application/pdf',
    });
    if (!parsed.success) {
      setAttachmentError(parsed.error.issues[0]?.message ?? copy.errors.notPdf);
      return;
    }
    if ((file.type && file.type !== 'application/pdf') || !(await looksLikePdf(file))) {
      setAttachmentError(file.type && file.type !== 'application/pdf' ? copy.errors.notPdf : copy.errors.invalidPdf);
      return;
    }

    setAttachmentError(null);
    const controller = new AbortController();
    uploadAbort.current?.abort();
    uploadAbort.current = controller;
    setUpload({ name: file.name, size: file.size, fraction: 0 });
    setDirty(true);

    const result = await actions.uploadAttachment(file, {
      signal: controller.signal,
      onProgress: (fraction) =>
        setUpload((current) => (current && !controller.signal.aborted ? { ...current, fraction } : current)),
    });
    if (controller.signal.aborted) return;
    uploadAbort.current = null;
    setUpload(null);
    if (result) {
      setValues((current) => ({
        ...current,
        attachment: { name: result.name, size: result.size, storagePath: result.storagePath },
        attachmentChanged: true,
      }));
    }
  };

  const removeAttachment = () => {
    if (uploadAbort.current) {
      uploadAbort.current.abort();
      uploadAbort.current = null;
      pendingFocusRef.current = 'attachment';
      setUpload(null);
      return;
    }
    // Focus moves to the "Choose PDF" button that replaces the file row.
    pendingFocusRef.current = 'attachment';
    change({ attachment: null, attachmentChanged: true }, ['attachment']);
  };

  // ---- save / preview / send ------------------------------------------------------
  /** Creates or updates the draft. Resolves to the saved email, or null. */
  const persist = async (toast: boolean): Promise<AdminEmailDTO | null> => {
    const html = editorRef.current?.getHTML() ?? '';
    const saved = emailId
      ? await actions.updateDraft(emailId, toDraftPatch(values, html), { toast })
      : await actions.saveDraft(toDraftInput(values, html, context), { toast });
    if (saved) {
      setEmailId(saved.id);
      // The upload now belongs to the draft; later saves leave it unchanged.
      setValues((current) => ({
        ...current,
        attachment: current.attachment ? { ...current.attachment, storagePath: null } : null,
        attachmentChanged: false,
      }));
      setDirty(false);
    }
    return saved;
  };

  const saveDraft = async () => {
    if (locked || uploading || !check('save')) return;
    setBusy('saving');
    const saved = await persist(true);
    setBusy(null);
    if (saved) onClose();
  };

  const preview = async () => {
    if (locked || !check('preview')) return;
    setBusy('previewing');
    const html = await actions.previewEmail(toPreviewInput(values, editorRef.current?.getHTML() ?? '', context));
    setBusy(null);
    if (html !== null) {
      setPreviewHtml(html);
      setView('preview');
    }
  };

  const sendNow = async () => {
    if (locked || uploading || !check('send')) return;
    setBusy('saving');
    const saved = await persist(false);
    setBusy(null);
    if (saved) {
      setConfirmed(saved);
      setView('confirm');
    }
  };

  const confirmSend = async () => {
    if (!confirmed || locked) return;
    setBusy('sending');
    const sent = await actions.sendEmail(confirmed.id);
    setBusy(null);
    if (sent) {
      onClose();
      return;
    }
    // Error toast already shown; keep everything the admin typed.
    setView('form');
  };

  // ---- closing ------------------------------------------------------------------------
  const requestClose = () => {
    if (busy === 'sending' || busy === 'saving') return;
    if (dirty || uploading) {
      beforeDiscardRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      setDiscardOpen(true);
      return;
    }
    onClose();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      if (discardOpen) closeDiscard();
      else requestClose();
      return;
    }
    if (event.key !== 'Tab') return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    const items = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(isVisible);
    if (items.length === 0) return;
    const first = items[0];
    const last = items[items.length - 1];
    const active = document.activeElement;
    if (event.shiftKey && (active === first || !dialog.contains(active))) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && (active === last || !dialog.contains(active))) {
      event.preventDefault();
      first?.focus();
    }
  };

  // ---- render ---------------------------------------------------------------------------
  const kind = values.kind;
  const busyLabel = busy === 'saving' ? copy.saving : busy === 'sending' ? copy.sending : null;

  const footer = discardOpen ? (
    <div role="alertdialog" aria-labelledby={fieldId('discard-title')} aria-describedby={fieldId('discard-body')} className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1">
        <p id={fieldId('discard-title')} className="font-[family-name:var(--font-sans)] text-[15px] font-semibold text-[var(--ink)]">
          {copy.discardHeading}
        </p>
        <p id={fieldId('discard-body')} className="font-[family-name:var(--font-sans)] text-[13px] text-[var(--muted)]">
          {copy.discardBody}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:flex">
        <button
          ref={keepEditingRef}
          type="button"
          onClick={closeDiscard}
          className="min-h-[44px] cursor-pointer rounded-[10px] border border-[var(--line)] px-4 font-[family-name:var(--font-sans)] text-[15px] font-semibold text-[var(--ink)] hover:bg-[var(--btn2)] focus-visible:outline-[3px] focus-visible:outline-offset-[2px] focus-visible:outline-[var(--accent)]"
        >
          {copy.keepEditing}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="min-h-[44px] cursor-pointer rounded-[10px] bg-[var(--accent)] px-4 font-[family-name:var(--font-sans)] text-[15px] font-semibold text-[var(--btnfg)] hover:opacity-90 focus-visible:outline-[3px] focus-visible:outline-offset-[2px] focus-visible:outline-[var(--ink)]"
        >
          {copy.discard}
        </button>
      </div>
    </div>
  ) : view === 'preview' ? (
    <div className="flex justify-end">
      <Button variant="secondary" onClick={() => setView('form')} className="w-full sm:w-auto">
        {copy.backToEditing}
      </Button>
    </div>
  ) : view === 'confirm' ? (
    <div className="grid grid-cols-2 gap-2 sm:flex sm:justify-end">
      <Button variant="secondary" onClick={() => setView('form')} disabled={locked}>
        {copy.back}
      </Button>
      <Button variant="primary" onClick={confirmSend} disabled={locked} aria-busy={busy === 'sending' || undefined}>
        {busy === 'sending' ? copy.sending : copy.confirmSend}
      </Button>
    </div>
  ) : (
    <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:justify-end">
      <Button variant="secondary" onClick={saveDraft} disabled={locked || uploading} aria-busy={busy === 'saving' || undefined}>
        {busy === 'saving' ? copy.saving : copy.saveDraft}
      </Button>
      <Button variant="secondary" onClick={preview} disabled={locked} aria-busy={busy === 'previewing' || undefined}>
        {busy === 'previewing' ? copy.loadingPreview : copy.preview}
      </Button>
      <Button variant="primary" onClick={sendNow} disabled={locked || uploading} className="col-span-2">
        {copy.sendNow}
      </Button>
    </div>
  );

  const dialog = (
    <div className="fixed inset-0 z-[80]">
      <div aria-hidden="true" onClick={requestClose} className="absolute inset-0 bg-[var(--shadow)] backdrop-blur-[2px]" />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onKeyDown={onKeyDown}
        className="absolute inset-0 flex flex-col outline-none focus-visible:outline-none bg-[var(--panel)] text-[var(--ink)] sm:inset-x-4 sm:bottom-auto sm:top-[4vh] sm:mx-auto sm:max-h-[92vh] sm:max-w-[760px] sm:rounded-[16px] sm:border sm:border-[var(--line)] sm:shadow-[0_24px_64px_var(--shadow)]"
      >
        <header className="flex shrink-0 items-center gap-3 border-b border-[var(--line)] py-2 pl-5 pr-2">
          <h2 id={titleId} className="min-w-0 flex-1 truncate font-[family-name:var(--font-display)] text-[22px] font-semibold">
            {title}
          </h2>
          <button
            type="button"
            onClick={requestClose}
            aria-label={copy.close}
            className="inline-flex h-[44px] w-[44px] shrink-0 cursor-pointer items-center justify-center rounded-[10px] text-[var(--muted)] hover:bg-[var(--btn2)] hover:text-[var(--ink)] focus-visible:outline-[3px] focus-visible:outline-offset-[2px] focus-visible:outline-[var(--accent)]"
          >
            <X className="h-[20px] w-[20px]" aria-hidden="true" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {/* The form stays mounted (hidden) so the editor keeps its content and history. */}
          <form
            noValidate
            aria-labelledby={titleId}
            hidden={view !== 'form'}
            onSubmit={(event) => event.preventDefault()}
            className="flex flex-col gap-5 px-5 py-5"
          >
            <fieldset className="min-w-0">
              <legend className={labelClass}>{copy.kindLegend}</legend>
              <div className="mt-1.5 grid grid-cols-3 gap-1 rounded-[12px] border border-[var(--line)] bg-[var(--bg)] p-1">
                {KINDS.map((option) => {
                  const checked = option === kind;
                  return (
                    <label
                      key={option}
                      className={cn(
                        'relative flex min-h-[44px] cursor-pointer items-center justify-center rounded-[9px] px-2 text-center font-[family-name:var(--font-sans)] text-[14px] font-semibold transition-colors has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-offset-[1px] has-[:focus-visible]:outline-[var(--accent)] motion-reduce:transition-none sm:text-[15px]',
                        checked ? 'bg-[var(--panel)] text-[var(--ink)] shadow-[0_1px_3px_var(--shadow)]' : 'text-[var(--muted)] hover:text-[var(--ink)]',
                        locked && 'pointer-events-none opacity-60'
                      )}
                    >
                      <input
                        type="radio"
                        name={fieldId('kind')}
                        value={option}
                        checked={checked}
                        disabled={locked}
                        onChange={() => change({ kind: option }, ['rows', 'attachment', 'calendlyUrl', 'subject'])}
                        className="sr-only"
                      />
                      {copy.kinds[option]}
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <TextField
              id={fieldId('to')}
              label={copy.to}
              type="email"
              inputMode="email"
              autoComplete="off"
              required
              maxLength={254}
              value={values.toEmail}
              onChange={(toEmail) => change({ toEmail }, ['toEmail'])}
              error={errors.toEmail}
              disabled={locked}
              register={register('toEmail')}
            />

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <TextField
                id={fieldId('name')}
                label={copy.name}
                optional
                autoComplete="off"
                maxLength={100}
                hint={copy.nameHint}
                value={values.recipientName}
                onChange={(recipientName) => change({ recipientName }, ['recipientName'])}
                error={errors.recipientName}
                disabled={locked}
                register={register('recipientName')}
              />
              <TextField
                id={fieldId('business')}
                label={copy.business}
                optional
                autoComplete="off"
                maxLength={100}
                value={values.businessName}
                onChange={(businessName) => change({ businessName }, ['businessName'])}
                error={errors.businessName}
                disabled={locked}
                register={register('businessName')}
              />
            </div>

            <TextField
              id={fieldId('subject')}
              label={copy.subject}
              required
              autoComplete="off"
              maxLength={200}
              hint={copy.subjectHint}
              value={values.subject}
              onChange={(subject) => change({ subject, subjectEdited: true }, ['subject'])}
              error={errors.subject}
              disabled={locked}
              register={register('subject')}
            />

            <div className="min-w-0">
              <p id={messageLabelId} className={cn(labelClass, 'mb-1.5')}>
                {copy.message}
              </p>
              <RichTextEditor
                ref={editorRef}
                labelId={messageLabelId}
                initialHtml={initialHtml}
                onChange={onMessageChange}
                invalid={errors.bodyHtml !== undefined}
                errorId={fieldId('message-error')}
                disabled={locked}
              />
              {errors.bodyHtml ? (
                <p id={fieldId('message-error')} className={fieldErrorClass}>
                  {errors.bodyHtml}
                </p>
              ) : null}
            </div>

            <AttachmentField
              id={fieldId('pdf')}
              attachment={values.attachment}
              upload={upload}
              required={kind === 'AUDIT'}
              error={errors.attachment}
              disabled={locked}
              onFiles={onFiles}
              onRemove={removeAttachment}
              register={register('attachment')}
            />

            {kind === 'AUDIT' || kind === 'QUOTE' ? (
              <TextField
                id={fieldId('calendly')}
                label={copy.calendly}
                type="url"
                inputMode="url"
                autoComplete="off"
                maxLength={500}
                hint={copy.calendlyHint}
                value={values.calendlyUrl}
                onChange={(calendlyUrl) => change({ calendlyUrl }, ['calendlyUrl'])}
                error={errors.calendlyUrl}
                disabled={locked}
                register={register('calendlyUrl')}
              />
            ) : null}

            {kind === 'QUOTE' ? (
              <RowsEditor
                rows={values.rows}
                errors={errors}
                disabled={locked}
                idPrefix={fieldId('rows')}
                register={register}
                onChange={(rows) =>
                  change(
                    { rows },
                    Object.keys(errors).filter((key) => key === 'rows' || key.startsWith('rows.'))
                  )
                }
              />
            ) : null}

            {errors.source ? <p className={fieldErrorClass}>{errors.source}</p> : null}
          </form>

          {view === 'preview' && previewHtml !== null ? (
            <section aria-labelledby={fieldId('preview-title')} className="flex h-full min-h-[70vh] flex-col gap-3 px-5 py-5 sm:min-h-[60vh]">
              <div>
                <h3 ref={viewHeadingRef} tabIndex={-1} id={fieldId('preview-title')} className="font-[family-name:var(--font-sans)] text-[17px] font-semibold outline-none focus-visible:outline-none">
                  {copy.previewTitle}
                </h3>
                <p className={hintClass}>{copy.previewNote}</p>
              </div>
              <iframe
                title={copy.previewTitle}
                sandbox=""
                srcDoc={previewHtml}
                className="min-h-[60vh] w-full flex-1 rounded-[12px] border border-[var(--line)] bg-white"
              />
            </section>
          ) : null}

          {view === 'confirm' && confirmed ? (
            <section aria-labelledby={fieldId('confirm-title')} className="px-5 py-5">
              <h3 ref={viewHeadingRef} tabIndex={-1} id={fieldId('confirm-title')} className="font-[family-name:var(--font-display)] text-[22px] font-semibold outline-none focus-visible:outline-none">
                {copy.confirmHeading}
              </h3>
              <dl className="mt-4 divide-y divide-[var(--line)] rounded-[12px] border border-[var(--line)]">
                {[
                  [copy.confirmTo, confirmed.toEmail],
                  [
                    copy.confirmSubject,
                    resolveSubject({
                      kind: confirmed.kind,
                      subject: confirmed.subject,
                      recipientName: confirmed.recipientName,
                      businessName: confirmed.businessName,
                    }),
                  ],
                  [
                    copy.confirmAttachment,
                    confirmed.attachment
                      ? `${confirmed.attachment.name} (${formatFileSize(confirmed.attachment.size)})`
                      : copy.confirmNoAttachment,
                  ],
                ].map(([term, detail]) => (
                  <div key={term} className="grid grid-cols-1 gap-1 px-4 py-3 sm:grid-cols-[120px_minmax(0,1fr)] sm:gap-4">
                    <dt className="font-[family-name:var(--font-sans)] text-[13px] font-semibold uppercase tracking-[0.04em] text-[var(--muted)]">
                      {term}
                    </dt>
                    <dd className="font-[family-name:var(--font-sans)] text-[15px] text-[var(--ink)] [overflow-wrap:anywhere]">
                      {detail}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          ) : null}
        </div>

        <footer className="shrink-0 border-t border-[var(--line)] bg-[var(--panel)] px-5 py-3 pb-[max(12px,env(safe-area-inset-bottom))] sm:rounded-b-[16px]">
          {busyLabel ? (
            <span className="sr-only" role="status">
              {busyLabel}
            </span>
          ) : null}
          {footer}
        </footer>
      </div>
    </div>
  );

  return createPortal(dialog, document.body);
}
