'use client';

import {
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
} from 'react';
import { EditorContent, Extension, useEditor, useEditorState, type Editor } from '@tiptap/react';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { Bold, Italic, Link2, List, ListOrdered, Redo2, Undo2 } from 'lucide-react';
import { SAFE_LINK_PATTERN } from '@/schemas/adminEmail';
import { adminComposerCopy } from '@/content/admin';
import { cn } from '@/lib/utils';
import styles from './RichTextEditor.module.css';

export const RICH_TEXT_MAX_CHARS = 10_000;

export interface RichTextEditorHandle {
  focus: () => void;
  getHTML: () => string;
  /** true when the message has no visible text. */
  isEmpty: () => boolean;
}

interface RichTextEditorProps {
  ref?: Ref<RichTextEditorHandle>;
  /** id of the visible label element. */
  labelId: string;
  /** Initial HTML (edit mode). Read once when the editor is created. */
  initialHtml?: string;
  /** Called after each content change (no argument: read HTML on demand). */
  onChange?: () => void;
  invalid?: boolean;
  /** id of the error message element, when shown. */
  errorId?: string;
  disabled?: boolean;
}

const copy = adminComposerCopy.editor;

function textLength(editor: Editor): number {
  return editor.state.doc.textContent.length;
}

/**
 * Rejects edits that would push the text past the limit. Deleting is always
 * allowed, so a message that is already too long can be shortened.
 */
const CharacterLimit = Extension.create<{ limit: number }>({
  name: 'characterLimit',
  addOptions() {
    return { limit: RICH_TEXT_MAX_CHARS };
  },
  addProseMirrorPlugins() {
    const { limit } = this.options;
    return [
      new Plugin({
        key: new PluginKey('characterLimit'),
        filterTransaction: (transaction, state) => {
          if (!transaction.docChanged) return true;
          const next = transaction.doc.textContent.length;
          return next <= limit || next <= state.doc.textContent.length;
        },
      }),
    ];
  },
});

function ToolbarButton({
  label,
  pressed,
  disabled,
  onClick,
  children,
}: {
  label: string;
  /** Omitted for actions (Undo/Redo) that are not toggles. */
  pressed?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={pressed}
      disabled={disabled}
      // Keep the editor selection when clicking a toolbar button.
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className={cn(
        'inline-flex h-[44px] w-[44px] shrink-0 cursor-pointer items-center justify-center rounded-[10px] text-[var(--ink)] transition-colors hover:bg-[var(--btn2)] focus-visible:outline-[3px] focus-visible:outline-offset-[-3px] focus-visible:outline-[var(--accent)] disabled:cursor-default disabled:opacity-40 disabled:hover:bg-transparent motion-reduce:transition-none',
        pressed && 'bg-[var(--btn2)] text-[var(--accent)]'
      )}
    >
      {children}
    </button>
  );
}

function Toolbar({
  editor,
  controlsId,
  linkOpen,
  onLinkClick,
  linkButtonRef,
  disabled,
}: {
  editor: Editor;
  controlsId: string;
  linkOpen: boolean;
  onLinkClick: () => void;
  linkButtonRef: Ref<HTMLSpanElement>;
  disabled: boolean;
}) {
  // Re-renders only the toolbar, and only when one of these values changes.
  const state = useEditorState({
    editor,
    selector: ({ editor: current }) => ({
      bold: current.isActive('bold'),
      italic: current.isActive('italic'),
      bulletList: current.isActive('bulletList'),
      orderedList: current.isActive('orderedList'),
      link: current.isActive('link'),
      canUndo: current.can().undo(),
      canRedo: current.can().redo(),
    }),
  });
  const chain = () => editor.chain().focus();

  return (
    <div
      role="toolbar"
      aria-label={copy.toolbarLabel}
      aria-controls={controlsId}
      className="flex flex-wrap items-center gap-0.5 border-b border-[var(--line)] p-1"
    >
      <ToolbarButton label={copy.bold} pressed={state.bold} disabled={disabled} onClick={() => chain().toggleBold().run()}>
        <Bold className="h-[18px] w-[18px]" aria-hidden="true" />
      </ToolbarButton>
      <ToolbarButton label={copy.italic} pressed={state.italic} disabled={disabled} onClick={() => chain().toggleItalic().run()}>
        <Italic className="h-[18px] w-[18px]" aria-hidden="true" />
      </ToolbarButton>
      <span aria-hidden="true" className="mx-1 h-[24px] w-px bg-[var(--line)]" />
      <ToolbarButton
        label={copy.bulletList}
        pressed={state.bulletList}
        disabled={disabled}
        onClick={() => chain().toggleBulletList().run()}
      >
        <List className="h-[18px] w-[18px]" aria-hidden="true" />
      </ToolbarButton>
      <ToolbarButton
        label={copy.orderedList}
        pressed={state.orderedList}
        disabled={disabled}
        onClick={() => chain().toggleOrderedList().run()}
      >
        <ListOrdered className="h-[18px] w-[18px]" aria-hidden="true" />
      </ToolbarButton>
      <span ref={linkButtonRef} className="contents">
        <ToolbarButton label={copy.link} pressed={state.link || linkOpen} disabled={disabled} onClick={onLinkClick}>
          <Link2 className="h-[18px] w-[18px]" aria-hidden="true" />
        </ToolbarButton>
      </span>
      <span aria-hidden="true" className="mx-1 h-[24px] w-px bg-[var(--line)]" />
      <ToolbarButton label={copy.undo} disabled={disabled || !state.canUndo} onClick={() => chain().undo().run()}>
        <Undo2 className="h-[18px] w-[18px]" aria-hidden="true" />
      </ToolbarButton>
      <ToolbarButton label={copy.redo} disabled={disabled || !state.canRedo} onClick={() => chain().redo().run()}>
        <Redo2 className="h-[18px] w-[18px]" aria-hidden="true" />
      </ToolbarButton>
    </div>
  );
}

