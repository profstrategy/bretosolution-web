/**
 * Domain state for the admin dashboard: data from or for the server, request
 * status and toasts. UI state (open modals, active tab, typed text, form
 * fields) does not belong here.
 *
 * Every reducer is pure, never mutates, and returns the same reference when an
 * action changes nothing, so `useSyncExternalStore` subscribers do not
 * re-render needlessly.
 *
 * This file is loaded directly by `node --test` (type stripping), so it uses
 * only erasable TypeScript syntax and type-only imports.
 */
import type { DomainAction } from './domain.action';

// ---------------------------------------------------------------------------
// DTOs returned by the Stage 4 admin API (dates are ISO-8601 strings)
// ---------------------------------------------------------------------------

export type AdminEmailKind = 'AUDIT' | 'QUOTE' | 'GENERAL';
export type AdminEmailStatus = 'DRAFT' | 'SENDING' | 'SENT' | 'FAILED';

export interface AdminEmailRowDTO {
  label: string;
  value: string;
}

export interface AdminEmailAttachmentDTO {
  name: string;
  size: number;
}

export interface AdminEmailSourceDTO {
  type: 'AUDIT' | 'QUOTE';
  id: string;
}

export interface AdminEmailDTO {
  id: string;
  kind: AdminEmailKind;
  status: AdminEmailStatus;
  toEmail: string;
  recipientName: string;
  businessName: string;
  subject: string;
  bodyHtml: string;
  calendlyUrl: string | null;
  rows: AdminEmailRowDTO[];
  attachment: AdminEmailAttachmentDTO | null;
  /** RFC Message-ID this email replies to (threads it in the recipient's client). */
  inReplyToMessageId: string | null;
  /** The website request this email answers; drives the footer reason line. */
  source: AdminEmailSourceDTO | null;
  /** Latest Resend delivery event, e.g. "delivered"; null before sending. */
  lastEvent: string | null;
  /** Safe, server-written failure message; never raw provider text. */
  error: string | null;
  sentAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InboxItemDTO {
  id: string;
  from: string;
  to: string[];
  subject: string;
  createdAt: string;
  attachmentCount: number;
}

export interface InboxAttachmentDTO {
  id: string;
  filename: string;
  contentType: string;
  size: number;
}

export interface InboxMessageDTO {
  id: string;
  from: string;
  to: string[];
  subject: string;
  createdAt: string;
  html: string | null;
  text: string | null;
  attachments: InboxAttachmentDTO[];
  messageId: string;
  /** true when remote images were present (removed unless requested). */
  hasRemoteImages: boolean;
}

// ---------------------------------------------------------------------------
// Slice state shapes
// ---------------------------------------------------------------------------

export interface NormalizedList<T> {
  byId: Record<string, T>;
  order: string[];
  nextCursor: string | null;
  loaded: boolean;
}

export type EmailsState = NormalizedList<AdminEmailDTO>;

/** Set when the API reports that Resend receiving is not available. */
export type InboxNotice = 'receiving-not-configured';

export interface InboxState extends NormalizedList<InboxItemDTO> {
  messageById: Record<string, InboxMessageDTO>;
  notice: InboxNotice | null;
}

export type RequestStatus = 'idle' | 'pending' | 'success' | 'error';

export interface RequestState {
  status: RequestStatus;
  error?: string;
}

export type RequestsState = Record<string, RequestState>;

export type ToastKind = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  kind: ToastKind;
  message: string;
  createdAt: number;
}

export interface ToastsState {
  items: Toast[];
}

export interface DomainState {
  emails: EmailsState;
  inbox: InboxState;
  requests: RequestsState;
  toasts: ToastsState;
}

// ---------------------------------------------------------------------------
// combineSlices (local, no Redux)
// ---------------------------------------------------------------------------

export type SliceReducer<S> = (state: S, action: DomainAction) => S;

export interface Slice<S> {
  initialState: S;
  reducer: SliceReducer<S>;
}

export type SliceMap<S> = { [K in keyof S]: Slice<S[K]> };

/**
 * Combines slices into one reducer. The root object is replaced only when at
 * least one slice returns a new reference.
 */
