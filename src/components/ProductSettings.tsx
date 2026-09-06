import { useRef, useState } from 'react';
import { CheckCircle2, Cloud, Download, FileUp, Moon, RotateCcw, ShieldCheck, Trash2 } from 'lucide-react';
import type { Transaction } from '../domain/finance';
import { downloadBackup, parseBackup } from '../domain/backup';
import { isSupabaseConfigured } from '../lib/supabaseClient';
import './product-settings.css';

type Props = {
  transactions: Transaction[];
  dark: boolean;
  onTheme: (dark: boolean) => void;
  onImport: (transactions: Transaction[]) => void;
};

export default function ProductSettings({ transactions, dark, onTheme, onImport }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState('');

  function exportData() {
    downloadBackup(transactions);
    setMessage('Backup exported successfully.');
  }

  function importData(file?: File) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = parseBackup(String(reader.result));
        onImport(imported);
        setMessage(`${imported.length} transaction${imported.length === 1 ? '' : 's'} restored.`);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : 'Unable to restore this backup.');
      }
    };
    reader.readAsText(file);
  }

  function clearData() {
    if (!transactions.length) return setMessage('There is no transaction data to clear.');
    if (window.confirm('Clear all transactions from this device? This cannot be undone unless you have a backup.')) {
      onImport([]);
      setMessage('Transaction data cleared.');
    }
  }

  return <div className="content settings-page">
    <section className="settings-hero"><div><p className="section-kicker">Product settings</p><h2>Make Nivora yours.</h2><p className="muted">Preferences, privacy and data controls — designed to stay understandable.</p></div></section>
    <div className="settings-grid">
      <section className="panel settings-card">
        <div className="settings-card-head"><div className="settings-icon"><ShieldCheck size={18}/></div><div><h2>Security & cloud</h2><p>Your current authentication and sync posture.</p></div></div>
        <div className="cloud-status"><div className="cloud-status-icon"><Cloud size={18}/></div><div><strong>{isSupabaseConfigured ? 'Cloud authentication connected' : 'Local-first mode'}</strong><span>{isSupabaseConfigured ? 'Supabase Auth is configured for this build. Cloud data sync is staged behind the sync layer.' : 'Your current workspace stays on this device until cloud credentials are configured.'}</span></div><CheckCircle2 size={17}/></div>
        <small className="settings-note">Never place a Supabase secret/service-role key in the browser. Production tables must use Row Level Security.</small>
      </section>
      <section className="panel settings-card">
        <div className="settings-card-head"><div className="settings-icon"><SunIcon dark={dark}/></div><div><h2>Appearance</h2><p>Choose how Nivora looks on this device.</p></div></div>
        <div className="theme-options"><button className={!dark ? 'theme-option active' : 'theme-option'} onClick={() => onTheme(false)}><span>Light</span></button><button className={dark ? 'theme-option active' : 'theme-option'} onClick={() => onTheme(true)}><Moon size={17}/><span>Dark</span></button></div>
      </section>
      <section className="panel settings-card">
        <div className="settings-card-head"><div className="settings-icon"><Download size={18}/></div><div><h2>Your data</h2><p>Export or restore your local finance history.</p></div></div>
        <div className="settings-actions"><button className="secondary-button" onClick={exportData}><Download size={16}/> Export backup</button><button className="secondary-button" onClick={() => inputRef.current?.click()}><FileUp size={16}/> Import backup</button><input ref={inputRef} hidden type="file" accept="application/json,.json" onChange={e => { importData(e.target.files?.[0]); e.currentTarget.value = ''; }}/></div>
        <small className="settings-note">Backups are JSON files containing your Nivora transaction data. Nothing is uploaded by this feature.</small>
      </section>
      <section className="panel settings-card danger-card">
        <div className="settings-card-head"><div className="settings-icon danger"><Trash2 size={18}/></div><div><h2>Reset local data</h2><p>Remove all saved transactions from this browser.</p></div></div>
        <button className="danger-button" onClick={clearData}><Trash2 size={16}/> Clear transaction data</button>
      </section>
    </div>
    {message && <div className="settings-toast" role="status"><RotateCcw size={15}/>{message}</div>}
  </div>;
}

function SunIcon({ dark }: { dark: boolean }) { return dark ? <Moon size={18}/> : <span aria-hidden="true">☼</span>; }
