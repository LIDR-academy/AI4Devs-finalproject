# Template Comparison Feature - Specification Summary

## 📋 Overview

Complete implementation specification for a template version comparison system that allows users to analyze differences between two template versions field-by-field.

## 📁 Specification Documents

1. **[spec.md](./spec.md)** - Main specification with overview, user stories, and scope
2. **[spec-lite.md](./spec-lite.md)** - One-line feature summary
3. **[sub-specs/technical-spec.md](./sub-specs/technical-spec.md)** - Detailed technical implementation
4. **[sub-specs/api-spec.md](./sub-specs/api-spec.md)** - Complete API endpoint documentation
5. **[sub-specs/ui-mockup.md](./sub-specs/ui-mockup.md)** - Visual UI mockups and design
6. **[tasks.md](./tasks.md)** - Detailed task breakdown (10 major tasks, 80+ subtasks)

## 🎯 Key Features

### Backend

- **New API Endpoint:** `POST /api/v1/comparisons/analyze`
- **In-Memory Comparison:** No PDF re-processing, uses database data only
- **Comprehensive Diff Logic:** Identifies ADDED, REMOVED, MODIFIED, UNCHANGED fields
- **Global Metrics:** Page count, field count, modification percentage
- **Smart Comparison:** Position tolerance, value options comparison, text diff

### Frontend

- **Enhanced CreateComparisonPage:** Version selection and results display
- **Cascading Selectors:** Template → Version selection for source and target
- **Validation:** Prevents comparing identical versions
- **Global Metrics Display:** Visual cards showing high-level statistics
- **Detailed Table:** Field-by-field comparison with filtering and sorting
- **Color Coding:** Visual indicators for different change types

## 🏗️ Architecture

### Backend Stack

- **Framework:** FastAPI
- **ORM:** SQLAlchemy
- **Validation:** Pydantic v2
- **Database:** PostgreSQL (existing tables: `template_versions`, `template_fields`)

### Frontend Stack

- **Framework:** React with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Forms:** React Hook Form
- **Routing:** React Router

## 📊 Data Flow

```
User Selects Versions
        ↓
Frontend Validation (source_id ≠ target_id)
        ↓
POST /api/v1/comparisons/analyze
        ↓
ComparisonService.compare_versions()
        ↓
Fetch Versions & Fields from DB
        ↓
In-Memory Comparison
        ↓
Return ComparisonResult
        ↓
Display Metrics + Table
```

## 🔑 Key Schemas

### Request

```typescript
{
  source_version_id: number,
  target_version_id: number
}
```

### Response

```typescript
{
  source_version_id: number,
  target_version_id: number,
  global_metrics: {
    page_count_changed: boolean,
    field_count_changed: boolean,
    fields_added: number,
    fields_removed: number,
    fields_modified: number,
    modification_percentage: number,
    ...
  },
  field_changes: [
    {
      field_id: string,
      status: 'ADDED' | 'REMOVED' | 'MODIFIED' | 'UNCHANGED',
      near_text_diff: 'EQUAL' | 'DIFFERENT' | 'NOT_APPLICABLE',
      value_options_diff: 'EQUAL' | 'DIFFERENT' | 'NOT_APPLICABLE',
      position_change: 'EQUAL' | 'DIFFERENT' | 'NOT_APPLICABLE',
      ...
    }
  ]
}
```

## 📝 Task Breakdown

1. **Backend Schemas** (7 subtasks) - Pydantic models for request/response
2. **Comparison Service** (12 subtasks) - Core comparison logic
3. **API Endpoint** (9 subtasks) - REST endpoint with auth and validation
4. **Frontend Types** (6 subtasks) - TypeScript interfaces
5. **API Service** (3 subtasks) - Frontend API client
6. **CreateComparisonPage** (9 subtasks) - Main page component
7. **Global Metrics Display** (8 subtasks) - Metrics visualization
8. **Field Changes Table** (12 subtasks) - Detailed comparison table
9. **Integration & Polish** (8 subtasks) - Final integration
10. **Testing & Documentation** (8 subtasks) - Comprehensive testing

**Total:** 82 subtasks across 10 major tasks

## ⏱️ Timeline

- **Backend:** 2-3 days
- **Frontend Types & Services:** 0.5 day
- **Frontend Components:** 3-4 days
- **Integration & Polish:** 1-2 days
- **Testing & Documentation:** 1-2 days

**Total Estimate:** 7.5-11.5 days (~2 weeks)

## ✅ Acceptance Criteria

### Backend

- ✅ API returns accurate comparison data
- ✅ All change types correctly identified
- ✅ Global metrics calculated accurately
- ✅ Position comparison with tolerance
- ✅ Comprehensive error handling
- ✅ 100% test coverage
- ✅ Complete API documentation

### Frontend

- ✅ Users can select different versions
- ✅ Validation prevents identical selections
- ✅ Metrics displayed clearly
- ✅ Table shows all comparison data
- ✅ Filtering and sorting work correctly
- ✅ Color coding indicates changes
- ✅ Responsive design
- ✅ Dark mode support
- ✅ WCAG accessibility compliant

## 🎨 UI Components

1. **Selection Form:** Source/Target template and version selectors
2. **Global Metrics Cards:** 4 cards showing statistics
3. **Filter Buttons:** All, Added, Removed, Modified, Unchanged
4. **Comparison Table:** Sortable, filterable, expandable rows
5. **Detail Views:** Expandable sections showing full diff

## 🔒 Security & Performance

### Security

- Authentication required
- Input validation
- SQL injection prevention (ORM)
- Rate limiting (10/minute per user)

### Performance

- In-memory comparison (fast)
- Optimized DB queries
- Pagination for large results
- Caching for template lists

## 📚 Dependencies

### Backend

- Existing `template_versions` table
- Existing `template_fields` table
- Authentication system
- FastAPI + SQLAlchemy + Pydantic

### Frontend

- Existing routing setup
- Template/version API endpoints
- React Hook Form
- Tailwind CSS

## 🚀 Getting Started

1. Review [spec.md](./spec.md) for overview
2. Read [technical-spec.md](./sub-specs/technical-spec.md) for implementation details
3. Check [api-spec.md](./sub-specs/api-spec.md) for API contract
4. View [ui-mockup.md](./sub-specs/ui-mockup.md) for visual design
5. Follow [tasks.md](./tasks.md) for step-by-step implementation

## 📞 Questions?

For clarifications or discussions about this specification, please refer to:

- Technical details: `technical-spec.md`
- API contract: `api-spec.md`
- UI/UX design: `ui-mockup.md`
- Task sequence: `tasks.md`

---

**Specification Version:** 1.0  
**Created:** 2025-10-26  
**Status:** Ready for Implementation
