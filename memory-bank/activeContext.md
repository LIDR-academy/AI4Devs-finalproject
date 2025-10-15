# Active Context

## Current Focus
- **Feature #3 - Creación de Viajes**: En progreso - Fase 1 (i18n) y Fase 2 (UI mejorada) completadas.
- **Fase 1 ✅**: Trips.tsx migrado a react-i18next con 6 idiomas completos.
- **Fase 2 ✅**: EditTripModal, TripCard mejorado, filtros y búsqueda completamente integrados y funcionando.
- **Próximo**: Fase 3 (Backend validations) y Fase 4 (E2E tests).

## Feature Plan
- Ver `memory-bank/featurePlan.md` para el mapeo de las 15 funcionalidades (cobertura/estado/próximos pasos) y el roadmap por fases.

## Recent Changes (Octubre 11, 2025)

### Feature: Multi-idioma (Completado ✅)
- **Backend TDD**:
  - `MessageService`: Servicio compartido con ResourceBundle para 6 idiomas
  - `LocaleUtils`: Parser de Accept-Language header con fallback a inglés
  - 4 servicios REST actualizados: users, trips, booking, matching
  - Todos los endpoints reciben `@HeaderParam("Accept-Language")`
  - Mensajes de error localizados en todos los servicios
  - 42 archivos de traducción (7 archivos × 6 idiomas)
- **Frontend TDD**:
  - `react-i18next`: Configuración completa con tests
  - `LanguageSwitcher`: Componente con dropdown para 6 idiomas
  - `useValidation`: Hook para mensajes de validación localizados
  - 48 archivos de traducción (8 namespaces × 6 idiomas)
  - Axios interceptor automático para Accept-Language header
- **Integración**:
  - Navbar migrado a i18n con LanguageSwitcher integrado
  - Componentes existentes actualizados (Trips, Matches, Bookings, etc.)
  - Tests unitarios para todos los componentes i18n
  - Compilación exitosa en todos los servicios backend
- **E2E Tests**:
  - Suite Cypress completa para language switching (language-switching.cy.ts)
  - 18 test cases covering all 6 languages (ca, es, ro, uk, en, fr)
  - Tests de persistencia localStorage y navegación entre páginas
  - Tests de validación en diferentes idiomas
  - Tests de dropdown behavior y current language highlighting
- **Documentación**:
  - techContext.md actualizado con arquitectura i18n completa
  - Detalles de implementación frontend y backend
  - Estrategia de fallback y persistencia documentada

### Feature #3: Creación de Viajes (En Progreso 🔄)
- **Fase 1 ✅ - Frontend i18n Migration**:
  - Trips.tsx migrado completamente a react-i18next
  - 12 archivos de traducción actualizados (6 idiomas × 2 namespaces)
  - useValidation hook mejorado con validaciones para coordenadas, fechas, asientos
  - 100% de textos localizados (sin strings hardcoded)
  - Validaciones en tiempo real en idioma del usuario
  - Mensajes de éxito/error localizados
  - Opciones de sede localizadas
  - Trip cards con información localizada
- **Fase 2 ✅ - Enhanced Trip Management UI**:
  - EditTripModal component: Modal completo para edición de viajes con validaciones
  - TripCard component mejorado: Estados visuales, badges, información completa
  - TripFilters component: Filtros por estado, destino, rango de fechas
  - Estados visuales claros: ACTIVE (verde), COMPLETED (gris)
  - Filtros activos con chips removibles
  - Búsqueda y filtrado en tiempo real
  - 6 idiomas completos para todos los nuevos componentes
  - Integración completa en Trips.tsx con data-testid para tests E2E
  - Tests E2E verificados: filtros funcionando correctamente

### Feature: Sistema de Confianza (Anterior ✅)
- **Backend TDD**:
  - Entidad `Rating` con JPA, migración V3, repository y service
  - API REST: `POST /ratings`, `GET /ratings/my-ratings`, `GET /ratings/user/{userId}`
  - Endpoints de estadísticas: trust-score y trust-stats
  - 15 tests unitarios pasando (RatingResource, RatingService, Rating domain)
- **Frontend UI**:
  - `TrustProfile.tsx`: Perfil de confianza con estadísticas y tags
  - `RatingForm.tsx`: Formulario para crear valoraciones (thumbs up/down, tags, comentarios)
  - `RatingsList.tsx`: Lista de valoraciones recibidas por usuario
  - `TrustProfilePage.tsx`: Página completa de perfil de confianza
  - Integración en `Matches.tsx`: botones "Ver Perfil" y "Valorar"
- **Tests Frontend**:
  - Tests unitarios para componentes de confianza
  - Manejo de errores mejorado (404, 403, 5xx)
  - Z-index corregido para modales sobre mapas
- **CORS Issue Identificado**:
  - Filtro CORS implementado pero users-service necesita redeploy
  - Endpoint `/api/ratings` devuelve 404 - servicio no actualizado
  - Configuración correcta: puerto 8082, filtros CORS aplicados

