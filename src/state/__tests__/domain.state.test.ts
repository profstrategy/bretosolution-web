import { afterEach, beforeEach, describe, mock, test } from 'node:test';
import assert from 'node:assert/strict';
import type { AdminApiClient, Page } from '@/lib/admin/apiClient';
import type {
  AdminEmailDTO,
  DomainState,
  InboxItemDTO,
  InboxMessageDTO,
} from '../domain.state.ts';
import {
  combineSlices,
  domainReducer,
  initialDomainState,
  selectEmailById,
  selectEmailIds,
  selectInboxIds,
  selectInboxItemById,
  selectInboxMessage,
  selectRequest,
  selectToasts,
} from '../domain.state.ts';
import {
  asyncActionCopy,
  createAsyncActions,
  emailRemoved,
  emailUpserted,
  emailsLoaded,
  inboxLoaded,
  inboxMessageLoaded,
  pushToast,
  requestFailed,
  requestKeys,
  requestStarted,
  requestSucceeded,
  TOAST_AUTO_DISMISS_MS,
  toastDismissed,
  toastPushed,
} from '../domain.action.ts';
import type { DomainAction } from '../domain.action.ts';
import { createDomainStore, createSelectedSnapshot } from '../domain.store.ts';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function email(id: string, overrides: Partial<AdminEmailDTO> = {}): AdminEmailDTO {
  return {
    id,
    kind: 'GENERAL',
    status: 'DRAFT',
    toEmail: `${id}@example.com`,
    recipientName: 'Sample Owner',
    businessName: 'Sample Kitchen',
    subject: `Subject ${id}`,
    bodyHtml: '<p>Hello</p>',
    calendlyUrl: null,
    rows: [],
    attachment: null,
    inReplyToMessageId: null,
    source: null,
    lastEvent: null,
    error: null,
    sentAt: null,
    createdAt: '2026-11-25T00:00:00.000Z',
    updatedAt: '2026-11-25T00:00:00.000Z',
    ...overrides,
  };
}

function inboxItem(id: string): InboxItemDTO {
  return {
    id,
    from: 'customer@example.com',
    to: ['hello@example.com'],
    subject: `Inbound ${id}`,
    createdAt: '2026-11-25T00:00:00.000Z',
    attachmentCount: 0,
  };
}

function inboxMessage(id: string): InboxMessageDTO {
  return {
    id,
    from: 'customer@example.com',
    to: ['hello@example.com'],
    subject: `Inbound ${id}`,
    createdAt: '2026-11-25T00:00:00.000Z',
    html: '<p>Hi</p>',
    text: 'Hi',
    attachments: [],
    messageId: `<${id}@example.com>`,
    hasRemoteImages: false,
  };
}

function reduce(actions: DomainAction[], state: DomainState = initialDomainState): DomainState {
  return actions.reduce(domainReducer, state);
}

// ---------------------------------------------------------------------------
// Root and combineSlices
// ---------------------------------------------------------------------------

describe('initial state and combineSlices', () => {
  test('initial state has every slice', () => {
    assert.deepEqual(initialDomainState, {
      emails: { byId: {}, order: [], nextCursor: null, loaded: false },
      inbox: { byId: {}, order: [], nextCursor: null, loaded: false, messageById: {} },
      requests: {},
      toasts: { items: [] },
    });
  });

  test('an action that changes nothing returns the same root reference', () => {
    assert.equal(domainReducer(initialDomainState, toastDismissed('missing')), initialDomainState);
    assert.equal(domainReducer(initialDomainState, emailRemoved('missing')), initialDomainState);
  });

  test('only the changed slice gets a new reference', () => {
    const next = domainReducer(initialDomainState, requestStarted('emails/list'));
    assert.notEqual(next, initialDomainState);
    assert.notEqual(next.requests, initialDomainState.requests);
    assert.equal(next.emails, initialDomainState.emails);
    assert.equal(next.inbox, initialDomainState.inbox);
    assert.equal(next.toasts, initialDomainState.toasts);
  });

  test('combineSlices builds initial state and reducer from slices', () => {
    const counter = combineSlices<{ count: number; label: string }>({
      count: {
        initialState: 0,
        reducer: (state, action) => (action.type === 'requests/started' ? state + 1 : state),
      },
      label: { initialState: 'x', reducer: (state) => state },
    });
    assert.deepEqual(counter.initialState, { count: 0, label: 'x' });
    const next = counter.reducer(counter.initialState, requestStarted('k'));
    assert.deepEqual(next, { count: 1, label: 'x' });
    assert.equal(counter.reducer(next, toastDismissed('k')), next);
  });

  test('reducers never mutate the previous state', () => {
    const before = reduce([emailsLoaded([email('a')], 'c1')]);
    const snapshot = structuredClone(before);
    reduce([emailUpserted(email('b')), emailRemoved('a'), requestStarted('k'), toastPushed({ id: 't', kind: 'info', message: 'm', createdAt: 1 })], before);
    assert.deepEqual(before, snapshot);
  });
});

