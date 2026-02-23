/**
 * GenerateImageButton Component Tests
 * Verifies button states during AI generation (FR-014)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GenerateImageButton } from '@/components/GenerateImageButton';
import { useComposerStore } from '@/state/composerStore';
import { renderWithProviders } from '@/test/utils';

describe('GenerateImageButton', () => {
  beforeEach(() => {
    useComposerStore.setState({
      localText: 'Serene landscape',
      selectedImageId: null,
      isGeneratingImage: false,
    });
  });

  describe('Button Text', () => {
    it('should show "Generate AI Image" when enabled', () => {
      renderWithProviders(<GenerateImageButton />);
      
      expect(screen.getByTestId('generate-image-button')).toHaveTextContent('Generate AI Image');
    });

    it('should show "Generating..." when loading', () => {
      renderWithProviders(<GenerateImageButton isLoading />);
      
      expect(screen.getByTestId('generate-image-button')).toHaveTextContent('Generating...');
    });
  });

  describe('Disabled State', () => {
    it('should be disabled when image is already selected', () => {
      useComposerStore.setState({ selectedImageId: 'existing-image' });
      renderWithProviders(<GenerateImageButton />);
      
      expect(screen.getByTestId('generate-image-button')).toBeDisabled();
    });

    it('should be enabled when no image is selected', () => {
      useComposerStore.setState({ selectedImageId: null });
      renderWithProviders(<GenerateImageButton />);
      
      expect(screen.getByTestId('generate-image-button')).not.toBeDisabled();
    });

    it('should be disabled during generation (FR-014)', () => {
      useComposerStore.setState({ isGeneratingImage: true });
      renderWithProviders(<GenerateImageButton />);
      
      expect(screen.getByTestId('generate-image-button')).toBeDisabled();
    });

    it('should be disabled when disabled prop is true', () => {
      renderWithProviders(<GenerateImageButton disabled />);
      
      expect(screen.getByTestId('generate-image-button')).toBeDisabled();
    });
  });

  describe('Loading State', () => {
    it('should have loading class when generating', () => {
      renderWithProviders(<GenerateImageButton isLoading />);
      
      expect(screen.getByTestId('generate-image-button')).toHaveClass('btn--loading');
    });

    it('should have aria-busy="true" when loading', () => {
      renderWithProviders(<GenerateImageButton isLoading />);
      
      expect(screen.getByTestId('generate-image-button')).toHaveAttribute('aria-busy', 'true');
    });
  });

  describe('Tooltip', () => {
    it('should show tooltip when image is selected', () => {
      useComposerStore.setState({ selectedImageId: 'existing-image' });
      renderWithProviders(<GenerateImageButton />);
      
      expect(screen.getByTestId('generate-image-button')).toHaveAttribute(
        'title',
        'Remove current image first to generate a new one'
      );
    });

    it('should not show tooltip when no image is selected', () => {
      useComposerStore.setState({ selectedImageId: null });
      renderWithProviders(<GenerateImageButton />);
      
      expect(screen.getByTestId('generate-image-button')).not.toHaveAttribute('title');
    });
  });

  describe('Validation', () => {
    it('should show error validation toast if text is empty (FR-014 guard)', async () => {
      const user = userEvent.setup();
      useComposerStore.setState({ localText: '' });
      renderWithProviders(<GenerateImageButton />);
      
      const button = screen.getByTestId('generate-image-button');
      await user.click(button);
      
      expect(screen.getByText('Text cannot be empty. Please enter at least one word.')).toBeInTheDocument();
    });
  });
});
