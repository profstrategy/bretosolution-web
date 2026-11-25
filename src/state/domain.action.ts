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
  DraftInput,
  DraftPatch,
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
  updateDraft: { success: 'Draft updated.', error: "Couldn't update the draft." },
  deleteDraft: { success: 'Draft deleted.', error: "Couldn't delete the draft." },
  sendEmail: { success: 'Email is on its way.', error: "Couldn't send the email." },
  refreshEmailStatus: { success: 'Status updated.', error: "Couldn't refresh the status." },
  loadInbox: { success: 'Inbox loaded.', error: "Couldn't load the inbox." },
  loadMoreInbox: { success: 'More messages loaded.', error: "Couldn't load more messages." },
  loadInboxMessage: { success: 'Message loaded.', error: "Couldn't open the message." },
} as const;

interface ActionCopy {
  success: string;
  error: string;
}

export interface AsyncActions {
  loadEmails(): DomainThunk;
  loadMoreEmails(): DomainThunk;
  saveDraft(input: DraftInput): DomainThunk;
  updateDraft(id: string, patch: DraftPatch): DomainThunk;
  deleteDraft(id: string): DomainThunk;
  sendEmail(id: string): DomainThunk;
  refreshEmailStatus(id: string): DomainThunk;
  loadInbox(): DomainThunk;
  loadMoreInbox(): DomainThunk;
  loadInboxMessage(id: string): DomainThunk;
}

/**
 * Returns the API client's safe message for errors it raised on purpose
 * (session ended, rate limited, timeout ...). Any other error, including
 * plain `Error`s that may carry raw server text, yields null.
 */
function safeUserMessage(error: unknown): string | null {
  if (!(error instanceof Error) || error.name !== 'AdminApiError') return null;
  const candidate: unknown = Reflect.get(error, 'userMessage');
  return typeof candidate === 'string' ? candidate : null;
}

async function runRequest(
  dispatch: DomainDispatch,
  getState: () => DomainState,
  key: string,
  copy: ActionCopy,
  work: () => Promise<void>
): Promise<void> {
  // Ignore a duplicate trigger (double click) while the same request runs.
  if (getState().requests[key]?.status === 'pending') return;

  dispatch(requestStarted(key));
  try {
    await work();
  } catch (error) {
    const message = safeUserMessage(error) ?? copy.error;
    dispatch(requestFailed(key, message));
    dispatch(pushToast('error', message));
    return;
  }
  dispatch(requestSucceeded(key));
  dispatch(pushToast('success', copy.success));
}

export function createAsyncActions(client: AdminApiClient): AsyncActions {
  return {
    loadEmails: () => (dispatch, getState) =>
      runRequest(dispatch, getState, requestKeys.emailsList, asyncActionCopy.loadEmails, async () => {
        const page = await client.listEmails();
        dispatch(emailsLoaded(page.items, page.nextCursor, false));
      }),

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

    saveDraft: (input) => (dispatch, getState) =>
      runRequest(dispatch, getState, requestKeys.emailCreate, asyncActionCopy.saveDraft, async () => {
        dispatch(emailUpserted(await client.createEmail(input)));
      }),

    updateDraft: (id, patch) => (dispatch, getState) =>
      runRequest(
        dispatch,
        getState,
        requestKeys.emailUpdate(id),
        asyncActionCopy.updateDraft,
        async () => {
          dispatch(emailUpserted(await client.updateEmail(id, patch)));
        }
      ),

    deleteDraft: (id) => (dispatch, getState) =>
      runRequest(
        dispatch,
        getState,
        requestKeys.emailDelete(id),
        asyncActionCopy.deleteDraft,
        async () => {
          await client.deleteEmail(id);
          dispatch(emailRemoved(id));
        }
      ),

    sendEmail: (id) => (dispatch, getState) =>
      runRequest(
        dispatch,
        getState,
        requestKeys.emailSend(id),
        asyncActionCopy.sendEmail,
        async () => {
          dispatch(emailUpserted(await client.sendEmail(id)));
        }
      ),

    refreshEmailStatus: (id) => (dispatch, getState) =>
      runRequest(
        dispatch,
        getState,
        requestKeys.emailRefresh(id),
        asyncActionCopy.refreshEmailStatus,
        async () => {
          dispatch(emailUpserted(await client.refreshEmail(id)));
        }
      ),

    loadInbox: () => (dispatch, getState) =>
      runRequest(dispatch, getState, requestKeys.inboxList, asyncActionCopy.loadInbox, async () => {
        const page = await client.listInbox();
        dispatch(inboxLoaded(page.items, page.nextCursor, false));
      }),

    loadMoreInbox: () => async (dispatch, getState) => {
      const cursor = getState().inbox.nextCursor;
      if (cursor === null) return;
      await runRequest(
        dispatch,
        getState,
        requestKeys.inboxListMore,
        asyncActionCopy.loadMoreInbox,
        async () => {
          const page = await client.listInbox({ cursor });
          dispatch(inboxLoaded(page.items, page.nextCursor, true));
        }
      );
    },

    loadInboxMessage: (id) => (dispatch, getState) =>
      runRequest(
        dispatch,
        getState,
        requestKeys.inboxMessage(id),
        asyncActionCopy.loadInboxMessage,
        async () => {
          dispatch(inboxMessageLoaded(await client.getInboxMessage(id)));
        }
      ),
  };
}
