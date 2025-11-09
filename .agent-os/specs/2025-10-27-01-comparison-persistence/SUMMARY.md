# Comparison Persistence Feature - Executive Summary

## 📋 Overview

Complete specification for implementing a persistence layer that saves comparison analysis results to the database, enabling users to maintain a historical record of template version comparisons, view saved comparisons in a list, and retrieve detailed comparison data without re-running the analysis.

## 📁 Specification Documents

1. **[spec.md](./spec.md)** - Main specification with user stories, scope, and deliverables
2. **[spec-lite.md](./spec-lite.md)** - One-paragraph feature summary
3. **[sub-specs/technical-spec.md](./sub-specs/technical-spec.md)** - Detailed technical implementation guide
4. **[sub-specs/database-schema.md](./sub-specs/database-schema.md)** - Complete database migration specification
5. **[sub-specs/api-spec.md](./sub-specs/api-spec.md)** - API endpoint documentation with examples
6. **[README.md](./README.md)** - Navigation guide and implementation checklist

## 🎯 Key Features

### Backend

- **Database Schema Migration:** Critical changes to `comparisons` and `comparison_fields` tables
  - Change FKs from templates to template versions
  - Add global metrics columns
  - Add complete field change data columns
- **New API Endpoint:** `POST /api/v1/comparisons/ingest` - Save comparison results
- **New API Endpoint:** `GET /api/v1/comparisons/{id}` - Retrieve saved comparison
- **New API Endpoint:** `GET /api/v1/comparisons` - List saved comparisons with pagination
- **New API Endpoint:** `GET /api/v1/comparisons/check` - Check if comparison exists
- **Service Layer Extensions:** Methods for save, retrieve, and list operations
- **Transactional Integrity:** Atomic save of parent and child records

### Frontend

- **Save Comparison Button:** New component to save analysis results
- **Comparisons List Page:** Browse all saved comparisons with pagination, sorting, and search
- **Saved Comparison Detail Page:** View full comparison data using existing visualization components
- **Component Reuse:** Leverage existing GlobalMetricsCard and ComparisonTable components
- **Seamless Integration:** Natural workflow from analysis to save to retrieval

## 🏗️ Architecture

### Backend Stack

- **Framework:** FastAPI
- **ORM:** SQLAlchemy
- **Validation:** Pydantic v2
- **Database:** PostgreSQL with JSONB support
- **Migration:** Alembic

### Frontend Stack

- **Framework:** React with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Routing:** React Router
- **HTTP Client:** Axios

## 📊 Data Flow

```
User Performs Comparison (existing /analyze endpoint)
        ↓
Results Displayed with "Save Comparison" Button
        ↓
User Clicks Save
        ↓
POST /api/v1/comparisons/ingest
        ↓
ComparisonService.save_comparison()
        ↓
INSERT into comparisons table (with global metrics)
        ↓
INSERT into comparison_fields table (bulk insert)
        ↓
COMMIT transaction
        ↓
Return comparison ID
        ↓
Frontend shows success message with link
        ↓
User can navigate to /comparisons (list) or /comparisons/{id} (detail)
        ↓
GET endpoints retrieve data from database
        ↓
Display using existing visualization components
```

## 🔑 Key Schemas

### Database Schema Changes

**comparisons table:**

```sql
-- CRITICAL: Foreign key changes
source_version_id INTEGER REFERENCES template_versions(id)  -- was source_template_id
target_version_id INTEGER REFERENCES template_versions(id)  -- was target_template_id

-- NEW: Global metrics columns
modification_percentage FLOAT NOT NULL DEFAULT 0.0
fields_added INTEGER NOT NULL DEFAULT 0
fields_removed INTEGER NOT NULL DEFAULT 0
fields_modified INTEGER NOT NULL DEFAULT 0
fields_unchanged INTEGER NOT NULL DEFAULT 0
```

**comparison_fields table:**

```sql
-- NEW: Complete field change data
field_id VARCHAR(255) NOT NULL
status VARCHAR(20) NOT NULL  -- ADDED, REMOVED, MODIFIED, UNCHANGED
source_page_number INTEGER
target_page_number INTEGER
page_number_changed BOOLEAN NOT NULL DEFAULT false
near_text_diff VARCHAR(20)
source_near_text TEXT
target_near_text TEXT
value_options_diff VARCHAR(20)
source_value_options JSONB
target_value_options JSONB
position_change VARCHAR(20)
source_position JSONB
target_position JSONB
```

### API Request/Response

**Save Comparison (POST /ingest):**

```typescript
Request: {
  source_version_id: number,
  target_version_id: number,
  global_metrics: GlobalMetrics,
  field_changes: FieldChange[]
}

Response: {
  id: number,
  message: string,
  created_at: string
}
```

**List Comparisons (GET /comparisons):**

```typescript
Response: {
  items: ComparisonSummary[],
  total: number,
  page: number,
  page_size: number,
  total_pages: number
}
```

**Get Comparison (GET /comparisons/{id}):**

```typescript
Response: ComparisonResult; // Same format as /analyze endpoint
```

## 📝 Task Breakdown

### Phase 1: Database Migration (0.5 day)

