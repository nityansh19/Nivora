import { useMemo, useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowDownRight, ArrowUpRight, Copy, Eye, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { accountLabels, createTransaction, expenseCategories, formatMoney, incomeCategories, type AccountType, type Transaction, type TransactionType } from '../domain/finance';
import './transaction-center.css';

type Props = {
  transactions: Transaction[];
  onChange: (transactions: Transaction[]) => void;
};

type FormValues = {
  type: TransactionType;
  amount: string;
  category: string;
  date: string;
  account: AccountType;
  note: string;
};

const blankForm = (type: TransactionType = 'expense'): FormValues => ({
  type,
  amount: '',
  category: '',
  date: new Date().toISOString().slice(0, 10),
  account: 'upi',
  note: '',
});

export default function TransactionCenter({ transactions, onChange }: Props) {
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [detail, setDetail] = useState<Transaction | null>(null);
  const [composer, setComposer] = useState<TransactionType | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null);

  const filtered = useMemo(() => transactions
    .filter((t) => typeFilter === 'all' || t.type === typeFilter)
    .filter((t) => `${t.category} ${t.note ?? ''} ${accountLabels[t.account]}`.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt)), [transactions, query, typeFilter]);

  function createNew(type: TransactionType) {
    setComposer(type);
    setEditing(null);
  }

  function saveNew(values: FormValues) {
    const amount = Number(values.amount);
    if (!Number.isFinite(amount) || amount <= 0 || !values.category) return;
    const next = createTransaction({ type: values.type, amount, category: values.category, date: values.date, account: values.account, note: values.note.trim(), tags: [] });
    onChange([next, ...transactions]);
    setComposer(null);
  }

  function saveEdit(values: FormValues) {
    if (!editing) return;
    const amount = Number(values.amount);
    if (!Number.isFinite(amount) || amount <= 0 || !values.category) return;
    const updated: Transaction = { ...editing, type: values.type, amount, category: values.category, date: values.date, account: values.account, note: values.note.trim(), updatedAt: new Date().toISOString() };
    onChange(transactions.map((t) => t.id === editing.id ? updated : t));
    setEditing(null);
    setDetail(updated);
  }

  function duplicate(t: Transaction) {
    const copy = createTransaction({ type: t.type, amount: t.amount, category: t.category, date: new Date().toISOString().slice(0, 10), account: t.account, note: t.note ? `${t.note} (copy)` : 'Duplicate', tags: [...t.tags] });
    onChange([copy, ...transactions]);
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    onChange(transactions.filter((t) => t.id !== deleteTarget.id));
    if (detail?.id === deleteTarget.id) setDetail(null);
    setDeleteTarget(null);
  }

  return <div className="content transaction-center">
    <section className="hero-row transaction-hero">
      <div><p className="section-kicker">Transaction workspace</p><p className="muted">Review, edit and manage every financial entry in one place.</p></div>
      <div className="transaction-actions"><button className="secondary-button" onClick={() => createNew('income')}><ArrowUpRight size={16}/> Income</button><button className="primary-button" onClick={() => createNew('expense')}><Plus size={17}/> Expense</button></div>
    </section>

    <section className="panel transaction-manager">
      <div className="manager-toolbar">
        <div className="transaction-search manager-search"><Search size={16}/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search category, note or account" aria-label="Search transactions"/></div>
        <div className="filter-pills" role="group" aria-label="Transaction type filter">
          {(['all', 'expense', 'income'] as const).map((value) => <button key={value} className={typeFilter === value ? 'filter-pill active' : 'filter-pill'} onClick={() => setTypeFilter(value)}>{value === 'all' ? 'All' : value === 'expense' ? 'Expenses' : 'Income'}</button>)}
        </div>
        <span className="result-count">{filtered.length} {filtered.length === 1 ? 'entry' : 'entries'}</span>
      </div>

      {filtered.length ? <div className="managed-list">{filtered.map((t) => <ManagedTransaction key={t.id} transaction={t} onView={() => setDetail(t)} onEdit={() => setEditing(t)} onDuplicate={() => duplicate(t)} onDelete={() => setDeleteTarget(t)}/>)}</div> : <div className="manager-empty"><div className="empty-list-icon"><Search size={19}/></div><strong>No matching transactions</strong><span>Try another search or add a new entry.</span></div>}
    </section>

    <AnimatePresence>
      {(composer || editing) && <TransactionFormModal mode={editing ? 'edit' : 'create'} initial={editing ? toForm(editing) : blankForm(composer ?? 'expense')} onClose={() => { setComposer(null); setEditing(null); }} onSave={editing ? saveEdit : saveNew}/>} 
      {detail && <TransactionDetail transaction={detail} onClose={() => setDetail(null)} onEdit={() => { setEditing(detail); setDetail(null); }} onDuplicate={() => duplicate(detail)} onDelete={() => setDeleteTarget(detail)}/>} 
      {deleteTarget && <DeleteModal transaction={deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={confirmDelete}/>} 
    </AnimatePresence>
  </div>;
}

