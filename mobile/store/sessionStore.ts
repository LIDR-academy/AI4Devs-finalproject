import { create } from 'zustand';
import { sessionsApi, streakApi } from '../services/api';
import type { DailySession, Streak, ExerciseAnswer } from '../types';

interface SessionState {
  session: DailySession | null;
  streak: Streak | null;
  loading: boolean;
  error: string | null;
  fetchStreak: () => Promise<void>;
  startSession: () => Promise<DailySession>;
  completeSession: (answers: ExerciseAnswer[]) => Promise<{ session: DailySession; streak: Streak }>;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  session: null,
  streak: null,
  loading: false,
  error: null,

  fetchStreak: async () => {
    try {
      const streak = await streakApi.get();
      set({ streak });
    } catch {
      // streak fetch is non-critical
    }
  },

  startSession: async () => {
    set({ loading: true, error: null });
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const session = await sessionsApi.createDaily(timezone);
      set({ session });
      return session;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to start session';
      set({ error: msg });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  completeSession: async (answers) => {
    const { session } = get();
    if (!session) throw new Error('No active session');
    set({ loading: true, error: null });
    try {
      const result = await sessionsApi.complete(session.id, answers);
      set({ session: result.session, streak: result.streak });
      return result;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to complete session';
      set({ error: msg });
      throw err;
    } finally {
      set({ loading: false });
    }
  },
}));
