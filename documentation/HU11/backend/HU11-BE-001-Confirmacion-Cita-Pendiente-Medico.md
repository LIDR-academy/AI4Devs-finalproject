# HU11-BE-001: Endpoint de Confirmación de Cita por Médico

## Info
- **ID**: HU11-BE-001  
- **Tipo**: Backend  
- **Prioridad**: Alta  
- **Estimación**: 10h (1.5 sp)  
- **Dependencias**: HU4-DB-001, HU5-BE-001

## CA cubiertos
- Auth JWT y rol doctor para confirmar citas en estado `pending`.
- Validación de ownership: el doctor solo confirma sus propias citas.
- Cambio de estado `pending -> confirmed` con transacción y bloqueo pesimista.
- Registro de historial en `APPOINTMENT_HISTORY`.
- Registro de auditoría en `audit_logs` con acción `confirm_appointment_by_doctor`.
- Respuesta consistente y errores claros (404/403/400).

## Comportamientos implementados en esta rama
- `PATCH /appointments/:id` ahora enruta por rol y estado objetivo.
- Confirmación por médico valida perfil doctor asociado al usuario autenticado.
- Se registra transición de estado y metadata de auditoría con IP y usuario.
- Se retorna entidad de cita actualizada para sincronización inmediata en frontend.

## Decisiones de negocio
- Un paciente no puede confirmar citas; la confirmación es una acción exclusiva de operación médica.
- Se exige ownership estricto para evitar confirmaciones cruzadas entre médicos.

## Limitaciones actuales
- No se emite evento de dominio para notificación en tiempo real post-confirmación.
- No hay webhook externo para integrar confirmaciones con sistemas clínicos terceros.

## Pasos Técnicos
1) **Rutas** `backend/src/routes/appointments.routes.ts`
   - Permitir `PATCH /api/v1/appointments/:id` para roles `patient` y `doctor`.
2) **DTO** `backend/src/dto/appointments/update-appointment.dto.ts`
   - Aceptar `status='confirmed'` además de `status='cancelled'`.
3) **Controlador** `backend/src/controllers/appointments.controller.ts`
   - Resolver acción según role + payload:
     - Doctor + `status='confirmed'` -> confirmar cita pendiente.
     - Paciente + cancelación/reprogramación -> comportamiento existente.
   - Rechazar acciones cruzadas por rol con 403.
4) **Servicio** `backend/src/services/appointment.service.ts`
   - Nuevo método `confirmAppointmentByDoctor(appointmentId, doctorUserId, ipAddress)`.
   - Validar perfil de doctor, ownership y estado `pending`.
   - Actualizar cita, guardar historial y auditoría.
5) **Auditoría**
   - `action='confirm_appointment_by_doctor'`, `entity_type='appointment'`, `entity_id`, `user_id`, `ip`.

## Archivos a crear/modificar
- `backend/src/routes/appointments.routes.ts`
- `backend/src/dto/appointments/update-appointment.dto.ts`
- `backend/src/controllers/appointments.controller.ts`
- `backend/src/services/appointment.service.ts`

## Testing (HU11-TEST-001)
- Doctor dueño confirma cita pendiente (200 + status confirmed).
- Doctor no dueño recibe 403.
- Cita no pendiente recibe 400.
- Paciente intentando confirmar recibe 403.
