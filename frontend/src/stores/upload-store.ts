import { create } from "zustand";

import type { UploadEntry, UploadHistoryEntry } from "@/types/upload";

type UploadStore = {
  entries: UploadEntry[];
  history: UploadHistoryEntry[];
  addEntries: (entries: UploadEntry[]) => void;
  updateEntry: (id: string, patch: Partial<UploadEntry>) => void;
  removeEntry: (id: string) => void;
  addHistory: (entry: UploadHistoryEntry) => void;
  clearHistory: () => void;
  resetAll: () => void;
};

export const useUploadStore = create<UploadStore>((set) => ({
  entries: [],
  history: [],
  addEntries: (entries) =>
    set((state) => ({
      entries: [...state.entries, ...entries],
    })),
  updateEntry: (id, patch) =>
    set((state) => ({
      entries: state.entries.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry)),
    })),
  removeEntry: (id) =>
    set((state) => ({
      entries: state.entries.filter((entry) => entry.id !== id),
    })),
  addHistory: (entry) =>
    set((state) => ({
      history: state.history.some((item) => item.id === entry.id) ? state.history : [entry, ...state.history],
    })),
  clearHistory: () => set({ history: [] }),
  resetAll: () => set({ entries: [], history: [] }),
}));