import type { Account } from '../domain/accounts';
import { createAccount } from '../domain/accounts';
import type { Transaction } from '../domain/finance';
import { loadAccounts, saveAccounts } from './accountStorage';
import { loadTransactions, saveTransactions } from './storage';

const MIGRATION_KEY='nivora.account-link-migration.v1';

export function migrateTransactionAccounts():{transactions:Transaction[];accounts:Account[]}{
  let accounts=loadAccounts();
  const transactions=loadTransactions();
  if(localStorage.getItem(MIGRATION_KEY)==='done' && transactions.every(t=>t.accountId)) return {transactions,accounts};

  const byType=new Map<string,Account>();
  for(const account of accounts) if(!byType.has(account.type)) byType.set(account.type,account);

  let accountsChanged=false;
  for(const type of new Set(transactions.filter(t=>!t.accountId).map(t=>t.account))){
    if(byType.has(type)) continue;
    const account=createAccount({name:`${type.toUpperCase()} (migrated)`,type,openingBalance:0});
    accounts=[...accounts,account];
    byType.set(type,account);
    accountsChanged=true;
  }

  let transactionsChanged=false;
  const migrated=transactions.map(t=>{
    if(t.accountId) return t;
    const account=byType.get(t.account);
    if(!account) return t;
    transactionsChanged=true;
    return {...t,accountId:account.id};
  });

  if(transactionsChanged) saveTransactions(migrated);
  if(accountsChanged) saveAccounts(accounts);
  localStorage.setItem(MIGRATION_KEY,'done');
  return {transactions:migrated,accounts};
}
