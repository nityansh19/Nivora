import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowDownRight, ArrowUpRight, CalendarDays, ChevronLeft, ChevronRight, CircleDollarSign, PieChart as PieIcon, TrendingUp, Wallet } from 'lucide-react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { accountLabels, formatMoney, type Transaction } from '../domain/finance';
import { breakdownByAccount, breakdownByCategory, largestCategory, monthLabel, monthTransactions, monthlyTrend, shiftMonth } from '../domain/analytics';
import './analytics.css';

type Props = { transactions: Transaction[] };

export default function AnalyticsCenter({ transactions }: Props) {
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const monthData = useMemo(() => monthTransactions(transactions, month), [transactions, month]);
  const trend = useMemo(() => monthlyTrend(transactions, month), [transactions, month]);
  const categories = useMemo(() => breakdownByCategory(transactions, month), [transactions, month]);
  const accounts = useMemo(() => breakdownByAccount(transactions, month), [transactions, month]);
  const income = monthData.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const expenses = monthData.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const net = income - expenses;
  const savingsRate = income > 0 ? Math.round((net / income) * 100) : 0;
  const topCategory = largestCategory(categories);
  const maxDay = Math.max(...trend.map(point => point.expenses), 0);

  return <div className="analytics-page">
    <section className="analytics-hero">
      <div><p className="section-kicker">Financial intelligence</p><h2>Understand your money, not just your numbers.</h2><p>Patterns and trends built from the transactions you have actually recorded.</p></div>
      <div className="analytics-period"><button className="icon-button" onClick={() => setMonth(shiftMonth(month, -1))} aria-label="Previous month"><ChevronLeft size={18}/></button><div><CalendarDays size={16}/><strong>{monthLabel(month)}</strong></div><button className="icon-button" onClick={() => setMonth(shiftMonth(month, 1))} aria-label="Next month"><ChevronRight size={18}/></button></div>
    </section>

    {!transactions.length ? <div className="analytics-empty"><div className="analytics-empty-icon"><TrendingUp size={22}/></div><h3>Your financial story starts with activity.</h3><p>Add a few income and expense transactions and Nivora will turn them into trends, category patterns and useful signals.</p></div> : <>
      <section className="analytics-kpis">
        <Kpi label="Income" value={formatMoney(income)} icon={ArrowUpRight} tone="income" />
        <Kpi label="Expenses" value={formatMoney(expenses)} icon={ArrowDownRight} tone="expense" />
        <Kpi label="Net cash flow" value={formatMoney(net)} icon={CircleDollarSign} tone={net >= 0 ? 'positive' : 'negative'} />
        <Kpi label="Savings rate" value={`${Math.max(0, savingsRate)}%`} icon={PiggyIcon} tone="neutral" />
      </section>

      <section className="analytics-main-grid">
        <div className="analytics-panel analytics-trend-panel"><div className="analytics-panel-head"><div><p className="panel-eyebrow">Cash flow</p><h3>Income vs expenses</h3></div><span className="analytics-period-note">Daily · {monthLabel(month)}</span></div><div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><AreaChart data={trend} margin={{ top: 8, right: 4, left: -16, bottom: 0 }}><defs><linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopOpacity={0.18}/><stop offset="100%" stopOpacity={0}/></linearGradient><linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopOpacity={0.12}/><stop offset="100%" stopOpacity={0}/></linearGradient></defs><CartesianGrid vertical={false} strokeDasharray="3 5"/><XAxis dataKey="label" tickLine={false} axisLine={false} interval={Math.max(0, Math.floor(trend.length / 7) - 1)} /><YAxis tickLine={false} axisLine={false} tickFormatter={(v) => v >= 1000 ? `₹${Math.round(v / 1000)}k` : `₹${v}`} /><Tooltip formatter={(value) => formatMoney(Number(value))} labelFormatter={(label) => `Day ${label}`} /><Area type="monotone" dataKey="income" strokeWidth={2} fill="url(#incomeFill)" name="Income"/><Area type="monotone" dataKey="expenses" strokeWidth={2} fill="url(#expenseFill)" name="Expenses"/></AreaChart></ResponsiveContainer></div></div>
        <div className="analytics-panel signal-panel"><div className="analytics-panel-head"><div><p className="panel-eyebrow">Signal</p><h3>What stands out</h3></div><TrendingUp size={18}/></div><div className="signal-list"><Signal icon={Wallet} title={topCategory ? `${topCategory.name} leads spending` : 'No category pattern yet'} body={topCategory ? `${formatMoney(topCategory.value)} recorded this month.` : 'Add expenses across categories to reveal a pattern.'}/><Signal icon={PieIcon} title={savingsRate > 0 ? `${savingsRate}% of income remains` : income ? 'Expenses are using all recorded income' : 'Income data is needed'} body={income ? `Net cash flow is ${formatMoney(net)} for this period.` : 'Record income to calculate a meaningful savings rate.'}/><Signal icon={TrendingUp} title={maxDay ? `Peak spend: ${formatMoney(maxDay)}` : 'No daily spend peak yet'} body={maxDay ? 'Your highest single-day expense total this month.' : 'Your daily spending pattern will appear here.'}/></div></div>
      </section>

      <section className="analytics-breakdown-grid">
        <BreakdownPanel title="Spending by category" subtitle="Where this month's expenses went" data={categories} kind="category" />
        <BreakdownPanel title="Spending by account" subtitle="Which payment methods were used" data={accounts} kind="account" />
      </section>
    </>}
  </div>;
}

