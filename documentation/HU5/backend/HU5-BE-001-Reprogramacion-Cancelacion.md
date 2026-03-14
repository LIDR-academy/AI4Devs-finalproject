# HU5-BE-001: Endpoint de Reprogramación y Cancelación de Cita

## Información General
- **ID**: HU5-BE-001  
- **Historia**: HU5 - Reprogramación/Cancelación  
- **Tipo**: Backend  
- **Prioridad**: Alta  
- **Estimación**: 15h (2.5 sp)  
- **Dependencias**: HU4-DB-001 (APPOINTMENTS/SLOTS/HISTORY)

## Criterios de Aceptación cubiertos
- Auth JWT, role patient, dueño de la cita (403 si no).
- Estados permitidos: confirmed/pending. Rechazar completed/cancelled (400).
- Cancelar: update status=cancelled, liberar slot (is_available=true, clear locks), registrar reason e historial.
- Reprogramar: validar slot nuevo pertenece al mismo médico, disponible, no bloqueado; liberar slot anterior; actualizar cita e historial.
- Errores claros: 404 cita/slot; 409 doble booking; 400 invalid status; 403 no dueño.
- Auditoría en `audit_logs`.

## Pasos Técnicos
1) **DTO** `dto/appointments/update-appointment.dto.ts`
```ts
status?: 'cancelled';
slotId?: string;
appointmentDate?: string; // ISO
cancellationReason?: string; // max 500
```
Validar: si status=cancelled -> no slotId; si reprogramar -> requiere slotId+appointmentDate.

2) **Servicio** `services/appointment.service.ts`
- `cancelAppointment(appointmentId, patientId, reason)`
  - Verificar ownership y estado permitido.
  - Liberar slot anterior (`is_available=true`, `locked_by=null`, `locked_until=null`).
  - Update cita status=cancelled, set cancellationReason.
  - Historial: old_status -> cancelled, change_reason=reason.
- `rescheduleAppointment(appointmentId, patientId, newSlotId, newDate)`
  - Transacción ACID:
    1. Lock cita (FOR UPDATE) y validar ownership/estado permitido.
    2. Lock nuevo slot (is_available=true, sin lock activo, mismo doctor).
    3. Lock slot anterior y liberarlo.
    4. Update cita: slotId=newSlotId, appointment_date=newDate, status=confirmed.
    5. Marcar nuevo slot is_available=false; clear locks.
    6. Historial: registro cambio de fecha/slot.
  - Manejar conflicto: lanzar 409 si slot ya tomado.

3) **Controlador** `controllers/appointments.controller.ts`
- PATCH `/api/v1/appointments/:id`
- Guards: JwtAuthGuard + RolesGuard(role=patient)
- Decide acción según body:
  - `status=cancelled` -> cancelar
  - `slotId` presente -> reprogramar
  - Si none -> 400

4) **Auditoría**
- Registrar en `audit_logs`: action `cancel_appointment` o `reschedule_appointment`, entity_id cita, ip, userId.

5) **Validaciones clave**
- Cita existe (404).
- Dueño de la cita (403).
- Estado permitido (400).
- Nuevo slot pertenece al mismo doctor (400).
- Paciente no tiene otra cita activa distinta a la actual (para reprogramar).

## Archivos a crear/modificar
- `backend/src/dto/appointments/update-appointment.dto.ts`
- `backend/src/services/appointment.service.ts` (métodos cancelar/reprogramar)
- `backend/src/controllers/appointments.controller.ts` (PATCH)
- `backend/src/entities/appointment-history.entity.ts` (asegurar campos change_reason, changed_by)
- `backend/src/entities/slot.entity.ts` (locks)

## Testing (ver HU5-TEST-001)
- Cancelar exitosa libera slot.
- Reprogramar exitosa mueve slot y libera anterior.
- Rechazos: estado inválido, no dueño, slot no disponible, cita completada/cancelada.
- Concurrencia: doble booking retorna 409.
