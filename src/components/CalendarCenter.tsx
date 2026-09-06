import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, CalendarDays, ChevronRight, CircleDollarSign, Repeat2, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { formatMoney, type Transaction } from '../domain/finance';
import { loadBudgets } from '../data/budgetStorage';
import { loadSavingsEntries } from '../data/savingsStorage';
import { loadRecurring } from '../data/accountStorage';
import { decorateCalendarDays, monthDays, monthTitle, monthlySummary, nextMonth, previousMonth } from '../domain/calendar';
import './calendar.css';

type Props = { transactions: Transaction[] };

function todayMonth() { const now = new Date(); return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`; }
function isToday(date: string) { const now = new Date(); const value = new Date(`${date}T00:00:00`); return value.getFullYear() === now.getFullYear() && value.getMonth() === now.getMonth() && value.getDate() === now.getDate(); }

export default function CalendarCenter({ transactions }: Props) {
  const [month, setMonth] = useState(todayMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const budgets = useMemo(() => loadBudgets(), [month, transactions.length]);
  const savingsEntries = useMemo(() => loadSavingsEntries(), [month, transactions.length]);
  const recurring = useMemo(() => loadRecurring(), [month, transactions.length]);
  const budget = budgets.find(item => item.month === month);
  const summary = useMemo(() => monthlySummary(transactions, savingsEntries, budget, recurring.filter(item => item.active && item.nextDate.startsWith(month)).length, month), [transactions, savingsEntries, budget, recurring, month]);
  const days = useMemo(() => decorateCalendarDays(monthDays(month), transactions), [month, transactions]);
  const selectedTransactions = selectedDate ? transactions.filter(t => t.date === selectedDate) : [];
  const monthRecurring = recurring.filter(item => item.active && item.nextDate.startsWith(month)).sort((a, b) => a.nextDate.localeCompare(b.nextDate));

  return <div className="content calendar-page">
    <section className="calendar-intro"><div><p className="section-kicker">Financial calendar</p><p className="muted">See the month as a rhythm of spending, income and saving.</p></div><div className="month-switcher"><button className="icon-button" onClick={() => { setMonth(previousMonth(month)); setSelectedDate(null); }} aria-label="Previous month"><ArrowLeft size={17}/></button><strong>{monthTitle(month)}</strong><button className="icon-button" onClick={() => { setMonth(nextMonth(month)); setSelectedDate(null); }} aria-label="Next month"><ArrowRight size={17}/></button><button className="today-button" onClick={() => { setMonth(todayMonth()); setSelectedDate(null); }}>Today</button></div></section>

    <section className="summary-grid">
      <SummaryCard label="Income" value={formatMoney(summary.income)} icon={TrendingUp} />
      <SummaryCard label="Expenses" value={formatMoney(summary.expenses)} icon={TrendingDown} />
      <SummaryCard label="Net cash flow" value={`${summary.netCashFlow < 0 ? '-' : ''}${formatMoney(Math.abs(summary.netCashFlow))}`} icon={CircleDollarSign} accent={summary.netCashFlow >= 0 ? 'positive' : 'negative'} />
      <SummaryCard label="Saved" value={formatMoney(summary.savings)} icon={Wallet} accent="positive" />
    </section>

    <section className="calendar-layout">
      <div className="panel calendar-panel">
        <div className="panel-header"><div><h2>Month at a glance</h2><p>{summary.transactionCount ? `${summary.transactionCount} transaction${summary.transactionCount === 1 ? '' : 's'} recorded.` : 'No transactions recorded this month.'}</p></div><CalendarDays size={18}/></div>
        <div className="calendar-weekdays">{['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(day => <span key={day}>{day}</span>)}</div>
        <div className="calendar-grid">{days.map(day => <button key={day.date} className={`calendar-day ${day.inMonth ? '' : 'outside'} ${selectedDate === day.date ? 'selected' : ''} ${isToday(day.date) ? 'today' : ''}`} onClick={() => day.inMonth && setSelectedDate(day.date)} disabled={!day.inMonth} aria-label={`${day.date}, ${day.transactionCount} transactions`}>
          <span className="day-number">{day.day}</span>
          {day.transactionCount > 0 && <span className="day-metrics"><small>{day.income > 0 ? `+${formatCompact(day.income)}` : ''}</small><small>{day.expenses > 0 ? `-${formatCompact(day.expenses)}` : ''}</small></span>}
          {day.transactionCount > 0 && <span className="activity-dot" />}
        </button>)}</div>
        <div className="calendar-legend"><span><i className="legend-income"/> Income</span><span><i className="legend-expense"/> Expense</span><span><i className="legend-today"/> Today</span></div>
      </div>

      <aside className="calendar-side">
        <div className="panel day-panel"><div className="panel-header"><div><p className="section-kicker">Day detail</p><h2>{selectedDate ? new Date(`${selectedDate}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' }) : 'Select a day'}</h2></div></div>{selectedDate ? selectedTransactions.length ? <div className="day-transactions">{selectedTransactions.map(t => <div className="day-transaction" key={t.id}><span className={t.type === 'income' ? 'day-type income' : 'day-type expense'}>{t.type === 'income' ? '+' : '−'}</span><div><strong>{t.category}</strong><small>{t.note || 'No note'}</small></div><b className={t.type === 'income' ? 'income-text' : ''}>{t.type === 'income' ? '+' : '-'}{formatMoney(t.amount)}</b></div>)}</div> : <div className="calendar-empty"><CalendarDays size={20}/><strong>Nothing recorded</strong><span>This day has no saved transactions.</span></div> : <div className="calendar-empty"><CalendarDays size={20}/><strong>Choose a date</strong><span>Select any day with activity to inspect its transactions.</span></div>}</div>
        <div className="panel month-health"><div className="panel-header"><div><h2>Month health</h2><p>A concise read on this month.</p></div></div><HealthRow label="Savings rate" value={summary.income ? `${summary.savingsRate}%` : '—'} /><HealthRow label="Top category" value={summary.topCategory ? `${summary.topCategory.name} · ${formatMoney(summary.topCategory.amount)}` : '—'} /><HealthRow label="Budget" value={summary.budgeted ? `${summary.budgetPercent}% used` : 'Not set'} /><HealthRow label="Recurring" value={summary.recurringCount ? `${summary.recurringCount} due this month` : 'None scheduled'} /></div>
      </aside>
    </section>

    <section className="panel monthly-summary"><div className="panel-header"><div><p className="section-kicker">Monthly summary</p><h2>Your financial pulse</h2><p>Derived only from the data Nivora has stored locally.</p></div></div><div className="summary-columns"><SummaryInsight title="Cash flow" value={summary.netCashFlow >= 0 ? `${formatMoney(summary.netCashFlow)} positive` : `${formatMoney(Math.abs(summary.netCashFlow))} deficit`} text={summary.netCashFlow >= 0 ? 'Income is currently ahead of expenses.' : 'Expenses are currently ahead of income.'} /><SummaryInsight title="Savings" value={formatMoney(summary.savings)} text={summary.savings > 0 ? `${summary.savingsRate}% of recorded income was saved.` : 'No positive savings activity is recorded this month.'} /><SummaryInsight title="Budget" value={summary.budgeted ? `${summary.budgetPercent}% used` : 'No budget'} text={summary.budgeted ? `${formatMoney(Math.max(0, summary.budgetRemaining ?? 0))} remaining against the monthly budget.` : 'Set a monthly budget to make this signal available.'} /></div></section>

    {monthRecurring.length > 0 && <section className="panel recurring-calendar"><div className="panel-header"><div><h2>Recurring payments</h2><p>Expected dates are shown here; Nivora never posts them automatically.</p></div><Repeat2 size={18}/></div><div className="recurring-calendar-list">{monthRecurring.slice(0, 6).map(item => <div className="recurring-calendar-row" key={item.id}><div><strong>{item.category}</strong><span>{new Date(`${item.nextDate}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · {item.recurrence}</span></div><b className={item.type === 'income' ? 'income-text' : ''}>{item.type === 'income' ? '+' : '-'}{formatMoney(item.amount)}</b><ChevronRight size={15}/></div>)}</div></section>}
  </div>;
}

function SummaryCard({ label, value, icon: Icon, accent = '' }: { label: string; value: string; icon: typeof Wallet; accent?: string }) { return <article className={`summary-card ${accent}`}><div><span>{label}</span><strong>{value}</strong></div><span className="summary-card-icon"><Icon size={17}/></span></article>; }
function HealthRow({ label, value }: { label: string; value: string }) { return <div className="health-row"><span>{label}</span><strong>{value}</strong></div>; }
function SummaryInsight({ title, value, text }: { title: string; value: string; text: string }) { return <div className="summary-insight"><span>{title}</span><strong>{value}</strong><p>{text}</p></div>; }
function formatCompact(value: number) { return new Intl.NumberFormat('en-IN', { notation: 'compact', maximumFractionDigits: 1 }).format(value); }
