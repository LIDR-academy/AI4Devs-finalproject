# HU9-TEST-001: Testing - Creación de Reseña

## Info
- **ID**: HU9-TEST-001  
- **Prioridad**: Media  
- **Estimación**: 8h  
- **Dependencias**: HU9-FE-001, HU9-BE-001, HU9-DB-001

## Plan
### Backend
- Crear reseña exitosa -> status pending, UNIQUE appointment_id.
- Errores: cita no encontrada (404), no dueño (403), cita no completed (400), reseña existente (409), rating/comentario inválidos (400).
- Sanitización: elimina HTML/JS.

### Frontend
- Form valida rating 1-5 y comentario 10-1000; contador de caracteres.
- Muestra mensaje pending y bloquea reenviar si ya existe.
- Maneja errores 403/404/400/409.

### E2E
- Flujo: cita completada -> crear reseña -> ver mensaje pending.
- Flujo negativo: reseña duplicada -> mensaje de error.

## Archivos sugeridos
- `backend/tests/integration/reviews/create-review.test.ts`
- `frontend/tests/components/reviews/ReviewForm.test.tsx`
- `frontend/tests/e2e/reviews/create.spec.ts`

## Métricas
- Cobertura servicio reviews ≥85%
- Cobertura formulario ≥80% branches
