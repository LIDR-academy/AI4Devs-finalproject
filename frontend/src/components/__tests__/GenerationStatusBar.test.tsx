/**
 * GenerationStatusBar Component Tests
 * T027: Frontend tests for generation status bar
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GenerationStatusBar } from '../GenerationStatusBar';

describe('GenerationStatusBar', () => {
  describe('Rendering', () => {
    it('renders with default message', () => {
      render(<GenerationStatusBar />);
      
      expect(screen.getByText('Creating meditation...')).toBeInTheDocument();
      expect(screen.getByTestId('generation-status-bar')).toBeInTheDocument();
    });

    it('renders with custom message', () => {
      render(<GenerationStatusBar message="Rendering video..." />);
      
      expect(screen.getByText('Rendering video...')).toBeInTheDocument();
    });

    it('displays emoji icon', () => {
      render(<GenerationStatusBar />);
      
      expect(screen.getByText('⏳')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(<GenerationStatusBar />);
      
      const statusBar = screen.getByTestId('generation-status-bar');
      expect(statusBar).toHaveAttribute('role', 'status');
      expect(statusBar).toHaveAttribute('aria-busy', 'true');
      expect(statusBar).toHaveAttribute('aria-live', 'polite');
    });

    it('has accessible progress bar', () => {
      render(<GenerationStatusBar progress={50} />);
      
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-label', 'Generation progress');
      expect(progressBar).toHaveAttribute('aria-valuenow', '50');
      expect(progressBar).toHaveAttribute('aria-valuemin', '0');
      expect(progressBar).toHaveAttribute('aria-valuemax', '100');
    });
  });

  describe('Progress States', () => {
    it('renders indeterminate progress when progress is undefined', () => {
      render(<GenerationStatusBar progress={undefined} />);
      
      const fill = screen.getByTestId('generation-status-bar-fill');
      expect(fill).toHaveClass('generation-status-bar__fill--indeterminate');
      expect(fill).toHaveStyle({ width: '100%' });
      
      // Should not display percentage
      expect(screen.queryByText(/%$/)).not.toBeInTheDocument();
    });

    it('renders determinate progress with percentage', () => {
      render(<GenerationStatusBar progress={65} />);
      
      const fill = screen.getByTestId('generation-status-bar-fill');
      expect(fill).not.toHaveClass('generation-status-bar__fill--indeterminate');
      expect(fill).toHaveStyle({ width: '65%' });
      
      // Should display percentage
      expect(screen.getByText('65%')).toBeInTheDocument();
    });

    it('clamps progress to 0-100 range', () => {
      const { rerender } = render(<GenerationStatusBar progress={-10} />);
      
      let fill = screen.getByTestId('generation-status-bar-fill');
      expect(fill).toHaveStyle({ width: '0%' });
      expect(screen.getByText('0%')).toBeInTheDocument();
      
      rerender(<GenerationStatusBar progress={150} />);
      fill = screen.getByTestId('generation-status-bar-fill');
      expect(fill).toHaveStyle({ width: '100%' });
      expect(screen.getByText('100%')).toBeInTheDocument();
    });

    it('displays 0% progress', () => {
      render(<GenerationStatusBar progress={0} />);
      
      expect(screen.getByText('0%')).toBeInTheDocument();
      const fill = screen.getByTestId('generation-status-bar-fill');
      expect(fill).toHaveStyle({ width: '0%' });
    });

    it('displays 100% progress', () => {
      render(<GenerationStatusBar progress={100} />);
      
      expect(screen.getByText('100%')).toBeInTheDocument();
      const fill = screen.getByTestId('generation-status-bar-fill');
      expect(fill).toHaveStyle({ width: '100%' });
    });
  });

  describe('Custom Styling', () => {
    it('applies custom className', () => {
      render(<GenerationStatusBar className="custom-class" />);
      
      const statusBar = screen.getByTestId('generation-status-bar');
      expect(statusBar).toHaveClass('generation-status-bar');
      expect(statusBar).toHaveClass('custom-class');
    });
  });
});
