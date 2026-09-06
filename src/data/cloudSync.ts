export type SyncEntity = 'profile' | 'transactions' | 'accounts' | 'transfers' | 'recurring' | 'budgets' | 'savings_goals' | 'savings_entries' | 'notifications';
export type SyncOperation = 'upsert' | 'delete';

export type SyncItem = {
  id: string;
  entity: SyncEntity;
  operation: SyncOperation;
  recordId: string;
  updatedAt: string;
  attempts: number;
};

const QUEUE_KEY = 'nivora.sync.queue.v1';

function newId() {
  return typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function loadSyncQueue(): SyncItem[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function enqueueSync(entity: SyncEntity, operation: SyncOperation, recordId: string, updatedAt = new Date().toISOString()) {
  const queue = loadSyncQueue();
  const existing = queue.find(item => item.entity === entity && item.recordId === recordId);
  const next = existing
    ? queue.map(item => item === existing ? { ...item, operation, updatedAt } : item)
    : [...queue, { id: newId(), entity, operation, recordId, updatedAt, attempts: 0 }];
  localStorage.setItem(QUEUE_KEY, JSON.stringify(next.slice(-500)));
  return next;
}

export function clearSyncQueue() {
  localStorage.removeItem(QUEUE_KEY);
}

export function markSyncAttempt(itemId: string) {
  const next = loadSyncQueue().map(item => item.id === itemId ? { ...item, attempts: item.attempts + 1 } : item);
  localStorage.setItem(QUEUE_KEY, JSON.stringify(next));
  return next;
}
