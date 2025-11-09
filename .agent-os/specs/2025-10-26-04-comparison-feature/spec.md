# Template Comparison Feature Specification

**Feature Name:** Template Comparison Analysis  
**Version:** 1.0  
**Date:** 2025-10-26  
**Status:** Draft

## Overview

Implement a complete template comparison system that allows users to compare two versions of templates and visualize the differences field-by-field. The comparison will be performed entirely in-memory using data from the database (no PDF re-processing).

## User Stories

### Epic: Template Version Comparison

**As a** SEPE administrator  
**I want to** compare two versions of a template side-by-side  
**So that** I can understand what fields have been added, removed, or modified between versions

**Acceptance Criteria:**

- User can select two template versions to compare
- System prevents comparison of identical versions
- User sees global metrics (page count, field count, % modified)
- User sees detailed field-by-field comparison
- User can filter comparison results by change type (Added/Removed/Modified)
- Results show differences in field properties (position, label, options)

## Scope

### In Scope

1. Backend comparison service using database data only
2. API endpoint for comparison analysis
3. Frontend form to select versions for comparison
4. Frontend visualization of comparison results
5. Global metrics display
6. Detailed field changes table with filters
7. Validation to prevent comparing identical versions

### Out of Scope

- Comparison persistence (saving comparison results)
- PDF visual diff overlay
- Comparison history
- Comparison sharing/export
- Email notifications
- Bulk comparisons

## Expected Deliverables

1. **Backend API Endpoint:** `POST /api/v1/comparisons/analyze`
2. **Pydantic Schemas:** `ComparisonRequest`, `ComparisonResult`, `GlobalMetrics`, `FieldChange`
3. **Comparison Service:** `ComparisonService` with in-memory diff logic
4. **Frontend Component:** Enhanced `CreateComparisonPage.tsx`
5. **UI Components:** Version selectors, metrics cards, comparison table with filters
6. **Comprehensive Tests:** Unit tests for service logic and endpoint
7. **API Documentation:** OpenAPI specs with examples

## Success Metrics

- Users can successfully compare any two template versions
- Comparison executes in < 2 seconds for templates with up to 100 fields
- UI clearly shows all field differences
- Zero false positives in change detection
- 100% test coverage for comparison logic
