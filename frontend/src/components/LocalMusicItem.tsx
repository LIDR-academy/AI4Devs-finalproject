import { useCallback, useRef, useEffect, useState } from 'react';
import { useComposerStore, useIsMusicPlaying } from '@/state/composerStore';

interface LocalMusicItemProps {
  previewUrl: string;
  musicName: string;
  onRemove: () => void;
}

export function LocalMusicItem({ previewUrl, musicName, onRemove }: LocalMusicItemProps) {
  const isMusicPlaying = useIsMusicPlaying();
  const setIsMusicPlaying = useComposerStore((state) => state.setIsMusicPlaying);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [duration, setDuration] = useState<string>('--:--');
  
  // Get audio duration when loaded
  useEffect(() => {
    if (!audioRef.current) return;
    
    const handleLoadedMetadata = () => {
      if (audioRef.current) {
        const totalSeconds = Math.floor(audioRef.current.duration);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        setDuration(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      }
    };
    
    audioRef.current.addEventListener('loadedmetadata', handleLoadedMetadata);
    
    return () => {
      audioRef.current?.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [previewUrl]);
  
  const handlePlayPause = useCallback(() => {
    if (!audioRef.current) return;
    
    if (isMusicPlaying) {
      audioRef.current.pause();
      setIsMusicPlaying(false);
    } else {
      audioRef.current.play();
      setIsMusicPlaying(true);
    }
  }, [isMusicPlaying, setIsMusicPlaying]);
  
  const handleEnded = useCallback(() => {
    setIsMusicPlaying(false);
  }, [setIsMusicPlaying]);
  
  return (
    <div 
      className="music-selector__item music-selector__item--selected" 
      style={{ position: 'relative', padding: '12px', marginBottom: '8px' }}
      data-testid="local-music-item"
    >
      <audio 
        ref={audioRef} 
        src={previewUrl} 
        onEnded={handleEnded}
        preload="metadata"
        data-testid="local-music-audio"
      />
      
      <button
        onClick={onRemove}
        style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          background: 'rgba(0, 0, 0, 0.5)',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '24px',
          height: '24px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '14px',
          padding: 0,
        }}
        aria-label="Remove music"
        data-testid="local-music-remove"
      >
        ✕
      </button>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={handlePlayPause}
          className="btn btn--secondary"
          style={{
            minWidth: '40px',
            padding: '6px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
          }}
          aria-label={isMusicPlaying ? 'Pause music' : 'Play music'}
          data-testid="local-music-play-button"
        >
          {isMusicPlaying ? '⏸️' : '▶️'}
        </button>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', marginLeft: 8 }}>
          <span className="music-selector__item-icon" aria-hidden="true">🎵</span>
          <span className="music-selector__item-name" style={{ marginLeft: '8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {musicName}
          </span>
        </div>
        <span className="music-selector__item-duration" style={{ marginLeft: 'auto', fontVariantNumeric: 'tabular-nums', fontWeight: 500 }}>
          {duration}
        </span>
      </div>
    </div>
  );
}

export default LocalMusicItem;