function Kpi({ label, value, icon: Icon, tone }: { label: string; value: string; icon: typeof Wallet; tone: string }) { return <motion.article className={`analytics-kpi ${tone}`} whileHover={{ y: -2 }} transition={{ duration: .18 }}><span className="kpi-icon"><Icon size={17}/></span><div><span>{label}</span><strong>{value}</strong></div></motion.article>; }
function PiggyIcon({ size }: { size: number }) { return <CircleDollarSign size={size}/>; }
function Signal({ icon: Icon, title, body }: { icon: typeof Wallet; title: string; body: string }) { return <div className="signal-item"><span className="signal-icon"><Icon size={17}/></span><div><strong>{title}</strong><p>{body}</p></div></div>; }
function BreakdownPanel({ title, subtitle, data, kind }: { title: string; subtitle: string; data: {name:string;value:number}[]; kind: 'category'|'account' }) { const total=data.reduce((s,x)=>s+x.value,0); return <div className="analytics-panel breakdown-panel"><div className="analytics-panel-head"><div><p className="panel-eyebrow">Breakdown</p><h3>{title}</h3><span>{subtitle}</span></div></div>{data.length ? <div className="breakdown-content"><div className="donut-wrap"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={data} dataKey="value" nameKey="name" innerRadius="62%" outerRadius="82%" paddingAngle={2}>{data.map((entry,index)=><Cell key={`${entry.name}-${index}`} fill={`hsl(${150 + index * 17} 28% ${34 + index * 3}%)`}/>)}</Pie><Tooltip formatter={(value)=>formatMoney(Number(value))}/></PieChart></ResponsiveContainer><div className="donut-center"><strong>{formatMoney(total)}</strong><span>Total</span></div></div><div className="breakdown-list">{data.slice(0,6).map((item,index)=><div className="breakdown-row" key={item.name}><span className="breakdown-dot" style={{opacity: Math.max(.4,1-index*.1)}}/><span className="breakdown-name">{kind==='account' ? accountLabels[item.name as keyof typeof accountLabels] ?? item.name : item.name}</span><strong>{formatMoney(item.value)}</strong><small>{total ? Math.round(item.value / total * 100) : 0}%</small></div>)}</div></div> : <div className="mini-empty">No expense data recorded for {monthLabel(new Date().toISOString().slice(0,7))}.</div>}</div>; }