export function combineSlices<S extends object>(
  slices: SliceMap<S>
): { reducer: (state: S, action: DomainAction) => S; initialState: S } {
  const keys = Object.keys(slices) as (keyof S)[];
  const initialState = {} as S;
  for (const key of keys) {
    initialState[key] = slices[key].initialState;
  }

  function reducer(state: S, action: DomainAction): S {
    let next: S | null = null;
    for (const key of keys) {
      const previousSlice = state[key];
      const nextSlice = slices[key].reducer(previousSlice, action);
      if (nextSlice !== previousSlice) {
        if (next === null) next = { ...state };
        next[key] = nextSlice;
      }
    }
    return next ?? state;
  }

  return { reducer, initialState };
}

// ---------------------------------------------------------------------------
// Shared normalised-list helpers
// ---------------------------------------------------------------------------

function createList<T>(): NormalizedList<T> {
  return { byId: {}, order: [], nextCursor: null, loaded: false };
}

function sameIds(a: readonly string[], b: readonly string[]): boolean {
  if (a.length !== b.length) return false;
  for (let index = 0; index < a.length; index += 1) {
    if (a[index] !== b[index]) return false;
  }
  return true;
}

/** Applies a page of items. `append` keeps existing items (load more). */
function applyPage<T extends { id: string }, L extends NormalizedList<T>>(
  state: L,
  items: readonly T[],
  nextCursor: string | null,
  append: boolean
): L {
  if (append) {
    let byId: Record<string, T> | null = null;
    const addedIds: string[] = [];
    for (const item of items) {
      const existing = state.byId[item.id];
      if (existing !== item) {
        if (byId === null) byId = { ...state.byId };
        byId[item.id] = item;
      }
      if (existing === undefined && !addedIds.includes(item.id)) {
        addedIds.push(item.id);
      }
    }
    if (
      byId === null &&
      addedIds.length === 0 &&
      state.nextCursor === nextCursor &&
      state.loaded
    ) {
      return state;
    }
    return {
      ...state,
      byId: byId ?? state.byId,
      order: addedIds.length > 0 ? [...state.order, ...addedIds] : state.order,
      nextCursor,
      loaded: true,
    };
  }

  const order: string[] = [];
  const byId: Record<string, T> = {};
  let unchanged = state.loaded && state.nextCursor === nextCursor;
  for (const item of items) {
    if (byId[item.id] === undefined) order.push(item.id);
    byId[item.id] = item;
    if (state.byId[item.id] !== item) unchanged = false;
  }
  if (unchanged && sameIds(order, state.order)) return state;

  return { ...state, byId, order, nextCursor, loaded: true };
}

// ---------------------------------------------------------------------------
// Slices
// ---------------------------------------------------------------------------

export const initialEmailsState: EmailsState = createList<AdminEmailDTO>();

export function emailsReducer(
  state: EmailsState,
  action: DomainAction
): EmailsState {
  switch (action.type) {
    case 'emails/loaded':
      return applyPage(
        state,
        action.payload.items,
        action.payload.nextCursor,
        action.payload.append
      );
    case 'emails/upserted': {
      const { email } = action.payload;
      const existing = state.byId[email.id];
      if (existing === email) return state;
      return {
        ...state,
        byId: { ...state.byId, [email.id]: email },
        // New emails (e.g. a fresh draft) appear first; existing keep place.
        order: existing === undefined ? [email.id, ...state.order] : state.order,
      };
    }
    case 'emails/removed': {
      const { id } = action.payload;
      if (state.byId[id] === undefined) return state;
      const byId = { ...state.byId };
      delete byId[id];
      return { ...state, byId, order: state.order.filter((item) => item !== id) };
    }
    default:
      return state;
  }
}

export const initialInboxState: InboxState = {
  ...createList<InboxItemDTO>(),
  messageById: {},
  notice: null,
};

export function inboxReducer(state: InboxState, action: DomainAction): InboxState {
  switch (action.type) {
    case 'inbox/loaded': {
      const next = applyPage(
        state,
        action.payload.items,
        action.payload.nextCursor,
        action.payload.append
      );
      // A first page sets (or clears) the notice; "load more" keeps it.
      const notice = action.payload.append ? state.notice : (action.payload.notice ?? null);
      return notice === next.notice ? next : { ...next, notice };
    }
    case 'inbox/messageLoaded': {
      const { message } = action.payload;
      if (state.messageById[message.id] === message) return state;
      return {
        ...state,
        messageById: { ...state.messageById, [message.id]: message },
      };
    }
    default:
      return state;
  }
}

