# HU5-FE-001: Reprogramación y Cancelación de Cita

## Información General
- **ID**: HU5-FE-001  
- **Historia**: HU5 - Reprogramación y Cancelación  
- **Tipo**: Frontend  
- **Prioridad**: Alta  
- **Estimación**: 12h (2 sp)  
- **Dependencias**: HU5-BE-001, HU4-DB-001

## Criterios de Aceptación cubiertos
- Autenticación y autorización (solo paciente dueño).
- Ver listado de citas activas (confirmed, pending, completed, cancelled).
- Cancelar cita: solicitar motivo opcional, liberar slot, registrar historial.
- Reprogramar cita: seleccionar nuevo slot del mismo médico, validar disponibilidad, actualizar cita e historial.
- Mensajes claros de error (403, 404, 400, 409).
- Internacionalización ES/EN.

## Pasos Técnicos
1) **Página de mis citas** `frontend/src/app/appointments/page.tsx`
   - Lista citas con filtros por estado y paginación.
   - Botones “Cancelar” y “Reprogramar” solo en estados confirmed/pending.
2) **Modal Cancelar** `components/appointments/CancelModal.tsx`
   - Campo textarea (max 500) opcional.
   - Llama a PATCH `/api/v1/appointments/{id}` con `{ status: 'cancelled', cancellationReason }`.
   - Refresca lista y muestra toast éxito/errores.
3) **Modal Reprogramar** `components/appointments/RescheduleModal.tsx`
   - Usa selector de slots del mismo médico (`/doctors/{doctorId}/slots?date=...`).
   - Envío PATCH `/api/v1/appointments/{id}` con `{ slotId, appointmentDate }`.
   - Maneja errores 400/409 con mensajes específicos.
4) **Hook de API** `hooks/useAppointments.ts`
   - React Query: `useAppointments`, `useCancelAppointment`, `useRescheduleAppointment`.
   - Invalida cache al éxito.
5) **UI/UX**
   - Estados de carga y deshabilitar botones mientras se procesa.
   - Confirmaciones: “¿Seguro de cancelar?” / “¿Confirmar reprogramación?”.
   - Mostrar timezone CDMX en fechas/horas.
6) **i18n**
   - Añadir strings ES/EN: títulos, botones, errores y placeholders.

## Archivos a crear/modificar
- `frontend/src/app/appointments/page.tsx`
- `frontend/src/components/appointments/CancelModal.tsx`
- `frontend/src/components/appointments/RescheduleModal.tsx`
- `frontend/src/hooks/useAppointments.ts`
- `frontend/src/messages/es.json`, `frontend/src/messages/en.json` (nuevos textos)

## Dependencias recomendadas
```json
{
  "dependencies": {
    "@tanstack/react-query": "^5.0.0",
    "date-fns": "^3.0.0"
  }
}
```

## Testing (ver HU5-TEST-001)
- Tests unitarios de modales y validaciones.
- Tests de integración con API simulada (mocks de fetch/axios).
- E2E: cancelar, reprogramar, manejar errores (slot no disponible, cita no del usuario).
