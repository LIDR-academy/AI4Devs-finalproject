/**
 * MeditationLibraryPage
 * 
 * Main page for listing and playing user's meditations.
 * 
 * Integrates:
 * - useMeditationList (React Query) - Fetches meditation list
 * - usePlaybackInfo (React Query) - Fetches playback URLs
 * - usePlayerStore (Zustand) - UI state for player controls
 * - MeditationList (Component) - Displays meditation grid
 * - MeditationPlayer (Component) - Media playback
 * 
 * Features:
 * - Auto-fetches meditation list on mount
 * - Lazy-loads playback info when user clicks "Play"
 * - Displays player only when meditation selected
 * - Handles loading/error states gracefully
 * - User-friendly error messages in English
 */

import React, { useEffect, useState } from 'react';
import { useMeditationList, usePlaybackInfo } from '../hooks/playback';
import { usePlayerStore } from '../state/playback';
import { MeditationList, MeditationPlayer } from '../components/playback';
import type { MeditationItem } from '../api/generated/playback/src';

/**
 * MeditationLibraryPage Component
 * 
 * Layout:
 * - Header: "Meditation Library"
 * - MeditationList: Grid of meditation cards
 * - MeditationPlayer: Sticky footer player (only when meditation selected)
 */
export const MeditationLibraryPage: React.FC = () => {
  // Server-state: Meditation list
  const { 
    data: meditations = [], 
    isLoading: isLoadingList, 
    error: listError 
  } = useMeditationList();

  // UI-state: Current meditation selection
  const { 
    currentMeditationId, 
    currentMeditationTitle,
    setCurrentMeditation,
    reset: resetPlayer
  } = usePlayerStore();

  // UI-state: media playback error (separate from API error)
  const [mediaError, setMediaError] = useState<string | null>(null);

  // Reset player when entering library page to avoid auto-play on navigation
  useEffect(() => {
    resetPlayer();
  }, [resetPlayer]);

  // Server-state: Playback info (lazy-loaded)
  const { 
    data: playbackInfo, 
    isLoading: isLoadingPlayback, 
    error: playbackError 
  } = usePlaybackInfo(currentMeditationId);

  /**
   * Handle "Play" button click on meditation card.
   * Sets current meditation in player store, which triggers playback info fetch.
   */
  const handlePlay = (meditationId: string) => {
    // Find meditation details from list
    const meditation = meditations.find((m: MeditationItem) => m.id === meditationId);
    
    if (!meditation) {
      console.error('Meditation not found in list:', meditationId);
      return;
    }

    // Check if meditation is playable (COMPLETED state)
    if (meditation.state !== 'COMPLETED') {
      // User shouldn't reach here (button should be disabled),
      // but handle defensively
      alert('This meditation is not available for playback yet.');
      return;
    }

    // Set current meditation (triggers playback info fetch via usePlaybackInfo)
    setCurrentMeditation(meditation.id, meditation.title);
  };

  /**
   * Handle playback errors.
   * Shows inline error message without resetting the player.
   */
  const handlePlaybackError = (error?: Error) => {
    const errorMessage = error?.message || 
      'Error playing the media content. Please try again.';
    setMediaError(errorMessage);
  };

  // Clear mediaError when the selected meditation changes
  useEffect(() => {
    setMediaError(null);
  }, [currentMeditationId]);

  return (
    <div className="meditation-library-page">
      {/* Header */}
      <header className="library-header">
        <h1>Meditation Library</h1>
        <p className="library-description">
          Here you'll find all your generated meditations.
          Click "Play" to listen to or watch a meditation.
        </p>
      </header>

      {/* Meditation List */}
      <main className="library-content">
        <MeditationList
          meditations={meditations}
          onPlay={handlePlay}
          isLoading={isLoadingList}
          error={listError?.message}
        />
      </main>

      {/* Player (sticky footer - only shown when meditation selected) */}
      {currentMeditationId && (
        <aside className="library-player-container">
          {/* Loading state while fetching playback info */}
          {isLoadingPlayback && (
            <div className="player-loading">
              <p>Loading playback information...</p>
            </div>
          )}

          {/* API error (e.g. 409 not ready yet) */}
          {playbackError && (
            <div className="player-error" role="alert">
              <p>⚠️ {playbackError.message}</p>
              <button onClick={resetPlayer}>Close</button>
            </div>
          )}

          {/* Media playback error (audio/video failed to load) */}
          {mediaError && !playbackError && (
            <div className="player-error" role="alert">
              <p>⚠️ {mediaError}</p>
              <button onClick={() => setMediaError(null)}>Close</button>
            </div>
          )}

          {/* Player (only show when playback info loaded) */}
          {!isLoadingPlayback && !playbackError && playbackInfo && (
            <MeditationPlayer
              meditationId={currentMeditationId}
              title={currentMeditationTitle || undefined}
              mediaUrls={playbackInfo.mediaUrls}
              onPlaybackError={handlePlaybackError}
            />
          )}
        </aside>
      )}
    </div>
  );
};

export default MeditationLibraryPage;
