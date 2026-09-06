import type { Account } from '../domain/accounts';
import type { Transaction } from '../domain/finance';
import { loadAccounts, saveAccounts } from './accountStorage';
import { loadTransactions, saveTransactions } from './storage';

const MIGRATION_KEY='nivora.account-link-migration.v1';
export function migrateTransactionAccounts():{transactions:Transaction[];accounts:Account[]}{
  const accounts=loadAccounts(); let transactions=loadTransactions();
  if(localStorage.getItem(MIGRATION_KEY)==='done') return {transactions,accounts};
  const byType=new Map<string,Account>();
  for(const account of accounts) if(!byType.has(account.type)) byType.set(account.type,account);
  let changed=false;
  transactions=transactions.map(t=>{
    if(t.accountId) return t;
    const account=byType.get(t.account);
    if(!account) return t;
    changed=true; return {...t,accountId:account.id};
  });
  if(changed) saveTransactions(transactions);
  saveAccounts(accounts); localStorage.setItem(MIGRATION_KEY,'done');
  return {transactions,accounts};
}
