# HU10-FE-001: Dashboard Administrativo de Médicos y Métricas

## Info
- **ID**: HU10-FE-001  
- **Prioridad**: Media  
- **Estimación**: 20h  
- **Dependencias**: HU10-BE-001, HU10-DB-001

## CA cubiertos
- Auth admin; 403 si no admin.
- Mostrar métricas batch (reservas, cancelaciones, ratings, médicos/pacientes activos).
- Gráficos interactivos (Chart.js/D3): línea reservas, barras cancelaciones, torta ratings.
- Tablas paginadas/filtradas: reservas recientes, cancelaciones, médicos por calificación.
- Gestión de verificación: listar médicos pending, ver docs, aprobar/rechazar.
- Moderación de reseñas: lista pending, aprobar/rechazar con notas.
- i18n ES/EN; fechas/números formateados por idioma.

## Pasos Técnicos
1) Layout `app/admin/dashboard/page.tsx`
   - Cards métricas + gráficos + tablas.
   - Usa hooks de datos (React Query) apuntando a endpoints admin.
2) Componentes
   - `components/admin/MetricsCards.tsx`
   - `components/admin/ReservationsChart.tsx`
   - `components/admin/CancellationsChart.tsx`
   - `components/admin/RatingsPie.tsx`
   - `components/admin/VerificationTable.tsx` (acciones aprobar/rechazar con modal confirmación)
   - `components/admin/ReviewsModerationTable.tsx`
3) Hooks de datos
   - `useAdminMetrics`, `useVerificationList`, `useReviewsModeration`.
   - Manejar cache TTL similar a backend (24h) y refetch manual.
4) Seguridad UI
   - Comprobar role en cliente; mostrar mensaje si no admin.
5) Estilos
   - Usa Tailwind; tablas con paginación y filtros.

## Archivos clave
- `frontend/src/app/admin/dashboard/page.tsx`
- `frontend/src/components/admin/*`
- `frontend/src/hooks/admin/*`
- i18n es/en

## Testing (HU10-TEST-001)
- Render de métricas y gráficos con datos mock.
- Acciones aprobar/rechazar médico/reseña muestran confirmación y actualizan tablas.
