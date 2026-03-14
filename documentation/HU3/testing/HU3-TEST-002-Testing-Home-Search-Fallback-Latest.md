# HU3-TEST-002: Testing - Home Search, Fallback y Latest

## Info
- **ID**: HU3-TEST-002  
- **Tipo**: Testing  
- **Prioridad**: Alta  
- **Estimación**: 6h  
- **Dependencias**: HU3-FE-002, HU3-BE-002

## Cobertura objetivo
- Validar consistencia de la experiencia de búsqueda entre home y `/search`.
- Validar fallback backend por `postalCode`.
- Validar estado inicial de `/search` con últimos 5 médicos.

## Comportamientos implementados en esta rama
- Se añadió navegación con parámetros desde home al ejecutar búsqueda.
- Se incorporó fallback por código postal en backend.
- Se incorporó endpoint `latest` y su consumo en estado inicial de `/search`.

## Decisiones de negocio
- Priorizar pruebas de regresión en puntos de entrada de búsqueda (home y `/search`).
- Tratar geolocalización como dependencia externa no determinística y cubrir flujo de degradación.

## Limitaciones actuales
- Pruebas E2E de geolocalización requieren stubs de `navigator.geolocation`.
- La aserción de orden de "últimos médicos" depende de datos semilla consistentes.

## Plan de pruebas
### Backend (integración)
- [ ] `GET /doctors` con `lat/lng` sin resultados y `postalCode` con resultados usa fallback y responde lista no vacía.
- [ ] `GET /doctors` sin `lat/lng` ni `postalCode` responde 400 `MISSING_LOCATION_PARAMS`.
- [ ] `GET /doctors/latest?limit=5` responde <= 5 elementos aprobados ordenados por fecha de registro descendente.

### Frontend (component/integration)
- [ ] Home: botón buscar deshabilitado si no existe ubicación ni `postalCode`.
- [ ] Home: submit navega a `/search` con `specialty`, `radius` y ubicación disponible.
- [ ] `/search`: sin filtros previos, renderiza sección de últimos médicos.

### E2E Cypress
- [ ] Flujo: home -> buscar -> `/search` muestra resultados de búsqueda.
- [ ] Flujo: búsqueda por geolocalización sin resultados + `postalCode` informado -> resultados por fallback.
- [ ] Flujo: entrar directo a `/search` sin query params -> ver 5 últimos médicos.

## Archivos sugeridos
- `backend/tests/integration/api/doctors/search-fallback-latest.test.ts`
- `frontend/tests/components/search/DoctorSearch.latest.test.tsx`
- `frontend/cypress/e2e/hu3-busqueda-medicos.cy.ts` (extensión de escenarios)