// ---------------------------------------------------------------------------
// emails slice
// ---------------------------------------------------------------------------

describe('emails slice', () => {
  test('emails/loaded replaces the list and records the cursor', () => {
    const a = email('a');
    const b = email('b');
    const state = reduce([emailsLoaded([email('old')], null), emailsLoaded([a, b], 'cursor-1')]);
    assert.deepEqual(state.emails.order, ['a', 'b']);
    assert.deepEqual(Object.keys(state.emails.byId), ['a', 'b']);
    assert.equal(state.emails.byId.a, a);
    assert.equal(state.emails.nextCursor, 'cursor-1');
    assert.equal(state.emails.loaded, true);
  });

  test('emails/loaded with the same items and cursor returns the same reference', () => {
    const a = email('a');
    const state = reduce([emailsLoaded([a], 'c1')]);
    assert.equal(domainReducer(state, emailsLoaded([a], 'c1')), state);
  });

  test('emails/loaded marks an empty first page as loaded', () => {
    const state = reduce([emailsLoaded([], null)]);
    assert.equal(state.emails.loaded, true);
    assert.equal(domainReducer(state, emailsLoaded([], null)), state);
  });

  test('emails/loaded with append adds new ids, updates existing and moves the cursor', () => {
    const a = email('a');
    const state = reduce([emailsLoaded([a], 'c1')]);
    const a2 = email('a', { subject: 'changed' });
    const c = email('c');
    const next = domainReducer(state, emailsLoaded([a2, c], null, true));
    assert.deepEqual(next.emails.order, ['a', 'c']);
    assert.equal(next.emails.byId.a, a2);
    assert.equal(next.emails.nextCursor, null);
  });

  test('emails/loaded with append and nothing new returns the same reference', () => {
    const a = email('a');
    const state = reduce([emailsLoaded([a], 'c1')]);
    assert.equal(domainReducer(state, emailsLoaded([a], 'c1', true)), state);
  });

  test('emails/upserted prepends a new email', () => {
    const state = reduce([emailsLoaded([email('a')], null), emailUpserted(email('new'))]);
    assert.deepEqual(state.emails.order, ['new', 'a']);
  });

  test('emails/upserted replaces an existing email in place', () => {
    const state = reduce([emailsLoaded([email('a'), email('b')], null)]);
    const b2 = email('b', { status: 'SENT' });
    const next = domainReducer(state, emailUpserted(b2));
    assert.deepEqual(next.emails.order, ['a', 'b']);
    assert.equal(next.emails.order, state.emails.order);
    assert.equal(next.emails.byId.b, b2);
  });

  test('emails/upserted with the identical object returns the same reference', () => {
    const a = email('a');
    const state = reduce([emailUpserted(a)]);
    assert.equal(domainReducer(state, emailUpserted(a)), state);
  });

  test('emails/removed deletes the email from byId and order', () => {
    const state = reduce([emailsLoaded([email('a'), email('b')], null), emailRemoved('a')]);
    assert.deepEqual(state.emails.order, ['b']);
    assert.equal(state.emails.byId.a, undefined);
  });

  test('emails/removed for an unknown id returns the same reference', () => {
    const state = reduce([emailsLoaded([email('a')], null)]);
    assert.equal(domainReducer(state, emailRemoved('zzz')), state);
  });
});

