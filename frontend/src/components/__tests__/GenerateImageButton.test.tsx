/**
 * GenerateImageButton Component Tests
 * Verifies button states during AI generation (FR-014)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GenerateImageButton } from '@/components/GenerateImageButton';
import { useComposerStore } from '@/state/composerStore';

describe('GenerateImageButton', () => {
  beforeEach(() => {
    useComposerStore.setState({
      selectedImageId: null,
      isGeneratingImage: false,
    });
  });

  describe('Button Text', () => {
    it('should show "Generate AI Image" when enabled', () => {
      render(<GenerateImageButton />);
      
      expect(screen.getByTestId('generate-image-button')).toHaveTextContent('Generate AI Image');
    });

    it('should show "Generating..." when loading', () => {
      render(<GenerateImageButton isLoading />);
      
      expect(screen.getByTestId('generate-image-button')).toHaveTextContent('Generating...');
    });
  });

  describe('Disabled State', () => {
    it('should be disabled when image is already selected', () => {
      useComposerStore.setState({ selectedImageId: 'existing-image' });
      render(<GenerateImageButton />);
      
      expect(screen.getByTestId('generate-image-button')).toBeDisabled();
    });

    it('should be enabled when no image is selected', () => {
      useComposerStore.setState({ selectedImageId: null });
      render(<GenerateImageButton />);
      
      expect(screen.getByTestId('generate-image-button')).not.toBeDisabled();
    });

    it('should be disabled during generation (FR-014)', () => {
      useComposerStore.setState({ isGeneratingImage: true });
      render(<GenerateImageButton />);
      
      expect(screen.getByTestId('generate-image-button')).toBeDisabled();
    });

    it('should be disabled when disabled prop is true', () => {
      render(<GenerateImageButton disabled />);
      
      expect(screen.getByTestId('generate-image-button')).toBeDisabled();
    });
  });

  describe('Loading State', () => {
    it('should have loading class when generating', () => {
      render(<GenerateImageButton isLoading />);
      
      expect(screen.getByTestId('generate-image-button')).toHaveClass('btn--loading');
    });

    it('should have aria-busy="true" when loading', () => {
      render(<GenerateImageButton isLoading />);
      
      expect(screen.getByTestId('generate-image-button')).toHaveAttribute('aria-busy', 'true');
    });
  });

  describe('Tooltip', () => {
    it('should show tooltip when image is selected', () => {
      useComposerStore.setState({ selectedImageId: 'existing-image' });
      render(<GenerateImageButton />);
      
      expect(screen.getByTestId('generate-image-button')).toHaveAttribute(
        'title',
        'Remove current image first to generate a new one'
      );
    });

    it('should not show tooltip when no image is selected', () => {
      useComposerStore.setState({ selectedImageId: null });
      render(<GenerateImageButton />);
      
      expect(screen.getByTestId('generate-image-button')).not.toHaveAttribute('title');
    });
  });

  describe('Click Handler', () => {
    it('should call onGenerate when clicked and enabled', async () => {
      const user = userEvent.setup();
      const onGenerate = vi.fn();
      render(<GenerateImageButton />);
      
      await user.click(screen.getByTestId('generate-image-button'));
      
      expect(onGenerate).toHaveBeenCalledTimes(1);
    });

    it('should not call onGenerate when image is selected', async () => {
      const user = userEvent.setup();
      const onGenerate = vi.fn();
      useComposerStore.setState({ selectedImageId: 'existing-image' });
      render(<GenerateImageButton />);
      
      await user.click(screen.getByTestId('generate-image-button'));
      
      expect(onGenerate).not.toHaveBeenCalled();
    });
  });
});
