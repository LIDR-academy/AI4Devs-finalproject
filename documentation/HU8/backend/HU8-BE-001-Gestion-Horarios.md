# HU8-BE-001: Endpoint de Gestión de Horarios de Trabajo

## Info
- **ID**: HU8-BE-001  
- **Tipo**: Backend  
- **Prioridad**: Alta  
- **Estimación**: 18h  
- **Dependencias**: HU8-DB-001, HU2-DB-001

## CA cubiertos
- Auth JWT, role doctor.
- GET/POST/PATCH/DELETE `/doctors/me/schedules`.
- Validar solapamiento de horarios en mismo día.
- Generación automática de SLOTS (próximas 4 semanas) al crear/actualizar/activar.
- Al actualizar: soft delete slots futuros generados por ese horario; no tocar reservados.
- Al eliminar: marcar schedule deleted_at; eliminar slots futuros no reservados.
- Zona horaria CDMX.
- Auditoría: create/update/delete_schedule.

## Pasos Técnicos
1) **Entidades**: `doctor_schedule.entity.ts`, `slot.entity.ts`
   - Campos schedule: dayOfWeek(int 0-6), startTime, endTime (HH:MM:SS), slotDurationMinutes, breakDurationMinutes, isActive, deleted_at.
2) **Servicio** `services/doctor-schedule.service.ts`
   - Validar solapamientos con query sobre schedules activos del día.
   - Generar slots: iterar intervalos entre start/end con duración y break; crear para 4 semanas futuras.
   - Actualizar: soft delete slots futuros ligados al schedule; regenerar.
   - Eliminar: marcar deleted_at; eliminar slots futuros no reservados.
3) **Controlador** `controllers/doctor-schedules.controller.ts`
   - Rutas REST con guards doctor.
4) **Background job opcional**: cleanup de slots expirados/bloqueados (puede reusar lógica HU4).

## Archivos a crear/modificar
- `backend/src/entities/doctor-schedule.entity.ts`
- `backend/src/services/doctor-schedule.service.ts`
- `backend/src/controllers/doctor-schedules.controller.ts`
- Reutilizar `slot.entity.ts` de HU4.

## Testing (HU8-TEST-001)
- Crear horario genera slots correctos.
- Actualizar horario regenera slots futuros y mantiene reservados.
- Eliminar horario elimina slots futuros no reservados.
- Solapamiento devuelve 400.
