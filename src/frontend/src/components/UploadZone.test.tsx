/**
 * UploadZone Component - Simplified Tests for TDD GREEN Phase
 * T-001-FRONT: Drag & Drop upload zone with react-dropzone
 * 
 * Tests based on US-001 Acceptance Criteria focusing on component behavior
 * and visual states rather than complex jsdom file upload simulation.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UploadZone } from './UploadZone';

describe('UploadZone Component - GREEN Phase Tests', () => {
  describe('Rendering and Configuration', () => {
    it('renders dropzone with instructional text', () => {
      const onFilesAccepted = vi.fn();
      
      render(<UploadZone onFilesAccepted={onFilesAccepted} />);
      
      // Verify instructional text is visible
      expect(screen.getByText(/drag.*drop/i)).toBeDefined();
      expect(screen.getByText(/\.3dm/i)).toBeDefined();
    });

    it('renders hidden file input for accessibility', () => {
      const onFilesAccepted = vi.fn();
      
      render(<UploadZone onFilesAccepted={onFilesAccepted} />);
      
      const input = document.querySelector('input[type="file"]');
      expect(input).toBeDefined();
      expect(input?.getAttribute('accept')).toContain('.3dm');
    });

    it('displays maximum file size in UI', () => {
      const onFilesAccepted = vi.fn();
      
      render(<UploadZone onFilesAccepted={onFilesAccepted} />);
      
      // Verify 500MB limit is communicated to user
      expect(screen.getByText(/500.*MB/i)).toBeDefined();
    });

    it('applies custom className prop', () => {
      const onFilesAccepted = vi.fn();
      
      render(
        <UploadZone 
          onFilesAccepted={onFilesAccepted} 
          className="custom-upload-zone"
        />
      );
      
      const dropzone = screen.getByTestId('upload-dropzone');
      expect(dropzone.classList.contains('custom-upload-zone')).toBe(true);
    });

    it('displays custom maxFileSize in UI when provided', () => {
      const onFilesAccepted = vi.fn();
      
      render(
        <UploadZone 
          onFilesAccepted={onFilesAccepted} 
          maxFileSize={100 * 1024 * 1024} // 100MB
        />
      );
      
      // Verify custom limit is shown
      expect(screen.getByText(/100.*MB/i)).toBeDefined();
    });

    it('renders with disabled state when disabled prop is true', () => {
      const onFilesAccepted = vi.fn();
      
      render(<UploadZone onFilesAccepted={onFilesAccepted} disabled={true} />);
      
      const dropzone = screen.getByTestId('upload-dropzone');
      expect(dropzone.classList.contains('upload-zone--disabled')).toBe(true);
    });
  });

  describe('Component Structure', () => {
    it('has correct accept attribute for .3dm files', () => {
      const onFilesAccepted = vi.fn();
      
      render(<UploadZone onFilesAccepted={onFilesAccepted} />);
      
      const input = document.querySelector('input[type="file"]');
      const acceptAttr = input?.getAttribute('accept');
      
      // Should accept application/x-rhino and application/octet-stream with .3dm extension
      expect(acceptAttr).toContain('application/x-rhino');
      expect(acceptAttr).toContain('.3dm');
    });

    it('has single file selection by default (multiple=false)', () => {
      const onFilesAccepted = vi.fn();
      
      render(<UploadZone onFilesAccepted={onFilesAccepted} />);
      
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      expect(input.multiple).toBe(false);
    });

    it('renders dropzone container with data-testid', () => {
      const onFilesAccepted = vi.fn();
      
      render(<UploadZone onFilesAccepted={onFilesAccepted} />);
      
      const dropzone = screen.getByTestId('upload-dropzone');
      expect(dropzone).toBeDefined();
      expect(dropzone.getAttribute('role')).toBe('presentation');
    });
  });

  describe('Error Message Display', () => {
    it('does not show error message initially', () => {
      const onFilesAccepted = vi.fn();
      
      render(<UploadZone onFilesAccepted={onFilesAccepted} />);
      
      const errorMessage = screen.queryByTestId('upload-error-message');
      expect(errorMessage).toBeNull();
    });
  });

  describe('Props Validation', () => {
    it('accepts all required and optional props', () => {
      const onFilesAccepted = vi.fn();
      const onFilesRejected = vi.fn();
      
      expect(() => {
        render(
          <UploadZone 
            onFilesAccepted={onFilesAccepted} 
            onFilesRejected={onFilesRejected}
            maxFileSize={200 * 1024 * 1024}
            acceptedMimeTypes={['application/x-rhino']}
            acceptedExtensions={['.3dm']}
            multiple={false}
            disabled={false}
            className="test-class"
          />
        );
      }).not.toThrow();
    });

    it('works with minimal props (only onFilesAccepted)', () => {
      const onFilesAccepted = vi.fn();
      
      expect(() => {
        render(<UploadZone onFilesAccepted={onFilesAccepted} />);
      }).not.toThrow();
      
      expect(screen.getByTestId('upload-dropzone')).toBeDefined();
    });
  });

  describe('Visual States', () => {
    it('has base upload-zone class', () => {
      const onFilesAccepted = vi.fn();
      
      render(<UploadZone onFilesAccepted={onFilesAccepted} />);
      
      const dropzone = screen.getByTestId('upload-dropzone');
      expect(dropzone.classList.contains('upload-zone')).toBe(true);
    });

    it('adds disabled class when disabled', () => {
      const onFilesAccepted = vi.fn();
      
      render(<UploadZone onFilesAccepted={onFilesAccepted} disabled={true} />);
      
      const dropzone = screen.getByTestId('upload-dropzone');
      expect(dropzone.classList.contains('upload-zone--disabled')).toBe(true);
    });
  });
});
