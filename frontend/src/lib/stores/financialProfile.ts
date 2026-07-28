/**
 * financialProfile store — local form state for the Mortgage Compass wizard.
 * Persisted to localStorage so the user doesn't lose input on refresh.
 */
import { writable } from 'svelte/store';
import type { Persona } from '$lib/api/types';

const STORAGE_KEY = 'realista.financialProfile';

export interface FinancialProfileForm {
  propertyPrice: number | null;
  savings: number;
  monthlyIncome: number;
  existingDebts: number;
  region: string;
  persona: Persona | null;
  interestRate: number;
  isFirstHome: boolean;
  buyerAge: number | null;
  isProtectedHousing: boolean;
}

const DEFAULT: FinancialProfileForm = {
  propertyPrice: null,
  savings: 45_000,
  monthlyIncome: 3_500,
  existingDebts: 0,
  region: 'Madrid',
  persona: null,
  interestRate: 0.035,
  isFirstHome: true,
  buyerAge: null,
  isProtectedHousing: false,
};

function load(): FinancialProfileForm {
  if (typeof localStorage === 'undefined') return DEFAULT;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT;
    return { ...DEFAULT, ...(JSON.parse(raw) as Partial<FinancialProfileForm>) };
  } catch {
    return DEFAULT;
  }
}

function persist(value: FinancialProfileForm): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // ignore quota / disabled storage
  }
}

function createStore() {
  const { subscribe, set, update } = writable<FinancialProfileForm>(load());

  return {
    subscribe,
    set(value: FinancialProfileForm): void {
      persist(value);
      set(value);
    },
    update(updater: (current: FinancialProfileForm) => FinancialProfileForm): void {
      update((current) => {
        const next = updater(current);
        persist(next);
        return next;
      });
    },
    reset(): void {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
      }
      set(DEFAULT);
    },
  };
}

export const financialProfile = createStore();
