# Comparison Persistence Feature - Complete Specification

## 🎯 Quick Start

This specification defines the complete implementation for persisting comparison results, enabling users to save analysis data, view comparison history, and retrieve saved comparisons.

## 📖 Documentation Structure

```
2025-10-27-01-comparison-persistence/
├── README.md                        ← You are here
├── spec.md                          ← Main requirements document
├── spec-lite.md                     ← One-paragraph summary
└── sub-specs/
    ├── technical-spec.md            ← Detailed implementation guide
    ├── database-schema.md           ← Database migration specification
    └── api-spec.md                  ← Complete API documentation
```

## 🚀 Implementation Path

### 1. **Start Here:** [spec.md](./spec.md)

Read the main specification to understand:

- User stories and workflows
- Feature scope (what's included/excluded)
- Expected deliverables
- Success criteria

### 2. **Database Changes:** [database-schema.md](./sub-specs/database-schema.md)

Review the database migration that:

- Changes FKs from `pdf_templates` to `template_versions`
- Adds global metrics columns to `comparisons` table
- Extends `comparison_fields` to store complete field change data
- Includes complete Alembic migration code

### 3. **Backend Implementation:** [technical-spec.md](./sub-specs/technical-spec.md)

Follow the detailed backend architecture:

- Pydantic schemas (ComparisonSummary, ComparisonListResponse)
- Service layer methods (save, get, list)
- API endpoints implementation
- Error handling and validation

### 4. **API Contract:** [api-spec.md](./sub-specs/api-spec.md)

Understand the complete API specification:

- POST `/api/v1/comparisons/ingest` - Save comparison
- GET `/api/v1/comparisons/{id}` - Retrieve comparison
- GET `/api/v1/comparisons` - List comparisons
- GET `/api/v1/comparisons/check` - Check if exists
- Request/response formats with examples
- Error scenarios and status codes

### 5. **Frontend Design:** [technical-spec.md](./sub-specs/technical-spec.md#frontend-requirements)

Review frontend components and integration:

- SaveComparisonButton component
- ComparisonsPage (list view)
- SavedComparisonPage (detail view)
- API service methods
- Routing configuration

## 💡 Key Concepts

### What This Feature Does

Transforms the existing transient comparison analysis into a persistent history system:

1. **Save Comparisons:** Users can save analysis results after comparing template versions
2. **View History:** Users can browse all saved comparisons in a paginated table
3. **Retrieve Details:** Users can view full comparison data without re-analyzing

### How It Works

```
Analyze (existing) → Save → Database → Retrieve → Display
     ↓                                     ↑
  /analyze endpoint                   /comparisons/{id}
```

1. User performs comparison using existing `/analyze` endpoint
2. Results displayed with new "Save Comparison" button
3. Clicking save calls `/ingest` endpoint with full payload
4. Backend stores data in `comparisons` + `comparison_fields` tables
5. User can later retrieve from `/comparisons` list or `/comparisons/{id}` detail

### Why Persistence?

- ✅ **Audit Trail:** Track template evolution over time
- ✅ **Efficiency:** Avoid re-analyzing same version pairs
- ✅ **Reference:** Quick access to historical comparison data
- ✅ **Documentation:** Support decision-making with historical context

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                             │
│  ┌────────────────┐  ┌─────────────┐  ┌─────────────────┐ │
│  │ Save Button    │  │ List Page   │  │ Detail Page     │ │
│  │ (new)          │  │ (new)       │  │ (new)           │ │
│  └────────┬───────┘  └──────┬──────┘  └────────┬────────┘ │
└───────────┼──────────────────┼──────────────────┼──────────┘
            │                  │                  │
            │ POST /ingest     │ GET /comparisons │ GET /{id}
            ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│                        BACKEND                              │
│  ┌────────────────────────────────────────────────────────┐│
│  │         ComparisonService (Extended)                   ││
│  │  - save_comparison()                                   ││
│  │  - get_comparison()                                    ││
│  │  - list_comparisons()                                  ││
│  └───────────────────┬────────────────────────────────────┘│
└────────────────────────┼────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                      DATABASE                               │
│  ┌──────────────────┐        ┌─────────────────────────┐  │
│  │  comparisons     │◄───────┤ comparison_fields       │  │
│  │  (modified)      │ 1    * │ (extended)              │  │
│  │                  │        │                         │  │
│  │ - source_version │        │ - field_id              │  │
│  │ - target_version │        │ - status                │  │
│  │ - metrics...     │        │ - page_numbers          │  │
│  └──────────────────┘        │ - near_text diffs       │  │
│           ▲                  │ - value_options         │  │
│           │                  │ - position_data         │  │
│           │                  └─────────────────────────┘  │
│  ┌────────┴─────────┐                                     │
│  │ template_versions│                                     │
│  │ (existing)       │                                     │
│  └──────────────────┘                                     │
└─────────────────────────────────────────────────────────────┘
```

## 📊 Key Data Structures

### Database Schema Changes

**comparisons table (CRITICAL CHANGES):**

- FK change: `source_template_id` → `source_version_id` (FK to template_versions)
- FK change: `target_template_id` → `target_version_id` (FK to template_versions)
- New columns: `modification_percentage`, `fields_added`, `fields_removed`, `fields_modified`, `fields_unchanged`

**comparison_fields table (NEW COLUMNS):**

- `field_id`, `status`, `source_page_number`, `target_page_number`, `page_number_changed`
- `near_text_diff`, `source_near_text`, `target_near_text`
- `value_options_diff`, `source_value_options`, `target_value_options` (JSONB)
- `position_change`, `source_position`, `target_position` (JSONB)

### API Payloads

**Save Request (POST /ingest):**

```json
{
  "source_version_id": 2,
  "target_version_id": 11,
  "global_metrics": {
    /* ... */
  },
  "field_changes": [
    /* ... */
  ]
}
```

**List Response (GET /comparisons):**

```json
{
  "items": [
    {
      "id": 42,
      "source_template_name": "Solicitud Prestación",
      "modification_percentage": 23.08,
      "fields_added": 1
      /* ... */
    }
  ],
  "total": 127,
  "page": 1,
  "page_size": 20,
  "total_pages": 7
}
```

## ✅ Implementation Checklist

### Phase 1: Database Migration

- [ ] Create Alembic migration file
- [ ] Test migration upgrade in staging
- [ ] Test migration downgrade (rollback)
- [ ] Verify indexes created
- [ ] Verify foreign key constraints
- [ ] Apply migration to development database

### Phase 2: Backend Implementation

- [ ] Create Pydantic schemas (ComparisonSummary, etc.)
- [ ] Implement ComparisonService.save_comparison()
- [ ] Implement ComparisonService.get_comparison()
- [ ] Implement ComparisonService.list_comparisons()
- [ ] Create POST /ingest endpoint
- [ ] Create GET /{id} endpoint
- [ ] Create GET / (list) endpoint
- [ ] Add OpenAPI documentation
- [ ] Write unit tests (service layer)
- [ ] Write integration tests (API endpoints)

### Phase 3: Frontend Implementation

- [ ] Add TypeScript types (ComparisonSummary, etc.)
- [ ] Create SaveComparisonButton component
- [ ] Create ComparisonsPage component
- [ ] Create SavedComparisonPage component
- [ ] Implement comparisons API service methods
- [ ] Add routes to App.tsx
- [ ] Add navigation menu item
- [ ] Write component tests
- [ ] Test responsive design

### Phase 4: Integration & Testing

- [ ] Test end-to-end save flow
- [ ] Test list page with pagination
- [ ] Test detail page retrieval
- [ ] Test error handling
- [ ] Verify dark mode support
- [ ] Verify accessibility (WCAG compliance)
- [ ] Performance testing (load time)
- [ ] Fix linter errors

### Phase 5: Documentation & Deployment

- [ ] Verify API documentation in Swagger UI
- [ ] Update user documentation
- [ ] Create deployment plan
- [ ] Run migration in production
- [ ] Deploy backend changes
- [ ] Deploy frontend changes
- [ ] Monitor for errors

## 🔑 Critical Success Factors

1. **Database Migration Must Be Bulletproof**

   - Foreign key changes are high-risk operations
   - Test thoroughly in staging environment
   - Have rollback plan ready
   - Take backup before production migration

2. **Transaction Integrity**

   - Save operation must be atomic (all or nothing)
   - Use database transaction for parent + child records
   - Handle rollback on any error

3. **API Compatibility**

   - `/ingest` accepts same payload as `/analyze` returns
   - `/comparisons/{id}` returns same format as `/analyze`
   - Reuse existing schemas where possible

4. **Frontend Component Reuse**
   - Reuse GlobalMetricsCard and ComparisonTable components
   - Maintain consistent UI/UX with existing comparison page
   - Dark mode support throughout

## 📚 Related Documentation

- **Comparison Feature Spec:** @.agent-os/specs/2025-10-26-04-comparison-feature/
- **Database Schema:** @extra_context/sepe-database-251027.sql
- **Example Response:** @extra_context/example_response_analyze.json

## 🔗 Quick Links

| Document                                             | Purpose                     |
| ---------------------------------------------------- | --------------------------- |
| [spec.md](./spec.md)                                 | Main requirements document  |
| [spec-lite.md](./spec-lite.md)                       | One-paragraph summary       |
| [technical-spec.md](./sub-specs/technical-spec.md)   | Implementation details      |
| [database-schema.md](./sub-specs/database-schema.md) | Database migration          |
| [api-spec.md](./sub-specs/api-spec.md)               | API endpoints documentation |

## ⏱️ Estimated Timeline

- **Database Migration:** 0.5 day (includes testing)
- **Backend Implementation:** 2-3 days
- **Frontend Implementation:** 2-3 days
- **Integration & Testing:** 1-2 days
- **Documentation:** 0.5 day

**Total:** 6-9 days (~1.5-2 weeks)

## 🎯 Success Criteria

✅ Users can save comparison results after analysis  
✅ Users can view list of saved comparisons with pagination  
✅ Users can view full details of saved comparison  
✅ All data persists correctly in database  
✅ API endpoints documented in Swagger UI  
✅ Tests pass with >90% coverage  
✅ Responsive design works on all devices  
✅ Dark mode supported throughout  
✅ No breaking changes to existing functionality

---

**Ready to implement?** Start with the database migration in [database-schema.md](./sub-specs/database-schema.md)!
