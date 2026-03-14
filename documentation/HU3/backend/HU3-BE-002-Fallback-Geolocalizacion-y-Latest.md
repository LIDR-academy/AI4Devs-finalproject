# HU3-BE-002: Fallback Geolocalización y Endpoint Latest

## Info
- **ID**: HU3-BE-002  
- **Tipo**: Backend  
- **Prioridad**: Alta  
- **Estimación**: 8h  
- **Dependencias**: HU3-BE-001, HU2-DB-001

## CA cubiertos
- Fallback automático por código postal cuando una búsqueda por coordenadas no retorna resultados.
- Validación robusta de parámetros de ubicación (`lat/lng` o `postalCode`).
- Endpoint para obtener últimos médicos registrados (aprobados) para estado inicial de `/search`.

## Comportamientos implementados en esta rama
- `GET /api/v1/doctors`:
  - Ejecuta búsqueda primaria con filtros recibidos.
  - Si llega `lat/lng` + `postalCode` y no hay resultados, ejecuta una segunda búsqueda por `postalCode`.
  - Rechaza peticiones sin ubicación (`lat/lng`) ni `postalCode`.
- `GET /api/v1/doctors/latest?limit=5`:
  - Devuelve médicos con `verification_status='approved'`.
  - Ordenados por `created_at DESC`.
  - Límite configurable con saneamiento defensivo.

## Decisiones de negocio
- Aplicar fallback en backend para garantizar comportamiento consistente sin depender de la lógica del cliente.
- Mantener `postalCode` como segundo criterio cuando la distancia geográfica no produce resultados.
- Exponer endpoint `latest` dedicado para acelerar carga inicial de `/search`.

## Limitaciones actuales
- Fallback por `postalCode` solo aplica cuando el cliente envía ese dato en la solicitud.
- El endpoint `latest` no aplica personalización por paciente ni filtros clínicos avanzados.
- No se marca aún en respuesta si el resultado provino de fallback (trazabilidad funcional pendiente).

## Pasos técnicos
1) `backend/src/controllers/doctors.controller.ts`
   - Validaciones de parámetros de ubicación.
   - Orquestación de búsqueda primaria y fallback.
   - Nuevo handler `getLatest`.
2) `backend/src/services/doctor.service.ts`
   - Nuevo método `getLatestRegistered(limit)`.
3) `backend/src/routes/doctors.routes.ts`
   - Registro de ruta `GET /latest`.

## Testing (HU3-TEST-002)
- Caso con coordenadas sin resultados + `postalCode` con resultados.
- Caso sin coordenadas ni `postalCode` retorna 400.
- `GET /doctors/latest` retorna máximo 5, ordenado por más reciente.
