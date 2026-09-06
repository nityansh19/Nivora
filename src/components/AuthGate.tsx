import { useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Check, ChevronLeft, CircleDollarSign, ShieldCheck, Sparkles } from 'lucide-react';
import { accountLabels, type AccountType } from '../domain/finance';
import { createAccount } from '../domain/accounts';
import { loadAccounts, saveAccounts } from '../data/accountStorage';
import { loadAuth, loadOnboarding, saveAuth, saveOnboarding, type OnboardingProfile } from '../domain/onboarding';

export default function AuthGate({ onComplete }: { onComplete: (profile: OnboardingProfile) => void }) {
  const existingAuth = loadAuth();
  const existingProfile = loadOnboarding();
  const [mode, setMode] = useState<'login' | 'signup'>(existingAuth.authenticated ? 'signup' : 'login');
  const [step, setStep] = useState(existingAuth.authenticated && !existingProfile.completed ? 1 : 0);
  const [email, setEmail] = useState(existingAuth.email);
  const [password, setPassword] = useState('');
  const [profile, setProfile] = useState<OnboardingProfile>(existingProfile);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function submitAuth(e: FormEvent) {
    e.preventDefault();
    setError('');
    const normalizedEmail = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) return setError('Enter a valid email address.');
    if (password.length < 6) return setError('Use at least 6 characters for your password.');
    setLoading(true);
    window.setTimeout(() => {
      saveAuth(normalizedEmail);
      setLoading(false);
      const nextProfile = loadOnboarding();
      if (nextProfile.completed) onComplete(nextProfile);
      else setStep(1);
    }, 350);
  }

  function finish() {
    const next = { ...profile, completed: true, name: profile.name.trim() || 'Nivora user', primaryAccountName: profile.primaryAccountName.trim() || 'Main account' };
    saveOnboarding(next);
    const accounts = loadAccounts();
    if (!accounts.length) saveAccounts([createAccount({ name: next.primaryAccountName, type: next.primaryAccountType, openingBalance: next.openingBalance })]);
    onComplete(next);
  }

  const steps = [
    { title: 'Make Nivora yours.', copy: 'A few details are enough to build your financial workspace.', content: <label>Your name<input autoFocus value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} placeholder="How should Nivora greet you?" maxLength={60} /></label> },
    { title: 'Set your baseline.', copy: 'Choose the account and starting balance you want Nivora to use.', content: <div className="auth-fields"><label>Primary account name<input value={profile.primaryAccountName} onChange={e => setProfile({ ...profile, primaryAccountName: e.target.value })} maxLength={40} /></label><label>Account type<select value={profile.primaryAccountType} onChange={e => setProfile({ ...profile, primaryAccountType: e.target.value as AccountType })}>{Object.entries(accountLabels).map(([key, value]) => <option key={key} value={key}>{value}</option>)}</select></label><label>Starting balance<input type="number" min="0" inputMode="decimal" value={profile.openingBalance || ''} onChange={e => setProfile({ ...profile, openingBalance: Math.max(0, Number(e.target.value) || 0) })} placeholder="₹ 0" /></label></div> },
    { title: 'Give your month a target.', copy: 'These numbers guide your dashboard. You can change them anytime.', content: <div className="auth-fields"><label>Expected monthly income<input type="number" min="0" inputMode="decimal" value={profile.monthlyIncome || ''} onChange={e => setProfile({ ...profile, monthlyIncome: Math.max(0, Number(e.target.value) || 0) })} placeholder="₹ 0" /></label><label>Monthly spending budget<input type="number" min="0" inputMode="decimal" value={profile.monthlyBudget || ''} onChange={e => setProfile({ ...profile, monthlyBudget: Math.max(0, Number(e.target.value) || 0) })} placeholder="₹ 0" /></label><label>Monthly savings target<input type="number" min="0" inputMode="decimal" value={profile.savingsTarget || ''} onChange={e => setProfile({ ...profile, savingsTarget: Math.max(0, Number(e.target.value) || 0) })} placeholder="₹ 0" /></label></div> },
    { title: 'Your workspace is ready.', copy: 'Review the basics, then enter your private finance workspace.', content: <div className="auth-review"><div><span>Profile</span><strong>{profile.name || 'Nivora user'}</strong></div><div><span>Primary account</span><strong>{profile.primaryAccountName || 'Main account'} · {accountLabels[profile.primaryAccountType]}</strong></div><div><span>Monthly income</span><strong>₹{profile.monthlyIncome.toLocaleString('en-IN')}</strong></div><div><span>Monthly budget</span><strong>₹{profile.monthlyBudget.toLocaleString('en-IN')}</strong></div><div><span>Savings target</span><strong>₹{profile.savingsTarget.toLocaleString('en-IN')}</strong></div></div> },
  ];

  return <div className="auth-shell"><div className="auth-brand"><div className="brand-mark">N</div><span>Nivora</span><small>Private finance OS</small></div><div className="auth-grid"><section className="auth-visual"><div className="auth-visual-copy"><div className="auth-kicker"><Sparkles size={14}/> CALM MONEY MANAGEMENT</div><p className="eyebrow">PERSONAL FINANCE OS</p><h1>Clarity for every rupee.</h1><p>Track, plan and understand your money in one calm workspace — designed to make everyday decisions feel lighter.</p><div className="auth-proof"><ShieldCheck size={17}/><span>Private by default · Stored locally for now</span></div></div><div className="auth-orbit"><CircleDollarSign size={36}/><span>₹</span></div></section><section className="auth-card"><AnimatePresence mode="wait">{step === 0 ? <motion.div key="auth" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}><div className="auth-header"><p className="eyebrow">{mode === 'login' ? 'WELCOME BACK' : 'NEW WORKSPACE'}</p><h2>{mode === 'login' ? 'Sign in to Nivora' : 'Create your workspace'}</h2><p>{mode === 'login' ? 'Continue where you left off.' : 'Start your private finance workspace.'}</p></div><form onSubmit={submitAuth} className="auth-form"><label>Email<input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" required /></label><label>Password<input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required /></label>{error && <p className="form-error" role="alert">{error}</p>}<button className="primary-button full" disabled={loading}>{loading ? 'Opening Nivora…' : mode === 'login' ? 'Sign in' : 'Create account'} <ArrowRight size={17}/></button></form><div className="auth-switch">{mode === 'login' ? "New to Nivora?" : 'Already have an account?'} <button type="button" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}>{mode === 'login' ? 'Create account' : 'Sign in'}</button></div></motion.div> : <motion.div key={step} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}><div className="step-top"><button type="button" className="icon-button" onClick={() => setStep(step - 1)} aria-label="Previous step"><ChevronLeft size={18}/></button><span>Setup {step} of 3</span><div className="step-progress"><i style={{ width: `${(step / 3) * 100}%` }}/></div></div><div className="auth-header"><p className="eyebrow">PERSONALIZE</p><h2>{steps[step].title}</h2><p>{steps[step].copy}</p></div><div className="auth-form">{steps[step].content}<button className="primary-button full" onClick={() => step === 3 ? finish() : setStep(step + 1)}>{step === 3 ? <>Enter Nivora <Check size={17}/></> : <>Continue <ArrowRight size={17}/></>}</button></div></motion.div>}</AnimatePresence></section></div><footer>Built for your financial life · Nivora</footer></div>;
}
