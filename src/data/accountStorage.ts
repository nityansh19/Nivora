import type { Account, RecurringTransaction } from '../domain/accounts';

const ACCOUNTS_KEY = 'nivora.accounts.v1';
const RECURRING_KEY = 'nivora.recurring.v1';

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function loadAccounts(): Account[] {
  const value = read<unknown>(ACCOUNTS_KEY, []);
  return Array.isArray(value) ? value : [];
}

export function saveAccounts(accounts: Account[]) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

export function loadRecurringTransactions(): RecurringTransaction[] {
  const value = read<unknown>(RECURRING_KEY, []);
  return Array.isArray(value) ? value : [];
}

export function saveRecurringTransactions(items: RecurringTransaction[]) {
  localStorage.setItem(RECURRING_KEY, JSON.stringify(items));
}
