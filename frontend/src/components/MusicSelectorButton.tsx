import React, { useRef } from 'react';

interface MusicSelectorButtonProps {
  onAudioSelected: (file: File) => void;
}

const MAX_AUDIO_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_AUDIO_TYPES = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/x-m4a'];

export function MusicSelectorButton({ onAudioSelected }: MusicSelectorButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!ALLOWED_AUDIO_TYPES.includes(file.type)) {
      alert('Invalid file type. Please select an audio file (MP3, WAV, OGG, M4A).');
      return;
    }

    // Validate file size
    if (file.size > MAX_AUDIO_SIZE) {
      alert(`File size exceeds 10MB limit. Selected file: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
      return;
    }

    onAudioSelected(file);
    
    // Reset input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".mp3,.wav,.ogg,.m4a,audio/mpeg,audio/wav,audio/ogg,audio/mp4,audio/x-m4a"
        onChange={handleFileChange}
        style={{ display: 'none' }}
        data-testid="music-file-input"
      />
      <button
        onClick={handleButtonClick}
        className="music-selector-button"
        type="button"
        data-testid="music-selector-button"
        style={{
          backgroundColor: '#9b59b6',
          color: 'white',
          border: 'none',
          padding: '8px 16px',
          borderRadius: '4px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '14px',
          fontWeight: 500,
        }}
      >
        <span style={{ fontSize: '18px' }}>🎵</span>
        Select music
      </button>
    </>
  );
}

export default MusicSelectorButton;
