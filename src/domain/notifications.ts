import type { Transaction } from './finance';
import type { Budget } from './budget';
import type { RecurringTransaction } from './accounts';

export type NotificationKind = 'budget' | 'recurring' | 'insight' | 'summary';
export type NotificationSeverity = 'info' | 'warning' | 'critical';

export type NivoraNotification = {
  id: string;
  kind: NotificationKind;
  severity: NotificationSeverity;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
};

export type NotificationPreferences = {
  budgetAlerts: boolean;
  recurringReminders: boolean;
  monthlySummary: boolean;
};

export const defaultNotificationPreferences: NotificationPreferences = {
  budgetAlerts: true,
  recurringReminders: true,
  monthlySummary: true,
};

function id(){return typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`}
function monthKey(date:string){return date.slice(0,7)}
function daysUntil(date:string){return Math.ceil((new Date(`${date}T00:00:00`).getTime()-new Date().setHours(0,0,0,0))/86400000)}
function money(value:number){return new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(value)}

export function generateNotifications(transactions:Transaction[], budgets:Budget[], recurring:RecurringTransaction[], existing:NivoraNotification[], preferences:NotificationPreferences=defaultNotificationPreferences){
  const month=monthKey(new Date().toISOString());
  const current=transactions.filter(t=>monthKey(t.date)===month);
  const expenses=current.filter(t=>t.type==='expense');
  const income=current.filter(t=>t.type==='income');
  const created:NivoraNotification[]=[];
  const add=(kind:NotificationKind,severity:NotificationSeverity,title:string,body:string,key:string)=>{
    if(existing.some(n=>n.id===key)||created.some(n=>n.id===key)) return;
    created.push({id:key,kind,severity,title,body,createdAt:new Date().toISOString(),read:false});
  };
  if(preferences.budgetAlerts){
    for(const budget of budgets){
      const spent=budget.category==='Overall'?expenses.reduce((s,t)=>s+t.amount,0):expenses.filter(t=>t.category===budget.category).reduce((s,t)=>s+t.amount,0);
      const ratio=budget.limit>0?spent/budget.limit:0;
      if(ratio>=1) add('budget','critical',`${budget.category} budget exceeded`,`${money(spent)} spent against a ${money(budget.limit)} budget.`,`budget-over-${month}-${budget.id}`);
      else if(ratio>=.8) add('budget','warning',`${budget.category} budget is nearing its limit`,`${Math.round(ratio*100)}% used — ${money(Math.max(0,budget.limit-spent))} remaining.`,`budget-near-${month}-${budget.id}`);
    }
  }
  if(preferences.recurringReminders){
    for(const item of recurring.filter(r=>r.active)){
      const days=daysUntil(item.nextDate);
      if(days<=3 && days>=0) add('recurring','info',`${item.name} is due soon`,days===0?'Due today.':`Due in ${days} day${days===1?'':'s'}.`,`recurring-${item.id}-${item.nextDate}`);
    }
  }
  const previousMonth=new Date(new Date().getFullYear(),new Date().getMonth()-1,1).toISOString().slice(0,7);
  const previousExpenses=transactions.filter(t=>t.type==='expense'&&monthKey(t.date)===previousMonth).reduce((s,t)=>s+t.amount,0);
  const currentExpenses=expenses.reduce((s,t)=>s+t.amount,0);
  if(previousExpenses>0 && currentExpenses>=previousExpenses*1.25) add('insight','warning','Spending is up this month',`Expenses are ${Math.round((currentExpenses/previousExpenses-1)*100)}% higher than last month.`,`spend-up-${month}`);
  if(previousExpenses>0 && currentExpenses<=previousExpenses*.75) add('insight','info','Spending is down this month',`Expenses are ${Math.round((1-currentExpenses/previousExpenses)*100)}% lower than last month.`,`spend-down-${month}`);
  const top=Object.entries(expenses.reduce<Record<string,number>>((a,t)=>(a[t.category]=(a[t.category]??0)+t.amount,a),{})).sort(([,a],[,b])=>b-a)[0];
  if(top) add('insight','info','Your top spending category',`${top[0]} accounts for ${money(top[1])} of this month’s expenses.`,`top-category-${month}`);
  if(preferences.monthlySummary && (income.length||expenses.length)){
    const net=income.reduce((s,t)=>s+t.amount,0)-currentExpenses;
    add('summary','info','Your monthly snapshot is ready',`${money(income.reduce((s,t)=>s+t.amount,0))} income · ${money(currentExpenses)} expenses · ${net>=0?'+':''}${money(net)} net cash flow.`,`summary-${month}`);
  }
  return created;
}
