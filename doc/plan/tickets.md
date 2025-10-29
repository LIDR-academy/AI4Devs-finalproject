# Technical Tickets (MVP, por microservicio)

## auth-service (Java 17 + Jakarta)
- Ticket A1: Configurar OIDC con Keycloak (JAX-RS filter + JWKS) [tests JUnit5] — API: `doc/api/auth-service.yaml`
- Ticket A2: Endpoint callback/login y validación de roles [tests]

## users-service
- Ticket U1: Modelo `User` + JPA + repositorio; migración Flyway [tests]
- Ticket U2: Recursos JAX-RS `/users` GET/PUT (perfil mínimo) [tests] — API: `doc/api/users-service.yaml`

## trips-service
- Ticket T1: Modelo `Trip` con campos mínimos + PostGIS; migración [tests]
- Ticket T2: Recursos `/trips` POST/GET con filtros básicos (sede/horario) [tests] — API: `doc/api/trips-service.yaml`

## booking-service
- Ticket B1: Modelo `Booking` + estados; migración [tests]
- Ticket B2: Recursos `/bookings` POST/GET; reserva inmediata [tests] — API: `doc/api/booking-service.yaml`

## matching-service
- Ticket M1: Endpoint `/matches` con score simple (sede + franja) [tests] — API: `doc/api/matching-service.yaml`
- Ticket M2: Integración con `trips-service` y `users-service` [tests]

## infra (repo raíz)
- Ticket I1: docker-compose (PostgreSQL+PostGIS, Redis, Keycloak, Mailhog opcional)
- Ticket I2: Scripts de migración/seeds y README de setup local

## notifications (MVP dentro de booking-service o módulo simple)
- Ticket N1: Configurar envío de email (SMTP/Mailhog) y plantilla de confirmación [tests]
- Ticket N2: Web Push (VAPID): generación de claves y firma; utilidades de envío [tests]
- Ticket N3: Disparo BookingConfirmed → orquestar email + push con reintentos básicos [tests]

## users-service (suscripciones push)
- Ticket U3: Endpoints `POST /users/me/push-subscriptions` y `DELETE /users/me/push-subscriptions/{id}` [tests]
- Ticket U4: Persistir suscripción (endpoint, keys, expirationTime) asociada a usuario [tests]

## booking-service (eventos)
- Ticket B3: Publicar evento `BookingConfirmed` y llamar a notifications (email + push) [tests]
- Ticket B4: Idempotencia en notificaciones por reserva (evitar duplicados) [tests]

## frontend
- Ticket FE1: Service Worker de notificaciones (registro, manejo de eventos ‘push’) [tests]
- Ticket FE2: UI de Perfil: toggle de notificaciones (alta/baja suscripción, estado permisos) [tests]
- Ticket FE3: Pantalla de Búsqueda/Matching: formulario filtros + resultados con score y CTA reservar [tests]

## infra/config
- Ticket I3: Variables VAPID (VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY) y wiring en FE/BE
- Ticket I4: Config SMTP (Mailhog) y plantilla básica de correos

## cypress e2e
- Ticket E2E1: Flujo completo: login → crear viaje → buscar/matchear → reservar → notificación enviada (comprobar email en Mailhog)
- Ticket E2E2: Suscripción push (smoke: alta/baja; si el runner lo permite)
