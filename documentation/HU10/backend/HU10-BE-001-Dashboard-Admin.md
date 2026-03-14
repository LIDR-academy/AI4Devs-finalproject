# HU10-BE-001: Endpoints de Dashboard Administrativo

## Info
- **ID**: HU10-BE-001  
- **Prioridad**: Media  
- **Estimación**: 25h  
- **Dependencias**: HU10-DB-001 (si aplica), HU7-DB-001, HU9-DB-001, HU4-DB-001

## CA cubiertos
- Auth admin (JWT, role admin); 403 si no admin.
- Métricas batch (diario 2:00 AM) cacheadas 24h en Redis.
- Endpoints:
  - GET `/admin/metrics` -> totales reservas/cancelaciones/rating/promedios, médicos/pacientes activos.
  - GET `/admin/reservations` (paginado, filtros).
  - GET `/admin/cancellations` (paginado, filtros motivo/fecha).
  - GET `/admin/ratings` (datos para gráficos por especialidad).
  - GET `/admin/verification` (médicos pending/aprob/rechaz), acciones approve/reject con notas.
  - GET `/admin/reviews/moderation` (pendientes), PATCH approve/reject con notas.
- URLs firmadas para documentos de verificación (15 min).
- Auditoría completa de acciones admin.

## Pasos Técnicos
1) **Guard** `AdminGuard` sobre prefijo `/admin`.
2) **Servicio batch** `services/admin-metrics.service.ts`
   - Job diario (Bull/cron) calcula métricas y las guarda en Redis (TTL 24h).
3) **Controladores**
   - `AdminMetricsController` (metrics, ratings, reservations, cancellations).
   - `AdminVerificationController` (listar/approve/reject doctor; genera URL firmada para docs).
   - `AdminReviewsController` (moderar reseñas).
4) **Lógica de aprobación**
   - Aprobar médico: update verification_status, verified_by, verified_at, audit_log, email a médico.
   - Rechazar médico: set rejected + notas + email.
   - Aprobar reseña: set moderation_status=approved, actualizar rating_average/total_reviews del doctor (HU9 CA8), audit_log.
   - Rechazar reseña: set moderation_status=rejected, guardar notes, audit_log.
5) **Cache**
   - Claves `admin:metrics`, `admin:reservations:{filters}`, etc.
   - Invalidate métricas si se ejecuta batch o acciones críticas.

## Archivos a crear/modificar
- `backend/src/guards/admin.guard.ts`
- `backend/src/controllers/admin/*`
- `backend/src/services/admin-metrics.service.ts`
- Jobs cron/Bull para batch (ya descrito en arquitectura).
- Ajustes entidades: doctor.verification_status, review.moderation_status, etc.

## Testing (HU10-TEST-001)
- Acceso solo admin.
- Métricas devueltas desde cache y batch.
- Aprobar/rechazar médico y reseña actualizan estado y audit_logs.
- URLs firmadas expiran y validan role admin.