// ---------------------------------------------------------------------------
// inbox slice
// ---------------------------------------------------------------------------

describe('inbox slice', () => {
  test('inbox/loaded replaces and appends pages', () => {
    const first = reduce([inboxLoaded([inboxItem('1'), inboxItem('2')], 'c1')]);
    assert.deepEqual(first.inbox.order, ['1', '2']);
    assert.equal(first.inbox.nextCursor, 'c1');
    const second = domainReducer(first, inboxLoaded([inboxItem('3')], null, true));
    assert.deepEqual(second.inbox.order, ['1', '2', '3']);
    assert.equal(second.inbox.nextCursor, null);
    assert.equal(second.inbox.messageById, first.inbox.messageById);
  });

  test('inbox/loaded with identical data returns the same reference', () => {
    const item = inboxItem('1');
    const state = reduce([inboxLoaded([item], null)]);
    assert.equal(domainReducer(state, inboxLoaded([item], null)), state);
    assert.equal(domainReducer(state, inboxLoaded([item], null, true)), state);
  });

  test('inbox/messageLoaded stores the body by id', () => {
    const message = inboxMessage('1');
    const state = reduce([inboxMessageLoaded(message)]);
    assert.equal(state.inbox.messageById['1'], message);
    assert.equal(state.inbox.order, initialDomainState.inbox.order);
  });

  test('inbox/messageLoaded with the identical object returns the same reference', () => {
    const message = inboxMessage('1');
    const state = reduce([inboxMessageLoaded(message)]);
    assert.equal(domainReducer(state, inboxMessageLoaded(message)), state);
  });
});

// ---------------------------------------------------------------------------
// requests slice
// ---------------------------------------------------------------------------

describe('requests slice lifecycle', () => {
  test('started -> succeeded', () => {
    const pending = reduce([requestStarted('emails/list')]);
    assert.deepEqual(pending.requests['emails/list'], { status: 'pending' });
    const done = domainReducer(pending, requestSucceeded('emails/list'));
    assert.deepEqual(done.requests['emails/list'], { status: 'success' });
  });

  test('started -> failed keeps the error, and a retry clears it', () => {
    const failed = reduce([requestStarted('emails/send:1'), requestFailed('emails/send:1', 'No')]);
    assert.deepEqual(failed.requests['emails/send:1'], { status: 'error', error: 'No' });
    const retry = domainReducer(failed, requestStarted('emails/send:1'));
    assert.deepEqual(retry.requests['emails/send:1'], { status: 'pending' });
  });

  test('repeating the same status returns the same reference', () => {
    const pending = reduce([requestStarted('k')]);
    assert.equal(domainReducer(pending, requestStarted('k')), pending);
    const failed = domainReducer(pending, requestFailed('k', 'e'));
    assert.equal(domainReducer(failed, requestFailed('k', 'e')), failed);
    assert.notEqual(domainReducer(failed, requestFailed('k', 'other')), failed);
  });

  test('keys are independent', () => {
    const state = reduce([requestStarted('a'), requestSucceeded('b')]);
    assert.equal(state.requests.a?.status, 'pending');
    assert.equal(state.requests.b?.status, 'success');
  });
});

// ---------------------------------------------------------------------------
// toasts slice and pushToast
// ---------------------------------------------------------------------------

