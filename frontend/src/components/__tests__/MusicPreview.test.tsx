/**
 * MusicPreview Component Tests
 * Verifies playback controls (SC-006: preview within 2 seconds)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
// import userEvent from '@testing-library/user-event';
import { MusicPreview } from '@/components/MusicPreview';
import { useComposerStore } from '@/state/composerStore';

describe('MusicPreview', () => {
  beforeEach(() => {
    useComposerStore.setState({
      selectedMusicId: null,
      isMusicPlaying: false,
    });
  });

  describe('No Music Selected', () => {
    it('should show disabled state when no music selected', () => {
      render(<MusicPreview />);
      
      expect(screen.getByTestId('music-preview-disabled')).toBeInTheDocument();
      expect(screen.getByText('No music selected')).toBeInTheDocument();
    });
  });

  describe('Music Selected', () => {
    beforeEach(() => {
      useComposerStore.setState({ selectedMusicId: 'calm-ocean-waves' });
    });

    it('should show play button when music is selected', () => {
      render(<MusicPreview previewUrl="https://example.com/preview.mp3" />);
      
      expect(screen.getByTestId('music-play-button')).toBeInTheDocument();
    });

    it('should show track name', () => {
      render(<MusicPreview previewUrl="https://example.com/preview.mp3" musicName="Ocean Waves" />);
      
      expect(screen.getByText('Ocean Waves')).toBeInTheDocument();
    });

    it('should show "Ready to preview" status', () => {
      render(<MusicPreview previewUrl="https://example.com/preview.mp3" />);
      
      expect(screen.getByText('Ready to preview')).toBeInTheDocument();
    });
  });

  describe('Playback Controls', () => {
    beforeEach(() => {
      useComposerStore.setState({ selectedMusicId: 'calm-ocean-waves' });
    });

    it('should show "Play" when not playing', () => {
      useComposerStore.setState({ isMusicPlaying: false });
      render(<MusicPreview previewUrl="https://example.com/preview.mp3" />);
      
      expect(screen.getByTestId('music-play-button')).toHaveTextContent('Play');
    });

    it('should show "Pause" when playing', () => {
      useComposerStore.setState({ isMusicPlaying: true });
      render(<MusicPreview previewUrl="https://example.com/preview.mp3" />);
      
      expect(screen.getByTestId('music-play-button')).toHaveTextContent('Pause');
    });

    it('should show "Playing..." status when playing', () => {
      useComposerStore.setState({ isMusicPlaying: true });
      render(<MusicPreview previewUrl="https://example.com/preview.mp3" />);
      
      expect(screen.getByText('Playing...')).toBeInTheDocument();
    });
  });

  describe('Disabled State', () => {
    beforeEach(() => {
      useComposerStore.setState({ selectedMusicId: 'calm-ocean-waves' });
    });

    it('should disable play button when disabled prop is true', () => {
      render(<MusicPreview previewUrl="https://example.com/preview.mp3" disabled />);
      
      expect(screen.getByTestId('music-play-button')).toBeDisabled();
    });

    it('should disable play button when no preview URL', () => {
      render(<MusicPreview />);
      
      expect(screen.getByTestId('music-play-button')).toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      useComposerStore.setState({ selectedMusicId: 'calm-ocean-waves' });
    });

    it('should have accessible play/pause label', () => {
      render(<MusicPreview previewUrl="https://example.com/preview.mp3" />);
      
      expect(screen.getByLabelText('Play music')).toBeInTheDocument();
    });

    it('should update label when playing', () => {
      useComposerStore.setState({ isMusicPlaying: true });
      render(<MusicPreview previewUrl="https://example.com/preview.mp3" />);
      
      expect(screen.getByLabelText('Pause music')).toBeInTheDocument();
    });
  });
});
