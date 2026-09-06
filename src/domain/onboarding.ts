export type OnboardingProfile = {
  completed: boolean;
  name: string;
  currency: string;
  monthlyIncome: number;
  primaryAccountName: string;
  primaryAccountType: 'cash' | 'bank' | 'upi' | 'debit_card' | 'credit_card' | 'wallet' | 'custom';
  openingBalance: number;
  monthlyBudget: number;
  savingsTarget: number;
};

export const ONBOARDING_KEY = 'nivora.onboarding.v1';
export const AUTH_KEY = 'nivora.auth.v1';

export const defaultOnboardingProfile: OnboardingProfile = { completed: false, name: '', currency: 'INR', monthlyIncome: 0, primaryAccountName: 'Main account', primaryAccountType: 'upi', openingBalance: 0, monthlyBudget: 0, savingsTarget: 0 };

export function loadOnboarding(): OnboardingProfile { try { const raw = localStorage.getItem(ONBOARDING_KEY); return raw ? { ...defaultOnboardingProfile, ...JSON.parse(raw) } : defaultOnboardingProfile; } catch { return defaultOnboardingProfile; } }
export function saveOnboarding(profile: OnboardingProfile) { localStorage.setItem(ONBOARDING_KEY, JSON.stringify(profile)); }
export function loadAuth(): { authenticated: boolean; email: string } { try { const raw = localStorage.getItem(AUTH_KEY); return raw ? { authenticated: false, email: '', ...JSON.parse(raw) } : { authenticated: false, email: '' }; } catch { return { authenticated: false, email: '' }; } }
export function saveAuth(email: string) { localStorage.setItem(AUTH_KEY, JSON.stringify({ authenticated: true, email })); }
export function clearAuth() { localStorage.removeItem(AUTH_KEY); }
