import { monthKey, type MonthlyBudget } from './budget';

export type AssistantActionType = 'create_budget' | 'create_savings_goal' | 'add_expense';
export type AssistantAction = {
  type: AssistantActionType;
  title: string;
  description: string;
  fields: Record<string, string | number>;
};

const money = (value: number) => `₹${Math.round(value).toLocaleString('en-IN')}`;
const amountFrom = (q: string) => {
  const match = q.replace(/,/g, '').match(/(?:₹|rs\.?|inr\s*)?(\d+(?:\.\d+)?)/i);
  return match ? Number(match[1]) : 0;
};

export function proposeAssistantAction(input: string): AssistantAction | null {
  const q = input.toLowerCase();
  const amount = amountFrom(q);
  if (!amount || !Number.isFinite(amount)) return null;

  if (/budget|spend limit/.test(q) && /set|create|make|change|increase|decrease/.test(q)) {
    return { type: 'create_budget', title: `Set a ${money(amount)} monthly budget`, description: `Nivora will save ${money(amount)} as your overall budget for the current month.`, fields: { amount, month: monthKey() } };
  }

  if (/save|saving|goal|target/.test(q) && /goal|target|save/.test(q)) {
    const name = /(?:for|called|named)\s+([a-z0-9][a-z0-9 &'_-]{2,40})/i.exec(input)?.[1]?.trim() || 'Savings goal';
    return { type: 'create_savings_goal', title: `Create “${name}”`, description: `Nivora will create a ${money(amount)} savings target named “${name}”.`, fields: { amount, name } };
  }

  if (/add|record|log/.test(q) && /expense|spent|spending/.test(q)) {
    const category = /(?:on|for)\s+(food|groceries|transport|bills|rent|healthcare|education|shopping|entertainment|travel|subscriptions|hobbies|dining|gifts)/i.exec(input)?.[1] || 'Miscellaneous';
    return { type: 'add_expense', title: `Record a ${money(amount)} expense`, description: `Nivora will add this expense under ${category}.`, fields: { amount, category } };
  }
  return null;
}

export function replaceOverallBudget(budgets: MonthlyBudget[], amount: number): MonthlyBudget[] {
  const month = monthKey();
  const now = new Date().toISOString();
  const existing = budgets.find(b => b.month === month);
  const next = existing ? { ...existing, overallAmount: amount, updatedAt: now } : { id: crypto.randomUUID(), month, overallAmount: amount, categoryLimits: {}, createdAt: now, updatedAt: now };
  return [...budgets.filter(b => b.month !== month), next];
}