/** Only this element re-renders on each keystroke (it shows the count). */
function CharacterCount({ editor, id }: { editor: Editor; id: string }) {
  const count = useEditorState({ editor, selector: ({ editor: current }) => textLength(current) });
  const nearLimit = count >= RICH_TEXT_MAX_CHARS * 0.95;
  const atLimit = count >= RICH_TEXT_MAX_CHARS;
  return (
    <p
      id={id}
      className={cn(
        'px-3 pb-2 text-right font-[family-name:var(--font-mono)] text-[12px]',
        nearLimit ? 'text-[var(--accent)]' : 'text-[var(--muted)]'
      )}
    >
      <span className="sr-only">{copy.countLabel}: </span>
      {count.toLocaleString('en-US')} / {RICH_TEXT_MAX_CHARS.toLocaleString('en-US')}
      <span className="sr-only" aria-live="polite">
        {atLimit ? ` ${copy.limitReached}` : ''}
      </span>
    </p>
  );
}

function LinkPrompt({
  editor,
  onClose,
}: {
  editor: Editor;
  onClose: () => void;
}) {
  const inputId = useId();
  const errorId = useId();
  const initial = editor.getAttributes('link').href;
  const [value, setValue] = useState(typeof initial === 'string' ? initial : 'https://');
  const [error, setError] = useState<string | null>(null);
  const hasLink = editor.isActive('link');

  const apply = (event: FormEvent) => {
    event.preventDefault();
    const href = value.trim();
    if (!SAFE_LINK_PATTERN.test(href)) {
      setError(copy.linkInvalid);
      return;
    }
    const { empty } = editor.state.selection;
    if (empty && !hasLink) {
      editor
        .chain()
        .focus()
        .insertContent({ type: 'text', text: href, marks: [{ type: 'link', attrs: { href } }] })
        .run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href }).run();
    }
    onClose();
  };

  const remove = () => {
    editor.chain().focus().extendMarkRange('link').unsetLink().run();
    onClose();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      // Close only this prompt, not the surrounding dialog.
      event.preventDefault();
      event.stopPropagation();
      onClose();
    }
  };

  return (
    // A div, not a nested <form>: the editor sits inside the composer form.
    <div
      role="group"
      aria-label={copy.linkPromptLabel}
      onKeyDown={onKeyDown}
      className="flex flex-col gap-2 border-b border-[var(--line)] bg-[var(--bg)] p-3 sm:flex-row sm:items-start"
    >
      <div className="min-w-0 flex-1">
        <label htmlFor={inputId} className="sr-only">
          {copy.linkInputLabel}
        </label>
        <input
          id={inputId}
          type="url"
          inputMode="url"
          autoFocus
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            if (error) setError(null);
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') apply(event);
          }}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          placeholder="https://"
          className="min-h-[44px] w-full rounded-[10px] border border-[var(--line)] bg-[var(--panel)] px-3 font-[family-name:var(--font-sans)] text-[16px] text-[var(--ink)] outline-none focus-visible:border-[var(--accent)] focus-visible:outline-[3px] focus-visible:outline-offset-[1px] focus-visible:outline-[var(--accent)] aria-[invalid=true]:border-[var(--accent)]"
        />
        {error ? (
          <p id={errorId} className="mt-1 font-[family-name:var(--font-sans)] text-[13px] text-[var(--accent)]">
            {error}
          </p>
        ) : null}
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={apply}
          className="min-h-[44px] cursor-pointer rounded-[10px] bg-[var(--btn)] px-4 font-[family-name:var(--font-sans)] text-[15px] font-semibold text-[var(--btnfg)] hover:opacity-90 focus-visible:outline-[3px] focus-visible:outline-offset-[2px] focus-visible:outline-[var(--accent)]"
        >
          {copy.linkApply}
        </button>
        {hasLink ? (
          <button
            type="button"
            onClick={remove}
            className="min-h-[44px] cursor-pointer rounded-[10px] border border-[var(--line)] px-4 font-[family-name:var(--font-sans)] text-[15px] font-semibold text-[var(--ink)] hover:bg-[var(--btn2)] focus-visible:outline-[3px] focus-visible:outline-offset-[2px] focus-visible:outline-[var(--accent)]"
          >
            {copy.linkRemove}
          </button>
        ) : null}
        <button
          type="button"
          onClick={onClose}
          className="min-h-[44px] cursor-pointer rounded-[10px] px-4 font-[family-name:var(--font-sans)] text-[15px] font-semibold text-[var(--muted)] hover:bg-[var(--btn2)] hover:text-[var(--ink)] focus-visible:outline-[3px] focus-visible:outline-offset-[2px] focus-visible:outline-[var(--accent)]"
        >
          {copy.linkCancel}
        </button>
      </div>
    </div>
  );
}

