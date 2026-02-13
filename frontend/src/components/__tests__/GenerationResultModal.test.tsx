/**
 * GenerationResultModal Component Tests
 * T027: Frontend tests for generation result modal
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GenerationResultModal } from '../GenerationResultModal';
import type { GenerationResponse } from '@/api/generation-client';
import { GenerationStatus, MediaType } from '@/api/generation-client';

describe('GenerationResultModal', () => {
  const mockSuccessResult: GenerationResponse = {
    meditationId: 'test-meditation-123',
    type: MediaType.Video,
    mediaUrl: 'https://example.com/video.mp4',
    subtitleUrl: 'https://example.com/subtitles.srt',
    durationSeconds: 125,
    status: GenerationStatus.Success,
    message: 'Generation completed successfully',
  };

  describe('Visibility', () => {
    it('does not render when isOpen is false', () => {
      render(<GenerationResultModal isOpen={false} onClose={vi.fn()} />);
      
      expect(screen.queryByTestId('generation-result-modal')).not.toBeInTheDocument();
    });

    it('renders when isOpen is true with success result', () => {
      render(
        <GenerationResultModal
          isOpen={true}
          result={mockSuccessResult}
          onClose={vi.fn()}
        />
      );
      
      expect(screen.getByTestId('generation-result-modal')).toBeInTheDocument();
    });

    it('renders when isOpen is true with error', () => {
      render(
        <GenerationResultModal
          isOpen={true}
          error="Test error"
          onClose={vi.fn()}
        />
      );
      
      expect(screen.getByTestId('generation-result-modal')).toBeInTheDocument();
    });
  });

  describe('Success State', () => {
    it('displays success message for video', () => {
      render(
        <GenerationResultModal
          isOpen={true}
          result={mockSuccessResult}
          onClose={vi.fn()}
        />
      );
      
      expect(screen.getByText('Generation Complete!')).toBeInTheDocument();
      expect(screen.getByText(/video meditation has been created successfully/)).toBeInTheDocument();
    });

    it('displays success message for podcast', () => {
      const podcastResult: GenerationResponse = {
        ...mockSuccessResult,
        type: MediaType.Audio,
      };
      
      render(
        <GenerationResultModal
          isOpen={true}
          result={podcastResult}
          onClose={vi.fn()}
        />
      );
      
      expect(screen.getByText(/podcast meditation has been created successfully/)).toBeInTheDocument();
    });

    it('displays meditation type', () => {
      render(
        <GenerationResultModal
          isOpen={true}
          result={mockSuccessResult}
          onClose={vi.fn()}
        />
      );
      
      expect(screen.getByText('Type:')).toBeInTheDocument();
      expect(screen.getByText('VIDEO')).toBeInTheDocument();
    });

    it('displays formatted duration', () => {
      render(
        <GenerationResultModal
          isOpen={true}
          result={mockSuccessResult}
          onClose={vi.fn()}
        />
      );
      
      expect(screen.getByText('Duration:')).toBeInTheDocument();
      expect(screen.getByText('2m 5s')).toBeInTheDocument();
    });

    it('formats duration under 1 minute correctly', () => {
      const result: GenerationResponse = {
        ...mockSuccessResult,
        durationSeconds: 45,
      };
      
      render(
        <GenerationResultModal
          isOpen={true}
          result={result}
          onClose={vi.fn()}
        />
      );
      
      expect(screen.getByText('45s')).toBeInTheDocument();
    });

    it('renders download media button with correct URL', () => {
      render(
        <GenerationResultModal
          isOpen={true}
          result={mockSuccessResult}
          onClose={vi.fn()}
        />
      );
      
      const downloadButton = screen.getByTestId('download-media-button');
      expect(downloadButton).toBeInTheDocument();
      expect(downloadButton).toHaveAttribute('href', mockSuccessResult.mediaUrl);
      expect(downloadButton).toHaveTextContent('📥 Download Video');
    });

    it('renders download podcast button for audio', () => {
      const podcastResult: GenerationResponse = {
        ...mockSuccessResult,
        type: MediaType.Audio,
      };
      
      render(
        <GenerationResultModal
          isOpen={true}
          result={podcastResult}
          onClose={vi.fn()}
        />
      );
      
      const downloadButton = screen.getByTestId('download-media-button');
      expect(downloadButton).toHaveTextContent('📥 Download Audio');
    });

    it('renders download subtitles button with correct URL', () => {
      render(
        <GenerationResultModal
          isOpen={true}
          result={mockSuccessResult}
          onClose={vi.fn()}
        />
      );
      
      const subtitlesButton = screen.getByTestId('download-subtitles-button');
      expect(subtitlesButton).toBeInTheDocument();
      expect(subtitlesButton).toHaveAttribute('href', mockSuccessResult.subtitleUrl);
      expect(subtitlesButton).toHaveTextContent('📄 Download Subtitles');
    });

    it('does not render download buttons when URLs are missing', () => {
      const result: GenerationResponse = {
        ...mockSuccessResult,
        mediaUrl: null,
        subtitleUrl: null,
      };
      
      render(
        <GenerationResultModal
          isOpen={true}
          result={result}
          onClose={vi.fn()}
        />
      );
      
      expect(screen.queryByTestId('download-media-button')).not.toBeInTheDocument();
      expect(screen.queryByTestId('download-subtitles-button')).not.toBeInTheDocument();
    });

    it('calls onClose when close button is clicked', async () => {
      const user = userEvent.setup();
      const handleClose = vi.fn();
      
      render(
        <GenerationResultModal
          isOpen={true}
          result={mockSuccessResult}
          onClose={handleClose}
        />
      );
      
      await user.click(screen.getByTestId('close-result-button'));
      
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error State', () => {
    const errorMessage = 'Generation failed due to timeout';

    it('displays error message', () => {
      render(
        <GenerationResultModal
          isOpen={true}
          error={errorMessage}
          onClose={vi.fn()}
        />
      );
      
      expect(screen.getByText('Generation Failed')).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it('displays error icon', () => {
      render(
        <GenerationResultModal
          isOpen={true}
          error={errorMessage}
          onClose={vi.fn()}
        />
      );
      
      expect(screen.getByText('❌')).toBeInTheDocument();
    });

    it('renders retry button when onRetry is provided', () => {
      const handleRetry = vi.fn();
      
      render(
        <GenerationResultModal
          isOpen={true}
          error={errorMessage}
          onClose={vi.fn()}
          onRetry={handleRetry}
        />
      );
      
      expect(screen.getByTestId('retry-generation-button')).toBeInTheDocument();
    });

    it('does not render retry button when onRetry is not provided', () => {
      render(
        <GenerationResultModal
          isOpen={true}
          error={errorMessage}
          onClose={vi.fn()}
        />
      );
      
      expect(screen.queryByTestId('retry-generation-button')).not.toBeInTheDocument();
    });

    it('calls onRetry and onClose when retry button is clicked', async () => {
      const user = userEvent.setup();
      const handleRetry = vi.fn();
      const handleClose = vi.fn();
      
      render(
        <GenerationResultModal
          isOpen={true}
          error={errorMessage}
          onClose={handleClose}
          onRetry={handleRetry}
        />
      );
      
      await user.click(screen.getByTestId('retry-generation-button'));
      
      expect(handleClose).toHaveBeenCalledTimes(1);
      expect(handleRetry).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when close button is clicked', async () => {
      const user = userEvent.setup();
      const handleClose = vi.fn();
      
      render(
        <GenerationResultModal
          isOpen={true}
          error={errorMessage}
          onClose={handleClose}
        />
      );
      
      await user.click(screen.getByTestId('close-error-button'));
      
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('has proper dialog role and attributes', () => {
      render(
        <GenerationResultModal
          isOpen={true}
          result={mockSuccessResult}
          onClose={vi.fn()}
        />
      );
      
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby', 'generation-result-title');
    });

    it('title has correct id for aria-labelledby', () => {
      render(
        <GenerationResultModal
          isOpen={true}
          result={mockSuccessResult}
          onClose={vi.fn()}
        />
      );
      
      const title = screen.getByText('Generation Complete!');
      expect(title).toHaveAttribute('id', 'generation-result-title');
    });
  });

  describe('Overlay Interaction', () => {
    it('calls onClose when overlay is clicked', async () => {
      const user = userEvent.setup();
      const handleClose = vi.fn();
      
      render(
        <GenerationResultModal
          isOpen={true}
          result={mockSuccessResult}
          onClose={handleClose}
        />
      );
      
      const overlay = screen.getByTestId('generation-result-modal');
      await user.click(overlay);
      
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('does not call onClose when modal content is clicked', async () => {
      const user = userEvent.setup();
      const handleClose = vi.fn();
      
      render(
        <GenerationResultModal
          isOpen={true}
          result={mockSuccessResult}
          onClose={handleClose}
        />
      );
      
      const dialog = screen.getByRole('dialog');
      await user.click(dialog);
      
      expect(handleClose).not.toHaveBeenCalled();
    });
  });
});
