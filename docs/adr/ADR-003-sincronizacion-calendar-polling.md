# ADR-003: Estrategia de Sincronización Google Calendar (Polling Inicial)

Fecha: 2025-09-23

## Estado
Aceptado

## Contexto
Necesitamos evitar doble-booking respetando eventos externos del calendario del administrador. Webhooks de Google Calendar (push notifications) añaden complejidad de infraestructura (recepción, validación de canales, renovación) y para el MVP un enfoque más simple es suficiente.

## Decisión
Implementar sincronización inicial mediante:
1. Verificación de conflictos en tiempo real al crear slot y al aprobar reserva (consultando eventos relevantes vía API de Calendar en el intervalo).
2. Job periódico (cron / scheduler) cada N minutos (ej. 5-10) que sincroniza eventos próximos (ej. próximos 30 días) y marca slots solapados como no disponibles.

## Consecuencias
Positivas:
- Menor complejidad inicial (sin manejar canales push).
- Control explícito de ventanas de sincronización.

Negativas:
- Posible ventana corta de inconsistencia (hasta el próximo polling) si se añade un evento externo justo después de crear un slot, antes de que alguien intente reservar.
- Más llamadas a la API si el intervalo es muy corto.

## Mitigación
- En la creación de slots se hace verificación on-demand.
- Limitar sincronización a rango temporal acotado para reducir coste.
- Registrar timestamp de última sync por rango.

## Futuro
Evaluar migrar a Webhooks cuando:
- Crezca el volumen de slots.
- Haya que reducir aún más la ventana de inconsistencia.
