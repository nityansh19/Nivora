import type { Account } from '../domain/accounts';
import { createAccount } from '../domain/accounts';
import type { Transaction } from '../domain/finance';
import { loadAccounts, saveAccounts } from './accountStorage';
import { loadTransactions, saveTransactions } from './storage';

const MIGRATION_KEY='nivora.account-link-migration.v1';
export function migrateTransactionAccounts():{transactions:Transaction[];accounts:Account[]}{
  let accounts=loadAccounts(); let transactions=loadTransactions();
  if(localStorage.getItem(MIGRATION_KEY)==='done') return {transactions,accounts};
  const byType=new Map<string,Account>();
  for(const account of accounts) if(!byType.has(account.type)) byType.set(account.type,account);
  const legacyTypes=[...new Set(transactions.filter(t=>!t.accountId).map(t=>t.account))];
  for(const type of legacyTypes){
    if(byType.has(type)) continue;
    const account=createAccount({name:`${type.toUpperCase()} (migrated)`,type,openingBalance:0});
    accounts=[...accounts,account]; byType.set(type,account);
  }
  transactions=transactions.map(t=>{if(t.accountId)return t;const account=byType.get(t.account);return account?{...t,accountId:account.id}:t});
  saveTransactions(transactions); saveAccounts(accounts); localStorage.setItem(MIGRATION_KEY,'done');
  return {transactions,accounts};
}
