# Alcance del MVP - CitaYa

Este documento detalla las decisiones de alcance para el MVP y los elementos pospuestos para fases posteriores.

## Notificaciones Web Push - Fuera del MVP

**Decisión**: Las notificaciones Web Push quedan **fuera del alcance del MVP**.

### Alcance en el MVP
- ✅ Email de confirmación de cita (SendGrid) - encolado en Bull
- ✅ Emails de notificación al médico/paciente según flujo
- ❌ Web Push notifications - **pospuesto**

### Justificación
- El MVP prioriza la funcionalidad core (reservas, búsqueda, autenticación)
- Los emails cubren la necesidad de notificación al usuario
- Web Push requiere: Service Workers, VAPID keys, suscripciones Push, infraestructura adicional
- Documentado en [ARQUITECTURA_MVP.md - Limitaciones Conocidas](./ARQUITECTURA_MVP.md#limitaciones-conocidas)

### Implementación futura
- Generar y configurar VAPID keys en `.env`
- Implementar Service Workers en el frontend
- Configurar suscripciones Push por usuario
- Worker Bull para procesar cola de Web Push

### Referencias
- **HU4-BE-001**: Reserva de cita - solo email de confirmación
- **HU5**: Reprogramación/cancelación - solo emails
- **HU9**: Reseñas - solo email al médico
- **HU11**: Confirmación de cita pendiente por médico - solo emails
- **HU12**: Cancelación de cita por médico - solo emails

## Búsqueda y Descubrimiento - Alcance MVP

### Decisiones de negocio
- La home incluye formulario de búsqueda embebido en el banner principal.
- El botón "Soy médico" se mantiene visible en el mismo banner.
- Al ingresar a `/search` sin filtros previos, se muestran los 5 últimos médicos aprobados.
- Si una búsqueda por geolocalización no encuentra resultados y existe `postalCode`, se aplica fallback automático por código postal en backend.
- Frontend solo permite disparar búsqueda cuando existe especialidad y al menos una fuente de ubicación (`lat/lng` o `postalCode`).

### Limitaciones actuales
- La geolocalización depende del permiso del navegador y puede ser denegada por el usuario.
- El fallback por código postal requiere que el usuario haya informado `postalCode`; si no existe, se retorna resultado vacío de la búsqueda por coordenadas.
- El listado inicial de `/search` (últimos 5) no sustituye un ranking clínico, sino un criterio operativo por fecha de alta.
