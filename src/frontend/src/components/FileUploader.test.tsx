/**
 * FileUploader - Minimal Test Suite para FASE VERDE
 * Cubre solo casos críticos para validar funcionalidad core
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FileUploader } from './FileUploader';
import axios from 'axios';

// Mock básico de axios
vi.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('FileUploader - Minimal Critical Tests', () => {
  
  it('renders file input with correct accept attribute', () => {
    render(<FileUploader onUploadComplete={() => {}} />);
    const fileInput = screen.getByTestId('file-input');
    expect(fileInput).toBeDefined();
    expect(fileInput.getAttribute('accept')).toBe('.3dm');
  });

  it('rejects files larger than 500MB', () => {
    const onError = vi.fn();
    render(<FileUploader onUploadComplete={() => {}} onUploadError={onError} />);
    
    const fileInput = screen.getByTestId('file-input');
    
    // Create a mock file >500MB
    const oversizedFile = new File(['x'], 'huge.3dm', { type: 'application/octet-stream' });
    Object.defineProperty(oversizedFile, 'size', { value: 600 * 1024 * 1024 }); // 600MB
    
    fireEvent.change(fileInput, { target: { files: [oversizedFile] } });
    
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('exceeds maximum'),
        code: 'VALIDATION_ERROR'
      })
    );
  });

  it('rejects non-.3dm files', () => {
    const onError = vi.fn();
    render(<FileUploader onUploadComplete={() => {}} onUploadError={onError} />);
    
    const fileInput = screen.getByTestId('file-input');
    const invalidFile = new File(['content'], 'document.pdf', { type: 'application/pdf' });
    
    fireEvent.change(fileInput, { target: { files: [invalidFile] } });
    
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('Invalid file type'),
        code: 'VALIDATION_ERROR'
      })
    );
  });

  it('uploads valid file successfully', async () => {
    // Mock backend presigned URL response (matches T-002-BACK schema)
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        upload_url: 'https://fake-s3.com/upload',
        file_id: 'abc-123-def-456',
        filename: 'model.3dm'
      }
    });

    // Mock S3 PUT request
    mockedAxios.put.mockResolvedValueOnce({ status: 200 });

    const onComplete = vi.fn();
    render(<FileUploader onUploadComplete={onComplete} />);
    
    const fileInput = screen.getByTestId('file-input') as HTMLInputElement;
    const validFile = new File(['content'], 'model.3dm', { type: 'application/octet-stream' });
    Object.defineProperty(validFile, 'size', { value: 10 * 1024 * 1024 }); // 10MB
    
    fireEvent.change(fileInput, { target: { files: [validFile] } });
    
    // Wait for async upload
    await waitFor(() => {
      expect(onComplete).toHaveBeenCalledWith('abc-123-def-456');
    });
    
    // Verify backend was called with correct payload
    expect(mockedAxios.post).toHaveBeenCalledWith(
      '/api/upload/url',
      { filename: 'model.3dm', size: 10 * 1024 * 1024 }
    );
  });
});