### Feature: Perfil de Usuario (Anterior ✅)
- **Validaciones Robustas**:
  - Tests unitarios para validaciones de campos obligatorios
  - Validación de formato email y longitud mínima de nombre
  - Manejo de errores de API y estados de carga
  - 7 tests unitarios pasando (ProfileValidation.test.tsx)
- **E2E Tests**:
  - Tests Cypress para navegación y funcionalidades del perfil
  - Verificación de validaciones, mensajes de éxito/error
  - Tests para estados de carga y feedback visual
  - 12 tests E2E (navigate-profile.cy.ts)
- **UX Mejorada**:
  - Validaciones en tiempo real con feedback inmediato
  - Mensajes de error claros y específicos
  - Estados de carga y confirmaciones de éxito
  - Indicadores visuales para campos obligatorios

### Feature: Historial de Viajes (Anterior ✅)
- **Backend (TDD)**:
  - Trips Service: Filtro `status` en `GET /trips` (ACTIVE, COMPLETED)
  - Booking Service: Filtros `status`, `from`, `to` en `GET /bookings`
  - 82 tests pasando (23 trips + 59 bookings)
  - Lógica: viajes con dateTime < now() = COMPLETED
- **Frontend**:
  - Página `/history` con filtros (fecha, estado, rol)
  - Estadísticas: Total viajes, CO2 ahorrado, Km compartidos
  - Componente `SelectWithChildren` creado para filtros
  - 9 tests unitarios pasando (History.test.tsx)
- **E2E**:
  - Tests Cypress para navegación y filtrado (navigate-history.cy.ts)
  - Verificación de estadísticas, filtros y badges
- **Documentación**:
  - OpenAPI actualizado: trips-service.yaml y booking-service.yaml
  - Nuevos query params documentados con descripciones

### Feature: Mapa Básico (Anterior)
- **Frontend Components**:
  - `MapPreview.tsx`: Componente con marcadores de origen/destino, fit bounds automático
  - `MapLinkButtons.tsx`: Botones para Google Maps y Waze con URLs correctas
  - Integración en `Trips.tsx` y `Matches.tsx` cuando hay coordenadas disponibles
- **Dependencias**:
  - `react-leaflet`, `leaflet`, `@types/leaflet` instalados con `--legacy-peer-deps`
  - CSS de Leaflet importado en `main.tsx`
  - Variable `VITE_MAP_TILES_URL` configurada en `env.ts` y `env.example`
- **Tests**:
  - Tests unitarios: 16/16 ✅ (MapPreview y MapLinkButtons)
  - Tests E2E: Actualizados para verificar mapas en Trips y Matches
  - Build exitoso: TypeScript compila, Vite build completado

### Feature: Reserva de Plaza (Anterior)
- **Backend TDD**: 24 tests pasando - reglas de negocio y cancelación configurables
- **Frontend TDD**: Tests unitarios completos para BookingsService y páginas UI
- **E2E Tests**: Tests Cypress actualizados para flujos completos de reserva y cancelación

### Database & Backend (Anterior)
- `notification-service`: UUID real, Flyway V3, integración con booking/matching
- `booking-service`: NotificationServiceClient, tests TDD para confirm/cancel
- `matching-service`: Endpoints accept/reject, cliente de notificaciones

### Frontend UX (Anterior)
- Perfil: sección "Notificaciones Push" con service worker
- UI mejorada: badges de estado, botones deshabilitados, feedback visual

### Documentation & Tools
- **database-schemas.md**: Estructura completa de BD, schemas, índices, troubleshooting
- **e2e-test-coverage.md**: Análisis de cobertura, gaps, ejemplos de tests faltantes
- **seed-test-data.sh**: Script para generar datos de prueba en todos los schemas

## Next Steps (immediate)
- **✅ E2E Tests**: Suite Cypress multi-idioma completada (language-switching.cy.ts)
- **✅ Documentación**: techContext.md actualizado con arquitectura i18n completa
- **Plan Continuation**: Siguiente feature del roadmap o mejoras adicionales

## Decisions & Considerations
- **Ruta base común**: `/api` para todos; enrutamiento por path para distinguir servicios.
- **Salud sin auth**: `/api/health` permitido en todos los servicios.
- **Infra**: Puertos expuestos (8081-8084) para acceso local directo desde consola/Frontend.
- **Scripts interactivos**: `start-frontend.sh` ofrece levantar microservicios si no están corriendo.
- **Dual mode frontend**: Docker para producción-like, local (Vite) para desarrollo rápido con hot reload.
- **Verificación en capas**: `verify-infra.sh` para infraestructura base, `verify-all.sh` para sistema completo.
 - **Autenticación en producción**: El bypass de auth (`AUTH_DISABLED=true`) es solo para desarrollo/test. En producción debe estar desactivado (`AUTH_DISABLED=false`) y la validación JWT debe permanecer activa (incluyendo `REQUIRE_ROLE_EMPLOYEE` según políticas).
