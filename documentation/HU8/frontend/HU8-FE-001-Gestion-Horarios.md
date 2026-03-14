# HU8-FE-001: Gestión de Horarios de Trabajo

## Info
- **ID**: HU8-FE-001  
- **Tipo**: Frontend  
- **Prioridad**: Alta  
- **Estimación**: 12h  
- **Dependencias**: HU8-BE-001, HU8-DB-001

## CA cubiertos
- Auth doctor.
- Ver lista de horarios por día, con estado activo/inactivo.
- Crear/editar/eliminar horario (dayOfWeek, startTime, endTime, slotDurationMinutes, breakDurationMinutes, isActive).
- Validar no solapamiento, endTime > startTime, duraciones >0.
- Mostrar slots generados (opcional) y estado.
- i18n ES/EN, TZ CDMX.

## Pasos Técnicos
1) Página `app/doctor/schedules/page.tsx`
   - Lista horarios (`GET /doctors/me/schedules`), botones editar/eliminar.
2) Modal `components/schedules/ScheduleFormModal.tsx`
   - Formulario con validaciones (Zod).
   - Crear (POST) / Actualizar (PATCH) / Eliminar (DELETE).
3) Hook `hooks/useSchedules.ts`
   - React Query para CRUD; invalidar cache tras mutaciones.
4) UI
   - Mostrar errores de solapamiento (400), endTime<=startTime, usuario no doctor (403).
   - Confirmación al eliminar.

## Archivos clave
- `frontend/src/app/doctor/schedules/page.tsx`
- `frontend/src/components/schedules/ScheduleFormModal.tsx`
- `frontend/src/hooks/useSchedules.ts`
- i18n es/en

## Testing (HU8-TEST-001)
- Validaciones de formulario.
- Manejo de errores backend.
- Flujos crear/editar/eliminar.
