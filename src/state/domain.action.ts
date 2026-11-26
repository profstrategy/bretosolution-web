/**
 * The ONLY file that defines domain actions: the `DomainAction` union, plain
 * action creators, the `pushToast` thunk and the async (thunk) actions.
 *
 * Runtime code here has no imports, so `node --test` can load it directly.
 * The API client is injected through `createAsyncActions(client)`;
 * `DomainProvider` binds it to the real `adminApiClient`.
 */
import type {
  AdminEmailDTO,
  DomainState,
  InboxItemDTO,
  InboxMessageDTO,
  Toast,
  ToastKind,
} from './domain.state';
import type {
  AdminApiClient,
  DraftAttachmentInput,
  DraftInput,
  DraftPatch,
  PreviewInput,
} from '@/lib/admin/apiClient';

// ---------------------------------------------------------------------------
// Action union
// ---------------------------------------------------------------------------

export interface PagePayload<T> {
  items: T[];
  nextCursor: string | null;
  /** true = append to the existing list (load more); false = replace. */
  append: boolean;
}

export type DomainAction =
  | { type: 'emails/loaded'; payload: PagePayload<AdminEmailDTO> }
  | { type: 'emails/upserted'; payload: { email: AdminEmailDTO } }
  | { type: 'emails/removed'; payload: { id: string } }
  | { type: 'inbox/loaded'; payload: PagePayload<InboxItemDTO> }
  | { type: 'inbox/messageLoaded'; payload: { message: InboxMessageDTO } }
  | { type: 'requests/started'; payload: { key: string } }
  | { type: 'requests/succeeded'; payload: { key: string } }
  | { type: 'requests/failed'; payload: { key: string; error: string } }
  | { type: 'toasts/pushed'; payload: { toast: Toast } }
  | { type: 'toasts/dismissed'; payload: { id: string } };

export type DomainActionType = DomainAction['type'];

/** A thunk receives `dispatch` and `getState`; async actions return Promise<void>. */
export type DomainThunk<R = Promise<void>> = (
  dispatch: DomainDispatch,
  getState: () => DomainState
) => R;

export interface DomainDispatch {
  (action: DomainAction): void;
  <R>(thunk: DomainThunk<R>): R;
}

// ---------------------------------------------------------------------------
// Plain action creators
// ---------------------------------------------------------------------------

export function emailsLoaded(
  items: AdminEmailDTO[],
  nextCursor: string | null,
  append = false
): DomainAction {
  return { type: 'emails/loaded', payload: { items, nextCursor, append } };
}

export function emailUpserted(email: AdminEmailDTO): DomainAction {
  return { type: 'emails/upserted', payload: { email } };
}

export function emailRemoved(id: string): DomainAction {
  return { type: 'emails/removed', payload: { id } };
}

export function inboxLoaded(
  items: InboxItemDTO[],
  nextCursor: string | null,
  append = false
): DomainAction {
  return { type: 'inbox/loaded', payload: { items, nextCursor, append } };
}

export function inboxMessageLoaded(message: InboxMessageDTO): DomainAction {
  return { type: 'inbox/messageLoaded', payload: { message } };
}

export function requestStarted(key: string): DomainAction {
  return { type: 'requests/started', payload: { key } };
}

export function requestSucceeded(key: string): DomainAction {
  return { type: 'requests/succeeded', payload: { key } };
}

export function requestFailed(key: string, error: string): DomainAction {
  return { type: 'requests/failed', payload: { key, error } };
}

export function toastPushed(toast: Toast): DomainAction {
  return { type: 'toasts/pushed', payload: { toast } };
}

export function toastDismissed(id: string): DomainAction {
  return { type: 'toasts/dismissed', payload: { id } };
}

// ---------------------------------------------------------------------------
// Toasts
// ---------------------------------------------------------------------------

export const TOAST_AUTO_DISMISS_MS = 5_000;

let toastSequence = 0;

function nextToastId(): string {
  toastSequence += 1;
  return `toast-${Date.now().toString(36)}-${toastSequence}`;
}

/**
 * Pushes a toast with a generated id and returns that id. Success and info
 * toasts dismiss themselves after 5 s; error toasts stay until dismissed.
 */
export function pushToast(kind: ToastKind, message: string): DomainThunk<string> {
  return (dispatch) => {
    const id = nextToastId();
    dispatch(toastPushed({ id, kind, message, createdAt: Date.now() }));
    if (kind !== 'error') {
      setTimeout(() => dispatch(toastDismissed(id)), TOAST_AUTO_DISMISS_MS);
    }
    return id;
  };
}

// ---------------------------------------------------------------------------
// Request keys
// ---------------------------------------------------------------------------

