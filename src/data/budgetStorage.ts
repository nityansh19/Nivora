import type { MonthlyBudget } from '../domain/budget';

const KEY = 'nivora.budgets.v1';

export function loadBudgets(): MonthlyBudget[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveBudgets(budgets: MonthlyBudget[]) {
  localStorage.setItem(KEY, JSON.stringify(budgets));
}