describe('toasts', () => {
  test('toasts/pushed appends and toasts/dismissed removes', () => {
    const one = { id: 't1', kind: 'info' as const, message: 'Hi', createdAt: 1 };
    const two = { id: 't2', kind: 'error' as const, message: 'Oops', createdAt: 2 };
    const state = reduce([toastPushed(one), toastPushed(two)]);
    assert.deepEqual(state.toasts.items, [one, two]);
    const next = domainReducer(state, toastDismissed('t1'));
    assert.deepEqual(next.toasts.items, [two]);
  });

  test('a duplicate toast id or unknown dismiss returns the same reference', () => {
    const toast = { id: 't1', kind: 'info' as const, message: 'Hi', createdAt: 1 };
    const state = reduce([toastPushed(toast)]);
    assert.equal(domainReducer(state, toastPushed(toast)), state);
    assert.equal(domainReducer(state, toastDismissed('nope')), state);
  });

  describe('pushToast thunk', () => {
    beforeEach(() => mock.timers.enable({ apis: ['setTimeout'] }));
    afterEach(() => mock.timers.reset());

    test('assigns unique ids and auto-dismisses success and info after 5 s', () => {
      const store = createDomainStore();
      const successId = store.dispatch(pushToast('success', 'Saved.'));
      const infoId = store.dispatch(pushToast('info', 'FYI.'));
      assert.notEqual(successId, infoId);
      assert.deepEqual(store.getState().toasts.items.map((t) => t.id), [successId, infoId]);

      mock.timers.tick(TOAST_AUTO_DISMISS_MS - 1);
      assert.equal(store.getState().toasts.items.length, 2);
      mock.timers.tick(1);
      assert.equal(store.getState().toasts.items.length, 0);
    });

    test('error toasts stay until dismissed', () => {
      const store = createDomainStore();
      const id = store.dispatch(pushToast('error', 'Failed.'));
      mock.timers.tick(TOAST_AUTO_DISMISS_MS * 10);
      assert.equal(store.getState().toasts.items.length, 1);
      store.dispatch(toastDismissed(id));
      assert.equal(store.getState().toasts.items.length, 0);
    });
  });
});

// ---------------------------------------------------------------------------
// Selectors
// ---------------------------------------------------------------------------

describe('selectors', () => {
  test('parameterised selectors are stable per key', () => {
    assert.equal(selectEmailById('a'), selectEmailById('a'));
    assert.notEqual(selectEmailById('a'), selectEmailById('b'));
    assert.equal(selectRequest('k'), selectRequest('k'));
    assert.equal(selectInboxMessage('m'), selectInboxMessage('m'));
  });

  test('selectors return references from state and a stable idle request', () => {
    const a = email('a');
    const item = inboxItem('1');
    const message = inboxMessage('1');
    const state = reduce([emailsLoaded([a], null), inboxLoaded([item], null), inboxMessageLoaded(message)]);
    assert.equal(selectEmailIds(state), state.emails.order);
    assert.equal(selectEmailById('a')(state), a);
    assert.equal(selectEmailById('missing')(state), null);
    assert.equal(selectInboxIds(state), state.inbox.order);
    assert.equal(selectInboxItemById('1')(state), item);
    assert.equal(selectInboxMessage('1')(state), message);
    assert.equal(selectInboxMessage('2')(state), null);
    assert.equal(selectToasts(state), state.toasts.items);
    assert.equal(selectRequest('x')(state), selectRequest('x')(initialDomainState));
    assert.deepEqual(selectRequest('x')(state), { status: 'idle' });
  });
});

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

