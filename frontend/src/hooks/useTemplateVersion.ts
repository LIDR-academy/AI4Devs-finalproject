/**
 * Custom Hook for Template Version Detail
 *
 * Manages state and data fetching for a single template version with:
 * - Automatic data fetching based on versionId
 * - Loading and error states
 * - Manual refetch capability
 * - TypeScript type safety
 *
 * Designed for success pages and version detail views where we need
 * both version and template information in one response.
 *
 * @author AI4Devs
 * @date 2025-10-26
 */

import { useCallback, useEffect, useState } from 'react';
import { templatesService } from '../services/templates.service';
import type { TemplateVersionDetail } from '../types/templates.types';

/**
 * Return type for useTemplateVersion hook
 */
export interface UseTemplateVersionReturn {
  // Data
  data: TemplateVersionDetail | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  refetch: () => Promise<void>;
}

/**
 * Custom hook for fetching template version details by ID
 *
 * @param versionId - The ID of the version to fetch (undefined to skip fetching)
 * @returns Version data, loading state, error state, and refetch function
 *
 * @example
 * ```typescript
 * function TemplateCreatedPage() {
 *   const { versionId } = useParams<{ versionId: string }>();
 *   const { data, isLoading, error, refetch } = useTemplateVersion(
 *     versionId ? Number(versionId) : undefined
 *   );
 *
 *   if (isLoading) return <Loader />;
 *   if (error) return <Error message={error} onRetry={refetch} />;
 *   if (!data) return <NotFound />;
 *
 *   return (
 *     <div>
 *       <h1>{data.template.name}</h1>
 *       <p>Version: {data.version_number}</p>
 *       <p>Fields: {data.field_count}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export const useTemplateVersion = (
  versionId: number | undefined
): UseTemplateVersionReturn => {
  const [data, setData] = useState<TemplateVersionDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch version data from API
   */
  const fetchVersion = useCallback(async () => {
    if (!versionId) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await templatesService.getVersionById(versionId);
      setData(response);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch version details';
      setError(errorMessage);
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [versionId]);

  /**
   * Manual refetch function
   */
  const refetch = useCallback(async () => {
    await fetchVersion();
  }, [fetchVersion]);

  /**
   * Auto-fetch on mount and when versionId changes
   */
  useEffect(() => {
    fetchVersion();
  }, [fetchVersion]);

  return {
    data,
    isLoading,
    error,
    refetch,
  };
};

