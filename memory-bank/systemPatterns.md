# System Patterns

## Architecture Overview
- Context (C1): SPA Web/Móvil (React/TS), Backend Java 17 + Jakarta (dominio), Data Platform. Integraciones: SSO (OIDC/SAML), Email/Push, Mapas/Geocoding, Calendario, BI.
- Contenedores (C2): SPA, API Gateway (OIDC), Servicios: Users, Trips, Matching, Booking, Notifications, Admin; Data & Infra: PostgreSQL+PostGIS, Redis, Elastic/OpenSearch, Event Bus, DWH.
- Componentes (C3): Matching (Match API, Scoring Engine, Geo Index), Booking (Booking API, Orchestrator, State Machine), Event Bus y Workers.

## DDD Layers and Structure
- Domain: entidades/agregados, repositorios (interfaces), servicios de dominio, eventos de dominio.
- Application: casos de uso (servicios de aplicación), orquestación, DTOs/comandos, transacciones.
- Infrastructure: adaptadores (REST JAX‑RS, persistencia JPA/Hibernate, mensajería), configs, mappers.
- Interface: controladores/recursos (JAX‑RS), validación, auth (OIDC), serialización.

## TDD Workflow
1) Definir casos de uso y criterios de aceptación. 2) Escribir tests de aplicación y dominio (JUnit5/Mockito). 3) Implementar lo mínimo para pasar tests. 4) Refactor con SOLID. 5) Añadir tests de integración (repos JPA, recursos JAX‑RS) y contratos.

## Key Patterns
- Edge Authentication via OIDC; RBAC interno por rol.
- Event-driven para notificaciones/analítica (TX outbox + bus). 
- Geospatial scoring simplificado en MVP; ampliable a desvío/ETA.
- Notificaciones basadas en eventos (BookingConfirmed, recordatorios T‑60/T‑15).
- Privacidad por diseño: zona aproximada; ubicación temporal.
 - Frontend SPA: OIDC (Keycloak) con PKCE, almacenamiento de token en memoria (keycloak-js), routing con `react-router-dom`, cliente HTTP Axios con `Authorization: Bearer` inyectado por interceptor.
 - Frontend Testing: Jest + React Testing Library; entorno `jsdom` y `jest-dom`; mocking de `getKeycloak()` para tests sin OIDC real.

## Technical Decisions
- Backend en Java 17 + Jakarta; Maven como build. **JPA/Hibernate con PostgreSQL/PostGIS IMPLEMENTADO**.
- **Flyway para migraciones** con schemas separados por servicio (trips, users, bookings, matches).
 - **Flyway para migraciones** con schemas separados por servicio (trips, users, bookings, matches, notifications).
- **DependencyManagement centralizado** en parent POM para versiones consistentes.
- **RESOURCE_LOCAL transactions** para simplificar MVP sin CDI completo.
- **ThreadLocal AuthContext**: Patrón estándar para propagación de userId en todos los servicios.
- **Testcontainers**: PostgreSQL real para tests de integración con Docker.
- **Business methods en entidades**: Lógica de negocio encapsulada en entidades JPA (reserveSeats, accept, confirm, etc.).
- **Jakarta Bean Validation**: Validación de entrada en REST APIs.
- **Docker-compose con profiles**: Infraestructura base siempre activa, microservicios opcionales para desarrollo.
- **Scripts de automatización completos**:
  - Setup: `setup-dev.sh` (completo), `dev-infra.sh` (solo infra), `setup-keycloak.sh`, `migrate.sh`
  - Verificación: `verify-infra.sh` (rápido), `verify-all.sh` (completo con frontend)
  - Frontend: `start-frontend.sh` (Docker), `start-frontend-dev.sh` (local hot reload), `start-all-services.sh` (todo)
  - Scripts interactivos con validaciones y mensajes claros
