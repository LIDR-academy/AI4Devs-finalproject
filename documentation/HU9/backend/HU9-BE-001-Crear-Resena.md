# HU9-BE-001: Endpoint de Creación de Reseña

## Info
- **ID**: HU9-BE-001  
- **Prioridad**: Media  
- **Estimación**: 10h  
- **Dependencias**: HU9-DB-001, HU4-DB-001, HU2-DB-001

## CA cubiertos
- Auth JWT, role patient; dueño de la cita.
- Solo citas con status completed; UNIQUE por appointment_id.
- POST `/appointments/{id}/reviews` con rating 1-5 y comment 10-1000.
- Sanitizar comentario para prevenir XSS.
- Reseña creada con moderation_status='pending'.
- Notificar médico (email/push) de reseña pendiente.
- Auditoría `create_review`.

## Pasos Técnicos
1) DTO `dto/reviews/create-review.dto.ts`
   - rating int 1-5; comment string 10-1000 (trim); sanitize.
2) Servicio `services/review.service.ts`
   - Validar cita existe y pertenece al paciente, estado completed.
   - Verificar no exista reseña previa (UNIQUE).
   - Crear review con moderation_status pending.
   - Encolar notificación a médico.
   - Auditoría.
3) Controlador `controllers/reviews.controller.ts`
   - POST `/api/v1/appointments/:id/reviews` protegido por Jwt y role patient.
4) Moderation impact (HU10): actualizar rating_average/total_reviews al aprobar (ver HU10-BE-001).

## Archivos a crear/modificar
- `backend/src/dto/reviews/create-review.dto.ts`
- `backend/src/services/review.service.ts`
- `backend/src/controllers/reviews.controller.ts`
- `backend/src/entities/review.entity.ts`

## Testing (HU9-TEST-001)
- Éxito crea pending.
- Errores: cita no encontrada, no dueño, no completed, reseña existente, rating inválido.
- Sanitización elimina HTML/JS.
