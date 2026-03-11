# Spec Requirements Document

> Spec: Activity Audit System  
> Created: 2025-11-02

## Overview

Implement a comprehensive activity audit system that tracks and displays user actions across the platform, replacing the mock data in the HomePage with real database-backed activity logs. This feature will provide transparency, improve system traceability, and enable users to review recent operations performed on templates and comparisons.

## User Stories

### Audit Trail Visibility

As a **system administrator**, I want to see a comprehensive log of all user activities, so that I can monitor system usage, debug issues, and maintain accountability for template and comparison operations.

The system will automatically log key events (template uploads, comparison analyses, version creations) with timestamps, user information, and entity references. Admins can review this activity feed to understand workflow patterns and troubleshoot problems.

### Recent Activity Dashboard

As a **regular user**, I want to see my recent activities on the homepage dashboard, so that I can quickly understand what operations have been performed recently and navigate back to relevant templates or comparisons.

The homepage will display the last 10 activities (excluding login events) with human-readable descriptions, timestamps, and visual indicators. Users can see at a glance what templates were uploaded, which comparisons were saved, and when these events occurred.

### System-Wide Activity Monitoring

As a **team member**, I want to see activity across all users in the system, so that I can stay informed about team workflows and collaborate effectively on template management.

The activity feed will show operations from all users with proper attribution (user email/name), enabling team coordination and awareness of ongoing work.

## Spec Scope

1. **Database Schema** - Create new `activity` table with fields for tracking user actions, timestamps, activity types, descriptions, and entity references.

2. **Activity Logging Service** - Implement `ActivityService` with methods to log activities and query recent events with filtering capabilities.

3. **Endpoint Integration** - Modify existing endpoints (auth, template, comparison) to automatically log activities after successful operations.

4. **API Query Endpoint** - Create `GET /api/v1/activity/recent` endpoint to fetch recent activities with pagination and filtering (excluding LOGIN events).

5. **Frontend Integration** - Update HomePage component to consume real activity data from the API and display it with proper formatting and timestamps.

## Out of Scope

- Advanced activity filtering by date range or activity type in the UI
- Activity search functionality
- Activity export/reporting features
- Activity retention policies and archiving
- Detailed audit logs with before/after state comparison
- Activity notifications or alerts
- User-specific activity filtering in the UI (shows all users)
- Activity pagination controls in the UI (fixed limit of 10)

## Expected Deliverable

1. Users can view the last 10 system activities on the homepage dashboard with accurate timestamps and descriptions.

2. All critical operations (template upload/analysis, comparison save, user registration) are automatically logged to the database with proper user attribution.

3. The activity feed excludes LOGIN events and displays human-readable descriptions for each activity type.
