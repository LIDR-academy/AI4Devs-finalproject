/**
 * Tests for Template Service API Integration
 * 
 * Tests the templateService functions for ingesting templates
 * with authentication, error handling, and response parsing.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiService } from './apiService';
import type { TemplateIngestRequest, TemplateIngestResponse } from './templateService';
import { templateService } from './templateService';

// Mock apiService
vi.mock('./apiService', () => ({
  apiService: {
    upload: vi.fn(),
  },
}));

describe('templateService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('ingestTemplate', () => {
    const mockFile = new File(['test content'], 'test-template.pdf', {
      type: 'application/pdf',
    });

    const mockRequest: TemplateIngestRequest = {
      name: 'Test Template',
      version: '1.0',
      sepe_url: 'https://www.sepe.es/test',
      file: mockFile,
    };

    const mockResponse: TemplateIngestResponse = {
      id: 1,
      name: 'Test Template',
      version: '1.0',
      file_path: '/app/uploads/test-template-uuid.pdf',
      file_size_bytes: 12345,
      field_count: 10,
      checksum: 'abc123def456',
      message: 'Template ingested successfully',
    };

    it('should successfully ingest a template with all fields', async () => {
      vi.mocked(apiService.upload).mockResolvedValue(mockResponse);

      const result = await templateService.ingestTemplate(mockRequest);

      expect(apiService.upload).toHaveBeenCalledTimes(1);
      expect(apiService.upload).toHaveBeenCalledWith(
        '/templates/ingest',
        expect.any(FormData)
      );

      // Verify FormData contents
      const formDataCall = vi.mocked(apiService.upload).mock.calls[0][1] as FormData;
      expect(formDataCall.get('file')).toBe(mockFile);
      expect(formDataCall.get('name')).toBe('Test Template');
      expect(formDataCall.get('version')).toBe('1.0');
      expect(formDataCall.get('sepe_url')).toBe('https://www.sepe.es/test');

      expect(result).toEqual(mockResponse);
    });

    it('should ingest template without optional sepe_url', async () => {
      const requestWithoutUrl: TemplateIngestRequest = {
        name: 'Test Template',
        version: '1.0',
        file: mockFile,
      };

      vi.mocked(apiService.upload).mockResolvedValue(mockResponse);

      const result = await templateService.ingestTemplate(requestWithoutUrl);

      expect(apiService.upload).toHaveBeenCalledTimes(1);

      const formDataCall = vi.mocked(apiService.upload).mock.calls[0][1] as FormData;
      expect(formDataCall.get('file')).toBe(mockFile);
      expect(formDataCall.get('name')).toBe('Test Template');
      expect(formDataCall.get('version')).toBe('1.0');
      expect(formDataCall.has('sepe_url')).toBe(false);

      expect(result).toEqual(mockResponse);
    });

    it('should handle API errors gracefully', async () => {
      const errorMessage = 'Invalid PDF file';
      vi.mocked(apiService.upload).mockRejectedValue(new Error(errorMessage));

      await expect(templateService.ingestTemplate(mockRequest)).rejects.toThrow(
        errorMessage
      );
    });

    it('should handle network errors', async () => {
      vi.mocked(apiService.upload).mockRejectedValue(
        new Error('Network error occurred')
      );

      await expect(templateService.ingestTemplate(mockRequest)).rejects.toThrow(
        'Network error occurred'
      );
    });

    it('should handle validation errors from backend', async () => {
      const validationError = new Error(
        'Validation failed: name is required'
      );
      vi.mocked(apiService.upload).mockRejectedValue(validationError);

      await expect(templateService.ingestTemplate(mockRequest)).rejects.toThrow(
        'Validation failed: name is required'
      );
    });

    it('should handle unauthorized errors', async () => {
      const authError = new Error('Authentication required');
      vi.mocked(apiService.upload).mockRejectedValue(authError);

      await expect(templateService.ingestTemplate(mockRequest)).rejects.toThrow(
        'Authentication required'
      );
    });

    it('should handle file too large errors', async () => {
      const fileSizeError = new Error('File size exceeds maximum limit of 10MB');
      vi.mocked(apiService.upload).mockRejectedValue(fileSizeError);

      await expect(templateService.ingestTemplate(mockRequest)).rejects.toThrow(
        'File size exceeds maximum limit of 10MB'
      );
    });

    it('should handle server errors', async () => {
      const serverError = new Error('Internal server error');
      vi.mocked(apiService.upload).mockRejectedValue(serverError);

      await expect(templateService.ingestTemplate(mockRequest)).rejects.toThrow(
        'Internal server error'
      );
    });
  });

  describe('FormData creation', () => {
    it('should create FormData with correct structure', async () => {
      const mockFile = new File(['content'], 'test.pdf', {
        type: 'application/pdf',
      });
      const request: TemplateIngestRequest = {
        name: 'Template Name',
        version: '2.0',
        sepe_url: 'https://example.com',
        file: mockFile,
      };

      vi.mocked(apiService.upload).mockResolvedValue({
        id: 1,
        name: 'Template Name',
        version: '2.0',
        file_path: '/path/to/file',
        file_size_bytes: 100,
        field_count: 5,
        checksum: 'checksum123',
        message: 'Success',
      });

      await templateService.ingestTemplate(request);

      const formData = vi.mocked(apiService.upload).mock.calls[0][1] as FormData;

      // Verify all fields are present
      expect(formData.get('file')).toBeInstanceOf(File);
      expect(formData.get('name')).toBe('Template Name');
      expect(formData.get('version')).toBe('2.0');
      expect(formData.get('sepe_url')).toBe('https://example.com');
    });

    it('should not include sepe_url in FormData when not provided', async () => {
      const mockFile = new File(['content'], 'test.pdf', {
        type: 'application/pdf',
      });
      const request: TemplateIngestRequest = {
        name: 'Template Name',
        version: '2.0',
        file: mockFile,
      };

      vi.mocked(apiService.upload).mockResolvedValue({
        id: 1,
        name: 'Template Name',
        version: '2.0',
        file_path: '/path/to/file',
        file_size_bytes: 100,
        field_count: 5,
        checksum: 'checksum123',
        message: 'Success',
      });

      await templateService.ingestTemplate(request);

      const formData = vi.mocked(apiService.upload).mock.calls[0][1] as FormData;

      // sepe_url should not be in FormData
      expect(formData.has('sepe_url')).toBe(false);
    });
  });
});

