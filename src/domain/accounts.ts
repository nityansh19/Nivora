import type { AccountType, Transaction, TransactionType } from './finance';

export type Account = {
  id: string;
  name: string;
  type: AccountType;
  openingBalance: number;
  color?: string;
  createdAt: string;
  updatedAt: string;
};

export type Recurrence = 'weekly' | 'monthly' | 'yearly';

export type RecurringTransaction = {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  accountId: string;
  note?: string;
  recurrence: Recurrence;
  nextDate: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export function createAccount(input: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>): Account {
  const now = new Date().toISOString();
  return { ...input, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
}

export function createRecurringTransaction(input: Omit<RecurringTransaction, 'id' | 'createdAt' | 'updatedAt'>): RecurringTransaction {
  const now = new Date().toISOString();
  return { ...input, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
}

export function accountBalance(account: Account, transactions: Transaction[]) {
  return account.openingBalance + transactions.reduce((total, transaction) => {
    if (transaction.account !== account.type) return total;
    return total + (transaction.type === 'income' ? transaction.amount : -transaction.amount);
  }, 0);
}

export function nextOccurrence(date: string, recurrence: Recurrence) {
  const next = new Date(`${date}T00:00:00`);
  if (recurrence === 'weekly') next.setDate(next.getDate() + 7);
  else if (recurrence === 'monthly') next.setMonth(next.getMonth() + 1);
  else next.setFullYear(next.getFullYear() + 1);
  return next.toISOString().slice(0, 10);
}
