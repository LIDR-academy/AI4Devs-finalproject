/**
 * Templates Service - API integration for template management
 *
 * Handles communication with the backend templates endpoints for:
 * - Fetching templates list with pagination, sorting, and filtering
 * - Downloading template PDFs
 * - Fetching template versions with metadata
 * - Fetching template AcroForm fields
 * - Comparing template versions (analyze differences)
 *
 * Features:
 * - Authentication token management (via apiService)
 * - Error handling and response parsing
 * - TypeScript type safety for requests and responses
 * - Support for pagination, sorting, filtering, and search
 *
 * @author AI4Devs
 * @date 2025-10-26
 */

import type {
  ComparisonRequest,
  ComparisonResult,
} from '../types/comparison.types';
import type {
  FieldsFilters,
  TemplateFieldListResponse,
  TemplateListResponse,
  TemplateNamesResponse,
  TemplatesFilters,
  TemplateVersionDetail,
  TemplateVersionIngestRequest,
  TemplateVersionIngestResponse,
  TemplateVersionListResponse,
  VersionsFilters,
} from '../types/templates.types';
import { apiService } from './apiService';

/**
 * Templates Service class for template management API operations
 */
class TemplatesService {
  /**
   * Fetch all templates with pagination, sorting, and filtering
   *
   * @param filters - Optional filters for pagination, sorting, and search
   * @returns Promise resolving to paginated list of templates
   * @throws Error if API request fails
   *
   * @example
   * ```typescript
   * // Fetch first page with default settings
   * const templates = await templatesService.getTemplates();
   *
   * // Fetch with custom pagination and sorting
   * const templates = await templatesService.getTemplates({
   *   limit: 50,
   *   offset: 100,
   *   sort_by: 'name',
   *   sort_order: 'asc',
   *   search: 'SEPE'
   * });
   * ```
   */
  async getTemplates(
    filters?: TemplatesFilters
  ): Promise<TemplateListResponse> {
    const params = {
      limit: filters?.limit ?? 20,
      skip: filters?.offset ?? 0,
      sort_by: filters?.sort_by ?? 'updated_at',
      sort_order: filters?.sort_order ?? 'desc',
      ...(filters?.search && { search: filters.search }),
    };

    return apiService.get<TemplateListResponse>('/templates/', params);
  }

  /**
   * Download a template PDF file
   *
   * Downloads the PDF file of a template's current version.
   * Returns a Blob object and the suggested filename from the server.
   *
   * @param templateId - The ID of the template to download
   * @returns Promise resolving to Blob and filename
   * @throws Error if download fails or template not found
   *
   * @example
   * ```typescript
   * const { blob, filename } = await templatesService.downloadTemplate(1);
   * // Use with file-download utilities to trigger browser download
   * downloadBlob(blob, filename);
   * ```
   */
  async downloadTemplate(
    templateId: number
  ): Promise<{ blob: Blob; filename: string }> {
    const token = localStorage.getItem('access_token');
    const baseURL =
      import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

    const response = await fetch(
      `${baseURL}/templates/${templateId}/download`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to download template: ${response.status} ${response.statusText}`
      );
    }

    const blob = await response.blob();

    // Extract filename from Content-Disposition header
    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = `template_${templateId}.pdf`;

    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(
        /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
      );
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1].replace(/['"]/g, '');
      }
    }

    return { blob, filename };
  }

  /**
   * Fetch all versions of a specific template
   *
   * Returns version history with full PDF metadata including title, author,
   * subject, page count, and document dates.
   *
   * @param templateId - The ID of the template
   * @param filters - Optional filters for pagination and sorting
   * @returns Promise resolving to paginated list of template versions
   * @throws Error if template not found or API request fails
   *
   * @example
   * ```typescript
   * // Fetch versions with default settings
   * const versions = await templatesService.getTemplateVersions(1);
   *
   * // Fetch with custom sorting
   * const versions = await templatesService.getTemplateVersions(1, {
   *   sort_by: 'version_number',
   *   sort_order: 'asc'
   * });
   * ```
   */
  async getTemplateVersions(
    templateId: number,
    filters?: VersionsFilters
  ): Promise<TemplateVersionListResponse> {
    const params = {
      limit: filters?.limit ?? 20,
      offset: filters?.offset ?? 0,
      sort_by: filters?.sort_by ?? 'created_at',
      sort_order: filters?.sort_order ?? 'desc',
    };

    return apiService.get<TemplateVersionListResponse>(
      `/templates/${templateId}/versions`,
      params
    );
  }

  /**
   * Fetch detailed information about a specific template version by ID
   *
   * Returns complete version metadata along with associated template information
   * in a single response. This is designed for success pages and version detail
   * views where both version and template data are needed together.
   *
   * @param versionId - The unique ID of the version
   * @returns Promise resolving to detailed version information with template context
   * @throws Error if version not found or API request fails
   *
   * @example
   * ```typescript
   * // Fetch version details for success page after ingestion
   * const versionDetail = await templatesService.getVersionById(1);
   * console.log(versionDetail.template.name); // Access template info
   * console.log(versionDetail.file_size_bytes); // Access version-specific data
   * ```
   */
  async getVersionById(versionId: number): Promise<TemplateVersionDetail> {
    return apiService.get<TemplateVersionDetail>(
      `/templates/versions/${versionId}`
    );
  }

  /**
   * Download a template version PDF file
   *
   * Downloads the PDF file for a specific template version (not just current version).
   * This is useful for success pages, version history, and archival purposes.
   * Returns a Blob object and the suggested filename from the server.
   *
   * @param versionId - The ID of the template version to download
   * @returns Promise resolving to Blob and filename
   * @throws Error if download fails or version not found
   *
   * @example
   * ```typescript
   * // Download specific version after creation
   * const { blob, filename } = await templatesService.downloadTemplateVersion(1);
   * downloadBlob(blob, filename);
   * ```
   */
  async downloadTemplateVersion(
    versionId: number
  ): Promise<{ blob: Blob; filename: string }> {
    const token = localStorage.getItem('access_token');
    const baseURL =
      import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

    const response = await fetch(
      `${baseURL}/templates/versions/${versionId}/download`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to download version: ${response.status} ${response.statusText}`
      );
    }

