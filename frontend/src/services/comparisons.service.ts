/**
 * Comparisons Service
 *
 * Handles API communication for comparison persistence features:
 * - Saving comparison results
 * - Retrieving saved comparisons
 * - Listing comparisons with pagination
 * - Checking for duplicate comparisons
 */

import type {
    ComparisonCheckResponse,
    ComparisonListResponse,
    ComparisonResult,
    ListComparisonsParams,
    SaveComparisonResponse,
} from '../types/comparison.types';
import { apiService } from './apiService';

class ComparisonsService {
  private readonly basePath = '/comparisons';

  /**
   * Save a comparison result to the database.
   *
   * @param comparisonResult - Complete comparison data from analyze endpoint
   * @returns Promise resolving to save response with comparison ID
   * @throws Error if save fails or user is not authenticated
   *
   * @example
   * ```ts
   * const response = await comparisonsService.saveComparison(comparisonResult);
   * console.log(`Saved with ID: ${response.comparison_id}`);
   * ```
   */
  async saveComparison(
    comparisonResult: ComparisonResult
  ): Promise<SaveComparisonResponse> {
    return apiService.post<SaveComparisonResponse>(
      `${this.basePath}/ingest`,
      comparisonResult as unknown as Record<string, unknown>
    );
  }

  /**
   * Retrieve a saved comparison by ID.
   *
   * Returns the complete comparison data including global metrics and all
   * field changes, in the same format as the `/analyze` endpoint.
   *
   * @param comparisonId - ID of the saved comparison
   * @returns Promise resolving to complete comparison data
   * @throws Error if comparison not found (404) or user not authenticated
   *
   * @example
   * ```ts
   * const comparison = await comparisonsService.getComparison(42);
   * console.log(`Modification: ${comparison.global_metrics.modification_percentage}%`);
   * ```
   */
  async getComparison(comparisonId: number): Promise<ComparisonResult> {
    return apiService.get<ComparisonResult>(
      `${this.basePath}/${comparisonId}`
    );
  }

  /**
   * List saved comparisons with pagination, sorting, and search.
   *
   * Returns a paginated list of comparison summaries without field details
   * for efficient browsing of comparison history.
   *
   * @param params - Optional pagination, sorting, and search parameters
   * @returns Promise resolving to paginated list with metadata
   * @throws Error if request fails or user not authenticated
   *
   * @example
   * ```ts
   * // Get first page with default settings
   * const response = await comparisonsService.listComparisons();
   *
   * // Get second page, sorted by modification percentage
   * const response = await comparisonsService.listComparisons({
   *   page: 2,
   *   page_size: 50,
   *   sort_by: 'modification_percentage',
   *   sort_order: 'desc'
   * });
   *
   * // Search for comparisons
   * const response = await comparisonsService.listComparisons({
   *   search: 'Solicitud Prestación'
   * });
   * ```
   */
  async listComparisons(
    params?: ListComparisonsParams
  ): Promise<ComparisonListResponse> {
    return apiService.get<ComparisonListResponse>(
      this.basePath,
      params as unknown as Record<string, unknown>
    );
  }

  /**
   * Check if a comparison already exists between two versions.
   *
   * Performs a bidirectional check (finds comparison regardless of which
   * version is source or target). Useful for preventing duplicate saves
   * and showing "Already compared" messages in the UI.
   *
   * @param sourceVersionId - Source template version ID
   * @param targetVersionId - Target template version ID
   * @returns Promise resolving to existence status and comparison ID if found
   * @throws Error if request fails or user not authenticated
   *
   * @example
   * ```ts
   * const response = await comparisonsService.checkComparisonExists(1, 2);
   * if (response.exists) {
   *   console.log(`Comparison already exists with ID: ${response.comparison_id}`);
   * } else {
   *   console.log('No existing comparison found');
   * }
   * ```
   */
  async checkComparisonExists(
    sourceVersionId: number,
    targetVersionId: number
  ): Promise<ComparisonCheckResponse> {
    return apiService.get<ComparisonCheckResponse>(
      `${this.basePath}/check`,
      {
        source_version_id: sourceVersionId,
        target_version_id: targetVersionId,
      }
    );
  }
}

// Export singleton instance
export const comparisonsService = new ComparisonsService();

