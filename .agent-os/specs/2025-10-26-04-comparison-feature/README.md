# Template Comparison Feature - Complete Specification

## 🎯 Quick Start

This specification defines the complete implementation for comparing two template versions field-by-field, showing added, removed, and modified fields with detailed difference analysis.

## 📖 Documentation Structure

```
2025-10-26-04-comparison-feature/
├── README.md                    ← You are here
├── SUMMARY.md                   ← Executive summary
├── spec.md                      ← Feature overview & scope
├── spec-lite.md                 ← One-line summary
├── tasks.md                     ← Detailed task breakdown (82 subtasks)
└── sub-specs/
    ├── technical-spec.md        ← Implementation details
    ├── api-spec.md              ← API endpoint specification
    └── ui-mockup.md             ← UI design & mockups
```

## 🚀 Implementation Path

### 1. **Start Here:** [SUMMARY.md](./SUMMARY.md)

Read the executive summary to understand the full scope and architecture.

### 2. **Understand Requirements:** [spec.md](./spec.md)

Review user stories, acceptance criteria, and success metrics.

### 3. **Backend Implementation:** [technical-spec.md](./sub-specs/technical-spec.md)

Follow the detailed backend architecture:

- Pydantic schemas
- Comparison service logic
- API endpoint implementation

### 4. **API Contract:** [api-spec.md](./sub-specs/api-spec.md)

Understand the complete API specification:

- Request/response formats
- Error handling
- Example payloads

### 5. **Frontend Design:** [ui-mockup.md](./sub-specs/ui-mockup.md)

Review visual mockups and component structure:

- Page layout
- Component hierarchy
- Color schemes
- Responsive design

### 6. **Implementation Tasks:** [tasks.md](./tasks.md)

Follow the step-by-step task breakdown:

- 10 major tasks
- 82 subtasks
- Clear acceptance criteria

## 💡 Key Concepts

### What This Feature Does

Compares two template versions and shows:

1. **Global Metrics:** High-level statistics (page count, field count, % changed)
2. **Field Changes:** Detailed field-by-field comparison (added/removed/modified)
3. **Diff Details:** Specific differences (position, label, options)

### How It Works

1. User selects source and target versions
2. Frontend validates selections (must be different)
3. API fetches data from database (no PDF processing)
4. Service compares fields in-memory
5. Results displayed with metrics and table

### Why Database-Only?

- ✅ **Fast:** No PDF parsing overhead
- ✅ **Consistent:** Uses normalized data
- ✅ **Efficient:** Minimal resource usage
- ✅ **Reliable:** No PDF parsing errors

## 🏗️ Architecture Overview

```
┌─────────────┐
│   Frontend  │ React + TypeScript + Tailwind
│             │ - CreateComparisonPage
│             │ - GlobalMetricsCard
│             │ - ComparisonTable
└──────┬──────┘
       │ POST /api/v1/comparisons/analyze
       │ { source_version_id, target_version_id }
       ▼
┌─────────────┐
│   Backend   │ FastAPI + SQLAlchemy + Pydantic
│             │ - ComparisonService
│             │ - compare_versions()
│             │ - In-memory diff logic
└──────┬──────┘
       │ SELECT * FROM template_versions
       │ SELECT * FROM template_fields
       ▼
┌─────────────┐
│  Database   │ PostgreSQL
│             │ - template_versions (metadata)
│             │ - template_fields (field data)
└─────────────┘
```

## 📊 Key Data Structures

### ComparisonResult

```typescript
{
  global_metrics: {
    fields_added: 4,
    fields_removed: 0,
    fields_modified: 3,
    fields_unchanged: 45,
    modification_percentage: 14.58
  },
  field_changes: [
    {
      field_id: "NOMBRE",
      status: "UNCHANGED",
      near_text_diff: "EQUAL",
      value_options_diff: "NOT_APPLICABLE",
      position_change: "EQUAL"
    },
    {
      field_id: "NUEVO_CAMPO",
      status: "ADDED",
      target_page_number: 6
    }
  ]
}
```

## 🎨 UI Preview

### Selection Form

```
[Source Template ▼] → [Source Version ▼]
[Target Template ▼] → [Target Version ▼]
         [Execute Comparison]
```

### Results Display

```
┌─────────────────────────────────┐
│ Global Metrics (4 cards)        │
│ - Page Count: 5 → 6             │
│ - Field Count: 48 → 52          │
│ - Changes: +4, -0, ~3           │
│ - Modified: 14.58%              │
└─────────────────────────────────┘

Filter: [All] [Added] [Removed] [Modified]

┌───────────────────────────────────────┐
│ Field ID │ Status │ Src │ Tgt │ Diffs│
├───────────────────────────────────────┤
│ NOMBRE   │   ✓    │  1  │  1  │  ✓✓✓ │
│ NUEVO    │   ✅   │  -  │  6  │  --- │
│ VIEJO    │   ❌   │  4  │  -  │  --- │
│ CAMBIO   │   🔄   │  2  │  2  │  ⚠️⚠️✓│
└───────────────────────────────────────┘
```

## ✅ Checklist for Implementation

### Backend Phase

- [ ] Create Pydantic schemas
- [ ] Implement ComparisonService
- [ ] Create API endpoint
- [ ] Write comprehensive tests
- [ ] Add API documentation

### Frontend Phase

- [ ] Add TypeScript types
- [ ] Create API service method
- [ ] Enhance CreateComparisonPage
- [ ] Build GlobalMetricsCard
- [ ] Build ComparisonTable
- [ ] Add filtering & sorting

### Integration Phase

- [ ] Connect all components
- [ ] Test end-to-end workflow
- [ ] Fix linter errors
- [ ] Verify accessibility
- [ ] Test responsive design

### Testing Phase

- [ ] Unit tests (backend)
- [ ] Integration tests (API)
- [ ] Component tests (frontend)
- [ ] E2E tests (full workflow)
- [ ] Performance testing

## 📚 Related Documentation

- **Version Ingestion Feature:** Previous feature for creating new versions
- **Template Management:** Existing template CRUD operations
- **Field Analysis:** Existing PDF field extraction logic

## 🔗 Quick Links

| Document                                           | Purpose               |
| -------------------------------------------------- | --------------------- |
| [SUMMARY.md](./SUMMARY.md)                         | Executive overview    |
| [spec.md](./spec.md)                               | Feature specification |
| [technical-spec.md](./sub-specs/technical-spec.md) | Implementation guide  |
| [api-spec.md](./sub-specs/api-spec.md)             | API documentation     |
| [ui-mockup.md](./sub-specs/ui-mockup.md)           | UI design             |
| [tasks.md](./tasks.md)                             | Task breakdown        |

## ⏱️ Estimated Timeline

- **Backend:** 2-3 days
- **Frontend:** 4-5 days
- **Integration:** 1-2 days
- **Testing:** 1-2 days

**Total:** ~2 weeks

## 🎯 Success Criteria

✅ Users can compare any two template versions  
✅ Comparison executes in < 2 seconds  
✅ All field differences accurately detected  
✅ UI clearly shows all changes  
✅ Filtering and sorting work smoothly  
✅ Responsive design on all devices  
✅ Accessible to all users (WCAG)  
✅ 100% test coverage

---

**Ready to implement?** Start with [tasks.md](./tasks.md) for the detailed task list!