describe('store', () => {
  test('notifies subscribers only when state changes, and unsubscribes', () => {
    const store = createDomainStore();
    let calls = 0;
    const unsubscribe = store.subscribe(() => {
      calls += 1;
    });
    store.dispatch(requestStarted('k'));
    store.dispatch(requestStarted('k'));
    assert.equal(calls, 1);
    unsubscribe();
    store.dispatch(requestSucceeded('k'));
    assert.equal(calls, 1);
  });

  test('createSelectedSnapshot keeps the same value until the selection changes', () => {
    const store = createDomainStore();
    let selectorCalls = 0;
    const getSnapshot = createSelectedSnapshot(
      store.getState,
      (state) => {
        selectorCalls += 1;
        return state.emails.order;
      },
      Object.is
    );
    const first = getSnapshot();
    assert.equal(getSnapshot(), first);
    assert.equal(selectorCalls, 1, 'same root state reuses the memo');

    store.dispatch(requestStarted('k'));
    assert.equal(getSnapshot(), first, 'unrelated slice change keeps the reference');

    store.dispatch(emailUpserted(email('a')));
    assert.notEqual(getSnapshot(), first);
  });

  test('createSelectedSnapshot honours a custom isEqual', () => {
    const store = createDomainStore();
    const getSnapshot = createSelectedSnapshot(
      store.getState,
      (state) => ({ count: state.emails.order.length }),
      (a, b) => a.count === b.count
    );
    const first = getSnapshot();
    store.dispatch(requestStarted('k'));
    assert.equal(getSnapshot(), first);
    store.dispatch(emailUpserted(email('a')));
    assert.deepEqual(getSnapshot(), { count: 1 });
  });

  test('dispatch runs thunks with dispatch and getState and returns their result', () => {
    const store = createDomainStore();
    const result = store.dispatch((dispatch, getState) => {
      dispatch(requestStarted('k'));
      return getState().requests.k?.status;
    });
    assert.equal(result, 'pending');
  });
});

// ---------------------------------------------------------------------------
// Async actions with a stub API client
// ---------------------------------------------------------------------------

class FakeApiError extends Error {
  userMessage: string | null;
  constructor(userMessage: string | null) {
    super('raw server text that must never be shown');
    this.name = 'AdminApiError';
    this.userMessage = userMessage;
  }
}

function notImplemented(): never {
  throw new Error('not used in this test');
}

function stubClient(overrides: Partial<AdminApiClient>): AdminApiClient {
  return {
    listEmails: notImplemented,
    createEmail: notImplemented,
    getEmail: notImplemented,
    updateEmail: notImplemented,
    deleteEmail: notImplemented,
    sendEmail: notImplemented,
    refreshEmail: notImplemented,
    previewEmail: notImplemented,
    createUploadUrl: notImplemented,
    uploadFile: notImplemented,
    listInbox: notImplemented,
    getInboxMessage: notImplemented,
    ...overrides,
  };
}

