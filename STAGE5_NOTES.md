# Stage 5: composer

The "Send a mail" composer for `/admin/emails`: a Tiptap rich text editor, an
accessible modal for new, edit and reply modes, direct PDF upload with
progress, server-rendered preview, and a save → confirm → send flow.

## Inspection and conflicts

I read README.md, PORTING.md, ADMIN_PLAN.md, STAGE1–4_NOTES.md, `src/state`,
`src/lib/admin/apiClient.ts`, `src/app/admin`, `src/components/admin`,
`src/schemas/adminEmail.ts` and the `/api/admin` routes. I found no conflict
that needed a stop. These gaps were resolved as follows:

| Prompt says | What existed | Resolution |
|---|---|---|
| "call the upload-url action" | `client.createUploadUrl` existed; no store action | Added `uploadAttachment(file, { onProgress, signal })`. It requests the signed URL, PUTs the file and resolves to `{ name, size, storagePath }`. |
| Toasts "Draft saved." / "Email sent to <address>." | `updateDraft` said "Draft updated."; `sendEmail` said "Email is on its way." | Both changed in `asyncActionCopy`. The send toast names the recipient from the returned email. |
| The composer needs the saved email (id) and success/failure | Thunks returned `Promise<void>` and swallowed errors | `saveDraft`, `updateDraft`, `sendEmail`, `previewEmail` and `uploadAttachment` resolve to their result, or `null` on failure. Errors still become safe toasts in the action layer. |
| "Send now first saves the draft" | Saving always toasted | `saveDraft` and `updateDraft` take `{ toast: false }`, so Send now shows only the send toast. |
| Character count with a 10,000 limit | `CharacterCount` lives in `@tiptap/extensions`, which is not one of the five allowed packages | A 20-line `characterLimit` extension (ProseMirror `filterTransaction`, from `@tiptap/pm`). Edits past 10,000 are refused; deleting is always allowed. |
| Calendly link "https only" | The shared schema already requires `https://calendly.com` | Kept the stricter shared rule; the server would reject anything else anyway. |
| PDF "required for Audit reply" | Server: required only to send | Enforced on **Send** (as the server does). A draft can be saved without the PDF. |
| Subject "required" | Server: required for GENERAL only (AUDIT/QUOTE fall back to the template default) | The composer requires a subject for every type; it is prefilled for AUDIT/QUOTE, so this only matters if it is cleared. |
| Edit mode "including the existing attachment" | The API never exposes the storage path | Edit mode shows the saved file (name and size). Saves leave it untouched unless it is replaced or removed. |
| Preview inside edit mode | `previewDraftSchema` required a storage path | The preview route (only) now accepts an attachment without a path; it renders only name and size. Create and update still require a valid path. |
| Opening edit mode | Rows in the Sending list were not interactive | DRAFT and FAILED rows are now buttons that open the composer in edit mode. Sent rows stay plain. |

## Dependencies

Added exactly five, all `^3.35.0`: `@tiptap/react`, `@tiptap/pm`,
`@tiptap/starter-kit`, `@tiptap/extension-link`,
`@tiptap/extension-placeholder`.

- `@tiptap/react@3.35.0` peers: `react` / `react-dom` `^17 || ^18 || ^19` (installed 19.x). Checked with `npm view @tiptap/react@3.35.0 peerDependencies`.
- `@tiptap/core` is a peer of `@tiptap/react` and a regular dependency of `@tiptap/starter-kit`, so it arrives with the starter kit. No `--force` or `--legacy-peer-deps` was used.
- `npm audit` reports 4 high findings. All are in Prisma's chain (`prisma` → `@prisma/config` → `deepmerge-ts`, `effect`) and predate this stage.
- npm 12 printed that the `esbuild` and `@tailwindcss/oxide` install scripts are not in `allowScripts`. That is unrelated to this stage: the build and `tsx` still work.

SSR option, read from `node_modules/@tiptap/react/dist/index.d.ts`:
`UseEditorOptions.immediatelyRender?: boolean`. "If server-side rendering, set
this to `false`." The `useEditor` overload with `immediatelyRender: false`
returns `Editor | null`. The component renders a same-height placeholder until
the editor exists.

## Files

New:
- `src/components/admin/RichTextEditor.tsx` and `RichTextEditor.module.css`: toolbar, link prompt, character count, scoped content styles.
- `src/components/admin/ComposeEmailModal.tsx`: the dialog, its three views (form / preview / confirm), and the save and send flow.
- `src/components/admin/compose/composeForm.ts`: pure form logic (modes, initial values, validation with the shared schema, payload builders, `replySubject`).
- `src/components/admin/compose/AttachmentField.tsx`, `RowsEditor.tsx`, `fieldStyles.ts`.
- `src/lib/admin/emailFormat.ts`: `formatFileSize`, `defaultSubjectFor`, `resolveSubject`, shared by the client and the server renderer. They moved here from `adminEmailRender.ts`, which re-exports them.

