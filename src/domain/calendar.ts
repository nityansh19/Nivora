import type { Transaction } from './finance';
import type { SavingsEntry } from './savings';
import type { MonthlyBudget } from './budget';
import { categorySpending, monthTransactions, monthKey, totalBudgeted } from './budget';

export type CalendarDay = {
  date: string;
  day: number;
  inMonth: boolean;
  income: number;
  expenses: number;
  transactionCount: number;
};

export type MonthlySummary = {
  month: string;
  income: number;
  expenses: number;
  netCashFlow: number;
  savings: number;
  savingsRate: number;
  transactionCount: number;
  topCategory?: { name: string; amount: number };
  budgeted?: number;
  budgetRemaining?: number;
  budgetPercent?: number;
  recurringCount: number;
};

export function isoDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function monthDays(month: string): CalendarDay[] {
  const [year, monthNumber] = month.split('-').map(Number);
  const first = new Date(year, monthNumber - 1, 1);
  const last = new Date(year, monthNumber, 0);
  const leading = (first.getDay() + 6) % 7;
  const totalCells = Math.ceil((leading + last.getDate()) / 7) * 7;
  const start = new Date(year, monthNumber - 1, 1 - leading);

  return Array.from({ length: totalCells }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return { date: isoDate(date), day: date.getDate(), inMonth: date.getMonth() === monthNumber - 1, income: 0, expenses: 0, transactionCount: 0 };
  });
}

export function decorateCalendarDays(days: CalendarDay[], transactions: Transaction[]): CalendarDay[] {
  return days.map(day => {
    const daily = transactions.filter(t => t.date === day.date);
    return {
      ...day,
      income: daily.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
      expenses: daily.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0),
      transactionCount: daily.length,
    };
  });
}

export function monthlySummary(
  transactions: Transaction[],
  savingsEntries: SavingsEntry[],
  budget: MonthlyBudget | undefined,
  recurringCount: number,
  month: string,
): MonthlySummary {
  const items = monthTransactions(transactions, month);
  const income = items.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const expenses = items.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const savings = savingsEntries.filter(e => e.date.startsWith(month)).reduce((sum, e) => sum + (e.type === 'contribution' ? e.amount : -e.amount), 0);
  const categories = categorySpending(transactions, month);
  const top = Object.entries(categories).sort(([, a], [, b]) => b - a)[0];
  const budgeted = budget ? totalBudgeted(budget) : undefined;
  const budgetRemaining = budgeted === undefined ? undefined : budgeted - expenses;
  const budgetPercent = budgeted && budgeted > 0 ? Math.round((expenses / budgeted) * 100) : undefined;

  return {
    month,
    income,
    expenses,
    netCashFlow: income - expenses,
    savings,
    savingsRate: income > 0 ? Math.round((savings / income) * 100) : 0,
    transactionCount: items.length,
    topCategory: top ? { name: top[0], amount: top[1] } : undefined,
    budgeted,
    budgetRemaining,
    budgetPercent,
    recurringCount,
  };
}

export function previousMonth(month: string): string { return shift(month, -1); }
export function nextMonth(month: string): string { return shift(month, 1); }
export function shift(month: string, offset: number): string {
  const [year, monthNumber] = month.split('-').map(Number);
  const date = new Date(year, monthNumber - 1 + offset, 1);
  return monthKey(date);
}

export function monthTitle(month: string): string {
  const [year, monthNumber] = month.split('-').map(Number);
  return new Date(year, monthNumber - 1, 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}
