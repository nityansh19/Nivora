import { useMemo, useState } from 'react';
import { ArrowUpRight, Bot, Check, ChevronRight, Send, Sparkles, TrendingDown, TrendingUp, X, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Transaction } from '../domain/finance';
import type { SavingsGoal } from '../domain/savings';
import { answerFinancialQuestion, type AssistantResponse } from '../domain/assistant';
import { proposeAssistantAction, type AssistantAction } from '../domain/assistantActions';
import './financial-assistant.css';

type Props = { transactions: Transaction[]; goals: SavingsGoal[]; monthlyBudget: number; onClose?: () => void; onAction?: (action: AssistantAction) => void };
const prompts = ['How am I doing this month?', 'Where am I spending the most?', 'How much budget do I have left?', 'How are my savings goals doing?'];

export default function FinancialAssistant({ transactions, goals, monthlyBudget, onClose, onAction }: Props) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<AssistantResponse[]>([]);
  const [proposal, setProposal] = useState<AssistantAction | null>(null);
  const [done, setDone] = useState(false);
  const starter = useMemo(() => answerFinancialQuestion('How am I doing this month?', transactions, goals, monthlyBudget), [transactions, goals, monthlyBudget]);

  function ask(question = input) {
    const value = question.trim();
    if (!value) return;
    const action = proposeAssistantAction(value);
    if (action && onAction) { setProposal(action); setDone(false); } else setMessages(current => [...current, answerFinancialQuestion(value, transactions, goals, monthlyBudget)]);
    setInput('');
  }
  function confirmAction() { if (!proposal || !onAction) return; onAction(proposal); setDone(true); setMessages(current => [...current, { title: 'Action completed.', body: `${proposal.title} was added to your Nivora workspace.`, facts: ['Confirmed by you', 'Saved locally in your current workspace'], intent: 'summary' }]); setProposal(null); }

  return <div className="assistant-shell">
    <div className="assistant-header"><div className="assistant-brand"><div className="assistant-mark"><Bot size={19}/></div><div><p className="eyebrow">NIVORA INTELLIGENCE</p><h2>Money, explained.</h2><span>Answers grounded in your saved workspace.</span></div></div>{onClose && <button className="icon-button" onClick={onClose} aria-label="Close assistant"><X size={18}/></button>}</div>
    <div className="assistant-hero"><div className="assistant-orb"><Sparkles size={22}/></div><div><p className="section-kicker">Financial copilot</p><h3>Ask a question. Get a clear answer.</h3><p>Understand your money or ask Nivora to prepare an action for your confirmation.</p></div></div>
    <div className="assistant-prompts">{prompts.map(prompt => <button key={prompt} onClick={() => ask(prompt)}>{prompt}<ChevronRight size={14}/></button>)}</div>
    <div className="assistant-conversation"><ResponseCard response={starter} />{messages.map((message, index) => <motion.div key={`${message.title}-${index}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}><ResponseCard response={message} /></motion.div>)}</div>
    {proposal && <motion.div className="assistant-proposal" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}><div className="proposal-icon"><Zap size={17}/></div><div className="proposal-copy"><p className="eyebrow">ACTION PROPOSAL</p><strong>{proposal.title}</strong><span>{proposal.description}</span><small>Nivora will not change your data until you confirm.</small></div><div className="proposal-actions"><button className="secondary-button" onClick={() => setProposal(null)}>Cancel</button><button className="primary-button" onClick={confirmAction}><Check size={16}/> Confirm</button></div></motion.div>}
    {done && <div className="assistant-confirmed" role="status"><Check size={15}/> Action saved successfully.</div>}
    <form className="assistant-input" onSubmit={e => { e.preventDefault(); ask(); }}><input value={input} onChange={e => setInput(e.target.value)} placeholder="Ask, or try “set my budget to ₹10,000”…" aria-label="Ask Nivora" /><button type="submit" aria-label="Send question"><Send size={17}/></button></form>
    <p className="assistant-disclaimer">Nivora Intelligence is an informational workspace feature. Actions always require your confirmation.</p>
  </div>;
}

function ResponseCard({ response }: { response: AssistantResponse }) { return <article className="assistant-response"><div className="response-icon">{response.intent === 'spending' ? <TrendingDown size={17}/> : response.intent === 'summary' ? <TrendingUp size={17}/> : <ArrowUpRight size={17}/>}</div><div className="response-content"><strong>{response.title}</strong><p>{response.body}</p>{response.facts.length > 0 && <div className="response-facts">{response.facts.map(fact => <span key={fact}>{fact}</span>)}</div>}</div></article>; }