describe('async actions', () => {
  beforeEach(() => mock.timers.enable({ apis: ['setTimeout'] }));
  afterEach(() => mock.timers.reset());

  test('loadEmails: started -> loaded -> succeeded -> success toast', async () => {
    const page: Page<AdminEmailDTO> = { items: [email('a')], nextCursor: 'c1' };
    const actions = createAsyncActions(stubClient({ listEmails: async () => page }));
    const store = createDomainStore();
    const statuses: string[] = [];
    store.subscribe(() => {
      const status = store.getState().requests[requestKeys.emailsList]?.status;
      if (status && statuses[statuses.length - 1] !== status) statuses.push(status);
    });

    await store.dispatch(actions.loadEmails());

    const state = store.getState();
    assert.deepEqual(statuses, ['pending', 'success']);
    assert.deepEqual(state.emails.order, ['a']);
    assert.equal(state.emails.nextCursor, 'c1');
    assert.deepEqual(
      state.toasts.items.map((t) => [t.kind, t.message]),
      [['success', asyncActionCopy.loadEmails.success]]
    );
  });

  test('failure uses the safe API message and never raw error text', async () => {
    const actions = createAsyncActions(
      stubClient({
        sendEmail: async () => {
          throw new FakeApiError('Too many attempts. Please wait a moment and try again.');
        },
      })
    );
    const store = createDomainStore();
    await store.dispatch(actions.sendEmail('e1'));

    const request = store.getState().requests[requestKeys.emailSend('e1')];
    assert.deepEqual(request, {
      status: 'error',
      error: 'Too many attempts. Please wait a moment and try again.',
    });
    const [toast] = store.getState().toasts.items;
    assert.equal(toast?.kind, 'error');
    assert.equal(toast?.message, 'Too many attempts. Please wait a moment and try again.');
  });

  test('an unknown error falls back to the action copy', async () => {
    const actions = createAsyncActions(
      stubClient({
        deleteEmail: async () => {
          throw new Error('SQL: secret connection string');
        },
      })
    );
    const store = createDomainStore();
    await store.dispatch(actions.deleteDraft('d1'));
    const state = store.getState();
    assert.equal(state.requests[requestKeys.emailDelete('d1')]?.error, asyncActionCopy.deleteDraft.error);
    assert.equal(state.toasts.items[0]?.message, asyncActionCopy.deleteDraft.error);
    assert.ok(!JSON.stringify(state).includes('secret'));
  });

  test('an API error without a user message also falls back to the action copy', async () => {
    const actions = createAsyncActions(
      stubClient({
        refreshEmail: async () => {
          throw new FakeApiError(null);
        },
      })
    );
    const store = createDomainStore();
    await store.dispatch(actions.refreshEmailStatus('e1'));
    assert.equal(store.getState().toasts.items[0]?.message, asyncActionCopy.refreshEmailStatus.error);
  });

  test('saveDraft, updateDraft and deleteDraft keep the list in sync', async () => {
    const created = email('d1');
    const updated = email('d1', { subject: 'Updated' });
    const actions = createAsyncActions(
      stubClient({
        createEmail: async () => created,
        updateEmail: async () => updated,
        deleteEmail: async () => undefined,
      })
    );
    const store = createDomainStore();
    await store.dispatch(
      actions.saveDraft({
        kind: 'GENERAL',
        toEmail: 'x@example.com',
        recipientName: 'X',
        businessName: 'Y',
        subject: 'S',
        bodyHtml: '<p>B</p>',
        calendlyUrl: null,
        rows: [],
        attachment: null,
      })
    );
    assert.equal(store.getState().emails.byId.d1, created);
    await store.dispatch(actions.updateDraft('d1', { subject: 'Updated' }));
    assert.equal(store.getState().emails.byId.d1, updated);
    await store.dispatch(actions.deleteDraft('d1'));
    assert.deepEqual(store.getState().emails.order, []);
  });

  test('loadMoreEmails appends with the stored cursor and is a no-op without one', async () => {
    const cursors: (string | null | undefined)[] = [];
    const actions = createAsyncActions(
      stubClient({
        listEmails: async (options) => {
          cursors.push(options?.cursor);
          return options?.cursor
            ? { items: [email('b')], nextCursor: null }
            : { items: [email('a')], nextCursor: 'c1' };
        },
      })
    );
    const store = createDomainStore();
    await store.dispatch(actions.loadEmails());
    await store.dispatch(actions.loadMoreEmails());
    await store.dispatch(actions.loadMoreEmails());
    assert.deepEqual(cursors, [undefined, 'c1']);
    assert.deepEqual(store.getState().emails.order, ['a', 'b']);
  });

  test('inbox actions load the list, more items and a message', async () => {
    const message = inboxMessage('1');
    const actions = createAsyncActions(
      stubClient({
        listInbox: async (options) =>
          options?.after
            ? { items: [inboxItem('2')], nextCursor: null }
            : { items: [inboxItem('1')], nextCursor: 'c1' },
        getInboxMessage: async () => message,
      })
    );
    const store = createDomainStore();
    await store.dispatch(actions.loadInbox());
    await store.dispatch(actions.loadMoreInbox());
    await store.dispatch(actions.loadInboxMessage('1'));
    const state = store.getState();
    assert.deepEqual(state.inbox.order, ['1', '2']);
    assert.equal(state.inbox.messageById['1'], message);
    assert.equal(state.requests[requestKeys.inboxMessage('1')]?.status, 'success');
  });

  test('a second trigger while the same request is pending is ignored', async () => {
    let calls = 0;
    let release: () => void = () => {};
    const actions = createAsyncActions(
      stubClient({
        sendEmail: () => {
          calls += 1;
          return new Promise<AdminEmailDTO>((resolve) => {
            release = () => resolve(email('e1', { status: 'SENDING' }));
          });
        },
      })
    );
    const store = createDomainStore();
    const first = store.dispatch(actions.sendEmail('e1'));
    await store.dispatch(actions.sendEmail('e1'));
    release();
    await first;
    assert.equal(calls, 1);
    assert.equal(store.getState().emails.byId.e1?.status, 'SENDING');
  });
});

