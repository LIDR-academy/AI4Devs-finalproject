/**
 * MusicPreview Component
 * Capability 7: Preview Selected Music
 * 
 * Audio player with play/pause controls.
 * Preview starts within 2 seconds (SC-006).
 * Disabled/hidden when no music selected.
 */

import { useCallback, useRef, useEffect } from 'react';
import { useComposerStore, useSelectedMusicId, useIsMusicPlaying } from '@/state/composerStore';

interface MusicPreviewProps {
  previewUrl?: string;
  musicName?: string;
  disabled?: boolean;
}

export function MusicPreview({ 
  previewUrl, 
  musicName = 'Selected Track',
  disabled = false,
}: MusicPreviewProps) {
  const selectedMusicId = useSelectedMusicId();
  const isMusicPlaying = useIsMusicPlaying();
  const setIsMusicPlaying = useComposerStore((state) => state.setIsMusicPlaying);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const hasMusic = !!selectedMusicId;
  const canPlay = hasMusic && !!previewUrl && !disabled;
  
  // Stop playing when music is deselected
  useEffect(() => {
    if (!hasMusic && isMusicPlaying) {
      setIsMusicPlaying(false);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }
  }, [hasMusic, isMusicPlaying, setIsMusicPlaying]);
  
  const handlePlayPause = useCallback(() => {
    if (!audioRef.current || !canPlay) return;
    
    if (isMusicPlaying) {
      audioRef.current.pause();
      setIsMusicPlaying(false);
    } else {
      audioRef.current.play();
      setIsMusicPlaying(true);
    }
  }, [canPlay, isMusicPlaying, setIsMusicPlaying]);
  
  const handleEnded = useCallback(() => {
    setIsMusicPlaying(false);
  }, [setIsMusicPlaying]);
  
  if (!hasMusic) {
    return (
      <div 
        className="music-preview music-preview--disabled" 
        data-testid="music-preview-disabled"
      >
        <span className="music-preview__placeholder">No music selected</span>
      </div>
    );
  }
  
  return (
    <div className="music-preview" data-testid="music-preview">
      {previewUrl && (
        <audio 
          ref={audioRef} 
          src={previewUrl} 
          onEnded={handleEnded}
          preload="auto"
          data-testid="music-audio-element"
        />
      )}
      <button
        className={`btn btn--secondary music-preview__button`}
        onClick={handlePlayPause}
        disabled={!canPlay}
        aria-label={isMusicPlaying ? 'Pause music' : 'Play music'}
        data-testid="music-play-button"
      >
        {isMusicPlaying ? '⏸️ Pause' : '▶️ Play'}
      </button>
      <div className="music-preview__info">
        <span className="music-preview__name">{musicName}</span>
        <span className="music-preview__status">
          {isMusicPlaying ? 'Playing...' : 'Ready to preview'}
        </span>
      </div>
    </div>
  );
}

export default MusicPreview;