1. Create Alembic migration file
2. Test upgrade/downgrade in staging
3. Verify indexes and constraints
4. Apply to development database

### Phase 2: Backend Implementation (2-3 days)

1. Create Pydantic schemas (5 new schemas)
2. Implement service layer methods (4 methods)
3. Create API endpoints (4 endpoints)
4. Add OpenAPI documentation
5. Write comprehensive tests (20+ test cases)

### Phase 3: Frontend Implementation (2-3 days)

1. Add TypeScript types (3 new types)
2. Create SaveComparisonButton component
3. Create ComparisonsPage component
4. Create SavedComparisonPage component
5. Implement API service methods (4 methods)
6. Add routing and navigation
7. Write component tests (15+ test cases)

### Phase 4: Integration & Polish (1-2 days)

1. Test end-to-end workflow
2. Fix linter errors
3. Verify responsive design
4. Verify dark mode support
5. Verify accessibility (WCAG compliance)
6. Performance testing

### Phase 5: Documentation (0.5 day)

1. Complete API documentation in Swagger UI
2. Update user documentation
3. Create deployment guide

**Total Estimate:** 6-9 days (~1.5-2 weeks)

## ✅ Acceptance Criteria

### Backend

- ✅ Database migration runs successfully without errors
- ✅ Foreign keys correctly reference template_versions table
- ✅ All new columns have appropriate types and constraints
- ✅ Save operation is atomic (transaction rolls back on error)
- ✅ API returns 201 on successful save with comparison ID
- ✅ Retrieve endpoint returns data in same format as analyze endpoint
- ✅ List endpoint supports pagination, sorting, and filtering
- ✅ All endpoints have comprehensive error handling
- ✅ OpenAPI documentation complete with examples
- ✅ 90%+ test coverage for new code

### Frontend

- ✅ Save button displays after comparison analysis
- ✅ Save button shows loading state during save
- ✅ Success message shows with link to saved comparison
- ✅ List page displays all saved comparisons in table
- ✅ Table supports sorting by date and modification %
- ✅ Search filters by template name
- ✅ Pagination works correctly
- ✅ Detail page displays full comparison data
- ✅ Detail page reuses existing visualization components
- ✅ Responsive design works on mobile, tablet, desktop
- ✅ Dark mode supported throughout
- ✅ Accessibility compliant (WCAG 2.1 AA)

## 🎨 UI Components

### 1. Save Comparison Button

- **Location:** Below GlobalMetricsCard on comparison results page
- **States:** Default, Loading, Success, Error
- **Actions:** Calls POST /ingest endpoint
- **Feedback:** Success toast with link to saved comparison

### 2. Comparisons List Page (`/comparisons`)

- **Header:** Title, subtitle, "New Comparison" button
- **Search Bar:** Debounced search by template name
- **Table Columns:**
  - Source/Target Version
  - Modification %
  - Changes Summary (+X/-Y/~Z)
  - Date Saved
  - Actions (View button)
- **Pagination:** Previous/Next, page numbers, items per page
- **Empty State:** "No comparisons saved yet" with CTA

### 3. Saved Comparison Detail Page (`/comparisons/{id}`)

- **Header:** Breadcrumb, version info, date saved
- **Content:** GlobalMetricsCard + ComparisonTable (reused components)
- **Actions:** "View in New Analysis" button (pre-fills form)
- **Error Handling:** 404 page if comparison not found

## 🔒 Security & Performance

### Security

- Authentication required for all endpoints (JWT)
- User attribution (created_by field)
- Input validation with Pydantic
- SQL injection prevention via ORM
- Rate limiting on all endpoints

### Performance

- Database indexes on FK columns and frequently queried fields
- JSONB for flexible storage with PostgreSQL optimization
- Eager loading to prevent N+1 queries
- Pagination to limit result sets
- Caching for immutable comparison data (5 min TTL)

**Performance Targets:**

- Save comparison: < 500ms (p95)
- Get comparison: < 200ms (p95)
- List comparisons: < 300ms (p95)

## 📚 Dependencies

### No New External Dependencies Required

All necessary libraries are part of the existing tech stack:

- Backend: FastAPI, SQLAlchemy, Alembic, Pydantic
- Frontend: React, React Router, Axios, Tailwind CSS

### Optional Enhancements

- React Query or SWR for improved data fetching and caching (recommended)
- date-fns for date formatting (lightweight alternative)

## 🚀 Getting Started

1. **Read [spec.md](./spec.md)** for complete requirements and user stories
2. **Review [database-schema.md](./sub-specs/database-schema.md)** for migration details
3. **Check [api-spec.md](./sub-specs/api-spec.md)** for API contract
4. **Read [technical-spec.md](./sub-specs/technical-spec.md)** for implementation guide
5. **Follow [README.md](./README.md)** implementation checklist

## 📞 Questions?

For clarifications or discussions about this specification, please refer to:

- **Database changes:** `database-schema.md`
- **API contract:** `api-spec.md`
- **Technical implementation:** `technical-spec.md`
- **User workflows:** `spec.md`

---

**Specification Version:** 1.0  
**Created:** 2025-10-27  
**Status:** Ready for Implementation  
**Feature:** Comparison Persistence and History Management
