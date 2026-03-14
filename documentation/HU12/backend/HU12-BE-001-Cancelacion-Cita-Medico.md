# HU12-BE-001: Endpoint de Cancelación de Cita por Médico

## Info
- **ID**: HU12-BE-001  
- **Tipo**: Backend  
- **Prioridad**: Alta  
- **Estimación**: 10h (1.5 sp)  
- **Dependencias**: HU4-DB-001, HU11-BE-001

## CA cubiertos
- Auth JWT y rol doctor para cancelar citas propias.
- Validación de ownership y estados permitidos (`pending`, `confirmed`).
- Cambio de estado a `cancelled` y liberación del slot.
- Registro de historial y auditoría específica de acción de doctor.
- Errores claros (404/403/400).

## Comportamientos implementados en esta rama
- Se amplió `PATCH /appointments/:id` para soportar cancelación por rol doctor.
- La cancelación libera slot asociado dentro de transacción.
- Se persiste `cancellation_reason` y registro en historial + auditoría.

## Decisiones de negocio
- Se preserva ownership estricto para cancelar solo citas del médico autenticado.
- Se mantiene acción de cancelación como reversible solo vía nueva reserva/reprogramación, no vía "undo".

## Limitaciones actuales
- No se envía aún notificación transaccional obligatoria al paciente desde este flujo.
- No hay política automática de reasignación de pacientes al cancelar por médico.

## Pasos Técnicos
1) **Controlador** `backend/src/controllers/appointments.controller.ts`
   - En `PATCH /appointments/:id`, permitir cancelación para doctor.
2) **Servicio** `backend/src/services/appointment.service.ts`
   - Nuevo método `cancelAppointmentByDoctor(appointmentId, doctorUserId, reason, ipAddress)`.
   - Validar:
     - Existe perfil doctor.
     - La cita pertenece al doctor.
     - Estado permitido.
   - Ejecutar en transacción:
     - Liberar slot.
     - `status='cancelled'`.
     - Guardar `cancellation_reason`.
     - Guardar `APPOINTMENT_HISTORY`.
     - Guardar `audit_logs` (`cancel_appointment_by_doctor`).

## Archivos a crear/modificar
- `backend/src/controllers/appointments.controller.ts`
- `backend/src/services/appointment.service.ts`

## Testing (HU12-TEST-001)
- Doctor dueño cancela cita activa exitosamente.
- Otro doctor no puede cancelar cita ajena (403).
- Estados no permitidos regresan 400.
