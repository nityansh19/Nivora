export type TransactionType = 'expense' | 'income';
export type AccountType = 'cash' | 'bank' | 'upi' | 'debit_card' | 'credit_card' | 'wallet' | 'custom';

export type Transaction = {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  date: string;
  account: AccountType;
  accountId?: string;
  note?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

export const expenseCategories = ['Food', 'Groceries', 'Transport', 'Bills', 'Rent', 'Healthcare', 'Education', 'Shopping', 'Entertainment', 'Travel', 'Subscriptions', 'Hobbies', 'Dining', 'Gifts', 'Miscellaneous'] as const;
export const incomeCategories = ['Salary', 'Freelance', 'Business', 'Allowance', 'Other'] as const;
export const accountLabels: Record<AccountType, string> = { cash: 'Cash', bank: 'Bank', upi: 'UPI', debit_card: 'Debit card', credit_card: 'Credit card', wallet: 'Wallet', custom: 'Custom' };
export function calculateTotals(transactions: Transaction[]) { return transactions.reduce((totals, transaction) => { if (transaction.type === 'income') totals.income += transaction.amount; else totals.expenses += transaction.amount; totals.balance = totals.income - totals.expenses; return totals; }, { income: 0, expenses: 0, balance: 0 }); }
export function formatMoney(value: number, currency = 'INR') { return new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(value); }
export function createTransaction(input: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Transaction { const now = new Date().toISOString(); return { ...input, id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`, createdAt: now, updatedAt: now }; }
