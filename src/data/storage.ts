import type { Transaction } from '../domain/finance';

const LEGACY_KEY = 'nivora.transactions.v1';
const STORAGE_KEY = 'nivora.transactions.v2';
const SCHEMA_VERSION = 2;

type TransactionStore = {
  version: number;
  transactions: Transaction[];
};

function isTransaction(value: unknown): value is Transaction {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<Transaction>;
  return typeof item.id === 'string'
    && (item.type === 'expense' || item.type === 'income')
    && typeof item.amount === 'number'
    && Number.isFinite(item.amount)
    && item.amount > 0
    && typeof item.category === 'string'
    && typeof item.date === 'string'
    && typeof item.account === 'string'
    && Array.isArray(item.tags)
    && typeof item.createdAt === 'string'
    && typeof item.updatedAt === 'string';
}

function normalize(items: unknown): Transaction[] {
  if (!Array.isArray(items)) return [];
  return items.filter(isTransaction);
}

export function loadTransactions(): Transaction[] {
  try {
    const current = localStorage.getItem(STORAGE_KEY);
    if (current) {
      const parsed = JSON.parse(current) as TransactionStore;
      if (parsed?.version === SCHEMA_VERSION) return normalize(parsed.transactions);
    }

    const legacy = localStorage.getItem(LEGACY_KEY);
    if (!legacy) return [];
    const migrated = normalize(JSON.parse(legacy));
    saveTransactions(migrated);
    return migrated;
  } catch {
    return [];
  }
}

export function saveTransactions(transactions: Transaction[]) {
  const store: TransactionStore = { version: SCHEMA_VERSION, transactions: normalize(transactions) };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}