- **Integraciones entre servicios**: ServiceHttpClient para comunicación HTTP con manejo de errores y timeouts.
- **DTOs compartidos**: Tipos estandarizados para comunicación entre microservicios.
- **Health checks**: Endpoints /health para monitoreo de disponibilidad de servicios.
- **Verificación en capas**: Infraestructura base (verify-infra) vs sistema completo (verify-all).
- Redis para caché; Elastic/OpenSearch opcional; Keycloak como IdP en dev.
- Observabilidad: logs estructurados, tracing OTEL, métricas clave.
- **Frontend moderno**: React 19 + TypeScript + Vite + Tailwind CSS para UI consistente.
- **Frontend dual mode**: Docker + Nginx (producción-like) vs Local + Vite (desarrollo con hot reload).
  - Bypass de autenticación para tests/local: `VITE_AUTH_DISABLED=true` habilita acceso directo en `Protected`/`AuthProvider`; Cypress usa `env.authDisabled=true`.
- **Componentes reutilizables**: Biblioteca de UI con Button, Card, Input, LoadingSpinner.
- **Servicios API**: Clases dedicadas para cada microservicio con tipos estrictos.
- **Layout responsive**: Navbar con autenticación, Layout consistente en todas las páginas.
- Frontend usa Vite para dev/build; variables de entorno `VITE_*` para configuración OIDC y base URL.

### CORS Policy (actualizado)
- Filtro JAX-RS por servicio (`CorsFilter`) que:
  - Lee `Origin` de la petición.
  - Si el origen está permitido (`ALLOWED_ORIGINS`), responde con `Access-Control-Allow-Origin` igual al `Origin`.
  - Añade `Vary: Origin` y `Access-Control-Allow-Credentials: true`.
  - Expone métodos `GET, POST, PUT, DELETE, OPTIONS, HEAD`.
  - `Access-Control-Allow-Headers`: eco de `Access-Control-Request-Headers` o `Origin, Content-Type, Accept, Authorization`.
- `ALLOWED_ORIGINS` configurable por env (coma-separado), valor por defecto `http://localhost:5173`.
- `docker-compose.yml` inyecta `ALLOWED_ORIGINS` en `trips/users/booking/matching` para que el frontend local funcione sin errores.

## Testing Patterns

### E2E Testing con Cypress
- **Cypress 15.4.0** para tests End-to-End de aplicación completa
- **Organización por feature**: smoke → authentication → features → complete flows
- **cy.session()**: Cachea autenticación para evitar login repetido (mejora performance 10x)
- **cy.origin()**: Maneja cross-origin authentication con Keycloak
- **Custom commands**: Comandos reutilizables (loginViaKeycloak, logout, getByCy)
- **Fixtures**: Datos de prueba en JSON (users, trips, etc.)
- **Screenshots**: Captura automática en fallos para debugging
- **Timeouts optimizados**: 6s comando, 15s page load, 8s requests
- **Electron browser**: Browser incluido por defecto, no requiere instalación externa

### Testing Strategy
- **Unit tests**: Jest + React Testing Library para componentes
- **Integration tests**: Jest con RUN_INT=1 para flows de integración
- **E2E tests**: Cypress para flujos de usuario completos
- **Test data**: Fixtures compartidas entre test suites
- **CI/CD ready**: Scripts configurados para ejecutar en pipeline

## Collaboration and Documentation
- Mantener documentación en `/doc` (PlantUML/Mermaid) y prompts en `/Prompts/prompts_xvb.md`.
- Flujo: Epics/US → tickets técnicos → modelos/diagramas → tests (TDD) → implementación → actualizar doc y prompts.
- **Testing E2E**: Cypress tests como documentación viva de flujos de usuario.

## Runtime Conventions (actualizado)
- **Routing**: Servicios expuestos bajo `/api` en cada microservicio (puertos locales 8081–8085). En gateway se enrutará por prefijo (`/api/users`, `/api/trips`, `/api/bookings`, `/api/matches`, `/api/notifications`).
- **Health**: `GET /api/health` disponible y exento de autenticación en todos los servicios.
- **Auth**: `OIDC_ISSUER_URI` debe ser coherente con `iss` del token (localhost en dev); `aud` debe incluir `backend-api`.

## Diagrams
- Ver `doc/MVP/*` y `readme.md` para contexto ampliado.
