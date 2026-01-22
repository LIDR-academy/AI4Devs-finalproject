# HU10-TEST-001: Testing - Dashboard Administrativo

## Info
- **ID**: HU10-TEST-001  
- **Prioridad**: Media  
- **Estimación**: 15h  
- **Dependencias**: HU10-FE-001, HU10-BE-001, HU10-DB-001

## Plan
### Backend
- Solo admin accede (403 otros roles).
- Métricas devueltas desde cache; refresco batch.
- Aprobar/rechazar médico: cambia verification_status, registra audit_log, envía notificación.
- Aprobar/rechazar reseña: actualiza moderation_status, recalcula rating_average/total_reviews, audit_log.
- URLs firmadas de documentos: válidas para admin, expiran, rechazan no admin.

### Frontend
- Render de cards/gráficos/tablas con datos mock.
- Acciones aprobar/rechazar reflejan cambios en UI (optimistic update o refetch).
- Paginación y filtros en tablas.

### E2E
- Flujo admin: ver dashboard -> aprobar médico -> estado actualizado -> aprobar reseña -> métricas actualizadas tras batch/refetch.
- Flujo negativo: usuario no admin -> 403.

## Archivos sugeridos
- `backend/tests/integration/admin/metrics.test.ts`
- `backend/tests/integration/admin/verification.test.ts`
- `backend/tests/integration/admin/reviews-moderation.test.ts`
- `frontend/tests/e2e/admin/dashboard.spec.ts`

## Métricas
- Cobertura servicios admin ≥80%
- Cobertura UI crítica (acciones) ≥75% branches
