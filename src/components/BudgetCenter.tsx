import { useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { AlertTriangle, ArrowLeft, ArrowRight, Check, CircleDollarSign, PieChart, Plus, Wallet, X } from 'lucide-react';
import { expenseCategories, formatMoney, type Transaction } from '../domain/finance';
import { budgetUsage, categorySpending, monthLabel, monthKey, overallBudgetUsage, shiftMonth, type MonthlyBudget } from '../domain/budget';
import { createMonthlyBudget } from '../domain/budget';
import { loadBudgets, saveBudgets } from '../data/budgetStorage';
import './budget.css';

export default function BudgetCenter({ transactions }: { transactions: Transaction[] }) {
  const [budgets, setBudgets] = useState<MonthlyBudget[]>(() => loadBudgets());
  const [month, setMonth] = useState(monthKey());
  const [showEditor, setShowEditor] = useState(false);
  const budget = budgets.find(b => b.month === month);
  const spending = useMemo(() => categorySpending(transactions, month), [transactions, month]);
  const usage = overallBudgetUsage(budget, transactions, month);
  const budgetedCategories = expenseCategories.filter(category => budget?.categoryLimits[category] > 0);
  const topSpending = Object.entries(spending).sort(([, a], [, b]) => b - a).slice(0, 6);
  const unbudgeted = Object.entries(spending).filter(([category]) => !budget?.categoryLimits[category]).reduce((sum, [, amount]) => sum + amount, 0);

  function saveBudget(input: { overallAmount?: number; categoryLimits: Record<string, number> }) {
    const existing = budget;
    const nextBudget: MonthlyBudget = existing
      ? { ...existing, ...input, updatedAt: new Date().toISOString() }
      : createMonthlyBudget({ month, ...input });
    const next = [nextBudget, ...budgets.filter(item => item.month !== month)];
    setBudgets(next);
    saveBudgets(next);
    setShowEditor(false);
  }

  return <section className="budget-page">
    <div className="budget-hero">
      <div><p className="section-kicker">Budget control</p><h2>Give every rupee a job.</h2><p className="muted">Set a monthly guardrail, then let real spending tell you how you are doing.</p></div>
      <button className="primary-button" onClick={() => setShowEditor(true)}><Plus size={16}/>{budget ? 'Edit budget' : 'Set budget'}</button>
    </div>

    <div className="budget-period"><button className="icon-button" onClick={() => setMonth(shiftMonth(month, -1))} aria-label="Previous month"><ArrowLeft size={17}/></button><div><span>Budget period</span><strong>{monthLabel(month)}</strong></div><button className="icon-button" onClick={() => setMonth(shiftMonth(month, 1))} aria-label="Next month"><ArrowRight size={17}/></button></div>

    <div className="budget-overview">
      <div className="budget-main-card">
        <div className="budget-card-top"><div><p className="eyebrow">Monthly budget</p><strong>{budget ? formatMoney(usage.budgeted) : 'Not set'}</strong></div><span className="budget-status" data-status={usage.status}>{usage.status === 'danger' ? <AlertTriangle size={15}/> : usage.status === 'warning' ? <AlertTriangle size={15}/> : <Check size={15}/>} {usage.status === 'neutral' ? 'No limit yet' : usage.status === 'danger' ? 'Over budget' : usage.status === 'warning' ? 'Getting close' : 'On track'}</span></div>
        <div className="budget-progress"><span data-status={usage.status} style={{ width: `${Math.min(100, usage.percent)}%` }}/></div>
        <div className="budget-main-numbers"><div><span>Spent</span><b>{formatMoney(usage.spent)}</b></div><div><span>{usage.remaining >= 0 ? 'Remaining' : 'Over by'}</span><b>{formatMoney(Math.abs(usage.remaining))}</b></div><div><span>Used</span><b>{budget ? `${usage.percent}%` : '—'}</b></div></div>
      </div>
      <div className="budget-side-card"><div className="budget-side-icon"><PieChart size={19}/></div><div><span>Unbudgeted spending</span><strong>{formatMoney(unbudgeted)}</strong><p>{unbudgeted ? 'These categories have spending but no limit yet.' : 'Every recorded expense has a budget limit.'}</p></div></div>
    </div>

    <div className="budget-grid">
      <div className="panel"><div className="panel-header"><div><h2>Category budgets</h2><p>{budgetedCategories.length ? `${budgetedCategories.length} categories have a limit.` : 'Add category limits to make your budget more precise.'}</p></div></div>{budgetedCategories.length ? <div className="category-budget-list">{budgetedCategories.map(category => <CategoryBudget key={category} category={category} budget={budget} spent={spending[category] ?? 0}/>)}</div> : <div className="budget-empty"><div className="budget-empty-icon"><Wallet size={20}/></div><strong>No category budgets yet</strong><span>Set limits for Food, Transport, Shopping and more.</span><button className="secondary-button" onClick={() => setShowEditor(true)}><Plus size={15}/> Add category limits</button></div>}</div>
      <div className="panel"><div className="panel-header"><div><h2>Where spending is going</h2><p>Only recorded expenses are shown.</p></div><CircleDollarSign size={18}/></div>{topSpending.length ? <div className="spending-breakdown">{topSpending.map(([category, amount]) => <div className="spending-breakdown-row" key={category}><div><span>{category}</span><small>{budget?.categoryLimits[category] ? `${Math.round(amount / budget.categoryLimits[category] * 100)}% of limit` : 'No category limit'}</small></div><strong>{formatMoney(amount)}</strong></div>)}</div> : <div className="budget-empty compact"><div className="budget-empty-icon"><CircleDollarSign size={20}/></div><strong>No spending recorded</strong><span>Add an expense to see this month’s breakdown.</span></div>}</div>
    </div>

    {showEditor && <BudgetEditor month={month} budget={budget} onClose={() => setShowEditor(false)} onSave={saveBudget}/>} 
  </section>;
}

function CategoryBudget({ category, budget, spent }: { category: string; budget?: MonthlyBudget; spent: number }) {
  const limit = budget?.categoryLimits[category];
  const usage = budgetUsage(limit, spent);
  return <div className="category-budget-row"><div className="category-budget-copy"><div className="category-budget-title"><strong>{category}</strong><span data-status={usage.status}>{limit ? usage.status === 'danger' ? 'Over limit' : usage.status === 'warning' ? 'Near limit' : 'On track' : 'No limit'}</span></div><div className="category-track"><span data-status={usage.status} style={{ width: `${Math.min(100, usage.percent)}%` }}/></div><small>{formatMoney(spent)} spent {limit ? `of ${formatMoney(limit)}` : ''}</small></div><b>{limit ? `${usage.percent}%` : '—'}</b></div>;
}

function BudgetEditor({ month, budget, onClose, onSave }: { month: string; budget?: MonthlyBudget; onClose: () => void; onSave: (input: { overallAmount?: number; categoryLimits: Record<string, number> }) => void }) {
  const [overall, setOverall] = useState(budget?.overallAmount ? String(budget.overallAmount) : '');
  const [limits, setLimits] = useState<Record<string, string>>(() => Object.fromEntries(expenseCategories.map(category => [category, budget?.categoryLimits[category] ? String(budget.categoryLimits[category]) : ''])));
  const [error, setError] = useState('');
  function submit(e: FormEvent) { e.preventDefault(); const overallValue = overall ? Number(overall) : undefined; if (overall && (!Number.isFinite(overallValue) || overallValue <= 0)) return setError('Enter a valid monthly budget.'); const categoryLimits: Record<string, number> = {}; for (const category of expenseCategories) { const raw = limits[category]; if (!raw) continue; const value = Number(raw); if (!Number.isFinite(value) || value <= 0) return setError(`Enter a valid limit for ${category}.`); categoryLimits[category] = value; } if (!overallValue && !Object.keys(categoryLimits).length) return setError('Add a monthly budget or at least one category limit.'); onSave({ overallAmount: overallValue, categoryLimits }); }
  return <div className="budget-modal-backdrop" onClick={onClose}><div className="budget-modal" onClick={e => e.stopPropagation()}><div className="composer-header"><div><p className="eyebrow">{monthLabel(month)}</p><h2>Set your budget</h2></div><button className="icon-button" onClick={onClose} aria-label="Close"><X size={18}/></button></div><form onSubmit={submit}><label>Monthly spending limit <span className="optional">optional</span><input autoFocus inputMode="decimal" value={overall} onChange={e => { setOverall(e.target.value); setError(''); }} placeholder="₹ 0"/></label><div className="budget-editor-heading"><div><strong>Category limits</strong><span>Optional — leave blank for categories without a limit.</span></div></div><div className="category-editor-grid">{expenseCategories.map(category => <label key={category}>{category}<input inputMode="decimal" value={limits[category]} onChange={e => setLimits(prev => ({ ...prev, [category]: e.target.value }))} placeholder="No limit"/></label>)}</div>{error && <p className="form-error" role="alert">{error}</p>}<button className="primary-button full" type="submit">Save budget</button><p className="form-note">Budget limits are stored locally on this device.</p></form></div></div>;
}

function ModalText({ children }: { children: ReactNode }) { return <>{children}</>; }
void ModalText;
