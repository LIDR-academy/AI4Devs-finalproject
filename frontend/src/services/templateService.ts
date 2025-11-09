/**
 * Template Service - API integration for template ingestion
 * 
 * Handles communication with the backend template ingestion endpoint,
 * including file upload, metadata submission, and response parsing.
 * 
 * Features:
 * - FormData construction for multipart file upload
 * - Authentication token management (via apiService)
 * - Error handling and response parsing
 * - TypeScript type safety for requests and responses
 */

import { apiService } from './apiService';

/**
 * Request payload for template ingestion
 * Matches the backend TemplateIngestRequest schema
 */
export interface TemplateIngestRequest {
  /** Template name (max 255 characters) */
  name: string;
  /** Version identifier (max 50 characters) */
  version: string;
  /** Optional SEPE source URL */
  sepe_url?: string;
  /** PDF file to ingest */
  file: File;
}

/**
 * Response from successful template ingestion
 * Matches the backend TemplateIngestResponse schema
 */
export interface TemplateIngestResponse {
  /** Template ID */
  id: number;
  /** Template name */
  name: string;
  /** Version identifier */
  version: string;
  /** Server file path */
  file_path: string;
  /** File size in bytes */
  file_size_bytes: number;
  /** Number of extracted form fields */
  field_count: number;
  /** SHA256 checksum of the file */
  checksum: string;
  /** Success message */
  message: string;
}

/**
 * Template Service class for template-related API operations
 */
class TemplateService {
  /**
   * Ingest a new PDF template with metadata
   * 
   * Uploads the PDF file to the backend, which will:
   * 1. Save the file to persistent storage
   * 2. Analyze the PDF to extract form fields
   * 3. Store template metadata and fields in the database
   * 
   * @param request - Template ingestion request with file and metadata
   * @returns Promise resolving to ingestion response
   * @throws Error if authentication fails, validation fails, or server error occurs
   * 
   * @example
   * ```typescript
   * const file = new File([pdfBlob], 'template.pdf', { type: 'application/pdf' });
   * const response = await templateService.ingestTemplate({
   *   name: 'SEPE Template 2024',
   *   version: '1.0',
   *   sepe_url: 'https://www.sepe.es/...',
   *   file: file
   * });
   * console.log(`Template ingested with ID: ${response.id}`);
   * ```
   */
  async ingestTemplate(
    request: TemplateIngestRequest
  ): Promise<TemplateIngestResponse> {
    // Create FormData for multipart file upload
    const formData = new FormData();
    
    // Append file (required)
    formData.append('file', request.file);
    
    // Append metadata fields (required)
    formData.append('name', request.name);
    formData.append('version', request.version);
    
    // Append optional SEPE URL if provided
    if (request.sepe_url) {
      formData.append('sepe_url', request.sepe_url);
    }

    // Send request via apiService (handles authentication and error responses)
    // The apiService.upload method automatically:
    // - Adds the Authorization header with the JWT token from localStorage
    // - Sets Content-Type to multipart/form-data
    // - Handles 401 errors by redirecting to login
    // - Parses error responses into Error objects
    // Use 60 second timeout for PDF ingestion (analysis can take time)
    return apiService.upload<TemplateIngestResponse>(
      '/templates/ingest',
      formData,
      { timeout: 60000 } // 60 seconds for PDF analysis and ingestion
    );
  }
}

// Export singleton instance
export const templateService = new TemplateService();

// Export class for testing purposes
export { TemplateService };

