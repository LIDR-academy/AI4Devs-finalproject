/**
 * OutputTypeIndicator Component Tests
 * Verifies output type display logic
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OutputTypeIndicator } from '@/components/OutputTypeIndicator';
import { useComposerStore } from '@/state/composerStore';

describe('OutputTypeIndicator', () => {
  beforeEach(() => {
    // Reset store state before each test
    useComposerStore.setState({
      selectedImageId: null,
      outputType: 'PODCAST',
    });
  });

  describe('Output Type Display', () => {
    it('should display "Generate Podcast" when no image is selected', () => {
      useComposerStore.setState({ 
        selectedImageId: null,
        outputType: 'PODCAST',
      });
      render(<OutputTypeIndicator />);
      
      expect(screen.getByTestId('output-type-value')).toHaveTextContent('Generate Podcast');
    });

    it('should display "Generate Video" when image is selected', () => {
      useComposerStore.setState({ 
        selectedImageId: 'some-image-id',
        outputType: 'VIDEO',
      });
      render(<OutputTypeIndicator />);
      
      expect(screen.getByTestId('output-type-value')).toHaveTextContent('Generate Video');
    });
  });

  describe('Visual Indicators', () => {
    it('should show podcast icon when no image', () => {
      useComposerStore.setState({ outputType: 'PODCAST' });
      render(<OutputTypeIndicator />);
      
      expect(screen.getByText('🎧')).toBeInTheDocument();
    });

    it('should show video icon when image present', () => {
      useComposerStore.setState({ outputType: 'VIDEO' });
      render(<OutputTypeIndicator />);
      
      expect(screen.getByText('🎬')).toBeInTheDocument();
    });

    it('should have podcast styling class when no image', () => {
      useComposerStore.setState({ outputType: 'PODCAST' });
      render(<OutputTypeIndicator />);
      
      expect(screen.getByTestId('output-type-indicator')).toHaveClass('output-type-indicator--podcast');
    });

    it('should have video styling class when image present', () => {
      useComposerStore.setState({ outputType: 'VIDEO' });
      render(<OutputTypeIndicator />);
      
      expect(screen.getByTestId('output-type-indicator')).toHaveClass('output-type-indicator--video');
    });
  });

  describe('Accessibility', () => {
    it('should have role="button" for main interaction', () => {
      render(<OutputTypeIndicator />);
      
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should have aria-live="polite" for dynamic updates', () => {
      render(<OutputTypeIndicator />);
      
      expect(screen.getByTestId('output-type-indicator')).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Immediate Update (FR-019)', () => {
    it('should update immediately when image is added', () => {
      const { rerender } = render(<OutputTypeIndicator />);
      expect(screen.getByTestId('output-type-value')).toHaveTextContent('Generate Podcast');
      
      // Simulate image being added
      useComposerStore.setState({ 
        selectedImageId: 'new-image',
        outputType: 'VIDEO',
      });
      rerender(<OutputTypeIndicator />);
      
      expect(screen.getByTestId('output-type-value')).toHaveTextContent('Generate Video');
    });

    it('should update immediately when image is removed', () => {
      useComposerStore.setState({ 
        selectedImageId: 'some-image',
        outputType: 'VIDEO',
      });
      const { rerender } = render(<OutputTypeIndicator />);
      expect(screen.getByTestId('output-type-value')).toHaveTextContent('Generate Video');
      
      // Simulate image being removed
      useComposerStore.setState({ 
        selectedImageId: null,
        outputType: 'PODCAST',
      });
      rerender(<OutputTypeIndicator />);
      
      expect(screen.getByTestId('output-type-value')).toHaveTextContent('Generate Podcast');
    });
  });
});
