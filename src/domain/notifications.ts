import type { Transaction } from './finance';
import type { MonthlyBudget } from './budget';
import type { RecurringTransaction } from './accounts';

export type NotificationKind = 'budget' | 'recurring' | 'insight' | 'summary';
export type NotificationSeverity = 'info' | 'warning' | 'critical';
export type NivoraNotification = { id:string; kind:NotificationKind; severity:NotificationSeverity; title:string; body:string; createdAt:string; read:boolean };
export type NotificationPreferences = { budgetAlerts:boolean; recurringReminders:boolean; monthlySummary:boolean };
export const defaultNotificationPreferences:NotificationPreferences={budgetAlerts:true,recurringReminders:true,monthlySummary:true};
function monthKey(date:string){return date.slice(0,7)}
function daysUntil(date:string){return Math.ceil((new Date(`${date}T00:00:00`).getTime()-new Date().setHours(0,0,0,0))/86400000)}
function money(value:number){return new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(value)}
export function generateNotifications(transactions:Transaction[],budgets:MonthlyBudget[],recurring:RecurringTransaction[],existing:NivoraNotification[],preferences:NotificationPreferences=defaultNotificationPreferences){
 const month=monthKey(new Date().toISOString()),current=transactions.filter(t=>monthKey(t.date)===month),expenses=current.filter(t=>t.type==='expense'),income=current.filter(t=>t.type==='income'),created:NivoraNotification[]=[];
 const add=(kind:NotificationKind,severity:NotificationSeverity,title:string,body:string,key:string)=>{if(existing.some(n=>n.id===key)||created.some(n=>n.id===key))return;created.push({id:key,kind,severity,title,body,createdAt:new Date().toISOString(),read:false})};
 if(preferences.budgetAlerts){for(const budget of budgets.filter(b=>b.month===month)){const spent=budget.overallAmount!==undefined?expenses.reduce((s,t)=>s+t.amount,0):0;if(budget.overallAmount!==undefined){const ratio=budget.overallAmount>0?spent/budget.overallAmount:0;if(ratio>=1)add('budget','critical','Monthly budget exceeded',`${money(spent)} spent against a ${money(budget.overallAmount)} budget.`,`budget-over-${month}-${budget.id}`);else if(ratio>=.8)add('budget','warning','Monthly budget is nearing its limit',`${Math.round(ratio*100)}% used — ${money(Math.max(0,budget.overallAmount-spent))} remaining.`,`budget-near-${month}-${budget.id}`)}for(const [category,limit] of Object.entries(budget.categoryLimits)){const categorySpent=expenses.filter(t=>t.category===category).reduce((s,t)=>s+t.amount,0),ratio=limit>0?categorySpent/limit:0;if(ratio>=1)add('budget','critical',`${category} budget exceeded`,`${money(categorySpent)} spent against a ${money(limit)} budget.`,`budget-over-${month}-${budget.id}-${category}`);else if(ratio>=.8)add('budget','warning',`${category} budget is nearing its limit`,`${Math.round(ratio*100)}% used — ${money(Math.max(0,limit-categorySpent))} remaining.`,`budget-near-${month}-${budget.id}-${category}`)}}}
 if(preferences.recurringReminders){for(const item of recurring.filter(r=>r.active)){const days=daysUntil(item.nextDate);if(days<=3&&days>=0)add('recurring','info',`${item.note||item.category} is due soon`,days===0?'Due today.':`Due in ${days} day${days===1?'':'s'}.`,`recurring-${item.id}-${item.nextDate}`)}}
 const previousMonth=new Date(new Date().getFullYear(),new Date().getMonth()-1,1).toISOString().slice(0,7),previousExpenses=transactions.filter(t=>t.type==='expense'&&monthKey(t.date)===previousMonth).reduce((s,t)=>s+t.amount,0),currentExpenses=expenses.reduce((s,t)=>s+t.amount,0);
 if(previousExpenses>0&&currentExpenses>=previousExpenses*1.25)add('insight','warning','Spending is up this month',`Expenses are ${Math.round((currentExpenses/previousExpenses-1)*100)}% higher than last month.`,`spend-up-${month}`);
 if(previousExpenses>0&&currentExpenses<=previousExpenses*.75)add('insight','info','Spending is down this month',`Expenses are ${Math.round((1-currentExpenses/previousExpenses)*100)}% lower than last month.`,`spend-down-${month}`);
 const top=Object.entries(expenses.reduce<Record<string,number>>((a,t)=>(a[t.category]=(a[t.category]??0)+t.amount,a),{})).sort(([,a],[,b])=>b-a)[0];if(top)add('insight','info','Your top spending category',`${top[0]} accounts for ${money(top[1])} of this month’s expenses.`,`top-category-${month}`);
 if(preferences.monthlySummary&&(income.length||expenses.length)){const totalIncome=income.reduce((s,t)=>s+t.amount,0),net=totalIncome-currentExpenses;add('summary','info','Your monthly snapshot is ready',`${money(totalIncome)} income · ${money(currentExpenses)} expenses · ${net>=0?'+':''}${money(net)} net cash flow.`,`summary-${month}`)}
 return created;
}
