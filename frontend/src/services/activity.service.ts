/**
 * Activity Service
 *
 * Handles API communication for activity audit system:
 * - Fetching recent system activities
 * - Retrieving activity history with pagination
 */

import type {
    ActivityListResponse,
    GetActivitiesParams
} from '../types/activity.types';
import { apiService } from './apiService';

class ActivityService {
  private readonly basePath = '/activity';

  /**
   * Fetch recent system activities.
   *
   * Retrieves the most recent activities from the system, excluding LOGIN events.
   * Activities include user attribution (email, full name) and are ordered by
   * timestamp descending (most recent first).
   *
   * @param params - Query parameters for filtering
   * @param params.limit - Maximum number of activities to return (1-100, default: 10)
   * @returns Promise resolving to activity list response
   * @throws Error if fetch fails or user is not authenticated
   *
   * @example
   * ```ts
   * // Get last 10 activities
   * const activities = await activityService.getRecentActivities();
   *
   * // Get last 20 activities
   * const activities = await activityService.getRecentActivities({ limit: 20 });
   * ```
   */
  async getRecentActivities(
    params?: GetActivitiesParams
  ): Promise<ActivityListResponse> {
    const queryParams = new URLSearchParams();

    if (params?.limit) {
      queryParams.append('limit', params.limit.toString());
    }

    const queryString = queryParams.toString();
    const url = `${this.basePath}/recent${queryString ? `?${queryString}` : ''}`;

    return apiService.get<ActivityListResponse>(url);
  }

  /**
   * Format a timestamp as relative time (e.g., "2 hours ago").
   *
   * Utility method for displaying human-readable timestamps in the UI.
   *
   * @param timestamp - ISO 8601 timestamp string
   * @returns Human-readable relative time string
   *
   * @example
   * ```ts
   * const relative = activityService.formatRelativeTime('2025-11-02T10:00:00Z');
   * // Returns: "2 hours ago"
   * ```
   */
  formatRelativeTime(timestamp: string): string {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now.getTime() - then.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffSecs < 60) {
      return 'just now';
    } else if (diffMins < 60) {
      return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    } else if (diffWeeks < 4) {
      return `${diffWeeks} ${diffWeeks === 1 ? 'week' : 'weeks'} ago`;
    } else if (diffMonths < 12) {
      return `${diffMonths} ${diffMonths === 1 ? 'month' : 'months'} ago`;
    } else {
      return `${diffYears} ${diffYears === 1 ? 'year' : 'years'} ago`;
    }
  }

  /**
   * Get the color class for an activity type.
   *
   * Returns the appropriate Tailwind CSS color class for visual indicators.
   *
   * @param activityType - Type of activity
   * @returns Tailwind CSS background color class
   *
   * @example
   * ```ts
   * const color = activityService.getActivityColor('TEMPLATE_SAVED');
   * // Returns: "bg-green-500"
   * ```
   */
  getActivityColor(activityType: string): string {
    const colorMap: Record<string, string> = {
      LOGIN: 'bg-gray-500',
      NEW_USER: 'bg-yellow-500',
      TEMPLATE_ANALYSIS: 'bg-purple-500',
      TEMPLATE_SAVED: 'bg-green-500',
      VERSION_SAVED: 'bg-green-500',
      COMPARISON_ANALYSIS: 'bg-blue-500',
      COMPARISON_SAVED: 'bg-blue-500',
    };

    return colorMap[activityType] || 'bg-gray-500';
  }
}

// Export singleton instance
export const activityService = new ActivityService();
export default activityService;

