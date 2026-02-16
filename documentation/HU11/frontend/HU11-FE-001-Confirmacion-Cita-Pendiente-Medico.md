# HU11-FE-001: Confirmación de Citas Pendientes en Perfil Médico

## Info
- **ID**: HU11-FE-001  
- **Tipo**: Frontend  
- **Prioridad**: Alta  
- **Estimación**: 8h (1 sp)  
- **Dependencias**: HU11-BE-001, HU6-FE-001

## CA cubiertos
- Listado de citas pendientes/confirmadas en perfil del doctor.
- Acción visible "Confirmar cita" solo para citas `pending`.
- Confirmación con feedback de loading/success/error.
- Refresco automático de la lista tras confirmar.
- Internacionalización ES/EN para textos de acción.

## Comportamientos implementados en esta rama
- Se habilitó acción contextual "Confirmar cita" para tarjetas en estado `pending`.
- La UI bloquea acciones concurrentes durante el request de confirmación.
- La lista de citas se refresca automáticamente tras operación exitosa.
- Se incorporaron mensajes de éxito/error alineados con respuestas del backend.

## Decisiones de negocio
- Solo citas `pending` pueden exponerse como confirmables para mantener trazabilidad clínica.
- El médico confirma en su propio panel sin navegación adicional para reducir fricción operativa.

## Limitaciones actuales
- La UI usa confirmación inline y mensajes de estado locales, sin centro de notificaciones persistente.
- No existe aún un timeline visual de cambios por cita dentro del perfil médico.

## Pasos Técnicos
1) **API client** `frontend/lib/api/appointments.ts`
   - Agregar `confirmAppointmentByDoctor(appointmentId, { status: 'confirmed' }, token)`.
2) **Hooks** `frontend/hooks/useAppointments.ts`
   - Agregar `useConfirmAppointmentByDoctor` con `useMutation`.
   - Invalidar query `appointments` al éxito.
3) **Pantalla Perfil Doctor** `frontend/app/[locale]/doctors/profile/page.tsx`
   - Mostrar botón por tarjeta cuando `appointment.status === 'pending'`.
   - Al confirmar:
     - Disparar mutation.
     - Mostrar mensaje de éxito/error.
     - Refrescar listado.
4) **i18n** `frontend/messages/es.json` y `frontend/messages/en.json`
   - Añadir keys para botón, estado de procesamiento, éxito y error.

## Archivos a crear/modificar
- `frontend/lib/api/appointments.ts`
- `frontend/hooks/useAppointments.ts`
- `frontend/app/[locale]/doctors/profile/page.tsx`
- `frontend/messages/es.json`
- `frontend/messages/en.json`

## Testing (HU11-TEST-001)
- Render condicional de botón solo en citas pendientes.
- Click en confirmar ejecuta mutation y actualiza estado.
- Mensaje de error ante fallo del endpoint.
