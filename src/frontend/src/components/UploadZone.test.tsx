/**
 * UploadZone Component - TDD FASE ROJA
 * T-001-FRONT: Drag & Drop upload zone with react-dropzone
 * 
 * Tests based on US-001 Acceptance Criteria:
 * - Scenario 1 (Happy Path): Accept valid .3dm files
 * - Scenario 2 (Edge Case): Reject files >500MB
 * - Scenario 3 (Validation): Reject non-.3dm files
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { UploadZone } from './UploadZone';
import type { FileRejection } from '../types/upload';

describe('UploadZone Component - TDD FASE ROJA', () => {
  describe('Scenario 1 - Happy Path: Valid File Acceptance', () => {
    it('renders dropzone with instructional text', () => {
      const onFilesAccepted = vi.fn();
      
      render(<UploadZone onFilesAccepted={onFilesAccepted} />);
      
      // Verify instructional text is visible
      expect(screen.getByText(/drag.*drop/i)).toBeDefined();
      expect(screen.getByText(/\.3dm/i)).toBeDefined();
    });

    it('accepts valid .3dm file within size limit', () => {
      const onFilesAccepted = vi.fn();
      
      render(<UploadZone onFilesAccepted={onFilesAccepted} />);
      
      const dropzone = screen.getByTestId('upload-dropzone');
      
      // Create valid .3dm file (200MB as per US-001 Scenario 1)
      const validFile = new File(['x'.repeat(200)], 'model_v1.3dm', {
        type: 'application/x-rhino',
      });
      Object.defineProperty(validFile, 'size', { value: 200 * 1024 * 1024 }); // 200MB
      
      // Simulate drag & drop
      fireEvent.drop(dropzone, {
        dataTransfer: {
          files: [validFile],
        },
      });
      
      // Verify callback was called with accepted file
      expect(onFilesAccepted).toHaveBeenCalledTimes(1);
      expect(onFilesAccepted).toHaveBeenCalledWith([validFile]);
    });

    it('accepts file with .3dm extension even if MIME type is generic', () => {
      const onFilesAccepted = vi.fn();
      
      render(<UploadZone onFilesAccepted={onFilesAccepted} />);
      
      const dropzone = screen.getByTestId('upload-dropzone');
      
      // Many systems don't recognize .3dm MIME type and use octet-stream
      const fileWithGenericMime = new File(['data'], 'structure.3dm', {
        type: 'application/octet-stream',
      });
      Object.defineProperty(fileWithGenericMime, 'size', { value: 10 * 1024 * 1024 }); // 10MB
      
      fireEvent.drop(dropzone, {
        dataTransfer: {
          files: [fileWithGenericMime],
        },
      });
      
      // Should accept based on extension validation
      expect(onFilesAccepted).toHaveBeenCalledWith([fileWithGenericMime]);
    });

    it('provides visual feedback when dragging over dropzone', () => {
      const onFilesAccepted = vi.fn();
      
      render(<UploadZone onFilesAccepted={onFilesAccepted} />);
      
      const dropzone = screen.getByTestId('upload-dropzone');
      
      // Simulate drag enter
      fireEvent.dragEnter(dropzone);
      
      // Verify active state is applied (via CSS class or data attribute)
      expect(dropzone.classList.contains('dropzone-active') || 
             dropzone.dataset.active === 'true').toBe(true);
      
      // Simulate drag leave
      fireEvent.dragLeave(dropzone);
      
      // Verify active state is removed
      expect(dropzone.classList.contains('dropzone-active') || 
             dropzone.dataset.active === 'true').toBe(false);
    });
  });

  describe('Scenario 2 - Edge Case: File Size Limit (500MB)', () => {
    it('rejects file larger than 500MB with correct error', () => {
      const onFilesAccepted = vi.fn();
      const onFilesRejected = vi.fn();
      
      render(
        <UploadZone 
          onFilesAccepted={onFilesAccepted} 
          onFilesRejected={onFilesRejected} 
        />
      );
      
      const dropzone = screen.getByTestId('upload-dropzone');
      
      // Create oversized file (2GB as per US-001 Scenario 2)
      const oversizedFile = new File(['x'], 'huge_model.3dm', {
        type: 'application/x-rhino',
      });
      Object.defineProperty(oversizedFile, 'size', { value: 2 * 1024 * 1024 * 1024 }); // 2GB
      
      fireEvent.drop(dropzone, {
        dataTransfer: {
          files: [oversizedFile],
        },
      });
      
      // Verify rejection callback was called
      expect(onFilesRejected).toHaveBeenCalledTimes(1);
      
      // Verify error details
      const rejection = onFilesRejected.mock.calls[0][0][0] as FileRejection;
      expect(rejection.file).toBe(oversizedFile);
      expect(rejection.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: 'file-too-large',
            message: expect.stringContaining('500'),
          }),
        ])
      );
      
      // Verify accepted callback was NOT called
      expect(onFilesAccepted).not.toHaveBeenCalled();
    });

    it('displays error message when file is too large', () => {
      const onFilesAccepted = vi.fn();
      const onFilesRejected = vi.fn();
      
      render(
        <UploadZone 
          onFilesAccepted={onFilesAccepted} 
          onFilesRejected={onFilesRejected} 
        />
      );
      
      const dropzone = screen.getByTestId('upload-dropzone');
      
      const oversizedFile = new File(['x'], 'large.3dm', {
        type: 'application/x-rhino',
      });
      Object.defineProperty(oversizedFile, 'size', { value: 600 * 1024 * 1024 }); // 600MB
      
      fireEvent.drop(dropzone, {
        dataTransfer: {
          files: [oversizedFile],
        },
      });
      
      // Verify error message is displayed in UI
      expect(screen.getByText(/tamaño máximo excedido|exceeds maximum|500.*MB/i)).toBeDefined();
    });

    it('accepts file exactly at 500MB limit', () => {
      const onFilesAccepted = vi.fn();
      const onFilesRejected = vi.fn();
      
      render(
        <UploadZone 
          onFilesAccepted={onFilesAccepted} 
          onFilesRejected={onFilesRejected} 
        />
      );
      
      const dropzone = screen.getByTestId('upload-dropzone');
      
      // Edge case: exactly 500MB
      const exactLimitFile = new File(['x'], 'limit.3dm', {
        type: 'application/x-rhino',
      });
      Object.defineProperty(exactLimitFile, 'size', { value: 500 * 1024 * 1024 }); // 500MB
      
      fireEvent.drop(dropzone, {
        dataTransfer: {
          files: [exactLimitFile],
        },
      });
      
      // Should be accepted
      expect(onFilesAccepted).toHaveBeenCalledWith([exactLimitFile]);
      expect(onFilesRejected).not.toHaveBeenCalled();
    });
  });

  describe('Scenario 3 - Validation: File Type Restrictions', () => {
    it('rejects non-.3dm file with correct error', () => {
      const onFilesAccepted = vi.fn();
      const onFilesRejected = vi.fn();
      
      render(
        <UploadZone 
          onFilesAccepted={onFilesAccepted} 
          onFilesRejected={onFilesRejected} 
        />
      );
      
      const dropzone = screen.getByTestId('upload-dropzone');
      
      // Various invalid file types
      const invalidFiles = [
        new File(['content'], 'document.pdf', { type: 'application/pdf' }),
        new File(['content'], 'notes.txt', { type: 'text/plain' }),
        new File(['content'], 'model.dwg', { type: 'application/octet-stream' }),
      ];
      
      invalidFiles.forEach((invalidFile) => {
        Object.defineProperty(invalidFile, 'size', { value: 1024 * 1024 }); // 1MB
        
        fireEvent.drop(dropzone, {
          dataTransfer: {
            files: [invalidFile],
          },
        });
        
        // Verify rejection
        expect(onFilesRejected).toHaveBeenCalled();
        const rejection = onFilesRejected.mock.calls[0][0][0] as FileRejection;
        expect(rejection.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              code: 'file-invalid-type',
            }),
          ])
        );
        
        // Reset mocks for next iteration
        onFilesRejected.mockClear();
      });
      
      // Accepted callback should never be called
      expect(onFilesAccepted).not.toHaveBeenCalled();
    });

    it('displays error message for invalid file type', () => {
      const onFilesAccepted = vi.fn();
      const onFilesRejected = vi.fn();
      
      render(
        <UploadZone 
          onFilesAccepted={onFilesAccepted} 
          onFilesRejected={onFilesRejected} 
        />
      );
      
      const dropzone = screen.getByTestId('upload-dropzone');
      
      const invalidFile = new File(['content'], 'document.txt', {
        type: 'text/plain',
      });
      Object.defineProperty(invalidFile, 'size', { value: 1024 }); // 1KB
      
      fireEvent.drop(dropzone, {
        dataTransfer: {
          files: [invalidFile],
        },
      });
      
      // Verify error message in UI
      expect(screen.getByText(/invalid.*type|only.*\.3dm|tipo.*inválido/i)).toBeDefined();
    });
  });

  describe('Additional Edge Cases', () => {
    it('disables dropzone when disabled prop is true', () => {
      const onFilesAccepted = vi.fn();
      
      render(<UploadZone onFilesAccepted={onFilesAccepted} disabled={true} />);
      
      const dropzone = screen.getByTestId('upload-dropzone');
      
      // Verify disabled state
      expect(dropzone.dataset.disabled || dropzone.ariaDisabled).toBe('true');
      
      // Attempt to drop file
      const file = new File(['data'], 'test.3dm', { type: 'application/x-rhino' });
      Object.defineProperty(file, 'size', { value: 1024 * 1024 });
      
      fireEvent.drop(dropzone, {
        dataTransfer: {
          files: [file],
        },
      });
      
      // Should not accept files when disabled
      expect(onFilesAccepted).not.toHaveBeenCalled();
    });

    it('rejects multiple files when multiple=false (default)', () => {
      const onFilesAccepted = vi.fn();
      const onFilesRejected = vi.fn();
      
      render(
        <UploadZone 
          onFilesAccepted={onFilesAccepted} 
          onFilesRejected={onFilesRejected} 
        />
      );
      
      const dropzone = screen.getByTestId('upload-dropzone');
      
      const files = [
        new File(['1'], 'file1.3dm', { type: 'application/x-rhino' }),
        new File(['2'], 'file2.3dm', { type: 'application/x-rhino' }),
      ];
      
      files.forEach((file) => {
        Object.defineProperty(file, 'size', { value: 1024 * 1024 });
      });
      
      fireEvent.drop(dropzone, {
        dataTransfer: {
          files,
        },
      });
      
      // Should reject with too-many-files error
      expect(onFilesRejected).toHaveBeenCalled();
      const rejection = onFilesRejected.mock.calls[0][0][0] as FileRejection;
      expect(rejection.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: 'too-many-files',
          }),
        ])
      );
    });

    it('clears error message when valid file is dropped after invalid one', () => {
      const onFilesAccepted = vi.fn();
      const onFilesRejected = vi.fn();
      
      render(
        <UploadZone 
          onFilesAccepted={onFilesAccepted} 
          onFilesRejected={onFilesRejected} 
        />
      );
      
      const dropzone = screen.getByTestId('upload-dropzone');
      
      // First: drop invalid file
      const invalidFile = new File(['x'], 'doc.pdf', { type: 'application/pdf' });
      Object.defineProperty(invalidFile, 'size', { value: 1024 });
      
      fireEvent.drop(dropzone, {
        dataTransfer: {
          files: [invalidFile],
        },
      });
      
      // Error message should be visible
      expect(screen.queryByText(/invalid.*type|tipo.*inválido/i)).toBeDefined();
      
      // Second: drop valid file
      const validFile = new File(['x'], 'model.3dm', { type: 'application/x-rhino' });
      Object.defineProperty(validFile, 'size', { value: 10 * 1024 * 1024 });
      
      fireEvent.drop(dropzone, {
        dataTransfer: {
          files: [validFile],
        },
      });
      
      // Error message should be cleared
      expect(screen.queryByText(/invalid.*type|tipo.*inválido/i)).toBeNull();
    });
  });

  describe('Custom Configuration', () => {
    it('accepts custom maxFileSize prop', () => {
      const onFilesAccepted = vi.fn();
      const onFilesRejected = vi.fn();
      
      // Set custom max size of 100MB
      render(
        <UploadZone 
          onFilesAccepted={onFilesAccepted} 
          onFilesRejected={onFilesRejected}
          maxFileSize={100 * 1024 * 1024}
        />
      );
      
      const dropzone = screen.getByTestId('upload-dropzone');
      
      // File larger than custom limit
      const oversizedFile = new File(['x'], 'model.3dm', {
        type: 'application/x-rhino',
      });
      Object.defineProperty(oversizedFile, 'size', { value: 150 * 1024 * 1024 }); // 150MB
      
      fireEvent.drop(dropzone, {
        dataTransfer: {
          files: [oversizedFile],
        },
      });
      
      // Should be rejected
      expect(onFilesRejected).toHaveBeenCalled();
      expect(onFilesAccepted).not.toHaveBeenCalled();
    });

    it('applies custom className', () => {
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
  });
});
