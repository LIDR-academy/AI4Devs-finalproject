/**
 * MusicSelector Component Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MusicSelector } from '@/components/MusicSelector';
import { useComposerStore } from '@/state/composerStore';

describe('MusicSelector', () => {
  beforeEach(() => {
    useComposerStore.setState({
      selectedMusicId: null,
    });
  });

  describe('Display', () => {
    it('should display available music tracks', () => {
      render(<MusicSelector />);
      
      expect(screen.getByText('Calm Ocean Waves')).toBeInTheDocument();
      expect(screen.getByText('Forest Ambience')).toBeInTheDocument();
      expect(screen.getByText('Gentle Rain')).toBeInTheDocument();
    });

    it('should show duration for each track', () => {
      render(<MusicSelector />);
      
      expect(screen.getByText('3:45')).toBeInTheDocument();
      expect(screen.getByText('4:20')).toBeInTheDocument();
    });
  });

  describe('Selection', () => {
    it('should mark selected track', () => {
      useComposerStore.setState({ selectedMusicId: 'calm-ocean-waves' });
      render(<MusicSelector />);
      
      const selectedItem = screen.getByTestId('music-option-calm-ocean-waves');
      expect(selectedItem).toHaveClass('music-selector__item--selected');
      expect(selectedItem).toHaveAttribute('aria-selected', 'true');
    });

    it('should update selection on click', async () => {
      const user = userEvent.setup();
      render(<MusicSelector />);
      
      await user.click(screen.getByTestId('music-option-forest-ambience'));
      
      expect(useComposerStore.getState().selectedMusicId).toBe('forest-ambience');
    });

    it('should call onSelect callback', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();
      render(<MusicSelector onSelect={onSelect} />);
      
      await user.click(screen.getByTestId('music-option-gentle-rain'));
      
      expect(onSelect).toHaveBeenCalledWith('gentle-rain');
    });
  });

  describe('Disabled State', () => {
    it('should disable all options when disabled', () => {
      render(<MusicSelector disabled />);
      
      expect(screen.getByTestId('music-option-calm-ocean-waves')).toBeDisabled();
      expect(screen.getByTestId('music-option-forest-ambience')).toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('should have listbox role', () => {
      render(<MusicSelector />);
      
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('should have accessible label', () => {
      render(<MusicSelector />);
      
      expect(screen.getByLabelText('Available music tracks')).toBeInTheDocument();
    });
  });
});
