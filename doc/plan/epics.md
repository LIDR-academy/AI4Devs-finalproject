# Epics (MVP)

## Epic 1: Autenticación corporativa (OIDC con Keycloak)
- Objetivo: Acceso seguro SSO para empleados.
- Alcance: flujo OIDC, validación JWT, roles básicos.

## Epic 2: Gestión de usuarios y perfil mínimo
- Objetivo: Perfil con zona aproximada, sede y rol.
- Alcance: CRUD usuario, preferencias mínimas.

## Epic 3: Trips (publicación y búsqueda básica)
- Objetivo: Publicar y listar trayectos por sede/horario.
- Alcance: CRUD trayecto, filtros sencillos.

## Epic 4: Booking (reserva y confirmación)
- Objetivo: Reservar plazas y ver viajes confirmados.
- Alcance: flujo de reserva inmediata, estados básicos.

## Epic 5: Matching básico
- Objetivo: Sugerir coincidencias por sede + franja horaria.
- Alcance: endpoint `/matches`, score simple.

## Epic 6: Infra dev local
- Objetivo: Entorno reproducible.
- Alcance: docker-compose (PostgreSQL+PostGIS, Redis, Keycloak), migraciones, seeds.

## Epic 7: Notificaciones (email + push)
- Objetivo: Notificar confirmaciones de reserva y recordatorios básicos por email y notificaciones push del navegador.
- Alcance: Suscripción web push (VAPID), mailer worker simple, disparo en BookingConfirmed.

## Entrega conjunta (MVP)
- Epic 3 (Trips: publicación/listado) y Epic 5 (Matching básico) se entregan en la misma iteración para habilitar búsqueda+matching en FE.

# Epics Fase 2
## Epic F2.1: Mapa y Geolocalización básica
- Objetivo: Mostrar mapa, rutas sugeridas y puntos de encuentro (enlaces a Google Maps/Waze inicialmente).
- Alcance: Mapa embebido, deep links, selección de punto de encuentro.

## Epic F2.2: Historial de viajes
- Objetivo: Repetir trayectos habituales y ver estadísticas simples.
- Alcance: Listas con filtros y métricas personales.

## Epic F2.3: Sistema de confianza (valoraciones 1‑clic)
- Objetivo: Feedback simple (👍/👎) y tags de comportamiento.
- Alcance: API/FE de ratings y visualización básica.

## Epic F2.4: Privacidad avanzada
- Objetivo: Controles de visibilidad (zona aprox., ocultar teléfono, chat interno).
- Alcance: Flags de privacidad y UI asociada.

## Epic F2.5: Reportes RRHH/Sostenibilidad
- Objetivo: Panel con métricas agregadas (CO₂, ocupación, adopción).
- Alcance: Endpoints agregados y dashboard básico.