Changed:
- `src/state/domain.action.ts`, `DomainProvider.tsx`, `index.ts`: result-returning thunks, `SaveOptions`, `uploadAttachment`, `previewEmail`, new request keys `emails/preview` and `attachments/upload`, toast copy. A cancelled upload settles quietly with no error toast.
- `src/lib/admin/apiClient.ts`: `uploadFile` (XMLHttpRequest PUT with progress, timeout and abort; the same headers as storage-js `uploadToSignedUrl`), error code `aborted`, `PreviewInput`.
- `src/schemas/adminEmail.ts`: `SAFE_LINK_PATTERN`, shared by the server sanitiser and the editor so they cannot drift, and the preview attachment rule. `src/lib/server/emailHtml.ts` now imports the pattern.
- `src/app/api/admin/emails/preview/route.ts`: accepts an attachment without a path.
- `src/components/admin/emails/EmailsView.tsx`, `EmailPanels.tsx`, `SendMailButton.tsx`: wiring, editable rows, list subjects shown with `{name}`/`{business}` filled in.
- `src/content/admin.ts`: `adminComposerCopy`.
- Tests: 5 new action tests (Stage 1 suite) and 2 new schema tests (Stage 4 suite), for 65 in total.

The public site is untouched: no public component, style or route changed.

## How it works

**State boundaries.** Typed values live in the modal's own `useState`. The
editor's HTML is read on demand through a ref handle, never stored on each
keystroke. Saved drafts, request status and toasts go through the store
actions only. The only state in `EmailsView` is which composer is open.

**Typing performance.** The editor calls `onChange` with no argument. The modal
sets `dirty`, a boolean that bails out after the first change. Only the
toolbar (`useEditorState`, values that change only on formatting) and the
character counter re-render per keystroke.

