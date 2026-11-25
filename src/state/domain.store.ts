/**
 * Minimal external store for domain state. `dispatch` accepts plain actions
 * and thunks; subscribers are notified only when the root state reference
 * changes.
 */
import { domainReducer, initialDomainState } from './domain.state.ts';
import type { DomainState } from './domain.state.ts';
import type {
  DomainAction,
  DomainDispatch,
  DomainThunk,
} from './domain.action.ts';

export interface DomainStore {
  getState: () => DomainState;
  dispatch: DomainDispatch;
  subscribe: (listener: () => void) => () => void;
}

export function createDomainStore(
  preloadedState: DomainState = initialDomainState
): DomainStore {
  let state = preloadedState;
  const listeners = new Set<() => void>();

  const getState = (): DomainState => state;

  function dispatchImpl(input: DomainAction | DomainThunk<unknown>): unknown {
    if (typeof input === 'function') {
      return input(dispatch, getState);
    }
    const next = domainReducer(state, input);
    if (next !== state) {
      state = next;
      for (const listener of Array.from(listeners)) listener();
    }
    return undefined;
  }

  // The overloads in DomainDispatch are satisfied by dispatchImpl at runtime:
  // actions return undefined, thunks return their own result.
  const dispatch = dispatchImpl as DomainDispatch;

  const subscribe = (listener: () => void): (() => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  };

  return { getState, dispatch, subscribe };
}

/**
 * Builds a `getSnapshot` for `useSyncExternalStore` that returns the previous
 * selected value while the root state is unchanged, or while `isEqual` says
 * the newly selected value equals the previous one. This keeps the snapshot
 * referentially stable, so subscribers re-render only on real changes.
 */
export function createSelectedSnapshot<T>(
  getState: () => DomainState,
  selector: (state: DomainState) => T,
  isEqual: (previous: T, next: T) => boolean
): () => T {
  let memo: { state: DomainState; selected: T } | null = null;
  return () => {
    const state = getState();
    if (memo !== null && memo.state === state) return memo.selected;
    const selected = selector(state);
    if (memo !== null && isEqual(memo.selected, selected)) {
      memo = { state, selected: memo.selected };
      return memo.selected;
    }
    memo = { state, selected };
    return selected;
  };
}
