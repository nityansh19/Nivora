import type { Transaction } from './finance';

export type NivoraBackup = {
  schema: 1;
  exportedAt: string;
  transactions: Transaction[];
};

export function createBackup(transactions: Transaction[]): NivoraBackup {
  return { schema: 1, exportedAt: new Date().toISOString(), transactions };
}

export function parseBackup(raw: string): Transaction[] {
  const parsed = JSON.parse(raw) as Partial<NivoraBackup>;
  if (parsed.schema !== 1 || !Array.isArray(parsed.transactions)) {
    throw new Error('This file is not a valid Nivora backup.');
  }
  const valid = parsed.transactions.every((t) =>
    t && typeof t === 'object' && typeof t.id === 'string' &&
    (t.type === 'expense' || t.type === 'income') && typeof t.amount === 'number' && t.amount > 0 &&
    typeof t.category === 'string' && typeof t.date === 'string' && typeof t.account === 'string'
  );
  if (!valid) throw new Error('The backup contains invalid transaction data.');
  return parsed.transactions as Transaction[];
}

export function downloadBackup(transactions: Transaction[]) {
  const blob = new Blob([JSON.stringify(createBackup(transactions), null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `nivora-backup-${new Date().toISOString().slice(0, 10)}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}