function ManagedTransaction({ transaction: t, onView, onEdit, onDuplicate, onDelete }: { transaction: Transaction; onView: () => void; onEdit: () => void; onDuplicate: () => void; onDelete: () => void }) {
  const income = t.type === 'income';
  return <div className="managed-row">
    <button className={`transaction-icon ${income ? 'income' : 'expense'}`} onClick={onView} aria-label={`View ${t.category}`}><span>{income ? <ArrowUpRight size={16}/> : <ArrowDownRight size={16}/>}</span></button>
    <button className="managed-main" onClick={onView}><strong>{t.category}</strong><span>{t.note || accountLabels[t.account]} · {new Date(`${t.date}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span></button>
    <strong className={income ? 'amount income-text' : 'amount'}>{income ? '+' : '-'}{formatMoney(t.amount)}</strong>
    <div className="row-actions"><button className="icon-button" onClick={onView} aria-label="View details"><Eye size={16}/></button><button className="icon-button" onClick={onEdit} aria-label="Edit transaction"><Pencil size={16}/></button><button className="icon-button" onClick={onDuplicate} aria-label="Duplicate transaction"><Copy size={16}/></button><button className="icon-button danger-action" onClick={onDelete} aria-label="Delete transaction"><Trash2 size={16}/></button></div>
  </div>;
}

function toForm(t: Transaction): FormValues { return { type: t.type, amount: String(t.amount), category: t.category, date: t.date, account: t.account, note: t.note ?? '' }; }

function TransactionFormModal({ mode, initial, onClose, onSave }: { mode: 'create' | 'edit'; initial: FormValues; onClose: () => void; onSave: (values: FormValues) => void }) {
  const [form, setForm] = useState(initial);
  const [error, setError] = useState('');
  const categories = form.type === 'expense' ? expenseCategories : incomeCategories;
  function submit(e: FormEvent) { e.preventDefault(); const amount = Number(form.amount); if (!Number.isFinite(amount) || amount <= 0) return setError('Enter an amount greater than ₹0.'); if (!form.category) return setError('Choose a category.'); onSave(form); }
  return <motion.div className="composer-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}><motion.form className="composer transaction-form-modal" initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 24, opacity: 0 }} onClick={(e) => e.stopPropagation()} onSubmit={submit}>
    <div className="composer-header"><div><p className="eyebrow">{mode === 'edit' ? 'Update entry' : 'New entry'}</p><h2>{mode === 'edit' ? 'Edit transaction' : `Add ${form.type}`}</h2></div><button type="button" className="icon-button" onClick={onClose} aria-label="Close"><X size={18}/></button></div>
    {mode === 'create' && <div className="type-switch"><button type="button" className={form.type === 'expense' ? 'active' : ''} onClick={() => setForm({ ...form, type: 'expense', category: '' })}>Expense</button><button type="button" className={form.type === 'income' ? 'active' : ''} onClick={() => setForm({ ...form, type: 'income', category: '' })}>Income</button></div>}
    <label>Amount<input autoFocus inputMode="decimal" value={form.amount} onChange={(e) => { setForm({ ...form, amount: e.target.value }); setError(''); }} placeholder="₹ 0"/></label>
    <div className="composer-two"><label>Category<select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}><option value="">Select category</option>{categories.map((c) => <option key={c}>{c}</option>)}</select></label><label>Date<input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}/></label></div>
    <label>Account / payment method<select value={form.account} onChange={(e) => setForm({ ...form, account: e.target.value as AccountType })}>{Object.entries(accountLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
    <label>Note<input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="What was this for?" maxLength={120}/></label>
    {error && <p className="form-error" role="alert">{error}</p>}
    <button className="primary-button full" type="submit">{mode === 'edit' ? 'Save changes' : 'Save transaction'}</button><p className="form-note">Your existing local data is preserved.</p>
  </motion.form></motion.div>;
}

function TransactionDetail({ transaction: t, onClose, onEdit, onDuplicate, onDelete }: { transaction: Transaction; onClose: () => void; onEdit: () => void; onDuplicate: () => void; onDelete: () => void }) {
  const income = t.type === 'income';
  return <motion.div className="composer-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}><motion.div className="detail-modal" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
    <div className="composer-header"><div><p className="eyebrow">Transaction detail</p><h2>{t.category}</h2></div><button className="icon-button" onClick={onClose} aria-label="Close"><X size={18}/></button></div>
    <div className="detail-amount"><span className={income ? 'income-text' : ''}>{income ? '+' : '-'}{formatMoney(t.amount)}</span><small>{income ? 'Income' : 'Expense'}</small></div>
    <div className="detail-grid"><DetailItem label="Date" value={new Date(`${t.date}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}/><DetailItem label="Category" value={t.category}/><DetailItem label="Account" value={accountLabels[t.account]}/><DetailItem label="Note" value={t.note || 'No note added'}/><DetailItem label="Created" value={new Date(t.createdAt).toLocaleString('en-IN', { dateStyle: 'medium' })}/><DetailItem label="Last updated" value={new Date(t.updatedAt).toLocaleString('en-IN', { dateStyle: 'medium' })}/></div>
    <div className="detail-actions"><button className="secondary-button" onClick={onDuplicate}><Copy size={16}/> Duplicate</button><button className="secondary-button" onClick={onEdit}><Pencil size={16}/> Edit</button><button className="danger-button" onClick={onDelete}><Trash2 size={16}/> Delete</button></div>
  </motion.div></motion.div>;
}
function DetailItem({ label, value }: { label: string; value: string }) { return <div><span>{label}</span><strong>{value}</strong></div>; }
function DeleteModal({ transaction: t, onClose, onConfirm }: { transaction: Transaction; onClose: () => void; onConfirm: () => void }) { return <motion.div className="composer-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}><motion.div className="confirm-modal" initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 16, opacity: 0 }} onClick={(e) => e.stopPropagation()}><div className="danger-badge"><Trash2 size={18}/></div><h2>Delete transaction?</h2><p>This will permanently remove <strong>{t.category}</strong> from this device.</p><div className="confirm-actions"><button className="secondary-button" onClick={onClose}>Cancel</button><button className="danger-button" onClick={onConfirm}>Delete</button></div></motion.div></motion.div>; }
