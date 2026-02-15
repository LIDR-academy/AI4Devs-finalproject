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
