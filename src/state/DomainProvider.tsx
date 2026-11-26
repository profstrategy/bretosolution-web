'use client';

import {
  createContext,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import { adminApiClient } from '@/lib/admin/apiClient';
import {
  createAsyncActions,
  type AsyncActions,
  type DomainDispatch,
} from './domain.action';
import type { DomainSelector, DomainState } from './domain.state';
import {
  createDomainStore,
  createSelectedSnapshot,
  type DomainStore,
} from './domain.store';

export {
  selectEmailById,
  selectEmailIds,
  selectInboxIds,
  selectInboxItemById,
  selectInboxMessage,
  selectRequest,
  selectToasts,
} from './domain.state';

/** The context value is the store object, which never changes per mount. */
const DomainStoreContext = createContext<DomainStore | null>(null);

export interface DomainProviderProps {
  children: ReactNode;
  /** Optional preloaded state (e.g. for tests or server-fetched data). */
  initialState?: DomainState;
}

export function DomainProvider({ children, initialState }: DomainProviderProps) {
  // One store per mount. A lazy useState initialiser runs once and is stable;
  // the React Compiler lint rules forbid reading ref.current during render.
  const [store] = useState(() => createDomainStore(initialState));

  return (
    <DomainStoreContext.Provider value={store}>
      {children}
    </DomainStoreContext.Provider>
  );
}

function useDomainStore(): DomainStore {
  const store = useContext(DomainStoreContext);
  if (store === null) {
    throw new Error('Domain hooks must be used inside <DomainProvider>.');
  }
  return store;
}

/**
 * Subscribes to one slice of domain state. The component re-renders only
 * when the selected value changes according to `isEqual` (default
 * `Object.is`). Pass a stable selector (module-level or from the exported
 * selector factories) to avoid recomputing on every render.
 */
export function useDomainSelector<T>(
  selector: DomainSelector<T>,
  isEqual: (previous: T, next: T) => boolean = Object.is
): T {
  const store = useDomainStore();

  const getSnapshot = useMemo(
    () => createSelectedSnapshot(store.getState, selector, isEqual),
    [store, selector, isEqual]
  );

  return useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot);
}

/** Stable dispatch that accepts plain actions and thunks. */
export function useDomainDispatch(): DomainDispatch {
  return useDomainStore().dispatch;
}

/** Each bound action returns what its thunk returns (a result, or null on failure). */
export type BoundAsyncActions = {
  [K in keyof AsyncActions]: (
    ...args: Parameters<AsyncActions[K]>
  ) => ReturnType<ReturnType<AsyncActions[K]>>;
};

const asyncActions: AsyncActions = createAsyncActions(adminApiClient);
const boundActionsByStore = new WeakMap<DomainStore, BoundAsyncActions>();

function bindAsyncActions(dispatch: DomainDispatch): BoundAsyncActions {
  return {
    loadEmails: () => dispatch(asyncActions.loadEmails()),
    loadMoreEmails: () => dispatch(asyncActions.loadMoreEmails()),
    saveDraft: (input, options) => dispatch(asyncActions.saveDraft(input, options)),
    updateDraft: (id, patch, options) => dispatch(asyncActions.updateDraft(id, patch, options)),
    deleteDraft: (id) => dispatch(asyncActions.deleteDraft(id)),
    sendEmail: (id) => dispatch(asyncActions.sendEmail(id)),
    refreshEmailStatus: (id) => dispatch(asyncActions.refreshEmailStatus(id)),
    previewEmail: (input) => dispatch(asyncActions.previewEmail(input)),
    uploadAttachment: (file, options) => dispatch(asyncActions.uploadAttachment(file, options)),
    loadInbox: () => dispatch(asyncActions.loadInbox()),
    loadMoreInbox: () => dispatch(asyncActions.loadMoreInbox()),
    loadInboxMessage: (id) => dispatch(asyncActions.loadInboxMessage(id)),
  };
}

/** Async actions bound to this provider's store; the object is stable. */
export function useDomainActions(): BoundAsyncActions {
  const store = useDomainStore();
  let bound = boundActionsByStore.get(store);
  if (bound === undefined) {
    bound = bindAsyncActions(store.dispatch);
    boundActionsByStore.set(store, bound);
  }
  return bound;
}