export const requestKeys = {
  emailsList: 'emails/list',
  emailsListMore: 'emails/listMore',
  emailCreate: 'emails/create',
  emailUpdate: (id: string) => `emails/update:${id}`,
  emailDelete: (id: string) => `emails/delete:${id}`,
  emailSend: (id: string) => `emails/send:${id}`,
  emailRefresh: (id: string) => `emails/refresh:${id}`,
  emailPreview: 'emails/preview',
  attachmentUpload: 'attachments/upload',
  inboxList: 'inbox/list',
  inboxListMore: 'inbox/listMore',
  inboxMessage: (id: string) => `inbox/message:${id}`,
} as const;

// ---------------------------------------------------------------------------
// Async actions
// ---------------------------------------------------------------------------

/** Short human messages; never raw server text, never secrets. */
export const asyncActionCopy = {
  loadEmails: { success: 'Emails loaded.', error: "Couldn't load emails." },
  loadMoreEmails: { success: 'More emails loaded.', error: "Couldn't load more emails." },
  saveDraft: { success: 'Draft saved.', error: "Couldn't save the draft." },
  updateDraft: { success: 'Draft saved.', error: "Couldn't save the draft." },
  deleteDraft: { success: 'Draft deleted.', error: "Couldn't delete the draft." },
  sendEmail: {
    success: (toEmail: string) => `Email sent to ${toEmail}.`,
    error: "Couldn't send the email.",
  },
  refreshEmailStatus: { success: 'Status updated.', error: "Couldn't refresh the status." },
  previewEmail: { success: null, error: "Couldn't build the preview." },
  uploadAttachment: { success: null, error: "Couldn't upload the PDF." },
  loadInbox: { success: 'Inbox loaded.', error: "Couldn't load the inbox." },
  loadMoreInbox: { success: 'More messages loaded.', error: "Couldn't load more messages." },
  loadInboxMessage: { success: 'Message loaded.', error: "Couldn't open the message." },
} as const;

interface ActionCopy<T> {
  /** Success toast; a function receives the result; null shows none. */
  success: string | ((result: T) => string) | null;
  error: string;
}

export interface SaveOptions {
  /** false skips the success toast ("Send now" saves first, then sends). */
  toast?: boolean;
}

export interface UploadAttachmentOptions {
  onProgress?: (fraction: number) => void;
  /** Aborting (Remove, closing the composer) ends quietly: no error toast. */
  signal?: AbortSignal;
}

/** Thunks resolve to their result, or null when the request failed or was skipped. */
export interface AsyncActions {
  loadEmails(): DomainThunk;
  loadMoreEmails(): DomainThunk;
  saveDraft(input: DraftInput, options?: SaveOptions): DomainThunk<Promise<AdminEmailDTO | null>>;
  updateDraft(
    id: string,
    patch: DraftPatch,
    options?: SaveOptions
  ): DomainThunk<Promise<AdminEmailDTO | null>>;
  deleteDraft(id: string): DomainThunk;
  sendEmail(id: string): DomainThunk<Promise<AdminEmailDTO | null>>;
  refreshEmailStatus(id: string): DomainThunk;
  previewEmail(input: PreviewInput): DomainThunk<Promise<string | null>>;
  uploadAttachment(
    file: File,
    options?: UploadAttachmentOptions
  ): DomainThunk<Promise<DraftAttachmentInput | null>>;
  loadInbox(): DomainThunk;
  loadMoreInbox(): DomainThunk;
  loadInboxMessage(id: string): DomainThunk;
}

function apiErrorField(error: unknown, field: string): unknown {
  if (!(error instanceof Error) || error.name !== 'AdminApiError') return undefined;
  return Reflect.get(error, field);
}

/**
 * Returns the API client's safe message for errors it raised on purpose
 * (session ended, rate limited, timeout ...). Any other error, including
 * plain `Error`s that may carry raw server text, yields null.
 */
function safeUserMessage(error: unknown): string | null {
  const candidate = apiErrorField(error, 'userMessage');
  return typeof candidate === 'string' ? candidate : null;
}

function isAborted(error: unknown): boolean {
  return apiErrorField(error, 'code') === 'aborted';
}

async function runRequest<T>(
  dispatch: DomainDispatch,
  getState: () => DomainState,
  key: string,
  copy: ActionCopy<T>,
  work: () => Promise<T>,
  toast = true
): Promise<T | null> {
  // Ignore a duplicate trigger (double click) while the same request runs.
  if (getState().requests[key]?.status === 'pending') return null;

  dispatch(requestStarted(key));
  let result: T;
  try {
    result = await work();
  } catch (error) {
    if (isAborted(error)) {
      // Cancelled by the admin: settle the request without an error toast.
      dispatch(requestSucceeded(key));
      return null;
    }
    const message = safeUserMessage(error) ?? copy.error;
    dispatch(requestFailed(key, message));
    dispatch(pushToast('error', message));
    return null;
  }
  dispatch(requestSucceeded(key));
  const success = typeof copy.success === 'function' ? copy.success(result) : copy.success;
  if (toast && success !== null) dispatch(pushToast('success', success));
  return result;
}

