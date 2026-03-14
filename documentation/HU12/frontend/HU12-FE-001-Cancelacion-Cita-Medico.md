# HU12-FE-001: Cancelación de Citas en Perfil Médico

## Info
- **ID**: HU12-FE-001  
- **Tipo**: Frontend  
- **Prioridad**: Alta  
- **Estimación**: 8h (1 sp)  
- **Dependencias**: HU12-BE-001, HU11-FE-001

## CA cubiertos
- Botón "Cancelar cita" visible en citas `pending` y `confirmed` del perfil doctor.
- Confirmación previa de acción en UI.
- Estado de carga y feedback de éxito/error.
- Refresco automático del listado de citas.
- Textos ES/EN para toda la interacción.

## Comportamientos implementados en esta rama
- Acción de cancelación expuesta de forma condicional por estado permitido.
- Confirmación previa evita cancelaciones accidentales.
- Refresco de agenda posterior a cancelación para mantener estado consistente.

## Decisiones de negocio
- La cancelación por médico se habilita solo para citas activas (`pending`, `confirmed`).
- Se mantiene confirmación explícita de usuario antes de ejecutar operación destructiva.

## Limitaciones actuales
- Confirmación implementada con diálogo nativo; no hay modal unificado con diseño del sistema.
- No existe actualmente captura avanzada de motivo estructurado (catálogo) desde UI.

## Pasos Técnicos
1) **Pantalla Perfil** `frontend/app/[locale]/doctors/profile/page.tsx`
   - Agregar botón cancelar por tarjeta.
   - Integrar `useCancelAppointment`.
   - Confirmación con `window.confirm`.
2) **Mensajes i18n**
   - Añadir keys de cancelación en `doctorProfile.appointments.cancel`.
3) **Comportamiento**
   - En éxito: mostrar toast/mensaje e invalidar/refrescar citas.
   - En error: mostrar mensaje amigable.

## Archivos a crear/modificar
- `frontend/app/[locale]/doctors/profile/page.tsx`
- `frontend/messages/es.json`
- `frontend/messages/en.json`

## Testing (HU12-TEST-001)
- Render de botón cancelar según estado permitido.
- Confirmación + ejecución de cancelación.
- Manejo de error del endpoint.
