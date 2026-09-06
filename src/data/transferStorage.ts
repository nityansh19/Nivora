import type { Transfer } from '../domain/accounts';
const KEY='nivora.transfers.v1';
export function loadTransfers():Transfer[]{try{const raw=localStorage.getItem(KEY);const value=raw?JSON.parse(raw):[];return Array.isArray(value)?value:[]}catch{return []}}
export function saveTransfers(items:Transfer[]){localStorage.setItem(KEY,JSON.stringify(items))}