/** Same shape as the client's AdminApiError for a cancelled request. */
class Cancelled extends Error {
  readonly code = 'aborted';
  readonly userMessage = null;
  constructor() {
    super('The request was cancelled.');
    this.name = 'AdminApiError';
  }
}

export function createAsyncActions(client: AdminApiClient): AsyncActions {
  return {
    loadEmails: () => async (dispatch, getState) => {
      await runRequest(dispatch, getState, requestKeys.emailsList, asyncActionCopy.loadEmails, async () => {
        const page = await client.listEmails();
        dispatch(emailsLoaded(page.items, page.nextCursor, false));
      });
    },

    loadMoreEmails: () => async (dispatch, getState) => {
      const cursor = getState().emails.nextCursor;
      if (cursor === null) return;
      await runRequest(
        dispatch,
        getState,
        requestKeys.emailsListMore,
        asyncActionCopy.loadMoreEmails,
        async () => {
          const page = await client.listEmails({ cursor });
          dispatch(emailsLoaded(page.items, page.nextCursor, true));
        }
      );
    },

    saveDraft: (input, options) => (dispatch, getState) =>
      runRequest(
        dispatch,
        getState,
        requestKeys.emailCreate,
        asyncActionCopy.saveDraft,
        async () => {
          const email = await client.createEmail(input);
          dispatch(emailUpserted(email));
          return email;
        },
        options?.toast ?? true
      ),

    updateDraft: (id, patch, options) => (dispatch, getState) =>
      runRequest(
        dispatch,
        getState,
        requestKeys.emailUpdate(id),
        asyncActionCopy.updateDraft,
        async () => {
          const email = await client.updateEmail(id, patch);
          dispatch(emailUpserted(email));
          return email;
        },
        options?.toast ?? true
      ),

    deleteDraft: (id) => async (dispatch, getState) => {
      await runRequest(
        dispatch,
        getState,
        requestKeys.emailDelete(id),
        asyncActionCopy.deleteDraft,
        async () => {
          await client.deleteEmail(id);
          dispatch(emailRemoved(id));
        }
      );
    },

    sendEmail: (id) => (dispatch, getState) =>
      runRequest<AdminEmailDTO>(
        dispatch,
        getState,
        requestKeys.emailSend(id),
        {
          success: (email) => asyncActionCopy.sendEmail.success(email.toEmail),
          error: asyncActionCopy.sendEmail.error,
        },
        async () => {
          try {
            const email = await client.sendEmail(id);
            dispatch(emailUpserted(email));
            return email;
          } catch (error) {
            // A failed send is stored as FAILED on the server; reload the row
            // so the list shows it. If that also fails, keep the old row.
            try {
              dispatch(emailUpserted(await client.getEmail(id)));
            } catch {
              // ignored: the error toast below already tells the admin
            }
            throw error;
          }
        }
      ),

    refreshEmailStatus: (id) => async (dispatch, getState) => {
      await runRequest(
        dispatch,
        getState,
        requestKeys.emailRefresh(id),
        asyncActionCopy.refreshEmailStatus,
        async () => {
          dispatch(emailUpserted(await client.refreshEmail(id)));
        }
      );
    },

    previewEmail: (input) => (dispatch, getState) =>
      runRequest(dispatch, getState, requestKeys.emailPreview, asyncActionCopy.previewEmail, async () => {
        const preview = await client.previewEmail(input);
        return preview.html;
      }),

    uploadAttachment: (file, options) => (dispatch, getState) =>
      runRequest(
        dispatch,
        getState,
        requestKeys.attachmentUpload,
        asyncActionCopy.uploadAttachment,
        async () => {
          const target = await client.createUploadUrl({
            filename: file.name,
            size: file.size,
            contentType: 'application/pdf',
          });
          if (options?.signal?.aborted) throw new Cancelled();
          await client.uploadFile(target.signedUrl, file, {
            onProgress: options?.onProgress,
            signal: options?.signal,
          });
          return { name: file.name, size: file.size, storagePath: target.path };
        }
      ),

    loadInbox: () => async (dispatch, getState) => {
      await runRequest(dispatch, getState, requestKeys.inboxList, asyncActionCopy.loadInbox, async () => {
        const page = await client.listInbox();
        dispatch(inboxLoaded(page.items, page.nextCursor, false));
      });
    },

    loadMoreInbox: () => async (dispatch, getState) => {
      const cursor = getState().inbox.nextCursor;
      if (cursor === null) return;
      await runRequest(
        dispatch,
        getState,
        requestKeys.inboxListMore,
        asyncActionCopy.loadMoreInbox,
        async () => {
          const page = await client.listInbox({ after: cursor });
          dispatch(inboxLoaded(page.items, page.nextCursor, true));
        }
      );
    },

    loadInboxMessage: (id) => async (dispatch, getState) => {
      await runRequest(
        dispatch,
        getState,
        requestKeys.inboxMessage(id),
        asyncActionCopy.loadInboxMessage,
        async () => {
          dispatch(inboxMessageLoaded(await client.getInboxMessage(id)));
        }
      );
    },
  };
}
