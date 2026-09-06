import type { SavingsEntry, SavingsGoal } from '../domain/savings';
const GOALS_KEY='nivora.savings.goals.v1'; const ENTRIES_KEY='nivora.savings.entries.v1';
export function loadSavingsGoals():SavingsGoal[]{try{const raw=localStorage.getItem(GOALS_KEY);const parsed=raw?JSON.parse(raw):[];return Array.isArray(parsed)?parsed:[]}catch{return []}}
export function saveSavingsGoals(goals:SavingsGoal[]){localStorage.setItem(GOALS_KEY,JSON.stringify(goals));}
export function loadSavingsEntries():SavingsEntry[]{try{const raw=localStorage.getItem(ENTRIES_KEY);const parsed=raw?JSON.parse(raw):[];return Array.isArray(parsed)?parsed:[]}catch{return []}}
export function saveSavingsEntries(entries:SavingsEntry[]){localStorage.setItem(ENTRIES_KEY,JSON.stringify(entries));}
