# Activity Audit System - Spec Overview

**Spec ID:** 2025-11-02-01-activity-audit-system  
**Created:** 2025-11-02  
**Status:** Ready for Implementation

## Quick Summary

Replace the mock "Recent Activity" data on the homepage with a real database-backed audit system that tracks all critical user operations (template uploads, comparison saves, user registration) and displays them in real-time.

## Key Features

✅ **Database Audit Table** - New `activity` table with indexes for performance  
✅ **Automatic Activity Logging** - Integrated into 7 critical endpoints  
✅ **Dashboard API** - `GET /api/v1/activity/recent` for fetching recent activities  
✅ **Frontend Integration** - HomePage component updated to use real API data  
✅ **User Attribution** - Shows who performed each action with email/name  
✅ **Activity Filtering** - Excludes LOGIN events from UI display

## Activity Types Tracked

| Type                  | Description                 | Triggered By                |
| --------------------- | --------------------------- | --------------------------- |
| `NEW_USER`            | User registration           | POST /auth/register         |
| `LOGIN`               | User login (hidden from UI) | POST /auth/login            |
| `TEMPLATE_ANALYSIS`   | PDF analysis (temporary)    | POST /templates/analyze     |
| `TEMPLATE_SAVED`      | Template ingested           | POST /ingest/ingest         |
| `VERSION_SAVED`       | New version created         | POST /ingest/ingest/version |
| `COMPARISON_ANALYSIS` | Comparison analyzed         | POST /comparisons/analyze   |
| `COMPARISON_SAVED`    | Comparison saved            | POST /comparisons/ingest    |

## Files Structure

```
.agent-os/specs/2025-11-02-01-activity-audit-system/
├── spec.md                          # Main requirements document
├── spec-lite.md                     # Quick summary for AI context
├── README.md                        # This file
└── sub-specs/
    ├── technical-spec.md            # Detailed technical requirements
    ├── database-schema.md           # Database schema and migration
    └── api-spec.md                  # API endpoint specifications
```

## Implementation Checklist

- [ ] Create `Activity` SQLAlchemy model
- [ ] Generate and apply Alembic migration
- [ ] Implement `ActivityService` class
- [ ] Create activity Pydantic schemas
- [ ] Create `GET /api/v1/activity/recent` endpoint
- [ ] Integrate activity logging into 7 endpoints
- [ ] Create frontend TypeScript types
- [ ] Implement frontend API service
- [ ] Update HomePage component
- [ ] Write backend tests (model, service, API)
- [ ] Write frontend tests (service, component)
- [ ] Update API documentation

## Next Steps

Run `/create-tasks` command to generate a detailed task breakdown from this spec.

## Related Documentation

- [Main Spec Requirements](./spec.md)
- [Technical Specification](./sub-specs/technical-spec.md)
- [Database Schema](./sub-specs/database-schema.md)
- [API Specification](./sub-specs/api-spec.md)
