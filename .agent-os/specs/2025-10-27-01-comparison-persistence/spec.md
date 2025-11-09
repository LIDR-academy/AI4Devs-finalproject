# Spec Requirements Document

> Spec: Comparison Persistence and History Management
> Created: 2025-10-27

## Overview

Implement a complete persistence layer for comparison results, enabling users to save, list, and retrieve template version comparisons for future reference and audit trails. This feature transforms the existing transient comparison analysis into a persistent history system that allows tracking changes over time, reducing redundant comparisons, and maintaining a comprehensive audit log of template evolution.

## User Stories

### Story 1: Save Comparison Results

As a SEPE administrator, I want to save comparison results after analyzing two template versions, so that I can reference them later without rerunning the analysis and maintain a historical record of template changes.

**Workflow:**

1. User performs a comparison between two template versions using the existing `/analyze` endpoint
2. System displays the comparison results (global metrics and field changes)
3. User clicks "Save Comparison" button
4. System persists the complete comparison payload to the database
5. User receives confirmation that the comparison was saved
6. User can optionally navigate to view all saved comparisons

**Problem Solved:** Prevents data loss of valuable analysis results and eliminates the need to repeatedly analyze the same version pairs.

### Story 2: View Comparison History

As a SEPE administrator, I want to view a list of all previously saved comparisons, so that I can track the history of template changes, identify when specific modifications were detected, and quickly access past analysis results.

**Workflow:**

1. User navigates to the Comparisons page (`/comparisons`)
2. System displays a paginated table of all saved comparisons
3. Each row shows: source/target versions, date saved, modification percentage, fields added/removed/modified
4. User can sort by date, modification percentage, or version numbers
5. User can search/filter comparisons by template name or version
6. User clicks on a comparison row to view detailed results

**Problem Solved:** Provides visibility into template evolution timeline and enables quick access to historical comparison data for documentation and decision-making.

### Story 3: View Saved Comparison Details

As a SEPE administrator, I want to view the complete details of a previously saved comparison, so that I can review the exact field-level changes that were detected without rerunning the analysis.

**Workflow:**

1. User selects a saved comparison from the list
2. System retrieves the persisted comparison data from the database
3. System displays the results using the existing comparison visualization components (GlobalMetricsCard and ComparisonTable)
4. User can filter, sort, and explore field changes exactly as they did when the comparison was first run
5. User can compare multiple saved comparisons side-by-side (future enhancement)

**Problem Solved:** Enables efficient retrieval and review of past comparisons without computational overhead of re-analysis.

## Spec Scope

1. **Database Schema Migration** - Modify `comparisons` table to reference template versions (not templates) and add global metrics columns; extend `comparison_fields` table to store complete field change data.

2. **Backend Persistence API** - Create POST `/api/v1/comparisons/ingest` endpoint to save complete comparison results with transactional integrity ensuring both parent and child records are saved atomically.

3. **Backend Retrieval API** - Create GET `/api/v1/comparisons/{comparison_id}` endpoint to retrieve saved comparisons and GET `/api/v1/comparisons` endpoint to list all saved comparisons with pagination, filtering, and sorting.

4. **Frontend Save Functionality** - Add "Save Comparison" button to comparison results page that calls the persistence endpoint and provides user feedback on success/failure.

5. **Frontend Comparisons List Page** - Implement `/comparisons` page with a table listing all saved comparisons, including search, filter, sort, and pagination capabilities.

6. **Frontend Comparison Detail Page** - Create `/comparisons/{id}` route that fetches and displays saved comparison details using existing visualization components.

## Out of Scope

- Comparison naming/tagging (comparisons are identified by version numbers and timestamp)
- Comparison editing or modification after saving
- Comparison deletion (can be added in future if needed)
- Exporting comparisons to PDF/Excel/CSV
- Sharing comparisons via email or links
- Comparing more than two versions simultaneously
- Bulk comparison operations
- Scheduled/automated comparisons
- Comparison notifications or alerts
- Comparison annotations or comments

## Expected Deliverable

1. **Database Migration Applied** - Alembic migration successfully modifies `comparisons` and `comparison_fields` tables with correct foreign keys, columns, and indexes; migration is reversible and tested.

2. **Working Persistence Flow** - User can analyze two template versions, save the comparison via the "Save Comparison" button, and receive confirmation that the data was persisted correctly to the database.

3. **Functional Comparisons List** - User can navigate to `/comparisons` page and see a paginated table of all saved comparisons with working sort, filter, and search functionality; clicking a row navigates to the detail page.

4. **Complete Detail View** - User can view a saved comparison at `/comparisons/{id}` with all global metrics and field changes displayed using the existing visualization components; data matches the original analysis results.

5. **API Documentation Complete** - All new endpoints have comprehensive OpenAPI documentation with request/response examples, error scenarios, and authentication requirements visible in Swagger UI.

6. **Tests Passing** - Unit tests for service layer methods, integration tests for API endpoints, and component tests for frontend functionality all pass with >90% code coverage for new code.
