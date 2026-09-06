import type { Transaction } from './finance';

export type BudgetStatus = 'neutral' | 'warning' | 'danger' | 'complete';

export type MonthlyBudget = {
  id: string;
  month: string;
  overallAmount?: number;
  categoryLimits: Record<string, number>;
  createdAt: string;
  updatedAt: string;
};

export type BudgetUsage = {
  budgeted: number;
  spent: number;
  remaining: number;
  percent: number;
  status: BudgetStatus;
};

export function createMonthlyBudget(input: Omit<MonthlyBudget, 'id' | 'createdAt' | 'updatedAt'>): MonthlyBudget {
  const now = new Date().toISOString();
  return { ...input, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
}

export function monthKey(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function monthLabel(month: string): string {
  const [year, monthNumber] = month.split('-').map(Number);
  return new Date(year, monthNumber - 1, 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

export function monthTransactions(transactions: Transaction[], month: string): Transaction[] {
  return transactions.filter(t => t.date.startsWith(month));
}

export function categorySpending(transactions: Transaction[], month: string): Record<string, number> {
  return monthTransactions(transactions, month).filter(t => t.type === 'expense').reduce<Record<string, number>>((acc, t) => {
    acc[t.category] = (acc[t.category] ?? 0) + t.amount;
    return acc;
  }, {});
}

export function budgetUsage(budgeted: number | undefined, spent: number): BudgetUsage {
  if (!budgeted || budgeted <= 0) {
    return { budgeted: 0, spent, remaining: 0, percent: 0, status: 'neutral' };
  }
  const percent = Math.round((spent / budgeted) * 100);
  const status: BudgetStatus = percent >= 100 ? 'danger' : percent >= 80 ? 'warning' : 'complete';
  return { budgeted, spent, remaining: budgeted - spent, percent, status };
}

export function totalBudgeted(budget: MonthlyBudget): number {
  return budget.overallAmount ?? Object.values(budget.categoryLimits).reduce((sum, amount) => sum + amount, 0);
}

export function overallBudgetUsage(budget: MonthlyBudget | undefined, transactions: Transaction[], month: string): BudgetUsage {
  return budgetUsage(budget ? totalBudgeted(budget) : undefined, categorySpending(transactions, month) |> Object.values |> (values => values.reduce((sum, value) => sum + value, 0)));
}

export function categoryBudgetUsage(budget: MonthlyBudget | undefined, transactions: Transaction[], month: string, category: string): BudgetUsage {
  const spent = categorySpending(transactions, month)[category] ?? 0;
  return budgetUsage(budget?.categoryLimits[category], spent);
}