describe('composer actions (Stage 5)', () => {
  beforeEach(() => mock.timers.enable({ apis: ['setTimeout'] }));
  afterEach(() => mock.timers.reset());

  const draftInput = {
    kind: 'GENERAL' as const,
    toEmail: 'x@example.com',
    recipientName: '',
    businessName: '',
    subject: 'S',
    bodyHtml: '<p>B</p>',
    calendlyUrl: null,
    rows: [],
    attachment: null,
  };

  test('saveDraft resolves to the saved email; toast false skips the toast', async () => {
    const created = email('d1');
    const actions = createAsyncActions(stubClient({ createEmail: async () => created }));
    const store = createDomainStore();
    const result = await store.dispatch(actions.saveDraft(draftInput, { toast: false }));
    assert.equal(result, created);
    assert.deepEqual(store.getState().emails.order, ['d1']);
    assert.deepEqual(store.getState().toasts.items, []);
  });

  test('sendEmail names the recipient in the success toast', async () => {
    const sent = email('e1', { status: 'SENT', toEmail: 'amina@example.com' });
    const actions = createAsyncActions(stubClient({ sendEmail: async () => sent }));
    const store = createDomainStore();
    const result = await store.dispatch(actions.sendEmail('e1'));
    assert.equal(result, sent);
    assert.equal(store.getState().toasts.items[0]?.message, 'Email sent to amina@example.com.');
  });

  test('a failed send reloads the row (FAILED) and resolves to null', async () => {
    const failed = email('e1', { status: 'FAILED', error: 'Safe message.' });
    const actions = createAsyncActions(
      stubClient({
        sendEmail: async () => {
          throw new FakeApiError(null);
        },
        getEmail: async () => failed,
      })
    );
    const store = createDomainStore();
    const result = await store.dispatch(actions.sendEmail('e1'));
    assert.equal(result, null);
    assert.equal(store.getState().emails.byId.e1, failed);
    assert.equal(store.getState().toasts.items[0]?.message, asyncActionCopy.sendEmail.error);
  });

  test('uploadAttachment returns the storage path and reports progress', async () => {
    const progress: number[] = [];
    const actions = createAsyncActions(
      stubClient({
        createUploadUrl: async () => ({ path: 'admin-emails/p/a.pdf', signedUrl: 'https://s/x', token: 't' }),
        uploadFile: async (_url, _file, options) => {
          options?.onProgress?.(0.5);
          options?.onProgress?.(1);
        },
      })
    );
    const store = createDomainStore();
    const file = new File(['%PDF-1.4'], 'a.pdf', { type: 'application/pdf' });
    const result = await store.dispatch(
      actions.uploadAttachment(file, { onProgress: (value) => progress.push(value) })
    );
    assert.deepEqual(result, { name: 'a.pdf', size: file.size, storagePath: 'admin-emails/p/a.pdf' });
    assert.deepEqual(progress, [0.5, 1]);
    assert.deepEqual(store.getState().toasts.items, []);
  });

  test('an aborted upload resolves to null without an error toast', async () => {
    const actions = createAsyncActions(
      stubClient({
        createUploadUrl: async () => ({ path: 'p', signedUrl: 'https://s/x', token: 't' }),
        uploadFile: async () => {
          const error = new FakeApiError(null);
          Reflect.set(error, 'code', 'aborted');
          throw error;
        },
      })
    );
    const store = createDomainStore();
    const file = new File(['x'], 'a.pdf', { type: 'application/pdf' });
    const result = await store.dispatch(actions.uploadAttachment(file));
    assert.equal(result, null);
    assert.deepEqual(store.getState().toasts.items, []);
    assert.equal(store.getState().requests[requestKeys.attachmentUpload]?.status, 'success');
  });
});
