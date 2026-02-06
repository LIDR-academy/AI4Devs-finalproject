/**
 * TDD - FASE ROJA (Red Phase)
 * Test for FileUploader component - T-003-FRONT
 * 
 * This test describes the expected behavior BEFORE implementation.
 * The component does not exist yet, so these tests MUST fail.
 * 
 * Acceptance Criteria (from backlog):
 * - Service uses axios/fetch to PUT to signed URL
 * - Progress events for UI feedback
 * - DoD: File appears in S3 bucket after upload
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import { FileUploader } from '../components/FileUploader';
import type { PresignedUrlResponse } from '../types/upload';

// Mock axios
vi.mock('axios');
const mockedAxios = vi.mocked(axios);

describe('FileUploader Component - TDD Red Phase', () => {
  const mockPresignedResponse: PresignedUrlResponse = {
    upload_url: 'https://supabase.co/storage/v1/object/raw-uploads/test-file.3dm?token=xyz',
    file_key: 'test-file.3dm',
    expires_in: 300,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering and UI', () => {
    it('should render a file input or dropzone', () => {
      render(<FileUploader />);
      
      // Look for file input or dropzone text
      const fileInput = screen.queryByLabelText(/upload|file|drag/i);
      const dropzoneText = screen.queryByText(/drag.*drop|choose.*file/i);
      
      expect(fileInput || dropzoneText).toBeTruthy();
    });

    it('should accept only .3dm files by default', () => {
      render(<FileUploader />);
      
      const fileInput = screen.getByLabelText(/upload|file/i) as HTMLInputElement;
      
      // Should have accept attribute for .3dm files
      expect(fileInput.accept).toContain('.3dm');
    });
  });

  describe('File Selection and Validation', () => {
    it('should reject files larger than 500MB by default', async () => {
      const onUploadError = vi.fn();
      render(<FileUploader onUploadError={onUploadError} />);
      
      const user = userEvent.setup();
      const fileInput = screen.getByLabelText(/upload|file/i) as HTMLInputElement;
      
      // Create a mock file larger than 500MB
      const largeFile = new File(['x'.repeat(500 * 1024 * 1024 + 1)], 'large.3dm', {
        type: 'application/x-rhino',
      });
      
      await user.upload(fileInput, largeFile);
      
      // Should call error callback with size validation error
      await waitFor(() => {
        expect(onUploadError).toHaveBeenCalledWith(
          expect.objectContaining({
            message: expect.stringMatching(/size|large|exceed/i),
          })
        );
      });
    });

    it('should reject non-.3dm files', async () => {
      const onUploadError = vi.fn();
      render(<FileUploader onUploadError={onUploadError} />);
      
      const user = userEvent.setup();
      const fileInput = screen.getByLabelText(/upload|file/i) as HTMLInputElement;
      
      const invalidFile = new File(['content'], 'document.txt', {
        type: 'text/plain',
      });
      
      await user.upload(fileInput, invalidFile);
      
      await waitFor(() => {
        expect(onUploadError).toHaveBeenCalledWith(
          expect.objectContaining({
            message: expect.stringMatching(/extension|type|format/i),
          })
        );
      });
    });
  });

  describe('Upload Flow Integration', () => {
    it('should request presigned URL from backend when file is selected', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: mockPresignedResponse,
      });
      
      mockedAxios.put.mockResolvedValueOnce({ status: 200 });
      
      render(<FileUploader />);
      
      const user = userEvent.setup();
      const fileInput = screen.getByLabelText(/upload|file/i) as HTMLInputElement;
      
      const validFile = new File(['rhino content'], 'model.3dm', {
        type: 'application/x-rhino',
      });
      
      await user.upload(fileInput, validFile);
      
      // Should call backend to get presigned URL
      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith(
          expect.stringContaining('/api/upload/url'),
          expect.objectContaining({
            filename: 'model.3dm',
            size: validFile.size,
          })
        );
      });
    });

    it('should upload file to presigned URL using PUT', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: mockPresignedResponse,
      });
      
      mockedAxios.put.mockResolvedValueOnce({ status: 200 });
      
      render(<FileUploader />);
      
      const user = userEvent.setup();
      const fileInput = screen.getByLabelText(/upload|file/i) as HTMLInputElement;
      
      const validFile = new File(['rhino content'], 'model.3dm', {
        type: 'application/x-rhino',
      });
      
      await user.upload(fileInput, validFile);
      
      // Should upload to presigned URL
      await waitFor(() => {
        expect(mockedAxios.put).toHaveBeenCalledWith(
          mockPresignedResponse.upload_url,
          validFile,
          expect.objectContaining({
            headers: expect.objectContaining({
              'Content-Type': 'application/x-rhino',
            }),
            onUploadProgress: expect.any(Function),
          })
        );
      });
    });

    it('should show "Uploading..." state during upload', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: mockPresignedResponse,
      });
      
      // Delay PUT to simulate upload time
      mockedAxios.put.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ status: 200 }), 100))
      );
      
      render(<FileUploader />);
      
      const user = userEvent.setup();
      const fileInput = screen.getByLabelText(/upload|file/i) as HTMLInputElement;
      
      const validFile = new File(['rhino content'], 'model.3dm', {
        type: 'application/x-rhino',
      });
      
      await user.upload(fileInput, validFile);
      
      // Should show uploading state
      await waitFor(() => {
        expect(screen.getByText(/uploading|loading/i)).toBeInTheDocument();
      });
    });

    it('should show success state after successful upload', async () => {
      const onUploadComplete = vi.fn();
      
      mockedAxios.post.mockResolvedValueOnce({
        data: mockPresignedResponse,
      });
      
      mockedAxios.put.mockResolvedValueOnce({ status: 200 });
      
      render(<FileUploader onUploadComplete={onUploadComplete} />);
      
      const user = userEvent.setup();
      const fileInput = screen.getByLabelText(/upload|file/i) as HTMLInputElement;
      
      const validFile = new File(['rhino content'], 'model.3dm', {
        type: 'application/x-rhino',
      });
      
      await user.upload(fileInput, validFile);
      
      // Should show success message
      await waitFor(() => {
        expect(screen.getByText(/success|complete|uploaded/i)).toBeInTheDocument();
      });
      
      // Should call completion callback with file_key
      expect(onUploadComplete).toHaveBeenCalledWith(mockPresignedResponse.file_key);
    });

    it('should report upload progress via onProgress callback', async () => {
      const onProgress = vi.fn();
      
      mockedAxios.post.mockResolvedValueOnce({
        data: mockPresignedResponse,
      });
      
      mockedAxios.put.mockImplementationOnce((url, data, config) => {
        // Simulate progress events
        if (config?.onUploadProgress) {
          config.onUploadProgress({ loaded: 50, total: 100 });
          config.onUploadProgress({ loaded: 100, total: 100 });
        }
        return Promise.resolve({ status: 200 });
      });
      
      render(<FileUploader onProgress={onProgress} />);
      
      const user = userEvent.setup();
      const fileInput = screen.getByLabelText(/upload|file/i) as HTMLInputElement;
      
      const validFile = new File(['rhino content'], 'model.3dm', {
        type: 'application/x-rhino',
      });
      
      await user.upload(fileInput, validFile);
      
      // Should call progress callback with percentage
      await waitFor(() => {
        expect(onProgress).toHaveBeenCalledWith(
          expect.objectContaining({
            loaded: expect.any(Number),
            total: expect.any(Number),
            percentage: expect.any(Number),
          })
        );
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle backend error when requesting presigned URL', async () => {
      const onUploadError = vi.fn();
      
      mockedAxios.post.mockRejectedValueOnce(new Error('Backend unavailable'));
      
      render(<FileUploader onUploadError={onUploadError} />);
      
      const user = userEvent.setup();
      const fileInput = screen.getByLabelText(/upload|file/i) as HTMLInputElement;
      
      const validFile = new File(['rhino content'], 'model.3dm', {
        type: 'application/x-rhino',
      });
      
      await user.upload(fileInput, validFile);
      
      await waitFor(() => {
        expect(onUploadError).toHaveBeenCalledWith(
          expect.objectContaining({
            message: expect.any(String),
          })
        );
      });
    });

    it('should handle S3 upload failure', async () => {
      const onUploadError = vi.fn();
      
      mockedAxios.post.mockResolvedValueOnce({
        data: mockPresignedResponse,
      });
      
      mockedAxios.put.mockRejectedValueOnce(new Error('Network error'));
      
      render(<FileUploader onUploadError={onUploadError} />);
      
      const user = userEvent.setup();
      const fileInput = screen.getByLabelText(/upload|file/i) as HTMLInputElement;
      
      const validFile = new File(['rhino content'], 'model.3dm', {
        type: 'application/x-rhino',
      });
      
      await user.upload(fileInput, validFile);
      
      await waitFor(() => {
        expect(onUploadError).toHaveBeenCalledWith(
          expect.objectContaining({
            message: expect.any(String),
          })
        );
      });
      
      // Should show error message in UI
      await waitFor(() => {
        expect(screen.getByText(/error|fail/i)).toBeInTheDocument();
      });
    });
  });
});