    const blob = await response.blob();

    // Extract filename from Content-Disposition header
    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = `template_version_${versionId}.pdf`;

    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(
        /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
      );
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1].replace(/['"]/g, '');
      }
    }

    return { blob, filename };
  }

  /**
   * Fetch all AcroForm fields from the current version of a template
   *
   * Returns fields with pagination, search, and filtering by page number.
   * Fields are ordered by page_number, then field_page_order.
   *
   * @param templateId - The ID of the template
   * @param filters - Optional filters for pagination, search, and page filter
   * @returns Promise resolving to paginated list of template fields
   * @throws Error if template not found or no current version exists
   *
   * @example
   * ```typescript
   * // Fetch all fields from current version
   * const fields = await templatesService.getCurrentVersionFields(1);
   *
   * // Search for specific fields on page 2
   * const fields = await templatesService.getCurrentVersionFields(1, {
   *   page_number: 2,
   *   search: 'email',
   *   limit: 50
   * });
   * ```
   */
  async getCurrentVersionFields(
    templateId: number,
    filters?: FieldsFilters
  ): Promise<TemplateFieldListResponse> {
    const params = {
      limit: filters?.limit ?? 20,
      offset: filters?.offset ?? 0,
      ...(filters?.page_number && { page_number: filters.page_number }),
      ...(filters?.search && { search: filters.search }),
    };

    return apiService.get<TemplateFieldListResponse>(
      `/templates/${templateId}/fields/current`,
      params
    );
  }

  /**
   * Fetch all AcroForm fields from a specific version of a template
   *
   * Returns fields with pagination, search, and filtering by page number.
   * Useful for historical analysis and version comparison.
   *
   * @param templateId - The ID of the template
   * @param versionId - The ID of the specific version
   * @param filters - Optional filters for pagination, search, and page filter
   * @returns Promise resolving to paginated list of template fields
   * @throws Error if template or version not found
   *
   * @example
   * ```typescript
   * // Fetch all fields from version 5
   * const fields = await templatesService.getVersionFields(1, 5);
   *
   * // Search in specific version
   * const fields = await templatesService.getVersionFields(1, 5, {
   *   search: 'checkbox'
   * });
   * ```
   */
  async getVersionFields(
    templateId: number,
    versionId: number,
    filters?: FieldsFilters
  ): Promise<TemplateFieldListResponse> {
    const params = {
      limit: filters?.limit ?? 20,
      offset: filters?.offset ?? 0,
      ...(filters?.page_number && { page_number: filters.page_number }),
      ...(filters?.search && { search: filters.search }),
    };

    return apiService.get<TemplateFieldListResponse>(
      `/templates/${templateId}/versions/${versionId}/fields`,
      params
    );
  }

  /**
   * Fetch template names for UI selectors (dropdowns, autocomplete)
   *
   * Returns a lightweight list of templates with just ID, name, and
   * current_version. Optimized for use in form selectors and autocomplete
   * components.
   *
   * @param search - Optional search term to filter by template name
   * @param limit - Maximum number of results (default 100, max 500)
   * @param sortBy - Sort field: 'name' or 'created_at' (default 'name')
   * @param sortOrder - Sort order: 'asc' or 'desc' (default 'asc')
   * @returns Promise resolving to list of template names
   * @throws Error if API request fails
   *
   * @example
   * ```typescript
   * // Fetch all template names
   * const names = await templatesService.getTemplateNames();
   *
   * // Search for specific templates
   * const names = await templatesService.getTemplateNames('SEPE', 50);
   * ```
   */
  async getTemplateNames(
    search?: string,
    limit: number = 100,
    sortBy: 'name' | 'created_at' = 'name',
    sortOrder: 'asc' | 'desc' = 'asc'
  ): Promise<TemplateNamesResponse> {
    const params = {
      limit,
      sort_by: sortBy,
      sort_order: sortOrder,
      ...(search && { search }),
    };

    return apiService.get<TemplateNamesResponse>('/templates/names', params);
  }

  /**
   * Ingest a new version of an existing template
   *
   * Creates a new version record by:
   * 1. Uploading and analyzing the PDF file
   * 2. Extracting AcroForm fields
   * 3. Marking the new version as current
   * 4. Updating version history
   *
   * @param request - Version ingestion request data
   * @returns Promise resolving to ingestion response with version_id
   * @throws Error if template not found, file invalid, or ingestion fails
   *
   * @example
   * ```typescript
   * const response = await templatesService.ingestTemplateVersion({
   *   template_id: 10,
   *   version: '2024-Q2',
   *   change_summary: 'Updated fields for new regulations',
   *   sepe_url: 'https://www.sepe.es/formulario-v2',
   *   file: pdfFile
   * });
   *
   * // Navigate to version detail page
   * navigate(`/templates/versions/${response.version_id}`);
   * ```
   */
  async ingestTemplateVersion(
    request: TemplateVersionIngestRequest
  ): Promise<TemplateVersionIngestResponse> {
    // Create FormData for multipart upload
    const formData = new FormData();
    formData.append('file', request.file);
    formData.append('template_id', request.template_id.toString());
    formData.append('version', request.version);

    if (request.change_summary) {
      formData.append('change_summary', request.change_summary);
    }

    if (request.sepe_url) {
      formData.append('sepe_url', request.sepe_url);
    }

    // Use 60 second timeout for PDF ingestion (analysis can take time)
    return apiService.upload<TemplateVersionIngestResponse>(
      '/templates/ingest/version',
      formData,
      { timeout: 60000 } // 60 seconds for PDF analysis and ingestion
    );
  }

  /**
   * Analyze differences between two template versions
   *
   * Performs an in-memory comparison of two template versions using database
   * data (no PDF re-processing). Returns global metrics and detailed field-by-field
   * comparison showing added, removed, and modified fields.
   *
   * This is a fast, efficient operation that compares:
   * - Page counts
   * - Field counts
   * - Field attributes (position, label text, value options)
   * - Field types and metadata
   *
   * @param request - Comparison request with source and target version IDs
   * @returns Promise resolving to detailed comparison result
   * @throws Error if versions not found, same version IDs, or analysis fails
   *
   * @example
   * ```typescript
   * // Compare two versions
   * const result = await templatesService.analyzeComparison({
   *   source_version_id: 1,
   *   target_version_id: 2
   * });
   *
   * // Access global metrics
   * console.log(`${result.global_metrics.fields_added} fields added`);
   * console.log(`${result.global_metrics.modification_percentage}% changed`);
   *
   * // Filter field changes
   * const addedFields = result.field_changes.filter(
   *   field => field.status === 'ADDED'
   * );
   * ```
   */
  async analyzeComparison(
    request: ComparisonRequest
  ): Promise<ComparisonResult> {
    // Validate request - check positive IDs first
    if (request.source_version_id <= 0 || request.target_version_id <= 0) {
      throw new Error('Version IDs must be positive integers');
    }

    if (request.source_version_id === request.target_version_id) {
      throw new Error('Source and target versions must be different');
    }

    try {
      return await apiService.post<ComparisonResult>(
        '/comparisons/analyze',
        { ...request }
      );
    } catch (error) {
      // Enhanced error handling
      if (error instanceof Error) {
        // Re-throw with more context if it's a 404
        if (error.message.includes('404') || error.message.includes('not found')) {
          throw new Error(
            `One or both versions not found. Please verify version IDs exist.`
          );
        }

        // Re-throw with context for other errors
        throw new Error(`Failed to analyze comparison: ${error.message}`);
      }

      // Fallback for non-Error objects
      throw new Error('Failed to analyze comparison due to an unknown error');
    }
  }

  /**
   * Delete a template and all its associated data
   *
   * Permanently deletes a template including:
   * - All versions
   * - All template fields
   * - All comparisons using any version
   * - All physical PDF files
   *
   * **Warning:** This action is irreversible.
   *
   * @param templateId - The ID of the template to delete
   * @returns Promise that resolves when deletion is complete
   * @throws Error if template not found, user lacks permission, or deletion fails
   *
   * @example
   * ```typescript
   * try {
   *   await templatesService.deleteTemplate(10);
   *   console.log('Template deleted successfully');
   * } catch (error) {
   *   console.error('Failed to delete template:', error.message);
   * }
   * ```
   */
  async deleteTemplate(templateId: number): Promise<void> {
    try {
      await apiService.delete(`/templates/${templateId}`);
    } catch (error) {
      if (error instanceof Error) {
        // Handle specific error cases
        if (error.message.includes('403') || error.message.toLowerCase().includes('not authorized')) {
          throw new Error('You do not have permission to delete this template');
        }
        if (error.message.includes('404') || error.message.toLowerCase().includes('not found')) {
          throw new Error('Template not found');
        }
        throw new Error(`Failed to delete template: ${error.message}`);
      }
      throw new Error('Failed to delete template due to an unknown error');
    }
  }

  /**
   * Delete a specific version of a template
   *
   * Deletes a template version including:
   * - Version record
   * - All template fields for that version
   * - All comparisons using that version
   * - Physical PDF file
   *
   * **Business Rule:** Cannot delete the current version (is_current=True).
   * If you need to delete the current version, delete the entire template instead.
   *
   * @param templateId - The ID of the template
   * @param versionId - The ID of the version to delete
   * @returns Promise that resolves when deletion is complete
   * @throws Error if trying to delete current version, not found, lacks permission, or fails
   *
   * @example
   * ```typescript
   * try {
   *   await templatesService.deleteVersion(10, 23);
   *   console.log('Version deleted successfully');
   * } catch (error) {
   *   if (error.message.includes('current version')) {
   *     alert('Cannot delete the current version. Delete the entire template instead.');
   *   }
   * }
   * ```
   */
  async deleteVersion(templateId: number, versionId: number): Promise<void> {
    try {
      await apiService.delete(`/templates/${templateId}/versions/${versionId}`);
    } catch (error) {
      if (error instanceof Error) {
        // Handle specific error cases
        if (error.message.includes('400') || error.message.toLowerCase().includes('current version')) {
          throw new Error('Cannot delete current version. Please delete the entire template instead.');
        }
        if (error.message.includes('403') || error.message.toLowerCase().includes('not authorized')) {
          throw new Error('You do not have permission to delete this version');
        }
        if (error.message.includes('404') || error.message.toLowerCase().includes('not found')) {
          throw new Error('Template or version not found');
        }
        throw new Error(`Failed to delete version: ${error.message}`);
      }
      throw new Error('Failed to delete version due to an unknown error');
    }
  }

  /**
   * Delete a comparison
   *
   * Permanently deletes a comparison including:
   * - Comparison record
   * - All comparison field differences
   *
   * **Note:** This does NOT delete the template versions that were compared.
   *
   * @param comparisonId - The ID of the comparison to delete
   * @returns Promise that resolves when deletion is complete
   * @throws Error if comparison not found, user lacks permission, or deletion fails
   *
   * @example
   * ```typescript
   * try {
   *   await templatesService.deleteComparison(42);
   *   console.log('Comparison deleted successfully');
   * } catch (error) {
   *   console.error('Failed to delete comparison:', error.message);
   * }
   * ```
   */
  async deleteComparison(comparisonId: number): Promise<void> {
    try {
      await apiService.delete(`/comparisons/${comparisonId}`);
    } catch (error) {
      if (error instanceof Error) {
        // Handle specific error cases
        if (error.message.includes('403') || error.message.toLowerCase().includes('not authorized')) {
          throw new Error('You do not have permission to delete this comparison');
        }
        if (error.message.includes('404') || error.message.toLowerCase().includes('not found')) {
          throw new Error('Comparison not found');
        }
        throw new Error(`Failed to delete comparison: ${error.message}`);
      }
      throw new Error('Failed to delete comparison due to an unknown error');
    }
  }
}

// Export singleton instance
export const templatesService = new TemplatesService();

// Export class for testing purposes
export { TemplatesService };

