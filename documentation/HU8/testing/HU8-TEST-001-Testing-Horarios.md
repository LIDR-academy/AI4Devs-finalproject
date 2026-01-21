# HU8-TEST-001: Testing - Gestión de Horarios de Trabajo

## Info
- **ID**: HU8-TEST-001  
- **Prioridad**: Alta  
- **Estimación**: 12h  
- **Dependencias**: HU8-FE-001, HU8-BE-001, HU8-DB-001

## Plan
### Backend
- Crear horario genera slots correctos (duración+pausa) para 4 semanas.
- Solapamiento mismo día → 400.
- Actualizar horario: elimina slots futuros no reservados y regenera.
- Eliminar horario: marca deleted_at y elimina slots futuros no reservados.
- Solo doctor dueño puede gestionar (403).

### Frontend
- Form valida endTime>startTime, solapamiento manejado por error backend.
- CRUD desde UI con estados de carga y mensajes.

### E2E
- Flujo: crear horario -> ver slots -> actualizar -> ver slots regenerados -> eliminar -> confirmar slots removidos.

## Archivos sugeridos
- `backend/tests/integration/schedules/schedules.test.ts`
- `frontend/tests/components/schedules/ScheduleFormModal.test.tsx`
- `frontend/tests/e2e/schedules/crud.spec.ts`

## Métricas
- Cobertura servicio schedules ≥85%
- Cobertura frontend formularios ≥80% branches
