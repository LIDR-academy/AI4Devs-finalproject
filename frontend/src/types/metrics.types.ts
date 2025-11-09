/**
 * TypeScript types for dashboard metrics.
 *
 * These types match the backend Pydantic schemas for system metrics
 * including templates summary, comparisons count, and monthly activity.
 */

/**
 * Templates summary response.
 *
 * Provides counts of unique templates and total versions across
 * all templates for dashboard display.
 */
export interface TemplatesSummary {
  /** Number of unique templates in the system */
  total_templates: number;
  /** Total number of versions across all templates */
  total_versions: number;
}

/**
 * Comparisons count response.
 *
 * Provides the total number of template comparisons that have
 * been saved in the system.
 */
export interface ComparisonsCount {
  /** Total number of saved comparisons in the system */
  total_comparisons: number;
}

/**
 * Monthly activity response.
 *
 * Provides the number of activities logged in the current calendar month
 * (excluding LOGIN events) along with the month identifier.
 */
export interface MonthlyActivity {
  /** Number of activities in current calendar month (excluding LOGIN) */
  activities_this_month: number;
  /** Current month in YYYY-MM format */
  month: string;
}

/**
 * Combined dashboard metrics response.
 *
 * Convenience type for fetching all metrics at once.
 */
export interface DashboardMetrics {
  templates: TemplatesSummary;
  comparisons: ComparisonsCount;
  activity: MonthlyActivity;
}

