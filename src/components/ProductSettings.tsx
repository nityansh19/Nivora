import { useRef, useState } from 'react';
import { useMemo } from 'react';
import { Bot, CheckCircle2, Cloud, Download, FileUp, LogOut, Moon, RotateCcw, ShieldCheck, Trash2 } from 'lucide-react';
import type { Transaction } from '../domain/finance';
import { createTransaction } from '../domain/finance';
import { downloadBackup, parseBackup } from '../domain/backup';
import { cloudSignOut } from '../data/cloudAuth';
import { loadBudgets, saveBudgets } from '../data/budgetStorage';
import { loadSavingsGoals, saveSavingsGoals } from '../data/savingsStorage';
import { loadAccounts } from '../data/accountStorage';
import { createSavingsGoal } from '../domain/savings';
import { replaceOverallBudget, type AssistantAction } from '../domain/assistantActions';
import { clearAuth } from '../domain/onboarding';
import { isSupabaseConfigured } from '../lib/supabaseClient';
import FinancialAssistant from './FinancialAssistant';
import './product-settings.css';

type Props = { transactions: Transaction[]; dark: boolean; onTheme: (dark: boolean) => void; onImport: (transactions: Transaction[]) => void };

export default function ProductSettings({ transactions, dark, onTheme, onImport }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState('');
  const [assistantOpen, setAssistantOpen] = useState(false);
  const budget = useMemo(() => loadBudgets().find(b => b.month === `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`), []);
  function exportData() { downloadBackup(transactions); setMessage('Backup exported successfully.'); }
  function importData(file?: File) { if (!file) return; const reader = new FileReader(); reader.onload = () => { try { const imported = parseBackup(String(reader.result)); onImport(imported); setMessage(`${imported.length} transaction${imported.length === 1 ? '' : 's'} restored.`); } catch (error) { setMessage(error instanceof Error ? error.message : 'Unable to restore this backup.'); } }; reader.readAsText(file); }
  function clearData() { if (!transactions.length) return setMessage('There is no transaction data to clear.'); if (window.confirm('Clear all transactions from this device? This cannot be undone unless you have a backup.')) { onImport([]); setMessage('Transaction data cleared.'); } }
  async function signOut() { const result = await cloudSignOut(); if (!result.ok) return setMessage(result.message ?? 'Unable to sign out.'); clearAuth(); window.location.reload(); }
  function executeAssistantAction(action: AssistantAction) {
    if (action.type === 'create_budget') {
      const next = replaceOverallBudget(loadBudgets(), Number(action.fields.amount)); saveBudgets(next); setMessage('Monthly budget updated by Nivora Intelligence.'); return;
    }
    if (action.type === 'create_savings_goal') {
      const goals = loadSavingsGoals(); const name = String(action.fields.name); const next = createSavingsGoal({ name, targetAmount: Number(action.fields.amount), savedAmount: 0, color: 'primary' }); saveSavingsGoals([...goals, next]); setMessage(`Savings goal “${name}” created.`); return;
    }
    if (action.type === 'add_expense') {
      const account = loadAccounts()[0]; const transaction = createTransaction({ type: 'expense', amount: Number(action.fields.amount), category: String(action.fields.category), date: new Date().toISOString().slice(0, 10), account: account?.type ?? 'upi', accountId: account?.id, note: 'Added with Nivora Intelligence', tags: [] }); onImport([transaction, ...transactions]); setMessage('Expense added by Nivora Intelligence.');
    }
  }
  return <div className="content settings-page">
    <section className="settings-hero"><div><p className="section-kicker">Product settings</p><h2>Make Nivora yours.</h2><p className="muted">Preferences, privacy and data controls — designed to stay understandable.</p></div></section>
    <div className="settings-grid">
      <section className="panel settings-card assistant-settings-card"><div className="settings-card-head"><div className="settings-icon assistant-settings-icon"><Bot size={18}/></div><div><h2>Nivora Intelligence</h2><p>Ask questions or let Nivora prepare confirmed actions.</p></div></div><div className="assistant-settings-preview"><strong>Money, explained — and acted on.</strong><span>Questions · proposals · confirmation · execution</span><button className="secondary-button" onClick={() => setAssistantOpen(true)}>Open assistant <Bot size={16}/></button></div></section>
      <section className="panel settings-card"><div className="settings-card-head"><div className="settings-icon"><ShieldCheck size={18}/></div><div><h2>Security & cloud</h2><p>Your current authentication and sync posture.</p></div></div><div className="cloud-status"><div className="cloud-status-icon"><Cloud size={18}/></div><div><strong>{isSupabaseConfigured ? 'Cloud authentication connected' : 'Local-first mode'}</strong><span>{isSupabaseConfigured ? 'Supabase Auth is configured for this build. Cloud data sync is staged behind the sync layer.' : 'Your current workspace stays on this device until cloud credentials are configured.'}</span></div><CheckCircle2 size={17}/></div><div className="settings-actions single"><button className="secondary-button" onClick={signOut}><LogOut size={16}/> Sign out</button></div><small className="settings-note">Never place a Supabase secret/service-role key in the browser. Production tables must use Row Level Security.</small></section>
      <section className="panel settings-card"><div className="settings-card-head"><div className="settings-icon">{dark ? <Moon size={18}/> : <span aria-hidden="true">☼</span>}</div><div><h2>Appearance</h2><p>Choose how Nivora looks on this device.</p></div></div><div className="theme-options"><button className={!dark ? 'theme-option active' : 'theme-option'} onClick={() => onTheme(false)}><span>Light</span></button><button className={dark ? 'theme-option active' : 'theme-option'} onClick={() => onTheme(true)}><Moon size={17}/><span>Dark</span></button></div></section>
      <section className="panel settings-card"><div className="settings-card-head"><div className="settings-icon"><Download size={18}/></div><div><h2>Your data</h2><p>Export or restore your local finance history.</p></div></div><div className="settings-actions"><button className="secondary-button" onClick={exportData}><Download size={16}/> Export backup</button><button className="secondary-button" onClick={() => inputRef.current?.click()}><FileUp size={16}/> Import backup</button><input ref={inputRef} hidden type="file" accept="application/json,.json" onChange={e => { importData(e.target.files?.[0]); e.currentTarget.value = ''; }}/></div><small className="settings-note">Backups are JSON files containing your Nivora transaction data. Nothing is uploaded by this feature.</small></section>
      <section className="panel settings-card danger-card"><div className="settings-card-head"><div className="settings-icon danger"><Trash2 size={18}/></div><div><h2>Reset local data</h2><p>Remove all saved transactions from this browser.</p></div></div><button className="danger-button" onClick={clearData}><Trash2 size={16}/> Clear transaction data</button></section>
    </div>
    {message && <div className="settings-toast" role="status"><RotateCcw size={15}/>{message}</div>}
    {assistantOpen && <div className="assistant-modal-backdrop" role="presentation" onClick={() => setAssistantOpen(false)}><div className="assistant-modal" onClick={e => e.stopPropagation()}><FinancialAssistant transactions={transactions} goals={loadSavingsGoals()} monthlyBudget={budget?.overallAmount ?? 0} onAction={executeAssistantAction} onClose={() => setAssistantOpen(false)} /></div></div>}
  </div>;
}
