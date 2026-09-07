export type SavingsGoal = { id:string; name:string; targetAmount:number; savedAmount:number; targetDate?:string; color:string; createdAt:string; updatedAt:string };
export type SavingsEntry = { id:string; goalId?:string; type:'contribution'|'withdrawal'; amount:number; date:string; note?:string; createdAt:string };
export function createSavingsGoal(input:Omit<SavingsGoal,'id'|'createdAt'|'updatedAt'>):SavingsGoal { const now=new Date().toISOString(); return {...input,id:crypto.randomUUID(),createdAt:now,updatedAt:now}; }
export function createSavingsEntry(input:Omit<SavingsEntry,'id'|'createdAt'>):SavingsEntry { return {...input,id:crypto.randomUUID(),createdAt:new Date().toISOString()}; }
export function goalProgress(goal:SavingsGoal){ return goal.targetAmount>0?Math.min(100,Math.round(goal.savedAmount/goal.targetAmount*100)):0; }
export function totalSaved(entries:SavingsEntry[]){ return entries.reduce((sum,e)=>sum+(e.type==='contribution'?e.amount:-e.amount),0); }
export function savingsRate(income:number,expenses:number){ return income>0?Math.max(0,Math.round((income-expenses)/income*100)):0; }
export function monthlySaved(entries:SavingsEntry[],month=new Date().toISOString().slice(0,7)){ return entries.filter(e=>e.date.startsWith(month)).reduce((sum,e)=>sum+(e.type==='contribution'?e.amount:-e.amount),0); }
export function expectedCompletion(goal:SavingsGoal,entries:SavingsEntry[],today=new Date()){
  if(goal.savedAmount>=goal.targetAmount)return 'Goal reached';
  if(goal.targetDate){ const target=new Date(`${goal.targetDate}T00:00:00`); if(!Number.isNaN(target.getTime()) && target>today)return `Target ${target.toLocaleDateString('en-IN',{month:'short',year:'numeric'})}`; }
  const remaining=goal.targetAmount-goal.savedAmount;
  const contributions=entries.filter(e=>e.goalId===goal.id&&e.type==='contribution').sort((a,b)=>a.date.localeCompare(b.date));
  if(contributions.length===0)return 'Add your first contribution';
  const first=new Date(contributions[0].date+'T00:00:00');
  const months=Math.max(1,(today.getFullYear()-first.getFullYear())*12+today.getMonth()-first.getMonth()+1);
  const monthly=contributions.reduce((s,e)=>s+e.amount,0)/months;
  if(monthly<=0)return 'Keep saving to estimate';
  const needed=Math.ceil(remaining/monthly);
  const d=new Date(today.getFullYear(),today.getMonth()+needed,1);
  return 'Est. '+d.toLocaleDateString('en-IN',{month:'short',year:'numeric'});
}
