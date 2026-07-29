import { writable } from 'svelte/store';

export interface PurchaseProcess {
  id: string;
  status: 'ACTIVE' | 'COMPLETED' | 'ABANDONED';
  currentStage: string;
  propertyPrice: number | null;
  financialProfile: Record<string, unknown> | null;
}

function createProcessStore() {
  const { subscribe, set } = writable<PurchaseProcess | null>(null);

  return {
    subscribe,
    set,
    clear(): void {
      set(null);
    },
  };
}

export const process = createProcessStore();
