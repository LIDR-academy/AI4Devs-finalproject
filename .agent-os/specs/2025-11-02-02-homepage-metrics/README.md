# HomePage Real-Time Metrics - Spec Overview

**Spec ID:** 2025-11-02-02-homepage-metrics  
**Created:** 2025-11-02  
**Status:** Ready for Implementation

## Quick Summary

Replace mock data in HomePage with real-time metrics from new backend endpoints. Create dedicated `/api/v1/metrics` router with three endpoints for templates summary, comparisons count, and monthly activity.

## Key Features

✅ **Metrics Router** - New `/api/v1/metrics` router following SRP  
✅ **Templates Summary** - Count of unique templates and total versions  
✅ **Comparisons Count** - Total number of saved comparisons  
✅ **Monthly Activity** - Activities logged in current calendar month  
✅ **Frontend Integration** - Update HomePage with real data and loading states

## Endpoints

| Endpoint                            | Method | Purpose                      | Response                              |
| ----------------------------------- | ------ | ---------------------------- | ------------------------------------- |
| `/api/v1/metrics/templates/summary` | GET    | Templates and versions count | `{ total_templates, total_versions }` |
| `/api/v1/metrics/comparisons/count` | GET    | Total comparisons            | `{ total_comparisons }`               |
| `/api/v1/metrics/activity/monthly`  | GET    | Current month activities     | `{ activities_this_month, month }`    |

## Files Structure

```
.agent-os/specs/2025-11-02-02-homepage-metrics/
├── spec.md                      # Main requirements document
├── spec-lite.md                 # Quick summary for AI context
├── README.md                    # This file
└── sub-specs/
    ├── technical-spec.md        # Detailed technical requirements
    └── api-spec.md              # API endpoint specifications
```

## Implementation Checklist

### Backend

- [ ] Create Pydantic schemas in `backend/app/schemas/metrics.py`
- [ ] Create metrics router in `backend/app/api/v1/endpoints/metrics.py`
- [ ] Implement `GET /metrics/templates/summary` endpoint
- [ ] Implement `GET /metrics/comparisons/count` endpoint
- [ ] Implement `GET /metrics/activity/monthly` endpoint
- [ ] Register metrics router in main API router
- [ ] Manual testing of all endpoints

### Frontend

- [ ] Create TypeScript types in `frontend/src/types/metrics.types.ts`
- [ ] Export types from `frontend/src/types/index.ts`
- [ ] Create MetricsService in `frontend/src/services/metrics.service.ts`
- [ ] Update HomePage.tsx to fetch real metrics
- [ ] Replace mock data with API responses
- [ ] Implement loading states
- [ ] Implement error handling
- [ ] Test dashboard rendering

## Next Steps

Run `/create-tasks` command to generate a detailed task breakdown from this spec.

## Related Documentation

- [Main Spec Requirements](./spec.md)
- [Technical Specification](./sub-specs/technical-spec.md)
- [API Specification](./sub-specs/api-spec.md)
