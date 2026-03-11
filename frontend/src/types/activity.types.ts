/**
 * TypeScript types for activity audit system.
 *
 * These types match the backend Pydantic schemas for activity logging
 * and recent activity retrieval.
 */

/**
 * Type of activity performed in the system.
 *
 * Enum values correspond to ActivityType enum in backend.
 */
export type ActivityType =
  | 'LOGIN'
  | 'NEW_USER'
  | 'TEMPLATE_ANALYSIS'
  | 'TEMPLATE_SAVED'
  | 'VERSION_SAVED'
  | 'COMPARISON_ANALYSIS'
  | 'COMPARISON_SAVED'
  | 'TEMPLATE_DELETED'
  | 'VERSION_DELETED'
  | 'COMPARISON_DELETED';

/**
 * Individual activity record with user attribution.
 *
 * Represents a single logged action in the system with complete
 * metadata including timestamp, user information, and entity references.
 */
export interface Activity {
  /** Unique activity identifier */
  id: number;
  /** When the activity occurred (ISO 8601 timestamp) */
  timestamp: string;
  /** ID of user who performed the action (null for system activities) */
  user_id: number | null;
  /** Email of the user (from users table JOIN) */
  user_email: string | null;
  /** Full name of the user (from users table JOIN) */
  user_full_name: string | null;
  /** Type of activity performed */
  activity_type: ActivityType;
  /** Human-readable description of the activity */
  description: string;
  /** Optional reference to related entity (template ID, comparison ID, etc.) */
  entity_id: number | null;
}

/**
 * Response from GET /api/v1/activity/recent endpoint.
 *
 * Contains a list of recent activities and total count for pagination.
 */
export interface ActivityListResponse {
  /** Array of activity records */
  items: Activity[];
  /** Total number of activities (for pagination) */
  total: number;
}

/**
 * Parameters for fetching recent activities.
 */
export interface GetActivitiesParams {
  /** Maximum number of activities to return (1-100) */
  limit?: number;
}

/**
 * Activity type color mapping for UI indicators.
 *
 * Maps each activity type to a Tailwind CSS color class.
 */
export const ACTIVITY_COLORS: Record<ActivityType, string> = {
  LOGIN: 'bg-gray-500',
  NEW_USER: 'bg-yellow-500',
  TEMPLATE_ANALYSIS: 'bg-purple-500',
  TEMPLATE_SAVED: 'bg-green-500',
  VERSION_SAVED: 'bg-green-500',
  COMPARISON_ANALYSIS: 'bg-blue-500',
  COMPARISON_SAVED: 'bg-blue-500',
  TEMPLATE_DELETED: 'bg-red-500',
  VERSION_DELETED: 'bg-red-500',
  COMPARISON_DELETED: 'bg-red-500',
};

/**
 * Activity type display labels.
 *
 * Human-readable labels for each activity type.
 */
export const ACTIVITY_LABELS: Record<ActivityType, string> = {
  LOGIN: 'Login',
  NEW_USER: 'New User',
  TEMPLATE_ANALYSIS: 'Template Analysis',
  TEMPLATE_SAVED: 'Template Saved',
  VERSION_SAVED: 'Version Saved',
  COMPARISON_ANALYSIS: 'Comparison Analysis',
  COMPARISON_SAVED: 'Comparison Saved',
  TEMPLATE_DELETED: 'Template Deleted',
  VERSION_DELETED: 'Version Deleted',
  COMPARISON_DELETED: 'Comparison Deleted',
};

