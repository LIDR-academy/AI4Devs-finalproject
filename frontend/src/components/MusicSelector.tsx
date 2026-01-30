/**
 * MusicSelector Component
 * 
 * Displays music selection interface.
 * Integrates with composerStore for UI state.
 */

import { useCallback } from 'react';
import { useComposerStore, useSelectedMusicId, type MusicTrack } from '@/state/composerStore';

// Mock data - in real app would come from media catalog API
const AVAILABLE_MUSIC: MusicTrack[] = [
  { id: 'calm-ocean-waves', name: 'Calm Ocean Waves', duration: '3:45' },
  { id: 'forest-ambience', name: 'Forest Ambience', duration: '4:20' },
  { id: 'gentle-rain', name: 'Gentle Rain', duration: '5:00' },
  { id: 'tibetan-bowls', name: 'Tibetan Singing Bowls', duration: '6:15' },
  { id: 'wind-chimes', name: 'Wind Chimes', duration: '3:30' },
];

interface MusicSelectorProps {
  disabled?: boolean;
  onSelect?: (musicId: string) => void;
}

export function MusicSelector({ disabled = false, onSelect }: MusicSelectorProps) {
  const selectedMusicId = useSelectedMusicId();
  const setSelectedMusic = useComposerStore((state) => state.setSelectedMusic);
  
  const handleSelect = useCallback((musicId: string) => {
    setSelectedMusic(musicId);
    onSelect?.(musicId);
  }, [setSelectedMusic, onSelect]);
  
  return (
    <div className="music-selector" data-testid="music-selector">
      <div className="music-selector__list" role="listbox" aria-label="Available music tracks">
        {AVAILABLE_MUSIC.map((track) => {
          const isSelected = selectedMusicId === track.id;
          return (
            <button
              key={track.id}
              className={`music-selector__item ${isSelected ? 'music-selector__item--selected' : ''}`}
              onClick={() => handleSelect(track.id)}
              disabled={disabled}
              role="option"
              aria-selected={isSelected}
              data-testid={`music-option-${track.id}`}
            >
              <span className="music-selector__item-icon" aria-hidden="true">
                {isSelected ? '🎵' : '♪'}
              </span>
              <span className="music-selector__item-name">{track.name}</span>
              <span className="music-selector__item-duration">{track.duration}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default MusicSelector;
