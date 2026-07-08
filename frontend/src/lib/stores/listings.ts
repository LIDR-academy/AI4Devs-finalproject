import { writable } from 'svelte/store';
import type { RedFlagItem } from '$lib/api/types';

export interface AnalyzedListing {
  id: string;
  url: string;
  transparencyScore: number;
  scoreLabel: 'baja' | 'media' | 'alta' | 'excelente';
  redFlags: RedFlagItem[];
  summary: string | null;
  declaredAddress: string | null;
  createdAt: string;
}

function createListingsStore() {
  const { subscribe, update, set } = writable<AnalyzedListing[]>([]);

  return {
    subscribe,
    add(listing: AnalyzedListing): void {
      update((list) => [listing, ...list]);
    },
    clear(): void {
      set([]);
    },
  };
}

export const listings = createListingsStore();