export const initialRequestsState: RequestsState = {};

function setRequest(
  state: RequestsState,
  key: string,
  next: RequestState
): RequestsState {
  const current = state[key];
  if (
    current !== undefined &&
    current.status === next.status &&
    current.error === next.error
  ) {
    return state;
  }
  return { ...state, [key]: next };
}

export function requestsReducer(
  state: RequestsState,
  action: DomainAction
): RequestsState {
  switch (action.type) {
    case 'requests/started':
      return setRequest(state, action.payload.key, { status: 'pending' });
    case 'requests/succeeded':
      return setRequest(state, action.payload.key, { status: 'success' });
    case 'requests/failed':
      return setRequest(state, action.payload.key, {
        status: 'error',
        error: action.payload.error,
      });
    default:
      return state;
  }
}

export const initialToastsState: ToastsState = { items: [] };

export function toastsReducer(state: ToastsState, action: DomainAction): ToastsState {
  switch (action.type) {
    case 'toasts/pushed': {
      const { toast } = action.payload;
      if (state.items.some((item) => item.id === toast.id)) return state;
      return { items: [...state.items, toast] };
    }
    case 'toasts/dismissed': {
      const { id } = action.payload;
      if (!state.items.some((item) => item.id === id)) return state;
      return { items: state.items.filter((item) => item.id !== id) };
    }
    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Root reducer
// ---------------------------------------------------------------------------

const root = combineSlices<DomainState>({
  emails: { initialState: initialEmailsState, reducer: emailsReducer },
  inbox: { initialState: initialInboxState, reducer: inboxReducer },
  requests: { initialState: initialRequestsState, reducer: requestsReducer },
  toasts: { initialState: initialToastsState, reducer: toastsReducer },
});

export const domainReducer = root.reducer;
export const initialDomainState: DomainState = root.initialState;

// ---------------------------------------------------------------------------
// Selectors (stable function identities; results are references from state)
// ---------------------------------------------------------------------------

export type DomainSelector<T> = (state: DomainState) => T;

const IDLE_REQUEST: RequestState = Object.freeze({ status: 'idle' });

function memoByKey<T>(
  create: (key: string) => DomainSelector<T>
): (key: string) => DomainSelector<T> {
  const cache = new Map<string, DomainSelector<T>>();
  return (key) => {
    let selector = cache.get(key);
    if (selector === undefined) {
      selector = create(key);
      cache.set(key, selector);
    }
    return selector;
  };
}

export const selectEmailIds: DomainSelector<string[]> = (state) =>
  state.emails.order;

export const selectEmailsLoaded: DomainSelector<boolean> = (state) => state.emails.loaded;
export const selectEmailsNextCursor: DomainSelector<string | null> = (state) =>
  state.emails.nextCursor;

export const selectInboxLoaded: DomainSelector<boolean> = (state) => state.inbox.loaded;
export const selectInboxNextCursor: DomainSelector<string | null> = (state) =>
  state.inbox.nextCursor;
export const selectInboxNotice: DomainSelector<InboxNotice | null> = (state) =>
  state.inbox.notice;

/** "12", or "20+" when more pages exist; null before the first load. */
function countLabel(list: NormalizedList<unknown>): string | null {
  if (!list.loaded) return null;
  return `${list.order.length}${list.nextCursor ? '+' : ''}`;
}
export const selectEmailCountLabel: DomainSelector<string | null> = (state) =>
  countLabel(state.emails);
export const selectInboxCountLabel: DomainSelector<string | null> = (state) =>
  countLabel(state.inbox);

export const selectEmailById = memoByKey<AdminEmailDTO | null>(
  (id) => (state) => state.emails.byId[id] ?? null
);

export const selectInboxIds: DomainSelector<string[]> = (state) =>
  state.inbox.order;

export const selectInboxItemById = memoByKey<InboxItemDTO | null>(
  (id) => (state) => state.inbox.byId[id] ?? null
);

export const selectInboxMessage = memoByKey<InboxMessageDTO | null>(
  (id) => (state) => state.inbox.messageById[id] ?? null
);

export const selectRequest = memoByKey<RequestState>(
  (key) => (state) => state.requests[key] ?? IDLE_REQUEST
);

export const selectToasts: DomainSelector<Toast[]> = (state) =>
  state.toasts.items;
