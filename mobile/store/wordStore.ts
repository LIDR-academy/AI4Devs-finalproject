import { create } from 'zustand';
import { wordsApi } from '../services/api';
import type { WordCard, UnsplashImage, DefinitionLanguage, WordCardStatus } from '../types';

interface WordState {
  words: WordCard[];
  loading: boolean;
  error: string | null;
  suggestedImages: UnsplashImage[];
  fetchWords: () => Promise<void>;
  createWord: (
    term: string,
    lang: DefinitionLanguage
  ) => Promise<{ wordCard: WordCard; suggestedImages: UnsplashImage[] }>;
  updateWord: (
    id: string,
    payload: {
      definition?: string;
      imageUrl?: string;
      unsplashPhotoId?: string;
      status?: WordCardStatus;
    }
  ) => Promise<void>;
  deleteWord: (id: string) => Promise<void>;
}

export const useWordStore = create<WordState>((set, get) => ({
  words: [],
  loading: false,
  error: null,
  suggestedImages: [],

  fetchWords: async () => {
    set({ loading: true, error: null });
    try {
      const words = await wordsApi.list();
      set({ words });
    } catch (err: unknown) {
      set({ error: err instanceof Error ? err.message : 'Failed to load words' });
    } finally {
      set({ loading: false });
    }
  },

  createWord: async (term, lang) => {
    set({ loading: true, error: null });
    try {
      const result = await wordsApi.create(term, lang);
      set((s) => ({ words: [result.wordCard, ...s.words] }));
      return result;
    } catch (err: unknown) {
      set({ error: err instanceof Error ? err.message : 'Failed to create word' });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  updateWord: async (id, payload) => {
    try {
      const updated = await wordsApi.update(id, payload);
      set((s) => ({
        words: s.words.map((w) => (w.id === id ? updated : w)),
      }));
    } catch (err: unknown) {
      set({ error: err instanceof Error ? err.message : 'Failed to update word' });
      throw err;
    }
  },

  deleteWord: async (id) => {
    try {
      await wordsApi.delete(id);
      set((s) => ({ words: s.words.filter((w) => w.id !== id) }));
    } catch (err: unknown) {
      set({ error: err instanceof Error ? err.message : 'Failed to delete word' });
      throw err;
    }
  },
}));