/**
 * Tiptap editor for the composer. Outputs HTML (read on demand through the
 * ref handle, so typing never re-renders the parent form). The server
 * sanitises the HTML again before preview and send.
 */
export function RichTextEditor({
  ref,
  labelId,
  initialHtml,
  onChange,
  invalid = false,
  errorId,
  disabled = false,
}: RichTextEditorProps) {
  const contentId = useId();
  const countId = useId();
  const [linkOpen, setLinkOpen] = useState(false);
  const linkButtonRef = useRef<HTMLSpanElement>(null);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const editor = useEditor({
    // Render nothing on the server and on the first client render; avoids a
    // hydration mismatch (Tiptap: UseEditorOptions.immediatelyRender).
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        link: false,
        code: false,
        codeBlock: false,
        strike: false,
        horizontalRule: false,
        heading: { levels: [2, 3] },
      }),
      Link.configure({
        openOnClick: false,
        autolink: false,
        linkOnPaste: true,
        defaultProtocol: 'https',
        isAllowedUri: (url) => SAFE_LINK_PATTERN.test(url),
      }),
      Placeholder.configure({ placeholder: copy.placeholder }),
      CharacterLimit,
    ],
    content: initialHtml ?? '',
    onUpdate: () => onChangeRef.current?.(),
  });

  // Accessibility attributes on the contenteditable element.
  useEffect(() => {
    if (!editor) return;
    const describedBy = [countId, invalid ? errorId : undefined].filter(Boolean).join(' ');
    editor.setOptions({
      editorProps: {
        attributes: {
          id: contentId,
          role: 'textbox',
          'aria-multiline': 'true',
          'aria-required': 'true',
          'aria-labelledby': labelId,
          'aria-describedby': describedBy,
          ...(invalid ? { 'aria-invalid': 'true' } : {}),
        },
      },
    });
  }, [editor, contentId, countId, errorId, invalid, labelId]);

  useEffect(() => {
    // emitUpdate = false: setEditable otherwise fires "update", which the
    // composer would read as an edit (and then ask "Discard changes?").
    if (editor && editor.isEditable === disabled) editor.setEditable(!disabled, false);
  }, [editor, disabled]);

  useImperativeHandle(
    ref,
    () => ({
      focus: () => {
        editor?.commands.focus();
      },
      getHTML: () => (editor && !editor.isEmpty ? editor.getHTML() : ''),
      isEmpty: () => !editor || editor.state.doc.textContent.trim().length === 0,
    }),
    [editor]
  );

  const closeLink = () => {
    setLinkOpen(false);
    // Return focus to the Link button.
    linkButtonRef.current?.querySelector('button')?.focus();
  };

  return (
    <div
      className={cn(
        'rounded-[12px] border bg-[var(--panel)] focus-within:border-[var(--accent)]',
        invalid ? 'border-[var(--accent)]' : 'border-[var(--line)]'
      )}
    >
      {editor ? (
        <>
          <Toolbar
            editor={editor}
            controlsId={contentId}
            linkOpen={linkOpen}
            onLinkClick={() => setLinkOpen((open) => !open)}
            linkButtonRef={linkButtonRef}
            disabled={disabled}
          />
          {linkOpen ? <LinkPrompt editor={editor} onClose={closeLink} /> : null}
          <EditorContent editor={editor} className={styles.content} />
          <CharacterCount editor={editor} id={countId} />
        </>
      ) : (
        // Placeholder box while the editor mounts (same height, no layout shift).
        <div aria-hidden="true">
          <div className="h-[53px] border-b border-[var(--line)]" />
          <div className={styles.content}>
            <span className="text-[var(--muted)]">{copy.placeholder}</span>
          </div>
          <p className="px-3 pb-2 text-right font-[family-name:var(--font-mono)] text-[12px] text-[var(--muted)]">
            0 / {RICH_TEXT_MAX_CHARS.toLocaleString('en-US')}
          </p>
        </div>
      )}
    </div>
  );
}
