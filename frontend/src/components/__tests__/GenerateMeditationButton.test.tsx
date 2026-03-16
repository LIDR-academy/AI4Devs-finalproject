/**
 * GenerateMeditationButton Component Tests
 * T027: Frontend tests for meditation generation button
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GenerateMeditationButton } from '../GenerateMeditationButton';

describe('GenerateMeditationButton', () => {
  describe('Rendering', () => {
    it('renders video button by default', () => {
      render(<GenerateMeditationButton />);
      
      expect(screen.getByText('🎬 Generate Video')).toBeInTheDocument();
      expect(screen.getByTestId('generate-meditation-button')).toBeInTheDocument();
    });

    it('renders podcast button when outputType is PODCAST', () => {
      render(<GenerateMeditationButton outputType="PODCAST" />);
      
      expect(screen.getByText('🎙️ Generate Podcast')).toBeInTheDocument();
    });

    it('renders video button when outputType is VIDEO', () => {
      render(<GenerateMeditationButton outputType="VIDEO" />);
      
      expect(screen.getByText('🎬 Generate Video')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('shows loading state for video', () => {
      render(<GenerateMeditationButton isLoading={true} outputType="VIDEO" />);
      
      expect(screen.getByText('Creating video...')).toBeInTheDocument();
      expect(screen.getByTestId('generate-meditation-button')).toBeDisabled();
    });

    it('shows loading state for podcast', () => {
      render(<GenerateMeditationButton isLoading={true} outputType="PODCAST" />);
      
      expect(screen.getByText('Creating podcast...')).toBeInTheDocument();
      expect(screen.getByTestId('generate-meditation-button')).toBeDisabled();
    });

    it('displays spinner when loading', () => {
      render(<GenerateMeditationButton isLoading={true} />);
      
      const spinner = screen.getByTestId('generate-meditation-button').querySelector('.btn__spinner');
      expect(spinner).toBeInTheDocument();
    });

    it('applies loading CSS class when loading', () => {
      render(<GenerateMeditationButton isLoading={true} />);
      
      expect(screen.getByTestId('generate-meditation-button')).toHaveClass('btn--loading');
    });
  });

  describe('Disabled State', () => {
    it('is disabled when disabled prop is true', () => {
      render(<GenerateMeditationButton disabled={true} />);
      
      expect(screen.getByTestId('generate-meditation-button')).toBeDisabled();
    });

    it('is disabled when loading', () => {
      render(<GenerateMeditationButton isLoading={true} />);
      
      expect(screen.getByTestId('generate-meditation-button')).toBeDisabled();
    });

    it('is enabled when neither disabled nor loading', () => {
      render(<GenerateMeditationButton disabled={false} isLoading={false} />);
      
      expect(screen.getByTestId('generate-meditation-button')).not.toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA label when not loading', () => {
      render(<GenerateMeditationButton outputType="VIDEO" />);
      
      const button = screen.getByTestId('generate-meditation-button');
      expect(button).toHaveAttribute('aria-label', '🎬 Generate Video');
    });

    it('has proper ARIA label when loading', () => {
      render(<GenerateMeditationButton isLoading={true} outputType="VIDEO" />);
      
      const button = screen.getByTestId('generate-meditation-button');
      expect(button).toHaveAttribute('aria-label', 'Creating video...');
    });

    it('has aria-busy attribute when loading', () => {
      render(<GenerateMeditationButton isLoading={true} />);
      
      const button = screen.getByTestId('generate-meditation-button');
      expect(button).toHaveAttribute('aria-busy', 'true');
    });

    it('has aria-busy false when not loading', () => {
      render(<GenerateMeditationButton isLoading={false} />);
      
      const button = screen.getByTestId('generate-meditation-button');
      expect(button).toHaveAttribute('aria-busy', 'false');
    });
  });

  describe('User Interaction', () => {
    it('calls onClick when clicked', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      
      render(<GenerateMeditationButton onClick={handleClick} />);
      
      await user.click(screen.getByTestId('generate-meditation-button'));
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when disabled', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      
      render(<GenerateMeditationButton onClick={handleClick} disabled={true} />);
      
      await user.click(screen.getByTestId('generate-meditation-button'));
      
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('does not call onClick when loading', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      
      render(<GenerateMeditationButton onClick={handleClick} isLoading={true} />);
      
      await user.click(screen.getByTestId('generate-meditation-button'));
      
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('CSS Classes', () => {
    it('applies correct base classes', () => {
      render(<GenerateMeditationButton />);
      
      const button = screen.getByTestId('generate-meditation-button');
      expect(button).toHaveClass('btn');
      expect(button).toHaveClass('btn--primary');
      expect(button).toHaveClass('btn--large');
      expect(button).toHaveClass('generate-meditation-button');
    });
  });
});
