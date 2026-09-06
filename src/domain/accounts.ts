import type { AccountType, Transaction, TransactionType } from './finance';

export type Account = { id:string; name:string; type:AccountType; openingBalance:number; color?:string; createdAt:string; updatedAt:string };
export type Recurrence = 'weekly'|'monthly'|'yearly';
export type RecurringTransaction = { id:string; type:TransactionType; amount:number; category:string; accountId:string; note?:string; recurrence:Recurrence; nextDate:string; active:boolean; createdAt:string; updatedAt:string };
export type Transfer = { id:string; amount:number; fromAccountId:string; toAccountId:string; date:string; note?:string; createdAt:string };
const newId=()=>typeof crypto!=='undefined'&&crypto.randomUUID?crypto.randomUUID():`${Date.now()}-${Math.random().toString(36).slice(2)}`;
export function createAccount(input:Omit<Account,'id'|'createdAt'|'updatedAt'>):Account{const now=new Date().toISOString();return {...input,id:newId(),createdAt:now,updatedAt:now};}
export function createRecurringTransaction(input:Omit<RecurringTransaction,'id'|'createdAt'|'updatedAt'>):RecurringTransaction{const now=new Date().toISOString();return {...input,id:newId(),createdAt:now,updatedAt:now};}
export function createTransfer(input:Omit<Transfer,'id'|'createdAt'>):Transfer{return {...input,id:newId(),createdAt:new Date().toISOString()};}
export function accountBalance(account:Account,transactions:Transaction[],transfers:Transfer[]=[]){return account.openingBalance+transactions.reduce((total,t)=>{if(t.accountId!==account.id)return total;return total+(t.type==='income'?t.amount:-t.amount)},0)+transfers.reduce((total,t)=>{if(t.toAccountId===account.id)return total+t.amount;if(t.fromAccountId===account.id)return total-t.amount;return total},0)}
export function nextOccurrence(date:string,recurrence:Recurrence){const next=new Date(`${date}T00:00:00`);if(recurrence==='weekly')next.setDate(next.getDate()+7);else if(recurrence==='monthly')next.setMonth(next.getMonth()+1);else next.setFullYear(next.getFullYear()+1);return next.toISOString().slice(0,10)}
