/**
 * Player Store (Zustand)
 * 
 * Manages UI state for the meditation player.
 * 
 * **State Separation**:
 * - Server-state (meditation data, list) → React Query (useMeditationList, usePlaybackInfo)
 * - UI-state (player controls, current track, volume) → Zustand (THIS store)
 * 
 * Features:
 * - Current meditation tracking
 * - Playback state (playing/paused)
 * - Volume control
 * - Seek position
 * - Player visibility (minimized/maximized)
 */

import { create } from 'zustand';

/**
 * Player UI State Interface
 */
export interface PlayerState {
  // Current meditation
  currentMeditationId: string | null;
  currentMeditationTitle: string | null;

  // Playback controls
  isPlaying: boolean;
  volume: number; // 0-1
  isMuted: boolean;
  currentTime: number; // seconds
  duration: number; // seconds

  // UI state
  isMinimized: boolean;
  isFullscreen: boolean;

  // Actions
  setCurrentMeditation: (id: string | null, title: string | null) => void;
  play: () => void;
  pause: () => void;
  togglePlayPause: () => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  toggleMinimize: () => void;
  toggleFullscreen: () => void;
  reset: () => void;
}

/**
 * Initial/default state
 */
const initialState = {
  currentMeditationId: null,
  currentMeditationTitle: null,
  isPlaying: false,
  volume: 0.8,
  isMuted: false,
  currentTime: 0,
  duration: 0,
  isMinimized: false,
  isFullscreen: false
};

/**
 * usePlayerStore Hook
 * 
 * Zustand store for meditation player UI state.
 * 
 * @example
 * ```tsx
 * function PlayerControls() {
 *   const { isPlaying, volume, togglePlayPause, setVolume } = usePlayerStore();
 *   
 *   return (
 *     <div>
 *       <button onClick={togglePlayPause}>
 *         {isPlaying ? 'Pause' : 'Play'}
 *       </button>
 *       <input
 *         type="range"
 *         value={volume}
 *         onChange={(e) => setVolume(Number(e.target.value))}
 *         min={0}
 *         max={1}
 *         step={0.01}
 *       />
 *     </div>
 *   );
 * }
 * ```
 */
export const usePlayerStore = create<PlayerState>((set, get) => ({
  ...initialState,

  setCurrentMeditation: (id, title) => {
    set({
      currentMeditationId: id,
      currentMeditationTitle: title,
      // Reset playback state when changing meditation
      isPlaying: false,
      currentTime: 0,
      duration: 0
    });
  },

  play: () => set({ isPlaying: true }),
  
  pause: () => set({ isPlaying: false }),
  
  togglePlayPause: () => set((state) => ({ isPlaying: !state.isPlaying })),

  setVolume: (volume) => {
    // Clamp volume between 0 and 1
    const clampedVolume = Math.max(0, Math.min(1, volume));
    set({ 
      volume: clampedVolume,
      // Auto-unmute if setting volume > 0
      isMuted: clampedVolume === 0 ? get().isMuted : false
    });
  },

  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),

  setCurrentTime: (time) => {
    // Clamp time between 0 and duration
    const clampedTime = Math.max(0, Math.min(get().duration || Infinity, time));
    set({ currentTime: clampedTime });
  },

  setDuration: (duration) => set({ duration }),

  toggleMinimize: () => set((state) => ({ isMinimized: !state.isMinimized })),

  toggleFullscreen: () => set((state) => ({ isFullscreen: !state.isFullscreen })),

  reset: () => set(initialState)
}));

export default usePlayerStore;
