# HU3-TEST-001: Testing - Búsqueda de Médicos

## Info
- **ID**: HU3-TEST-001  
- **Prioridad**: Alta  
- **Estimación**: 10h  
- **Dependencias**: HU3-FE-001, HU3-BE-001, HU3-DB-001

## Plan
### Backend
- Búsqueda por coordenadas: devuelve distancia y orden correcto; respeta radius; solo approved y no deleted.
- Búsqueda por postalCode fallback.
- Filtro por fecha: solo slots disponibles/no bloqueados.
- Cache Redis: hit/miss; TTL 10 min.
- Errores: 401 sin token, 400 parámetros inválidos.

### Frontend
- Filtros funcionan: especialidad, radio, fecha, postalCode; geolocalización maneja rechazo.
- Mapa muestra usuario y médicos; InfoWindow al hacer click.
- Paginación 20/50.

### E2E
- Flujo: permitir ubicación -> buscar -> ver resultados con distancias y mapa.
- Flujo: denegar ubicación -> usar postalCode -> resultados sin distancia.

## Archivos sugeridos
- `backend/tests/integration/doctors/search.test.ts`
- `frontend/tests/components/search/DoctorSearch.test.tsx`
- `frontend/tests/e2e/search/search.spec.ts`

## Métricas
- Cobertura servicio search ≥85%
- Cobertura UI filtros/mapa ≥75% branches
