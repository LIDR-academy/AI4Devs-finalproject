/**
 * GenerateTextButton Component Tests
 * Verifies button states during AI generation (FR-014)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GenerateTextButton } from '@/components/GenerateTextButton';
import { useComposerStore } from '@/state/composerStore';
import { renderWithProviders } from '@/test/utils';

describe('GenerateTextButton', () => {
  beforeEach(() => {
    useComposerStore.setState({
      localText: 'Serene landscape',
      isGeneratingText: false,
    });
  });

  describe('Button Text', () => {
    it('should show "Generate with AI" when text is empty', () => {
      useComposerStore.setState({ localText: '' });
      renderWithProviders(<GenerateTextButton />);
      
      expect(screen.getByTestId('generate-text-button')).toHaveTextContent('Generate with AI');
    });

    it('should show "Enhance with AI" when text exists', () => {
      useComposerStore.setState({ localText: 'Some existing text' });
      renderWithProviders(<GenerateTextButton />);
      
      expect(screen.getByTestId('generate-text-button')).toHaveTextContent('Enhance with AI');
    });

    it('should show "Generating..." when loading and text is empty', () => {
      useComposerStore.setState({ localText: '', isGeneratingText: true });
      renderWithProviders(<GenerateTextButton />);
      
      expect(screen.getByTestId('generate-text-button')).toHaveTextContent('Generating...');
    });

    it('should show "Enhancing..." when loading and text exists', () => {
      useComposerStore.setState({ localText: 'Existing', isGeneratingText: true });
      renderWithProviders(<GenerateTextButton />);
      
      expect(screen.getByTestId('generate-text-button')).toHaveTextContent('Enhancing...');
    });
  });

  describe('Disabled State (FR-014)', () => {
    it('should be disabled during generation', () => {
      useComposerStore.setState({ isGeneratingText: true });
      renderWithProviders(<GenerateTextButton />);
      
      expect(screen.getByTestId('generate-text-button')).toBeDisabled();
    });

    it('should be enabled when not generating', () => {
      useComposerStore.setState({ isGeneratingText: false, localText: 'Some text' });
      renderWithProviders(<GenerateTextButton />);
      
      expect(screen.getByTestId('generate-text-button')).not.toBeDisabled();
    });

    it('should be disabled when disabled prop is true', () => {
      renderWithProviders(<GenerateTextButton disabled />);
      
      expect(screen.getByTestId('generate-text-button')).toBeDisabled();
    });
  });

  describe('Loading State', () => {
    it('should have loading class when generating', () => {
      renderWithProviders(<GenerateTextButton isLoading />);
      
      expect(screen.getByTestId('generate-text-button')).toHaveClass('btn--loading');
    });

    it('should have aria-busy="true" when loading', () => {
      renderWithProviders(<GenerateTextButton isLoading />);
      
      expect(screen.getByTestId('generate-text-button')).toHaveAttribute('aria-busy', 'true');
    });
  });

  describe('Click Handler', () => {
    it('should call onGenerate when clicked', async () => {
      const user = userEvent.setup();
      const onGenerate = vi.fn();
      useComposerStore.setState({ localText: 'Some text' });
      renderWithProviders(<GenerateTextButton onGenerate={onGenerate} />);
      
      await user.click(screen.getByTestId('generate-text-button'));
      
      expect(onGenerate).toHaveBeenCalledTimes(1);
    });

    it('should not call onGenerate when disabled', async () => {
      const user = userEvent.setup();
      const onGenerate = vi.fn();
      renderWithProviders(<GenerateTextButton onGenerate={onGenerate} disabled />);
      
      await user.click(screen.getByTestId('generate-text-button'));
      
      expect(onGenerate).not.toHaveBeenCalled();
    });
  });
});