**Save draft.** Validates (shared zod schema, then the shared rules, then the
composer's required fields), calls `saveDraft` or `updateDraft`, then closes.
The upserted email lands at the top of the Sending list, and the action shows
"Draft saved.".

**Send now.** Validates with the send rules, saves silently, then shows the
confirmation step: To, the subject as resolved, and the attachment. "Send
email" calls `sendEmail`. On failure the action reloads the row (now FAILED)
and shows an error toast, and the modal returns to the form with everything
intact.

**Reply mode (for Stage 6).** `<ComposeEmailModal mode={{ type: 'reply', toEmail, subject, inReplyToMessageId, recipientName? }} />`.
Type is General, the subject is `replySubject(subject)` ("Re: " unless it
already starts with "Re:"), and `inReplyToMessageId` is sent on create.
`replySubject` is exported.

**Upload.** Client checks run first, before any request: exactly one file,
`uploadUrlRequestSchema` (`.pdf` name, 1 byte–15 MB), `file.type` empty or
`application/pdf`, and the first bytes `%PDF-`. Then the `uploadAttachment`
action runs. While uploading, a progress bar shows and Save and Send are
disabled. Remove during an upload aborts it; closing the modal aborts it too.

## Accessibility

- **Dialog:** `role="dialog"`, `aria-modal="true"`, `aria-labelledby` pointing at the heading. Focus starts on To. Tab and Shift+Tab wrap inside the dialog, skipping hidden elements. Page scroll is locked while it is open.
- **Escape and closing:** Escape closes, but asks "Discard changes?" first when anything changed (an inline `alertdialog`; focus goes to "Keep editing"). Inside the link prompt or the discard prompt, Escape closes only that prompt and focus returns to where it was. On close, focus returns to the opener, or to the header "Send a mail" button if the opener is gone.
- **Type field:** native radio inputs in a `fieldset`/`legend`, so arrow keys work.
- **Toolbar:** `role="toolbar"`; every button has `aria-label` and a 44×44 px target. Toggles (Bold, Italic, lists, Link) have `aria-pressed`. **Undo and Redo deliberately do not**: they are actions, and `aria-pressed` would make screen readers announce them as toggles. They are disabled when unavailable.
- **Fields and errors:** errors are inline, linked by `aria-describedby`, with `aria-invalid` set; the first invalid field is focused. The editor's contenteditable has `role="textbox"`, `aria-multiline`, `aria-labelledby`, `aria-required`, `aria-invalid`, and `aria-describedby` (count and error).
- **Preview iframe:** `sandbox=""` and `srcdoc`, so no scripts, forms, top navigation or same-origin access.

## Verified (production build, `next start`, headless Edge over CDP)

Run with a locally minted admin session (deleted afterwards). The server ran
with `NEXTAUTH_URL=http://localhost:3100`. With the real `.env` origin, the
Stage 4 Origin guard correctly returned 403 to the test port.

Requests intercepted in the browser:
- `upload-url` and the storage PUT, because the bucket does not exist yet.
- `/send`: no email was sent.

Save, edit, preview, the reload of a failed row and delete went to the real
API and database. Every test row was deleted (0 remain).

| Scenario | Result |
|---|---|
| Save draft | Modal closes, "Draft saved." toast, the row appears first in Sending. The DB row has kind, subject, calendly, body and attachment. Focus returns to the header button. |
| Edit draft | Clicking the DRAFT row prefills every field, including the PDF (name and size) and the editor HTML. The subject change was saved, the list updated in place and the row count stayed 1. |
| Template subject | AUDIT "Your AI Visibility Audit", which follows Business ("… for Mama Put"). QUOTE "Your quote from Bretosolution". GENERAL empty. It stops following once edited. |
| Preview | Server HTML in `<iframe sandbox="" srcdoc>`, with the typed body, the link and the draft's real PDF name. "Back to editing" keeps the editor content. |
| Send with PDF | Confirmation lists To, the resolved subject ("Your audit, Amina") and "composer-test.pdf (293 KB)". A mocked success shows "Email sent to composer-test@example.com.", closes the modal, and the row turns SENT and is no longer editable. |
| Send failure | A mocked 500 shows "Couldn't send the email.". The modal stays open on the form with To and the body intact. |
| Audit without PDF | Send blocked: "Attach the audit report (PDF) before sending.", focus on "Choose PDF", and no request made. |
| Non-PDF rejected | `notes.txt`, and `notes.pdf` typed `text/plain`: "Only PDF files are allowed." No request made. |
| 20 MB rejected | Dropped on the zone: "The file must be 15 MB or smaller." No request made. |
| Fake PDF | `.pdf` without `%PDF-`: "This file is not a valid PDF." |
| Upload | The upload-url body was `{ filename, size, contentType: 'application/pdf' }`. The PUT sent `content-type: application/pdf` and `x-upsert: false`, with **no `apikey` header**. During upload: progress bar shown, Save and Send disabled. Afterwards: name, "293 KB" and a Remove button. |
| Remove / abort | Remove moves focus to "Choose PDF". Remove during an upload aborts it with no toast, and the file never reappears. |
| Validation | Empty Send: errors on To, subject (GENERAL wording) and message. `aria-invalid` set on the input and the editor. Focus on To. |
| Keyboard-only | Opened with Enter on the header button; focus on To. Bold toggled with Enter (`aria-pressed=true`). Link prompt by keyboard: `javascript:` refused with an inline error, Escape closes only the prompt (focus back on Link), an https link is applied. Tab wraps from "Send now" to "Close"; Shift+Tab wraps back. Escape → discard prompt → Escape keeps editing (focus back on To) → Discard closes and focus returns to the opener. An untouched modal (also after Preview → Back) closes on Escape with no prompt. |
| 390 px | The dialog fills the viewport (0,0,390×844). The body scrolls and the footer stays pinned at the bottom. No horizontal overflow. No visible target under 44 px. Light and dark. |
| 1440 px | 760 px wide and centred. Light and dark. |
| Typing performance | Temporary render counters (since removed): typing 50 characters into the editor gave **0** re-renders of `EmailsView`, `SendingPanel`, `SentEmailRow` and `Toaster`. The modal itself re-rendered once (the dirty flag), not per keystroke. |

Bugs this testing found and fixed:
- Tiptap's `setEditable()` emits `update` by default, which marked a new form dirty. It is now called with `emitUpdate = false`, and only when the value changes.
- Closing the discard prompt dropped focus to `<body>`, so the next Escape did nothing. Focus is now restored after commit.
- Programmatically focused view headings showed the global `:focus-visible` outline; fixed.

Gate: `tsc` 0; lint 0 errors (the 8 existing `<img>` warnings); `npm test` 65/65; `npm run build` passes with every env var blank.

## Not verified / UNKNOWN

- **A real upload to Supabase.** The bucket `admin-email-attachments` still does not exist (`getBucket` returns 400). storage-js documents signed upload URLs as usable "without further authentication", and our PUT matches its request shape. If the real PUT returns 401 "No API key found", the browser upload needs `NEXT_PUBLIC_SUPABASE_ANON_KEY` (see STAGE4_NOTES).
- **Upload progress with a real network.** The mocked PUT completes in one step, so the bar was seen at 0 % then done. Progress uses `xhr.upload.onprogress`.
- **A real send.** Resend was not called, as in Stage 4.
- **Screen readers.** Only the ARIA was checked; no NVDA, VoiceOver or TalkBack pass was done.
- **A real device at 390 px.** Emulated in headless Edge only, not on an iPhone or Android device.
- **Orphaned PDFs.** Removing or replacing an uploaded PDF before saving, or discarding the modal after an upload, leaves the object in storage (the Stage 4 limitation).
