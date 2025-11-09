/**
 * Metrics Service
 *
 * Handles API communication for dashboard metrics:
 * - Fetching templates summary (total templates and versions)
 * - Retrieving comparisons count
 * - Getting monthly activity count (excluding LOGIN events)
 */

import type {
    ComparisonsCount,
    DashboardMetrics,
    MonthlyActivity,
    TemplatesSummary
} from '../types/metrics.types';
import { apiService } from './apiService';

class MetricsService {
  private readonly basePath = '/metrics';

  /**
   * Fetch templates summary.
   *
   * Retrieves the count of unique templates and total versions across
   * all templates in the system.
   *
   * @returns Promise resolving to templates summary
   * @throws Error if fetch fails or user is not authenticated
   *
   * @example
   * ```ts
   * const summary = await metricsService.getTemplatesSummary();
   * console.log(`${summary.total_versions} versions of ${summary.total_templates} templates`);
   * ```
   */
  async getTemplatesSummary(): Promise<TemplatesSummary> {
    return apiService.get<TemplatesSummary>(
      `${this.basePath}/templates/summary`
    );
  }

  /**
   * Fetch comparisons count.
   *
   * Retrieves the total number of saved comparisons in the system.
   *
   * @returns Promise resolving to comparisons count
   * @throws Error if fetch fails or user is not authenticated
   *
   * @example
   * ```ts
   * const count = await metricsService.getComparisonsCount();
   * console.log(`${count.total_comparisons} comparisons saved`);
   * ```
   */
  async getComparisonsCount(): Promise<ComparisonsCount> {
    return apiService.get<ComparisonsCount>(
      `${this.basePath}/comparisons/count`
    );
  }

  /**
   * Fetch monthly activity count.
   *
   * Retrieves the number of activities logged in the current calendar month,
   * excluding LOGIN events. Also returns the current month identifier.
   *
   * @returns Promise resolving to monthly activity data
   * @throws Error if fetch fails or user is not authenticated
   *
   * @example
   * ```ts
   * const activity = await metricsService.getMonthlyActivity();
   * console.log(`${activity.activities_this_month} activities in ${activity.month}`);
   * ```
   *
   * @remarks
   * LOGIN activities are excluded from the count to show only meaningful
   * user actions in the dashboard.
   */
  async getMonthlyActivity(): Promise<MonthlyActivity> {
    return apiService.get<MonthlyActivity>(
      `${this.basePath}/activity/monthly`
    );
  }

  /**
   * Fetch all dashboard metrics at once.
   *
   * Convenience method to fetch all metrics in parallel using Promise.all.
   * This is more efficient than making three sequential requests.
   *
   * @returns Promise resolving to combined dashboard metrics
   * @throws Error if any fetch fails or user is not authenticated
   *
   * @example
   * ```ts
   * const metrics = await metricsService.getAllMetrics();
   * console.log('Templates:', metrics.templates);
   * console.log('Comparisons:', metrics.comparisons);
   * console.log('Activity:', metrics.activity);
   * ```
   */
  async getAllMetrics(): Promise<DashboardMetrics> {
    const [templates, comparisons, activity] = await Promise.all([
      this.getTemplatesSummary(),
      this.getComparisonsCount(),
      this.getMonthlyActivity()
    ]);

    return {
      templates,
      comparisons,
      activity
    };
  }
}

// Export singleton instance
export const metricsService = new MetricsService();
export default metricsService;

