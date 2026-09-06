import type { Transaction } from './finance';

export type AnalyticsPoint = { label: string; income: number; expenses: number; net: number };
export type BreakdownItem = { name: string; value: number };

export function monthKey(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function shiftMonth(month: string, offset: number): string {
  const [year, monthNumber] = month.split('-').map(Number);
  const date = new Date(year, monthNumber - 1 + offset, 1);
  return monthKey(date);
}

export function monthLabel(month: string): string {
  const [year, monthNumber] = month.split('-').map(Number);
  return new Date(year, monthNumber - 1, 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

export function monthTransactions(transactions: Transaction[], month: string) {
  return transactions.filter(t => t.date.startsWith(month));
}

export function monthlyTrend(transactions: Transaction[], month: string): AnalyticsPoint[] {
  const [year, monthNumber] = month.split('-').map(Number);
  const days = new Date(year, monthNumber, 0).getDate();
  const monthData = monthTransactions(transactions, month);
  return Array.from({ length: days }, (_, index) => {
    const day = String(index + 1).padStart(2, '0');
    const dayTransactions = monthData.filter(t => t.date === `${month}-${day}`);
    const income = dayTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = dayTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    return { label: `${index + 1}`, income, expenses, net: income - expenses };
  });
}

export function breakdownByCategory(transactions: Transaction[], month: string): BreakdownItem[] {
  return Object.entries(monthTransactions(transactions, month).filter(t => t.type === 'expense').reduce<Record<string, number>>((acc, t) => {
    acc[t.category] = (acc[t.category] ?? 0) + t.amount;
    return acc;
  }, {})).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
}

export function breakdownByAccount(transactions: Transaction[], month: string): BreakdownItem[] {
  return Object.entries(monthTransactions(transactions, month).filter(t => t.type === 'expense').reduce<Record<string, number>>((acc, t) => {
    acc[t.account] = (acc[t.account] ?? 0) + t.amount;
    return acc;
  }, {})).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
}

export function averageDailySpend(transactions: Transaction[], month: string): number {
  const expenses = monthTransactions(transactions, month).filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const days = new Date(Number(month.slice(0, 4)), Number(month.slice(5, 7)), 0).getDate();
  return days ? expenses / days : 0;
}

export function largestCategory(items: BreakdownItem[]): BreakdownItem | undefined {
  return items[0];
}
